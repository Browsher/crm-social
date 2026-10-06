# Tasks: Consulta do planejamento mensal (15 tarefas)

**Input**: [spec](spec.md), [plan](plan.md), [research](research.md), [modelo](data-model.md), [contrato](contracts/meses.md) e [quickstart](quickstart.md).
**Status**: 13/15 concluídas; T002/T015 permanecem pendentes do autor. T021 da 002 foi demonstrada e integrada pelo PR #16; main integrada na branch da 003. Gate/review do novo head precisam ser conferidos antes do merge autorizado. Resultados históricos e evidência desta integração na [validação](validacao.md).
**Tests**: TDD obrigatório, RED observado antes do GREEN, nas cinco camadas. Fakes/fixtures/TEMP; nenhum Google real nos testes. Um dono por arquivo; não desfazer edições alheias. Não instalar dependência ou alterar baseline/tools do gate.

## Fase 1 — Setup e pré-requisito

- [x] T001 Conferir T021 concluída em `specs/002-consulta-planilhas/validacao.md` e registrar em `specs/003-planejamento-mensal/validacao.md` a autorização atual do autor para implementar/publicar PR, registrando o pré-requisito atendido e o merge autorizado sob gate/review vigentes. FR-010.
- [ ] T002 [P] **Autor: criar a aba Meses na planilha com as colunas mínimas e preencher o mês atual**, seguindo `specs/003-planejamento-mensal/quickstart.md#tarefa-do-autor--criarpreencher-meses`: título Meses, cabeçalhos mes/marca_id/objetivo/pautas na linha 1, mes como texto AAAA-MM, marca ntv, objetivo curto e uma pauta por linha dentro da célula; uma linha por mês/marca. Não publicar valores/IDs/chaves. Independente de T001 e não bloqueia T003–T014; somente a demonstração T015 precisa dessa preparação. FR-001/010.

## Fase 2 — Fundamento: captura opcional compatível

**Entrega**: arquivo da Central/legado e captura com Meses usam o mesmo importador, sem migração histórica.
**Teste independente**: fixtures antigas mantêm hashes; opcional presente é validada e preserva linhas repetidas em TEMP.

- [x] T003 RED em `tests/dados.test.cjs`, `tests/snapshot.test.cjs`, `tests/importador.test.cjs`, acrescentando variantes em `tests/fixtures.cjs` sem modificar as antigas: Meses ausente/vazia/presente, quatro mínimos por nome, duplicatas marca/mês aceitas, mesma primeira coluna entre marcas, presença parcial/header/hash inválidos recusados. Fixar hashes legados literais antes da extensão, bytes/horário da vigente na falha, no-op e promoção de mudança só em Meses; observar falha natural dos cenários novos e preservar GREEN dos cenários existentes. FR-001/002/003/006/009; SC-004/006.
- [x] T004 GREEN em `src/captura.cjs`: descriptor opcional separado com mes/marca_id/objetivo/pautas, mantendo CAMPOS e seis obrigatórias; opcional coerente nos três mapas, linhas por índice físico sem unicidade da primeira coluna e hash legado idêntico quando ausente. Incluir Meses inteira na integridade quando presente, sem injetar tabela vazia ou regravar antigas. Reusar `src/snapshot.cjs` e `scripts/importar-captura.cjs`; tocar somente se RED demonstrar necessidade concreta. Validar suítes T003, registrar evidência em `specs/003-planejamento-mensal/validacao.md`. FR-001/002/003/006/009.

## Fase 3 — US1: objetivo e lista curta (P1, MVP por captura local)

**Entrega**: card corresponde ao mês exibido, usando dados triados da captura.
**Teste independente**: captura local sintética basta; não depende da coleta direta US2 nem de T002.

