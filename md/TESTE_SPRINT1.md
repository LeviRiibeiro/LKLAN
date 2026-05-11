# 📋 Sprint 1 - Guia de Teste Passo a Passo

> **Objetivo:** Validar que o servidor, agente e autenticação estão funcionando corretamente.

---

## Passo 1: Instalar Dependências do Servidor

```bash
cd server
pip install -r requirements.txt
```

**Esperado:** Instalação sem erros. Se houver erro, verifique se Python 3.11+ está instalado.

---

## Passo 2: Criar Banco de Dados e Admin Inicial

```bash
python seed.py
```

**Esperado:**
```
Admin inicial criado com sucesso.
Usuario: admin
Altere a senha apos o primeiro login.
```

**Verificar:** Arquivo `database.db` foi criado no diretório `server/`.

---

## Passo 3: Iniciar o Servidor FastAPI

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Esperado:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
...
```

**Abrir em navegador:** http://localhost:8000/docs

Você deve ver a documentação interativa do FastAPI com todos os endpoints.

---

## Passo 4: Testar Login via API

Com o servidor rodando, abra outro terminal e execute:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Esperado:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer"
}
```

Se receber erro 401, as credenciais estão inválidas. Verifique o `seed.py`.

---

## Passo 5: Testar Listagem de Usuários

```bash
curl http://localhost:8000/users
```

**Esperado:** Lista vazia `[]` ou lista com usuários criados.

---

## Passo 6: Instalar Dependências do Agente

Em outro terminal:

```bash
cd client-agent
pip install -r requirements.txt
```

---

## Passo 7: Configurar IP do Servidor no Agente

Editar `client-agent/config.ini`:

```ini
[server]
host = 127.0.0.1    # Mude para 192.168.1.1 se testar em outra máquina
port = 8000
```

---

## Passo 8: Iniciar o Agente

Com o servidor rodando, execute em outro terminal:

```bash
python agent.py
```

**Esperado:**
```
[INFO] LAN Manager Escolar - Agente 0.1.0
[INFO] Servidor: 127.0.0.1:8000
[INFO] Máquina: SEU-PC-NAME
[INFO] Conectado ao servidor. Iniciando heartbeats.
```

E no terminal do **servidor**, você deve ver logs de heartbeat recebido:

```
INFO:     127.0.0.1:XXXXX - "POST /machines/heartbeat HTTP/1.1" 200
```

---

## Passo 9: Testar Bloqueio de Apps

O agente monitora e mata procesos de `msedge.exe` e `firefox.exe`.

Para testar:
1. Abra o Gerenciador de Tarefas
2. Procure por qualquer processo existente
3. O agente não o mata (a menos que seja Edge ou Firefox)

Você pode fazer um teste manual editando `client-agent/app_blocker.py` para adicionar `notepad.exe` à lista bloqueada.

---

## Passo 10: Testar Reset de Senha (Admin)

```bash
curl -X POST http://localhost:8000/users/1/reset-password \
  -H "Content-Type: application/json" \
  -d '{"new_password": "nova123", "confirm_password": "nova123"}'
```

**Esperado:**
```json
{
  "message": "Senha redefinida com sucesso",
  "user_id": 1
}
```

Agora tente login com a nova senha:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "nova123"}'
```

---

## Checklist de Validação ✅

- [ ] Servidor FastAPI está rodando sem erros
- [ ] Admin foi criado com sucesso (`python seed.py`)
- [ ] Login funciona com credenciais corretas
- [ ] Login falha com credenciais inválidas
- [ ] Listagem de usuários retorna dados
- [ ] Agente conecta ao servidor via WebSocket
- [ ] Agente envia heartbeats a cada 30 segundos
- [ ] Reset de senha funciona
- [ ] Nova senha permite login

---

## Troubleshooting

### ❌ "Connection refused" ao conectar o agente

**Solução:** Verifique se:
- Servidor está rodando (`uvicorn main:app`)
- IP correto em `client-agent/config.ini`
- Firewall não está bloqueando porta 8000

### ❌ "Admin não foi criado"

**Solução:** Verifique se:
- Arquivo `.env` está configurado corretamente
- Permissões de pasta para criar `database.db`
- Python 3.11+ está sendo usado

### ❌ "Erro de autenticação no agente"

**Solução:** Verifique se:
- Servidor está respondendo (`curl http://localhost:8000/health`)
- Username/password estão corretos
- Token JWT está sendo gerado

---

## Próximos Passos (Sprint 2)

Se tudo passou no checklist, você está pronto para:
1. Painel Admin com React
2. Grid das 14 máquinas em tempo real
3. Gestão de usuários via dashboard
4. Importação de alunos via CSV

---

**Data de Teste:** _____________  
**Resultado:** ✅ Passou | ❌ Falhou | ⚠️ Com issues  
**Notas:** _____________________________
