'use client';

import { useEffect } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  X,
} from 'lucide-react';

interface PDFViewerModalProps {
  title: string;
  onClose: () => void;
}

export function PDFViewerModal({ title, onClose }: PDFViewerModalProps) {
  // Bloquear scroll del fondo + listener tecla Escape
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    // Overlay — clic fuera cierra el modal
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Panel del modal — stopPropagation evita cierre al clicar dentro */}
      <div
        className="flex flex-col w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Toolbar ── */}
        <div className="bg-zinc-800 flex items-center justify-between px-4 h-12 flex-shrink-0">
          {/* Izquierda: icono + título */}
          <div className="flex items-center gap-2 text-white text-sm font-medium min-w-0">
            <FileText className="w-4 h-4 flex-shrink-0 text-zinc-400" />
            <span className="truncate">{title}</span>
          </div>

          {/* Centro: paginación simulada */}
          <div className="flex items-center gap-1 text-zinc-300 text-sm flex-shrink-0">
            <button className="p-1 hover:text-white hover:bg-zinc-700 rounded transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 tabular-nums">1 / 5</span>
            <button className="p-1 hover:text-white hover:bg-zinc-700 rounded transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Derecha: acciones + cerrar */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              title="Imprimir"
            >
              <Printer className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-zinc-600 mx-1" />
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-red-600 rounded transition-colors"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Área de lectura ── */}
        <div className="bg-zinc-200 flex-1 overflow-y-auto p-8 flex justify-center">
          {/* Hoja de papel simulada */}
          <div className="bg-white w-full max-w-2xl shadow-2xl rounded-sm px-14 py-12 min-h-[700px]">

            {/* Título del documento */}
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide mb-1">
              {title}
            </h2>
            <p className="text-xs text-slate-400 mb-6">Construex — Internal Document</p>
            <hr className="border-slate-200 mb-8" />

            {/* Sección: Executive Summary */}
            <h3 className="text-base font-semibold text-slate-800 mb-2">Executive Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-8">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.
            </p>

            {/* Sección: Financial Overview */}
            <h3 className="text-base font-semibold text-slate-800 mb-2">Financial Overview</h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-4">
              Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis
              unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.
            </p>
            {/* Skeleton lines — contenido "cargando" */}
            <div className="space-y-2 mb-8">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-11/12" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-4/5" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
            </div>

            {/* Sección: Key Considerations */}
            <h3 className="text-base font-semibold text-slate-800 mb-2">Key Considerations</h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-4">
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed
              quia consequuntur magni dolores eos qui ratione sequi nesciunt.
            </p>
            {/* Skeleton lines */}
            <div className="space-y-2 mb-8">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-3/4" />
            </div>

            {/* Sección: Conclusions */}
            <h3 className="text-base font-semibold text-slate-800 mb-2">Conclusions</h3>
            <p className="text-sm text-slate-600 leading-relaxed text-justify mb-4">
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
              adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore.
            </p>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded animate-pulse w-full" />
              <div className="h-3 bg-slate-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
