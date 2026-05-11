from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import Machine, Session, User, get_db_session
from server.schemas import MachineHeartbeat, MachineRead, SessionCreate, SessionDetailRead, SessionRead

router = APIRouter(prefix="/machines", tags=["machines"])


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
