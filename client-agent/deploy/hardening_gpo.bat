@echo off
:: Desabilita Task Manager para contas de aluno (aplicar em contexto de politica de usuario)
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f
echo Politica aplicada.
