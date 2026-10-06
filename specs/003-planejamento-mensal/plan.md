# Consulta do planejamento mensal — Implementation Plan

> **For agentic workers:** implementação executada por tarefas e testes de comportamento; evidências em [validacao.md](validacao.md). A T021 da 002 foi demonstrada e integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16); o pré-requisito da 003 foi atendido. O merge da 003 foi autorizado e exige gate/review do head integrado sem bloqueio de segurança ou regressão. Preparação manual de Meses e demonstração real continuam pendentes.

**Branch**: `003-planejamento-mensal` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)
**Goal**: ler Meses opcional e apresentar objetivo/pautas mensais sem escrever na operação.
**Architecture**: estender o envelope v1 com uma única aba opcional. Coleta detecta sua presença nos metadados e inclui no batchGet duplo; importador/triagem/projeção reutilizam o caminho atual. Card consome a tabela Meses de `visao.planilha`, pelo `state.mes` exibido.
**Tech Stack**: Node 24.19.0, CommonJS, `crypto/fs/http/fetch` nativos, HTML/CSS/JS existentes e Playwright já adotado; zero dependência nova.
**Input**: reescopo do autor refletido na spec; [pesquisa](research.md), [modelo](data-model.md), [contrato](contracts/meses.md), [quickstart](quickstart.md).

## Summary

Preservar as seis obrigatórias e seu descriptor `CAMPOS`; criar descriptor separado de Meses com quatro mínimos. Ausência não é preenchida com tabela vazia artificial. Quando presente, Meses entra nos três mapas do envelope e no hash, conservando linhas repetidas. Duplicidade por marca/mês é aviso semântico, não falha de captura. O card mostra uma linha do mês exibido ou os dois estados definidos pelo autor.

## Global Constraints

- Somente consulta local NTV; quatro mínimos: `mes`, `marca_id`, `objetivo`, `pautas`. CRM nunca escreve no Google, Drive, n8n ou agentes.
- Meses é opcional; captura antiga não sofre migração, regravação ou novo hash. Seis obrigatórias e 66 mínimos permanecem intactos.
- Card: objetivo definido na cor principal; até cinco pautas, restante `+N pautas`/`+1 pauta`; sem aba/linha/objetivo, `Ainda não definido`; duplicata, `A confirmar` e nenhum texto escolhido. Apenas esses dois estados usam tom apagado.
- A preparação manual de Meses é do autor; não bloqueia implementação ou testes com fakes/fixtures/TEMP. A T021 da 002 foi demonstrada e integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16); o pré-requisito da 003 foi atendido. O merge da 003 foi autorizado e exige gate/review do head integrado sem bloqueio de segurança ou regressão.
- Não alterar tools/configuração/baseline do gate, autenticação, endpoints ou dependências. Nenhum perfil, agenda, meta semanal ou vínculo mês/semana novo.
- Sem dados reais, IDs privados, e-mails de conta ou segredo em Git/relatórios/logs. Aplicação/testes locais usam somente fixtures e TEMP; nenhuma consulta real nesta implementação.
- Commits com noreply do autor, sem coautoria. Push, PR e merge autorizados; o pré-requisito T021 foi atendido, e o novo head exige gate/review vigentes sem bloqueio.

## Technical Context

| Aspecto | Solução mínima |
| --- | --- |
| Linguagem/plataforma | Node 24.19.0, Windows local/loopback; CI Linux mantém limitações UI/PowerShell conhecidas |
| Armazenamento | Envelope v1 e recibos imutáveis no diretório privado já usado; sem banco/schemaVersion novo |
| Testes | node:test/assert, HTTP real efêmero, arquivos TEMP e Playwright existente; cinco camadas antes do aceite |
| Coleta | Meses por título exato nos metadados; seis ou sete ranges, duas leituras, mesmos tipos/guards/timeouts da 002 |
| Integridade | Pares ordenados por nome de aba na canonicalização do hash; seis hashes legados preservados; Meses participa somente quando presente nos três mapas |
| Identidade | Meses não usa primeira coluna como ID único; linhas físicas preservadas; chave semântica `(marca_id, mes)` |
| Projeção | Meses em `planilha` só se capturada; quatro mínimos, seleção NTV literal, redação existente e avisos Aba/Linha/Campo/Motivo |
| Interface | Card seleciona `state.mes` em tabela projetada; textos via `textContent`; Meses entre Revisoes e Histórico |
| Escala/performance | Um autor e aba mensal pequena; nenhuma meta de escala, cache ou benchmark novo; mesmas quatro chamadas de leitura da 002 |

## Constitution Check

Conferido antes da pesquisa e novamente após o desenho: sem exceção ou emenda.

- I: local, simples, sem pacote/banco/infraestrutura nova.
- II: planilha permanece fonte; captura íntegra com horário/falha; arquivos históricos preservados.
- III: CRM somente lê valores manuais; responsabilidades editoriais e migração semanal fora.
- IV: TDD proporcional das cinco camadas, fixtures privadas/sintéticas, sem confundir plano com implementação.
- V: uma spec canônica, plano/tarefas rastreáveis e revisão independente; T021 atendida; merge autorizado sob gate/review vigentes sem bloqueio.
- VI: mesmo cliente readonly/loopback, metadados antes/depois e duas leituras integrais; Central por arquivo preservada; sem escrita ou segredo.

## Project Structure

### Documentation (this feature)

