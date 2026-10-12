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
    const { name, code, status, description, manufacturer, year, serialNumber, departmentId } = body;

    const db = getDb();
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    db.prepare(`
      UPDATE lines
      SET name = COALESCE(?, name),
          code = COALESCE(?, code),
          status = COALESCE(?, status),
          description = COALESCE(?, description),
          manufacturer = COALESCE(?, manufacturer),
          year = COALESCE(?, year),
          serial_number = COALESCE(?, serial_number),
          department_id = COALESCE(?, department_id),
          updated_at = ?
      WHERE id = ?
    `).run(name, code, status, description, manufacturer, year, serialNumber, departmentId, now, id);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Update line error:', err);
    return NextResponse.json({ error: 'Błąd zapisu danych linii' }, { status: 500 });
  }
}
