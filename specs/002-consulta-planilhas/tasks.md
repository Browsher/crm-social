---
description: "Tarefas da 002 — coleta direta local somente leitura"
---

# Tasks: 002 Planilhas

**Input:** [spec](spec.md), [plan](plan.md), [research](research.md), [modelo](data-model.md), [contrato](contracts/leitura-planilha.md), [quickstart](quickstart.md).
**Estado:** 52 tarefas planejadas, nenhuma executada. Emenda ainda proposta; não começar implementação nesta rodada.
**Tests:** TDD obrigatório com node:test/node:assert/strict; RED observado antes de GREEN. As cinco camadas usam fixtures/fakes; nenhum teste lê Google real ou data/ do projeto.
**Organization:** fases por história, arquivos relativos à raiz. [P] só para arquivos distintos sem dependência inacabada. Nunca dois responsáveis no mesmo arquivo.

## Fase 1 — Setup (T001–T004)

Propósito: aplicar governança aprovada e preparar dependência/CI sem segredos. T001 é bloqueio do autor; não inferir aprovação do plano.

- [ ] T001 Aguardar ok explícito do autor à constitution-proposal.md; após aceite, aplicar princípio VI/versão 1.1.0 em .specify/memory/constitution.md, conservando I–V e Ratified, usando data real do aceite em Last Amended; registrar autorização em specs/002-consulta-planilhas/validacao.md. Sem ok, parar antes de código. FR-016.
- [ ] T002 Conferir baseline do head, arquitetura e regra .claude/rules/project-structure.md; registrar comandos reais de suíte/gate, ambiente, limitações e protocolo RED/GREEN em specs/002-consulta-planilhas/validacao.md, sem repetir histórico de heads em outros documentos. FR-016, SC-007.
- [ ] T003 Criar package.json privado de aplicação/lock com google-auth-library exatamente 11.1.0, Node >=24 e CommonJS, sem framework; npm ci da raiz e npm audit, sem confundir tools/package-lock.json. Registrar necessidade/resultado em specs/002-consulta-planilhas/validacao.md; não instalar globalmente. FR-002.
- [ ] T004 Preparar .github/workflows/quality-gate.yml para npm ci da aplicação antes da suíte/gate, mantendo restauração do gate da base, strict, SHAs e permissões; conferir actionlint/zizmor e testes em tests/iniciador.test.cjs antes de ajustar Iniciar CRM.ps1 para falha curta quando dependência falta (ASCII, sem chave/ID). Registrar RED do iniciador, GREEN e motivo do ajuste no próprio CI. FR-002, FR-016, SC-007.

## Fase 2 — Fundação (T005–T014)

Bloqueia histórias. Casos puros não precisam da conta real. Pares RED/GREEN abaixo são executados na ordem, sem escrever implementação correspondente antes do RED.

