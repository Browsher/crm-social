# Contrato de captura e consulta v1

Como uma fotografia com etiqueta, a captura conserva origem e instante. 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas; resultados e limitações na [validação](../validacao.md). Coletor: Central com conector; consumidor local sem credenciais Google. A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.
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
Colunas adicionais são conservadas na captura privada, sem exigir criação remota
nem exposição automática por HTTP. A allowlist compartilhada `camposCapturados`
preserva os 66 mínimos e acrescenta à triagem/Planilha somente `Semanas.pauta_id`,
`Produções.pacote_versao`, `Produções.hashtags` e `Arquivos.extensao` quando os
respectivos cabeçalhos foram capturados. Ausência não cria propriedade nem migra
capturas antigas; demais extras continuam privados. Meses/Pautas opcionais seguem
seus contratos da 003/004. Na coleta direta, `pacote_versao` textual canônico seguro
é convertido antes dos dois hashes, como `versao`; importação histórica conserva o original.

A allowlist é aplicada na consulta vigente também às capturas antigas que já contêm
esses cabeçalhos: seus valores passam a integrar a seleção triada e a Planilha.
Isso não regrava o envelope, altera bytes/hashes nem converte tipos históricos;
"sem migração" não significa manter esses campos privados quando já capturados.

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

Na leitura, `lerRecibo` valida todos os recibos confirmados: deve ser objeto (não
null/array), `tentativaId` corresponde ao ID referenciado, `capturaId` é seguro ou null,
`concluidaEm` tem data real ISO com `Z`/offset explícito, `resultado` é completa/falhou
e `motivoResumo` é string. Completa exige capturaId não nulo. JSON parseável não basta.
Recibo confirmado inválido/ilegível recusa `lerEstado`; consulta responde 503 genérico,
sem reescrever, reparar ou remover ponteiro/recibos/captura. Órfãos continuam fora do Histórico.

Antes de conflito/no-op, gravar a candidata ou promover seu ID, a importação chama
`validarIdentidadesNtv(validarCaptura(raw))` sob trava. Usa a mesma seleção NTV/66
mínimos da consulta, sem mapa do quadro. Campo selecionado terminado em `_id` que
seria alterado por `redigirTexto` recusa a candidata. Quando a persistência permite,
confirma recibo `falhou` mantendo a captura vigente, com aba/linha física/campo e
motivo estático, sem incluir o valor da célula. A candidata rejeitada não é gravada.

Após estrutura e identidades NTV válidas, importação do mesmo ID e mesmos bytes retorna `sem_alteracao` somente se há recibo
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

O servidor lê `config/quadro-etapas.json` na inicialização. Arquivo versionado e
separado da captura privada. Conteúdo versionado atual, com o ajuste autorizado Pronta de 08/10/2026:

