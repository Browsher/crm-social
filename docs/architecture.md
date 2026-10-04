# Arquitetura

Como um álbum de fotografias da operação, o CRM recebe um arquivo preparado pela Central, guarda a observação aceita e apresenta um índice local da NTV. Consultar o álbum não comanda a produção.

T001–T026 estão implementadas (fundação, US1, US2 e US3); revisão corrente e evidências na [validação](../specs/001-consulta-local-producao/validacao.md). A [spec](../specs/001-consulta-local-producao/spec.md) define a meta completa; captura operacional e leitura Google permanecem pendentes.

## Módulos e imports reais

```mermaid
flowchart LR
  CLI["scripts/importar-captura.cjs"] --> Snapshot["src/snapshot.cjs"]
  Snapshot --> Captura["src/captura.cjs"]
  Server["src/servidor.cjs"] --> Snapshot
  Server --> Projecao["src/projecao.cjs"]
  Server --> Quadro["src/quadro-config.cjs"]
  Projecao --> Captura
  Projecao --> Quadro
  Server -->|define caminho padrão| Config["config/quadro-etapas.json"]
  Quadro -.->|lê caminho recebido| Config
  HTML["src/web/index.html"] --> JS["/app.js"]
  HTML --> CSS["/styles.css"]
  JS -->|GET /api/visao| Server
  Snapshot --> FS["node:fs / node:path"]
  Captura --> Crypto["node:crypto"]
  Snapshot --> Crypto
  Server --> HTTP["node:http / fs / path"]
```

| Módulo | Responsabilidade atual | Documento |
| --- | --- | --- |
| captura | Seis abas/66 mínimos, identidades, dimensões, tempos e hash; sem rede | [Validação](modules/captura.md) |
| snapshot | Leitura privada, exclusividade de importação, arquivos imutáveis, confirmação e falhas | [Persistência](modules/snapshot.md) |
| importar-captura | Entrada CLI local, mensagens/saída e recibo de falha de leitura | [Importador](modules/importador.md) |
| quadro-config | Validador genérico; JSON versionado atual tem nove etapas e duas listas vazias; distribuição dos cartões ainda futura | [Configuração](modules/quadro-config.md) |
| projecao | Seleção NTV e campos permitidos, semanas/dias/formatos, quatro estados de frescor e detalhes por versão/relação | [Projeção](modules/projecao.md) |
| servidor | HTTP local com quatro rotas fixas, controle de Host/Origin e respostas resumidas | [Servidor](modules/servidor.md) |
| web | Planejamento/calendário/lista/filtros, gaveta com acordeões por peça, selo comum e origem/releitura em Planilha | [Interface](modules/web.md) |

Aplicação em CommonJS e JavaScript/HTML/CSS nativos, sem framework, banco ou `package.json` de aplicação. Node 24.19.0 e Playwright já existentes; nenhuma dependência nova instalada. Configuração versionada não contém dados de linhas.

`.specify/feature.json` é ponteiro local não versionado. Checkout remoto identifica a feature pela branch `001-consulta-local-producao` e sua pasta de specs; o ponteiro não é pré-requisito do importador/servidor.

## Entrada, persistência e confirmação

