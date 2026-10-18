@echo off
chcp 65001 >nul
title Instalar Portal Malpo
cd /d "%~dp0"
echo.
echo  === Portal Malpo (Next 14 + api_maestra + api_portal_malpo) ===
echo.
where node >nul 2>nul || (echo  [!] Falta Node.js 18.18 o superior: https://nodejs.org & pause & exit /b 1)
if exist "prisma" (
  echo  [!] Todavia existe la version anterior con Prisma.
  echo      Ejecute primero limpiar_version_anterior.bat
  pause
  exit /b 1
)
if exist ".env" (
  findstr /c:"NEXT_PUBLIC_API_URL" ".env" >nul || (
    echo  El .env actual es de la version anterior: se guarda como .env.anterior
    move /y ".env" ".env.anterior" >nul
  )
)
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo  [ok] Se creo .env desde .env.example
  echo      Complete KEY, KEY2, USERNAME, PASSWORD con los mismos valores de Adquisiciones
  echo      y NEXT_PUBLIC_ID_PLATAFORMA con el id nuevo del Portal Malpo.
  notepad ".env"
)
echo  Instalando dependencias...
call npm install --no-audit --no-fund || (pause & exit /b 1)
echo.
echo  [ok] Listo. Use iniciar.bat para levantar el portal en http://localhost:3001
pause
