# Contrato — extensão opcional Meses

Definido em 05/10/2026 pelo reescopo do autor e implementado/testado localmente com dados sintéticos. Estende o [contrato da 002](../../002-consulta-planilhas/contracts/leitura-planilha.md); não altera seu registro histórico. [Spec](../spec.md), [modelo](../data-model.md) e [validação](../validacao.md) registram produto, dados e limites; integração real pendente.

## Entrada e compatibilidade

Envelope `schemaVersion:1`, sources Central/direta e mesmos seis nomes obrigatórios. Única opcional aceita: título exato `Meses`, mínimos por nome `mes`, `marca_id`, `objetivo`, `pautas`. Outras abas no envelope continuam recusadas; outras abas da planilha remota não são coletadas.

Quando presente, Meses está conjuntamente em `tables`, `metadataBefore` e `metadataAfter`, com `complete:true`, cabeçalho mínimo, tipos escalares permitidos e metadados/range íntegros. Mesmo mês em várias linhas não causa falha de unicidade da primeira coluna. Ausência nos três mapas é normal; presença parcial é erro de dados.

`hashCelulas` conserva a canonicalização com pares ordenados pelo nome da aba (`sort`); Meses participa nessa ordem somente quando presente. A posição final de Meses vale apenas para a apresentação da Planilha. Para toda captura antiga, hash e bytes privados já gravados permanecem os mesmos; não preencher a opcional com vazio. Hash/compare inclui toda Meses antes do filtro NTV, inclusive linhas duplicadas e colunas extras privadas.

## Coleta direta

Metadados antes → construir ranges alocados das seis obrigatórias + Meses se existir → batchGet 1 → batchGet 2 → metadados depois. Ambas as leituras cobrem o mesmo conjunto; ordem/range/tipos e hashes iguais são exigidos. Comparação final inclui presença/ausência de Meses, ID, dimensões e fuso; criação/remoção/mudança durante a coleta recusa candidata. Ausência estável da opcional não dispara request para range inexistente nem aviso.

`mes` não recebe conversão de serial; conservar texto/escalares para validação semântica. Datas das seis abas, autenticação/token, readonly, timeouts, categorias de falha e lock são os da 002. Nenhuma leitura/escrita extra no navegador.

## Triagem e avisos

Somente marca literal `ntv` entra na consulta. Aplicar aos quatro mínimos a mesma redação de texto privado existente, sem expor extras. O parser registra índice físico em WeakMap privado, recuperado por `linhaMensal(record)` na triagem, sem Map pela primeira coluna para Meses.

Agrupar por marca/mês válido: duplicata gera aviso para cada linha envolvida, aba Meses, campo mes, motivo fixo **Mês e marca repetidos**. Mês NTV inválido: campo mes, motivo **Mês inválido**. Objetivo/pautas de tipo não textual não vazio: campo correspondente, motivo **Texto mensal inválido**; no card são ausentes. Não ecoar valor no motivo. Marca diferente/ausente fica fora como nas seis abas existentes, sem aviso só por essa ausência.

Duplicata/tipo/mês inválidos são avisos semânticos e não falha da captura íntegra. Não suprimir linhas NTV da tabela nem escolher primeiro/último objetivo. Falha estrutural conserva a vigente com o contrato de recibos da 002.

## Saída HTTP e tela

Sem novas rotas ou parâmetros: POST `/api/atualizar {}` mantém guardas/resultados; GET `/api/visao` continua sem rede/escrita. A raiz atual e `captura`/contagens/semanais permanecem; Meses entra apenas em `planilha` e os avisos em `avisos` existentes.

Tabela opcional no formato `{nome, cabecalhos, quantidadeLinhas, linhas}` definido no modelo. Se ausente, não há entrada Meses. Card filtra pelo `state.mes` exibido, independentemente do dia atual e sem usar objetivo das semanas: zero → Ainda não definido; uma → objetivo/lista; duas ou mais → A confirmar e nenhuma lista arbitrária. Objetivo textual vazio também indefinido; pautas válidas continuam visíveis.

Pautas: dividir por LF/CRLF, trim, descartar linhas vazias, manter ordem/repetições; primeiras cinco e `+N` igual ao total menos cinco quando positivo. A célula completa permanece na tabela. Sem link/execução/HTML derivado de célula; `textContent` e guards existentes. Meses depois das seis tabelas e antes de Histórico, com teclado/rolagem/foco e fallback quando desaparecer. Selo/horário e falhas preservados.
