import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllPrintableQrs } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { PrintLabelsView } from '@/components/PrintLabelsView';

export default async function PrintLabelsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const items = getAllPrintableQrs();

  return (
    <AppShell currentUser={user}>
      <PrintLabelsView items={items} />
    </AppShell>
  );
}
