# Tasks: 006 — Layout v3

**Input**: documentos de specs/006-layout-v3/.
**Prerequisites**: spec.md, plan.md, research.md, data-model.md e contracts/apresentacao.md.
**Tests**: solicitados pelo autor e pelas regras locais; RED → GREEN antes de cada comportamento.
**Organization**: por jornada, com responsabilidades/arquivos delimitados.
**Estado**: 32 tarefas mantidas; Parte A T001–T016 implementadas/testadas localmente, não integradas; Parte B não iniciada e aguardando ok explícito na A.

## Format: ID, P, Story, description

## Recortes autorizados — prevalecem sobre o planejamento inicial

32 IDs mantidos. A = T001–T016; B = T017–T023. T024–T032 são fechamento/regressões compartilhados, executados por recorte e registrados abaixo; checkbox global só fecha após B. A preserva Planilha, não cria Publicar/perfil/modal/botão Instagram e gera 12 screenshots Semana/Mês/Produção. B depende do ok explícito do autor na A e tem seu PR próprio. Sem merge em ambas. A parada inicial foi resolvida por esta autorização de duas partes; preservar a contagem e os limites de cada recorte.

| Item compartilhado | Parte A | Parte B |
| --- | --- | --- |
| T024 Regressões gerais | executadas; menu/dias/escala migrados e verdes | não iniciada |
| T025 Regressões das features | executadas; vínculos/versões/pacote/galeria preservados; isolamento final 103 PASS/0 SKIP | não iniciada |
| T026 Acessibilidade/temas | executadas no recorte A, 1440/390, claro/escuro, teclado/contraste/overflow | não iniciada |
| T027 Gerador/evidência | implementado/testado, incluído no gate final | não iniciada |
| T028 Screenshots | 12 PNG finais gerados e inspecionados em 08/10 às 16:17 | não iniciada |
| T029 Review | pendente | não iniciada |
| T030 Gate | final Windows PASS: 654 testes, 95,4072%, 634 métricas/máximo 16/19 avisos, exit 0; baseline preservada; Semgrep SKIP/audit N/A | não iniciada |
| T031 Documentação | doc-sync-onboarding executado; fontes e pendências na validação | não iniciada |
| T032 PR/CI | commit/push/PR e CI/review por head pendentes; sem merge | não iniciada |

[P] somente para arquivos exclusivos sem dependência entre tarefas. Fonte usa src/, testes tests/ e evidências docs/. Código compartilhado app.js/index.html/styles.css tem um único responsável e integração sequencial; preservar edições de outros agentes. Eventual delegação exige entrada, interface e aceite da tarefa.

## Phase 1: Setup

**Purpose**: cenário reproduzível sem operação real.

- [X] T001 Criar tests/layout-fixtures.cjs a partir de tests/previas-fixtures.cjs/tests/pautas-fixtures.cjs: semana com oferta sintética, carrossel de cinco páginas, Reels travado, próxima com quatro peças em dias variados, vazia futura, passada publicada, sem data/sem semana e revisões vigentes/históricas; relógio fixo, PNG 1080×1350 e transporte falso somente TEMP. FR-028; SC-002/003.

## Phase 2: Foundational

**Purpose**: compartilhar estado/seleção de mídia e desacoplar Planilha antes de mudar as telas.
**Checkpoint**: três telas/topo sem dados operacionais novos; testes base verdes.

