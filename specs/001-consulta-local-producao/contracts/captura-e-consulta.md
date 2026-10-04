# Contrato de captura e consulta v1

Como uma fotografia com etiqueta, a captura precisa de identidade, origem e instante para ser consultada. Fundação, US1 e US2 implementadas; detalhes e demais histórias continuam pendentes. Estado e evidências na [validação](../validacao.md). Coletor previsto: Central com conector autenticado; consumidor local sem credenciais Google.
Requisitos em [spec.md](../spec.md); decisão de interface em [telas.md](../../../docs/design/telas.md). Este contrato não cria cabeçalhos nem escrita operacional.

## Envelope privado da captura

| Campo | Restrição |
| --- | --- |
| `schemaVersion` | inteiro `1` |
| `capturaId` | string de 1–100 caracteres, somente `[A-Za-z0-9_-]`; nunca caminho |
| `spreadsheetId` | identificador da fonte configurada privadamente, conferido na captura |
| `brandId` | `ntv` |
| `source` | `google-drive-connector` |
| `startedAt`, `completedAt` | ISO 8601 UTC com `Z`, início menor ou igual ao fim |
| `metadataBefore`, `metadataAfter` | mapa das seis abas para `{sheetId, rowCount, columnCount}`; inteiros positivos, `sheetId` não negativo |
| `firstReadSha256`, `secondReadSha256` | SHA-256 hexadecimal minúsculo com 64 caracteres |
| `tables` | exatamente Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes |

Cada tabela contém `{sheetId, range, readAt, complete, values}`. `values` é matriz de
células escalares JSON (string, número finito, booleano ou null), primeira linha com
cabeçalhos. `readAt` é ISO UTC dentro do intervalo da captura. `complete` deve ser true.
`range` cobre A1 até a última linha/coluna alocada registrada nos metadados. Linhas/células
vazias finais omitidas pela API são aceitas como vazias dentro desse retângulo.

## Coleta e integridade

1. Ler metadados e localizar as seis abas por nome, conferindo seus IDs conhecidos e dimensões.
2. Ler cada retângulo inteiro em intervalos delimitados, até 50.000 células por chamada.
   Montar os fragmentos numa matriz, removendo somente linhas/células vazias finais.
   Resposta parcial da ferramenta não é matriz vazia.
3. Calcular primeiro hash canônico; repetir as seis leituras completas, calcular segundo
   hash e guardar os valores da segunda leitura.
4. Reler metadados. Mudança de aba, ID, dimensão ou hash é conflito e impede promoção.
   Nova tentativa futura é outra captura, sem loop infinito.
5. Importador recalcula hash das matrizes, compara ao segundo hash e exige igualdade
   entre os dois hashes e metadados antes/depois. Confere cobertura, tempos, cabeçalhos
   e identidades. `complete=true` isoladamente não basta.

Hash canônico: JSON compacto de lista de pares ordenada ordinalmente por nome de aba
(`a < b`), cada par `[nome, {sheetId, range, values}]`, propriedades nessa ordem, UTF-8.
Normalização de vazios finais idêntica nas duas leituras. Timestamps não entram no hash
de células; identidade dos bytes do envelope é separada. Não há transação atômica entre abas.

## Os 66 cabeçalhos mínimos obrigatórios

| Aba | Quantidade | Campos |
| --- | ---: | --- |
| Semanas | 8 | `semana_id`, `marca_id`, `inicio_semana`, `tema`, `objetivo`, `plano_json_arquivo_id`, `redacao_json_arquivo_id`, `visual_json_arquivo_id` |
| Produções | 17 | `producao_id`, `marca_id`, `semana_id`, `slot`, `tipo_producao`, `data_prevista`, `status`, `etapa_producao`, `estado_revisao`, `estado_liberacao`, `responsavel_atual`, `versao`, `titulo`, `legenda`, `publicado_em`, `url_video_final`, `id_drive_video_final` |
| Páginas | 8 | `pagina_id`, `producao_id`, `versao`, `indice`, `funcao`, `titulo`, `corpo`, `arquivo_imagem_id` |
| Cenas | 11 | `cena_id`, `producao_id`, `versao`, `indice`, `texto`, `texto_tela`, `inicio_segundos`, `duracao_segundos`, `arquivo_imagem_inicio_id`, `arquivo_imagem_final_id`, `arquivo_video_id` |
| Arquivos | 12 | `arquivo_id`, `producao_id`, `semana_id`, `cena_id`, `pagina_id`, `tipo`, `papel`, `versao`, `id_drive`, `url`, `origens_json`, `sha256` |
| Revisoes | 10 | `revisao_id`, `producao_id`, `cena_id`, `pagina_id`, `arquivo_id`, `versao`, `decisao`, `motivo`, `responsavel_correcao`, `estado_tratamento` |

