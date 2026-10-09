# Interface de Planejamento, Produção e Publicar

Como uma agenda mensal com cartões e páginas semanais, a interface permite localizar uma peça e abrir seu dia. Ela mostra a captura recebida pela API local.

## Layout v3 — Parte A integrada; Parte B vigente localmente

Como páginas de uma agenda, Semana e Mês localizam peças, Produção acompanha projetos e Publicar reúne o material para a publicação manual. A integrada pelo PR #24; B implementada/testada localmente, não integrada; [validação](../../specs/006-layout-v3/validacao.md). As seções históricas 001–005 abaixo preservam dados/provas e identificam a apresentação substituída.

index.html carrega /theme.js antes do CSS; os scripts defer seguem layout-model → perfil-config → instagram → app. app.js usa [dez funções puras](layout-model.md), mantendo DOM, atualização e gaveta. [instagram.js](instagram.md) cuida do dialog/navegação/foco, e [perfil-config.js](perfil-config.md) fornece somente o nome sintético público.

| Controle | Comportamento vigente |
| --- | --- |
| Entrada/menu | Semana padrão; Planejamento, Produção e Publicar, contador acessível da fila integral. Planilha/tabelas/Histórico técnico/atalhos removidos da interface; dados permanecem na API. |
| Atualização | ⟳ Atualizar único: POST {} e GET posterior, desabilitado até ambos terminarem; selo indicador e feedback acessível. Na prévia aberta, os mesmos nós são movidos ao dialog e restaurados ao fechar. Falha/no-op conservam dados/horário/falha ativa. |
| Objetivo/pautas | Uma linha, nome completo acessível, botão aria-expanded e painel hidden sem espaço fechado. Meses permanece em view.planilha; S# · tema · modelo sem metadados de agentes, fallback textual sem estrutura inventada. |
| Semana | Sete dias, botão/data/hoje acessíveis, miniatura/formato/título/estado. Região móvel horizontal focável centrada em hoje, rolagem por semana preservada; clique abre dia inteiro. Progresso segue peças visíveis pelo filtro de formato. |
| Mês | Altura disponível, sete dias por linha, ponto colorido e tipo curto: Imagem → Oferta, Carrossel/Reels; alias somente visual. Rótulos completos em 390; nome acessível inclui peças/data/estado. Clique/Enter/Espaço abre semana, inclusive vazia; não carrega imagens. |
| Períodos | Alternar Semana/Mês conserva a semana; setas de Mês usam a primeira linha, abrir borda preserva mês; Semana preserva mês enquanto houver interseção, depois usa quinta-feira. Ativar pauta usa seu mês. Não deduz vínculo confirmado por tema/data. |
| Produção | Projetos da semana registrada, atual/futuras antes de passadas; progresso Pronta/Publicada no projeto inteiro. Sem data e órfãs acessíveis; cinco passos ou motivo curto travado. Botão Ver no Instagram é irmão do botão da linha, sem botões aninhados. |
| Futuro vazio | Comparação por segunda-feira civil; cabeçalho com período e corpo somente Planejamento na sexta-feira, sem inventar tema/meta/peças. |
| Miniaturas | Primeira imagem disponível da seleção 005, caixa 4:5 contain; IntersectionObserver solicita somente peças visíveis da tela ativa pela rota local. Falha individual usa placeholder. |
| Publicar | Liberação literal liberado e publicação vazia, data civil crescente, sem data ao final; hoje destacado. Miniatura/textos, cópia local, pacote contratual seguro e prévia. Ao lado, até dez publicadas recentes e travadas com motivo simples; em 390 seguem a fila. |
| Gaveta | Dia inteiro, unidades/versões/textos, galeria/ampliação e pacote/cópia preservados; Ver no Instagram depois do bloco Pronta. Sem agentes/avisos técnicos/atalhos Planilha. A abertura resolve ID na vista atual, não reusa objeto antigo após atualizar. |
| Prévia | Mesmo dialog em Produção/Publicar/gaveta; página sem prévia permanece no contador. Setas/pontos/←→/arrasto, Esc/foco, 4:5 contain. Releitura mantém mesma peça/versão nova, limita índice; remoção fecha/restaura foco, falha conserva. |

renderPlanilha, celulaPlanilha, detalhesCaptura e atalhos foram removidos. Principais integrações: renderPublicar, textosPublicacao, acoesPublicacao, botaoInstagram, renderProducao/projetoSemana, semanaPlanejamento, calendario, objetivoMensal e abrirDia/acordeaoPeca. A data inválida em publicação recente usa **Data de publicação a confirmar**, sem normalizar dia impossível; publicação preenchida continua fora da fila.

