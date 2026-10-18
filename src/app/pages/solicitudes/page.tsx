'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useApiDatosSolicitud } from '@/api/api_portal/Api_Sesion';
import { useApiSolicitudes, verAdjunto } from '@/api/api_portal/Api_Solicitudes';
import { ESTADO_CHIP, ESTADO_LABEL, SOLICITUD_ICONO, SOLICITUD_LABEL } from '@/libs/textos';
import { fmtFechaHora } from '@/libs/tiempo';
import { Cabecera, Cargando, Chip, ErrorCarga, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { NuevaSolicitud } from '@/components/NuevaSolicitud';
import { useToast } from '@/components/ui/Toasts';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

function Contenido() {
  const params = useSearchParams();
  const tipo = params.get('tipo');
  const { data: lista, loading, error, refetch } = useApiSolicitudes();
  const { data: datos } = useApiDatosSolicitud();
  const toast = useToast();
  const pg = usePaginado(lista, 10);
  return <>
    <Cabecera titulo="Solicitudes" sub="Vacaciones, permisos, cambios de turno, horas extra y justificaciones.">
      {datos && <NuevaSolicitud tipo={tipo && SOLICITUD_LABEL[tipo] ? tipo : 'VACACIONES'} datos={datos}><Icono n="plus" s={16} /> Nueva solicitud</NuevaSolicitud>}
    </Cabecera>
    {loading && !lista ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <><div className="list stagger" key={pg.pagina}>
        {lista!.length ? pg.items.map(s => (
          <div key={s.id} className="item">
            <span className={'ic ' + ESTADO_CHIP[s.estado]}><Icono n={SOLICITUD_ICONO[s.tipo]} /></span>
            <div><b>{SOLICITUD_LABEL[s.tipo]}</b><div className="meta">{s.detalle} · enviada {fmtFechaHora(s.creada_en)}</div>{s.motivo && <div className="meta">“{s.motivo}”</div>}
              {s.tiene_adjunto && <button className="link" style={{ fontSize: '.85rem', background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={() => verAdjunto(s.id).catch(e => toast(e.message, false))}>Ver respaldo</button>}</div>
            <div className="actions"><Chip c={ESTADO_CHIP[s.estado]}>{ESTADO_LABEL[s.estado]}</Chip></div>
            {s.comentario && <div className="note"><b>{s.revisor ?? 'Jefatura'}:</b> {s.comentario}</div>}
          </div>
        )) : <Vacio icono="inbox">Aún no tienes solicitudes.</Vacio>}
      </div><Paginacion p={pg} etiqueta="solicitudes" /></>
    )}
  </>;
}

export default function Solicitudes() {
  return <Suspense fallback={<Cargando />}><Contenido /></Suspense>;
}
