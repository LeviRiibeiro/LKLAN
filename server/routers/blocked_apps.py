import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import LabConfig, get_db_session

router = APIRouter(prefix="/blocked-apps", tags=["blocked-apps"])


class AppPayload(BaseModel):
    value: str


async def _get_apps(db: AsyncSession) -> list[str]:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "blocked_apps"))
    record = result.scalar_one_or_none()
    if not record:
        return ["msedge.exe", "firefox.exe"]
    try:
        data = json.loads(record.value)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return ["msedge.exe", "firefox.exe"]


async def _save_apps(db: AsyncSession, apps: list[str]) -> None:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "blocked_apps"))
    record = result.scalar_one_or_none()
    payload = json.dumps(sorted(set(app.strip() for app in apps if app.strip())))
    if record:
        record.value = payload
    else:
        db.add(LabConfig(key="blocked_apps", value=payload))
    await db.commit()


@router.get("")
async def list_blocked_apps(db: AsyncSession = Depends(get_db_session)) -> list[str]:
    return await _get_apps(db)


@router.post("")
async def add_blocked_app(payload: AppPayload, db: AsyncSession = Depends(get_db_session)) -> list[str]:
    apps = await _get_apps(db)
    apps.append(payload.value)
    await _save_apps(db, apps)
    return await _get_apps(db)


@router.delete("/{app_value}")
async def delete_blocked_app(app_value: str, db: AsyncSession = Depends(get_db_session)) -> list[str]:
    apps = await _get_apps(db)
    filtered = [app for app in apps if app != app_value]
    await _save_apps(db, filtered)
    return await _get_apps(db)
