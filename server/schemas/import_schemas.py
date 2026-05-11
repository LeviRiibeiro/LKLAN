"""
Schema para importação em massa de usuários
"""

from pydantic import BaseModel, Field
from typing import Optional


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
