'use client';
import { useState } from 'react';
import { useApiActividad } from '@/api/api_portal/Api_Sesion';
import { fmtLarga, hoy, sumarDias } from '@/libs/tiempo';
import { Cabecera, Cargando, ErrorCarga, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import type { Actividad as Ev } from '@/api/api_portal/tipos';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

const ICON: Record<string, string> = { marca: 'finger', sol: 'inbox', doc: 'doc', he: 'hour', turno: 'swap', firma: 'pen', ok: 'check', sesion: 'lock', admin: 'gear' };

export default function Actividad() {
  const [rango, setRango] = useState<'7' | '30' | 'todo'>('7');
  const { data, loading, error, refetch } = useApiActividad();
  const desde = rango === 'todo' ? '' : sumarDias(hoy(), -Number(rango));
  const filtrados = (data || []).filter(e => e.creada_en.slice(0, 10) >= desde);
  const pg = usePaginado(filtrados, 15, rango + (data?.length ?? 0));
  const grupos = new Map<string, Ev[]>();
  for (const e of pg.items) { const f = e.creada_en.slice(0, 10); grupos.set(f, [...(grupos.get(f) ?? []), e]); }
  return <>
    <Cabecera seccion="Control de asistencia" titulo="Registro de actividades" sub="Todo lo que hiciste en el portal, en orden.">
      <div className="segl" role="group" aria-label="Período">
        {([['7', 'Últimos 7 días'], ['30', '30 días'], ['todo', 'Todo']] as const).map(([v, l]) => <button key={v} type="button" aria-pressed={rango === v} onClick={() => setRango(v)}>{l}</button>)}
      </div>
    </Cabecera>
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <><section className="panel" key={rango + pg.pagina}>
        {grupos.size ? Array.from(grupos.entries()).map(([f, es]) => (
          <div key={f}><div className="tl-day">{fmtLarga(f)}</div>
            <div className="tl stagger">{es.map(e => (
              <div key={e.id} className="ev"><span className={'ic' + (e.tipo === 'marca' ? ' accent' : '')}><Icono n={ICON[e.tipo] || 'clock'} s={16} /></span><div><div dangerouslySetInnerHTML={{ __html: e.texto }} /><small>{e.creada_en.slice(11, 19)}</small></div></div>
            ))}</div></div>
        )) : <Vacio icono="history">No hay actividad en este período.</Vacio>}
      </section><Paginacion p={pg} etiqueta="eventos" opciones={[15, 30, 60]} /></>
    )}
  </>;
}