- [ ] T005 RED em tests/dados.test.cjs e tests/fixtures-planilhas.cjs para schemaVersion inteiro 1; perfil ausente=core6/source google-drive-connector; sheets9/source google-sheets-api/exatamente nove; unknown profile, sete/oito abas, fuso/meta diferentes, 111 mínimos, cabeçalho/chave ausente ou duplicada, escalar inválido. Chaves Coluna 1/Parâmetro/execucao_id string não vazia única; tentativa/entrada_versao vazio ou inteiro positivo; versao_prompt string/número; Valor escalar. Preservar hashes legados. FR-004/006/011/012, SC-005.
- [ ] T006 GREEN em src/captura.cjs com whitelists privadas separadas por perfil e constraints de T005; conservar validarCaptura, 66 mínimos públicos, metadados e hash canônico; sem inferir perfil por subconjunto e sem mudar bytes legados. FR-006/011/012.
- [ ] T007 [P] RED em tests/google-config.test.cjs para variáveis ausentes, arquivo inválido, chave dentro do checkout por caminho/link/junction, JSON não service_account, subject/URI/universe indevido, fonte vazia/caracteres inválidos; erro não ecoa caminho/email/key. Chave real externa e identidade somente letras/números/_/-. FR-002/003/014, SC-004.
- [ ] T008 GREEN em src/google-config.cjs para carregarGoogleConfig(env,repoRoot), validando arquivo regular/caminho real externo e campos conforme modelo; configuração ausente não bloqueia GET/CLI, e nada de fallback ADC. FR-002/003/012.
- [ ] T009 [P] RED em tests/google-cells.test.cjs: número/bool/string/null, "2" intacto, IDs com zeros, fórmula efetiva, errorValue, serial DATE/DATETIME/UTC e São Paulo, round-trip/DST ambíguo ou inexistente, fração em data civil, ano fora 0001–9999; fragmentos de até 50.000 células, offsets, vazios internos, coluna larga, overlap/lacuna e resposta malformada. FR-004/007/013, SC-001/003.
- [ ] T010 GREEN em src/google-cells.cjs: planejamento retangular/cobertura e decodificação determinística, só campos de data declarados, base 1899-12-30 e arredondamento a milissegundo; não usar formattedValue/local Date.parse nem coerção numérica. FR-004/007/013.
- [ ] T011 RED em tests/google-client.test.cjs com transporte falso: escopo readonly único, JWT explícito sem ADC, hosts fixos, POST só OAuth e GET só Sheets, token em header nunca query, máscara com effectiveValue/formato/offsets, timeout 15 s, redirects/retries automáticos recusados, zero segredos nas mensagens. FR-002/003/007/014, SC-004.
- [ ] T012 GREEN em src/google-client.cjs para criarClienteGoogle(config,{transport,clock}), getMetadata/readGridRange e autenticação cancelável dentro do orçamento; não criar método de escrita, Drive ou URL configurável pelo navegador. FR-002/003/004/014.
- [ ] T013 RED em tests/snapshot.test.cjs com TEMP real: .importacao.lock mantida durante Promise pendente, CLI concorrente recusada, operação correta sem reacquisição, abort/erro libera só própria trava, close/unlink separados preservam retorno/erro; promoção e recibo continuam confirmados somente pelo atual.json. FR-008/009, SC-002.
- [ ] T014 GREEN em src/snapshot.cjs: adquirir/liberar helpers comuns, manter promoverCaptura síncrono e criar executarColeta(dataDir,operation) async com promoção interna protegida e motivo seguro; sem segundo writer/lock, sem chamar promoverCaptura sob trava adquirida. FR-006/008/009.

Checkpoint: núcleo compatível, tipos, segurança e trava verificados; conta não necessária.

## Fase 3 — US1: atualização íntegra/tipada (T015–T026, P1)

Teste independente: clique com fake estável de nove abas, promoção e seis tabelas/selo coerentes. Inclui falha mínima segura; matriz completa vem na US2.

