# Pesquisa — 002 Planilhas

2026-10-05. Somente leitura de documentação oficial/Context7 e código vigente; nenhuma instalação ou consulta à planilha real. Versão 11.1.0 conferida no registry público do npm (`engines.node >=22`, Apache-2.0); Node do projeto é 24.19.0.

## 1. Autenticação mínima

**Decision:** JWT explícito com google-auth-library 11.1.0 e escopo único readonly. Chave validada antes de construir cliente; sem GoogleAuth/ADC fallback. Tokens em memória e headers, nunca query/log/browser. Configuração externa; arquivo real deve estar fora do repositório, inclusive junction/symlink. Sem subject/impersonação, external_account, authorized_user ou URI arbitrária de token.

**Rationale:** API Google exige autenticação de conta de serviço; assinatura/renovação próprias seriam novo código sensível. Essa é a necessidade concreta da única dependência nova de aplicação, a instalar somente na implementação e fixar no lock. Instalação CI passa a incluir npm ci raiz, e npm audit do gate passa a aplicar-se.

**Alternatives:** SDK googleapis completo é desnecessário; OAuth de usuário/ADC mudaria a identidade autorizada; conector do assistente não está disponível ao processo Node.

Fontes: [biblioteca oficial](https://github.com/googleapis/google-auth-library-nodejs), [JWT](https://github.com/googleapis/google-auth-library-nodejs/blob/main/src/auth/jwtclient.ts), [escopos Sheets](https://developers.google.com/workspace/sheets/api/scopes), [pacote npm](https://www.npmjs.com/package/google-auth-library). Context7: /googleapis/google-auth-library-nodejs.

## 2. Tipo definido e datas

**Decision:** spreadsheets.get com máscara incluindo effectiveValue, effectiveFormat.numberFormat.type e offsets de GridData. Não usar formattedValue como valor. Capturar resultados efetivos de fórmulas, sem fórmula como programa. Tipos escalares preservados; errorValue recusa coleta. Strings numéricas continuam strings, com avisos existentes.

**Rationale:** FORMATTED_VALUE perde o tipo que decide versões/índices. UNFORMATTED_VALUE sozinho fornece seriais de data sem toda a informação de formato necessária; GridData permite distinguir número e data.

**Alternatives:** Number em toda célula perderia IDs/zeros e mascararia erro de origem; interpretar datas pelo texto localizado seria dependente de locale.

Datas declaradas: Semanas.inicio_semana e Produções.data_prevista → dia civil; Produções.publicado_em, Agentes.sincronizado_em e Execucoes.iniciado_em/atualizado_em/concluido_em → instante. Serial base 1899-12-30, fração de dia; usar fuso IANA da planilha para instantes, arredondamento a milissegundo e round-trip civil. Exigir correspondência única de instante; horário inexistente/ambíguo ou número com formato incompatível recusa. Dia civil exige fração zero. String é preservada e avaliada pelas regras já existentes, nunca reinterpretada por locale. Outros números, inclusive duração, não viram datas.

Fontes: [spreadsheets.get](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/get), [células](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/cells), [valor estendido](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets/other), [formatos/seriais](https://developers.google.com/workspace/sheets/api/guides/formats). Context7: /websites/developers_google_workspace_sheets_api_reference_rest_v4.

## 3. Integridade e compatibilidade

**Decision:** conservar schemaVersion 1; perfil ausente = core6/source google-drive-connector; captureProfile sheets9 = exatamente nove/source google-sheets-api, com fuso/locale antes e depois. Mesmo validador/importador, hash das matrizes tipadas completas, não da projeção/linhas NTV. 66 cabeçalhos legados inalterados e 45 auxiliares próprios.

**Rationale:** v1 atual rejeita conjunto/source extra. Perfil é extensão explícita, sem aceitar subconjuntos nem converter arquivos antigos. Mudança deve ser documentada, não relaxamento silencioso. Novo runtime lê legado; binário antigo não lê sheets9.

**Alternatives:** schemaVersion 2 contraria o escopo pedido; inferir perfil pela presença de abas permitiria parcial; writer paralelo duplicaria atomicidade.

Fragmentar retângulos até 50.000 células, cobrindo colunas e linhas mesmo em grade larga. Ausências JSON são vazios somente dentro de retângulo cuja resposta/metadata foi validada; offset errado, overlap ou lacuna é erro. Grade íntegra é a união dos retângulos solicitados, não o tamanho de arrays esparsos retornados. Fuso/locale e nomes/IDs/dimensões estáveis, sem garantia transacional entre observações.

## 4. Concorrência e falhas

**Decision:** separar aquisição/liberação da mesma trava existente e a promoção interna protegida; manter promoverCaptura síncrono para CLI e executarColeta async para await. Só helpers internos pulam aquisição. Leituras de estado não adquirem writer lock. close/unlink separados preservam erro/resultado original.

**Rationale:** exclusiva atual é síncrona: receber Promise liberaria a trava cedo. Reaquisição durante promoção criaria conflito consigo mesmo. Recibos/atual.json atuais são a única autoridade.

**Alternatives:** outra trava para rede permitiria importação concorrente; TTL poderia apagar trava viva. Receber e persistir erro bruto Google é proibido.

Prazo total 90 s, por requisição 15 s; uma repetição GET para 429/5xx com espera 1 s dentro do prazo, sem reiniciar captura inteira. Transporte OAuth também sujeito ao prazo, retries automáticos desabilitados; não repetir 401/403 e não seguir redirects. Cliente e relógio falsos testam cancelamento sem esperar 90 s.

## 5. Abas reservadas e alcance HTTP

**Decision:** mínimos auxiliares em whitelist separada, chaves Coluna 1/Parâmetro/execucao_id. Validar estrutura/duplicação/tipos, preservar valores privados; não resolver cadastro em integração instalada. GET expõe só whitelist editorial existente; POST recebe apenas objeto vazio e origem local.

**Rationale:** ampliar CAMPOS indiscriminadamente ampliaria a projeção atual. Auxiliares podem conter prompts, IDs técnicos e configuração; não são dados de tela da 002.

**Alternatives:** esconder por CSS deixaria conteúdo na API; renomear Coluna 1 seria escrita/desvio da fonte.

Não foi necessário clarify: escopo/limites foram decididos pelo autor. Aceite constitucional e preparação real permanecem gates explícitos, não dúvidas disfarçadas de implementação.
