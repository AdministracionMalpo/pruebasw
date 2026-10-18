import type { TipoMarca } from '@/libs/textos';

export type MarcaDia = { hora: string; origen: string; comprobante: string; correccion: boolean };
export type Turno = { entrada: string; salida: string; colacion: number; nombre: string | null; codigo: string | null } | null;
export type Dia = {
  fecha: string;
  tipo: 'descanso' | 'feriado' | 'vacaciones' | 'inasistencia' | 'pendiente' | 'futuro' | 'incompleta' | 'encurso' | 'trabajado';
  turno: Turno; feriado: string | null; k: Partial<Record<TipoMarca, MarcaDia>>;
  atraso: number; he: number; trab: number; pact: number; col: number; estado?: string | null;
};
export type Resumen = { dias: number; trab: number; pact: number; atr: number; natr: number; he: number; ina: number };
export type DatosSolicitud = {
  hoy: string; saldo_vac: number; pacto_vigente: boolean; pacto_pendiente: boolean; bolsa_min: number;
  turnos: { codigo: string; nombre: string }[]; feriados: string[];
};
export type Obra = { id: string; codigo: string; nombre: string; direccion: string; latitud: string | null; longitud: string | null; radio_metros: string; exigir_ubicacion: string; activa: string; personas?: string };
export type Yo = {
  id_externo: number; usuario: string; nombre: string; rut: string; email: string; cargo: string;
  obra_id: number | null; obra: Obra | null; jefe_id_externo: number | null; jornada_id: number | null;
  jornada: { id: string; nombre: string; horario: string; colacion_min: string } | null;
  dias_vacaciones_base: number; aviso_correo: number; aviso_recordatorio: number; aviso_respuestas: number;
  perfiles: { id_perfil: string; nombre: string }[]; permisos: number[]; es_admin: boolean; es_jefatura: boolean;
  notificaciones_sin_leer: number; aprobaciones_pendientes: number;
  contadores: { incidencias: number; he: number; solicitudes: number; documentos: number; aprobaciones: number };
};
export type Actividad = { id: string; tipo: string; texto: string; creada_en: string };
export type Notificacion = { id: string; texto: string; leida: string; creada_en: string };
export type Solicitud = {
  id: string; id_externo: string; tipo: string; estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'; fecha: string | null; detalle: string;
  motivo: string | null; comentario: string | null; creada_en: string; resuelta_en: string | null; revisor?: string | null;
  tiene_adjunto: boolean; adjunto_nombre: string | null; nombre?: string; cargo?: string; propia?: boolean;
};
export type Documento = {
  id: string; nombre: string; tipo: string; descripcion: string | null; requiere_firma: string; firmado_en: string | null;
  publicado_en: string; tiene_archivo: boolean; archivo_nombre: string | null;
};
export type Incidencia = { fecha: string; tipo: string; texto: string; sol_tipo: string | null; icono: string; estado_sol: string | null; he?: boolean };
export type ModTurno = { id: string; aplica: string; antes: string; despues: string; motivo: string; creado_en: string; autor: string | null; nombre?: string };
