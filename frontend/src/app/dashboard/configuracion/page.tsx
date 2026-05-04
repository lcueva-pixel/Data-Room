'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Palette } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ThemeSelector } from '@/components/configuracion/ThemeSelector';

export default function ConfiguracionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const { reports, isLoading } = useReports();
  const rolId = session?.user?.rol_id ?? null;
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          activeTitle="Configuración"
          rolId={rolId}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">
                Configuración
              </h1>
              <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
                Personaliza la apariencia y el comportamiento del portal.
              </p>
            </header>

            {/* Sección: Apariencia */}
            <section className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-black/30 p-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-sidebar-accent/15 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-blue-600 dark:text-sidebar-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">
                    Apariencia
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">
                    Elige el tema de la interfaz. La opción “Sistema” respeta la preferencia de tu equipo.
                  </p>
                </div>
              </div>

              <ThemeSelector />

              <p className="text-xs text-slate-400 dark:text-gray-500 mt-4">
                Tu elección se guarda en este navegador.
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
