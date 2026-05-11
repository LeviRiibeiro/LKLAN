import asyncio
import base64
import configparser
import json
import logging
import platform
import socket
import time

import requests
import websockets

from app_blocker import enforce_blocked_apps
from screenshot import capture_screenshot_jpeg
from windows_control import lock_workstation, restart_computer, shutdown_computer

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def load_config() -> dict:
    parser = configparser.ConfigParser()
    parser.read("config.ini", encoding="utf-8")

    return {
        "host": parser.get("server", "host", fallback="192.168.1.1"),
        "port": parser.getint("server", "port", fallback=8000),
        "machine_name": parser.get("agent", "machine_name", fallback=platform.node()),
        "version": parser.get("agent", "agent_version", fallback="0.1.0"),
        "heartbeat_seconds": parser.getint("agent", "heartbeat_seconds", fallback=30),
    }


def get_ip() -> str:
    try:
        return socket.gethostbyname(socket.gethostname())
    except Exception:
        return "127.0.0.1"


def send_rest_heartbeat(cfg: dict) -> None:
    payload = {
        "machine_name": cfg["machine_name"],
        "ip_address": get_ip(),
        "mac_address": None,
        "agent_version": cfg["version"],
    }
    url = f"http://{cfg['host']}:{cfg['port']}/machines/heartbeat"
    try:
        response = requests.post(url, json=payload, timeout=5)
        if response.status_code == 200:
            logger.info(f"Heartbeat enviado: {cfg['machine_name']}")
    except Exception as exc:
        logger.warning(f"Falha ao enviar heartbeat: {exc}")


async def run_ws(cfg: dict) -> None:
    ws_url = f"ws://{cfg['host']}:{cfg['port']}/ws/agent/{cfg['machine_name']}"
    backoff = 1
    heartbeat_count = 0
    while True:
        try:
            logger.info(f"Conectando ao servidor WebSocket: {ws_url}")
            async with websockets.connect(ws_url, ping_interval=20, ping_timeout=20) as ws:
                backoff = 1
                logger.info("Conectado ao servidor. Iniciando heartbeats.")
                while True:
                    heartbeat_count += 1
                    terminated = enforce_blocked_apps()
                    payload = {
                        "machine_name": cfg["machine_name"],
                        "ip_address": get_ip(),
                        "agent_version": cfg["version"],
                        "terminated_apps": terminated,
                        "timestamp": int(time.time()),
                    }
                    if heartbeat_count % 4 == 0:
                        screenshot_jpeg = capture_screenshot_jpeg()
                        payload["screenshot_jpeg_b64"] = base64.b64encode(screenshot_jpeg).decode("ascii")
                    await ws.send(json.dumps(payload))

                    deadline = asyncio.get_event_loop().time() + 0.25
                    while True:
                        remaining = deadline - asyncio.get_event_loop().time()
                        if remaining <= 0:
                            break
                        try:
                            incoming = await asyncio.wait_for(ws.recv(), timeout=remaining)
                        except asyncio.TimeoutError:
                            break

                        try:
                            message = json.loads(incoming)
                        except Exception:
                            continue

                        if message.get("type") != "command":
                            continue

                        command = message.get("command")
                        logger.info(f"Comando remoto recebido: {command}")
                        if command == "lock":
                            lock_workstation()
                        elif command == "restart":
                            restart_computer()
                        elif command == "shutdown":
                            shutdown_computer()
                    await asyncio.sleep(cfg["heartbeat_seconds"])
        except Exception as exc:
            logger.error(f"Desconectado: {exc}. Tentando novamente em {backoff}s...")
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, 60)


async def main() -> None:
    cfg = load_config()
    logger.info(f"LAN Manager Escolar - Agente {cfg['version']}")
    logger.info(f"Servidor: {cfg['host']}:{cfg['port']}")
    logger.info(f"Máquina: {cfg['machine_name']}")
    
    send_rest_heartbeat(cfg)
    await run_ws(cfg)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Agente encerrado.")
