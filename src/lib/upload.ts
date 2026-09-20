import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export async function uploadFile(file: File): Promise<{ url: string; key: string }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  // Create upload directory if it doesn't exist
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  // Generate unique filename
  const ext = path.extname(file.name) || '.jpg';
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${sanitizedName}`;
  const filePath = path.join(UPLOAD_DIR, key);

  // Write file
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/uploads/${key}`;
  return { url, key };
}

export async function deleteFile(key: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    await unlink(filePath);
  } catch (error) {
    console.error(`Failed to delete file: ${key}`, error);
  }
}
