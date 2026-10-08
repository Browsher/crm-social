# Servidor local

Como um balcão que só atende dentro desta sala, o servidor apresenta o leitor e a visão selecionada para este computador. Ele não recebe pedidos de operação editorial.

Servidor e regressões de estado/projeção implementados e verificados localmente; evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). EntryPoint real [src/servidor.cjs](../../src/servidor.cjs), funções `criarServidor` e `main`; testes usam servidor real em porta efêmera.

## EntryPoint e dependências

```powershell
& $env:CRM_NODE_PATH src/servidor.cjs --data-dir $crmDataDir --port 4318
```

`$crmDataDir` é um diretório local previamente escolhido, privado ou TEMP. O [quickstart](../../specs/001-consulta-local-producao/quickstart.md) explica os pré-requisitos. Esse comando mantém o processo no terminal; o [iniciador PowerShell](iniciador.md) é a alternativa implementada para processo oculto e identificação da instância criada.

| Argumento de `criarServidor` | Padrão / uso |
| --- | --- |
| `dataDir` | `data/`, leitura de estado privado |
| `port` | 4318; porta 0 permitida para teste |
| `webDir` | `src/web/`; argumento confiável para fixture de estáticos em TEMP |
| `quadroConfigPath` | `config/quadro-etapas.json`; carregado e validado antes de criar servidor |
| `midia` | Serviço confiável injetável com obter(arquivoId); padrão lazy cria o serviço de mídia local |

O CLI aceita apenas `--data-dir` e `--port`, ambos com valor. Porta deve ser inteiro de 0 a 65535. Diretórios não são selecionados por requisição HTTP. Imports: `node:http`, `node:fs`, `node:path`, [snapshot](snapshot.md), [projeção](projecao.md), [configuração](quadro-config.md), [cliente Google](google.md), [coleta](coleta.md) e [mídia](midia.md). O módulo exporta `criarServidor` sem iniciar listen; o ponto de entrada inicia exclusivamente em `127.0.0.1`. O POST usa as variáveis privadas de Sheets; GET /api/midia pode carregar a credencial Drive no primeiro cache miss. GET /api/visao e inicialização permanecem locais, sem chave ou Google.

## Rotas e respostas reais

| Método / rota | Resposta |
| --- | --- |
| GET / | `index.html`, `text/html` |
| GET /app.js | JavaScript da aplicação |
| GET /layout-model.js | JavaScript puro compartilhado da 006 Parte A, carregado antes de app.js |
| GET /theme.js | JavaScript de preferência visual, carregado antes do CSS |
| GET /styles.css | CSS da aplicação |
| POST /api/atualizar | JSON {} até1KiB, Origin obrigatório; coleta injetável, 200/422/503/409 conforme contrato |
| GET /api/visao | 200, JSON de `projetarVisao(lerEstado(dataDir), nowIso, mapa)`; ausência de captura é resultado estruturado |
| GET /api/midia/ID-interno | Bytes PNG/JPEG/WEBP autorizados pela captura vigente; falhas 400/403/404/405/422/503 fixas, conforme contrato005 |
| HEAD nos estáticos e /api/visao | Mesmos controles/tipo/status, sem corpo; /api/atualizar só aceita POST e /api/midia só GET |
| GET/HEAD de qualquer outra rota | 404, incluindo privados, configuração, importação e traversal |
| Outros métodos, com Host/Origin válidos | 405; `Allow: POST` na atualização, `GET` na mídia e `GET, HEAD` nas demais; inclusive OPTIONS |
| Host/Origin recusados | 403, antes da avaliação de método/rota |
| Estado/recibo confirmado inválido ou identidade/vínculo recusado na projeção | 503 genérico, sem alteração da última captura ou reparo dos arquivos |

A allowlist de `STATIC` contém cinco arquivos explícitos: HTML, aplicativo, modelo visual, tema e CSS. Não é ampliada pela presença de arquivos no diretório. A escolha das rotas existentes descarta query sem alterar configuração/caminho; atualização e mídia recusam query no contrato próprio. A mídia é uma rota dinâmica restrita por ID interno; nunca expõe data/ como diretório estático ou proxy genérico.

## Estático da 006 — Parte A

A única alteração do servidor na Parte A é servir /layout-model.js como JavaScript sob a mesma allowlist explícita, GET/HEAD, MIME, CSP e guardas de Host/método. São agora cinco arquivos: HTML, aplicativo, modelo visual, tema e CSS. Não há novos endpoints de dados, configuração de perfil ou instagram.js; estes dois últimos pertencem à B, não iniciada. tests/layout-http.test.cjs passou de RED 1 PASS/3 FAIL para 4 PASS, conferindo estático/guardas, invariância de bytes de capturas/recibos em TEMP e API completa. [Validação](../../specs/006-layout-v3/validacao.md).

## Origem e conteúdo

`permitida` exige Host exatamente `127.0.0.1:<porta real>`; `localhost` é recusado. Na consulta, Origin ausente é permitido; no POST é obrigatório; quando presente, deve ser exatamente `http://127.0.0.1:<porta>`. Não há CORS externo.

