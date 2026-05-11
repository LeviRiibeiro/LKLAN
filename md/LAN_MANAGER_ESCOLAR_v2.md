# 🖥️ LAN Manager Escolar — Documento de Planejamento Completo
### v2.1 — Revisado e Expandido

> **Projeto:** Sistema de Gerenciamento de Laboratório de Informática  
> **Autor:** Professor / Engenheiro de Software  
> **Ambiente:** Laboratório de escola municipal — 14 máquinas Windows 10  
> **Status:** Planejamento v2.1 finalizado — pronto para desenvolvimento  

---

## 1. Visão Geral do Projeto

Sistema de gerenciamento de rede local (LAN) desenvolvido sob medida para laboratório escolar, inspirado no Cyber Square Manager, porém 100% próprio, sem publicidade, com funcionalidades pedagógicas específicas como controle de advertências, suspensão de alunos e gerenciamento de saldo de horas de uso.

### Objetivo Principal
Substituir soluções genéricas de lan house por um sistema customizado que atende às necessidades reais de um laboratório escolar: controle de acesso por aluno, punições pedagógicas, monitoramento em tempo real e bloqueio de conteúdo inadequado.

### Diferencial em Relação ao Cyber Square
| Funcionalidade | Cyber Square | LAN Manager Escolar |
|---|---|---|
| Controle de tempo | ✅ | ✅ |
| Visualização remota | ✅ VNC | ✅ TigerVNC integrado |
| Suspensão pedagógica | ❌ | ✅ |
| Advertências por aluno | ❌ | ✅ |
| Extensão Chrome própria | ❌ | ✅ |
| Filtro de conteúdo central | ❌ | ✅ |
| Importação de alunos via CSV | ❌ | ✅ |
| Agente como .exe standalone | ❌ | ✅ |
| Backup automático | ❌ | ✅ |
| Controle de horário letivo | ❌ | ✅ |
| Gestão por turmas | ❌ | ✅ |
| Atualização remota do agente | ❌ | ✅ |
| Publicidade | ✅ (versão free) | ❌ |
| Customização total | ❌ | ✅ |

---

## 2. ⚠️ O Que Faltou no Planejamento Inicial

> Estes 13 pontos foram identificados na revisão e foram incorporados ao planejamento.

### 2.1 — Compilação do Agente para .exe (PyInstaller)
O planejamento original previa instalar Python em todas as 14 máquinas, o que é trabalhoso e frágil. A solução correta é compilar o agente em um **único arquivo .exe standalone** com PyInstaller. Isso significa:
- Zero dependência de Python nas máquinas clientes
- Distribuição via pasta compartilhada na rede (copia e executa)
- Aluno não consegue identificar ou interferir com o processo facilmente
- Atualização: basta substituir o .exe e reiniciar o serviço

### 2.2 — Backup Automático do Banco de Dados
O SQLite fica na máquina Admin. Se algo acontecer com ela (HD, queda de energia), **todos os dados de alunos e histórico são perdidos**. Solução:
- Backup automático diário do arquivo `database.db` para pasta local
- Cópia para pen drive ou pasta compartilhada na rede
- APScheduler já incluso na stack resolve isso com 10 linhas de código

### 2.3 — Importação em Massa de Alunos via CSV/Excel
No início do ano letivo, cadastrar 100+ alunos um a um seria inviável. Solução:
- Tela no painel Admin para upload de `.csv` ou `.xlsx`
- Formato: `nome, usuario, turma, senha_inicial`
- Sistema cadastra todos de uma vez e gera lista com credenciais para imprimir
- Pandas já incluso no `requirements.txt` do servidor

### 2.4 — Controle de Horário de Funcionamento do Laboratório
O laboratório tem horários letivos definidos. Fora desse horário, as máquinas não devem liberar login. Solução:
- Configuração no painel: `Segunda-Sexta: 07:00 às 17:00`
- Fora desse horário: tela de login mostra "Laboratório fechado"
- Admin pode sobrescrever quando precisar (manutenção, período especial)

### 2.5 — Gestão por Turmas
Alunos pertencem a turmas (6ºA, 7ºB, etc.). Sem isso, não tem como aplicar regras em lote. Solução:
- Campo `turma` no cadastro do aluno
- Admin pode filtrar visualização por turma
- Adicionar tempo em lote para toda uma turma
- Suspender turma inteira se necessário (prova, feriado, etc.)

### 2.6 — Mecanismo de Atualização Remota do Agente
Quando o agente precisar ser atualizado (nova versão, bug fix), ir máquina a máquina é inviável. Solução:
- O agente verifica na inicialização se existe versão nova no servidor
- Se sim, faz download do novo .exe, substitui o atual e reinicia o serviço
- Admin sobe a nova versão no painel com um clique
- Todas as 14 máquinas atualizam automaticamente no próximo boot

### 2.7 — Bloqueio de Navegadores Alternativos (Edge/Firefox)
Como o filtro de conteúdo está na extensão Chrome, permitir Edge/Firefox cria bypass imediato da política pedagógica. Solução:
- Adicionar `msedge.exe` e `firefox.exe` na lista global de `blocked_apps`
- Manter Chrome como navegador único permitido para alunos
- Se Edge/Firefox forem detectados, agente fecha o processo automaticamente

