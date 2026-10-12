import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getLineById } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { LineDetailView } from '@/components/LineDetailView';

export default async function LineDetailPage({
  params,
}: {
  params: Promise<{ lineId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { lineId } = await params;
  const line = getLineById(lineId);

  if (!line) {
    notFound();
  }

  return (
    <AppShell currentUser={user}>
      <LineDetailView currentUser={user} line={line} />
    </AppShell>
  );
}