`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/meses.md`, `quickstart.md`, `checklists/requirements.md` e `tasks.md`. Evidências executadas em [validacao.md](validacao.md), [gate local inicial](../../docs/reports/003-local-gate.json), [gate local dos ajustes](../../docs/reports/003-ajustes-local-gate.json) e screenshots sintéticos; não comprovam integração real.

### Source Code (repository root) — implementação local

| Arquivo | Responsabilidade |
| --- | --- |
| `src/captura.cjs` | Descriptor opcional, conjunto de nomes/tipos/integridade e parser de linhas sem unicidade de mes; hash legado exato |
| `src/coleta.cjs` | Meses opcional nas duas leituras e comparação de metadados; mes permanece texto, sem conversão serial |
| `src/triagem.cjs` | Seleção/redação dos quatro mínimos e localização por índice físico das linhas de Meses |
| `src/projecao.cjs` | Acrescenta tabela opcional e transporta avisos produzidos pela triagem, preservando as propriedades existentes |
| `src/web/app.js`, `src/web/styles.css` | Card e lista curta no elemento HTML existente; navegação mensal e seleção/teclado da aba opcional reaproveitados |
| `tests/fixtures.cjs`, `tests/dados.test.cjs`, `tests/snapshot.test.cjs`, `tests/importador.test.cjs` | Fixtures novas isoladas e regressões de envelope/hash/persistência/CLI |
| `tests/projecao.test.cjs`, `tests/coleta.test.cjs`, `tests/servidor.test.cjs` | Seleção/avisos/privacidade e atualização completa com cliente falso |
| `tests/interface.test.cjs`, `tests/atualizacao-interface.test.cjs` | Card, Planilha, POST→GET e teclado/390 px |

`src/google.cjs`, `src/snapshot.cjs`, `src/servidor.cjs` e CLI já encaminham ranges/capturas; preservar assinaturas e reaproveitar, sem refatoração preventiva. Só tocar se um teste do contrato demonstrar necessidade concreta. Um dono por arquivo; tarefas em série quando compartilham app/projeção/fixtures.

## Interfaces e sequência implementadas

1. Fundamento: `validarCaptura(raw)` mantém o retorno normalizado existente `{envelope, semanas, producoes, paginas, cenas, arquivos, revisoes}` e acrescenta `meses` somente quando Meses foi capturada; `hashCelulas(tables)` inclui opcional somente se presente e ordena pares por nome. `CAMPOS` mantém seis nomes; `CAMPOS_MESES` é descriptor separado. `registros` guarda o índice físico da linha mensal em WeakMap privado; `linhaMensal(record)` o entrega à triagem, sem coluna extra na tabela.
2. US1: `selecionarNtv(captura, avisos, origens, validadeJson)` mantém assinatura/resultado atual e acrescenta `meses` triados quando presentes; `origens` conserva localização física. `projetarVisao(estadoLocal, nowIso, mapaQuadro)` mantém assinatura e raiz/envelope/contagens, acrescentando apenas Meses em `planilha` e avisos existentes. Card deriva estados por `state.mes`, sem usar `semanas[].objetivoMensal` nem ligar semanas ao mês.
3. US2: `coletarCaptura(client, options)` detecta opcional antes, lê todos os ranges duas vezes, compara hash e metadados finais. Mudança em Meses participa da promoção; falha mantém vigente/recibo/frescor como 002. `POST /api/atualizar {}` e GET mantêm o contrato atual.
4. US3: renderizar a tabela opcional, avisos localizados e fallback de aba selecionada quando Meses desaparece, preservando seis tabelas/Histórico/atalhos.
5. Aceite local: cinco camadas e gate local executados; resultados na validação. Gate Linux e review publicado do PR #15 conferidos; evidências na validação. Demonstração mensal privada após autor preparar a aba; isso não bloqueia a execução sintética. T021 atendida; merge autorizado sob gate/review vigentes sem bloqueio.

## Review Focus

- Meses ausente artificialmente criada vazia altera hash/no-op do legado: cobrir em T003/T004.
- Mesma primeira coluna entre marcas/duplicatas perde linha física ou invalida captura: cobrir em T003 e T005/T006.
- Criação/remoção ou mudança só na opcional passa despercebida: cobrir em T009/T010, preservando bytes/horário da vigente na falha.
- Texto mensal vira HTML/link ou escapa da redação/seleção NTV: cobrir em T005/T006/T007/T008/T011/T012.
- Card não acompanha troca de mês/POST→GET, ou seleção de Meses fica órfã: cobrir em T007/T008/T011/T012.

## Complexity Tracking

Sem violação constitucional, novo módulo de coordenação ou infraestrutura. Extensão localizada dos módulos existentes. Gate histórico local dos ajustes, fonte `84ab509`, em Node 24.19.0: 320 testes PASS sem pulos, cobertura 98,3660%, drop 0, complexidade PASS com 17 avisos e baseline preservada. `objetivoMensal` passou de complexidade 12 para 14, abaixo do bloqueio em 21. Semgrep SKIP por ausência no Windows e audit N/A por ausência de dependências de aplicação; relatório e limites na [validação](validacao.md). O head `fd92f09`, com a fonte de código `84ab509`, tem [gate Linux](https://github.com/Browsher/crm-social/actions/runs/37389043475) e [review publicado](https://github.com/Browsher/crm-social/pull/15#issuecomment-6005518372) conferidos, sem Critical/Important/segurança/regressão. O código/testes/gate são idênticos entre esses heads; novos commits exigem conferir os checks do PR, sem atribuir-lhes um resultado anterior.
