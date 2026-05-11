"""
Router para gerenciamento de atualização remota do agente
"""

from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from server.config import settings

router = APIRouter(prefix="/agent-update", tags=["agent-update"])


class AgentVersion(BaseModel):
    """Versão atual do agente"""
    version: str
    filename: str
    size_bytes: int
    upload_date: str


AGENT_DIR = Path("./agent-releases")


def ensure_agent_dir():
    """Garantir que pasta de releases existe"""
    AGENT_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/latest")
async def get_latest_agent() -> dict:
    """
    Obter informações da versão mais recente do agente.
    
    Retorna: {version, download_url, filename, size_bytes, release_date}
    """
    ensure_agent_dir()
    
    exe_files = list(AGENT_DIR.glob("LanManagerAgent-*.exe"))
    
    if not exe_files:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma versão do agente disponível"
        )
    
    # Pegar o arquivo mais recente por timestamp de modificação
    latest_file = max(exe_files, key=lambda p: p.stat().st_mtime)
    
    # Extrair versão do nome (ex: LanManagerAgent-0.1.0.exe -> 0.1.0)
    version = latest_file.stem.replace("LanManagerAgent-", "")
    file_size = latest_file.stat().st_size
    mod_time = latest_file.stat().st_mtime
    
    release_date = datetime.fromtimestamp(mod_time).isoformat()
    
    return {
        "version": version,
        "filename": latest_file.name,
        "size_bytes": file_size,
        "size_mb": round(file_size / (1024 * 1024), 1),
        "release_date": release_date,
        "download_url": f"/agent-update/download/{latest_file.name}"
    }


@router.get("/download/{filename}")
async def download_agent(filename: str):
    """
    Fazer download do agente .exe
    
    Formato esperado: LanManagerAgent-X.Y.Z.exe
    """
    ensure_agent_dir()
    
    # Validação: apenas arquivos .exe esperados
    if not filename.endswith(".exe") or not filename.startswith("LanManagerAgent-"):
        raise HTTPException(
            status_code=400,
            detail="Nome de arquivo inválido"
        )
    
    agent_file = AGENT_DIR / filename
    
    if not agent_file.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Arquivo {filename} não encontrado"
        )
    
    # Retornar arquivo para download
    return FileResponse(
        agent_file,
        filename=filename,
        media_type="application/octet-stream"
    )


@router.post("/upload")
async def upload_new_agent(file: UploadFile = File(...)) -> dict:
    """
    Fazer upload de nova versão do agente.
    
    Formato esperado:
    - Nome: LanManagerAgent-X.Y.Z.exe (ex: LanManagerAgent-0.2.0.exe)
    - Tipo: application/octet-stream
    """
    ensure_agent_dir()
    
    # Validar tipo de arquivo
    if not file.filename.endswith(".exe"):
        raise HTTPException(
            status_code=400,
            detail="Arquivo deve ser .exe"
        )
    
    if not file.filename.startswith("LanManagerAgent-"):
        raise HTTPException(
            status_code=400,
            detail="Nome do arquivo deve começar com 'LanManagerAgent-'"
        )
    
    # Salvar arquivo
    try:
        file_path = AGENT_DIR / file.filename
        contents = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        file_size = file_path.stat().st_size
        version = file.filename.replace("LanManagerAgent-", "").replace(".exe", "")
        
        return {
            "status": "success",
            "message": f"Agente versão {version} enviado com sucesso",
            "filename": file.filename,
            "version": version,
            "size_mb": round(file_size / (1024 * 1024), 1),
            "download_url": f"/agent-update/download/{file.filename}"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao fazer upload: {str(e)}"
        )


@router.get("/check/{current_version}")
async def check_agent_update(current_version: str) -> dict:
    """
    Verificar se existe versão mais recente do agente.
    
    Agente chama isto periodicamente para verificar updates.
    Retorna: {update_available: bool, ...}
    """
    try:
        latest = await get_latest_agent()
        
        # Comparação simples de versão
        # Exemplo: "0.1.0" < "0.2.0"
        current_parts = [int(x) for x in current_version.split(".")]
        latest_parts = [int(x) for x in latest["version"].split(".")]
        
        update_available = latest_parts > current_parts
        
        return {
            "update_available": update_available,
            "current_version": current_version,
            "latest_version": latest["version"],
            "download_url": latest["download_url"] if update_available else None,
            "release_date": latest["release_date"]
        }
    
    except HTTPException:
        # Se nenhuma versão encontrada, retornar false
        return {
            "update_available": False,
            "current_version": current_version,
            "message": "Nenhuma versão disponível no servidor"
        }


@router.get("/list")
async def list_agent_versions() -> dict:
    """Listar todas as versões de agente disponíveis"""
    ensure_agent_dir()
    
    exe_files = sorted(
        AGENT_DIR.glob("LanManagerAgent-*.exe"),
        key=lambda p: p.stat().st_mtime,
        reverse=True
    )
    
    versions = []
    for file in exe_files:
        version = file.stem.replace("LanManagerAgent-", "")
        versions.append({
            "version": version,
            "filename": file.name,
            "size_mb": round(file.stat().st_size / (1024 * 1024), 1),
            "uploaded_at": datetime.fromtimestamp(file.stat().st_mtime).isoformat(),
            "download_url": f"/agent-update/download/{file.name}"
        })
    
    return {
        "total_versions": len(versions),
        "versions": versions
    }

