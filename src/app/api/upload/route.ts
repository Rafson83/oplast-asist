import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'photos'; // 'photos' | 'docs'

    if (!file) {
      return NextResponse.json({ error: 'Brak pliku do przesłania' }, { status: 400 });
    }

    const subDir = type === 'docs' ? 'docs' : 'photos';
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
    await fs.mkdir(uploadDir, { recursive: true });

    // Clean filename and create unique timestamped name
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const finalFilename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, finalFilename);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${subDir}/${finalFilename}`;

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Błąd podczas wgrywania pliku' }, { status: 500 });
  }
}
