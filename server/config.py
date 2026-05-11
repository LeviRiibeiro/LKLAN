import os

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()


class Settings(BaseSettings):
    app_name: str = "LAN Manager Escolar"
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))

    sqlite_path: str = os.getenv("SQLITE_PATH", "./database.db")

    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "trocar-esta-chave-em-producao-32chars!!!!")
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 480

    default_admin_username: str = os.getenv("DEFAULT_ADMIN_USERNAME", "admin")
    default_admin_password: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    default_admin_name: str = os.getenv("DEFAULT_ADMIN_NAME", "Administrador")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
