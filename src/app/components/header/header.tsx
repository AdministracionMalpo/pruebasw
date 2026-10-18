'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icono } from '@/components/ui/Icono';
import { Modal } from '@/components/ui/Modal';
import Footer from '@/components/footer/footer';
import { TemaSelector, BotonTema } from '@/contexts/ThemeContext';
import { PERMISO, usePermisos, useUser } from '@/contexts/UserContext';
import { leerNotificaciones, useApiNotificaciones } from '@/api/api_portal/Api_Sesion';
import { fmtFechaHora } from '@/libs/tiempo';

export type Contadores = { incidencias: number; he: number; solicitudes: number; documentos: number; aprobaciones: number };
type Item = { href: string; label: string; icono: string; badge?: keyof Contadores };
type Grupo = { titulo: string; icono: string; items: Item[] };

function menu(puede: (p: number) => boolean): (Item | Grupo | 'sep')[] {
  const m: (Item | Grupo | 'sep')[] = [
    { href: '/pages/inicio', label: 'Inicio', icono: 'home' },
    { titulo: 'Control de asistencia', icono: 'clock', items: [
      { href: '/pages/marcaciones', label: 'Mis marcaciones', icono: 'clock' },
      { href: '/pages/calendario', label: 'Mi calendario', icono: 'cal' },
      { href: '/pages/incidencias', label: 'Incidencias', icono: 'alert', badge: 'incidencias' },
      { href: '/pages/actividad', label: 'Registro de actividades', icono: 'history' },
    ] },
    { titulo: 'Horas extras', icono: 'hour', items: [
      { href: '/pages/horas_extra', label: 'Aceptación de horas extras', icono: 'hour', badge: 'he' },
      { href: '/pages/pacto', label: 'Pacto y compensación', icono: 'pact' },
    ] },
    { href: '/pages/solicitudes', label: 'Solicitudes', icono: 'inbox', badge: 'solicitudes' },
    { href: '/pages/documentos', label: 'Gestión documental', icono: 'doc', badge: 'documentos' },
    { href: '/pages/reportes', label: 'Reportes', icono: 'chart' },
    { titulo: 'Dirección del Trabajo', icono: 'shield', items: [{ href: '/verificar', label: 'Verificación de marcación', icono: 'shield' }] },
  ];
  const jef: Item[] = [];
  if (puede(PERMISO.EQUIPO)) jef.push({ href: '/pages/jefatura/equipo', label: 'Equipo hoy', icono: 'users' });
  if (puede(PERMISO.APROBAR)) jef.push({ href: '/pages/jefatura/aprobaciones', label: 'Aprobaciones', icono: 'inbox', badge: 'aprobaciones' });
  if (puede(PERMISO.TURNOS)) jef.push({ href: '/pages/jefatura/turnos', label: 'Turnos del equipo', icono: 'cal' });
  if (puede(PERMISO.REPORTE_EQUIPO)) jef.push({ href: '/pages/jefatura/reporte', label: 'Reporte del equipo', icono: 'chart' });
  if (jef.length) m.push('sep', { titulo: 'Jefatura', icono: 'users', items: jef });
  const adm: Item[] = [];
  if (puede(PERMISO.ADMIN_USUARIOS)) adm.push({ href: '/pages/admin/usuarios', label: 'Usuarios', icono: 'users' });
  if (puede(PERMISO.ADMIN_DOCUMENTOS)) adm.push({ href: '/pages/admin/documentos', label: 'Publicar documentos', icono: 'doc' });
  if (puede(PERMISO.ADMIN_PERMISOS)) adm.push({ href: '/pages/admin/permisos', label: 'Permisos', icono: 'shield' });
  if (puede(PERMISO.ADMIN_OBRAS)) adm.push({ href: '/pages/admin/obras', label: 'Obras', icono: 'pin' });
  if (adm.length) m.push({ titulo: 'Administración', icono: 'gear', items: adm });
  m.push('sep', { href: '/pages/configuracion', label: 'Configuración', icono: 'gear' });
  return m;
}

const planos = (m: ReturnType<typeof menu>) => m.flatMap(x => (x === 'sep' ? [] : 'items' in x ? x.items : [x]));

