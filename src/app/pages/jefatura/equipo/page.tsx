'use client';
import Link from 'next/link';
import { useApiEquipo } from '@/api/api_portal/Api_Jefatura';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { fmtCompleta } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga, SinPermiso, Vacio } from '@/components/ui/ui';
import { Num } from '@/components/ui/Num';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

export default function Equipo() {
  const { puede } = usePermisos();
  const ok = puede(PERMISO.EQUIPO);
  const { data: e, loading, error, refetch } = useApiEquipo();
  const pg = usePaginado(e?.filas, 15);
  if (!ok) return <SinPermiso />;
  return <>
    <Cabecera seccion="Jefatura" titulo="Equipo hoy" sub={e ? fmtCompleta(e.hoy) : ''} />
    {loading && !e ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : e && <>
      <div className="grid g4 stagger" style={{ marginBottom: 20 }}>
        <div className="panel kpi"><div className="label">Presentes</div><div className="v"><Num v={e.presentes} />/{e.con_turno}</div><div className="meter"><i style={{ width: `${e.con_turno ? Math.round((e.presentes / e.con_turno) * 100) : 0}%` }} /></div></div>
        <div className="panel kpi"><div className="label">Atrasos</div><div className="v"><Num v={e.atrasos} /></div></div>
        <div className="panel kpi"><div className="label">Sin marca</div><div className="v"><Num v={e.con_turno - e.presentes} /></div></div>
        <div className="panel kpi"><div className="label">Por aprobar</div><div className="v"><Num v={e.pendientes} /></div>{puede(PERMISO.APROBAR) && <Link className="btn sm" href="/pages/jefatura/aprobaciones" style={{ marginTop: 6 }}>Revisar</Link>}</div>
      </div>
      {e.filas.length ? (
        <div className="tw"><table><thead><tr><th>Trabajador</th><th>Cargo</th><th>Obra</th><th className="num">Entrada</th><th className="num">Salida</th><th>Estado</th></tr></thead><tbody className="stagger" key={pg.pagina}>
          {pg.items.map(p => <tr key={p.id_externo}><td>{p.nombre}</td><td>{p.cargo}</td><td>{p.obra ?? '—'}</td><td className="num">{p.entrada ?? '—'}</td><td className="num">{p.salida ?? '—'}</td><td><Chip c={p.color}>{p.estado}</Chip></td></tr>)}
        </tbody></table></div>
      ) : null}
      {e.filas.length ? <Paginacion p={pg} etiqueta="personas" opciones={[15, 30, 60]} /> : <Vacio icono="users">Aún no tienes personas a cargo. RR.HH. puede asignarlas en Administración → Usuarios.</Vacio>}
    </>}
  </>;
}
