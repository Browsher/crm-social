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

O CLI aceita apenas `--data-dir` e `--port`, ambos com valor. Porta deve ser inteiro de 0 a 65535. Diretórios não são selecionados por requisição HTTP. Imports: `node:http`, `node:fs`, `node:path`, [snapshot](snapshot.md), [projeção](projecao.md) e [configuração](quadro-config.md). O módulo exporta `criarServidor` sem iniciar listen; o ponto de entrada inicia exclusivamente em `127.0.0.1`. Não há variável de ambiente lida pelo servidor.

## Rotas e respostas reais

| Método / rota | Resposta |
| --- | --- |
| GET / | `index.html`, `text/html` |
| GET /app.js | JavaScript da aplicação |
| GET /styles.css | CSS da aplicação |
| GET /api/visao | 200, JSON de `projetarVisao(lerEstado(dataDir), nowIso, mapa)`; ausência de captura é resultado estruturado |
| HEAD nas rotas permitidas | Mesmos controles/tipo/status, sem corpo |
| GET/HEAD de qualquer outra rota | 404, incluindo privados, configuração, importação e traversal |
| Outros métodos, com Host/Origin válidos | 405, `Allow: GET, HEAD`; inclusive OPTIONS |
| Host/Origin recusados | 403, antes da avaliação de método/rota |
| Estado/recibo confirmado inválido ou identidade/vínculo recusado na projeção | 503 genérico, sem alteração da última captura ou reparo dos arquivos |

A allowlist de `STATIC` (linha 7) não é ampliada pela presença de arquivos no diretório. A query é descartada ao escolher a rota; não altera configuração ou caminho. URL literal/codificada de traversal não corresponde às quatro rotas.

## Origem e conteúdo

`permitida` (linha 13) exige Host exatamente `127.0.0.1:<porta real>`; `localhost` é recusado. Origin ausente é permitido; quando presente, deve ser exatamente `http://127.0.0.1:<porta>`. Não há CORS externo.

Todas as respostas incluem `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` e CSP. A política restringe scripts/estilos/conexões à própria origem e bloqueia imagens, objetos, base externa e incorporação por outro site. Não há carregamento remoto, endpoint de importação/escrita ou credencial Google no runtime.

A consulta lê e valida ponteiro/recibos/captura a cada GET e gera seleção permitida. O mapa é carregado uma vez ao criar o servidor. A interface tem **Atualizar dados**, que faz nova requisição local sem coleta Google, recibo novo ou renovação do instante.

## Erros, verificação e pegadinhas

O ponto de entrada informa configuração inválida ou impossibilidade de iniciar, com saída de erro; não encerra processo ocupante de uma porta. O handler resume erro de estado em 503, sem stack, caminho ou conteúdo privado.

[tests/servidor.test.cjs](../../tests/servidor.test.cjs) verifica consulta sem escrita, ausência real, bytes/HEAD dos três estáticos sintéticos, métodos, privados/traversal, Host/Origin e configuração inválida. Diretórios e portas são isolados; resultado em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

Pegadinhas: `criarServidor` devolve um servidor não iniciado; o chamador deve manter bind em loopback. I/O é síncrono e o estado confirmado é validado novamente em cada consulta; cenário sintético de escala e limites na [validação](../../specs/001-consulta-local-producao/validacao.md). API disponível e UI sintética não comprovam captura oficial ou aceite operacional.
