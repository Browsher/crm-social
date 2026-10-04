# Instruções de desenvolvimento — CRM Social

Como um álbum de fotografias da operação, o CRM consulta capturas locais; estas regras orientam quem mantém esse leitor. Consulte a [arquitetura](docs/architecture.md) e o [índice documental](docs/index.md) para entrar nos módulos implementados.

Quando este repositório estiver dentro do workspace Social Midia, ../AGENTS.md também se aplica; fora dele, ignore esta referência. Ler [README](README.md), [ROADMAP](ROADMAP.md), [constituição](.specify/memory/constitution.md) e apenas os arquivos da feature ativa. `.specify/feature.json` é ponteiro local, não versionado; no checkout remoto, identificar a feature pela branch e `specs/001-consulta-local-producao`.

## Estado e fronteiras

Em 04/10/2026, T001–T022 da feature 001 estão implementadas e testadas localmente: fundação, US1 Planejamento e US2/frescor e releitura local. As 19 tarefas T023–T041 permanecem pendentes. O selo usa quatro estados contratuais pelo fim da captura em São Paulo; Planilha mostra fonte, fim, cobertura, avisos e **Atualizar dados**, que relê somente a API local. Detalhes/acordeões, classificação/quadro, seis tabelas/Histórico e iniciador continuam futuros. Produção ainda mostra a mensagem de próxima entrega. Não há captura operacional validada, acesso real ao Google ou novo agente editorial instalado. Não apresentar protótipo ou fixture como dado real. `CRM de referência local, caminho configurado fora do repositório` é referência em leitura; não alterar esse projeto nem copiar sua infraestrutura por conveniência.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge. O review **0.4.4** foi validado no [PR #2](https://github.com/Browsher/crm-social/pull/2#issuecomment-5974734150), commit `6f88479`, [execução 37162882452](https://github.com/Browsher/crm-social/actions/runs/37162882452). A **0.4.5** foi aceita no [PR #3](https://github.com/Browsher/crm-social/pull/3#issuecomment-5975683038), commit `afd8238` (merge `72efb98`), [execução 37170294491](https://github.com/Browsher/crm-social/actions/runs/37170294491). A **0.4.7** foi aceita no [PR #4](https://github.com/Browsher/crm-social/pull/4#issuecomment-5976055197), commit `c9d1e91` (merge `506d7a7`), [execução 37173190416](https://github.com/Browsher/crm-social/actions/runs/37173190416). A **0.4.8** foi aceita no [PR #5](https://github.com/Browsher/crm-social/pull/5#issuecomment-5976475669), head `bc0b02b` (merge `4f20f20`), [execução 37176292254](https://github.com/Browsher/crm-social/actions/runs/37176292254). Repositório público; ruleset ativo da `main` exige `quality-gate`.

A 0.4.9 está instalada: review com 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. O autor aprovou o aumento porque a execução 37196385840 do PR #6 usou 42 turnos e excedeu 40. A versão foi aceita no [PR #7](https://github.com/Browsher/crm-social/pull/7#issuecomment-5979972293), head `ef9ac93`, merge `7e17e85`: [quality-gate](https://github.com/Browsher/crm-social/actions/runs/37202478722/job/111436807063) e [review](https://github.com/Browsher/crm-social/actions/runs/37202478729/job/111436806960) terminaram SUCCESS. O [PR #8 da US2](https://github.com/Browsher/crm-social/pull/8) teve gate Linux verde (Semgrep real) e review publicado no head `7657d9e`; permanece aberto, sem merge. Evidência e pendências na validação.

O review do [PR #1](https://github.com/Browsher/crm-social/pull/1) precisou de 23 turnos; a 0.4.9 usa limite de 60 turnos e timeout de 20 minutos, dívida de custo/tempo a acompanhar. Retenção por possível segredo e falha foram testadas somente localmente; esses caminhos no Actions e o rótulo `gerar-testes` ainda não foram exercitados. Se `files` vier menor que `changedFiles`, o review recusa a lista incompleta; o teto numérico ainda não foi documentado.

As correções do [PR #6](https://github.com/Browsher/crm-social/pull/6) tiveram CI/review verdes e foram integradas em `19e222a`. O recorte US2 passou localmente: 75 testes, zero falhas/pulos, incluindo 14 casos de interface; gate exit 0, cobertura 96,19% (queda 0) e complexidade PASS com aviso 12 no CLI. Semgrep SKIP por ausência no Windows e audit N/A sem dependências de aplicação. Consultar [validação da entrega](specs/001-consulta-local-producao/validacao.md). Os 14 casos de interface têm SKIP explícito no CI e ficam fora do LCOV; a aplicabilidade dessa fronteira permanece pendência M8. Gate Linux e review da US2 conferidos no PR #8/head `7657d9e`; PR aberto para o autor, sem merge. Captura operacional continua pendente.

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
