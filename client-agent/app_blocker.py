import psutil


DEFAULT_BLOCKED_APPS = {
    "steam.exe",
    "discord.exe",
    "msedge.exe",
    "firefox.exe",
}


def enforce_blocked_apps(blocked_apps: set[str] | None = None) -> list[str]:
    apps = blocked_apps or DEFAULT_BLOCKED_APPS
    terminated: list[str] = []

    for proc in psutil.process_iter(["name"]):
        name = (proc.info.get("name") or "").lower()
        if name in apps:
            try:
                proc.kill()
                terminated.append(name)
            except Exception:
                continue
    return terminated
