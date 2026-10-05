# Modelo de dados — 002

Planejado em 2026-10-05; não altera estado privado existente. Contrato normativo: [leitura-planilha](contracts/leitura-planilha.md). O [modelo da 001](../001-consulta-local-producao/data-model.md) continua para entidades editoriais e projeção.

## Configuração privada

CRM_GOOGLE_CREDENTIALS_FILE: caminho absoluto de um arquivo JSON de conta de serviço, cujo caminho real é externo à raiz Git. CRM_SPREADSHEET_ID: string não vazia, apenas letras/números/_/-, nunca enviada à interface. Variáveis não são endpoints configuráveis. Ausência permite consulta/importação manual; não permite coleta direta.

Credencial: objeto type service_account, client_email/private_key strings não vazias; nenhuma credencial alternative/subject. Chave PEM usada somente no servidor; não é entidade persistida em data nem fixture versionada. Restringir URI OAuth fixa, universo Google padrão e comportamento de transporte. Validar antes de autenticar. Logs/erros usam categorias, nunca campos ou caminho.

## Captura v1 com perfil

| Campo | Restrição |
| --- | --- |
| schemaVersion | inteiro 1 |
| captureProfile | ausente = core6 legado; literal sheets9 = nove abas; outro valor é erro |
| source | google-drive-connector no legado; google-sheets-api no sheets9 |
| capturaId | 1–100 caracteres, letras/números/_/- |
| spreadsheetId | identidade privada configurada; apenas letras/números/_/- |
| brandId | literal ntv |
| startedAt/completedAt | UTC ISO Z real; início ≤ fim |
| metadataBefore/After | exatamente nomes do perfil; sheetId inteiro ≥0, rowCount/columnCount inteiros ≥1; igualdade |
| spreadsheetPropertiesBefore/After | required só sheets9: timeZone IANA válida e locale não vazio; iguais antes/depois |
| firstReadSha256/secondReadSha256 | 64 hex minúsculos; iguais e recomputáveis |
| tables | exatamente seis/nove tabelas conforme perfil; sem subconjunto |

Tabela mantém sheetId, range retangular A1 completo, readAt UTC Z dentro do intervalo, complete true e values matriz de escalares string/número finito/boolean/null. IDs/versões/relações das seis abas mantêm regras da 001. completedAt até dez minutos no futuro inclusive; novo ID com fim igual/anterior à vigente é recusado. Mesmo ID/bytes já confirmado mantém sem_alteracao e não encerra falha posterior. Colisão ID/bytes é erro.

## Célula e tipos

effectiveValue → escalar. stringValue permanece idêntico; numberValue permanece número finito; boolValue booleano; ausência null; errorValue recusa coleta. Fórmula fornece seu resultado efetivo, nunca é executada pelo CRM. Número unsafe usado como identidade/versão não é convertido em string de precisão perdida.

Somente campos de data declarados no contrato convertem seriais, conforme formato/fuso. Versão/índice numéricos continuam inteiro positivo; segundos finitos ≥0. Texto "2", "true", e IDs com zeros à esquerda não sofrem coerção. String de data permanece string; invalidade editorial gera aviso já previsto, não correção silenciosa da fonte.

## Abas auxiliares — 45 cabeçalhos mínimos novos

Os 66 mínimos editoriais da 001 permanecem. A nova whitelist privada soma 45, total 111. Cabeçalhos adicionais permanecem privados; duplicado não vazio, mínimo ausente ou chave duplicada/ausente em linha não vazia recusa captura. Linha toda vazia não é registro.

| Aba | Chave literal | Mínimos |
| --- | --- | --- |
| Agentes (19) | Coluna 1 | Coluna 1, marca_id, nome, status_agendamento, modelo, reasoning_effort, agenda_rrule, prompt, prompt_sha256, estado_migracao, origem, configuracao_json, prompt_proposto, contrato_proposto, estado_implantacao, papel, versao_prompt, sincronizado_em, hash_instalado |
| Controle (4) | Parâmetro | Parâmetro, Valor, Finalidade, Responsável |
| Execucoes (22) | execucao_id | execucao_id, producao_id, cena_id, tipo, task_id, tentativa, estado, fornecedor, modelo, origens_json, dados_origem_json, estado_migracao, pagina_id, motion_id, agente_id, chave_idempotencia, entrada_versao, iniciado_em, atualizado_em, concluido_em, erro, saidas_json |

Chaves: string não vazia, única por aba; não renomear Coluna 1 para agente_id. Controle é chave/valor: nomes de parâmetros são linhas, não colunas. Valor preserva escalar; a 002 não interpreta flags. versao_prompt aceita string/número finito; tentativa/entrada_versao aceitam vazio ou inteiro positivo; datas auxiliares aceitam vazio ou ISO com fuso válido depois da decodificação. Outros campos auxiliares aceitam vazio ou string, exceto versao_prompt/Valor. Conteúdo JSON nesses campos é texto privado, não código executável; não ampliar validação semântica/implantação da 006. Relação auxiliar não resolve nem altera relações editoriais; ponteiros textuais privados não provam executor cadastrado/vivo.

## Tentativa e transições

Uma tentativa não é estado editorial. Em memória: pendente → coletando → validando → promovendo → completa/falhou; a UI não recebe segredo ou matriz bruta nesses estados. IDs/instantes gerados pelo servidor, não pelo browser.

Persistência mantém data/capturas, data/tentativas e atual.json existentes; mesma estrutura de recibo/ponteiro. Somente confirmação de atual.json torna tentativa visível. Falha confirmada conserva capturaId vigente; falha sem confirmação não inventa histórico. Auxiliares só dentro da captura privada aceita. Arquivo intermediário de leituras não é gravado; hashes calculados em memória.

Trava .importacao.lock única desde antes da configuração/rede até promoção/recibo e finalmente liberação. Importador manual usa aquisição síncrona; coletor usa wrapper await com os mesmos helpers protegidos. Leituras observam vigente sem writer lock. Nunca aninhar promoverCaptura sob trava já adquirida.

## Projeção e privacidade

Whitelist pública continua exatamente as seis abas e 66 campos mínimos triados, mais origem pública controlada: Captura pela Central ou Leitura direta pelo servidor local. As propriedades privadas do novo perfil, source credentials e auxiliares não são serializadas em /api/visao. Nenhuma nova tabela Equipe/Workflow. Redação/supressão de URLs credenciadas e dados sensíveis da 001 continuam aplicadas a todo texto projetado.