### 2.8 — Exclusão no Windows Defender para o Agente
Executáveis gerados por PyInstaller podem ser sinalizados por falso positivo em algumas máquinas. Solução:
- Durante deploy, adicionar exclusão para `C:\LanManager\`
- Garantir que a exclusão rode com privilégio administrativo
- Padronizar pasta de instalação para evitar variações por máquina

### 2.9 — Regras de Firewall para Portas Críticas
Sem regra explícita de firewall, comunicação pode falhar de forma intermitente. Solução:
- Liberar TCP `8000` (cliente -> servidor FastAPI)
- Liberar TCP `5900` (TigerVNC)
- Embutir os comandos `netsh advfirewall` no `deploy_agent.bat`

### 2.10 — Seed Inicial do Banco (Primeiro Admin)
Na primeira execução, banco vazio impede acesso ao painel administrativo. Solução:
- Criar script `server/seed.py`
- Executar `python seed.py` após migração/criação inicial do banco
- Script cria usuário admin padrão apenas se não existir admin cadastrado

### 2.11 — Sincronização de Horário (NTP)
Relógios fora de sincronia causam inconsistência em saldo, sessões e suspensão. Solução:
- Configurar NTP no deploy com `w32tm`
- Usar peer nacional (`pool.ntp.br`) e forçar ressincronização

### 2.12 — Hardening contra Encerramento via Task Manager
Mesmo com serviço do Windows, bloquear Task Manager para aluno reduz risco operacional. Solução:
- Aplicar política para desabilitar Task Manager em contas comuns (GPO)
- Manter conta administrativa do professor sem essa restrição

### 2.13 — Fluxo “Esqueci a Senha” no Login
Fluxo de recuperação precisa ser explícito para reduzir suporte informal em sala. Solução:
- Botão/ação “Esqueci minha senha” na tela de login
- Mensagem padrão: “Procure o professor para redefinir sua senha.”
- Reset feito exclusivamente pelo painel Admin

---

## 3. Infraestrutura do Laboratório

### Ambiente Físico
- **Total de máquinas:** 14 computadores (alunos) + 1 máquina Admin
- **Sistema operacional:** Windows 10 em todas as máquinas
- **Topologia:** Anel físico, cada máquina com cabo RJ45 individual conectado em portas próprias no patch panel (rigg)
- **Conexão:** Todas as máquinas na mesma sub-rede LAN via cabo — sem dependência de Wi-Fi
- **Visibilidade:** Admin consegue enxergar fisicamente todos os computadores da sala

### Configuração de Rede Recomendada
```
Rigg (Switch)
├── Porta 1  → Máquina Admin (IP fixo: 192.168.1.1)
├── Porta 2  → PC-01 (IP fixo: 192.168.1.11)
├── Porta 3  → PC-02 (IP fixo: 192.168.1.12)
├── Porta 4  → PC-03 (IP fixo: 192.168.1.13)
├── ...
└── Porta 15 → PC-14 (IP fixo: 192.168.1.24)
```
> **Recomendação:** Configurar IP fixo em cada máquina diretamente nas configurações de rede do Windows (Painel de Controle → Adaptadores de Rede). Mais simples e confiável que reserva DHCP no roteador.

---

## 4. Arquitetura do Sistema

### Modelo Cliente-Servidor Local
```
╔══════════════════════════════════════════╗
║           MÁQUINA ADMIN                  ║
║  ┌─────────────────────────────────┐     ║
║  │   Servidor FastAPI (Python)     │     ║
║  │   Dashboard React (Frontend)    │     ║
║  │   Banco de Dados SQLite         │     ║
║  │   WebSocket Server              │     ║
║  │   Backup Scheduler              │     ║
║  └─────────────────────────────────┘     ║
╚══════════════════════════════════════════╝
                    │ LAN RJ45
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  ╔══════════╗ ╔══════════╗ ╔══════════╗
  ║  PC-01   ║ ║  PC-02   ║ ║  PC-14   ║
  ║ Agent.exe║ ║ Agent.exe║ ║ Agent.exe║
  ║ TigerVNC ║ ║ TigerVNC ║ ║ TigerVNC ║
  ╚══════════╝ ╚══════════╝ ╚══════════╝
