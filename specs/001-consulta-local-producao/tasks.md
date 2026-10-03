# Tasks: Consulta local da produção NTV

**Estado em 02/10/2026:** 22 tarefas planejadas; nenhuma tarefa de implementação concluída. A estrutura Spec Kit já está criada. Caminhos abaixo relativos a `crm-social/`.

**Entrada:** [spec](spec.md), [plan](plan.md), [modelo](data-model.md), [contrato](contracts/captura-e-consulta.md). Testes foram solicitados em FR-012. Executar teste antes da implementação correspondente, observar falha pelo comportamento ausente e repetir após implementar. Não alterar teste para acomodar resultado incorreto.

## Fase 1 — Preparação

- [ ] T001 Criar `tests/fixtures.cjs` com `capturaValida()` que devolve um novo objeto por chamada: seis abas, quatro peças NTV sintéticas, uma peça de outra marca, cabeçalhos completos e hashes calculados conforme o contrato. Nenhum dado privado da operação nas fixtures.

## Fase 2 — Fundação

- [ ] T002 Escrever D01–D05 em `tests/dados.test.cjs`: reordenação, cabeçalho faltante/duplicado, ID repetido, linha sem ID, aba ausente/parcial, retângulo incompleto, metadata divergente e hash recalculado incorreto. Exercitar `capturaId`: “string de 1–100 caracteres, somente `[A-Za-z0-9_-]`; nunca caminho”; “ISO 8601 UTC com `Z`, início menor ou igual ao fim”; `schemaVersion=1` e `brandId=ntv`.
- [ ] T003 Implementar `validarCaptura(raw)` em `src/captura.cjs`, aplicando `contracts/captura-e-consulta.md`: “IDs não vazios e únicos por aba”; cabeçalhos por nome, matriz de escalares, dimensões/intervalo, duas leituras iguais e hash recalculado. Retornar registros normalizados por aba com linha de origem; não fazer rede.
- [ ] T004 Escrever S01–S02 em `tests/snapshot.test.cjs`, usando diretório temporário: nenhuma captura, promoção válida, falha de gravação, nova coleta inválida, repetição e conflito do mesmo ID; última válida deve permanecer.
- [ ] T005 Implementar `promoverCaptura(raw, dataDir)` e `lerEstado(dataDir, nowIso)` em `src/snapshot.cjs`, capturas imutáveis, ponteiro por substituição, último erro resumido e nenhuma exclusão. Mesmo ID+bytes é `sem_alteracao`; mesmo ID+outros bytes é conflito.
- [ ] T006 Criar `scripts/importar-captura.cjs` com argumento obrigatório de caminho local, validação por T003 e promoção por T005; erro tem saída diferente de zero, sucesso informa ID e resultado, sem imprimir células. Não aceitar URL ou chamar o Google.

## Fase 3 — US1: calendário e lista (P1)

**Teste independente:** comparar IDs/datas das quatro peças da fixture em calendário, lista e filtro. A imagem B fica visível, inclusive com geração desligada; não preencher semana vazia.

- [ ] T007 [P] [US1] Escrever P01–P03 em `tests/projecao.test.cjs`: quatro peças únicas, outra marca excluída, semana entre meses, calendário com outubro iniciando na quinta e “Data editorial é `YYYY-MM-DD` válida no calendário civil”; data inválida em lista separada, formato desconhecido como “Outro”.
- [ ] T008 [P] [US1] Escrever H01–H04 em `tests/servidor.test.cjs`: `/api/visao`, ausência de captura, GET/HEAD estáticos, POST 405, privado/traversal 404, Host/Origin inválidos rejeitados. Servidor de teste usa porta temporária em loopback, nunca a fila.
- [ ] T009 [US1] Implementar `projetarVisao(captura, nowIso)` em `src/projecao.cjs` para semanas e peças, mantendo IDs, datas e facetas distintas. Não importar seletores n8n nem descartar produções por status; devolver avisos localizados.
- [ ] T010 [US1] Implementar `criarServidor({dataDir, port})` em `src/servidor.cjs`, usando T005/T009, somente rotas permitidas, bind loopback no ponto de entrada, cache desabilitado para `/api/visao`, sem rede externa ou escrita via HTTP.
- [ ] T011 [US1] Escrever U01–U02 em `tests/interface.cjs` com Playwright existente: lista/calendário/filtro/semana concordam e calendário não inventa peças; estados vazios e retorno ao filtro geral. Usar servidor e dados temporários.
- [ ] T012 [US1] Adaptar o desenho aprovado para `src/web/index.html`, `src/web/app.js` e `src/web/styles.css`: buscar apenas `/api/visao`, calendário/lista/filtros/semana e estado sem captura. Remover sugestões e ações demonstrativas; incluir origem/horário desde essa primeira entrega.

## Fase 4 — US2: atualização compreensível (P1)

**Teste independente:** importar captura válida, falhar a próxima e verificar que o horário original permanece; coleta nova com células iguais renova a data de consulta.

- [ ] T013 [P] [US2] Acrescentar S03 em `tests/snapshot.test.cjs`: mesmo ID é no-op, outro ID com células iguais renova horário, falha não renova e transição de dia em America/Sao_Paulo marca dados anteriores a hoje.
- [ ] T014 [P] [US2] Acrescentar cenários de US2 em `tests/interface.cjs`: horário/fonte em todas as visões, captura antiga e falha recente coexistem, botão “Reler dados locais” não faz consulta Google.
- [ ] T015 [US2] Completar `src/snapshot.cjs`, `src/projecao.cjs` e `src/web/app.js` para frescor, última tentativa e releitura local conforme contrato; manter explicação explícita da captura. Um único implementador fica responsável por esses arquivos compartilhados nesta tarefa.

