'use client';
import { apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { DatosSolicitud, Dia, Solicitud } from './tipos';

export const useApiHorasExtra = () => useApiPortal<{ lista: Dia[]; pendientes: number }>('horas_extra');
export const decidirHorasExtra = (fecha: string, aceptar: boolean) => apiPortalFetch<null>('horas_extra/decidir', { method: 'POST', json: { fecha, aceptar } });

export type Pacto = {
  bolsa: { pacto: { desde: string; hasta: string; meses: string } | null; acumulado: number; usado: number; saldo: number };
  pendiente: Solicitud | null; rechazada: Solicitud | null; datos: DatosSolicitud;
};
export const useApiPacto = () => useApiPortal<Pacto>('horas_extra/pacto');