```

### Fluxo de Comunicação
| Direção | Protocolo | O que trafega |
|---|---|---|
| Agente → Servidor | WebSocket | Heartbeat, status, screenshot, usuário logado |
| Servidor → Agente | WebSocket | Comandos: bloquear, desligar, matar app, atualizar |
| Dashboard → Servidor | REST API | CRUD usuários, configurações, relatórios |
| Dashboard ↔ Servidor | WebSocket | Atualizações ao vivo das máquinas |
| Admin → PC Cliente | TigerVNC | Acesso remoto completo à área de trabalho |
| Agente → Servidor | HTTP GET | Verificação de nova versão do agente |

---

## 5. Stack Tecnológica

### Backend (Servidor — Máquina Admin)
| Tecnologia | Versão | Função |
|---|---|---|
| Python | 3.11+ | Linguagem principal do servidor |
| FastAPI | 0.111.0 | Framework API REST + WebSocket |
| SQLite + aiosqlite | Nativo + async | Banco de dados local |
| SQLAlchemy | 2.0.30 | ORM para banco de dados |
| Uvicorn | 0.29.0 | Servidor ASGI |
| python-jose | 3.3.0 | JWT tokens de autenticação |
| passlib + bcrypt | 1.7.4 | Hash seguro de senhas |
| APScheduler | 3.10.4 | Cron: dedução de tempo + backup automático |
| pandas + openpyxl | 2.2.2 | Importação de alunos via CSV/Excel |
| reportlab | 4.2.0 | Geração de relatórios PDF |
| Pillow | 10.3.0 | Processamento de screenshots recebidos |

### Frontend Admin (Dashboard)
| Tecnologia | Versão | Função |
|---|---|---|
| React | 18+ | Framework frontend |
| Tailwind CSS | 3+ | Estilização |
| Vite | Latest | Build tool rápido |
| Zustand | Latest | Gerenciamento de estado global |
| React Router | v6 | Navegação entre páginas |
| Axios | Latest | Requisições HTTP para API |
| Socket.io-client | Latest | WebSocket — atualizações ao vivo |
| React Query | Latest | Cache e sincronização de dados |

### Agente Cliente (14 Máquinas — distribuído como .exe)
| Tecnologia | Versão | Função |
|---|---|---|
| Python | 3.11+ | Linguagem (usada só para compilar) |
| **PyInstaller** | **6.6.0** | **Compilar tudo em um único .exe** |
| PyQt5 | 5.15.10 | Tela de login fullscreen |
| psutil | 5.9.8 | Monitorar e matar processos proibidos |
| mss + Pillow | 9.0.1 + 10.3.0 | Captura e compressão de screenshots |
| pywin32 | 306 | Windows API: lock, shutdown, restart |
| websockets | 12.0 | Comunicação com servidor |
| requests | 2.31.0 | HTTP para auth e auto-update |

### VNC (Acesso Remoto)
| Componente | Função |
|---|---|
| **TigerVNC Server** | Instalado nas 14 máquinas clientes (serviço Windows) |
| **TigerVNC Viewer** | Na máquina Admin — abre ao clicar numa máquina |
| Integração no painel | Admin clica → sistema executa `vncviewer.exe [IP]:5900` |

### Extensão Chrome (Filtro de Conteúdo)
| Componente | Função |
|---|---|
| Manifest V3 | Padrão atual de extensões Chrome |
| background.js | Intercepta todas as requisições e verifica URLs |
| API local `/blocked-sites` | Fornece lista atualizada de domínios bloqueados |
| Group Policy (GPO) | Deploy forçado — aluno não consegue remover |
| blocked.html | Página de aviso personalizada com identidade da escola |

---

## 6. Compilação do Agente para .exe

### Por que .exe e não Python puro?

| Aspecto | Python puro | .exe (PyInstaller) |
|---|---|---|
| Precisa Python instalado | ✅ Sim | ❌ Não |
| Instalação nas 14 máquinas | Trabalhoso | Copia e executa |
| Aluno pode interferir | Mais fácil | Mais difícil |
| Atualização | Arquivo por arquivo | Substitui 1 .exe |
| Tamanho | ~50MB deps | ~60-80MB tudo incluso |

### Comando de Build
```bash
# Na máquina de desenvolvimento (Windows)
pip install pyinstaller

pyinstaller ^
  --onefile ^
  --windowed ^
  --icon=assets/school_icon.ico ^
  --name=LanManagerAgent ^
  --add-data "assets;assets" ^
  --hidden-import=PyQt5 ^
  --hidden-import=websockets ^
  agent.py

# O executável final fica em: dist/LanManagerAgent.exe
```

### Distribuição para as 14 Máquinas
```
1. Compilar LanManagerAgent.exe na máquina Admin
2. Colocar na pasta compartilhada: \\192.168.1.1\instalar\
3. Rodar script de deploy via rede:
   - Copia .exe para C:\LanManager\ em cada PC
   - Registra como Windows Service com NSSM
   - Configura para iniciar com o Windows
4. Pronto — sem instalar Python em nenhuma máquina cliente
```

### Script de Instalação em Lote (`deploy_agent.bat`)
```batch
@echo off
set SERVER=\\192.168.1.1\instalar
set DEST=C:\LanManager

echo Copiando agente...
mkdir %DEST% 2>nul
copy %SERVER%\LanManagerAgent.exe %DEST%\
copy %SERVER%\config.ini %DEST%\

echo Aplicando exclusao no Windows Defender...
powershell -Command "Add-MpPreference -ExclusionPath 'C:\LanManager'"

echo Configurando regras de firewall...
netsh advfirewall firewall add rule name="LanManager FastAPI 8000 OUT" dir=out action=allow protocol=TCP remoteport=8000
netsh advfirewall firewall add rule name="LanManager TigerVNC 5900 IN" dir=in action=allow protocol=TCP localport=5900

