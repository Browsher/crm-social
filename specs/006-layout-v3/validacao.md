# Validação — Layout v3

A Parte A entrega uma nova forma de acompanhar as mesmas capturas. O autor manteve 32 tarefas e autorizou duas entregas em 08/10/2026. **Parte A implementada e testada localmente, não integrada; Parte B não iniciada e dependente do ok explícito do autor na A. Nenhum merge autorizado.**

## Parte A — fonte e escopo

Base: `2be585a` (main com 005 integrada). Branch: `codex/006-layout-v3`. Fonte corrigida de código/PNG: `5725b9fa94afa8292f1ce0f4387ac872cf87786d`, baseada em d996002. Fontes anteriores `5ac5d7c` (código/PNG/gate inicial), `6998d22a9292e3b166be27cc97c332876a07e83c` (documentação/head inicial) e `d9960021192d25f401f1336820bfc50fab3d2d47` (primeira correção) permanecem históricas. Fonte final de testes/gate: `7fc1996e9843812f83054a6eb11c13c730e7d95b`, que apenas migra expectativas legadas e mantém código/PNG 5725b9f. O relatório final mede essa fonte e a identifica em sourceCommit. Implementados T001–T016: modelo puro, topo único, objetivo recolhível, Semana/Mês e projetos semanais. Planilha/avisos/atalhos permanecem; Publicar/perfil/pop-up/Instagram não implementados.

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

