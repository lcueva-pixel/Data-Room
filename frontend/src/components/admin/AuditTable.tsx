'use client';

import { RefreshCw, LogIn, Monitor } from 'lucide-react';
import type { AuditEntry } from '@/types/audit.types';

interface AuditTableProps {
  entries: AuditEntry[];
  isLoading: boolean;
  error: string | null;
  onRefetch: () => void;
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

export function AuditTable({ entries, isLoading, error, onRefetch }: AuditTableProps) {
  return (
    <div className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Cabecera */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
        <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">Registro de Auditoría</h2>
        <button
          onClick={onRefetch}
          className="flex items-center gap-2 px-3 py-1.5 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main hover:border-sidebar-accent/60 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-sidebar-main/60 border-b border-slate-200 dark:border-white/10">
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Tipo</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Usuario</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Correo</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Fecha / Hora</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Reporte</th>
              <th className="text-left px-6 py-3 text-slate-500 dark:text-gray-400 font-medium">Duración</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-red-500 dark:text-red-400">
                  {error}
                </td>
              </tr>
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
                  <td className="px-6 py-3 text-slate-600 dark:text-gray-300">
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
                  <td className="px-6 py-3">
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
  );
}