echo Configurando sincronizacao de horario (NTP)...
w32tm /config /syncfromflags:manual /manualpeerlist:"pool.ntp.br" /update
w32tm /resync /force

echo Instalando como servico Windows...
%SERVER%\nssm.exe install LanManagerAgent %DEST%\LanManagerAgent.exe
%SERVER%\nssm.exe set LanManagerAgent Start SERVICE_AUTO_START
net start LanManagerAgent

echo Instalando TigerVNC...
%SERVER%\TigerVNC-64bit.msi /quiet

echo Aplicando bloqueio de Task Manager para usuarios comuns...
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v DisableTaskMgr /t REG_DWORD /d 1 /f

echo Concluido!
pause
```
> Este script pode ser rodado remotamente em todas as máquinas de uma vez via `PsExec` ou simplesmente executado manualmente uma única vez em cada PC (leva ~1 minuto por máquina).

---

## 7. Perfis de Usuário

### Admin
```
Permissões:
├── Criar / editar / deletar usuários (alunos)
├── Importar alunos em massa via CSV ou Excel
├── Organizar alunos por turma
├── Definir e ajustar saldo de horas individualmente ou por turma
├── Suspender aluno por X dias (com motivo registrado)
├── Zerar saldo de horas como punição
├── Registrar advertências no histórico do aluno
├── Visualizar todas as máquinas em tempo real
├── Ver quem está logado em qual máquina
├── Desligar / reiniciar máquinas remotamente
├── Bloquear/travar tela das máquinas
├── Acessar máquina via TigerVNC (controle total)
├── Preview de screenshots no painel (sem abrir VNC)
├── Bloquear aplicativos por nome de processo (.exe)
├── Gerenciar lista de sites bloqueados (extensão Chrome)
├── Configurar horário de funcionamento do laboratório
├── Visualizar logs e histórico de uso por aluno
├── Gerar relatórios de uso (PDF)
├── Configurar backup automático do banco
└── Publicar nova versão do agente (auto-update)
```

### Aluno (Usuário Comum)
```
Permissões:
├── Login com usuário e senha na tela fullscreen
├── Visualizar seu saldo de tempo restante
├── Usar os aplicativos liberados pelo Admin
└── Navegar em sites não bloqueados

Restrições:
├── Não pode alterar configurações do sistema
├── Não pode fechar/desinstalar o agente (roda como serviço do sistema)
├── Não pode acessar sites bloqueados (extensão Chrome GPO)
├── Não pode usar Edge/Firefox (bloqueados pelo agente)
├── Não pode abrir apps da lista de bloqueados
├── Não pode abrir o Task Manager (política aplicada para usuário comum)
├── Tempo é deduzido automaticamente enquanto logado
├── Ao zerar o saldo → tela bloqueia automaticamente
├── Fora do horário letivo → tela mostra "Laboratório fechado"
└── Se suspenso → tela mostra motivo e data de retorno
```

---

## 8. Banco de Dados — Modelagem Completa

```sql
-- Usuários do sistema
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'student',         -- 'admin' ou 'student'
    turma TEXT,                          -- ex: '6A', '7B', '8C' ← NOVO
    time_balance INTEGER DEFAULT 0,      -- saldo em minutos
    is_suspended BOOLEAN DEFAULT FALSE,
    suspended_until DATE,
    suspension_reason TEXT,
    warnings_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Máquinas do laboratório
CREATE TABLE machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,                  -- 'PC-01' ... 'PC-14'
    ip_address TEXT UNIQUE NOT NULL,
    mac_address TEXT,
    status TEXT DEFAULT 'offline',       -- 'online', 'offline', 'blocked', 'maintenance'
    current_user_id INTEGER,
    session_start DATETIME,
    vnc_port INTEGER DEFAULT 5900,
    last_seen DATETIME,
    agent_version TEXT,                  -- ← versão atual do agente instalado
    FOREIGN KEY (current_user_id) REFERENCES users(id)
);

-- Sessões de uso
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    machine_id INTEGER NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    minutes_used INTEGER DEFAULT 0,
    end_reason TEXT,                     -- 'logout', 'time_expired', 'admin_block', 'shutdown'
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (machine_id) REFERENCES machines(id)
);

-- Apps bloqueados
CREATE TABLE blocked_apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_name TEXT NOT NULL,          -- 'steam.exe', 'discord.exe'
    display_name TEXT,
    blocked_globally BOOLEAN DEFAULT TRUE,
    created_by INTEGER,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sites bloqueados (extensão Chrome)
CREATE TABLE blocked_sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT NOT NULL,                -- '*.onlyfans.com', '*.xvideos.com'
    category TEXT,                       -- 'adult', 'games', 'social', 'streaming'
    added_by INTEGER,
    FOREIGN KEY (added_by) REFERENCES users(id)
);

-- Configurações do laboratório ← NOVO
CREATE TABLE lab_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
    -- Exemplos de keys:
    -- 'lab_name': 'Lab. Informática - EMEF Exemplo'
    -- 'schedule_start': '07:00'
    -- 'schedule_end': '17:00'
    -- 'schedule_days': 'Mon,Tue,Wed,Thu,Fri'
    -- 'agent_version': '1.0.3'
    -- 'backup_path': 'C:\LanManagerBackup'
);

