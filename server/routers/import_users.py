"""
Router para importação em massa de usuários
"""

import io
import secrets
import string
from typing import List

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import User, get_db_session
from server.schemas.import_schemas import ImportResult
from server.config import settings

router = APIRouter(prefix="/import", tags=["import"])


def generate_password(length: int = 12) -> str:
    """Gerar senha aleatória forte"""
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for i in range(length))


async def parse_upload_file(file: UploadFile) -> pd.DataFrame:
    """Parse arquivo CSV ou XLSX"""
    contents = await file.read()
    
    if file.filename.endswith(".csv"):
        return pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith((".xlsx", ".xls")):
        return pd.read_excel(io.BytesIO(contents))
    else:
        raise HTTPException(
            status_code=400,
            detail="Formato não suportado. Use CSV ou XLSX"
        )


@router.post("/users")
async def import_users(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db_session)
) -> ImportResult:
    """
    Importar usuários em massa via CSV ou XLSX.
    
    Formato esperado:
    - username: nome de usuário (obrigatório)
    - full_name: nome completo (obrigatório)
    - email: email (opcional)
    - turma: turma/série (opcional)
    """
    try:
        # Parse arquivo
        df = await parse_upload_file(file)
        
        # Validar colunas obrigatórias
        required_cols = ["username", "full_name"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Colunas obrigatórias ausentes: {missing}"
            )
        
        # Limpar dados
        df = df.fillna("")
        df["username"] = df["username"].str.strip().str.lower()
        df["full_name"] = df["full_name"].str.strip()
        
        # Validação de dados
        errors = []
        valid_rows = []
        
        for idx, row in df.iterrows():
            username = str(row["username"]).strip()
            full_name = str(row["full_name"]).strip()
            
            # Validações
            if not username or len(username) < 3:
                errors.append({
                    "row": idx + 2,  # Excel começa em 1 + header
                    "username": username,
                    "error": "Username deve ter pelo menos 3 caracteres"
                })
                continue
            
            if not full_name or len(full_name) < 3:
                errors.append({
                    "row": idx + 2,
                    "username": username,
                    "error": "Nome completo inválido"
                })
                continue
            
            valid_rows.append({
                "username": username,
                "full_name": full_name,
                "email": str(row.get("email", "")).strip() or None,
                "turma": str(row.get("turma", "")).strip() or None,
            })
        
        # Verificar usernames duplicados no arquivo
        usernames = [r["username"] for r in valid_rows]
        duplicates = [u for u in usernames if usernames.count(u) > 1]
        if duplicates:
            raise HTTPException(
                status_code=400,
                detail=f"Usernames duplicados no arquivo: {list(set(duplicates))}"
            )
        
        # Verificar usernames já existentes no BD
        existing = await db.execute(
            select(User.username).where(User.username.in_(usernames))
        )
        existing_usernames = [row[0] for row in existing.fetchall()]
        
        if existing_usernames:
            # Remover duplicatas e avisar
            valid_rows = [r for r in valid_rows if r["username"] not in existing_usernames]
            errors.append({
                "row": "N/A",
                "username": existing_usernames,
                "error": f"Usuarios já existem no sistema (ignorados)"
            })
        
        if not valid_rows:
            raise HTTPException(
                status_code=400,
                detail="Nenhuma linha válida para importar"
            )
        
        # Criar usuários
        credentials = []
        created_users = []
        
        for row_data in valid_rows:
            password = generate_password()
            
            new_user = User(
                username=row_data["username"],
                full_name=row_data["full_name"],
                email=row_data["email"],
                password_hash=password,  # Será hasheado pelo model
                role="student"
            )
            db.add(new_user)
            
            credentials.append({
                "username": row_data["username"],
                "password": password,
                "full_name": row_data["full_name"],
                "email": row_data["email"] or "N/A"
            })
            
            created_users.append(row_data["username"])
        
        await db.commit()
        
        return ImportResult(
            success=True,
            message=f"Importação concluída: {len(created_users)} usuários criados",
            imported_count=len(created_users),
            failed_count=len(errors),
            credentials=credentials
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@router.get("/template")
async def download_template():
    """Retorna template CSV para preenchimento"""
    template_data = {
        "username": ["aluno1", "aluno2"],
        "full_name": ["João Silva", "Maria Santos"],
        "email": ["joao@school.edu", "maria@school.edu"],
        "turma": ["8A", "8B"]
    }
    df = pd.DataFrame(template_data)
    
    # Retornar como CSV
    csv_buffer = io.StringIO()
    df.to_csv(csv_buffer, index=False)
    
    return {
        "template": csv_buffer.getvalue(),
        "format": "csv",
        "description": "Template para importação de usuários"
    }
