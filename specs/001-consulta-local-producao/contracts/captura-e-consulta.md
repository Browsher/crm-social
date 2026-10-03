# Contrato de captura e consulta v1

02/10/2026. Especificação para a feature 001, ainda não implementada. Coletor: Central com conector autenticado. Consumidor: CRM local, sem credenciais Google.

## Envelope

| Campo | Restrição |
| --- | --- |
| `schemaVersion` | inteiro `1` |
| `capturaId` | string de 1–100 caracteres, somente `[A-Za-z0-9_-]`; nunca caminho |
| spreadsheetId | Identificador da fonte configurada privadamente, conferido na captura |
| `brandId` | `ntv` |
| `source` | `google-drive-connector` |
| `startedAt`, `completedAt` | ISO 8601 UTC com `Z`, início menor ou igual ao fim |
| `metadataBefore`, `metadataAfter` | mapa das seis abas para `{sheetId, rowCount, columnCount}`; inteiros positivos, sheetId não negativo |
| `firstReadSha256`, `secondReadSha256` | SHA-256 hexadecimal minúsculo com 64 caracteres |
| `tables` | exatamente Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes |

Cada tabela contém `{sheetId, range, readAt, complete, values}`. `values` é matriz de células JSON escalares (string, número finito, booleano ou null), primeira linha com cabeçalhos. `readAt` é ISO UTC dentro do intervalo da captura. `complete` deve ser true. `range` cobre o retângulo A1 até a última linha/coluna alocada registrada nos metadados. Linhas/células vazias finais omitidas pela API são aceitas como vazias dentro desse retângulo.

## Coleta e integridade

1. Ler metadados da planilha e localizar as seis abas por nome, conferindo seus IDs conhecidos. Registrar dimensões.
2. Ler cada retângulo completo em intervalos delimitados; fragmentar para não exceder 50.000 células por chamada. Normalizar a montagem de fragmentos para a mesma matriz, removendo somente linhas e células vazias finais. Não confundir resposta parcial de ferramenta com matriz vazia.
3. Calcular o primeiro hash canônico. Repetir as seis leituras completas, calcular o segundo hash e guardar os valores da segunda leitura.
4. Reler metadados. Se aba, ID, dimensão ou hash mudou, marcar conflito e não promover. Uma nova tentativa futura é outra captura, sem loop infinito nesta operação.
5. O importador recalcula o hash das matrizes entregues e o compara ao segundo hash, exige igualdade dos dois hashes e dos metadados antes/depois. Confere cobertura, timestamps, cabeçalhos e IDs. `complete=true` isoladamente não basta.

Representação canônica do hash: JSON compacto de uma lista de pares ordenada por nome de aba com comparação ordinal (`a < b`), cada par `[nome, {sheetId, range, values}]`, propriedades nessa ordem e codificação UTF-8. A normalização de vazios finais deve ser idêntica nas duas leituras. Não incluir timestamps no hash de células; o envelope completo tem sua própria identidade por bytes. Esta comparação detecta diferenças observáveis, não fornece transação atômica entre abas.

## Cabeçalhos mínimos obrigatórios

| Aba | Campos |
| --- | --- |
| Semanas | `semana_id`, `marca_id`, `inicio_semana`, `tema`, `objetivo`, `plano_json_arquivo_id`, `redacao_json_arquivo_id`, `visual_json_arquivo_id` |
| Produções | `producao_id`, `marca_id`, `semana_id`, `slot`, `tipo_producao`, `data_prevista`, `status`, `etapa_producao`, `estado_revisao`, `estado_liberacao`, `responsavel_atual`, `versao`, `titulo`, `legenda`, `publicado_em`, `url_video_final`, `id_drive_video_final` |
| Páginas | `pagina_id`, `producao_id`, `versao`, `indice`, `funcao`, `titulo`, `corpo`, `arquivo_imagem_id` |
| Cenas | `cena_id`, `producao_id`, `versao`, `indice`, `texto`, `texto_tela`, `inicio_segundos`, `duracao_segundos`, `arquivo_imagem_inicio_id`, `arquivo_imagem_final_id`, `arquivo_video_id` |
| Arquivos | `arquivo_id`, `producao_id`, `semana_id`, `cena_id`, `pagina_id`, `tipo`, `papel`, `versao`, `id_drive`, `url`, `origens_json`, `sha256` |
| Revisoes | `revisao_id`, `producao_id`, `cena_id`, `pagina_id`, `arquivo_id`, `versao`, `decisao`, `motivo`, `responsavel_correcao`, `estado_tratamento` |

Colunas adicionais são preservadas e podem ser apresentadas como campos conhecidos opcionais, sem exigir sua criação na planilha. IDs não vazios e únicos por aba. Uma linha totalmente vazia é ignorada; linha preenchida sem ID é erro. Cabeçalhos obrigatórios ausentes e qualquer cabeçalho não vazio repetido invalidam captura. Relação órfã ou versão inválida gera aviso localizado, sem apagar a produção.

## Persistência local

O importador recebe somente caminho local de uma captura já coletada; nunca credenciais, URL pública alternativa ou comando para executar a fila. Valida antes de publicar o ponteiro local. Guarda capturas imutáveis em `data/capturas/`, ponteiro `data/atual.json` e recibo resumido da última tentativa em `data/ultima-tentativa.json`.

Gravar arquivo temporário e promover ponteiro por substituição local, testada no Windows; falha preserva última válida. Mesmo `capturaId` e mesmos bytes: `sem_alteracao`. Mesmo ID e bytes diferentes: conflito. Nova captura com células iguais pode substituir o ponteiro para refletir nova leitura. Não remover capturas anteriores nesta feature. Erro menciona aba/campo/motivo sem incluir dados privados inteiros.

## HTTP de consulta

- `GET /api/visao`: retorna projeção NTV e estado de atualização; ausência de captura é resposta estruturada com lista vazia e indicação `sem_captura`, nunca dados de demonstração. Envelope mínimo `{schemaVersion:1, estado, fonte, captura, ultimaTentativa, semanas, producoes, avisos}`; `captura` pode ser null.
- `GET /`, `/app.js`, `/styles.css`: apenas esses três arquivos estáticos conhecidos. HEAD usa mesmos controles e nenhum corpo. Outros métodos retornam 405; outras rotas 404. Não há endpoint de escrita/importação.
- Bind `127.0.0.1:4318`. Host deve corresponder ao loopback e à porta configurada; Origin, se presente, deve ser da própria origem permitida. Sem CORS externo. Impedir traversal, inclusive codificado; nunca servir `data/`, `.specify/`, `.agents/` ou diretórios arbitrários.
- Servidor não consulta Google nem gera mídia. Interface não carrega URLs remotas automaticamente. Navegar por link externo exige clique; aceitar apenas HTTPS com host exato `drive.google.com` ou `docs.google.com`, sem usuário/senha no URL. Usar `rel="noopener noreferrer"`.
- Textos são dados: renderizar com `textContent`, sem executar HTML/scripts da planilha. Valores inválidos não viram comandos ou caminhos locais.

O detalhe apresenta revisões e arquivos registrados com identidade, versão e avisos de vínculo. A projeção não resolve capacidades nem modifica decisões dos agentes. O aviso “Atualização por captura; reler aqui não consulta o Google” acompanha o comando de releitura local.
