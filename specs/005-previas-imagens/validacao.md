# Validação — 005, Prévias de imagens

Como conferir uma folha de contato antes de usá-la, este registro separa os testes sintéticos da operação real. O autor aprovou as 21 tarefas em 2026-10-08 e autorizou a implementação no [PR #23](https://github.com/Browsher/crm-social/pull/23), sem merge. Base integrada: `b90980a15fad653937fd024ac3c9bb2738e9d99a`, [tarefa 1 / PR #22](https://github.com/Browsher/crm-social/pull/22).

## Execução em andamento

Node 24.19.0 e Playwright existentes no computador; somente fixtures sintéticas, transporte falso, diretórios TEMP e portas efêmeras. Nenhuma planilha, credencial ou mídia operacional foi usada. Nenhum resultado anterior da tarefa 1 comprova a 005.

| Tarefa / prova anterior à implementação | Resultado |
| --- | --- |
| T001 — fixture e bytes sintéticos | Smoke Node 24.19.0, exit 0; cinco páginas v3 e imagens v2/v1/v1/v2/v3; PNG gerado com CRC e compressão nativos |
| T003 — `node --test tests/google-midia.test.cjs` | RED, exit 1, 0 PASS / 15 FAIL; asserção da factory Drive ausente, sem falha de importação/sintaxe |
| T004 — `node --test tests/midia.test.cjs` | RED, exit 1, 0 PASS / 15 FAIL; interface substituta explícita, asserções de comportamento/status ausente, sem falha de importação/sintaxe |
| T006 — `node --test tests/midia.test.cjs` | GREEN, exit 0, 15 PASS, sem falhas/pulos; regras puras e resolução implementadas após RED |
| T005/T006 — Google novo/existente, coleta e regras | GREEN, exit 0, 49 PASS, sem falhas/pulos; primeira tentativa restrita teve falha de acesso TEMP em C05, corrigida pela execução com permissão |
| Assinatura WEBP com bit alto | Teste adicional antes da correção: RED 14 PASS / 1 FAIL (exceção esperada ausente); comparação exata corrigida, GREEN 15 PASS |
| T008 — `node --test tests/midia-http.test.cjs` | RED, exit 1, 0 PASS / 8 FAIL; rota ausente devolve 404 em vez de bytes/recusas específicas e não aplica CORP |
| T009 — `node --test tests/previas-interface.test.cjs` | RED local com Playwright, exit 1, 0 PASS / 7 FAIL; faixa de prévias ausente em todos os cenários, sem rede real ou interceptação da resposta de mídia |
| T008 — CSP no teste HTTP de tema existente | RED filtrado `Tema: rota GET/HEAD`, exit 1, 0 PASS / 1 FAIL; `img-src 'none'` em vez do esperado `'self'` |
| T007 — `node --test tests/midia.test.cjs` | RED, exit 1, 15 PASS de regras / 15 FAIL de serviço; bytes/rejeições esperadas ausentes, sem pulos ou atividade assíncrona residual |
| T010 — `node --test tests/midia.test.cjs` | GREEN, exit 0, 30 PASS, sem falhas/pulos; I/O TEMP, cache, concorrência, falhas de disco e referência reconfirmada |
| T011 — HTTP novo/existente, mídia e Google/coleta | GREEN, exit 0, 94 PASS, sem falhas/pulos; oito testes HTTP da mídia verdes. Uma referência incorreta a arquivo de atualização foi detectada; a suíte correta está na rodada de regressão abaixo |
| T011 — tema local completo | GREEN, exit 0, 27 PASS, sem falhas/pulos; CSP self e Playwright existentes |
| T012 — galeria local | GREEN, exit 0, 7 PASS, sem falhas/pulos, nos dois temas e larguras; servidor real com transporte falso |
| T012 — regressão Pronta/tema | GREEN, exit 0, 41 PASS, sem falhas/pulos; somente dois seletores legados adaptados |
| T012 — versões/atualização, nomes de arquivos corrigidos | GREEN, exit 0, 36 PASS (19 regras de versões + 7 UI de versões + 10 atualização), sem falhas/pulos |
| OAuth simultâneo — D16 | RED, exit 1, cinco aquisições em vez de uma para cinco downloads; após coalescência e limpeza em finally, Google/Drive GREEN 22 PASS |
| T013 — `node --test --test-name-pattern US3 tests/previas-interface.test.cjs` | RED local, exit 1, 0 PASS / 7 FAIL; mensagem localizada ausente nos casos permissão/rede/timeout/tipo/tamanho/hash/PNG indecodificável |
| T014 — galeria e falhas localizadas | GREEN local, exit 0, 14 PASS, sem falhas/pulos; consulta, links e estado Pronta preservados |
| T015 — `node --test --test-name-pattern US2 tests/previas-interface.test.cjs` | RED local, exit 1, 1 PASS / 4 FAIL; imagem ampliada ausente nas quatro combinações de tema/largura, indisponível já recusada |
| T016 — galeria, falhas e ampliação | GREEN local, exit 0, 19 PASS, sem falhas/pulos; imagem maior, mouse/Enter, Fechar/Escape, retorno de foco e dois Escapes |
| Regressão final das fontes | GREEN, exit 0, 102 PASS, sem falhas/pulos: Pronta/versões/tema UI, HTTP mídia, serviço/regras e Google Drive |
| T017 — `CRM_SCREENSHOTS_PREVIAS=1 node --test tests/previas-interface.test.cjs` | GREEN local, exit 0, 22 PASS, sem falhas/pulos; 12 PNG, 1440×1050 e 390×1050, galeria/ampliada/indisponível nos dois temas; todos inspecionados visualmente pelo coordenador |
| T018 — primeira tentativa estrita e reprodução com TAP/cobertura | Exit 1; reprodução 576 PASS / 1 FAIL / 0 pulos. U06 legado exigia zero imagens em toda a gaveta; contou a miniatura legítima. Correção restrita ao escopo do teste XSS e exigência de src local. Complexidade PASS (571 métricas, máximo 16, 21 avisos), baseline preservada; Semgrep SKIP por ferramenta ausente e audit N/A. Não é gate aprovado |
| T018 — U06 legado, após ajuste do teste | GREEN local filtrado, exit 0, 1 PASS / 0 FAIL / 0 pulos. Título/corpo mantêm HTML literal; campos injetados não criam imagens; miniatura legítima exige src local. Allowlist, hrefs e rel preservados |

## Gate local aprovado — T018

Fonte: `392e1090c02fa4a52ab887c20887a6b79e5aee69`, com autoria/committer noreply e sem coautoria. `node tools/quality-gate.mjs`, Windows, Node 24.19.0 no PATH e Playwright local: exit 0, **577 PASS**, cobertura **95,06966773847803%**, complexidade PASS (**571 métricas, máximo 16, 21 avisos**), baseline preservada. [Relatório sanitizado e hashes das fontes](../../docs/reports/005-local-gate.json).

Semgrep local SKIP por ferramenta ausente; audit N/A sem dependências da aplicação. A tentativa estrita anterior falhou e não substitui esta rodada normal aprovada; o CI estrito deve passar no head entregue. UI fica fora do LCOV; CI Linux conserva pulos UI/PowerShell e não substitui a prova local. Drop zero no modo full não representa comparação histórica. As cinco camadas foram exercitadas e os 12 screenshots inspecionados. Doc-sync, revisão e entrega remota ainda serão registrados; não há integração da 005.

## Documentação — T019

`doc-sync-onboarding` executado após o gate, conforme o agente local: onboarding, arquitetura/imports, módulos, contrato/roteiro e galeria sincronizados. Novo módulo `midia.md` ligado pelo índice, assim como relatório e validação. Conferência documental: 732 links locais, 65 âncoras, 23 pares de cercas, zero erros; regra de estrutura preservada no limite de 60 linhas; `git diff --check` passou. Nenhuma fonte, teste, PNG, gate, CI ou baseline alterada nesta etapa. A documentação distingue implementação/testes de integração e mantém T002 externa pendente.

## Revisão local — T020

Revisor independente do autor das fontes de produção, seguindo `.claude/agents/reviewer.md`, recebeu base `b90980a`, código `392e109`, fontes/diff fornecidos pelo coordenador, contrato, mapa de imports, documentação e resultado do gate. Critical 0, Important confirmado 0, segurança/regressão confirmada 0. Arestas novas correspondem aos imports e o módulo novo é explicitamente exercitado por testes.

Observação inicial em `src/web/app.js:107–117`: imagem ampliada não tem handler de erro próprio; uma nova leitura malsucedida após a miniatura carregar poderia mostrar imagem quebrada. O revisor não afirmou que o navegador refaz esse GET. Investigação pontual com Node 24.19.0/Playwright, servidor real e fakes: carregar cinco miniaturas, promover nova captura sintética válida removendo somente a referência escolhida e ampliar. **Zero novos GET/status; imagem complete=true e naturalWidth=120**, 1 PASS, exit 0, sem pulos (`--test-name-pattern='ampliação trata falha real'`). Chromium reutilizou a imagem decodificada; falha não reproduzida. O teste investigativo condicional foi removido integralmente, preservando os 22 testes aprovados e a fonte do gate. Nenhuma correção de produção por hipótese.

Após receber essa evidência, o revisor retirou o Minor condicional, mantendo somente uma observação não bloqueante de resiliência para outros navegadores. **Recomendou aprovação local no escopo examinado**, sem Critical, Important, segurança ou regressão confirmados. Isso não garante comportamento de todos os navegadores.

Limites: revisão local somente nos pacotes fornecidos, sem shell, filesystem, testes ou scanners; não releu checkout/diff integrais ou todos os testes. CSS, integrações anteriores e parte da documentação foram resumidos pelo coordenador. Gate estrito e review remoto completo do head entregue permanecem necessários.

## Preparação externa do autor

T002 permanece pendente de confirmação: compartilhar a pasta Produções da NTV com a conta de serviço como Leitor. Essa tarefa não bloqueia os testes falsos. Nenhum ID, e-mail, link privado, screenshot ou conteúdo real integra este registro. Testes sintéticos não comprovam compartilhamento ou acesso operacional.
