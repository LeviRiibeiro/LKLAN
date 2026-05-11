from collections import defaultdict

from fastapi import WebSocket


class WebSocketManager:
    def __init__(self) -> None:
        self.connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, machine_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.connections[machine_id].add(websocket)

    def disconnect(self, machine_id: str, websocket: WebSocket) -> None:
        if machine_id in self.connections:
            self.connections[machine_id].discard(websocket)
            if not self.connections[machine_id]:
                self.connections.pop(machine_id, None)

    async def broadcast_json(self, payload: dict) -> None:
        for machine_sockets in list(self.connections.values()):
            for ws in list(machine_sockets):
                try:
                    await ws.send_json(payload)
                except Exception:
                    machine_sockets.discard(ws)


ws_manager = WebSocketManager()
