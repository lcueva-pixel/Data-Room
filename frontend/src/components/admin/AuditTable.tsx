'use client';

import { useState, useEffect, useRef } from 'react';
import { LogIn, Monitor } from 'lucide-react';
import type { AuditEntry, AuditListQuery } from '@/types/audit.types';

interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface AuditTableProps {
  entries: AuditEntry[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  query: AuditListQuery;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const fmt = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function TipoBadge({ tipo }: { tipo: 'ACCESO' | 'VISUALIZACION' }) {
  if (tipo === 'ACCESO') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-gray-300">
        <LogIn className="w-3 h-3" />
        Acceso al sistema
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sidebar-accent/20 text-[#0d3640] dark:text-sidebar-accent">
      <Monitor className="w-3 h-3" />
      Visualización
    </span>
  );
}

function PaginationBar({
  meta,
  onPageChange,
}: {
  meta: PaginatedMeta;
  onPageChange: (p: number) => void;
}) {
  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 dark:border-white/10 text-sm text-slate-500 dark:text-gray-400">
      <span>
        Mostrando {from}–{to} de {total} registros
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 min-h-[44px] rounded hover:bg-slate-100 dark:hover:bg-sidebar-main disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ←
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`px-2.5 py-1 min-h-[44px] rounded font-medium ${
                p === page
                  ? 'bg-sidebar-main text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-sidebar-main'
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-2 py-1 min-h-[44px] rounded hover:bg-slate-100 dark:hover:bg-sidebar-main disabled:opacity-40 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}

export function AuditTable({
  entries,
  meta,
  isLoading,
  query,
  onSearch,
  onPageChange,
  onLimitChange,
}: AuditTableProps) {
  const [searchValue, setSearchValue] = useState(query.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(searchValue), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchValue]);

  const inputCls =
    'px-3 py-1.5 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60';

  return (
    <div className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 space-y-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">Registro de Auditoría</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`w-72 ${inputCls}`}
          />
          <label className="flex items-center gap-1 text-sm text-slate-600 dark:text-gray-400">
            Mostrar
            <select
              value={query.limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={inputCls}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            por página
          </label>
        </div>
      </div>

      {/* Tabla */}
      <div className="relative">
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white dark:from-sidebar-hover to-transparent pointer-events-none z-10 lg:hidden" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-sidebar-main/60 border-b border-slate-200 dark:border-white/10">
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Tipo</th>
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Usuario</th>
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium hidden md:table-cell">Correo</th>
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Fecha / Hora</th>
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Reporte</th>
                <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium hidden sm:table-cell">Duración</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500">
                    No hay registros de auditoría
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-sidebar-main/40 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <TipoBadge tipo={entry.tipo} />
                    </td>
                    <td className="px-6 py-3 text-slate-800 dark:text-gray-100 font-medium">
                      {entry.usuario?.nombreCompleto ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-gray-300 hidden md:table-cell">
                      {entry.usuario?.email ?? '—'}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-gray-300">
                      {fmt.format(new Date(entry.fechaHora))}
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-gray-300">
                      {entry.reporte?.titulo ?? (
                        <span className="text-slate-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 hidden sm:table-cell">
                      {entry.duracion != null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sidebar-accent/20 text-[#0d3640] dark:text-sidebar-accent">
                          {formatDuration(entry.duracion)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {meta && meta.totalPages > 0 && (
        <PaginationBar meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
}
