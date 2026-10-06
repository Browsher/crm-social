# Pesquisa — Meses opcional

Data: 2026-10-05. Decisões de planejamento preservadas e conferidas na implementação local; sem execução Google real. Evidências em [validacao.md](validacao.md).

## 1. Compatibilidade do envelope

**Decisão:** manter v1, seis obrigatórias em `CAMPOS` e descriptor separado de Meses; opcional ausente não entra nos mapas/hash.
**Motivo:** `src/captura.cjs` mantém os seis nomes obrigatórios e canonicaliza o hash com pares ordenados por nome; preencher aba ausente mudaria o hash legado. `src/triagem.cjs`/`projecao.cjs` cruzam as seis listas com chaves fixas. Meses só participa quando presente; sua posição final é de apresentação, não de hash.
**Alternativas:** tornar sete obrigatórias viola compatibilidade; nova versão de esquema/migração amplia a mudança sem necessidade.

## 2. Leitura opcional íntegra

**Decisão:** detectar Meses nos metadados iniciais, pedir seis ou sete ranges nas duas leituras e comparar presença/ID/dimensões/fuso ao final.
**Motivo:** o cliente existente já retorna metadados de todas as abas e recebe ranges variáveis. A documentação oficial permite restringir metadados por `fields` e confirma a ordem de `valueRanges` igual à dos ranges pedidos. Fontes consultadas via Context7: [spreadsheets.get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get) e [values.batchGet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet).
**Alternativas:** pedir range de Meses sem verificar existência compromete ausência normal; coletar Meses separadamente ou somente uma vez quebra a integridade conjunta. Não há garantia transacional remota além das verificações conservadoras já adotadas na 002.

## 3. Duplicatas e origem dos avisos

**Decisão:** parser opcional conserva linhas por índice físico em WeakMap privado, consultado por `linhaMensal`; agrupamento semântico por marca/mês aceita duplicatas e gera aviso para cada linha NTV envolvida.
**Motivo:** nas seis abas, `registros` recusa primeira coluna repetida; reutilizar esse Map para Meses perderia origem. O ramo mensal preserva duplicatas e linhas físicas mesmo após linhas vazias ou marcas excluídas.
**Alternativas:** novo ID/versionamento mensal exigiria campos extras; escolher a primeira/última linha viola o estado A confirmar.

## 4. Consulta mínima

**Decisão:** Meses é tabela opcional de `visao.planilha`; card filtra o mês exibido em `state.mes`. Objetivo textual definido na cor principal; Ainda não definido/A confirmar apagados. Pautas LF/CRLF, primeiras cinco e +N pautas, singular +1 pauta; célula completa na Planilha.
**Motivo:** evita propriedade raiz/rota nova e vínculo com semana. Renderização por `textContent` e mesma redação de texto existente. O booleano textual `definido` mantém conteúdo e classe coerentes ao navegar; `.more-topics` separa o contador de texto literal como `+2`.
**Alternativas:** botões de execução/editor/plano detalhado, leitura livre de Drive e lógica de agentes ampliariam o produto além do reescopo.

## 5. Validação semântica e preparação

**Decisão:** `marca_id==='ntv'` mantém seleção atual; mês inválido e objetivo/pautas de tipo não textual na seleção NTV geram avisos. Cabeçalho/integridade inválidos recusam a candidata. Autor formata mes como texto e preenche a aba fora do CRM.
**Motivo:** preserva tipos recebidos e não converte serial/bool em intenção mensal; trata duplicata como dúvida de dados, sem falha estrutural. Aba real ausente não bloqueia fixtures.
**Alternativas:** coagir mes/data ou fabricar objetivo perde informação; criar aba via CRM concederia escrita não autorizada.

Não há dúvida técnica de planejamento pendente. Implementação e testes locais executados; integração real não comprovada. O autor autorizou push e PR da 003; T021/aceite da 002 permanece bloqueio somente do merge. Preparação manual de Meses e demonstração real da 003 continuam pendentes.
