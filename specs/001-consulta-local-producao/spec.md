# Feature Specification: Consulta local da produção NTV

Como um álbum da operação, esta feature permite localizar registros sem comandar a produção. A especificação abaixo continua sendo a meta completa; o estado da entrega e os limites são registrados separadamente.

**Feature Branch**: `001-consulta-local-producao`, criada de `main` no repositório local.

**Feature Directory**: `specs/001-consulta-local-producao`

**Created**: 2026-10-02 | **Updated**: 2026-10-04 (fechamento T039–T041)

**Status**: 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas. A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão pendente, resultados e limites na [validação](validacao.md).

**Manutenção atual de 08/10/2026:** o status acima preserva o fechamento histórico da 001; 001–004 estão concluídas na main e Pronta foi integrada pelo PR #21. A correção pequena de versões de páginas/cenas foi autorizada sem nova feature/Spec Kit, implementada e testada localmente; integração depende do gate/review do head final. Ponteiros explícitos podem reaproveitar mídia de outra versão, e a vigência das unidades usa a maior versão positiva por produção/índice positivo/tipo, sem comparar com a produção. [Contrato vigente](contracts/captura-e-consulta.md#versões-das-unidades--manutenção-de-08102026) e [evidências/limites](../../docs/reports/versoes-unidades-validacao.md).

**Input**: CRM simples somente neste computador, com o desenho aprovado; usar o GitHub
Spec Kit e construir por features. A decisão de interface está em
[telas.md](../../docs/design/telas.md), subordinada aos requisitos desta única spec.

## User Scenarios & Testing

### User Story 1 - Consultar o Planejamento (Priority: P1)

Como responsável pelo conteúdo, quero localizar todas as peças NTV no mês e na semana,
com o mínimo de informação para escolher o dia que vou consultar.

**Why this priority**: permite distinguir planejamento registrado de entregas existentes.

**Independent Test**: comparar calendário, lista semanal e relação sem data com as
produções de uma captura identificada, incluindo a imagem B histórica.

**Acceptance Scenarios**:

1. **Given** quatro produções na semana da captura, **When** consulto o mês,
   **Then** encontro as quatro uma vez na lista semanal e nas datas válidas do calendário;
   o tema aparece no primeiro dia da semana, mesmo numa semana que cruza meses.
2. **Given** duas peças no mesmo dia, **When** consulto o calendário,
   **Then** vejo o primeiro cartão e "+1 no dia"; cartão e dia abrem todas as peças daquele dia.
3. **Given** uma semana sem registro de peça, **When** a consulto,
   **Then** os dias ficam vazios, sem sugestões inventadas.
4. **Given** filtro Todos, Imagem, Carrossel ou Reels, **When** alterno Calendário/Lista,
   **Then** a seleção mantém as mesmas identidades; formato desconhecido permanece em Todos.
5. **Given** peças NTV com data ausente ou inválida, **When** abro Planejamento,
   **Then** o link acessível "N sem data" conta todas elas, abre sua lista agrupada por
   semana e mantém cada peça acessível; filtros e troca de mês não apagam esse total.
6. **Given** a 001, **When** abro o menu e o objetivo do mês,
   **Then** vejo apenas Planejamento, Produção e Planilha; o objetivo diz "Ainda não definido",
   sem botão "Plano do mês" e sem usar objetivo semanal como objetivo mensal.

### User Story 2 - Reconhecer o frescor e as falhas (Priority: P1)

Quero reconhecer rapidamente de quando são os dados e consultar a fonte e as tentativas
na Planilha, sem confundir uma releitura local com coleta no Google.

**Why this priority**: uma captura antiga ou atualização rejeitada não pode parecer sincronização atual.

**Independent Test**: promover captura válida, registrar falha, reiniciar a consulta e
reler localmente; a última válida e a falha persistida continuam identificadas.

**Acceptance Scenarios**:

