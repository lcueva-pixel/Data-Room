'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const { reports, isLoading } = useReports();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rolId = session?.user?.rol_id ?? null;

  // Guard client-side: redirigir si no es admin
  useEffect(() => {
    if (status === 'authenticated' && rolId !== 1) {
      router.replace('/dashboard');
    }
  }, [status, rolId, router]);

  if (status === 'loading') return null;
  if (rolId !== 1) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-sidebar-main">
      <Sidebar
        reports={reports}
        isLoading={isLoading}
        selectedReport={null}
        onReportSelect={(report) => router.push(`/dashboard?reportId=${report.id}`)}
        onLogout={handleLogout}
        rolId={rolId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          activeTitle="Administración"
          rolId={rolId}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
