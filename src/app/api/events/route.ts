import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { getEvents } from '@/lib/services';
import { PhotoType } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType') || undefined;
  const targetId = searchParams.get('targetId') || undefined;
  const status = searchParams.get('status') || undefined;
  const type = searchParams.get('type') || undefined;
  const search = searchParams.get('search') || undefined;

  const events = getEvents({ targetType, targetId, status, type, search });
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Wymagane logowanie' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      targetType, 
      targetId, 
      title, 
      eventType, 
      priority, 
      status, 
      description, 
      actionsTaken, 
      assignedTo,
      photos 
    } = body;

    if (!targetType || !targetId || !title || !description || !eventType) {
      return NextResponse.json({ error: 'Uzupełnij wszystkie wymagane pola' }, { status: 400 });
    }

    const db = getDb();
    const eventId = `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const insertEvent = db.prepare(`
      INSERT INTO events (id, target_type, target_id, title, event_type, priority, status, description, actions_taken, reported_by, reported_by_name, assigned_to, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      eventId,
      targetType,
      targetId,
      title,
      eventType,
      priority || 'MEDIUM',
      status || 'OPEN',
      description,
      actionsTaken || '',
      user.id,
      user.name,
      assignedTo || null,
      now,
      now
    );

    // Insert photos if any
    if (Array.isArray(photos) && photos.length > 0) {
      const insertPhoto = db.prepare(`
        INSERT INTO event_photos (id, event_id, photo_type, caption, file_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const p of photos) {
        if (!p.fileUrl) continue;
        const photoId = `pho-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        insertPhoto.run(
          photoId,
          eventId,
          (p.photoType as PhotoType) || 'GENERAL',
          p.caption || '',
          p.fileUrl,
          now
        );
      }
    }

    // Auto-notify in Industrial Chat
    try {
      let targetName = 'Urządzenie';
      if (targetType === 'LINE') {
        const line = db.prepare('SELECT name, code FROM lines WHERE id = ?').get(targetId) as { name: string; code: string } | undefined;
        if (line) targetName = `${line.name} (${line.code})`;
      } else if (targetType === 'CABINET') {
        const cab = db.prepare('SELECT name, code FROM cabinets WHERE id = ?').get(targetId) as { name: string; code: string } | undefined;
        if (cab) targetName = `${cab.name} (${cab.code})`;
      }

      const isCritical = priority === 'CRITICAL';
      const channelId = isCritical ? 'chan-awarie' : 'chan-ogolny';
      const firstPhoto = Array.isArray(photos) && photos[0]?.fileUrl ? photos[0].fileUrl : null;
      const chatMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      db.prepare(`
        INSERT INTO chat_messages (id, channel_id, user_id, user_name, user_role, content, photo_url, related_event_id, related_event_title, related_target_id, related_target_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        chatMsgId,
        channelId,
        user.id,
        user.name,
        user.role,
        isCritical
          ? `🚨 ALERT STOP LINII! Zgłoszono awarię krytyczną: "${title}". ${description}`
          : `⚠️ Zgłoszono usterkę na maszynie: "${title}". ${description}`,
        firstPhoto,
        eventId,
        title,
        targetId,
        targetName,
        now
      );
    } catch (chatErr) {
      console.warn('Auto chat alert warning:', chatErr);
    }

    return NextResponse.json({ success: true, eventId });
  } catch (err: unknown) {
    console.error('Create event error:', err);
    return NextResponse.json({ error: 'Nie udało się zapisać zdarzenia' }, { status: 500 });
  }
}
