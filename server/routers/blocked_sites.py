import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import LabConfig, get_db_session

router = APIRouter(prefix="/blocked-sites", tags=["blocked-sites"])


class SitePayload(BaseModel):
    value: str


async def _get_sites(db: AsyncSession) -> list[str]:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "blocked_sites"))
    record = result.scalar_one_or_none()
    if not record:
        return []
    try:
        data = json.loads(record.value)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


async def _save_sites(db: AsyncSession, sites: list[str]) -> None:
    result = await db.execute(select(LabConfig).where(LabConfig.key == "blocked_sites"))
    record = result.scalar_one_or_none()
    payload = json.dumps(sorted(set(site.strip() for site in sites if site.strip())))
    if record:
      record.value = payload
    else:
      db.add(LabConfig(key="blocked_sites", value=payload))
    await db.commit()


@router.get("")
async def list_blocked_sites(db: AsyncSession = Depends(get_db_session)) -> list[str]:
    return await _get_sites(db)


@router.post("")
async def add_blocked_site(payload: SitePayload, db: AsyncSession = Depends(get_db_session)) -> list[str]:
    sites = await _get_sites(db)
    sites.append(payload.value)
    await _save_sites(db, sites)
    return await _get_sites(db)


@router.delete("/{site_value}")
async def delete_blocked_site(site_value: str, db: AsyncSession = Depends(get_db_session)) -> list[str]:
    sites = await _get_sites(db)
    filtered = [site for site in sites if site != site_value]
    await _save_sites(db, filtered)
    return await _get_sites(db)
