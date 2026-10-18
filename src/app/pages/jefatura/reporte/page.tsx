'use client';
import { useState } from 'react';
import { descargarReporteEquipo, useApiReporteEquipo } from '@/api/api_portal/Api_Jefatura';
import { descargarAsistencia } from '@/api/api_portal/Api_Marcas';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { fmtMin, mesActual, nombreMes } from '@/libs/tiempo';
import { Cabecera, Cargando, ErrorCarga, NavMes, SinPermiso, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { useToast } from '@/components/ui/Toasts';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

export default function ReporteEquipo() {
  const { puede } = usePermisos();
  const [mes, setMes] = useState(mesActual());
  const { data, loading, error, refetch } = useApiReporteEquipo(mes);
  const toast = useToast();
  const filas = data?.filas || [];
  const pg = usePaginado(filas, 15, mes);
  if (!puede(PERMISO.REPORTE_EQUIPO)) return <SinPermiso />;
  const max = Math.max(1, ...filas.map(f => f.resumen.atr));
  return <>
    <Cabecera seccion="Jefatura" titulo="Reporte del equipo" sub={nombreMes(mes)}>
      <div className="row">
        <NavMes mes={mes} onCambio={setMes} max={mesActual()} />
        <button className="btn sm" onClick={() => descargarReporteEquipo(mes).catch(e => toast(e.message, false))}><Icono n="download" s={16} /> Exportar CSV</button>
      </div>
    </Cabecera>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : filas.length ? <div className="tw"><table><thead><tr><th>Trabajador</th><th>Cargo</th><th className="num">Días trab.</th><th className="num">Horas</th><th>Atraso acumulado</th><th className="num">Horas extra</th><th className="num">Inasist.</th><th /></tr></thead><tbody className="stagger" key={mes + pg.pagina}>
      {pg.items.map(({ id_externo, nombre, cargo, resumen: r }) => <tr key={id_externo}><td>{nombre}</td><td>{cargo}</td><td className="num">{r.dias}</td><td className="num">{fmtMin(r.trab)}</td>
        <td><div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}><div className="meter" style={{ width: 90, margin: 0 }}><i style={{ width: `${Math.round((r.atr / max) * 100)}%`, background: 'var(--warn)' }} /></div><span className="mono">{r.atr} min</span></div></td>
        <td className="num">{fmtMin(r.he)}</td><td className="num">{r.ina}</td><td><button className="link" style={{ background: 'none', border: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => descargarAsistencia(mes, id_externo).catch(e => toast(e.message, false))}>CSV</button></td></tr>)}
    </tbody></table></div> : <Vacio icono="users">Aún no tienes personas a cargo.</Vacio>}
    {filas.length > 0 && <Paginacion p={pg} etiqueta="personas" opciones={[15, 30, 60]} />}
  </>;
}
