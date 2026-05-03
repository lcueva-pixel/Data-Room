'use client';

import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { useAdminReports } from '@/hooks/useAdminReports';
import { ReportTable } from '@/components/admin/ReportTable';
import { ReportForm } from '@/components/admin/ReportForm';
import { ReportReorderView } from '@/components/admin/ReportReorderView';
import { Modal } from '@/components/ui/Modal';
import type { Report } from '@/types/report.types';

export default function AdminReportsPage() {
  const {
    reports,
    meta,
    isLoading,
    query,
    setSearch,
    setPage,
    setSorting,
    setFilters,
    toggleActivo,
    setLimit,
  } = useAdminReports();

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reorderMode, setReorderMode] = useState(false);

  const handleNew = () => {
    setEditingReport(null);
    setShowForm(true);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingReport(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingReport(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Gestión de Reportes</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            Administra los reportes disponibles en el portal.
          </p>
        </div>
        {!reorderMode && (
          <button
            type="button"
            onClick={() => setReorderMode(true)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-white/20 rounded-lg text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-sidebar-main transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Reordenar
          </button>
        )}
      </div>

      {reorderMode ? (
        <ReportReorderView onClose={() => setReorderMode(false)} />
      ) : (
        <ReportTable
          reports={reports}
          meta={meta}
          isLoading={isLoading}
          query={query}
          onSearch={setSearch}
          onPageChange={setPage}
          onSortChange={setSorting}
          onFilterActivo={(activo) => setFilters({ activo })}
          onLimitChange={setLimit}
          onNew={handleNew}
          onEdit={handleEdit}
          onToggleActivo={(report) => toggleActivo(report.id)}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCancel}
        title={editingReport ? `Editar: ${editingReport.titulo}` : 'Nuevo Reporte'}
        maxWidth={editingReport ? 'lg' : 'md'}
      >
        <ReportForm
          initialValues={editingReport ?? undefined}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Modal>
    </div>
  );
}
