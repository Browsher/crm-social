# Pesquisa — 005, prévias de imagens

Como uma folha de contato que acompanha os registros, a prévia deve ajudar a reconhecer a imagem sem criar outra fonte editorial. Este documento consolida decisões **planejadas** da [spec](spec.md), do [plano](plan.md) e do [contrato](contracts/midia.md); não comprova implementação, testes ou acesso real ao Drive. Base: tarefa 1 integrada pelo [PR #22](https://github.com/Browsher/crm-social/pull/22), main `b90980a15fad653937fd024ac3c9bb2738e9d99a`.

**Estado da 005:** [21 tarefas geradas](tasks.md), sendo 20 do agente e uma externa do autor; **0 executadas**. O total excede o limite de 20 definido pelo autor. A rodada para em planejamento, antes de implementar, escrever testes da 005, gerar screenshots ou executar gate; a continuidade depende da decisão do autor. Nenhum merge da 005 autorizado.

## Fontes e contexto

Em 08/10/2026, o coordenador consultou Context7 com `/websites/developers_google_workspace_drive`, separando downloads e escopos. As fontes oficiais abaixo também foram conferidas para estes artefatos:

- [Download de arquivos](https://developers.google.com/workspace/drive/api/guides/manage-downloads): conteúdo binário por `files.get` com `alt=media`; escopo somente de metadados não autoriza baixar conteúdo.
- [Escopos do Drive](https://developers.google.com/workspace/drive/api/guides/api-specific-auth): `drive.readonly` permite leitura/download; `drive.metadata.readonly` limita-se aos metadados.
- [OAuth de conta de serviço](https://developers.google.com/identity/protocols/oauth2/service-account): JWT assinado com RSA/SHA-256, algoritmo RS256, para obter token no servidor.

A investigação dos módulos atuais está consolidada no plano: `src/google.cjs` já atende Sheets com JWT/fetch nativos; snapshot/triagem definem captura válida e recorte NTV; servidor concentra guardas; projeção/gaveta preservam os ponteiros e versões da tarefa 1. A 005 planeja estender essas fronteiras, sem reaplicar regras editoriais ou alterar capturas. A constituição 1.2.0 foi aprovada pelo autor em 08/10/2026 e aplicada na branch `codex/005-previas-imagens`, ainda não integrada.

## Decisões

| Tema | Decision | Rationale | Alternatives considered |
| --- | --- | --- | --- |
| Leitura privada | Factory Drive nativa separada de Sheets; escopo `drive.readonly`, token em RAM e `files.get?alt=media` no servidor; `getMidia(idDrive) -> Promise<Buffer>` | Reutiliza autenticação existente, preserva a finalidade de cada escopo e suporta captura manual sem `CRM_SPREADSHEET_ID` | SDK/dependência nova; token no navegador; URL pública; escopo de metadados, que não atende conteúdo |
| Configuração sob demanda | Criar cliente Drive somente no primeiro cache miss; chave externa existente, sem exigir configuração da planilha | Consulta de textos, início e cache hit não precisam carregar credencial ou obter token; tokens permanecem separados por finalidade | Criar cliente no início ou compartilhar token entre Drive e Sheets |
| Limites de transporte | Destinos OAuth/Drive fixos, `redirect:error`, limite inclusivo de 15.000.000 bytes reais, 15.000 ms no OAuth e 15.000 ms no download completo | Contém custo/memória e cobre stream parado depois dos headers; Content-Length sozinho não limita o corpo | Buffer sem limite; timeout só de headers; seguir redirecionamento; retry automático |
| Validação de imagem | PNG/JPEG/WEBP identificados por assinatura dos bytes, tamanho e SHA-256 quando preenchido; transporte não confia no MIME remoto | MIME, extensão e tipo declarados não provam o conteúdo; a rota não exige tipo declarado imagem, e o hash informado deve concordar antes de servir/cachear | Confiar no MIME/tipo declarado; aceitar SVG/GIF/ZIP/vídeo; transcodificar ou instalar decodificador |
| Resolução do registro | ID interno exato na captura vigente válida e no recorte NTV, antes de cache/rede; reconferir fingerprint antes da resposta | Cache ou pedido antigo não podem autorizar referência removida/alterada; versão inteira positiva segura e id_drive canônico são obrigatórios, SHA preenchido exige 64 hex | Aceitar ID Drive/URL do navegador; usar cache sem captura; inferir substituto por nome |
| Fronteira HTTP | GET local por ID interno codificado, decodificação única; guardas Host/Origin/Sec-Fetch-Site antes do serviço; nosniff/no-store/CORP same-origin também nas falhas | Impede proxy genérico e consumo por outra origem; erros têm corpo constante “Prévia indisponível”, sem entrada, identificadores privados ou detalhes do provedor | CORS amplo; redirecionar navegador ao Google; expor erros do provedor ou consultar serviço antes das guardas |
| Cache descartável | `data/midias/` com chave SHA-256 da tupla inequívoca arquivo_id/versão/id_drive/sha256 normalizado; validar hits e promover por temporário exclusivo+rename | Não usa ID como caminho; alteração da referência invalida reutilização; falha de disco pode servir bytes novos já validados | Chave só por ID/versão; cache HTTP; Buffer global permanente; cache como estado editorial |
| Galeria | Unidades vigentes em ordem de índice/ID e posição do ponteiro; peça imagem sem unidades usa arquivos de imagem da versão da produção; preservar empates/repetições | Usa vínculos existentes, inclusive imagens reaproveitadas, sem escolher arbitrariamente; a UI seleciona candidatas pelos ponteiros | Extrair ZIP; tratar origens_json como manifesto; igualar imagem à versão do pacote |
| Apresentação sob demanda | Sem src em peças fechadas; galeria ao abrir, ampliação em dialog próprio e falha localizada; links preservam allowlist HTTPS Drive/Docs, pacote continua exclusivo de Drive | Mantém a gaveta consultável, evita downloads de outras peças e preserva as ações existentes | Pré-carregar quadro/dia inteiro; bloquear gaveta por falha; buscar Google pelo navegador |

Os status e a ordem de decisão estão no contrato: 200 para bytes aceitos; 400 para rota inválida; 403 para origem recusada; 404 para registro ausente/fora do recorte; 405 com `Allow: GET` para outros métodos; 422 para registro ou bytes recusados; 503 para captura/configuração/transporte indisponível ou referência alterada durante o pedido. HEAD conserva a semântica HTTP sem corpo. A CSP planejada altera somente `img-src 'none'` para `img-src 'self'`.

## Limites e hipóteses ainda não demonstradas

- A assinatura identifica PNG pelos oito bytes iniciais, JPEG por `FF D8 FF` e WEBP por `RIFF`/`WEBP` com tamanho mínimo. Não faz decodificação integral. Bytes aceitos que o navegador não decodifica devem resultar em **Prévia indisponível** localizada; não há garantia de correção ou aprovação editorial.
- Sem SHA-256 declarado, a mesma versão/id_drive não comprova imutabilidade remota. O cache pode reutilizar o conteúdo validado dessa referência; não há polling ou agenda de revalidação.
- Cache hit exige leitura limitada a máximo+1 e nova conferência de assinatura/tamanho/hash. Entrada inválida é ignorada/descartada e permite refetch; registro inválido não inicia rede. A referência é conferida antes e depois de cache/download.
- O caminho de cache fica confinado à raiz fixa e usa somente o hash calculado pelo servidor. Falha de persistência pode servir bytes novos validados; staging é exclusivo e a limpeza atinge somente o próprio temporário. Pedidos concorrentes podem compartilhar promessa removida ao finalizar, sem guardar Buffer global indefinidamente.
- O cache não tem eviction, quota ou limpeza automática nesta feature. Remoção local pelo autor é possível sem mudar captura; política de retenção fica futura.
- “Miniaturas do pacote” adota a hipótese mínima de mostrar imagens das unidades vigentes em Pronta. Não há manifesto ZIP nem extração; a pergunta opcional permanece sem resposta atribuída ao autor.
- Compartilhar a pasta Produções da NTV como Leitor com a conta é a tarefa externa T002 do autor. O escopo não concede acesso a arquivos não compartilhados; testes falsos futuros não dependem dessa preparação.

As decisões técnicas estão resolvidas como defaults explícitos no plano. A hipótese de apresentação permanece declarada, sem inventar aceite. As 21 tarefas registram o peso do trabalho: transporte privado, validação/cache, HTTP, galeria, falhas, ampliação e fechamento com cinco camadas, 12 screenshots sintéticos e gate/review. Essas verificações continuam futuras; nenhuma das 21 tarefas foi executada, e a parada por total acima de 20 permanece vigente.
