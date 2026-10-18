'use client';
import { useApiHorasExtra } from '@/api/api_portal/Api_HorasExtra';
import { fmtFecha, fmtMin } from '@/libs/tiempo';
import { BotonesHE } from '@/components/Acciones';
import { Cabecera, Cargando, Chip, ErrorCarga, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

export default function HorasExtra() {
  const { data, loading, error, refetch } = useApiHorasExtra();
  const pg = usePaginado(data?.lista, 10);
  return <>
    <Cabecera seccion="Horas extras" titulo="Aceptación de horas extras" sub="Confirma las horas extra que trabajaste. Se cuentan desde 15 minutos después del término del turno; la ley permite un máximo de 2 horas extra por día.">{!!data?.pendientes && <Chip c="warn">{data.pendientes} por aceptar</Chip>}</Cabecera>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <><div className="list stagger" key={pg.pagina}>
        {data!.lista.length ? pg.items.map(d => {
          const st = d.estado;
          return <div key={d.fecha} className="item"><span className={'ic ' + (st === 'ACEPTADA' ? 'ok' : st ? 'bad' : 'warn')}><Icono n="hour" /></span>
            <div><b>{fmtMin(d.he)} h extra · {fmtFecha(d.fecha, { weekday: 'long', day: 'numeric', month: 'long' })}</b><div className="meta">Fin de turno {d.turno?.salida ?? '—'} · salida {d.k.SALIDA?.hora.slice(0, 5)}{d.he > 120 && <span style={{ color: 'var(--bad)' }}> · supera el máximo legal de 2 h diarias</span>}</div></div>
            <div className="actions">{st ? <Chip c={st === 'ACEPTADA' ? 'ok' : 'bad'}>{st === 'ACEPTADA' ? 'Aceptada' : 'Rechazada'}</Chip> : <BotonesHE fecha={d.fecha} />}</div></div>;
        }) : <Vacio icono="hour">No tienes horas extra en los últimos 60 días.</Vacio>}
      </div><Paginacion p={pg} etiqueta="días" /></>
    )}
    <p className="hint" style={{ marginTop: 12 }}>Las horas extra aceptadas se pagan con recargo de 50% o, si tienes un pacto de compensación vigente, se suman a tu bolsa de horas.</p>
  </>;
}
