# Contrato — coleta direta e consulta local (extensão explícita do v1)

2026-10-05. Planejado, não implementado. Este documento acrescenta a coleta/perfil da 002 ao [contrato v1 da 001](../../001-consulta-local-producao/contracts/captura-e-consulta.md); não redefine quadro, vigência editorial, supressão de texto ou apresentação das seis tabelas.

## Envelope privado e compatibilidade

schemaVersion permanece inteiro 1. Ausência de captureProfile mantém exatamente o envelope legado, source google-drive-connector e seis abas. captureProfile literal sheets9 exige source google-sheets-api e exatamente nove nomes em tables/metadataBefore/metadataAfter: Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes, Agentes, Controle, Execucoes. Qualquer outro perfil/conjunto/source é erro. Não inferir perfil nem aceitar sete/oito abas.

Campos/restrições do [modelo](../data-model.md) obrigatórios. O perfil sheets9 acrescenta spreadsheetPropertiesBefore/After {timeZone,locale}, ambos iguais e válidos. Os 66 cabeçalhos antigos não mudam; os 45 privados auxiliares estão enumerados no modelo. Mesma função validarCaptura e mesmo promoverCaptura; CLI por arquivo aceita os dois perfis. Hash legado não inclui campos novos nem muda normalização. Novo runtime lê ambos; binário da 001 não lê sheets9. Não converter arquivos antigos para rollback.

## Coleta e integridade

1. Obter metadados dos nove nomes, IDs, grade, fuso e locale. Nome duplicado/ausente ou dimensões inválidas é erro.
2. Ler cada aba inteira A1:última-coluna+última-linha alocada, em retângulos de até 50.000 células; fragmentar nas duas dimensões quando preciso. Título A1 escapado conforme API, identidade validada por sheetId. Máscara inclui offsets, effectiveValue e effectiveFormat.numberFormat.type; includeGridData sozinho não basta com máscara.
3. Reconstruir matriz posicionando blocos pelos offsets, com nulls internos. Resposta esparsa omite somente vazios conforme semântica API; validar intervalo solicitado, offsets/IDs, bounds, cobertura/overlap. HTTP 200 com resposta estruturalmente inválida ou truncada não é captura completa.
4. Decodificar tipos deterministicamente conforme seção seguinte. Só finais vazios podem ser omitidos, conforme v1; extras/linhas de outras marcas também entram no hash privado.
5. Calcular firstReadSha256 em código: UTF-8 JSON compacto da lista de pares nome/{sheetId,range,values}, nomes ordenados ordinalmente e chaves na ordem sheetId,range,values. Mesma canonicalização legada; não hashear projeção, metadados temporais ou contagens.
6. Fazer segunda leitura completa independente, mesma cobertura/decodificação, e secondReadSha256; não repetir cache da primeira. Envelope contém tables da segunda e hashes iguais.
7. Obter metadados depois; comparar nomes/IDs/dimensões/fuso/locale aos anteriores. Divergência ou hashes diferentes retorna CONFLITO_FONTE. Não salvar candidata válida.
8. completedAt após última metadata; readAt dentro de startedAt/completedAt. Passar pelo validador de envelope, identidades, tempo e mesmo mecanismo de promoção/recibo. Nunca salvar brutos antes de validar.

Limitação: Sheets não fornece transação entre as abas; duas observações iguais não provam ausência de alteração transitória revertida entre elas. A 002 não promete snapshot atômico remoto.

## Decodificação tipada

- effectiveValue.numberValue → número finito; stringValue → string intacta; boolValue → booleano; célula efetivamente vazia → null; errorValue → CAPTURA_INVALIDA. Sem avaliação de fórmulas ou coerção de string.
- Datas civis: Semanas.inicio_semana e Produções.data_prevista. Se numberValue e formato DATE/DATE_TIME com fração zero: serial base 1899-12-30 → YYYY-MM-DD por calendário civil, sem deslocar o dia pelo fuso do SO.
- Instantes: Produções.publicado_em, Agentes.sincronizado_em, Execucoes.iniciado_em/atualizado_em/concluido_em. numberValue exige DATE/DATE_TIME; parte inteira + fração arredondada a milissegundo dão horário civil no timeZone da fonte. Converter a UTC ISO Z com round-trip civil e correspondência única; horário inexistente/ambíguo, serial não finito/fora de ano 0001–9999 ou formato incompatível recusa coleta.
- Strings desses campos permanecem idênticas; as regras de data/avisos do validador editorial continuam. Campo numérico marcado como data incorretamente é erro da origem, sem correção remota. Demais números, inclusive durações, não viram datas.
- A normalização faz parte da construção do envelope, antes dos dois hashes; o hash não deve ser recalculado sobre formato bruto diferente. Capturas da Central existentes mantêm seus bytes/tipos.

## Configuração e cliente Google

Configuração servidor: CRM_GOOGLE_CREDENTIALS_FILE + CRM_SPREADSHEET_ID. Chave absoluta/realpath fora da raiz Git, arquivo regular; recusar links/junções que resolvam dentro dela. Validar JSON service_account e campos sem logá-los; nada de ADC, subject, identity do usuário, gcloud ou metadata server. Biblioteca JWT oficial com escopo único readonly, endpoint https://oauth2.googleapis.com/token e host Sheets https://sheets.googleapis.com. Ignorar/rejeitar URI de token/universe diferente desses valores padrão, sem configurá-los a partir de célula/navegador.

