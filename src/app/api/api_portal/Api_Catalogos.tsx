'use client';
import { useApiPortal } from './useApiPortal';
import type { Obra } from './tipos';

export type Catalogos = {
  obras: Obra[]; jornadas: { id: string; nombre: string; horario: string }[]; turno_tipos: { codigo: string; nombre: string }[];
  perfiles: { id_perfil: string; nombre: string }[]; jefaturas: { id_externo: string; nombre: string; cargo: string }[];
};
export const useApiCatalogos = () => useApiPortal<Catalogos>('catalogos');
