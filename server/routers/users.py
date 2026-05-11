from datetime import datetime, date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import distinct, select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import Session, User, get_db_session
from server.routers.auth import hash_password
from server.schemas import ResetPasswordRequest, UserCreate, UserRead

router = APIRouter(prefix="/users", tags=["users"])


class BulkTurmaOperation(BaseModel):
    """Modelo para operações em lote em turma"""
    minutes: int = 0  # Minutos de tempo a adicionar/remover
    reason: str | None = None  # Motivo da operação


@router.get("", response_model=list[UserRead])
async def list_users(db: AsyncSession = Depends(get_db_session)) -> list[User]:
    result = await db.execute(select(User).order_by(User.name.asc()))
    return list(result.scalars().all())


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db_session)) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")
    return user


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, db: AsyncSession = Depends(get_db_session)) -> User:
    existing = await db.execute(select(User).where(User.username == payload.username))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Usuario ja existe")

    user = User(
        name=payload.name,
        username=payload.username,
        password_hash=hash_password(payload.password),
        role=payload.role,
        turma=payload.turma,
        time_balance=payload.time_balance,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/{user_id}/reset-password")
async def reset_user_password(
    user_id: int,
    payload: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    if not payload.validate_passwords():
        raise HTTPException(status_code=400, detail="Senhas nao correspondem ou muito curtas")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado")

    user.password_hash = hash_password(payload.new_password)
    await db.commit()
    return {"message": "Senha redefinida com sucesso", "user_id": user_id}


@router.post("/logout/{user_id}")
async def logout_user(user_id: int, db: AsyncSession = Depends(get_db_session)) -> dict:
    result = await db.execute(
        select(Session).where(Session.user_id == user_id).order_by(Session.started_at.desc()).limit(1)
    )
    session = result.scalar_one_or_none()
    if session and not session.ended_at:
        session.ended_at = datetime.utcnow()
        session.end_reason = "logout"
        await db.commit()

    return {"message": "Logout realizado", "user_id": user_id}


# ===== GESTÃO POR TURMA =====

@router.get("/turmas/list")
async def list_turmas(db: AsyncSession = Depends(get_db_session)) -> dict:
    """Listar todas as turmas cadastradas"""
    result = await db.execute(
        select(distinct(User.turma)).where(User.turma.isnot(None)).order_by(User.turma)
    )
    turmas = [row[0] for row in result.fetchall()]
    
    # Contar alunos por turma
    turma_counts = {}
    for turma in turmas:
        count_result = await db.execute(
            select(User).where(User.turma == turma).where(User.role == "student")
        )
        turma_counts[turma] = len(count_result.fetchall())
    
    return {
        "total_turmas": len(turmas),
        "turmas": turmas,
        "students_per_turma": turma_counts
    }


@router.get("/turma/{turma}", response_model=list[UserRead])
async def list_users_by_turma(turma: str, db: AsyncSession = Depends(get_db_session)) -> list[User]:
    """Listar todos os usuários de uma turma específica"""
    result = await db.execute(
        select(User).where(User.turma == turma).order_by(User.name.asc())
    )
    users = result.scalars().all()
    if not users:
        raise HTTPException(status_code=404, detail=f"Nenhum usuário encontrado na turma {turma}")
    return list(users)


@router.post("/turma/{turma}/add-time")
async def add_time_to_turma(
    turma: str,
    payload: BulkTurmaOperation,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Adicionar tempo de acesso para toda uma turma"""
    result = await db.execute(
        select(User).where(User.turma == turma).where(User.role == "student")
    )
    users = result.scalars().all()
    
    if not users:
        raise HTTPException(status_code=404, detail=f"Nenhum aluno encontrado na turma {turma}")
    
    updated_count = 0
    for user in users:
        user.time_balance += payload.minutes
        updated_count += 1
    
    await db.commit()
    
    return {
        "status": "success",
        "turma": turma,
        "students_updated": updated_count,
        "minutes_added": payload.minutes,
        "reason": payload.reason or "Admin operation"
    }


@router.post("/turma/{turma}/suspend")
async def suspend_turma(
    turma: str,
    payload: BulkTurmaOperation,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Suspender toda uma turma por data determinada"""
    result = await db.execute(
        select(User).where(User.turma == turma).where(User.role == "student")
    )
    users = result.scalars().all()
    
    if not users:
        raise HTTPException(status_code=404, detail=f"Nenhum aluno encontrado na turma {turma}")
    
    # Calcular data de suspensão (dias = minutes // 1440)
    days = payload.minutes // 1440 if payload.minutes > 0 else 1
    suspended_until = date.today()
    from datetime import timedelta
    suspended_until = date.today() + timedelta(days=days)
    
    suspended_count = 0
    for user in users:
        if not user.is_suspended:
            user.is_suspended = True
            user.suspended_until = suspended_until
            user.suspension_reason = payload.reason or "Turma inteira suspensa"
            suspended_count += 1
    
    await db.commit()
    
    return {
        "status": "success",
        "turma": turma,
        "students_suspended": suspended_count,
        "suspended_until": suspended_until.isoformat(),
        "reason": payload.reason or "Admin operation"
    }


@router.post("/turma/{turma}/unsuspend")
async def unsuspend_turma(
    turma: str,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Levantar suspensão de toda uma turma"""
    result = await db.execute(
        select(User).where(User.turma == turma).where(User.is_suspended == True)
    )
    users = result.scalars().all()
    
    if not users:
        raise HTTPException(status_code=404, detail=f"Nenhum aluno suspenso encontrado na turma {turma}")
    
    unsuspended_count = 0
    for user in users:
        user.is_suspended = False
        user.suspended_until = None
        user.suspension_reason = None
        unsuspended_count += 1
    
    await db.commit()
    
    return {
        "status": "success",
        "turma": turma,
        "students_unsuspended": unsuspended_count
    }