```json
{
  "schemaVersion": 1,
  "liberacaoPronta": ["liberado"],
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

`liberacaoPronta` contém somente o rótulo literal `liberado`; a lista de revisão
em andamento continua vazia. `bloqueado` não libera; `aprovada` e
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

O resumo de pendências do cartão aplica a regra de apresentação abaixo, implementada
em `pendenciaQuadro`, de `src/web/app.js`. A coluna continua definida pelas
prioridades e pelo mapa; este filtro não altera as pendências na API. A gaveta Pronta
tem a apresentação específica descrita abaixo, com avisos preservados no contador/Planilha.

| Coluna do cartão | Mídia ausente | Revisão vigente que pede correção |
| --- | --- | --- |
| Planejamento, Redação, Visual | Não aparece no cartão | Continua no resumo de pendências |
| Mídia, Revisão, Publicada, Outras | Aparece com o texto curto **Mídia ausente** | Continua no resumo de pendências |
| Pronta | Resumo substituído por **Pronta para publicar** | Resumo substituído por **Pronta para publicar** |

Fora de Pronta, o cartão mostra a primeira pendência visível e **+N pendências** somente para as
demais visíveis, com singular quando N=1. Se todas forem de mídia e estiverem
ocultas pela coluna, não há resumo nem contador. API e gaveta conservam os
detalhes de mídia e revisão definidos neste contrato, independentemente da coluna.

## Gaveta do dia e registros

Título com dia da semana/data e subtítulo com quantidade. Uma seção por peça em
acordeão, somente a primeira aberta, sem filtrar o dia inteiro; demais peças mostram
resumo de uma linha com páginas/cenas vigentes, revisão e quantidade de avisos.
O resumo diz **revisão aberta** quando existe vigente; sem vigente, **revisão a
confirmar** quando existe ambígua ou anterior não resolvida; **sem revisão** quando
não existe ou há somente resolvidas. Quantidades têm singular/plural corretos.
Sem data usa título da seção da semana, sem inventar dia. Teclado controla acordeões;
Escape fecha e restaura foco ao acionador. Em 390 px gaveta de tela inteira;
desktop com 520 px de largura, sem corte horizontal. A apresentação segue o
[mockup compacto](../../../docs/design/mockups/gaveta-v2.html), sem reduzir a API.

Cada peça apresenta estado/formato e faixa de quatro dados: etapa, com quem está,
prevista e versão, omitindo campos vazios. `responsavel_atual` preenchido é o
responsável da faixa; o fallback A confirmar de `detalhes.responsavelRegistrado`
continua na API e a regra do cartão de Produção permanece separada. As nove
etapas conhecidas do mapa recebem rótulos legíveis somente na apresentação;
desconhecida preserva o original. Publicação aparece em uma linha apenas quando
`publicado_em` está preenchido; omissão não comprova publicação.

Primeira revisão vigente mostra título legível como **Revisar · versão 2 — motivo**;
abaixo, **Corrige: pessoa · tratamento**, somente com dados preenchidos. Decisão
desconhecida conserva o valor original. IDs de revisão/pagina_id/cena_id/arquivo_id
e demais campos continuam na API, sem IDs/rótulos técnicos na linha visual nem
escopo inventado. Outras vigentes ficam em **+1 revisão aberta** ou **+N revisões
abertas**, recolhido. `resolvido`/`resolvida`, outras
versões e vínculos ambíguos ficam no **Histórico**, inicialmente recolhido, sem virar
correção vigente. Estado desconhecido não é resolução; revisão antiga aberta não
se aplica automaticamente à versão nova; sem vínculo, impacto a confirmar.

Ordenar páginas/cenas por índice dentro da produção e versão pertinente. A vigência
de cada índice segue a maior versão registrada da unidade, independentemente da versão
da produção, conforme a manutenção de versões abaixo. Página mostra versão e indicador de design
novo: **A confirmar** enquanto não houver classificação explícita documentada para
aquela página/versão. Nenhum dos 66 mínimos fornece essa flag; arquivo presente,
template ou estado sozinho não a comprovam. Não inventar coluna ou evidência.
Fora de Pronta, unidades aparecem em linhas compactas com número, texto e link ou **mídia ausente**;
no máximo um aviso de ausência por linha. Legenda/campos textuais complementares e
arquivos como registros ficam em **Texto registrado**, recolhido por padrão;
versões anteriores também abrem por clique. A API conserva os campos completos.

Arquivo mostra nome de apresentação derivado de tipo/papel (fallback "Arquivo registrado"),
versão e rótulo "registro". Isso não promete nome original do Drive, ausente nos mínimos,
nem download/conferência dos bytes. Resolver ponteiros por `arquivo_id` interno;
Editor/Motion requerem produção, papel, versão e origens inequívocas, com aviso em empate.
Mídia ausente e referência quebrada aparecem como tais; sem preview automática na 001.

### Pronta para publicar — manutenção de 08/10/2026

Como uma pasta preparada para a publicação manual, a peça cuja coluna é Pronta
abre a gaveta com **Pronta para publicar** no topo. O servidor acrescenta
`detalhes.pacotePublicacao`: único registro de Arquivos da produção exata, com
`tipo='pacote'`, `extensao='zip'` e `versao` exatamente igual a `Produções.pacote_versao`,
inteiro positivo seguro. A versão do pacote pode diferir de `Produções.versao`.
Ausência, versão inválida ou mais de um candidato retorna null; não escolher maior
versão, primeiro empate ou outro arquivo. Avisos e registros continuam na API.

**Baixar pacote** aceita somente HTTPS em `drive.google.com`, sem usuário/senha
ou porta diferente da padrão. `docs.google.com` não é permitido nesse botão.
O link abre por clique com `noopener noreferrer`; ausência/ambiguidade/URL recusada
mostra **Pacote indisponível**. Seleção não comprova acesso nem bytes do ZIP.

Legenda e hashtags são texto literal seguro com quebras de linha preservadas.
**Hashtags não informadas** é a mesma mensagem quando a coluna `hashtags` não foi
capturada ou quando sua célula está vazia; a apresentação não distingue esses casos.
**Copiar legenda** junta valores presentes com duas quebras de linha e chama
`navigator.clipboard.writeText` somente no clique local. Sem texto fica desabilitado;
sucesso é anunciado em `role=status`, falha oferece selecionar/copiar manualmente.
**Páginas e cenas** começam recolhidas em Pronta e omitem avisos de mídia/link recusado
nas unidades mesmo expandidas; links permitidos continuam disponíveis. API,
contador da peça e Planilha preservam avisos e pendências. As demais colunas
conservam a apresentação comum abaixo. Sem endpoint, dependência ou escrita editorial nova.

[Validação desta manutenção](../../../docs/reports/pronta-publicar-validacao.md)
e [oito imagens sintéticas](../../../docs/design/screenshots/LEIA-ME.md#pronta-para-publicar).

### Detalhes projetados da US3

`producoes[].detalhes` é construído pelo servidor a partir dos mínimos e opcionais capturados selecionados,
sem repassar o envelope privado. Como fichas dentro da mesma pasta, os registros
conservam a produção, versão e ponteiro que os identifica; não escolher arquivo
substituto para um ponteiro ausente ou incompatível.

| Campo adicional | Forma e origem |
| --- | --- |
| `responsavelRegistrado` | responsavel_atual preservado; vazio = A confirmar |
| `publicacaoRegistrada` | booleano derivado somente de publicado_em preenchido; não é consulta remota |
| `paginas` / `cenas` | mínimos preservados, `vigente` na maior versão inteira positiva por produção/índice positivo/tipo de unidade, sem comparar com a peça; `arquivos` ligados ou null; páginas também têm `designNovo:'A confirmar'` |
| Cena `arquivos` / `avisoMidia` | Três slots fixos na ordem imagem inicial/imagem final/vídeo, cada um arquivo ligado ou null; avisoMidia null quando todos ligados, senão string humana fixa das ausências |
| `revisoes` | `{vigentes,resolvidas,anteriores,ambiguas}`; mínimos selecionados, sem fabricar correção atual |
| `arquivos` | registros da produção, com `nomeApresentacao` por tipo/papel e fallback Arquivo registrado; todas as versões continuam identificadas |
| `pacotePublicacao` | único arquivo da produção com tipo pacote, extensão zip e versão igual à pacote_versao positiva segura; null em ausência/ambiguidade/versão inválida |
| `documentosSemana` | `[{papel,arquivo}]` para Plano, Redação e Visual, ligados pelo ponteiro interno da semana; ausência = null |
| `avisos` | avisos localizados da peça/unidades/vínculos, com aba/linha física/campo e motivo; conteúdo privado não é anexado |

Ponteiro de página/cena exige arquivo da mesma produção; a versão da mídia pode
diferir da versão do texto. Se o arquivo declara pagina_id/cena_id, precisa coincidir com a unidade. Ponteiro
semanal exige a mesma semana. Referência quebrada ou incompatível dá null e aviso,
sem selecionar outra mídia. Arquivos empatados por papel/versão/unidade geram aviso
e permanecem como registros separados; `origens_json` é texto preservado, validado
somente quanto à sintaxe JSON, sem executar ou inferir equivalência das origens.

Na cena, ausência de mídia não elimina nem reordena os três slots. `avisoMidia`
segue a regra abaixo, sem valor de célula, URL, ID ou localização técnica:

| Imagens não ligadas | Texto humano |
| --- | --- |
| Inicial e final | imagens ausentes |
| Somente inicial | imagem inicial ausente |
| Somente final | imagem final ausente |
| Nenhuma | sem texto de ausência de imagens |

Vídeo não ligado acrescenta **vídeo ausente**; quando também faltam imagens, as
causas são unidas por ponto e vírgula. Todos ligados: `avisoMidia=null`. Fora de Pronta, a interface
mostra no máximo um texto de ausência por linha de cena, sem confundir arquivo
registrado com bytes comprovados. Se os registros estão ligados mas os links são
recusados/ausentes, mostra **link não permitido**, sem exibir a URL bruta. Arquivo
ligado sem link seguro não é tratado como mídia ausente; quando coexistem falta de
arquivo e link recusado, os motivos ficam juntos em uma única faixa por unidade.

Ausência, referência quebrada ou escopo incompatível geram um único aviso
técnico agregado de mídia por cena, com causas distintas reunidas e origem no
primeiro ponteiro falho, na ordem inicial/final/vídeo. Validações de índice, tempo
e versão inválidos continuam independentes, sem serem absorvidas pela agregação.

Os três papéis de `documentosSemana` existem também sem semana identificada, com
arquivo null. Na apresentação aparecem uma vez por semana representada no dia,
no fim da gaveta, usando **—** na ausência. A projeção resolve os mesmos ponteiros
uma vez por consulta/semana: aviso semanal ocorre uma vez no conjunto global e
continua nos avisos locais de cada peça afetada, sem perder origem ou registro.

Avisos já globais de origem e supressão também entram no conjunto local da peça
afetada: produção, páginas/cenas/revisões, semana e arquivos relacionados, inclusive
documentos apontados pela semana. A associação usa aba/linha física, sem repetir
o mesmo objeto no local nem acrescentar cópias no conjunto global. Aviso sem origem
localizada continua global; os novos avisos de detalhe mantêm suas próprias regras.

Uma revisão não resolvida só é vigente com versão positiva igual à peça e todos os
vínculos preenchidos identificados na mesma produção/versão. Outra versão fica
em anteriores; vínculo inválido em ambiguas. Resolvido/resolvida fica separado,
como histórico, mesmo quando avalia a versão atual. Estado desconhecido não prova
resolução e produz aviso. `responsavel_correcao` não substitui o responsável da peça.

Aviso de vínculo de revisão não resolvida aponta ao primeiro campo falho na ordem
`pagina_id`, `cena_id`, `arquivo_id`, conservando os demais escopos na API. `versao`
é usado quando a versão da revisão ou produção não é válida, não como rótulo
genérico de qualquer referência quebrada. Resolução explícita continua precedendo
a vigência; não inferir revisão atual por ordem visual ou contagem do mockup.

Versões/índices preenchidos inválidos e tempos preenchidos não finitos/negativos
geram aviso preservando o original; vazio continua desconhecido, nunca zero.
As unidades são agrupadas por vigência e versão, ordenadas numericamente por índice e, no
empate, pelo ID ordinal; valores inválidos ficam depois dos válidos. Na gaveta,
versão vigente vem primeiro e outras versões ficam recolhidas, com impacto atual
a confirmar. A marcação de design novo continua A confirmar por ausência de fonte.

### Versões das unidades — manutenção de 08/10/2026

Como uma página cujo texto mudou sem trocar a fotografia, um ponteiro explícito de
página ou cena pode reaproveitar mídia de outra versão. `arquivo_imagem_id` e os três
ponteiros de cena resolvem o `arquivo_id` exato, exigindo a mesma produção e, quando
preenchido no arquivo, o mesmo `pagina_id`/`cena_id`. Campo de unidade vazio no arquivo
é aceito. Diferença de versão não gera aviso nem ausência de mídia; referência quebrada,
produção diferente ou unidade diferente continuam retornando null com aviso localizado.
Versão numérica inválida do arquivo conserva seu aviso independente, sem invalidar
um vínculo que satisfaz essas identidades. Isso comprova registro, não bytes ou aprovação.

Cada `pagina_id`/`cena_id` identifica um registro exclusivo na captura. A identidade
lógica entre versões é produção + índice inteiro positivo, separando páginas e cenas;
não interpretar o formato dos IDs. A maior versão inteira positiva registrada nessa
identidade é vigente, sem comparação com `Produções.versao`. Empates preservam todos
os registros, sem escolher vencedor; índice/versão inválidos não comprovam vigência.
Unidades válidas continuam sustentando avisos de mídia realmente ausente mesmo quando
a versão da produção é inválida; o fallback de produção sem unidades exige versão válida.

A gaveta separa grupos por vigência e versão: unidades atuais não recebem **impacto
atual a confirmar**, mesmo com versão distinta da produção. Ao lado de cada página
com arquivo ligado, mostra **imagem vN** usando a versão original dessa mídia. Histórico,
ponteiros, regras de revisão, seleção de pacote e recolhimento de Pronta permanecem
distintos. Não há migração de captura, nova dependência, rota ou operação remota.

Os avisos da US3 usam a linha física do retângulo capturado, inclusive após linhas
vazias ou registros de outra marca. O mapa de origem permanece privado em WeakMap,
sem novo campo no envelope HTTP. Aviso global (por exemplo, última importação falhou)
tem somente motivo: não inventar aba/linha/campo para ele. A API conserva aba,
linha física, campo e motivo localizados, sem descartar o vínculo da unidade. A gaveta
nunca mostra esses detalhes técnicos: quantidade de **aviso(s) de dados nesta peça**
e link **ver na Planilha**, com plural correto e sem separador pendurado. O link
fecha a gaveta, abre a aba Produções da Planilha e filtra o painel pelos avisos
relacionados à peça, com rolagem e foco nesse painel. As seis tabelas continuam
com todas as linhas NTV; somente os avisos recebem o filtro. Menu, selo e
**Todos os avisos** restauram os avisos gerais. Sem origem localizada, Aba/Linha/Campo
usam **—**, sem inventar a localização de um aviso global.

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
  `quadro.colunas:[{nome}]` mantém a ordem contratual; `quadro.semanas:[{semanaId,colunas:[{nome,titulo,ids,quantidadeValoresNovos}]}]` contém oito colunas e IDs ordinais por semana, inclusive semanaId null das peças sem vínculo inequívoco. Sem captura, semanas vazias com nomes canônicos mantidos. Cada produção acrescenta `quadro:{coluna,pendencias}`.
  Coluna Outras deriva título/contador só dos seus cartões daquela semana;
  não servir o mapa bruto. Pendência de revisão vem de decisão vigente literal revisar/refazer/reprovado/rejeitado, com tipo/texto/revisaoId/decisao/versao/responsavelCorrecao. Mídia ausente conserva tipo/texto e unidade/unidadeId quando pertinente. Aprovação/desconhecido/versão anterior não criam correção inferida; arquivo registrado na versão atual com URL vazia/recusada não vira mídia ausente. Produção sem versão recebe aviso de versão vigente não informada; versão ausente ou inválida não sustenta afirmação categórica de ausência de mídia vigente. Fora de Pronta, o cartão resume a primeira pendência visível/+N após o filtro de mídia por coluna definido acima; a API conserva todas as pendências e a gaveta mantém seus detalhes. Etapa null é recuperada antes da triagem e preservada no JSON; chave de vazio somente no contador Outras. Tratamento desconhecido permanece dívida da revisão final.
- `planilha`: seis abas na ordem Semanas, Produções, Páginas, Cenas, Arquivos e
  Revisoes, cada uma `{nome, cabecalhos, quantidadeLinhas, linhas}`. `cabecalhos`
  é cópia de `camposCapturados`, com mínimos de `CAMPOS` e opcionais contratuais
  somente quando capturados; `linhas` contém objetos novos com essas chaves e
  os valores já triados. Exclui linhas vazias e
  registros de outra marca; não recebe `quadro`, `detalhes`, períodos calculados,
  envelope ou extras. Contagem é das linhas NTV apresentadas, não das linhas
  alocadas na planilha inteira. A normalização preexistente null→string vazia
  continua nos mínimos, exceto `etapa_producao`, cujo null é recuperado antes da
  triagem e preservado. A tabela não promete uma cópia literal da matriz privada.
- A Planilha local inclui todos os 66 mínimos e valores como dados de consulta,
  inclusive `id_drive`, `sha256` e `origens_json` como registro/texto seguro. Não confundir
  esta consulta privada local com mockup compartilhável, que usa somente dados fictícios.
- `historico` e `ultimaTentativa`: apenas `{tentativaId, concluidaEm, resultado,
  motivoResumo}`; identidade da fonte, erro bruto, payload e caminhos não são necessários.
- Não servir envelope ou `tables.values` brutos, metadados de coleta, células extras,
  credenciais/tokens ou caminhos de filesystem. Se célula mínima contém segredo/caminho
  local indevido, suprimir esse conteúdo com aviso localizado; conservar original só na
  captura privada. JSON de origem é texto, não instrução nem objeto que expande a whitelist.
- Identidade/vínculo interno em campo terminado em `_id` que seria alterado por
  `redigirTexto` já recusa a candidata na importação, conforme a persistência acima.
  A projeção mantém a mesma guarda para bytes antigos/corrompidos: não converter
  essas chaves em marcador compartilhado nem fundir seus registros. Captura privada
  permanece intacta; o servidor retorna 503 genérico sem escrever ou expor valor/erro bruto.
- Nos campos dedicados `Arquivos.url` e `Produções.url_video_final`, após a redação
  de texto, os valores ainda inalterados são analisados com `new URL`:
  usuário ou senha preenchidos causam **[conteúdo suprimido]** no campo selecionado,
  com aviso de aba/linha física/campo e motivo fixo **conteúdo sensível suprimido**,
  sem expor o valor. A detecção de userinfo não usa regex. Original permanece privado;
  JSON de `/api/visao` e texto da gaveta não contêm as partes da credencial.
  Se a string não vazia é recusada pelo construtor, também recebe o marcador, com
  motivo fixo **URL inválida suprimida**, sem valor nem exceção bruta: parsing falho
  não permite devolver userinfo malformado. Vazio/somente espaços é preservado,
  sem aviso de URL inválida.
- Por decisão do autor, **texto livre mínimo selecionado** e os quatro campos do
  recibo público são divididos em pedaços por espaços em branco, preservando os
  separadores. Somente pedaço iniciado em HTTP(S) é candidato; aspas/parênteses de
  contorno e pontuação final `. , ; : ! ?` não participam da análise de `new URL`.
  Só o parser decide usuário/senha. Apenas o pedaço credenciado vira
  **[conteúdo suprimido]**: restante da frase, espaços e pontuação ficam intactos,
  inclusive se a redação já ocorreu em um campo de URL dedicado. URL legítima
  seguida de `@`/e-mail e `//` solto são preservados exatamente.
  **Limite:** em texto livre não há promessa de detectar outros esquemas, URL
  relativa, espaços em userinfo ou forma fora desse pedaço HTTP(S). O guarda dos
  campos dedicados permanece; segredo/caminho conhecido continua substituindo
  o texto reconhecido inteiro. Aviso de célula conserva origem e motivo fixo sem
  o valor. A captura e os recibos privados permanecem intactos.
