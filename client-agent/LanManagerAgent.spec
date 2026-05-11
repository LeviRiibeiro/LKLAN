# -*- mode: python ; coding: utf-8 -*-
# PyInstaller spec file for LAN Manager Escolar Agent

a = Analysis(
    ['agent.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('assets', 'assets'),
        ('lock_screen', 'lock_screen'),
        ('config.ini', '.'),
    ],
    hiddenimports=[
        'PyQt5.sip',
        'win32api',
        'win32con',
        'win32process',
        'win32service',
        'win32serviceutil',
        'websockets',
        'requests',
        'psutil',
        'mss',
        'PIL',
        'cryptography',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludedimports=[],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='LanManagerAgent',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='assets/school_icon.ico',
)