- [x] T005 [US1] RED em `tests/projecao.test.cjs`: tabela opcional com quatro mínimos, somente marca literal ntv, índice físico de duplicatas, mes textual AAAA-MM com mês 01–12; mês inválido e objetivo/pautas não textuais geram aviso sem converter tipos no card. Duplicatas permanecem na tabela/avisos, extras/outra marca não aparecem, redação HTTP(S) credenciado preserva frase; raiz/contagens/semanais antigas iguais. FR-001/004/006/008/009; SC-001/003/004/006.
- [x] T006 [US1] GREEN em `src/triagem.cjs` e `src/projecao.cjs`: selecionar Meses opcional sem Map pela coluna mes, conservar linha física, aplicar redação atual e projetar só quatro mínimos em planilha; avisar duplicatas por marca/mês e dados inválidos com motivos fixos do contrato. Não adicionar propriedade raiz, ID/versão mensal, vínculo com semana ou inferência de objetivo. Validar T005 e regressões existentes. FR-001/004/006/008/009.
- [x] T007 [US1] RED em `tests/interface.test.cjs`: card muda com navegação entre dois meses; ausência/vazio/objetivo vazio; duplicata A confirmar sem pauta arbitrária; LF/CRLF/trim/vazios e 0/5/6/7 pautas → 0/5/5/5 itens, +1 pauta/+2 pautas em .more-topics. Objetivo definido na cor principal, placeholders apagados; objetivo/pauta com +2 literal sem marcador falso; card/avisos concordam nas linhas físicas após outras marcas/vazios. Mesmo mês de outra marca não conflita; HTML permanece texto e não há novo botão/editor/link derivado de célula; 1440/390 px sem corte da página. FR-004/005/006/008/009; SC-001/002/003/005/006.
- [x] T008 [US1] GREEN em `src/web/index.html`, `src/web/app.js` e `src/web/styles.css`: card derivado de Meses em visao.planilha e state.mes, textos via textContent, lista de até cinco e +N pautas/+1 pauta exato; objetivo definido na cor principal e placeholders apagados; zero Ainda não definido, duplicata A confirmar sem objetivo/lista, objetivo vazio com pautas textuais conservadas. Não usar semanas[].objetivoMensal, não ligar semanas ao mês nem alterar calendário/filtros/gaveta/selo. Validar T007. FR-004/005/006/008/009.

## Fase 4 — US2: leitura direta da opcional (P2)

**Entrega**: Atualizar dados inclui Meses se existir, sem erro por ausência estável.
**Teste independente**: cliente falso e HTTP efêmero verificam seis/sete ranges sem UI.

- [x] T009 [P] [US2] RED em `tests/coleta.test.cjs` e `tests/servidor.test.cjs`: metadata inicial/final detecta ausência/presença/criação/remoção de Meses; seis/sete ranges nas duas leituras, mes permanece texto, mudança só na opcional/hashes/tipos/header/range incompleto. POST com cliente falso promove nova Meses e falha conserva capturaId/completedAt/bytes da vigente e recibo de falha conforme 002; GET não chama fetch; auth/guards/configuração continuam. Usar fixtures prontas de T003, sem alterar testes/data de outras tarefas. FR-002/003/008/009; SC-004/006.
- [x] T010 [US2] GREEN em `src/coleta.cjs`: montar ranges a partir de seis obrigatórias e Meses existente, ler o mesmo conjunto duas vezes e comparar hashes/metadados inclusive opcional. Reutilizar getMetadata/batchGet de `src/google.cjs`, POST de `src/servidor.cjs` e promoção existente, sem nova rota/auth/timeout. Ausência estável não solicita range inexistente; opcional desaparecendo/aparecendo recusa como dados, sem retry. Validar T009 e legado. FR-002/003/008/009.

## Fase 5 — US3: Meses e avisos na Planilha (P3)

**Entrega**: tabela opcional e avisos como as outras, sem texto longo no card.
**Teste independente**: fixture local Meses vazia/duplicada/ausente, teclado e 390 px; não exige aba real.

