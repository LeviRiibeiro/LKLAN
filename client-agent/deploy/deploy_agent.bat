@echo off
set SERVER=\\192.168.1.1\instalar
set DEST=C:\LanManager

echo Copiando agente...
mkdir %DEST% 2>nul
copy %SERVER%\LanManagerAgent.exe %DEST%\
copy %SERVER%\config.ini %DEST%\

echo Aplicando exclusao no Windows Defender...
powershell -Command "Add-MpPreference -ExclusionPath 'C:\LanManager'"

echo Configurando regras de firewall...
netsh advfirewall firewall add rule name="LanManager FastAPI 8000 OUT" dir=out action=allow protocol=TCP remoteport=8000
netsh advfirewall firewall add rule name="LanManager TigerVNC 5900 IN" dir=in action=allow protocol=TCP localport=5900

echo Configurando sincronizacao de horario (NTP)...
w32tm /config /syncfromflags:manual /manualpeerlist:"pool.ntp.br" /update
w32tm /resync /force

echo Instalando como servico Windows...
%SERVER%\nssm.exe install LanManagerAgent %DEST%\LanManagerAgent.exe
%SERVER%\nssm.exe set LanManagerAgent Start SERVICE_AUTO_START
net start LanManagerAgent

echo Instalando TigerVNC...
%SERVER%\TigerVNC-64bit.msi /quiet

echo Aplicando bloqueio de Task Manager para usuarios comuns...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f

echo Concluido!
pause
