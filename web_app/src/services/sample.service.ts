import { ApiError } from '@/lib/error';
import { deleteSampleImages, saveSampleImage } from '@/lib/file-utils';
import { supabaseServer } from '@/lib/supabase-server';
import { logError, logger } from '@/logger/logger';
import { sampleRepository } from '@/repositories/sample.repository';

export const sampleService = {
  async getHistory(userId: string) {
    const samples = await sampleRepository.findManyByUserId(userId);

    if (samples.length === 0) return [];

    const samplesWithImages = samples.filter((s) => s.imagePath);
    if (samplesWithImages.length === 0) return samples;

    try {
      const bucketName = process.env.SUPABASE_IMAGE_BUCKET || 'samples';
      const paths = samplesWithImages.map((s) => s.imagePath as string);

      const { data: signedUrls, error } = await supabaseServer.storage
        .from(bucketName)
        .createSignedUrls(paths, 3600);

      if (error) {
        logger.error('Failed to generate signed URLs', { error });
        return samples;
      }

      const urlMap = new Map(signedUrls.map((su) => [su.path, su.signedUrl]));

      return samples.map((sample) => ({
        ...sample,
        imagePath: sample.imagePath
          ? urlMap.get(sample.imagePath) || sample.imagePath
          : null,
      }));
    } catch (error) {
      logError(error, { userId });
      return samples;
    }
  },

  async analyzeSample(base64Image: string, metalType: string) {
    logger.info(`Analisis sample dimulai untuk logam: ${metalType}`);
    const baseUrl = process.env.AI_ENGINE_BASE_URL || 'http://localhost:5000';
    const fastApiUrl = `${baseUrl.replace(/\/$/, '')}/api/predict`;

    // Convert base64 to Blob for FastAPI (which expects a file)
    const [header, base64] = base64Image.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const binary = atob(base64);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      array[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([array], { type: mime });

    const fastApiFormData = new FormData();
    fastApiFormData.append('file', blob, `sample.${mime.split('/')[1]}`);
    fastApiFormData.append('test_type', metalType.toLowerCase());

    try {
      const response = await fetch(fastApiUrl, {
        method: 'POST',
        body: fastApiFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('FastAPI Error Response', { errorText });
        throw new ApiError(
          'Gagal menganalisis sample dengan layanan eksternal',
          502,
        );
      }

      const data = await response.json();
      logger.info(
        `Analisis berhasil: ${data.concentration_mg_per_L} mg/L (${data.status})`,
      );

      return {
        rgb: data.rgb,
        concentration: data.concentration_mg_per_L,
        status: data.status,
      };
    } catch (error) {
      logError(error, { metalType });
      if (error instanceof ApiError) throw error;
      throw new ApiError('Gagal menganalisis sample', 500);
    }
  },

  async saveSampleResult(
    userId: string,
    data: {
      sample_name: string;
      test_date: string;
      metal_type: string;
      concentration?: number;
      rgb_value?: string;
      image: string; // base64
    },
  ) {
    logger.info(`Menyimpan hasil analisis untuk: ${data.sample_name}`);
    try {
      // Save image to Supabase Bucket with compression
      const imagePath = await saveSampleImage(data.image);

      // Create entry in DB
      const result = await sampleRepository.create({
        sampleName: data.sample_name,
        testDate: new Date(data.test_date),
        metalType: data.metal_type,
        concentration: data.concentration || null,
        rgbValue: data.rgb_value || null,
        imagePath,
        userId,
      });

      logger.info(`Hasil berhasil disimpan: ${imagePath}`);
      return result;
    } catch (error) {
      logError(error, { sampleName: data.sample_name });
      throw error;
    }
  },

  async deleteSamples(ids: string[], userId: string) {
    logger.info(`Menghapus ${ids.length} samples untuk user: ${userId}`);
    try {
      // 1. Get image paths before deletion
      const samples = await sampleRepository.findManyByIds(ids, userId);
      const imagePaths = samples
        .map((s) => s.imagePath)
        .filter((path): path is string => !!path);

      // 2. Delete from DB
      await sampleRepository.deleteMany(ids, userId);

      // 3. Delete from Storage
      if (imagePaths.length > 0) {
        await deleteSampleImages(imagePaths);
      }

      logger.info(`Berhasil menghapus ${ids.length} samples`);
    } catch (error) {
      logError(error, { ids, userId });
      throw error;
    }
  },
};
