// Copiado de Adquisiciones (mismo flujo de sesión con api_maestra). Solo cambia el id de plataforma vía .env.
import { createHash } from 'crypto';

export type MaestraConfig = {
  baseUrl: string;
  plataformaId: string;
  apiKey: string;
  apiUser: string;
  apiPass: string;
};

export function getMaestraConfig(): MaestraConfig {
  const baseUrl = (
    process.env.API_MASTER_URL ||
    process.env.API_SESION_URL ||
    process.env.NEXT_PUBLIC_API_SESION_URL ||
    ''
  )
    .trim()
    .replace(/\/+$/, '');
  const plataformaId = (
    process.env.ID_PLATAFORMA ||
    process.env.NEXT_PUBLIC_ID_PLATAFORMA ||
    ''
  ).trim();
  const apiKey =
    process.env.API_MASTER_KEY ||
    process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_KEY ||
    '';
  const apiUser =
    process.env.API_MASTER_USER ||
    process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_USERNAME ||
    '';
  const apiPass =
    process.env.API_MASTER_PASS ||
    process.env.NEXT_PUBLIC_SMTP_API_MAESTRA_PASSWORD ||
    '';

  return { baseUrl, plataformaId, apiKey, apiUser, apiPass };
}

export function maestraAuthHeaders(config: MaestraConfig): Record<string, string> {
  const basicAuth = Buffer.from(`${config.apiUser}:${config.apiPass}`).toString('base64');
  return {
    Authorization: `Basic ${basicAuth}`,
    'X-API-KEY': config.apiKey,
  };
}

export function fechaSesionMaestra(): string {
  // Mismo formato que master_login: Y-m-d H:i:sa
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  let h = d.getHours();
  const min = pad(d.getMinutes());
  const sec = pad(d.getSeconds());
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  if (h === 0) h = 12;
  return `${y}-${m}-${day} ${pad(h)}:${min}:${sec}${ampm}`;
}

export function parseUserAgent(ua: string): {
  plataforma: string;
  navegador: string;
  version: string;
  mobile: '0' | '1';
} {
  const s = ua || '';
  const mobile = /Mobile|Android|iPhone|iPad|iPod/i.test(s) ? '1' : '0';

  let plataforma = 'Unknown';
  if (/Windows NT/i.test(s)) plataforma = 'Windows';
  else if (/Mac OS X|Macintosh/i.test(s)) plataforma = 'macOS';
  else if (/Android/i.test(s)) plataforma = 'Android';
  else if (/iPhone|iPad|iPod/i.test(s)) plataforma = 'iOS';
  else if (/Linux/i.test(s)) plataforma = 'Linux';

  let navegador = 'Unknown';
  let version = '';
  const chrome = s.match(/Chrome\/([\d.]+)/);
  const edg = s.match(/Edg\/([\d.]+)/);
  const firefox = s.match(/Firefox\/([\d.]+)/);
  const safari = s.match(/Version\/([\d.]+).*Safari/);
  if (edg) {
    navegador = 'Edge';
    version = edg[1];
  } else if (chrome && !/Chromium/i.test(s)) {
    navegador = 'Chrome';
    version = chrome[1];
  } else if (firefox) {
    navegador = 'Firefox';
    version = firefox[1];
  } else if (safari) {
    navegador = 'Safari';
    version = safari[1];
  }

  return { plataforma, navegador, version, mobile };
}

async function postForm(
  config: MaestraConfig,
  path: string,
  fields: Record<string, string>
): Promise<{ ok: boolean; estatus?: number; datos?: unknown; mensaje?: string }> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    form.append(k, v);
  }
  const response = await fetch(`${config.baseUrl}/${path.replace(/^\//, '')}`, {
    method: 'POST',
    headers: maestraAuthHeaders(config),
    body: form,
    cache: 'no-store',
  });
  const data = await response.json().catch(() => ({}));
  return {
    ok: response.ok && Number(data?.estatus) === 200,
    estatus: Number(data?.estatus) || response.status,
    datos: data?.datos,
    mensaje: data?.mensaje,
  };
}

/**
 * Replica master_login:
 * 1) sesion_usuario  → inserta fila y devuelve idsesion
 * 2) sesion_plataforma → asocia esa sesión a esta plataforma (NEXT_PUBLIC_ID_PLATAFORMA = Portal Malpo)
 */
export async function registrarSesionPlataforma(opts: {
  idusuario: string | number;
  token: string;
  userAgent?: string;
}): Promise<{ ok: boolean; idsesion?: number; error?: string }> {
  const config = getMaestraConfig();
  if (!config.baseUrl || !config.plataformaId || !config.apiKey || !config.apiUser || !config.apiPass) {
    return { ok: false, error: 'Configuración incompleta de api_maestra' };
  }
  if (!/^\d+$/.test(config.plataformaId)) {
    return { ok: false, error: 'ID de plataforma inválido' };
  }

  const ua = parseUserAgent(opts.userAgent || '');
  const fecha = fechaSesionMaestra();

  const sesionUsuario = await postForm(config, 'sesion_usuario', {
    id: String(opts.idusuario),
    token: opts.token,
    fecha,
    plataforma: ua.plataforma,
    navegador: ua.navegador,
    version: ua.version,
    mobile: ua.mobile,
  });

  if (!sesionUsuario.ok || sesionUsuario.datos == null || sesionUsuario.datos === '') {
    return {
      ok: false,
      error: sesionUsuario.mensaje || 'Error al guardar sesión usuario',
    };
  }

  const idsesion = Number(sesionUsuario.datos);
  const sesionPlataforma = await postForm(config, 'sesion_plataforma', {
    idsesion: String(idsesion),
    idplataforma: config.plataformaId,
    fecha,
  });

  if (!sesionPlataforma.ok) {
    return {
      ok: false,
      idsesion,
      error: sesionPlataforma.mensaje || 'Error al guardar sesión plataforma',
    };
  }

  return { ok: true, idsesion };
}

export function generarTokenSesion(usuarioId: string | number): string {
  return createHash('md5')
    .update(`${usuarioId}-${Date.now()}-${Math.random()}`, 'utf8')
    .digest('hex');
}
