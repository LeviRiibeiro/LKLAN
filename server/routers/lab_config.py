import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import LabConfig, get_db_session

router = APIRouter(prefix="/lab-config", tags=["lab-config"])


class LabSettingsPayload(BaseModel):
    start: str
    end: str
    days: list[str]
    backup_path: str
    ntp_server: str


DEFAULT_SETTINGS = {
    "start": "07:00",
    "end": "17:00",
    "days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
    "backup_path": "C:\\LanManagerBackup",
    "ntp_server": "pool.ntp.br",
}


async def _get_settings(db: AsyncSession) -> dict:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "lab_settings"))
    record = result.scalar_one_or_none()
    if not record:
        return DEFAULT_SETTINGS.copy()
    try:
        data = json.loads(record.value)
        return {**DEFAULT_SETTINGS, **data} if isinstance(data, dict) else DEFAULT_SETTINGS.copy()
    except json.JSONDecodeError:
        return DEFAULT_SETTINGS.copy()


@router.get("/settings")
async def get_settings(db: AsyncSession = Depends(get_db_session)) -> dict:
    return await _get_settings(db)


@router.put("/settings")
async def save_settings(payload: LabSettingsPayload, db: AsyncSession = Depends(get_db_session)) -> dict:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "lab_settings"))
    record = result.scalar_one_or_none()
    payload_json = json.dumps(payload.model_dump())
    if record:
        record.value = payload_json
    else:
        db.add(LabConfig(key="lab_settings", value=payload_json))
    await db.commit()
    return await _get_settings(db)
