import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function saveSampleImage(base64Data: string): Promise<string> {
  const [header, base64] = base64Data.split(',');
  const buffer = Buffer.from(base64, 'base64');
  const mimeType = header.match(/\/(.*?);/)?.[1] || 'png';

  // Use the public directory for accessibility from the browser
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'samples');

  // Ensure the directory exists
  await mkdir(uploadDir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${mimeType}`;
  const filePath = join(uploadDir, filename);

  await writeFile(filePath, buffer);

  // Return the public web path
  return `/uploads/samples/${filename}`;
}
