'use client';

import { useState } from 'react';
import { useAdminReports } from '@/hooks/useAdminReports';
import { ReportTable } from '@/components/admin/ReportTable';
import { ReportForm } from '@/components/admin/ReportForm';
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
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Gestión de Reportes</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          Administra los reportes disponibles en el portal.
        </p>
      </div>

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
