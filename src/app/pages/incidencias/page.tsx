'use client';
import Link from 'next/link';
import { useApiIncidencias } from '@/api/api_portal/Api_Marcas';
import { useApiDatosSolicitud } from '@/api/api_portal/Api_Sesion';
import { fmtFecha } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { NuevaSolicitud } from '@/components/NuevaSolicitud';

export default function Incidencias() {
  const { data, loading, error, refetch } = useApiIncidencias();
  const { data: datos } = useApiDatosSolicitud();
  const n = data?.abiertas ?? 0;
  return <>
    <Cabecera seccion="Control de asistencia" titulo="Incidencias" sub="Lo que el sistema detectó en tus marcaciones del mes actual y el anterior.">{data && <Chip c={n ? 'warn' : 'ok'}>{n} por resolver</Chip>}</Cabecera>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <div className="list stagger">
        {data!.lista.length ? data!.lista.map(i => {
          let act, cls = 'warn';
          if (i.he) act = <Link className="btn sm primary" href="/pages/horas_extra">Revisar</Link>;
          else if (i.estado_sol && i.estado_sol !== 'RECHAZADA') { act = <Chip c={i.estado_sol === 'APROBADA' ? 'ok' : 'neutral'}>{i.estado_sol === 'APROBADA' ? 'Resuelta' : 'En revisión'}</Chip>; cls = i.estado_sol === 'APROBADA' ? 'ok' : ''; }
          else { act = <>{i.estado_sol && <Chip c="bad">Rechazada</Chip>}{datos && <NuevaSolicitud tipo={i.sol_tipo!} fecha={i.fecha} datos={datos} className="btn sm primary">{i.sol_tipo!.startsWith('JUSTIFICAR') ? 'Justificar' : 'Corregir'}</NuevaSolicitud>}</>; if (i.tipo === 'Inasistencia') cls = 'bad'; }
          return <div key={i.fecha + i.tipo} className="item"><span className={'ic ' + cls}><Icono n={i.icono} /></span><div><b>{i.tipo}</b><div className="meta">{fmtFecha(i.fecha, { weekday: 'long', day: 'numeric', month: 'long' })} · {i.texto}</div></div><div className="actions">{act}</div></div>;
        }) : <Vacio>No tienes incidencias pendientes.</Vacio>}
      </div>
    )}
  </>;
}
