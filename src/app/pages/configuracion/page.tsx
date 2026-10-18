'use client';
import { usePermisos } from '@/contexts/UserContext';
import { TemaSelector } from '@/contexts/ThemeContext';
import { SESSION_CONFIG } from '@/config/session';
import { formatearRut } from '@/libs/rut';
import { Preferencia } from '@/components/Acciones';
import { Cabecera } from '@/components/ui/ui';

export default function Configuracion() {
  const { usuario: u } = usePermisos();
  if (!u) return null;
  let j: Record<string, [string, string]> = {};
  try { j = u.jornada ? JSON.parse(u.jornada.horario) : {}; } catch { j = {}; }
  return <>
    <Cabecera titulo="Configuración" sub="Apariencia, avisos y datos de tu cuenta." />
    <div className="grid g2">
      <section className="panel"><h3>Tu cuenta</h3>
        <div className="stack" style={{ gap: 6, fontSize: '.92rem' }}>
          <div><span className="muted">Usuario Innova:</span> @{u.usuario}</div>
          <div><span className="muted">RUT:</span> {formatearRut(u.rut)}</div>
          <div><span className="muted">Correo:</span> {u.email}</div>
          <div><span className="muted">Cargo:</span> {u.cargo} · {u.perfiles.map(p => p.nombre).join(', ') || 'Trabajador'}</div>
          {u.obra && <div><span className="muted">Obra:</span> {u.obra.nombre} · {u.obra.codigo}</div>}
          {u.jornada && <div><span className="muted">Jornada:</span> {u.jornada.nombre}{j['1'] ? ` (L ${j['1'].join('–')})` : ''}</div>}
        </div>
        <p className="hint" style={{ marginTop: 10 }}>Tu usuario y contraseña son los de Innova; se cambian allí. Si otro dato está mal, avisa a Recursos Humanos.</p>
        <div style={{ marginTop: 12 }}><a className="btn sm" href={SESSION_CONFIG.LOGOUT_URL}>Ir a Innova</a></div>
      </section>
      <section className="panel"><h3>Apariencia</h3><TemaSelector /><p className="hint" style={{ marginTop: 10 }}>“Sistema” sigue la configuración de tu computador o celular.</p></section>
      <section className="panel" style={{ gridColumn: '1/-1' }}><h3>Avisos</h3>
        <Preferencia clave="aviso_recordatorio" valor={u.aviso_recordatorio === 1} titulo="Recordatorio de marca" texto="Te avisamos 10 minutos antes de tu entrada y salida." />
        <Preferencia clave="aviso_correo" valor={u.aviso_correo === 1} titulo="Comprobante por correo" texto={`Recibe cada comprobante de marca en ${u.email}.`} />
        <Preferencia clave="aviso_respuestas" valor={u.aviso_respuestas === 1} titulo="Respuestas de jefatura" texto="Cuando aprueben o rechacen tus solicitudes." />
        <p className="hint" style={{ marginTop: 10 }}>Mientras no se configure el correo de la empresa, los avisos se ven en la campana del portal.</p>
      </section>
    </div>
  </>;
}
