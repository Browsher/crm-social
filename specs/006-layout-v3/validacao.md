# Validação — Layout v3

Como uma nova agenda para as mesmas capturas, a 006 mantém 32 tarefas em duas partes. **A integrada após aprovação explícita em 09/10/2026**, PR #24/main a5be355; **B implementada/testada localmente, não integrada**, PR #25 aberto/anexado e gate local 7a0dd56 e CI estrito do head anterior b5af415 aprovados; CI/review do novo head final pendentes e merge B proibido. As seções da A abaixo conservam o registro histórico anterior à integração.

## Parte A — fonte e escopo históricos, anteriores à integração

Base: `2be585a` (main com 005 integrada). Branch: `codex/006-layout-v3`. Fonte corrigida de código/testes/PNG: `01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`, após adjudicação do review e3. O gate oficial final dessa fonte passou; as medições anteriores permanecem históricas. Fontes anteriores 5ac5d7c/6998d22/d996002/5725b9f/7fc1996/4ab855e e seus resultados ficam históricos. O relatório final identifica essa fonte exata em sourceCommit. Implementados T001–T016: modelo puro, topo único, objetivo recolhível, Semana/Mês e projetos semanais. Planilha/avisos/atalhos permanecem; Publicar/perfil/pop-up/Instagram não implementados.

São seis funções públicas em `src/web/layout-model.js`; servidor acrescenta somente `/layout-model.js` à allowlist estática. Miniaturas usam seleção da 005, carregam somente na tela ativa quando visíveis, mantêm imagem inteira com contain e placeholder na falha. Semana móvel começa centrada em hoje e conserva rolagem ao retornar; futura vazia mostra período no cabeçalho e somente a frase autorizada no corpo. API completa, captura/recibos, projeção, coleta, cache, constituição 1.2.0, configuração, CI/gate e dependências permanecem. Nenhuma nova instalação ou operação editorial.