- [X] T002 [P] Escrever e executar RED em tests/layout-model.test.cjs para mapa de cinco estados, precedência, correção vigente/histórica, mídia apenas em Mídia, progresso X/N, datas/grupos/órfãs e seleção de imagens da 005 sem mutação. Fila e perfil ficam em T017/T021 da Parte B. FR-003/008/010/013/014/026; SC-002/003.
- [X] T003 Implementar src/web/layout-model.js com as funções puras testadas em T002, exportação navegador/CommonJS e seleção de imagens extraída sem alterar vigência/vínculos; não modificar src/projecao.cjs, config/quadro-etapas.json ou dados consultados. FR-003/008/013/014/018/020/026; SC-003.
- [X] T004 [P] Escrever e executar RED em tests/layout-http.test.cjs com arquivos reais TEMP, bytes/hashes de captura/recibos antes/depois de GET e serviço de atualização falso; novos estáticos devem ter GET/HEAD, MIME, CSP, Host/métodos protegidos; API completa incluindo planilha/avisos/histórico permanece igual. FR-002/003/026; SC-006.
- [X] T005 Ampliar somente a allowlist estática em src/servidor.cjs para layout-model.js e preparar seu script em src/web/index.html; sem endpoint de dados. perfil-config.js/instagram.js e sua configuração/rotas serão criados em T019 da Parte B. Depende de T003/T004; FR-003/026; SC-006.
- [X] T006 [P] Escrever e executar RED do menu/topo em tests/layout-interface.test.cjs: menu intermediário Planejamento/Produção/Planilha, ausência de Publicar/Ver no Instagram, ⟳ Atualizar único no topo em todas as telas, POST único/falha/no-op e objetivo preservado via view.planilha. FR-002/003/005/024; SC-001/006.
- [X] T007 Refazer topo em src/web/index.html/src/web/app.js/src/web/styles.css, realocando ⟳ Atualizar/feedback para o topo comum e mantendo Planilha/avisos/atalhos funcionais; preservar API inteira. Remoção de Planilha e menu final ficam em T022 da B. Depende de T005/T006; FR-002/003/024; SC-001.

## Phase 3: User Story 1 — Planejamento (P1, primeiro incremento)

**Goal**: localizar objetivo/pautas e peças pela semana/mês, com gaveta do dia.
**Independent Test**: abrir Planejamento, expandir/recolher objetivo, navegar pauta/período e abrir duas peças no mesmo dia com todas preservadas, nos dois tamanhos.

### Tests — RED antes da implementação

- [X] T008 [US1] Escrever e executar RED em tests/layout-interface.test.cjs para objetivo em linha única, painel recolhido sem espaço, ausência/duplicata/fallback de Meses, pauta sem peças, Semana padrão com sete colunas, hoje, quantidades/dias variados e gaveta do dia inteiro. FR-004/005/006/007/008/010; SC-001/002.
- [X] T009 [US1] Escrever e executar RED em tests/layout-interface.test.cjs para Mês com pontos/nomes acessíveis, altura disponível, ativação de qualquer semana por teclado, cruzamento de mês/ano, Sem data/órfãs e ausência de requisições de mídia em Mês/telas ocultas. FR-006/009/010/026; SC-001/002.

### Implementation — GREEN

- [X] T010 [US1] Implementar objetivo recolhível e navegação Semana/Mês/pauta em src/web/app.js/src/web/index.html/src/web/styles.css, com aria-expanded/hidden, mês civil selecionado e fallback contratual sem inventar S1/modelo; manter objetivo consultando view.planilha. FR-004/005/006; SC-001.
- [X] T011 [US1] Implementar Semana em src/web/app.js/src/web/styles.css: sete colunas, navegação anterior/próxima, destaque de hoje, tema/pauta confirmados, progresso sem meta fixa e acesso à gaveta do dia, mantendo remarcadas e Sem data. FR-007/008/010; SC-001/002/003.
- [X] T012 [US1] Implementar Mês em src/web/app.js/src/web/styles.css, usando altura disponível, pontos por estado/motivo, nome acessível e acionador de semana para a mesma seleção da visão Semana; sem imagens no Mês. FR-006/009/026; SC-001/002.
- [X] T013 [US1] Integrar miniaturas de peças visíveis com a seleção da 005 em src/web/app.js e adaptar a gaveta: preservar dia inteiro, conteúdo/unidades/versões, retirar metadados de agentes e links técnicos; falha individual mantém posição/texto. FR-007/010/024/026; SC-002/006.

## Phase 4: User Story 2 — Produção por semana (P1)

