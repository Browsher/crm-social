# Validação — 004 Pautas no Planejamento

## Escopo e fonte
Solicitação de 07/10/2026: consulta de Pautas opcional e Semanas.pauta_id opcional; [spec](spec.md), [plano](plan.md), [15 tarefas](tasks.md). Base local `4c9af22e3b57a135218ab5504e7da0e2472ffdca`, após integração do iniciador. Branch `codex/004-pautas-planejamento`. Entrega inicial sem merge; após avaliá-la, o autor autorizou os ajustes descritos ao final, merge condicionado ao gate/review do novo head e exclusão da branch.

## Decisões registradas
- Reutilizar v1 e incluir opcionais somente quando capturadas; nenhuma migração de capturas antigas.
- IDs opacos; validar identidade/calendário e resolver vínculo no backend, sem inferência.
- Unicidade no conjunto NTV, após seleção da marca: outra marca não produz conteúdo/avisos; ponteiro só encontrado em outra marca permanece órfão. Preserva a fronteira existente da consulta.
- Pautas estruturadas assumem a lista do mês quando presentes; mês sem linhas conserva comportamento da 003.
- Destino semanal deve existir mesmo sem peças; gaveta pode apresentar origens de várias semanas no mesmo dia.
- Documentos e templates oficiais preservados; numeração do backlog futuro ajustada para 005/006.
- Context7 conferido para Sheets e Playwright; nenhuma dependência instalada. Ausência de mapa Graphify neste checkout conferida.

