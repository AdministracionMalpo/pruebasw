// Configuración de tiempos de sesión (en milisegundos)
export const SESSION_CONFIG = {
  // Token de acceso principal
  ACCESS_TOKEN_EXPIRATION: 60 * 60 * 1000, // 1 hora
  
  // Tiempo de inactividad antes de cerrar sesión
  SESSION_INACTIVITY_TIME: 4 * 60 * 60 * 1000, // 4 horas
  
  // Intervalo de verificación de expiración
  CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutos
  
  // Tiempo de advertencia antes de expirar
  WARNING_TIME: 10 * 60 * 1000, // 10 minutos
  
  // URL de logout
  LOGOUT_URL: 'https://www.innovamalpo.cl/master_login/'
} as const;

// Función para convertir minutos a milisegundos
export const minutesToMs = (minutes: number): number => minutes * 60 * 1000;

// Función para convertir horas a milisegundos
export const hoursToMs = (hours: number): number => hours * 60 * 60 * 1000;

// Función para formatear tiempo restante
export const formatTimeLeft = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}; 