export default function Header({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { usuario: yo, puede, refetchPermisos } = usePermisos();
  const { logout } = useUser();
  const usuario = { nombre: yo?.nombre || '', cargo: yo?.cargo || '', obra: yo?.obra?.nombre ?? null };
  const contadores: Contadores = yo?.contadores || { incidencias: 0, he: 0, solicitudes: 0, documentos: 0, aprobaciones: 0 };
  const m = menu(puede);
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({});
  const [mas, setMas] = useState(false);
  const [campana, setCampana] = useState(false);
  const [perfil, setPerfil] = useState(false);
  const [leidas, setLeidas] = useState(false);
  const { data: notifData } = useApiNotificaciones(campana);
  const notifs = (notifData || []).map(n => ({ id: n.id, texto: n.texto, leida: n.leida === '1', fecha: fmtFechaHora(n.creada_en) }));
  useEffect(() => { refetchPermisos(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  const prog = useRef<HTMLElement>(null);
  const activo = (h: string) => path === h || path.startsWith(h + '/');
  const iniciales = usuario.nombre.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  const sinLeer = leidas ? 0 : yo?.notificaciones_sin_leer || 0;
  const badge = (k?: keyof Contadores) => (k && contadores[k] ? <span className="count">{contadores[k]}</span> : null);

  // Barra de progreso al navegar
  const iniciarCarga = (href: string) => {
    if (href === path || !prog.current) return;
    const p = prog.current; p.style.transition = 'none'; p.style.width = '0'; p.style.opacity = '1'; void p.offsetWidth;
    p.style.transition = 'width 1.4s cubic-bezier(.1,.7,.2,1)'; p.style.width = '78%';
  };
  useEffect(() => {
    const p = prog.current; if (!p || p.style.opacity !== '1') return;
    p.style.transition = 'width .25s ease, opacity .3s .25s'; p.style.width = '100%'; p.style.opacity = '0';
    setMas(false);
  }, [path]);
  useEffect(() => {
    const cerrar = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.pop-wrap')) { setCampana(false); setPerfil(false); } };
    document.addEventListener('click', cerrar);
    return () => document.removeEventListener('click', cerrar);
  }, []);
  // Posición del indicador de la barra inferior
  const bnav = useRef<HTMLElement>(null), ind = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const a = bnav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (a && ind.current) { ind.current.style.left = a.offsetLeft + a.offsetWidth * 0.25 + 'px'; ind.current.style.width = a.offsetWidth * 0.5 + 'px'; }
  });

  const abrirCampana = async () => {
    setCampana(c => !c); setPerfil(false);
    if (!campana && sinLeer) { setLeidas(true); leerNotificaciones().catch(() => {}); }
  };

  const enlace = (it: Item, sub = false) => (
    <Link key={it.href} href={it.href} className={'nv' + (sub ? ' sub' : '')} aria-current={activo(it.href) ? 'page' : undefined} onClick={() => iniciarCarga(it.href)}>
      {!sub && <Icono n={it.icono} />}<span>{it.label}</span>{badge(it.badge)}
    </Link>
  );
  const principales: Item[] = !(puede(PERMISO.EQUIPO) && puede(PERMISO.APROBAR))
    ? [{ href: '/pages/inicio', label: 'Inicio', icono: 'home' }, { href: '/pages/marcaciones', label: 'Marcas', icono: 'clock' }, { href: '/pages/calendario', label: 'Calendario', icono: 'cal' }, { href: '/pages/solicitudes', label: 'Solicitudes', icono: 'inbox', badge: 'solicitudes' }]
    : [{ href: '/pages/inicio', label: 'Inicio', icono: 'home' }, { href: '/pages/marcaciones', label: 'Marcas', icono: 'clock' }, { href: '/pages/jefatura/equipo', label: 'Equipo', icono: 'users' }, { href: '/pages/jefatura/aprobaciones', label: 'Aprobar', icono: 'inbox', badge: 'aprobaciones' }];
  const enPrincipal = principales.some(p => activo(p.href));

  return (
    <>
      <header className="top" id="top">
        <Link href="/pages/inicio" className="brand" aria-label="Ir al inicio"><img className="logo" src="/logo-malpo.png" alt="Malpo Constructora e Inmobiliaria" width={208} height={30} /><span>Portal del trabajador</span></Link>
        <BotonTema />
        <div className="pop-wrap" style={{ position: 'relative', flex: 'none' }}>
          <button className="iconbtn" aria-label="Notificaciones" aria-expanded={campana} onClick={abrirCampana}><Icono n="bell" />{sinLeer > 0 && <span className="dot">{sinLeer}</span>}</button>
          {campana && (
            <div className="pop" role="dialog" aria-label="Notificaciones">
              <div className="label" style={{ padding: '6px 10px' }}>Notificaciones</div>
              {!notifData ? <div className="n">Cargando…</div> : notifs.length ? notifs.map(n => (
                <div key={n.id} className={'n' + (n.leida ? '' : ' unread')}><Icono n="bell" s={16} /><div>{n.texto}<small>{n.fecha}</small></div></div>
              )) : <div className="n">No tienes notificaciones.</div>}
            </div>
          )}
        </div>
        <div className="who pop-wrap">
          <button onClick={() => { setPerfil(p => !p); setCampana(false); }} aria-expanded={perfil} aria-label="Menú de usuario"><div className="avatar">{iniciales}</div><span>{usuario.nombre.split(' ').slice(0, 2).join(' ')}</span></button>
          {perfil && (
            <div className="pop" style={{ width: 260 }}>
              <div style={{ padding: '8px 10px' }}><b>{usuario.nombre}</b><div className="hint">{usuario.cargo}{usuario.obra ? ' · ' + usuario.obra : ''}</div></div>
              <Link className="n" href="/pages/configuracion" onClick={() => setPerfil(false)}><Icono n="gear" s={16} />Configuración</Link>
              <button className="n" onClick={() => logout()} style={{ width: '100%', background: 'none', border: 0, textAlign: 'left', cursor: 'pointer' }}><Icono n="exit" s={16} />Cerrar sesión</button>
              <button className="n" onClick={() => logout(true)} style={{ width: '100%', background: 'none', border: 0, textAlign: 'left', cursor: 'pointer' }}><Icono n="home" s={16} />Volver a Innova</button>
            </div>
          )}
        </div>
        <i className="prog" ref={prog} />
      </header>
      <div className="shell">
        <nav className="side" aria-label="Módulos">
          <div className="label ctx">Constructora Malpo SpA</div>
          {m.map((x, i) => {
            if (x === 'sep') return <div key={'s' + i} className="sep" />;
            if (!('items' in x)) return enlace(x);
            const abierto = abiertos[x.titulo] ?? true;
            return (
              <div key={x.titulo} className={'grp' + (abierto ? '' : ' closed')}>
                <button className="nv grp-head" aria-expanded={abierto} onClick={() => setAbiertos(a => ({ ...a, [x.titulo]: !abierto }))}>
                  <Icono n={x.icono} /><span>{x.titulo}</span><span className="chev"><Icono n="chev" s={14} /></span>
                </button>
                <div className="grp-body"><div>{x.items.map(it => enlace(it, true))}</div></div>
              </div>
            );
          })}
        </nav>
        <main id="main">
          {children}
          <Footer />
        </main>
      </div>
      <nav className="bnav" ref={bnav} aria-label="Navegación principal">
        {principales.map(p => (
          <Link key={p.href} href={p.href} aria-current={activo(p.href) ? 'page' : undefined} onClick={() => iniciarCarga(p.href)} style={{ textDecoration: 'none' }}>
            <Icono n={p.icono} s={20} /><span>{p.label}</span>{badge(p.badge)}
          </Link>
        ))}
        <button onClick={() => setMas(true)} aria-current={!enPrincipal ? 'page' : undefined}><Icono n="menu" s={20} /><span>Más</span></button>
        <span className="ind" ref={ind} />
      </nav>
      <Modal open={mas} onClose={() => setMas(false)} label="Todas las secciones">
        <div><div className="label">Portal Malpo</div><h2>Todas las secciones</h2></div>
        <div className="more">
          {planos(m).map(it => (
            <Link key={it.href} href={it.href} aria-current={activo(it.href) ? 'page' : undefined} onClick={() => iniciarCarga(it.href)} style={{ textDecoration: 'none' }}>
              <Icono n={it.icono} s={22} /><span>{it.label}</span>{badge(it.badge)}
            </Link>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}><span className="hint">Apariencia</span><TemaSelector /></div>
        <button className="btn" onClick={() => logout()}><Icono n="exit" s={16} /> Cerrar sesión</button>
      </Modal>
    </>
  );
}
