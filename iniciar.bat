@echo off
chcp 65001 >nul
title Portal Malpo - http://localhost:3001
cd /d "%~dp0"
if not exist "node_modules" call instalar.bat
echo  Compilando...
call npm run build || (pause & exit /b 1)
start "" http://localhost:3001
call npm start
