# Feature Specification: Pautas no Planejamento

**Feature Branch**: `codex/004-pautas-planejamento`
**Created**: 2026-10-07
**Status**: Implementada, testada e entregue no PR #20; 15/15 tarefas, gate estrito e review do código conferidos; sem merge. Checks vigentes no PR.
**Input**: Consulta opcional de Pautas e origem semanal no CRM pessoal; até 15 tarefas, fixtures sintéticas e um PR sem merge.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entender o mês e chegar à semana (Priority: P1)
O autor vê objetivo e pautas do mês exibido e chega à semana escolhida em uma ação.
**Why this priority**: Une estratégia mensal ao calendário existente.
**Independent Test**: Quatro pautas sintéticas, seleção semanal e mês sem pautas.
**Acceptance Scenarios**:
1. **Given** quatro pautas do mês, **When** abrir Planejamento, **Then** conserva o objetivo e mostra linhas `S1 · tema · modelo do carrossel · status`, ordenadas por semana.
2. **Given** origem `autor`, **When** consultar a linha, **Then** aparece o selo `do autor`.
3. **Given** pauta válida, mesmo sem peças, **When** ativá-la por mouse/teclado, **Then** sua semana fica visível e recebe foco no calendário ou na lista usada em tela pequena.
4. **Given** mês sem pautas estruturadas, **When** consultar, **Then** permanece o card da 003, incluindo resumo textual de Meses e tratamentos de objetivo ausente/duplicado.

### User Story 2 - Identificar a origem da semana (Priority: P2)
O autor reconhece de qual pauta veio a semana e o dia consultado.
**Why this priority**: Dá contexto com pouco texto.
**Independent Test**: S2 de novembro, ponteiro órfão e dia com peças de semanas distintas.
**Acceptance Scenarios**:
1. **Given** vínculo válido, **When** ver a semana no calendário/lista ou a gaveta do dia, **Then** aparece `Pauta S2 de novembro`.
2. **Given** ponteiro preenchido ausente, ambíguo ou incoerente, **When** consultar, **Then** há aviso em Semanas/pauta_id sem origem inventada.
3. **Given** dia com mais de uma semana, **When** abrir a gaveta, **Then** cada origem confirmada aparece uma vez.
4. **Given** dia sem peças dentro do período de uma semana vinculada, **When** abrir a gaveta, **Then** aparece a origem já confirmada dessa semana; fora de seus períodos nenhuma origem é inferida.

### User Story 3 - Conferir dados e preservar capturas antigas (Priority: P3)
O autor consulta Pautas na Planilha e continua usando capturas antigas.
**Why this priority**: Mantém fonte única e compatibilidade.
**Independent Test**: Importação por arquivo e coleta falsa, com/sem opcionais.
**Acceptance Scenarios**:
1. **Given** Pautas presente, **When** importar/atualizar, **Then** seus doze campos aparecem na Planilha para a marca do CRM.
2. **Given** ausência de Pautas ou Semanas.pauta_id, **When** consultar, **Then** os fluxos anteriores continuam funcionando.
3. **Given** leitura incompleta, inconsistente ou identidade insegura, **When** importar/atualizar, **Then** conserva captura/data vigentes e informa falha.

### Edge Cases
- Pautas sem Meses mostra pautas e objetivo ainda não definido; aba vazia com cabeçalhos é válida.
- Cabeçalho obrigatório ausente ou metadados divergentes recusam captura inteira.
- IDs duplicados ou mesma marca/início duplicados geram avisos físicos, sem escolher primeira linha.
- Mês inválido, ordinal fora de 1–4, data impossível ou início diferente da segunda-feira de mesmo ordinal no mês ficam conferíveis na Planilha, com aviso e sem destino inventado.
- Modelo/origem/status desconhecidos permanecem texto da fonte com aviso, sem alterar publicação; campos livres não executam HTML.
- Semana cruzando meses pertence ao mês de seu início; nenhuma quinta pauta é inferida.
- Ponteiro vazio não avisa; outra marca/data incompatível não confirma origem.

## Requirements *(mandatory)*
### Functional Requirements
- **FR-001**: Captura direta/arquivo reconhece Pautas opcional com mínimos `pauta_id, marca_id, mes, semana, inicio_semana, tema, mensagem, modelo_carrossel, oferta, origem, status, observacao`.
- **FR-002**: Semanas.pauta_id é opcional; preservar IDs sem preenchimento retroativo.
- **FR-003**: Card do mês mostra objetivo, linhas compactas de Pautas, selo autor e navegação; mês sem pautas conserva fallback da 003.
- **FR-004**: Origem semanal confirmada no calendário/lista e gaveta; vínculo órfão/ambíguo/incoerente gera aviso sem reproduzir valor privado no motivo.
- **FR-005**: Planilha inclui Pautas e coluna semanal somente quando capturadas, com teclado, contagens e avisos físicos.
- **FR-006**: Preservar integridade, hashes/bytes históricos, falhas, frescor, histórico, separação entre marcas e redação de dados sensíveis.
- **FR-007**: Temas claro/escuro, 1440/390, acesso por teclado e sem corte horizontal da página.
- **FR-008**: CRM local somente observador, sem agenda, escrita operacional, dependências novas, leitura de notas ou cópia do contrato externo da operação.
- **FR-009**: Somente fixtures sintéticas; um PR com gate/review e screenshots; sem merge.

### Key Entities
- **Pauta**: identidade, marca, mês, ordinal, início, tema, mensagem, modelo, oferta, origem, status e observação capturados.
- **Semana**: registro existente com ponteiro opcional para pauta da mesma marca e início.
- **Mês**: objetivo/resumo existentes; Pautas assume a lista quando houver linhas para o mês.

## Success Criteria *(mandatory)*
### Measurable Outcomes
- **SC-001**: Quatro pautas aparecem no mês correto e cada linha leva à semana em uma ativação, mesmo sem peças.
- **SC-002**: 100% das origens e ponteiros órfãos dos cenários aparecem respectivamente como contexto ou aviso.
- **SC-003**: Capturas antigas com seis abas/com Meses mantêm bytes/hashes; falhas novas preservam vigente.
- **SC-004**: Cinco camadas locais passam sem pulos; três cenários × duas larguras × dois temas = pelo menos 12 imagens.
- **SC-005**: Até 15 tarefas; um PR com gate verde e review sem Critical, segurança ou regressão para avaliação do autor.

## Assumptions
- Pedido autoriza escopo e execução; esclarecer apenas lacunas reais, sem novos ciclos de aprovação.
- IDs opacos preservados; semana 1–4; início é a segunda-feira de mesmo ordinal dentro do mês.
- Linhas semanticamente inválidas permanecem na Planilha; só identidade/calendário unívocos habilitam navegação e origem.
- Backlog anterior de revisões/biblioteca passa a 005/006; nenhum desses comportamentos entra na 004.