1. **Given** captura válida concluída hoje em America/Sao_Paulo e nenhuma falha ativa,
   **When** abro qualquer tela, **Then** o selo verde diz "Atualizado hoje, HH:MM";
   clicar nele abre Planilha com horário e cobertura do envelope.
2. **Given** captura válida de outro dia e nenhuma falha ativa, **When** consulto,
   **Then** o selo âmbar diz "Dados de DD/MM", calculado por `completedAt` no fuso de exibição.
3. **Given** falha de uma nova tentativa após a última captura válida,
   **When** consulto, reinicio ou aciono Atualizar dados, **Then** o selo vermelho
   "Atualização falhou" prevalece sobre hoje/outro dia; a captura válida, seu horário e
   a tentativa falha no Histórico permanecem. Resposta HTTP bem-sucedida não encerra o erro.
4. **Given** nenhuma captura aceita, ainda que uma tentativa tenha falhado,
   **When** abro, **Then** vejo selo cinza "Sem dados", orientação para pedir a primeira
   leitura à Central e a falha no Histórico.
5. **Given** falha ativa, **When** uma nova tentativa completa é aceita e promovida,
   **Then** o selo volta ao frescor dessa captura; a tentativa anterior permanece no Histórico.
6. **Given** captura local disponível, **When** aciono Atualizar dados,
   **Then** o CRM relê a captura local e o histórico persistido, sem consulta ao Google,
   nova coleta, mudança de horário ou exclusão de tentativa.

### User Story 3 - Consultar a gaveta do dia inteiro (Priority: P2)

Quero abrir o dia escolhido e consultar todas as suas peças, versões e pendências,
com informações completas apenas nesse detalhe.

**Why this priority**: reduz ruído nas telas e permite localizar os materiais corretos.

**Independent Test**: abrir um dia com imagem e Reels, navegar pelo acordeão e fechar
com Escape, conferindo as versões e o foco restaurado.

**Acceptance Scenarios**:

1. **Given** um dia com várias peças, **When** aciono qualquer cartão ou o dia,
   **Then** a gaveta informa dia da semana, data e quantidade; contém uma seção por peça
   em acordeão, com somente a primeira aberta, inclusive peças escondidas pelo resumo "+N no dia";
   demais mostram uma linha com páginas/cenas vigentes, revisão e quantidade de avisos,
   com plural correto. Revisão aberta exige vigente; só ambígua/anterior não resolvida
   diz revisão a confirmar; nenhuma ou somente resolvidas diz sem revisão.
2. **Given** a gaveta aberta, **When** consulto uma peça,
   **Then** vejo estado/formato e faixa de etapa, com quem está, prevista e versão,
   somente com campos preenchidos. Etapa conhecida tem rótulo legível; desconhecida
   fica exatamente como está, com original na API. Publicação ocupa uma linha quando
   registrada; sem `publicado_em`, omito a linha, sem comprovar publicação. Registro
   inconsistente permanece com aviso de qualidade, sem conferência remota.
3. **Given** revisão vigente com pedido de correção, **When** consulto o detalhe,
   **Then** vejo título de decisão/versão/motivo (Revisar · versão 2 — motivo),
   correção/tratamento abaixo (Corrige: pessoa · tratamento), separado de responsavel_atual;
   IDs de revisão/unidade continuam na API, fora da linha visual. Outras vigentes ficam
   em **+1 revisão aberta** ou **+N revisões abertas**; resolvidas/outras versões dentro
   de **Histórico**, recolhido por clique.
