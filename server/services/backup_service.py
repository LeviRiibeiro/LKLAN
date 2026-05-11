"""
Serviço de backup automático para banco de dados SQLite
Executa diariamente e mantém histórico de backups
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
from logging import Logger

from apscheduler.schedulers.background import BackgroundScheduler

from server.config import settings


class BackupService:
    """Gerenciar backups automáticos do banco de dados."""

    def __init__(self, logger: Logger) -> None:
        self.logger = logger
        self.db_path = Path(settings.sqlite_path)
        self.backup_dir = Path(settings.sqlite_path).parent / "backups"
        self.scheduler = None

    def ensure_backup_dir(self) -> None:
        """Garantir que pasta de backups existe."""
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.logger.info(f"Pasta de backups: {self.backup_dir}")

    def create_backup(self) -> bool:
        """Criar backup do banco de dados agora."""
        try:
            if not self.db_path.exists():
                self.logger.warning(f"Banco não encontrado: {self.db_path}")
                return False

            self.ensure_backup_dir()

            # Criar filename com timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = self.backup_dir / f"database_backup_{timestamp}.db"

            # Copiar arquivo
            shutil.copy2(self.db_path, backup_file)
            file_size_mb = backup_file.stat().st_size / (1024 * 1024)

            self.logger.info(f"✓ Backup criado: {backup_file.name} ({file_size_mb:.1f} MB)")

            # Manter apenas últimos 7 backups
            self._cleanup_old_backups()

            return True
        except Exception as e:
            self.logger.error(f"Erro ao criar backup: {e}")
            return False

    def _cleanup_old_backups(self, keep_count: int = 7) -> None:
        """Manter apenas os últimos N backups."""
        try:
            backups = sorted(self.backup_dir.glob("database_backup_*.db"))
            if len(backups) > keep_count:
                for old_backup in backups[:-keep_count]:
                    old_backup.unlink()
                    self.logger.info(f"✓ Backup antigo removido: {old_backup.name}")
        except Exception as e:
            self.logger.error(f"Erro ao limpar backups antigos: {e}")

    def start_scheduler(self) -> None:
        """Iniciar agendador de backups."""
        try:
            self.scheduler = BackgroundScheduler()

            # Backup diário à meia-noite
            self.scheduler.add_job(
                self.create_backup,
                "cron",
                hour=0,
                minute=0,
                id="daily_backup",
                name="Backup diário do banco",
            )

            # Backup a cada 6 horas como segurança adicional
            self.scheduler.add_job(
                self.create_backup,
                "interval",
                hours=6,
                id="interval_backup",
                name="Backup de segurança (a cada 6h)",
            )

            self.scheduler.start()
            self.logger.info("✓ Scheduler de backups iniciado")

            # Criar backup inicial
            self.create_backup()
        except Exception as e:
            self.logger.error(f"Erro ao iniciar scheduler: {e}")

    def stop_scheduler(self) -> None:
        """Parar agendador de backups."""
        if self.scheduler:
            self.scheduler.shutdown()
            self.logger.info("✓ Scheduler de backups parado")

    def get_backup_info(self) -> dict:
        """Retornar informações sobre backups existentes."""
        try:
            self.ensure_backup_dir()
            backups = sorted(self.backup_dir.glob("database_backup_*.db"), reverse=True)

            return {
                "total_backups": len(backups),
                "backups": [
                    {
                        "filename": b.name,
                        "size_mb": round(b.stat().st_size / (1024 * 1024), 1),
                        "created_at": datetime.fromtimestamp(b.stat().st_mtime).isoformat(),
                    }
                    for b in backups[:10]  # Últimos 10
                ],
                "backup_dir": str(self.backup_dir),
            }
        except Exception as e:
            self.logger.error(f"Erro ao obter info de backups: {e}")
            return {}
