import { ApiError } from '@/lib/error';
import { saveSampleImage } from '@/lib/file-utils';
import { sampleRepository } from '@/repositories/sample.repository';

export const sampleService = {
  async getHistory(userId: string) {
    return sampleRepository.findManyByUserId(userId);
  },

  async analyzeSample(base64Image: string, metalType: string) {
    const fastApiUrl =
      process.env.AI_ENGINE_URL || 'http://localhost:5000/api/predict';

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
        console.error('FastAPI Error:', errorText);
        throw new ApiError(
          'Gagal menganalisis sample dengan layanan eksternal',
          502,
        );
      }

      const data = await response.json();

      return {
        rgb: data.rgb,
        concentration: data.concentration_mg_per_L,
        status: data.status,
      };
    } catch (error) {
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
    // Save image to public folder
    const imagePath = await saveSampleImage(data.image);

    // Create entry in DB
    return sampleRepository.create({
      sampleName: data.sample_name,
      testDate: new Date(data.test_date),
      metalType: data.metal_type,
      concentration: data.concentration || null,
      rgbValue: data.rgb_value || null,
      imagePath,
      userId,
    });
  },
};
