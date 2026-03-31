import { z } from 'zod';

const IMAGE_BASE64_REGEX = /^data:image\/(jpeg|jpg|png|webp);base64,/;

export const analyzeSampleSchema = z.object({
  image: z
    .string()
    .regex(
      IMAGE_BASE64_REGEX,
      'Format gambar harus base64 valid (jpeg, jpg, png, webp)',
    ),
  metal_type: z.enum(['Cu']),
});

export const saveSampleSchema = z.object({
  sample_name: z.string().min(1, 'Nama sample wajib diisi'),
  test_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Tanggal uji tidak valid'),
  metal_type: z.enum(['Cu']),
  concentration: z.number().optional(),
  rgb_value: z.string().optional(),
  image: z
    .string()
    .regex(
      IMAGE_BASE64_REGEX,
      'Format gambar harus base64 valid (jpeg, jpg, png, webp)',
    ),
});

export type AnalyzeSampleInput = z.infer<typeof analyzeSampleSchema>;
export type SaveSampleInput = z.infer<typeof saveSampleSchema>;
