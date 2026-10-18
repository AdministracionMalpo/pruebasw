# Publicar el Portal Malpo en Vercel

## Antes de empezar (obligatorio)

Vercel corre en internet y **no puede llegar al `localhost` de WAMP**. Para que el ingreso y los datos funcionen, en un servidor público (el mismo donde están las APIs de Innova en producción, p. ej. `https://www.innovamalpo.cl/api_master/`) debe estar:

1. **api_maestra** de producción (ya existe para Adquisiciones).
2. **api_portal_malpo** subida a ese servidor, con su base `api_portal_malpo` creada y los SQL 01, 02, 03 (en el `master_innova` de producción, solo INSERT), 04 y 05 ejecutados.
   - En `application/config/config.php` cambie `base_url` a la URL pública.
   - En `application/config/database.php` ponga el usuario y clave MySQL del servidor.
   - En `constants.php`, `ID_PLATAFORMA_PORTAL` = id que entregó el SQL 03 de producción.

Sin esto, el portal en Vercel abre pero no deja ingresar.

## 1. Subir a GitHub

1. En la cuenta de GitHub de **Administración Malpo**, cree un repositorio **privado y vacío** (sin README), por ejemplo `portal-malpo`.
2. En la carpeta del portal ejecute `subir_a_github.bat` y pegue la URL del repositorio cuando la pida.
   - Crea el repositorio git local, hace el commit y sube a `main`.
   - El `.env` **no se sube** (está en `.gitignore`); las claves se cargan en Vercel.

## 2. Importar en Vercel

1. Entre a https://vercel.com con la cuenta/equipo de la empresa → **Add New… → Project**.
2. **Import Git Repository** → conecte GitHub (cuenta Administración Malpo) → elija `portal-malpo`.
3. Framework: **Next.js** (lo detecta solo). No cambie comandos de build.
4. Abra **Environment Variables** y agregue (mismos nombres que Adquisiciones en Vercel):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_ID_PLATAFORMA` | id del Portal Malpo en `master_innova` de **producción** |
| `NEXT_PUBLIC_API_SESION_URL` | URL pública de api_maestra (la misma que usa Adquisiciones en Vercel) |
| `NEXT_PUBLIC_SMTP_API_MAESTRA_KEY` | igual que Adquisiciones |
| `NEXT_PUBLIC_SMTP_API_MAESTRA_USERNAME` | igual que Adquisiciones |
| `NEXT_PUBLIC_SMTP_API_MAESTRA_PASSWORD` | igual que Adquisiciones |
| `NEXT_PUBLIC_SMTP_API_MAESTRA_KEY2` | igual que Adquisiciones |
| `NEXT_PUBLIC_API_URL` | URL pública de api_portal_malpo, terminada en `/` |
| `NEXT_PUBLIC_API_SESION_URL3` | URL que entregue Vercel, p. ej. `https://portal-malpo.vercel.app` |
| `NEXT_PUBLIC_API_PROXY` | `1` (recomendado: evita problemas de CORS y de http/https) |

5. **Deploy**. Si cambia una variable después, use **Redeploy** (las `NEXT_PUBLIC_*` se fijan al compilar).

## 3. Después de publicar

- En `master_innova` de producción, la plataforma "Portal Malpo" debe apuntar a la URL de Vercel (variable `@url_portal` del SQL 03).
- Cada `git push` a `main` vuelve a publicar automáticamente.
- Si `NEXT_PUBLIC_API_PROXY` no es `1`, agregue la URL de Vercel a los orígenes permitidos de CORS de api_portal_malpo.
- Con `NEXT_PUBLIC_API_PROXY='1'`, Vercel limita cada envío a unos 4,5 MB: respaldos y PDF más pesados fallarán. Si la API tiene **https**, puede usar `0` (el navegador llama directo; la API ya responde CORS igual que api_bodegas) y así no aplica ese límite.
