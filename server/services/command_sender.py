from server.services.websocket_manager import ws_manager


async def send_command_to_agent(machine_id: str, command: dict) -> dict:
    delivered = await ws_manager.send_to_machine(machine_id, command)
    return {"machine_id": machine_id, "queued": delivered == 0, "delivered": delivered, "command": command}
