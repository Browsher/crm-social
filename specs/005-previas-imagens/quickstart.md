# Roteiro planejado de validação — 005

Como conferir uma folha de contato antes de usá-la, este roteiro separa o desenho da evidência. A 005 está **planejada, sem implementação/testes executados** nesta rodada. Consulte [spec](spec.md), [plano](plan.md), [modelo](data-model.md), [pesquisa](research.md) e [contrato](contracts/midia.md). Base: tarefa 1 integrada pelo PR #22, main `b90980a15fad653937fd024ac3c9bb2738e9d99a`.

## Pré-requisitos e ordem

1. Tarefas geradas: **21, sendo 20 do agente e uma externa do autor; 0 executadas**. Execução parada por exceder o limite de 20. A distribuição está em [tasks.md](tasks.md#rastreabilidade-e-peso); não comprimir tarefas para contornar o limite.
2. Somente após decisão do autor sobre esse limite, implementar por RED → GREEN → refactor, com Node 24.19.0 e Playwright existentes; nenhuma instalação nova. Usar somente TEMP, portas efêmeras, transporte falso e imagens sintéticas geradas nos testes.
3. Executar as cinco camadas aplicáveis, inspecionar as 12 imagens, revisar e corrigir. Gate completo é penúltima etapa; doc-sync é a última. Um PR da 005, sem merge.

| Entrada | Preparação planejada / limite |
| --- | --- |
| `CRM_NODE_PATH` / `PATH` | Runtime existente 24.19.0; colocar seu diretório à frente para os subprocessos do gate |
| `CRM_PLAYWRIGHT_MODULE` | Playwright já disponível no computador; fora de `CI=true` para aceite de UI |
| Diretório de dados de teste | TEMP exclusivo, com captura sintética e cache próprio; não usar `data/` operacional |
| Cliente Google nos testes | Fetch/transporte injetado; chaves RSA geradas em RAM/TEMP; não usar credencial real ou PEM literal em fixture |
| Preparação real do autor | Compartilhar a pasta Produções da NTV como Leitor com a conta de serviço; tarefa externa, não executada pelo agente nem necessária aos testes falsos |

O cliente Drive planejado não exige `CRM_SPREADSHEET_ID`; credencial real fica externa, privada, apenas no servidor. Não registrar e-mail, ID, URL privada ou conteúdo operacional na evidência compartilhável.

## Comandos previstos após implementar

Os arquivos de teste abaixo são previstos no plano e ainda não existem nesta rodada. Estes comandos são roteiro de repetição, sem resultado atribuído:

```powershell
& $env:CRM_NODE_PATH --test tests/google-midia.test.cjs tests/midia.test.cjs tests/midia-http.test.cjs
& $env:CRM_NODE_PATH --test tests/previas-interface.test.cjs
& $env:CRM_NODE_PATH --test
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

Selecionar o runtime também no PATH antes do gate; UI fora do LCOV e pulos Linux UI/PowerShell continuam com seus limites existentes. Nenhuma execução real do Drive é necessária para essas provas. Registre futuramente RED/GREEN, fonte do código, ambiente, gate/review, screenshots e limites numa validação da 005; números históricos da tarefa 1 não comprovam esta entrega.

## Matriz de conferência planejada

| Camada / caso | Ação sintética | Resultado esperado |
| --- | --- | --- |
| Regras de registro/bytes | Imagem válida com tipo declarado divergente; versão/id_drive ausentes ou inválidos; SHA ausente, inválido e divergente | Assinatura dos bytes decide o tipo, sem exigir tipo declarado imagem na rota; SHA ausente ainda exige tipo/tamanho; falha sem dados privados |
| Tipo e tamanho | PNG/JPEG/WEBP, assinaturas truncadas, SVG/GIF/ZIP/vídeo/HTML/JSON; limite exato e +1 | Tipo derivado dos bytes; limite inclusivo 15.000.000; excesso recusado antes de servir/cachear |
| Transporte/OAuth | Cliente sem spreadsheet ID, scopes separados, redirect, permissão negada, stall no token e no corpo | Factory Drive independente; 15 s em cada fase; nenhum redirect/retry ou corpo Google público |
| Persistência real TEMP | Hit, corrupção, staging interrompido, erro de disco, referência/versão/hash alterados e pedidos concorrentes | Hit validado sem OAuth/download; inválido pode refetch; bytes novos validados podem ser servidos se cache falhar; sem escrita em captura/recibos |
| Serviço/captura | Registro removido/fora da NTV; captura inválida; referência mudando durante download | Sem rede quando recusa inicial; fingerprint final impede bytes anteriores como atuais; cache não contorna captura |
| HTTP real | Rota/encoding/query inválidos, ID exato/ausente, HEAD/POST, Host/Origin/Sec-Fetch-Site | Status e headers do contrato; GET exclusivo, erros constantes, sem proxy genérico, CORS ou valor privado |
| Galeria sob demanda | Quadro, dia com peças fechadas, abrir/reabrir uma peça; texto v3/imagens v2/v1/v1/v2/v3 | Zero download das fechadas; somente peça aberta; ordem por índice/ponteiro, reaproveitamento válido e cache sem download extra |
| Imagem/Reels/Pronta | Imagem sem unidades, empates/repetições, cenas início/final/vídeo, peça liberada | Fallback pela versão da produção; preservar posições/empates; só imagens das cenas; galeria de Pronta fora da dobra, sem extrair ZIP |
| Ampliação/390 | Mouse/teclado, Fechar, Escape duas vezes, última imagem da faixa | Mesma imagem, foco devolvido e gaveta preservada no primeiro Escape; faixa lateral sem rolagem horizontal da página |
| Falha visual | Erro HTTP e bytes com assinatura aceita mas indecodificáveis | Somente a miniatura afetada mostra Prévia indisponível; ampliação indisponível; texto/link/Pronta/avisos preservados |
| Regressões | Google/Sheets, coleta, visao/atualizar, Pronta, versões, tema e XSS | Contratos existentes preservados; CSP muda somente img-src self; ajustar seletores sem remover provas de segurança |

No teste principal de UI, usar servidor real com transporte remoto falso; não contornar `/api/midia/` por interceptação de resposta da página. Bloquear solicitações externas e conferir erros do navegador. Inspecionar futuro conjunto de **12 PNG sintéticos**: galeria, ampliação e indisponível × claro/escuro × 1440/390, com exportação opt-in e estado em TEMP. Não compartilhar screenshot operacional.

## Limites do aceite futuro

Uma assinatura reconhecida não comprova decodificação completa, aprovação ou conteúdo de pacote. Sem SHA, a referência igual não comprova imutabilidade remota; cache não tem eviction/revalidação periódica. Compartilhamento do autor e demonstração real, se solicitada, têm evidência própria e não são inferidos dos fakes. Implementação, testes, gate, screenshots, review e integração permanecem pendentes.