Cabeçalho obrigatório não significa valor preenchido em toda linha. IDs devem ser
strings não vazias e únicos por aba; linha inteiramente vazia é ignorada, preenchida sem
ID é erro. Mínimo ausente e qualquer cabeçalho não vazio repetido invalidam a tentativa.
Relação órfã, versão inválida e JSON malformado geram aviso localizado sem excluir a peça.
Colunas adicionais são conservadas na captura privada, sem exigir criação remota,
sem exposição automática por HTTP e sem colunas extras na tela Planilha da 001.

O levantamento do dicionário de 03/10 confirmou presença literal dos 66 nomes, não
validade das linhas nem captura completa. Agentes, Controle e Execucoes estão fora da 001.

## Persistência privada e Histórico

Interface planejada: `node scripts/importar-captura.cjs <caminho-local> [--data-dir <diretorio-local>]`.
O diretório padrão é `data/`; teste usa diretório temporário próprio. Importador recebe
somente arquivo local já coletado, sem credencial, URL alternativa ou comando para fila.

| Caminho relativo ao diretório privado | Responsabilidade |
| --- | --- |
| `capturas/<capturaId>.json` | envelope e células completos; arquivo imutável após validação |
| `tentativas/<tentativaId>.json` | recibo imutável preparado para uma tentativa, completa ou falhou; só integra o Histórico após confirmação no estado |
| `atual.json` | estado único `{capturaId, ultimaTentativaId, historicoIds}`; captura e última tentativa podem ser null, lista inicial vazia |
| `ultima-tentativa.json` | resumo derivado, sem autoridade concorrente ao ponteiro de estado |

Recibo mínimo privado: `{tentativaId, capturaId, concluidaEm, resultado, motivoResumo}`.
`tentativaId` tem a mesma restrição de caracteres de `capturaId`; identifica a tentativa,
não a produção. `capturaId` é null quando não pôde ser identificado. `concluidaEm` é
instante ISO com fuso; `resultado` é exatamente `completa` ou `falhou`. Motivo é curto e
saneado: aba/campo/regra, sem payload, segredo, stack, URL de serviço ou caminho local.
Importação do mesmo ID e mesmos bytes retorna `sem_alteracao` somente se há recibo
completo dessa captura já confirmado em `historicoIds`. Não duplica recibo, renova
horário nem volta a uma captura antiga. Mesmo ID com bytes diferentes é conflito e
resulta em tentativa falha, sem sobrescrever o arquivo existente.

Gravar captura validada e recibo imutável antes de substituir atomicamente `atual.json`
no mesmo diretório; testar falhas de I/O no Windows. A substituição confirma, em um
único estado, captura vigente, última tentativa e inclusão do recibo em `historicoIds`.
A lista conserva os IDs anteriormente confirmados, sem duplicação; `ultimaTentativaId`
referencia seu último elemento ou é null com lista vazia. Falha confirmada conserva
`capturaId`, acrescenta o recibo de falha e atualiza somente a última tentativa. Sem
captura aceita, mantém `capturaId=null`.

Arquivo preparado sem ID confirmado é órfão de uma interrupção, não tentativa concluída
no Histórico nem prova de captura aceita. Reinício conserva o estado anterior. Repetir
uma captura com os mesmos bytes, mas sem confirmação anterior, revalida e pode reaproveitar
seus bytes imutáveis, prepara outro recibo e tenta a promoção; não retorna `sem_alteracao`.
Um recibo preparado e não confirmado nunca é alterado para fabricar sucesso ou falha.

