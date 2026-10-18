'use client';
/**
 * Administración (RR.HH.). Las cuentas y contraseñas son las de Innova:
 * aquí se da acceso a ESTA plataforma y se administra el perfil local del portal.
 */
import { useEffect, useRef, useState } from 'react';
import { buscarInnova, crearObra, darAcceso, editarUsuario, exigirUbicacion, publicarDocumento, type UsuarioInnova, type UsuarioLocal } from '@/api/api_portal/Api_Admin';
import type { Catalogos } from '@/api/api_portal/Api_Catalogos';
import { refrescarPortal } from '@/api/api_portal/useApiPortal';
import { formatearRut } from '@/libs/rut';
import { Icono } from './ui/Icono';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toasts';

const PERFIL_LABEL: Record<number, string> = { 1: 'Trabajador', 2: 'Jefatura', 3: 'Administrador Maestro (RR.HH.)' };
export const perfilLabel = (id: number) => PERFIL_LABEL[id] || 'Trabajador';

function Exito({ titulo, texto, onClose }: { titulo: string; texto?: string; onClose: () => void }) {
  return <>
    <div className="success"><div className="check"><svg viewBox="0 0 80 80" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="40" cy="40" r="36" /><path d="M25 41l10 10 20-22" /></svg></div>
      <h2>{titulo}</h2>{texto && <p className="muted">{texto}</p>}</div>
    <div className="foot" style={{ justifyContent: 'center' }}><button className="btn primary" onClick={onClose}>Listo</button></div>
  </>;
}

/** Busca personas en Innova y les da acceso al portal (INSERT en plataforma_has_usuario solo para esta plataforma) */
export function DarAcceso() {
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState(''), [lista, setLista] = useState<UsuarioInnova[] | null>(null), [buscando, setBuscando] = useState(false);
  const [sel, setSel] = useState<UsuarioInnova | null>(null), [perfil, setPerfil] = useState(1), [cargo, setCargo] = useState('');
  const [error, setError] = useState(''), [enviando, setEnviando] = useState(false), [ok, setOk] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    const t = setTimeout(async () => {
      setBuscando(true);
      try { setLista(await buscarInnova(q.trim())); setError(''); } catch (e) { setError((e as Error).message); }
      setBuscando(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q, abierto]);

  const abrir = () => { setQ(''); setSel(null); setPerfil(1); setCargo(''); setError(''); setOk(false); setAbierto(true); };
  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sel) return;
    setEnviando(true); setError('');
    try { await darAcceso(sel.idusuario, perfil, cargo.trim()); setOk(true); refrescarPortal(); } catch (err) { setError((err as Error).message); }
    setEnviando(false);
  };

  return <>
    <button className="btn primary" onClick={abrir}><Icono n="plus" s={16} /> Dar acceso</button>
    <Modal open={abierto} onClose={() => setAbierto(false)} wide paso={ok ? 'ok' : sel ? 'sel' : 'buscar'} label="Dar acceso al portal">
      {ok && sel ? <Exito titulo="Acceso otorgado" texto={`${sel.usuarioNombre || sel.usuarioSesion} ya puede ingresar con su usuario de Innova.`} onClose={() => setAbierto(false)} /> : !sel ? <>
        <div><div className="label">Administración</div><h2>Dar acceso al portal</h2><p className="muted" style={{ marginTop: 4 }}>Busca a la persona en Innova. Su usuario y contraseña siguen siendo los de Innova.</p></div>
        <div className="field"><label htmlFor="in-q">Buscar en Innova</label><input id="in-q" value={q} onChange={e => setQ(e.target.value)} placeholder="Nombre, RUT, usuario o correo" autoComplete="off" /></div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="list" style={{ maxHeight: 340, overflow: 'auto' }}>
          {buscando && !lista ? <p className="hint">Buscando…</p> : lista?.length ? lista.map(u => (
            <div key={u.idusuario} className="item">
              <span className="ic"><Icono n="users" /></span>
              <div><b>{u.usuarioNombre || u.usuarioSesion}</b><div className="meta">@{u.usuarioSesion} · {formatearRut(u.usuarioRut)} · {u.usuarioEmail}</div></div>
              <div className="actions">{u.acceso && u.en_portal ? <span className="chip c-ok">Ya tiene acceso</span> : <button className="btn sm primary" onClick={() => setSel(u)}>Elegir</button>}</div>
            </div>
          )) : <p className="hint">Sin resultados.</p>}
        </div>
        <div className="foot"><button className="btn" onClick={() => setAbierto(false)}>Cerrar</button></div>
      </> : (
        <form onSubmit={enviar} className="stack" style={{ gap: 14 }}>
          <div><div className="label">Dar acceso al portal</div><h2>{sel.usuarioNombre || sel.usuarioSesion}</h2><p className="muted">@{sel.usuarioSesion} · {formatearRut(sel.usuarioRut)}</p></div>
          <div className="form-grid">
            <div className="field"><label htmlFor="da-p">Perfil en el portal</label><select id="da-p" value={perfil} onChange={e => setPerfil(Number(e.target.value))}>{[1, 2, 3].map(p => <option key={p} value={p}>{perfilLabel(p)}</option>)}</select></div>
            <div className="field"><label htmlFor="da-c">Cargo</label><input id="da-c" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ej.: Maestro primera" /></div>
          </div>
          <p className="hint">Obra, jefatura y jornada se asignan después en “Editar”.</p>
          {error && <p className="err" role="alert">{error}</p>}
          <div className="foot"><button type="button" className="btn" onClick={() => setSel(null)}>Volver</button><button className={'btn primary' + (enviando ? ' loading' : '')} disabled={enviando}>Dar acceso</button></div>
        </form>
      )}
    </Modal>
  </>;
}

