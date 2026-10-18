'use client';
import Link from 'next/link';
import { useApiInicio } from '@/api/api_portal/Api_Sesion';
import { usePermisos } from '@/contexts/UserContext';
import { fmtCompleta, fmtFecha, nombreMes } from '@/libs/tiempo';
import { Icono } from '@/components/ui/Icono';
import { Marcador } from '@/components/Marcador';
import { NuevaSolicitud } from '@/components/NuevaSolicitud';
import { Num } from '@/components/ui/Num';
import { Cargando, ErrorCarga } from '@/components/ui/ui';

const ICON_EV: Record<string, string> = { marca: 'finger', sol: 'inbox', doc: 'doc', he: 'hour', turno: 'swap', firma: 'pen', ok: 'check', sesion: 'lock', admin: 'gear' };

export default function Inicio() {
  const { usuario: u } = usePermisos();
  const { data: d, loading, error, refetch } = useApiInicio();
  if (loading && !d) return <Cargando />;
  if (error || !d || !u) return <ErrorCarga error={error || 'Sin datos'} reintentar={() => refetch()} />;
  const datos = d.datos, h = d.hoy, r = d.resumen, nInc = d.incidencias_abiertas;
  const tile = (tipo: string, icono: string, titulo: string, sub: string, dis = false) => (
    <NuevaSolicitud tipo={tipo} datos={datos} className="tile" disabled={dis}><span className="ic"><Icono n={icono} /></span><div><b>{titulo}</b><span>{sub}</span></div></NuevaSolicitud>
  );
  return <>
    <div className="head">
      <div><h1>Hola, {u.nombre.split(' ')[0]}</h1><p className="muted">{u.obra ? `Que tengas una buena jornada en ${u.obra.nombre}.` : 'Que tengas una buena jornada.'}</p></div>
      <div className="hdate" style={{ textAlign: 'right' }}><div className="label" style={{ color: 'var(--accent-fg)' }}>Constructora Malpo SpA</div><div className="muted" style={{ fontSize: '.88rem' }}>{fmtCompleta(h)}</div></div>
    </div>
    <div className="grid home">
      <div className="stack">
        <Marcador marcas={d.marcas} pactadoMin={d.pactado_min} turnoTexto={d.turno_texto} obra={d.obra} exigirUbicacion={d.exigir_ubicacion} />
        <section className="panel">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}><h3>Actividad reciente</h3><Link className="btn sm" href="/pages/actividad">Ver todo</Link></div>
          <div className="tl stagger">
            {d.actividad.length ? d.actividad.map(e => (
              <div key={e.id} className="ev"><span className={'ic' + (e.tipo === 'marca' ? ' accent' : '')}><Icono n={ICON_EV[e.tipo] || 'clock'} s={16} /></span>
                <div><div dangerouslySetInnerHTML={{ __html: e.texto }} /><small>{fmtFecha(e.creada_en, { day: 'numeric', month: 'short' })} · {e.creada_en.slice(11, 16)}</small></div></div>
            )) : <p className="hint">Aún no hay actividad.</p>}
          </div>
        </section>
      </div>
      <div className="stack">
        <section className="panel">
          <h3 className="sec-t">Control de asistencia</h3>
          <div className="tiles stagger">
            <Link className="tile" href="/pages/incidencias"><span className="ic"><Icono n="alert" /></span><div><b>Incidencias</b><span>{nInc ? `${nInc} por revisar` : 'Todo al día'}</span></div>{nInc > 0 && <span className="count">{nInc}</span>}</Link>
            <Link className="tile" href="/pages/calendario"><span className="ic"><Icono n="cal" /></span><div><b>Mi calendario</b><span>{nombreMes(h.slice(0, 7))}</span></div></Link>
          </div>
          <h3 className="sec-t">Solicitudes</h3>
          <div className="tiles stagger">
            {tile('VACACIONES', 'beach', 'Vacaciones', `Saldo ${datos.saldo_vac.toLocaleString('es-CL')} días`)}
            {tile('PERMISO_SALIDA', 'exit', 'Permiso de salida', 'Por horas')}
            {tile('CAMBIO_TURNO', 'swap', 'Cambio de turno', 'Otro horario')}
            {tile('PACTO_HE', 'pact', 'Pacto de compensación H.E.', datos.pacto_vigente ? 'Vigente' : datos.pacto_pendiente ? 'En revisión' : 'Sin pacto vigente', datos.pacto_vigente || datos.pacto_pendiente)}
            {tile('USO_HE', datos.pacto_vigente ? 'hour' : 'lock', 'Uso H.E. compensadas', datos.pacto_vigente ? `Bolsa ${Math.floor(datos.bolsa_min / 60)}:${String(datos.bolsa_min % 60).padStart(2, '0')} h` : 'Requiere pacto vigente', !datos.pacto_vigente || datos.bolsa_min < 60)}
          </div>
          {!datos.pacto_vigente && <p className="hint" style={{ marginTop: 8 }}>Para usar horas extra compensadas necesitas un pacto de compensación vigente.</p>}
          <h3 className="sec-t">Justificaciones</h3>
          <div className="tiles stagger">
            {tile('JUSTIFICAR_INASISTENCIA', 'sick', 'Inasistencia', 'Adjunta licencia')}
            {tile('JUSTIFICAR_ATRASO', 'late', 'Atraso', 'Con o sin respaldo')}
          </div>
        </section>
        <section className="panel">
          <h3>{nombreMes(h.slice(0, 7))} a la fecha</h3>
          <div className="grid g4 stagger" style={{ gap: 12 }}>
            <div className="kpi"><div className="v"><Num v={r.dias} /></div><div className="s">días trabajados</div></div>
            <div className="kpi"><div className="v"><Num v={r.he} f="hm" /></div><div className="s">horas extra</div></div>
            <div className="kpi"><div className="v"><Num v={r.atr} f="min" /></div><div className="s">atraso en {r.natr} días</div></div>
            <div className="kpi"><div className="v"><Num v={datos.saldo_vac} f="dec" /></div><div className="s">días de vacaciones</div></div>
          </div>
        </section>
      </div>
    </div>
  </>;
}