-- Log de ações administrativas
CREATE TABLE admin_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,                -- 'suspend', 'block_machine', 'remove_time', 'add_time'
    target_user_id INTEGER,
    target_machine_id INTEGER,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Versões do agente para auto-update ← NOVO
CREATE TABLE agent_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version TEXT NOT NULL,
    file_path TEXT NOT NULL,             -- caminho do .exe no servidor
    release_notes TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 9. Fluxo de Boot e Login nas Máquinas Clientes

```
[Windows 10 Inicia]
        │
        ▼
[Windows Service "LanManagerAgent" sobe automaticamente]
        │
        ▼
[Agente verifica se há update disponível no servidor]
        ├── [Nova versão] → Baixa, substitui .exe, reinicia serviço
        └── [Versão atual] → Continua normalmente
        │
        ▼
[Agente conecta ao servidor via WebSocket]
        │
        ▼
[Verifica horário letivo configurado]
        ├── [Fora do horário] → Tela mostra "Laboratório fechado"
        └── [Dentro do horário] → Tela de login normal
        │
        ▼
[Tela do Windows é bloqueada — LockWorkStation()]
        │
        ▼
[Janela PyQt5 fullscreen aparece — Tela de Login com logo da escola]
        │
        ▼
[Aluno digita usuário + senha]
        │
        ├── [Clica em "Esqueci minha senha"] → "Procure o professor para redefinir sua senha"
        ├── [Credenciais inválidas] → Mensagem de erro, mantém bloqueado
        ├── [Aluno suspenso] → "Suspenso até DD/MM — Motivo: [X]"
        ├── [Saldo zerado] → "Sem saldo de tempo. Procure o professor."
        └── [Login válido + saldo disponível]
                │
                ▼
        [Servidor registra sessão + atualiza máquina no painel]
                │
                ▼
        [Tela de login fecha — desktop liberado]
                │
                ▼
        [Widget flutuante aparece: "Tempo restante: XX min"]
                │
                ▼
        [Ao atingir 5 min restantes → notificação sonora + visual]
                │
                ▼
        [Ao zerar → salva sessão, bloqueia tela, volta ao login]
```

---

## 10. Painel Admin — Telas e Funcionalidades

### 10.1 Dashboard Principal
- Grid 4×4 com os 14 cards de máquinas + 1 card de resumo
- Card de máquina mostra: nome, status colorido, usuário logado, tempo restante (contagem ao vivo)
- **Cores:** 🟢 livre | 🔵 em uso | 🔴 bloqueada | ⚫ offline | 🟡 manutenção
- Ações rápidas no card: bloquear tela, desligar, abrir VNC, encerrar sessão
- Barra superior: total online, total em uso, total offline, horário atual

### 10.2 Gerenciamento de Usuários
- Lista de alunos com filtro por turma, status e busca por nome
- Cadastro individual + importação em massa via CSV/Excel
- Por aluno: editar dados, ver histórico completo de sessões
- Painel de punição: zerar saldo, suspender X dias, registrar advertência, tudo com campo de motivo obrigatório
- Reset de senha do aluno com ação rápida (atende fluxo “esqueci a senha”)

### 10.3 Visualização de Telas
- Preview de screenshot de cada máquina (atualiza a cada 10s)
- Clique no preview → abre TigerVNC Viewer (controle total)
- Modo grade: miniaturas de todas as 14 telas simultâneas
- Indicação visual se aluno está com conteúdo suspeito (detecção manual pelo professor)

### 10.4 Controle de Apps e Sites
- Lista de aplicativos bloqueados por nome de processo (.exe)
- Lista inicial recomendada inclui `msedge.exe` e `firefox.exe` para evitar bypass do filtro web
- Lista de sites bloqueados: adicionar domínio ou selecionar categoria
- **Categorias pré-carregadas:** Adulto, Jogos, Apostas, Redes Sociais, Streaming
- Preview da página de bloqueio que o aluno vai ver no Chrome

### 10.5 Configurações do Laboratório
- Nome do laboratório e escola (aparece na tela de login dos alunos)
- Horário de funcionamento por dia da semana
- Caminho do backup automático
- Publicar nova versão do agente (.exe)

### 10.6 Logs e Relatórios
- Histórico de sessões filtrado por aluno, turma, data ou máquina
- Log completo de ações administrativas (quem fez o quê e quando)
- Relatório de uso mensal por aluno (exportável em PDF)
- Ranking de uso por turma

---

## 11. Extensão Chrome — Filtro de Conteúdo

### Como Funciona
```javascript
// background.js — Manifest V3
chrome.webRequest.onBeforeRequest.addListener(
  async (details) => {
    const domain = new URL(details.url).hostname;

    // Cache local atualizado a cada 5 minutos do servidor
    if (blockedDomainsCache.some(d => domain.endsWith(d))) {
      return { redirectUrl: chrome.runtime.getURL("blocked.html") };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Atualiza cache periodicamente
setInterval(async () => {
  const res = await fetch("http://192.168.1.1:8000/blocked-sites");
  blockedDomainsCache = await res.json();
}, 5 * 60 * 1000);
```

