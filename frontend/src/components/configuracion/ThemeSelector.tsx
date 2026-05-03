'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import clsx from 'clsx';

const OPTIONS = [
  { value: 'light',  label: 'Claro',   icon: Sun,     description: 'Tema diurno con fondos blancos' },
  { value: 'dark',   label: 'Oscuro',  icon: Moon,    description: 'Tema nocturno con fondos navy' },
  { value: 'system', label: 'Sistema', icon: Monitor, description: 'Sigue la preferencia del SO' },
] as const;

type ThemeValue = (typeof OPTIONS)[number]['value'];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Patrón recomendado por next-themes para evitar hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Placeholder con la misma altura para evitar layout shift mientras hidrata.
  if (!mounted) {
    return (
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-sidebar-main border border-slate-200 dark:border-white/10"
        aria-hidden="true"
      >
        {OPTIONS.map((opt) => (
          <div
            key={opt.value}
            className="h-[88px] rounded-lg bg-white/0 dark:bg-white/0"
          />
        ))}
      </div>
    );
  }

  const current = (theme as ThemeValue) ?? 'system';

  const handleKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = OPTIONS[(idx + 1) % OPTIONS.length];
      setTheme(next.value);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = OPTIONS[(idx - 1 + OPTIONS.length) % OPTIONS.length];
      setTheme(prev.value);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label="Selecciona el tema de la interfaz"
      className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-sidebar-main border border-slate-200 dark:border-white/10"
    >
      {OPTIONS.map((opt, idx) => {
        const isActive = current === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={opt.label}
            onClick={() => setTheme(opt.value)}
            onKeyDown={(e) => handleKey(e, idx)}
            tabIndex={isActive ? 0 : -1}
            className={clsx(
              'flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-lg text-sm transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-accent/60',
              isActive
                ? 'bg-white dark:bg-sidebar-hover shadow-sm border border-sidebar-accent/60 text-slate-800 dark:text-gray-100'
                : 'border border-transparent text-slate-500 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-sidebar-hover/60 hover:text-slate-700 dark:hover:text-gray-200',
            )}
          >
            <Icon
              className={clsx(
                'w-5 h-5',
                isActive ? 'text-sidebar-accent' : '',
              )}
            />
            <span className="font-medium">{opt.label}</span>
            <span className="text-xs text-slate-400 dark:text-gray-500 text-center leading-snug">
              {opt.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