4. **Given** carrossel ou Reels, **When** consulto as unidades,
   **Then** vejo páginas/cenas compactas ordenadas por índice dentro da versão,
   com número, texto e link ou mídia ausente, no máximo um aviso de ausência por linha.
   Cena distingue imagens ausentes/inicial/final e/ou vídeo ausente, sem perder
   os três slots na API; aviso técnico de mídia é agregado por cena, mantendo
   validações de índice/tempo/versão independentes.
   Página mostra versão, **imagem vN** do arquivo ligado e design novo "A confirmar"
   sem fonte inequívoca. Cada índice inteiro positivo usa a maior versão inteira positiva
   por produção/tipo de unidade como vigente, independentemente de `Produções.versao`;
   todos os empates permanecem e índices/versões inválidos não são vigentes. Grupos
   atuais vêm primeiro; históricos e Texto registrado começam recolhidos e abrem
   por clique, com API completa, inclusive quando o mesmo número de versão contém
   unidades atuais e antigas. Ponteiro explícito exige produção/unidade compatíveis
   (unidade vazia no arquivo é aceita), permitindo mídia de outra versão sem substituição.
5. **Given** arquivo relacionado, ausente ou vínculo quebrado, **When** consulto,
   **Then** o arquivo mostra nome de apresentação, versão e "registro"; ausência e
   inconsistência geram avisos, sem prévia nem mídia substituta. Link permitido abre
   apenas por clique em HTTPS nos hosts exatos Drive/Docs autorizados pelo contrato;
   URL recusada nunca aparece como texto bruto. Usuário/senha em Arquivos.url ou
   Produções.url_video_final causa supressão na projeção por `new URL`, com aviso sem valor.
   URL não vazia que não pode ser analisada também é suprimida, com motivo fixo;
   vazio/somente espaços é preservado sem aviso de URL inválida.
6. **Given** gaveta aberta por teclado, **When** pressiono Escape,
   **Then** ela fecha e devolve o foco ao acionador; em 390 px ocupa a tela inteira.
7. **Given** documentos da semana presentes ou ausentes, **When** abro o dia,
   **Then** Plano/Redação/Visual aparecem uma vez por semana representada no fim da
   gaveta, com **—** para ausência, inclusive peça sem semana identificada.
8. **Given** avisos localizados, **When** abro a peça,
   **Then** vejo somente a quantidade de **aviso(s) de dados nesta peça** e link **ver
   na Planilha**, com plural correto e sem separador pendurado; o link
   fecha a gaveta, abre Produções na Planilha e foca o painel Aba/Linha/Campo/Motivo
   filtrado pelos avisos da peça; as seis tabelas conservam todas as linhas NTV.
   Aviso semanal não se repete no conjunto global por peça.

### User Story 4 - Localizar peças no quadro de Produção (Priority: P2)

Quero consultar a semana por etapa registrada e saber a quem a peça está atribuída,
sem alterar a fila nem receber encaminhamentos presumidos.

**Why this priority**: organiza a produção e mantém desconhecidos visíveis.

**Independent Test**: conferir publicação > liberação > revisão > etapa, Visual para
`arte_aprovada`, os oito valores de mídia e Outras com originais/contador distinto;
carregar configuração válida e rejeitar coluna inexistente ou rótulo repetido.

**Acceptance Scenarios**:

1. **Given** a semana selecionada, **When** abro Produção ou uso as setas de semana,
   **Then** vejo tema e colunas Planejamento, Redação, Visual, Mídia, Revisão, Pronta,
   Publicada e Outras, sem arrastar cartões; colunas sem valores confirmados podem ficar vazias.
2. **Given** nenhuma prioridade superior satisfeita,
   **When** projeto o quadro, **Then** `arte_aprovada` fica em Visual e os oito valores
   de mídia confirmados ficam em Mídia. Etapa desconhecida ou vazia fica em Outras
   com o original preservado; etapas de envelope não viram aliases da coluna.
3. **Given** `status=publicado`, aprovação ou arquivo final sem `publicado_em` preenchido,
   **When** projeto, **Then** nenhum desses sinais coloca a peça em Publicada;
   `publicado_em` preenchido tem precedência, sem comprovar publicação remota.
4. **Given** cartão, **When** o consulto,
   **Then** vejo formato, data prevista, título, status registrado, responsável e pendência
   localizada de revisão vigente ou mídia ausente; "com quem está" é `responsavel_atual`,
   sem inferir "aguarda de", agente trabalhando ou próxima ação.
