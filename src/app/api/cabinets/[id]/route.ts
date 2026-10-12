import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, code, location, voltage, ipRating, notes } = body;

    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE cabinets
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          location = COALESCE(?, location),
          voltage = COALESCE(?, voltage),
          ip_rating = COALESCE(?, ip_rating),
          notes = COALESCE(?, notes),
          updated_at = ?
      WHERE id = ?
    `).run(name, code, location, voltage, ipRating, notes, now, id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Update cabinet error:', err);
    return NextResponse.json({ error: 'Błąd zapisu danych szafy' }, { status: 500 });
  }
}
