'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useReportTracking } from '@/hooks/useReportTracking';

interface ReportViewerProps {
  reportId: number;
  titulo: string;
  urlIframe: string | null;
}

export function ReportViewer({ reportId, titulo, urlIframe }: ReportViewerProps) {
  useReportTracking(reportId);
  const [isLoaded, setIsLoaded] = useState(false);

  if (!urlIframe) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-gray-100 truncate">{titulo}</h2>
        </div>
        <div className="flex-1 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-sidebar-hover flex items-center justify-center">
          <div className="text-center px-6">
            <p className="text-sm text-slate-500 dark:text-gray-400">
              Este reporte no tiene gráfico configurado.
            </p>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
              Si es un reporte principal, agrégale sub-reportes para verlos como dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior del viewer */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-gray-100 truncate">{titulo}</h2>
        <a
          href={urlIframe}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-sidebar-accent hover:text-blue-800 dark:hover:text-sidebar-accent/80 transition-colors flex-shrink-0 ml-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir en nueva pestaña
        </a>
      </div>

      {/* Contenedor del iframe */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-sidebar-hover shadow-sm dark:shadow-black/30">
        {/* Spinner mientras carga */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-sidebar-hover z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 dark:border-sidebar-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500 dark:text-gray-400">Cargando reporte...</p>
            </div>
          </div>
        )}
        <iframe
          src={urlIframe}
          title={titulo}
          className="w-full h-full"
          style={{ minHeight: 'calc(100vh - 220px)' }}
          loading="lazy"
          allow="fullscreen"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>
  );
}
