from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int | None = None
    name: str | None = None
    role: str | None = None
    time_balance: int | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class UserCreate(BaseModel):
    name: str
    username: str
    password: str
    role: str = "student"
    turma: str | None = None
    time_balance: int = 0


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    username: str
    role: str
    turma: str | None
    time_balance: int
    is_suspended: bool
    warnings_count: int
    created_at: datetime


class ResetPasswordRequest(BaseModel):
    new_password: str
    confirm_password: str

    def validate_passwords(self) -> bool:
        if len(self.new_password) < 6:
            return False
        return self.new_password == self.confirm_password


class MachineHeartbeat(BaseModel):
    machine_name: str
    ip_address: str
    mac_address: str | None = None
    agent_version: str | None = None


class MachineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    ip_address: str
    status: str
    agent_version: str | None
    last_seen: datetime | None


class SessionCreate(BaseModel):
    user_id: int
    machine_id: int


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    machine_id: int
    started_at: datetime
    ended_at: datetime | None
    minutes_used: int


class SessionDetailRead(BaseModel):
    id: int
    user_id: int
    user_name: str
    machine_id: int
    machine_name: str
    started_at: datetime
    ended_at: datetime | None
    minutes_used: int
    end_reason: str | None


class EventCreate(BaseModel):
    event_type: str
    description: str
    source: str | None = "admin"
    machine_id: int | None = None
    user_id: int | None = None


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_type: str
    description: str
    source: str
    machine_id: int | None
    user_id: int | None
    created_at: datetime


# Import schemas for mass user import

class ImportUserRow(BaseModel):
    """Modelo para linha de importação (CSV/XLSX)"""
    username: str = Field(..., description="Nome de usuário (login)")
    full_name: str = Field(..., description="Nome completo do aluno")
    email: Optional[str] = None
    turma: Optional[str] = None  # Série/Turma
    

class ImportUsersRequest(BaseModel):
    """Resposta de importação"""
    filename: str
    total_rows: int
    imported: int
    skipped: int
    errors: list[dict]
    users_created: list[dict]


class ImportResult(BaseModel):
    """Resultado detalhado de uma importação"""
    success: bool
    message: str
    imported_count: int
    failed_count: int
    credentials: list[dict] = []  # username, password para impressão


__all__ = [
    "TokenResponse",
    "LoginRequest",
    "UserCreate",
    "UserRead",
    "ResetPasswordRequest",
    "MachineHeartbeat",
    "MachineRead",
    "SessionCreate",
    "SessionRead",
    "SessionDetailRead",
    "EventCreate",
    "EventRead",
    "ImportUserRow",
    "ImportUsersRequest",
    "ImportResult",
]