As duas decisões Medium do analyze estão em [spec.md](spec.md#clarifications--session-2026-10-08) e [contrato](contracts/apresentacao.md): posições sem prévia entram no contador; atualizar mantém a mesma peça aberta com a versão nova ou fecha/restaura foco se ela desaparecer, limita índice excedente e conserva conteúdo na falha. Serão implementadas/testadas somente na B.

## TDD observado

| Camada/comportamento | RED | GREEN focal |
| --- | --- | --- |
| Modelo puro | 1 PASS / 41 FAIL por asserção | 42 PASS |
| HTTP/persistência | 1 PASS / 3 FAIL por estático ausente | 4 PASS |
| Interface inicial | 23 FAIL por asserção, sem erros JS/rede externa | 23 PASS |
| Arte inteira e falha de miniatura/XSS | 1 PASS / 1 FAIL (`cover` versus `contain`) | 2 PASS |
| Hoje centrado no celular e futuro vazio | 0 PASS / 2 FAIL | 2 PASS |

Node 24.19.0 e Playwright existentes; capturas, credenciais efêmeras, transporte e PNG exclusivamente sintéticos, servidores reais em portas efêmeras e TEMP. A promoção atômica em TEMP exigiu execução fora do sandbox; nenhum dado operacional foi lido. Host é verificado com HTTP nativo, pois fetch não transmitia o Host customizado. Consultas/estáticos preservam bytes de capturas/recibos e API completa; cache mantém o contrato da 005.

## Correções após review — fonte d996002

O [review remoto inicial](https://github.com/Browsher/crm-social/pull/24#issuecomment-6067565729) apontou I1 (nome acessível das semanas no Mês), I2 (período ao navegar Mês→Semana) e sete Minor. I1/I2 e M2 (tema com início fora da segunda), M3 (identificação em Sem data), M5 (grupos/datas/miniaturas acessíveis), M6 (duplicatas no índice) e M7 (imports no Mermaid) foram corrigidos. M1 (contagens por data civil versus semana registrada) mantém os dois agrupamentos expressamente contratados; M4 (GET local repetido de imagens) preserva a resolução/autorização da 005. A revisão independente aceitou essas justificativas sem achado de segurança; não são novos estados operacionais.

TDD de 16 casos adicionais, cada grupo observado em RED antes da correção correspondente:

| Correção | RED → GREEN |
| --- | --- |
| Navegação do período Mês/Semana | 4 FAIL → 4 PASS |
| Nome acessível das semanas no Mês | 4 FAIL → 4 PASS |
| Grupos/datas do dia e prévia acessível | 4 FAIL → 4 PASS |
| Tema com início normalizado para segunda-feira | 1 FAIL → 1 PASS |
| Identificação da semana na linha Sem data | 1 FAIL → 1 PASS |
| Fallback sem tema nem período da semana | 1 FAIL → 1 PASS |
| Semana de borda conserva o mês escolhido | 1 FAIL → 1 PASS |

Suíte de interface Layout A focal da rodada d996002: **43 PASS, 0 SKIP**; medição histórica anterior à fonte final. Alternar Semana/Mês sem navegar mantém semana; setas no Mês selecionam a segunda-feira da primeira linha do mês navegado, inclusive cruzamento de ano. Abrir semana de borda conserva o mês do objetivo/pautas; navegar por pauta usa pauta.mes. Nome acessível da semana inclui data/título/estado das peças filtradas, ou Sem peças. Tema normaliza o início registrado para segunda-feira; Sem data mostra tema/período/fallback seguro. Dias usam grupos sem sete landmarks extras, botão anuncia data/hoje, miniatura tem role=img/nome e glifo aria-hidden.

A revisão independente focal do delta `6998d22`→`d996002` não encontrou Critical, Important ou Minor remanescente e considerou o recorte apto **condicionado ao full gate e CI/review do head final**. Não antecipa aprovação remota ou de metadados posteriores. Architecture/index refletem os imports reais e mantêm a 006 somente em seu bloco canônico.

## Segundo review — fonte 5725b9f

O [review remoto de d996002](https://github.com/Browsher/crm-social/pull/24#issuecomment-6067795349) apontou evidência anterior ao código (Important I1), preservação da rolagem (Minor M1), mês nas setas de Semana (M2), rótulo da pauta no cabeçalho (M3) e scaffold RED remanescente no teste de modelo (M4). A evidência é vinculada à fonte exata medida por `sourceCommit` no relatório sanitizado, sem alterar a ferramenta do gate; resultados anteriores não são atribuídos à fonte posterior.

M2/M3 foram reproduzidos em **2 FAIL RED → 2 PASS GREEN** antes das correções. Setas na Semana mantêm o mês selecionado enquanto houver dia da semana nesse mês; quando não há interseção, usam o mês da quinta-feira (maioria dos sete dias). Objetivo/pautas acompanham esse mês. Cabeçalho identifica pauta confirmada disponível como **S# · tema**.

M1 não foi reproduzido: a nova verificação passou **1 PASS antes de qualquer alteração de produção**, com modo completa, uma chamada de atualização confirmada e captura nova. O contêiner #lista permanece; render recria filhos, preservando scrollLeft mesmo oculto. Produção → Atualizar → Planejamento já conserva a rolagem. Trata-se de cobertura preexistente, sem alegar correção ou RED/GREEN.

M4 removeu o scaffold do RED inicial: teste importa layout-model.js diretamente e a VM lê o arquivo diretamente, sem fallback para ausência. Modelo mantém **42 PASS**. Verificação focal histórica da fonte 5725b9f: **88 PASS, 0 SKIP**, sendo **46 de interface Layout + 42 de modelo**. As provas anteriores de 43 UI na fonte d996002 são históricas; aprovação de CI/review exige o head final próprio no PR.

### Migração de expectativas legadas — fonte de testes 7fc1996

O primeiro full gate sobre `5725b9fa94afa8292f1ce0f4387ac872cf87786d` terminou com **exit 1**: nove falhas da suíte de Pautas ainda esperavam Semanas.tema/Tema no cabeçalho anterior, sem **S# · tema** da pauta confirmada. O gate recusou testes e cobertura; complexidade passou. Esse resultado não é aprovação da fonte.

Quatro asserções de `tests/pautas-interface.test.cjs` foram migradas para os rótulos contratuais literais **S1/S2 · Tema sintético**; a suíte Pautas passou com **18 PASS, sem pulos**. Commit somente de testes: `7fc1996e9843812f83054a6eb11c13c730e7d95b`. Código da aplicação e PNG permanecem exatamente na fonte `5725b9f`; o gate aprovado daquela rodada identifica `7fc1996` como fonte medida, sem atribuir a tentativa reprovada à execução posterior.

## Review do head 9848548 — adjudicação e correções finais

O [review remoto do head 9848548](https://github.com/Browsher/crm-social/pull/24#issuecomment-6068176643) trouxe seis Minor. A adjudicação independente confirmou três comportamentos: M2 (progresso de Planejamento deve acompanhar o filtro visível), parte de M3 (semana atual vazia com início posterior no mesmo período não é futura) e parte de M4 (semana registrada sem período não pode ser chamada Sem semana).

Três testes observaram **3 FAIL RED** antes das alterações. A solução aplica filtro apenas ao progresso do Planejamento, compara futuro por segunda-feira civil normalizada e mostra **Período não identificado** para semana registrada sem período, preservando **Sem semana** para órfãs. GREEN confirmado: **3 PASS** na fonte `4ab855e7a39b5aa764877aa9f31e85a51e7b6035`. Verificação focal final: **109 PASS, 0 SKIP**, sendo **49 UI Layout + 42 modelo + 18 Pautas**. O retry do full gate oficial dessa fonte passou, conforme a medição final abaixo; isso não antecipa aprovação remota do head final.

Não houve alteração para M1: objetivo em uma linha com truncamento visual e nome acessível completo é o contrato aprovado. O suposto fallback de pauta com início fora da segunda-feira em M3 foi recusado pela adjudicação: a validação ordinal de src/pautas.cjs impede esse registro como pauta válida; não confundir com Semanas, cujo início pode exigir normalização. A redundância visual das órfãs em M4 é estilística. M5 (complexidade 11) é sugestão opcional, sem refatoração nesta rodada. M6 é documental: app.js/theme.js permanecem fora do LCOV; modelo puro/geradores já eram medidos antes desta rodada, sem nova entrada no denominador atribuída a esse review.

As provas de 673 PASS da fonte 7fc1996 e CI estrito do head 9848548 permanecem históricas; não validam automaticamente as três correções posteriores. CI/review finais e adjudicações ficam registrados no PR #24 por head.

### Tentativa 4ab855e e diagnóstico integral

O primeiro gate oficial de `4ab855e7a39b5aa764877aa9f31e85a51e7b6035` terminou **exit 1**, com testes FAIL/cobertura recusada e complexidade PASS. A causa particular não foi identificada; não atribuir timeout, correção ou causa presumida.

O diagnóstico integral posterior, com os mesmos flags de cobertura e testes rastreados dessa fonte, registrou **676 PASS, 0 FAIL, 0 SKIP**, em **175.784 ms**. A falha anterior não foi reproduzida; nenhum código mudou desde 4ab855e. Esse diagnóstico não substitui o resultado do gate oficial. A execução oficial `node tools/quality-gate.mjs` foi repetida com parametrização intacta e passou com 676 PASS, exit 0 e baseline preservada, conforme a medição final abaixo. Nenhum código foi alterado entre essas execuções; a causa do primeiro exit 1 permanece não identificada.

## Review posterior ao gate 676 — adjudicação do head e3

O [review remoto do head e3](https://github.com/Browsher/crm-social/pull/24#issuecomment-6068582750) registrou seis Minor, sem Critical/Important. M1 confirmou fallback de pauta que podia sugerir origem confirmada quando existia Semana sem vínculo: o fallback Pauta S# de mês · tema passa a existir somente sem registro Semanas para o período. A expectativa legada sem Semanas identifica Pauta S1 de novembro, distinta do cabeçalho de vínculo confirmado.

M4 recebeu guarda defensiva na função pura estadoSimples: somente chaves próprias do mapa são aceitas; constructor/toString/__proto__ retornam Criação. Não se atribui exploração de poluição de protótipo ao fluxo válido: configuração e projeção restringem as colunas. Foram observados **5 FAIL RED**, correspondentes a três casos novos de modelo, um novo de UI e uma expectativa legada migrada. GREEN confirmado dos cinco casos na fonte `01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`. A primeira rodada focal teve 112 PASS/1 FAIL por esperar pautaOrigem undefined, enquanto a API já retorna null; a asserção foi ajustada ao contrato existente, sem nova mudança de produção. A segunda rodada focal teve **113 PASS, 0 SKIP**, sendo **50 UI Layout + 45 modelo + 18 Pautas**. O gate oficial final registrou 680 PASS, exit 0 e baseline preservada, conforme a medição abaixo; CI/review do head final exigem conferência própria no PR.

M2 conserva o registro transparente do primeiro gate 4ab855e exit 1, diagnóstico 676 PASS e retry oficial aprovado sem alteração de código; a causa não identificada não autoriza alegar timeout ou correção. M3 (CSS sem uso) é limpeza opcional, adiada. M5 esclarece a reprodução: geradores vigentes executam a UI atual 006, enquanto os PNG históricos permanecem vinculados às fontes antigas. M6 alinha spec/contrato ao título h2 Semana não identificada e subtítulo compacto Sem semana do grupo órfão, sem alterar a UI. O CI estrito anterior do head e3, job 113527314835, é histórico; CI/review do head final continuam acompanhados no PR por head.
## Regressões, isolamento e acessibilidade

As suítes de interface anteriores foram adaptadas somente nos contratos visuais substituídos: Semana/Mês, projetos, topo e retirada de metadados de agentes. Planilha e seus testes permanecem. Identidade, versões, links seguros, pacote/cópia, galeria/ampliação, falha/no-op, preferência/contraste e restauração de foco foram conservados.

A rodada de regressão inicial teve 102 casos: 99 PASS e três expectativas antigas migradas; a seleção final desses três passou (menu/dias e escala de 500 peças em 1440/390). A conferência delegada final de isolamento registrou **103 PASS, 0 SKIP**. Helpers/geradores históricos de tema/pautas agora injetam serviço de mídia falso com falha 503, garantindo que miniaturas novas não ativem cliente Google real. Evidências históricas não foram regeneradas como provas da 006.

A Parte A verifica claro/escuro, 1440/390, teclado/foco, contraste de texto mínimo 4,5:1 nos cenários testados, objetivo hidden, região semanal própria sem overflow da página, hoje móvel/rolagem preservada, acesso por teclado a semanas vazias/cruzamento de ano, falha individual de imagem e conteúdo seguro. Mês/telas ocultas não pedem imagens; só Atualizar explícito inicia o POST falso. Prova automatizada sintética não demonstra operação editorial real ou todos os conteúdos futuros. src/web/app.js e src/web/theme.js continuam fora do LCOV; o modelo puro layout-model.js e geradores sintéticos já eram medidos antes da última rodada de review, sem atribuir a variação de percentual à entrada desses arquivos; os pulos UI/PowerShell do CI Linux permanecem na dívida M8 e não substituem a prova local Windows.

## Gerador e screenshots

`scripts/screenshots-layout-v3.cjs` usa `tests/layout-browser.cjs` e `tests/layout-fixtures.cjs`, com TEMP validado, porta efêmera, relógio fixo, transporte falso e bloqueio de rede externa. Fecha navegador/servidor antes de remover seus diretórios TEMP exatos. O script real tem testes em `tests/screenshots-layout-v3.test.cjs`, incluídos no gate final.

**12 PNG regenerados em 08/10/2026 às 17:41:25–30**, fonte `01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`: Semana light/1440 mudou em quatro pixels no contorno das miniaturas, sem alteração material, e foi inspecionado/aprovado pelo coordenador; onze PNG idênticos em bytes aos anteriores já aprovados. Histórico: 4ab855e às 17:17:12–22 com um Semana light/1440 alterado aprovado/onze idênticos; 5725b9f às 16:51:53–58 com quatro Semana novos aprovados/oito idênticos; d996002 às 16:41:45–50 com um alterado aprovado/onze idênticos; 5ac5d7c às 16:17 com doze inspecionados. Viewports 1440×1050 e 390×844, Produção fullPage. Oferta/carrossel de cinco páginas PNG 1080×1350/Reels travado sintéticos. [Galeria de 12 links](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-a). Não demonstra acesso real, ZIP, aprovação ou publicação.

## Quality gate Windows — Parte A final

Comando oficial: `node tools/quality-gate.mjs`, Node **24.19.0** e Playwright existentes, Windows local. Fonte final de código/testes/PNG: `01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`. O [relatório final sanitizado](../../docs/reports/006-parte-a-local-gate.json) identifica `sourceCommit: 01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`. A origem/ferramenta e parametrização do gate permanecem intactas; esse campo registra a fonte medida.

| Verificação | Resultado oficial final da fonte 01d772b |
| --- | --- |
| Testes | **680 PASS**, sem pulos locais |
| Cobertura | **95,54924242424242%** (95,5492%) |
| Complexidade | **PASS**, 635 métricas, máximo 16, 19 avisos |
| Semgrep | **SKIP local**, ferramenta CE 1.179.0 ausente |
| Audit | **N/A** |
| Baseline | Preservada (`baselineUpdated: false`) |
| Saída | **exit 0** |

Histórico, sem substituir a medição final: o retry oficial 4ab855e teve 676 PASS, cobertura 95,54924242424242%, complexidade PASS/635 métricas/máximo 16/19 avisos, exit 0 e baseline preservada. Fonte 7fc1996 teve 673 PASS, cobertura 95,54924242424242%, complexidade PASS/635 métricas/máximo 16/19 avisos, exit 0 e baseline preservada. Fonte d996002 teve 670 PASS, cobertura 95,40719696969697%, complexidade PASS/635 métricas/máximo 16/19 avisos, exit 0 e baseline preservada. Fonte 5ac5d7c teve 654 PASS, cobertura 95,40719696969697%, complexidade PASS/634 métricas/máximo 16/19 avisos, exit 0 e baseline preservada; preliminar anterior teve 654 PASS, cobertura 95,123106%, 632 métricas/máximo 16/19 avisos. Nessas execuções locais, Semgrep SKIP/audit N/A. As tentativas 5725b9f exit 1 (expectativas Pautas migradas) e 4ab855e exit 1 (não reproduzido, causa não identificada), o diagnóstico integral e o retry oficial estão registrados separadamente acima.

Prova local não substitui CI/review do head final; Semgrep SKIP não é PASS. Metadados documentais posteriores não mudam código/PNG/testes medidos, mas precisam de conferência do próprio head no PR.
## Fechamento e entrega históricos da Parte A

T024–T028 executadas no recorte A; T031 doc-sync-onboarding sincronizou AGENTS/README/ROADMAP, índice, arquitetura/import-map, módulos web/servidor/modelo, telas/mockups/galeria e artefatos 006. Não há mapa Graphify neste checkout; Mermaid da arquitetura registra app → layout-model e gerador → layout-browser → fixtures/servidor com mídia falsa. Só documentos `.md` foram alterados por doc-sync; templates/skills e constituição foram preservados. Sonnet/Haiku indisponíveis neste host; documentação usou fallback GPT-6.1-sol High.

Histórico de commits: código/PNG/gate inicial `5ac5d7c`, documentação inicial/head de abertura `6998d22a9292e3b166be27cc97c332876a07e83c`, primeiras correções `d9960021192d25f401f1336820bfc50fab3d2d47`. Rodadas posteriores: código/PNG 5725b9f, migração de testes 7fc1996 e metadados/review 9848548. Correções seguintes/retry oficial histórico: `4ab855e7a39b5aa764877aa9f31e85a51e7b6035`. Fonte final de código/testes/PNG e gate oficial: `01d772bd66a6116c04d0a52ecd5a311e8afc0bb9`. Push somente Browsher/crm-social; [PR #24 — Parte A](https://github.com/Browsher/crm-social/pull/24) aberto/anexado. Metadados documentais posteriores exigem checks próprios do head final no PR, sem autoatribuir aprovações de uma fonte a outra.

A revisão independente de código (T029), o CI quality-gate e o review remoto (T032) são acompanhados e têm seus resultados registrados no PR #24 por head. **Conferir o head final e exigir aprovação de revisão independente, CI e review remoto antes de concluir a entrega.** Este registro não antecipa aprovação.

Prova remota histórica do head inicial `6998d22a9292e3b166be27cc97c332876a07e83c`: [CI quality-gate, execução 37832486686](https://github.com/Browsher/crm-social/actions/runs/37832486686), job `113501081741`, PASS. O coordenador conferiu testes/cobertura/complexidade/Semgrep PASS, exit 0 e `baselineUpdated: false`. Vale somente para esse head inicial.

Prova remota da fonte corrigida `d9960021192d25f401f1336820bfc50fab3d2d47`: [CI quality-gate estrito, execução 37834181148](https://github.com/Browsher/crm-social/actions/runs/37834181148), job `113506892559`, PASS. O coordenador conferiu no log Semgrep PASS, exit 0 e baseline preservada. O head final após metadados documentais exige conferência própria no PR, inclusive review remoto; não atribuir automaticamente estas aprovações ao head posterior.

O full gate local final da fonte 01d772b passou com 680 PASS. O retry oficial histórico da fonte 4ab855e passou; sua tentativa anterior exit 1 não foi reproduzida e a causa permanece não identificada. Resultados de revisão independente, CI e review remoto são registrados e conferidos no PR por head, incluindo o head final; correções posteriores de código exigem repetir verificações afetadas. Commits usam noreply sem coautoria. Estado histórico no fechamento A: nenhum merge então autorizado, B ainda não iniciada. A aprovação/integração em 09/10 e a execução B estão registradas abaixo.

## Parte B — implementada e testada localmente

Como uma prévia do material que será publicado manualmente, B acrescenta o celular de demonstração e a fila Publicar sem comandar a operação. Autorização em 09/10/2026 após aprovação da A; branch `codex/006-layout-v3-parte-b`, base/main `a5be3553a26f6a7af9fdb9e84bbd24851a561ce2`. O outro chat já havia feito o merge aprovado do [PR #24](https://github.com/Browsher/crm-social/pull/24); o coordenador conferiu SHA local/remoto e preservou os testes iniciados ali. B permanece **não integrada**, no [PR #25](https://github.com/Browsher/crm-social/pull/25), aberto/anexado, com CI/review do head documental final pendentes e **sem autorização de merge**.

### Fonte e fronteiras

Fonte histórica do primeiro fechamento B: `60ef6282ce937fc13a8d92cc15278be2a98d79bc`; fonte histórica após primeiro review: `f46db33389b1d8bde53068de8b555e56d5baf05a`, com 20 PNG então da mesma fonte; fechamento vigente: código/testes 7a0dd56 e PNG 800d7ca, registrados abaixo. T017–T023 implementadas/testadas; regressões/acessibilidade/gerador/evidências/fechamento local T024–T028/T030/T031 executados. T029 tem correção/revisão focal confirmada; revisão final da documentação ainda pendente. T032 exige PR/anexo e CI/review do head final, sem antecipar aprovação.

instagram.js/configuração de perfil públicas sintéticas, dez derivados puros, Publicar e menu final sem Planilha. Servidor acrescenta somente /perfil-config.js e /instagram.js à allowlist existente. API inteira e view.planilha para objetivo permanecem; coleta, snapshot, cache, configuração operacional, constituição 1.2.0, CI/gate/baseline e dependências preservados. Sem operação real, conta/ID de planilha, credenciais ou dados privados em evidência.

### TDD, regressões e correções

| Recorte | Evidência observada |
| --- | --- |
| Derivados B | RED 44 PASS/13 FAIL antes de fila/publicadas/slots; GREEN 57 PASS, sem mutação, galerias/vigência preservadas. |
| Pop-up real | RED 15 FAIL com módulos inexistentes; GREEN 17 PASS/0 SKIP, imagem única/carrossel/slots/controles/gesto/foco/configuração/atualização. Falha anterior de permissão TEMP não foi tratada como RED de comportamento. |
| UI B inicial | RED 0 PASS/10 FAIL para fila/menu/tipos/abertura; implementação e migração de seletores mobile ocultos/escopo Produção produziram GREEN. |
| Data publicada impossível | RED 1 FAIL (30 de fevereiro normalizado indevidamente); validação ISO/dia real compartilhada e UI corrigidas. Modelo/UI então 119 PASS = 57 modelo + 62 UI. |
| Regressões anteriores | 212 PASS: 102 interface e 110 demais selecionadas; API/66 mínimos/opcionais/avisos/Histórico preservados, clipboard, versões, galeria, links, falha/no-op e contraste. Expectativas deliberadamente removidas migradas, sem diminuir contrato backend. |
| Mês em 390 | Assert de texto completo: RED 2 PASS/2 FAIL, rótulo Carrossel cortado; ajuste de espaçamento deu 4 PASS nos dois temas/larguras. |
| Visual da prévia | Inspeção detectou pontos duplicados; CSS passou a desenhar somente um ponto por posição, preservando nome acessível. 17 casos de prévia e focal 6 (quatro combinações/duas alturas baixas) passaram. |
| Gerador real | 3 PASS (duas VM e uma CLI); saída 20 PNG e preservação da A, guardas/limpeza/falha verificadas. |
| HTTP | 6 PASS incluindo novos estáticos GET/HEAD e guardas; bytes de captura/recibos preservados em TEMP. |

A revisão independente com fallback GPT-6-astra High encontrou Important: US3 previa abertura pela gaveta, mas ela faltava e o teste antigo criava um acionador sintético e chamava diretamente o módulo real. Cinco novos testes com clique no acionador real observaram RED 5 FAIL; integração do botão e resolução de ID vigente no clique produziram GREEN focal 6 PASS (incluindo Produção), em quatro configurações e remoção. Fonte da correção: `3fd9e0f7d4e75ee6600e48a933707dd5b15f4d20`; UI Layout passou a 67 casos. Revisão focal confirmou o Important resolvido, sem novo achado, condicionada ao gate/docs/head final.

O gate nessa fonte falhou; diagnóstico TAP: 728 casos, 724 PASS/4 FAIL/0 SKIP, todos na suíte Pronta. O botão da prévia antes do bloco Pronta alterava a ordem esperada. RED focal 1 FAIL; correção `60ef628` moveu o botão depois de Pronta, sem mudar a asserção de regressão; suíte Pronta: 14 PASS/0 SKIP. O gate oficial dessa fonte histórica passou, abaixo. Não apagar essas falhas nem atribuir os números da fonte preliminar 09139b à fonte final.

### Screenshots e isolamento

Rodada histórica: 20 PNG B gerados na fonte **3fd9e0f**, todos inspecionados; a [galeria B atual](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-b) foi depois regenerada em f46db33 e finalmente 800d7ca. Os enquadramentos são: Semana/Mês com tipos/Produção/Publicar/Instagram × claro/escuro × 1440/390. A fonte 60ef628 move apenas botão interno da gaveta fora desses enquadramentos; não atribuir a geração dos PNG à fonte 60ef628. Captura/relógio 08/10/2026, perfil.exemplo e arte gradiente 1080×1350 sintéticos; oferta, carrossel de cinco páginas com contador 1/5 e Reels travado. Viewports 1440×1050/390×844; Produção fullPage 1440×1763/390×2823 e Publicar390×1402.

Galeria A de 12 PNG e históricos 001–005 intactos. Na primeira implementação B, geradores de tema/pautas executavam Publicar sob nomes legados de “planilha”, e apenas as cópias CLI dos testes tinham galeria TEMP; o destino padrão ainda podia sobrescrever evidência antiga. O review corrigiu isso em f46db33 com diretórios dedicados e nomes publicar, conforme prova abaixo. Servidor/serviço reais em TEMP validado/porta efêmera, transporte/credencial falsos, rede externa bloqueada, nenhuma escrita Google/publicação. Testes de gesto não demonstram arrasto físico ou todos os conteúdos futuros.

### Quality gate Windows — Parte B histórico 60ef628

Comando oficial `node tools/quality-gate.mjs`, Node **24.19.0**, Playwright existente, Windows local. Naquele fechamento, o relatório então registrava sourceCommit **60ef6282ce937fc13a8d92cc15278be2a98d79bc** e screenshotSourceCommit **3fd9e0f7d4e75ee6600e48a933707dd5b15f4d20**. O [relatório atual](../../docs/reports/006-parte-b-local-gate.json) identifica f46db33, cuja medição final está descrita abaixo.

| Verificação | Resultado final local |
| --- | --- |
| Testes | **728 PASS, 0 SKIP**, cinco camadas locais |
| Cobertura | **95,50717924965262%**, PASS, modo full/drop 0; zero não é comparação histórica |
| Complexidade | PASS, **683 métricas**, máximo **16**, **17 avisos** |
| Semgrep | SKIP local: CE 1.179.0 ausente; CI estrito deve verificar |
| Audit | N/A, sem package.json/dependências de aplicação |
| Exit / baseline | **0 / baselineUpdated false**, preservada |

App/theme/instagram/perfil-config ficam fora do LCOV; comportamento verificado por Playwright. Layout-model e geradores sintéticos são medidos. CI Linux conserva pulos UI/PowerShell (M8); prova local não substitui CI estrito/review do head final. Nenhum código de CI/gate ou baseline foi alterado.

### Doc-sync do primeiro fechamento B — histórico

doc-sync-onboarding executado após o gate oficial final, conforme a regra local, exclusivamente em .md. Onboarding/roadmap/índice, arquitetura/Mermaid, módulos web/servidor/modelo e novos instagram/perfil-config, telas/galeria e artefatos 006 sincronizados. Não há mapa Graphify neste checkout; imports reais ficam no Mermaid. Fontes de código e PNG diferenciadas, 32 IDs preservados e históricos intactos. Sonnet/Haiku indisponíveis no host: documentação usou fallback herdado. Conferência documental: 792 caminhos relativos existentes, cercas balanceadas, índice cobrindo todos os .md autorais de docs/, 32 IDs únicos e somente T029/T032 abertos; git diff --check sem erro.

Push de código autorizado somente Browsher/crm-social; commits com noreply do autor sem coautoria. Estado histórico desse fechamento: PR próprio B, anexo, CI e revisão final por head ainda pendentes. O relatório local verde não autoriza merge nem declara aprovação remota. T029/T032 permanecem abertos até suas etapas finais; o coordenador registra links/resultados por head no PR e nesta validação quando confirmados.

### Correções históricas no PR #25 — fonte f46db33

[PR #25 — Parte B](https://github.com/Browsher/crm-social/pull/25) aberto/anexado, sem merge. Fonte histórica comum de **código/testes e 20 PNG** após o primeiro review: `f46db33389b1d8bde53068de8b555e56d5baf05a`. As provas 3fd9e0f/60ef628 acima permanecem históricas; a galeria então foi regenerada/inspecionada em f46db33 e posteriormente atualizada na fonte 800d7ca.

| Achado / recorte | RED → GREEN e comportamento final |
| --- | --- |
| I1 — selo sem instante antigo/falha inicial | RED 8 FAIL → 8 PASS, mais 5 focais, 4 U03 e 4 de modal em altura 480. Captura antiga/falha conserva data/hora São Paulo; falha inicial mostra Atualização falhou · sem dados; no-op/releitura/recarga não renovam o instante; mesmo selo no modal. UI Layout: 75 casos finais. |
| I2 — geradores podiam sobrescrever galeria antiga | RED 5 PASS/2 FAIL → 7 PASS/0 SKIP. Destinos padrão dedicados tema-layout-v3/pautas-layout-v3, nomes publicar, preservação byte a byte de 16/20 arquivos com nomes históricos e marcadores sintéticos nos testes CLI em cópia TEMP. PNG históricos versionados continuam intactos. Em uso normal a saída é galeria do workspace; servidor/dados ficam em TEMP. |
| M3 — nomes de navegação de Reels | RED 1 FAIL → 18 PASS de prévia, sem SKIP. Pontos/setas anunciam Cena N · início/final do destino, reaplicados na releitura mesmo com total constante. |
| M4 — Imagem única saltava primeiro slot ausente | RED 57 PASS/3 FAIL → 60 PASS do modelo. 1/1 usa primeira posição lógica, mesmo null; não salta à seguinte nem substitui por fallback quando há posições. Seleção histórica da galeria 005 intacta. |
| M5 — destino legado do selo | API conserva selo.destino = planilha; cliente ignora, sem mudança de contrato nem página visual. |

A revisão independente do delta f46db33 não encontrou achados funcionais/de segurança remanescentes, condicionada a documentação e verificações do head final. Correções Minor documentais do coordenador foram preservadas: detalhesCaptura permanece simplificada para o selo; nomes/imports/rotas devem refletir o código real. Limites remanescentes não prescritos no escopo: Travadas conserva ordem da API sem limite próprio; formato vazio não ganha rótulo novo; falha de GET no modal conserva erro/vista anterior, enquanto o resultado do botão resume o POST.

### Tentativa histórica f46db33 não reproduzida e gate oficial repetido

A primeira execução oficial de f46db33 teve **exit 1**, testes FAIL com contagem 740 e cobertura FAIL; o TAP detalhado não foi retido. Não há evidência para atribuir a falha a um caso, timeout ou correção. O diagnóstico integral `node --test --experimental-test-coverage` na **mesma fonte, sem mudança de código**, observou **740 PASS, 0 FAIL, 0 SKIP, exit 0**. A execução oficial seguinte também passou, sem alteração interveniente. A causa inicial permanece não identificada e não reproduzida.

Comando oficial daquela rodada: `node tools/quality-gate.mjs`, Windows/Node **24.19.0**, Playwright existente. O relatório então registrava sourceCommit e screenshotSourceCommit iguais a **f46db33389b1d8bde53068de8b555e56d5baf05a**; o [relatório atual](../../docs/reports/006-parte-b-local-gate.json) identifica o fechamento7a0dd56/PNG 800d7ca descrito abaixo.

| Verificação | Execução oficial final repetida |
| --- | --- |
| Testes | **740 PASS, 0 SKIP**, cinco camadas locais |
| Cobertura | **95,51341350601295%**, PASS, modo full/drop 0; não é comparação histórica |
| Complexidade | PASS, **684 métricas**, máximo **16**, **18 avisos** |
| Semgrep | SKIP local, CE 1.179.0 ausente |
| Audit | N/A, sem dependências de aplicação |
| Exit / baseline | **0 / baselineUpdated false**, preservada |

UI app/theme/instagram/perfil-config fora do LCOV, verificada por Playwright; modelo/geradores medidos. O gate e sua parametrização, baseline, CI e contratos continuam intactos. Esta repetição é evidência nova da mesma fonte, não uma suposta correção da tentativa inicial.

### CI/review históricos da fonte f46db33 e fechamento documental b5

O coordenador confirmou o [CI quality-gate estrito, execução 37948854542](https://github.com/Browsher/crm-social/actions/runs/37948854542), do head **f46db33389b1d8bde53068de8b555e56d5baf05a**, PASS, incluindo Semgrep PASS, exit 0 e baseline preservada. Vale somente para esse head; documentação posterior exige sua própria conferência.

O [review remoto dessa fonte](https://github.com/Browsher/crm-social/pull/25#issuecomment-6083616546) pediu vincular o gate à fonte vigente e justificar o Constitution Check. O relatório final acima vincula a execução a f46db33. A [spec](spec.md#decisão-de-apresentação-e-alcance-constitucional-já-fornecidos-pelo-autor) e o [plano](plan.md#constitution-check) registram o pedido explícito original do autor, reiterado na B em 09/10, para remover páginas de Planilha/dados e metadados de agentes, mantendo dados completos na API. Fonte/período/instante/falhas/avisos permanecem identificados na captura/GET existente; UI conserva instante e falhas no selo e motivo simples de travamento. O trade-off é perder inspeção técnica direta nessas telas, sem perder dados/contratos ou inventar estado operacional. Não houve nova resposta de clarify, emenda ou aprovação fabricada.

doc-sync-onboarding repetido após o **gate oficial final f46db33**, somente em .md, preservando as três correções documentais Minor do coordenador e todos os históricos. Atualizados onboarding/status/PR, arquitetura/imports, módulos/rotas, galeria/fontes, contrato/modelo/quickstart/decisões/TDD/tasks. Não há mapa Graphify neste checkout; Mermaid registra relações reais. Sonnet/Haiku indisponíveis, fallback herdado. Conferência documental final: 796 caminhos relativos existentes, cercas balanceadas, índice cobrindo todos os .md de docs/, regra de estrutura com 60 linhas e diff --check dos .md sem erro. 32 IDs mantidos; T029/T032 continuam abertos para revisão independente/documental, CI/review do **head final posterior** e entrega. PR #25 permanece aberto, **merge B proibido**.

### Review do head b5 e sinais mínimos — produção 800d7ca

O [review remoto do head b5af415](https://github.com/Browsher/crm-social/pull/25#issuecomment-6083978610) apontou I1 (avisos invisíveis), I2 (evidência de CI final), M2 (foco ao desabilitar seta), M1 (seleção distinta da miniatura), M5 (detalhes históricos) e M6 (personalização do perfil). Produção corrigida em **800d7ca2930284da4566f33dae5f3699e0eecc84**; o [PR #25](https://github.com/Browsher/crm-social/pull/25) continua aberto/anexado, sem merge.

| Recorte | Evidência e comportamento |
| --- | --- |
| I1 — sinal mínimo de avisos | RED 8 FAIL → GREEN 8, mais 4 casos de frescor; focal 12 PASS. Único badge global **Dados a confirmar**, role=status em capture-actions, visível quando há captura e view.avisos; acompanha os mesmos nós ao modal. Resumo de peça com detalhes.avisos acrescenta a mesma frase. Falha global sem peças também sinaliza; nova captura sem avisos oculta. |
| Ajuste de asserção na primeira tentativa GREEN | O teste esperava que a lista de avisos permanecesse exatamente igual após falha. Foi corrigido para a lista anterior mais o objeto GLOBAL já previsto na API; nenhum backend foi alterado. |
| M2 — foco nos limites do modal | RED 2 FAIL → suíte de prévia **20 PASS**. marcarPosicao salva activeElement antes de desabilitar setas; se a seta focada ficou disabled, foca outra habilitada ou Fechar. Tab/Esc continuam no diálogo. |
| M1 — seleção de mídia | Divergência deliberada: miniatura/galeria da 005 escolhe a próxima imagem disponível; modal Imagem 1/1 conserva a primeira posição lógica null. Contrato/modelo documentados, sem modificar a galeria. |
| M5 — história e arquitetura | ROADMAP mantém 005 fonte 4521975/578 PASS e restaura cobertura 95,0881%,571 métricas/max16/21 avisos/baseline false; parágrafos antigos de Planilha/avisos na arquitetura são explicitamente históricos. |
| M6 — perfil | Exemplo versionado perfil.exemplo permanece sintético. Nome real seria personalização somente local, nunca commit/PR/log/screenshot público; não há mecanismo ignored/env implementado, e nenhum nome real foi fornecido/consultado. |

UI Layout tem **83 casos**, modelo **60**, modal **20**. Selo/instante/falha/no-op continuam integrais. O novo status apenas deriva avisos existentes da API; não expõe nome de agente, tabela, valor técnico ou texto explicativo, nem cria estado editorial. O Constitution Check preserva a decisão explícita do autor de remover páginas técnicas e registra a visibilidade mínima de incerteza mantida na interface, sem nova autorização/emenda.

A revisão independente preliminar do delta 800 não encontrou problema; revisão completa de código/documentos e remota do novo head final ainda pendentes. O coordenador conferiu invariância de CI/tools/gate/constituição/configuração/coleta/projeção/mídia/captura/cache; PNG históricos fora da galeria B continuam intactos.

### Gate 800 falhou por expectativa conhecida; gate 7a0dd56 aprovado

A execução oficial de 800d7ca falhou com contagem 750, sem TAP retido. Diagnóstico integral com observador de stdout em destino ignorado, sem alterar tooling, reproduziu **749 PASS/1 FAIL/0 SKIP**: U-final singular em tests/interface.test.cjs esperava **1 cena · sem revisão**, mas a fixture tem um aviso e o contrato visual agora acrescenta **Dados a confirmar**. Isso é diferente da tentativa f46db33 não reproduzida, cuja causa permanece desconhecida.

A fonte **7a0dd56375ff06436fa9cecf8e59f14bc35a7585** altera somente essa expectativa exata para **1 cena · sem revisão · Dados a confirmar**, preservando a asserção de API com um aviso e o caso singular; focal **1 PASS**. Não houve alteração de código de produção/PNG ou backend. O gate oficial normal seguinte passou.

Comando final `node tools/quality-gate.mjs`, Windows/Node **24.19.0**, Playwright existente. [Relatório atual sanitizado](../../docs/reports/006-parte-b-local-gate.json): sourceCommit **7a0dd56375ff06436fa9cecf8e59f14bc35a7585**, screenshotSourceCommit **800d7ca2930284da4566f33dae5f3699e0eecc84**.

| Verificação | Resultado oficial final local |
| --- | --- |
| Testes | **750 PASS, 0 SKIP**, cinco camadas locais |
| Cobertura | **95,51341350601295%**, PASS, full/drop 0; não é comparação histórica |
| Complexidade | PASS, **685 métricas**, máximo **16**, **18 avisos** |
| Semgrep | SKIP local, CE 1.179.0 ausente; CI estrito deve verificar |
| Audit | N/A, zero dependências de aplicação |
| Exit / baseline | **0 / baselineUpdated false**, preservada |

20 PNG B regenerados/inspecionados em **800d7ca**, com mesmas combinações/viewports/dimensões e fixtures sintéticas da galeria; 7a0dd56 não mudou nenhum PNG. Não atribuir sua geração ao commit de teste. App/theme/instagram/perfil-config fora do LCOV e comportamento verificado em navegador; modelo/geradores medidos. T030 registra o gate vigente, sem confundir a falha de 800 e a correção 7a0 com a causa não identificada de f46.

### CI anterior comprovado; novo head ainda exige checks/review

O coordenador verificou o [CI estrito do head b5af415, execução 37951532786](https://github.com/Browsher/crm-social/actions/runs/37951532786), **SUCCESS**, Semgrep PASS, exit 0/baseline false. Head exato: **b5af4152d7f6705afcaadef03f737a9917bb3196**; diff f46db33→b5af415 contém somente 21 .md e 1 JSON, sem fonte de produção/testes/PNG. Essa prova documental anterior não aprova automaticamente 800d7ca/7a0dd56 nem o novo head posterior.

doc-sync-onboarding executado novamente como última etapa depois do gate 7a0dd56, exclusivamente nos 21 .md de onboarding/feature006. Fontes de código/testes e PNG diferenciadas, históricos f46/740/60ef/728/A/001–005 preservados; Sonnet/Haiku indisponíveis, fallback herdado. Não há mapa Graphify no checkout, e Mermaid reflete relações reais. Conferência documental: 797 caminhos relativos existentes, cercas balanceadas, índice cobrindo todos os .md de docs/, regra de estrutura com 60 linhas e diff --check dos .md sem erro. **32 IDs mantidos; T029/T032 ficam abertos** para revisão independente completa, CI/review do head final e entrega. PR #25 aberto/anexado, **merge B proibido**.