- JSON válido é analisado como dado, incluindo strings decodificadas de chaves,
  valores e JSON aninhado em string, sem executar código nem expandir a whitelist
  HTTP. Somente tokens de string alterados são reserializados; os demais bytes,
  números, ordem, espaços e escapes legítimos não alterados permanecem intactos.
- Validade de `origens_json` é calculada sobre o original antes da supressão e
  guardada somente como booleano em WeakMap privado. JSON originalmente válido
  suprimido não recebe falso aviso de JSON inválido por causa do marcador;
  JSON originalmente inválido conserva seu aviso. Não expor o original para
  explicar a supressão nem usar JSON decodificado como instrução.
- Textos renderizam com `textContent`; não executar HTML/scripts, instruções ou comandos
  das células, inclusive JSON. URL dedicada recusada não aparece como texto bruto na tela; link interativo só
  se selecionado/validado e acionado por clique: HTTPS, host exato `drive.google.com` ou
  `docs.google.com`, sem usuário/senha, `rel="noopener noreferrer"`. Sem carga, mídia,
  thumbnail ou download remoto automático.

### Apresentação de Planilha e alcance das URLs

Como páginas de consulta do mesmo álbum, as abas mantêm os dados NTV completos;
um atalho da gaveta localiza somente os avisos da peça. Não há nova rota, importação
ou escrita por trocar aba, filtrar avisos ou reler a captura.

