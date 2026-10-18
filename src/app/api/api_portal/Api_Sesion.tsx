'use client';
import { apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { Actividad, DatosSolicitud, Dia, Notificacion, Obra, Resumen, Yo } from './tipos';
import type { TipoMarca } from '@/libs/textos';

export const useApiYo = (activo = true) => useApiPortal<Yo>(activo ? 'sesion/yo' : null);

export type Inicio = {
  hoy: string; marcas: Partial<Record<TipoMarca, string>>; siguiente: TipoMarca | null; pactado_min: number; turno_texto: string;
  obra: Pick<Obra, 'nombre' | 'codigo' | 'direccion'> | null; exigir_ubicacion: boolean; resumen: Resumen; incidencias_abiertas: number;
  actividad: Actividad[]; datos: DatosSolicitud;
};
export const useApiInicio = () => useApiPortal<Inicio>('sesion/inicio');
export const useApiDatosSolicitud = () => useApiPortal<DatosSolicitud>('sesion/datos_solicitud');
export const useApiActividad = () => useApiPortal<Actividad[]>('sesion/actividad');
export const useApiNotificaciones = (activo = true) => useApiPortal<Notificacion[]>(activo ? 'sesion/notificaciones' : null);

export const leerNotificaciones = () => apiPortalFetch<null>('sesion/notificaciones/leer', { method: 'POST', json: {} });
export const guardarPreferencias = (p: Partial<Record<'aviso_correo' | 'aviso_recordatorio' | 'aviso_respuestas', boolean>>) =>
  apiPortalFetch<null>('sesion/preferencias', { method: 'POST', json: p });
export const registrarIngreso = () => apiPortalFetch<null>('sesion/ingreso', { method: 'POST', json: {} });

export type { Dia };
