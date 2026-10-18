'use client';
import { apiPortalDescargar, apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { Dia, Incidencia, Solicitud } from './tipos';
import type { TipoMarca } from '@/libs/textos';

export type ResultadoMarca = { tipo: TipoMarca; hora: string; fecha: string; comprobante: string; hash: string; correo: boolean };
/** La hora la pone el servidor; aquí solo se envía el tipo y (si hay) la ubicación */
export const marcar = (tipo: TipoMarca, latitud: number | null, longitud: number | null) =>
  apiPortalFetch<ResultadoMarca>('marcas', { method: 'POST', json: { tipo, latitud, longitud } });

export type Mes = {
  mes: string; nombre_mes: string; desde: string; hasta: string; fin: string; hoy: string; offset: number; obra: string | null;
  dias: Dia[]; solicitudes: Pick<Solicitud, 'id' | 'tipo' | 'estado' | 'fecha' | 'comentario'>[];
};
export const useApiMes = (mes: string, usuario?: number) => useApiPortal<Mes>(`marcas/mes?mes=${mes}${usuario ? `&usuario=${usuario}` : ''}`);
export const useApiIncidencias = () => useApiPortal<{ lista: Incidencia[]; abiertas: number }>('marcas/incidencias');
export const descargarAsistencia = (mes: string, usuario?: number) => apiPortalDescargar(`marcas/csv?mes=${mes}${usuario ? `&usuario=${usuario}` : ''}`, `asistencia-${mes}.csv`);

export type Verificacion = {
  integro: boolean; siguiente_ok: boolean | null;
  marca: { comprobante: string; tipo: TipoMarca; fecha_hora: string; fecha: string; origen: string; hash: string; nombre: string; rut: string; obra: { nombre: string; codigo: string } | null };
};
export const verificarComprobante = (c: string) => apiPortalFetch<Verificacion>('verificar/' + encodeURIComponent(c));
