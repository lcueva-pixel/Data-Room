'use client';

import { useState } from 'react';
import { Plus, Pencil, ChevronRight } from 'lucide-react';
import { useChildReports } from '@/hooks/useChildReports';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Modal } from '@/components/ui/Modal';
import { ReportForm } from '@/components/admin/ReportForm';
import type { Report } from '@/types/report.types';

interface ChildReportsSectionProps {
  parentId: number;
  parentTitle: string;
}

export function ChildReportsSection({ parentId, parentTitle }: ChildReportsSectionProps) {
  const { children, isLoading } = useChildReports(parentId);
  const [showChildForm, setShowChildForm] = useState(false);
  const [editingChild, setEditingChild] = useState<Report | null>(null);

  const handleNewChild = () => {
    setEditingChild(null);
    setShowChildForm(true);
  };

  const handleEditChild = (child: Report) => {
    setEditingChild(child);
    setShowChildForm(true);
  };

  const handleChildSuccess = () => {
    setShowChildForm(false);
    setEditingChild(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">
          Sub-reportes vinculados
        </h3>
        <button
          type="button"
          onClick={handleNewChild}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sidebar-main text-white rounded-lg hover:bg-sidebar-hover hover:ring-1 hover:ring-sidebar-accent/60 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar Sub-reporte
        </button>
      </div>

      {/* Lista de hijos */}
      <div className="border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
            ))}
          </div>
        ) : children.length === 0 ? (
          <p className="px-4 py-6 text-center text-slate-400 dark:text-gray-500 text-sm">
            Este reporte no tiene sub-reportes.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/5">
            {children.map((child) => (
              <li
                key={child.id}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-sidebar-main/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <ChevronRight className="w-3.5 h-3.5 text-sidebar-accent flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-gray-200 truncate">
                    {child.titulo}
                  </span>
                  {(child._count?.children ?? 0) > 0 && (
                    <span className="text-[10px] bg-sidebar-accent/20 text-sidebar-accent px-1.5 py-0.5 rounded-full flex-shrink-0">
                      {child._count!.children} sub
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ToggleSwitch checked={child.activo} onChange={() => {}} disabled size="sm" />
                  <button
                    type="button"
                    onClick={() => handleEditChild(child)}
                    className="p-1 text-slate-400 dark:text-gray-500 hover:text-sidebar-accent hover:bg-sidebar-accent/10 rounded transition-colors"
                    title="Editar sub-reporte"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal para crear/editar sub-reporte */}
      <Modal
        isOpen={showChildForm}
        onClose={() => { setShowChildForm(false); setEditingChild(null); }}
        title={editingChild ? `Editar: ${editingChild.titulo}` : `Nuevo sub-reporte de "${parentTitle}"`}
      >
        <ReportForm
          initialValues={editingChild ?? undefined}
          lockedParentId={editingChild ? undefined : parentId}
          onSuccess={handleChildSuccess}
          onCancel={() => { setShowChildForm(false); setEditingChild(null); }}
        />
      </Modal>
    </div>
  );
}
