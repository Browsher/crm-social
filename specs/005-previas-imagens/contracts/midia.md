# Contrato de mídia — 005

Como uma janela local para uma fotografia registrada, esta rota deve servir somente bytes cuja referência ainda consta da captura válida. Contrato **implementado e testado localmente**; fonte `4521975`, com provas sintéticas nas cinco camadas. Entrega, integração e checks/review por head são acompanhados no PR #23; merge/exclusão da branch autorizados após gate/review aprovados no head final; [evidências](../validacao.md). Fontes: [spec](../spec.md), [plano](../plan.md) e [modelo](../data-model.md).

## Pedido público e ordem das guardas

`GET /api/midia/<arquivo_id codificado>` recebe um ID interno opaco e exato. O navegador usa `encodeURIComponent`; o servidor decodifica uma vez. Rejeitar encoding inválido, ID vazio, query, os IDs `.` e `..`, qualquer `/`, `\` ou `:`, e controles U+0000–U+001F ou U+007F, inclusive quando codificados. Essas recusas impedem segmento extra e formas de caminho/URL; não aceitar ID do Drive, URL de download ou caminho de cache como parâmetros. Não interpretar o formato do ID para encontrar outro registro.

As guardas existentes de Host/Origin precedem método, resolução, cache e rede. Host continua sendo `127.0.0.1:<porta real>`; Origin, quando presente, precisa corresponder à origem local. Recusar `Sec-Fetch-Site: cross-site` e `same-site`; `same-origin`, `none` ou ausência não dispensam as demais guardas. Não adicionar CORS. Método exclusivo GET: HEAD e demais métodos devolvem 405 com `Allow: GET`, sem consultar serviço.

Depois das guardas/método/forma da rota, reler estado e selecionar o recorte NTV. Registro exato ausente ou fora do recorte retorna 404 sem rede, mesmo havendo cache antigo. Captura ausente/inválida não concede acesso por cache. Demais rotas existentes mantêm seus contratos.

## Resposta pública

| Status | Condição | Corpo |
| --- | --- | --- |
| 200 | Registro válido, bytes aceitos e referência reconfirmada | Bytes originais PNG/JPEG/WEBP |
| 400 | Forma inválida da rota de mídia | Texto constante |
| 403 | Host, Origin ou Sec-Fetch-Site recusado | Texto constante |
| 404 | Registro interno ausente ou fora do recorte NTV | Texto constante |
| 405 | Método diferente de GET | Texto constante; `Allow: GET` |
| 422 | Registro sem versão/id_drive/hash válidos; tipo/tamanho/hash dos bytes recusados | Texto constante |
| 503 | Captura ausente/inválida, configuração/OAuth/rede/permissão/timeout indisponível ou referência removida/alterada durante o pedido | Texto constante |

Todo corpo de erro é exatamente **Prévia indisponível**, sem ID interno/remoto, e-mail, nome de arquivo, resposta Google, URL, caminho ou stack. HEAD conserva a semântica HTTP sem corpo. No sucesso, `Content-Type` vem dos bytes: `image/png`, `image/jpeg` ou `image/webp`. Erros usam texto UTF-8. Aplicar `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` e `Cross-Origin-Resource-Policy: same-origin` antes do serviço, também nas falhas. Nenhum header deve conter valor privado.

A CSP global deve mudar somente `img-src 'none'` para `img-src 'self'`; scripts/estilos/conexões permanecem nas fronteiras existentes. O browser solicita mídia somente à origem local. Links da galeria preservam a allowlist HTTPS Drive/Docs de `linkArquivo`, por ação explícita e separada da prévia; Baixar pacote continua exclusivo de Drive.

Na apresentação, miniaturas usam caixas 4:5 com contain e preservam a imagem inteira/proporcional. A ampliação centraliza a imagem inteira na área disponível do visualizador, descontando a altura real do cabeçalho; imagem, diálogo e Fechar ficam no viewport em 1440/390, inclusive em altura reduzida, sem corte inferior. Isso não restringe a rota a imagens 4:5: as fixtures da peça são PNG 1080×1350, enquanto a validação de bytes mantém os tipos e limites abaixo.

## Serviço, autenticação e transporte

Interface interna implementada: `criarServicoMidia({dataDir,criarCliente}).obter(arquivoId) -> Promise<{bytes,contentType}>`. O adaptador HTTP captura falhas assíncronas e converte ao contrato público; não propaga erros do provedor. Resolver registro com versão inteira positiva segura, id_drive canônico e SHA opcional válido. A rota não exige tipo declarado imagem: a assinatura dos bytes é a autoridade; a UI filtra candidatas conforme os ponteiros. Nenhum fallback por URL ou nome.

Factory implementada `criarClienteDrive({env,repoRoot,fetchImpl,now,timeoutMs})`, com `getMidia(idDrive) -> Promise<Buffer>`: reutiliza autenticação RSA/JWT nativa, credencial externa e token em RAM. O transporte não confia no MIME remoto. Não exige `CRM_SPREADSHEET_ID`; Sheets mantém sua configuração/export/comportamento anteriores. Cada factory solicita somente seu scope: Drive `https://www.googleapis.com/auth/drive.readonly`; Sheets `https://www.googleapis.com/auth/spreadsheets.readonly`. Tokens são separados por finalidade; sem delegação de domínio ou escrita.

