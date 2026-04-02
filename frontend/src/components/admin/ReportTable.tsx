'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Plus, Pencil, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Report, ReportListQuery } from '@/types/report.types';
import type { PaginatedMeta } from '@/types/user.types';

interface ReportTableProps {
  reports: Report[];
  meta?: PaginatedMeta;
  isLoading: boolean;
  query: ReportListQuery;
  onSearch: (search: string) => void;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
  onFilterActivo: (activo?: boolean) => void;
  onLimitChange: (limit: number) => void;
  onNew: () => void;
  onEdit: (report: Report) => void;
  onToggleActivo: (report: Report) => void;
}

const columnHelper = createColumnHelper<Report>();

function SortIcon({ column, query }: { column: string; query: ReportListQuery }) {
  if (query.sortBy !== column) return <ChevronsUpDown className="w-3.5 h-3.5 ml-1 text-slate-400 dark:text-gray-500" />;
  return query.order === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-sidebar-accent" />
    : <ChevronDown className="w-3.5 h-3.5 ml-1 text-sidebar-accent" />;
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
        Mostrando {from}–{to} de {total} reportes
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-sidebar-main disabled:opacity-40 disabled:cursor-not-allowed"
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
              className={`px-2.5 py-1 rounded font-medium ${
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
          className="px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-sidebar-main disabled:opacity-40 disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}

export function ReportTable({
  reports,
  meta,
  isLoading,
  query,
  onSearch,
  onPageChange,
  onSortChange,
  onFilterActivo,
  onLimitChange,
  onNew,
  onEdit,
  onToggleActivo,
}: ReportTableProps) {
  const [searchValue, setSearchValue] = useState(query.search ?? '');
  const [confirmReport, setConfirmReport] = useState<Report | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearch(searchValue), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchValue]);

  const handleSort = (col: string) => {
    const nextOrder =
      query.sortBy === col && query.order === 'asc' ? 'desc' : 'asc';
    onSortChange(col, nextOrder);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => <span className="text-slate-400 dark:text-gray-500">{info.getValue()}</span>,
      }),
      columnHelper.accessor('titulo', {
        header: 'Título',
        cell: (info) => {
          const report = info.row.original;
          const childCount = report._count?.children ?? 0;
          return (
            <div className="flex items-center gap-2">
              {report.padreId && (
                <span className="text-sidebar-accent text-xs">↳</span>
              )}
              <span className={
                report.padreId
                  ? 'text-slate-600 dark:text-gray-300'
                  : 'font-medium text-slate-800 dark:text-gray-100'
              }>
                {info.getValue()}
              </span>
              {childCount > 0 && (
                <span className="text-[10px] bg-sidebar-accent/20 text-sidebar-accent px-1.5 py-0.5 rounded-full">
                  {childCount} sub
                </span>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor('reportesRoles', {
        header: 'Roles',
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue().length === 0 ? (
              <span className="text-slate-400 dark:text-gray-500 text-xs">Sin roles</span>
            ) : (
              info.getValue().map((rr) => (
                <span
                  key={rr.rolId}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#e0f7fa] text-[#0d3640] dark:bg-sidebar-accent/20 dark:text-sidebar-accent"
                >
                  {rr.rol.rolDescripcion}
                </span>
              ))
            )}
          </div>
        ),
      }),
      columnHelper.accessor('activo', {
        header: 'Estado',
        cell: (info) => (
          <ToggleSwitch
            checked={info.getValue()}
            onChange={() => setConfirmReport(info.row.original)}
          />
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => (
          <button
            onClick={() => onEdit(info.row.original)}
            className="p-1.5 text-slate-400 dark:text-gray-500 hover:text-sidebar-accent hover:bg-sidebar-accent/10 rounded transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
        ),
      }),
    ],
    [onEdit, onToggleActivo],
  );

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: meta?.totalPages ?? -1,
  });

  const thBase = 'px-6 py-3 text-left text-slate-500 dark:text-gray-400 font-medium text-sm';
  const thSortable = `${thBase} cursor-pointer select-none hover:text-slate-700 dark:hover:text-gray-200`;

  const inputCls =
    'px-3 py-1.5 border border-slate-300 dark:border-white/20 rounded-lg text-sm bg-white dark:bg-sidebar-main text-slate-700 dark:text-gray-200 placeholder:text-slate-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60';

  return (
    <div className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
      {/* Cabecera + controles */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800 dark:text-gray-100">Listado de Reportes</h2>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-sidebar-main text-white text-sm rounded-lg hover:bg-sidebar-hover hover:ring-1 hover:ring-sidebar-accent/60 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nuevo Reporte
          </button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por título o descripción..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`w-72 ${inputCls}`}
          />
          <select
            value={query.activo === undefined ? '' : String(query.activo)}
            onChange={(e) =>
              onFilterActivo(
                e.target.value === '' ? undefined : e.target.value === 'true',
              )
            }
            className={inputCls}
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          {/* Selector de cantidad por página */}
          <label className="flex items-center gap-1 text-sm text-slate-600 dark:text-gray-400">
            Mostrar
            <select
              value={query.limit}
              onChange={e => onLimitChange(Number(e.target.value))}
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 dark:bg-sidebar-main/60 border-b border-slate-200 dark:border-white/10">
              {table.getHeaderGroups().map((hg) =>
                hg.headers.map((header) => {
                  const isSortable = header.id === 'titulo';
                  return (
                    <th
                      key={header.id}
                      className={isSortable ? thSortable : thBase}
                      onClick={isSortable ? () => handleSort(header.id) : undefined}
                    >
                      <span className="inline-flex items-center">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {isSortable && <SortIcon column={header.id} query={query} />}
                      </span>
                    </th>
                  );
                }),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-white/5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 dark:text-gray-500">
                  No se encontraron reportes con los filtros aplicados
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-sidebar-main/40 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {meta && meta.totalPages > 0 && (
        <PaginationBar meta={meta} onPageChange={onPageChange} />
      )}

      {/* Dialogo de confirmacion */}
      <ConfirmDialog
        isOpen={!!confirmReport}
        title="Confirmar cambio de estado"
        message={
          confirmReport
            ? `¿Deseas ${confirmReport.activo ? 'desactivar' : 'activar'} el reporte "${confirmReport.titulo}"?`
            : ''
        }
        confirmLabel={confirmReport?.activo ? 'Desactivar' : 'Activar'}
        variant={confirmReport?.activo ? 'danger' : 'warning'}
        onConfirm={() => {
          if (confirmReport) onToggleActivo(confirmReport);
          setConfirmReport(null);
        }}
        onCancel={() => setConfirmReport(null)}
      />
    </div>
  );
}
