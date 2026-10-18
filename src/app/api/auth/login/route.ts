// Copiado de Adquisiciones (mismo flujo de sesión con api_maestra). Solo cambia el id de plataforma vía .env.
import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  fechaSesionMaestra,
  getMaestraConfig,
  maestraAuthHeaders,
  registrarSesionPlataforma,
} from '../maestraSession';

export async function POST(request: Request) {
  try {
    const { baseUrl, apiKey, apiUser, apiPass } = getMaestraConfig();
    if (!baseUrl || !apiKey || !apiUser || !apiPass) {
      return NextResponse.json(
        { ok: false, mensaje: 'Configuración incompleta de autenticación' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const usuario = typeof body?.usuario === 'string' ? body.usuario.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!usuario || !password) {
      return NextResponse.json(
        { ok: false, mensaje: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const passMd5 = createHash('md5').update(password, 'utf8').digest('hex');
    const formData = new FormData();
    formData.append('usuario', usuario);
    formData.append('pass', passMd5);

    const authHeaders = maestraAuthHeaders({ baseUrl, plataformaId: '', apiKey, apiUser, apiPass });
    const userAgent = request.headers.get('user-agent') || '';
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));

    const tokenFromApi =
      data?.datos?.usuarioToken ||
      data?.datos?.token ||
      data?.datos?.usuario_token ||
      data?.usuarioToken ||
      data?.token ||
      null;

    const estatusOk =
      data?.estatus === 200 ||
      data?.status === true ||
      data?.ok === true;

    if (!response.ok || !estatusOk || !tokenFromApi) {
      // Compatibilidad con flujo legado de master_login:
      // El endpoint /login retorna datos de usuario sin token,
      // y luego se debe llamar /actualizar_sesion para persistir usuarioToken.
      const usuarioId = data?.datos?.idusuario;
      const loginOkSinToken = response.ok && estatusOk && Boolean(usuarioId);
      if (!loginOkSinToken) {
        return NextResponse.json(
          {
            ok: false,
            mensaje:
              data?.mensaje ||
              data?.message ||
              'No se pudo iniciar sesión. Verifica tus credenciales.',
          },
          { status: 401 }
        );
      }

      const generatedToken = createHash('md5')
        .update(`${usuarioId}-${Date.now()}-${Math.random()}`, 'utf8')
        .digest('hex');

      const formUpdate = new FormData();
      formUpdate.append('id', String(usuarioId));
      formUpdate.append('token', generatedToken);
      formUpdate.append('fecha', fechaSesionMaestra());

      const updateResp = await fetch(`${baseUrl}/actualizar_sesion`, {
        method: 'POST',
        headers: authHeaders,
        body: formUpdate,
      });

      const updateData = await updateResp.json().catch(() => ({}));
      const updateOk = updateResp.ok && updateData?.estatus === 200;
      if (!updateOk) {
        return NextResponse.json(
          {
            ok: false,
            mensaje: 'No se pudo crear token de sesión para el usuario.',
          },
          { status: 401 }
        );
      }

      const registro = await registrarSesionPlataforma({
        idusuario: usuarioId,
        token: generatedToken,
        userAgent,
      }).catch(() => ({ ok: false as const }));
      if (!registro.ok) {
        console.error('[auth/login] No se pudo registrar sesión en api_maestra', registro);
      }

      return NextResponse.json({
        ok: true,
        datos: {
          ...(data?.datos || {}),
          usuarioToken: generatedToken,
        },
      });
    }

    const usuarioIdOk = data?.datos?.idusuario;
    if (usuarioIdOk) {
      const registro = await registrarSesionPlataforma({
        idusuario: usuarioIdOk,
        token: tokenFromApi,
        userAgent,
      }).catch(() => ({ ok: false as const }));
      if (!registro.ok) {
        console.error('[auth/login] No se pudo registrar sesión en api_maestra', registro);
      }
    }

    return NextResponse.json({
      ok: true,
      datos: {
        ...(data?.datos || {}),
        usuarioToken: tokenFromApi,
      },
    });
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: 'Error al conectar con el servidor de autenticación' },
      { status: 503 }
    );
  }
}
