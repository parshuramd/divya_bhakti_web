import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const hasAdminAccess = await isAdmin();

  if (!session) {
    redirect('/login?callbackUrl=/admin');
  }

  if (!hasAdminAccess) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader user={session.user} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

