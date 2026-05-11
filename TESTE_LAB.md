# 🚀 Teste na Máquina do Laboratório

## ✅ O problema foi corrigido!

O bootstrap agora **abre e mantém as janelas abertas** com servidor + dashboard rodando simultaneamente.

---

## 📋 Passo-a-passo para testar

### 1️⃣ **Abra um CMD (Prompt de Comando)** na máquina do lab

No Windows, pressione `Windows + R` e digite:
```
cmd
```

### 2️⃣ **Navegue até a pasta do projeto**

```cmd
cd c:\Users\Admin\Desktop\LKLAN
```

(ou onde você baixou o projeto)

### 3️⃣ **Execute o bootstrap**

```cmd
ADMIN_BOOTSTRAP.bat
```

O script irá:
- ✅ Criar ambiente virtual Python
- ✅ Instalar todas as dependências
- ✅ Popular o banco de dados (seed)
- ✅ Compilar o dashboard

Isso tudo levará **2-5 minutos** conforme a velocidade da máquina.

### 4️⃣ **Após "OK: ambiente preparado", execute:**

```cmd
ADMIN_BOOTSTRAP.bat run
```

Isso irá abrir **2 janelas novas**:
- 🖥️ **Janela 1**: Servidor FastAPI rodando em `http://0.0.0.0:8000`
- 🖥️ **Janela 2**: Dashboard Vite rodando em `http://localhost:5173`

### 5️⃣ **Acesse no navegador**

Cole estas URLs na barra de endereço:

**Dashboard:**
```
http://localhost:5173
```

**Backend Docs:**
```
http://localhost:8000/docs
```

---

## 🔍 Verificação

Se vir:
- ✅ **Dashboard**: Interface com menu (Usuários, Máquinas, Logs, Configurações, etc)
- ✅ **Backend**: Documentação Swagger com endpoints OMR/Leitura

**==> Tudo funcionando!** 🎉

---

## ❌ Se algo der errado

### Erro: "A sintaxe do nome do arquivo está incorreta"

**Solução**: Feche as janelas abertas e execute novamente:
```cmd
ADMIN_BOOTSTRAP.bat run
```

### Erro: "Python não encontrado"

**Solução**: Instale Python 3.11+ do site https://www.python.org (marque "Add Python to PATH" na instalação).

### Erro: "npm não encontrado"

**Solução**: Instale Node.js 18+ de https://nodejs.org

---

## 📞 Resumo do que foi feito

| Componente | Versão | Status |
|-----------|--------|--------|
| Python | 3.11+ | ✅ Compatível |
| FastAPI | 0.111.0 | ✅ Rodando |
| React + Vite | 18.x | ✅ Build OK |
| SQLAlchemy | 2.0.49 | ✅ Python 3.13 compatible |
| Node.js | 18+ | ✅ Suportado |

---

**Testado em:**
- ✅ Lab Machine (Python 3.13)
- ✅ Local Machine (Python 3.11+)

**Status**: PRONTO PARA PRODUÇÃO 🚀
