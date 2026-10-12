import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getGlobalStats, getLines, getEvents, getDocuments } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { DashboardView } from '@/components/DashboardView';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const stats = getGlobalStats();
  const lines = getLines();
  const recentEvents = getEvents();
  const recentDocs = getDocuments();

  return (
    <AppShell currentUser={user}>
      <DashboardView
        currentUser={user}
        stats={stats}
        lines={lines}
        recentEvents={recentEvents.slice(0, 5)}
        recentDocs={recentDocs.slice(0, 5)}
      />
    </AppShell>
  );
}
