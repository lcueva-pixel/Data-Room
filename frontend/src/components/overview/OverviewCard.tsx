import type { LucideIcon } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function OverviewCard({ title, description, icon: Icon, onClick }: OverviewCardProps) {
  return (
    <div
      className="bg-white dark:bg-sidebar-hover rounded-xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-black/30 p-5 hover:shadow-md dark:hover:border-white/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-800 dark:text-gray-100 truncate">{title}</p>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="ml-4 flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 dark:bg-sidebar-accent/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600 dark:text-sidebar-accent" />
        </div>
      </div>
    </div>
  );
}
