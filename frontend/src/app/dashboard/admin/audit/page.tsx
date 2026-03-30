'use client';

import { useAudit } from '@/hooks/useAudit';
import { AuditTable } from '@/components/admin/AuditTable';

export default function AuditPage() {
  const { entries, isLoading, error, refetch } = useAudit();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Auditoría del Sistema</h1>
        <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
          Historial de accesos de todos los usuarios al portal.
        </p>
      </div>

      <AuditTable
        entries={entries}
        isLoading={isLoading}
        error={error}
        onRefetch={refetch}
      />
    </div>
  );
}
