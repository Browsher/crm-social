# Arquitetura

Como um álbum de fotografias da operação, o CRM recebe um arquivo preparado pela Central, guarda a observação aceita e apresenta um índice local da NTV. Consultar o álbum não comanda a produção.

Estado em 04/10/2026: primeira entrega da 001 implementada, T001–T018/fundação e US1. Sete suítes locais passaram após revisão/regressões; [validacao.md](../specs/001-consulta-local-producao/validacao.md) registra 58 PASS, 0 FAIL, 0 SKIP e gate local exit 0. Linux/PR e demonstração com captura operacional ainda aguardam; nenhuma leitura Google ocorreu no runtime desta entrega. A [spec](../specs/001-consulta-local-producao/spec.md) continua sendo a meta completa.

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
  Quadro --> Config["config/quadro-etapas.json"]
  HTML["src/web/index.html"] --> JS["/app.js"]
  HTML --> CSS["/styles.css"]
  JS -->|GET /api/visao| Server
  Snapshot --> FS["node:fs / node:path"]
  Captura --> Crypto["node:crypto"]
  Server --> HTTP["node:http / fs / path"]
```

| Módulo | Responsabilidade atual | Documento |
| --- | --- | --- |
| captura | Seis abas/66 mínimos, identidades, dimensões, tempos e hash; sem rede | [Validação](modules/captura.md) |
| snapshot | Leitura privada, exclusividade de importação, arquivos imutáveis, confirmação e falhas | [Persistência](modules/snapshot.md) |
| importar-captura | Entrada CLI local, mensagens/saída e recibo de falha de leitura | [Importador](modules/importador.md) |
| quadro-config | Carrega/valida nove etapas e duas listas vazias; distribuição dos cartões ainda futura | [Configuração](modules/quadro-config.md) |
| projecao | Seleção NTV e campos permitidos, semanas/dias/formatos e selo provisório | [Projeção](modules/projecao.md) |
| servidor | HTTP local com quatro rotas fixas, controle de Host/Origin e respostas resumidas | [Servidor](modules/servidor.md) |
| web | Planejamento/calendário/lista/filtros, menu de três itens e diálogo básico | [Interface](modules/web.md) |

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
  Estado --> Validar[Validar captura ou preservar anterior em falha]
  Validar --> Preparar[Captura e recibo imutáveis preparados]
  Preparar --> Ponteiro[Ponteiro temporário no mesmo diretório]
  Ponteiro --> Confirmar[rename confirma atual.json]
  Confirmar --> Cache[Resumo derivado e liberação da trava]
  Confirmar --> Ler[lerEstado consulta apenas IDs confirmados]
  Ler --> Projetar[projetarVisao seleciona registros permitidos]
  Projetar --> API[GET /api/visao]
  API --> UI[Planejamento no navegador]
```

`atual.json` contém `{capturaId, ultimaTentativaId, historicoIds}`. Capturas e recibos são preparados com abertura exclusiva e fsync antes do rename. Resumo `ultima-tentativa.json` é derivado; falha dele não muda o estado confirmado. Arquivo órfão de interrupção não comprova aceitação nem entra no Histórico.

| Caminho dentro do diretório privado | Autoridade / regra |
| --- | --- |
| `.importacao.lock` | PID/instante da única importação em andamento; segunda instância recusada |
| `capturas/<capturaId>.json` | Envelope/células validados, imutáveis |
| `tentativas/<tentativaId>.json` | Recibo preparado; confirmado apenas quando ID está no ponteiro |
| `atual.json` | Única confirmação de captura vigente e Histórico |
| `ultima-tentativa.json` | Cache derivado, sem autoridade concorrente |

Mesmo ID e serialização já aceitos devolvem `sem_alteracao`, sem novo recibo/frescor/rollback. Conteúdo diferente no mesmo ID é conflito. Falha confirmável preserva captura e acrescenta recibo saneado; impossibilidade de registrar gera erro explícito. Interrupção pode deixar trava: não há expiração/remoção automática; conferir proprietário/processo/estado antes de recuperação manual. Os detalhes de falha, órfãos e concorrência estão no [módulo snapshot](modules/snapshot.md).

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
| `CI=true` | Cinco testes de interface fazem SKIP explícito; não substitui aceite local |

