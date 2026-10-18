'use client';
/**
 * Gestión de permisos del portal (mismo modelo RBAC que api_bodegas):
 *  - Perfiles: qué permisos trae cada perfil.
 *  - Por persona: excepciones sobre su perfil (permitir / quitar), guardadas en usuario_permisos.
 */
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  crearPerfil, guardarPermisosPerfil, guardarPermisosUsuario, useApiAdminUsuarios, useApiPermisos, useApiPermisosUsuario,
  type PerfilDef, type PermisoDef,
} from '@/api/api_portal/Api_Admin';
import { refrescarPortal } from '@/api/api_portal/useApiPortal';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { formatearRut } from '@/libs/rut';
import { Cabecera, Cargando, Chip, ErrorCarga, SinPermiso, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toasts';

const GRUPOS: { titulo: string; icono: string; desde: number; hasta: number }[] = [
  { titulo: 'Trabajador', icono: 'finger', desde: 1, hasta: 9 },
  { titulo: 'Jefatura', icono: 'users', desde: 10, hasta: 19 },
  { titulo: 'Administración', icono: 'gear', desde: 20, hasta: 99 },
];
const agrupar = (lista: PermisoDef[]) => GRUPOS.map(g => ({ ...g, permisos: lista.filter(p => +p.id_permiso >= g.desde && +p.id_permiso <= g.hasta) })).filter(g => g.permisos.length);

/* ::::: Perfiles ::::: */
function Perfiles({ permisos, perfiles }: { permisos: PermisoDef[]; perfiles: PerfilDef[] }) {
  const toast = useToast();
  const [edit, setEdit] = useState<Record<string, number[]>>({});
  const [guardando, setGuardando] = useState('');
  const [nuevo, setNuevo] = useState(false), [nombre, setNombre] = useState(''), [desc, setDesc] = useState(''), [err, setErr] = useState(''), [creando, setCreando] = useState(false);
  useEffect(() => { setEdit(Object.fromEntries(perfiles.map(p => [p.id_perfil, p.permisos]))); }, [perfiles]);
  const cambiado = (p: PerfilDef) => JSON.stringify([...(edit[p.id_perfil] || [])].sort((a, b) => a - b)) !== JSON.stringify([...p.permisos].sort((a, b) => a - b));
  const alternar = (p: PerfilDef, id: number) => setEdit(e => {
    const l = e[p.id_perfil] || [];
    return { ...e, [p.id_perfil]: l.includes(id) ? l.filter(x => x !== id) : [...l, id] };
  });
  const guardar = async (p: PerfilDef) => {
    setGuardando(p.id_perfil);
    try { await guardarPermisosPerfil(p.id_perfil, edit[p.id_perfil] || []); toast(`Permisos de ${p.nombre} guardados`); refrescarPortal(); } catch (e) { toast((e as Error).message, false); }
    setGuardando('');
  };
  const crear = async (e: React.FormEvent) => {
    e.preventDefault(); setCreando(true); setErr('');
    try { await crearPerfil(nombre.trim(), desc.trim()); toast('Perfil creado: ahora marca sus permisos'); setNuevo(false); refrescarPortal(); } catch (e2) { setErr((e2 as Error).message); }
    setCreando(false);
  };
  return <>
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
      <p className="muted" style={{ maxWidth: '70ch' }}>Cada persona recibe los permisos de su perfil. El Administrador Maestro siempre tiene todos.</p>
      <button className="btn" onClick={() => { setNombre(''); setDesc(''); setErr(''); setNuevo(true); }}><Icono n="plus" s={16} /> Nuevo perfil</button>
    </div>
    <div className="tw"><table className="perm-matrix"><thead><tr><th>Permiso</th>{perfiles.map(p => <th key={p.id_perfil} className="c">{p.nombre}<div className="hint" style={{ textTransform: 'none', letterSpacing: 0 }}>{p.usuarios} {p.usuarios === 1 ? 'persona' : 'personas'}</div></th>)}</tr></thead>
      <tbody>
        {agrupar(permisos).map(g => [
          <tr key={'g' + g.titulo} className="grp-row"><td colSpan={perfiles.length + 1}><Icono n={g.icono} s={14} /> {g.titulo}</td></tr>,
          ...g.permisos.map(pm => <tr key={pm.id_permiso}>
            <td><b style={{ fontWeight: 600 }}>{pm.nombre_permiso}</b>{pm.descripcion && <div className="hint">{pm.descripcion}</div>}</td>
            {perfiles.map(p => {
              const on = (edit[p.id_perfil] || []).includes(+pm.id_permiso);
              return <td key={p.id_perfil} className="c"><input type="checkbox" className="perm-check" checked={p.todos || on} disabled={p.todos} onChange={() => alternar(p, +pm.id_permiso)} aria-label={`${pm.nombre_permiso} para ${p.nombre}`} /></td>;
            })}
          </tr>),
        ])}
        <tr><td />{perfiles.map(p => <td key={p.id_perfil} className="c">{p.todos ? <span className="hint">Todos</span> : <button className={'btn sm' + (cambiado(p) ? ' primary' : '') + (guardando === p.id_perfil ? ' loading' : '')} disabled={!cambiado(p) || !!guardando} onClick={() => guardar(p)}>Guardar</button>}</td>)}</tr>
      </tbody></table></div>
    <Modal open={nuevo} onClose={() => setNuevo(false)} label="Nuevo perfil">
      <form onSubmit={crear} className="stack" style={{ gap: 14 }}>
        <div><div className="label">Permisos</div><h2>Nuevo perfil</h2></div>
        <div className="field"><label htmlFor="np-n">Nombre</label><input id="np-n" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej.: Supervisor de obra" maxLength={80} required /></div>
        <div className="field"><label htmlFor="np-d">Descripción (opcional)</label><input id="np-d" value={desc} onChange={e => setDesc(e.target.value)} maxLength={255} /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <div className="foot"><button type="button" className="btn" onClick={() => setNuevo(false)}>Cancelar</button><button className={'btn primary' + (creando ? ' loading' : '')} disabled={creando}>Crear perfil</button></div>
      </form>
    </Modal>
  </>;
}

/* ::::: Por persona ::::: */
function PorPersona({ permisos, inicial }: { permisos: PermisoDef[]; inicial: string | null }) {
  const toast = useToast();
  const { usuario: yo } = usePermisos();
  const { data: usuarios } = useApiAdminUsuarios();
  const [sel, setSel] = useState<string | null>(inicial);
  const [q, setQ] = useState('');
  const { data: d, loading, error, refetch } = useApiPermisosUsuario(sel);
  const [ov, setOv] = useState<Record<string, number>>({});
  const [guardando, setGuardando] = useState(false);
  useEffect(() => { if (d) setOv({ ...d.overrides }); }, [d]);
  useEffect(() => { if (!sel && usuarios?.length) setSel(usuarios[0].id_externo); }, [usuarios, sel]);

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (usuarios || []).filter(u => !t || (u.nombre || '').toLowerCase().includes(t) || (u.cargo || '').toLowerCase().includes(t));
  }, [usuarios, q]);
  const efectivo = (id: number) => (ov[id] === 1 ? true : ov[id] === 2 ? false : !!d?.desde_perfil.includes(id));
  const cambiado = !!d && JSON.stringify(Object.entries(ov).filter(([, v]) => v).sort()) !== JSON.stringify(Object.entries(d.overrides).sort());
  const nExc = Object.values(ov).filter(Boolean).length;
  const fijar = (id: number, v: 0 | 1 | 2) => setOv(o => { const n = { ...o }; if (v) n[id] = v; else delete n[id]; return n; });
  const guardar = async () => {
    if (!sel) return;
    setGuardando(true);
    try { await guardarPermisosUsuario(sel, ov); toast('Permisos guardados'); refetch(true); refrescarPortal(); } catch (e) { toast((e as Error).message, false); }
    setGuardando(false);
  };

  return (
    <div className="perm-persona">
      <aside className="panel perm-lista">
        <div className="field"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar persona" aria-label="Buscar persona" /></div>
        <div className="stack" style={{ gap: 2, marginTop: 8 }}>
          {!usuarios ? <p className="hint">Cargando…</p> : lista.length ? lista.map(u => (
            <button key={u.id_externo} className={'perm-persona-btn' + (sel === u.id_externo ? ' on' : '')} onClick={() => setSel(u.id_externo)} aria-pressed={sel === u.id_externo}>
              <span className="avatar sm">{(u.nombre || '?').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</span>
              <span><b>{u.nombre}</b><small>{u.cargo}{u.activo !== '1' ? ' · inactivo' : ''}</small></span>
            </button>
          )) : <p className="hint">Sin resultados.</p>}
        </div>
      </aside>
      <section className="panel" key={sel || ''}>
        {!sel ? <Vacio icono="users">Elige una persona.</Vacio> : loading && !d ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : d && <>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <div><h2>{d.nombre}</h2><p className="muted">Perfil: {d.perfiles.map(p => p.nombre).join(', ') || 'Trabajador'}{usuarios ? ' · ' + formatearRut(usuarios.find(u => u.id_externo === sel)?.rut) : ''}</p></div>
            {!d.administrador_maestro && <div className="row">{nExc > 0 && <Chip c="accent">{nExc} {nExc === 1 ? 'excepción' : 'excepciones'}</Chip>}<button className={'btn primary' + (guardando ? ' loading' : '')} disabled={!cambiado || guardando} onClick={guardar}>Guardar permisos</button></div>}
          </div>
          {d.administrador_maestro ? <div className="banner"><Icono n="shield" /> Administrador Maestro: tiene todos los permisos del portal. Para limitarlo, cambia su perfil en Usuarios.</div> : <>
            <p className="hint" style={{ marginBottom: 12 }}>“Perfil” usa lo que define su perfil. “Permitir” o “Quitar” crean una excepción solo para esta persona.</p>
            {agrupar(permisos).map(g => (
              <div key={g.titulo} style={{ marginBottom: 16 }}>
                <div className="label" style={{ margin: '6px 0 4px' }}>{g.titulo}</div>
                {g.permisos.map(pm => {
                  const id = +pm.id_permiso, v = (ov[id] || 0) as 0 | 1 | 2, on = efectivo(id), base = d.desde_perfil.includes(id);
                  const propio = yo?.id_externo === d.id_externo && id === PERMISO.ADMIN_PERMISOS;
                  return (
                    <div key={id} className={'perm-row' + (v ? ' exc' : '')}>
                      <span className={'perm-dot' + (on ? ' on' : '')} aria-hidden="true">{on ? <Icono n="check" s={13} /> : <Icono n="x" s={12} />}</span>
                      <div style={{ minWidth: 0 }}><b>{pm.nombre_permiso}</b><div className="hint">{pm.descripcion}{' · '}{base ? 'incluido en su perfil' : 'no incluido en su perfil'}</div></div>
                      <div className="segl" role="group" aria-label={`Permiso ${pm.nombre_permiso}`}>
                        <button type="button" aria-pressed={v === 0} onClick={() => fijar(id, 0)}>Perfil</button>
                        <button type="button" aria-pressed={v === 1} onClick={() => fijar(id, 1)} disabled={base && v !== 1}>Permitir</button>
                        <button type="button" aria-pressed={v === 2} onClick={() => fijar(id, 2)} disabled={(!base && v !== 2) || propio}>Quitar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </>}
        </>}
      </section>
    </div>
  );
}

function Contenido() {
  const { puede } = usePermisos();
  const params = useSearchParams();
  const usuario = params.get('usuario');
  const [tab, setTab] = useState<'perfiles' | 'personas'>(usuario ? 'personas' : 'perfiles');
  const { data, loading, error, refetch } = useApiPermisos();
  if (!puede(PERMISO.ADMIN_PERMISOS)) return <SinPermiso />;
  return <>
    <Cabecera seccion="Administración" titulo="Permisos" sub="Define qué puede hacer cada perfil y ajusta excepciones por persona. Los cambios aplican en el siguiente clic de la persona." />
    <div className="tabs" role="tablist">
      <button role="tab" type="button" aria-selected={tab === 'perfiles'} onClick={() => setTab('perfiles')}>Perfiles</button>
      <button role="tab" type="button" aria-selected={tab === 'personas'} onClick={() => setTab('personas')}>Por persona</button>
    </div>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : data && (
      <div className="tabpane" key={tab}>
        {tab === 'perfiles' ? <Perfiles permisos={data.permisos} perfiles={data.perfiles} /> : <PorPersona permisos={data.permisos} inicial={usuario} />}
      </div>
    )}
  </>;
}

export default function Permisos() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
