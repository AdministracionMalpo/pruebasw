'use client';
/**
 * Sesión del portal (mismo patrón que Adquisiciones):
 * localStorage: idUsuario, token (usuarioToken de Innova), tokenExpiration, lastActivity.
 * PermisosProvider carga el usuario y sus permisos desde api_portal_malpo (sesion/yo).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SESSION_CONFIG } from '../config/session';
import { useApiYo } from '../api/api_portal/Api_Sesion';
import type { Yo } from '../api/api_portal/tipos';

type UserContextType = {
  idUsuario: string;
  setIdUsuario: (id: string) => void;
  token: string;
  setToken: (token: string) => void;
  isTokenValid: boolean;
  isInitialized: boolean;
  logout: (irAInnova?: boolean) => void;
  lastActivity: Date;
  updateActivity: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const leer = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const guardar = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } };
const borrar = (k: string) => { try { localStorage.removeItem(k); } catch { /* sin almacenamiento */ } };

export function UserProvider({ children }: { children: ReactNode }) {
  const [idUsuario, setIdUsuarioState] = useState('');
  const [token, setTokenState] = useState('');
  const [tokenExpiration, setTokenExpiration] = useState(0);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearSession = useCallback(() => {
    ['idUsuario', 'token', 'tokenExpiration', 'lastActivity'].forEach(borrar);
    setIdUsuarioState(''); setTokenState(''); setTokenExpiration(0); setIsTokenValid(false);
  }, []);

  /** Cierra la sesión. Por defecto vuelve al ingreso del portal; con irAInnova vuelve a master_login. */
  const logout = useCallback((irAInnova = false) => {
    clearSession();
    if (irAInnova) window.location.href = SESSION_CONFIG.LOGOUT_URL;
    else if (window.location.pathname !== '/') window.location.href = '/';
  }, [clearSession]);

  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    guardar('lastActivity', String(now.getTime()));
  }, []);

  useEffect(() => {
    const id = leer('idUsuario'), t = leer('token'), exp = Number(leer('tokenExpiration') || 0), act = Number(leer('lastActivity') || 0);
    const inactivo = act && Date.now() - act > SESSION_CONFIG.SESSION_INACTIVITY_TIME;
    if (t && exp && Date.now() < exp && !inactivo) {
      setIdUsuarioState(id || ''); setTokenState(t); setTokenExpiration(exp); setIsTokenValid(true);
      if (act) setLastActivity(new Date(act));
    } else if (t) {
      clearSession();
    }
    setIsInitialized(true);
  }, [clearSession]);

  // Renovación del vencimiento local mientras la persona usa el portal (igual que Adquisiciones)
  useEffect(() => {
    if (!token || !tokenExpiration) return;
    const it = setInterval(() => {
      const left = tokenExpiration - Date.now();
      if (left <= 0) { setIsTokenValid(false); return; }
      if (left < 5 * 60 * 1000 && Date.now() - lastActivity.getTime() < SESSION_CONFIG.SESSION_INACTIVITY_TIME) {
        const n = Date.now() + SESSION_CONFIG.ACCESS_TOKEN_EXPIRATION;
        setTokenExpiration(n); guardar('tokenExpiration', String(n));
      }
    }, 60_000);
    return () => clearInterval(it);
  }, [token, tokenExpiration, lastActivity]);

  useEffect(() => {
    if (!token) return;
    let t: ReturnType<typeof setTimeout>;
    const f = () => { clearTimeout(t); t = setTimeout(updateActivity, 2000); };
    document.addEventListener('click', f, { passive: true });
    document.addEventListener('keydown', f, { passive: true });
    return () => { clearTimeout(t); document.removeEventListener('click', f); document.removeEventListener('keydown', f); };
  }, [token, updateActivity]);

  // La API respondió 401: el token de Innova ya no es válido
  useEffect(() => {
    const f = () => logout();
    window.addEventListener('portal-sesion-invalida', f);
    return () => window.removeEventListener('portal-sesion-invalida', f);
  }, [logout]);

  const setIdUsuario = useCallback((id: string) => { setIdUsuarioState(id); guardar('idUsuario', id); }, []);
  const setToken = useCallback((nuevo: string) => {
    const exp = Date.now() + SESSION_CONFIG.ACCESS_TOKEN_EXPIRATION;
    setTokenState(nuevo); setTokenExpiration(exp); setIsTokenValid(true);
    guardar('token', nuevo); guardar('tokenExpiration', String(exp));
    const now = new Date(); setLastActivity(now); guardar('lastActivity', String(now.getTime()));
  }, []);

  return (
    <UserContext.Provider value={{ idUsuario, setIdUsuario, token, setToken, isTokenValid, isInitialized, logout, lastActivity, updateActivity }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
}

/* ::::: Permisos (RBAC de api_portal_malpo) ::::: */
export const PERMISO = {
  MARCAR: 1, MIS_DATOS: 2, SOLICITUDES: 3, DOCUMENTOS: 4,
  EQUIPO: 10, APROBAR: 11, TURNOS: 12, REPORTE_EQUIPO: 13,
  ADMIN_USUARIOS: 20, ADMIN_DOCUMENTOS: 21, ADMIN_OBRAS: 22, ADMIN_PERMISOS: 23,
} as const;

interface PermisosContextType {
  usuario: Yo | null;
  permisos: number[];
  puede: (id: number) => boolean;
  loadingPermisos: boolean;
  errorPermisos: string | null;
  refetchPermisos: () => void;
}

const PermisosContext = createContext<PermisosContextType | undefined>(undefined);

export function PermisosProvider({ children }: { children: ReactNode }) {
  const { token, isTokenValid } = useUser();
  const { data, loading, error, refetch } = useApiYo(!!token && isTokenValid);
  const permisos = useMemo(() => data?.permisos || [], [data]);
  const puede = useCallback((id: number) => !!data && (data.es_admin || permisos.includes(id)), [data, permisos]);
  return (
    <PermisosContext.Provider value={{ usuario: data, permisos, puede, loadingPermisos: loading, errorPermisos: error, refetchPermisos: () => void refetch(true) }}>
      {children}
    </PermisosContext.Provider>
  );
}

export function usePermisos() {
  const ctx = useContext(PermisosContext);
  if (!ctx) throw new Error('usePermisos debe usarse dentro de PermisosProvider');
  return ctx;
}
