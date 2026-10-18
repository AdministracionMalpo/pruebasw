'use client';
import { apiPortalDescargar, apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { Documento } from './tipos';

export const useApiDocumentos = () => useApiPortal<Documento[]>('documentos');
export const descargarDocumento = (id: string, nombre: string) => apiPortalDescargar(`documentos/${id}/archivo`, nombre, true);
/** La contraseña se valida contra Innova (master_innova) en la API */
export const firmarDocumento = (id: string, clave: string) => apiPortalFetch<{ firmado_en: string; firma_hash: string }>(`documentos/${id}/firmar`, { method: 'POST', json: { clave } });
