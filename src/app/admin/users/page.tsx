import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUsers } from '@/lib/services';
import { AppShell } from '@/components/AppShell';
import { UsersAdminView } from '@/components/UsersAdminView';

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  const users = getUsers();

  return (
    <AppShell currentUser={user}>
      <UsersAdminView currentUser={user} users={users} />
    </AppShell>
  );
}
