'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useReportTracking } from '@/hooks/useReportTracking';

interface ReportViewerProps {
  reportId: number;
  titulo: string;
  urlIframe: string;
}

export function ReportViewer({ reportId, titulo, urlIframe }: ReportViewerProps) {
  useReportTracking(reportId);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Barra superior del viewer */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-slate-700 truncate">{titulo}</h2>
        <a
          href={urlIframe}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0 ml-4"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Abrir en nueva pestaña
        </a>
      </div>

      {/* Contenedor del iframe */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm">
        {/* Spinner mientras carga */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-500">Cargando reporte...</p>
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
