async def send_command_to_agent(machine_id: str, command: dict) -> dict:
    return {"machine_id": machine_id, "queued": True, "command": command}
