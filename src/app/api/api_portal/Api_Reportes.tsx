'use client';
import { useApiPortal } from './useApiPortal';
import type { Dia, ModTurno, Resumen } from './tipos';

export type Reporte = {
  mes: string; nombre_mes: string; es_actual: boolean; dias: Dia[]; resumen: Resumen; he_estado: Record<string, string>; aceptadas: number;
  festivos: { fecha: string; tipo: string; trabajado: boolean }[]; mod_turnos: ModTurno[];
};
export const useApiReportes = (mes: string) => useApiPortal<Reporte>(`reportes?mes=${mes}`);
