'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import type { Role } from '@/types/user.types';

interface UseRolesResult {
  roles: Role[];
  isLoading: boolean;
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get<Role[]>('/roles')
      .then((res) => setRoles(res.data))
      .catch(() => setRoles([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { roles, isLoading };
}
