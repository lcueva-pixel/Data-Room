'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useReports } from '@/hooks/useReports';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopBar } from '@/components/dashboard/TopBar';
import { ReportViewer } from '@/components/dashboard/ReportViewer';
import { getRolId } from '@/lib/auth';
import type { Report } from '@/types/report.types';


export default function DashboardPage() {
  const { logout } = useAuth();
  const { reports, isLoading, error } = useReports();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [mounted, setMounted] = useState(false);
  const [rolId, setRolId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    setRolId(getRolId());
  }, []);


  // Seleccionar el primer reporte automáticamente al cargar
  useEffect(() => {
    if (reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]);
    }
  }, [reports, selectedReport]);

  if (!mounted) return null;

  const activeTitle = selectedReport?.titulo ?? 'Panel de Reportes';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Sidebar */}
      <Sidebar
        reports={reports}
        isLoading={isLoading}
        selectedReport={selectedReport}
        onReportSelect={setSelectedReport}
        onLogout={logout}
        rolId={rolId}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* TopBar */}
        <TopBar
          activeTitle={activeTitle}
          rolId={rolId}
          onLogout={logout}
        />

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            // Skeleton de carga
            <div className="flex flex-col gap-3 h-full">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
              <div className="flex-1 bg-slate-200 rounded-xl animate-pulse" style={{ minHeight: 'calc(100vh - 220px)' }} />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          ) : selectedReport ? (
            <ReportViewer
              reportId={selectedReport.id}
              titulo={selectedReport.titulo}
              urlIframe={selectedReport.urlIframe}
            />
          ) : (
            // Estado vacío
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
              <LayoutDashboard className="w-16 h-16 opacity-30" />
              <div className="text-center">
                <p className="text-lg font-medium">Sin reportes disponibles</p>
                <p className="text-sm mt-1">Selecciona un reporte del menú lateral para comenzar</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
