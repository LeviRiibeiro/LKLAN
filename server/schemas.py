from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


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
