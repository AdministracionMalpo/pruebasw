'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import { useUser, usePermisos } from '@/contexts/UserContext';

/** Igual que en Adquisiciones: sin sesión válida vuelve al ingreso. Si llega ?token= lo procesa el ingreso. */
export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isInitialized, isTokenValid, token, logout } = useUser();
  const { usuario, errorPermisos } = usePermisos();
  const params = useSearchParams();
  const tokenUrl = params.get('token');

  useEffect(() => {
    if (tokenUrl) { window.location.replace('/?token=' + encodeURIComponent(tokenUrl)); return; }
    if (isInitialized && (!token || !isTokenValid)) logout();
  }, [isInitialized, token, isTokenValid, logout, tokenUrl]);

  if (errorPermisos && !usuario) {
    return (
      <div className="boot"><div className="login-card" style={{ textAlign: 'center' }}>
        <h2>No pudimos cargar tu cuenta</h2><p className="muted">{errorPermisos}</p>
        <div className="row" style={{ justifyContent: 'center' }}><button className="btn" onClick={() => location.reload()}>Reintentar</button><button className="btn primary" onClick={() => logout()}>Volver a ingresar</button></div>
      </div></div>
    );
  }
  if (!isInitialized || !token || !isTokenValid || !usuario) {
    return <div className="boot"><Spinner color="danger" label="Verificando sesión…" /></div>;
  }
  return <>{children}</>;
}
