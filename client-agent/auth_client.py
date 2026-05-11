import configparser
import logging

import requests

logger = logging.getLogger(__name__)


def load_server_config() -> tuple[str, int]:
    """Carrega host e porta do servidor de config.ini"""
    parser = configparser.ConfigParser()
    parser.read("config.ini", encoding="utf-8")
    
    host = parser.get("server", "host", fallback="192.168.1.1")
    port = parser.getint("server", "port", fallback=8000)
    return host, port


def authenticate_user(username: str, password: str) -> dict | None:
    """Autentica usuário contra o servidor FastAPI"""
    host, port = load_server_config()
    url = f"http://{host}:{port}/auth/login"
    
    try:
        response = requests.post(
            url,
            json={"username": username, "password": password},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Login bem-sucedido para: {username}")
            return data
        elif response.status_code == 401:
            logger.warning(f"Credenciais inválidas para: {username}")
            return None
        else:
            logger.error(f"Erro ao autenticar: {response.status_code}")
            return None
    except requests.exceptions.Timeout:
        logger.error("Timeout ao conectar ao servidor")
        return None
    except Exception as exc:
        logger.error(f"Erro de autenticação: {exc}")
        return None


def get_user_info(username: str) -> dict | None:
    """Obtém informações do usuário do servidor"""
    host, port = load_server_config()
    # Nota: Esta rota não está implementada na Sprint 1, apenas placeholder
    return None
