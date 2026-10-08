# Tasks: 005 — Prévias de imagens

**Input**: Documentos em `specs/005-previas-imagens/`: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/midia.md](contracts/midia.md) e [quickstart.md](quickstart.md).

**Prerequisites**: Tarefa 1 integrada pelo PR #22, base main `b90980a15fad653937fd024ac3c9bb2738e9d99a`; constituição 1.2.0 aprovada pelo autor em 2026-10-08 e registrada no branch da 005. `speckit-analyze` deve conferir estes artefatos antes da implementação.

**Tests**: TDD solicitado. Escrever e observar RED de comportamento antes da implementação correspondente; erro de importação, dependência ou ambiente não comprova RED. Cinco camadas: regras, I/O real TEMP, serviço/projeção, HTTP real loopback/porta efêmera e Playwright local. Nenhuma captura/credencial real ou instalação nova.

**Organization**: Histórias por prioridade: US1 (P1), US3 (P1), US2 (P2). A infraestrutura compartilhada também cobre recusas de US3, sem duplicar implementação de transporte/cache/HTTP.

**Estado**: Apenas planejamento. **21 tarefas, 0 executadas.** O total excede o limite de 20 definido pelo autor: parar antes de implementar, escrever testes da 005 ou rodar gate, apresentar o peso e aguardar sua decisão. T002 é externa e não bloqueia testes sintéticos; continua incluída na contagem, sem simular conclusão. Nenhum merge da 005 autorizado.

## Format: `[ID] [P?] [Story] Description`

- `[P]`: arquivos diferentes e execução paralela possível depois dos pré-requisitos indicados.
- `[US1]`, `[US2]`, `[US3]`: história correspondente da spec; preparação, base e fechamento não recebem rótulo de história.
- Caminhos são relativos à raiz do repositório. Responsabilidade exclusiva por arquivo deve ser atribuída antes de delegar; testes em arquivo compartilhado permanecem sequenciais.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar as provas sintéticas e deixar explícita a ação externa do autor. Reutilizar o projeto e as ferramentas existentes; nenhum scaffold/framework novo.

- [ ] T001 Preparar `tests/previas-fixtures.cjs` com captura derivada da T1, IDs exclusivamente sintéticos, PNG válido gerado no teste com APIs nativas, amostras JPEG/WEBP sintéticas, chaves RSA geradas em RAM/TEMP e transporte falso controlável para OAuth/download/stream; preservar `tests/versoes-fixtures.cjs` e bloquear rede real nas suítes consumidoras (FR-014; quickstart).
- [ ] T002 [P] **Autor, externa e não bloqueante**: compartilhar a pasta “Produções” da NTV no Drive com a conta de serviço como Leitor, conforme `specs/005-previas-imagens/quickstart.md`; registrar futuramente somente confirmação sanitizada/pendência em `specs/005-previas-imagens/validacao.md`, sem ID, e-mail, URL, screenshot ou conteúdo real (FR-013; constituição VI).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Transporte privado e validação/resolução compartilhados pelas três histórias. T001 bloqueia esta fase; T002 não bloqueia.

### Tests first

- [ ] T003 [P] Escrever e observar RED do cliente Drive em `tests/google-midia.test.cjs`: factory sem `CRM_SPREADSHEET_ID`, JWT RS256 com escopo exclusivo `https://www.googleapis.com/auth/drive.readonly`, tokens separados de Sheets em RAM, host/caminho fixos, `redirect:error`, nenhum retry/corpo de erro Google, contagem real inclusiva de 15.000.000 bytes e timeout de 15.000 ms para token e 15.000 ms para download completo; cobrir excesso sem Content-Length, stall depois dos headers, permissão e rede, preservando exports/comportamento anteriores de Sheets (FR-007, FR-010–014; contrato).
- [ ] T004 [P] Escrever e observar RED de regras puras/resolução em `tests/midia.test.cjs`: “Localizar ID interno exato único no recorte NTV da captura vigente válida; versão inteira positiva segura e id_drive canônico preenchido. SHA vazio é opcional; preenchido exige 64 hex. Tipo declarado não autoriza/recusa a rota: assinatura dos bytes decide. Não derivar referência da URL”; ID remoto somente `A–Z`, `a–z`, `0–9`, `_`, `-`; PNG completo de oito bytes, JPEG `FF D8 FF`, WEBP `RIFF`/`WEBP`, truncadas/SVG/GIF/vídeo/ZIP/HTML/JSON recusados, limite exato/+1 e SHA ausente/inválido/divergente/hex com caixa diferente (FR-006–011; modelo Arquivo registrado/Resultado do serviço).