Falha ao persistir recibo/estado é erro de persistência, nunca sucesso. Se ainda é
possível gravar, registrar outro recibo de falha e confirmá-lo preservando a captura
vigente; se o armazenamento não permite isso, informar explicitamente que a falha
não pôde ser registrada, sem prometer Histórico durável. Não reescrever nem remover
capturas, recibos ou o estado anterior para ocultar o incidente.

`lerEstado` lê ponteiro, captura vigente e recibos; `projetarVisao(estadoLocal, nowIso, mapaQuadro)`
gera a consulta. Histórico lista todas as tentativas confirmadas em `historicoIds`,
recentes primeiro, excluindo arquivos órfãos ou preparados sem confirmação;
paginação é permitida desde que as anteriores continuem acessíveis. `ultimaTentativa`
é projeção do recibo referenciado pelo estado, sem servir o arquivo privado inteiro.
Nova captura com novo ID, fim de coleta novo e mesmas células pode atualizar frescor.
Na importação sob trava, após validação estrutural e conferência de conflito/no-op,
comparar `completedAt` com o relógio local e o fim da vigente: até **10 minutos**
no futuro é aceito (limite inclusivo); acima disso recusar como **captura inválida**.
Captura nova com `completedAt` **igual ou anterior** ao da vigente é **desatualizada**
e recusada. Nos dois casos, confirmar recibo `falhou` com motivo curto e manter a
vigente, seus bytes e seu horário. Não preparar arquivo de captura desses candidatos.
Repetição idêntica de ID já aceito continua `sem_alteracao` antes dessa política;
conflito do mesmo ID permanece conflito. A leitura de uma captura aceita valida
estrutura, sem reaplicar a comparação com o relógio atual ou com ela própria.
Reimportar a mesma captura não encerra falha posterior. GET/releitura local não escreve,
não gera recibo, não muda horário e não limpa erro.

## Precedência dos quatro estados de atualização

Avaliar nesta ordem, usando a data civil de `completedAt` em `America/Sao_Paulo`:

| Condição | `estado` | Selo / cor |
| --- | --- | --- |
| Não há captura válida promovida | `sem_captura` | Sem dados / cinza; falha, se existir, aparece no Histórico |
| Há captura válida e tentativa posterior falhou, sem nova completa promovida | `falha_atualizacao` | Atualização falhou / vermelho; última válida continua visível |
| Há captura válida de hoje, sem falha ativa | `atualizada_hoje` | Atualizado hoje, HH:MM / verde |
| Há captura válida de outro dia, sem falha ativa | `anterior_hoje` | Dados de DD/MM / âmbar |

Nova tentativa completa aceita encerra a falha ativa; o recibo antigo continua imutável.
Fim de captura vem do envelope, nunca da maior data de uma linha, relógio da requisição
ou momento de atualização da tela. O selo em todas as telas abre Planilha.

## Datas, formatos e agrupamento por dia

- Data prevista é `YYYY-MM-DD` civil válida; não converter UTC mudando o dia. Seriais
  sem conversão documentada, vazios e datas inválidas vão para Sem data com aviso.
- Formato usa os slots confirmados `imagem_a`/`imagem_b` → Imagem, `carrossel` → Carrossel,
  `reels` → Reels. `tipo_producao` permanece registrado separado; não importar o filtro
  `institucional` do seletor. Slot desconhecido fica Outro, visível em Todos, com original.
- Grupo de dia inclui todas as peças NTV com a mesma data, mesmo se o filtro resumido
  ocultar alguma. Ordem determinística por `producao_id` com comparação ordinal;
  mesma ordem no primeiro cartão do calendário e no primeiro acordeão aberto.
- Link global "N sem data" só aparece quando N > 0 e conta todas as peças NTV inválidas/sem data da captura,
  sem depender de mês ou filtro, e abre lista delas agrupada por semana. Órfã fica em
  Semana não identificada com aviso. No quadro, cartão sem data abre Sem data da semana.
- Calendário: formato, título e estado registrados; tema no primeiro dia da semana;
  primeiro cartão + "+N no dia". Lista: mesma informação, agrupada por tema/período semanal.
