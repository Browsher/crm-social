# Validação — 004 Pautas no Planejamento

## Escopo e fonte
Solicitação de 07/10/2026: consulta de Pautas opcional e Semanas.pauta_id opcional; [spec](spec.md), [plano](plan.md), [15 tarefas](tasks.md). Base local `4c9af22e3b57a135218ab5504e7da0e2472ffdca`, após integração do iniciador. Branch `codex/004-pautas-planejamento`. Um PR, sem merge autorizado.

## Decisões registradas
- Reutilizar v1 e incluir opcionais somente quando capturadas; nenhuma migração de capturas antigas.
- IDs opacos; validar identidade/calendário e resolver vínculo no backend, sem inferência.
- Unicidade no conjunto NTV, após seleção da marca: outra marca não produz conteúdo/avisos; ponteiro só encontrado em outra marca permanece órfão. Preserva a fronteira existente da consulta.
- Pautas estruturadas assumem a lista do mês quando presentes; mês sem linhas conserva comportamento da 003.
- Destino semanal deve existir mesmo sem peças; gaveta pode apresentar origens de várias semanas no mesmo dia.
- Documentos e templates oficiais preservados; numeração do backlog futuro ajustada para 005/006.
- Context7 conferido para Sheets e Playwright; nenhuma dependência instalada. Ausência de mapa Graphify neste checkout conferida.