LCOV não inclui app/theme/instagram/perfil-config; layout-model e geradores sintéticos são medidos. Playwright verifica 1440/390, temas, foco/teclado/contraste, conteúdo literal e invariância; CI Linux mantém pulos UI/PowerShell na dívida M8. [20 screenshots da B](../design/screenshots/LEIA-ME.md#006--layout-v3-parte-b), [12 históricos da A](../design/screenshots/LEIA-ME.md#006--layout-v3-parte-a); gate local não substitui CI/review no head final.

## Inicialização e navegação — histórico 001–005

O HTML carrega `/theme.js` de forma síncrona antes de `/styles.css`, seguido de `/app.js` com defer; o aplicativo consulta GET /api/visao e atualiza por POST /api/atualizar; depois faz GET com cache no-store. A 005 acrescenta imagens solicitadas somente à origem local, por /api/midia/ID-interno quando a peça abre. Não há framework, comunicação direta com Google ou credencial no navegador.

| Estado/controle | Comportamento atual |
| --- | --- |
| Mês inicial | Mês civil de hoje em America/Sao_Paulo |
| Título do mês | Somente inicial maiúscula, preposição minúscula: Outubro de 2026; sem text-transform capitalize |
| Desktop | Calendário inicial, semanas completas de segunda a domingo que contêm ao menos um dia do mês, sem uma sexta semana fixa |
| Sidebar desktop | Ocupa a altura da página inteira, inclusive além da área visível; no mobile permanece menu fixo/recolhido |
| Até 720 px | Lista inicial, menu recolhido; seletor visual Calendário/Lista fica oculto |
| Menu | Exatamente Planejamento, Produção e Planilha |
| Produção | Quadro por semana/tema, setas, oito colunas/vazias, pendências e Outras com título/contador da API |
| Planilha | Fonte, fim em São Paulo, cobertura, releitura, seis abas de mínimos NTV e opcionais contratuais capturados (pauta_id, pacote_versao, hashtags, extensao), Meses/Pautas opcionais, Histórico final e painel detalhado de avisos |
| Filtros | Todos, Imagem, Carrossel e Reels, com aria-pressed |
| Mês anterior/próximo | Troca somente o mês apresentado |
| Selo | Quatro textos/cores contratuais da API em todas as telas; clique abre Planilha |
| Atualizar dados | POST {} e depois GET; botão desabilitado até o fim, mensagem curta role=status |
| Erro de consulta | Mensagem local; visão/selo já carregados são preservados e botão é liberado; sem visão anterior mostra Consulta indisponível |
| Captura ausente | Peça a primeira leitura à Central, sem fallback fictício |
| Objetivo mensal | Mês exibido em `state.mes`: objetivo de Meses definido na cor principal, Ainda não definido se ausente/vazio e A confirmar em duplicatas; pautas estruturadas válidas em linhas navegáveis ou fallback textual da 003; sem botão Plano do mês |
| Tema | Botão ao lado de Neste computador, rótulo da ação (claro → Escuro; escuro → Claro), preferência inicial do sistema e escolha manual local persistida quando armazenamento está disponível |

Os handlers são instalados uma vez antes da primeira consulta, com Planejamento como tela inicial. `reler` consulta a API, atualiza `state.view` após uma resposta bem-sucedida e renderiza sem trocar a tela escolhida. O botão é liberado em `finally`, inclusive após 503, permitindo nova tentativa. Sem visão anterior, `render` retorna sem acessar dados: filtros continuam seguros após a primeira falha e `#erro` fica visível junto a **Consulta indisponível**. GET /api/visao não grava ou consulta Google; o POST explícito inicia leitura de Sheets pelo servidor. Abrir uma peça também pode iniciar GET /api/midia para bytes do Drive, pelo servidor e sem alterar captura/recibos.

Em Planilha, `detalhesCaptura` mostra **Captura pela Central** ou **Leitura direta pelo servidor local**, fim da captura formatado em `America/Sao_Paulo` e período civil das semanas; sem esses dados usa **Sem captura disponível** e **Cobertura não disponível**. **Origem e atualização** contém somente a linha **Última importação falhou; captura anterior preservada** quando a última tentativa falhou e há captura; sem captura, usa **Última importação falhou; nenhuma captura válida disponível**. Quando há avisos gerais, mostra o link **N avisos de dados**, com singular para um. A lista de motivos fica somente no painel Aba/Linha/Campo/Motivo. O selo segue ausência, falha ativa, hoje ou outro dia calculados na projeção; GET/no-op não renovam horário nem encerram a falha.

## Tema claro e escuro

Como trocar a iluminação de uma agenda, o tema muda a apresentação e mantém os mesmos registros. Ajuste de 06/10/2026 implementado e testado localmente, sem nova feature Spec Kit, com correção da ação do botão em 07/10/2026; integrado pelo [PR #18](https://github.com/Browsher/crm-social/pull/18). Arquivos: [theme.js](../../src/web/theme.js), [index.html](../../src/web/index.html), [styles.css](../../src/web/styles.css) e classe de formato da lista em [app.js](../../src/web/app.js).

| Regra | Implementação e limite |
| --- | --- |
| Primeira visita | `matchMedia('(prefers-color-scheme: dark)')` define `document.documentElement.dataset.theme` antes do CSS; acompanha alterações do sistema enquanto não houver escolha manual |
| Escolha existente | Somente `dark`/`light` em `localStorage` na chave `crm-theme` substituem a preferência do sistema; outro conteúdo é ignorado |
| Alternância | Botão `#theme-toggle` indica a ação: no tema claro mostra **☾ Escuro**, `aria-label="Ativar tema escuro"`; no escuro mostra **☀ Claro**, `aria-label="Ativar tema claro"`. Sem `aria-pressed`; foco visível e acionamento nativo por mouse/Enter/Espaço |
| Armazenamento bloqueado | Get/set em try/catch; alternância continua funcionando e prevalece sobre alterações do sistema durante a página; sem persistência disponível, nova carga volta à preferência do sistema |
| Cores | Literais somente nos tokens de `:root` e `[data-theme=dark]`, incluindo superfícies, textos, linhas, links, foco, sombras, backdrop, selos, avisos, erro e vazios |
| Formatos | Imagem verde, carrossel âmbar, Reels roxo; calendário, lista e quadro conservam superfícies distintas nos dois temas |
| Fronteira | Preferência apenas no navegador; nenhuma escrita de captura/recibo, chamada Google ou alteração de API/dados |

O bootstrap externo síncrono mantém `script-src 'self'`, sem script inline ou relaxamento de CSP. `DOMContentLoaded` atualiza texto/aria-label da ação do botão e instala seu acionamento. O CSS usa `color-scheme` em cada tema para os controles nativos. O tema escuro tem fundo azulado `#0c1320`, superfícies `#131b2a`/`#18223a`, linhas `#233045`, texto `#e2e8f2` e apagado `#8a96aa`; mantém a marca em `#2a9f74`/`#5cc79c`. Ajustes de texto/estado no tema claro também atendem aos cenários de contraste; imagens históricas registram a paleta anterior.

[tests/tema.test.cjs](../../tests/tema.test.cjs) teve **27 PASS sem SKIP** localmente após a correção de 07/10. TDD do ajuste: quatro falhas RED pelo rótulo invertido e duas falhas RED pelo `aria-pressed` contraditório, seguidas de GREEN com texto/aria-label da ação e ausência do atributo. A suíte conserva varredura CSS com teste do próprio scanner (hex/funções/nomes, inclusive media queries), bootstrap antes do CSS/DOM, GET/HEAD protegido, primeira visita nos dois temas, Enter/Espaço e persistência em 1440/390, precedência da escolha, armazenamento bloqueado, mudanças do sistema e tema correto antes da resposta CSS. Nos cenários sintéticos, texto visível habilitado precisa de contraste mínimo **4,5:1** em Planejamento/calendário/lista/objetivo, gaveta, Produção, Planilha/Meses/Histórico, erros e ausência de captura. A aferição combina cores computadas com os fundos ancestrais; não afirma cobrir todo dado ou estado futuro. Testes de navegador usam somente TEMP, bloqueiam requisições externas e exigem ausência de erros de página. Com `CI=true`, continuam declarando SKIP de UI; essa prova local não é executada pelo CI Linux.

Gate Windows histórico de 06/10: **350 PASS**. Em 07/10, o gate final da árvore local teve **356 PASS**, incluindo **três testes preexistentes do iniciador fora do PR**; cobertura **96,3498%** (antes **98,3871%**; o LCOV passou a incluir `scripts/screenshots-tema.cjs` pelos dois testes VM, ampliando o escopo medido sem alterar o código da aplicação), complexidade PASS com **17 avisos**, baseline preservada e exit **0**. Semgrep SKIP no Windows/audit N/A; a integração posterior foi concluída pelo [PR #18](https://github.com/Browsher/crm-social/pull/18). A revisão local anterior do ajuste não encontrou Critical, Important ou Minor nos insumos examinados; o review publicado do head anterior apontou correções de documentação/limpeza sintética, atendidas na rodada descrita antes da integração.

O gerador tem [três testes próprios](../../tests/screenshots-tema.test.cjs), **3 PASS sem SKIP** localmente. Dois casos VM leem/executam `scripts/screenshots-tema.cjs` real, interrompem antes da captura e comprovam que a limpeza não remove caminho fora de TEMP ou com prefixo inválido. O CLI executa uma cópia em TEMP, gera 16 PNG com larguras 1440/390 e comprova a remoção somente do TEMP criado pelo script, preservando diretório alheio com prefixo semelhante. O CI executa os dois casos VM; o CLI com navegador declara SKIP pela pendência M8. O teste HTTP H02 passou percorrendo os quatro estáticos, inclusive `/theme.js`, com GET/HEAD e MIME correspondente. Nesta rodada não houve alteração do código de produção, PNG, configuração de CI/gate ou baseline. [Galeria de 16 screenshots sintéticos](../design/screenshots/LEIA-ME.md#tema-claro-e-escuro), regenerada por [scripts/screenshots-tema.cjs](../../scripts/screenshots-tema.cjs) com Node/Playwright existentes. Sem nova dependência, polling, alteração dos contratos de captura ou validação editorial.

## Objetivo e pautas do mês — histórico 003/004

`objetivoMensal` lê o objetivo exclusivamente de Meses em `state.view.planilha`, selecionando NTV e o `state.mes` exibido. Zero linhas mostra **Ainda não definido**; uma linha mostra objetivo textual não vazio ou esse estado. Duas ou mais linhas mostram **A confirmar** sem escolher objetivo. Número/bool não viram objetivo artificial no card; a célula completa permanece na tabela. Todos os textos são criados por `textContent`, sem execução, e o card acompanha navegação mensal e POST→GET. Os avisos ficam na Planilha.

Na 004, `pautasDoMes` seleciona e ordena por ordinal as linhas válidas recebidas em `state.view.pautas`. Havendo linhas, `listaPautas` mostra botões `S1 · tema · modelo · status`, com selo **do autor** somente para origem `autor`. Os três status contratuais têm rótulos legíveis usando `Object.hasOwn`; desconhecidos permanecem texto da fonte. Modelo/origem/status desconhecidos não inventam transição editorial. Pautas funciona sem Meses: objetivo fica **Ainda não definido**, sem bloquear a lista estruturada.

Sem pautas válidas no mês exibido, permanece o fallback completo da 003: uma linha Meses fornece pautas textuais divididas por LF/CRLF, trim e descarte das vazias, mantendo ordem/repetições, até cinco itens e **+N pautas**/**+1 pauta** restantes. Duplicata Meses não escolhe resumo; o tratamento de objetivo continua igual. O contrato externo da operação e fluxos de agentes não entram na interface.

O booleano `definido` aceita somente objetivo textual não vazio após trim e orienta conteúdo/classe. O parágrafo usa `var(--ink)` na cor principal; apenas os estados **Ainda não definido** e **A confirmar** recebem `month-placeholder`, com `var(--muted)` do tema ativo. A regra `.brief-icon` concentra `flex-shrink:0` junto dos demais estilos do ícone, sem seletor duplicado.

As regressões em 1440/390 verificam a cor ao navegar por objetivos/ausências/duplicatas, **+1 pauta**/**+2 pautas** e ausência de `.more-topics` com até cinco itens, mesmo quando objetivo/pauta contêm `+2` literal. O teste de integração confirma card e avisos de mês: outubro único, novembro duplicado nas linhas físicas 4/6, dezembro com espaços inválido na linha 8; outra marca fica fora. Essa conferência preserva o contrato recebido da API. [Gate local dos ajustes](../reports/003-ajustes-local-gate.json) e [validação](../../specs/003-planejamento-mensal/validacao.md) distinguem o código atual das rodadas anteriores de CI.

`irParaPauta` renderiza o mês da pauta e dá foco/rolagem ao destino `data-inicio-semana` correspondente no calendário ou na lista selecionada. `destinoSemana` usa `tabIndex=-1`, `role=group` e rótulo de semana; no calendário aplica-se apenas às segundas-feiras. Na lista, uma pauta sem semana capturada cria apenas um destino visual com cabeçalho **Pauta S1 de novembro · tema**, período e nenhuma peça. `pautaDestino` existe somente nesse objeto local e fornece o rótulo; não cria registro operacional nem preenche `pautaOrigem`. Origem continua exigindo o vínculo confirmado pela API. Ação funciona com mouse, Enter e Espaço e não depende de peças ou formato selecionado. `.agenda-week` tem `padding:12px` tanto antes como durante o foco, preservando o espaço interno e a geometria do grupo ao destacar a semana.

`origemPauta` mostra **Pauta S2 de novembro** somente para `pautaOrigem` confirmada pela API. Calendário/lista usam a origem da semana; a gaveta reúne uma vez cada origem das semanas representadas pelas peças. Em dia vazio, usa as origens já confirmadas das semanas capturadas cujo período abrange a data. Esse recorte por dia não associa pauta por data: o vínculo continua resolvido exclusivamente pelo backend por ID/marca/início.

Implementação e testes da 004 são locais/sintéticos; [tests/pautas-interface.test.cjs](../../tests/pautas-interface.test.cjs) confere navegação/foco sem peças, fallback, origens, órfãos, leitura/teclado da Planilha, temas e contraste. [Validação da 004](../../specs/004-pautas-planejamento/validacao.md) e [20 screenshots](../design/screenshots/LEIA-ME.md#004--pautas-no-planejamento) registram resultados e limites; entrega no [PR #20](https://github.com/Browsher/crm-social/pull/20), com entrega e integração acompanhadas no PR e merge condicionado ao gate/review do head vigente; resultados por head na validação citada.

## Calendário, lista e Sem data — apresentação histórica 001

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

`semanasComPautas` prepara o conjunto usado por `lista`, acrescentando destinos locais de pautas somente quando necessário. A lista agrupa pelo tema/período da semana de origem e conserva a ordem física recebida quando não acrescenta esses destinos. Somente ao acrescentar esses destinos sem semana capturada ordena o conjunto por início civil. Capturas antigas e a lista Sem data preservam sua ordem anterior. `pecaVisivel` considera a data civil da peça no mês escolhido; conserva também peças dentro do período de uma semana que cruza aquele mês. Peça remarcada para outro mês aparece no novo mês sem mudar sua semana registrada. Sem data permanece acessível independentemente do mês; filtro de formato continua valendo na lista comum.

**N sem data** conta globalmente a captura NTV e abre lista dedicada por semana, sem filtro de mês/formato; o link fica oculto quando N é zero. O total **peças registradas** também é global, não a quantidade visível naquele filtro.

## Produção por semana — quadro histórico substituído na Parte A

`semanasQuadro` ordena por início civil/identidade, sem período ao final. A seleção conserva escolha; na primeira carga prefere semana de hoje em São Paulo, senão última datada ou primeira disponível. Setas ficam desabilitadas nos limites; tema/período/total são da semana escolhida, sem filtro de mês/formato do Planejamento. O browser usa colunas/título/IDs/contador da API, sem recalcular mapas. Vazia mostra **Sem peças**; sem captura pede primeira leitura à Central.

Cartão apresenta formato, data/**Sem data**, título, status informativo e **Com quem está** registrado (vazio **A confirmar**); Outras conserva etapa original (vazio **Não informada**). [`pendenciaQuadro`](../../src/web/app.js) mostra **Pronta para publicar** no lugar de toda pendência do cartão Pronta. Nas demais colunas, filtra mídia na apresentação: **Mídia ausente** aparece em Mídia, Revisão, Publicada e Outras; fica oculta em Planejamento, Redação e Visual. Revisões vigentes que pedem correção continuam no resumo das demais colunas. `semanaId` está declarada no estado inicial junto aos estados da Planilha, sem redefinir a regra de seleção semanal.

Nas demais colunas, após esse filtro, a primeira pendência visível mostra **Revisão: motivo** ou o texto curto **Mídia ausente**, com **Corrige** separado quando a revisão tem responsável registrado. **+N pendências** conta somente as demais visíveis, com singular quando N=1; nenhuma visível omite o resumo inteiro. API e gaveta conservam os detalhes de mídia e revisão. Registro de arquivo na versão atual com URL vazia/recusada não vira mídia ausente. Assim, um cartão em Planejamento com revisão e mídia ausente mostra a revisão sem contar a mídia no +N; em Mídia, ambas entram no resumo e na contagem.

Grid preserva oito colunas em ordem: quatro em 1440 px, duas até 1100 px e uma até 720 px. Cartões são botões com foco/teclado; clique abre o dia inteiro ou Sem data da semana, sem arrastar/editar. [tests/interface.test.cjs](../../tests/interface.test.cjs) cobre semana/tema, vazias, Outras/contador, responsáveis/pendências, teclado e clique em 390/1440; resultados somente na validação.

## Planilha, Histórico e avisos

Como folhas de consulta do mesmo álbum, seis abas obrigatórias e as opcionais capturadas mantêm o conjunto NTV completo.
O atalho da gaveta localiza somente os avisos relacionados à peça, sem reduzir as
tabelas. A tela usa `planilha`, `historico`, `avisos` e `detalhes.avisos` da API
existente; não há nova consulta remota nem escrita.

| Seção / controle | Apresentação atual |
| --- | --- |
| Subtítulo | Dados capturados da planilha, por aba; ao voltar às demais telas, Peças registradas, semana a semana. |
| Origem e atualização | Fonte, fim e cobertura; falha ativa em uma linha e contador de avisos gerais como link, sem repetir os motivos |
| Abas de dados | Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes; 66 mínimos triados e `Semanas.pauta_id` quando capturado; Meses/quatro mínimos e Pautas/doze mínimos opcionais nessa ordem depois de Revisoes; contagem de linhas NTV, sem campos calculados de quadro/gaveta |
| Histórico final | Todas as tentativas confirmadas, recentes primeiro; horário em São Paulo, Completa/Falhou e motivo em linguagem de tela; vazio = Nenhuma tentativa confirmada |
| Teclado de abas | Setas esquerda/direita com retorno nas pontas, Home/End; seleção e foco juntos, somente aba selecionada no Tab |
| Tabela larga | Região de rolagem horizontal própria com nome/foco; conteúdo como texto e cabeçalhos de coluna |
| Sem captura | Orientação para pedir captura completa à Central; somente Histórico, sem seis tabelas fictícias |
| Avisos de dados | Aba/Linha/Campo/Motivo; — quando não há localização; oculto em Histórico ou sem avisos |
| Releitura | Conserva a aba disponível e filtro da peça ainda existente; erro HTTP conserva a visão anterior |

`tabelaLocal` cria a região focável e tabela por `textContent`;
`historicoPlanilha` usa toda a lista confirmada, sem inferir novas tentativas
de GET/no-op nem mostrar órfãos. `renderPlanilha` acrescenta Histórico após
as seis abas e Meses/Pautas se capturadas; `tabPlanilha` e `escolherAba` sincronizam seleção, foco,
`aria-selected` e `aria-labelledby`, com rolagem da aba até a área visível. Se a
aba deixa de existir, a primeira disponível é selecionada.

`avisosPeca` fecha a gaveta, chama `navegar` com a produção, abre
Produções e dá rolagem/foco a `#avisos-dados`. `renderAvisosPlanilha` usa os
avisos relacionados da peça; todas as tabelas permanecem globais à captura NTV.
Menu e selo entram sem filtro; **Todos os avisos** restaura os gerais no painel.
O link **N avisos de dados** de Origem também restaura os gerais, seleciona Produções
e dá foco/rolagem ao painel, inclusive ao sair de Histórico. O contador usa a
quantidade global de avisos, sem deduplicar linhas ou acompanhar o filtro da peça.

`motivoAviso` consolida o texto de mídia de cada aviso apenas na apresentação:
**Imagens e vídeo ausentes**, **Imagem final ausente**, **Nenhum arquivo da produção
registrado** e **Imagem ausente** para páginas são exemplos. Retira a repetição
do prefixo e reúne causas distintas em uma célula; conserva a quantidade de linhas
e Aba/Linha/Campo. Outros motivos permanecem como recebidos; a API não é alterada.

`motivoHistorico` traduz falhas para linguagem de tela: **Cenas complete:
inválido** vira **Aba Cenas incompleta**; outras validações de aba usam **Aba X
inválida**, incluindo Meses/Pautas: complete inválido vira **Aba Meses incompleta** ou **Aba Pautas incompleta**. Horário futuro, captura desatualizada e arquivo ausente/ilegível ou
inválido recebem rótulos próprios; motivo desconhecido usa **Captura não pôde ser
importada**, vazio permanece vazio. Resultado desconhecido usa **Resultado
desconhecido**. Os motivos originais do recibo continuam na API e na persistência.

`celulaPlanilha` aplica a allowlist somente a `url`/`url_video_final`:
valor dedicado preenchido recusado por `urlAutorizada` vira **link não permitido**;
o marcador exato **[conteúdo suprimido]** permanece. A API conserva seus valores
triados, incluindo URL dedicada válida fora da allowlist visual. Texto livre
legítimo mantém suas URLs como texto, conforme a redação do contrato. Células não
criam links, navegação ou carga automática. A garantia de não ecoar URL recusada
refere-se aos campos dedicados e links de arquivos; não varre todas as frases.

## Gaveta do dia, texto e acessibilidade

### Pronta para publicar

Como uma pasta pronta para a publicação manual, `prontaParaPublicar` (`src/web/app.js`) abre o conteúdo da peça cuja `quadro.coluna` é `Pronta` com a seção **Pronta para publicar**, antes da identificação. `detalhes.pacotePublicacao` já contém o único ZIP compatível com produção/tipo/extensão/versão de pacote. **Baixar pacote** exige HTTPS em `drive.google.com`, sem usuário/senha ou porta diferente da padrão; `docs.google.com` não é permitido nesse botão. O link abre por clique com `noopener noreferrer`; ausência, ambiguidade ou URL recusada mostra **Pacote indisponível**, sem escolher substituto ou comprovar bytes/acesso.

Legenda e hashtags usam `textContent` e preservam quebras de linha com `white-space:pre-wrap`; ausências mostram **Legenda não informada**/**Hashtags não informadas**. **Copiar legenda** junta somente os valores presentes com duas quebras de linha. O clique chama `navigator.clipboard.writeText`; sem texto o botão fica desabilitado, sucesso informa **Legenda copiada.** em `role=status` e falha orienta selecionar/copiar manualmente. Essa escrita é local ao clipboard do navegador, sem POST ou alteração editorial.

`detalhesUnidades` coloca páginas/cenas de Pronta dentro de **Páginas e cenas**, recolhido por padrão. Mesmo abertas, essas unidades omitem avisos de mídia e de link recusado; os arquivos com link permitido continuam disponíveis. Avisos e pendências permanecem na API, no contador da peça e na Planilha. `pendenciaQuadro` troca todo resumo de pendências do cartão Pronta por **Pronta para publicar**. As demais colunas conservam a apresentação abaixo.

[tests/pronta-interface.test.cjs](../../tests/pronta-interface.test.cjs) confere quadro/gaveta, clipboard simulado em memória, falha/ausência de texto, URLs recusadas, avisos preservados e peça publicada sem seção de Pronta. Usa servidor/fixtures em TEMP, bloqueia requests externos e não lê nem modifica o clipboard pessoal. [Validação local](../reports/pronta-publicar-validacao.md) e [oito imagens sintéticas](../design/screenshots/LEIA-ME.md#pronta-para-publicar); não houve download real de ZIP.

### Apresentação comum da gaveta

Na Parte A, os fatos passaram a Estado/Prevista/Versão e responsáveis/Com quem está/Corrige deixaram a apresentação. Avisos e seus atalhos de Planilha permanecem nesta parte. A descrição da faixa antiga abaixo preserva a evolução histórica; vínculos, versões, textos, grupos e segurança continuam vigentes.

O diálogo nativo recebe título de data/sem data, quantidade e **todas** as peças do grupo. Como fichas dobráveis, `abrirDia` guarda o elemento que abriu o detalhe e gera um `details` por peça, em ordem ordinal de ID; só a primeira seção começa aberta. O filtro de formato do calendário/lista não é reaplicado ao dia. Um dia vazio mostra **Nenhuma peça registrada neste dia**, sem acordeão fictício; Sem data conserva o grupo da própria semana. A apresentação segue o [mockup da gaveta compacta](../design/mockups/gaveta-v2.html), preservando todos os detalhes seguros na API.

| Seção da peça | Conteúdo real |
| --- | --- |
| Cabeçalho do acordeão | Formato, título e rótulo de status; peça recolhida resume quantidade de páginas/cenas vigentes, revisão e avisos em uma linha |
| Identificação | Faixa de Etapa, Com quem está, Prevista e Versão; somente campos preenchidos, sem placeholders de ausência |
| Publicação | Uma linha quando publicado_em está preenchido; não existe faixa vazia nem confirmação remota |
| Texto registrado | Details fechado: legenda, corpo/função das páginas, texto na tela das cenas e Arquivos · registros; unidades identificadas por Página/Cena número e versão, sem IDs técnicos; textContent |
| Revisão vigente | Título legível de decisão/versão/motivo, abaixo Corrige: responsável e tratamento; sem IDs/rótulos técnicos, adicionais em +N revisão aberta/revisões abertas |
| Páginas / Cenas | Grupos por vigência e versão, atuais primeiro; históricos recolhidos; índice em ordem. Em Pronta, seção inteira recolhida e avisos de mídia omitidos nas unidades, preservados na API/Planilha |
| Página | Linha compacta com número, título ou corpo, Design novo: A confirmar, imagem vN quando a versão da mídia ligada é inteira positiva (vazia/inválida: imagem: versão a confirmar) e link permitido ou mídia ausente |
| Cena | Linha compacta com número, texto, início/duração e links permitidos; um texto humano agregado distingue imagens ausentes/inicial/final e/ou vídeo ausente |
| Arquivos · registros | Dentro de Texto registrado: nome de apresentação, versão e registro, sem miniatura; arquivo ligado sem URL segura mostra link não permitido |
| Histórico | Details fechado por padrão; revisões resolvidas, de outras versões e com vínculo a confirmar em grupos próprios, sem virar revisão vigente |
| Avisos da peça | Quantidade de aviso(s) de dados nesta peça e link ver na Planilha, com plural correto e sem separador pendurado; aba/linha/campo permanecem na API |
| Documentos da semana | Uma seção no fim do dia; cada semana representada tem Plano/Redação/Visual uma vez, com — para ausentes, inclusive sem semana identificada |

O botão de fechar usa `dialog.close`; Esc usa o comportamento nativo. O evento `close` devolve o foco ao acionador se ele continuar no DOM. `summary` recebe foco visível e pode alternar o acordeão por teclado. Em desktop a gaveta fica à direita, com largura máxima de 520 px; abaixo de 720 px ocupa a tela inteira, com corpo de rolagem própria. O calendário/lista por trás não recebe um segundo recorte dos dados. O link dos avisos fecha a gaveta, abre Produções na Planilha e dá rolagem/foco ao painel detalhado da peça; Origem conserva a falha ativa e o contador geral, com os motivos somente no painel.

Publicação preenchida permanece como registro explícito e conserva o valor original. Quando formato/fuso são inválidos ou o instante excede o fim da captura, a projeção acrescenta um aviso localizado em `publicado_em`; a gaveta conserva o registro e resume a quantidade de avisos, sem verificar publicação remotamente. Campo vazio omite a linha, sem comprovar publicação. IDs de escopo/revisão e seus valores completos continuam na API, sem rótulos técnicos na linha visual. A API ainda conserva `detalhes.responsavelRegistrado='A confirmar'` quando vazio, mas a faixa usa `responsavel_atual` e omite esse campo vazio.

`resumoPeca` conta somente páginas/cenas vigentes e diferencia revisão: **revisão aberta** quando existe vigente; sem vigente, **revisão a confirmar** quando existe ambígua ou anterior não resolvida; **sem revisão** quando não existe ou há somente resolvidas. Contagens usam singular/plural em página, cena e aviso. `revisaoLinha` apresenta, por exemplo, **Revisar · versão 2 — motivo**, com **Corrige: pessoa · tratamento** abaixo; decisão desconhecida conserva o original. Acordeões adicionais usam **+1 revisão aberta** ou **+N revisões abertas**, sem inferir atividade de agente.

Fora da coluna Pronta, `arquivosDaUnidade` usa `avisoMidia` da cena para mostrar no máximo um aviso humano por linha: imagens ausentes, imagem inicial/final ausente e/ou vídeo ausente. Arquivo ligado sem URL segura mostra **link não permitido**, preservando a distinção entre ausência de mídia e recusa de link. Quando coexistem, as mensagens se unem na mesma faixa, sem repetir avisos por slot. Página conserva aviso genérico para arquivo ausente; registro presente não vira ausente só por ter URL recusada. Isso não transforma registro em bytes comprovados. Avisos técnicos agregados da cena e demais validações continuam na API, não no texto da gaveta.

`etapaLegivel` usa nove rótulos de apresentação: arte_aprovada → Arte aprovada; prompts_imagem_prontos → Prompts de imagem prontos; imagens_em_producao → Imagens em produção; voz_pronta_para_gerar → Voz pronta para gerar; voz_em_producao → Voz em produção; clipes_prontos_para_gerar → Clipes prontos para gerar; clipes_em_producao → Clipes em produção; montagem_pronta → Montagem pronta; montagem_em_producao → Montagem em produção. Desconhecido conserva exatamente o texto; não decide coluna nem altera o original da API. `cartao(p)` sempre cria botão que abre o dia, sem parâmetro de modo inativo.

`urlAutorizada` transforma em link somente HTTPS nos hosts exatos `drive.google.com` ou `docs.google.com`, sem usuário/senha na URL. Um link abre somente por clique em aba separada, com `noopener noreferrer`; URL recusada nunca é ecoada como texto bruto. Antes do HTTP, a projeção já suprime userinfo de Arquivos.url/Produções.url_video_final usando new URL, com aviso fixo sem o valor; URL não vazia malformada também é suprimida e vazio/somente espaços permanece sem aviso de URL inválida. Registros não carregam imagem, iframe, vídeo ou arquivo remotamente. Textos são aplicados por `createElement`/`textContent` e `replaceChildren`, sem innerHTML, comandos ou execução de JSON. CSS fornece foco visível e breakpoint de 720 px; body acompanha a altura da página e a sidebar desktop mantém o fundo até o fim.

A projeção preserva a frase legítima e substitui somente o pedaço HTTP(S) separado por espaços em branco que `new URL` identifica com usuário/senha, conservando espaços e pontuação de contorno. Em texto livre, não promete detectar outros esquemas, URLs relativas ou credenciais fora desse pedaço; campos de URL dedicados mantêm seu guarda. JSON é dado: só tokens de string redigidos são reserializados, e o restante dos bytes permanece. Avisos já globais dos registros relacionados são incorporados ao resumo/contador da peça; detalhes técnicos permanecem fora da gaveta. Em Texto registrado, Página/Cena e número/versão identificam a unidade sem expor seu ID técnico na apresentação.

### Versões das unidades

Como um texto atualizado que reaproveita uma fotografia, a página mostra **imagem vN** quando a versão original do arquivo ligado é inteira positiva, sem comparar com a produção ou o texto. `adicionarVersaoImagem` (`src/web/app.js`) mostra **imagem: versão a confirmar** para versão vazia/inválida, preservando o original na API e o link do vínculo válido. `secaoUnidades` agrupa por `[vigente,versao]`; os grupos vigentes são seções abertas e os demais são `details` recolhidos com **impacto atual a confirmar**. Os grupos atuais conservam a ordem numérica crescente de versão recebida da projeção; dentro deles, índice e ID estabilizam a ordem. Uma mesma versão pode ter unidades atuais e históricas em grupos separados quando outro índice já avançou. Índice e versão válidos e a maior versão por índice vêm da projeção; a UI não escolhe mídia ou recalcula vigência.

[tests/versoes-interface.test.cjs](../../tests/versoes-interface.test.cjs) confere cinco páginas de texto v3 com imagens v2/v1/v1/v2/v3, grupos atuais/históricos com o mesmo número de versão, rótulo de versão inválida/vazia sem perder o link, links exatos, Escape e ausência de corte horizontal. Quatro cenários cobrem claro/escuro em 1440/390, com somente GET local, estado TEMP, porta efêmera, requests externos bloqueados e erros do navegador verificados. A suíte atual tem sete casos de UI; as quatro imagens continuam inalteradas. [Validação da correção](../reports/versoes-unidades-validacao.md) e [quatro screenshots sintéticos](../design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas); integrada pelo [PR #22](https://github.com/Browsher/crm-social/pull/22), merge `b90980a`. Revisões, pacote e recolhimento de Pronta conservam suas regras próprias.

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

## Prévias de imagens — 005

Atualização da 006 Parte A: miniaturas de peças visíveis em Semana/Produção também iniciam pedidos locais; a seleção foi extraída para layout-model.js. A galeria completa continua sob abertura da peça e a ampliação da 005 permanece. Mês e telas ocultas não solicitam imagens. As provas e o gatilho anteriores registrados abaixo são históricos.

Como uma folha de contato ao lado do texto, a galeria mostra as imagens ligadas às unidades vigentes e permite conferi-las maiores. Implementada/testada localmente no [PR #23](https://github.com/Browsher/crm-social/pull/23); merge/exclusão da branch autorizados após gate/review aprovados no head final. [Validação por fonte, entrega e integração](../../specs/005-previas-imagens/validacao.md).

| Função / estado | Comportamento real em app.js |
| --- | --- |
| imagensDasUnidades / imagensDaPeca | Páginas vigentes por índice/ID; cenas vigentes por índice/ID, inicial/final; vídeo conserva link. Repetição preserva posição |
| Fallback sem unidades | Somente formato Imagem, versão da produção válida e arquivos imagem dessa mesma versão/produção; empates preservados e ordenados por ID |
| galeriaPrevias / previaPosicao | Botões com nome contextual, versão da imagem, link permitido adjacente e img inicialmente sem src |
| iniciarPrevias | Gaveta e acordeão abertos; só posições não solicitadas recebem /api/midia/ + encodeURIComponent(ID-interno) |
| Estados locais | não solicitada → carregando → disponível ou indisponível; nenhuma escrita operacional |
| visualizadorPrevia / ampliarPrevia | Segundo dialog nativo reutilizado, imagem local escolhida, botão Fechar imagem, Escape e foco de origem |

`abrirDia` monta o dia, chama showModal e só então inicia a primeira peça aberta. O toggle das demais peças exige gaveta e peça abertas. Quadro e acordeões fechados geram zero busca; reabrir conserva o cache do servidor e cada reconstrução usa a referência vigente. Em Pronta a galeria fica na seção de publicação, fora da dobra de páginas/cenas; representa os vínculos capturados e não os integrantes conferidos de um ZIP.

`img.onload` habilita ampliação; HTTP recusado ou bytes indecodificáveis geram onerror, escondem o ícone quebrado e mostram **Prévia indisponível** apenas naquela posição. O botão fica desabilitado e os links HTTPS Drive/Docs já permitidos continuam ao lado. Sem classe notice, mensagem Google ou aviso editorial novo; legenda, pacote, contagem e Planilha permanecem.

Ativar por mouse/Enter abre a mesma imagem local no segundo dialog. Fechar imagem ou o primeiro Escape devolve o foco ao mesmo botão, com preventScroll e gaveta preservada; outro Escape pode fechar a gaveta. CSS usa tokens existentes, faixa flex com itens sem encolhimento e overflow-x:auto. Cada miniatura tem caixa 4:5 e grid centralizado; imagem com largura/altura automáticas, máximos de 100% e object-fit:contain preserva o conteúdo inteiro e a proporção. Em 390 a última página é alcançável por rolagem lateral sem cortar a página.

O visualizador usa altura calc(100dvh - 32px) e grid com cabeçalho auto/área minmax(0,1fr), considerando a altura real do título e do botão Fechar. A imagem fica inteira, proporcional e centralizada na área disponível, com place-self:center e contain. Imagem, diálogo e botão permanecem dentro da visualViewport, sem corte inferior ou rolagem da imagem, também após reduzir a altura para 390×640 ou 1440×720.

[tests/previas-interface.test.cjs](../../tests/previas-interface.test.cjs): **22 PASS locais** na fonte `4521975`, cobrindo seleção/empates/reaproveitamento, demanda/cache, falhas localizadas e ampliação/foco nos dois temas e 1440/390. As imagens da peça são PNG 1080×1350; asserções conferem dimensões naturais, proporção, centro, bounds da imagem/diálogo/Fechar e ausência de rolagem, inclusive em viewport baixa. Servidor/serviço reais em TEMP, cliente nativo com transporte falso, externos bloqueados; a prova principal não intercepta a resposta da rota de mídia. [12 screenshots sintéticos atualizados dessa fonte](../design/screenshots/LEIA-ME.md#005--prévias-de-imagens), opt-in CRM_SCREENSHOTS_PREVIAS=1, todos inspecionados. UI permanece fora do LCOV e mantém SKIP explícito em CI Linux. T002 confirmada pelo autor em 08/10/2026 (pasta Produções compartilhada como Leitor); sem teste de acesso real pelo agente.
