# Validação — 003 Planejamento mensal

## Fechamento — T002 e T015

- Aba criada pelo autor.
- 1 linha fictícia marcada como teste.
- Card exibido: **passou**.
- Contagens: **1 linha em Meses**, **1 objetivo exibido**, **3 pautas exibidas**, **0 avisos de Meses**.

## Histórico preservado — verificações anteriores ao fechamento

## Registro histórico — integração da main após T021

A T021 da 002 foi demonstrada e integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16); o pré-requisito da 003 foi atendido. O merge da 003 foi autorizado e exige gate/review do head integrado sem bloqueio de segurança ou regressão. T002/criar-preencher Meses e T015/demonstração real permanecem pendentes do autor; testes sintéticos não comprovam integração real da aba.

A main integrada contém a correção TDD dos inteiros textuais canônicos nos campos numéricos da 002, seus testes sintéticos e a evidência sanitizada da T021. Meses mantém seus quatro mínimos e não recebe coerção numérica. As verificações locais e remotas anteriores abaixo são históricas; o head integrado exige seu próprio gate/review. Nenhuma demonstração real de Meses foi executada.

Gate local da integração, fonte `4263f660fa2a77d2be467f15c6cf43c66d4575f7`: Node 24.19.0, **322 PASS sem pulos** nas cinco camadas, cobertura **98,38709677419355%**, drop 0, complexidade PASS com 17 avisos, baselineUpdated:false, exit 0. Semgrep SKIP por ausência no Windows; audit N/A sem dependências de aplicação. [Relatório completo sanitizado](../../docs/reports/003-integracao-t021-local-gate.json) identifica a fonte registrada e o HEAD real anterior do processo; gate executado com as alterações depois registradas no merge.

Revisão estática adicional dos dois arquivos combinados: 0 Critical/Important/Minor, sem defeito identificado; reviewer não executou Git/testes/scanners nem auditou autenticação/persistência integralmente. O coordenador comparou os dois pais: contra main, coleta/testes acrescentam somente Meses opcional/C003; contra o pai da 003, acrescentam somente NUMERICOS/inteiroTextual/converter e C05/C06 da main. Nenhuma perda de código na combinação. O gate completo acima cobre as regressões.

