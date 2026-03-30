'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { ChevronRight, UserCircle2, LogOut, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  activeTitle: string;
  rolId: number | null;
  onLogout: () => void;
}

const ROL_LABELS: Record<number, string> = {
  1: 'Administrador',
  2: 'Empleado',
};

export function TopBar({ activeTitle, rolId, onLogout }: TopBarProps) {
  const rolLabel = rolId ? (ROL_LABELS[rolId] ?? 'Usuario') : 'Usuario';
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';

  return (
    <header className="h-16 flex-shrink-0 bg-white dark:bg-sidebar-hover border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="text-slate-400 dark:text-gray-500">Dashboard</span>
        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-gray-600" />
        <span className="text-slate-700 dark:text-gray-100 font-medium">{activeTitle}</span>
      </nav>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        {/* Toggle theme */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-400 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-sidebar-main hover:text-sidebar-accent dark:hover:text-sidebar-accent transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        {/* Info de usuario */}
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
          <UserCircle2 className="w-5 h-5 text-slate-400 dark:text-gray-500" />
          <span className="font-medium">{rolLabel}</span>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
}
