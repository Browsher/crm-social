# Interface de Planejamento, gaveta do dia, Produção e Planilha

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

Planejamento, frescor/releitura, gaveta, Produção e Planilha implementados localmente; verificação sintética e estado final T001–T041 na [validação](../../specs/001-consulta-local-producao/validacao.md). Demonstração privada e onboarding final concluídos; limites na validação. Arquivos: [index.html](../../src/web/index.html), [app.js](../../src/web/app.js) e [styles.css](../../src/web/styles.css). Funções estáveis em app.js: `abrirDia`/`acordeaoPeca`, `secaoUnidades`/`secaoRevisoes`, `renderProducao`/`pendenciaQuadro`, `renderPlanilha`/`celulaPlanilha` e `detalhesCaptura`.

## Inicialização e navegação

O HTML importa somente `/styles.css` e `/app.js`; o JavaScript consulta GET /api/visao e atualiza por POST /api/atualizar; depois faz GET com cache no-store. Não há framework, imagem remota, Google ou autenticação no navegador.

| Estado/controle | Comportamento atual |
| --- | --- |
| Mês inicial | Mês civil de hoje em America/Sao_Paulo |
| Título do mês | Somente inicial maiúscula, preposição minúscula: Outubro de 2026; sem text-transform capitalize |
| Desktop | Calendário inicial, semanas completas de segunda a domingo que contêm ao menos um dia do mês, sem uma sexta semana fixa |
| Sidebar desktop | Ocupa a altura da página inteira, inclusive além da área visível; no mobile permanece menu fixo/recolhido |
| Até 720 px | Lista inicial, menu recolhido; seletor visual Calendário/Lista fica oculto |
| Menu | Exatamente Planejamento, Produção e Planilha |
| Produção | Quadro por semana/tema, setas, oito colunas/vazias, pendências e Outras com título/contador da API |
| Planilha | Fonte, fim em São Paulo, cobertura, releitura, seis abas de mínimos NTV, Histórico final e painel detalhado de avisos |
| Filtros | Todos, Imagem, Carrossel e Reels, com aria-pressed |
| Mês anterior/próximo | Troca somente o mês apresentado |
| Selo | Quatro textos/cores contratuais da API em todas as telas; clique abre Planilha |
| Atualizar dados | POST {} e depois GET; botão desabilitado até o fim, mensagem curta role=status |
| Erro de consulta | Mensagem local; visão/selo já carregados são preservados e botão é liberado; sem visão anterior mostra Consulta indisponível |
| Captura ausente | Peça a primeira leitura à Central, sem fallback fictício |
| Objetivo mensal | Ainda não definido, sem botão Plano do mês |

Os handlers são instalados uma vez antes da primeira consulta, com Planejamento como tela inicial. `reler` consulta a API, atualiza `state.view` após uma resposta bem-sucedida e renderiza sem trocar a tela escolhida. O botão é liberado em `finally`, inclusive após 503, permitindo nova tentativa. Sem visão anterior, `render` retorna sem acessar dados: filtros continuam seguros após a primeira falha e `#erro` fica visível junto a **Consulta indisponível**. Abrir/reler GET não grava ou consulta Google; somente o POST explícito inicia leitura pelo servidor.

Em Planilha, `detalhesCaptura` mostra **Captura pela Central** ou **Leitura direta pelo servidor local**, fim da captura formatado em `America/Sao_Paulo` e período civil das semanas; sem esses dados usa **Sem captura disponível** e **Cobertura não disponível**. **Origem e atualização** contém somente a linha **Última importação falhou; captura anterior preservada** quando a última tentativa falhou e há captura; sem captura, usa **Última importação falhou; nenhuma captura válida disponível**. Quando há avisos gerais, mostra o link **N avisos de dados**, com singular para um. A lista de motivos fica somente no painel Aba/Linha/Campo/Motivo. O selo segue ausência, falha ativa, hoje ou outro dia calculados na projeção; GET/no-op não renovam horário nem encerram a falha.

