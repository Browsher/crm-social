# Interface de Planejamento

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

Estado em 04/10/2026: T018/US1 e T022/US2 implementadas e testadas localmente, com ajustes de apresentação e regressões do PR #6; arquivos [index.html](../../src/web/index.html), [app.js](../../src/web/app.js) e [styles.css](../../src/web/styles.css). Fontes principais em app.js: `node` (linha 5), `statusLegivel` (17), `abrirDia` (20), `calendario` (43), `pecaVisivel` (80), `lista` (86), `render` (99), `navegar` (113), `detalhesCaptura` (135) e `reler` (148).

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

Os handlers são instalados uma vez antes da primeira consulta, com Planejamento como tela inicial. `reler` consulta a API, atualiza `state.view` após uma resposta bem-sucedida e renderiza sem trocar a tela escolhida. O botão é liberado em `finally`, inclusive após 503, permitindo nova tentativa. Abrir ou reler não grava/importa captura nem consulta Google.

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

Valor desconhecido permanece exatamente o original, sem substituir sublinhados, normalizar ou aplicar capitalização geral; vazio usa **Estado não informado**. O mapa é somente de texto em calendário, lista e diálogo básico: não determina etapa, prontidão ou publicação comprovada.

Tema aparece no início da semana. Para múltiplas peças, apresenta o primeiro cartão de formato selecionado e **+N no dia**. Clicar cartão, dia ou contador abre todas as peças desse dia, sem aplicar o filtro de formato ao grupo. A grade começa na segunda-feira da primeira semana que contém o dia 1 e termina no domingo da última semana que contém dia do mês; pode ter 28, 35 ou 42 células conforme o calendário.

A lista agrupa pelo tema/período da semana de origem. `pecaVisivel` considera a data civil da peça no mês escolhido; conserva também peças dentro do período de uma semana que cruza aquele mês. Peça remarcada para outro mês aparece no novo mês sem mudar sua semana registrada. Sem data permanece acessível independentemente do mês; filtro de formato continua valendo na lista comum.

**N sem data** conta globalmente a captura NTV e abre lista dedicada por semana, sem filtro de mês/formato. O total **peças registradas** também é global, não a quantidade visível naquele filtro.

## Dia básico, texto e acessibilidade

O diálogo nativo recebe título de data/sem data, quantidade e cartões de todas as peças do grupo. Cartões dentro dele são articles sem nova ação de abertura. O botão fecha o dialog; a apresentação mobile ocupa a tela. Detalhes, relações, revisão, acordeões e aceite completo de teclado/Esc/foco permanecem em T023–T026: não inferir US3 aceita desta abertura básica.

Textos de captura são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. Não há links operacionais ou miniaturas nesta entrega; regras de links autorizados serão exercitadas com US3. CSS fornece foco visível, layout responsivo e breakpoint de 720 px. Em `styles.css:3/14`, body tem altura mínima da janela e a sidebar desktop usa posição absoluta para acompanhar toda a página; o breakpoint mobile usa posição fixa.

## Verificação e limites

[tests/interface.test.cjs](../../tests/interface.test.cjs) usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`, servidor loopback e dados/configuração em TEMP. Bloqueia e registra qualquer requisição fora da origem local e erros do navegador. Os 14 casos atuais verificam os nove cenários de US1 (menu, objetivo, calendário/lista/filtros, sem data, 390/1440, ausência real, remarcação, rótulos, título, semanas úteis e sidebar), os quatro estados do selo nas três telas e clique até Planilha, mais releitura/recuperação em 390 px. Conferem fonte/fim/cobertura, preservação de falha/horário/ponteiro, nova captura, 503 sem apagar visão e apenas GET local.

Com `CI=true`, os 14 casos declaram SKIP explícito antes de carregar Playwright; fora do CI, ferramenta ausente falha. As correções do [PR #6](https://github.com/Browsher/crm-social/pull/6) tiveram CI/review verdes e foram integradas em `19e222a`; gate Linux e review da US2 conferidos no PR #8/head `7657d9e`, que permanece aberto. A aplicabilidade dos SKIP e a UI fora do LCOV permanecem pendência M8 da revisão. Evidência local executada e limites em [validacao.md](../../specs/001-consulta-local-producao/validacao.md); [screenshots](../design/screenshots/LEIA-ME.md) são da aplicação com fixture fictícia.

Pegadinhas: trocar o tamanho da janela depois de iniciar não recalcula o modo inicial; a escolha é feita por matchMedia no carregamento. Busca por ID usa a coleção em memória e sem paginação; cenário final de 500 peças ainda não foi executado. Testes locais de US1/US2 não comprovam detalhes, quadro, tabelas ou integração operacional.

## Pegadinha de uso prolongado — PR #8/M-b

O selo é calculado no último GET. Se a página atravessar a meia-noite de São Paulo aberta, só muda ao clicar **Atualizar dados** ou recarregar. Não há timer, polling ou releitura automática nesta US2; essa limitação fica registrada para o aceite completo.