- [ ] T015 [US1] RED em tests/coleta.test.cjs para sequência metadados→leitura1→hash1→leitura2→hash2→metadados, nove abas/grade inteira e fragmentos; recomputar SHA em código, sem hashear projeção; números de versão/índice, dates e contagens corretos, candidato só em memória; divergência já falha sem gravar. FR-004/005/007, SC-001/003.
- [ ] T016 [US1] GREEN em src/coleta.cjs para coletarCaptura({client,capturaId,now,signal}), envelope sheets9 com source/propriedades, hashes e horários reais; valida cobertura/metadados/igualdade antes de retornar; sem disco/writer. FR-004/005/006/007.
- [ ] T017 [US1] RED em tests/atualizacao.test.cjs para sucesso novo, falha básica segura, lock já ocupado, no-op que conserva data/falha, cliente iniciado somente sob guarda/trava, deadline de 90 s desde início e sem promoção após limite; teste de I/O/serviço com relógio falso. FR-001/006/008/009/013, SC-001/002/006.
- [ ] T018 [US1] GREEN em src/atualizacao.cjs: atualizarDados({dataDir,clientFactory,now,deadline}) usa executarColeta e categorias fixas, capturaId 1–100 [A-Za-z0-9_-], zero echo de SDK; sucesso confirmado só depois de atual.json, abort e básica preservação da vigente. FR-001/005/008/009/013.
- [ ] T019 [US1] RED em tests/servidor.test.cjs HTTP real efêmero: POST local {} permitido, Origin obrigatória/Host exato, ausência/externa/null recusadas, query/extra/payload>1KiB/tipo/método com 403/400/413/415/405; GET não toca client nem disco de escrita; nenhuma rede/credencial antes de guarda. FR-001/003/014, SC-004.
- [ ] T020 [US1] GREEN em src/servidor.cjs: opções injetáveis atualizar/now e rota POST; manter loopback/estáticos/CSP/no-store/GET; respostas controladas e await sem rejeição não tratada. FR-001/014.
- [ ] T021 [US1] RED em tests/projecao.test.cjs: source direto tem legenda controlada, source Central permanece, typed versions vinculam revisão/mídia vigente, strings inválidas mantêm aviso; nenhum campo auxiliar/propriedade privada/chave/fonte configurada em JSON. FR-007/010/011, SC-003/004.
- [ ] T022 [US1] GREEN em src/projecao.cjs para legenda enum de origem e uso do envelope validado mantendo assinatura completa/whitelist seis abas; não corrigir versão por Number nem inferir publicação/responsável. FR-007/010/011.
- [ ] T023 [US1] RED em tests/interface.test.cjs com fake/fixtures: clique dispara POST {} e GET, botão desabilitado até conclusão, dados vigentes durante espera, sucesso/selo comum/Planilha/fonte e menu intactos; 1440/390, teclado e sem pageerror. FR-001/010, SC-001/006.
- [ ] T024 [US1] GREEN em src/web/app.js, src/web/index.html e src/web/styles.css para atualização comum/estado pendente e fonte; navegador não recebe configuração ou auxiliares, sem Google direto. FR-001/003/010.
- [ ] T025 [US1] Executar cinco camadas, gate local, captura de screenshots somente sintéticos 1440/390 e revisão independente dos cinco riscos do plan; corrigir bloqueios com RED antes; evidências somente em specs/002-consulta-planilhas/validacao.md. FR-016, SC-007.
- [ ] T026 [US1] Sincronizar documentação da história com doc-sync-onboarding, commit/push e PR US1; registrar gate Linux verde e review do mesmo head em specs/002-consulta-planilhas/validacao.md; merge somente com autorização aplicável e gate obrigatório verde. FR-016, SC-007.

## Fase 4 — US2: falha, frescor e recuperação (T027–T038, P1)

Teste independente: vigente sintética e falhas injetadas; bytes/data preservados. Depende das interfaces US1, sem conta real.