**Goal**: acompanhar projetos reais, passos e travamentos.
**Independent Test**: semanas atual/próxima/passada/vazia e órfãs, com estados conflitantes e correção vigente/histórica.

### Tests

- [X] T014 [US2] Escrever e executar RED em tests/layout-interface.test.cjs para agrupamento/ordem atual-próxima-demais, tema/pauta, progresso, cinco passos e motivo substituindo indicador; mídia em outra etapa não trava, publicada/liberada prevalece e vazia futura só mostra a frase autorizada. FR-008/011/012/013/014/015/024; SC-002/003.

### Implementation

- [X] T015 [US2] Implementar blocos de projetos em src/web/app.js/src/web/styles.css por semanaId, atual primeiro/próxima depois, demais acessíveis e órfãs identificadas; usar derivados sem mutação, tema/pauta/progresso e Planejamento na sexta-feira no corpo futuro vazio. FR-008/011/015; SC-002/003.
- [X] T016 [US2] Implementar linhas em src/web/app.js/src/web/styles.css com miniatura, título, formato/data e passos com aria-current ou motivo curto; ativação abre gaveta. Nenhum botão Ver no Instagram na A; T020 integra-o na B. FR-012/013/014/024/026; SC-001/003.

## Phase 5: User Story 3 — Prévia Instagram (P1, compartilhada)

**Goal**: conferir imagem/carrossel como post em formato de celular.
**Independent Test**: usar diretamente uma peça sintética de imagem única e uma de cinco páginas, independentemente de Publicar.

### Tests

- [ ] T017 [US3] Parte B: testes RED em tests/instagram-interface.test.cjs de imagem única 1/1/carrossel 1/5, ordem/vigência, perfil de configuração e fallback inválido, 4:5 contain, setas/pontos/teclado, legenda/hashtags; página sem arquivo ou bytes mantém seu slot “prévia indisponível” e entra no contador total; sem contato externo. FR-016/017/018/019/026; SC-003/004/006.
- [ ] T018 [US3] Parte B: testes RED em tests/instagram-interface.test.cjs para modal/foco/Esc, gaveta preservada, arrasto horizontal ≥40 px versus vertical, limites sem wrap e viewport baixa; Atualizar mantém aberta mesma peça com versão nova e índice limitado ao total novo; peça removida fecha/devolve foco; falha conserva versão anterior. FR-018/019/025; SC-004.

### Implementation

- [ ] T019 [US3] Parte B: implementar src/web/instagram.js, src/web/perfil-config.js, estáticos em src/servidor.cjs e estilos; dialog/perfil/4:5/texto/setas/pontos/contador preservam slots indisponíveis; carregar posição atual local, validar perfil e guardas HTTP em tests/layout-http.test.cjs. FR-016/017/018/019/026; SC-004/006.
- [ ] T020 [US3] Implementar teclado/arrasto/fechamento/foco em src/web/instagram.js e integrar acionador da Produção em src/web/app.js; disponibilizar a mesma abertura para Publicar, sem duplicar lógica ou fechar a gaveta. FR-016/018/019/025; SC-001/004.

## Phase 6: User Story 4 — Publicar (P1)

**Goal**: fila pronta para publicação manual com ações locais/links e acompanhamento lateral.
**Independent Test**: fila inclui liberadas sem publicação, hoje/sem data, pacote exato/ambíguo, cópia e publicadas/travadas, sem depender de filtros de Planejamento.

### Tests

- [ ] T021 [US4] Escrever e executar RED em tests/layout-interface.test.cjs para fila literal/ordem/hoje/contador, liberação versus publicação, dez publicadas recentes com datas inválidas ao final, travadas, clipboard vazio/falha, link de pacote exato/ambíguo/URL recusada e abertura do modal. FR-020/021/022/023/026; SC-001/003/004/006.

### Implementation

