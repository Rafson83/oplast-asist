import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { AppShell } from '@/components/AppShell';
import { QrScannerPageView } from '@/components/QrScannerPageView';

export default async function QrScannerPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <AppShell currentUser={user}>
      <QrScannerPageView currentUser={user} />
    </AppShell>
  );
}
