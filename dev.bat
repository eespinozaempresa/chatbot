@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

echo ====================================
echo   Modo desarrollo - Chatbot
echo ====================================
echo.
echo   1) Emuladores de Firebase (recomendado, igual a produccion)
echo   2) Servidor local rapido (src\server.js, sin emuladores)
echo.
choice /C 12 /M "Elige una opcion"

if errorlevel 2 goto SERVIDOR_RAPIDO
if errorlevel 1 goto EMULADORES

:EMULADORES
echo.
echo [1/3] Verificando dependencias de functions...
if not exist "functions\node_modules" (
    pushd functions
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: fallo "npm install" en functions.
        popd
        pause
        exit /b 1
    )
    popd
)

echo.
echo [2/3] Verificando archivos de configuracion...
if not exist "functions\.env" (
    echo ADVERTENCIA: no existe functions\.env
    echo   Debe tener SPREADSHEET_ID y SHEET_RANGE.
)
if not exist "functions\.secret.local" (
    echo ADVERTENCIA: no existe functions\.secret.local
    echo   Sin ese archivo, el emulador no podra leer GOOGLE_SERVICE_ACCOUNT_JSON.
    echo   Crea functions\.secret.local con una linea asi:
    echo   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account", ... todo en una sola linea}
    echo.
    choice /M "Continuar de todas formas"
    if errorlevel 2 exit /b 1
)

echo.
echo [3/3] Iniciando emuladores (Functions + Hosting)...
echo   Frontend y API: http://localhost:5000
echo   Panel de control: http://localhost:4000
echo.
call firebase emulators:start --only functions,hosting
goto FIN

:SERVIDOR_RAPIDO
echo.
echo [1/2] Verificando dependencias...
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: fallo "npm install" en la raiz.
        pause
        exit /b 1
    )
)
if not exist "functions\node_modules" (
    pushd functions
    call npm install
    popd
)

echo.
echo ADVERTENCIA: este modo NO usa Secret Manager. Para que funcione,
echo GOOGLE_SERVICE_ACCOUNT_JSON debe estar temporalmente en functions\.env
echo (no lo subas asi a git; es solo para probar en tu maquina).
echo.
if not exist "functions\.env" (
    echo ERROR: no existe functions\.env. Creala con SPREADSHEET_ID, SHEET_RANGE
    echo y GOOGLE_SERVICE_ACCOUNT_JSON antes de usar este modo.
    pause
    exit /b 1
)

echo.
echo [2/2] Iniciando servidor local en http://localhost:3000 ...
call npm run dev
goto FIN

:FIN
pause
