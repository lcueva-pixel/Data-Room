'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const sessionError = (session as any)?.error as string | undefined;

  useEffect(() => {
    if (status === 'authenticated' && sessionError === 'RefreshAccessTokenError') {
      signOut({ callbackUrl: '/login' });
    }
  }, [sessionError, status]);

  return <>{children}</>;
}