export function AccionesUsuario({ u, cat, yo }: { u: UsuarioLocal; cat: Catalogos; yo: number }) {
  const toast = useToast();
  const [abierto, setAbierto] = useState(false), [error, setError] = useState(''), [enviando, setEnviando] = useState(false);
  const activo = u.activo === '1';

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const datos: Record<string, unknown> = Object.fromEntries(fd.entries());
    datos.id_perfil = Number(datos.id_perfil);
    setEnviando(true); setError('');
    try { await editarUsuario(u.id_externo, datos); toast('Usuario actualizado'); setAbierto(false); refrescarPortal(); } catch (err) { setError((err as Error).message); }
    setEnviando(false);
  };
  const cambiarActivo = async () => {
    try { await editarUsuario(u.id_externo, { activo: !activo }); toast(activo ? 'Cuenta del portal desactivada' : 'Cuenta del portal activada'); refrescarPortal(); } catch (err) { toast((err as Error).message, false); }
  };

  return <>
    <button className="btn sm" onClick={() => { setError(''); setAbierto(true); }}>Editar</button>
    {Number(u.id_externo) !== yo && <button className={'btn sm ' + (activo ? 'bad' : 'ok')} onClick={cambiarActivo}>{activo ? 'Desactivar' : 'Activar'}</button>}
    <Modal open={abierto} onClose={() => setAbierto(false)} wide label="Editar usuario">
      <form onSubmit={guardar} className="stack" style={{ gap: 14 }}>
        <div><div className="label">Administración</div><h2>{u.nombre}</h2><p className="muted">{formatearRut(u.rut)} · {u.email} · datos de Innova</p></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="e-cargo">Cargo</label><input id="e-cargo" name="cargo" defaultValue={u.cargo} required /></div>
          <div className="field"><label htmlFor="e-perfil">Perfil</label><select id="e-perfil" name="id_perfil" defaultValue={u.id_perfil}>{cat.perfiles.map(p => <option key={p.id_perfil} value={p.id_perfil}>{+p.id_perfil === 3 ? perfilLabel(3) : p.nombre}</option>)}</select></div>
          <div className="field"><label htmlFor="e-obra">Obra</label><select id="e-obra" name="obra_id" defaultValue={u.obra_id ?? ''}><option value="">Sin obra</option>{cat.obras.map(o => <option key={o.id} value={o.id}>{o.codigo} · {o.nombre}</option>)}</select></div>
          <div className="field"><label htmlFor="e-jefe">Jefatura directa</label><select id="e-jefe" name="jefe_id_externo" defaultValue={u.jefe_id_externo ?? ''}><option value="">Sin jefatura</option>{cat.jefaturas.filter(j => j.id_externo !== u.id_externo).map(j => <option key={j.id_externo} value={j.id_externo}>{j.nombre}</option>)}</select></div>
          <div className="field"><label htmlFor="e-jor">Jornada</label><select id="e-jor" name="jornada_id" defaultValue={u.jornada_id ?? ''}><option value="">Sin jornada</option>{cat.jornadas.map(j => <option key={j.id} value={j.id}>{j.nombre}</option>)}</select></div>
          <div className="field"><label htmlFor="e-vac">Días de vacaciones al año</label><input id="e-vac" name="dias_vacaciones_base" type="number" min="0" max="60" step="0.5" defaultValue={Number(u.dias_vacaciones_base)} /></div>
        </div>
        {error && <p className="err" role="alert">{error}</p>}
        <div className="foot"><button type="button" className="btn" onClick={() => setAbierto(false)}>Cancelar</button><button className={'btn primary' + (enviando ? ' loading' : '')} disabled={enviando}>Guardar cambios</button></div>
      </form>
    </Modal>
  </>;
}