- [ ] T022 [US4] Parte B: remover Planilha visual/renderizadores/atalhos em src/web/app.js/src/web/index.html, manter dados na API, implementar menu final e fila/contador de Publicar em src/web/app.js/src/web/styles.css, por data/hoje/miniatura/textos. FR-001/020/021/023/024/026; SC-001/003.
- [ ] T023 [US4] Integrar em src/web/app.js as ações de cópia/pacote já existentes e o modal compartilhado, além das seções Publicadas recentes/Travadas; 390 px coloca as laterais após a fila e não cria ação editorial. FR-016/021/022/024/025; SC-001/003/004/006.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: compatibilidade com as regras preservadas, prova visual e entrega.

- [ ] T024 Adaptar tests/interface.test.cjs, tests/atualizacao-interface.test.cjs e tests/tema.test.cjs aos contratos deliberadamente substituídos (Planilha visual/quadro antigo/topo), preservando cenários de falha, no-op, segurança, cinco camadas, preferência/contraste e retorno de foco; não apagar cobertura de API. Atualizar seletores de scripts/screenshots-tema.cjs quando necessários ao gate. FR-001/002/003/025; SC-001/006.
- [ ] T025 Adaptar tests/pautas-interface.test.cjs, tests/pronta-interface.test.cjs, tests/versoes-interface.test.cjs e tests/previas-interface.test.cjs para layout v3, mantendo identidade/vigência/pacote/galeria/falha e substituindo somente expectativas removidas; ajustar scripts/screenshots-pautas.cjs se usado no gate, sem regenerar evidências históricas como prova nova. FR-003/005/010/018/021/026; SC-002/003/006.
- [ ] T026 Validar e ajustar src/web/styles.css, src/web/index.html, src/web/app.js e src/web/instagram.js com tests/layout-interface.test.cjs/tests/instagram-interface.test.cjs: 1440/390, claro/escuro, teclado/foco, contraste 4,5:1 para texto, regiões internas sem overflow da página, conteúdo seguro e ausência de metadados/explicações operacionais. FR-024/025; SC-001/004/006.
- [ ] T027 Criar scripts/screenshots-layout-v3.cjs e tests/screenshots-layout-v3.test.cjs em RED/GREEN, usando exclusivamente tests/layout-fixtures.cjs, TEMP com validação de prefixo, porta efêmera, relógio fixo, bloqueio de rede externa e limpeza restrita; cobrir o script real e sua falha/guardas. FR-028/029; SC-005/006.
- [ ] T028 Gerar e inspecionar evidências por parte: A tem 12 PNG em docs/design/screenshots/layout-v3-parte-a/ (Semana/Mês/Produção × dois temas × 1440/390); B acrescenta Publicar/pop-up e regressões visuais finais. Registrar fonte/limites em docs/design/screenshots/LEIA-ME.md sem dado operacional; screenshots do aplicativo, não do mockup. FR-027/028/029; SC-005.
- [ ] T029 Executar revisão independente dos arquivos src/web/, src/servidor.cjs, tests/layout-*.cjs/tests/instagram-interface.test.cjs e scripts/screenshots-layout-v3.cjs, seguindo .claude/agents/reviewer.md; resolver Critical, segurança e regressões com RED/GREEN e repetir somente verificações afetadas. FR-003/026/029; SC-006/007.
- [ ] T030 Executar quality-gate completo no Windows com Node/Playwright existentes: node tools/quality-gate.mjs, sem pulos locais e baseline preservada; guardar resultados sanitizados/fonte em specs/006-layout-v3/validacao.md. Etapa penúltima de fechamento local, após correções/review. FR-028/029; SC-006/007.
- [ ] T031 Executar doc-sync-onboarding conforme .claude/agents/doc-sync-onboarding.md, como última etapa de alterações de código; sincronizar AGENTS.md, README.md, ROADMAP.md, docs/index.md, docs/architecture.md, docs/modules/web.md, docs/modules/servidor.md, docs/design/telas.md e specs/006-layout-v3/validacao.md somente com o realmente implementado/testado, preservando históricos e referência sanitizada. Confirmar ausência de mapa Graphify antes de decidir sua atualização. FR-003/027/029; SC-006/007.
- [ ] T032 Fechar cada parte separadamente: conferir git diff sem dados privados, commitar com 204295625+Browsher@users.noreply.github.com sem coautoria, push somente Browsher/crm-social e abrir/anexar PR próprio; conferir CI/review no head final e entregar link/review/screenshots sem merge. A usa codex/006-layout-v3; B aguarda ok explícito. Registrar em specs/006-layout-v3/validacao.md. FR-028/029; SC-007.

