@echo off
chcp 65001 >nul
title Limpiar version anterior (Prisma / PostgreSQL)
cd /d "%~dp0"
echo.
echo  Este script borra SOLO los archivos de la arquitectura anterior del portal
echo  (Prisma, PostgreSQL, auth propia) dentro de esta carpeta:
echo    prisma\  docker-compose.yml  scripts\  storage\  LEEME.md
echo    src\lib\  src\components\  src\middleware.ts
echo    src\app\(portal)\  src\app\acciones\  src\app\login\
echo    src\app\api\adjuntos\  src\app\api\documentos\  src\app\api\reportes\  src\app\api\auth\logout\
echo.
echo  No toca nada fuera de esta carpeta.
set /p OK=  Escriba SI para continuar: 
if /i not "%OK%"=="SI" exit /b 0
for %%D in ("prisma" "scripts" "storage" ".next" "src\lib" "src\components" "src\app\(portal)" "src\app\acciones" "src\app\login" "src\app\api\adjuntos" "src\app\api\documentos" "src\app\api\reportes" "src\app\api\auth\logout") do (
  if exist "%%~D" rmdir /s /q "%%~D" && echo  borrado %%~D
)
for %%F in ("docker-compose.yml" "LEEME.md" "src\middleware.ts") do (
  if exist "%%~F" del /q "%%~F" && echo  borrado %%~F
)
echo.
echo  [ok] Listo. Ahora ejecute instalar.bat
pause
