# CRM Social

CRM de conteúdo para uso somente neste computador. NTV é a primeira marca. O desenho aprovado é a base visual; Sheets e Drive continuam sendo as fontes operacionais.

**Estado em 02/10/2026:** estrutura oficial GitHub Spec Kit 1.0.13 inicializada, constituição escrita e primeira feature especificada e planejada. O aplicativo funcional ainda não foi implementado. Nenhum agente editorial, agendamento ou workflow foi alterado nesta preparação.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge; geração de testes pelo rótulo `gerar-testes`.

## Onde começar

- [Roadmap de cinco features](ROADMAP.md)
- [Feature 001: consulta da produção](specs/001-consulta-local-producao/spec.md)
- [Plano de implementação](specs/001-consulta-local-producao/plan.md)
- [Tarefas da primeira feature](specs/001-consulta-local-producao/tasks.md)
- [Constituição](.specify/memory/constitution.md) e [instruções de desenvolvimento](AGENTS.md)
- [Desenho aprovado](docs/design/desenho.md) e [prévia visual](docs/design/prototype/index.html)
- [Recibo da preparação](docs/PREPARACAO-2026-10-02.md)

## Como vamos construir

Spec Kit mantém requisitos, plano e tarefas de cada feature. Superpowers apoia a implementação em partes, testes e revisão. Primeiro entregamos consulta do calendário e conteúdos reais; depois planejamento mensal, pedidos de ajuste, biblioteca e acompanhamento dos agentes.

A primeira versão lê uma captura oficial preparada pela Central. Sua data de atualização fica visível: não há sincronização contínua nem sessão Google no navegador do CRM. A feature de planejamento mensal tratará a meta de uma imagem, um carrossel e um vídeo semanais, preservando as peças históricas existentes.

**Próxima entrega:** implementar e demonstrar a feature 001. Ainda não há comando para iniciar um CRM operacional. O [roteiro de verificação](specs/001-consulta-local-producao/quickstart.md) distingue comandos documentais já disponíveis de comandos futuros da aplicação.
