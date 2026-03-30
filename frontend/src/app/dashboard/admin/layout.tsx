'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { getRolId } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { reports, isLoading } = useReports();
    const [mounted, setMounted] = useState(false);
    const [rolId, setRolId] = useState<number | null>(null);

    useEffect(() => {
      setMounted(true);
      setRolId(getRolId());
    }, []);

  // Guard client-side: redirigir si no es admin

  useEffect(() => {
    if (mounted && rolId !== 1) {
      router.replace('/dashboard');
    }
  }, [mounted, rolId, router]);

  if (!mounted) return null;
  if (rolId !== 1) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-sidebar-main">
      {/* Sidebar: en páginas admin, los reportes navegan al dashboard principal */}
      <Sidebar
        reports={reports}
        isLoading={isLoading}
        selectedReport={null}
        onReportSelect={() => router.push('/dashboard')}
        onLogout={logout}
        rolId={rolId}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          activeTitle="Administración"
          rolId={rolId}
          onLogout={logout}
        />

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