```mermaid
flowchart TD
  Central["Central: coleta oficial futura pelo conector"] -.-> JSON[Arquivo local privado]
  JSON --> CLI[CLI lê arquivo e parseia JSON]
  CLI -->|arquivo ou JSON inválido| Falha[registrarFalhaEntrada com código fixo]
  CLI -->|parse válido| Promover[promoverCaptura]
  Falha --> Lock[Exclusividade por diretório]
  Promover --> Lock
  Lock --> Estado[Ler estado confirmado]
  Estado --> Validar{Estrutura válida?}
  Validar -->|não| Rejeitar[Recibo falhou preserva a vigente]
  Validar -->|sim| Conflito{Mesmo ID com outros bytes?}
  Conflito -->|sim| Rejeitar
  Conflito -->|não| Aceita{ID e bytes já aceitos?}
  Aceita -->|sim| NoOp[sem_alteracao sem novo recibo]
  Aceita -->|não| Tempo{Futuro até 10 min e fim posterior se há vigente?}
  Tempo -->|não| Rejeitar
  Tempo -->|sim| Preparar[Captura e recibo imutáveis preparados]
  Rejeitar --> Ponteiro
  Preparar --> Ponteiro[Ponteiro temporário no mesmo diretório]
  Ponteiro --> Confirmar[rename confirma atual.json]
  Ponteiro -->|gravação ou rename falhou| Limpeza[Remover temporário se possível e conservar erro original]
  Confirmar --> Cache[Resumo derivado e liberação da trava]
  NoOp --> Liberar[Liberar somente a trava adquirida]
  Confirmar --> Ler[lerEstado consulta apenas IDs confirmados]
  Ler --> Projetar[projetarVisao seleciona registros permitidos]
  Projetar --> API[GET /api/visao]
  API --> UI[Planejamento, gaveta do dia e origem/releitura no navegador]
```

`atual.json` contém `{capturaId, ultimaTentativaId, historicoIds}`. Capturas e recibos são preparados com abertura exclusiva e fsync antes do rename. Falha na gravação/rename do ponteiro tenta remover somente seu temporário, preservando o erro original se a limpeza também falhar. Resumo `ultima-tentativa.json` é derivado; falha dele não muda o estado confirmado. Arquivo órfão de interrupção não comprova aceitação nem entra no Histórico.

| Caminho dentro do diretório privado | Autoridade / regra |
| --- | --- |
| `.importacao.lock` | PID/instante da única importação em andamento; segunda instância recusada |
| `capturas/<capturaId>.json` | Envelope/células validados, imutáveis |
| `tentativas/<tentativaId>.json` | Recibo preparado; confirmado apenas quando ID está no ponteiro |
| `atual.json` | Única confirmação de captura vigente e Histórico |
| `ultima-tentativa.json` | Cache derivado, sem autoridade concorrente |

Mesmo ID e serialização já aceitos devolvem `sem_alteracao`, sem novo recibo/frescor/rollback. Conteúdo diferente no mesmo ID é conflito. Falha confirmável preserva captura e acrescenta recibo saneado; impossibilidade de registrar gera erro explícito. Interrupção pode deixar trava: não há expiração/remoção automática; conferir proprietário/processo/estado antes de recuperação manual. Os detalhes de falha, órfãos e concorrência estão no [módulo snapshot](modules/snapshot.md).

A validação temporal ocorre sob trava, depois de estrutura/conflito/no-op e antes de gravar a candidata: fim até 10 minutos no futuro é permitido, inclusive o limite; excedente é inválida, e ID novo com fim igual ou anterior ao vigente é desatualizada. Ambas confirmam motivo fixo no recibo e mantêm a vigente. GET/releitura/reinício validam estrutura sem reaplicar essa política relativa à importação.

A liberação tenta close e unlink separadamente. Avisos transitórios de liberação acompanham o resultado/erro original, sem alterar o recibo confirmado; o CLI os imprime em stderr e preserva o exit do resultado. A projeção `(estadoLocal, nowIso, mapaQuadro)` usa `nowIso` e `captura.completedAt` para frescor em São Paulo. A classificação dos cartões pelo mapa permanece em US4.

## Fluxo HTTP e fronteiras

O ponto de entrada faz bind somente em `127.0.0.1:4318` por padrão. `criarServidor` devolve servidor não iniciado e admite diretórios/configuração confiáveis para testes em TEMP. O mapa é validado antes de criar o handler. Em cada consulta, o estado privado é relido/validado e só a projeção sai.

