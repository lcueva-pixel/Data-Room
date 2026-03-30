'use client';

import Link from 'next/link';
import '@/app/sidebar-scrollbar.css';
import { usePathname } from 'next/navigation';
import { BarChart2, LogOut, Settings, ShieldCheck, ClipboardList, Users, LayoutDashboard } from 'lucide-react';
import clsx from 'clsx';
import type { Report } from '@/types/report.types';

interface SidebarProps {
  reports: Report[];
  isLoading: boolean;
  selectedReport: Report | null;
  onReportSelect: (report: Report) => void;
  onLogout: () => void;
  rolId: number | null;
}

// Clases base compartidas por todos los ítems de navegación.
// border-l-4 siempre presente → previene layout shift al activarse el acento.
const NAV_BASE =
  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors border-l-4';

const NAV_ACTIVE =
  'bg-sidebar-hover border-l-sidebar-accent text-white font-semibold';

const NAV_INACTIVE =
  'text-gray-400 border-l-transparent hover:bg-sidebar-hover hover:border-l-sidebar-accent hover:text-white';

export function Sidebar({
  reports,
  isLoading,
  selectedReport,
  onReportSelect,
  onLogout,
  rolId,
}: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = rolId === 1;

  const adminLinks = [
    { href: '/dashboard/admin/reports', label: 'Gestión de Reportes', icon: ClipboardList },
    { href: '/dashboard/admin/audit',   label: 'Auditoría',           icon: ShieldCheck  },
    { href: '/dashboard/admin/users',   label: 'Usuarios',            icon: Users        },
  ];

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar-main flex flex-col h-full">

      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <img
          src="/cex_logo.png"
          alt="Logo"
          className="w-9 h-9 rounded-lg object-contain"
        />
        <p className="text-white font-bold text-sm tracking-wider">DATA ROOM</p>
      </div>

      {/* ── Navegación ───────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 sidebar-scrollbar">

        {/* Overview */}
        <Link
          href="/dashboard/overview"
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
            <button
              key={report.id}
              onClick={() => onReportSelect(report)}
              className={clsx(
                NAV_BASE, 'w-full text-left',
                selectedReport?.id === report.id ? NAV_ACTIVE : NAV_INACTIVE,
              )}
            >
              <BarChart2 className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{report.titulo}</span>
            </button>
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

      {/* ── Zona inferior ────────────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          className={clsx(NAV_BASE, 'w-full', NAV_INACTIVE)}
        >
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
  );
}
