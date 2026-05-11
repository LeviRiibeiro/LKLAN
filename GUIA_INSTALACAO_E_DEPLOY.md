# 🚀 GUIA DE INSTALAÇÃO E DEPLOY — LAN Manager Escolar

> **Data:** Maio 2026  
> **Versão:** v1.0 — Sprint 1-4 Completo  
> **Ambiente:** Laboratório com 14 máquinas Windows 10 + 1 Admin  

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação na Máquina Admin](#instalação-na-máquina-admin)
3. [Build e Compilação do Agente](#build-e-compilação-do-agente)
4. [Deploy nas Máquinas Client](#deploy-nas-máquinas-client)
5. [Verificação e Testes](#verificação-e-testes)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Pré-requisitos

### Na Máquina Admin
- **Windows 10** ou superior
- **Python 3.11+** (download: https://python.org)
- **Node.js 18+** (download: https://nodejs.org)
- **Git** (download: https://git-scm.com)
- **Pasta compartilhada na rede** para deploy (ex: `\\192.168.1.1\instalar`)

### Em Cada Máquina Client
- **Windows 10** ou superior
- Acesso à rede LAN com a máquina Admin
- Privilégio de Administrador local (para instalar como serviço)

---

## 💻 Instalação na Máquina Admin

> **Cenário real do laboratório:** máquina crua, sem VSCode, usando apenas CMD ou PowerShell.
> Os comandos abaixo foram escritos para funcionar sem depender de editor ou IDE.

### Fluxo mais simples

Se o repositório já estiver clonado, rode apenas:

```bash
ADMIN_BOOTSTRAP.bat prep
ADMIN_BOOTSTRAP.bat run
```

Isso faz todo o trabalho da Admin em sequência: cria venv, instala dependências, faz seed, builda o dashboard e depois abre servidor + dashboard.

### Antes de começar

Abra um Prompt de Comando como Administrador e valide as ferramentas:

```bash
where python
where node
where git
py --version
node --version
```

Se algum comando não responder, instale a ferramenta ou use o caminho completo do executável.

### Passo 1: Clonar Repositório

```bash
cd C:\
git clone https://github.com/LeviRiibeiro/LKLAN.git
cd LKLAN
```

### Passo 2: Criar Ambiente Virtual Python

```bash
py -3.11 -m venv .venv
.\.venv\\Scripts\\activate.bat
python -m pip install --upgrade pip
```

### Passo 3: Instalar Dependências

```bash
cd server
python -m pip install -r requirements.txt
cd ..
```

### Passo 4: Criar Banco de Dados e Seeded Admin

```bash
python -c "import sys; sys.path.insert(0, '.'); import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())"
```

**Credenciais Padrão:**
- Usuário: `admin`
- Senha: `admin123`
- ⚠️ **Alterar senha após primeiro login!**

### Passo 5: Instalar Dependências do Dashboard

```bash
cd admin-dashboard
npm install
npm run build
cd ..
```

### Se estiver sem VSCode e quiser testar em sequência

Use esta ordem no CMD:

```bash
cd C:\LKLAN
.\.venv\\Scripts\\activate.bat
cd server
python -m pip install -r requirements.txt
cd ..
python -c "import sys; sys.path.insert(0, '.'); import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())"
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

Em outro Prompt:

```bash
cd C:\LKLAN\admin-dashboard
npm install
npm run dev
```

### Passo 6: Iniciar Servidor

**Terminal 1 — Servidor FastAPI:**
```bash
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — Dashboard (Desenvolvimento):**
```bash
cd admin-dashboard
npm run dev
# Ou para produção, servir via FastAPI (recomendado)
```

✅ **Verificar:**
- API disponível: http://192.168.1.1:8000
- Swagger Docs: http://192.168.1.1:8000/docs
- Dashboard disponível: http://192.168.1.1:5173 (dev) ou http://192.168.1.1:8000 (prod)

---

## 🛠️ Build e Compilação do Agente

### Passo 1: Preparar Ambiente de Build

Na máquina Admin (ou qualquer máquina Windows com Python):

```bash
cd client-agent
pip install -r requirements.txt
```

### Passo 2: Compilar com PyInstaller

```bash
python build.bat
```

Ou manualmente:

```bash
pyinstaller --onefile --windowed ^
            --icon=assets/school_icon.ico ^
            --name=LanManagerAgent ^
            --add-data "assets;assets" ^
            --add-data "config.ini;." ^
            --hidden-import=PyQt5.sip ^
            --hidden-import=win32api ^
            --hidden-import=win32con ^
            agent.py
```

✅ **Resultado:** `dist\LanManagerAgent.exe` (~80MB)

### Passo 3: Preparar Pasta de Deploy

Criar pasta compartilhada na rede:

```
\\192.168.1.1\instalar\
├── LanManagerAgent.exe       (agente compilado)
├── config.ini                (configuração)
├── nssm.exe                  (Windows Service manager)
├── TigerVNC-64bit.msi        (VNC Server)
└── deploy\
    └── deploy_agent.bat      (script de instalação)
```

**Copiar arquivos:**

```bash
cd client-agent
mkdir deploy_folder
copy dist\LanManagerAgent.exe deploy_folder\
copy config.ini deploy_folder\
copy deploy\deploy_agent.bat deploy_folder\
copy deploy\nssm.exe deploy_folder\
copy deploy\TigerVNC-64bit.msi deploy_folder\
```

---

## 🖥️ Deploy nas Máquinas Client

### Método 1: Manual (Recomendado para Teste)

Em cada máquina client:

**1. Baixar agente:**
```bash
net use \\192.168.1.1\instalar
xcopy \\192.168.1.1\instalar\* C:\LanManagerDeploy\ /Y /S
```

**2. Executar script de instalação (como Administrador):**
```bash
C:\LanManagerDeploy\deploy_agent.bat
```

O script automaticamente:
- ✅ Instala o agente como Windows Service
- ✅ Configura exclusão no Windows Defender
- ✅ Aplica regras de firewall (TCP 8000, 5900)
- ✅ Sincroniza hora via NTP (pool.ntp.br)
- ✅ Instala TigerVNC Server
- ✅ Desabilita Task Manager para usuários comuns
- ✅ Inicia o serviço

**3. Verificar instalação:**
```bash
# Ver serviço em execução
net start | find "LanManagerAgent"

# Ou abrir Services.msc e procurar por "LanManagerAgent"
```

### Método 2: Remoto via PsExec (Batch Deploy)

Se tiver acesso administrativo remoto:

```bash
# Copiar para todas as máquinas
for /L %i in (11,1,24) do (
  xcopy deploy_folder\* \\192.168.1.%i\c$\LanManagerDeploy\ /Y /S
  psexec \\192.168.1.%i -s C:\LanManagerDeploy\deploy_agent.bat
)
```

---

## ✅ Verificação e Testes

### Teste 1: Admin Login e Dashboard

Na máquina Admin, abra o dashboard:

```
http://192.168.1.1:8000
```

**Login:**
- Usuário: `admin`
- Senha: `admin123`

✅ **Esperado:** Dashboard carrega com grid vazio (nenhuma máquina conectada ainda)

### Teste 2: Agente Conectando

Após instalar agente em uma máquina client, verificar no dashboard:

1. Agente inicia automaticamente (verificar em Services.msc)
2. Máquina aparece no dashboard com status **🟢 Online**
3. Clicar na máquina → deverá mostrar opções de VNC, bloquear, screenshot

**Verificar logs do agente:**
```bash
# Na máquina client, verificar arquivo de log:
C:\LanManager\agent.log
```

### Teste 3: Login de Aluno

1. No dashboard, criar um novo aluno:
   - Nome: `Teste Aluno`
   - Usuário: `aluno1`
   - Senha: `senha123`
   - Turma: `6A`
   - Saldo: `120 minutos`

2. Na máquina client, tela de login do agente deve aparecer
3. Tentar login com credenciais do aluno
4. ✅ **Esperado:** Desktop libera e aparece widget de tempo restante

### Teste 4: Dedução de Tempo

1. Aluno logado na máquina client
2. No dashboard, verificar se tempo está sendo deduzido (a cada minuto)
3. ✅ **Esperado:** Saldo diminui em tempo real

### Teste 5: Screenshot e VNC

1. No dashboard, na máquina do aluno, clicar em "Ver Tela"
2. ✅ **Esperado:** Preview de screenshot atualiza a cada 10s
3. Clicar em ícone VNC → TigerVNC Viewer abre
4. ✅ **Esperado:** Controle remoto total da máquina client

### Teste 6: Bloqueio de App

1. No dashboard → Bloqueados → Apps
2. Criar novo bloqueado: `notepad.exe`
3. Na máquina client, tentar abrir Notepad
4. ✅ **Esperado:** Notepad fecha automaticamente

### Teste 7: Comando Remoto (Lock/Reboot)

1. No dashboard, máquina do aluno
2. Clicar em "Bloquear Tela"
3. ✅ **Esperado:** Tela da máquina client bloqueia (LockWorkStation)

### Teste 8: Extensão Chrome e Blocked Page

1. Na máquina client, abrir Chrome
2. Extensão deveria estar instalada (via GPO ou manual)
3. Tentar acessar site bloqueado (ex: youtube.com se estiver na lista)
4. ✅ **Esperado:** Página de bloqueio com logo da escola apareça

---

## 🐛 Troubleshooting

### Problema: Agente não conecta ao servidor

**Causa:** Firewall bloqueando porta 8000

**Solução:**
```bash
# Na máquina Admin
netsh advfirewall firewall add rule name="LAN Manager API" ^
  dir=in action=allow protocol=TCP localport=8000
```

---

### Problema: `ModuleNotFoundError: No module named 'server'`

**Causa:** Python path não está configurado

**Solução:**
```bash
# Na máquina Admin, dentro da pasta LKLAN:
set PYTHONPATH=%cd%
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

Se estiver no PowerShell, a ativação do venv muda:

```powershell
.\.venv\\Scripts\\Activate.ps1
```

---

### Problema: Starlette version conflict

**Causa:** Versão incompatível de Starlette instalada

**Solução:**
```bash
pip install starlette==0.38.0 --force-reinstall
```

---

### Problema: TigerVNC não instala

**Causa:** Falta de privilégios de administrador

**Solução:**
```bash
# Executar deploy_agent.bat como Administrador
# Clique direito → Executar como administrador
```

---

### Problema: Task Manager desbloqueado para aluno

**Causa:** Política GPO não aplicada

**Solução (Permanente - GPO):**
```
Group Policy → Computer Configuration → 
Windows Settings → Security Settings → 
Local Policies → User Rights Assignment → 
"Deny logon locally" → Adicionar grupo "Alunos"
```

**Solução (Temporária - Registro Local):**
```bash
# Na máquina client, como Administrador:
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" ^
  /v DisableTaskMgr /t REG_DWORD /d 1 /f
```

---

### Problema: Agente consome muita CPU

**Causa:** Screenshot enviado muito frequentemente

**Solução:** Aumentar intervalo em `client-agent/config.ini`:
```ini
[agent]
heartbeat_seconds = 60
```

---

### Problema: Dashboard não carrega CSS/JS

**Causa:** Build do React não foi feito

**Solução:**
```bash
cd admin-dashboard
npm install
npm run build
# Ou em desenvolvimento:
npm run dev
```

---

## 📱 Teste Fim-a-Fim (Fluxo Completo)

Cenário: Aluno entra no lab, usa a máquina por 30 min, admin monitora, e depois aluno é bloqueado quando tempo acaba.

### Passo 1: Admin Setup (Máquina Admin)
```
✅ Servidor FastAPI rodando
✅ Dashboard acessível
✅ Agente compilado e em \\192.168.1.1\instalar
```

### Passo 2: Client Setup (Máquina User)
```
✅ Agente instalado como serviço
✅ Conectado ao servidor (status 🟢 Online no dashboard)
```

### Passo 3: Aluno Login (Máquina User)
```
✅ Tela de login PyQt5 aparece
✅ Aluno digita: usuario="aluno1", senha="senha123"
✅ Desktop liberado, widget de tempo aparece
```

### Passo 4: Admin Monitora (Máquina Admin)
```
✅ Dashboard mostra máquina em uso
✅ Screenshot atualiza em tempo real
✅ Tempo deduzido (30 min → 29 min → ...)
```

### Passo 5: Tempo Acaba (Máquina User)
```
✅ Notificação "5 min restantes" aparece com som
✅ Após 5 min adicionais, tela bloqueia
✅ Volta para tela de login
```

### Passo 6: Admin Ação Remota (Máquina Admin)
```
✅ Clicar em "Bloquear Tela" → máquina client tranca
✅ Ou "Desligar Máquina" → reinicializa máquina client
```

---

## 🚨 Checklist de Deployment

- [ ] Python 3.11+ instalado na máquina Admin
- [ ] Node.js 18+ instalado na máquina Admin
- [ ] Git clonado: `C:\LKLAN`
- [ ] Ambiente virtual criado e dependências instaladas
- [ ] Banco de dados criado (`database.db`)
- [ ] Admin seed criado (credenciais `admin/admin123`)
- [ ] FastAPI servidor rodando em `0.0.0.0:8000`
- [ ] Dashboard React buildado e servindo
- [ ] Agente compilado para `.exe`
- [ ] Pasta `\\192.168.1.1\instalar\` compartilhada com arquivos de deploy
- [ ] Firewall admin configurado (TCP 8000, 5900)
- [ ] Agente instalado em pelo menos 1 máquina client
- [ ] Agente conectado ao servidor (status Online no dashboard)
- [ ] Teste de login de aluno bem-sucedido
- [ ] Teste de dedução de tempo funcionando
- [ ] Teste de screenshot/VNC funcionando
- [ ] Teste de comando remoto funcionando

---

## 📞 Suporte

Se algo não funcionar:

1. Verificar arquivo de log do agente: `C:\LanManager\agent.log`
2. Verificar logs do servidor: console do Uvicorn
3. Verificar conectividade entre máquinas: `ping 192.168.1.1` e `ping 192.168.1.X`
4. Revisar seção [Troubleshooting](#troubleshooting) acima

---

## 📦 Estrutura Final de Pastas

```
Máquina Admin:
C:\LKLAN\
├── server/               (FastAPI backend)
├── client-agent/         (Agente + build)
├── admin-dashboard/      (React dashboard)
├── database.db          (SQLite - criado ao rodar seed)
└── README.md

Pasta Compartilhada:
\\192.168.1.1\instalar\
├── LanManagerAgent.exe
├── config.ini
├── deploy_agent.bat
├── nssm.exe
└── TigerVNC-64bit.msi

Máquinas Client:
C:\LanManager\
├── LanManagerAgent.exe
├── config.ini
└── agent.log

```

---

**Boa sorte no teste! 🎓**
