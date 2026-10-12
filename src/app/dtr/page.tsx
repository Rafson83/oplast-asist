import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDocuments } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { DtrCatalogView } from '@/components/DtrCatalogView';

export default async function DtrPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const documents = getDocuments();

  return (
    <AppShell currentUser={user}>
      <DtrCatalogView currentUser={user} documents={documents} />
    </AppShell>
  );
}
