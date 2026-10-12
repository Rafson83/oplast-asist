import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get('data') || 'OPLAST';
  const format = searchParams.get('format') || 'svg'; // 'svg' | 'dataurl'

  try {
    if (format === 'dataurl') {
      const dataUrl = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      return NextResponse.json({ dataUrl });
    }

    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: 250,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    return new Response(svgString, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: unknown) {
    console.error('QR generate error:', err);
    return NextResponse.json({ error: 'Błąd generowania kodu QR' }, { status: 500 });
  }
}