- [ ] T027 [US2] RED em tests/coleta.test.cjs: nove abas faltantes/parciais/cabeçalhos inválidos/errorValue, metadados/fuso/hash alterados, segunda leitura efetivamente independente; erro não salva candidata nem passa como zero. FR-004/005/008, SC-002.
- [ ] T028 [US2] GREEN em src/coleta.cjs e src/google-cells.cjs para categorias de conflito/invalidez, cobertura e abort entre fragmentos; erros sem nomes/valores privados. FR-004/005/008.
- [ ] T029 [US2] RED em tests/atualizacao.test.cjs e tests/google-client.test.cjs: 401/403 sem retry, 429/5xx uma repetição GET/1 s dentro de 90 s, OAuth/per-request15s/total90s cancelados, futuro >10min e fim≤vigente recusados; não atualizar data/falha por GET/no-op; falha inicial, cleanup e falha não durável preservam estado. FR-008/009/013, SC-002/006.
- [ ] T030 [US2] GREEN em src/atualizacao.cjs e src/google-client.cjs para matriz de erros/prazos/repetição, sem repetir captura inteira ou credencial inválida; impedir promoção depois do orçamento e manter resultado confirmado se deadline vencer após commit atômico. FR-008/013.
- [ ] T031 [US2] RED em tests/snapshot.test.cjs com TEMP real e injeção de falha: open/write/fsync/rename/close/unlink, recibos órfãos, lock CLI durante await, falha antes/depois de confirmação; bytes da vigente preservados e registrada true/false coerente. FR-006/008/009, SC-002.
- [ ] T032 [US2] GREEN em src/snapshot.cjs com recibos de erro fixo/ponteiro único e avisos de cleanup, sem gravar exceção bruta; manter todos os testes legados. FR-006/008/009.
- [ ] T033 [US2] RED em tests/servidor.test.cjs para respostas exatas 409/422/503/504, enum/message/registrada, sem segredo/ID/email/path ou SDK stack em JSON/logs, dois POST concorrentes e GET durante coleta; 503 de consulta não escreve. FR-003/008/009/014, SC-002/004.
- [ ] T034 [US2] GREEN em src/servidor.cjs para resultados falhos/persistência e logs fixos, mantendo guardas e limites HTTP. FR-003/008/014.
- [ ] T035 [US2] RED em tests/interface.test.cjs: falha confirmada mostra selo e data vigente, configuração ausente, primeira falha com vazio/filtros, GET de refresh falhando conserva visão, retry manual recupera; botão restabelecido em finally e nenhum pageerror em 1440/390. FR-008/010, SC-002/006.
- [ ] T036 [US2] GREEN em src/web/app.js/index.html/styles.css para mensagens/falha/recuperação legíveis e origem honesta, sem repetir lista de avisos no topo nem fingir sucesso. FR-008/010.
- [ ] T037 [US2] Executar cinco camadas/gate/review independente, screenshots sintéticos de sucesso/falha/sem dados/configuração ausente; registrar somente resultados em specs/002-consulta-planilhas/validacao.md. FR-016, SC-006/007.
- [ ] T038 [US2] Doc-sync/onboarding, commit/push, PR US2 e confirmação gate Linux verde/review do head, com evidências em specs/002-consulta-planilhas/validacao.md; sem merge implícito. FR-016, SC-007.

## Fase 5 — US3: Central e abas reservadas (T039–T046, P2)

Teste independente: importar arquivos seis/nove em TEMP, sem config Google. Interface continua com seis abas.

- [ ] T039 [US3] RED em tests/importador.test.cjs e tests/dados.test.cjs para CLI sintaxe existente, hashes/bytes legados preservados, sheets9 aceito, perfil/source/subconjunto recusados, no-op/colisão/frescor/falha posterior intactos; zero autenticação ou rede na importação. FR-006/012, SC-005.
- [ ] T040 [US3] GREEN em scripts/importar-captura.cjs e src/captura.cjs somente se T039 indicar lacuna; preservar promoverCaptura comum e CLI sem --arquivo/sem URL. Se comportamento já verde, não fabricar RED ou mudança; registrar cobertura reaproveitada em specs/002-consulta-planilhas/validacao.md. FR-006/012.
- [ ] T041 [US3] RED em tests/projecao.test.cjs e tests/servidor.test.cjs com sentinelas sintéticas nas três auxiliares/extras: nenhum registro/prompt/flag/email/key/ID privado no JSON, HTML, erros ou logs, incluindo consulta após importação manual; 66 mínimos editoriais seguros preservados. FR-003/011, SC-004.
- [ ] T042 [US3] GREEN em src/projecao.cjs/src/triagem.cjs somente para manter whitelist editorial explícita e supressão de textos, sem expor auxiliares nem reinterpretar seus cadastros como operação instalada. FR-003/011.
- [ ] T043 [US3] RED em tests/interface.test.cjs e tests/servidor.test.cjs para GET/importação sem configuração, botão direto informa ausência honestamente, menu seis abas/Histórico sem Equipe/Workflow e origem correta Central versus direta; navegação sem pageerror. FR-010/011/012, SC-005/006.
- [ ] T044 [US3] GREEN em src/servidor.cjs e src/web/app.js para cliente criado apenas no POST e consulta/arquivo independentes de key/config; nada de downgrade silencioso POST→GET. FR-001/011/012.
- [ ] T045 [US3] Verificar compatibilidade/privacidade e cinco camadas, gate/review independente, screenshots sintéticos 1440/390; registrar no specs/002-consulta-planilhas/validacao.md e documentar limite de rollback do binário001. FR-012/016, SC-004/005/007.
- [ ] T046 [US3] Doc-sync/onboarding, commit/push, PR US3 com gate Linux verde/review do head; atualizar somente links curtos de estado nos outros documentos, evidências em specs/002-consulta-planilhas/validacao.md. FR-016, SC-007.

