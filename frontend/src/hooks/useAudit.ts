'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import type { AuditEntry } from '@/types/audit.types';

interface UseAuditResult {
  entries: AuditEntry[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAudit(): UseAuditResult {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api
      .get<AuditEntry[]>('/audit')
      .then((res) => setEntries(res.data))
      .catch(() => setError('No se pudo cargar el registro de auditoría'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return { entries, isLoading, error, refetch: fetchEntries };
}
