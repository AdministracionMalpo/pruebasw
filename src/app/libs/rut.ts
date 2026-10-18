/** 12345678-5 → 12.345.678-5 */
export function formatearRut(rut?: string | null) {
  const c = String(rut || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (c.length < 2) return rut || '';
  return Number(c.slice(0, -1)).toLocaleString('es-CL') + '-' + c.slice(-1);
}
