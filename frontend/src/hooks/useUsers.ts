'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/lib/axios';
import type {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  PaginatedUsers,
  UserListQuery,
} from '@/types/user.types';

export function useUsers(initialQuery?: UserListQuery) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState<UserListQuery>({
    page: 1,
    limit: 10,
    order: 'asc',
    ...initialQuery,
  });

  const { data, isLoading: isLoadingList, refetch } = useQuery({
    queryKey: ['admin-users', query],
    queryFn: () =>
      api
        .get<PaginatedUsers>('/users', { params: query })
        .then((r) => r.data),
  });

  const setPage = (page: number) => setQuery((q) => ({ ...q, page }));

  const setSearch = (search: string) =>
    setQuery((q) => ({ ...q, search: search || undefined, page: 1 }));

  const setSorting = (sortBy: string, order: 'asc' | 'desc') =>
    setQuery((q) => ({ ...q, sortBy, order, page: 1 }));

  const setFilters = (filters: Partial<UserListQuery>) =>
    setQuery((q) => ({ ...q, ...filters, page: 1 }));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) =>
      api.post('/users', payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario creado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al crear usuario');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateUserPayload }) =>
      api.put(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Usuario actualizado exitosamente');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Error al actualizar usuario');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) =>
      api.patch<User>(`/users/${id}/toggle`).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      toast.success('Estado del usuario actualizado');
    },
    onError: () => {
      toast.error('Error al cambiar estado del usuario');
    },
  });

  return {
    users: data?.data ?? [],
    meta: data?.meta,
    isLoadingList,
    query,
    setPage,
    setSearch,
    setSorting,
    setFilters,
    createUser: createMutation.mutateAsync,
    updateUser: (id: number, payload: UpdateUserPayload) =>
      updateMutation.mutateAsync({ id, payload }),
    toggleActivo: toggleMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    refetch,
    // backward-compat
    success: createMutation.isSuccess,
    reset: () => queryClient.resetQueries({ queryKey: ['admin-users'] }),
  };
}