| Controle / estado | Comportamento implementado na US5 |
| --- | --- |
| Subtítulo | Dados capturados da planilha, por aba |
| Origem e atualização | Fonte, fim e cobertura; somente a linha da falha ativa e o link N avisos de dados, com singular para um; motivos detalhados somente no painel |
| Seis abas de dados | Ordem dos mínimos, contagem de linhas NTV, cabeçalhos literais e valores triados como texto |
| Histórico final | Todas as tentativas confirmadas, recentes primeiro; horário em São Paulo, Completa/Falhou e motivo em linguagem de tela; sem órfãos ou duplicação por no-op |
| Teclado | Setas esquerda/direita alternam com retorno nas pontas; Home/End selecionam primeira/última; seleção e foco ficam na mesma aba |
| Tabelas largas | Região própria de rolagem horizontal, acessível por teclado; página sem rolagem lateral em 390 px |
| Releitura | Conserva aba selecionada se ela continua disponível; sem captura, somente Histórico fica disponível |
| Captura ausente | Orientação para pedir captura completa à Central; Histórico vazio informa que não há tentativa confirmada |
| Avisos de dados | Painel Aba/Linha/Campo/Motivo, filtrado pela peça quando vindo da gaveta; oculto em Histórico ou sem avisos |
| Menu / selo / Todos os avisos | Restauram avisos gerais; o filtro da peça nunca reduz as linhas das seis tabelas |