Comandos reais e demo sintética isolada estão no [quickstart](../specs/001-consulta-local-producao/quickstart.md). Não existe iniciador PowerShell neste recorte. A primeira captura oficial é futura e deve preservar os campos/identidades do [contrato](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md); os hashes coerentes do JSON não comprovam coleta real.

## O que já aparece e o que falta

Planejamento apresenta calendário/lista/filtros, imagem B, “N sem data” global, objetivo indefinido e diálogo básico do dia inteiro. Peça remarcada segue sua data civil no mês e continua agrupada pela semana registrada. Desktop usa calendário; 390 px começa em lista e menu recolhido. [Screenshots](design/screenshots/LEIA-ME.md) são da aplicação com dados fictícios.

Com captura, selo é **Captura local**, sempre provisório. Quatro estados/Atualizar dados são US2/T019–T022; detalhes/relações/acordeões são US3/T023–T026; classificação/quadro são US4/T027–T030; tabelas/Histórico na interface são US5/T031–T034. Produção/Planilha mostram mensagens honestas de próxima entrega. Iniciador, escala e aceite completo são posteriores; 23 tarefas permanecem pendentes.

## Ferramentas de qualidade, evidência e dívidas

```mermaid
flowchart LR
  Gate["tools/quality-gate.mjs"] --> Core["gate-core.mjs"]
  Gate --> Tests["gate-tests.mjs"]
  Gate --> Scope["gate-scope.mjs"]
  Gate --> Complexity["gate-complexity.mjs"]
  Gate --> Security["gate-security.mjs"]
```

O gate e seus imports foram conferidos no código de `tools/`; ESLint/lock estão isolados. `quality-gate.config.json` conserva Node 24.19.0, runner node --test e modo full. Gate local: testes/cobertura/complexidade PASS, cobertura 95,91%, aviso CLI argumentos 12; Semgrep SKIP por ausência no Windows; audit N/A sem dependências de aplicação. Não foi alterada baseline, configuração ou ferramenta.

CI/review do node-kit 0.4.8 foi aceito no [PR #5](https://github.com/Browsher/crm-social/pull/5#issuecomment-5976475669), head bc0b02b, merge 4f20f20 e [execução 37176292254](https://github.com/Browsher/crm-social/actions/runs/37176292254). Repo público, main protegida por quality-gate. Isso é histórico do kit; esta entrega ainda aguarda PR/Linux. Cinco casos de UI fazem pulo explícito no CI, enquanto dados/I/O/CLI/projeção/HTTP são obrigatórios. Semgrep real/gate estrito precisam de evidência Linux.

| Dívida / pegadinha | Fonte e impacto |
| --- | --- |
| null vira célula vazia na entidade | src/captura.cjs:81; envelope original preservado, mas projeção perde essa distinção |
| Avisos usam índice filtrado | src/projecao.cjs:33–62; número pode diferir da linha física de origem |
| Relógio/mapa ainda não usados pela projeção | src/projecao.cjs:76; selo/quadros são fundação, não aceite de US2/US4 |
| I/O síncrono e validação por consulta | src/snapshot.cjs:20 e src/servidor.cjs:25; escala final ainda não exercitada em T037 |
| Trava sobrevivente à interrupção | src/snapshot.cjs:67; exige reconciliação manual, sem apagar evidência |
| Teste de rename não prova queda de energia | Fluxo de persistência e validacao.md; registrar somente garantia testada |
| Aviso de complexidade do CLI | scripts/importar-captura.cjs:5, valor 12; manutenção sem retirar validações |
| Fonte/hashes no envelope não são prova de coleta | src/captura.cjs:27–118; Central e captura real ainda devem ser conferidas |
| Review consumiu 23 turnos no PR #1 | Limite 40 turnos/20 min na 0.4.8; custo/tempo e teto numérico de arquivos ainda a acompanhar |
| gerar-testes e retenção remota | Não exercitados no Actions; testes locais do kit não substituem prova remota |

As dívidas Minor não foram corrigidas nesta rodada. Não há leitura de data/ para implementar/documentar, escrita operacional, geração, publicação, deploy ou instalação de agentes por consequência da consulta.
