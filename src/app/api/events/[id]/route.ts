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
    const { status, actionsTaken, assignedTo } = body;

    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const resolvedAt = status === 'RESOLVED' ? now : null;

    db.prepare(`
      UPDATE events
      SET status = COALESCE(?, status),
          actions_taken = COALESCE(?, actions_taken),
          assigned_to = COALESCE(?, assigned_to),
          resolved_at = CASE WHEN ? = 'RESOLVED' THEN ? ELSE resolved_at END,
          updated_at = ?
      WHERE id = ?
    `).run(status, actionsTaken, assignedTo, status, resolvedAt, now, id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Update event error:', err);
    return NextResponse.json({ error: 'Błąd aktualizacji zgłoszenia' }, { status: 500 });
  }
}
