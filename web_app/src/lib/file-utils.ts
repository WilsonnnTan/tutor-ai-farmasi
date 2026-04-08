import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

import { supabaseServer } from './supabase-server';

export async function saveSampleImage(base64Data: string): Promise<string> {
  const [, base64] = base64Data.split(',');
  const buffer = Buffer.from(base64, 'base64');

  const bucketName = process.env.SUPABASE_IMAGE_BUCKET || 'samples';
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.jpg`;
  const filePath = `samples/${filename}`;

  /**
   * Compress image using sharp.
   * We aim for under 1MB. Starting with 80% quality JPEG.
   */
  let compressedBuffer = await sharp(buffer)
    .jpeg({ quality: 80, progressive: true })
    .toBuffer();

  /**
   * If the image is still over 1MB (1,048,576 bytes),
   * we compress it more aggressively.
   */
  if (compressedBuffer.length > 1024 * 1024) {
    compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 50, progressive: true })
      .toBuffer();
  }

  const { error } = await supabaseServer.storage
    .from(bucketName)
    .upload(filePath, compressedBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image to Supabase: ${error.message}`);
  }

  // Return the relative path in the bucket
  return filePath;
}

export async function deleteSampleImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;

  const bucketName = process.env.SUPABASE_IMAGE_BUCKET || 'samples';
  const { error } = await supabaseServer.storage.from(bucketName).remove(paths);

  if (error) {
    throw new Error(`Failed to delete images from Supabase: ${error.message}`);
  }
}
