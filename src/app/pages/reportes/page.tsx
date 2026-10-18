'use client';
import { useState } from 'react';
import { descargarAsistencia } from '@/api/api_portal/Api_Marcas';
import { useApiReportes } from '@/api/api_portal/Api_Reportes';
import { fmtFecha, fmtFechaHora, fmtMin, mesActual, nombreMes } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga, GraficoHoras, NavMes } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { Num } from '@/components/ui/Num';
import { useToast } from '@/components/ui/Toasts';

const TABS = [['asistencia', 'Asistencia y jornada'], ['he', 'Horas extra'], ['festivos', 'Domingos y festivos'], ['turnos', 'Modificaciones de turno']] as const;

export default function Reportes() {
  const [mes, setMes] = useState(mesActual());
  const [tab, setTab] = useState<typeof TABS[number][0]>('asistencia');
  const { data: rp, loading, error, refetch } = useApiReportes(mes);
  const toast = useToast();
  let cuerpo = null;
  if (rp) {
    const ds = rp.dias, r = rp.resumen;
    if (tab === 'asistencia') cuerpo = <>
      <GraficoHoras dias={ds} />
      <div className="tw" style={{ marginTop: 16 }}><table><thead><tr><th>Día</th><th>Turno</th><th className="num">Entrada</th><th className="num">Salida</th><th className="num">Colación</th><th className="num">Trabajadas</th><th className="num">Pactadas</th><th className="num">Atraso</th></tr></thead><tbody>
        {ds.filter(d => ['trabajado', 'inasistencia', 'incompleta'].includes(d.tipo)).map(d => d.tipo !== 'trabajado'
          ? <tr key={d.fecha}><td>{fmtFecha(d.fecha)}</td><td>{d.turno ? `${d.turno.entrada}–${d.turno.salida}` : '—'}</td><td colSpan={6}>{d.tipo === 'inasistencia' ? 'Inasistencia' : 'Marca de salida faltante'}</td></tr>
          : <tr key={d.fecha}><td>{fmtFecha(d.fecha)}</td><td>{d.turno ? `${d.turno.entrada}–${d.turno.salida}` : 'Sin turno'}</td><td className="num">{d.k.ENTRADA!.hora.slice(0, 5)}</td><td className="num">{d.k.SALIDA!.hora.slice(0, 5)}</td><td className="num">{fmtMin(d.col)}</td><td className="num">{fmtMin(d.trab)}</td><td className="num">{fmtMin(d.pact)}</td><td className="num">{d.atraso ? d.atraso + ' min' : '—'}</td></tr>)}
      </tbody></table></div></>;
    else if (tab === 'he') {
      const he = ds.filter(d => d.he);
      cuerpo = <div className="tw"><table><thead><tr><th>Día</th><th className="num">Fin de turno</th><th className="num">Salida</th><th className="num">Horas extra</th><th>Estado</th></tr></thead><tbody>
        {he.map(d => { const s = rp.he_estado[d.fecha]; return <tr key={d.fecha}><td>{fmtFecha(d.fecha)}</td><td className="num">{d.turno?.salida ?? '—'}</td><td className="num">{d.k.SALIDA!.hora.slice(0, 5)}</td><td className="num">{fmtMin(d.he)}</td><td><Chip c={s === 'ACEPTADA' ? 'ok' : s ? 'bad' : 'warn'}>{s === 'ACEPTADA' ? 'Aceptada' : s ? 'Rechazada' : 'Por aceptar'}</Chip></td></tr>; })}
        <tr><td><b>Total</b></td><td /><td /><td className="num"><b>{fmtMin(r.he)}</b></td><td /></tr></tbody></table></div>;
    } else if (tab === 'festivos') {
      cuerpo = <div className="tw"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Estado</th></tr></thead><tbody>{rp.festivos.map(f => <tr key={f.fecha}><td>{fmtFecha(f.fecha, { weekday: 'long', day: 'numeric', month: 'short' })}</td><td>{f.tipo}</td><td><Chip c={f.trabajado ? 'warn' : 'neutral'}>{f.trabajado ? 'Trabajado' : 'No trabajado'}</Chip></td></tr>)}</tbody></table></div>;
    } else {
      const l = rp.mod_turnos;
      cuerpo = <div className="tw"><table><thead><tr><th>Registrado</th><th>Aplica</th><th>Antes</th><th>Después</th><th>Hecho por</th><th>Motivo</th></tr></thead><tbody>
        {l.length ? l.map(m => <tr key={m.id}><td>{fmtFechaHora(m.creado_en)}</td><td>{/^\d{4}-/.test(m.aplica) ? fmtFecha(m.aplica) : m.aplica}</td><td>{m.antes}</td><td><b>{m.despues}</b></td><td>{m.autor ?? 'Sistema'}</td><td>{m.motivo}</td></tr>) : <tr><td colSpan={6} className="muted">Sin modificaciones registradas.</td></tr>}
      </tbody></table></div>;
    }
  }
  const r = rp?.resumen;
  return <>
    <Cabecera titulo="Reportes" sub={`${nombreMes(mes)}${mes === mesActual() ? ' a la fecha' : ''}`}>
      <div className="row">
        <NavMes mes={mes} onCambio={setMes} max={mesActual()} />
        <button className="btn sm" onClick={() => descargarAsistencia(mes).catch(e => toast(e.message, false))}><Icono n="download" s={16} /> Exportar CSV</button>
      </div>
    </Cabecera>
    {loading && !rp ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : r && <>
      <div className="grid g4 stagger" style={{ marginBottom: 20 }} key={mes}>
        <div className="panel kpi"><div className="label">Días trabajados</div><div className="v"><Num v={r.dias} /></div><div className="s">{r.ina} inasistencia{r.ina === 1 ? '' : 's'}</div></div>
        <div className="panel kpi"><div className="label">Horas trabajadas</div><div className="v"><Num v={r.trab} f="hm" /></div><div className="s">de {fmtMin(r.pact)} pactadas</div><div className="meter"><i style={{ width: `${r.pact ? Math.min(100, Math.round((r.trab / r.pact) * 100)) : 0}%` }} /></div></div>
        <div className="panel kpi"><div className="label">Atrasos</div><div className="v"><Num v={r.atr} f="min" /></div><div className="s">{r.natr} día{r.natr === 1 ? '' : 's'} con atraso</div></div>
        <div className="panel kpi"><div className="label">Horas extra</div><div className="v"><Num v={r.he} f="hm" /></div><div className="s">{fmtMin(rp!.aceptadas)} h aceptadas</div></div>
      </div>
      <div className="tabs" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
      <div className="tabpane" key={tab + mes}>{cuerpo}</div>
    </>}
  </>;
}
