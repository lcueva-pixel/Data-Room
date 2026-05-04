'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type {
  Report,
  CreateReportPayload,
  UpdateReportPayload,
  PaginatedReports,
  ReportListQuery,
  ReorderReportsPayload,
} from '@/types/report.types';

export function useAdminReports(initialQuery?: ReportListQuery) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<ReportListQuery>({
    page: 1,
    limit: 5,
    order: 'asc',
    ...initialQuery,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-reports', query],
    queryFn: () =>
      api
        .get<PaginatedReports>('/reports/admin', { params: query })
        .then((r) => r.data),
  });


  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));
  const setLimit = (limit: number) => setQuery((q) => ({ ...q, limit, page: 1 }));

  const setSearch = (search: string) =>
    setQuery((q) => ({ ...q, search: search || undefined, page: 1 }));

  const setSorting = (sortBy: string, order: 'asc' | 'desc') =>
    setQuery((q) => ({ ...q, sortBy, order, page: 1 }));

  const setFilters = (filters: Partial<ReportListQuery>) =>
    setQuery((q) => ({ ...q, ...filters, page: 1 }));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-reports'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateReportPayload) =>
      api.post('/reports', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Reporte creado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al crear reporte');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReportPayload }) =>
      api.put(`/reports/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Reporte actualizado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al actualizar reporte');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) =>
      api.patch<Report>(`/reports/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      window.dispatchEvent(new Event('refresh-reports'));
      toast.success('Estado del reporte actualizado');
    },
    onError: () => {
      toast.error('Error al cambiar estado del reporte');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/reports/${id}`).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Reporte eliminado exitosamente');
    },
    onError: () => {
      toast.error('Error al eliminar reporte');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderReportsPayload) =>
      api.patch('/reports/reorder', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ['admin-reports-flat'] });
      window.dispatchEvent(new Event('refresh-reports'));
      toast.success('Orden actualizado');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al actualizar el orden');
    },
  });

  return {
    reports: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    query,
    setPage,
    setSearch,
    setSorting,
    setFilters,
    setLimit,
    createReport: createMutation.mutateAsync,
    updateReport: (id: number, payload: UpdateReportPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    toggleActivo: toggleMutation.mutateAsync,
    deleteReport: deleteMutation.mutateAsync,
    reorderReports: reorderMutation.mutateAsync,
    refetch,
  };
}

export function useAdminReportsFlat() {
  return useQuery({
    queryKey: ['admin-reports-flat'],
    queryFn: () => api.get<Report[]>('/reports/admin/all-flat').then((r) => r.data),
  });
}