- Objetivo mensal é "Ainda não definido"; `Semanas.objetivo` não preenche esse card.

## Quadro: prioridade aprovada e configuração versionada

Colunas fixas, nesta ordem: Planejamento, Redação, Visual, Mídia, Revisão, Pronta,
Publicada, Outras. Sem drag. A classificação aprovada pelo autor em 03/10 é a
primeira condição satisfeita na tabela abaixo; todos os valores de origem permanecem
visíveis, mesmo quando outra faceta define a coluna.

| Prioridade | Condição | Coluna |
| ---: | --- | --- |
| 1 | `publicado_em` preenchido | Publicada |
| 2 | `estado_liberacao` consta em `liberacaoPronta` | Pronta |
| 3 | `estado_revisao` consta em `revisaoEmAndamento` | Revisão |
| 4 | `etapa_producao` consta em `etapas` | coluna configurada |
| 5 | Etapa não mapeada, inclusive vazia | Outras, com original visível |

Preenchido: valor diferente de null e de string vazia; string contendo apenas espaços
também é vazia para essa condição. Preservar o original. `publicado_em` preenchido
vence liberação, revisão e etapa; liberação vence revisão e etapa; revisão vence etapa.
`status` aparece no cartão como informação e **nunca** decide a coluna.

**Publicada** indica registro explícito preenchido na captura, sem verificação remota
da plataforma. ISO sem fuso, data inválida, instante posterior a `completedAt` ou
tipo inesperado geram aviso localizado, preservando registro e coluna; não voltam
silenciosamente à regra da etapa. Status, aprovação ou arquivo sem `publicado_em`
preenchido não colocam a peça em Publicada. Esse critério substitui a exigência
anterior de timestamp válido/coerente para classificar a coluna.

O servidor lê `config/quadro-etapas.json` na inicialização. Arquivo a criar na
implementação, versionado e separado da captura privada. Conteúdo inicial aprovado:

```json
{
  "schemaVersion": 1,
  "liberacaoPronta": [],
  "revisaoEmAndamento": [],
  "etapas": [
    {"rotulo": "arte_aprovada", "coluna": "Visual"},
    {"rotulo": "prompts_imagem_prontos", "coluna": "Mídia"},
    {"rotulo": "imagens_em_producao", "coluna": "Mídia"},
    {"rotulo": "voz_pronta_para_gerar", "coluna": "Mídia"},
    {"rotulo": "voz_em_producao", "coluna": "Mídia"},
    {"rotulo": "clipes_prontos_para_gerar", "coluna": "Mídia"},
    {"rotulo": "clipes_em_producao", "coluna": "Mídia"},
    {"rotulo": "montagem_pronta", "coluna": "Mídia"},
    {"rotulo": "montagem_em_producao", "coluna": "Mídia"}
  ]
}
```

As listas de liberação/prontidão e revisão em andamento começam vazias: nenhum
rótulo atual indica essas condições. `bloqueado` não libera; `aprovada` e
`sem_rejeicao_documental` não indicam revisão em andamento. Os oito valores de mídia
do dicionário continuam mapeados, e a leitura atual confirmou `arte_aprovada`, que
agora vai para Visual. Não inferir aliases por palavras, prefixos ou etapa do envelope
editorial. Comparação literal, sensível a maiúsculas, sem normalizar a célula de origem.

| Conteúdo da configuração | Validação ao carregar |
| --- | --- |
| Arquivo e JSON | obrigatório, legível, objeto, `schemaVersion=1` e três listas presentes com os tipos do exemplo |
| Rótulos | strings não vazias nem somente espaços; nenhum rótulo repetido no mesmo campo, mesmo com coluna diferente; índices do conflito na mensagem |
| `etapas[].coluna` | nome exato de coluna existente; Publicada é reservada ao registro de publicação e Outras ao fallback, sem mapeamento direto |
| `liberacaoPronta` / `revisaoEmAndamento` | listas de rótulos exatos dos respectivos campos, destinos fixos Pronta / Revisão |

