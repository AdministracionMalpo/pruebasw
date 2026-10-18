'use client';
import { descargarDocumento, useApiDocumentos } from '@/api/api_portal/Api_Documentos';
import { fmtFechaHora } from '@/libs/tiempo';
import { FirmarDocumento } from '@/components/Acciones';
import { Cabecera, Cargando, Chip, ErrorCarga, Vacio } from '@/components/ui/ui';
import { Icono } from '@/components/ui/Icono';
import { useToast } from '@/components/ui/Toasts';

export default function Documentos() {
  const { data, loading, error, refetch } = useApiDocumentos();
  const toast = useToast();
  const docs = (data || []).slice().sort((a, b) => Number(!!a.firmado_en || a.requiere_firma !== '1') - Number(!!b.firmado_en || b.requiere_firma !== '1'));
  return <>
    <Cabecera titulo="Gestión documental" sub="Contratos, liquidaciones y actas que Recursos Humanos publicó para ti." />
    {loading && !data ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <div className="list stagger">
        {docs.length ? docs.map(d => {
          const pendiente = d.requiere_firma === '1' && !d.firmado_en;
          return <div key={d.id} className="item">
            <span className={'ic' + (pendiente ? ' warn' : '')}><Icono n="doc" /></span>
            <div><b>{d.nombre}</b><div className="meta">{d.tipo} · publicado {fmtFechaHora(d.publicado_en)}{d.firmado_en ? ' · firmado ' + fmtFechaHora(d.firmado_en) : ''}</div>{d.descripcion && <div className="meta">{d.descripcion}</div>}</div>
            <div className="actions">
              <Chip c={pendiente ? 'warn' : d.firmado_en ? 'ok' : 'neutral'}>{pendiente ? 'Firma pendiente' : d.firmado_en ? 'Firmado' : 'Disponible'}</Chip>
              {d.tiene_archivo && <button className="btn sm" onClick={() => descargarDocumento(d.id, d.archivo_nombre || 'documento.pdf').catch(e => toast(e.message, false))}><Icono n="download" s={14} /> Descargar</button>}
              {pendiente && <FirmarDocumento id={d.id} nombre={d.nombre} />}
            </div>
          </div>;
        }) : <Vacio icono="doc">Aún no tienes documentos publicados.</Vacio>}
      </div>
    )}
  </>;
}
