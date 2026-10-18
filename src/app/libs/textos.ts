export const MARCA_ORDEN = ['ENTRADA', 'INICIO_COLACION', 'FIN_COLACION', 'SALIDA'] as const;
export type TipoMarca = typeof MARCA_ORDEN[number];
export const MARCA_LABEL: Record<TipoMarca, string> = { ENTRADA: 'Entrada', INICIO_COLACION: 'Inicio colación', FIN_COLACION: 'Fin colación', SALIDA: 'Salida' };
export const MARCA_TEXTO: Record<TipoMarca, string> = { ENTRADA: 'entrada', INICIO_COLACION: 'inicio de colación', FIN_COLACION: 'fin de colación', SALIDA: 'salida' };
export const ORIGEN_LABEL: Record<string, string> = { PORTAL_WEB: 'Portal web', RELOJ_OBRA: 'Reloj obra', APP_CELULAR: 'App celular', CORRECCION: 'Corrección aprobada' };

export const SOLICITUD_LABEL: Record<string, string> = {
  VACACIONES: 'Vacaciones',
  PERMISO_SALIDA: 'Permiso de salida',
  CAMBIO_TURNO: 'Cambio de turno',
  PACTO_HE: 'Pacto de compensación H.E.',
  USO_HE: 'Uso H.E. compensadas',
  JUSTIFICAR_ATRASO: 'Justificar atraso',
  JUSTIFICAR_INASISTENCIA: 'Justificar inasistencia',
  CORRECCION_MARCA: 'Corrección de marcación',
};
export const SOLICITUD_ICONO: Record<string, string> = {
  VACACIONES: 'beach', PERMISO_SALIDA: 'exit', CAMBIO_TURNO: 'swap', PACTO_HE: 'pact', USO_HE: 'hour',
  JUSTIFICAR_ATRASO: 'late', JUSTIFICAR_INASISTENCIA: 'sick', CORRECCION_MARCA: 'pen',
};
export const ESTADO_LABEL: Record<string, string> = { PENDIENTE: 'Pendiente', APROBADA: 'Aprobada', RECHAZADA: 'Rechazada' };
export const ESTADO_CHIP: Record<string, string> = { PENDIENTE: 'warn', APROBADA: 'ok', RECHAZADA: 'bad' };
export const ROL_LABEL: Record<string, string> = { TRABAJADOR: 'Trabajador', JEFATURA: 'Jefatura', ADMIN: 'Administración RR.HH.' };
