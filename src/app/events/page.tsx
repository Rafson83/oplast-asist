import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getEvents } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { EventsLogView } from '@/components/EventsLogView';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { status, type } = await searchParams;
  const events = getEvents({ status, type });

  return (
    <AppShell currentUser={user}>
      <EventsLogView
        currentUser={user}
        initialEvents={events}
        initialStatusFilter={status}
        initialTypeFilter={type}
      />
    </AppShell>
  );
}
