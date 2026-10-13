# Pacote ZIP por MIME — validação sanitizada

Esta manutenção permite consultar o pacote registrado com MIME, preservando a leitura da fonte. A seleção não confere bytes, acesso, conteúdo ou aprovação editorial. Sem rota, dependência, escrita remota, migração ou feature nova.

**Estado vigente local — round 4:** gate Windows completo aprovado na árvore descrita abaixo. A integração e os checks/revisão do novo head continuam pendentes; os vermelhos das rodadas anteriores permanecem como histórico.

## Evidência da implementação inicial

Fonte `f55282e4012caa4d6a6af78f647a5e175fa38f4f`, base `039f0ebd3b828103d06f2c1ff47e9fc6d6214f93`, [PR #29](https://github.com/Browsher/crm-social/pull/29). Gate local Windows em Node 24.19.0: `node tools/quality-gate.mjs`, 775 PASS, cobertura 95,5340699815838%, complexidade PASS/18 avisos, exit 0, baseline preservada. Drop 0 em modo full não representa comparação histórica. Semgrep SKIP por ausência local, audit N/A por não haver dependências do app. Suíte `node --test tests/pronta.test.cjs`: 20 PASS, sem pulos.

O [CI estrito do head f55282e](https://github.com/Browsher/crm-social/actions/runs/38409364970) passou, conforme conferência do coordenador. Esse check pertence à fonte inicial, não a um head posterior. O gate local não substitui segurança/revisão do head final.

Na implementação inicial, o teste foi escrito antes do código. O RED observou pacote via MIME sem extensão retornando null e extensão ZIP com MIME conflitante aceito indevidamente; a tentativa contabilizou 17 PASS/3 FAIL (duas assertions esperadas e um bloqueio HTTP EACCES do ambiente). Após a correção mínima e execução autorizada de loopback, a focada inicial passou 20/20. Os reforços da round 1 não alteraram produção e passaram de imediato.

Antes do gate aprovado, houve falha de ambiente TEMP com separadores diferentes, corrigida somente na configuração. Houve também um timeout UI na suíte completa; caso isolado passou na árvore corrigida e na base exata. Após encerramento da renderização paralela, gate completo passou. Nenhum limite ou fonte de teste foi alterado para contornar falhas.

## Contrato estrito e fonte real

A [regra contratual](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#identificação-do-pacote-por-mime--manutenção-local-de-13102026) foi escolhida explicitamente pelo autor: MIME literal `application/zip` e ausência do cabeçalho `extensao` foram conferidos na fonte real pelo coordenador. Outros tipos, variações de caixa/espaços e coluna de extensão presente vazia são recusados intencionalmente. Essa conferência não autoriza ampliar MIME, normalizar valores ou alterar a fonte.

Metadados de operação, captura privada, conteúdo, IDs de arquivos e screenshots reais permanecem fora do Git. A demonstração readonly do coordenador é registrada no ledger privado; este documento entrega somente evidência sanitizada de código e contrato.

## Revisão round 1

I1: evidências por fonte e link CI entregues acima. I2: README, ROADMAP, AGENTS, data-model da 001, módulos captura/triagem/web e apresentação da 006 alinham opcionais e apontam ao contrato existente. Alias imagem_oferta integrado pelo PR #28 na base 039f0eb; provas locais anteriores preservadas como históricas. M1/M2: estrita igualdade permanece por decisão autorizada e conferência da fonte. M3: Planilha verifica valor MIME e ausência da propriedade extensão em todas as linhas; captura sem ambos recusa pacote mesmo com pacote_versao válida; casos MIME independentes.

O código de produção permanece byte a byte igual ao head inicial. Os casos novos reforçam comportamento existente e passam de imediato; não há RED fabricado nem alteração de implementação para esses testes.

Validação desta rodada em Node 24.19.0/Windows: `node --test tests/pronta.test.cjs`, **23 PASS/0 FAIL/0 SKIP, exit 0**. O único `node tools/quality-gate.mjs` desta rodada terminou **exit 1**: 778 testes contabilizados, tests FAIL, coverage FAIL, complexity PASS/18 avisos, Semgrep SKIP ausente, audit N/A, baseline preservada. O gate agrega e descarta a saída TAP; os nomes daquela execução não estavam disponíveis ao fechar a round 1. O diagnóstico subsequente abaixo preservou TAP de uma nova execução. A causa da falha geral não foi determinada e não é atribuída à pressão de execução por inferência. Não houve alteração do código de produção nem repetição do gate nesta rodada. O sucesso anterior no head f55282e não torna este resultado verde. Sem integração automática; CI/revisão final e resolução do gate pertencem ao novo head.

## Diagnóstico e revisão round 2 — fonte 978f8a3

O [CI estrito do head 978f8a3](https://github.com/Browsher/crm-social/actions/runs/38415415189) passou, conforme conferência do coordenador: testes, cobertura, complexidade e Semgrep PASS, exit 0, baseline não atualizada. CI Linux conserva os pulos de UI/PowerShell (M8), portanto não comprova a camada Windows UI nem substitui o resultado local vermelho.

Uma execução diagnóstica Windows em Node 24.19.0 reproduziu a lista de 31 arquivos e as flags TAP+LCOV/include/exclude do gate, com TEMP nativo e Playwright existente. Resultado: **778 testes, 777 PASS/1 FAIL/0 SKIP, exit 1, 318,15 s**. Falha única: `Prévias US1 cenas mostram início/final na ordem e vídeo permanece somente link`, `tests/previas-interface.test.cjs:131`. Em `abrir` (`:36`), `locator.waitFor` excedeu 3000 ms aguardando `#objetivo-toggle:not(:empty)` visível, antes das assertions das cenas. A falha observada é espera de inicialização da interface; sua causa não foi determinada. O TAP desta execução identifica esse caso, sem inferir que foi necessariamente o mesmo teste da execução anterior cujo TAP não foi preservado.

O mesmo caso isolado com cobertura passou no head 978f8a3 (**1 PASS/0 FAIL, exit 0**) e na base exata 039f0eb (**1 PASS/0 FAIL, exit 0**). Os arquivos desse caso não foram alterados. Nenhum timeout, limiar, baseline, CI ou código de produção foi modificado. O focused não substitui a aprovação da camada Windows completa. TAP/LCOV/stderr integrais permanecem no ledger local externo ao Git, sem dados operacionais.

Esta round 2 registra evidência do CI por head, qualifica os status documentais, reduz duplicação de regra nos módulos web/triagem e renomeia o teste para “sem identificadores capturados”. Apenas o nome mudou no teste; casos extras de caixa/espaços não foram acrescentados, pois a igualdade estrita mantém a decisão existente. A focada após o rename passou **23/23, zero pulos, exit 0**.

Após decisão explícita do coordenador, foi executado uma única vez o gate oficial final desta round 2, no mesmo ambiente nativo Windows/Node 24.19.0, sem FFmpeg ou outra suíte paralela: **778 testes contabilizados, exit 1, tests FAIL/coverage FAIL, complexidade PASS/18 avisos, Semgrep SKIP ausente, audit N/A, baseline preservada**. Esse gate não expôs TAP. A falha nomeada no diagnóstico anterior é a espera inicial da UI de prévias descrita acima; não é apresentada como identidade comprovada da falha nesta última execução. Não houve nova repetição nem alteração de critérios. A camada Windows completa continua sem gate aprovado nesta rodada; CI/revisão do próximo head permanecem separados das provas acima, sem merge automático.

## Round 3 — alinhamento exclusivamente documental

O [CI estrito do head 42db88a](https://github.com/Browsher/crm-social/actions/runs/38418032761) passou, conforme conferência dos passos pelo coordenador. Essa prova Linux conserva a fronteira M8 e não resolve o gate Windows vermelho. Resultados históricos acima permanecem associados às respectivas fontes; nenhum deles transforma a camada Windows em aprovada.

A spec vigente da 001 passa a listar `Arquivos.mime_type` entre os opcionais capturados e aponta à identificação ZIP do contrato existente. Os resultados voláteis por head ficam centralizados neste relatório; README, ROADMAP, AGENTS, arquitetura, projeção e contrato mantêm a regra, o link e o estado implementado/sem integração/gate Windows pendente. Não há mudança de requisitos, escopo, produção, testes, gate, baseline, CI ou tempos limite. Por ser um diff somente textual, nenhuma suíte ou novo gate foi executado nesta round 3, conforme delimitação do coordenador. O próximo head terá seus próprios checks/revisão; o PR não é apresentado como pronto para merge.

M2 do review: o coordenador conferiu por GET readonly o JSON de uma instância isolada do CRM com fonte real capturada; `detalhes.pacotePublicacao` resolveu o pacote por MIME `application/zip`. O código de produção conferido é byte a byte o mesmo da fonte 42db88a. Essa foi uma demonstração real, não teste HTTP sintético novo; IDs, captura e screenshots operacionais ficam somente no ledger privado.

M1 (casos adicionais de caixa/espaços) permanece advisory adiado na triagem final, sem ampliar testes nesta rodada. M3 (aviso localizado ao operador) permanece fora do escopo e não foi implementado. A pendência do gate Windows permanece aberta e requer decisão/diagnóstico próprio antes de declarar conclusão da entrega completa.

## Round 4 — concorrência explícita e gate Windows completo

Em 13/10/2026, a árvore testada partiu de `70ec0991eac9bfcb942869302a04291976ddd32c` e alterou somente `testCommand` para `["node", "--test", "--test-concurrency=2"]`. SHA-256 dos bytes locais dessa configuração: `85db6aa3f82e4bad67f76402aacb11999a41200428a214bc81e4f45463e48687`. A documentação foi sincronizada depois do gate. O código de produção permaneceu byte a byte igual a `f55282e4012caa4d6a6af78f647a5e175fa38f4f`; testes, ferramentas, workflow CI e critérios de segurança não mudaram.

A configuração anterior permitia 11 arquivos simultâneos neste ambiente de 12 processadores disponíveis, pelo padrão do Node 24. Vários arquivos também iniciam navegadores/subprocessos. Limitar a dois trata a hipótese de disputa de recursos entre arquivos; a utilização efetiva de CPU/RAM não foi medida e nenhuma causa exclusiva foi demonstrada. O flag foi conferido no `node --help` e carregado pelo `loadConfig` existente. O argv reconstruído e o efetivamente executado preservaram exatamente os mesmos 31 arquivos, reporters, include/exclude e flags de cobertura do diagnóstico anterior, com a única adição de concorrência e o destino LCOV temporário próprio da execução. Timeouts, assertions, quantidade de casos, maxDrop e limiares ficaram intactos.

Foi executado **uma única vez** `node tools/quality-gate.mjs`, com Node/PATH 24.19.0 no Windows, TEMP/TMP/TMPDIR nativos externos ao checkout e Playwright bundled existente; variáveis privadas CRM foram removidas somente do ambiente de teste. O processo do gate recebeu um preload externo que envolve `spawnSync`: encaminha os mesmos argumentos/opções ao original uma vez, salva stdout/stderr do comando de testes e retorna o mesmo objeto de resultado. Não modifica status, TAP, testes ou ferramentas versionadas. Script, argv efetivo, TAP, stderr, JSON e exit real estão preservados no ledger local da tarefa.

Resultado entre 12:29:46 e 12:34:12 America/Sao_Paulo: **778 PASS, 0 FAIL, 0 cancelled, 0 SKIP, 0 TODO**, duração TAP **255,05 s**, exit real do runner e do gate **0**. Cobertura **95,5340699815838%**, drop **0 em modo full**; complexidade **PASS/18 avisos**; **Semgrep SKIP por ausência local** e **audit N/A** por não haver dependências da aplicação. Drop full não é comparação histórica. `.quality-gate/baseline.json` estava ausente antes e depois (SHA-256 não aplicável); `baselineUpdated=false`, nenhuma baseline criada ou alterada. O diretório temporário de cobertura desta execução foi removido pelo gate; um resíduo anterior foi identificado antes e preservado. TEMP externo terminou somente com cache de compilação Node.

Esta execução aprova a camada Windows completa dessa árvore sem pulos; não prova eliminação estatística de flakiness. Não houve rerun, filtro, retry, aumento de tempo limite, instalação ou alteração de dados reais. O CI estrito do PR restaura `quality-gate.config.json` e `tools/*.mjs` da base por proteção, que foi preservada; portanto seu resultado usa a política da base, enquanto esta prova Windows exercita cap=2. Semgrep e revisão do novo head ainda dependem dos checks correspondentes. A mudança permanece local, sem push, merge ou integração por este implementador.
