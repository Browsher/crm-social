# Validação — 002 Planilhas

## Decisões do autor — 2026-10-05

- Emenda aprovada/aplicada: princípioVI, versão1.1.0, Last Amended2026-10-05; trecho de abas auxiliares retirado. I–V e Ratified preservados.
- Auth sem dependências: RS256 node:crypto, readonly, aud/endpoint OAuth fixos, exp≤1h, fetch sem redirect/timeout; tokenRAM. RSA gerada nos testes, transporte falso.
- Escopo reduzido: seis abas da001, batchGet duas vezes, hashes iguais, mesma validação/importador/promoção; GET sem rede; mensagem curta. Quatro categorias de falha.
- Chave externa por env; nenhum ID/email/key/dado real versionado. Sem realpath/junção, perfil nove ou escala500. Ajuste: Equipe/Workflow (antiga006), Agentes/Controle/Execucoes e mudança da Fila no n8n são **v2 (visual ilustrativo)**, fora do escopo/menu planejado do v1.
- Um PR para implementação inteira; conta/demonstração real pendentes. Sem merge nesta rodada.

## Registro de execução

T001: documentos/emenda aplicados. Registro abaixo distingue execução local, conta real pendente e aceite remoto, sem dados privados.

T001: nova analyze 0Critical/High/Medium/Low; 24 tarefas/13 requisitos/100% associação. Baseline node --test existente exit0. T002/T003: google.test.cjs RED2/2 por JWT/config ausentes; GREEN2/2. T004/T005: RED3/5 por cliente ausente, GREEN5/5. Runner precisou permissão para spawn; EPERM inicial não contou como RED. Nenhuma rede Google ou chave real.
T006/T007: RED3/3; GREEN3/3, duas leituras/hashes/grade e datas com DST. Calibrados os insumos sintéticos: serial 46296 para 01/10 e ausência de cabeçalho obrigatório, preservando os resultados esperados. T008/T009: RED2/2; GREEN39/39 com regressão snapshot. T010/T011: RED6 novos/2 verdes; GREEN45/45 incluindo legado. T012/T013: RED2/2 (405 sem endpoint); GREEN17/17. T014/T015: RED fonte Central em vez de direta; GREEN incluindo legado (data comparada ao insumo). T016/T017: RED3/3 (estado pendente ausente); GREEN3/3 em 1440/390 e GET falhando, com 72 testes de projeção verdes. Testes UI legados usam atualização falsa sem escrita, mantendo o objetivo de releitura; o novo contrato exige POST seguido de GET.
T020 revisão independente: zero Critical/segurança; dois Important (aviso da trava ignorado e POST falho + GET falho rotulado como concluído) e um Minor (JSON inválido Sheets classificado rede). RED3/3 para os Important e RED1/1 para o Minor; correções GREEN com testes HTTP/UI/OAuth. Ajustados os asserts históricos de requisições UI para POST + GET e cliente falso, porque releitura somente GET foi substituída pelo contrato aprovado; nenhum teste de preservação foi removido.

## Aceite local — 2026-10-05

T018: suíte completa do gate em Node 24.19.0: 266 testes, todos PASS, nenhum FAIL/SKIP local. Cinco camadas e CLI legado preservados; nenhum pacote de aplicação. O teste histórico de 500 peças da 001 permanece como regressão existente; não foi criado cenário novo de escala para a 002.
T019: seis screenshots abaixo, dados inteiramente sintéticos e persistência em TEMP. Conferidas apresentação desktop/mobile, botão desabilitado e captura anterior preservada na falha. Nenhuma captura real consultada.
T020: segunda revisão confirmou as correções, sem bloqueio remanescente. Nova speckit-analyze: 0 CRITICAL/HIGH/MEDIUM e 1 LOW (nome executarColeta), corrigido para atualizarCaptura. 24 tarefas / 13 requisitos / 100% cobertura documental / zero órfãs.
T021: **pendente do autor**, conforme quickstart; conta leitora/chave/compartilhamento e demonstração real fora desta rodada.
T022: node tools/quality-gate.mjs exit0, tests PASS266, coverage PASS98,31% (drop0), complexity PASS16 avisos; Semgrep SKIP por ferramenta ausente no Windows; audit N/A sem dependências. Baseline/config/tools intactos; no CI Linux Semgrep deve passar de verdade. Esse SKIP não é apresentado como análise estática executada.
T023: doc-sync-onboarding aplicado: README/AGENTS fora do bloco/ROADMAP/índice/arquitetura/módulos e regra de estrutura com59linhas. Constituição1.1.0 aplicada; planejado/implementado/testado/integrado separados. Equipe/Workflow/auxiliares/Fila v2 ilustrativo fora do menu v1. Links/cercas conferidos; seção não afetada preservada. Limites: dupla leitura sem transação, verificação lexical da chave, UI fora do LCOV/SKIP no Linux.
T024: publicação do PR/aceite remoto em andamento; sem merge autorizado.

