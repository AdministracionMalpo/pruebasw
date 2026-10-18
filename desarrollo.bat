@echo off
chcp 65001 >nul
title Portal Malpo (desarrollo) - http://localhost:3001
cd /d "%~dp0"
if not exist "node_modules" call instalar.bat
start "" http://localhost:3001
call npm run dev
