"""
Validador de horários de acesso ao laboratório
"""

from datetime import datetime, time
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import LabConfig


class TimeChecker:
    """Verificar se usuário pode acessar neste horário"""

    DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    CONFIG_KEYS = {
        "enabled": "time_access_enabled",
        "start": "time_access_start",
        "end": "time_access_end",
    }

    @staticmethod
    async def is_access_allowed(db: AsyncSession, user_role: str = "student") -> tuple[bool, str]:
        """
        Verificar se acesso é permitido neste momento.
        
        Returns: (allowed: bool, reason: str)
        """
        # Admins sempre podem acessar
        if user_role in ["admin", "teacher"]:
            return True, "Acesso permitido para admin/professor"

        try:
            # Verificar se controle de horário está ativado
            enabled_result = await db.execute(
                select(LabConfig.value).where(
                    LabConfig.key == TimeChecker.CONFIG_KEYS["enabled"]
                )
            )
            enabled_val = enabled_result.scalar()
            
            if not enabled_val or enabled_val.lower() != "true":
                return True, "Controle de horário desativado"

            # Obter horários
            start_result = await db.execute(
                select(LabConfig.value).where(
                    LabConfig.key == TimeChecker.CONFIG_KEYS["start"]
                )
            )
            end_result = await db.execute(
                select(LabConfig.value).where(
                    LabConfig.key == TimeChecker.CONFIG_KEYS["end"]
                )
            )
            
            start_str = start_result.scalar() or "07:00"
            end_str = end_result.scalar() or "17:00"

            # Verificar se hoje está ativado
            today = datetime.now()
            day_name = TimeChecker.DAYS[today.weekday()]
            
            day_key = f"time_access_{day_name}"
            day_result = await db.execute(
                select(LabConfig.value).where(LabConfig.key == day_key)
            )
            day_enabled = day_result.scalar()
            
            if day_enabled and day_enabled.lower() == "false":
                return False, f"Acesso não permitido aos {day_name.capitalize()}"

            # Validar horário
            current_time = today.time()
            start_time = datetime.strptime(start_str, "%H:%M").time()
            end_time = datetime.strptime(end_str, "%H:%M").time()

            if current_time < start_time:
                return False, f"Laborátório abre às {start_str}"
            
            if current_time > end_time:
                return False, f"Laborátório fecha às {end_str}"

            return True, "Acesso permitido"

        except Exception as e:
            # Se houver erro, permitir acesso (fail open)
            return True, f"Erro na verificação de horário: {str(e)}"

    @staticmethod
    async def get_schedule(db: AsyncSession) -> dict:
        """Obter horários atuais configurados"""
        try:
            result = await db.execute(
                select(LabConfig).where(LabConfig.key.startswith("time_access_"))
            )
            configs = result.scalars().all()
            
            schedule = {}
            for config in configs:
                key = config.key.replace("time_access_", "")
                schedule[key] = config.value
            
            return schedule
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    async def set_schedule(db: AsyncSession, **kwargs) -> bool:
        """
        Configurar horários de acesso.
        
        Args:
            enabled: bool - Ativar/desativar controle
            start: str - Horário início (HH:MM)
            end: str - Horário fim (HH:MM)
            monday, tuesday, etc: bool - Dia da semana ativo
        """
        try:
            updates = {}
            
            if "enabled" in kwargs:
                updates["time_access_enabled"] = str(kwargs["enabled"]).lower()
            
            if "start" in kwargs:
                # Validar formato HH:MM
                datetime.strptime(kwargs["start"], "%H:%M")
                updates["time_access_start"] = kwargs["start"]
            
            if "end" in kwargs:
                datetime.strptime(kwargs["end"], "%H:%M")
                updates["time_access_end"] = kwargs["end"]
            
            # Dias da semana
            for day in TimeChecker.DAYS:
                if day in kwargs:
                    updates[f"time_access_{day}"] = str(kwargs[day]).lower()
            
            # Atualizar/inserir no BD
            for key, value in updates.items():
                existing = await db.execute(
                    select(LabConfig).where(LabConfig.key == key)
                )
                config = existing.scalar()
                
                if config:
                    config.value = value
                else:
                    db.add(LabConfig(key=key, value=value))
            
            await db.commit()
            return True
        
        except ValueError as e:
            return False  # Formato inválido
        except Exception as e:
            await db.rollback()
            return False