O contador de Origem usa todos os avisos da API e não segue o filtro da peça. Seu
link restaura os gerais, seleciona Produções e dá foco/rolagem ao painel, inclusive
ao sair de Histórico. Sem avisos, o link é omitido. Quando `ultimaTentativa.resultado`
é `falhou`, Origem mostra **Última importação falhou; captura anterior preservada**
se há captura; sem ela, **Última importação falhou; nenhuma captura válida
disponível**. Esse último caso conserva o selo **Sem dados** e somente Histórico.

Na célula Motivo, a interface consolida o texto de mídia de cada aviso: **Imagens
e vídeo ausentes**, **Imagem final ausente**, **Nenhum arquivo da produção
registrado** e **Imagem ausente** para páginas são exemplos. Aba/Linha/Campo,
quantidade de avisos e motivos originais permanecem na API; isso não muda os
três slots nem `avisoMidia` definidos acima. No Histórico, **Cenas complete:
inválido** recebe o rótulo **Aba Cenas incompleta**; outras falhas conhecidas usam
linguagem de tela e desconhecidas usam **Captura não pôde ser importada**. Motivo
vazio permanece vazio. Recibos e `historico[].motivoResumo` conservam o original
saneado; esses rótulos não mudam a validação, persistência ou contrato HTTP.

