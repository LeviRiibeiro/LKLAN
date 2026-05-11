from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import logging

from server.database import init_db
from server.routers import auth, blocked_apps, blocked_sites, import_users, lab_config, logs, machines, time_management, users, backups
try:
    from server.routers import agent_update
except Exception as e:
    print(f"Warning: agent_update não pode ser importado: {e}")
    agent_update = None
from server.services.websocket_manager import ws_manager
from server.services.backup_service import BackupService

logger = logging.getLogger(__name__)

app = FastAPI(title="LAN Manager Escolar API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(machines.router)
app.include_router(time_management.router)
app.include_router(blocked_apps.router)
app.include_router(blocked_sites.router)
app.include_router(lab_config.router)
app.include_router(logs.router)
app.include_router(backups.router)
app.include_router(import_users.router)
if agent_update:
    app.include_router(agent_update.router)


# Global backup service instance
_backup_service: BackupService = None


@app.on_event("startup")
async def on_startup() -> None:
    global _backup_service
    await init_db()
    
    # Initialize backup service
    _backup_service = BackupService(logger)
    _backup_service.start_scheduler()
    backups.set_backup_service(_backup_service)


@app.on_event("shutdown")
async def on_shutdown() -> None:
    global _backup_service
    if _backup_service:
        _backup_service.stop_scheduler()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.websocket("/ws/agent/{machine_id}")
async def ws_agent(websocket: WebSocket, machine_id: str) -> None:
    await ws_manager.connect(machine_id, websocket)
    try:
        while True:
            payload = await websocket.receive_json()
            screenshot_b64 = payload.pop("screenshot_jpeg_b64", None)
            if screenshot_b64:
                ws_manager.store_screenshot(machine_id, screenshot_b64, payload.get("timestamp"))
            payload["received_at"] = datetime.utcnow().isoformat()
            await websocket.send_json({"type": "ack", "payload": payload})
    except WebSocketDisconnect:
        ws_manager.disconnect(machine_id, websocket)
    except Exception:
        ws_manager.disconnect(machine_id, websocket)
