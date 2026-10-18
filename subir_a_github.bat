@echo off
chcp 65001 >nul
title Subir Portal Malpo a GitHub
cd /d "%~dp0"
echo.
echo  === Subir Portal Malpo a GitHub (para luego importarlo en Vercel) ===
echo.
where git >nul 2>nul || (echo  [!] Falta Git. Instalelo desde https://git-scm.com/download/win y vuelva a ejecutar. & pause & exit /b 1)
if exist "prisma" (echo  [!] Primero ejecute limpiar_version_anterior.bat & pause & exit /b 1)

if not exist ".git" (
  git init -b main >nul
  echo  [ok] Repositorio git creado en esta carpeta.
)

for /f "delims=" %%A in ('git config user.name 2^>nul') do set GNAME=%%A
if defined GNAME goto :tiene_nombre
set /p GNAME=  Su nombre para los commits (ej. Benjamin Miton): 
git config user.name "%GNAME%"
:tiene_nombre
for /f "delims=" %%A in ('git config user.email 2^>nul') do set GMAIL=%%A
if defined GMAIL goto :tiene_mail
set /p GMAIL=  Su correo de GitHub: 
git config user.email "%GMAIL%"
:tiene_mail

git add -A
git ls-files --cached --error-unmatch .env >nul 2>nul && (git rm --cached .env >nul & echo  [ok] .env excluido: las claves no se suben.)
git ls-files --cached --error-unmatch .env.local >nul 2>nul && git rm --cached .env.local >nul
git commit -m "Portal Malpo: Next 14 + api_maestra + api_portal_malpo (stack Adquisiciones)" >nul 2>nul && echo  [ok] Cambios guardados en un commit.

git remote get-url origin >nul 2>nul && goto :tiene_remoto
echo.
echo  Cree un repositorio VACIO y PRIVADO en la cuenta de GitHub de Administracion Malpo
echo  (sin README ni .gitignore), por ejemplo: portal-malpo
echo  y pegue aqui su URL, por ejemplo: https://github.com/CUENTA/portal-malpo.git
echo.
set /p REPO=  URL del repositorio: 
if "%REPO%"=="" (echo  [!] Sin URL no se puede subir. & pause & exit /b 1)
git remote add origin "%REPO%"
:tiene_remoto

echo.
echo  Subiendo... (si GitHub pide iniciar sesion, se abrira el navegador: entre con la cuenta de Administracion Malpo)
git push -u origin main || (echo. & echo  [!] No se pudo subir. Revise la URL o el acceso a la cuenta. & pause & exit /b 1)
echo.
echo  [ok] Proyecto en GitHub. Ahora importelo en Vercel (ver VERCEL.md).
pause