## Fase 6 — Verificação final e demonstração (T047–T052)

Conta real só nesta fase; não transforma preparo em autorização para alterar Google. No máximo um PR final complementar de aceite/documentação se não puder integrar esse aceite no PR US3 ainda aberto; manter um PR por história de implementação.

- [ ] T047 Verificação completa com 500 peças sintéticas/nove abas e fragmentação em tests/fixtures-planilhas.cjs/tests/coleta.test.cjs/tests/interface.test.cjs: contagens, tipos, referências, todos os erros/privacidade e 1440/390; novos casos primeiro RED, depois GREEN; registrar resultados/limites em specs/002-consulta-planilhas/validacao.md. FR-004/007/016, SC-001/003/007.
- [ ] T048 AUTOR cria conta de serviço dedicada, habilita Sheets API, guarda chave fora do checkout e compartilha planilha como Leitor; configura variáveis privadas conforme specs/002-consulta-planilhas/quickstart.md. Não pedir/colar valores; registrar somente preparo concluído/pendente em specs/002-consulta-planilhas/validacao.md. Bloqueia T049, nunca testes anteriores. FR-002/003/015.
- [ ] T049 Após T048 e autorização de leitura real, demonstrar POST e comparar captura/CRM, nove contagens/inteireza/tipagem/frescor, seis tabelas públicas e reserva das auxiliares. Não editar fonte para testar erro; qualquer divergência do CRM vira fixture sintética RED/correção. Evidências em specs/002-consulta-planilhas/validacao.md só capturaId/horários/hashes/contagens/passou-falhou/limites, sem dados de células. FR-005/007/011/015, SC-001/003/004.
- [ ] T050 Revisão independente com reviewer/security-auditor conforme prompts locais, cinco riscos do plan, emenda aplicada e limites pendentes da001; corrigir Critical/segurança/regressão/Important com RED, resto como limite conhecido em specs/002-consulta-planilhas/validacao.md. FR-016, SC-004/007.
- [ ] T051 Penúltima etapa: suíte completa local sem SKIP nas cinco camadas e node tools/quality-gate.mjs com config vigente; registrar resultado real e repetir gate Linux strict do head antes do merge em specs/002-consulta-planilhas/validacao.md. Não afrouxar checks/baseline para aceitar código. FR-016, SC-007.
- [ ] T052 Última etapa: seguir .claude/agents/doc-sync-onboarding.md e sincronizar README.md, AGENTS.md fora do bloco, ROADMAP.md, docs/index.md/docs/architecture.md/docs/modules afetados e .claude/rules/project-structure.md≤60 linhas; links para specs/002-consulta-planilhas/validacao.md com estado planejado/implementado/testado/integrado real, sem dados privados. FR-016, SC-007.

## Dependencies & Execution Order