## Calendário, lista e Sem data

O cartão mostra somente formato, título e status registrados, com rótulos de ausência. Seis status conhecidos/aprovados recebem rótulo legível na apresentação, sem mudar o valor da API. `pronto`, `publicado`, `erro`, `cancelado` e `cancelada` constam no dicionário; `em_planejamento` foi explicitamente fornecido/aprovado pelo autor nesta revisão:

| Status exato registrado | Rótulo na interface |
| --- | --- |
| `em_planejamento` | Em planejamento |
| `pronto` | Pronto |
| `publicado` | Publicado |
| `erro` | Erro |
| `cancelado` | Cancelado |
| `cancelada` | Cancelada |

Valor desconhecido permanece exatamente o original, sem substituir sublinhados, normalizar ou aplicar capitalização geral; vazio usa **Estado não informado**. O mapa é somente de texto em calendário, lista e acordeão: não determina etapa, prontidão ou publicação comprovada.

Tema aparece no início da semana. Para múltiplas peças, apresenta o primeiro cartão de formato selecionado e **+N no dia**. Clicar cartão, dia ou contador abre todas as peças desse dia, sem aplicar o filtro de formato ao grupo. A grade começa na segunda-feira da primeira semana que contém o dia 1 e termina no domingo da última semana que contém dia do mês; pode ter 28, 35 ou 42 células conforme o calendário.

A lista agrupa pelo tema/período da semana de origem. `pecaVisivel` considera a data civil da peça no mês escolhido; conserva também peças dentro do período de uma semana que cruza aquele mês. Peça remarcada para outro mês aparece no novo mês sem mudar sua semana registrada. Sem data permanece acessível independentemente do mês; filtro de formato continua valendo na lista comum.

**N sem data** conta globalmente a captura NTV e abre lista dedicada por semana, sem filtro de mês/formato; o link fica oculto quando N é zero. O total **peças registradas** também é global, não a quantidade visível naquele filtro.

## Produção por semana

`semanasQuadro` ordena por início civil/identidade, sem período ao final. A seleção conserva escolha; na primeira carga prefere semana de hoje em São Paulo, senão última datada ou primeira disponível. Setas ficam desabilitadas nos limites; tema/período/total são da semana escolhida, sem filtro de mês/formato do Planejamento. O browser usa colunas/título/IDs/contador da API, sem recalcular mapas. Vazia mostra **Sem peças**; sem captura pede primeira leitura à Central.

