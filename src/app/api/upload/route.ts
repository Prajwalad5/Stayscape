export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPG, PNG and WEBP are allowed.' }, { status: 400 });
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename
    const ext = file.type.split('/')[1];
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const filename = `${uniqueId}.${ext}`;
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {}

    const path = join(uploadsDir, filename);
    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
