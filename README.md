# Portal Malpo

Portal del trabajador de Constructora Malpo: asistencia, solicitudes, documentos y reportes.

Usa el **mismo stack que Adquisiciones**:

| Capa | Tecnología |
|---|---|
| Front | Next 14 (app router) + React 18 + TypeScript + Tailwind + NextUI |
| Sesión | **api_maestra** (login, `sesion_usuario`, `sesion_plataforma`, `sesion/{plataforma}/{token}`) |
| Negocio | **api_portal_malpo** (CodeIgniter 3 REST, MySQL, `X-API-KEY` + Basic), en `C:\wamp64\www\api_master\api_portal_malpo` |

Flujo: `UI → /api/auth/* (Next) → api_maestra` para la sesión, y `UI → api_portal_malpo` para todo lo demás.
No hay Prisma, PostgreSQL ni autenticación propia.

## Puesta en marcha

1. **Solo la primera vez:** `limpiar_version_anterior.bat` (borra la versión Prisma/PostgreSQL de esta carpeta).
2. Instale la API: `C:\wamp64\www\api_master\api_portal_malpo\instalar.bat` y ejecute sus SQL (ver su README).
3. `instalar.bat` → crea `.env` desde `.env.example`. Complete:
   - `NEXT_PUBLIC_SMTP_API_MAESTRA_KEY`, `KEY2`, `USERNAME`, `PASSWORD`, `NEXT_PUBLIC_API_SESION_URL`: **los mismos valores del `.env` de Adquisiciones**.
   - `NEXT_PUBLIC_API_URL='http://localhost/api_master/api_portal_malpo/'`
   - `NEXT_PUBLIC_ID_PLATAFORMA`: el **id nuevo** que entregó `sql/03_master_innova_alta_plataforma.sql` (no 107).
4. `iniciar.bat` → http://localhost:3001 (Adquisiciones sigue en 3000).

Para desarrollo con recarga en caliente: `desarrollo.bat`.

## Ingreso

- **Directo:** usuario y contraseña de Innova (mismo flujo que Adquisiciones: `/api/auth/login` → api_maestra).
- **Desde master_login:** si la URL trae `?token=`, se valida con `/api/auth/validate-token` y se registra la sesión en esta plataforma.

> master_login hoy agrega `?token=` solo a algunas plataformas fijas (107, 120, 124, 127, 128). Sin tocarlo, el ícono del Portal Malpo abre la pantalla de ingreso del portal y la persona entra con su usuario de Innova. Si más adelante se quiere el ingreso automático, basta con agregar el id nuevo a esa lista en master_login (cambio opcional, no aplicado).

## Estructura (igual que Adquisiciones)

```
src/app/
  page.tsx                  ingreso (components/Login/Login.tsx)
  pages/…                   vistas protegidas (RequireAuth + header + footer)
  verificar/page.tsx        verificación pública de comprobantes
  contexts/                 UserContext (+ PermisosProvider), ThemeContext
  config/session.ts         tiempos de sesión
  api/auth/…                login y validate-token contra api_maestra (copiados de Adquisiciones)
  api/_shared/apiPortalClient.ts   cliente de api_portal_malpo (KEY2 + Basic + X-SESSION-TOKEN)
  api/api_portal/Api_*.tsx  hooks useApi* por módulo
  api/portal/[...ruta]      proxy opcional (NEXT_PUBLIC_API_PROXY='1')
  components/               Marcador, NuevaSolicitud, Calendario, Acciones, Admin, ui/
```

## Funciones

- **Trabajador:** marcar entrada/colación/salida con hora del servidor, comprobante `MLP-XXXXXXXX` y cadena de huellas; mis marcaciones, calendario, incidencias, horas extra, pacto de compensación, solicitudes con respaldo, documentos con firma (contraseña de Innova), reportes y CSV.
- **Jefatura:** equipo del día, aprobaciones (efectos automáticos: pacto, cambio de turno, corrección de marca), turnos de la semana, reporte del equipo.
- **RR.HH. (Administrador Maestro):** dar acceso a personas de Innova, perfil/obra/jefatura/jornada, obras con validación de ubicación, publicación de documentos.
- `/verificar?c=MLP-…`: verificación pública para fiscalización.

Modo claro/oscuro, animaciones y diseño responsive (barra inferior y hojas en celular).

© 2026 Malpo SpA. Todos los derechos reservados.