O [review remoto de d996002](https://github.com/Browsher/crm-social/pull/24#issuecomment-6067795349) apontou evidência anterior ao código (Important I1), preservação da rolagem (Minor M1), mês nas setas de Semana (M2), rótulo da pauta no cabeçalho (M3) e scaffold RED remanescente no teste de modelo (M4). O registro final vincula o gate à fonte de testes 7fc1996, inclusive `sourceCommit` no relatório sanitizado, sem alterar a ferramenta do gate.

M2/M3 foram reproduzidos em **2 FAIL RED → 2 PASS GREEN** antes das correções. Setas na Semana mantêm o mês selecionado enquanto houver dia da semana nesse mês; quando não há interseção, usam o mês da quinta-feira (maioria dos sete dias). Objetivo/pautas acompanham esse mês. Cabeçalho identifica pauta confirmada disponível como **S# · tema**.

M1 não foi reproduzido: a nova verificação passou **1 PASS antes de qualquer alteração de produção**, com modo completa, uma chamada de atualização confirmada e captura nova. O contêiner #lista permanece; render recria filhos, preservando scrollLeft mesmo oculto. Produção → Atualizar → Planejamento já conserva a rolagem. Trata-se de cobertura preexistente, sem alegar correção ou RED/GREEN.

M4 removeu o scaffold do RED inicial: teste importa layout-model.js diretamente e a VM lê o arquivo diretamente, sem fallback para ausência. Modelo mantém **42 PASS**. Verificação focal da fonte 5725b9f: **88 PASS, 0 SKIP**, sendo **46 de interface Layout + 42 de modelo**. As provas anteriores de 43 UI na fonte d996002 são históricas; aprovação de CI/review exige o head final próprio no PR.

### Migração de expectativas legadas — fonte de testes 7fc1996

O primeiro full gate sobre `5725b9fa94afa8292f1ce0f4387ac872cf87786d` terminou com **exit 1**: nove falhas da suíte de Pautas ainda esperavam Semanas.tema/Tema no cabeçalho anterior, sem **S# · tema** da pauta confirmada. O gate recusou testes e cobertura; complexidade passou. Esse resultado não é aprovação da fonte.

Quatro asserções de `tests/pautas-interface.test.cjs` foram migradas para os rótulos contratuais literais **S1/S2 · Tema sintético**; a suíte Pautas passou com **18 PASS, sem pulos**. Commit somente de testes: `7fc1996e9843812f83054a6eb11c13c730e7d95b`. Código da aplicação e PNG permanecem exatamente na fonte `5725b9f`; o full gate final aprovado identifica `7fc1996` como fonte medida, sem atribuir a tentativa reprovada à execução posterior.

## Regressões, isolamento e acessibilidade

As suítes de interface anteriores foram adaptadas somente nos contratos visuais substituídos: Semana/Mês, projetos, topo e retirada de metadados de agentes. Planilha e seus testes permanecem. Identidade, versões, links seguros, pacote/cópia, galeria/ampliação, falha/no-op, preferência/contraste e restauração de foco foram conservados.

A rodada de regressão inicial teve 102 casos: 99 PASS e três expectativas antigas migradas; a seleção final desses três passou (menu/dias e escala de 500 peças em 1440/390). A conferência delegada final de isolamento registrou **103 PASS, 0 SKIP**. Helpers/geradores históricos de tema/pautas agora injetam serviço de mídia falso com falha 503, garantindo que miniaturas novas não ativem cliente Google real. Evidências históricas não foram regeneradas como provas da 006.

A Parte A verifica claro/escuro, 1440/390, teclado/foco, contraste de texto mínimo 4,5:1 nos cenários testados, objetivo hidden, região semanal própria sem overflow da página, hoje móvel/rolagem preservada, acesso por teclado a semanas vazias/cruzamento de ano, falha individual de imagem e conteúdo seguro. Mês/telas ocultas não pedem imagens; só Atualizar explícito inicia o POST falso. Prova automatizada sintética não demonstra operação editorial real ou todos os conteúdos futuros. UI continua fora do LCOV; os pulos UI/PowerShell do CI Linux permanecem na dívida M8 e não substituem a prova local Windows.

## Gerador e screenshots

`scripts/screenshots-layout-v3.cjs` usa `tests/layout-browser.cjs` e `tests/layout-fixtures.cjs`, com TEMP validado, porta efêmera, relógio fixo, transporte falso e bloqueio de rede externa. Fecha navegador/servidor antes de remover seus diretórios TEMP exatos. O script real tem testes em `tests/screenshots-layout-v3.test.cjs`, incluídos no gate final.

**12 PNG regenerados em 08/10/2026 às 16:51:53–58**, fonte código/PNG `5725b9fa94afa8292f1ce0f4387ac872cf87786d`: quatro de Semana (dois temas × 1440/390) mudaram e foram inspecionados/aprovados pelo coordenador; oito de Mês/Produção são idênticos em bytes aos anteriores já aprovados. Rodada d996002 de 16:41:45–50 teve onze idênticos/um alterado aprovado; rodada 5ac5d7c de 16:17 teve os doze inspecionados. Viewports 1440×1050 e 390×844, Produção fullPage. Oferta/carrossel de cinco páginas PNG 1080×1350/Reels travado são sintéticos. [Galeria de 12 links](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-a). Não demonstra acesso real, ZIP, aprovação ou publicação.

## Quality gate Windows — Parte A final

Comando: `node tools/quality-gate.mjs`, Node **24.19.0** e Playwright existentes, Windows local. Fonte final de testes/gate: `7fc1996e9843812f83054a6eb11c13c730e7d95b`; código da aplicação e PNG são exatamente os de `5725b9fa94afa8292f1ce0f4387ac872cf87786d`. A única diferença entre essas fontes é a migração de expectativas legadas da suíte Pautas. O [relatório final sanitizado](../../docs/reports/006-parte-a-local-gate.json) identifica `sourceCommit: 7fc1996e9843812f83054a6eb11c13c730e7d95b`. A origem/ferramenta do gate permanece intacta; esse campo registra a fonte medida.

| Verificação | Resultado final da fonte 7fc1996 |
| --- | --- |
| Testes | **673 PASS**, sem pulos locais |
| Cobertura | **95,54924242424242%** (95,5492%) |
| Complexidade | **PASS**, 635 métricas, máximo 16, 19 avisos |
| Semgrep | **SKIP local**, ferramenta ausente |
| Audit | **N/A** |
| Baseline | Preservada (`baselineUpdated: false`) |
| Saída | **exit 0** |

Histórico, sem substituir a medição final: fonte d996002 teve 670 PASS, cobertura 95,40719696969697%, complexidade PASS/635 métricas/máximo 16/19 avisos, exit 0 e baseline preservada. Fonte 5ac5d7c teve 654 PASS, cobertura 95,40719696969697%, complexidade PASS/634 métricas/máximo 16/19 avisos, exit 0 e baseline preservada; preliminar anterior teve 654 PASS, cobertura 95,123106%, 632 métricas/máximo 16/19 avisos. Nessas execuções locais, Semgrep SKIP/audit N/A. A tentativa 5725b9f exit 1 e a migração Pautas estão registradas acima, separadas do gate final aprovado.

Prova local não substitui CI/review do head final; Semgrep SKIP não é PASS. Metadados documentais posteriores não mudam código/PNG/testes medidos, mas precisam de conferência do próprio head no PR.
## Fechamento e entrega

T024–T028 executadas no recorte A; T031 doc-sync-onboarding sincronizou AGENTS/README/ROADMAP, índice, arquitetura/import-map, módulos web/servidor/modelo, telas/mockups/galeria e artefatos 006. Não há mapa Graphify neste checkout; Mermaid da arquitetura registra app → layout-model e gerador → layout-browser → fixtures/servidor com mídia falsa. Só documentos `.md` foram alterados por doc-sync; templates/skills e constituição foram preservados. Sonnet/Haiku indisponíveis neste host; documentação usou fallback GPT-6.1-sol High.

Histórico de commits: código/PNG/gate inicial `5ac5d7c`, documentação inicial/head de abertura `6998d22a9292e3b166be27cc97c332876a07e83c`, primeiras correções `d9960021192d25f401f1336820bfc50fab3d2d47`. Fontes finais: código/PNG `5725b9fa94afa8292f1ce0f4387ac872cf87786d` e testes/gate `7fc1996e9843812f83054a6eb11c13c730e7d95b`. Push somente Browsher/crm-social; [PR #24 — Parte A](https://github.com/Browsher/crm-social/pull/24) aberto/anexado. Metadados documentais posteriores exigem checks próprios do head final no PR, sem autoatribuir aprovações de uma fonte a outra.

A revisão independente de código (T029), o CI quality-gate e o review remoto (T032) são acompanhados e têm seus resultados registrados no PR #24 por head. **Conferir o head final e exigir aprovação de revisão independente, CI e review remoto antes de concluir a entrega.** Este registro não antecipa aprovação.

Prova remota histórica do head inicial `6998d22a9292e3b166be27cc97c332876a07e83c`: [CI quality-gate, execução 37832486686](https://github.com/Browsher/crm-social/actions/runs/37832486686), job `113501081741`, PASS. O coordenador conferiu testes/cobertura/complexidade/Semgrep PASS, exit 0 e `baselineUpdated: false`. Vale somente para esse head inicial.

Prova remota da fonte corrigida `d9960021192d25f401f1336820bfc50fab3d2d47`: [CI quality-gate estrito, execução 37834181148](https://github.com/Browsher/crm-social/actions/runs/37834181148), job `113506892559`, PASS. O coordenador conferiu no log Semgrep PASS, exit 0 e baseline preservada. O head final após metadados documentais exige conferência própria no PR, inclusive review remoto; não atribuir automaticamente estas aprovações ao head posterior.

O full gate local final da fonte 7fc1996 passou. Resultados de revisão independente, CI e review remoto são registrados e conferidos no PR por head, incluindo o head final; correções posteriores de código exigem repetir verificações afetadas. Commits usam noreply sem coautoria. Nenhum merge autorizado; Parte B não iniciada e aguardando ok explícito do autor na A.

## Parte B — não iniciada

T017–T023 e fechamento B de T024–T032 aguardam autorização explícita do autor após entrega da A. Perfil/modal/Instagram/Publicar e remoção visual de Planilha não têm implementação, screenshots ou validação nesta rodada. Os checkboxes globais de fechamento ficam abertos até ambas as partes estarem verificadas; a tabela de [tarefas](tasks.md) acompanha cada recorte separadamente.