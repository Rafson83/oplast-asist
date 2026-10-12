import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const devices = db.prepare(`
    SELECT d.id, d.name, d.code, d.type, c.name as cabinet_name, l.name as line_name
    FROM devices d
    JOIN cabinets c ON d.cabinet_id = c.id
    JOIN lines l ON c.line_id = l.id
    ORDER BY d.name ASC
  `).all();
  return NextResponse.json({ devices });
}
