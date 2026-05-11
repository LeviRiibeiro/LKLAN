from collections import defaultdict
from base64 import b64decode

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self.connections: dict[str, set[WebSocket]] = defaultdict(set)
        self.last_screenshots: dict[str, dict[str, bytes | str]] = {}

    async def connect(self, machine_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[machine_id].add(websocket)

    def disconnect(self, machine_id: str, websocket: WebSocket) -> None:
        if machine_id in self.connections:
            self.connections[machine_id].discard(websocket)
            if not self.connections[machine_id]:
                self.connections.pop(machine_id, None)

    def store_screenshot(self, machine_id: str, screenshot_b64: str, timestamp: str | None = None) -> None:
        self.last_screenshots[machine_id] = {
            "image": b64decode(screenshot_b64),
            "timestamp": timestamp or "",
        }

    def get_screenshot(self, machine_id: str) -> dict[str, bytes | str] | None:
        return self.last_screenshots.get(machine_id)

    async def send_to_machine(self, machine_id: str, payload: dict) -> int:
        sockets = list(self.connections.get(machine_id, set()))
        delivered = 0
        for ws in sockets:
            try:
                await ws.send_json(payload)
                delivered += 1
            except Exception:
                self.connections[machine_id].discard(ws)
        return delivered

    async def broadcast_json(self, payload: dict) -> None:
        for machine_sockets in list(self.connections.values()):
            for ws in list(machine_sockets):
                try:
                    await ws.send_json(payload)
                except Exception:
                    machine_sockets.discard(ws)


ws_manager = WebSocketManager()
