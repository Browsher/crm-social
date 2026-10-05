# Contrato — 002, seis abas v1

Decisões aprovadas 2026-10-05. Estende [v1 da 001](../../001-consulta-local-producao/contracts/captura-e-consulta.md) somente para source google-sheets-api; source google-drive-connector continua. Sem captureProfile, exatamente seis abas e 66 mínimos. Tipos/regras/identidade/frescor/no-op/colisão antigos preservados.

## Coleta

Metadados antes (sheetId,title,rowCount,columnCount e timeZone) → batchGet completo 1 → hash1 → batchGet completo 2 → hash2 → metadados depois. Comparar seis nomes/IDs/dimensões/fuso; hashes canônicos iguais. Converter datas declaradas antes dos hashes, sem projeção/filtro NTV na integridade. Validar range e ROWS de cada ValueRange; ordem deve corresponder aos seis ranges pedidos e identidade da planilha à configurada. Vazios finais omitidos aceitos conforme API; resposta faltante/fora do range/malformada recusada.

Ranges por nome escapado, A1:última coluna/linha alocada; batchGet com UNFORMATTED_VALUE e SERIAL_NUMBER. Número/bool/string permanecem tipos. Só inicio_semana/data_prevista numéricos convertem serial inteiro base1899-12-30 para YYYY-MM-DD; publicado_em numérico converte fração em horário civil no fuso metadata e UTC por round-trip. Serial inválido/horário inexistente recusa; strings mantidas, sem coerção geral. Duas leituras não garantem transação remota ou ausência de mudança transitória revertida.

Envelope startedAt/completedAt/readAt UTC Z, capturaId seguro; tabelas da segunda leitura, metadataBefore/After antigos sem campos extras. Mesma canonicalização hashCelulas e validarCaptura. Não grava leitura bruta; snapshot promove captura/recibo/ponteiro únicos. Novo ID só se instante mais recente, tolerância futuro10min mantida.

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

Preservar vigente/completedAt; confirmar recibo de falha quando possível, para selo/Histórico. Lock ocupado: 409/mensagem fixa, sem coletar/recibo concorrente. I/O sem confirmação: 503/falha não registrada; não entra nas quatro categorias Google, nem finge Histórico. Cleanup close/unlink separados; avisos[] contém só texto fixo de trava e aparece na mensagem curta da UI, sem mudar resultado original.

## HTTP/UI

GET /api/visao continua sem rede/escrita; estáticos e bind127.0.0.1 iguais. POST /api/atualizar exige Host127.0.0.1:porta e Originhttp://127.0.0.1:porta, JSON{} até1KiB; sem query, extra campo, URL/ID/key do browser. Guardas400/403/413/415/405 e resposta só resultado/mensagem/categoria/avisos/registrada, nunca captura bruta.

UI POST → GET para visão confirmada, botão desabilitado durante ambos; preserva tela anterior se GET falhar. Mensagem curta role=status: Atualizando dados / Dados atualizados / motivo fixo. Origem direta legível; zero Google no navegador. Arquivo da Central continua sem configuração Google. Conta real/demonstração pendentes, não bloqueiam fixtures/fakes.
