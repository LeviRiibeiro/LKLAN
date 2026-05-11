#!/usr/bin/env python3
"""
Build script para compilar o agente LAN Manager Escolar para .exe standalone
Uso: python build_release.py [--version VERSION]
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from datetime import datetime


def log(msg: str, level: str = "INFO") -> None:
    """Log message with timestamp."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {msg}")


def run_command(cmd: list, cwd: str = None) -> bool:
    """Run shell command and return True if successful."""
    try:
        log(f"Executando: {' '.join(cmd)}")
        result = subprocess.run(cmd, cwd=cwd, check=False)
        return result.returncode == 0
    except Exception as e:
        log(f"Erro ao executar comando: {e}", "ERROR")
        return False


def build_agent(version: str = "0.1.0") -> bool:
    """Build agent executable."""
    agent_dir = Path(__file__).parent
    os.chdir(agent_dir)
    
    log(f"Iniciando build do agente LAN Manager Escolar v{version}")
    log(f"Diretório: {agent_dir}")
    
    # Clean previous builds
    log("Limpando builds anteriores...")
    for folder in ["build", "dist", "__pycache__"]:
        if (agent_dir / folder).exists():
            shutil.rmtree(agent_dir / folder)
            log(f"✓ Pasta '{folder}' removida")
    
    # Install dependencies
    log("Instalando dependências...")
    if not run_command([sys.executable, "-m", "pip", "install", "-q", "-r", "requirements.txt"]):
        log("Falha ao instalar dependências", "ERROR")
        return False
    log("✓ Dependências instaladas")
    
    # Build with PyInstaller using spec file
    log("Compilando executável com PyInstaller...")
    spec_file = agent_dir / "LanManagerAgent.spec"
    
    if not spec_file.exists():
        log(f"Arquivo spec não encontrado: {spec_file}", "ERROR")
        return False
    
    cmd = [
        sys.executable,
        "-m", "PyInstaller",
        "--clean",
        str(spec_file),
    ]
    
    if not run_command(cmd, cwd=str(agent_dir)):
        log("Falha na compilação com PyInstaller", "ERROR")
        return False
    
    log("✓ Executável compilado")
    
    # Verify output
    exe_path = agent_dir / "dist" / "LanManagerAgent.exe"
    if not exe_path.exists():
        log(f"Executável não encontrado em {exe_path}", "ERROR")
        return False
    
    exe_size_mb = exe_path.stat().st_size / (1024 * 1024)
    log(f"✓ Executável criado: {exe_path} ({exe_size_mb:.1f} MB)")
    
    # Create version file
    version_file = agent_dir / "dist" / "VERSION.txt"
    version_file.write_text(f"""LAN Manager Escolar Agent
Versão: {version}
Data do build: {datetime.now().isoformat()}
Arquivo: LanManagerAgent.exe
""")
    log("✓ Arquivo de versão criado")
    
    # Create deployment guide
    deploy_guide = agent_dir / "dist" / "DEPLOY_GUIDE.txt"
    deploy_guide.write_text("""LAN Manager Escolar - Guia de Deploamento do Agente
====================================================

1. PREPARAÇÃO
   - Copie o arquivo LanManagerAgent.exe para uma pasta compartilhada na rede
   - Ex: \\\\192.168.1.1\\LanManager\\agent\\

2. INSTALAÇÃO EM MÁQUINAS CLIENTES
   - Em cada máquina cliente (PC-01, PC-02, etc):
     a) Crie pasta: C:\\LanManager\\agent\\
     b) Copie LanManagerAgent.exe para essa pasta
     c) Copie config.ini para a mesma pasta (ajuste IP do servidor)

3. CONFIGURAÇÃO DO SERVIÇO WINDOWS
   Execute como administrador:
   
   cd C:\\LanManager\\agent
   
   nssm install LanManagerAgent "C:\\LanManager\\agent\\LanManagerAgent.exe"
   nssm set LanManagerAgent AppDirectory "C:\\LanManager\\agent"
   nssm set LanManagerAgent AppStdout "C:\\LanManager\\agent\\logs\\stdout.log"
   nssm set LanManagerAgent AppStderr "C:\\LanManager\\agent\\logs\\stderr.log"
   nssm start LanManagerAgent

4. VERIFICAÇÃO
   - Abra Services (services.msc) e procure por "LanManagerAgent"
   - Status deve estar "Running"
   - No painel Admin, máquina deve aparecer online em até 30s

5. EXCLUSÃO WINDOWS DEFENDER
   Execute como administrador (opcional, se houver falso positivo):
   
   Add-MpPreference -ExclusionPath "C:\\LanManager\\"

6. REGRAS DE FIREWALL
   Execute como administrador:
   
   netsh advfirewall firewall add rule name="LanManager Agent" ^
     dir=out action=allow protocol=TCP remoteport=8001
""")
    log("✓ Guia de deployment criado")
    
    log(f"✅ BUILD CONCLUÍDO COM SUCESSO!")
    log(f"   Executável: dist/LanManagerAgent.exe")
    log(f"   Documentação: dist/DEPLOY_GUIDE.txt")
    
    return True


if __name__ == "__main__":
    version = "0.1.0"
    if "--version" in sys.argv:
        idx = sys.argv.index("--version")
        if idx + 1 < len(sys.argv):
            version = sys.argv[idx + 1]
    
    success = build_agent(version)
    sys.exit(0 if success else 1)
