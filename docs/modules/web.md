# Interface de Planejamento e gaveta do dia

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

Planejamento, frescor/releitura e gaveta implementados até T026/US3; estado e evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Arquivos: [index.html](../../src/web/index.html), [app.js](../../src/web/app.js) e [styles.css](../../src/web/styles.css). Fontes em app.js: `abrirDia` (linha 21), `urlAutorizada` (41), `secaoUnidades` (76), `secaoRevisoes` (92), `acordeaoPeca` (115), `calendario` (153), `lista` (196), `render` (209), `controles` (232), `detalhesCaptura` (247) e `reler` (260).

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
| Produção | Mensagem explícita de próxima entrega do quadro |
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

## Gaveta do dia, texto e acessibilidade

O diálogo nativo recebe título de data/sem data, quantidade e **todas** as peças do grupo. `abrirDia` guarda o elemento que abriu o detalhe e gera um `details` por peça, em ordem ordinal de ID; só a primeira seção começa aberta. O filtro de formato do calendário/lista não é reaplicado ao dia. Um dia vazio mostra **Nenhuma peça registrada neste dia**, sem acordeão fictício; Sem data conserva o grupo da própria semana.

| Seção da peça | Conteúdo real |
| --- | --- |
| Cabeçalho do acordeão | Formato, título e rótulo de status registrado |
| Identificação | Etapa, responsável registrado, data prevista, versão e publicação explícita ou Não comprovada |
| Textos registrados | Legenda como texto, sem HTML executável |
| Revisão vigente | Decisão, motivo, versão avaliada, quem corrige, tratamento e IDs originais de Página/Cena/Arquivo; correção separada do responsável da produção |
| Páginas / Cenas | Versão vigente primeiro; outras versões em histórico recolhido, com impacto atual a confirmar; índice em ordem dentro da versão |
| Página | Título, corpo, função, versão e Design novo: A confirmar; arquivos dos ponteiros |
| Cena | Texto, texto na tela, início/duração registrados e arquivos dos ponteiros |
| Arquivos · registros | Nome de apresentação, versão e registro; ausência explícita, sem miniatura substituta |
| Revisões adicionais | Resolvidas, de outras versões e com vínculo a confirmar em seções separadas/cinza, sem virar revisão vigente |
| Documentos da semana / Avisos | Plano/Redação/Visual vinculados e avisos `aba · linha física · campo: motivo`, sem escolher substituto |

O botão de fechar usa `dialog.close`; Esc usa o comportamento nativo. O evento `close` devolve o foco ao acionador se ele continuar no DOM. `summary` recebe foco visível e pode alternar o acordeão por teclado. Em desktop a gaveta fica à direita, com largura máxima de 640 px; abaixo de 720 px ocupa a tela inteira, com corpo de rolagem própria. O calendário/lista por trás não recebe um segundo recorte dos dados.

Publicação preenchida permanece como registro explícito e conserva o valor original. Quando formato/fuso são inválidos ou o instante excede o fim da captura, a projeção acrescenta um aviso localizado em `publicado_em`; a gaveta mostra esse aviso junto ao registro, sem mudar para Não comprovada ou verificar publicação remotamente. Campo vazio continua Não comprovada. IDs vazios de escopo de revisão usam Não informado; ID registrado não recebe descrição inventada.

`urlAutorizada` transforma em link somente HTTPS nos hosts exatos `drive.google.com` ou `docs.google.com`, sem usuário/senha na URL. Um link abre somente por clique em aba separada, com `noopener noreferrer`; URL fora da regra permanece texto. Registros não carregam imagem, iframe, vídeo ou arquivo remotamente. Textos são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. CSS fornece foco visível e breakpoint de 720 px; body acompanha a altura da página e a sidebar desktop mantém o fundo até o fim.

## Verificação e limites

[tests/interface.test.cjs](../../tests/interface.test.cjs) usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`, servidor loopback e dados/configuração em TEMP. Bloqueia e registra qualquer requisição fora da origem local e erros do navegador. Os casos de interface verificam os nove cenários de US1 (menu, objetivo, calendário/lista/filtros, sem data, 390/1440, ausência real, remarcação, rótulos, título, semanas úteis e sidebar), os quatro estados do selo nas três telas e clique até Planilha, mais releitura/recuperação em 390 px. Conferem fonte/fim/cobertura, preservação de falha/horário/ponteiro, nova captura, 503 sem apagar visão e apenas GET local.

As regressões também cobrem primeira carga falhando com filtros seguros, botão desabilitado enquanto GET não responde e link Sem data oculto quando zero. Os cenários U05–U06 verificam dia completo apesar do filtro, segunda peça, dia vazio, primeira seção aberta, versões de página/cena, revisão vigente separada, ausência/registro de arquivo, texto malicioso como dado, allowlist de links, tela cheia mobile e Esc com foco devolvido. Os resultados ficam exclusivamente na validação, sem inferir captura operacional a partir de fixture.

Com `CI=true`, os casos de interface declaram SKIP antes de carregar Playwright; fora do CI, ferramenta ausente falha. A aplicabilidade dos pulos e a UI fora do LCOV permanecem pendência M8. Estado e evidências somente na [validação](../../specs/001-consulta-local-producao/validacao.md); as [screenshots](../design/screenshots/LEIA-ME.md) usam apenas fixtures fictícias.

Pegadinhas: trocar o tamanho da janela depois de iniciar não recalcula o modo inicial; a escolha é feita por matchMedia no carregamento. Busca por ID usa a coleção em memória e sem paginação; cenário final de 500 peças ainda não foi executado. Testes locais de US1/US2/US3 não comprovam quadro, tabelas ou integração operacional.

## Pegadinha de uso prolongado

O selo é calculado no último GET. Se a página atravessar a meia-noite de São Paulo aberta, só muda ao clicar **Atualizar dados** ou recarregar. Não há timer, polling ou releitura automática nesta US2; essa limitação fica registrada para o aceite completo.
