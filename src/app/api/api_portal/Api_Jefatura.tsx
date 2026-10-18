'use client';
import { apiPortalDescargar, apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { ModTurno, Resumen, Solicitud } from './tipos';

export type Equipo = {
  hoy: string; con_turno: number; presentes: number; atrasos: number; pendientes: number;
  filas: { id_externo: number; nombre: string; cargo: string; obra: string | null; entrada: string | null; salida: string | null; estado: string; color: string }[];
};
export const useApiEquipo = () => useApiPortal<Equipo>('jefatura/equipo');
export const useApiAprobaciones = () => useApiPortal<{ pendientes: Solicitud[]; resueltas: Solicitud[]; puede_autoaprobar: boolean }>('jefatura/aprobaciones');
export const resolverSolicitud = (id: string, aprobar: boolean, comentario: string) =>
  apiPortalFetch<null>(`jefatura/solicitudes/${id}/resolver`, { method: 'POST', json: { aprobar, comentario } });

export type Turnos = {
  lunes: string; dias: string[]; tipos: { codigo: string; nombre: string }[]; mod_turnos: ModTurno[];
  filas: { id_externo: number; nombre: string; cargo: string; dias: { fecha: string; valor: string; habitual: string }[] }[];
};
export const useApiTurnos = (semana: string) => useApiPortal<Turnos>(`jefatura/turnos?semana=${semana}`);
export const cambiarTurno = (id_externo: number, fecha: string, codigo: string) => apiPortalFetch<null>('jefatura/turnos', { method: 'POST', json: { id_externo, fecha, codigo } });

export const useApiReporteEquipo = (mes: string) =>
  useApiPortal<{ mes: string; nombre_mes: string; filas: { id_externo: number; nombre: string; rut: string; cargo: string; resumen: Resumen }[] }>(`jefatura/reporte?mes=${mes}`);
export const descargarReporteEquipo = (mes: string) => apiPortalDescargar(`jefatura/reporte/csv?mes=${mes}`, `equipo-${mes}.csv`);