5. **Given** peça sem data válida no quadro, **When** aciono seu cartão,
   **Then** abre a seção "Sem data" da semana com suas peças, sem inventar um dia.
6. **Given** campos que satisfazem mais de uma regra, **When** classifico,
   **Then** publicação vence liberação, liberação vence revisão e revisão vence etapa;
   status nunca decide a coluna. As listas iniciais da 001 de prontidão/revisão eram vazias;
   o mapa vigente contém `liberado` em `liberacaoPronta`, conforme o [contrato da manutenção](contracts/captura-e-consulta.md#pronta-para-publicar--manutenção-de-08102026).
7. **Given** rótulo novo aprovado, **When** altero a configuração versionada e reinicio,
   **Then** o servidor aplica o mapa sem mudar código. Coluna inexistente ou rótulo
   repetido no mesmo campo gera erro claro ao carregar, sem mapa parcial.
8. **Given** cartões em Outras, **When** consulto a semana,
   **Then** o título mostra quantos valores originais distintos não mapeados existem;
   repetição conta uma vez e todas as formas de vazio contam um único valor;
   outra semana/marca ou prioridade
   superior não aumenta o contador. Cada cartão mostra o original.

### User Story 5 - Consultar Planilha e Histórico (Priority: P2)

Quero consultar as tabelas que sustentam a visão e as tentativas de atualização,
preservando dados privados apenas neste computador.

**Why this priority**: concentra fonte, cobertura e erros numa tela de consulta verificável.

**Independent Test**: abrir as seis abas e Histórico, conferir contagens e nomes dos
66 cabeçalhos mínimos, com seus valores triados renderizados como dados seguros,
conforme os limites de normalização e apresentação de URL do contrato.

**Nota da manutenção de 08/10/2026:** os cenários abaixo preservam o recorte inicial da 001. A consulta atual mantém os 66 mínimos e acrescenta somente os opcionais contratuais cujo cabeçalho foi capturado: `Semanas.pauta_id`, `Produções.pacote_versao`/`hashtags` e `Arquivos.extensao`. Isso vale também para capturas antigas que já contêm esses cabeçalhos, sem regravar bytes ou hashes; demais extras continuam privados. `producoes[].detalhes.pacotePublicacao` representa o pacote único compatível ou null, conforme [Pronta para publicar — manutenção de 08/10/2026](contracts/captura-e-consulta.md#pronta-para-publicar--manutenção-de-08102026).

**Acceptance Scenarios**:

1. **Given** captura completa aceita, **When** abro Planilha,
   **Then** vejo horário de fim e período coberto, Atualizar dados, seis abas Semanas,
   Produções, Páginas, Cenas, Arquivos e Revisoes com contagem de linhas e os 66 cabeçalhos
   mínimos com seus valores triados, inclusive IDs, hashes e origens, como texto/dados.
   Contagens correspondem às linhas NTV selecionadas; linhas de tabelas são cópias
   com somente os mínimos, sem quadro/detalhes/envelope.
2. **Given** colunas extras na captura, **When** consulto as tabelas,
   **Then** elas são preservadas somente na captura privada; não aparecem automaticamente
   no HTTP nem criam exigência de coluna na planilha operacional.
3. **Given** tentativas completas e falhas, **When** abro Histórico,
   **Then** vejo todas as tentativas confirmadas no estado local, recentes primeiro, com resultado
   "completa"/"falhou" e motivo resumido; registros são imutáveis e falha não apaga a anterior.
   Arquivo preparado sem confirmação não aparece como conclusão aceita.
4. **Given** uma tabela larga em 390 px, **When** consulto,
   **Then** a própria tabela tem rolagem horizontal; a página não corta conteúdo nem rola lateralmente.
5. **Given** abas disponíveis, **When** uso setas esquerda/direita, Home ou End,
   **Then** seleção e foco acompanham a aba; a releitura conserva a seleção disponível.
6. **Given** nenhuma captura válida, **When** abro Planilha,
   **Then** vejo orientação à Central e somente Histórico, com as tentativas confirmadas
   ou ausência explícita delas, sem tabelas fictícias.
7. **Given** aviso de uma peça, **When** sigo ver na Planilha da gaveta,
   **Then** a gaveta fecha, Produções abre e o painel da peça recebe rolagem/foco;
   as seis tabelas mantêm o conjunto NTV. Menu, selo e Todos os avisos restauram
   avisos gerais, sem operação remota.
8. **Given** célula dedicada url/url_video_final recusada pela allowlist visual,
   **When** consulto a tabela, **Then** vejo link não permitido, sem URL bruta;
   o marcador de supressão permanece. Texto livre legítimo conserva suas URLs
   como texto, segundo o contrato, e nenhuma célula navega ou carrega mídia.

### Edge Cases

- Recibo confirmado precisa ser objeto com tipos/IDs e data ISO real com fuso válidos;
  corrupção recusa a consulta com 503 genérico, sem escrever ou fabricar Histórico.
- Se a triagem alteraria identidade/vínculo NTV terminado em `_id`, recusar a candidata
  antes de no-op, gravação ou promoção; falha confirmável registra localização sem valor
  e preserva a última captura. A consulta mantém recusa da projeção para bytes antigos ou
  corrompidos, sem fundir registros numa chave compartilhada ou escrever arquivos privados.
- Versão da produção ausente gera aviso; sua ausência/invalidade não impede faltas
  reais de mídia em unidades vigentes com índice/versão válidos. Sem unidades vigentes,
  o fallback de ausência de arquivo exige versão válida da produção. Registros e
  avisos permanecem; revisão e pacote seguem seus próprios contratos de versão.

- Na importação, `completedAt` até 10 minutos à frente do relógio local é aceito; mais que isso recusa a captura como inválida. Captura nova com fim igual ou anterior ao da vigente é desatualizada e recusada. Ambos confirmam recibo com motivo e preservam a vigente. Repetição do mesmo ID/bytes já aceitos continua sem alteração; GET não revalida essa política temporal.

- Sem data válida permanece no total NTV e numa lista acessível; vínculo de semana
  ausente recebe grupo "Semana não identificada" e aviso, sem esconder a peça.
- Semana cruzando o mês mantém sua identidade; calendário usa a data civil da peça.
- Filtro aplicado ao resumo não reduz a gaveta do dia: ela contém todas as peças NTV daquele dia.
- Cabeçalho mínimo ausente/duplicado, ID duplicado, captura parcial ou hash divergente
  invalida a tentativa, mantém a última válida e registra falha resumida no Histórico.
- Interrupção antes da promoção conserva a captura anterior e exclui recibos não
  confirmados do Histórico; repetir os mesmos bytes ainda não aceitos permite nova
  tentativa de promoção. Armazenamento indisponível gera erro explícito de persistência,
  sem fingir que o recibo de falha foi gravado.
- Arquivo inexistente, empate de versão, origem incompatível ou revisão de vigência incerta
  gera aviso localizado; não seleciona documento nem reprova versão nova arbitrariamente.
- Em revisão não resolvida, vínculo falho aponta ao primeiro pagina_id/cena_id/arquivo_id
  incompatível, não a versao genericamente; versao é usado quando a versão é inválida.
  Cena conserva imagem inicial/final/vídeo por slot, com aviso de mídia agregado e
  causas distintas sem absorver validações independentes de índice/tempo/versão.
- `arte_aprovada` confirmado na leitura atual fica em Visual se não houver prioridade
  superior. `bloqueado` não é prontidão; `aprovada`/`sem_rejeicao_documental` não são
  revisão em andamento. Não inventar rótulos atuais para preencher colunas.
- Publicação preenchida com data sem fuso, inválida ou posterior ao fim da captura
  conserva Publicada com aviso do registro, sem comprovar publicação remota.
- Configuração ausente/inválida não inicia o servidor com fallback silencioso.
- Texto livre, JSON e URL são dados; nenhum deles executa HTML, instrução ou ação operacional.
- Por decisão do autor, texto livre mínimo e recibo público conservam frase e espaços:
  somente pedaço HTTP(S) separado por espaços em branco que `new URL` identifica
  com usuário/senha vira **[conteúdo suprimido]**, mantendo pontuação de contorno.
  Não há promessa de detectar outros esquemas, URL relativa, espaços em userinfo
  ou forma fora desse pedaço. Segredo/caminho conhecido continua suprimindo o texto
  reconhecido inteiro. JSON válido é dado, sem ampliar campos HTTP: só tokens de
  string alterados são reserializados, preservando os demais bytes, números, ordem,
  espaços e escapes legítimos. Validade original de origens_json permanece privada e não é confundida
  com o marcador de supressão. Avisos relacionados já globais entram no contador
  da peça afetada, sem duplicar o conjunto global. Arquivo ligado sem link seguro
  mostra link não permitido; Texto registrado usa Página/Cena número e versão,
  mantendo IDs completos somente na API.
- No cartão de Produção, responsável vazio aparece "A confirmar" e etapa
  vazia "Não informada", com original preservado. Na faixa compacta da gaveta,
  campos vazios são omitidos; `detalhes.responsavelRegistrado` mantém o fallback na API.
- Dados de outra marca não aparecem como produção ou exemplos NTV.
- Coluna mínima não autoriza expor tokens, credenciais ou caminhos locais embutidos em célula;
  conteúdo sensível indevido recebe aviso e supressão localizada, preservado na captura privada.
- Nos campos dedicados, URL com usuário ou senha em Arquivos.url/Produções.url_video_final vira
  **[conteúdo suprimido]** pela análise de `new URL`, sem valor no aviso;
  JSON HTTP e gaveta não contêm as partes da credencial, inclusive quando codificadas.
- Nos campos de URL dedicados, parsing de URL não vazia que falha não devolve valor bruto: marcador e motivo
  **URL inválida suprimida** preservam apenas o original privado; vazio/somente
  espaços não causa supressão nem aviso de URL inválida.
- Quando a redação de texto já substituiu um pedaço HTTP(S) credenciado em um
  campo de URL dedicado, o restante da frase também é preservado, sem a credencial.

## Requirements

### Functional Requirements

- **FR-001**: exibir Planejamento com calendário mensal de cartões e lista agrupada
  por semana (tema e período), filtros Todos/Imagem/Carrossel/Reels e tema no primeiro dia da semana.
- **FR-002**: usar exclusivamente produções da captura aceita, preservando identidades,
  datas e históricos, inclusive as duas imagens existentes; cada peça aparece uma vez na lista.
- **FR-003**: mostrar em todas as telas o selo de quatro estados que leva a Planilha:
  hoje HH:MM verde, outro dia DD/MM âmbar, falha vermelho com última válida ou sem captura cinza.
  Falha ativa com captura válida prevalece sobre frescor; sem captura mantém falha no Histórico.
- **FR-004**: coletar pela Central com acesso autorizado; Atualizar dados somente relê
  captura e histórico locais. Falha persistida só encerra quando nova tentativa completa é aceita,
  nunca por resposta HTTP de sucesso ou releitura da mesma captura. Na importação, tolerar até
  10 minutos de relógio adiantado; recusar mais que isso como inválida e captura nova com
  `completedAt` igual/anterior à vigente como desatualizada, com recibo e sem substituição.
- **FR-005**: separar data prevista de publicação; classificar Publicada somente com
  `publicado_em` preenchido, avisando inconsistências de data sem verificar publicação remota.
  Manter "N sem data" acessível contando
  todas as peças NTV sem data válida, sem desaparecer por filtro ou navegação de mês;
  quando não há peças sem data, ocultar o link.
- **FR-006**: detalhar semana, textos, páginas/cenas, estados, responsável, revisões e
  documentos relacionados, mantendo suas versões e pendências de vínculo separadas.
- **FR-007**: resolver arquivos por IDs internos, mostrar nome de apresentação, versão,
  "registro" e link permitido por clique, sem confundir IDs internos e Drive nem carregar prévias.
- **FR-008**: distinguir etapa, revisão, liberação e disponibilidade; arquivo cadastrado
  não comprova bytes ou aprovação. Revisão de correção mantém responsável e versão próprios.
- **FR-009**: manter consulta: nenhum controle aprova, rejeita, gera, custa, publica,
  agenda, muda etapa, arrasta cartão ou dispara agente/workflow.
- **FR-010**: restringir acesso a este computador e servir projeção local de campos
  selecionados: Planilha inclui todos os mínimos como registro, sem envelope/captura bruta,
  extras arbitrários, credenciais, tokens ou caminhos de filesystem. Dados locais não entram
  em Git, fixtures nem capturas de interface compartilhadas.
- **FR-011**: permitir teclado e Escape com foco restaurado; em 390 px usar lista semanal,
  menu recolhido, gaveta de tela inteira e tabelas com rolagem própria, sem corte da página;
  em 1440 px preservar o desenho aprovado e o calendário.
- **FR-012**: verificar interpretação de identidade, data, versão, etapa, publicação,
  projeção segura, captura/histórico e cinco fluxos de usuário antes de concluir a implementação.
- **FR-013**: menu da 001 contém somente Planejamento, Produção e Planilha; objetivo
  mensal discreto "Ainda não definido", sem Plano do mês ou objetivo inventado por semana.
- **FR-014**: Produção é quadro semanal sem arrastar, com oito colunas fixas e prioridade
  publicação preenchida > liberação/prontidão configurada > revisão em andamento
  configurada > etapa. `arte_aprovada` entra em Visual, os oito valores de mídia
  confirmados em Mídia e demais/vazios em Outras com original, salvo prioridade superior.
  Mapa versionado lido pelo servidor, extensível sem alterar código e validado ao carregar:
  coluna inexistente ou rótulo repetido no mesmo campo é erro claro. Outras mostra no título
  o número de rótulos distintos não mapeados da semana selecionada. Cartão exibe formato,
  data, título, status informativo, `responsavel_atual` e pendência; não infere encaminhamento.
- **FR-015**: cartão ou dia abre gaveta do dia inteiro, título/data/quantidade e uma seção
  por peça em acordeão, primeira aberta e demais resumidas. Peça sem data no quadro abre
  seção Sem data da semana; faixa de quatro dados preenchidos e publicação registrada em
  uma linha, páginas/cenas compactas, correção separada e mídia ausente explícita.
  Texto registrado, versões anteriores e Histórico são recolhidos; outras revisões
  vigentes ficam em +N. Documentos semanais aparecem uma vez no fim do dia com três
  papéis/— na ausência; aviso técnico só na API, quantidade/link para Planilha na gaveta.
- **FR-016**: Planilha reúne horário/cobertura, releitura local, seis abas com contagens e
  os 66 cabeçalhos mínimos e valores triados, mais Histórico de tentativas completas/falhas,
  resumidas, imutáveis, persistidas privadamente e confirmadas no estado local;
  arquivos preparados/órfãos não são conclusões. Extras ficam somente na captura privada.
  As tabelas usam cópias dos mínimos e contagens NTV; avisos detalhados podem ser
  filtrados pela peça sem recortar dados. Abas têm teclado/foco e rolagem própria;
  URLs dedicadas recusadas mostram link não permitido, conforme o contrato, com
  textos livres legítimos preservados e nenhuma navegação automática.

### Key Entities

- **Captura**: leitura completa identificada, fonte privada, horários, cobertura e integridade.
- **Tentativa**: recibo imutável de importação completa ou falha, persistido separadamente da captura vigente.
- **Semana**: tema e objetivo semanal, período e ponteiros internos; não é plano mensal.
- **Produção**: peça com identidade, formato, data e facetas de etapa/revisão/liberação/publicação.
- **Dia/Sem data**: agrupamento de consulta que reúne peças NTV para a gaveta, sem novo estado operacional.
- **Página/Cena**: unidade versionada e ordenada, ligada à produção e a registros de mídia.
- **Arquivo**: documento/mídia registrado com relações privadas e apresentação selecionada.
- **Revisão**: avaliação de versão/unidade, decisão, motivo, correção e tratamento.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das produções NTV aceitas aparecem uma vez na lista semanal ou grupo
  sem semana; 100% das sem data permanecem acessíveis e contam no link, sem perda por filtro/mês.
- **SC-002**: em cada tela, os quatro estados de selo correspondem às regras de captura e
  falha; um acionamento abre Planilha com fonte, fim de captura e cobertura corretos.
- **SC-003**: toda pendência do detalhe aponta ao registro/unidade; nos testes, nenhuma
  mídia ausente recebe rótulo disponível, nenhuma aprovação/arquivo/status sozinho comprova publicação.
- **SC-004**: todas as falhas mantêm a última captura válida e seu horário; com
  persistência disponível, seus recibos confirmados sobrevivem a reinício/releitura e
  permanecem no Histórico após tentativa nova aceita. Falha de persistência é erro
  explícito, sem sucesso ou conclusão falsa no Histórico.
- **SC-005**: abrir cartão/dia exige até dois acionamentos a partir do calendário/lista/quadro;
  100% das peças do grupo aparecem na gaveta, com primeira seção aberta e foco restaurado por Escape.
- **SC-006**: testes e demonstração geram zero escritas remotas, mídias, publicações ou
  modificações de workflows; consulta HTTP não contém captura bruta, extras ou segredos.
- **SC-007**: 100% dos casos respeitam publicação > liberação > revisão > etapa;
  sem prioridade superior, `arte_aprovada` fica em Visual, oito etapas em Mídia e demais
  em Outras com contador distinto correto. Rótulo novo funciona só alterando a configuração;
  coluna inexistente ou rótulo repetido no mesmo campo é rejeitado ao carregar.
- **SC-008**: Planilha contém as seis abas, contagens fiéis e os 66 cabeçalhos/valores mínimos;
  Histórico contém todas as tentativas confirmadas no estado local, exclui recibos
  preparados/órfãos e nenhuma célula extra é exposta automaticamente.
- **SC-009**: em 390 px e 1440 px, os cinco fluxos funcionam por teclado e sem rolagem
  horizontal da página; em 390 px lista substitui calendário e gaveta ocupa tela inteira.

## Assumptions

- NTV e uso somente neste computador foram confirmados; não há deploy ou versão pública.
- Captura oficial pela Central precede consulta local; o runtime do CRM não herda sessão Google.
- A decisão de telas de 03/10/2026 complementa o protótipo aprovado; demonstrações não são fonte operacional.
- Duas leituras completas iguais detectam diferenças observáveis, sem atomicidade entre abas.
- Oito etapas de mídia e `arte_aprovada` em Visual estão confirmadas; na configuração
  inicial da 001, as listas de liberação/prontidão e revisão em andamento eram vazias.
  O mapa vigente contém `liberado` em `liberacaoPronta` e revisão vazia, sem aliases
  inferidos, conforme o [contrato da manutenção](contracts/captura-e-consulta.md#pronta-para-publicar--manutenção-de-08102026).
- Campos mínimos garantem cabeçalho, não mídia, responsável, design novo ou publicação preenchidos.
- A **002** será leitura direta da Planilha pelo servidor local, somente leitura, com conta
  de serviço/chave fora do repositório, emenda futura da constituição e extensão Agentes/Controle/Execucoes.
- Planejamento mensal fica na **003**, revisões/pedidos na **004**, prévias/biblioteca na **005**
  e Equipe/Workflow na **006**, cada uma com especificação futura. Esta atualização não instala nem integra essas capacidades.