### Implementation

- [ ] T005 [P] Implementar `criarClienteDrive(...).getMidia(idDrive)` em `src/google.cjs`, reutilizando a autenticação nativa sem alterar `carregarConfig`, `assinarJwt(config,now)` ou `criarClienteGoogle` de Sheets; aplicar o transporte/limites testados por T003, cancelar stream/timeout inclusive durante o corpo, manter chave externa/tokens privados e passar `tests/google-midia.test.cjs` mais regressões Google/coleta existentes (depende de T003; FR-007, FR-010, FR-012–014).
- [ ] T006 [P] Implementar resolução exata e validação de bytes/hash em `src/midia.cjs`, carregado explicitamente por `tests/midia.test.cjs`: “Tipos permitidos: image/png, image/jpeg, image/webp; até 15.000.000 bytes; sem dados de autenticação/provedor na resposta”; aplicar T004 sem fallback por URL/nome ou confiança em MIME/extensão/tipo declarado; preservar captura/recibos e passar as regras puras (depende de T004; FR-006–012, FR-014).

**Checkpoint**: T003–T006 verdes, sem rede real ou regressão Sheets. Regras novas têm teste próprio; capturas antigas não são migradas.

---

## Phase 3: User Story 1 — Reconhecer as imagens da peça (Priority: P1) — MVP

**Goal**: Entregar imagens ordenadas da peça aberta, inclusive Pronta, por rota local e cache validado.

**Independent Test**: Carrossel sintético texto v3/imagens v2/v1/v1/v2/v3 nos quatro temas/larguras; zero downloads de quadro/peças fechadas, reabertura sem download remoto adicional e última imagem alcançável em 390.

### Tests first

- [ ] T007 [P] [US1] Escrever e observar RED de I/O real TEMP e serviço em `tests/midia.test.cjs`: lazy sem credencial/OAuth no hit, miss/hit, versão/id_drive/hash alterados, arquivo removido/fora da NTV, captura ausente/corrompida, cache inválido/grande/parcial, falha de disco/staging, concorrência e captura alterada durante download; testar a tupla ordenada “`arquivo_id`, versão, `id_drive`, `sha256` normalizado” e a regra “Comparar referência resolvida antes e depois de cache/download; captura inválida, remoção ou alteração impede servir bytes anteriores como atuais”; conferir bytes de captura/recibos inalterados e zero rede nas recusas iniciais (depende de T005–T006; FR-005–009, FR-011–014; também US3).
- [ ] T008 [P] [US1] Escrever e observar RED do contrato completo em `tests/midia-http.test.cjs`, com servidor real em porta efêmera e transporte falso: GET por ID interno/bytes, decodificação única, query/URL/caminho/segmento/encoding recusados, Host/Origin/Sec-Fetch-Site antes do serviço, HEAD/POST 405 sem consulta, status 200/400/403/404/405/422/503 conforme `specs/005-previas-imagens/contracts/midia.md`, corpo de erro constante “Prévia indisponível”, nosniff/no-store/CORP também nas falhas, sem CORS ou sentinelas privadas; em `tests/tema.test.cjs`, exigir somente a alteração CSP `img-src 'none'` → `img-src 'self'`, com regressões de visao/atualizar (depende de T005–T006; FR-006–014; também US3).
- [ ] T009 [P] [US1] Escrever e observar RED de seleção/demanda/galeria em `tests/previas-interface.test.cjs`, servidor real/transporte falso e externos bloqueados: “Derivada das unidades já resolvidas e vigentes; páginas por índice/ID; cenas por índice/ID e inicial/final. Vídeo fora. Repetição mantém cada posição”; fallback “Somente peça de imagem sem unidades; preservar empates e ordenação determinística por ID. Não selecionar maior versão nem comparar com pacote”; Pronta fora da dobra, imagens reaproveitadas, imagem sem unidades, zero busca antes de abrir/peças fechadas, reabertura/cache, faixa móvel sem corte e links existentes (depende de T005–T006; FR-001–003, FR-005, FR-012, FR-014; SC-001/004).

