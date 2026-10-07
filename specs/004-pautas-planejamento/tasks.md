# Tasks: Pautas no Planejamento
**Input**: [spec](spec.md), [plano](plan.md), pesquisa, modelo e contrato desta pasta.
**Tests**: TDD obrigatório; cinco camadas Windows, somente sintético/TEMP. 15 tarefas.

## Phase 1: Setup
- [x] T001 Fixar spec, plano, contrato e responsabilidades em `specs/004-pautas-planejamento/`; conferir documentação atual via Context7.

## Phase 2: Foundational
- [x] T002 Criar fixture `tests/pautas-fixtures.cjs` e RED de opcionais/hashes/coluna em `tests/pautas.test.cjs` (ID opaco, semana inteira 1–4, data segunda-feira ordinal do mês).
- [x] T003 Implementar captura/coleta opcional em `src/captura.cjs` e `src/coleta.cjs`; preservar seis mínimos, quatro combinações Meses/Pautas e hashes legados.
- [x] T004 Implementar triagem/avisos/índice seguro em `src/triagem.cjs`, `src/projecao.cjs` e helper puro se necessário; testar duplicatas ID/marca+início, tipos, datas e redação em `tests/pautas.test.cjs`.

## Phase 3: US1 — Mês e semana
Aceite independente: quatro pautas, autor, link/foco e fallback sem pauta.
- [x] T005 [P] [US1] Escrever e observar RED para card/navegação/sem peças/fallback em `tests/pautas-interface.test.cjs`.
- [x] T006 [US1] Implementar linhas e destino semanal em `src/web/app.js` e tokens/layout em `src/web/styles.css`; confirmar GREEN 1440/390.

## Phase 4: US2 — Origem
Aceite independente: calendário/lista/gaveta, duas semanas no dia e órfão.
- [x] T007 [US2] Testar e resolver pauta_id em `tests/pautas.test.cjs` e `src/projecao.cjs`; exigir mesma marca/início, sem inferência.
- [x] T008 [US2] Testar e apresentar origens únicas em `tests/pautas-interface.test.cjs`, `src/web/app.js` e `src/web/styles.css`.

## Phase 5: US3 — Planilha e compatibilidade
Aceite independente: importação/POST/GET sem rede, tabela opcional e falhas preservando vigente.
- [x] T009 [US3] Testar persistência, no-op, CLI/arquivo, POST/GET e privacidade em `tests/pautas.test.cjs`; integrar correções necessárias nos módulos donos.
- [x] T010 [US3] Testar/renderizar Pautas, coluna opcional e teclado/releitura em `tests/pautas-interface.test.cjs` e `src/web/app.js`.

## Phase 6: Polish & Cross-Cutting
- [x] T011 Gerar e inspecionar 12 ou mais imagens com `scripts/screenshots-pautas.cjs`, coberto por `tests/screenshots-pautas.test.cjs`; galeria `docs/design/screenshots/pautas-*.png` nos dois temas e tamanhos.
- [x] T012 Conferir regressão/contraste/segurança e revisão independente do diff; registrar ajustes e resultados em `specs/004-pautas-planejamento/validacao.md`.
- [x] T013 Executar `node tools/quality-gate.mjs` Windows sem pulos/baseline alterada; guardar evidência sanitizada em `docs/reports/004-local-gate.json`.
- [x] T014 Executar doc-sync-onboarding e atualizar `README.md`, `ROADMAP.md`, `AGENTS.md`, `docs/index.md`, `docs/architecture.md`, módulos e estado desta feature.
- [ ] T015 Commit com noreply autorizado, push e abrir único PR em Browsher/crm-social; conferir gate estrito/review do head e entregar link/review/screenshots em `validacao.md`, sem merge.

## Dependencies & Execution Order
T001 → T002 → T003 → T004; T005 em paralelo após fixture/interface definida. T006 depois do RED e API. T007 depende T004; T008 após T006/T007. T009 após backend; T010 após UI. T011 após integrações; T012–T015 sequenciais. Correções reabrem testes/gate afetados.

## Parallel execution
Backend T002–T004/T007/T009 e UI T005–T006/T008/T010 têm arquivos exclusivos e interface no plano. Coordenador integra evidências/documentação; nenhum agente edita arquivo alheio. Status de tarefa não é aceite operacional.

## Implementation Strategy
Entregar card primeiro, origem depois e conferência de Planilha/compatibilidade por fim; testar cada fatia antes da galeria/gate. Hooks opcionais de autocommit desativados pela configuração; commits explícitos somente dos arquivos desta entrega.
