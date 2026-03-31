'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/app/sidebar-scrollbar.css';
import { usePathname } from 'next/navigation';
import { BarChart2, LogOut, Settings, ShieldCheck, ClipboardList, Users, LayoutDashboard, X, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { Report } from '@/types/report.types';

interface SidebarProps {
  reports: Report[];
  isLoading: boolean;
  selectedReport: Report | null;
  onReportSelect: (report: Report) => void;
  onLogout: () => void;
  rolId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_BASE =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border-l-4';

const NAV_ACTIVE =
  'bg-sidebar-hover border-l-sidebar-accent text-white font-semibold';

const NAV_INACTIVE =
  'text-gray-400 border-l-transparent hover:bg-sidebar-hover hover:border-l-sidebar-accent hover:text-white';

// ── Helpers: verificar si un hijo está seleccionado ──────────────────
function hasSelectedChild(report: Report, selectedId: number | undefined): boolean {
  if (!selectedId || !report.children) return false;
  for (const child of report.children) {
    if (child.id === selectedId) return true;
    if (hasSelectedChild(child, selectedId)) return true;
  }
  return false;
}

// ── Componente recursivo para reportes con hijos ──────────────────────
function SidebarReportItem({
  report,
  selectedReport,
  onSelect,
  expandedIds,
  setExpanded,
  depth = 0,
}: {
  report: Report;
  selectedReport: Report | null;
  onSelect: (r: Report) => void;
  expandedIds: Set<number>;
  setExpanded: (id: number, open: boolean) => void;
  depth?: number;
}) {
  const hasChildren = report.children && report.children.length > 0;
  const isExpanded = expandedIds.has(report.id);
  const isActive = selectedReport?.id === report.id;
  const childSelected = hasSelectedChild(report, selectedReport?.id);

  return (
    <div
      onMouseEnter={() => { if (hasChildren) setExpanded(report.id, true); }}
      onMouseLeave={() => {
        // No colapsar si un hijo está seleccionado
        if (hasChildren && !childSelected && !isActive) setExpanded(report.id, false);
      }}
    >
      <button
        onClick={() => onSelect(report)}
        className={clsx(NAV_BASE, 'w-full text-left', isActive ? NAV_ACTIVE : NAV_INACTIVE)}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        <BarChart2 className={clsx('flex-shrink-0', depth > 0 ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        <span className="truncate flex-1">{report.titulo}</span>
        {hasChildren && (
          <ChevronDown
            className={clsx(
              'w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0',
              isExpanded && 'rotate-180',
            )}
          />
        )}
      </button>

      {hasChildren && isExpanded && (
        <div className="border-l border-white/10 ml-5">
          {report.children!.map((child) => (
            <SidebarReportItem
              key={child.id}
              report={child}
              selectedReport={selectedReport}
              onSelect={onSelect}
              expandedIds={expandedIds}
              setExpanded={setExpanded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar principal ─────────────────────────────────────────────────
export function Sidebar({
  reports,
  isLoading,
  selectedReport,
  onReportSelect,
  onLogout,
  rolId,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = rolId === 1;

  // ── Acordeón ────────────────────────────────────────────────────────
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const setExpanded = (id: number, open: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Auto-expandir todos los ancestros del reporte seleccionado
  useEffect(() => {
    if (!selectedReport) return;
    const idsToExpand: number[] = [];
    const findAncestors = (items: Report[], targetId: number): boolean => {
      for (const r of items) {
        if (r.id === targetId) return true;
        if (r.children?.length && findAncestors(r.children, targetId)) {
          idsToExpand.push(r.id);
          return true;
        }
      }
      return false;
    };
    findAncestors(reports, selectedReport.id);
    if (idsToExpand.length > 0) {
      setExpandedIds((prev) => new Set([...prev, ...idsToExpand]));
    }
  }, [selectedReport, reports]);

  const adminLinks = [
    { href: '/dashboard/admin/reports', label: 'Gestión de Reportes', icon: ClipboardList },
    { href: '/dashboard/admin/audit',   label: 'Auditoría',           icon: ShieldCheck  },
    { href: '/dashboard/admin/users',   label: 'Usuarios',            icon: Users        },
  ];

  const handleReportSelect = (report: Report) => {
    onReportSelect(report);
    onClose();
  };

  return (
    <>
      {/* ── Overlay (solo móvil) ─────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={clsx(
          'w-60 bg-sidebar-main flex flex-col h-full flex-shrink-0',
          'fixed z-50 top-0 left-0 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:translate-x-0',
        )}
      >
        {/* ── Logo + Close ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src="/cex_logo.png" alt="Logo" className="w-9 h-9 rounded-lg object-contain" />
            <p className="text-white font-bold text-sm tracking-wider">DATA ROOM</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Navegación ───────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scrollbar">

          {/* Overview */}
          <Link
            href="/dashboard/overview"
            onClick={onClose}
            className={clsx(
              NAV_BASE, 'mb-3',
              pathname === '/dashboard/overview' ? NAV_ACTIVE : NAV_INACTIVE,
            )}
          >
            <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
            <span>Overview</span>
          </Link>

          {/* Sección: Reportes */}
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-2 mb-3">
            Reportes
          </p>

          {isLoading ? (
            <div className="space-y-2">
              {[90, 70, 85, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-9 rounded-lg bg-white/10 animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-gray-500 text-xs px-2 py-3">Sin reportes disponibles</p>
          ) : (
            reports.map((report) => (
              <SidebarReportItem
                key={report.id}
                report={report}
                selectedReport={selectedReport}
                onSelect={handleReportSelect}
                expandedIds={expandedIds}
                setExpanded={setExpanded}
              />
            ))
          )}

          {/* Sección: Administración — solo admin */}
          {isAdmin && (
            <>
              <div className="border-t border-white/10 my-3" />
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-widest px-2 mb-3">
                Administración
              </p>
              {adminLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={clsx(
                    NAV_BASE,
                    pathname === href ? NAV_ACTIVE : NAV_INACTIVE,
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* ── Zona inferior ────────────────────────────────────────── */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <button className={clsx(NAV_BASE, 'w-full', NAV_INACTIVE)}>
            <Settings className="w-4 h-4" />
            <span>Configuración</span>
          </button>
          <button
            onClick={onLogout}
            className={clsx(
              NAV_BASE,
              'w-full text-gray-400 border-transparent',
              'hover:bg-red-900/40 hover:border-red-500/60 hover:text-red-400',
            )}
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
