import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const cabinets = db.prepare(`
    SELECT c.id, c.name, c.code, c.line_id, l.name as line_name
    FROM cabinets c
    JOIN lines l ON c.line_id = l.id
    ORDER BY c.name ASC
  `).all();
  return NextResponse.json({ cabinets });
}
