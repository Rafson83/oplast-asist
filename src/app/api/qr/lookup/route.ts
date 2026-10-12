import { NextResponse } from 'next/server';
import { findTargetByQr } from '@/lib/services';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Brak kodu do wyszukania' }, { status: 400 });
  }

  const result = findTargetByQr(code);
  if (!result) {
    return NextResponse.json({ error: 'Nie znaleziono obiektu o takim kodzie QR / oznaczeniu' }, { status: 404 });
  }

  return NextResponse.json({ success: true, ...result });
}
