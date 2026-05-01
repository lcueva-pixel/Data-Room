'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2 } from 'lucide-react';
import clsx from 'clsx';
import type { Report } from '@/types/report.types';

interface DashboardGridProps {
  parent: Report;
  scrollTargetId?: number | null;
  onOpenIsolated?: (child: Report) => void;
  onScrollHandled?: () => void;
}

function getGridClasses(count: number): string {
  if (count <= 1) return 'grid grid-cols-1';
  if (count === 2) return 'grid grid-cols-1 md:grid-cols-2';
  if (count <= 4) return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2';
  return 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
}

export function DashboardGrid({
  parent,
  scrollTargetId,
  onOpenIsolated,
  onScrollHandled,
}: DashboardGridProps) {
  const children = parent.children ?? [];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!scrollTargetId || !containerRef.current) return;
    const el = containerRef.current.querySelector<HTMLElement>(
      `[data-child-id="${scrollTargetId}"]`,
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onScrollHandled?.();
    }
  }, [scrollTargetId, onScrollHandled]);

  return (
    <div ref={containerRef} key={parent.id} className="flex flex-col gap-6">
      {/* Header del padre — siempre visible (título + descripción) */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100 truncate">
          {parent.titulo}
        </h1>
        {parent.descripcion && (
          <p className="text-sm text-slate-500 dark:text-gray-400">{parent.descripcion}</p>
        )}
      </header>

      {/* Banda superior con iframe del padre (si existe) */}
      {parent.urlIframe && (
        <ParentBanner urlIframe={parent.urlIframe} titulo={parent.titulo} />
      )}

      {/* Grid de hijos */}
      {children.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-white dark:bg-sidebar-hover p-10 text-center text-sm text-slate-400 dark:text-gray-500">
          Este reporte no tiene sub-reportes asociados.
        </div>
      ) : (
        <div className={clsx(getGridClasses(children.length), 'gap-6')}>
          {children.map((child, idx) => (
            <ChildCard
              key={child.id}
              child={child}
              eager={idx < 2}
              highlighted={scrollTargetId === child.id}
              onOpenIsolated={onOpenIsolated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Banda superior con iframe del padre ────────────────────────────────
function ParentBanner({ urlIframe, titulo }: { urlIframe: string; titulo: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <div className="relative h-[300px] rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-sidebar-hover shadow-sm dark:shadow-black/30">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-sidebar-hover z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-3 border-blue-600 dark:border-sidebar-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 dark:text-gray-400">Cargando resumen...</p>
          </div>
        </div>
      )}
      <iframe
        src={urlIframe}
        title={`${titulo} (resumen)`}
        className={clsx(
          'w-full h-full transition-opacity duration-200',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        loading="eager"
        allow="fullscreen"
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
}

// ── Tarjeta individual por hijo ────────────────────────────────────────
interface ChildCardProps {
  child: Report;
  eager: boolean;
  highlighted: boolean;
  onOpenIsolated?: (child: Report) => void;
}

function ChildCard({ child, eager, highlighted, onOpenIsolated }: ChildCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const url = child.urlIframe;

  // Timeout de seguridad para iframes que no disparan onLoad
  useEffect(() => {
    if (!url || isLoaded) return;
    const id = window.setTimeout(() => {
      if (!isLoaded) setHasError(true);
    }, 15000);
    return () => window.clearTimeout(id);
  }, [url, isLoaded]);

  return (
    <article
      data-child-id={child.id}
      className={clsx(
        'flex flex-col rounded-xl border bg-white dark:bg-sidebar-hover shadow-sm dark:shadow-black/30 overflow-hidden transition-all duration-200',
        highlighted
          ? 'border-blue-500 dark:border-sidebar-accent ring-2 ring-blue-200 dark:ring-sidebar-accent/30'
          : 'border-slate-200 dark:border-white/10',
      )}
    >
      {/* Header de tarjeta */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-white/10">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-100 truncate">
          {child.titulo}
        </h3>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-sidebar-main hover:text-blue-600 dark:hover:text-sidebar-accent transition-colors"
              aria-label="Abrir en nueva pestaña"
              title="Abrir en nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {onOpenIsolated && (
            <button
              type="button"
              onClick={() => onOpenIsolated(child)}
              className="p-1.5 rounded-md text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-sidebar-main hover:text-blue-600 dark:hover:text-sidebar-accent transition-colors"
              aria-label="Abrir en pantalla completa"
              title="Abrir en pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cuerpo: iframe + skeleton/error */}
      <div className="relative aspect-video min-h-[400px] bg-slate-50 dark:bg-sidebar-main">
        {!url ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400 dark:text-gray-500">
            Sin gráfico configurado
          </div>
        ) : hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-gray-400 p-4 text-center">
            <p>No se pudo cargar el reporte.</p>
            <button
              type="button"
              onClick={() => {
                setHasError(false);
                setIsLoaded(false);
              }}
              className="text-xs text-blue-600 dark:text-sidebar-accent hover:text-blue-800 dark:hover:text-sidebar-accent/80 underline"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-sidebar-main animate-pulse">
                <div className="w-7 h-7 border-3 border-blue-600 dark:border-sidebar-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <iframe
              src={url}
              title={child.titulo}
              className={clsx(
                'w-full h-full transition-opacity duration-200',
                isLoaded ? 'opacity-100' : 'opacity-0',
              )}
              loading={eager ? 'eager' : 'lazy'}
              allow="fullscreen"
              onLoad={() => setIsLoaded(true)}
            />
          </>
        )}
      </div>
    </article>
  );
}
