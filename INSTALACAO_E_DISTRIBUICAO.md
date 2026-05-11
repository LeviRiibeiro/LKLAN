# LAN Manager Escolar v2

Este repositório contém o sistema de gerenciamento do laboratório escolar, dividido em três partes principais:

- backend em FastAPI para o servidor central
- dashboard web em React para administração
- agente cliente em Python para as máquinas dos alunos

O objetivo do projeto é centralizar autenticação, controle de máquinas, bloqueios, backups, horários de acesso e atualização do agente.

## Onde instalar cada parte

### Máquina admin / servidor central

Na máquina administradora você deve executar o backend e o dashboard. Nesta etapa não há um executável único do admin; a instalação é via linha de comando, usando o código do repositório.

Componentes:

- backend FastAPI
- banco SQLite local
- dashboard React
- rotinas de backup e atualização do agente

### Máquinas dos alunos

Nas máquinas dos alunos você instala apenas o agente cliente.

Componentes:

- `LanManagerAgent.exe`

Esse agente é responsável por conectar no servidor, enviar heartbeat, aplicar bloqueios e receber comandos do painel.

## Instalação no servidor admin

1. Baixe o repositório:

```bash
git clone https://github.com/LeviRiibeiro/LKLAN.git
cd LKLAN
```

2. Instale as dependências do backend:

```bash
cd server
pip install -r requirements.txt
```

3. Crie o banco inicial e o usuário admin:

```bash
python seed.py
```

4. Inicie o backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

5. Em outro terminal, instale e rode o dashboard:

```bash
cd admin-dashboard
npm install
npm run dev
```

## Instalação nas máquinas dos alunos

1. Baixe o executável do agente disponível no repositório ou na pasta de releases.
2. Copie o arquivo para a máquina do aluno.
3. Execute o agente apontando para o IP do servidor admin.

Exemplo:

```bash
LanManagerAgent.exe
```

## Como o fluxo funciona

1. O servidor admin centraliza o banco e o dashboard.
2. O agente cliente roda em cada máquina dos alunos.
3. O agente consulta o servidor para autenticação, bloqueios e atualizações.
4. O painel web permite administrar usuários, máquinas, turmas, backups e versões do agente.

## Observações importantes

- O admin depende do repositório completo, então a forma mais simples de instalação é via Git.
- O agente cliente é a única parte distribuída diretamente para os laboratórios.
- O projeto foi mantido separado de propósito para facilitar manutenção e atualização.

## Resumo

Se você vai instalar no servidor central, use o código-fonte do repositório.
Se você vai instalar em uma máquina de aluno, use apenas o agente cliente compilado.
