# Feature Specification: Consulta do planejamento mensal

**Feature Branch**: `003-planejamento-mensal`
**Created**: 2026-10-05
**Status**: Reescopo definido pelo autor em 05/10/2026; implementada e testada localmente com dados sintéticos. Evidências e limitações em [validacao.md](validacao.md); demonstração real pendente.
**Input**: O CRM pessoal apenas lê a aba opcional `Meses`, preenchida à mão pelo autor, e mostra objetivo e pautas do mês. A decisão substitui integralmente o rascunho anterior. Fluxo de agentes, repasse ao Diretor e migração da meta semanal ficam fora do CRM. O autor autorizou implementação, push e PR; T021/aceite da 002 bloqueia somente o merge da 003.

## Contexto e limites

O autor organiza o conteúdo do mês na planilha e consulta no CRM local da NTV. A aba **Meses** tem somente quatro colunas mínimas: **mes** (`AAAA-MM`), **marca_id**, **objetivo** e **pautas** (uma por linha dentro da célula). O autor cria/preenche a aba; o CRM nunca escreve.

Sem a aba, as capturas das 001/002 e da Central continuam válidas e o card mostra **Ainda não definido**. Não há nova entidade de campanha, vínculo mensal com semana, versão editorial mensal, ação no card, agente instalado, edição pelo CRM, agenda, geração, publicação ou mudança da meta semanal. Multimarcas, multiusuário, escala e telas da v2 permanecem fora. A [constituição 1.1.0](../../.specify/memory/constitution.md) permanece vigente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Consultar o objetivo e as pautas do mês (Priority: P1)

Como autor, quero ver o objetivo e as pautas do mês exibido em Planejamento para organizar meu conteúdo com pouco texto.

**Why this priority**: É o único novo valor do planejamento mensal; reutiliza a tela e o card existentes.
**Independent Test**: Abrir Planejamento com captura sintética contendo Meses e navegar entre dois meses, sem acesso remoto.

**Acceptance Scenarios**:

1. **Given** uma única linha para o mês exibido e a NTV, **When** abre Planejamento ou troca de mês, **Then** o card **Objetivo do mês** mostra o objetivo correspondente e até cinco pautas, na ordem da célula; pautas restantes aparecem como **+N**.
2. **Given** aba ausente, vazia ou sem linha para esse mês/marca, **When** consulta o mês, **Then** o card mostra **Ainda não definido**, sem objetivo inferido de temas semanais.
3. **Given** duas ou mais linhas para a mesma marca e mês, mesmo com textos iguais, **When** consulta o mês, **Then** o card mostra **A confirmar**, sem escolher objetivo/pautas de uma linha, e os avisos localizados ficam na Planilha.
4. **Given** uma linha com objetivo vazio e pautas preenchidas, **When** consulta o mês, **Then** o objetivo mostra **Ainda não definido** e as pautas válidas continuam na lista curta. Linhas vazias dentro da célula de pautas não contam no **+N**.

### User Story 2 — Atualizar incluindo Meses sem perder compatibilidade (Priority: P2)

Como autor, quero que **Atualizar dados** leia Meses se existir e preserve a consulta anterior quando a atualização falhar.

**Why this priority**: Reutiliza a leitura direta já implementada pela 002, mantendo a importação da Central.
**Independent Test**: Cliente falso e captura sintética em TEMP, com seis abas obrigatórias e Meses presente/ausente; nenhum Google real.

**Acceptance Scenarios**:

1. **Given** Meses existente, **When** atualiza pela leitura direta, **Then** ela participa da mesma verificação de integridade das demais abas e o novo objetivo só aparece depois da captura íntegra aceita.
2. **Given** Meses ausente durante toda a coleta ou uma captura antiga da Central sem Meses, **When** atualiza/importa, **Then** as seis abas obrigatórias continuam válidas, sem aviso por ausência da opcional e sem reescrever arquivos antigos.
3. **Given** mudança de presença/conteúdo entre leituras ou Meses presente estruturalmente incompleta, **When** atualiza, **Then** a candidata é recusada e a captura vigente, seu horário e o comportamento de falha/Histórico da 002 são preservados.
4. **Given** somente Meses mudou em uma captura nova válida, **When** atualiza, **Then** a mudança não é tratada como sem alteração. Repetir a mesma captura aceita não duplica tentativa.

