import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getLines, getEvents } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { OperatorProfileView } from '@/components/OperatorProfileView';

export default async function OperatorPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const lines = getLines();
  const recentIncidents = getEvents({ type: 'INCIDENT' });

  return (
    <AppShell currentUser={user}>
      <OperatorProfileView
        currentUser={user}
        lines={lines}
        recentIncidents={recentIncidents}
      />
    </AppShell>
  );
}
