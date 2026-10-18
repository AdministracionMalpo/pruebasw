'use client';
import { useApiAdminDocumentos, useApiAdminUsuarios } from '@/api/api_portal/Api_Admin';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { fmtFechaHora } from '@/libs/tiempo';
import { PublicarDocumento } from '@/components/Admin';
import { Cabecera, Chip, SinPermiso } from '@/components/ui/ui';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

export default function AdminDocumentos() {
  const { puede } = usePermisos();
  const ok = puede(PERMISO.ADMIN_DOCUMENTOS);
  const { data: usuarios } = useApiAdminUsuarios();
  const { data: recientes } = useApiAdminDocumentos();
  const pg = usePaginado(recientes, 8);
  if (!ok) return <SinPermiso />;
  return <>
    <Cabecera seccion="Administración" titulo="Publicar documentos" sub="Liquidaciones, contratos, anexos y actas. Cada persona ve solo los suyos." />
    <div className="grid g2" style={{ alignItems: 'start' }}>
      <section className="panel"><h3>Nuevo documento</h3><PublicarDocumento usuarios={(usuarios || []).filter(u => u.activo === '1').map(u => ({ id: u.id_externo, nombre: u.nombre }))} /></section>
      <section className="panel"><h3>Publicados recientemente</h3>
        <div className="stack" style={{ gap: 0 }}>
          {recientes?.length ? pg.items.map(d => <div key={d.id} className="item" style={{ padding: '10px 0' }}><div><b>{d.nombre}</b><div className="meta">{d.persona ?? '—'} · {fmtFechaHora(d.publicado_en)}</div></div>
            <div className="actions">{d.requiere_firma === '1' ? <Chip c={d.firmado_en ? 'ok' : 'warn'}>{d.firmado_en ? 'Firmado' : 'Sin firmar'}</Chip> : <Chip c="neutral">Informativo</Chip>}</div></div>) : <p className="hint">{recientes ? 'Aún no hay documentos.' : 'Cargando…'}</p>}
        </div>
        <Paginacion p={pg} etiqueta="documentos" opciones={[8, 20, 40]} />
      </section>
    </div>
  </>;
}
