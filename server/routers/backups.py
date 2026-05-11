from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import get_db_session
from server.services.backup_service import BackupService

router = APIRouter(prefix="/backups", tags=["backups"])

# Instância global do serviço será injetada em main.py
backup_service: BackupService = None


def set_backup_service(service: BackupService) -> None:
    """Injetar serviço de backup."""
    global backup_service
    backup_service = service


@router.get("/info")
async def get_backup_info(db: AsyncSession = Depends(get_db_session)) -> dict:
    """Obter informações sobre backups existentes."""
    if not backup_service:
        raise HTTPException(status_code=503, detail="Serviço de backup não inicializado")
    return backup_service.get_backup_info()


@router.post("/manual")
async def create_manual_backup(db: AsyncSession = Depends(get_db_session)) -> dict:
    """Criar backup manual agora."""
    if not backup_service:
        raise HTTPException(status_code=503, detail="Serviço de backup não inicializado")

    success = backup_service.create_backup()
    if success:
        return {"status": "success", "message": "Backup criado com sucesso"}
    else:
        raise HTTPException(status_code=500, detail="Erro ao criar backup")