O alcance de **URL recusada não é texto bruto** se refere aos campos dedicados
`Arquivos.url` e `Produções.url_video_final` e aos links de arquivos na gaveta.
Na tabela, valor dedicado preenchido que a allowlist da interface recusa vira
**link não permitido**; o marcador exato **[conteúdo suprimido]** permanece visível.
Valor dedicado válido fora de HTTPS/Drive/Docs pode continuar triado na API:
a recusa visual não altera a projeção. URLs legítimas em texto livre continuam
como texto, conforme a redação parcial definida acima; não são varridas nem
substituídas apenas por não pertencerem à allowlist de links. As células nunca
criam links interativos nem navegação/carregamento automático. Essa distinção
não promete detectar todos os segredos possíveis nem comprova acesso a mídia.

## HTTP e inicialização local

- `GET /`, `/app.js`, `/theme.js`, `/styles.css`: somente esses quatro estáticos conhecidos. HEAD
  mantém controles e nenhum corpo. Métodos restantes 405; rotas desconhecidas 404.
  Não há endpoint de escrita/importação, geração, aprovação ou ação Google.
- `criarServidor({dataDir, port, webDir, quadroConfigPath})` carrega e valida o mapa
  antes de iniciar; `quadroConfigPath` opcional é argumento confiável para testes,
  padrão `config/quadro-etapas.json`, nunca parâmetro HTTP. Admite `webDir` somente como
  argumento do chamador confiável, padrão `src/web/`. Testes HTTP usam quatro estáticos
  sintéticos em diretório temporário próprio; os três originais pertencem ao recorte histórico da 001.
  A allowlist permanece fixa; nenhum parâmetro HTTP seleciona diretório ou arquivo.
