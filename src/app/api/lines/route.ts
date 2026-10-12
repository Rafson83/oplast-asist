import { NextResponse } from 'next/server';
import { getLines } from '@/lib/services';

export async function GET() {
  const lines = getLines();
  return NextResponse.json({ lines });
}
