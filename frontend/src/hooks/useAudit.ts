'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { PaginatedAudit, AuditListQuery } from '@/types/audit.types';

export function useAudit() {
  const [query, setQuery] = useState<AuditListQuery>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', query],
    queryFn: () =>
      api
        .get<PaginatedAudit>('/audit', { params: query })
        .then((r) => r.data),
  });

  return {
    entries: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    query,
    setPage: (page: number) => setQuery((q) => ({ ...q, page })),
    setSearch: (search: string) =>
      setQuery((q) => ({ ...q, search: search || undefined, page: 1 })),
    setLimit: (limit: number) =>
      setQuery((q) => ({ ...q, limit, page: 1 })),
  };
}
