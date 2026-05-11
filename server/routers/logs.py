from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import Event, get_db_session
from server.schemas import EventRead, EventCreate

router = APIRouter(prefix="/logs", tags=["logs"])


@router.get("", response_model=list[EventRead])
async def list_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    event_type: Optional[str] = None,
    source: Optional[str] = None,
    machine_id: Optional[int] = None,
    user_id: Optional[int] = None,
    days: int = Query(7, ge=1, le=30),
    session: AsyncSession = Depends(get_db_session),
) -> list[EventRead]:
    """
    List events with optional filters.
    - event_type: filter by event type (login, logout, block, config_change, etc)
    - source: filter by source (admin, agent, system)
    - machine_id: filter by machine
    - user_id: filter by user
    - days: show events from last N days (default 7)
    """
    query = select(Event)
    
    # Filter by date range
    since = datetime.utcnow() - timedelta(days=days)
    query = query.where(Event.created_at >= since)
    
    # Apply filters
    if event_type:
        query = query.where(Event.event_type == event_type)
    if source:
        query = query.where(Event.source == source)
    if machine_id:
        query = query.where(Event.machine_id == machine_id)
    if user_id:
        query = query.where(Event.user_id == user_id)
    
    # Order by recent first, paginate
    query = query.order_by(desc(Event.created_at)).offset(skip).limit(limit)
    
    result = await session.execute(query)
    events = result.scalars().all()
    
    return events


@router.get("/{event_id}", response_model=EventRead)
async def get_event(
    event_id: int,
    session: AsyncSession = Depends(get_db_session),
) -> EventRead:
    """Get a specific event by ID."""
    result = await session.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return event


@router.post("", response_model=EventRead, status_code=201)
async def create_event(
    event_data: EventCreate,
    session: AsyncSession = Depends(get_db_session),
) -> EventRead:
    """Create a new event log entry."""
    new_event = Event(
        event_type=event_data.event_type,
        description=event_data.description,
        source=event_data.source or "admin",
        machine_id=event_data.machine_id,
        user_id=event_data.user_id,
    )
    
    session.add(new_event)
    await session.commit()
    await session.refresh(new_event)
    
    return new_event


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: int,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete an event log entry."""
    result = await session.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    await session.delete(event)
    await session.commit()


@router.delete("", status_code=204)
async def delete_old_events(
    days: int = Query(30, ge=1, le=365),
    session: AsyncSession = Depends(get_db_session),
) -> None:
    """Delete events older than N days."""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    result = await session.execute(select(Event).where(Event.created_at < cutoff_date))
    old_events = result.scalars().all()
    
    for event in old_events:
        await session.delete(event)
    
    await session.commit()
