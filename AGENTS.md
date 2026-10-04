# Instruções de desenvolvimento — CRM Social

Como um álbum de fotografias da operação, o CRM consulta capturas locais; estas regras orientam quem mantém esse leitor. Consulte a [arquitetura](docs/architecture.md) e o [índice documental](docs/index.md) para entrar nos módulos implementados.

Quando este repositório estiver dentro do workspace Social Midia, ../AGENTS.md também se aplica; fora dele, ignore esta referência. Ler [README](README.md), [ROADMAP](ROADMAP.md), [constituição](.specify/memory/constitution.md) e apenas os arquivos da feature ativa. `.specify/feature.json` é ponteiro local, não versionado; no checkout remoto, identificar a feature pela branch e `specs/001-consulta-local-producao`.

## Estado e fronteiras

T001–T030/fundação, US1, US2, US3 e US4 implementadas; revisão corrente e evidências na [validação](specs/001-consulta-local-producao/validacao.md), com 11 tarefas e captura operacional ainda pendentes. A consulta mostra Planejamento, frescor/releitura local e gaveta compacta do dia; quadro de Produção por semana implementado; seis tabelas/Histórico e iniciador continuam futuros. A gaveta resume avisos e documentos semanais sem perder detalhes da API; os campos de URL dedicados suprimem usuário/senha ou URL malformada não vazia na projeção; URL recusada nunca vira texto bruto na tela. Texto livre redige só o pedaço HTTP(S) credenciado separado por espaços em branco, preservando frase/espaços; limites no contrato. Não apresentar fixture como operação real nem instalar agente editorial por consequência da consulta. `CRM de referência local, caminho configurado fora do repositório` permanece apenas em leitura.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1, US2, US3 e US4 estão implementadas; a abertura do PR da US4 e as pendências estão na [validação](specs/001-consulta-local-producao/validacao.md). A interface tem SKIP explícito no CI e fica fora do LCOV (pendência M8); o aceite local exige executá-la. Captura operacional continua pendente.

O projeto roda somente neste computador. Sem deploy, novas agendas, geração, publicação, escrita operacional ou mudanças em n8n por consequência de implementar consulta. A Central permanece responsável pelas operações editoriais remotas. Dados coletados ficam em `data/`, ignorados por Git e Graphify, nunca em fixtures ou saída pública.

## Spec Kit e Superpowers

Usar as skills locais `.agents/skills/speckit-*` e scripts PowerShell oficiais. `spec.md` define requisitos; `plan.md` define solução e interfaces; `tasks.md` organiza execução. Não criar uma especificação paralela para a mesma feature em outra pasta.

Aplicar Superpowers sobre esses documentos: esclarecer decisões novas, implementar em tarefas delimitadas, escrever os testes de comportamento solicitados, fazer revisão independente e verificar antes de declarar conclusão. O desenho amplo já foi aprovado; preserve decisões autorizadas e peça esclarecimento apenas sobre lacunas reais. Não criar fases de aprovação adicional sem necessidade.

Antes de delegar, definir arquivos exclusivos, entrada, interface e aceite. Avisar que outros agentes trabalham no workspace; preservar edições alheias. Coordenador integra arquivos compartilhados e atualiza documentação. Use subagentes da execução, não novos chats ou automações.

## Fonte de dados e testes

Captura manual pelo conector autenticado da Central; o runtime Node não possui esse acesso automaticamente. Ler cabeçalhos reais, preservar IDs e versões, rejeitar captura incompleta sem substituir a anterior. Consulta não herda os filtros de elegibilidade da fila n8n. GET/releitura e `sem_alteracao` preservam captura, horário e falha ativa; só uma nova captura completa aceita encerra a falha.

O contrato está em [captura-e-consulta.md](specs/001-consulta-local-producao/contracts/captura-e-consulta.md). O [quickstart](specs/001-consulta-local-producao/quickstart.md) distingue comandos reais de importação/servidor/testes das etapas futuras. As sete suítes existentes usam somente TEMP; fixtures são sintéticas e não disparam a fila nem escrevem no Google. A interface usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`; sem `CI=true`, ferramenta ausente falha. Não concluir toda a 001 com este recorte nem tratar o primeiro resultado Linux como validação das correções posteriores ou da interface.

Context7 continua obrigatório para dúvidas de biblioteca/API conforme o AGENTS pai. Não adicionar framework ou dependência para uma mudança simples. Node e Playwright existentes foram escolhidos no plano.

## Documentação

Atualizar README/roadmap/status de feature na mesma entrega. Diferenciar planejado, implementado, testado e integrado. Mudança de escopo ou arquitetura também atualiza PRD/AGENTS pai e o mapa Graphify conforme suas instruções. Preservar templates e skills oficiais; customizar os documentos do projeto, não falsificar a origem do scaffold.

<!-- meu-setup:begin v1 -->
## Fluxo de desenvolvimento (node-kit)

Regras obrigatórias para qualquer agente (Claude Code ou Codex). Instruções mais específicas deste arquivo, fora deste bloco, prevalecem.

1. **SDD:** feature nova passa por `speckit-specify` → `speckit-clarify` (se houver dúvida) → `speckit-plan` → `speckit-tasks` → `speckit-implement`. Bug pequeno ou ajuste trivial dispensa. A spec traz visão do usuário, metas, trade-offs explícitos, critérios de sucesso mensuráveis, casos de borda e modos de falha; nada de decisão sem justificativa nem texto vago. Antes da primeira feature, o projeto precisa ter `.claude/rules/project-structure.md`, gerado pela skill `doc-init`.
2. **TDD:** Red → Green → Refactor, pela skill `tdd-workflow`. Escreva o teste antes do código, com `node:test` e `node:assert/strict`, nas camadas:
   - regras de dados e validação (funções puras);
   - persistência e I/O (arquivos e diretórios temporários reais);
   - serviços e projeções;
   - servidor HTTP (rotas, métodos, status e segurança), com o servidor real numa porta efêmera;
   - interface (Playwright), só no computador.

   Só conclua a feature com todas as camadas verdes.
3. **Quality gate:** como penúltima etapa, rode `node tools/quality-gate.mjs`. Só conclua se passar; se não passar, diga o que falhou.
4. **Documentação:** como última etapa de qualquer alteração de código, rode o agente `doc-sync-onboarding`.
5. **Modelos:** decisões, specs e código de produção com o modelo mais forte disponível; testes com `sonnet`; commits, changelog e textos com `haiku`. Effort `High` ou `X-High`. Na dúvida, suba um nível.
6. **Contexto:** use o MCP Context7 para documentação de bibliotecas. Leia só os arquivos da tarefa; não leia `node_modules/`, `tools/node_modules/`, `data/` nem artefatos gerados. Perto de 80% da janela de contexto (`/context` mostra o uso), troque de chat.

No Codex, quando uma regra pedir um agente (doc-sync-onboarding, test-writer, reviewer, security-auditor), leia .claude/agents/<nome>.md e siga as instruções dele.
<!-- meu-setup:end -->
