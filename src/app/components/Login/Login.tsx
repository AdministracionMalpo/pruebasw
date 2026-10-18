'use client';
/**
 * Ingreso con la cuenta de Innova (mismo flujo que Adquisiciones):
 *  - Si llega ?token= desde master_login → /api/auth/validate-token (registra la sesión en esta plataforma).
 *  - Si no, usuario + contraseña → /api/auth/login (api_maestra) y luego validate-token.
 */
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Icono } from '@/components/ui/Icono';
import { registrarIngreso } from '@/api/api_portal/Api_Sesion';
import { SESSION_CONFIG } from '@/config/session';

export default function Login() {
  const params = useSearchParams();
  const tokenUrl = params.get('token');
  const router = useRouter();
  const { setIdUsuario, setToken } = useUser();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(!!tokenUrl);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);

  const validar = async (tok: string, registrarPlataforma: boolean) => {
    const r = await fetch('/api/auth/validate-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tok, registrarPlataforma }) });
    const p = await r.json().catch(() => ({}));
    if (!r.ok || !p?.isValid || !p?.datos?.idusuario) return false;
    setIdUsuario(String(p.datos.idusuario));
    setToken(tok);
    return true;
  };

  const entrar = async () => {
    // Si la persona no tiene acceso a esta plataforma, la API lo dirá aquí mismo
    try { await registrarIngreso(); } catch (e) {
      try { ['idUsuario', 'token', 'tokenExpiration', 'lastActivity'].forEach(k => localStorage.removeItem(k)); } catch { /* */ }
      setCargando(false); setError((e as Error).message); return;
    }
    setListo(true);
    setTimeout(() => router.replace('/pages/inicio'), 900);
  };

  useEffect(() => {
    if (!tokenUrl) return;
    (async () => {
      const ok = await validar(tokenUrl, true);
      window.history.replaceState({}, document.title, window.location.pathname);
      if (ok) await entrar(); else { setCargando(false); setError('El enlace de Innova no es válido o la sesión expiró. Ingresa con tu usuario.'); }
    })();
  }, [tokenUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!usuario.trim() || !password) { setError('Ingresa tu usuario y contraseña de Innova.'); return; }
    setError(''); setCargando(true);
    try {
      const r = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: usuario.trim(), password }) });
      const p = await r.json().catch(() => ({}));
      const tok = p?.datos?.usuarioToken;
      if (!r.ok || !p?.ok || !tok) throw new Error(p?.mensaje || 'No se pudo iniciar sesión.');
      if (!(await validar(tok, false))) throw new Error('Tu usuario no tiene acceso al Portal Malpo. Pide acceso a Recursos Humanos.');
      await entrar();
    } catch (err) {
      setCargando(false);
      setError((err as Error).message);
    }
  };

  return (
    <div className="login">
      <section className="login-brand">
        <div>
          <img src="/logo-malpo.png" alt="Malpo Constructora e Inmobiliaria" width={320} height={46} />
          <h2>Portal del trabajador</h2>
          <p>Marca tu asistencia, revisa tus horas y haz tus solicitudes desde la obra o desde tu casa.</p>
          <ul className="login-feats">
            <li><span><Icono n="finger" s={18} /></span><div><b>Marcación con comprobante</b><small>Hora oficial del servidor y verificación pública.</small></div></li>
            <li><span><Icono n="inbox" s={18} /></span><div><b>Solicitudes en línea</b><small>Vacaciones, permisos y horas extra con aprobación de tu jefatura.</small></div></li>
            <li><span><Icono n="doc" s={18} /></span><div><b>Documentos y firma</b><small>Liquidaciones y contratos con firma electrónica simple.</small></div></li>
          </ul>
        </div>
        <p className="hint login-copy">© 2026 Malpo SpA. Todos los derechos reservados.</p>
        <div className="bars" aria-hidden="true"><i /><i /><i /></div>
      </section>
      <section className="login-form">
        {listo ? (
          <div className="login-card" style={{ alignItems: 'center', textAlign: 'center' }}>
            <div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div>
            <h2>Ingreso correcto</h2><p className="muted">Preparando tu portal…</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="login-card login-panel">
            <div><div className="label">Constructora Malpo SpA</div><h1>Ingresar</h1><p className="muted" style={{ marginTop: 6 }}>Usa tu usuario y contraseña de Innova.</p></div>
            <div className="field"><label htmlFor="usuario">Usuario</label><input id="usuario" value={usuario} onChange={e => setUsuario(e.target.value)} autoComplete="username" placeholder="Tu usuario de Innova" disabled={cargando} required /></div>
            <div className="field"><label htmlFor="clave">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input id="clave" type={ver ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" disabled={cargando} required style={{ paddingRight: 44 }} />
                <button type="button" className="btn sm" onClick={() => setVer(v => !v)} aria-label={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'} style={{ position: 'absolute', right: 4, top: 4, padding: '5px 8px' }}><Icono n={ver ? 'lock' : 'eye'} s={16} /></button>
              </div>
            </div>
            {error && <p className="err" role="alert">{error}</p>}
            <button className={'btn primary big' + (cargando ? ' loading' : '')} disabled={cargando}>{tokenUrl && cargando ? 'Verificando sesión…' : 'Ingresar'}</button>
            <p className="hint">¿Olvidaste tu contraseña? Se cambia en Innova.</p>
            <div className="login-links">
              <a className="link" href="/verificar"><Icono n="shield" s={15} /> Verificar un comprobante</a>
              <a className="link" href={SESSION_CONFIG.LOGOUT_URL}><Icono n="home" s={15} /> Volver a Innova</a>
            </div>
            <p className="hint login-copy-movil">© 2026 Malpo SpA. Todos los derechos reservados.</p>
          </form>
        )}
      </section>
    </div>
  );
}