Doc-sync-onboarding: estados e regra numérica conciliados nos guias/arquitetura/módulo de coleta/specs; 29 Markdown e 384 links relativos conferidos, cercas balanceadas e diff sem erro. **13/15 tarefas**, com T002/T015 desmarcadas. A evidência Linux e o review do head enviado serão conferidos e vinculados na descrição do [PR #15](https://github.com/Browsher/crm-social/pull/15) antes do merge; não se atribui a um novo head a execução antiga. Nenhuma demonstração real de Meses ou escrita operacional nesta integração.

## Histórico preservado — rodadas anteriores ao PR #16

## Autorização e limites — 05/10/2026

O autor autorizou implementação com speckit-implement/TDD, push e abertura de PR para main, sem merge. Essa instrução substitui a espera de implementação registrada no planejamento: T021 da 002 permanece pendente e bloqueia o merge da 003. T002 (criar/preencher Meses) e T015 (demonstração privada) são tarefas do autor, pendentes; fixtures não comprovam integração real.

Checklist documental conferido: 16/16, sem modificar marcadores. Pré-requisitos oficiais identificaram a feature 003 e seus documentos. Branch existente 003-planejamento-mensal, base de implementação ba76f53. Nenhuma leitura de dados privados ou escrita operacional.

O checklist de qualidade da especificação foi preservado integralmente como exige speckit-implement. Sua nota de espera por T021 pertence à rodada documental anterior; a autorização atual acima, refletida em spec/plan/tasks, prevalece. Não é evidência de demonstração real concluída.

## Registro de execução

As cinco camadas usam somente fixtures sintéticas, clientes falsos e diretórios TEMP. Gate/baseline permanecem intactos. Evidências RED/GREEN e screenshots serão registrados conforme executados.

- T003/T004: Node 24.19.0, dados/snapshot/CLI: RED 63 PASS / 9 FAIL naturais (opcional recusada); GREEN 72/72, nenhum pulo. Hashes legados literais fixados, Meses inteira na integridade, linhas duplicadas/índices físicos preservados, no-op e falha sem substituir bytes/horário. Sandbox bloqueou subprocessos com EPERM; execução local autorizada permitiu verificar os testes reais.
- T005/T006: projeção RED 73 PASS / 3 FAIL (tabela/avisos ausentes); GREEN 76/76. Ajustada uma expectativa de teste: estado da visão é frescor, não resultado do recibo. Raiz, contagens e semanas preservadas; tipos/mês inválidos avisados, duplicatas com linhas físicas e texto privado redigido.
- T007/T008: card RED 4 PASS / 5 FAIL (conteúdo/itens/duplicata ausentes); suíte interface GREEN 91/91 em Playwright local, nenhum pulo. Navegação mensal, 0/5/7 pautas, LF/CRLF, +2, objetivo vazio, ausência, duplicata e HTML literal; 1440/390 sem corte horizontal.
- T009/T010: coleta/HTTP RED 29 PASS / 3 FAIL (setes ranges e criação da opcional não suportados); GREEN 32/32. Criação/remoção/ID/conteúdo/header/range recusados, mês serial conservado como escalar sem conversão; POST promove Meses, falha preserva bytes/horário e GET não chama a fonte.
- T011: UI nova RED 13 PASS / 1 FAIL: falha estrutural Meses aparecia genérica no Histórico. Os demais casos já passaram como regressão reaproveitada: abas/ordem, quatro colunas, pautas completas, duplicatas/avisos físicos, teclado e POST→GET/fallback; nenhum RED fabricado.
- T012: GREEN 14/14 dos casos U003 em interface/atualização; falha de Meses agora usa o mesmo rótulo localizado das outras tabelas no Histórico.

## Suíte, gate e review local

Com Node 24.19.0 à frente do PATH e Playwright existente, `node tools/quality-gate.mjs` executou a suíte completa e concluiu com exit 0: **312 PASS**, nenhum FAIL/SKIP de testes locais; cobertura **98,37%**, queda zero; complexidade PASS, 17 avisos, nenhuma função ≥21. **baselineUpdated:false**. Relatório integral sanitizado: [003-local-gate.json](../../docs/reports/003-local-gate.json).

Código/testes verificados registrados no commit `3f8c1a644f7f4d12e2e9f466c2e4f9dbe6b4db78`; autor/committer noreply, sem coautoria. Documentação/evidências sincronizadas após esse gate, sem alterar o código validado.

Semgrep SKIP por ausência no Windows; audit N/A por não haver dependências de aplicação. Sem instalação nem mudança em tools/configuração/baseline/CI. A comprovação Semgrep Linux e o review publicado serão verificados no PR.

Review independente local, somente leitura, contra main `50e3a2d` + diff da 003: **nenhum Critical, Important ou Minor reproduzível**, nenhum problema de segurança ou regressão identificado. Conferiu optional/hash legado, integridade completa, índices físicos/duplicatas/escalares, triagem, texto seguro, dupla leitura/metadata/fuso, card, teclado, POST→GET e fallback; relatório do gate atual lido. Limite: demonstração real e documentação então em sincronização não foram tratados como concluídos.

Decisão de execução: T013 é conferida em duas etapas porque o CI Linux/review publicado dependem de abrir o PR; após o gate/review local, T014 sincroniza documentos, e T013 só recebe [x] após os checks remotos. Nenhuma redução de requisito; custo se errado seria reportar qualidade remota antes de comprová-la, evitado pelo marcador pendente.

## Screenshots sintéticos — 1440 e 390 px

Gerados no servidor real em porta efêmera com Playwright existente; somente fixtures sintéticas em TEMP, relógio do navegador fixado, sem request externo ou erro JavaScript. Dez imagens inspecionadas visualmente; página sem corte horizontal. No celular, a tabela Meses foi rolada localmente para mostrar objetivo/pautas completos; as quatro colunas/rolagem/teclado estão verificadas no teste.

| Estado | 1440 px | 390 px |
| --- | --- | --- |
| Objetivo e pautas | [Desktop](../../docs/design/screenshots/003-objetivo-1440.png) | [Celular](../../docs/design/screenshots/003-objetivo-390.png) |
| Cinco pautas e +2 pautas | [Desktop](../../docs/design/screenshots/003-mais-1440.png) | [Celular](../../docs/design/screenshots/003-mais-390.png) |
| Cinco pautas e +1 pauta | [Desktop](../../docs/design/screenshots/003-mais-um-1440.png) | [Celular](../../docs/design/screenshots/003-mais-um-390.png) |
| Ainda não definido | [Desktop](../../docs/design/screenshots/003-indefinido-1440.png) | [Celular](../../docs/design/screenshots/003-indefinido-390.png) |
| A confirmar | [Desktop](../../docs/design/screenshots/003-confirmar-1440.png) | [Celular](../../docs/design/screenshots/003-confirmar-390.png) |
| Meses na Planilha | [Desktop](../../docs/design/screenshots/003-planilha-1440.png) | [Celular](../../docs/design/screenshots/003-planilha-390.png) |

Screenshots não comprovam leitura da conta/planilha real. T002/T015 do autor continuam pendentes; T021 da 002 impede merge.

T014: doc-sync-onboarding concluído em README/AGENTS/ROADMAP, índice/arquitetura, módulos captura/coleta/triagem/projecao/web, documentos canônicos da 003 e guia dos screenshots. 419 links relativos válidos nos 17 Markdown atribuídos, cercas balanceadas e diff sem erro. Notas pai atualizadas; índice Graphify recebe atualização restrita local, preservando fontes fora do escopo. Hooks opcionais git.commit antes/depois da implementação têm auto_commit desabilitado; commits manuais autorizados com noreply e sem coautoria.

## PR e gate Linux — 05/10/2026

[PR #15](https://github.com/Browsher/crm-social/pull/15) aberto para main, branch 003-planejamento-mensal, **sem merge**. Head inicial `3f757e1f48ff4cca8c79edc30c77771a9a2c6d82`, com autor/committer noreply e sem coautoria. [Quality gate Linux](https://github.com/Browsher/crm-social/actions/runs/37370817974): **SUCCESS**, execução estrita exit 0; tests/coverage/complexity/Semgrep PASS, 17 avisos de complexidade, audit N/A, baselineUpdated:false. [Resumo sanitizado dos logs](../../docs/reports/003-ci-gate.json).

O log remoto publica estados, sem contagem/percentual; não copiar os 312 PASS/98,37% locais como números remotos. UI/PowerShell têm pulos previstos no Linux; não substituem a prova local das cinco camadas.

[Review publicado do head 3f757e1](https://github.com/Browsher/crm-social/pull/15#issuecomment-6002583129), [execução SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37370817925): nenhum Critical/Important no código, nenhum problema de segurança ou regressão identificado. Quatro sugestões Minor não bloqueantes registradas:

1. Complexidade em faixa de aviso de objetivoMensal (12) e metadata (12); gate PASS, abaixo de 21. Separações sugeridas são refactor opcional, sem erro de comportamento observado.
2. Quatro cabeçalhos mensais repetidos na projeção; unificar com CAMPOS_MESES é manutenção opcional. O contrato atual está conferido por teste de projeção com valores literais.
3. WeakMap de origem depende do mesmo objeto normalizado; caminhos atuais o preservam e teste confere linhas 2/4. Guarda adicional contra clones futuros é sugestão preventiva, sem defeito atual.
4. Asserção de +2 pode mirar .more-topics para ficar mais específica. A fixture atual não tem +2 no objetivo e já detectou RED sem o marcador; melhoria de teste opcional. A referência de linha 4607 no comentário não corresponde ao arquivo atual; o caso pertinente é U003 card.

T013 concluída com gate/review deste head e as cinco camadas locais, sem modificar baseline/tools/CI. T014 inclui este registro/índice de evidências. Atualização final é somente documental; os [checks e reviews do PR](https://github.com/Browsher/crm-social/pull/15/checks) devem ser conferidos novamente antes do encerramento. Não afirmar aceite de novo head com uma execução anterior.

**13/15 tarefas concluídas**; somente T002 e T015 do autor pendentes. T021 da 002 continua pendente e bloqueia merge. PR aberto, auto-merge não configurado; nenhuma escrita no Google/Drive/n8n/agentes ou demonstração real nesta execução.

Decisão técnica: manter a ordenação canônica por nome no hash, incluindo Meses quando presente, como o algoritmo v1 e as fixtures independentes; ausência conserva o hash legado. A expressão “Meses por último” no contrato descreve a ordem visual, não uma nova serialização de hash. Custo se incorreto: incompatibilidade de hash em capturas novas; testes fixam o legado e conferem toda a opcional.

## Correções do review documental — 05/10/2026

O head `9ef4e6b3b6c05ea7b4ab834ae4fcbcf94e6055db` passou no [gate Linux estrito](https://github.com/Browsher/crm-social/actions/runs/37371910117), exit 0: tests/coverage/complexity/Semgrep PASS, 17 avisos, audit N/A e baselineUpdated:false. O resumo versionado acima agora identifica esse head e preserva a execução anterior. Nenhuma contagem/percentual remoto inferido.

O [review desse head](https://github.com/Browsher/crm-social/pull/15#issuecomment-6003003928) foi publicado na [segunda tentativa](https://github.com/Browsher/crm-social/actions/runs/37371910130/attempts/2), SUCCESS. A primeira não executou passos: o GitHub não alocou runner após múltiplas tentativas. O review encontrou nenhum Critical, problema de segurança ou regressão no código, um Important documental (I1) e seis Minor.

I1 corrigido nesta rodada: `docs/design/telas.md` agora registra a 003 implementada/testada com fixtures, T002/T015 pendentes e T021 bloqueando somente o merge, com link para esta validação. A nota de ausência de objetivo mensal foi delimitada à 001. M1 corrigido: índice e quickstart distinguem resultados já conferidos da necessidade de conferir novo head. M2 corrigido: a legenda dos screenshots da Planilha descreve somente Meses, sem alegar aviso mensal ausente da imagem. M3 corrigido: o relatório local identifica `validatedSourceCommit` e explicita que o gate precedeu o commit; não inventa o HEAD do processo.

M4/M5/M6 são sugestões preventivas de código sem defeito atual: cópias/cabeçalhos da projeção, guarda contra clones futuros e consolidação de seletor CSS. Permanecem opcionais, junto dos avisos de complexidade e da asserção mais específica registrados na rodada anterior; nenhuma mudança de código/teste nesta correção documental.

Comparação registrada: `git diff --exit-code 3f8c1a6 9ef4e6b -- src tests tools .github .quality-gate quality-gate.config.json` retornou 0 sem diff. O código validado e seus testes permanecem idênticos. Esta correção altera somente documentação/relatórios; seus checks e novo review devem ser conferidos no PR antes do encerramento, sem atribuir a ela o resultado de um head anterior. T002/T015 e T021 permanecem pendentes; PR aberto, sem merge.

## Ajustes visuais e quatro Minor do PR #15 — 05/10/2026

Rodada anterior `f020d26852bf1881377da2f65657169b3f343973`: [gate Linux SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37374848470) e [review publicado](https://github.com/Browsher/crm-social/pull/15#issuecomment-6003221284), 0 Critical/Important, sem segurança/regressão e quatro Minor. Esses resultados são históricos, não comprovam o novo código desta rodada.

O autor pediu objetivo definido com a cor principal dos títulos, estilo apagado somente para os estados provisórios, `+N pautas`/`+1 pauta`, ajustes triviais dos quatro Minor e screenshots atualizados. Implementado na fonte `84ab509241b68097b89f4016a19ec312124b50ee`, autor/committer noreply e sem coautoria. Nenhuma mudança de API, projeção, captura, fonte, dependência, tools/CI/baseline ou constituição.

- RED: `node --test --test-name-pattern U003 tests/interface.test.cjs`, Node 24.19.0, Playwright existente, sem CI; **20 testes, 12 PASS / 8 FAIL**, zero pulos, exit 1. Falhas naturais nas duas larguras: objetivo definido ainda apagado e marcadores `+1`/`+2` sem a unidade. Sandbox EPERM foi contornado por execução local autorizada; não foi contado como RED.
- GREEN: mesmo comando, **20/20 PASS**, zero FAIL/SKIP. O objetivo textual de registro único usa `--ink`; `.month-placeholder` recebe apenas os estados provisórios. O marcador identifica pautas e flexiona o singular; cinco/zero pautas não criam marcador. Navegação volta dos estados provisórios ao objetivo definido sem conservar a cor apagada.
- Suíte completa/gate: `node tools/quality-gate.mjs` em Windows, **320 PASS sem pulos**, cobertura **98,36601307189542%**, drop 0, complexidade PASS com 17 avisos; `objetivoMensal` passa de 12 a 14, abaixo de 21. Semgrep SKIP por ausência no Windows, audit N/A e baselineUpdated:false, exit 0. [Relatório desta rodada](../../docs/reports/003-ajustes-local-gate.json), com fonte validada e HEAD real do processo distinguidos; [relatório inicial](../../docs/reports/003-local-gate.json) preservado.

| Minor do review f020d26 | Tratamento nesta rodada |
| --- | --- |
| m1 — evidência sem delimitar head | README/AGENTS/ROADMAP e índice identificam expressamente o CI/review anterior `f020d26`; o resumo JSON `9ef4e6b` é histórico. O aceite dos novos checks será conferido e publicado no PR com o head exato, sem promover prova anterior. |
| m2 — objetivo definido apagado | Cor principal para objetivo definido; classe e cor apagada somente para os estados provisórios, com teste computado em 1440/390. |
| m3 — concordância da duplicata entre card/triagem | Teste de integração verifica mês único + outra marca, duplicatas do mês seguinte (avisos nas linhas físicas 4/6) e mês com espaços inválido (linha 8), confrontando card e Planilha nas duas larguras. Essa regressão já passava antes do ajuste, sem RED fabricado; nenhuma nova propriedade na API. |
| m4 — asserções sobre todo o card | `.more-topics` exato/ausente; objetivo e pauta contêm `+2` em fixture com cinco itens, sem falso marcador. Também já passava como regressão antes da implementação. |

Refactor mínimo adicional: seletor `.brief-icon` consolidado, preservando `flex-shrink:0`. As sugestões anteriores de centralizar cabeçalhos ou adicionar guarda contra clones futuros continuam preventivas/opcionais, sem defeito atual comprovado; não ampliar arquitetura para este ajuste.

Review independente local da fatia `f020d26` → `84ab509`: **0 Critical, 0 Important, 0 Minor**, sem problema de segurança/regressão identificado. Limites: revisão offline dos diffs/evidências fornecidos pelo coordenador, perfil integral e recortes contratuais; não executou testes nem leu autonomamente os arquivos/relatório integral/imagens. A prova local foi executada pelo coordenador; review remoto novo ainda depende do push.

Os dez screenshots anteriores foram regenerados e os dois do singular acrescentados, todos com fixtures sintéticas/servidor real loopback/TEMP e Playwright existente. **12 imagens inspecionadas**, zero request externo/erro JavaScript, página sem corte horizontal; Planilha em 390 conserva rolagem local. A tabela acima aponta para as imagens desta rodada, com objetivo principal, `+2 pautas`, `+1 pauta`, Ainda não definido, A confirmar e Meses.

Doc-sync-onboarding: 14 Markdown afetados sincronizados, 389 links relativos conferidos, cercas balanceadas, sem alterar dados/fontes/constituição. Documentação de evidências desta seção e índice local sincronizados pelo coordenador. **13/15 tarefas** mantidas; T002/T015 do autor pendentes e T021 da 002 continua bloqueando somente o merge. Nenhuma demonstração real ou escrita operacional. Novos checks/review do head enviado devem ser conferidos antes do encerramento; PR permanece aberto, sem merge/auto-merge.

## Conferência remota dos ajustes e notas do novo review — 05/10/2026

Head publicado `fd92f09f38b04a0e1edf705dc12bad83831621ae`: [gate Linux estrito SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37389043475), exit 0, tests/coverage/complexity/Semgrep PASS, 17 avisos, audit N/A e baselineUpdated:false. [Resumo dos logs oficiais](../../docs/reports/003-ajustes-ci-gate.json); o resumo anterior agora contém `historical:true` e aponta para este. Nenhuma contagem/percentual remoto inferido.

[Review novo publicado](https://github.com/Browsher/crm-social/pull/15#issuecomment-6005518372), [run SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37389043621): **0 Critical, 0 Important, 6 Minor**, sem defeito de comportamento, segurança ou regressão identificado. As duas pendências de evidência do parecer foram conferidas pelo coordenador: gate acima e `git diff --exit-code 84ab509 fd92f09 -- src tests tools .github .quality-gate quality-gate.config.json`, exit 0 sem diff. A fonte local de 320 PASS e a fonte do CI são idênticas. O reviewer não executou testes/scanners nem abriu os 12 PNGs; a inspeção visual local foi do coordenador. Os jobs opcionais generate-tests/publish-tests ficaram SKIP por ausência do rótulo solicitado.

| Minor adicional do review fd92f09 | Tratamento |
| --- | --- |
| m1 — estado anterior ao push / T013 | Resumos/tasks agora identificam explicitamente a prova conferida de fd92f09 para a fonte 84ab509. T013 mantém [x] após gate/review conferidos; novos commits exigem seus próprios checks no PR. |
| m2 — resumo CI antigo | Marcado expressamente como histórico/superado, conteúdo original preservado; novo resumo dos ajustes com head/run/review exatos. |
| m3 — checklist preservava espera de implementação | Nota original identificada como histórica/substituída e autorização vigente incluída no próprio checklist: T021 bloqueia somente merge. |
| m4 — integrada à main | Design passa a dizer mesclada na main, com integração/demonstração reais pendentes. |
| m5 — fixtures de título duplicado/caixa | Sugestão opcional de cobertura defensiva, sem defeito atual: título exato/duplicata recusada já seguem o contrato. Não acrescentada nesta rodada de apresentação; permanece registrada para manutenção da coleta. |
| m6 — cabeçalhos/identidade/complexidade | Sugestões preventivas sem defeito atual; cabeçalhos repetidos, guarda para clones futuros e extração do derivador permanecem opcionais. Complexidade 14/12 abaixo do bloqueio 21, sem ampliar arquitetura. |

Esta correção é somente documental. A prova registrada cobre fd92f09 e a fonte 84ab509; não atribui antecipadamente um resultado remoto ao commit que registra a prova. Os checks/review do último head enviado serão conferidos e vinculados na descrição do PR antes de encerrar, preservando a rastreabilidade sem alterar novamente a fonte para registrar o próprio hash. T002/T015 e T021 continuam pendentes; 13/15 tasks, PR aberto, sem merge/auto-merge.