import { NextResponse } from 'next/server';
import { verifyCredentials, setSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Podaj login i hasło' }, { status: 400 });
    }

    const user = verifyCredentials(username.trim(), password);
    if (!user) {
      return NextResponse.json({ error: 'Nieprawidłowy login lub hasło' }, { status: 401 });
    }

    await setSessionCookie(user);

    return NextResponse.json({ success: true, user });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Wystąpił błąd logowania' }, { status: 500 });
  }
}
