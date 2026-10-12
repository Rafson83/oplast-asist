import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getEvents } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { TechnicianProfileView } from '@/components/TechnicianProfileView';

export default async function TechnicianPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const events = getEvents();

  return (
    <AppShell currentUser={user}>
      <TechnicianProfileView
        currentUser={user}
        events={events}
      />
    </AppShell>
  );
}