- Manutenção de tema de 06/10/2026: `/theme.js` foi acrescentado explicitamente à
  allowlist e carrega antes do CSS. A preferência é apenas visual/local no navegador;
  CSP, controles de Host/Origin e recusa de arquivos arbitrários permanecem iguais.
  Não amplia ações ou dados da 001; evolução da leitura direta permanece no contrato da 002.
- Bind padrão `127.0.0.1:4318`; porta local explícita em teste. Host corresponde ao
  loopback/porta configurados; Origin, se presente, é a própria origem. Sem CORS externo.
  Bloquear traversal inclusive codificado; nunca servir `data/`, `.specify/`, `.agents/`
  ou arquivos/diretórios arbitrários. Servidor não consulta Google nem dispara agentes.
- Iniciador `Iniciar CRM.ps1 [-DataDir <diretorio-local>] [-Port <porta>]
  [-NodePath <exe>]` está implementado para Windows PowerShell 5.1; data/ e 4318
  padrão, porta inteira 0–65535. Resolve Node explícito, CRM_NODE_PATH ou node.exe
  no PATH, sem instalar runtime. Start-Process oculto redireciona stdout/stderr
  para `<DataDir>/runtime/iniciador-<id>/`; confirma linha de início por leitura
  compartilhada em até dez segundos e retorna `{processId,url,logDir,encerrar}`.
  Operador confere propriedade do PID antes de encerrar; erro encerra somente o
  filho criado por essa chamada, nunca ocupante da porta. Testes usam TEMP e
  porta/runtime explícitos; fora de win32 têm SKIP por plataforma.

Planilha concentra fonte, cobertura, Histórico e a explicação curta "Reler captura local;
não consulta o Google" junto a Atualizar dados. Nas demais telas só o selo curto.
Cada tabela tem rolagem horizontal própria; em 390 px a página não rola lateralmente.

## Fronteiras futuras

002: leitura direta somente pelo servidor local, conta de serviço/chave fora do
repositório, emenda futura da constituição e captura de Agentes/Controle/Execucoes.
003: planejamento mensal. 004: revisões e solicitações. 005: prévias/biblioteca.
006: Equipe/Workflow. Nenhuma dessas integrações foi implementada por esta documentação.
