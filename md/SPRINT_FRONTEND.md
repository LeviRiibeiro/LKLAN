Sprint Frontend - Especificação e backlog

Objetivo: consolidar a interface completa do projeto em três frentes visuais: Admin, Agent e Extensão. O foco desta sprint é dar aparência final, consistência, navegação clara e estados bem resolvidos antes de aumentar o escopo funcional.

Status atual
- Admin: Dashboard, Users e MachineDetail já estão conectados à API e com base visual inicial.
- Admin: sessões por máquina já foram adicionadas no detalhe da máquina.
- Base compartilhada: `theme` e `Card` já existem como início do design system.
- Agent: ainda precisa de polimento visual e mensagens mais claras na tela de login/lock.
- Extensão: ainda precisa de uma UI administrativa clara para blocked-sites.

Spec do front por superfície
- Admin Dashboard
	- Cards com status legível, hierarquia visual clara e números consolidados.
	- Ações rápidas por máquina: abrir VNC, bloquear, encerrar sessão, atualizar estado.
	- Espaçamento responsivo e leitura confortável em telas pequenas.
	- Estados vazios, loading e erro padronizados.
- Admin Users
	- Tabela responsiva com busca, filtros por turma e ações por usuário.
	- Fluxo de criar/editar/resetar senha com feedback visual consistente.
	- Preparado para importação CSV/XLSX na próxima etapa funcional.
- Admin Machine / Sessions
	- Detalhe da máquina com sessão atual e histórico de sessões.
	- Encerrar sessão direto da UI quando estiver ativa.
	- Exibir informações operacionais sem poluir a leitura.
- Agent UI
	- Tela de login fullscreen com branding da escola.
	- Mensagens explícitas para laboratório fechado, usuário suspenso e senha inválida.
	- Fluxo simples de fallback e erro para operador local.
- Extensão Chrome
	- Interface para listar sites bloqueados.
	- Ações de adicionar, remover e importar em massa.
	- Layout simples para manutenção rápida pelo professor.

Design system mínimo
- `theme` com direção Matrix: fundo quase preto, verde neon, bordas sutis e alto contraste.
- `Card` para blocos de informação.
- `Button` para ações primárias/secundárias.
- `Layout` para padronizar cabeçalho, conteúdo e áreas de navegação.
- Estados reutilizáveis: loading, empty state e error state.

Direção visual
- O admin segue um visual Matrix / terminal hacker limpo, sem poluição visual.
- Navegação destacada com estado ativo visível.
- Painéis escuros, brilho verde discreto e leitura rápida para uso em sala de aula.

Backlog da sprint
1. Consolidar design system mínimo com `Button`, `Input` e `Layout`.
2. Refatorar Dashboard para ações rápidas e melhor densidade visual.
3. Finalizar Users com busca, filtros e formulário visual básico.
4. Expandir Sessions com histórico e ações mais claras.
5. Polir Agent UI com estados de login e mensagens de bloqueio.
6. Criar UI da extensão para blocked-sites.
7. Revisar responsividade, contraste e acessibilidade.

Regras de execução
- Não aumentar escopo funcional antes de fechar a apresentação visual.
- Preferir mudanças pequenas e incrementais.
- Reusar os mesmos padrões de layout entre Admin, Agent e Extensão.

Próximo passo imediato
- Criar os componentes básicos que faltam no design system, começando por `Button`, `Input` e `Layout`, e depois aplicar no Admin.