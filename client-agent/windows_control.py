import ctypes
import os


def lock_workstation() -> bool:
    try:
        return bool(ctypes.windll.user32.LockWorkStation())
    except Exception:
        return False


def restart_computer() -> bool:
    try:
        return os.system("shutdown /r /t 0") == 0
    except Exception:
        return False


def shutdown_computer() -> bool:
    try:
        return os.system("shutdown /s /t 0") == 0
    except Exception:
        return False
