import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDeviceById } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { DeviceDetailView } from '@/components/DeviceDetailView';

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ deviceId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { deviceId } = await params;
  const device = getDeviceById(deviceId);

  if (!device) {
    notFound();
  }

  return (
    <AppShell currentUser={user}>
      <DeviceDetailView currentUser={user} device={device} />
    </AppShell>
  );
}
