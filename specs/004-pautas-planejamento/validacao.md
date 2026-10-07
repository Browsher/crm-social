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
Spec/plano/tarefas definidos. Implementação, testes e screenshots concluídos localmente; correção da origem em dia vazio conferida pela revisão independente. Gate final e doc-sync concluídos; 14/15 tarefas, restando PR/checks remotos. Este registro não comprova uso editorial real. Toda evidência desta entrega usa fixtures sintéticas, cliente remoto falso e TEMP; nenhuma coleta na fonte operacional.

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
Doc-sync-onboarding concluído após estabilizar o código/gate, em 14 Markdown de onboarding/produto/arquitetura/módulos/galeria. Links locais conferidos, cercas balanceadas, índice documental atualizado e `git diff --check` sem erros. Não houve alteração em templates, skills, gate, CI ou baseline. Sem mapa Graphify existente. Documentos diferenciam implementação/teste local de integração; PR ainda pendente neste registro.
