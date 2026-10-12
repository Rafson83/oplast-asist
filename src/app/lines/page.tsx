import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDepartments, getLines } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { LinesListView } from '@/components/LinesListView';

export default async function LinesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const departments = getDepartments();
  const lines = getLines();

  return (
    <AppShell currentUser={user}>
      <LinesListView
        currentUser={user}
        departments={departments}
        lines={lines}
      />
    </AppShell>
  );
}
