# Configuração do quadro

Como etiquetas previamente aprovadas para as colunas de uma agenda, o mapa guarda a correspondência entre rótulo registrado e coluna de apresentação. A projeção aplica essas etiquetas aos cartões por semana, sem alterar a operação.

Estado em 04/10/2026: carregamento/validação implementados em T010; classificação e tela de Produção implementadas em T027–T030; estado/evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Fontes: [src/quadro-config.cjs](../../src/quadro-config.cjs), `lista` (linha 4), `validarMapaQuadro` (15), `carregarMapaQuadro` (24), e [config/quadro-etapas.json](../../config/quadro-etapas.json). O validador é genérico: não exige uma quantidade fixa de etapas.

## Interface e dados

| Export | Responsabilidade |
| --- | --- |
| `COLUNAS` | Ordem fixa: Planejamento, Redação, Visual, Mídia, Revisão, Pronta, Publicada, Outras |
| `validarMapaQuadro(raw)` | Função pura; confere objeto/schema/listas e devolve cópia dos três campos permitidos |
| `carregarMapaQuadro(file)` | Lê JSON local e valida; arquivo ausente/ilegível e JSON inválido têm erros próprios |

| Campo | Conteúdo / validação |
| --- | --- |
| `schemaVersion` | Inteiro 1 |
| `liberacaoPronta` | Lista de rótulos literais não vazios; inicial vazia |
| `revisaoEmAndamento` | Lista de rótulos literais não vazios; inicial vazia |
| `etapas` | Lista de `{rotulo, coluna}`; nenhum rótulo repetido neste campo |
| `etapas[].coluna` | Uma das seis primeiras colunas; Publicada e Outras são reservadas |

O arquivo inicial possui nove etapas: `arte_aprovada` em Visual e oito rótulos de mídia em Mídia, inclusive `montagem_pronta`. Os nomes literais completos e a prioridade aplicada estão no [contrato](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md). As duas listas vazias permanecem vazias; rótulos sintéticos dos testes não entram na configuração versionada.

Comparação literal e sensível a maiúsculas. Espaços não são removidos do rótulo retornado; rótulo só com espaços é inválido. Um texto igual em campos diferentes é permitido, enquanto repetição dentro do mesmo campo falha com índices dos dois elementos.

## Integração, rotas e erros

O [servidor](servidor.md) define o caminho padrão `config/quadro-etapas.json`, carrega o mapa antes de criar o handler e o passa à projeção. `carregarMapaQuadro(file)` lê o caminho recebido, sem padrão próprio. Argumento confiável `quadroConfigPath` do servidor permite testes com JSON em TEMP. Não existe variável de ambiente, rota de edição, recarga por query ou entrega do JSON bruto.

Erros começam por `configuração:`, identificando arquivo/JSON, schema, lista, índice, rótulo ou coluna. Configuração inválida impede o início, sem mapa parcial ou fallback.

## Verificação e pegadinhas

[tests/quadro-config.test.cjs](../../tests/quadro-config.test.cjs) usa funções puras e arquivos TEMP reais para validar configuração inicial, duplicação, reservas, campos inválidos e novo rótulo só no JSON. Evidência em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

O mapa fica em memória durante a vida do servidor: mudança no JSON exige reinício. A projeção monta `quadro.semanas` com oito colunas, IDs e Outras por semana; `quadro.colunas` mantém nomes canônicos. Liberação/revisão são exercitadas com mapa sintético em TEMP, pois listas versionadas permanecem vazias; não comprova coleta operacional nem histórias seguintes.
