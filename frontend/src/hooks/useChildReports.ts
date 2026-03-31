'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import type { Report, CreateReportPayload } from '@/types/report.types';

export function useChildReports(parentId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['report-children', parentId],
    queryFn: () =>
      api.get<Report[]>(`/reports/${parentId}/children`).then((r) => r.data),
  });

  const createChild = useMutation({
    mutationFn: (payload: CreateReportPayload) =>
      api.post('/reports', { ...payload, padreId: parentId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-children', parentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    },
  });

  return {
    children: data ?? [],
    isLoading,
    createChild: createChild.mutateAsync,
  };
}