export function PublicarDocumento({ usuarios }: { usuarios: { id: string; nombre: string }[] }) {
  const toast = useToast(), form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState(''), [enviando, setEnviando] = useState(false);
  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('requiere_firma', fd.get('requiere_firma') ? 'true' : 'false');
    const f = fd.get('archivo');
    if (f instanceof File && !f.size) fd.delete('archivo');
    setEnviando(true); setError('');
    try { const r = await publicarDocumento(fd); form.current?.reset(); toast(`Documento publicado para ${r.publicados} ${r.publicados === 1 ? 'persona' : 'personas'}`); refrescarPortal(); } catch (err) { setError((err as Error).message); }
    setEnviando(false);
  };
  return (
    <form ref={form} onSubmit={enviar} className="stack">
      <div className="form-grid">
        <div className="field"><label htmlFor="d-u">Para</label><select id="d-u" name="id_externo" required><option value="">Elige una persona</option><option value="TODOS">Todos los trabajadores activos</option>{usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select></div>
        <div className="field"><label htmlFor="d-t">Tipo</label><select id="d-t" name="tipo"><option>Liquidación</option><option>Contrato</option><option>Anexo de contrato</option><option>Prevención</option><option>Reglamento</option><option>Certificado</option><option>Otro</option></select></div>
        <div className="field full"><label htmlFor="d-n">Nombre del documento</label><input id="d-n" name="nombre" placeholder="Liquidación de sueldo · octubre 2026" required /></div>
        <div className="field full"><label htmlFor="d-d">Descripción (opcional)</label><input id="d-d" name="descripcion" /></div>
        <div className="field full"><label htmlFor="d-a">Archivo PDF (opcional, máx. 10 MB)</label><input id="d-a" name="archivo" type="file" accept="application/pdf" /></div>
      </div>
      <label className="switch" htmlFor="d-f"><span><b style={{ fontWeight: 600 }}>Requiere firma</b><br /><span className="hint">La persona deberá firmarlo con su contraseña de Innova.</span></span><input id="d-f" name="requiere_firma" type="checkbox" /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <div><button className={'btn primary' + (enviando ? ' loading' : '')} disabled={enviando}><Icono n="upload" s={16} /> Publicar</button></div>
    </form>
  );
}

export function NuevaObra() {
  const toast = useToast(), form = useRef<HTMLFormElement>(null);
  const [error, setError] = useState(''), [enviando, setEnviando] = useState(false);
  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget).entries()) as Record<string, string>;
    setEnviando(true); setError('');
    try {
      await crearObra({ codigo: d.codigo, nombre: d.nombre, direccion: d.direccion, latitud: d.latitud || null, longitud: d.longitud || null, radio_metros: Number(d.radio_metros) || 150, exigir_ubicacion: !!d.exigir_ubicacion });
      form.current?.reset(); toast('Obra creada'); refrescarPortal();
    } catch (err) { setError((err as Error).message); }
    setEnviando(false);
  };
  return (
    <form ref={form} onSubmit={enviar} className="stack">
      <div className="form-grid">
        <div className="field"><label htmlFor="o-c">Código</label><input id="o-c" name="codigo" placeholder="Obra 215" required /></div>
        <div className="field"><label htmlFor="o-n">Nombre</label><input id="o-n" name="nombre" required /></div>
        <div className="field full"><label htmlFor="o-d">Dirección</label><input id="o-d" name="direccion" required /></div>
        <div className="field"><label htmlFor="o-la">Latitud (opcional)</label><input id="o-la" name="latitud" inputMode="decimal" placeholder="-33.4970" /></div>
        <div className="field"><label htmlFor="o-lo">Longitud (opcional)</label><input id="o-lo" name="longitud" inputMode="decimal" placeholder="-70.5990" /></div>
        <div className="field"><label htmlFor="o-r">Radio permitido (m)</label><input id="o-r" name="radio_metros" type="number" min="20" defaultValue={150} /></div>
      </div>
      <label className="switch" htmlFor="o-e"><span><b style={{ fontWeight: 600 }}>Exigir ubicación al marcar</b><br /><span className="hint">Solo se podrá marcar desde el portal dentro del radio. Requiere latitud y longitud.</span></span><input id="o-e" name="exigir_ubicacion" type="checkbox" /></label>
      {error && <p className="err" role="alert">{error}</p>}
      <div><button className={'btn primary' + (enviando ? ' loading' : '')} disabled={enviando}><Icono n="plus" s={16} /> Crear obra</button></div>
    </form>
  );
}

export function ToggleUbicacion({ id, valor }: { id: string; valor: boolean }) {
  const toast = useToast();
  const [v, setV] = useState(valor);
  return <label className="switch" style={{ border: 0, padding: 0 }} htmlFor={'ou-' + id}><span className="hint">Exigir ubicación</span>
    <input id={'ou-' + id} type="checkbox" checked={v} onChange={async e => { const n = e.target.checked; try { await exigirUbicacion(id, n); setV(n); refrescarPortal(); } catch (err) { toast((err as Error).message, false); } }} /></label>;
}