### Deploy via Group Policy (GPO)
```
1. Empacotar extensão como .crx
2. Hospedar o .crx no servidor local
3. Configurar via registro do Windows em cada máquina:

   [HKLM\SOFTWARE\Policies\Google\Chrome\ExtensionInstallForcelist]
   "1"="[ID_DA_EXTENSÃO];http://192.168.1.1:8000/extension/extension.crx"

4. Executar o script deploy-gpo/install_extension.bat via rede
5. Aplicar política de usuário para desabilitar Task Manager em contas de aluno
6. Extensão aparece instalada, bloqueada — aluno não consegue remover
```

---

## 12. TigerVNC — Integração

### Instalação Silenciosa nas Máquinas Clientes
```batch
:: Incluído no deploy_agent.bat
TigerVNC-64bit-1.13.1.msi /quiet ADDLOCAL=Server ^
  SERVER_REGISTER_AS_SERVICE=1 ^
  SERVER_ADD_FIREWALL_EXCEPTION=1 ^
  VNC_PORT=5900

:: Configurar senha fixa para todas as máquinas
reg add "HKLM\SOFTWARE\TigerVNC\Server" /v SecurityTypes /t REG_SZ /d "VncAuth" /f
:: (senha configurada via script separado com hash)
```

### Acesso via Painel
1. Admin clica em "Ver Tela" num card de máquina
2. Sistema executa: `vncviewer.exe 192.168.1.XX:5900`
3. TigerVNC abre com acesso total à máquina
4. Para screenshot rápido (sem abrir VNC): agente envia imagem pelo WebSocket

---

## 13. Sistema de Auto-Update do Agente

```
[Admin termina nova versão do agente]
        │
        ▼
[Compila novo LanManagerAgent.exe com PyInstaller]
        │
        ▼
[Faz upload do .exe no painel Admin → Configurações → Versão do Agente]
        │
        ▼
[Servidor registra nova versão na tabela agent_versions]
        │
        ▼
[No próximo boot de cada PC cliente]
        │
        ▼
[Agente faz GET /agent/version → recebe {"version": "1.0.4", "url": "..."}]
        │
        ├── [Versão atual] → Continua normalmente
        └── [Versão nova]
                │
                ▼
        [Baixa novo .exe para C:\LanManager\LanManagerAgent_new.exe]
                │
                ▼
        [Script bat: substitui .exe atual, reinicia serviço]
                │
                ▼
        [Pronto — todas as 14 máquinas atualizadas no próximo boot]
```

---

## 14. Estrutura de Pastas do Projeto

```
lan-manager-escolar/
│
├── 📁 server/                           # Servidor — Máquina Admin
│   ├── main.py                          # Entry point FastAPI
│   ├── database.py                      # Conexão e modelos SQLAlchemy
│   ├── config.py                        # Configurações via .env
│   ├── seed.py                          # Cria primeiro admin (idempotente)
│   ├── schemas.py                       # Pydantic schemas
│   ├── requirements.txt                 # ← Dependências Python do servidor
│   ├── 📁 routers/
│   │   ├── auth.py                      # Login/logout, JWT
│   │   ├── users.py                     # CRUD de alunos + importação CSV
│   │   ├── machines.py                  # Status e controle de máquinas
│   │   ├── time_management.py           # Saldo, dedução, suspensão
│   │   ├── blocked_apps.py              # Lista de apps bloqueados
│   │   ├── blocked_sites.py             # Lista de sites (extensão Chrome)
│   │   ├── lab_config.py                # Horário letivo, configurações gerais
│   │   └── agent_update.py              # Upload e distribuição de versões
│   ├── 📁 services/
│   │   ├── websocket_manager.py         # Gerencia conexões WS dos 14 agentes
│   │   ├── time_scheduler.py            # Cron: dedução de tempo + backup DB
│   │   └── command_sender.py            # Envia comandos para agentes
│   └── 📁 static/                       # Arquivos estáticos servidos
│       └── agent/                       # .exe do agente para download
│
├── 📁 client-agent/                     # Agente — compila e distribui como .exe
│   ├── agent.py                         # Serviço principal
│   ├── config.ini                       # IP do servidor, nome da máquina
│   ├── requirements.txt                 # ← Dependências Python do agente
│   ├── build.bat                        # Script PyInstaller → gera .exe
│   ├── 📁 lock_screen/
│   │   ├── login_window.py              # Janela PyQt5 fullscreen
│   │   └── login_ui.py                  # UI com logo da escola
│   ├── 📁 assets/
│   │   ├── school_icon.ico              # Ícone do .exe
│   │   └── school_logo.png              # Logo na tela de login
│   ├── app_blocker.py                   # Monitor e killer de processos
│   ├── screenshot.py                    # Captura e envia screenshots
│   ├── windows_control.py               # Lock, shutdown, restart via win32
│   ├── auto_updater.py                  # Verifica e aplica updates do agente
│   └── 📁 deploy/
│       ├── deploy_agent.bat             # Instala em todas as máquinas via rede
│       ├── hardening_gpo.bat            # Políticas locais (Task Manager/aluno)
│       ├── nssm.exe                     # Instala .exe como Windows Service
│       └── TigerVNC-64bit.msi           # Instalador TigerVNC
│
├── 📁 admin-dashboard/                  # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.jsx            # Grid das 14 máquinas ao vivo
│   │   │   ├── Users.jsx                # Gestão de alunos + importação CSV
│   │   │   ├── MachineDetail.jsx        # Controle individual de máquina
│   │   │   ├── BlockedContent.jsx       # Apps e sites bloqueados
│   │   │   ├── LabConfig.jsx            # Horário, nome da escola, update
│   │   │   └── Logs.jsx                 # Histórico e relatórios PDF
│   │   ├── 📁 components/
│   │   │   ├── MachineCard.jsx          # Card no grid com status ao vivo
│   │   │   ├── UserModal.jsx            # Modal punição/edição de aluno
│   │   │   ├── ScreenshotGrid.jsx       # Grade de todas as telas
│   │   │   └── ImportCSVModal.jsx       # Upload e preview de importação
│   │   ├── 📁 store/
│   │   │   └── useStore.js              # Zustand — estado global
│   │   └── 📁 services/
│   │       ├── api.js                   # Axios — chamadas REST
│   │       └── socket.js                # Socket.io — tempo real
│   ├── package.json
│   └── vite.config.js
│
├── 📁 chrome-extension/                 # Extensão de filtro de conteúdo
│   ├── manifest.json                    # Manifest V3
│   ├── background.js                    # Interceptor de URLs
│   ├── blocked.html                     # Página de bloqueio customizada
│   ├── blocked.css
│   └── 📁 deploy-gpo/
│       ├── install_extension.bat        # Deploy via registro Windows
│       └── README.md
│
└── 📄 README.md
```

