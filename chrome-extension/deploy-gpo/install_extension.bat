@echo off
rem Install Chrome extension via Group Policy (machine-wide)
rem Usage: run as Administrator. Optionally provide EXTENSION_ID and EXTENSION_URL as args:
rem    install_extension.bat <EXTENSION_ID> <EXTENSION_URL>
rem Example: install_extension.bat abcdefghijklmnop http://192.168.1.1/extension/extension.crx

:: Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Execute este script como Administrador.
  pause
  exit /b 1
)

setlocal
if "%~1"=="" (
  set /p EXTENSION_ID=Digite o EXTENSION_ID da extensao: 
) else set EXTENSION_ID=%~1

if "%~2"=="" (
  set /p EXTENSION_URL=Digite a URL completa para o .crx (ex: http://192.168.1.1/extension/extension.crx): 
) else set EXTENSION_URL=%~2

echo Configurando politica para instalar a extensao %EXTENSION_ID% a partir de %EXTENSION_URL%

reg add "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /t REG_SZ /d "%EXTENSION_ID%;%EXTENSION_URL%" /f

if %errorlevel% equ 0 (
  echo OK: politica aplicada.
) else (
  echo ERRO: falha ao aplicar a politica.
)

echo.
echo Observacoes:
echo - Hospede o arquivo .crx em um servidor acessivel (ex: http://192.168.1.1/extension/extension.crx).
echo - Alternativa de teste local: no Chrome abra Extensoes -> Carregar sem compactar e instale a pasta da extensao.
echo - Para GPO, coloque essa entrada via HKLM ou via Administrative Templates no AD.
pause
endlocal
