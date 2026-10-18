'use client';
/**
 * Cliente de api_portal_malpo (mismo patrón que apiBodegasClient de Adquisiciones):
 *  - X-API-KEY  = NEXT_PUBLIC_SMTP_API_MAESTRA_KEY2
 *  - Authorization = Basic USERNAME:PASSWORD
 *  - X-SESSION-TOKEN = usuarioToken de Innova (guardado por UserContext en localStorage 'token')
 * Con NEXT_PUBLIC_API_PROXY='1' las llamadas pasan por /api/portal/... (Next agrega las llaves en el servidor).
 */

export type RespuestaPortal<T> = { status: boolean; mensaje: string; data: T };

export class ApiPortalError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiPortalError';
  }
}

const usarProxy = () => process.env.NEXT_PUBLIC_API_PROXY === '1';

function urlDe(path: string) {
  const limpio = path.replace(/^\/+/, '');
  if (usarProxy()) return '/api/portal/' + limpio;
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '') + '/';
  return base + 'api/' + limpio;
}

function cabeceras(): Record<string, string> {
  const h: Record<string, string> = {};
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : '';
  if (token) h['X-SESSION-TOKEN'] = token;
  if (!usarProxy()) {
    h['X-API-KEY'] = process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_KEY2 || '';
    h['Authorization'] = 'Basic ' + btoa(`${process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_USERNAME || ''}:${process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_PASSWORD || ''}`);
  }
  return h;
}

/** Aviso global cuando la sesión de Innova ya no es válida (UserContext cierra la sesión) */
function avisarSesion(status: number) {
  if (status === 401 && typeof window !== 'undefined') window.dispatchEvent(new Event('portal-sesion-invalida'));
}

export async function apiPortalFetch<T>(path: string, opts: { method?: string; json?: unknown; form?: FormData; signal?: AbortSignal } = {}): Promise<T> {
  const headers = cabeceras();
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.json !== undefined) { body = JSON.stringify(opts.json); headers['Content-Type'] = 'application/json'; }
  let r: Response;
  try {
    r = await fetch(urlDe(path), { method: opts.method || (body ? 'POST' : 'GET'), headers, body, signal: opts.signal, cache: 'no-store' });
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') throw e;
    throw new ApiPortalError('No se pudo conectar con la API del portal. Revisa tu conexión.', 0);
  }
  const txt = await r.text();
  let j: RespuestaPortal<T> | null = null;
  try { j = txt ? JSON.parse(txt) : null; } catch { j = null; }
  if (!r.ok || !j || j.status !== true) {
    avisarSesion(r.status);
    throw new ApiPortalError((j && (j.mensaje || (j as any).error)) || `Error ${r.status} al consumir la API del portal`, r.status);
  }
  return j.data;
}

/** Descarga un archivo (CSV, PDF o respaldo) con las cabeceras de la API y lo abre o guarda */
export async function apiPortalDescargar(path: string, nombre = 'archivo', abrir = false) {
  const r = await fetch(urlDe(path), { headers: cabeceras(), cache: 'no-store' });
  if (!r.ok) {
    avisarSesion(r.status);
    let m = 'No se pudo descargar el archivo.';
    try { m = (await r.json()).mensaje || m; } catch { /* sin cuerpo */ }
    throw new ApiPortalError(m, r.status);
  }
  const cd = r.headers.get('content-disposition') || '';
  const n = /filename="?([^";]+)"?/i.exec(cd)?.[1] || nombre;
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  if (abrir) window.open(url, '_blank', 'noopener');
  else { const a = document.createElement('a'); a.href = url; a.download = n; document.body.appendChild(a); a.click(); a.remove(); }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