### Implementation

- [ ] T010 [US1] Implementar `criarServicoMidia({dataDir,criarCliente}).obter(arquivoId)` em `src/midia.cjs`: “Nome hexadecimal calculado pelo servidor; caminho confinado à raiz fixa, nunca ID/path recebido. MIME e hash são reconferidos na leitura; entrada descartável”; cache `data/midias/<sha256-da-tupla>.bin` com SHA normalizado/serialização inequívoca, leitura limitada a máximo+1, descarte/refetch de hit inválido, staging exclusivo+rename, limpeza só do próprio staging, resposta de bytes novos validados se disco falhar, coalescência por promise removida ao finalizar, lazy e fingerprint final; passar T007 sem alterar captura/coleta e confirmar cache ignorado por Git (depende de T007 e T005–T006; FR-005–009, FR-011–014).
- [ ] T011 [US1] Integrar `/api/midia/<arquivo_id>` em `src/servidor.cjs`, serviço injetável/default lazy, guardas antes de método/resolução/cache/rede, decodificação única e catch assíncrono; implementar todos os status/headers/erros constantes de T008 e CSP self, sem proxy genérico, ID remoto, path recebido ou CORS; passar `tests/midia-http.test.cjs`, `tests/tema.test.cjs` e regressões HTTP/coleta (depende de T008 e T010; FR-006–014).
- [ ] T012 [US1] Implementar seleção e galeria sob demanda em `src/web/app.js` e `src/web/styles.css`: reservar sem src durante montagem do dia, inicializar após showModal somente peça aberta e depois em toggle, src exclusivo por ID interno codificado, ordem/contextos/empates de T009, Pronta fora da dobra, faixa lateral/filhos sem encolhimento e tokens existentes; usar `data-previa-arquivo` separado de seletores legados. Adaptar somente seletores necessários em `tests/pronta-interface.test.cjs` para mirar “Baixar pacote” e `.publication-caption img`, preservando allowlist/XSS; passar T009 e regressões Pronta/versões/tema (depende de T009 e T011; FR-001–003, FR-005, FR-010, FR-012, FR-014).

**Checkpoint**: US1 funcional e verificável com fakes; rota/cache seguros já cobrem a infraestrutura de US3. Não apresentar a galeria como conferência dos integrantes do ZIP ou aprovação editorial.

---

## Phase 4: User Story 3 — Continuar consultando quando a prévia falha (Priority: P1)

**Goal**: Uma imagem indisponível não interrompe consulta, revela causa privada ou muda a peça Pronta.

**Independent Test**: Permissão/rede/timeout/tipo/tamanho/hash e imagem indecodificável; somente a miniatura afetada falha, texto/link/Pronta/captura permanecem. Infraestrutura exercitada por T003–T004/T007–T008.

### Tests first

