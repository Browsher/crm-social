# Interface de Planejamento, gaveta do dia e Produção

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

Planejamento, frescor/releitura, gaveta e Produção implementados até T030/US4; estado e evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Arquivos: [index.html](../../src/web/index.html), [app.js](../../src/web/app.js) e [styles.css](../../src/web/styles.css). Fontes em app.js: `abrirDia` (linha 21), `plural` (33), `fatosPeca` (39), `urlAutorizada` (52), `arquivosDaUnidade` (72), `secaoUnidades` (99), `secaoRevisoes` (115), `revisaoLinha` (128), `textosRegistrados` (140), `documentosDoDia` (150), `resumoPeca` (165), `avisosPeca` (172), `acordeaoPeca` (179), `cartao` (196), `calendario` (211), `abrirDiaDaPeca` (245), `semanasQuadro` (249), `semanaDoQuadro` (253), `pendenciaQuadro` (261), `cartaoQuadro` (270), `colunaQuadro` (281), `renderProducao` (288), `trocarSemana` (301), `lista` (312), `render` (325), `controles` (348) e `detalhesCaptura` (365).

## Inicialização e navegação

O HTML importa somente `/styles.css` e `/app.js`; o JavaScript busca apenas `/api/visao` com cache no-store. Não há framework, imagem remota, Google ou autenticação no navegador.

| Estado/controle | Comportamento atual |
| --- | --- |
| Mês inicial | Mês civil de hoje em America/Sao_Paulo |
| Título do mês | Somente inicial maiúscula, preposição minúscula: Outubro de 2026; sem text-transform capitalize |
| Desktop | Calendário inicial, semanas completas de segunda a domingo que contêm ao menos um dia do mês, sem uma sexta semana fixa |
| Sidebar desktop | Ocupa a altura da página inteira, inclusive além da área visível; no mobile permanece menu fixo/recolhido |
| Até 720 px | Lista inicial, menu recolhido; seletor visual Calendário/Lista fica oculto |
| Menu | Exatamente Planejamento, Produção e Planilha |
| Produção | Quadro por semana/tema, setas, oito colunas/vazias, pendências e Outras com título/contador da API |
| Planilha | Fonte, fim em São Paulo, cobertura semanal, motivos resumidos dos avisos e botão de releitura; seis tabelas/Histórico futuros |
| Filtros | Todos, Imagem, Carrossel e Reels, com aria-pressed |
| Mês anterior/próximo | Troca somente o mês apresentado |
| Selo | Quatro textos/cores contratuais da API em todas as telas; clique abre Planilha |
| Atualizar dados | GET /api/visao com cache no-store; somente o botão fica desabilitado durante a consulta |
| Erro de consulta | Mensagem local; visão/selo já carregados são preservados e botão é liberado; sem visão anterior mostra Consulta indisponível |
| Captura ausente | Peça a primeira leitura à Central, sem fallback fictício |
| Objetivo mensal | Ainda não definido, sem botão Plano do mês |

Os handlers são instalados uma vez antes da primeira consulta, com Planejamento como tela inicial. `reler` consulta a API, atualiza `state.view` após uma resposta bem-sucedida e renderiza sem trocar a tela escolhida. O botão é liberado em `finally`, inclusive após 503, permitindo nova tentativa. Sem visão anterior, `render` retorna sem acessar dados: filtros continuam seguros após a primeira falha e `#erro` fica visível junto a **Consulta indisponível**. Abrir ou reler não grava/importa captura nem consulta Google.

Em Planilha, `detalhesCaptura` mostra **Captura pela Central**, fim da captura formatado em `America/Sao_Paulo` e período civil das semanas; sem esses dados usa **Sem captura disponível** e **Cobertura não disponível**. Motivos dos avisos são deduplicados e aplicados como texto em `role=status`. O aviso de última importação falha permanece junto aos dados da última captura válida. O selo segue ausência, falha ativa, hoje ou outro dia calculados na projeção; GET/no-op não renovam horário nem encerram a falha.

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