Mesmo texto em campos diferentes é uma chave diferente; repetição é avaliada dentro
de cada campo. Arquivo ausente, JSON inválido, coluna inexistente ou rótulo repetido
impedem iniciar o servidor com erro claro de configuração/campo/índice, sem dump de
captura, fallback silencioso ou classificação parcial. Adicionar rótulo aprovado
exige editar somente o JSON e reiniciar o servidor; não alterar código nem operar a
planilha. Não há endpoint de edição ou recarga de configuração.

O título de Outras é **"Outras · N valores novos"**: N conta rótulos originais distintos
de etapas não mapeadas dos cartões que efetivamente estão em Outras na semana NTV
selecionada, não o número de cartões nem o total de todas as semanas. Repetições contam
uma vez. Apenas para contagem, null, célula omitida, string vazia ou somente espaços
compartilham uma única chave de vazio: contam um valor, exibido como "Não informada",
preservando cada original. Demais rótulos são comparados literalmente. Cartão que
caiu em Publicada/Pronta/Revisão pela prioridade não contribui
ao contador, mesmo com etapa desconhecida. Sem cartões: N=0; com um valor, usar
"Outras · 1 valor novo". Valor desconhecido continua texto seguro visível no cartão.

Cartão do quadro: formato, data prevista, título, `status`, responsável registrado e pendência
localizada de revisão vigente que pede correção ou mídia ausente. "Com quem está" é
somente `responsavel_atual`; vazio = A confirmar. `responsavel_correcao` pertence à
revisão vigente e aparece separado. Sem inferir aguarda-de, próxima ação, agente vivo,
capacidade, elegibilidade ou monitoramento.

## Gaveta do dia e registros

Título com dia da semana/data e subtítulo com quantidade. Uma seção por peça em
acordeão, primeira aberta, sem filtrar o dia inteiro. Sem data usa título da seção da
semana, sem inventar dia. Teclado controla acordeões; Escape fecha e restaura foco ao
acionador. Em 390 px gaveta de tela inteira; lista semanal substitui calendário.

Cada peça apresenta estado/formato, etapa, responsável, previsão, publicação,
textos, páginas/cenas, revisões e arquivos. Revisão mostra decisão, motivo, versão e
quem corrige. `resolvido`/`resolvida` é histórico cinza; estado desconhecido não é
resolução. Revisão antiga aberta não se aplica automaticamente à versão nova;
sem vínculo inequívoco, informar impacto a confirmar.

Ordenar páginas/cenas por índice dentro da produção e versão pertinente, sem misturar
versões para preencher uma sequência. Página mostra versão e indicador de design
novo: **A confirmar** enquanto não houver classificação explícita documentada para
aquela página/versão. Nenhum dos 66 mínimos fornece essa flag; arquivo presente,
template ou estado sozinho não a comprovam. Não inventar coluna ou evidência.

Arquivo mostra nome de apresentação derivado de tipo/papel (fallback "Arquivo registrado"),
versão e rótulo "registro". Isso não promete nome original do Drive, ausente nos mínimos,
nem download/conferência dos bytes. Resolver ponteiros por `arquivo_id` interno;
Editor/Motion requerem produção, papel, versão e origens inequívocas, com aviso em empate.
Mídia ausente e referência quebrada aparecem como tais; sem preview automática na 001.

## Projeção HTTP LOCAL de campos selecionados

- `GET /api/visao` retorna `{schemaVersion:1, estado, selo, fonte, captura, ultimaTentativa,
  semanas, producoes, dias, quadro, planilha, historico, avisos}`. Sem captura: conjuntos
  vazios, `captura=null`, estado sem_captura e Histórico disponível, sem demonstração.
- `selo`: `{texto, cor, destino:'planilha'}`. `fonte`: rótulo de captura pela Central;
  não é URI alternativa. `captura`: `{capturaId, completedAt, periodo:{inicio,fim}, contagens}`.
  Período é intervalo dos `inicio_semana` válidos até o fim civil de suas semanas;
  sem semana válida, início/fim null e aviso. Não inferir período a partir de publicação.
