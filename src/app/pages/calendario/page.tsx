'use client';
import { useState } from 'react';
import { useApiMes } from '@/api/api_portal/Api_Marcas';
import { useApiDatosSolicitud } from '@/api/api_portal/Api_Sesion';
import type { Dia } from '@/api/api_portal/tipos';
import { ORIGEN_LABEL } from '@/libs/textos';
import { fmtCompleta, fmtLarga, fmtMin, mesActual, nombreMes, sumarMes } from '@/libs/tiempo';
import { Calendario, type CeldaDia } from '@/components/Calendario';
import { Cabecera, Cargando, ErrorCarga } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';

export default function PaginaCalendario() {
  const [mes, setMes] = useState(mesActual());
  const [dir, setDir] = useState('');
  const { data: m, loading, error, refetch } = useApiMes(mes);
  const { data: datos } = useApiDatosSolicitud();
  const ir = (n: number) => { setDir(n < 0 ? 'slide-r' : 'slide-l'); setMes(sumarMes(mes, n)); };

  let celdas: CeldaDia[] = [];
  if (m) {
    const solDe = (f: string, t: string) => m.solicitudes.filter(s => s.fecha === f && s.tipo === t).pop();
    const estado = (d: Dia): [string, string] => {
      switch (d.tipo) {
        case 'trabajado': return [d.atraso ? 'warn' : 'ok', `${d.k.ENTRADA!.hora.slice(0, 5)}–${d.k.SALIDA!.hora.slice(0, 5)}`];
        case 'inasistencia': { const s = solDe(d.fecha, 'JUSTIFICAR_INASISTENCIA'); return [s?.estado === 'APROBADA' ? 'ok' : 'bad', s ? (s.estado === 'APROBADA' ? 'Justificada' : 'Justificación ' + s.estado.toLowerCase()) : 'Inasistencia']; }
        case 'incompleta': return ['bad', 'Falta salida'];
        case 'encurso': case 'pendiente': return ['accent', 'Hoy'];
        case 'feriado': return ['hol', d.feriado!];
        case 'descanso': return ['rest', 'Descanso'];
        case 'vacaciones': return ['vac', 'Vacaciones'];
        default: return ['plan', d.turno ? `Turno ${d.turno.entrada.slice(0, 2)}–${d.turno.salida.slice(0, 2)}` : 'Sin turno'];
      }
    };
    const accion = (d: Dia) => {
      const j = solDe(d.fecha, 'JUSTIFICAR_INASISTENCIA');
      if (d.tipo === 'inasistencia' && (!j || j.estado === 'RECHAZADA')) return { tipo: 'JUSTIFICAR_INASISTENCIA', label: 'Justificar inasistencia' };
      if (d.tipo === 'incompleta' && !solDe(d.fecha, 'CORRECCION_MARCA')) return { tipo: 'CORRECCION_MARCA', label: 'Corregir marca' };
      if (d.atraso && !solDe(d.fecha, 'JUSTIFICAR_ATRASO')) return { tipo: 'JUSTIFICAR_ATRASO', label: 'Justificar atraso' };
      return null;
    };
    celdas = m.dias.map(d => {
      const [st, txt] = estado(d);
      return {
        fecha: d.fecha, n: +d.fecha.slice(8), st, txt, hoy: d.fecha === m.hoy, titulo: fmtCompleta(d.fecha), largo: fmtLarga(d.fecha),
        marcas: Object.fromEntries(Object.entries(d.k).map(([t, k]) => [t, k!.hora])), turno: d.turno ? `${d.turno.entrada}–${d.turno.salida}` : null,
        trab: fmtMin(d.trab), col: fmtMin(d.col), atraso: d.atraso, he: fmtMin(d.he), trabajado: d.tipo === 'trabajado',
        comprobante: d.k.ENTRADA?.comprobante ?? null, origen: d.k.ENTRADA ? ORIGEN_LABEL[d.k.ENTRADA.origen] : null, accion: accion(d),
      };
    });
  }
  return <>
    <Cabecera seccion="Control de asistencia" titulo="Mi calendario" sub="Tu asistencia, feriados y vacaciones del mes. Toca un día para ver sus marcas." />
    <section className="panel">
      <div className="cal-head">
        <button className="btn sm" onClick={() => ir(-1)} aria-label="Mes anterior"><Icono n="chevl" s={16} /></button>
        <h2>{nombreMes(mes)}</h2>
        <button className="btn sm" onClick={() => ir(1)} aria-label="Mes siguiente"><Icono n="chev" s={16} /></button>
      </div>
      {error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : !m || !datos ? (loading ? <Cargando /> : null) : (
        <Calendario key={mes} celdas={celdas} offset={m.offset} datos={datos} dir={dir} />
      )}
      <div className="legend"><span><i style={{ background: 'var(--ok)' }} />Normal</span><span><i style={{ background: 'var(--warn)' }} />Atraso</span><span><i style={{ background: 'var(--bad)' }} />Inasistencia o falta marca</span><span><i style={{ background: 'var(--accent-fg)' }} />Vacaciones</span></div>
    </section>
    <p className="hint" style={{ marginTop: 10 }}>Los días futuros muestran tu turno planificado.</p>
  </>;
}
