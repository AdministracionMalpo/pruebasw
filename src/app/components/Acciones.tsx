'use client';
import { useRef, useState } from 'react';
import { decidirHorasExtra } from '@/api/api_portal/Api_HorasExtra';
import { firmarDocumento } from '@/api/api_portal/Api_Documentos';
import { cambiarTurno, resolverSolicitud } from '@/api/api_portal/Api_Jefatura';
import { guardarPreferencias } from '@/api/api_portal/Api_Sesion';
import { refrescarPortal } from '@/api/api_portal/useApiPortal';
import { Icono } from './ui/Icono';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toasts';

/** Ejecuta una llamada y devuelve { error } en vez de lanzar (mismo contrato que las acciones anteriores) */
const intentar = (p: Promise<unknown>) => p.then(() => ({ error: '' })).catch((e: Error) => ({ error: e.message }));

const espera = (ms: number) => new Promise(r => setTimeout(r, ms));
async function colapsar(el: HTMLElement | null) {
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const h = el.offsetHeight;
  await el.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0, paddingTop: '0px', paddingBottom: '0px' }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished;
}
function sacudir(el: HTMLElement | null) {
  if (!el) return;
  const f = (el.closest('.field') as HTMLElement) || el;
  f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
}

export function BotonesHE({ fecha }: { fecha: string }) {
  const toast = useToast();
  const [cargando, setCargando] = useState<'' | 'si' | 'no'>('');
  const decidir = async (aceptar: boolean) => {
    setCargando(aceptar ? 'si' : 'no');
    const [r] = await Promise.all([intentar(decidirHorasExtra(fecha, aceptar)), espera(400)]);
    setCargando('');
    if (r.error) return toast(r.error, false);
    toast(aceptar ? 'Horas extra aceptadas' : 'Horas extra rechazadas', aceptar);
    refrescarPortal();
  };
  return <>
    <button className={'btn sm ok' + (cargando === 'si' ? ' loading' : '')} disabled={!!cargando} onClick={() => decidir(true)}><Icono n="check" s={14} /> Aceptar</button>
    <button className={'btn sm bad' + (cargando === 'no' ? ' loading' : '')} disabled={!!cargando} onClick={() => decidir(false)}>Rechazar</button>
  </>;
}

export function FirmarDocumento({ id, nombre }: { id: string; nombre: string }) {
  const [abierto, setAbierto] = useState(false), [clave, setClave] = useState(''), [error, setError] = useState(''), [cargando, setCargando] = useState(false), [ok, setOk] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const firmar = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setCargando(true);
    const [r] = await Promise.all([intentar(firmarDocumento(id, clave)), espera(700)]);
    setCargando(false);
    if (r.error) { setError(r.error); sacudir(input.current); return; }
    setOk(true); refrescarPortal();
  };
  return <>
    <button className="btn sm primary" onClick={() => { setAbierto(true); setOk(false); setClave(''); setError(''); }}><Icono n="pen" s={14} /> Firmar</button>
    <Modal open={abierto} onClose={() => setAbierto(false)} paso={ok ? 'ok' : 'f'} label="Firmar documento">
      {!ok ? (
        <form onSubmit={firmar} className="stack" style={{ gap: 14 }}>
          <div><div className="label">Firma electrónica simple</div><h2>Firmar documento</h2></div>
          <p>Vas a firmar <b>{nombre}</b>. Confirma con tu contraseña de Innova.</p>
          <div className="field"><label htmlFor="f-clave">Contraseña</label><input ref={input} id="f-clave" type="password" autoComplete="current-password" value={clave} onChange={e => setClave(e.target.value)} required /></div>
          {error && <p className="err" role="alert">{error}</p>}
          <div className="foot"><button type="button" className="btn" onClick={() => setAbierto(false)}>Cancelar</button><button className={'btn primary' + (cargando ? ' loading' : '')} disabled={cargando}>Firmar</button></div>
        </form>
      ) : <>
        <div className="success"><div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div><h2>Documento firmado</h2><p className="muted">{nombre}</p></div>
        <div className="foot" style={{ justifyContent: 'center' }}><button className="btn primary" onClick={() => setAbierto(false)}>Listo</button></div>
      </>}
    </Modal>
  </>;
}