---

## 15. Requirements.txt — Arquivos Completos

### `server/requirements.txt`
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
websockets==12.0
sqlalchemy==2.0.30
aiosqlite==0.20.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
apscheduler==3.10.4
pydantic==2.7.1
pydantic-settings==2.2.1
python-dotenv==1.0.1
httpx==0.27.0
Pillow==10.3.0
pandas==2.2.2
openpyxl==3.1.2
reportlab==4.2.0
```

### `client-agent/requirements.txt`
```
websockets==12.0
requests==2.31.0
PyQt5==5.15.10
PyQt5-Qt5==5.15.13
PyQt5-sip==12.13.0
psutil==5.9.8
mss==9.0.1
Pillow==10.3.0
pywin32==306
pywin32-ctypes==0.2.2
pyinstaller==6.6.0
python-dotenv==1.0.1
cryptography==42.0.5
```

### Compilar o Agente para .exe
```batch
:: client-agent/build.bat
pip install -r requirements.txt
pyinstaller --onefile --windowed --icon=assets/school_icon.ico ^
            --name=LanManagerAgent ^
            --add-data "assets;assets" ^
            --add-data "config.ini;." ^
            --hidden-import=PyQt5.sip ^
            --hidden-import=win32api ^
            --hidden-import=win32con ^
            agent.py
echo Build concluido! Arquivo em: dist\LanManagerAgent.exe
```

---

## 16. Roadmap de Desenvolvimento

### Sprint 1 — MVP Core (Semana 1)
- [x] Configurar projeto FastAPI + SQLite + SQLAlchemy
- [x] Criar todos os modelos de banco (users, machines, sessions, lab_config)
- [x] Endpoints de autenticação (login/logout com JWT)
- [x] Criar `seed.py` para provisionar primeiro admin
- [x] Agente cliente básico com heartbeat ao servidor via WebSocket
- [x] Tela de login fullscreen PyQt5 com logo da escola
- [x] Adicionar ação “Esqueci minha senha” na tela de login
- [x] Compilar agente como .exe com PyInstaller
- [x] Script `deploy_agent.bat` com Defender + Firewall + NTP

### Sprint 2 — Painel Admin (Semana 2)
- [x] Setup React + Tailwind + Vite
- [x] Dashboard com grid das 14 máquinas em tempo real
- [x] Gestão de usuários: CRUD + importação CSV/Excel
- [x] Organização por turmas
- [x] Controle de saldo de tempo + sistema de suspensão/advertência
- [x] Dedução automática de tempo (APScheduler)
- [x] Controle de horário letivo (bloquear fora do horário)

### Sprint 3 — Controle Remoto (Semana 3)
- [x] Instalar TigerVNC nas 14 máquinas via `deploy_agent.bat`
- [x] Integrar abertura do VNC Viewer pelo painel
- [x] Screenshots periódicos via agente → preview no dashboard
- [x] Comandos remotos: desligar, reiniciar, bloquear tela
- [x] Modo grade: todas as 14 telas em miniatura simultâneas

### Sprint 4 — Bloqueios e Filtros (Semana 4)
- [x] Bloqueio de apps por lista (psutil + kill de processo)
- [x] Incluir `msedge.exe` e `firefox.exe` no bloqueio global
- [x] Criar extensão Chrome Manifest V3
- [x] Endpoint `/blocked-sites` na API
- [ ] Deploy da extensão via Group Policy (script GPO)
- [x] Aplicar GPO para desabilitar Task Manager em usuários comuns
- [x] Página de bloqueio customizada com logo da escola

### Sprint 5 — Estabilização e Extras (Semana 5)
- [x] Sistema de auto-update do agente
- [x] Backup automático agendado do banco SQLite
- [x] Notificação ao aluno (5 min antes de acabar o tempo)
- [ ] Relatórios de uso exportáveis em PDF
- [x] Polimento visual do painel admin
- [ ] Testes completos nas 14 máquinas em produção
- [x] Documentação de instalação e uso

---

## 17. Instalação e Deploy Completo

### Passo 1 — Configurar Máquina Admin
```bash
# Instalar Python 3.11
# Instalar Node.js 20+