### User Story 3 — Conferir Meses e seus avisos na Planilha (Priority: P3)

Como autor, quero consultar a tabela Meses e localizar linhas duplicadas na mesma tela das outras abas.

**Why this priority**: Mantém os avisos fora do card e permite ler todas as pautas na célula original.
**Independent Test**: Captura sintética com Meses e duplicatas; abrir Planilha por teclado em desktop e 390 px.

**Acceptance Scenarios**:

1. **Given** Meses capturada, inclusive apenas com cabeçalhos, **When** abre Planilha, **Then** vê a aba Meses depois das seis tabelas e antes de Histórico, com as quatro colunas mínimas, contagem NTV, rolagem e teclado como as outras.
2. **Given** duplicatas para mês/marca, **When** consulta os avisos, **Then** identifica cada linha envolvida em Meses sem perder nenhuma delas; a captura permanece válida e as demais tabelas não são filtradas pelo aviso.
3. **Given** a captura seguinte não contém Meses e a aba estava selecionada, **When** a consulta é atualizada, **Then** a seleção retorna a uma aba disponível sem esconder Histórico ou deixar uma tela vazia.

### Edge Cases

- Mês `AAAA-MM` inválido em linha NTV gera aviso localizado e não entra na seleção do card. Objetivo/pautas de tipo inválido geram aviso e são tratados como texto ausente no card, sem converter número/bool em objetivo ou pauta. Como na consulta existente, somente `marca_id` literal `ntv` entra na seleção; marca ausente ou diferente fica fora, sem aviso por esse motivo.
- Objetivo vazio não é zero; pauta vazia não cria item. LF e CRLF separam pautas, espaços de borda/linhas vazias são ignorados e a ordem é preservada, sem deduplicar textos iguais.
- Meses presente com cabeçalho obrigatório ausente, metadata/range incompleto ou hash divergente é falha estrutural. Ausência estável da aba é normal; presença só em parte da captura é inválida.
- Duas linhas do mesmo mês com marcas diferentes não são duplicatas da NTV. Duplicata é a combinação de marca/mês, nunca a primeira coluna isolada.
- Dados mensais são texto de consulta, inclusive conteúdo que parece HTML ou URL; não executam, criam links ou carregam mídia. A redação de texto privado da triagem existente continua aplicável.
- Uma captura antiga sem Meses, aceita depois de uma com Meses conforme as regras temporais existentes, não herda o objetivo anterior: o card reflete exclusivamente a captura vigente e mostra **Ainda não definido**.
- Nenhuma pauta vira produção, data prevista ou ajuste da semana; peças históricas e imagem B continuam como estão.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O CRM DEVE consultar a aba opcional **Meses** com somente as colunas mínimas **mes**, **marca_id**, **objetivo**, **pautas**, criada e preenchida manualmente pelo autor. Não DEVE exigir campos extras nem escrever na fonte.
- **FR-002**: Capturas sem Meses DEVEM continuar válidas com as seis abas obrigatórias das 001/002, inclusive pelo caminho da Central. A ausência estável não DEVE causar aviso de dados nem migração/regravação de arquivos históricos.
- **FR-003**: **Atualizar dados** DEVE incluir Meses quando existir, usando a mesma coleta íntegra da 002; mudança de presença/conteúdo durante a coleta ou falha estrutural DEVE preservar captura vigente/data e registrar a falha pelas regras existentes. Consulta local não DEVE buscar Google.
- **FR-004**: O card **Objetivo do mês** DEVE acompanhar o mês exibido em Planejamento e a marca NTV. Uma linha correspondente mostra seu objetivo; ausência de linha ou objetivo vazio mostra **Ainda não definido**.
- **FR-005**: As pautas DEVEM aparecer como lista de no máximo cinco linhas não vazias, na ordem original, com **+N** para o restante. A célula completa DEVE permanecer consultável na Planilha; não adicionar botão de plano, editor ou campos extras no card.
- **FR-006**: Duas ou mais linhas para o mesmo mês/marca DEVEM gerar aviso de dados localizado na Planilha e estado **A confirmar** no card, sem objetivo/pautas arbitrários, sem sobrescrever linhas e sem invalidar uma captura estruturalmente íntegra.
- **FR-007**: A aba Meses DEVE aparecer na Planilha somente quando capturada, mesmo vazia, com as quatro colunas, contagem NTV e os comportamentos existentes de teclado, foco, seleção e rolagem. Avisos DEVEM ficar no painel existente; nenhum texto de aviso longo no card.
- **FR-008**: Dados mensais inválidos DEVEM produzir avisos localizados, sem associação inventada; textos DEVEM seguir a triagem/privacidade da consulta existente. Nenhum dado real, identificador de planilha, e-mail de conta ou segredo DEVE entrar em arquivo versionado, exemplo público ou log.
- **FR-009**: A consulta DEVE preservar navegação mensal, calendário/lista, filtros, gaveta, semanas/peças históricas, selo e Histórico existentes. Reentrada da mesma captura não DEVE duplicar tentativa nem renovar horário; alteração somente em Meses DEVE ser reconhecida.
- **FR-010**: A tarefa manual do autor DEVE orientar criação da aba e preenchimento do mês atual, sem bloquear implementação ou testes com fixtures sintéticas. Conforme autorização atual do autor, implementação, push e PR da 003 podem avançar; T021/aceite da 002 DEVE bloquear somente o merge. Criação/preenchimento de Meses e demonstração real da 003 continuam tarefas pendentes, sem escrita operacional pelo CRM.

