import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getChatMessages, createChatMessage } from '@/lib/services';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId') || undefined;
  const limit = parseInt(searchParams.get('limit') || '60', 10);

  const messages = getChatMessages(channelId, limit);
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      channelId, 
      content, 
      photoUrl, 
      relatedEventId, 
      relatedEventTitle, 
      relatedTargetId, 
      relatedTargetName 
    } = body;

    if (!channelId || !content || !content.trim()) {
      return NextResponse.json({ error: 'Treść wiadomości i kanał są wymagane' }, { status: 400 });
    }

    const message = createChatMessage({
      channelId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      content: content.trim(),
      photoUrl,
      relatedEventId,
      relatedEventTitle,
      relatedTargetId,
      relatedTargetName,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: unknown) {
    console.error('Chat message error:', err);
    return NextResponse.json({ error: 'Błąd wysyłania wiadomości' }, { status: 500 });
  }
}
