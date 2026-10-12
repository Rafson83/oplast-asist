import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getChatChannels, getChatMessages, getLines } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { IndustrialChatView } from '@/components/IndustrialChatView';

interface ChatPageProps {
  searchParams: Promise<{
    channel?: string;
    topic?: string;
  }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const resolvedParams = await searchParams;
  const channels = getChatChannels();
  const lines = getLines();

  let targetChannelId = channels[0]?.id;
  if (resolvedParams.channel) {
    const found = channels.find((c) => c.slug === resolvedParams.channel || c.id === resolvedParams.channel);
    if (found) targetChannelId = found.id;
  }

  const initialMessages = getChatMessages(targetChannelId);

  return (
    <AppShell currentUser={user}>
      <IndustrialChatView
        currentUser={user}
        initialChannels={channels}
        initialMessages={initialMessages}
        lines={lines}
        initialChannelSlug={resolvedParams.channel}
        initialTopic={resolvedParams.topic}
      />
    </AppShell>
  );
}
