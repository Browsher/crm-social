# Importador local

Como alguém que recebe uma fotografia pronta para colocá-la no álbum, o CLI lê um JSON local e entrega a tentativa à persistência. A coleta pela Central é anterior e independente.

Estado em 04/10/2026: T008 implementada e corrigida após revisão para registrar falhas anteriores ao parse. Fonte: [scripts/importar-captura.cjs](../../scripts/importar-captura.cjs), `argumentos` (linha 5), `lerEntrada` (12), `importarArquivo` (17) e `main` (23).

## Comando, argumentos e saída

```powershell
& $env:CRM_NODE_PATH scripts/importar-captura.cjs $crmCapturePath --data-dir $crmDataDir
```

O [quickstart](../../specs/001-consulta-local-producao/quickstart.md) define ambiente e execução sintética isolada. Não há endpoint HTTP equivalente.

| Entrada | Regra |
| --- | --- |
| Caminho posicional | Exatamente um arquivo local; obrigatório, não pode começar com opção |
| `--data-dir <diretorio-local>` | Única opção; sem ela, diretório padrão `data/` relativo ao repositório |
| URLs | Recusadas para arquivo e diretório; nenhum download |
| Outros argumentos | Erro antes de qualquer I/O |

| Resultado | Saída / código |
| --- | --- |
| Completa promovida | stdout com capturaId e `completa`; 0 |
| Mesma captura já aceita | stdout com capturaId e `sem_alteracao`; 0 |
| Tentativa falhou | stderr com motivo resumido; 1 |
| Argumento/persistência/trava inválidos | stderr resumido; 1 |

Imports: `node:fs`, `node:path` e [snapshot](snapshot.md). O CLI exporta `main(argv)`; só o ponto de entrada aplica `process.exitCode`. Não lê variável de ambiente de aplicação, não conhece Google, fila ou serviço de mídia.

## Falhas de leitura e confirmação

`lerEntrada` associa códigos internos fixos; `importarArquivo` os entrega a `registrarFalhaEntrada`, que usa a mesma exclusividade da promoção.

| Código interno | Motivo confirmado no recibo |
| --- | --- |
| `ENTRADA_ARQUIVO` | arquivo local ausente ou ilegível |
| `ENTRADA_JSON` | JSON inválido no arquivo local |

Estas falhas mantêm a captura/instante anteriores, registram capturaId null e não incluem nome de arquivo, caminho, células ou erro bruto. Sem captura aceita, a captura continua null. Se o armazenamento estiver indisponível, o erro informa que a falha não pôde ser registrada. Não inventar durabilidade a partir da saída de erro.

Argumento inválido/URL é recusado antes da tentativa e não cria recibo. Diretório com importação em andamento recusa outra promoção ou falha de entrada, sem substituir o ponteiro. Recuperação de trava interrompida segue [persistência](snapshot.md); não há remoção automática.

## Testes, dívida e limites

[tests/importador.test.cjs](../../tests/importador.test.cjs) chama processo CLI real por `process.execPath`, com arquivos e diretórios TEMP. Cobre argumentos, arquivo ausente, JSON quebrado, mensagens saneadas, promoção/no-op/conflito, impossibilidade de persistência e dois processos reais concorrentes. Evidência de RED/regressão/GREEN em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

O gate passou com um aviso de complexidade 12 em `argumentos` (linha 5); é dívida de manutenção registrada, não falha do gate nem autorização para simplificar retirando validações. Parse de JSON inteiro e I/O síncrono são o desenho local atual. Importação sintética não comprova coleta completa da Central: demonstrar com arquivo operacional fica em T039.
