'use client';
import { apiPortalDescargar, apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { Solicitud } from './tipos';

export const useApiSolicitudes = () => useApiPortal<Solicitud[]>('solicitudes');
/** FormData con los mismos nombres de campo que espera la API (tipo, fecha, desde, hasta, hora_desde, ... adjunto) */
export const crearSolicitud = (fd: FormData) => apiPortalFetch<{ id: number; detalle: string }>('solicitudes', { method: 'POST', form: fd });
export const verAdjunto = (id: string | number) => apiPortalDescargar(`solicitudes/${id}/adjunto`, 'respaldo', true);