T001 → T002 → T003/T004 → fundação → US1 → US2 → US3 → final. Dentro de cada par: RED observado → GREEN → suíte focal → refactor → checkbox. T025/T037/T045 verificam e T026/T038/T046 documentam/entregam cada história. MVP operacional exige US1+US2; nenhum aceite remoto autoriza acesso real sem T048/T049.

US2 depende das interfaces US1 mas testa erros independentemente com fake; US3 depende da fundação e testa arquivo/privacidade sem acesso real, executada depois para evitar conflitos em arquivos compartilhados. T048 não bloqueia T001–T047 nem revisão sintética. Sem configuração, demo real fica pendente; testes não.

## Parallel Examples

- Fundação: T007 (config) e T009 (células) em paralelo após T006; GREENs respectivos depois de seus REDs, donos exclusivos. T011 exige T008, T012 pode usar decoder depois T010.
- US1: preparar T019 HTTP e T021 projeção em paralelo após T018; ambos falham pelo comportamento faltante, um responsável por cada teste. Implementações T020/T022 em arquivos distintos.
- US2: preparação T031 I/O e T033 HTTP independente após T030, sem alteração paralela de snapshot/servidor.
- US3: preparar assertions T041 em projeção/HTTP com donos delimitados; não dividir o mesmo arquivo entre agentes. Serviços/HTML podem ser inspecionados em leitura sem conflito.

## Implementation Strategy

Um commit por tarefa ou grupo lógico; nunca marcar [x] por teste escrito sem RED/GREEN ou evidência. Comportamento já existente recebe prova de cobertura, sem fabricar falha nem alterar implementação desnecessariamente. Setup/documentação não exigem teste artificial que repita texto.

Na execução: PR1=setup+fundação+US1; PR2=US2; PR3=US3. Final pode ser incluído no PR3 antes do merge quando autor pronto; se precisar de aceite posterior, PR documental final não é quarta história. Push/PR/merge dependem da autorização vigente de cada rodada, jamais presumidos deste documento. Esta rodada permite só commit/push dos documentos, **nenhum PR**.

## Cobertura rastreável

| Requisito/critério | Tarefas |
| --- | --- |
| FR-001 | T017–T020, T023–T024, T044 |
| FR-002 | T003–T004, T007–T008, T011–T012, T048 |
| FR-003 | T007–T008, T011–T012, T019, T023–T024, T033–T034, T041–T042, T048–T049 |
| FR-004 | T005–T006, T009–T012, T015–T016, T027–T028, T047 |
| FR-005 | T015–T018, T027–T028, T049 |
| FR-006 | T005–T006, T013–T018, T031–T032, T039–T040 |
| FR-007 | T009–T012, T015–T016, T021–T022, T047/T049 |
| FR-008 | T013–T014, T017–T018, T027–T036 |
| FR-009 | T013–T014, T017–T018, T029, T031–T033 |
| FR-010 | T021–T024, T035–T036, T043–T044 |
| FR-011 | T005–T006, T021–T022, T041–T044, T049 |
| FR-012 | T005–T008, T039–T046 |
| FR-013 | T009–T010, T017–T018, T029–T030 |
| FR-014 | T007, T011–T012, T019–T020, T033–T034 |
| FR-015 | T048–T049 |
| FR-016 | T001–T002, T004, T025–T026, T037–T038, T045–T047, T050–T052 |
| SC-001 | T009–T010, T015–T024, T047/T049 |
| SC-002 | T013–T018, T027–T036 |
| SC-003 | T009–T010, T015–T016, T021–T022, T047/T049 |
| SC-004 | T007–T012, T019–T020, T033–T034, T041–T042, T049–T050 |
| SC-005 | T005–T006, T039–T046 |
| SC-006 | T017–T018, T023–T024, T029–T030, T035–T037, T043–T044 |
| SC-007 | T002/T004, T025–T026, T037–T038, T045–T047, T050–T052 |
