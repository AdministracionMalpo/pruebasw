/** Fechas en hora de Chile continental. La API entrega fechas 'YYYY-MM-DD' y 'YYYY-MM-DD HH:MM:SS' ya en hora local. */
export const TZ = 'America/Santiago';

const fFecha = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
export const hoy = () => fFecha.format(new Date());
export const mesActual = () => hoy().slice(0, 7);

export const d12 = (f: string) => new Date(f + 'T12:00:00Z');
/** 1 = lunes … 7 = domingo */
export const diaSemana = (f: string) => { const w = d12(f).getUTCDay(); return w === 0 ? 7 : w; };
export const sumarDias = (f: string, n: number) => { const d = d12(f); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const sumarMes = (mes: string, n: number) => { const [y, m] = mes.split('-').map(Number); return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 7); };
export const fmtFecha = (f: string, o: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) =>
  d12(f.slice(0, 10)).toLocaleDateString('es-CL', { timeZone: 'UTC', ...o });
export const fmtLarga = (f: string) => fmtFecha(f, { day: 'numeric', month: 'long', year: 'numeric' });
export const fmtCompleta = (f: string) => fmtFecha(f, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
export const fmtMin = (m: number) => { m = Math.max(0, Math.round(m || 0)); return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); };
export const nombreMes = (mes: string) => { const s = d12(mes + '-01').toLocaleDateString('es-CL', { timeZone: 'UTC', month: 'long', year: 'numeric' }).replace(' de ', ' '); return s[0].toUpperCase() + s.slice(1); };
/** '2026-10-16 15:45:07' → '16 oct 2026 · 15:45' */
export const fmtFechaHora = (s?: string | null) => (s ? `${fmtFecha(s.slice(0, 10), { day: 'numeric', month: 'short', year: 'numeric' })} · ${s.slice(11, 16)}` : '—');
export const hora = (s?: string | null) => (s ? s.slice(11, 16) : '');
export const esMes = (m?: string | null) => !!m && /^\d{4}-\d{2}$/.test(m);
