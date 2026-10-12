import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getEvents, getLines } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { FaultsOverviewView } from '@/components/FaultsOverviewView';

export default async function FaultsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const events = getEvents();
  const lines = getLines();

  return (
    <AppShell currentUser={user}>
      <FaultsOverviewView
        currentUser={user}
        events={events}
        lines={lines}
      />
    </AppShell>
  );
}
