'use client';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({ checked, onChange, disabled = false, size = 'sm' }: ToggleSwitchProps) {
  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={[
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-accent/60 focus:ring-offset-1 dark:focus:ring-offset-sidebar-hover',
        isSmall ? 'h-5 w-10' : 'h-6 w-12',
        checked ? 'bg-sidebar-accent' : 'bg-slate-300 dark:bg-white/20',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
          isSmall ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5',
          checked
            ? isSmall ? 'translate-x-5' : 'translate-x-6'
            : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}
