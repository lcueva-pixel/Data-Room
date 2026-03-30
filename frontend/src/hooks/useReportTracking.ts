'use client';

import { useEffect, useRef } from 'react';
import { getToken } from '@/lib/auth';

const MIN_DURATION_SECONDS = 3;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export function useReportTracking(reportId: number): void {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    const computeDuration = (): number =>
      Math.round((Date.now() - startTimeRef.current) / 1000);

    const sendDuration = (duration: number): void => {
      if (duration < MIN_DURATION_SECONDS) return;

      const token = getToken();
      const payload = JSON.stringify({ reporteId: reportId, duracion: duration });

      fetch(`${API_URL}/audit/report-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Telemetría silenciosa — los errores de red no deben interrumpir la UI
      });
    };

    // Escenario B: cierre de pestaña o navegador
    const handleBeforeUnload = (): void => {
      sendDuration(computeDuration());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Escenario A: navegación interna (desmontaje del componente o cambio de reporte)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      sendDuration(computeDuration());
    };
  }, [reportId]);
}
