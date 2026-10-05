# Validação — 003 Planejamento mensal

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
| Cinco pautas e +2 | [Desktop](../../docs/design/screenshots/003-mais-1440.png) | [Celular](../../docs/design/screenshots/003-mais-390.png) |
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