## Fase 5 — US3: detalhe e próximo responsável (P2)

**Teste independente:** abrir um Reels planejado sem vídeo final e localizar roteiro, revisões, origens e responsáveis; não anunciar mídia ausente como pronta.

- [ ] T016 [P] [US3] Acrescentar P04–P06 em `tests/projecao.test.cjs`: ponteiros internos, documentos semanais, páginas/cenas/arquivos/revisões, origens inválidas, órfãos, empate e histórico. Aplicar “Versões e índices são inteiros positivos quando preenchidos” e “Duração e início, quando preenchidos, são números finitos não negativos”; vazio continua desconhecido.
- [ ] T017 [P] [US3] Acrescentar U03–U04 em `tests/interface.cjs`: abrir peça em até dois acionamentos, detalhe acessível, Escape/restauração de foco, 390/1440 sem corte, HTML malicioso tratado como texto e link não HTTPS ou host não permitido não clicável.
- [ ] T018 [US3] Completar `src/projecao.cjs` para detalhes e relações do modelo, incluindo campos opcionais de texto quando presentes; classificar arquivo apenas registrado, diferenciar aprovação/liberação/publicação e revisão histórica, preservar avisos sem ocultar a peça.
- [ ] T019 [US3] Completar diálogo em `src/web/index.html`, `src/web/app.js` e `src/web/styles.css`: textos/páginas/cenas/documentos/revisões com versão e próximo responsável, links autorizados, mídia ausente explícita, navegação por teclado e layout responsivo.

## Fase 6 — Entrega

- [ ] T020 Criar `Iniciar CRM.ps1` com runtime Node existente e inicialização oculta em loopback; porta ocupada produz orientação sem matar processo. Registrar uso e encerramento em `README.md`; verificar rotas restritas no servidor iniciado.
- [ ] T021 Executar `specs/001-consulta-local-producao/quickstart.md`, coletar leitura real completa pela Central em `data/` e comparar IDs/datas/pendências com a mesma captura. Registrar resultados e limitações em `specs/001-consulta-local-producao/validacao.md`; verificar também fixture de 500 peças sem confundir com produção.
- [ ] T022 Fazer revisão independente de contrato/código e demonstração da feature; corrigir achados, repetir só verificações afetadas e atualizar `README.md`, `ROADMAP.md` e `specs/001-consulta-local-producao/validacao.md` com estado observado. Atualizar documentação pai se a arquitetura efetiva diferir do plano.

## Dependências, paralelismo e estratégia

T001 → T002 → T003 → T004 → T005 → T006 precedem o primeiro painel. T007 e T008 podem ocorrer juntos; T009 antes de integrar T010; T011 antes de T012. T013/T014 podem ocorrer juntos após US1. T016/T017 podem ocorrer juntos após US2. T020–T022 dependem das três histórias.

Exemplos de delegação: US1 separa testes de projeção e HTTP; US2 separa testes de persistência e interface; US3 separa testes de relações e interface. Marca `[P]` significa paralelismo dentro da fase após os pré-requisitos, não permissão para pular fundação. Implementadores de `app.js` não trabalham simultaneamente; coordenador integra. Revisores não reescrevem arquivos sem atribuição.

Primeira demonstração: US1 com origem/horário básico; feature completa exige também US2 e US3. Entregar, demonstrar e discutir antes da feature 002. Não instalar novas agendas ou modificar flags para produzir a demonstração.

## Exemplos executáveis que orientam os testes

Esses trechos definem comportamentos, não substituem os arquivos completos. `capturaValida()` é criada em T001; interfaces de produção estão no plano.

```js
// D03: identidade duplicada deve invalidar a captura, mesmo se o hash for coerente.
const assert = require('node:assert/strict');
const { validarCaptura } = require('../src/captura.cjs');
const { capturaValida, recalcularHashes } = require('./fixtures.cjs');
const raw = capturaValida();
raw.tables['Produções'].values.push([...raw.tables['Produções'].values[1]]);
recalcularHashes(raw);
assert.throws(() => validarCaptura(raw), /duplicad/i);
```

```js
// S02: tentativa inválida conserva a leitura anterior.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { promoverCaptura, lerEstado } = require('../src/snapshot.cjs');
const { capturaValida } = require('./fixtures.cjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-snapshot-'));
try {
  const boa = capturaValida();
  promoverCaptura(boa, dir);
  const ruim = capturaValida();
  ruim.capturaId = 'tentativa-incompleta';
  delete ruim.tables.Cenas;
  assert.throws(() => promoverCaptura(ruim, dir), /Cenas/);
  assert.equal(lerEstado(dir, boa.completedAt).captura.capturaId, boa.capturaId);
} finally {
  fs.rmSync(dir, { recursive: true, force: true }); // apenas temp criado neste teste
}
```

T001 também exporta `recalcularHashes(raw)`, que recalcula ambos os hashes canônicos da fixture. O teste de hash incorreto não chama esse auxiliar depois de alterar a célula. Os comandos e resultados esperados estão no quickstart.

## Cobertura

FR-001/002/005: T007–T012; FR-003/004: T004–T006 e T013–T015; FR-006/007/008: T016–T019; FR-009/010: T008/T010/T017/T020; FR-011: T011/T017/T019; FR-012 e SC-001–006: testes correspondentes, T021–T022. Nenhum requisito ficou sem tarefa no autorrevisor documental de 02/10.