## Estado
Spec/plano/tarefas definidos. Implementação, testes e screenshots concluídos localmente; correções conferidas pela revisão independente. [PR #20](https://github.com/Browsher/crm-social/pull/20) aberto, gate estrito aprovado no primeiro head e três Minor atendidos. T012–T014 reconferidas com gate de 434 testes e doc-sync final; T015 aguarda checks/review do head atualizado. Este registro não comprova uso editorial real. Toda evidência desta entrega usa fixtures sintéticas, cliente remoto falso e TEMP; nenhuma coleta na fonte operacional.

## TDD e regressões parciais
Backend: RED inicial 6 PASS/32 FAIL pela ausência do suporte a Pautas; implementação e casos adicionais terminaram com 190 PASS/0 FAIL/0 SKIP nos arquivos pautas, coleta, projecao, snapshot e servidor (41 testes P004). A invocação também continha o padrão inexistente captura.test.cjs, ignorado pelo runner; não foi contado como teste executado. O coordenador executou separadamente `node --test tests/dados.test.cjs`: 25 PASS/0 FAIL/0 SKIP, incluindo hashes legados literais. Gate integrado ainda pendente nesta fase.

## Interface, screenshots e gate Windows
UI: RED inicial 1 PASS/8 FAIL; regressão de interface/tema/atualização 148 PASS sem pulos; após teste RED de acessibilidade, destinos do calendário limitados às segundas-feiras com role group. Teste RED de status constructor comprovou rótulo herdado indevido; correção usa Object.hasOwn e três rótulos contratuais. Suíte final U004: 11 PASS sem pulos. Contraste de novos textos >=4,5:1 em claro/escuro e 1440/390; teclado/foco, semana sem peças, múltiplas origens, órfão, mês atravessado, fallback e releitura verificados.

Gerador: RED por ausência de PNG; GREEN 4 PASS sem pulos (guardas de exclusão, falha do navegador e CLI real em cópia TEMP). Geração exit 0, 20 PNG, todos inspecionados pelo responsável e seis amostras pelo coordenador. [Galeria](../../docs/design/screenshots/LEIA-ME.md#004--pautas-no-planejamento). As imagens mantêm a galeria anterior e não mostram dados reais.

Primeiro `node tools/quality-gate.mjs`, Node 24.19.0, Windows com Playwright existente: **427 testes PASS**, cobertura **93,8748%**, complexidade PASS/19 avisos, exit **0**, baseline preservada. Execução TAP completa confirmou 427 PASS/0 FAIL/0 SKIP. [Resumo sanitizado](../../docs/reports/004-local-gate.json). O modo é full: drop 0 é o valor desse modo, não comparação com os 96,3498% históricos. O percentual medido agora inclui o novo módulo/fixture/gerador; a UI continua fora do LCOV. Semgrep SKIP por ferramenta ausente; audit N/A sem dependências do app. Gate estrito remoto e review ainda pendentes, separados da prova Windows.

Varredura final de 36 arquivos textuais alterados/criados após a correção e o doc-sync: sem correspondência para e-mail de conta de serviço, URL privada de planilha, chave privada completa ou cópia/caminho do contrato operacional. Limite: padrões conservadores não comprovam ausência de todo segredo possível. Nenhum arquivo de output/ preexistente foi incluído.

## Revisão independente local
Revisor separado, seguindo `.claude/agents/reviewer.md`, examinou os documentos, diff/trechos e relatórios fornecidos pelo coordenador, sem executar comandos nem alterar arquivos. Encontrou um **Important**: a gaveta de um dia vazio omitia a origem da semana. Corrigido em `src/web/app.js`: sem peças, usa somente semanas capturadas que abrangem a data e cuja `pautaOrigem` já foi confirmada; deduplica origens, mantém mensagem vazia e não cria documentos vazios. Com peças, conserva suas respectivas semanas.

Teste RED: 1 FAIL; GREEN U004: 12 PASS/0 FAIL/0 SKIP. Limites inclusivos, dias fora do período e ponteiro órfão cobertos. Revisor conferiu patch/teste e encerrou sem Critical, Important pendente ou problema concreto de segurança no material recebido, condicionado ao gate após a correção. Limites: não examinou diretamente todo o diff ou os PNGs; review remoto do futuro head continua necessário. Nenhuma autorização de merge.

Gate final após a correção: **428 testes PASS**, cobertura **93,8748%**, complexidade PASS/**20 avisos**, exit **0**, baseline preservada. Execução TAP completa da mesma árvore confirmou **428 PASS/0 FAIL/0 SKIP**, sem cancelados ou TODO. `origensDoDia` ficou com complexidade 13, abaixo do limiar de reprovação 21. Limitações de Semgrep/audit/LCOV/modo full permanecem as registradas acima. [Relatório final sanitizado](../../docs/reports/004-local-gate.json). Galeria regenerada nessa árvore: 20 PNG, exit 0, seis amostras visuais cobrindo ambos os temas e larguras sem alterações inesperadas.

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
LCOV Windows com os mesmos includes/excludes do gate; agregado idêntico ao relatório: **1.409/1.501 linhas (93,8708%)**. Resumo sanitizado e linhas não cobertas em `coverageDetails` do [relatório](../../docs/reports/004-local-gate.json); LCOV bruto com caminhos locais não é publicado.

| Arquivo | Linhas cobertas/medidas | Percentual |
| --- | --- | --- |
| src/captura.cjs | 140/140 | 100% |
| src/coleta.cjs | 85/85 | 100% |
| src/triagem.cjs | 101/101 | 100% |
| src/projecao.cjs | 308/308 | 100% |
| src/pautas.cjs | 50/50 | 100% |
| tests/pautas-fixtures.cjs | 23/23 | 100% |
| scripts/screenshots-pautas.cjs | 52/96 | 54,1667% |

As 44 linhas não cobertas do novo gerador respondem por 44 das 92 linhas não cobertas do agregado. O CLI real foi executado e verificado em subprocesso, cuja cobertura não é incorporada à do processo pai; os testes VM medem preparação/falhas/limpeza. Os cinco módulos de backend alterados têm 100% das linhas medidas cobertas, o que não equivale a 100% dos ramos. UI permanece exercitada no navegador, fora do LCOV. Não foi refeita a medição por arquivo da main histórica, portanto o percentual agregado anterior não serve como comparação direta de ramos.
