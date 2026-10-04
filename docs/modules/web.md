# Interface de Planejamento

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

Estado em 04/10/2026: T018/US1 implementada; arquivos [index.html](../../src/web/index.html), [app.js](../../src/web/app.js) e [styles.css](../../src/web/styles.css). Fontes principais em app.js: `node` (linha 5), `abrirDia` (16), `calendario` (39), `pecaVisivel` (73), `lista` (79), `navegar` (104) e `iniciar` (124).

## Inicialização e navegação

O HTML importa somente `/styles.css` e `/app.js`; o JavaScript busca apenas `/api/visao` com cache no-store. Não há framework, imagem remota, Google ou autenticação no navegador.

| Estado/controle | Comportamento atual |
| --- | --- |
| Mês inicial | Mês civil de hoje em America/Sao_Paulo |
| Desktop | Calendário inicial, grade de 42 dias iniciando na segunda-feira |
| Até 720 px | Lista inicial, menu recolhido; seletor visual Calendário/Lista fica oculto |
| Menu | Exatamente Planejamento, Produção e Planilha |
| Produção / Planilha | Mensagens explícitas de próxima entrega |
| Filtros | Todos, Imagem, Carrossel e Reels, com aria-pressed |
| Mês anterior/próximo | Troca somente o mês apresentado |
| Selo | Texto/cor da API; clique abre Planilha, ainda sem quatro estados |
| Erro de consulta | Mensagem local e Consulta indisponível; controles continuam desabilitados |
| Captura ausente | Peça a primeira leitura à Central, sem fallback fictício |
| Objetivo mensal | Ainda não definido, sem botão Plano do mês |

Botões existentes são desabilitados durante a carga. Após sucesso, handlers são instalados e a tela Planejamento é exibida. A carga atual faz uma única consulta; botão Atualizar dados será US2.

## Calendário, lista e Sem data

O cartão mostra somente formato, título e status registrados, com rótulos de ausência. Tema aparece no início da semana. Para múltiplas peças, apresenta o primeiro cartão de formato selecionado e **+N no dia**. Clicar cartão, dia ou contador abre todas as peças desse dia, sem aplicar o filtro de formato ao grupo.

A lista agrupa pelo tema/período da semana de origem. `pecaVisivel` considera a data civil da peça no mês escolhido; conserva também peças dentro do período de uma semana que cruza aquele mês. Peça remarcada para outro mês aparece no novo mês sem mudar sua semana registrada. Sem data permanece acessível independentemente do mês; filtro de formato continua valendo na lista comum.

**N sem data** conta globalmente a captura NTV e abre lista dedicada por semana, sem filtro de mês/formato. O total **peças registradas** também é global, não a quantidade visível naquele filtro.

## Dia básico, texto e acessibilidade

O diálogo nativo recebe título de data/sem data, quantidade e cartões de todas as peças do grupo. Cartões dentro dele são articles sem nova ação de abertura. O botão fecha o dialog; a apresentação mobile ocupa a tela. Detalhes, relações, revisão, acordeões e aceite completo de teclado/Esc/foco permanecem em T023–T026: não inferir US3 aceita desta abertura básica.

Textos de captura são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. Não há links operacionais ou miniaturas nesta entrega; regras de links autorizados serão exercitadas com US3. CSS fornece foco visível, layout responsive e breakpoint de 720 px.

## Verificação e limites

[tests/interface.test.cjs](../../tests/interface.test.cjs) usa Playwright existente por `CRM_PLAYWRIGHT_MODULE`, servidor loopback e dados/configuração em TEMP. Bloqueia e registra qualquer requisição fora da origem local e erros do navegador. Cinco casos atuais verificam menu, objetivo, calendário/lista/filtros, sem data, 390/1440, ausência real e peça remarcada para outro mês.

Com `CI=true`, os cinco casos declaram SKIP explícito antes de carregar Playwright; fora do CI, ferramenta ausente falha. Linux ainda aguarda PR, sem comprovar a interface. Evidência executada e limites em [validacao.md](../../specs/001-consulta-local-producao/validacao.md); [screenshots](../design/screenshots/LEIA-ME.md) são da aplicação com fixture fictícia.

Pegadinhas: trocar o tamanho da janela depois de iniciar não recalcula o modo inicial; a escolha é feita por matchMedia no carregamento. Busca por ID usa a coleção em memória e sem paginação; cenário final de 500 peças ainda não foi executado. Aparência e cinco testes de US1 não comprovam quatro estados, detalhes, quadro, tabelas ou integração operacional.
