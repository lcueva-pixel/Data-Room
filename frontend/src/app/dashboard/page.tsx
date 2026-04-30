'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ReportViewer } from '@/components/dashboard/ReportViewer';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import type { Report } from '@/types/report.types';

// Busca un reporte por ID en cualquier nivel del árbol.
function findById(tree: Report[], targetId: number): Report | null {
  for (const node of tree) {
    if (node.id === targetId) return node;
    if (node.children?.length) {
      const found = findById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

// Busca el padre directo de un reporte dentro del árbol completo.
function findParent(tree: Report[], targetId: number): Report | null {
  for (const node of tree) {
    if (node.children?.some((c) => c.id === targetId)) return node;
    if (node.children?.length) {
      const found = findParent(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

function DashboardPageInner() {
  const { data: session, status } = useSession();
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const { reports, isLoading, error } = useReports();
  const searchParams = useSearchParams();
  const reportIdFromUrl = searchParams.get('reportId');

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [scrollTargetId, setScrollTargetId] = useState<number | null>(null);
  const [didInitialize, setDidInitialize] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const rolId = session?.user?.rol_id ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inicialización única: respeta `?reportId=X` si viene en la URL.
  // Si el ID no se encuentra (inválido o sin permiso), cae al primer reporte.
  // El guard `didInitialize` evita que se reaplique tras clicks subsiguientes.
  useEffect(() => {
    if (didInitialize || !reports.length) return;

    if (reportIdFromUrl) {
      const requested = findById(reports, Number(reportIdFromUrl));
      if (requested) {
        // Si el solicitado es hoja con padre dashboard, abrir el dashboard del padre y scrollear.
        if (!requested.children?.length) {
          const parent = findParent(reports, requested.id);
          if (parent && parent.children?.length) {
            setSelectedReport(parent);
            setScrollTargetId(requested.id);
            setDidInitialize(true);
            return;
          }
        }
        setSelectedReport(requested);
        setDidInitialize(true);
        return;
      }
      // ID inválido: fallback silencioso al primero.
    }

    setSelectedReport(reports[0]);
    setDidInitialize(true);
  }, [reports, reportIdFromUrl, didInitialize]);

  if (!mounted || status === 'loading') return null;

  const esDashboard = Boolean(
    selectedReport?.children && selectedReport.children.length > 0,
  );

  // Lógica de selección desde Sidebar (Opción C — rama scroll):
  // - Nodo con hijos → su propio dashboard.
  // - Hoja cuyo padre es dashboard → abre el dashboard del padre y scrollea a la tarjeta.
  // - Hoja raíz (sin padre) → iframe único, comportamiento clásico.
  const handleReportSelect = (report: Report) => {
    if (report.children?.length) {
      setSelectedReport(report);
      setScrollTargetId(null);
      return;
    }
    const parent = findParent(reports, report.id);
    if (parent && parent.children?.length) {
      setSelectedReport(parent);
      setScrollTargetId(report.id);
    } else {
      setSelectedReport(report);
      setScrollTargetId(null);
    }
  };

  // Botón "Abrir en pantalla completa" desde una tarjeta del grid.
  const handleOpenIsolated = (child: Report) => {
    setSelectedReport(child);
    setScrollTargetId(null);
  };

  const activeTitle = selectedReport?.titulo ?? 'Panel de Reportes';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-sidebar-main">
      {/* Sidebar */}
      <Sidebar
        reports={reports}
        isLoading={isLoading}
        selectedReport={selectedReport}
        highlightedChildId={scrollTargetId}
        onReportSelect={handleReportSelect}
        onLogout={handleLogout}
        rolId={rolId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          activeTitle={activeTitle}
          rolId={rolId}
          onLogout={handleLogout}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex flex-col gap-3 h-full">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div
                className="flex-1 bg-slate-200 rounded-xl animate-pulse"
                style={{ minHeight: 'calc(100vh - 220px)' }}
              />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : selectedReport && esDashboard ? (
            <DashboardGrid
              parent={selectedReport}
              scrollTargetId={scrollTargetId}
              onScrollHandled={() => setScrollTargetId(null)}
              onOpenIsolated={handleOpenIsolated}
            />
          ) : selectedReport ? (
            <ReportViewer
              reportId={selectedReport.id}
              titulo={selectedReport.titulo}
              urlIframe={selectedReport.urlIframe}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <LayoutDashboard className="w-16 h-16 opacity-30" />
              <div className="text-center">
                <p className="text-lg font-medium">Sin reportes disponibles</p>
                <p className="text-sm mt-1">
                  Selecciona un reporte del menú lateral para comenzar
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // useSearchParams requiere Suspense boundary en Next 16 para SSR.
  return (
    <Suspense fallback={null}>
      <DashboardPageInner />
    </Suspense>
  );
}