Cartão apresenta formato, data/**Sem data**, título, status informativo e **Com quem está** registrado (vazio **A confirmar**); Outras conserva etapa original (vazio **Não informada**). Primeira pendência mostra motivo humano e **Corrige** separado quando registrado, com **+N pendências** para as demais completas na API. Registro de arquivo na versão atual com URL vazia/recusada não vira mídia ausente.

Grid preserva oito colunas em ordem: quatro em 1440 px, duas até 1100 px e uma até 720 px. Cartões são botões com foco/teclado; clique abre o dia inteiro ou Sem data da semana, sem arrastar/editar. [tests/interface.test.cjs](../../tests/interface.test.cjs) cobre semana/tema, vazias, Outras/contador, responsáveis/pendências, teclado e clique em 390/1440; resultados somente na validação.

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

O botão de fechar usa `dialog.close`; Esc usa o comportamento nativo. O evento `close` devolve o foco ao acionador se ele continuar no DOM. `summary` recebe foco visível e pode alternar o acordeão por teclado. Em desktop a gaveta fica à direita, com largura máxima de 520 px; abaixo de 720 px ocupa a tela inteira, com corpo de rolagem própria. O calendário/lista por trás não recebe um segundo recorte dos dados. O link dos avisos fecha a gaveta, abre Planilha e conserva um destino de foco no selo; a página atual apresenta motivos resumidos, com tabelas detalhadas reservadas à US5.

Publicação preenchida permanece como registro explícito e conserva o valor original. Quando formato/fuso são inválidos ou o instante excede o fim da captura, a projeção acrescenta um aviso localizado em `publicado_em`; a gaveta conserva o registro e resume a quantidade de avisos, sem verificar publicação remotamente. Campo vazio omite a linha, sem comprovar publicação. IDs de escopo/revisão e seus valores completos continuam na API, sem rótulos técnicos na linha visual. A API ainda conserva `detalhes.responsavelRegistrado='A confirmar'` quando vazio, mas a faixa usa `responsavel_atual` e omite esse campo vazio.

`resumoPeca` conta somente páginas/cenas vigentes e diferencia revisão: **revisão aberta** quando existe vigente; sem vigente, **revisão a confirmar** quando existe ambígua ou anterior não resolvida; **sem revisão** quando não existe ou há somente resolvidas. Contagens usam singular/plural em página, cena e aviso. `revisaoLinha` apresenta, por exemplo, **Revisar · versão 2 — motivo**, com **Corrige: pessoa · tratamento** abaixo; decisão desconhecida conserva o original. Acordeões adicionais usam **+1 revisão aberta** ou **+N revisões abertas**, sem inferir atividade de agente.

`arquivosDaUnidade` usa `avisoMidia` da cena para mostrar no máximo um aviso humano por linha: imagens ausentes, imagem inicial/final ausente e/ou vídeo ausente. Arquivo ligado sem URL segura mostra **link não permitido**, preservando a distinção entre ausência de mídia e recusa de link. Quando coexistem, as mensagens se unem na mesma faixa, sem repetir avisos por slot. Página conserva aviso genérico para arquivo ausente; registro presente não vira ausente só por ter URL recusada. Isso não transforma registro em bytes comprovados. Avisos técnicos agregados da cena e demais validações continuam na API, não no texto da gaveta.

`etapaLegivel` usa nove rótulos de apresentação: arte_aprovada → Arte aprovada; prompts_imagem_prontos → Prompts de imagem prontos; imagens_em_producao → Imagens em produção; voz_pronta_para_gerar → Voz pronta para gerar; voz_em_producao → Voz em produção; clipes_prontos_para_gerar → Clipes prontos para gerar; clipes_em_producao → Clipes em produção; montagem_pronta → Montagem pronta; montagem_em_producao → Montagem em produção. Desconhecido conserva exatamente o texto; não decide coluna nem altera o original da API. `cartao(p)` sempre cria botão que abre o dia, sem parâmetro de modo inativo.

`urlAutorizada` transforma em link somente HTTPS nos hosts exatos `drive.google.com` ou `docs.google.com`, sem usuário/senha na URL. Um link abre somente por clique em aba separada, com `noopener noreferrer`; URL recusada nunca é ecoada como texto bruto. Antes do HTTP, a projeção já suprime userinfo de Arquivos.url/Produções.url_video_final usando new URL, com aviso fixo sem o valor; URL não vazia malformada também é suprimida e vazio/somente espaços permanece sem aviso de URL inválida. Registros não carregam imagem, iframe, vídeo ou arquivo remotamente. Textos são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. CSS fornece foco visível e breakpoint de 720 px; body acompanha a altura da página e a sidebar desktop mantém o fundo até o fim.

A projeção preserva a frase legítima e substitui somente o pedaço HTTP(S) separado por espaços em branco que `new URL` identifica com usuário/senha, conservando espaços e pontuação de contorno. Em texto livre, não promete detectar outros esquemas, URLs relativas ou credenciais fora desse pedaço; campos de URL dedicados mantêm seu guarda. JSON é dado: só tokens de string redigidos são reserializados, e o restante dos bytes permanece. Avisos já globais dos registros relacionados são incorporados ao resumo/contador da peça; detalhes técnicos permanecem fora da gaveta. Em Texto registrado, Página/Cena e número/versão identificam a unidade sem expor seu ID técnico na apresentação.

## Verificação e limites

[tests/interface.test.cjs](../../tests/interface.test.cjs) usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`, servidor loopback e dados/configuração em TEMP. Bloqueia e registra qualquer requisição fora da origem local e erros do navegador. Os casos de interface verificam os nove cenários de US1 (menu, objetivo, calendário/lista/filtros, sem data, 390/1440, ausência real, remarcação, rótulos, título, semanas úteis e sidebar), os quatro estados do selo nas três telas e clique até Planilha, mais releitura/recuperação em 390 px. Conferem fonte/fim/cobertura, preservação de falha/horário/ponteiro, nova captura, 503 sem apagar visão e apenas GET local.

As regressões também cobrem primeira carga falhando com filtros seguros, botão desabilitado enquanto GET não responde e link Sem data oculto quando zero. Os cenários U05–U06 verificam dia completo apesar do filtro, segunda peça, dia vazio, primeira seção aberta, versões de página/cena, revisão vigente separada, ausência/registro de arquivo, texto malicioso como dado, conjunto exato de links seguros, tela cheia mobile e Esc com foco devolvido. A revisão compacta acrescenta asserts dos recolhidos e +N, campos vazios omitidos, etapas conhecidas/desconhecidas, ausência de faixas/documentos repetidos, máximo de um aviso por linha, ocultação de aviso técnico com link funcional até Planilha, corte horizontal em 1440 e contador de acionamentos para abrir o dia/segunda peça. URLs com credenciais sintéticas não aparecem no JSON real nem em #dia. Os resultados ficam exclusivamente na validação, sem inferir captura operacional a partir de fixture.

Com `CI=true`, os casos de interface declaram SKIP antes de carregar Playwright; fora do CI, ferramenta ausente falha. A aplicabilidade dos pulos e a UI fora do LCOV permanecem pendência M8. Estado e evidências somente na [validação](../../specs/001-consulta-local-producao/validacao.md); as [screenshots](../design/screenshots/LEIA-ME.md) usam apenas fixtures fictícias.

Pegadinhas: trocar o tamanho da janela depois de iniciar não recalcula o modo inicial; a escolha é feita por matchMedia no carregamento. Busca por ID usa a coleção em memória e sem paginação; cenário final de 500 peças ainda não foi executado. Testes locais de US1/US2/US3/US4 não comprovam tabelas/Histórico, escala final ou integração operacional.

## Pegadinha de uso prolongado

O selo é calculado no último GET. Se a página atravessar a meia-noite de São Paulo aberta, só muda ao clicar **Atualizar dados** ou recarregar. Não há timer, polling ou releitura automática nesta US2; essa limitação fica registrada para o aceite completo.