### Key Entities *(include if feature involves data)*

- **Linha de Meses**: mês civil textual `AAAA-MM`, marca, objetivo textual e pautas textuais separadas por quebras de linha. Marca/mês formam a chave de consulta; duplicatas são preservadas e avisadas, sem novo ID de linha ou versão editorial.
- **Captura**: envelope vigente da operação, com seis abas obrigatórias e Meses opcional. Origem, integridade e horário continuam os da captura; não há fonte mensal independente.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em dois meses sintéticos distintos, trocar o mês mostra o objetivo correto; aba/linha ausente e objetivo vazio mostram **Ainda não definido**, sem inferência.
- **SC-002**: Células sintéticas com 0, 5 e 7 pautas mostram respectivamente 0, 5 e 5 itens; a última mostra **+2**. Linhas vazias e CRLF não alteram a contagem esperada.
- **SC-003**: Em duplicata sintética de marca/mês, o card mostra **A confirmar**, todas as linhas aparecem na Planilha e cada linha envolvida tem aviso; mesmo mês de outra marca não cria conflito NTV.
- **SC-004**: Capturas sintéticas antigas da 001/002/Central mantêm importação, hash, horário e seis tabelas; captura nova com Meses inclui a opcional na integridade, e mudança somente nela é percebida. Falha preserva a vigente.
- **SC-005**: Card e tabela funcionam em 1440/390 px sem corte horizontal da página; a aba Meses e os avisos funcionam por teclado, e a seleção se recupera quando a opcional desaparece.
- **SC-006**: Testes das cinco camadas usam somente fixtures/fakes/TEMP; nenhuma consulta ou teste escreve no Google, altera agentes/workflows/metas, produz mídia ou publica.

## Assumptions

- Um autor, NTV e servidor local existente; nenhuma dependência ou infraestrutura nova. Objetivo e pautas são informação manual, não prova de decisão/execução editorial.
- `mes` é texto com ano de quatro dígitos e mês entre 01 e 12; o autor formata a coluna como texto. A chave é marca/mês, sem vínculo inferido com semanas.
- Cabeçalhos mínimos são lidos por nome; colunas extras não são expostas pela consulta. Texto de pautas preserva a célula original na tabela, enquanto o card deriva a lista curta.
- A tarefa manual de preparar Meses é do autor. Ausência da aba não bloqueia implementação, testes ou consulta; T021/aceite da 002 permanece pré-requisito do merge, conforme autorização atual.
- Escopo decidido pelo autor; não restou dúvida real para `speckit-clarify`. Operação de agentes e migração semanal não fazem parte de requisitos, plano ou tarefas do CRM.