cd server/
pip install -r requirements.txt
python seed.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

cd ../admin-dashboard/
npm install
npm run build
# FastAPI serve o build do React como arquivos estáticos
```
> O `seed.py` deve ser idempotente: cria o primeiro admin apenas quando ainda não existe admin no banco.

### Passo 2 — Compilar Agente
```bash
# Na máquina Admin (ou qualquer máquina Windows)
cd client-agent/
pip install -r requirements.txt
build.bat
# Gera: dist/LanManagerAgent.exe
```

### Passo 3 — Configurar Pasta de Instalação
```
Criar: C:\LanManagerDeploy\  (compartilhar na rede como \\192.168.1.1\instalar)
Colocar:
  - LanManagerAgent.exe  (agente compilado)
  - config.ini           (IP do servidor: 192.168.1.1, porta: 8000)
  - nssm.exe             (Non-Sucking Service Manager)
  - TigerVNC-64bit.msi   (instalador VNC)
  - deploy_agent.bat     (script de instalação)
```

### Passo 4 — Instalar nas 14 Máquinas
```bash
# Em cada PC cliente (ou via PsExec remotamente):
\\192.168.1.1\instalar\deploy_agent.bat

# O script faz tudo:
# ✅ Copia e instala o agente como serviço Windows
# ✅ Instala TigerVNC Server
# ✅ Configura exclusão do Windows Defender para C:\LanManager\
# ✅ Configura regras de firewall (TCP 8000 e 5900)
# ✅ Configura sincronização NTP com pool.ntp.br
# ✅ Aplica bloqueio de Task Manager para usuários comuns
# ✅ Configura inicialização automática
# ✅ Agente sobe, conecta ao servidor e aparece no painel
```

### Passo 5 — Deploy da Extensão Chrome
```bash
# Em cada PC cliente:
\\192.168.1.1\instalar\deploy-gpo\install_extension.bat
# Reiniciar o Chrome — extensão instalada e bloqueada
```

---

## 18. Considerações Técnicas

### Performance
- 14 agentes com heartbeat a cada 30s = carga mínima no servidor
- Screenshots enviados somente quando o painel está na aba de visualização (demand-based)
- SQLite suporta com folga o volume de dados de um laboratório escolar
- .exe do agente: ~70MB incluindo PyQt5 e todas as dependências

### Robustez
- Agente reconecta automaticamente ao servidor se a conexão cair
- Se servidor offline: agente mantém a tela bloqueada por segurança
- Backup diário automático do banco em pasta local e/ou rede

### Segurança Interna
- JWT com expiração de 8 horas (duração de um dia letivo)
- Agente rodando como serviço do SYSTEM — aluno não consegue parar
- TigerVNC com senha — aluno não consegue conectar de outra máquina
- Extensão Chrome via GPO — aluno não consegue desinstalar
- Edge e Firefox bloqueados por processo para evitar bypass do filtro web
- Exclusão controlada no Windows Defender para reduzir falso positivo do .exe
- Task Manager desabilitado para contas de aluno (professor/admin preservado)

### Escalabilidade Futura
- Migração para PostgreSQL: trocar apenas a connection string
- noVNC: acesso VNC diretamente no browser sem instalar viewer
- Múltiplos laboratórios: campo `lab_id` nas tabelas + multi-tenant
- App mobile para o professor monitorar pelo celular

---

## 19. Referências

| Recurso | Link |
|---|---|
| Cyber Square Manager | Referência funcional do projeto |
| TigerVNC (gratuito) | https://tigervnc.org |
| FastAPI | https://fastapi.tiangolo.com |
| PyInstaller | https://pyinstaller.org |
| NSSM — Windows Service | https://nssm.cc |
| Chrome Extensions MV3 | https://developer.chrome.com/docs/extensions/mv3 |
| Group Policy Chrome | https://support.google.com/chrome/a/answer/187202 |

---

*Documento v2.1 — Revisado com 13 adições ao planejamento original.*  
*Inclui hardening operacional (Defender, Firewall, NTP, GPO) e seed inicial de admin.*  
*Próximo passo: Sprint 1 — abrir VSCode e iniciar o servidor FastAPI.*
