'use client';
import { apiPortalFetch } from '../_shared/apiPortalClient';
import { useApiPortal } from './useApiPortal';
import type { Obra } from './tipos';

export type UsuarioLocal = {
  id_externo: string; nombre: string; rut: string; email: string; cargo: string; obra_id: string | null; jefe_id_externo: string | null;
  jornada_id: string | null; dias_vacaciones_base: string; activo: string; ultimo_ingreso: string | null; obra_codigo: string | null;
  obra_nombre: string | null; jefe_nombre: string | null; jornada_nombre: string | null; id_perfil: number; acceso_innova: boolean;
};
export const useApiAdminUsuarios = () => useApiPortal<UsuarioLocal[]>('admin/usuarios');
export const editarUsuario = (id: string, datos: Record<string, unknown>) => apiPortalFetch<null>(`admin/usuarios/${id}`, { method: 'POST', json: datos });

export type UsuarioInnova = { idusuario: string; usuarioRut: string; usuarioSesion: string; usuarioEmail: string; usuarioNombre: string; acceso: boolean; en_portal: boolean };
export const buscarInnova = (q: string) => apiPortalFetch<UsuarioInnova[]>('admin/innova?q=' + encodeURIComponent(q));
/** INSERT en master_innova.plataforma_has_usuario SOLO para esta plataforma */
export const darAcceso = (id: string, id_perfil: number, cargo: string) => apiPortalFetch<{ id_externo: number }>(`admin/innova/${id}/acceso`, { method: 'POST', json: { id_perfil, cargo } });

export const useApiAdminObras = () => useApiPortal<Obra[]>('admin/obras');
export const crearObra = (datos: Record<string, unknown>) => apiPortalFetch<{ id: number }>('admin/obras', { method: 'POST', json: datos });
export const exigirUbicacion = (id: string, exigir: boolean) => apiPortalFetch<null>(`admin/obras/${id}/ubicacion`, { method: 'POST', json: { exigir } });

export type DocPublicado = { id: string; nombre: string; tipo: string; requiere_firma: string; firmado_en: string | null; publicado_en: string; persona: string | null };
export const useApiAdminDocumentos = () => useApiPortal<DocPublicado[]>('admin/documentos');
export const publicarDocumento = (fd: FormData) => apiPortalFetch<{ publicados: number }>('admin/documentos', { method: 'POST', form: fd });

/* ::::: Gestión de permisos ::::: */
export type PermisoDef = { id_permiso: string; nombre_permiso: string; descripcion: string | null };
export type PerfilDef = { id_perfil: string; nombre: string; descripcion: string | null; todos: boolean; permisos: number[]; usuarios: number };
export const useApiPermisos = () => useApiPortal<{ permisos: PermisoDef[]; perfiles: PerfilDef[] }>('admin/permisos');
export const crearPerfil = (nombre: string, descripcion: string) => apiPortalFetch<{ id_perfil: number }>('admin/perfiles', { method: 'POST', json: { nombre, descripcion } });
export const guardarPermisosPerfil = (id: string, permisos: number[], extra: { nombre?: string; descripcion?: string } = {}) =>
  apiPortalFetch<{ permisos: number[] }>(`admin/perfiles/${id}/permisos`, { method: 'POST', json: { permisos, ...extra } });

/** 1 = permitir, 2 = quitar (mismo esquema de habilitado que api_bodegas); sin clave = hereda del perfil */
export type DetallePermisos = { desde_perfil: number[]; overrides: Record<string, 1 | 2>; efectivos: number[] };
export const useApiPermisosUsuario = (id: string | null) =>
  useApiPortal<DetallePermisos & { id_externo: number; nombre: string; perfiles: { id_perfil: string; nombre: string }[]; administrador_maestro: boolean }>(id ? `admin/usuarios/${id}/permisos` : null);
export const guardarPermisosUsuario = (id: string, overrides: Record<string, number>) =>
  apiPortalFetch<DetallePermisos>(`admin/usuarios/${id}/permisos`, { method: 'POST', json: { overrides } });