| Rota / condição | Método e resposta |
| --- | --- |
| / | GET/HEAD, HTML fixo |
| /app.js | GET/HEAD, JS fixo |
| /styles.css | GET/HEAD, CSS fixo |
| /api/visao | GET/HEAD, JSON selecionado; sem captura é 200 com ausência estruturada |
| Outro método com origem válida | 405 e Allow GET, HEAD |
| Outra rota, privado ou traversal | 404; query não escolhe diretórios |
| Host/Origin recusados | 403, antes de método/rota |
| Estado confirmado ilegível | 503 resumido, sem alteração da captura |

Host é exatamente `127.0.0.1:<porta real>`; `localhost` não passa. Origin ausente é permitido; presente deve ser a própria origem HTTP. Sem CORS externo. CSP restringe scripts/estilos/conexões a self e proíbe imagens/objetos/incorporação. Respostas têm no-store/nosniff; HEAD não inclui corpo.

O servidor não expõe `data/`, configuração bruta, envelope/metadados de coleta, células extras ou qualquer arquivo arbitrário. Texto é renderizado por `textContent`; supressão conservadora protege formatos conhecidos de conteúdo sensível sem confundir HTTPS com caminho Windows. Nenhuma URL registrada é carregada automaticamente.

## Configuração e execução

| Entrada real | Consumidor / limite |
| --- | --- |
| `--data-dir <diretorio>` | CLI/servidor; diretório privado padrão data/; testes sempre TEMP |
| `--port <inteiro>` | Servidor; 4318 padrão, 0 para porta efêmera de teste |
| `quadroConfigPath` / `webDir` | Argumentos internos confiáveis de criarServidor, sem controle HTTP |
| `CRM_NODE_PATH` | PowerShell seleciona Node existente; aplicação não lê variável |
| `PATH` | Diretório do Node 24.19.0 à frente para subprocessos do gate; ver quickstart |
| `CRM_PLAYWRIGHT_MODULE` | Teste de interface resolve Playwright existente; sem ela tenta playwright |
| `CI=true` | Testes de interface fazem SKIP explícito; pendência M8 de aplicabilidade, sem substituir aceite local |

Comandos reais e demo sintética isolada estão no [quickstart](../specs/001-consulta-local-producao/quickstart.md). Não existe iniciador PowerShell neste recorte. A primeira captura oficial é futura e deve preservar os campos/identidades do [contrato](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md); os hashes coerentes do JSON não comprovam coleta real.

## O que já aparece e o que falta

Planejamento apresenta calendário/lista/filtros, imagem B, “N sem data” global, objetivo indefinido e gaveta do dia inteiro em acordeões. Peça remarcada segue sua data civil no mês e continua agrupada pela semana registrada. Seis status literais recebem rótulos legíveis só na UI; desconhecidos e API mantêm o original. Mês usa somente inicial maiúscula; calendário inclui apenas semanas com dia do mês e sidebar desktop acompanha a altura da página. Desktop usa calendário; 390 px começa em lista e menu recolhido. [Screenshots](design/screenshots/LEIA-ME.md) são da aplicação com dados fictícios.

US2/T019–T022 entrega `sem_captura`, `falha_atualizacao`, `atualizada_hoje` e `anterior_hoje`, com textos/cores contratuais e clique do selo até Planilha em todas as telas. Sem captura, eventual primeira falha conserva **Sem dados**. Com captura, a última tentativa falha tem precedência sobre frescor e acrescenta aviso curto de preservação da anterior. Datas/horas vêm de `completedAt` em `America/Sao_Paulo`, sem usar datas das linhas ou renovar instante por consulta.

Planilha mostra fonte, fim da captura, cobertura semanal e motivos resumidos distintos dos avisos, com `role=status`; tabelas/Histórico permanecem em US5. **Atualizar dados** desabilita apenas o próprio botão durante `GET /api/visao` com cache no-store. Sucesso atualiza a visão mantendo a tela; erro HTTP, inclusive 503, apresenta mensagem local e conserva visão/selo/dados já carregados, liberando o botão para tentar novamente. Sem visão anterior, aparece **Consulta indisponível**. GET/no-op conservam falha ativa; só nova captura completa aceita a encerra.

