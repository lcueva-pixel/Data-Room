'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { saveSession, clearSession, getToken, getRolId } from '@/lib/auth';
import type { LoginCredentials, SessionUser } from '@/types/auth.types';

interface AuthContextValue {
  session: SessionUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Restaurar sesión desde cookies al montar
  useEffect(() => {
    const token = getToken();
    const rolId = getRolId();
    if (token && rolId !== null) {
      setSession({ access_token: token, rol_id: rolId });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data;
    saveSession(data);
    setSession({ access_token: data.access_token, rol_id: data.rol_id });
    router.push('/dashboard/overview');
  }, [router]);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ session, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