## Dependencies & Execution Order

- A decisão do autor resolveu a parada inicial: T001–T016 e fechamento correspondente A autorizados. B depende do ok explícito na A; não iniciar testes, código ou PR B.
- T001 → T002 → T003. T004 e T006 podem ter RED em arquivos exclusivos após T001. T005 depende de T003/T004; a rota instagram.js terá conteúdo concluído em T019. T007 depende de T005/T006; verificar apenas shell/estáticos já existentes até então, sem declarar testes finais da rota inexistente como verdes.
- US1: T008/T009 RED → T010–T013 GREEN. US2: T014 RED → T015/T016 GREEN. US3: T017/T018 RED → T019/T020 GREEN. US4: T021 RED → T022/T023 GREEN.
- US2 compartilha miniaturas/gaveta com US1; testar projetos com fixture própria. US3 usa derivados/miniaturas, mas seu teste abre diretamente o componente. US4 usa modal concluído da US3; dependência expressa evita duplicação.
- app.js/index.html/styles.css têm edição sequencial; sem implementação de jornadas em paralelo nesses arquivos.
- T024/T025 → T026 → T027 → T028 → T029 → T030 → T031 → T032. Alteração de código após gate/review exige repetir somente o necessário no head final. Documentação final preserva a fonte do código testado.

## Parallel Examples

- Fundação: T002, T004 e T006 escrevem testes em arquivos diferentes após T001; GREEN/integrador respeita dependências.
- US1: nenhum paralelo de edição, pois testes/implementação compartilham arquivos. Uma conferência somente leitura do contrato pode acompanhar T010–T013.
- US2: reviewer somente leitura pode conferir mapa/progresso enquanto o responsável exclusivo prepara as linhas; sem edição concorrente.
- US3: pesquisa/inspeção de gestos não edita instagram.js/styles.css; T017/T018 são sequenciais no mesmo teste.
- US4: testar cópia/pacote isoladamente não depende da navegação do Planejamento; edição de app.js permanece única.

## Implementation Strategy

Parte A entrega fundação, topo, US1 e US2 sem Instagram. Parte B entrega modal e Publicar após ok explícito do autor na A. O escopo global permanece completo; cada parte tem seu PR e nenhum merge está autorizado.

Executar RED observável antes de código, GREEN mínimo e refatoração preservando os contratos. Fixtures só sintéticas; não instalar ferramenta ou tocar operação real. Não criar testes espelhando markup quando um teste de ação/resultado comprova o comportamento.

## Task count and execution guard

Contagem dos IDs gerados: **32**.

| Grupo | IDs | Quantidade |
| --- | --- | --- |
| Cenário/fundação/topo e invariância | T001–T007 | 7 |
| US1 Planejamento Semana/Mês/gaveta | T008–T013 | 6 |
| US2 Produção por semana | T014–T016 | 3 |
| US3 Pop-up Instagram | T017–T020 | 4 |
| US4 Publicar | T021–T023 | 3 |
| Regressões, acessibilidade, evidências e entrega | T024–T032 | 9 |

**32 tarefas: parada inicial resolvida pelo autor; execução autorizada somente da Parte A**, conforme FR-030/SC-008 e instrução direta do autor. Marcar T001–T016 quando verificadas; registrar o fechamento A de T024–T032 na tabela, mantendo seus checkboxes globais abertos até B. Não compactar suítes ou gestos/foco/mídia para alterar artificialmente a contagem.

O peso principal é a troca de três telas, o modal compartilhado com teclado/gesto/foco e a migração de regressões das 001–005. O autor manteve esse escopo de 32 IDs e autorizou a divisão em duas entregas.
