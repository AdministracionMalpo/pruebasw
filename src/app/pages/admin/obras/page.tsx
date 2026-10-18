'use client';
import { useApiAdminObras } from '@/api/api_portal/Api_Admin';
import { PERMISO, usePermisos } from '@/contexts/UserContext';
import { NuevaObra, ToggleUbicacion } from '@/components/Admin';
import { Cabecera, Cargando, ErrorCarga, SinPermiso } from '@/components/ui/ui';
import { Paginacion, usePaginado } from '@/components/ui/Paginacion';

export default function Obras() {
  const { puede } = usePermisos();
  const { data: obras, loading, error, refetch } = useApiAdminObras();
  const pg = usePaginado(obras, 10);
  if (!puede(PERMISO.ADMIN_OBRAS)) return <SinPermiso />;
  return <>
    <Cabecera seccion="Administración" titulo="Obras" sub="Lugares de trabajo y validación de ubicación al marcar." />
    {loading && !obras ? <Cargando /> : error ? <ErrorCarga error={error} reintentar={() => refetch()} /> : (
      <><div className="tw"><table><thead><tr><th>Código</th><th>Nombre</th><th>Dirección</th><th className="num">Personas</th><th>Coordenadas</th><th>Ubicación</th></tr></thead><tbody className="stagger">
        {obras!.length ? pg.items.map(o => <tr key={o.id}><td>{o.codigo}</td><td>{o.nombre}</td><td>{o.direccion}</td><td className="num">{o.personas ?? 0}</td><td className="mono">{o.latitud != null ? `${Number(o.latitud).toFixed(4)}, ${Number(o.longitud).toFixed(4)} · ${o.radio_metros} m` : '—'}</td><td><ToggleUbicacion key={o.id + o.exigir_ubicacion} id={o.id} valor={o.exigir_ubicacion === '1'} /></td></tr>)
          : <tr><td colSpan={6} className="muted">Aún no hay obras.</td></tr>}
      </tbody></table></div><Paginacion p={pg} etiqueta="obras" /><div style={{ height: 20 }} /></>
    )}
    <section className="panel"><h3>Nueva obra</h3><NuevaObra /></section>
  </>;
}
