import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getDocuments } from '@/lib/services';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType') || undefined;
  const targetId = searchParams.get('targetId') || undefined;
  const search = searchParams.get('search') || undefined;

  const documents = getDocuments(targetType, targetId, search);
  return NextResponse.json({ documents });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
    }

    const body = await request.json();
    const { targetType, targetId, title, docType, version, fileUrl, fileName, fileSize, mimeType, description } = body;

    if (!targetType || !targetId || !title || !fileUrl || !fileName) {
      return NextResponse.json({ error: 'Uzupełnij wymagane pola dokumentu' }, { status: 400 });
    }

    const db = getDb();
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      INSERT INTO documents (id, target_type, target_id, title, doc_type, version, file_url, file_name, file_size, mime_type, description, uploaded_by, uploaded_by_name, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      docId,
      targetType,
      targetId,
      title,
      docType || 'DTR',
      version || '1.0',
      fileUrl,
      fileName,
      fileSize || 0,
      mimeType || 'application/pdf',
      description || '',
      user.id,
      user.name,
      now
    );

    return NextResponse.json({ success: true, docId });
  } catch (err: unknown) {
    console.error('Create document error:', err);
    return NextResponse.json({ error: 'Nie udało się dodać dokumentu' }, { status: 500 });
  }
}