| Estado | 1440 | 390 |
| --- | --- | --- |
| Atualizando | [Desktop](../../docs/design/screenshots/002-atualizando-1440.png) | [Celular](../../docs/design/screenshots/002-atualizando-390.png) |
| Sucesso | [Desktop](../../docs/design/screenshots/002-sucesso-1440.png) | [Celular](../../docs/design/screenshots/002-sucesso-390.png) |
| Falha, captura preservada | [Desktop](../../docs/design/screenshots/002-falha-1440.png) | [Celular](../../docs/design/screenshots/002-falha-390.png) |


## Aceite remoto inicial e correção de I/O — 2026-10-05

PR [#14](https://github.com/Browsher/crm-social/pull/14), head implementado 0eb7aca. [Gate Linux](https://github.com/Browsher/crm-social/actions/runs/37345736031): SUCCESS, tests/coverage/complexity/Semgrep PASS, audit N/A, exit0 e baseline intacta. [Review](https://github.com/Browsher/crm-social/actions/runs/37345736300): SUCCESS; [comentário do Claude](https://github.com/Browsher/crm-social/pull/14#issuecomment-5999297932) publicado. generate-tests/publish-tests SKIPPED, sem rótulo.

Trecho: “Não encontrei nenhum achado Critical. Há 1 Important: falhas de I/O na promoção direta são classificadas como dados”. I1 corrigido nesta rodada: A06 RED1/1 (não havia rejeição), GREEN46/46 snapshot/atualização; falta de espaço não confirma tentativa falsa e mantém bytes/completedAt. Gate local repetido após a correção: 267 PASS, zero FAIL/SKIP de testes, coverage 98.31%, complexity PASS16 avisos; Semgrep SKIP Windows/audit N/A. [Relatório completo local](../../docs/reports/002-local-gate.json). [Resumo do CI inicial](../../docs/reports/002-ci-gate.json) preserva a origem/limite: workflow não publicou o JSON completo como artefato, portanto esse resumo não inventa métricas remotas.

### Minor / limites conhecidos do review inicial

- M1: snapshot importa somente constantes MOTIVOS do adaptador Google, sem efeito colateral/rede no load. Módulo neutro adiado para manter escopo simples; arestas nativas faltantes corrigidas no Mermaid.
- M2: 409 da trava acoplado ao texto estável; testes de snapshot/CLI cobrem concorrência, caso HTTP concorrente específico permanece melhoria.
- M3: corpo acima de1KiB não é armazenado, mas o fluxo é consumido até terminar antes do413; impacto limitado ao servidor em loopback com Origin/Host.
- M4: documentação esclarece cache por coleta/instância; cliente novo por clique, sem cache global.
- M5: casos adicionais de fonte/metadados/chave/códigos HTTP além dos cenários proporcionais executados são melhorias de cobertura, não coleta real.
- M6/M7: andaime RED opcional nos testes e expressões compactas permanecem dívida de legibilidade.
- M8: frases de estado, nome de emenda aplicada, espaços e referência de validação corrigidos; histórico não duplicado em outros documentos.

T024: PR aberto, checks/comentário inicial comprovados; atualização de I1 no mesmo PR. Sem merge. T021 continua pendente do autor. Aceite do head corrigido será confirmado no PR e no relatório final da execução.