Cliente injetável: getMetadata({signal}) e readGridRange({sheetId,title,range,signal}). Testes usam objeto falso e transporte falso; nunca rede Google. Transporte envia token em Authorization, não query. Só GET de Sheets e POST do token; não há cliente de escrita/Drive. Requisições/erros/logs não expõem URL com ID, headers, chave, token ou payload de célula.

Prazo 90 s total incluindo autenticação, espera, leituras e promoção; timeout 15 s por requisição; no máximo uma repetição GET para 429/5xx com espera 1 s e orçamento restante. Sem retry implícito da biblioteca, sem repetir 401/403, sem redirects. Abort deve impedir leituras adicionais/promoção depois do deadline; conclusão de I/O já confirmada não pode ser descrita retroativamente como não promovida. Checar prazo imediatamente antes de confirmar, sem afirmar poder cancelar rename síncrono.

## Persistência e exclusão mútua

promoverCaptura(raw,dataDir) permanece síncrono e adquire .importacao.lock. Nova executarColeta(dataDir,operation) adquire a mesma trava, await operation, valida/promove ou registra motivo fixo por helpers internos já protegidos. Não chama promoverCaptura para reacquirir. O lock dura até confirmar/recusar e é liberado em finally; close/unlink separados, só própria trava, preservar erro/resultado original e acrescentar aviso seguro se cleanup falhar.

Lock em uso → conflito sem iniciar rede e sem criar recibo concorrente. Estado ilegível/recibo não confirmável → resposta segura sem afirmar falha durável. Regras anteriores de futuro ≤10 min, desatualizada, colisão, no-op, recibos imutáveis e órfãos permanecem. Só nova captura completa aceita encerra falha ativa; GET/no-op não renova completedAt nem limpa erro.

## HTTP e interface

GET /api/visao preserva contrato da 001: somente ler estado/projetar, zero Google e zero escrita. Estáticos permanecem allowlist. Servidor bind em 127.0.0.1 e porta configurada.

POST /api/atualizar:
- Host exatamente 127.0.0.1:porta; Origin obrigatória exatamente http://127.0.0.1:porta. Sec-Fetch-Site, quando presente, deve ser same-origin. Sem CORS; rejeitar Origin ausente, externa, null ou host alternativo.
- Content-Type application/json (charset opcional UTF-8); corpo literal objeto vazio {} até 1 KiB. Sem planilha, caminho, URL, credencial, parâmetros ou extra keys. Query não aceita. Método alternativo 405; payload/tipo inválido 400/415; excesso 413; origem 403. Não ler credenciais nem iniciar rede em requisição recusada.
- Retorno 200: {resultado:completa|sem_alteracao, mensagem: texto fixo seguro}; UI relê GET. Não retorna captura bruta ou campos privados.
- 409: TRAVA_OCUPADA ou CONFLITO_FONTE; 503: CONFIGURACAO, ACESSO_NEGADO, INDISPONIVEL ou PERSISTENCIA; 504: PRAZO; 422: CAPTURA_INVALIDA ou DESATUALIZADA. Corpo {resultado:falhou,codigo,mensagem,registrada:boolean}; somente enum/textos fixos, sem exceção Google.
- Falha duravelmente confirmada usa registrada true e o GET mostra recibo/selo; conflito de trava e falha de confirmação usam false, mantendo estado anterior e aviso de resposta. Código de limpeza é aviso sem trocar resultado original.

Configuração indisponível pode ser registrada como falha se estado/trava/persistência permitirem; não impede servidor/GET/importação por arquivo. GET posterior mantém failure até captura nova aceita. Falha inicial com estado vazio segue navegável.

Botão comum → POST → GET para estado confirmado, inclusive após falha registrada. Desabilitar até ambos concluírem; texto curto Atualizando dados; falha de GET não destrói visão anterior. Não prometer atualização se POST falhou. Fonte pública controlada por source: Captura pela Central / Leitura direta pelo servidor local. Sem Google no navegador. Auxiliares e propriedades privadas do perfil nunca entram na API/HTML. Supressão existente de texto/URL sensível continua; não reintroduzir conteúdo bruto nos erros.

## Preparação do autor e aceite

Autor cria conta de serviço, habilita Sheets API, gera chave fora do checkout e compartilha planilha como **Leitor**. Não pedir, colar ou versionar chave/email/ID. Sem papel IAM amplo ou acesso Drive necessário para esta feature. Passos no [quickstart](../quickstart.md).

Emenda aprovada bloqueia implementação; preparação da conta bloqueia somente demonstração real. Testes de nove abas, 111 cabeçalhos, ordem da coleta, hashes, tipos/datas, perfil legado, falhas/lock, origem HTTP e privacidade usam somente fake. Evidências públicas reais limitadas a contagens/resultados/capturaId/horário, nunca células ou metadados privados.
