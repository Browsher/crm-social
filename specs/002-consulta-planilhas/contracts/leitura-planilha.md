# Contrato — 002, seis abas v1

Decisões aprovadas 2026-10-05. Estende [v1 da 001](../../001-consulta-local-producao/contracts/captura-e-consulta.md) para source google-sheets-api e normalização numérica restrita na coleta direta; source google-drive-connector continua. Sem captureProfile, exatamente seis abas e 66 mínimos. Identidade/frescor/no-op/colisão e capturas históricas preservados.

## Coleta

Metadados antes (sheetId,title,rowCount,columnCount e timeZone) → batchGet completo 1 → hash1 → batchGet completo 2 → hash2 → metadados depois. Comparar seis nomes/IDs/dimensões/fuso; hashes canônicos iguais. Converter datas declaradas antes dos hashes, sem projeção/filtro NTV na integridade. Validar range e ROWS de cada ValueRange; ordem deve corresponder aos seis ranges pedidos e identidade da planilha à configurada. Vazios finais omitidos aceitos conforme API; resposta faltante/fora do range/malformada recusada.

Ranges por nome escapado, A1:última coluna/linha alocada; batchGet com UNFORMATTED_VALUE e SERIAL_NUMBER. Número/bool/string permanecem tipos. Só inicio_semana/data_prevista numéricos convertem serial inteiro base1899-12-30 para YYYY-MM-DD; publicado_em numérico converte fração em horário civil no fuso metadata e UTC por round-trip. Serial inválido/horário inexistente recusa; strings mantidas, sem coerção geral. Duas leituras não garantem transação remota ou ausência de mudança transitória revertida.

Envelope startedAt/completedAt/readAt UTC Z, capturaId seguro; tabelas da segunda leitura, metadataBefore/After antigos sem campos extras. Mesma canonicalização hashCelulas e validarCaptura. Não grava leitura bruta; snapshot promove captura/recibo/ponteiro únicos. Novo ID só se instante mais recente, tolerância futuro10min mantida.

## Inteiros textuais nos campos numéricos — T021

Na coleta direta, antes de calcular **cada** hash, texto canônico que corresponda a `^(?:0|[1-9][0-9]*)$` e cujo número seja inteiro seguro é convertido somente nos campos abaixo. Cabeçalhos, IDs, texto livre, datas textuais e campos extras permanecem como recebidos. Número e booleano nativos não sofrem coerção.

| Aba | Campos numéricos |
| --- | --- |
| Produções | versao |
| Páginas | versao, indice |
| Cenas | versao, indice, inicio_segundos, duracao_segundos |
| Arquivos | versao |
| Revisoes | versao |

Espaços, sinal, zero à esquerda, decimal textual, notação exponencial e inteiro além de `Number.MAX_SAFE_INTEGER` não são convertidos. Permanecem na captura e geram os avisos numéricos existentes na consulta quando preenchidos. Vazio continua ausente. A conversão não relaxa a regra do campo: versão/índice exigem inteiro positivo; tempos exigem número finito não negativo, admitindo decimais nativos. Zero textual converte para zero, mas continua inválido para versão/índice. Não se convertem datas textuais em serial nem versões dentro de JSON de origens.

Os hashes cobrem os valores normalizados nas duas leituras, como já ocorre com datas declaradas. Representações canônicas equivalentes de um inteiro têm o mesmo significado numérico; as duas leituras não distinguem uma troca entre essas representações. Importação da Central e leitura de capturas antigas continuam com os tipos/bytes originais, sem migração ou regravação. Tipagem válida permite comparar versões, mas não prova que versões diferentes sejam vigentes nem que exista mídia.

## Auth e configuração

CRM_GOOGLE_CREDENTIALS_FILE absoluto, lexicalmente fora da pasta do projeto; CRM_SPREADSHEET_ID privado. JSON service_account e chave RSA privada≥2048; nenhum fallback/subject. Sem teste realpath/link/junction (decisão do autor). JWT header alg RS256/typ JWT, claims iss da chave, scope readonly único, aud https://oauth2.googleapis.com/token, iat atual, exp=iat+3600. Assinar node:crypto PKCS1 SHA256; trocar via POST form grant_type JWT bearer/assertion só no endpoint fixo. Não persistir assertion/token; token cache RAM expira e é renovado, sem scope amplo.

Leitura somente GET em https://sheets.googleapis.com. fetch redirect:error e AbortSignal.timeout15s, sem retry; timeout inclui leitura do corpo da resposta. OAuth200 exige access_token string não vazia, token_type Bearer e expires_in finito positivo; resposta inválida = rede fixa. Cache renova antes de expirar, nunca aceita validade maior que3600s. 401/403 e invalid_grant = acesso negado; outros HTTP/erro rede/timeout = rede; corpo inválido da coleta = dados. Nenhum response/body/URL/exception original em log, erro, recibo ou browser. Tests transporte falso + RSA gerada no teste.

Datas de publicação: fração arredondada a milissegundo, conversão com round-trip de calendário civil; correspondência inexistente ou múltipla por DST é dados inválidos, nunca escolher offset arbitrário. T006 cobre ambos e a precisão.

## Quatro falhas

| Categoria | Mensagem fixa | HTTP |
| --- | --- | --- |
| configuracao | Configuração da leitura indisponível | 503 |
| acesso | Acesso à planilha negado | 503 |
| rede | Não foi possível ler a planilha; tente novamente | 503 |
| dados | Captura inválida ou planilha mudou entre as leituras | 422 |

Recusa pela ordem temporal continua na categoria `dados` e HTTP 422, com motivo fixo próprio: **Captura desatualizada; a vigente foi preservada** quando o fim não supera o da vigente; **Horário da captura mais de 10 minutos no futuro** quando excede a tolerância local. O servidor só repassa esses dois motivos por allowlist, nunca uma mensagem arbitrária do coletor. Status e Histórico mostram o mesmo motivo legível; o importador da Central conserva os motivos anteriores.

Preservar vigente/completedAt; confirmar recibo de falha quando possível, para selo/Histórico. Lock ocupado: 409/mensagem fixa, sem coletar/recibo concorrente. I/O sem confirmação: 503/falha não registrada; não entra nas quatro categorias Google, nem finge Histórico. Cleanup close/unlink separados; avisos[] contém só texto fixo de trava e aparece na mensagem curta da UI, sem mudar resultado original.

## HTTP/UI

GET /api/visao continua sem rede/escrita; estáticos e bind127.0.0.1 iguais. POST /api/atualizar exige Host127.0.0.1:porta e Originhttp://127.0.0.1:porta, JSON{} até1KiB; sem query, extra campo, URL/ID/key do browser. Guardas400/403/413/415/405 e resposta só resultado/mensagem/categoria/avisos/registrada, nunca captura bruta.

UI POST → GET para visão confirmada, botão desabilitado durante ambos; preserva tela anterior se GET falhar. Mensagem curta role=status: Atualizando dados / Dados atualizados / motivo fixo. Origem direta legível; zero Google no navegador. Arquivo da Central continua sem configuração Google. T021 demonstrada; resultado sanitizado na validação. Testes continuam exclusivamente com fixtures/fakes.

Cache é por instância do cliente; o servidor padrão cria uma por POST. Reutiliza token na mesma coleta, não entre cliques.
