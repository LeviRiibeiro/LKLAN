from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import get_db_session
from server.services.time_checker import TimeChecker

router = APIRouter(prefix="/time", tags=["time"])


class TimeScheduleUpdate(BaseModel):
    """Modelo para atualizar horários"""
    enabled: Optional[bool] = None
    start: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    end: Optional[str] = Field(None, regex=r"^\d{2}:\d{2}$")
    monday: Optional[bool] = None
    tuesday: Optional[bool] = None
    wednesday: Optional[bool] = None
    thursday: Optional[bool] = None
    friday: Optional[bool] = None
    saturday: Optional[bool] = None
    sunday: Optional[bool] = None


@router.get("/health")
async def time_health() -> dict:
    return {"status": "ok", "module": "time_management"}


@router.get("/schedule")
async def get_schedule(db: AsyncSession = Depends(get_db_session)) -> dict:
    """Obter configuração de horários de acesso"""
    schedule = await TimeChecker.get_schedule(db)
    
    # Adicionar defaults se vazio
    if not schedule or "error" in schedule:
        return {
            "enabled": False,
            "start": "07:00",
            "end": "17:00",
            "monday": True,
            "tuesday": True,
            "wednesday": True,
            "thursday": True,
            "friday": True,
            "saturday": False,
            "sunday": False,
        }
    
    return schedule


@router.post("/schedule")
async def update_schedule(
    data: TimeScheduleUpdate,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Atualizar configuração de horários"""
    
    # Validar horários se fornecidos
    if data.start and data.end:
        start_dt = datetime.strptime(data.start, "%H:%M")
        end_dt = datetime.strptime(data.end, "%H:%M")
        
        if start_dt >= end_dt:
            raise HTTPException(
                status_code=400,
                detail="Horário de início deve ser antes do fim"
            )
    
    # Preparar dados para atualização
    update_dict = {}
    for field, value in data.dict(exclude_none=True).items():
        update_dict[field] = value
    
    # Atualizar no BD
    success = await TimeChecker.set_schedule(db, **update_dict)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Erro ao atualizar horários (verifique formato)"
        )
    
    return {
        "status": "success",
        "message": "Horários atualizados com sucesso",
        "schedule": await TimeChecker.get_schedule(db)
    }


@router.get("/check")
async def check_access(db: AsyncSession = Depends(get_db_session)) -> dict:
    """Verificar se usuário pode acessar agora (debug)"""
    allowed, reason = await TimeChecker.is_access_allowed(db, "student")
    
    return {
        "allowed": allowed,
        "reason": reason,
        "current_time": datetime.now().isoformat(),
        "schedule": await TimeChecker.get_schedule(db)
    }