- `semanas`/`producoes`: identidades internas e campos mínimos necessários aos resumos
  e detalhes definidos acima, com unidades/revisões/arquivos vinculados e avisos;
  não recebem extras arbitrários. `dias`: grupos por data ou Sem data/semana e IDs de peças.
  `quadro`: colunas fixas, semana e IDs agrupados pela classificação documentada;
  coluna Outras inclui `quantidadeValoresNovos` e `titulo` derivados dos seus cartões,
  mantendo nome canônico Outras. Não servir o arquivo de configuração bruto.
- `planilha`: seis abas na ordem dos mínimos, cada uma `{nome, cabecalhos,
  quantidadeLinhas, linhas}`. `cabecalhos` é a lista literal mínima; `linhas` conserva
  os valores mínimos e sua identidade, exclui linhas vazias e registros de outra marca.
  Contagem é das linhas NTV apresentadas, não das linhas alocadas na planilha inteira.
- A Planilha local inclui todos os 66 mínimos e valores como dados de consulta,
  inclusive `id_drive`, `sha256` e `origens_json` como registro/texto seguro. Não confundir
  esta consulta privada local com mockup compartilhável, que usa somente dados fictícios.
- `historico` e `ultimaTentativa`: apenas `{tentativaId, concluidaEm, resultado,
  motivoResumo}`; identidade da fonte, erro bruto, payload e caminhos não são necessários.
- Não servir envelope ou `tables.values` brutos, metadados de coleta, células extras,
  credenciais/tokens ou caminhos de filesystem. Se célula mínima contém segredo/caminho
  local indevido, suprimir esse conteúdo com aviso localizado; conservar original só na
  captura privada. JSON de origem é texto, não instrução nem objeto que expande a whitelist.
- Textos renderizam com `textContent`; não executar HTML/scripts, instruções ou comandos
  das células, inclusive JSON. URLs registradas na tabela são texto; link interativo só
  se selecionado/validado e acionado por clique: HTTPS, host exato `drive.google.com` ou
  `docs.google.com`, sem usuário/senha, `rel="noopener noreferrer"`. Sem carga, mídia,
  thumbnail ou download remoto automático.

## HTTP e inicialização local

- `GET /`, `/app.js`, `/styles.css`: somente esses três estáticos conhecidos. HEAD
  mantém controles e nenhum corpo. Métodos restantes 405; rotas desconhecidas 404.
  Não há endpoint de escrita/importação, geração, aprovação ou ação Google.
- `criarServidor({dataDir, port, webDir, quadroConfigPath})` carrega e valida o mapa
  antes de iniciar; `quadroConfigPath` opcional é argumento confiável para testes,
  padrão `config/quadro-etapas.json`, nunca parâmetro HTTP. Admite `webDir` somente como
  argumento do chamador confiável, padrão `src/web/`. Testes HTTP usam três estáticos
  sintéticos em diretório temporário próprio, antes da implementação da interface.
  A allowlist permanece fixa; nenhum parâmetro HTTP seleciona diretório ou arquivo.
- Bind padrão `127.0.0.1:4318`; porta local explícita em teste. Host corresponde ao
  loopback/porta configurados; Origin, se presente, é a própria origem. Sem CORS externo.
  Bloquear traversal inclusive codificado; nunca servir `data/`, `.specify/`, `.agents/`
  ou arquivos/diretórios arbitrários. Servidor não consulta Google nem dispara agentes.
- Iniciador planejado `Iniciar CRM.ps1 [-DataDir <diretorio-local>] [-Port <porta>]
  [-NodePath <exe>]`; defaults locais do plano. Teste usa runtime, porta e diretório
  temporário explícitos, sem tocar dados privados reais nem porta de produção.

Planilha concentra fonte, cobertura, Histórico e a explicação curta "Reler captura local;
não consulta o Google" junto a Atualizar dados. Nas demais telas só o selo curto.
Cada tabela tem rolagem horizontal própria; em 390 px a página não rola lateralmente.

## Fronteiras futuras

002: leitura direta somente pelo servidor local, conta de serviço/chave fora do
repositório, emenda futura da constituição e captura de Agentes/Controle/Execucoes.
003: planejamento mensal. 004: revisões e solicitações. 005: prévias/biblioteca.
006: Equipe/Workflow. Nenhuma dessas integrações foi implementada por esta documentação.
