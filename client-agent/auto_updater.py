from dataclasses import dataclass

import requests


@dataclass
class AgentVersionInfo:
    version: str
    url: str


def check_for_update(server_host: str, server_port: int, current_version: str) -> AgentVersionInfo | None:
    endpoint = f"http://{server_host}:{server_port}/agent/version"
    try:
        response = requests.get(endpoint, timeout=5)
        response.raise_for_status()
        payload = response.json()
        if payload.get("version") and payload.get("version") != current_version:
            return AgentVersionInfo(version=payload["version"], url=payload.get("url", ""))
    except Exception:
        return None
    return None
