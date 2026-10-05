# Consulta do planejamento mensal — Implementation Plan

> **For agentic workers:** executar futuramente com `speckit-implement` e `superpowers:executing-plans`, task por task, testes antes do código. Este plano não autoriza início antes de T021/aceite da 002.

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
- Card: até cinco pautas, restante `+N`; sem aba/linha/objetivo, `Ainda não definido`; duplicata, `A confirmar` e nenhum texto escolhido.
- A preparação manual de Meses é do autor; não bloqueia testes com fakes/fixtures/TEMP. Implementação inteira aguarda T021/aceite da 002.
- Não alterar tools/configuração/baseline do gate, autenticação, endpoints ou dependências. Nenhum perfil, agenda, meta semanal ou vínculo mês/semana novo.
- Sem dados reais, IDs privados, e-mails de conta ou segredo em Git/relatórios/logs. Não iniciar aplicação ou consulta real nesta rodada documental.
- Commits com noreply do autor, sem coautoria. Publicação atual apenas da branch; nenhum PR ou merge nesta rodada.

## Technical Context

| Aspecto | Solução mínima |
| --- | --- |
| Linguagem/plataforma | Node 24.19.0, Windows local/loopback; CI Linux mantém limitações UI/PowerShell conhecidas |
| Armazenamento | Envelope v1 e recibos imutáveis no diretório privado já usado; sem banco/schemaVersion novo |
| Testes | node:test/assert, HTTP real efêmero, arquivos TEMP e Playwright existente; cinco camadas antes do aceite |
| Coleta | Meses por título exato nos metadados; seis ou sete ranges, duas leituras, mesmos tipos/guards/timeouts da 002 |
| Integridade | Mesma ordem das seis obrigatórias; opcional por último apenas quando presente; ausência consistente nos três mapas |
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
- V: uma spec canônica, plano/tarefas rastreáveis e revisão futura; T021 bloqueia implementação.
- VI: mesmo cliente readonly/loopback, metadados antes/depois e duas leituras integrais; Central por arquivo preservada; sem escrita ou segredo.

## Project Structure

### Documentation (this feature)

`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/meses.md`, `quickstart.md`, `checklists/requirements.md`; `tasks.md` gerado depois do desenho. Evidência futura somente em `validacao.md` ao executar a feature, não fabricada nesta rodada.

### Source Code (repository root) — alterações futuras

| Arquivo | Responsabilidade |
| --- | --- |
| `src/captura.cjs` | Descriptor opcional, conjunto de nomes/tipos/integridade e parser de linhas sem unicidade de mes; hash legado exato |
| `src/coleta.cjs` | Meses opcional nas duas leituras e comparação de metadados; mes permanece texto, sem conversão serial |
| `src/triagem.cjs` | Seleção/redação dos quatro mínimos e localização por índice físico das linhas de Meses |
| `src/projecao.cjs` | Acrescentar tabela opcional e avisos de duplicata/mês/tipo inválido, preservando as propriedades existentes |
| `src/web/index.html`, `src/web/app.js`, `src/web/styles.css` | Atualizar card e lista curta, navegação mensal e seleção/teclado da aba opcional |
| `tests/fixtures.cjs`, `tests/dados.test.cjs`, `tests/snapshot.test.cjs`, `tests/importador.test.cjs` | Fixtures novas isoladas e regressões de envelope/hash/persistência/CLI |
| `tests/projecao.test.cjs`, `tests/coleta.test.cjs`, `tests/servidor.test.cjs` | Seleção/avisos/privacidade e atualização completa com cliente falso |
| `tests/interface.test.cjs`, `tests/atualizacao-interface.test.cjs` | Card, Planilha, POST→GET e teclado/390 px |

`src/google.cjs`, `src/snapshot.cjs`, `src/servidor.cjs` e CLI já encaminham ranges/capturas; preservar assinaturas e reaproveitar, sem refatoração preventiva. Só tocar se um teste do contrato demonstrar necessidade concreta. Um dono por arquivo; tarefas em série quando compartilham app/projeção/fixtures.

## Interfaces e sequência de execução futura

1. Fundamento: `validarCaptura(raw)` mantém o retorno normalizado existente `{envelope, semanas, producoes, paginas, cenas, arquivos, revisoes}` e acrescenta `meses` somente quando Meses foi capturada; `hashCelulas(tables)` inclui opcional somente se presente. `CAMPOS` mantém seis nomes; `CAMPOS_MESES` será descriptor separado, sem substituir listas fixas usadas pelas seis abas. Registrar índice físico de Meses desde o parser, sem expor campo extra na tabela.
2. US1: `selecionarNtv(captura, avisos, origens, validadeJson)` mantém assinatura/resultado atual e acrescenta `meses` triados quando presentes; `origens` conserva localização física. `projetarVisao(estadoLocal, nowIso, mapaQuadro)` mantém assinatura e raiz/envelope/contagens, acrescentando apenas Meses em `planilha` e avisos existentes. Card deriva estados por `state.mes`, sem usar `semanas[].objetivoMensal` nem ligar semanas ao mês.
3. US2: `coletarCaptura(client, options)` detecta opcional antes, lê todos os ranges duas vezes, compara hash e metadados finais. Mudança em Meses participa da promoção; falha mantém vigente/recibo/frescor como 002. `POST /api/atualizar {}` e GET mantêm o contrato atual.
4. US3: renderizar a tabela opcional, avisos localizados e fallback de aba selecionada quando Meses desaparece, preservando seis tabelas/Histórico/atalhos.
5. Aceite: cinco camadas, gate local e Linux, review independente e documentação sincronizada. Demonstração mensal privada após autor preparar a aba; isso não bloqueia a execução sintética após T021 da 002.

## Review Focus

- Meses ausente artificialmente criada vazia altera hash/no-op do legado: cobrir em T003/T004.
- Mesma primeira coluna entre marcas/duplicatas perde linha física ou invalida captura: cobrir em T003 e T005/T006.
- Criação/remoção ou mudança só na opcional passa despercebida: cobrir em T009/T010, preservando bytes/horário da vigente na falha.
- Texto mensal vira HTML/link ou escapa da redação/seleção NTV: cobrir em T005/T006/T007/T008/T011/T012.
- Card não acompanha troca de mês/POST→GET, ou seleção de Meses fica órfã: cobrir em T007/T008/T011/T012.

## Complexity Tracking

Sem violação constitucional, novo módulo de coordenação ou infraestrutura. Extensão localizada dos módulos existentes. Código/testes ainda não escritos; comandos e resultados de aceite serão registrados somente na execução futura.
