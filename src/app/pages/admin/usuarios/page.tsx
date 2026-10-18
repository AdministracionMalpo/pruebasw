'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApiAdminUsuarios } from '@/api/api_portal/Api_Admin';
import { useApiCatalogos } from '@/api/api_portal/Api_Catalogos';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { formatearRut } from '@/libs/rut';
import { fmtFechaHora } from '@/libs/tiempo';
import { AccionesUsuario, DarAcceso, perfilLabel } from '@/components/Admin';
import { Cabecera, Cargando, Chip, ErrorCarga, SinPermiso } from '@/components/ui/ui';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Usuarios() {
  const { puede, usuario } = usePermisos();
  const { data, loading, error, refetch } = useApiAdminUsuarios();
  const { data: cat } = useApiCatalogos();
  const [q, setQ] = useState('');
  if (!puede(PERMISO.ADMIN_USUARIOS)) return <SinPermiso />;
  const t = norm(q.trim()), rq = q.replace(/[^0-9kK]/g, '');
  const lista = (data || []).filter(u => !t || norm(u.nombre || '').includes(t) || norm(u.email || '').includes(t) || (!!rq && (u.rut || '').replace(/[^0-9kK]/g, '').includes(rq)));
  return <>
    <Cabecera seccion="Administración" titulo="Usuarios" sub="Personas con acceso al portal. Las cuentas y contraseñas son las de Innova; aquí se asigna perfil, obra, jefatura y jornada."><DarAcceso /></Cabecera>
    <div className="row" style={{ marginBottom: 14 }}><div className="field" style={{ flex: '1 1 260px' }}><input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrar por nombre, RUT o correo" aria-label="Filtrar usuarios" /></div></div>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <div className="tw"><table><thead><tr><th>Nombre</th><th>RUT</th><th>Correo</th><th>Cargo · perfil</th><th>Obra</th><th>Jefatura</th><th>Último ingreso</th><th>Acciones</th></tr></thead><tbody className="stagger">
        {lista.map(u => <tr key={u.id_externo} className={u.activo === '1' ? '' : 'off'}>
          <td>{u.nombre}{u.activo !== '1' && <> <Chip c="neutral">Inactivo</Chip></>}{!u.acceso_innova && <> <span className="pill">sin acceso en Innova</span></>}</td>
          <td className="mono">{formatearRut(u.rut)}</td><td>{u.email}</td><td>{u.cargo}<div className="hint">{cat?.perfiles.find(p => +p.id_perfil === u.id_perfil)?.nombre || perfilLabel(u.id_perfil)}</div></td>
          <td>{u.obra_codigo ?? '—'}</td><td>{u.jefe_nombre ?? '—'}</td><td>{u.ultimo_ingreso ? fmtFechaHora(u.ultimo_ingreso) : 'Nunca'}</td>
          <td><div className="row" style={{ gap: 6, flexWrap: 'nowrap' }}>{cat && <AccionesUsuario u={u} cat={cat} yo={usuario?.id_externo || 0} />}{puede(PERMISO.ADMIN_PERMISOS) && <Link className="btn sm" href={`/pages/admin/permisos?usuario=${u.id_externo}`}>Permisos</Link>}</div></td>
        </tr>)}
      </tbody></table></div>
    )}
  </>;
}
