'use client';
import { useState } from 'react';
import { useApiAprobaciones } from '@/api/api_portal/Api_Jefatura';
import { verAdjunto } from '@/api/api_portal/Api_Solicitudes';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { ESTADO_CHIP, ESTADO_LABEL, SOLICITUD_ICONO, SOLICITUD_LABEL } from '@/libs/textos';
import { fmtFechaHora } from '@/libs/tiempo';
import { Aprobacion } from '@/components/Acciones';
import { Cabecera, Cargando, Chip, ErrorCarga, SinPermiso, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { useToast } from '@/components/ui/Toasts';

export default function Aprobaciones() {
  const { puede, usuario } = usePermisos();
  const { data, loading, error, refetch } = useApiAprobaciones();
  const [filtro, setFiltro] = useState('TODAS');
  const toast = useToast();
  if (!puede(PERMISO.APROBAR)) return <SinPermiso />;
  const pend = data?.pendientes || [], hist = data?.resueltas || [];
  const tipos = Array.from(new Set(pend.map(s => s.tipo)));
  const f = tipos.includes(filtro) ? filtro : 'TODAS';
  const lista = pend.filter(s => f === 'TODAS' || s.tipo === f);
  const respaldo = (id: string) => verAdjunto(id).catch(e => toast(e.message, false));
  return <>
    <Cabecera seccion="Jefatura" titulo="Aprobaciones" sub={usuario?.es_admin ? 'Solicitudes de todos los trabajadores.' : 'Solicitudes de tu equipo.'} />
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : <>
      <h2 style={{ marginBottom: 10 }}>Pendientes · {pend.length}</h2>
      {pend.length > 0 && <div className="filters" role="group" aria-label="Filtrar por tipo">
        {['TODAS', ...tipos].map(t => <button key={t} type="button" aria-pressed={f === t} onClick={() => setFiltro(t)}>{t === 'TODAS' ? 'Todas' : SOLICITUD_LABEL[t]}</button>)}
      </div>}
      <div className="list stagger" style={{ marginBottom: 28 }}>
        {lista.length ? lista.map(s => (
          <div key={s.id} className="item">
            <span className="ic warn"><Icono n={SOLICITUD_ICONO[s.tipo]} /></span>
            <div><b>{SOLICITUD_LABEL[s.tipo]}</b><div className="meta">{s.nombre} · {s.cargo} · {s.detalle}</div>{s.motivo && <div className="meta">“{s.motivo}”</div>}
              <div className="meta">Enviada {fmtFechaHora(s.creada_en)}{s.tiene_adjunto && <> · <button className="link" style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', font: 'inherit' }} onClick={() => respaldo(s.id)}>Ver respaldo</button></>}</div></div>
            {s.propia && !data!.puede_autoaprobar ? <div className="actions"><Chip c="neutral">La aprueba tu jefatura</Chip></div> : <Aprobacion id={s.id} nombre={s.nombre || ''} />}
          </div>
        )) : <Vacio>No hay solicitudes pendientes.</Vacio>}
      </div>
      <h2 style={{ marginBottom: 10 }}>Resueltas recientemente</h2>
      <div className="list stagger">
        {hist.length ? hist.map(s => (
          <div key={s.id} className="item">
            <span className={'ic ' + ESTADO_CHIP[s.estado]}><Icono n={SOLICITUD_ICONO[s.tipo]} /></span>
            <div><b>{SOLICITUD_LABEL[s.tipo]}</b><div className="meta">{s.nombre} · {s.detalle} · resuelta por {s.revisor ?? '—'}{s.resuelta_en ? ' el ' + fmtFechaHora(s.resuelta_en) : ''}</div></div>
            <div className="actions"><Chip c={ESTADO_CHIP[s.estado]}>{ESTADO_LABEL[s.estado]}</Chip></div>
            {s.comentario && <div className="note"><b>Comentario:</b> {s.comentario}</div>}
          </div>
        )) : <Vacio icono="inbox">Aún no hay solicitudes resueltas.</Vacio>}
      </div>
    </>}
  </>;
}
