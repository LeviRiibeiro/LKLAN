# LAN Manager Escolar — Sprint 1 — Inicialização

## Pré-requisitos
- Python 3.11+
- Node.js 18+ (para dashboard)
- Git

## Setup do Servidor FastAPI

### 1. Instalar Dependências
```bash
cd server
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente
```bash
cp .env.example .env
# Editar .env com suas configuracoes (JWT_SECRET_KEY, credenciais do admin, etc)
```

### 3. Criar Banco de Dados e Admin Inicial
```bash
python seed.py
# Output esperado:
# Admin inicial criado com sucesso.
# Usuario: admin
# Altere a senha apos o primeiro login.
```

### 4. Iniciar o Servidor
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

A API estará disponível em: `http://localhost:8000`

API Docs: `http://localhost:8000/docs`

## Setup do Agente Cliente

### 1. Instalar Dependências
```bash
cd client-agent
pip install -r requirements.txt
```

### 2. Configurar IP do Servidor
Editar `client-agent/config.ini`:
```ini
[server]
host = 192.168.1.1    # Altere para o IP da máquina Admin
port = 8000
```

### 3. Testar Agente em Modo Desenvolvimento
```bash
python agent.py
# Deve conectar ao servidor via WebSocket e enviar heartbeats a cada 30 segundos
```

### 4. Compilar para .exe (quando pronto)
```bash
build.bat
# Gera: dist/LanManagerAgent.exe
```

## Setup do Dashboard React

### 1. Instalar Dependências
```bash
cd admin-dashboard
npm install
```

### 2. Iniciar em Modo Dev
```bash
npm run dev
# Servidor em: http://localhost:5173
```

### 3. Build para Produção
```bash
npm run build
# Gera: dist/ (pronto para servir com FastAPI)
```

## Primeiros Testes

### 1. Login via API
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Resposta esperada:
# {"access_token": "...", "token_type": "bearer"}
```

### 2. Listar Máquinas
```bash
curl http://localhost:8000/machines
```

### 3. Heartbeat do Agente
O agente irá automaticamente enviar heartbeats via WebSocket.
Monitore no console do servidor FastAPI os eventos recebidos.

## Estrutura de Pastas

```
lan-manager-escolar/
├── server/              # Backend FastAPI
├── client-agent/        # Agente cliente (compilado para .exe)
├── admin-dashboard/     # Dashboard React
├── chrome-extension/    # Extensão Chrome
└── LAN_MANAGER_ESCOLAR_v2.md  # Planejamento completo
```

## Próximas Sprints

- Sprint 2: Painel Admin com grid de máquinas, gestão de usuários, importação CSV
- Sprint 3: Controle remoto (TigerVNC, screenshots, comandos)
- Sprint 4: Bloqueios de apps/sites e extensão Chrome funcional
- Sprint 5: Auto-update, backup automático, relatórios PDF

## Suporte e Debugging

- Logs do servidor: `uvicorn main:app --reload --log-level debug`
- Verificar conectividade: `ping 192.168.1.1` (do PC cliente)
- Testar WebSocket: `ws://192.168.1.1:8000/ws/agent/PC-01`

---

**Documentação Completa:** Consulte [LAN_MANAGER_ESCOLAR_v2.md](../LAN_MANAGER_ESCOLAR_v2.md)
