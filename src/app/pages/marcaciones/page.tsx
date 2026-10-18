'use client';
import { useState } from 'react';
import { descargarAsistencia, useApiMes } from '@/api/api_portal/Api_Marcas';
import { useApiDatosSolicitud } from '@/api/api_portal/Api_Sesion';
import { MARCA_ORDEN, ORIGEN_LABEL } from '@/libs/textos';
import { fmtFecha, fmtMin, mesActual, nombreMes } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga, NavMes } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { NuevaSolicitud } from '@/components/NuevaSolicitud';
import { useToast } from '@/components/ui/Toasts';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';
import type { Dia } from '@/api/api_portal/tipos';

export default function Marcaciones() {
  const [mes, setMes] = useState(mesActual());
  const { data: m, loading, error, refetch } = useApiMes(mes);
  const { data: datos } = useApiDatosSolicitud();
  const toast = useToast();
  const dias = m ? m.dias.filter(d => d.fecha <= m.hasta).reverse() : [];
  const pg = usePaginado(dias, 10, mes);
  const c = (d: Dia, t: keyof Dia['k']) => d.k[t]?.hora.slice(0, 5) ?? '—';
  return <>
    <Cabecera seccion="Control de asistencia" titulo="Mis marcaciones" sub={`${nombreMes(mes)}${m?.obra ? ' · ' + m.obra : ''}`}>
      <div className="row">
        <NavMes mes={mes} onCambio={setMes} max={mesActual()} />
        <button className="btn sm" onClick={() => descargarAsistencia(mes).catch(e => toast(e.message, false))}><Icono n="download" s={16} /> Exportar CSV</button>
        {datos && <NuevaSolicitud tipo="CORRECCION_MARCA" datos={datos} className="btn sm"><Icono n="pen" s={16} /> Solicitar corrección</NuevaSolicitud>}
      </div>
    </Cabecera>
    {loading && !m ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <><div className="tw"><table><thead><tr><th>Día</th><th className="num">Entrada</th><th className="num">Colación</th><th className="num">Salida</th><th className="num">Trabajadas</th><th>Origen</th><th>Estado</th></tr></thead>
        <tbody className="stagger" key={mes + pg.pagina}>
          {dias.length === 0 && <tr><td colSpan={7} className="muted">Sin días en este período.</td></tr>}
          {pg.items.map(d => {
            if (d.tipo === 'feriado') return <tr key={d.fecha} className="off"><td>{fmtFecha(d.fecha)}</td><td colSpan={6}>Feriado · {d.feriado}</td></tr>;
            if (d.tipo === 'descanso') return <tr key={d.fecha} className="off"><td>{fmtFecha(d.fecha)}</td><td colSpan={6}>Descanso</td></tr>;
            if (d.tipo === 'vacaciones') return <tr key={d.fecha} className="off"><td>{fmtFecha(d.fecha)}</td><td colSpan={6}>Vacaciones</td></tr>;
            let est;
            if (d.tipo === 'inasistencia') { const s = m!.solicitudes.filter(x => x.fecha === d.fecha && x.tipo === 'JUSTIFICAR_INASISTENCIA').pop(); est = s ? <Chip c={s.estado === 'APROBADA' ? 'ok' : s.estado === 'RECHAZADA' ? 'bad' : 'warn'}>{s.estado === 'APROBADA' ? 'Justificada' : 'Justificación ' + s.estado.toLowerCase()}</Chip> : <Chip c="bad">Inasistencia</Chip>; }
            else if (d.tipo === 'pendiente') est = <Chip c="neutral">Sin marcas aún</Chip>;
            else if (d.tipo === 'encurso') est = <Chip c="accent">Jornada en curso</Chip>;
            else if (d.tipo === 'incompleta') est = <Chip c="bad">Falta salida</Chip>;
            else est = d.atraso ? <Chip c="warn">Atraso {d.atraso} min</Chip> : d.he ? <Chip c="ok">HE {fmtMin(d.he)}</Chip> : <Chip c="neutral">Normal</Chip>;
            const corr = MARCA_ORDEN.some(t => d.k[t]?.correccion);
            return <tr key={d.fecha}><td>{fmtFecha(d.fecha)}</td><td className="num">{c(d, 'ENTRADA')}</td><td className="num">{c(d, 'INICIO_COLACION')}–{c(d, 'FIN_COLACION')}</td><td className="num">{c(d, 'SALIDA')}</td><td className="num">{d.tipo === 'trabajado' ? fmtMin(d.trab) : '—'}</td><td>{d.k.ENTRADA ? ORIGEN_LABEL[d.k.ENTRADA.origen] : '—'}{corr && <span className="pill" style={{ marginLeft: 6 }}>corregida</span>}</td><td>{est}</td></tr>;
          })}
        </tbody></table></div><Paginacion p={pg} etiqueta="días" opciones={[10, 16, 31]} /></>
    )}
  </>;
}
