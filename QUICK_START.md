# ⚡ QUICK START — Clone e Teste no Laboratório

## 🎯 Resumo Executivo

Você tem agora **LAN Manager Escolar v1.0 100% pronto** para testar nas máquinas do laboratório!

**Repositório:** https://github.com/LeviRiibeiro/LKLAN.git

**Último Commit:** `fbd0fb7` — Sprint 5 + .gitignore + Documentação Final

---

## 📥 Clonar no Laboratório

### Máquina Admin

```bash
cd C:\
git clone https://github.com/LeviRiibeiro/LKLAN.git
cd LKLAN
```

---

## ✅ Verificação Rápida (5 min)

```bash
# Terminal 1: Backend
python -m venv .venv
.venv\Scripts\activate.bat
pip install starlette==0.38.0  # ← IMPORTANTE (versão corrigida)
cd server && pip install -r requirements.txt && cd ..
python -c "import sys; sys.path.insert(0, '.'); import asyncio; from server.seed import seed_admin; asyncio.run(seed_admin())"
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Dashboard
cd admin-dashboard
npm install
npm run build
# OU para dev:
npm run dev
```

**Acesse:** http://192.168.1.1:8000  
**Login:** admin / admin123

---

## 📚 Documentos de Referência

| Documento | O que é | Onde |
|---|---|---|
| `GUIA_INSTALACAO_E_DEPLOY.md` | Passo-a-passo completo | Raiz |
| `RESUMO_FINAL.md` | Status do projeto | Raiz |
| `LAN_MANAGER_ESCOLAR_v2.md` | Planejamento técnico | `md/` |
| `INSTALACAO_E_DISTRIBUICAO.md` | Distribuição do projeto | Raiz |

---

## 🔧 Build do Agente

```bash
cd client-agent
pip install -r requirements.txt
python build.bat
# Resultado: dist\LanManagerAgent.exe (~80MB)
```

---

## 🚀 Deploy nas 14 Máquinas

1. **Copie para pasta compartilhada:**
   ```bash
   mkdir \\192.168.1.1\instalar
   copy client-agent\dist\LanManagerAgent.exe \\192.168.1.1\instalar\
   copy client-agent\config.ini \\192.168.1.1\instalar\
   copy client-agent\deploy\*.* \\192.168.1.1\instalar\
   ```

2. **Em cada máquina client (como Admin):**
   ```bash
   C:\LanManagerDeploy\deploy_agent.bat
   ```

3. **Verificar no dashboard:**
   - Máquinas aparecem com status 🟢 Online
   - Clique em uma → aparece VNC, screenshot, comandos

---

## ✨ Teste Rápido (Login até Bloqueio)

1. **Dashboard:** Criar aluno
   - Usuário: `aluno1`
   - Senha: `senha123`
   - Saldo: `120` min

2. **Máquina Client:**
   - Tela de login aparece
   - Aluno faz login
   - ✅ Desktop libera + widget de tempo

3. **Dashboard:**
   - Tempo deduzido em tempo real (1 min/minuto)
   - Screenshot atualiza a cada 10s

4. **Testes Avançados:**
   - Bloquear app no dashboard → app fecha na máquina client
   - Clicar "Bloquear Tela" → máquina client tranca
   - Clicar VNC → abre TigerVNC com controle total

---

## 🐛 Se Algo Não Funcionar

**Problema:** `ModuleNotFoundError: No module named 'server'`
```bash
cd C:\LKLAN
set PYTHONPATH=%cd%
python -m uvicorn server.main:app --host 0.0.0.0 --port 8000
```

**Problema:** `TypeError: Router.__init__() got an unexpected keyword argument 'on_startup'`
```bash
pip install starlette==0.38.0 --force-reinstall
```

**Problema:** Agente não conecta
```bash
# Verificar firewall
netsh advfirewall firewall add rule name="LAN Manager" dir=in action=allow protocol=TCP localport=8000
```

---

## 📞 Próximos Passos

1. Clone o repositório
2. Siga `GUIA_INSTALACAO_E_DEPLOY.md` para setup completo
3. Teste na máquina Admin primeiro (10 min)
4. Deploy agente em 1 máquina client (5 min)
5. Teste fluxo: login → dedução → bloqueio
6. Se tudo OK → deploy nas 14 máquinas

---

## 🎓 Boa sorte! 

Se precisar de ajuda durante o teste, verifique:
- `GUIA_INSTALACAO_E_DEPLOY.md` (seção Troubleshooting)
- Logs: `C:\LanManager\agent.log` (na máquina client)
- Console do Uvicorn (Terminal 1 da Admin)

---

**Commit:** `fbd0fb7`  
**Data:** 11 de maio de 2026  
**Status:** ✅ PRONTO PARA PRODUÇÃO