- [ ] T013 [US3] Escrever e observar RED visual em `tests/previas-interface.test.cjs` usando servidor real/transporte falso para as recusas do serviço e bytes aceitos pela assinatura mas indecodificáveis pelo navegador: “Somente navegador; não grava captura/recibo. Falha mantém texto e link permitido pela allowlist HTTPS Drive/Docs atual; Baixar pacote continua exclusivo de Drive”; conferir “Prévia indisponível” apenas na posição afetada, outras imagens disponíveis, ampliação indisponível, nenhuma sentinela privada e preservação de legenda/hashtags/pacote/contagem/Planilha (depende de T012; FR-007, FR-009, FR-011–014; SC-003).

### Implementation

- [ ] T014 [US3] Implementar os estados “não solicitada, carregando, disponível, indisponível; foco de origem da ampliação” e fallback localizado em `src/web/app.js`/`src/web/styles.css`, com HTTP/onerror, remoção do ícone de imagem quebrada, botão de ampliação desabilitado e link adjacente preservado, sem `.notice` editorial ou causa privada; passar T013 e as recusas das camadas anteriores (depende de T013; FR-011–012, FR-014; SC-003).

**Checkpoint**: US1/US3 preservam consulta mesmo em falha. Nenhum teste falso comprova compartilhamento real ou acesso operacional.

---

## Phase 5: User Story 2 — Conferir imagem ampliada (Priority: P2)

**Goal**: Abrir a imagem escolhida e retornar à miniatura sem perder a gaveta.

**Independent Test**: Mouse/Enter, botão Fechar e dois Escapes; primeiro fecha ampliação/devolve foco, segundo pode fechar a gaveta; imagem cabe em 390 e 1440.

### Tests first

- [ ] T015 [US2] Escrever e observar RED da ampliação em `tests/previas-interface.test.cjs`: imagem escolhida/nome acessível, ativação por mouse/teclado, foco/Fechar/Escape, gaveta mantida aberta, retorno ao mesmo botão e imagem sem corte horizontal em 390/1440; verificar que miniatura indisponível não abre e nenhum src usa Google/URL remota (depende de T014; FR-004, FR-010–012, FR-014; SC-002).

### Implementation

- [ ] T016 [US2] Implementar segundo dialog nativo e controles de ampliação em `src/web/app.js`/`src/web/styles.css`, imagem local contextual, foco de origem, Fechar/cancel/Escape somente do diálogo superior e dimensões próprias sobrescrevendo CSS da gaveta, sem blob/data URL ou dependência nova; passar T015 e regressões de Esc/foco/gaveta (depende de T015; FR-003–004, FR-010–012, FR-014; SC-002).

**Checkpoint**: As três histórias funcionam, com cinco camadas cobertas e sem merge/deploy.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Evidência visual, gate, documentação e entrega para revisão. Se revisão exigir código, repetir testes proporcionais, gate e doc-sync no novo head.

