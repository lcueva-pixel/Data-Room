'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

const MIN_DURATION_SECONDS = 3;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useReportTracking(reportId: number): void {
  const startTimeRef = useRef<number>(Date.now());
  const { data: session } = useSession();
  const tokenRef = useRef<string | undefined>(undefined);

  // Mantener el token actualizado en un ref para acceso sincrono en beforeunload
  useEffect(() => {
    tokenRef.current = (session as any)?.backendToken;
  }, [session]);

  useEffect(() => {
    startTimeRef.current = Date.now();

    const computeDuration = (): number =>
      Math.round((Date.now() - startTimeRef.current) / 1000);

    const sendDuration = (duration: number): void => {
      if (duration < MIN_DURATION_SECONDS) return;

      const token = tokenRef.current;
      const payload = JSON.stringify({ reporteId: reportId, duracion: duration });

      fetch(`${API_URL}/audit/report-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    };

    const handleBeforeUnload = (): void => {
      sendDuration(computeDuration());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendDuration(computeDuration());
    };
  }, [reportId]);
}
