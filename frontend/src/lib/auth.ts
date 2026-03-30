'use client';

import Cookies from 'js-cookie';
import type { LoginResponse } from '@/types/auth.types';

const TOKEN_KEY = 'access_token';
const ROL_KEY = 'rol_id';
const EXPIRY_DAYS = 1 / 3; // 8 horas

export const saveSession = (data: LoginResponse): void => {
  Cookies.set(TOKEN_KEY, data.access_token, { expires: EXPIRY_DAYS });
  Cookies.set(ROL_KEY, String(data.rol_id), { expires: EXPIRY_DAYS });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const getRolId = (): number | null => {
  const val = Cookies.get(ROL_KEY);
  return val ? parseInt(val, 10) : null;
};

export const clearSession = (): void => {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(ROL_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
