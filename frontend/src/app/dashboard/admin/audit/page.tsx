'use client';

import { useAudit } from '@/hooks/useAudit';
import { AuditTable } from '@/components/admin/AuditTable';

export default function AuditPage() {
  const { entries, meta, isLoading, query, setPage, setSearch, setLimit } = useAudit();

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
        meta={meta}
        isLoading={isLoading}
        query={query}
        onSearch={setSearch}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}
