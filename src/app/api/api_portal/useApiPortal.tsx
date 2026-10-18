'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiPortalFetch } from '../_shared/apiPortalClient';

/** Avisa a todas las vistas que deben volver a cargar sus datos (después de marcar, aprobar, etc.) */
export const refrescarPortal = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('portal-refrescar')); };

/**
 * Hook base (mismo contrato que los useApi* de Adquisiciones: { data, loading, error }).
 * `path` null = no consultar todavía.
 */
export function useApiPortal<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<string | null>(null);
  const ultimo = useRef(0);

  const cargar = useCallback(async (silencioso = false) => {
    if (!path) return;
    const n = ++ultimo.current;
    const ctrl = new AbortController();
    if (!silencioso) setLoading(true);
    setError(null);
    try {
      const d = await apiPortalFetch<T>(path, { signal: ctrl.signal });
      if (n === ultimo.current) setData(d);
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError' && n === ultimo.current) setError((e as Error).message);
    } finally {
      if (n === ultimo.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => { setData(null); void cargar(); }, [cargar]);
  useEffect(() => {
    const f = () => void cargar(true);
    window.addEventListener('portal-refrescar', f);
    return () => window.removeEventListener('portal-refrescar', f);
  }, [cargar]);

  return { data, loading, error, refetch: cargar };
}
