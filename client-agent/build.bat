@echo off
pip install -r requirements.txt
pyinstaller --onefile --windowed --icon=assets/school_icon.ico ^
            --name=LanManagerAgent ^
            --add-data "assets;assets" ^
            --add-data "config.ini;." ^
            --hidden-import=PyQt5.sip ^
            --hidden-import=win32api ^
            --hidden-import=win32con ^
            agent.py
echo Build concluido! Arquivo em: dist\LanManagerAgent.exe
