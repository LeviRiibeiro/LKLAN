@echo off
set EXTENSION_ID=SEU_ID_DA_EXTENSAO
set EXTENSION_URL=http://192.168.1.1:8000/extension/extension.crx

reg add "HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist" /v 1 /t REG_SZ /d "%EXTENSION_ID%;%EXTENSION_URL%" /f

echo Extensao configurada via politica.