Cartão apresenta formato, data/**Sem data**, título, status informativo e **Com quem está** registrado (vazio **A confirmar**); Outras conserva etapa original (vazio **Não informada**). [`pendenciaQuadro`](../../src/web/app.js) filtra somente as pendências de mídia na apresentação do cartão: **Mídia ausente** aparece em Mídia, Revisão, Pronta, Publicada e Outras; fica oculta em Planejamento, Redação e Visual. Revisões vigentes que pedem correção continuam no resumo em qualquer coluna. `semanaId` está declarada no estado inicial junto aos estados da Planilha, sem redefinir a regra de seleção semanal.

Após esse filtro, a primeira pendência visível mostra **Revisão: motivo** ou o texto curto **Mídia ausente**, com **Corrige** separado quando a revisão tem responsável registrado. **+N pendências** conta somente as demais visíveis, com singular quando N=1; nenhuma visível omite o resumo inteiro. API e gaveta conservam os detalhes de mídia e revisão. Registro de arquivo na versão atual com URL vazia/recusada não vira mídia ausente. Assim, um cartão em Planejamento com revisão e mídia ausente mostra a revisão sem contar a mídia no +N; em Mídia, ambas entram no resumo e na contagem.

Grid preserva oito colunas em ordem: quatro em 1440 px, duas até 1100 px e uma até 720 px. Cartões são botões com foco/teclado; clique abre o dia inteiro ou Sem data da semana, sem arrastar/editar. [tests/interface.test.cjs](../../tests/interface.test.cjs) cobre semana/tema, vazias, Outras/contador, responsáveis/pendências, teclado e clique em 390/1440; resultados somente na validação.

## Planilha, Histórico e avisos

Como folhas de consulta do mesmo álbum, seis abas mantêm o conjunto NTV completo.
O atalho da gaveta localiza somente os avisos relacionados à peça, sem reduzir as
tabelas. A tela usa `planilha`, `historico`, `avisos` e `detalhes.avisos` da API
existente; não há nova consulta remota nem escrita.

| Seção / controle | Apresentação atual |
| --- | --- |
| Subtítulo | Dados capturados da planilha, por aba; ao voltar às demais telas, Peças registradas, semana a semana. |
| Origem e atualização | Fonte, fim e cobertura; falha ativa em uma linha e contador de avisos gerais como link, sem repetir os motivos |
| Abas de dados | Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes; contagem de linhas NTV e 66 mínimos triados, sem campos calculados de quadro/gaveta |
| Histórico final | Todas as tentativas confirmadas, recentes primeiro; horário em São Paulo, Completa/Falhou e motivo em linguagem de tela; vazio = Nenhuma tentativa confirmada |
| Teclado de abas | Setas esquerda/direita com retorno nas pontas, Home/End; seleção e foco juntos, somente aba selecionada no Tab |
| Tabela larga | Região de rolagem horizontal própria com nome/foco; conteúdo como texto e cabeçalhos de coluna |
| Sem captura | Orientação para pedir captura completa à Central; somente Histórico, sem seis tabelas fictícias |
| Avisos de dados | Aba/Linha/Campo/Motivo; — quando não há localização; oculto em Histórico ou sem avisos |
| Releitura | Conserva a aba disponível e filtro da peça ainda existente; erro HTTP conserva a visão anterior |

`tabelaLocal` (378) cria a região focável e tabela por `textContent`;
`historicoPlanilha` (396) usa toda a lista confirmada, sem inferir novas tentativas
de GET/no-op nem mostrar órfãos. `renderPlanilha` (456) acrescenta Histórico após
as seis abas; `tabPlanilha` (444) e `escolherAba` (439) sincronizam seleção, foco,
`aria-selected` e `aria-labelledby`, com rolagem da aba até a área visível. Se a
aba deixa de existir, a primeira disponível é selecionada.

`avisosPeca` (173) fecha a gaveta, chama `navegar` (347) com a produção, abre
Produções e dá rolagem/foco a `#avisos-dados`. `renderAvisosPlanilha` (427) usa os
avisos relacionados da peça; as seis tabelas permanecem globais à captura NTV.
Menu e selo entram sem filtro; **Todos os avisos** restaura os gerais no painel.
O link **N avisos de dados** de Origem também restaura os gerais, seleciona Produções
e dá foco/rolagem ao painel, inclusive ao sair de Histórico. O contador usa a
quantidade global de avisos, sem deduplicar linhas ou acompanhar o filtro da peça.

`motivoAviso` (417) consolida o texto de mídia de cada aviso apenas na apresentação:
**Imagens e vídeo ausentes**, **Imagem final ausente**, **Nenhum arquivo da produção
registrado** e **Imagem ausente** para páginas são exemplos. Retira a repetição
do prefixo e reúne causas distintas em uma célula; conserva a quantidade de linhas
e Aba/Linha/Campo. Outros motivos permanecem como recebidos; a API não é alterada.

`motivoHistorico` (405) traduz falhas para linguagem de tela: **Cenas complete:
inválido** vira **Aba Cenas incompleta**; outras validações de aba usam **Aba X
inválida**. Horário futuro, captura desatualizada e arquivo ausente/ilegível ou
inválido recebem rótulos próprios; motivo desconhecido usa **Captura não pôde ser
importada**, vazio permanece vazio. Resultado desconhecido usa **Resultado
desconhecido**. Os motivos originais do recibo continuam na API e na persistência.

`celulaPlanilha` (470) aplica a allowlist somente a `url`/`url_video_final`:
valor dedicado preenchido recusado por `urlAutorizada` vira **link não permitido**;
o marcador exato **[conteúdo suprimido]** permanece. A API conserva seus valores
triados, incluindo URL dedicada válida fora da allowlist visual. Texto livre
legítimo mantém suas URLs como texto, conforme a redação do contrato. Células não
criam links, navegação ou carga automática. A garantia de não ecoar URL recusada
refere-se aos campos dedicados e links de arquivos; não varre todas as frases.

## Gaveta do dia, texto e acessibilidade

O diálogo nativo recebe título de data/sem data, quantidade e **todas** as peças do grupo. Como fichas dobráveis, `abrirDia` guarda o elemento que abriu o detalhe e gera um `details` por peça, em ordem ordinal de ID; só a primeira seção começa aberta. O filtro de formato do calendário/lista não é reaplicado ao dia. Um dia vazio mostra **Nenhuma peça registrada neste dia**, sem acordeão fictício; Sem data conserva o grupo da própria semana. A apresentação segue o [mockup da gaveta compacta](../design/mockups/gaveta-v2.html), preservando todos os detalhes seguros na API.

| Seção da peça | Conteúdo real |
| --- | --- |
| Cabeçalho do acordeão | Formato, título e rótulo de status; peça recolhida resume quantidade de páginas/cenas vigentes, revisão e avisos em uma linha |
| Identificação | Faixa de Etapa, Com quem está, Prevista e Versão; somente campos preenchidos, sem placeholders de ausência |
| Publicação | Uma linha quando publicado_em está preenchido; não existe faixa vazia nem confirmação remota |
| Texto registrado | Details fechado: legenda, corpo/função das páginas, texto na tela das cenas e Arquivos · registros; unidades identificadas por Página/Cena número e versão, sem IDs técnicos; textContent |
| Revisão vigente | Título legível de decisão/versão/motivo, abaixo Corrige: responsável e tratamento; sem IDs/rótulos técnicos, adicionais em +N revisão aberta/revisões abertas |
| Páginas / Cenas | Versão vigente primeiro; outras versões em details recolhidos, com impacto atual a confirmar; índice em ordem dentro da versão |
| Página | Linha compacta com número, título ou corpo, Design novo: A confirmar e link permitido ou mídia ausente |
| Cena | Linha compacta com número, texto, início/duração e links permitidos; um texto humano agregado distingue imagens ausentes/inicial/final e/ou vídeo ausente |
| Arquivos · registros | Dentro de Texto registrado: nome de apresentação, versão e registro, sem miniatura; arquivo ligado sem URL segura mostra link não permitido |
| Histórico | Details fechado por padrão; revisões resolvidas, de outras versões e com vínculo a confirmar em grupos próprios, sem virar revisão vigente |
| Avisos da peça | Quantidade de aviso(s) de dados nesta peça e link ver na Planilha, com plural correto e sem separador pendurado; aba/linha/campo permanecem na API |
| Documentos da semana | Uma seção no fim do dia; cada semana representada tem Plano/Redação/Visual uma vez, com — para ausentes, inclusive sem semana identificada |

O botão de fechar usa `dialog.close`; Esc usa o comportamento nativo. O evento `close` devolve o foco ao acionador se ele continuar no DOM. `summary` recebe foco visível e pode alternar o acordeão por teclado. Em desktop a gaveta fica à direita, com largura máxima de 520 px; abaixo de 720 px ocupa a tela inteira, com corpo de rolagem própria. O calendário/lista por trás não recebe um segundo recorte dos dados. O link dos avisos fecha a gaveta, abre Produções na Planilha e dá rolagem/foco ao painel detalhado da peça; Origem conserva a falha ativa e o contador geral, com os motivos somente no painel.

Publicação preenchida permanece como registro explícito e conserva o valor original. Quando formato/fuso são inválidos ou o instante excede o fim da captura, a projeção acrescenta um aviso localizado em `publicado_em`; a gaveta conserva o registro e resume a quantidade de avisos, sem verificar publicação remotamente. Campo vazio omite a linha, sem comprovar publicação. IDs de escopo/revisão e seus valores completos continuam na API, sem rótulos técnicos na linha visual. A API ainda conserva `detalhes.responsavelRegistrado='A confirmar'` quando vazio, mas a faixa usa `responsavel_atual` e omite esse campo vazio.

`resumoPeca` conta somente páginas/cenas vigentes e diferencia revisão: **revisão aberta** quando existe vigente; sem vigente, **revisão a confirmar** quando existe ambígua ou anterior não resolvida; **sem revisão** quando não existe ou há somente resolvidas. Contagens usam singular/plural em página, cena e aviso. `revisaoLinha` apresenta, por exemplo, **Revisar · versão 2 — motivo**, com **Corrige: pessoa · tratamento** abaixo; decisão desconhecida conserva o original. Acordeões adicionais usam **+1 revisão aberta** ou **+N revisões abertas**, sem inferir atividade de agente.

`arquivosDaUnidade` usa `avisoMidia` da cena para mostrar no máximo um aviso humano por linha: imagens ausentes, imagem inicial/final ausente e/ou vídeo ausente. Arquivo ligado sem URL segura mostra **link não permitido**, preservando a distinção entre ausência de mídia e recusa de link. Quando coexistem, as mensagens se unem na mesma faixa, sem repetir avisos por slot. Página conserva aviso genérico para arquivo ausente; registro presente não vira ausente só por ter URL recusada. Isso não transforma registro em bytes comprovados. Avisos técnicos agregados da cena e demais validações continuam na API, não no texto da gaveta.

`etapaLegivel` usa nove rótulos de apresentação: arte_aprovada → Arte aprovada; prompts_imagem_prontos → Prompts de imagem prontos; imagens_em_producao → Imagens em produção; voz_pronta_para_gerar → Voz pronta para gerar; voz_em_producao → Voz em produção; clipes_prontos_para_gerar → Clipes prontos para gerar; clipes_em_producao → Clipes em produção; montagem_pronta → Montagem pronta; montagem_em_producao → Montagem em produção. Desconhecido conserva exatamente o texto; não decide coluna nem altera o original da API. `cartao(p)` sempre cria botão que abre o dia, sem parâmetro de modo inativo.

`urlAutorizada` transforma em link somente HTTPS nos hosts exatos `drive.google.com` ou `docs.google.com`, sem usuário/senha na URL. Um link abre somente por clique em aba separada, com `noopener noreferrer`; URL recusada nunca é ecoada como texto bruto. Antes do HTTP, a projeção já suprime userinfo de Arquivos.url/Produções.url_video_final usando new URL, com aviso fixo sem o valor; URL não vazia malformada também é suprimida e vazio/somente espaços permanece sem aviso de URL inválida. Registros não carregam imagem, iframe, vídeo ou arquivo remotamente. Textos são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. CSS fornece foco visível e breakpoint de 720 px; body acompanha a altura da página e a sidebar desktop mantém o fundo até o fim.

A projeção preserva a frase legítima e substitui somente o pedaço HTTP(S) separado por espaços em branco que `new URL` identifica com usuário/senha, conservando espaços e pontuação de contorno. Em texto livre, não promete detectar outros esquemas, URLs relativas ou credenciais fora desse pedaço; campos de URL dedicados mantêm seu guarda. JSON é dado: só tokens de string redigidos são reserializados, e o restante dos bytes permanece. Avisos já globais dos registros relacionados são incorporados ao resumo/contador da peça; detalhes técnicos permanecem fora da gaveta. Em Texto registrado, Página/Cena e número/versão identificam a unidade sem expor seu ID técnico na apresentação.

## Verificação e limites

[tests/interface.test.cjs](../../tests/interface.test.cjs) usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`, servidor loopback e dados/configuração em TEMP. Bloqueia e registra qualquer requisição fora da origem local e erros do navegador. Os casos de interface verificam os nove cenários de US1 (menu, objetivo, calendário/lista/filtros, sem data, 390/1440, ausência real, remarcação, rótulos, título, semanas úteis e sidebar), os quatro estados do selo nas três telas e clique até Planilha, mais releitura/recuperação em 390 px. Conferem fonte/fim/cobertura, preservação de falha/horário/ponteiro, nova captura, 503 sem apagar visão e GET local; atualização exige POST local + GET.

As regressões também cobrem primeira carga falhando com filtros seguros, botão desabilitado enquanto GET não responde e link Sem data oculto quando zero. Os cenários U05–U06 verificam dia completo apesar do filtro, segunda peça, dia vazio, primeira seção aberta, versões de página/cena, revisão vigente separada, ausência/registro de arquivo, texto malicioso como dado, conjunto exato de links seguros, tela cheia mobile e Esc com foco devolvido. A revisão compacta acrescenta asserts dos recolhidos e +N, campos vazios omitidos, etapas conhecidas/desconhecidas, ausência de faixas/documentos repetidos, máximo de um aviso por linha, ocultação de aviso técnico com link funcional até Planilha, corte horizontal em 1440 e contador de acionamentos para abrir o dia/segunda peça. URLs com credenciais sintéticas não aparecem no JSON real nem em #dia. Os resultados ficam exclusivamente na validação, sem inferir captura operacional a partir de fixture.

Com `CI=true`, os casos de interface declaram SKIP antes de carregar Playwright; fora do CI, ferramenta ausente falha. A aplicabilidade dos pulos UI/PowerShell no Linux e a UI fora do LCOV permanecem pendência M8; a CLI está coberta. Estado e evidências somente na [validação](../../specs/001-consulta-local-producao/validacao.md); as [screenshots](../design/screenshots/LEIA-ME.md) usam apenas fixtures fictícias.

As verificações da US5 cobrem as seis abas, cabeçalhos/contagens, Histórico confirmado com motivo legível, teclado/foco, releitura com seleção preservada, avisos por peça e restauração dos gerais, Origem com falha/contador e atalho desde Histórico, consolidação de mídia no painel, subtítulo próprio, rolagem em 390/1440 e células de URL dedicada recusadas sem navegação. Estado, resultados e limites ficam somente na validação.

Pegadinhas: trocar o tamanho da janela depois de iniciar não recalcula o modo inicial; a escolha é feita por matchMedia no carregamento. Busca por ID usa a coleção em memória e sem paginação; a escala sintética foi verificada e seus limites ficam na validação. A Planilha herda a normalização null→string vazia dos mínimos, exceto etapa_producao; o envelope privado mantém o original. Testes locais não comprovam captura operacional ou aceite completo da feature.

## Pegadinha de uso prolongado

O selo é calculado no último GET. Se a página atravessar a meia-noite de São Paulo aberta, só muda ao clicar **Atualizar dados** ou recarregar. Não há timer, polling ou releitura automática nesta US2; essa limitação fica registrada para o aceite completo.

## Atualização da 002

atualizar envia somente JSON vazio à API local; não conhece chave, token ou ID da fonte. O servidor decide configuração privada. Mensagens de POST preservadas, inclusive quando GET posterior falha; aviso de liberação usa texto fixo sem transformar o resultado original. Dados/filtros/aba permanecem na falha, e finally libera o botão. Testes em [atualizacao-interface.test.cjs](../../tests/atualizacao-interface.test.cjs); seis screenshots sintéticos e limites na [validação da 002](../../specs/002-consulta-planilhas/validacao.md).

Recusas temporais diretas mostram motivo próprio no status da atualização e no Histórico; `motivoHistorico` aceita somente os dois textos fixos novos além dos motivos legados. Os casos sintéticos em 1440/390 verificam captura/data preservadas e a mesma mensagem nas duas apresentações.
