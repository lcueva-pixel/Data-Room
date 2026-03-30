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
      className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-800 truncate">{title}</p>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
        </div>
        <div className="ml-4 flex-shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
