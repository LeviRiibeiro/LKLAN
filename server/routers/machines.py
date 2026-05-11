from datetime import datetime
from base64 import b64decode
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import Machine, Session, User, get_db_session
from server.schemas import MachineHeartbeat, MachineRead, SessionCreate, SessionDetailRead, SessionRead
from server.services.command_sender import send_command_to_agent
from server.services.websocket_manager import ws_manager

router = APIRouter(prefix="/machines", tags=["machines"])


class RemoteCommandRequest(BaseModel):
    command: Literal["lock", "restart", "shutdown"]


@router.post("/heartbeat", response_model=MachineRead)
async def machine_heartbeat(payload: MachineHeartbeat, db: AsyncSession = Depends(get_db_session)) -> Machine:
    result = await db.execute(select(Machine).where(Machine.ip_address == payload.ip_address))
    machine = result.scalar_one_or_none()

    if machine is None:
        machine = Machine(
            name=payload.machine_name,
            ip_address=payload.ip_address,
            mac_address=payload.mac_address,
            status="online",
            last_seen=datetime.utcnow(),
            agent_version=payload.agent_version,
        )
        db.add(machine)
    else:
        machine.name = payload.machine_name
        machine.mac_address = payload.mac_address
        machine.status = "online"
        machine.agent_version = payload.agent_version
        machine.last_seen = datetime.utcnow()

    await db.commit()
    await db.refresh(machine)
    return machine


@router.get("", response_model=list[MachineRead])
async def list_machines(db: AsyncSession = Depends(get_db_session)) -> list[Machine]:
    result = await db.execute(select(Machine).order_by(Machine.name.asc()))
    return list(result.scalars().all())


@router.get("/{machine_id}", response_model=MachineRead)
async def get_machine(machine_id: int, db: AsyncSession = Depends(get_db_session)) -> Machine:
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Maquina nao encontrada")
    return machine


@router.get("/{machine_id}/screenshot")
async def get_machine_screenshot(machine_id: int, db: AsyncSession = Depends(get_db_session)) -> Response:
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Maquina nao encontrada")

    screenshot = ws_manager.get_screenshot(machine.name)
    if not screenshot:
        raise HTTPException(status_code=404, detail="Screenshot nao disponivel")

    image_bytes = screenshot.get("image")
    if not isinstance(image_bytes, (bytes, bytearray)):
        raise HTTPException(status_code=404, detail="Screenshot nao disponivel")

    return Response(content=bytes(image_bytes), media_type="image/jpeg")


@router.post("/{machine_id}/command")
async def send_machine_command(
    machine_id: int,
    payload: RemoteCommandRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(select(Machine).where(Machine.id == machine_id))
    machine = result.scalar_one_or_none()
    if not machine:
        raise HTTPException(status_code=404, detail="Maquina nao encontrada")

    command_payload = {"type": "command", "command": payload.command}
    delivery = await send_command_to_agent(machine.name, command_payload)
    return {
        "status": "ok",
        "machine_id": machine.id,
        "machine_name": machine.name,
        "delivery": delivery,
    }


@router.get("/{machine_id}/sessions", response_model=list[SessionDetailRead])
async def list_machine_sessions(machine_id: int, db: AsyncSession = Depends(get_db_session)) -> list[dict]:
    result = await db.execute(
        select(Session, User.name, Machine.name)
        .join(User, User.id == Session.user_id)
        .join(Machine, Machine.id == Session.machine_id)
        .where(Session.machine_id == machine_id)
        .order_by(Session.started_at.desc())
    )

    sessions: list[dict] = []
    for session, user_name, machine_name in result.all():
        sessions.append(
            {
                "id": session.id,
                "user_id": session.user_id,
                "user_name": user_name,
                "machine_id": session.machine_id,
                "machine_name": machine_name,
                "started_at": session.started_at,
                "ended_at": session.ended_at,
                "minutes_used": session.minutes_used,
                "end_reason": session.end_reason,
            }
        )

    return sessions


@router.post("/{machine_id}/session", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session(
    machine_id: int,
    payload: SessionCreate,
    db: AsyncSession = Depends(get_db_session),
) -> Session:
    session = Session(
        user_id=payload.user_id,
        machine_id=machine_id,
        started_at=datetime.utcnow(),
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{machine_id}/session/{session_id}/end")
async def end_session(
    machine_id: int,
    session_id: int,
    end_reason: str = "logout",
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(Session).where(Session.id == session_id).where(Session.machine_id == machine_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada")

    session.ended_at = datetime.utcnow()
    session.end_reason = end_reason
    if session.started_at:
        delta = session.ended_at - session.started_at
        session.minutes_used = int(delta.total_seconds() / 60)

    await db.commit()
    return {"message": "Sessao encerrada", "session_id": session_id, "minutes_used": session.minutes_used}