- [ ] T017 Gerar por opt-in em `tests/previas-interface.test.cjs` e inspecionar os **12 PNG sintéticos** em `docs/design/screenshots/previas-*.png`: galeria/ampliação/indisponível × claro/escuro × 1440/390; executar roteiro de `specs/005-previas-imagens/quickstart.md`, conferir última página alcançável/foco/Drive e preservar screenshots históricos de T1/Pronta (depende de T016; FR-015; SC-001–005).
- [ ] T018 Executar `node tools/quality-gate.mjs` com Node 24.19.0 no PATH e Playwright local, após as suítes das cinco camadas; confirmar estados/exit/baseline e corrigir falhas sem mascarar cobertura/complexidade, registrando evidência sanitizada por fonte em `specs/005-previas-imagens/validacao.md`; diferenciar limite Semgrep Windows e pulos UI/PowerShell do CI Linux (depende de T017; FR-014–015; SC-005).
- [ ] T019 Executar `doc-sync-onboarding` segundo `.claude/agents/doc-sync-onboarding.md`, como última etapa das alterações de código: atualizar `AGENTS.md`, `README.md`, `ROADMAP.md`, `docs/index.md`, `docs/architecture.md`, módulos existentes e `docs/modules/midia.md`, galeria e `specs/005-previas-imagens/validacao.md`; registrar implementação/testes/limites/emenda1.2.0/autor pendente sem declarar integração, preservar contratos históricos e ajustar mapa real de imports quando implementados (depende de T018; FR-012–015; constituição IV–VI).
- [ ] T020 Fazer revisão independente da spec/contrato e diff final, seguindo `.claude/agents/reviewer.md`, com foco em autorização por captura, origem/stream/cache, segredo, regressão Sheets/T1/Pronta e UI/foco; registrar findings/fonte e resolução em `specs/005-previas-imagens/validacao.md`, repetindo T018–T019 se houver código novo; não aceitar Critical, segurança ou regressão (depende de T019; FR-014–015; SC-005).
- [ ] T021 Criar commits com autoria `204295625+Browsher@users.noreply.github.com`, sem coautoria, push somente em `Browsher/crm-social` e um PR da `codex/005-previas-imagens`, com evidências de `specs/005-previas-imagens/validacao.md`/12 screenshots; anexar PR, obter quality-gate/review remotos do head final e corrigir bloqueios pelo mesmo ciclo, então entregar PR/review/screenshots junto do link integrado da T1. **Não fazer merge da 005 nem apagar sua branch** (depende de T020; FR-015; autorização do autor).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Guarda anterior a toda execução**: 21 > 20; implementação parada até decisão do autor. `speckit-analyze` ainda deve ocorrer antes de qualquer implementação autorizada.
- T001 → T003/T004 → T005/T006. T002 é paralela externa e não bloqueia fakes.
- Após a base: T007/T008/T009 podem escrever/observar RED em paralelo, em arquivos distintos; depois T010 → T011 → T012.
- US3: T012 → T013 → T014; US2: T014 → T015 → T016. Ambas reutilizam transporte/cache/rota, sem reinventar contratos.
- Fechamento: T016 → T017 → T018 → T019 → T020 → T021. Código corrigido em review/CI volta a testes/gate/doc-sync no próprio head.

### User Story Dependencies

- **US1 (P1)**: depende da base; é o MVP da galeria, com infraestrutura segura e testada.
- **US3 (P1)**: depende da galeria de US1 para testar falha localizada; recusas privadas já são TDD na base/serviço/HTTP.
- **US2 (P2)**: depende de posições disponíveis/indisponíveis de US1/US3; não altera autorização, cache ou editorial.
- Teste independente significa um cenário verificável da história com seus pré-requisitos, não duplicação de código compartilhado.

### Within Each User Story

1. Escrever testes proporcionais e observar RED por comportamento antes do código correspondente.
2. Implementar a menor mudança para GREEN; preservar invariantes/contratos e refatorar mantendo os testes.
3. Não usar dado real, não alterar captura operacional e não aceitar falha de ferramenta como prova de comportamento.
4. Arquivos compartilhados (`midia.test.cjs`, `previas-interface.test.cjs`, `app.js`, `styles.css`) têm um responsável por vez.

### Parallel Opportunities

- T001/T002 podem avançar independentemente; somente T001 condiciona os testes.
- T003 e T004 usam arquivos distintos; após seus RED, T005/T006 podem avançar em paralelo com propriedade exclusiva por fonte.
- T007/T008/T009 usam arquivos distintos depois da base. Integração de produção permanece T010 → T011 → T012.
- US3/US2 têm o mesmo arquivo de testes e fontes UI: executar sequencialmente.

---

## Parallel Example: User Story 1

Depois de T005/T006, com ownership exclusivo e interfaces combinadas:

```text
T007 — tests/midia.test.cjs: I/O/cache/serviço e referência vigente.
T008 — tests/midia-http.test.cjs + tests/tema.test.cjs: rota/guardas/headers/CSP.
T009 — tests/previas-interface.test.cjs: demanda/ordem/Pronta/responsividade.
```

