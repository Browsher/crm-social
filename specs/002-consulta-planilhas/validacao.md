# Validação — 002 Planilhas

**Estado vigente:** 24/24 tarefas, T021 demonstrada e concluída localmente em 05/10/2026. A regra numérica e os resultados sanitizados estão no fechamento abaixo. Pendências/limites de rodadas anteriores permanecem históricos; merge do fechamento exige gate e review do head vigente.

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

## Ajustes do PR #14 — 2026-10-05, sobre 87c043e

O [gate Linux de 87c043e](https://github.com/Browsher/crm-social/actions/runs/37347098010) e o [novo review desse head](https://github.com/Browsher/crm-social/actions/runs/37347097992) concluíram SUCCESS. O review trouxe I1 (cobertura da composição padrão), M1 (serial/fuso na coleta completa) e M2 (mensagem da recusa temporal), tratados nesta rodada local. A autorização atual permite push na mesma branch e merge commit do PR #14 somente após gate Linux verde e novo review sem Critical, segurança ou regressão; manter a branch e autoria noreply, sem coautoria. Isso substitui o limite histórico de não fazer merge da rodada anterior.

- **I1:** novo teste HTTP cria servidor sem override, salva/restaura as duas variáveis Google, faz POST sem configuração e verifica 503/configuracao/registrada:true, recibo confirmado com motivo fixo, capturaId/completedAt/bytes da captura preservados e zero fetch. O caminho já estava correto: primeiro ensaio GREEN. Prova de sensibilidade separada: mutação temporária somente do default para falha fora do snapshot produziu RED1/1 (categoria null/registrada:false); fonte restaurada byte a byte em finally e teste novamente GREEN1/1. Não apresentar mutação como defeito preexistente nem inventar RED natural. O GET anterior ao POST mantém atual.json byte a byte.
- **Aceite de I1 confirmado pelo autor:** atual.json mantém capturaId e todos os demais campos; somente ultimaTentativaId/historicoIds recebem o novo recibo. O teste compara o objeto inteiro com essa única extensão. GET conserva todo o objeto captura/completedAt e os bytes do ponteiro já confirmado. O cenário tem falha ativa anterior: o selo vermelho permanece idêntico antes/depois e nas releituras, sem renovar frescor nem inventar sucesso. Captura vigente permanece byte a byte idêntica. Contrato de persistência preservado; push/merge autorizados nas condições registradas acima.
- **M2:** A07 e HTTP temporal RED2/2 com mensagem genérica; GREEN após mapear somente os dois erros temporais conhecidos para textos fixos, mantendo categoria dados/422. Snapshot cobre captura igual/anterior e futuro >10min, sem gravar candidata e preservando vigente/data. HTTP confere recusa por ordem temporal e recibo. UI: após corrigir seletor do teste (timeout não contado como RED), RED2/2 no motivo do Histórico; GREEN7/7 na suíte da 002 em 1440/390, com mensagem própria no status e Histórico. Motivo arbitrário continua suprimido; contrato manual da Central preservado.
- **M1:** C04 usa metadados America/Sao_Paulo e seriais sintéticos de inicio_semana/publicado_em; confere publicação literal no envelope e ambos os hashes sobre valores convertidos. GREEN desde o primeiro ensaio: cobertura de comportamento existente, sem alterar o coletor.

Gate local real em Node24.19.0 sobre os ajustes acima: exit0, **273 PASS**, coverage **98,32%**, drop0, complexity PASS16 avisos, Semgrep SKIP (ausente no Windows), audit N/A, baselineUpdated:false. Sem instalação, alteração de tools/configuração/baseline ou dados reais. Revisão independente somente leitura dos ajustes: nenhum Critical/Important/segurança/regressão; melhoria opcional de cobrir futuro >10min também em HTTP/UI (já coberto no snapshot). A comprovação Linux de b37a06c está registrada abaixo.

Doc-sync-onboarding: módulos snapshot/servidor/coleta/web, contrato e quickstart atualizados somente para mensagens e regressões correspondentes; importações/arestas da arquitetura e índice existentes continuam válidos. Escopo, comandos, fronteiras e estado de README/AGENTS/ROADMAP permanecem os mesmos. **T021 continua pendente: demonstração real após o autor configurar a conta de serviço.** Nenhuma consulta real executada.

## Aceite remoto dos ajustes — head b37a06c, 2026-10-05

Commit `b37a06c5a1755c8c3b77df47ea17be7ae3dc5389`: autor e committer noreply, sem coautoria. [Quality-gate Linux](https://github.com/Browsher/crm-social/actions/runs/37353418582) SUCCESS; resumo do log oficial conferido: tests/coverage/complexity/Semgrep PASS, audit N/A, exit0, baselineUpdated:false, 16 avisos de complexidade. Semgrep foi executado no Linux; o SKIP Windows não substitui essa evidência. UI/PowerShell continuam com os pulos de aplicabilidade conhecidos no Linux; o gate local executou as cinco camadas.

[Novo review](https://github.com/Browsher/crm-social/actions/runs/37353418555) SUCCESS e [comentário publicado](https://github.com/Browsher/crm-social/pull/14#issuecomment-6000286967): nenhum Critical, segurança ou regressão no código. Seu único Important foi a falta de evidência versionada do gate desse head e a referência ao relatório local antigo. Resolvido documentalmente pelo run acima e pelo [relatório local completo dos ajustes](../../docs/reports/002-ajustes-local-gate.json), que identifica validatedHead=b37a06c e registra 273 testes/cobertura/complexidade dessa rodada. `002-local-gate.json` continua preservado como relatório histórico de 267 testes; `002-ci-gate.json` continua o resumo histórico de 0eb7aca, não evidência do head atual.

Minor permanecem não bloqueantes: dependência de constantes snapshot→Google, maior janela da trava durante rede, consumo do corpo até o fim e cobertura adicional HTTP/UI. Configuração ausente confirma falha/selo por decisão explícita do autor. Na T021, conferir IDs textuais retornados como strings, ranges reais e datas históricas com DST; recusa conservadora continua prevista, sem coerção geral. Merge ainda não executado neste registro: a revisão e o gate do commit documental final serão conferidos antes da integração. A T021 permanece aberta.

## T021 — regra numérica e fechamento, 05/10/2026

Autorização atual: conta configurada pelo autor, demonstração privada e correção condicionada ao diagnóstico, com push/PR/merge após gate e review sem bloqueios. A primeira captura direta foi aceita, mas a conferência de tipagem falhou. Nenhuma validação foi alterada para ocultar esse resultado.

| Aba | Campo | Categoria recebida | Contagem |
| --- | --- | --- | --- |
| Arquivos | versao | texto com inteiro exato | 21 |
| Cenas | versao | texto com inteiro exato | 4 |
| Páginas | versao | texto com inteiro exato | 5 |
| Revisoes | versao | texto com inteiro exato | 4 |
| Total | numéricos | texto com inteiro exato | 34 |

Todos passaram pela condição autorizada. Na coleta direta, apenas os campos numéricos declarados aceitam texto canônico de inteiro seguro sem espaços, sinal ou zero à esquerda; normalização antes de ambos os hashes. Demais textos preenchidos mantêm os avisos existentes. Versão/índice exigem positivo; tempo exige finito não negativo. Vazio permanece ausente; números nativos preservados. Contrato e modelo atualizados; capturas históricas e JSON de origens não são convertidos.

TDD sintético: C05/C06 observaram RED natural, **2 falharam**, por inteiro textual não convertido; GREEN, **6 passaram** na suíte da coleta. O bloqueio inicial do sandbox na persistência não foi contado como RED. Regressões sintéticas cobrem campos declarados, texto livre/data textual preservados, hashes sobre valores normalizados, vigência por versão igual, bytes/Histórico legados, zero por regra, decimal textual, sinais, espaços/controles, zero à esquerda, booleano, exponencial e limite seguro. A checagem adicional de espaços/controles passou sem nova mudança de código; não é apresentada como RED natural.

### Demonstração real — somente contagens, resultado e categorias

| Aba | Central anterior | Direta atual | Resultado |
| --- | --- | --- | --- |
| Semanas | 1 | 1 | passou |
| Produções | 4 | 4 | passou |
| Páginas | 5 | 5 | passou |
| Cenas | 4 | 4 | passou |
| Arquivos NTV | 51 | 51 | passou |
| Revisoes | 5 | 5 | passou |

| Categoria conferida | Resultado | Contagem |
| --- | --- | --- |
| Captura direta aceita pelo mesmo importador | passou | 1 |
| Duas leituras com hashes iguais e recomputação válida | passou | 2 |
| Selo atualizado hoje na API e interface | passou | 2 |
| Tipagem numérica: avisos anteriores / atuais | passou | 34 / 0 |
| Produções com versão numérica válida | passou | 4 |
| Unidades com versão numérica válida | passou | 9 |
| Captura da Central preservada byte a byte | passou | 1 |
| Histórico preservado, anterior / atual | passou | 2 / 3 |
| Requisições externas no navegador | passou | 0 |
| Erros de interface | passou | 0 |
| Categoria remanescente: vínculo/versão incompatível | aviso | 4 |
| Categoria remanescente: arquivos empatados | aviso | 4 |
| Categoria remanescente: mídia ausente | aviso | 4 |
| Unidades com versão distinta da produção | aviso | 9 |

### Qualidade e limites

Gate Windows local com Node 24.19.0 e Playwright existente: **275 PASS**, cobertura **98,3402489626556%**, drop 0, complexidade PASS com 16 avisos, exit 0, baselineUpdated:false. Semgrep SKIP por ausência no Windows; audit N/A. Fonte e testes da correção, cinco camadas sintéticas; nenhum dado real em testes, logs públicos ou screenshots. O [resumo local sanitizado](../../docs/reports/002-t021-local-gate.json) preserva a prova desta rodada. Gate Linux estrito e review do head enviado serão conferidos no PR antes do merge autorizado; resultados anteriores não provam este código.

T021 concluída pela captura aceita e pelos tipos válidos, sem exigir que versões distintas sejam iguais. A tipagem da coleta direta foi resolvida; vínculos/versões incompatíveis, empates e mídia ausente continuam avisos da fonte. A captura histórica da 001 conserva seus bytes e limite original. A consulta não comprova arquivos de mídia, aprovação ou publicação. Nenhuma escrita no Google/Drive/n8n; nenhuma captura ou screenshot real versionado. **Registro histórico da 002:** nesta etapa, T002/T015 da 003 ainda estavam pendentes do autor; o fechamento posterior está na [validação da 003](../003-planejamento-mensal/validacao.md).

Gate final repetido após ampliar as bordas sintéticas de espaços/controles: **275 PASS**, cobertura **98,3402489626556%**, drop 0, complexidade PASS com 16 avisos, exit 0 e baselineUpdated:false; Semgrep SKIP Windows/audit N/A. Nenhuma mudança de tools/configuração/CI/baseline. Doc-sync-onboarding aplicado aos resumos, índice/arquitetura, módulo coleta e documentos canônicos da 002; **256 links relativos passaram**, nenhuma cerca desbalanceada, diff/privacidade passaram.

Review independente local: **0 Critical, 0 Important, 0 Minor** nos recortes fornecidos. Limite explícito: avaliou diff/requisitos/evidências entregues pelo coordenador; não leu autonomamente arquivos integrais nem executou testes/scanners ou consultou dados reais. Gate Linux e review publicado serão conferidos no PR vigente antes do merge, sem promover esse parecer local a prova remota.

### Conferência do PR de fechamento e correção documental

Fonte `d12be35`: [gate Linux estrito SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37392704967), tests/coverage/complexity/Semgrep PASS, 16 avisos, audit N/A, exit 0 e baselineUpdated:false. Pulamos UI/PowerShell somente nas condições de plataforma previstas do CI; as cinco camadas Windows passaram no gate local. Não inferir contagem ou percentual remoto a partir do relatório Windows.

[Review publicado](https://github.com/Browsher/crm-social/pull/16#issuecomment-6006210257): nenhum Critical, segurança ou regressão no código; um Important de evidência e seis Minor. I1 resolvido: relatório local passou a preservar os resultados integrais, métricas/avisos por função, `validatedSourceCommit` da fonte e `executionHead` de base anterior ao commit, sem inventar o HEAD do processo. O run Linux dessa fonte está vinculado acima. Esta correção é documental; a fonte/testes permanecem idênticos e os checks/review do novo head devem ser conferidos no PR antes do merge.

M1/M5 corrigidos: status do módulo Google, regra curta de estrutura, descrição de coleta/limite de evidência da arquitetura, roadmap sem duplicação e tarefas qualificadas como testes automatizados. M2/M3/M4 são sugestões opcionais de manutenção/cobertura sem defeito atual: lista numérica compartilhada, posição/imports dos testes e mais negativos de tempo. Mantidas para manutenção, sem ampliar a arquitetura da correção. M6 documenta equivalência numérica nos hashes, já explícita no contrato/spec; nenhuma mudança adicional necessária.