Todas as respostas incluem `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` e CSP. A 005 altera somente `img-src 'none'` para `img-src 'self'`: scripts/estilos/conexões continuam na própria origem; objetos, base externa e incorporação por outro site permanecem bloqueados. O navegador obtém imagens somente do servidor local. A chave externa é usada somente pelo cliente no servidor; não há escrita editorial.

A consulta lê e valida ponteiro/recibos/captura a cada GET e gera seleção permitida. O mapa é carregado uma vez ao criar o servidor. A interface tem **Atualizar dados**, que envia POST protegido, promove somente candidata válida e depois relê GET local.

## Erros, verificação e pegadinhas

O ponto de entrada informa configuração inválida ou impossibilidade de iniciar, com saída de erro; não encerra processo ocupante de uma porta. O handler resume erro de estado em 503, sem stack, caminho ou conteúdo privado.

[tests/servidor.test.cjs](../../tests/servidor.test.cjs) verifica consulta sem escrita, ausência real, bytes/HEAD dos quatro estáticos sintéticos, métodos, privados/traversal, Host/Origin e configuração inválida. Diretórios e portas são isolados; resultados anteriores em [validacao.md](../../specs/001-consulta-local-producao/validacao.md). O ajuste de 06/10/2026 acrescentou `/theme.js` sem mudar CSP, Host/Origin, métodos ou exposição de arquivos privados. [tests/tema.test.cjs](../../tests/tema.test.cjs) confere GET/HEAD, MIME JavaScript, ausência de corpo no HEAD, recusa de POST e origem externa. Implementado/testado localmente; estado de integração e checks no [PR #18](https://github.com/Browsher/crm-social/pull/18), com merge condicionado ao gate e review vigentes.

Em 07/10, o H02 passou percorrendo os quatro estáticos (`/`, `/app.js`, `/theme.js`, `/styles.css`), comparando bytes do GET, ausência de corpo no HEAD e mesmo MIME nos dois métodos. Ajuste somente de teste/documentação, sem alterar o servidor ou suas guardas. Os [testes do gerador](../../tests/screenshots-tema.test.cjs) também criam instância isolada em TEMP, sem usar o CRM privado do autor.

Pegadinhas: `criarServidor` devolve um servidor não iniciado; o chamador deve manter bind em loopback. I/O é síncrono e o estado confirmado é validado novamente em cada consulta; cenário sintético de escala e limites na [validação](../../specs/001-consulta-local-producao/validacao.md). API disponível e UI sintética não comprovam captura oficial ou aceite operacional.

postAtualizar verifica guards antes do callback; não aceita query, campos adicionais ou content-type diferente. respostaAtualizacao publica somente resultado/mensagem/categoria/registrada/avisos fixos. Nenhum dado/configuração bruta na resposta. Callback padrão cria cliente/coletor somente dentro da trava; testes falsos não usam rede. Provas na [validação da 002](../../specs/002-consulta-planilhas/validacao.md).

Sem as variáveis Google, o POST com composição padrão confirma recibo de falha e retorna 503, categoria `configuracao`, `registrada:true`, sem chamar `fetch`; GET /api/visao continua local. O teste HTTP salva/restaura as variáveis e confere os bytes da captura vigente. Para recusa temporal, a resposta 422/dados repassa somente os dois valores de `MOTIVOS_TEMPO` do snapshot; `motivoResumo` arbitrário continua substituído pelo texto fixo da categoria.

## Rota de prévia — 005

`getMidia` aplica Host/Origin e `Sec-Fetch-Site` antes do método, resolução, cache ou cliente. `cross-site`/`same-site` são recusados; ausência, `none` e `same-origin` mantêm as demais guardas. HEAD/outros métodos recebem 405 com Allow GET, sem consultar serviço. O ID é decodificado uma vez; vazio, `.`/`..`, query, `/`, `\`, `:` e controles U+0000–U+001F/U+007F são recusados com 400, inclusive codificados. ID remoto que não corresponde a um ID interno exato resulta 404.

O serviço relê/valida o snapshot e recorta NTV em todo pedido. Resposta 200 usa Content-Type derivado dos bytes; todo erro é texto UTF-8 constante **Prévia indisponível**, sem ID, conta, URL ou mensagem Google. `Cross-Origin-Resource-Policy: same-origin`, no-store/nosniff e CSP acompanham sucesso e falhas; HEAD conserva ausência de corpo. Não há CORS. A captura/recibo não é alterada pela prévia.

[Contrato005](../../specs/005-previas-imagens/contracts/midia.md), [módulo mídia](midia.md) e [tests/midia-http.test.cjs](../../tests/midia-http.test.cjs) documentam todos os status. Testes usam HTTP real em porta efêmera e cliente nativo com transporte falso, com timeout local e conferência byte a byte de capturas/recibos. [Validação](../../specs/005-previas-imagens/validacao.md); integração não autorizada.
