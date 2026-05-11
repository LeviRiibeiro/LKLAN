import asyncio
import json
from datetime import datetime, timedelta

from passlib.context import CryptContext
from sqlalchemy import select

from server.config import settings
from server.database import AsyncSessionLocal, Event, LabConfig, User, init_db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def seed_admin() -> None:
    await init_db()

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.role == "admin"))
        admin = result.scalar_one_or_none()

        if admin:
            print("Admin ja existe. Seed ignorado.")
            return

        new_admin = User(
            name=settings.default_admin_name,
            username=settings.default_admin_username,
            password_hash=pwd_context.hash(settings.default_admin_password),
            role="admin",
            turma=None,
            time_balance=0,
        )
        session.add(new_admin)
        await session.commit()
        print("Admin inicial criado com sucesso.")
        print(f"Usuario: {settings.default_admin_username}")
        print("Altere a senha apos o primeiro login.")
        
        # Seed blocked apps (navegadores alternativos)
        result_blocked = await session.execute(
            select(LabConfig).where(LabConfig.key == "blocked_apps")
        )
        blocked_config = result_blocked.scalar_one_or_none()
        
        default_blocked = ["msedge.exe", "firefox.exe"]  # Apenas Chrome permitido para alunos
        
        if not blocked_config:
            session.add(LabConfig(
                key="blocked_apps",
                value=json.dumps(default_blocked)
            ))
            await session.commit()
            print(f"✓ Navegadores bloqueados por padrão: {', '.join(default_blocked)}")
        
        # Seed some sample events
        now = datetime.utcnow()
        sample_events = [
            Event(
                event_type="login",
                description=f"Administrador {settings.default_admin_username} acessou o painel",
                source="admin",
                created_at=now - timedelta(minutes=5),
            ),
            Event(
                event_type="config_change",
                description="Configuração do laboratório atualizada (horário: 08:00-17:00)",
                source="admin",
                created_at=now - timedelta(minutes=20),
            ),
            Event(
                event_type="block",
                description="Novo bloqueio adicionado: example.com",
                source="admin",
                created_at=now - timedelta(hours=1),
            ),
            Event(
                event_type="logout",
                description="Sessão encerrada (tempo: 30 min)",
                source="system",
                created_at=now - timedelta(hours=2),
            ),
            Event(
                event_type="agent_connect",
                description="Agente conectado: PC-01 (192.168.1.101)",
                source="agent",
                created_at=now - timedelta(hours=3),
            ),
        ]
        
        for event in sample_events:
            session.add(event)
        
        await session.commit()
        print(f"✓ {len(sample_events)} eventos de exemplo criados.")


if __name__ == "__main__":
    asyncio.run(seed_admin())
