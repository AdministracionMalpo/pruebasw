// Copiado de Adquisiciones (mismo flujo de sesión con api_maestra). Solo cambia el id de plataforma vía .env.
import { NextResponse } from 'next/server';
import { getMaestraConfig, maestraAuthHeaders, registrarSesionPlataforma } from '../maestraSession';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const registrarPlataforma = Boolean(body?.registrarPlataforma);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    if (!token) {
      return NextResponse.json({ isValid: false, error: 'Token no proporcionado' }, { status: 400 });
    }

    const tokenRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tokenRegex.test(token)) {
      return NextResponse.json({ isValid: false, error: 'Formato de token inválido' }, { status: 400 });
    }

    const { baseUrl, plataformaId, apiKey, apiUser, apiPass } = getMaestraConfig();
    if (!baseUrl || !plataformaId || !apiKey || !apiUser || !apiPass) {
      return NextResponse.json(
        { isValid: false, error: 'Configuración incompleta de autenticación' },
        { status: 500 }
      );
    }

    if (!/^\d+$/.test(plataformaId)) {
      return NextResponse.json(
        { isValid: false, error: 'ID de plataforma inválido' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${baseUrl}/sesion/${plataformaId}/${encodeURIComponent(token)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...maestraAuthHeaders({ baseUrl, plataformaId, apiKey, apiUser, apiPass }),
        },
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.estatus !== 200 || !data?.datos?.idusuario) {
      return NextResponse.json({ isValid: false }, { status: 401 });
    }

    if (registrarPlataforma) {
      const registro = await registrarSesionPlataforma({
        idusuario: data.datos.idusuario,
        token,
        userAgent: request.headers.get('user-agent') || '',
      }).catch(() => ({ ok: false as const }));
      if (!registro.ok) {
        console.error('[auth/validate-token] No se pudo registrar sesión en api_maestra', registro);
      }
    }

    return NextResponse.json({
      isValid: true,
      datos: { idusuario: data.datos.idusuario },
    });
  } catch {
    return NextResponse.json(
      { isValid: false, error: 'Error al validar sesión' },
      { status: 503 }
    );
  }
}
