@echo off
setlocal enableextensions enabledelayedexpansion

set "ROOT=%~dp0"
cd /d "%ROOT%"
set "LOG=%ROOT%admin_bootstrap.log"
echo ========================================== > "%LOG%"
echo LAN Manager Escolar - Admin Bootstrap >> "%LOG%"
echo Started at %DATE% %TIME% >> "%LOG%"
echo. >> "%LOG%"

echo ==========================================
echo   LAN Manager Escolar - Admin Bootstrap
echo ==========================================
echo.

where git >nul 2>&1 || (
  echo ERRO: Git nao encontrado no PATH.
  echo Instale o Git for Windows e tente novamente.
  pause
  exit /b 1
)

where py >nul 2>&1 || (
  echo ERRO: py launcher nao encontrado.
  echo Instale Python 3.x marcando Add Python to PATH.
  pause
  exit /b 1
)

where node >nul 2>&1 || (
  echo ERRO: Node.js nao encontrado no PATH.
  echo Instale Node.js 18+ e tente novamente.
  pause
  exit /b 1
)

where npm >nul 2>&1 || (
  echo ERRO: npm nao encontrado no PATH.
  echo Reinstale Node.js com npm habilitado.
  pause
  exit /b 1
)

if not exist ".git" (
  echo ERRO: este script deve ser executado dentro do repositorio LKLAN.
  pause
  exit /b 1
)

if /I "%~1"=="run" goto :run
if /I "%~1"=="start" goto :run
if /I "%~1"=="prep" goto :prep
if /I "%~1"=="build" goto :build
if /I "%~1"=="seed" goto :seed
if /I "%~1"=="dashboard" goto :dashboard
if /I "%~1"=="server" goto :server

goto :prep

:prep
echo [1/5] Criando ambiente virtual Python...
set "PYTHON_CMD=py -3"
if not exist ".venv" (
  py -3.11 -m venv .venv
  if errorlevel 1 (
    py -3 -m venv .venv
    if errorlevel 1 (
      py -m venv .venv
      if errorlevel 1 goto :fail
    )
  )
)

call ".venv\Scripts\activate.bat"
python -m pip install --upgrade pip
if errorlevel 1 goto :fail

echo [2/5] Instalando dependencias do servidor...
echo [2/5] Instalando dependencias do servidor... >> "%LOG%"
cd /d "%ROOT%server"
python -m pip install -r requirements.txt >> "%LOG%" 2>&1
if errorlevel 1 goto :fail
cd /d "%ROOT%"

echo [3/5] Seed do banco... >> "%LOG%"
python -c "import sys; sys.path.insert(0, '.'); import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())" >> "%LOG%" 2>&1
if errorlevel 1 goto :fail

echo [4/5] Instalando dependencias do dashboard... >> "%LOG%"
cd /d "%ROOT%admin-dashboard"
npm install >> "%LOG%" 2>&1
if errorlevel 1 goto :fail
cd /d "%ROOT%"

echo [5/5] Build do dashboard... >> "%LOG%"
cd /d "%ROOT%admin-dashboard"
npm run build >> "%LOG%" 2>&1
if errorlevel 1 goto :fail
cd /d "%ROOT%"

echo.
echo OK: ambiente preparado.
echo Use ADMIN_BOOTSTRAP.bat run para iniciar servidor e dashboard.
pause
exit /b 0

:build
echo [BUILD] Instalando dependencias do dashboard e compilando frontend...
call :prep
exit /b %errorlevel%

:seed
echo [SEED] Executando seed do banco...
call ".venv\Scripts\activate.bat"
python -c "import sys; sys.path.insert(0, '.'); import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())"
if errorlevel 1 goto :fail
pause
exit /b 0

:server
echo [SERVER] Iniciando FastAPI em 0.0.0.0:8000...
call ".venv\Scripts\activate.bat"
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
exit /b %errorlevel%

:dashboard
echo [DASHBOARD] Iniciando Vite...
cd /d "%ROOT%admin-dashboard"
npm run dev
exit /b %errorlevel%

:run
echo.
echo ==========================================
echo   Iniciando servidor e dashboard...
echo ==========================================
echo.

REM Criar script temporario para servidor (evita problema de sintaxe com parenteses)
setlocal
(
  echo @echo off
  echo cd /d "%ROOT%"
  echo call .venv\Scripts\activate.bat
  echo python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
) > "%TEMP%\lklan_server.bat"

REM Criar script temporario para dashboard
(
  echo @echo off
  echo cd /d "%ROOT%admin-dashboard"
  echo npm run dev
) > "%TEMP%\lklan_dashboard.bat"

REM Iniciar servidor em nova janela
start "LKLAN Server (FastAPI)" "%TEMP%\lklan_server.bat"

REM Aguardar 2 segundos para server iniciar
timeout /t 2 /nobreak

REM Iniciar dashboard em nova janela
start "LKLAN Dashboard (Vite)" "%TEMP%\lklan_dashboard.bat"

echo.
echo OK: servidor e dashboard foram abertos em janelas separadas.
echo.
echo ===== ACESSO =====
echo Backend:  http://127.0.0.1:8000/docs
echo Dashboard: http://localhost:5173
echo ==================
echo.
echo Pressione qualquer tecla para encerrar este prompt
echo (as janelas de servidor e dashboard continuarao abertas)...
pause
endlocal
exit /b 0

:fail
echo.
echo ERRO: bootstrap interrompido.
pause
exit /b 1
