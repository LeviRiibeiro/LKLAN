@echo off
cd c:\Users\levir\Downloads\LKLAN
call .venv\Scripts\activate.bat
python -c "import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())"
pause
