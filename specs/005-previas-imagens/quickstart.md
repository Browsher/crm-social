# Roteiro de uso e repetição da validação — 005

Como conferir uma folha de contato antes de usá-la, este roteiro separa o desenho da evidência. A 005 está **implementada e testada localmente**, com gate Windows verde e 12 screenshots sintéticos inspecionados; entrega e checks/review por head acompanhados no PR #23 e na validação. [Evidências por fonte](validacao.md). Consulte [spec](spec.md), [plano](plan.md), [modelo](data-model.md), [pesquisa](research.md) e [contrato](contracts/midia.md). Base: tarefa 1 integrada pelo PR #22, main `b90980a15fad653937fd024ac3c9bb2738e9d99a`.

## Pré-requisitos e ordem

1. O autor aprovou em 2026-10-08 as **21 tarefas**, 20 do agente e T002 externa, após a parada inicial no limite de 20. T002 permanece pendente e não bloqueia ensaios falsos; [distribuição e estado](tasks.md#rastreabilidade-e-peso).
2. A implementação usou RED → GREEN → refactor, Node 24.19.0 e Playwright existentes, sem instalação nova. A repetição usa somente TEMP, portas efêmeras, transporte falso e imagens sintéticas geradas nos testes.
3. As cinco camadas e o gate passaram localmente; 12 imagens foram inspecionadas. Entrega e checks/review por head são acompanhados no PR #23. O PR #23 não deve ser integrado.

| Entrada | Preparação / limite |
| --- | --- |
| `CRM_NODE_PATH` / `PATH` | Runtime existente 24.19.0; colocar seu diretório à frente para os subprocessos do gate |
| `CRM_PLAYWRIGHT_MODULE` | Playwright já disponível no computador; fora de `CI=true` para aceite de UI |
| Diretório de dados de teste | TEMP exclusivo, com captura sintética e cache próprio; não usar `data/` operacional |
| Cliente Google nos testes | Fetch/transporte injetado; chaves RSA geradas em RAM/TEMP; não usar credencial real ou PEM literal em fixture |
| Preparação real do autor | Compartilhar a pasta Produções da NTV como Leitor com a conta de serviço e conferir o tipo de Drive; tarefa externa, não executada pelo agente nem necessária aos testes falsos |

O cliente Drive implementado não exige `CRM_SPREADSHEET_ID`; credencial real fica externa, privada, apenas no servidor. Não registrar e-mail, ID, URL privada ou conteúdo operacional na evidência compartilhável.

Na T002, conferir se Produções é uma pasta compartilhada de um Drive pessoal ou pertence a um **Shared drive**: são conceitos distintos. O cliente atual não envia `supportsAllDrives`, parâmetro descrito na [documentação Google de Shared drives](https://developers.google.com/workspace/drive/api/guides/enable-shareddrives). Compartilhar como Leitor não comprova suporte a Shared drives; não há prova de acesso operacional nesta entrega. Registrar somente o resultado sanitizado e o limite encontrado, sem valores privados. O cache herda as permissões/ACL de `data/`, sem criar ACL própria, e não possui eviction, quota ou expiração automática.

## Repetir os testes sintéticos

Os comandos abaixo exercitam os arquivos implementados. Resultados anteriores pertencem à fonte registrada em validacao.md; uma nova execução tem evidência própria:

```powershell
& $env:CRM_NODE_PATH --test tests/google-midia.test.cjs tests/midia.test.cjs tests/midia-http.test.cjs
& $env:CRM_NODE_PATH --test tests/previas-interface.test.cjs
& $env:CRM_NODE_PATH --test
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

Selecionar o runtime também no PATH antes do gate; UI fora do LCOV e pulos Linux UI/PowerShell continuam com seus limites existentes. Nenhuma execução real do Drive é necessária para essas provas. Consulte RED/GREEN, fonte, ambiente, gate e limites em [validacao.md](validacao.md). Números históricos da tarefa 1 não comprovam a 005. Para reproduzir as imagens com opt-in, execute:

```powershell
$env:CRM_SCREENSHOTS_PREVIAS = '1'
& $env:CRM_NODE_PATH --test tests/previas-interface.test.cjs
```

Essa variável permite escrever somente os 12 `previas-*.png` sintéticos em `docs/design/screenshots/`; execuções comuns não os gravam.

## Matriz de conferência

| Camada / caso | Ação sintética | Resultado esperado |
| --- | --- | --- |
| Regras de registro/bytes | Imagem válida com tipo declarado divergente; versão/id_drive ausentes ou inválidos; SHA ausente, inválido e divergente | Assinatura dos bytes decide o tipo, sem exigir tipo declarado imagem na rota; SHA ausente ainda exige tipo/tamanho; falha sem dados privados |
| Tipo e tamanho | PNG/JPEG/WEBP, assinaturas truncadas, SVG/GIF/ZIP/vídeo/HTML/JSON; limite exato e +1 | Tipo derivado dos bytes; limite inclusivo 15.000.000; excesso recusado antes de servir/cachear |
| Transporte/OAuth | Cliente sem spreadsheet ID, scopes separados, redirect, permissão negada, stall no token e no corpo | Factory Drive independente; 15 s em cada fase; nenhum redirect/retry ou corpo Google público |
| Persistência real TEMP | Hit, corrupção, staging interrompido, erro de disco, referência/versão/hash alterados, pedidos concorrentes e troca do arquivo entre lstat/open sem SHA | Hit validado sem OAuth/download; identidade do descritor divergente recusa o hit, fecha o descritor e baixa bytes corretos; bytes novos validados podem ser servidos se cache falhar; sem escrita em captura/recibos |
| Serviço/captura | Registro removido/fora da NTV; captura inválida; referência mudando durante download | Sem rede quando recusa inicial; fingerprint final impede bytes anteriores como atuais; cache não contorna captura |
| HTTP real | Rota/encoding/query inválidos, ID exato/ausente, HEAD/POST, Host/Origin/Sec-Fetch-Site | Status e headers do contrato; GET exclusivo, erros constantes, sem proxy genérico, CORS ou valor privado |
| Galeria sob demanda | Quadro, dia com peças fechadas, abrir/reabrir uma peça; texto v3/imagens v2/v1/v1/v2/v3 | Zero download das fechadas; somente peça aberta; ordem por índice/ponteiro, reaproveitamento válido e cache sem download extra |
| Imagem/Reels/Pronta | Imagem sem unidades, empates/repetições, cenas início/final/vídeo, peça liberada | Fallback pela versão da produção; preservar posições/empates; só imagens das cenas; galeria de Pronta fora da dobra, sem extrair ZIP |
| Ampliação/390 | Mouse/teclado, Fechar, Escape duas vezes, última imagem da faixa | Mesma imagem, foco devolvido e gaveta preservada no primeiro Escape; faixa lateral sem rolagem horizontal da página |
| Falha visual | Erro HTTP e bytes com assinatura aceita mas indecodificáveis | Somente a miniatura afetada mostra Prévia indisponível; ampliação indisponível; texto/link/Pronta/avisos preservados |
| Regressões | Google/Sheets, coleta, visao/atualizar, Pronta, versões, tema e XSS | Contratos existentes preservados; CSP muda somente img-src self; ajustar seletores sem remover provas de segurança |

No teste principal de UI, usar servidor real com transporte remoto falso; não contornar `/api/midia/` por interceptação de resposta da página. Bloquear solicitações externas e conferir erros do navegador. O coordenador inspecionou o conjunto de **12 PNG sintéticos**: galeria, ampliação e indisponível × claro/escuro × 1440/390, com exportação opt-in e estado em TEMP. Não compartilhar screenshot operacional.

## Limites do aceite

Uma assinatura reconhecida não comprova decodificação completa, aprovação ou conteúdo de pacote. Sem SHA, referência ou identidade do descritor iguais não comprovam imutabilidade do conteúdo local/remoto; cache não tem eviction/revalidação periódica. Cada prévia realiza duas leituras síncronas integrais da captura para conferir a referência. Compartilhamento do autor e demonstração real, se solicitada, têm evidência própria e não são inferidos dos fakes. Implementação, testes locais, gate normal Windows e screenshots estão registrados. Entrega e checks/review por head são acompanhados no PR #23; integração não autorizada.
