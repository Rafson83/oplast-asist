import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getCabinetById } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { CabinetDetailView } from '@/components/CabinetDetailView';

export default async function CabinetDetailPage({
  params,
}: {
  params: Promise<{ cabinetId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { cabinetId } = await params;
  const cabinet = getCabinetById(cabinetId);

  if (!cabinet) {
    notFound();
  }

  return (
    <AppShell currentUser={user}>
      <CabinetDetailView currentUser={user} cabinet={cabinet} />
    </AppShell>
  );
}
