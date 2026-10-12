import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getChatChannels } from '@/lib/services';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
  }

  const channels = getChatChannels();
  return NextResponse.json({ channels });
}
