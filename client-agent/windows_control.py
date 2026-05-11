import ctypes


def lock_workstation() -> bool:
    try:
        return bool(ctypes.windll.user32.LockWorkStation())
    except Exception:
        return False
