'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import type { Report } from '@/types/report.types';

interface UseReportsResult {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReports(): UseReportsResult {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<Report[]>('/reports');
      setReports(response.data);
    } catch {
      setError('No se pudieron cargar los reportes. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchReports();
    // Escuchar evento global para refrescar reportes
    const handler = () => fetchReports();
    window.addEventListener('refresh-reports', handler);
    return () => {
      window.removeEventListener('refresh-reports', handler);
    };
  }, [fetchReports]);

  return { reports, isLoading, error, refetch: fetchReports };
}