Criar cliente somente no primeiro cache miss. OAuth usa destino fixo `https://oauth2.googleapis.com/token`; mídia usa `https://www.googleapis.com/drive/v3/files/<id_drive codificado>?alt=media`, construído exclusivamente pelo servidor. `redirect:error`, sem retries automáticos ou leitura/repasse do corpo de erro Google. Timeout finito: 15.000 ms para token e 15.000 ms para download completo, incluindo leitura do stream depois dos headers. Cancelar ao exceder tamanho ou tempo.

## Validação, cache e concorrência

- Limite decimal inclusivo: **15.000.000 bytes**. Content-Length não substitui contagem real. Aceitar somente assinaturas completas PNG/JPEG/WEBP; MIME/extensão recebidos não autorizam conteúdo. Assinatura mínima não garante decodificação integral; `img.onerror` deve manter fallback localizado.
- SHA preenchido exige 64 caracteres hex e igualdade SHA-256 dos bytes; representação hex é comparada sem diferença de caixa. SHA ausente admite tipo/tamanho, sem prometer imutabilidade remota.
- Cache privado em `data/midias/<sha256-da-tupla>.bin`, ignorado por Git; tupla inequívoca contém arquivo_id, versão, id_drive e SHA normalizado. Caminho calculado fica sob a raiz fixa, sem usar ID como filename ou abrir path recebido.
- Revalidar bytes em todo cache hit, com leitura limitada a tamanho máximo+1. Antes de ler, exigir arquivo regular no lstat e no descritor aberto, com `dev`/`ino` bigint iguais; troca entre lstat/open recusa o hit e causa refetch. Fechar o descritor em `finally`, inclusive na recusa. Entrada inválida é ignorada/descartada e pode causar refetch; registro inválido não inicia rede. Cache nunca dispensa captura válida.
- Conferir fingerprint de referência antes e depois de cache/download. Remoção, alteração ou captura inválida antes da resposta recusa servir a referência anterior. Entrada antiga pode permanecer no disco, mas não autoriza acesso.
- Staging exclusivo+rename promove somente bytes validados. Falha de gravação pode servir bytes novos validados sem persistência; limpar apenas o staging do próprio pedido. Coalescer pedidos da mesma chave com promessas removidas ao finalizar; não conservar Buffer global.

Sem eviction, quota, expiração ou agenda de revalidação nesta feature. O diretório herda as permissões/ACL de `data/`, sem aplicar ACL própria. As duas conferências de referência leem sincronicamente a captura inteira; identidade do descritor não garante conteúdo imutável sem SHA. Cache, prévia e falha não mudam coleta, captura, aprovação, liberação, publicação, n8n ou agentes. Não extrair ZIP, inferir seus integrantes ou aplicar nova regra de revisão/retirada de índice. O autor confirmou a T002 em 08/10/2026: pasta Produções compartilhada como Leitor com a conta de serviço. Não houve teste de acesso real pelo agente; o cliente não envia `supportsAllDrives`, e testes falsos não comprovam acesso a Shared drives. O tipo de Drive não é uma nova condição para reabrir a T002 concluída. Testes usam transporte falso e imagens sintéticas.