- [x] T011 [US3] RED em `tests/interface.test.cjs` e `tests/atualizacao-interface.test.cjs`: Meses depois de Revisoes/antes de Histórico, quatro colunas/contagem NTV, célula completa de pautas e todas as linhas duplicadas com avisos Aba/Linha/Campo/Motivo; setas/Home/End/foco e rolagem local em 1440/390 px. Seleção se recupera após opcional desaparecer; POST→GET acompanha objetivo novo e falha conserva card/selo/horário anteriores; seis tabelas/Histórico/gaveta preservados. FR-003/005/006/007/008/009; SC-002/003/004/005/006.
- [x] T012 [US3] GREEN em `src/web/app.js`/`src/web/styles.css`: integrar Meses/avisos à renderização existente da Planilha, ordem e fallback da aba selecionada; manter quadro/seis abas/Histórico/atalhos e permitir leitura da célula inteira sem carregar URL/HTML. Reusar fluxo POST→GET da 002 para card novo confirmado e preservação na falha. Validar T011 e suites UI existentes. FR-003/005/006/007/008/009.

## Fase final — Qualidade, documentação e demonstração

- [x] T013 Verificar cinco camadas e suite completa com Node/Playwright existentes, rodar `tools/quality-gate.mjs` sem alterar tools/baseline, conferir gate Linux no PR autorizado e obter review publicado sem Critical/segurança/regressão. Registrar evidências/limites em `specs/003-planejamento-mensal/validacao.md`. Não tratar pulos UI/PowerShell do Linux como validação local. T021 atendida; merge autorizado somente com gate/review vigentes sem bloqueio. FR-002/003/008/009/010; SC-001–SC-006.
- [x] T014 Sincronizar documentação e onboarding pelo perfil `.claude/agents/doc-sync-onboarding.md`, após código/gate: `README.md`, `AGENTS.md`, `ROADMAP.md`, `docs/index.md`, `docs/architecture.md`, módulos captura/coleta/triagem/projecao/web afetados e `specs/003-planejamento-mensal/validacao.md`; conferir design/contrato e estados planejado/implementado/testado/integrado. Fonte operacional continua readonly, sem agentes/meta semanal no CRM. Conferir diff documental final e links; screenshots somente sintéticos quando necessários. FR-001/002/007/008/009/010.
- [ ] T015 **Autor: demonstração privada após T002 e implementação validada**, conforme `specs/003-planejamento-mensal/quickstart.md#demonstração-privada-pendente--t015`: Atualizar dados, conferir card/tabela do mês atual contra a mesma captura e registrar somente resultado/limites sanitizados em `specs/003-planejamento-mensal/validacao.md`, sem duplicata deliberada na planilha real. Não bloqueia testes sintéticos; não inventar conclusão. FR-001/003/004/005/007/008/010.

## Dependencies & Execution Order

T001 (autorização atual registrada; T021 atendida) → T003 → T004 → US1 T005–T008 → US2 T009–T010 → US3 T011–T012 → T013 → T014 → T015. T002 manual pode ocorrer independentemente; somente T015 depende dela.

## Parallel Opportunities

- T002 é preparação manual do autor, independente do código/testes.
- Depois de T004, T009 pode avançar em paralelo com T005/T006 ou T007/T008, pois usa arquivos de testes distintos e fixtures já prontas. Não editar fixtures em paralelo.
- US1/US3 compartilham app.js/interface.test.cjs: executar em sequência. Na US1, projeção deve estar pronta antes da UI. Na US3, observar RED em T011 antes de T012 e conferir GREEN depois; na US2, observar RED em T009 antes de T010.

## Implementation Strategy

MVP primeiro: fundamento + US1 por captura local, depois US2 e US3. RED/GREEN observado e regressões das 001–002; teste que já passa é regressão, não RED inventado. Execução e merge autorizados; T021 atendida, gate/review do head integrado ainda precisam ser conferidos.