US3/T023–T026 entrega o detalhe de todas as peças do dia, independentemente do filtro do resumo: primeira seção em acordeão aberta, versões de páginas/cenas separadas, revisão vigente e resolvidas em grupos próprios, IDs de escopo avaliados, arquivos como registros e avisos com aba/linha física/campo. Publicação preenchida inconsistente conserva o original com aviso, sem confirmação remota. Links só HTTPS nos hosts Drive/Docs exatos e sem credenciais; não há carregamento automático de mídia. O diálogo fecha com Esc e devolve foco; no celular ocupa a tela inteira. Classificação/quadro são US4/T027–T030; seis tabelas/Histórico são US5/T031–T034. Produção mantém a mensagem de próxima entrega; iniciador, escala e aceite completo continuam posteriores, com 15 tarefas T027–T041 pendentes.

## Ferramentas de qualidade, evidência e dívidas

```mermaid
flowchart LR
  Gate["tools/quality-gate.mjs"] --> Core["gate-core.mjs"]
  Gate --> Tests["gate-tests.mjs"]
  Gate --> Scope["gate-scope.mjs"]
  Gate --> Complexity["gate-complexity.mjs"]
  Gate --> Security["gate-security.mjs"]
```

O gate e seus imports estão em `tools/`; ESLint/lock são isolados da aplicação. `quality-gate.config.json` define Node 24.19.0, runner node --test e modo full. A UI fica fora do LCOV (pendência M8) e seus testes continuam obrigatórios no computador. Os resultados do gate estão somente na [validação](../specs/001-consulta-local-producao/validacao.md).

CI ativo com quality-gate obrigatório e review por comentário; histórico e estado corrente na [validação](../specs/001-consulta-local-producao/validacao.md). Dados, I/O, CLI, projeção e HTTP são obrigatórios no Linux; pulos de UI não comprovam aceite remoto da interface.

| Dívida / pegadinha | Fonte e impacto |
| --- | --- |
| null vira célula vazia na entidade | src/captura.cjs:81; envelope original preservado, mas projeção perde essa distinção |
| Classificação pelo mapa pendente | src/projecao.cjs:222; mapa recebido, distribuição dos cartões reservada a US4 |
| I/O síncrono e validação por consulta | src/snapshot.cjs:20 e src/servidor.cjs:25; escala final ainda não exercitada em T037 |
| Trava sobrevivente à interrupção | src/snapshot.cjs:72; exige reconciliação manual; aviso de liberação preserva resultado/erro |
| Teste de rename não prova queda de energia | Fluxo de persistência e validacao.md; registrar somente garantia testada |
| Aviso de complexidade do CLI | scripts/importar-captura.cjs:5, valor 12; manutenção sem retirar validações |
| Complexidade da montagem do acordeão | src/web/app.js:115; reúne as seções da peça; preservar testes de comportamento em futuras extrações, métricas na validação |
| Fonte/hashes no envelope não são prova de coleta | src/captura.cjs:27–118; Central e captura real ainda devem ser conferidas |
| Custo e limite do review | Limite 60 turnos/20 min na 0.4.9; custo/tempo e teto numérico de arquivos ainda a acompanhar |
| gerar-testes e retenção remota | Não exercitados no Actions; testes locais do kit não substituem prova remota |
| Aplicabilidade dos pulos de UI e UI fora do LCOV | tests/interface.test.cjs; pendência M8; CI/cobertura não substituem os testes locais da interface |

A projeção preserva a linha física dos avisos desde a matriz privada, por ID e WeakMap; não usa índice filtrado como localização. As demais dívidas acima continuam explícitas. Não há leitura de data/ para implementar/documentar, escrita operacional, geração, publicação, deploy ou instalação de agentes por consequência da consulta.
