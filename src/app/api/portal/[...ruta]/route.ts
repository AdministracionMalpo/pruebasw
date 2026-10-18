/**
 * Proxy OPCIONAL hacia api_portal_malpo (se activa con NEXT_PUBLIC_API_PROXY='1').
 * Sirve cuando el navegador no puede llamar directo a NEXT_PUBLIC_API_URL (CORS, http/https mixto, red interna).
 * Agrega X-API-KEY (KEY2) y Basic en el servidor y reenvía el X-SESSION-TOKEN del usuario.
 */
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function reenviar(req: NextRequest, { params }: { params: { ruta: string[] } }) {
  if (process.env.NEXT_PUBLIC_API_PROXY !== '1') return new Response('Proxy desactivado', { status: 404 });
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '') + '/';
  const ruta = (params.ruta || []).map(encodeURIComponent).join('/');
  if (!base || ruta.includes('..')) return new Response('Configuración incompleta', { status: 500 });
  const url = new URL('api/' + ruta + req.nextUrl.search, base);

  const h = new Headers();
  h.set('X-API-KEY', process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_KEY2 || '');
  h.set('Authorization', 'Basic ' + Buffer.from(`${process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_USERNAME || ''}:${process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_PASSWORD || ''}`).toString('base64'));
  const token = req.headers.get('x-session-token');
  if (token) h.set('X-SESSION-TOKEN', token);
  const ct = req.headers.get('content-type');
  if (ct) h.set('Content-Type', ct);

  const conCuerpo = !['GET', 'HEAD'].includes(req.method);
  const r = await fetch(url, { method: req.method, headers: h, body: conCuerpo ? await req.arrayBuffer() : undefined, cache: 'no-store' });
  const out = new Headers();
  for (const k of ['content-type', 'content-disposition', 'content-length']) { const v = r.headers.get(k); if (v) out.set(k, v); }
  return new Response(r.body, { status: r.status, headers: out });
}

export { reenviar as GET, reenviar as POST, reenviar as PUT, reenviar as DELETE };