## Parallel Example: User Story 3

T013/T014 são sequenciais e usam os arquivos UI já existentes. A análise somente leitura das falhas de serviço em T007/T008 pode ocorrer em paralelo; nenhuma edição concorrente de `src/midia.cjs`, `src/web/app.js` ou testes compartilhados.

## Parallel Example: User Story 2

T015/T016 são sequenciais. Uma revisão somente leitura de acessibilidade/foco pode acompanhar a implementação, preservando ownership de `src/web/app.js`/`src/web/styles.css`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

Após a decisão do limite e análise: preparação/base → serviço/cache → rota → galeria US1; validar demanda/ordem/cache com fakes. O MVP não autoriza deploy, merge, consulta real ou abandono de US3/US2; o PR solicitado exige o escopo completo e seu aceite.

### Incremental Delivery

1. Base privada com scopes/bytes/resolução.
2. US1, incluindo cache/rota e galeria, com suas recusas de infraestrutura testadas antes de servir bytes.
3. US3 torna as falhas visuais localizadas e preserva consulta/links.
4. US2 acrescenta ampliação e foco.
5. Prova visual → gate → doc-sync → review → PR sem merge.

### Parallel Team Strategy

Delegar por arquivo/interface, não por história concorrente que escreva a mesma UI. Coordenador integra arquivos compartilhados, acompanha RED/GREEN e mantém evidências por head. Não criar chats ou automações.

## Rastreabilidade e peso

| Área | IDs | Quantidade | Peso principal |
| --- | --- | --- | --- |
| Preparação | T001–T002 | 2 | Fixtures/transporte sintéticos; ação externa do autor |
| Base compartilhada | T003–T006 | 4 | JWT/scopes/stream/timeout e resolução/bytes/hash; pares teste/implementação |
| US1 | T007–T012 | 6 | Três fronteiras distintas: cache/serviço, HTTP e galeria; pares teste/implementação |
| US3 | T013–T014 | 2 | Falha visual/decodificação e preservação da consulta; recusas servidor já cobertas |
| US2 | T015–T016 | 2 | Ampliação/Escape/foco/responsividade; par teste/implementação |
| Fechamento | T017–T021 | 5 | 12 screenshots, gate, doc-sync, revisão independente e PR/CI sem merge |
| **Total** | **T001–T021** | **21** | **20 do agente + 1 externa; total acima do limite do autor** |

| Requisitos / entidades | Tarefas |
| --- | --- |
| FR-001–003: seleção, Pronta e faixa | T009/T012/T017; Posição de galeria/Fallback de peça de imagem |
| FR-004: ampliação | T015–T017; foco de Estado visual |
| FR-005: demanda/cache | T007/T009–T012; Fingerprint/Entrada de cache |
| FR-006–009: ID/bytes/cache/hash | T003–T008/T010–T011; Arquivo registrado/Resultado do serviço |
| FR-010: fronteira local/headers | T003/T005/T008/T011–T016 |
| FR-011–012: falha privada/sem escrita | T003–T016; Estado visual e serviço |
| FR-013: constituição/conta leitora | T002–T006/T019 |
| FR-014: TDD/cinco camadas | T001/T003–T018 |
| FR-015 e SC-001–005: provas/entrega | T009/T013/T015/T017–T021 |

## Notes

- Todos os 21 itens têm checkbox, ID sequencial e caminho; apenas fases de história têm `[USn]`.
- Hooks opcionais `speckit.git.commit` antes/depois de tasks não executados; esta geração não faz commit/push.
- Nenhuma task, teste, gate ou screenshot da 005 foi executado nesta geração. Não marcar task por evidência histórica de T1/Pronta.
- A hipótese de galeria em Pronta é a da spec: imagens vinculadas vigentes, sem extração ou confirmação do ZIP. Não atribuir resposta do autor que não ocorreu.
