@echo off
setlocal enabledelayedexpansion

echo ============================================
echo LAN Manager Escolar - Sprint 1 Test Suite
echo ============================================
echo.

set PYTHON_FOUND=0
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✅ Python encontrado
    set PYTHON_FOUND=1
) else (
    echo ❌ Python nao encontrado. Instale Python 3.11+
    exit /b 1
)

echo.
echo Verificando estrutura de pastas...

if not exist "server" (
    echo ❌ Pasta 'server' nao encontrada
    exit /b 1
)
if not exist "client-agent" (
    echo ❌ Pasta 'client-agent' nao encontrada
    exit /b 1
)
echo ✅ Estrutura de pastas correta

echo.
echo Compilando Python (server e client-agent)...
python -m compileall server client-agent -q
if %ERRORLEVEL% EQU 0 (
    echo ✅ Compilacao bem-sucedida
) else (
    echo ❌ Erros de compilacao encontrados
    exit /b 1
)

echo.
echo Testando imports basicos...
python -c "from server.database import Base; print('✅ Database models OK')" 2>nul || echo ❌ Database import falhou
python -c "from server.config import settings; print('✅ Config OK')" 2>nul || echo ❌ Config import falhou
python -c "from client_agent.app_blocker import enforce_blocked_apps; print('✅ App blocker OK')" 2>nul || echo ❌ App blocker import falhou

echo.
echo ============================================
echo Teste rapido concluido!
echo ============================================
echo.
echo Proximos passos:
echo 1. cd server ^&^& pip install -r requirements.txt
echo 2. python seed.py
echo 3. uvicorn main:app --reload
echo.
echo Para testar o agente:
echo 1. cd client-agent ^&^& pip install -r requirements.txt
echo 2. python agent.py
echo.

pause
