# Captura e validação

Como a conferência de uma fotografia e sua etiqueta, este módulo verifica se o arquivo recebido descreve uma observação completa e coerente. Ele recebe dados locais; não fotografa a operação nem chama o Google.

Implementado com regras puras de estrutura e tempo; estado e evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Fonte: [src/captura.cjs](../../src/captura.cjs), principalmente `validarEnvelope`, `registros`, `hashCelulas`, `validarCaptura` e `validarTempoImportacao`. O [contrato canônico](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) contém os 66 nomes literais.

## Interface e responsabilidades

| Export | Uso real |
| --- | --- |
| `validarCaptura(raw)` | Valida e retorna `{envelope, semanas, producoes, paginas, cenas, arquivos, revisoes}` e `meses` somente quando capturada; o envelope recebe cópia independente |
| `validarTempoImportacao(completedAt, nowIso, completedAtVigente=null)` | Confere tolerância futura e ordem estrita do fim de uma candidata já validada; relógio/instante vigente são fornecidos pelo importador sob trava |
| `hashCelulas(tables)` / `letraColuna(n)` | Helpers reutilizados pela coleta direta; mesma definição v1 |
| `CAMPOS` / `CAMPOS_MESES` | Seis listas obrigatórias/66 mínimos preservados; descriptor separado com mes, marca_id, objetivo, pautas |
| `linhaMensal(record)` | Recupera em WeakMap privado a linha física registrada pelo parser mensal; não cria coluna extra |
| `idSeguro(value)` | Restringe IDs de captura/tentativa usados em nomes de arquivos a 1–100 caracteres alfanuméricos, hífen ou sublinhado |
| `instanteUtc(value)` | Confere timestamp UTC com `Z`, segundos e fração opcional de 1–3 dígitos |

Único import externo: `node:crypto`. Não há rota, variável de ambiente, persistência nem dependência de aplicação neste módulo.

## Dados de entrada

| Grupo | Regra efetivamente validada |
| --- | --- |
| Identidade/fonte | `schemaVersion=1`, `capturaId` seguro, `brandId=ntv`, `source=google-drive-connector` ou `google-sheets-api`, `spreadsheetId` string não vazia |
| Instantes | `startedAt <= completedAt`; `readAt` de cada tabela está no intervalo |
| Abas | Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes obrigatórias; Meses opcional somente se presente conjuntamente em tables e nos dois mapas de metadados |
| Metadados | `sheetId` inteiro não negativo; dimensões inteiras positivas; mesmos valores antes/depois |
| Tabela | `complete=true`, ID da aba coerente, `range` literal de A1 até a dimensão alocada, matriz dentro desses limites |
| Células | String, booleano, null ou número finito; objetos e listas em células são rejeitados |
| Cabeçalhos | Mínimos por nome, em qualquer ordem; cabeçalho não vazio duplicado é erro; extras conservados no privado |
| Registros | Chave das seis abas string não vazia e única; Meses conserva duplicatas/escalares para triagem semântica; linha inteiramente vazia ignorada; célula omitida normalizada para string vazia |
| Integridade | Primeiro/segundo hash iguais; segundo hash hexadecimal e igual ao SHA-256 recalculado das matrizes capturadas, incluindo Meses se presente |

| Aba | Chave de linha | Mínimos |
| --- | --- | ---: |
| Semanas | `semana_id` | 8 |
| Produções | `producao_id` | 17 |
| Páginas | `pagina_id` | 8 |
| Cenas | `cena_id` | 11 |
| Arquivos | `arquivo_id` | 12 |
| Revisoes | `revisao_id` | 10 |
| Meses (opcional) | Sem unicidade estrutural; chave de consulta marca/mês | 4 |

A forma segura de ID de arquivo não é imposta às identidades editoriais: estas são conferidas como strings não vazias/únicas por aba. Não confundir ID interno com ID Drive.

## Hash e erros

O hash usa JSON compacto de pares ordenados por nome de aba, com `sheetId`, `range` e `values` nessa ordem. Remove somente null/string vazia no fim das linhas e linhas finais vazias. Instantes e extras do envelope não entram no hash de células; a persistência compara separadamente a serialização do envelope completo. Meses participa somente quando presente, também na ordem por nome (`sort`); sem a opcional, hashes e arquivos históricos permanecem iguais. A posição final de Meses é somente visual na Planilha.

Erro segue `<aba/linha/campo/regra>: inválido`, sem incluir valores das células. Cabeçalhos válidos sem registros são conjunto vazio válido. Etapa desconhecida continua válida; este módulo não classifica prontidão/publicação.

## Tempo na importação

Depois de conferir a estrutura e tratar conflito/no-op de ID, a [persistência](snapshot.md) chama a regra temporal sob sua trava, antes de gravar a candidata:

| Comparação de `completedAt` | Resultado |
| --- | --- |
| Até 10 minutos à frente de `nowIso`, inclusive o limite | Permitido pela tolerância do relógio local, desde que o fim seja posterior ao da vigente |
| Mais de 10 minutos à frente de `nowIso` | Erro `captura inválida: completedAt excede o relógio local em mais de 10 minutos` |
| ID novo e fim igual ou anterior ao da vigente | Erro `captura desatualizada: completedAt igual ou anterior ao da vigente` |

As falhas temporais são motivos fixos do recibo `falhou` e preservam a captura vigente. A conferência do futuro ocorre antes da comparação com a vigente. Mesmo ID/serialização já aceitos retorna `sem_alteracao` antes dessas comparações. `validarCaptura` conserva apenas as regras estruturais e de intervalo do envelope: GET, releitura e reinício não reaplicam a política relativa ao relógio, portanto uma captura aceita não se torna inválida depois por esse motivo.

## Verificação e limites

[tests/dados.test.cjs](../../tests/dados.test.cjs) cobre reordenação, mínimos, IDs, dimensões, células, metadados, intervalos, duas marcas, hash e etapa desconhecida. Resultados executados ficam em [validacao.md](../../specs/001-consulta-local-producao/validacao.md); esta documentação não reexecuta a suíte. Regressões da opcional, linha física e hash legado foram executadas na [003](../../specs/003-planejamento-mensal/validacao.md); integração real de Meses pendente.

Pegadinha: `validarEnvelope` exige um identificador de fonte não vazio, mas não consulta sua identidade configurada nem comprova que duas leituras remotas ocorreram. O importador confere a coerência do arquivo recebido. T039 foi demonstrada com captura real, com limites na [validação](../../specs/001-consulta-local-producao/validacao.md); a coleta direta está isolada no [coletor](coleta.md).