## Estado
**15/15 tarefas concluídas para entrega no PR.** Implementação, testes e screenshots concluídos; ajustes posteriores descritos ao final. O [PR #20](https://github.com/Browsher/crm-social/pull/20) registra os checks vigentes e o estado da integração autorizada. Rodadas anteriores de gate/review não substituem a conferência do novo head. Este registro não comprova uso editorial real. Toda evidência desta entrega usa fixtures sintéticas, cliente remoto falso e TEMP; nenhuma coleta na fonte operacional.

## TDD e regressões parciais
Backend: RED inicial 6 PASS/32 FAIL pela ausência do suporte a Pautas; implementação e casos adicionais terminaram com 190 PASS/0 FAIL/0 SKIP nos arquivos pautas, coleta, projecao, snapshot e servidor (41 testes P004). A invocação também continha o padrão inexistente captura.test.cjs, ignorado pelo runner; não foi contado como teste executado. O coordenador executou separadamente `node --test tests/dados.test.cjs`: 25 PASS/0 FAIL/0 SKIP, incluindo hashes legados literais. Gate integrado ainda pendente nesta fase.

## Interface, screenshots e gate Windows
UI: RED inicial 1 PASS/8 FAIL; regressão de interface/tema/atualização 148 PASS sem pulos; após teste RED de acessibilidade, destinos do calendário limitados às segundas-feiras com role group. Teste RED de status constructor comprovou rótulo herdado indevido; correção usa Object.hasOwn e três rótulos contratuais. Suíte final U004: 11 PASS sem pulos. Contraste de novos textos >=4,5:1 em claro/escuro e 1440/390; teclado/foco, semana sem peças, múltiplas origens, órfão, mês atravessado, fallback e releitura verificados.

Gerador: RED por ausência de PNG; GREEN 4 PASS sem pulos (guardas de exclusão, falha do navegador e CLI real em cópia TEMP). Geração exit 0, 20 PNG, todos inspecionados pelo responsável e seis amostras pelo coordenador. [Galeria](../../docs/design/screenshots/LEIA-ME.md#004--pautas-no-planejamento). As imagens mantêm a galeria anterior e não mostram dados reais.

Primeiro `node tools/quality-gate.mjs`, Node 24.19.0, Windows com Playwright existente: **427 testes PASS**, cobertura **93,8748%**, complexidade PASS/19 avisos, exit **0**, baseline preservada. Execução TAP completa confirmou 427 PASS/0 FAIL/0 SKIP. Esta é uma rodada histórica, registrada somente neste texto; o relatório JSON versionado corresponde à última rodada descrita adiante. O modo é full: drop 0 é o valor desse modo, não comparação com os 96,3498% históricos. O percentual inclui o novo módulo/fixture/gerador; a UI continua fora do LCOV. Semgrep SKIP por ferramenta ausente; audit N/A sem dependências do app. Gate estrito remoto e review ainda estavam pendentes nesta rodada.

Varredura final de 36 arquivos textuais alterados/criados após a correção e o doc-sync: sem correspondência para e-mail de conta de serviço, URL privada de planilha, chave privada completa ou cópia/caminho do contrato operacional. Limite: padrões conservadores não comprovam ausência de todo segredo possível. Nenhum arquivo de output/ preexistente foi incluído.

## Revisão independente local
Revisor separado, seguindo `.claude/agents/reviewer.md`, examinou os documentos, diff/trechos e relatórios fornecidos pelo coordenador, sem executar comandos nem alterar arquivos. Encontrou um **Important**: a gaveta de um dia vazio omitia a origem da semana. Corrigido em `src/web/app.js`: sem peças, usa somente semanas capturadas que abrangem a data e cuja `pautaOrigem` já foi confirmada; deduplica origens, mantém mensagem vazia e não cria documentos vazios. Com peças, conserva suas respectivas semanas.

Teste RED: 1 FAIL; GREEN U004: 12 PASS/0 FAIL/0 SKIP. Limites inclusivos, dias fora do período e ponteiro órfão cobertos. Revisor conferiu patch/teste e encerrou sem Critical, Important pendente ou problema concreto de segurança no material recebido, condicionado ao gate após a correção. Limites: não examinou diretamente todo o diff ou os PNGs; review remoto do futuro head continua necessário. Nenhuma autorização de merge.

Rodada após a correção local: **428 testes PASS**, cobertura **93,8748%**, complexidade PASS/**20 avisos**, exit **0**, baseline preservada. Execução TAP completa da mesma árvore confirmou **428 PASS/0 FAIL/0 SKIP**, sem cancelados ou TODO. `origensDoDia` ficou com complexidade 13, abaixo do limiar de reprovação 21. Limitações de Semgrep/audit/LCOV/modo full permanecem as registradas acima. Rodada histórica preservada neste texto. Galeria regenerada nessa árvore: 20 PNG, exit 0, seis amostras visuais cobrindo ambos os temas e larguras sem alterações inesperadas.

## Documentação
Doc-sync-onboarding concluído após estabilizar o código/gate, em 14 Markdown de onboarding/produto/arquitetura/módulos/galeria. Links locais conferidos, cercas balanceadas, índice documental atualizado e `git diff --check` sem erros. Não houve alteração em templates, skills, gate, CI ou baseline. Sem mapa Graphify existente. Documentos diferenciam implementação/teste local de integração.

## PR e checagem remota
[PR #20](https://github.com/Browsher/crm-social/pull/20), aberto sem merge. Commit de implementação `35ad23625efaeb3c9189bb2375a0cf700b72f403`, autor e committer com o noreply autorizado, sem trailer de coautoria.

[Gate estrito](https://github.com/Browsher/crm-social/actions/runs/37674711392/job/112975109481) desse commit: tests, coverage, complexity e Semgrep **PASS**; complexidade com 20 avisos; audit N/A; exit 0 e baseline preservada. CI Linux mantém pulos explícitos de UI/PowerShell, cobertos pela prova Windows separada acima. Geração/publicação opcional de testes não foi acionada. O PR e seus checks identificam o head vigente; nenhum merge autorizado.

[Review remoto do primeiro head](https://github.com/Browsher/crm-social/pull/20#issuecomment-6045317870): sem Critical ou Important, com três Minor. A ordenação da lista alterava a ordem física anterior mesmo sem pautas; IDs inválidos repetidos produziam dois avisos redundantes; o módulo Pautas afirmava testes diretos quando a cobertura vem da projeção/HTTP. Correções por TDD nas duas primeiras e ajuste textual na terceira. O review pediu cobertura por arquivo e evidência do gate estrito; esta última está vinculada acima. O revisor trabalhou somente em leitura e não executou testes/scanners; abriu duas das 20 imagens.

Correções dos três Minor:
- Lista ordena por início somente quando acrescenta destinos sintéticos de pauta; capturas antigas e Sem data preservam a ordem física anterior. RED 1 FAIL; GREEN Pautas/interface 115 PASS/0 FAIL/0 SKIP (13 U004), incluindo semanas fora de ordem e início inválido.
- Identidade vazia, só espaços ou não textual repetida recebe apenas o aviso de identidade inválida. IDs textuais continuam opacos, sem trim na identidade, e duplicatas reais continuam excluídas. RED 4 FAIL/1 PASS; GREEN Pautas/projeção/dados 147 PASS/0 FAIL/0 SKIP (46 P004).
- Documento do módulo corrigido para testes via projeção e HTTP.

Revisor local separado conferiu esses deltas e as evidências encaminhadas, sem executar comandos, e não encontrou novo Critical, Important ou problema de segurança. Gate Windows após os ajustes: **434 PASS**, cobertura **93,8708%**, complexidade PASS/20 avisos, exit 0, baseline preservada; Semgrep local SKIP e audit N/A. Execução TAP/LCOV confirmou **434 PASS/0 FAIL/0 SKIP**, sem cancelados/TODO. Galeria regenerada: 20 PNG e exit 0, amostras dos dois temas/larguras conferidas.

### Cobertura por arquivo solicitada no review
LCOV Windows final com os mesmos includes/excludes do gate; agregado idêntico ao relatório: **1.410/1.502 linhas (93,8748%)**. Resumo sanitizado e linhas não cobertas em `coverageDetails` do [relatório](../../docs/reports/004-local-gate.json); LCOV bruto com caminhos locais não é publicado. `sourceParent` identifica a base dos últimos ajustes e `sourceBlobs` identifica por hash Git cada um dos 12 arquivos de código/testes/estilo da entrega, conferidos novamente após executar o gate e o LCOV. Os números intermediários permanecem somente nos relatos históricos acima.

| Arquivo | Linhas cobertas/medidas | Percentual |
| --- | --- | --- |
| src/captura.cjs | 140/140 | 100% |
| src/coleta.cjs | 85/85 | 100% |
| src/triagem.cjs | 101/101 | 100% |
| src/projecao.cjs | 308/308 | 100% |
| src/pautas.cjs | 51/51 | 100% |
| tests/pautas-fixtures.cjs | 23/23 | 100% |
| scripts/screenshots-pautas.cjs | 52/96 | 54,1667% |

As 44 linhas não cobertas do novo gerador respondem por 44 das 92 linhas não cobertas do agregado. O CLI real foi executado e verificado em subprocesso, cuja cobertura não é incorporada à do processo pai; os testes VM medem preparação/falhas/limpeza. Os cinco módulos de backend alterados têm 100% das linhas medidas cobertas, o que não equivale a 100% dos ramos. UI permanece exercitada no navegador, fora do LCOV. Não foi refeita a medição por arquivo da main histórica, portanto o percentual agregado anterior não serve como comparação direta de ramos.

### Review do commit f0c2b6b
[Gate estrito](https://github.com/Browsher/crm-social/actions/runs/37676734525/job/112982060691) de `f0c2b6bad9880a16820b8699a51e6fdae56f7785`: tests/coverage/complexity/Semgrep PASS, 20 avisos, audit N/A, exit 0, baseline preservada. [Review desse head](https://github.com/Browsher/crm-social/pull/20#issuecomment-6045578137): sem Critical/Important, seis Minor.

Tratamento:
- Minor 1: destino visual sem Semana capturada passa a se identificar como `Pauta S1 de novembro · tema`, sem criar `pautaOrigem` ou linha na Planilha. RED 1 FAIL; GREEN Pautas/interface 116 PASS/0 FAIL/0 SKIP, incluindo 14 U004.
- Minor 2: início inválido repetido não avisa duplicidade. Datas civis canônicas repetidas continuam contadas mesmo quando outro campo da pauta é inválido. Reutiliza `instanteUtc` de captura. RED 5 FAIL/1 PASS; GREEN Pautas/projeção/dados 153 PASS/0 FAIL/0 SKIP, incluindo 52 P004.
- Minor 3: contrato/quickstart explicam `mes` textual `AAAA-MM` e IDs textuais opacos, sem alterar formatação na fonte.
- Minor 4: preparação/ordenação da lista extraída para `semanasComPautas`, preservando ordem física quando não há destinos novos e sempre em Sem data.
- Minor 5: limitação do modo full e cobertura do subprocesso ficam explícitas. Mantido o escopo do gate; não excluir o gerador nem alterar baseline para aumentar o percentual. Pendência M8 permanece documentada, com prova Windows separada.
- Minor 6: mantidas as duas guardas locais da coluna opcional, sem divergência demonstrada. As combinações de presença/ausência são verificadas nos testes de projeção/Planilha. Extração de helper adicional fica como melhoria não bloqueante, fora desta entrega enxuta.

As sugestões 5/6 não apontam falha de segurança, perda de dados ou regressão demonstrada. Revisor local separado conferiu os deltas 1–4 e a reutilização de `instanteUtc`, sem novo Critical/Important ou problema de segurança no material encaminhado. Gate Windows da árvore ajustada: **441 testes PASS**, cobertura **93,8748%**, complexidade PASS/20 avisos, exit 0, baseline preservada; execução TAP/LCOV confirmou **441 PASS/0 FAIL/0 SKIP**, sem cancelados/TODO. `lista` passou de 18 para 15 e `semanasComPautas` tem 5. Semgrep local SKIP/audit N/A permanecem. Galeria regenerada: 20 PNG, exit 0 e oito amostras de card/lista/semana em 1440/390 e claro/escuro conferidas, incluindo os novos títulos em tela pequena. Checks remotos ainda devem conferir o head enviado; evidência anterior não os substitui.

## Entrega do código e fechamento
Fonte final de código/testes/imagens: `15567a0fddcda8f602fdf11bc86e13b413c74c15`. Os 12 blobs do relatório foram comparados aos objetos desse commit e correspondem às fontes validadas. `sourceCommit` e `remoteCodeGate` registram a origem e a checagem remota; os relatos intermediários ficam somente neste texto.

[Gate estrito do código final](https://github.com/Browsher/crm-social/actions/runs/37678876658/job/112989401162): tests/coverage/complexity/Semgrep PASS, 20 avisos, audit N/A, exit 0 e baseline preservada. [Review do código final](https://github.com/Browsher/crm-social/pull/20#issuecomment-6045851578): sem Critical/Important e sem regressão de segurança no checklist; três sugestões Minor restantes:

- M1, identificação no Calendário: delimitado no contrato o tratamento próprio de cada modo. O grupo sintético da Lista precisa identificar que é pauta; a célula do Calendário é uma coordenada temporal, recebe foco e anuncia a data exata da semana, sem afirmar existir registro em Semanas. Mantido esse comportamento enxuto, com a estratégia visível no card; repetir tema/rótulo dentro da célula fica como melhoria visual não bloqueante. Não há perda da navegação solicitada.
- M2, falha genérica por estrutura opcional: quickstart explica a recusa completa e a conferência dos cabeçalhos opcionais. Preservada a categoria fixa já usada na coleta, sem mudar API nem expor a fonte. Nenhum acesso à planilha real foi feito.
- M3, seletor de data: mantido o invariante já validado no backend e coberto por testes. O próprio review o reconhece seguro no código atual; não há entrada arbitrária nesse seletor. Escape defensivo adicional fica como melhoria não bloqueante.

As ressalvas de LCOV, pulos do CI Linux e duas guardas de coluna opcional permanecem explícitas. A prova Windows tem 441 testes sem pulos. Os três reviews remotos são comentários, sem autorização de merge. O fechamento posterior altera somente documentação/relatório; os checks do novo head devem permanecer verdes antes de encerrar a entrega. [Galeria final de 20 screenshots sintéticos](../../docs/design/screenshots/LEIA-ME.md#004--pautas-no-planejamento).

## Ajustes solicitados após a entrega inicial

Sobre `6505fb153b133813459c334d5f5c70677b40389a`, o autor solicitou corrigir o espaçamento da semana destacada na Lista e somente as sugestões triviais do [review anterior](https://github.com/Browsher/crm-social/pull/20#issuecomment-6045959906). Autorizou push, merge após gate verde e review sem Critical, problema de segurança ou regressão, e exclusão da branch; autoria noreply, sem coautoria. Esta autorização substitui a restrição inicial de merge.

- **Layout:** a moldura interna de 3 px sobrepunha o conteúdo porque `.agenda-week` não tinha padding. Espaçamento comum de 12 px preserva o tamanho ao focar e afasta título, origem e período da borda. RED: quatro falhas por falta de folga, nos dois temas em 1440/390. GREEN: 18 U004, sem falhas ou pulos, incluindo geometria dos textos, igualdade de espaçamento entre semanas, foco e ausência de overflow.
- **M1:** compatibilidade de início só é conferida quando mês/ordinal definem uma segunda-feira esperada. Três testes RED comprovavam aviso em cascata; GREEN: 56 P004, sem falhas ou pulos, preservando a rejeição da pauta, avisos próprios e registros na Planilha.
- **M2:** ano `0000-11` incluído no teste de valores inválidos. O comportamento já passava antes; não houve RED artificial.
- **M3/M4 adiados:** preferência pelo grupo com vínculo exato entre semanas capturadas da mesma data e testes puros adicionais do módulo. A navegação atual foca o primeiro grupo da data correta, que pode não ser o grupo com origem confirmada. Melhorias não bloqueantes, mantidas fora desta rodada enxuta.

Gate Windows Node 24.19.0: **449 testes PASS**, cobertura **93,8748%**, complexidade PASS/20 avisos, exit 0 e baseline preservada. [Relatório dos ajustes](../../docs/reports/004-ajustes-local-gate.json) identifica as fontes por 12 blobs Git; o relatório anterior permanece histórico. Semgrep local SKIP por ausência; audit N/A. O gate publica a contagem, sem resumo de pulos; os resumos sem pulos desta rodada são das duas suítes focadas, não uma nova execução TAP completa. As limitações de LCOV e do modo full permanecem.

Galeria regenerada: 20 PNG, exit 0. Revisor separado inspecionou oito imagens alteradas (card 390, semana-origem 1440/390 e gaveta 1440 nos dois temas); coordenador conferiu as quatro semana-origem. Título, origem e período integralmente legíveis, sem corte visível. Revisão local dos trechos/diffs fornecidos e PNG: nenhum novo Critical/Important/Minor ou indício de regressão/segurança; sem execução própria de comandos. Doc-sync atualizado somente no conteúdo afetado; sem mudança de dependências, arquitetura, gate, CI ou baseline. Gate estrito e review remoto do novo head devem ser conferidos no PR antes do merge; este registro local não antecipa esse resultado.
