Sprint 2 - Progresso

Alterações implementadas:

- Implementada página `Users` em `admin-dashboard/src/pages/Users.jsx`.
  - Busca `GET /users`, exibição em tabela e exclusão via `DELETE /users/{id}`.
- Implementada página `MachineDetail` em `admin-dashboard/src/pages/MachineDetail.jsx`.
  - Busca `GET /machines/{id}` e exibe informações básicas.
- Adicionado polling no `Dashboard` (`admin-dashboard/src/pages/Dashboard.jsx`) para atualizar a lista de máquinas a cada 5 segundos (simulação de atualizações em tempo real).

Próximos passos sugeridos:

- Implementar WebSocket/Push no backend para atualizações em tempo real (substituir polling).
- Adicionar listagem de sessões por máquina e controles (encerrar sessão, bloquear máquinas).
- Melhorar gerenciamento de usuários (criar/editar/perfis) no frontend.

Teste rápido:

1. Iniciar backend: `uvicorn main:app --host 127.0.0.1 --port 8001`
2. Iniciar frontend: `cd admin-dashboard && npm run dev -- --host 0.0.0.0`
3. Abrir: `http://localhost:5173/` e navegar para "Usuarios" ou "Maquina".