export function Aprobacion({ id, nombre }: { id: string; nombre: string }) {
  const toast = useToast();
  const [com, setCom] = useState(''), [cargando, setCargando] = useState<'' | 'si' | 'no'>('');
  const ref = useRef<HTMLDivElement>(null), inp = useRef<HTMLInputElement>(null);
  const decidir = async (aprobar: boolean) => {
    if (!aprobar && !com.trim()) { inp.current?.focus(); sacudir(inp.current); return toast('Escribe un comentario para explicar el rechazo', false); }
    setCargando(aprobar ? 'si' : 'no');
    const [r] = await Promise.all([intentar(resolverSolicitud(id, aprobar, com)), espera(450)]);
    if (r.error) { setCargando(''); return toast(r.error, false); }
    await colapsar(ref.current?.closest('.item') as HTMLElement);
    toast(`Solicitud de ${nombre.split(' ')[0]} ${aprobar ? 'aprobada' : 'rechazada'}`, aprobar);
    refrescarPortal();
  };
  return (
    <div ref={ref} style={{ display: 'contents' }}>
      <div className="actions">
        <button className={'btn sm ok' + (cargando === 'si' ? ' loading' : '')} disabled={!!cargando} onClick={() => decidir(true)}><Icono n="check" s={14} /> Aprobar</button>
        <button className={'btn sm bad' + (cargando === 'no' ? ' loading' : '')} disabled={!!cargando} onClick={() => decidir(false)}>Rechazar</button>
      </div>
      <div className="field" style={{ gridColumn: '1/-1' }}><input ref={inp} value={com} onChange={e => setCom(e.target.value)} placeholder={`Comentario para ${nombre.split(' ')[0]} (obligatorio si rechazas)`} aria-label="Comentario" /></div>
    </div>
  );
}

export function SelectTurno({ usuarioId, fecha, valor, opciones, etiqueta }: { usuarioId: number; fecha: string; valor: string; opciones: { codigo: string; nombre: string }[]; etiqueta: string }) {
  const toast = useToast();
  const [v, setV] = useState(valor), [anim, setAnim] = useState(false);
  const cambiar = async (nuevo: string) => {
    const antes = v; setV(nuevo);
    const r = await intentar(cambiarTurno(usuarioId, fecha, nuevo));
    if (r.error) { setV(antes); return toast(r.error, false); }
    setAnim(true); setTimeout(() => setAnim(false), 500);
    toast('Turno actualizado'); refrescarPortal();
  };
  return (
    <select className={'shift' + (anim ? ' changed' : '')} data-k={v} value={v} onChange={e => cambiar(e.target.value)} aria-label={etiqueta}>
      <option value="HABITUAL">Habitual</option>
      {opciones.map(o => <option key={o.codigo} value={o.codigo}>{o.nombre.split(' ')[0]}</option>)}
    </select>
  );
}

export function Preferencia({ clave, valor, titulo, texto }: { clave: 'aviso_correo' | 'aviso_recordatorio' | 'aviso_respuestas'; valor: boolean; titulo: string; texto: string }) {
  const toast = useToast();
  const [v, setV] = useState(valor);
  return (
    <label className="switch" htmlFor={'p-' + clave}>
      <span><b style={{ fontWeight: 600 }}>{titulo}</b><br /><span className="hint">{texto}</span></span>
      <input type="checkbox" id={'p-' + clave} checked={v} onChange={async e => { const n = e.target.checked; setV(n); const r = await intentar(guardarPreferencias({ [clave]: n })); if (r.error) { setV(!n); return toast(r.error, false); } toast(n ? 'Aviso activado' : 'Aviso desactivado'); }} />
    </label>
  );
}
