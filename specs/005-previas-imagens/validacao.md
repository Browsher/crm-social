# Validação — 005, Prévias de imagens

Como conferir uma folha de contato antes de usá-la, este registro separa os testes sintéticos da operação real. O autor aprovou as 21 tarefas em 2026-10-08 e autorizou a implementação no [PR #23](https://github.com/Browsher/crm-social/pull/23), sem merge. Base integrada: `b90980a15fad653937fd024ac3c9bb2738e9d99a`, [tarefa 1 / PR #22](https://github.com/Browsher/crm-social/pull/22).

## Execução da implementação

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

## Gate local aprovado — T018, rodada inicial histórica

Fonte: `392e1090c02fa4a52ab887c20887a6b79e5aee69`, com autoria/committer noreply e sem coautoria. `node tools/quality-gate.mjs`, Windows, Node 24.19.0 no PATH e Playwright local: exit 0, **577 PASS**, cobertura **95,06966773847803%**, complexidade PASS (**571 métricas, máximo 16, 21 avisos**), baseline preservada. [Relatório desta rodada preservado no commit de documentação](https://github.com/Browsher/crm-social/blob/e79c15d1f9546f427103a27864320911e41fbcba/docs/reports/005-local-gate.json). O relatório local corrente acompanha a rodada final abaixo.

Semgrep local SKIP por ferramenta ausente; audit N/A sem dependências da aplicação. A tentativa estrita anterior falhou e não substitui esta rodada normal aprovada; o CI estrito deve passar no head entregue. UI fica fora do LCOV; CI Linux conserva pulos UI/PowerShell e não substitui a prova local. Drop zero no modo full não representa comparação histórica. As cinco camadas foram exercitadas e os 12 screenshots inspecionados. Doc-sync, revisão e entrega remota ainda serão registrados; não há integração da 005.

## Documentação — T019, rodada inicial histórica

`doc-sync-onboarding` executado após o gate, conforme o agente local: onboarding, arquitetura/imports, módulos, contrato/roteiro e galeria sincronizados. Novo módulo `midia.md` ligado pelo índice, assim como relatório e validação. Conferência documental: 732 links locais, 65 âncoras, 23 pares de cercas, zero erros; regra de estrutura preservada no limite de 60 linhas; `git diff --check` passou. Nenhuma fonte, teste, PNG, gate, CI ou baseline alterada nesta etapa. A documentação distingue implementação/testes de integração e mantém T002 externa pendente.

## Revisão local — T020, rodada inicial histórica

Revisor independente do autor das fontes de produção, seguindo `.claude/agents/reviewer.md`, recebeu base `b90980a`, código `392e109`, fontes/diff fornecidos pelo coordenador, contrato, mapa de imports, documentação e resultado do gate. Critical 0, Important confirmado 0, segurança/regressão confirmada 0. Arestas novas correspondem aos imports e o módulo novo é explicitamente exercitado por testes.

Observação inicial em `src/web/app.js:107–117`: imagem ampliada não tem handler de erro próprio; uma nova leitura malsucedida após a miniatura carregar poderia mostrar imagem quebrada. O revisor não afirmou que o navegador refaz esse GET. Investigação pontual com Node 24.19.0/Playwright, servidor real e fakes: carregar cinco miniaturas, promover nova captura sintética válida removendo somente a referência escolhida e ampliar. **Zero novos GET/status; imagem complete=true e naturalWidth=120**, 1 PASS, exit 0, sem pulos (`--test-name-pattern='ampliação trata falha real'`). Chromium reutilizou a imagem decodificada; falha não reproduzida. O teste investigativo condicional foi removido integralmente, preservando os 22 testes aprovados e a fonte do gate. Nenhuma correção de produção por hipótese.

Após receber essa evidência, o revisor retirou o Minor condicional, mantendo somente uma observação não bloqueante de resiliência para outros navegadores. **Recomendou aprovação local no escopo examinado**, sem Critical, Important, segurança ou regressão confirmados. Isso não garante comportamento de todos os navegadores.

Limites: revisão local somente nos pacotes fornecidos, sem shell, filesystem, testes ou scanners; não releu checkout/diff integrais ou todos os testes. CSS, integrações anteriores e parte da documentação foram resumidos pelo coordenador. Gate estrito e review remoto completo do head entregue permanecem necessários.

## Rodadas remotas iniciais — T021

O PR #23 saiu do rascunho no head `e79c15d1f9546f427103a27864320911e41fbcba`, sem merge. [Primeiro CI estrito](https://github.com/Browsher/crm-social/actions/runs/37809663261): testes, cobertura e complexidade PASS; **Semgrep FAIL** por achado médio ou superior, exit 1. O resultado remoto conhecido prevalece sobre o SKIP local; esta rodada não atende ao aceite de segurança.

**Alteração temporária no próprio CI para diagnóstico:** o workflow não publicava relatório nem artefato com a localização dos achados. Em `d40175b`, um passo condicionado à falha exibiu somente regra, arquivo, linha e severidade já sanitizados pelo adaptador. Sem alteração de scanner, versões, packs, configuração, limites, baseline, permissões ou checks. O passo foi removido no commit próprio `e7ec1d218e4df2805274aad8a3834f06a73a3225`; o diff líquido de `.github/`, `tools/`, configuração e baseline em relação à base é vazio. Este registro satisfaz o achado obrigatório **alteração no próprio gate ou CI**, com efeito diagnóstico temporário e efeito líquido zero.

## Correções e triagem dos reviews — T020/T021

Reviews remotos somente leitura: [e79c15d](https://github.com/Browsher/crm-social/pull/23#issuecomment-6064519251), [d40175b](https://github.com/Browsher/crm-social/pull/23#issuecomment-6064626352) e [e7ec1d2](https://github.com/Browsher/crm-social/pull/23#issuecomment-6064754734). O último não encontrou falha de segurança no código; apontou duas pendências Important de evidência/justificativa, tratadas nesta rodada. Seus achados não foram confundidos com aprovação do head posterior.

O [review da fonte 84aae5e](https://github.com/Browsher/crm-social/pull/23#issuecomment-6064910441) confirmou ausência de Critical ou vulnerabilidade confirmada; manteve Important apenas pela documentação de gate/supressão ainda anterior. Ambos recebem nesta entrega causa, escopo da exceção, remoção exata do diagnóstico e provas locais/remotas atuais. Sugestões Minor adicionais não correspondem a defeito confirmado: renovação antecipada de token após revogação, limite de corpo OAuth em host fixo e melhorias futuras de asserções XSS. A renderização atual continua por textContent e os testes exigem texto literal sem elemento injetado nos campos de título/corpo/legenda. O relatório final inclui os 21 avisos de complexidade com identidade AST, arquivo, linha e valor; não infere qual função piorou a partir da diferença de contagens históricas. Nada disso substitui o review do head documental entregue.

**Semgrep, causa sanitizada:** o [diagnóstico d40175b](https://github.com/Browsher/crm-social/actions/runs/37810374189) apontou `generic.secrets.security.detected-google-gcm-service-account.detected-google-gcm-service-account`, `tests/previas-fixtures.cjs:47`, severidade high. A [regra primária](https://github.com/semgrep/semgrep-rules/blob/develop/generic/secrets/security/detected-google-gcm-service-account.yaml) usa regex para o campo type com valor literal de conta de serviço; não exige material de chave. A fixture gera RSA de 2048 bits por `generateKeyPairSync` durante o teste, usa domínio reservado `.invalid` e grava a credencial somente em TEMP. Não havia chave, conta ou segredo operacional versionado. Trata-se de falso positivo de formato, distinto da troca de cache abaixo.

A primeira tentativa (`7bb2bae`) montava o tipo em runtime; embora preservasse a fixture, o review I2 pediu uma justificativa mais auditável. Em `84aae5e406db05c3c8c03f6afc5d35c6334e1263`, os literais foram restaurados e a própria linha recebeu `nosemgrep` **somente para a regra exata**, com comentário justificando a RSA efêmera/TEMP/domínio reservado. Esta é uma exceção explícita de falso positivo: a regra continua ativa nas demais linhas e arquivos, e nenhum pack, configuração, severidade ou baseline foi reduzido. Google/Drive/Sheets: 22 PASS, exit 0, sem falhas ou pulos. O resultado remoto dessa fonte foi conferido na rodada final abaixo.

**Troca de arquivo do cache:** o Minor do primeiro review foi reproduzido antes da correção. `node --test --test-name-pattern='troca entre lstat e open' tests/midia.test.cjs`: RED, exit 1, 0 PASS/1 FAIL. Em TEMP real e sem SHA declarado, outra imagem PNG substituiu o arquivo entre `lstat` e `open`; downloads=0 e bytes substituídos servidos. Em `7bb2bae`, `lerLimitado` passou a conferir tipo/dev/ino, com bigint, do descritor aberto contra a identidade anterior, antes de ler bytes e dentro do try/finally. GREEN mídia+HTTP: 39 PASS, exit 0, sem falhas/pulos; downloads=1, bytes substituídos recusados, descritor fechado/EBADF, captura e recibos idênticos. Isso não promete imutabilidade de conteúdo alterado no mesmo inode; SHA preenchido continua sendo conferido.

| Ponto do review | Tratamento e limite |
| --- | --- |
| CI temporário, Semgrep e evidência de head | Remoção registrada acima; diagnóstico separado da correção. [CI estrito e7ec1d2](https://github.com/Browsher/crm-social/actions/runs/37811283482) PASS: testes/cobertura/complexidade/Semgrep, audit N/A, exit 0, baseline preservada. Essa prova anterior não substitui o CI do head final com a exceção explícita |
| Allowlist/XSS de Pronta | Asserções complementares exigem ausência da URL de pacote recusada em qualquer href da seção e src local em toda imagem legítima. 14 PASS locais, sem falhas/pulos; nenhuma mudança de produção |
| Dois-pontos e demais formas recusadas de ID | Contrato explicita as restrições já implementadas/testadas; nenhuma ampliação da rota |
| Custo da leitura síncrona | Duas resoluções completas da captura por prévia permanecem por contrato; dívida documentada, sem memoização que dispense a reconfirmação final |
| Cache sem limpeza e SHA ausente | Decisões aprovadas preservadas; limpeza futura registrada no roadmap. Mesmo ID/versão/referência sem SHA não comprova conteúdo remoto imutável |
| Drives compartilhados e T002 | Endpoint atual não anuncia supportsAllDrives; localização da pasta e acesso real não foram demonstrados. Registrar o limite para a preparação do autor, sem confundir pasta compartilhada com Shared drive |
| Privacidade do diretório de cache | Depende das permissões/ACL locais herdadas de data/; ignorado por Git e inacessível por estático. Não há garantia contra outro processo com acesso à mesma conta do sistema |
| HEAD e resíduos dos testes RED | GET exclusivo/HEAD 405 é decisão explícita e testada. Substitutos de export mantêm o RED comportamental e não passam se o export desaparecer; melhoria de clareza não bloqueante |
| Falha posterior da imagem ampliada | Investigação real no Chromium registrada em T020; zero novos GET, falha não reproduzida. Observação de resiliência para outros navegadores, sem afirmar cobertura deles |

**Gate Windows após review, fonte e7ec1d2:** primeira tentativa oficial terminou com testes FAIL e contagem total 578, sem TAP diagnóstico persistido pelo adaptador. A causa dessa tentativa não foi identificada; não foi atribuída à fixture nem considerada corrigida apenas por repetição. Reprodução detalhada com os mesmos includes/excludes e cobertura: 578 PASS, 0 FAIL, 0 pulos, exit 0, 112,999 s. Nova execução oficial, sem alteração de fontes: exit 0, 578 PASS, cobertura 95,08284339925174%, complexidade PASS/571 métricas/21 avisos, baseline preservada; Semgrep local SKIP/audit N/A. Esse episódio intermitente fica registrado como limite da evidência. A rodada final abaixo repete T018/T019 após a alteração auditável da fixture.

## Gate final e repetição da documentação — T018/T019

Fonte final de código/testes: `84aae5e406db05c3c8c03f6afc5d35c6334e1263`. `node tools/quality-gate.mjs`, Windows, Node 24.19.0 no PATH e Playwright existente: **exit 0, 578 PASS, sem pulos locais**, cobertura **95,08284339925174%**, complexidade PASS (**571 métricas, máximo 16, 21 avisos**), baseline preservada. Semgrep local SKIP por ausência; audit N/A. [Relatório sanitizado corrente com 13 hashes de fontes](../../docs/reports/005-local-gate.json). Drop zero no modo full não é comparação histórica; UI fora do LCOV e pulos Linux não substituem os testes locais.

[CI estrito desta mesma fonte](https://github.com/Browsher/crm-social/actions/runs/37812480393): **PASS**, testes/cobertura/complexidade/**Semgrep PASS**, audit N/A, exit 0 e baseline preservada. O scanner manteve a configuração/packs da base e validou a exceção pontual documentada da fixture. Esse resultado encerra o FAIL conhecido daquela regra nessa fonte; não é SKIP ou rebaixamento silencioso de achado operacional.

As cinco camadas voltaram a passar após as correções. Os 12 PNG permanecem na fonte visual `392e109`: nenhum CSS, comportamento de galeria/ampliação ou gerador de bytes das imagens mudou depois deles. A interface foi novamente exercitada pelo gate local final. Todos já haviam sido inspecionados pelo coordenador em 1440/390, nos dois temas. A documentação final e a revisão do head de entrega são conferidas após esta prova; nenhum merge da 005 foi executado.

`doc-sync-onboarding` repetido depois desse gate: 13 Markdown de onboarding, arquitetura, módulos e artefatos ativos sincronizados, preservando os arquivos do coordenador e as provas históricas. Checagem desta rodada: 638 links locais, 56 âncoras, 21 pares de cercas, zero erros; índice cobre os 23 Markdown de docs/, estrutura em 60 linhas e `git diff --check` exit 0. PNG sem diff contra `392e109`. Nenhuma fonte, teste, CI ou baseline alterada na documentação.

## Revisão local após as correções — T020

Revisor independente da produção recebeu os deltas `7bb2bae`/`84aae5e`, os resultados RED/GREEN, gate local final, CI estrito e a justificativa da exceção. Recomendou aprovação no escopo dos pacotes, sem Critical, Important, segurança ou regressão confirmados. Conferiu a recusa por identidade do descritor e seu fechamento, além da supressão estritamente de regra/linha sobre o discriminador público da fixture fictícia.

Limites preservados: não executou shell, testes ou scanners, não releu checkout integral e não reivindicou independência sobre testes/fixtures que havia escrito. O coordenador leu os reforços de allowlist/XSS e o teste de troca real; os reviews remotos completos também os examinaram. A prova local não equivale a acesso operacional ao Drive. Depois da documentação, o coordenador conferiu os 13 hashes: zero divergências e nenhum delta de código/testes em relação à fonte do gate. O review remoto do head documental final continua necessário.

## Encerramento da entrega — T021

No head documental `161c07d245d0d3b4dcad63fe78d36de5f0afd2c9`, [quality-gate estrito](https://github.com/Browsher/crm-social/actions/runs/37813693273) e [execução do review](https://github.com/Browsher/crm-social/actions/runs/37813692916) concluíram SUCCESS. O [parecer remoto](https://github.com/Browsher/crm-social/pull/23#issuecomment-6065057282) não encontrou Critical, falha de segurança ou bloqueio de código; sua única Important pede evidência do gate desse mesmo head. O coordenador conferiu o SHA do check aprovado e o diff `84aae5e..161c07d`: somente 15 documentos/relatório, nenhum código, teste, script, config, gate, CI ou baseline. Treze hashes conferidos, zero divergências. Essa evidência resolve a ressalva I1, sem mudar código nem exigir que o revisor tenha executado o gate.

A observação Minor de instabilidade foi investigada também por cinco rodadas Windows de `node --test --test-concurrency=1 tests/google-midia.test.cjs tests/midia.test.cjs`: cada rodada **47 PASS, 0 FAIL, 0 pulos, exit 0**, total 235 PASS. A troca real entre lstat/open continuou recusada em todas. Isso não identifica a causa da tentativa anterior; o diagnóstico intermitente permanece dívida explícita, sem atribuir defeito aos testes de timeout/concorrência por hipótese. As sugestões de ampliação/token/desempenho/eviction mantêm a triagem e os limites já registrados; a alegação de novo GET obrigatório ao ampliar não corresponde à investigação real no Chromium.

O PR #23 está OPEN e fora do rascunho, com descrição/evidências e 12 screenshots sintéticos. As 20 tarefas do agente estão concluídas; T002 externa continua pendente. Commits manuais com autor/committer noreply e sem coautoria. Hook opcional de pós-implementação `speckit.git.commit` conferido e dispensado conforme `tdd-workflow`. O commit de encerramento atualiza somente tarefas e este registro; seus checks/review e a identidade das fontes são conferidos diretamente no PR antes da entrega. **Nenhum merge da 005 ou exclusão de sua branch foi realizado.** Tarefa 1 já integrada pelo [PR #22](https://github.com/Browsher/crm-social/pull/22).

## Preparação externa do autor

T002 permanece pendente de confirmação: compartilhar a pasta Produções da NTV com a conta de serviço como Leitor. Essa tarefa não bloqueia os testes falsos. Nenhum ID, e-mail, link privado, screenshot ou conteúdo real integra este registro. Testes sintéticos não comprovam compartilhamento ou acesso operacional.
