@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ====================================
echo   Deploy Chatbot a Firebase
echo ====================================
echo.

REM ── 1) Dependencias de functions ────────────────────────────
echo [1/5] Instalando dependencias en functions...
pushd functions
call npm install
if %errorlevel% neq 0 (
    echo.
    echo ERROR: fallo "npm install" en functions. Deploy cancelado.
    popd
    pause
    exit /b 1
)
popd

REM Le da un respiro al antivirus para terminar de escanear los archivos
REM que "npm install" acaba de tocar, antes de que Firebase intente leerlos.
echo Esperando unos segundos para que el antivirus termine de escanear...
timeout /t 8 /nobreak >nul

REM ── 2) Verificacion de sintaxis antes de subir nada ─────────
echo.
echo [2/5] Verificando sintaxis de functions\index.js...
node --check functions\index.js
if %errorlevel% neq 0 (
    echo.
    echo ERROR: functions\index.js tiene un error de sintaxis. Corrige antes de desplegar.
    pause
    exit /b 1
)

REM ── 3) Variables de entorno minimas ─────────────────────────
echo.
echo [3/5] Verificando functions\.env...
if not exist "functions\.env" (
    echo ADVERTENCIA: no existe functions\.env. Revisa que SPREADSHEET_ID y SHEET_RANGE
    echo esten configurados antes de continuar.
    choice /M "Continuar de todas formas"
    if errorlevel 2 (
        echo Deploy cancelado por el usuario.
        exit /b 1
    )
) else (
    findstr /I /C:"GOOGLE_SERVICE_ACCOUNT_JSON" functions\.env >nul 2>nul
    if !errorlevel! equ 0 (
        echo.
        echo ERROR: functions\.env tiene GOOGLE_SERVICE_ACCOUNT_JSON.
        echo Esa variable ya esta en Secret Manager y choca con el secreto si tambien
        echo esta en .env. Borra esa linea de functions\.env antes de desplegar
        echo ^(dejala solo cuando uses dev.bat, opcion 2^).
        pause
        exit /b 1
    )
)

REM ── 4) Deploy: functions primero, luego hosting ─────────────
REM FUNCTIONS_DISCOVERY_TIMEOUT evita el timeout de 10s en Windows
REM (antivirus/Defender escaneando node_modules durante el analisis).
echo.
echo [4/5] Desplegando functions...
set FUNCTIONS_DISCOVERY_TIMEOUT=90
call firebase deploy --only functions
if %errorlevel% neq 0 (
    echo.
    echo ERROR: fallo el deploy de functions. Revisa el mensaje de arriba.
    echo No se desplegara hosting.
    pause
    exit /b 1
)

echo.
echo [5/5] Desplegando hosting...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo ERROR: fallo el deploy de hosting. functions ya quedo desplegado.
    pause
    exit /b 1
)

echo.
echo ====================================
echo   Deploy completado con exito
echo   https://chatbotedl.web.app
echo ====================================
pause
