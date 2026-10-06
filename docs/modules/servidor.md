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

O CLI aceita apenas `--data-dir` e `--port`, ambos com valor. Porta deve ser inteiro de 0 a 65535. Diretórios não são selecionados por requisição HTTP. Imports: `node:http`, `node:fs`, `node:path`, [snapshot](snapshot.md), [projeção](projecao.md) [configuração](quadro-config.md), [cliente Google](google.md) e [coleta](coleta.md). O módulo exporta `criarServidor` sem iniciar listen; o ponto de entrada inicia exclusivamente em `127.0.0.1`. No POST, o cliente lê as variáveis privadas descritas em [Google](google.md). GET e inicialização não carregam chave.

## Rotas e respostas reais

| Método / rota | Resposta |
| --- | --- |
| GET / | `index.html`, `text/html` |
| GET /app.js | JavaScript da aplicação |
| GET /theme.js | JavaScript de preferência visual, carregado antes do CSS |
| GET /styles.css | CSS da aplicação |
| POST /api/atualizar | JSON {} até1KiB, Origin obrigatório; coleta injetável, 200/422/503/409 conforme contrato |
| GET /api/visao | 200, JSON de `projetarVisao(lerEstado(dataDir), nowIso, mapa)`; ausência de captura é resultado estruturado |
| HEAD nas rotas de consulta | Mesmos controles/tipo/status, sem corpo; /api/atualizar só aceita POST |
| GET/HEAD de qualquer outra rota | 404, incluindo privados, configuração, importação e traversal |
| Outros métodos, com Host/Origin válidos | 405; `Allow: POST` na atualização e `GET, HEAD` nas demais; inclusive OPTIONS |
| Host/Origin recusados | 403, antes da avaliação de método/rota |
| Estado/recibo confirmado inválido ou identidade/vínculo recusado na projeção | 503 genérico, sem alteração da última captura ou reparo dos arquivos |

A allowlist de `STATIC` contém quatro arquivos explícitos: HTML, aplicativo, tema e CSS. Não é ampliada pela presença de arquivos no diretório. A query é descartada ao escolher a rota; não altera configuração ou caminho. URL literal/codificada de traversal não corresponde às seis rotas.

## Origem e conteúdo

`permitida` exige Host exatamente `127.0.0.1:<porta real>`; `localhost` é recusado. Na consulta, Origin ausente é permitido; no POST é obrigatório; quando presente, deve ser exatamente `http://127.0.0.1:<porta>`. Não há CORS externo.

Todas as respostas incluem `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` e CSP. A política restringe scripts/estilos/conexões à própria origem e bloqueia imagens, objetos, base externa e incorporação por outro site. Não há carregamento remoto, escrita editorial ou credencial Google no browser. A chave externa é usada somente pelo cliente no servidor.

A consulta lê e valida ponteiro/recibos/captura a cada GET e gera seleção permitida. O mapa é carregado uma vez ao criar o servidor. A interface tem **Atualizar dados**, que envia POST protegido, promove somente candidata válida e depois relê GET local.

## Erros, verificação e pegadinhas

O ponto de entrada informa configuração inválida ou impossibilidade de iniciar, com saída de erro; não encerra processo ocupante de uma porta. O handler resume erro de estado em 503, sem stack, caminho ou conteúdo privado.

[tests/servidor.test.cjs](../../tests/servidor.test.cjs) verifica consulta sem escrita, ausência real, bytes/HEAD dos quatro estáticos sintéticos, métodos, privados/traversal, Host/Origin e configuração inválida. Diretórios e portas são isolados; resultados anteriores em [validacao.md](../../specs/001-consulta-local-producao/validacao.md). O ajuste de 06/10/2026 acrescentou `/theme.js` sem mudar CSP, Host/Origin, métodos ou exposição de arquivos privados. [tests/tema.test.cjs](../../tests/tema.test.cjs) confere GET/HEAD, MIME JavaScript, ausência de corpo no HEAD, recusa de POST e origem externa. Implementado/testado localmente; integração pendente e gate/review do novo PR exigem conferência própria.

Pegadinhas: `criarServidor` devolve um servidor não iniciado; o chamador deve manter bind em loopback. I/O é síncrono e o estado confirmado é validado novamente em cada consulta; cenário sintético de escala e limites na [validação](../../specs/001-consulta-local-producao/validacao.md). API disponível e UI sintética não comprovam captura oficial ou aceite operacional.

postAtualizar verifica guards antes do callback; não aceita query, campos adicionais ou content-type diferente. respostaAtualizacao publica somente resultado/mensagem/categoria/registrada/avisos fixos. Nenhum dado/configuração bruta na resposta. Callback padrão cria cliente/coletor somente dentro da trava; testes falsos não usam rede. Provas na [validação da 002](../../specs/002-consulta-planilhas/validacao.md).

Sem as variáveis Google, o POST com composição padrão confirma recibo de falha e retorna 503, categoria `configuracao`, `registrada:true`, sem chamar `fetch`; GET continua local. O teste HTTP salva/restaura as variáveis e confere os bytes da captura vigente. Para recusa temporal, a resposta 422/dados repassa somente os dois valores de `MOTIVOS_TEMPO` do snapshot; `motivoResumo` arbitrário continua substituído pelo texto fixo da categoria.
