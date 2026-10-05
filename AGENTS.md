# Instruções de desenvolvimento — CRM Social

Como um álbum de fotografias da operação, o CRM consulta capturas locais; estas regras orientam quem mantém esse leitor. Consulte a [arquitetura](docs/architecture.md) e o [índice documental](docs/index.md) para entrar nos módulos implementados.

Quando este repositório estiver dentro do workspace Social Midia, ../AGENTS.md também se aplica; fora dele, ignore esta referência. Ler [README](README.md), [ROADMAP](ROADMAP.md), [constituição](.specify/memory/constitution.md) e apenas os arquivos da feature ativa. `.specify/feature.json` é ponteiro local, não versionado; no checkout remoto, identificar a feature pela branch e sua pasta em specs/. A [002](specs/002-consulta-planilhas/spec.md) está implementada localmente; [emenda](specs/002-consulta-planilhas/constitution-proposal.md) aplicada (1.1.0); implementada localmente; conta/demonstração reais pendentes, aceite em [validacao.md](specs/002-consulta-planilhas/validacao.md).

## Estado e fronteiras

A [003](specs/003-planejamento-mensal/spec.md) foi reescopada pelo autor e implementada/testada localmente em 05/10/2026: somente consulta da aba opcional Meses, com quatro mínimos, sem fluxo de agentes/repasse/meta semanal no CRM. [Plano](specs/003-planejamento-mensal/plan.md), [tarefas](specs/003-planejamento-mensal/tasks.md) e [validação](specs/003-planejamento-mensal/validacao.md) registram implementação e limites. O autor autorizou implementação, push e PR; T021/aceite da 002 bloqueia somente o merge. T002/criar-preencher Meses e T015/demonstração real permanecem pendentes, sem bloquear fixtures sintéticas. O [contrato da 003](specs/003-planejamento-mensal/contracts/meses.md) estende o v1 sem migrar capturas antigas.

Gate local da 003 em Node 24.19.0: 312 PASS sem pulos, cobertura 98,3660%, drop 0, complexidade PASS com 17 avisos; baseline não atualizada. Semgrep SKIP por ausência no Windows e audit N/A sem dependências de aplicação. [Relatório](docs/reports/003-local-gate.json); gate Linux e review publicado conferidos no PR #15, com evidências na validação da 003. Isso não comprova integração real de Meses.

001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). 001 entregue; implementação da 002 em aceite; resultados e limitações na [validação](specs/001-consulta-local-producao/validacao.md). A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão pendente na validação. A consulta mostra Planejamento, frescor/releitura local, gaveta compacta do dia, quadro de Produção por semana e Planilha com seis tabelas/Histórico. A gaveta resume avisos e documentos semanais sem perder detalhes da API; seu link abre os avisos da peça na Planilha, sem filtrar as seis tabelas NTV. Menu, selo e Todos os avisos restauram avisos gerais. A projeção copia somente os 66 mínimos triados para as tabelas; mantém a normalização preexistente null→string vazia, exceto etapa_producao. Campos dedicados de URL suprimem usuário/senha ou URL malformada não vazia na projeção; células dedicadas recusadas pela allowlist da interface mostram link não permitido. Texto livre redige só o pedaço HTTP(S) credenciado separado por espaços em branco, preservando frase/espaços; limites no contrato. Não apresentar fixture como operação real nem instalar agente editorial por consequência da consulta. `CRM de referência local, caminho configurado fora do repositório` permanece apenas em leitura.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e escala sintética estão verificados localmente; evidências na [validação](specs/001-consulta-local-producao/validacao.md). A UI fica fora do LCOV e há SKIP explícito de UI/PowerShell no Linux (pendência M8); CLI continua coberta. O aceite local exige as cinco camadas sem pulos. Demonstração privada e onboarding final concluídos; resultados e limitações somente na validação.

O projeto roda somente neste computador. Sem deploy, novas agendas, geração, publicação, escrita operacional ou mudanças em n8n por consequência de implementar consulta. A Central permanece responsável pelas operações editoriais remotas. Dados coletados ficam em `data/`, ignorados por Git e Graphify, nunca em fixtures ou saída pública.

## Spec Kit e Superpowers

Usar as skills locais `.agents/skills/speckit-*` e scripts PowerShell oficiais. `spec.md` define requisitos; `plan.md` define solução e interfaces; `tasks.md` organiza execução. Não criar uma especificação paralela para a mesma feature em outra pasta.

Aplicar Superpowers sobre esses documentos: esclarecer decisões novas, implementar em tarefas delimitadas, escrever os testes de comportamento solicitados, fazer revisão independente e verificar antes de declarar conclusão. O desenho amplo já foi aprovado; preserve decisões autorizadas e peça esclarecimento apenas sobre lacunas reais. Não criar fases de aprovação adicional sem necessidade.

Antes de delegar, definir arquivos exclusivos, entrada, interface e aceite. Avisar que outros agentes trabalham no workspace; preservar edições alheias. Coordenador integra arquivos compartilhados e atualiza documentação. Use subagentes da execução, não novos chats ou automações.

## Fonte de dados e testes

Captura manual da Central permanece disponível. A 002 lê seis abas por conta de serviço própria do servidor, readonly, após POST local; a 003 inclui Meses opcional quando existe. GET nunca consulta Google. Ler cabeçalhos reais, preservar IDs e versões, rejeitar captura incompleta sem substituir a anterior. Consulta não herda os filtros de elegibilidade da fila n8n. GET/releitura e `sem_alteracao` preservam captura, horário e falha ativa; só uma nova captura completa aceita encerra a falha. Recibos confirmados têm estrutura/tipos e data ISO real com fuso validados na leitura; corrupção recusa a consulta sem escrever. Triagem compartilhada valida identidades/vínculos NTV terminados em `_id` antes de no-op, gravação ou promoção; falha localizada preserva a captura vigente sem ecoar valor. Consulta mantém a guarda contra bytes antigos/corrompidos, sem fundir chaves. Sem versão vigente válida, o quadro não afirma ausência categórica de mídia vigente.

O contrato está em [captura-e-consulta.md](specs/001-consulta-local-producao/contracts/captura-e-consulta.md). O [quickstart](specs/001-consulta-local-producao/quickstart.md) distingue comandos reais de importação/servidor/testes das etapas futuras. As suítes de Node/HTTP/Playwright usam somente TEMP; fixtures são sintéticas e não disparam a fila nem escrevem no Google. A interface usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`; sem `CI=true`, ferramenta ausente falha. Não tratar um resultado Linux anterior como validação de novo head ou da interface. A constituição 1.1.0 autoriza leitura pela 002; CRM_GOOGLE_CREDENTIALS_FILE e CRM_SPREADSHEET_ID são privados no servidor. JWT RS256/fetch nativos, token só em memória; sem dependência de aplicação.

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
