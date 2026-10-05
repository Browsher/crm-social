# Feature Specification: Planejamento mensal e repasse ao Diretor

**Feature Branch**: `003-planejamento-mensal`

**Created**: 2026-10-05

**Status**: Rascunho; clarify aguarda respostas do autor. Somente especificação.

**Input**: Organizar o conteúdo do mês no CRM pessoal da NTV, conforme a seção 003 do [ROADMAP](../../ROADMAP.md#003--planejamento-mensal-e-repasse-ao-diretor) e as [telas decididas](../../docs/design/telas.md). Exibir objetivo, pautas sugeridas e origem mensal das semanas. Propor o caminho entre autor, Estrategista Mensal, Central e Diretor sem decidir as lacunas pelo autor. Implementação condicionada à demonstração real T021 da 002; nenhum plano de implementação ou tarefas nesta rodada.

## Contexto e limites

O autor precisa entender o que pretende comunicar no mês e como cada semana contribui para esse objetivo. O CRM continua local, de uso pessoal e somente consulta: apresenta o que foi registrado e distingue propostas de decisões. Planilha e Drive mantêm sua autoridade conforme a [constituição 1.1.0](../../.specify/memory/constitution.md).

O mínimo é um objetivo curto, pautas para as semanas do mês e a ligação de cada recorte semanal à versão mensal que o originou. Tudo permanece na tela Planejamento existente, com detalhes por clique. Não entram edição do plano pelo CRM, pedidos de ajuste da 004, prévias da 005, Equipe/Workflow da v2, multimarcas, multiusuário, métricas comerciais, campanhas complexas ou planejamento de capacidade/escala.

O Estrategista Mensal é um perfil proposto para delegação pela Central; não está instalado por esta spec. O Diretor criativo já detalha a semana; a Central recebe e registra os retornos. Não há novo coordenador, agenda, escritor operacional ou comando de geração/publicação no CRM.

### Proposta de origem e repasse — ainda não aprovada

1. O autor fornece uma orientação curta para o mês: prioridade de comunicação e restrições que quiser informar. O Estrategista Mensal, delegado pela Central, propõe o objetivo e pautas usando essa orientação, a marca e o histórico disponível; hipóteses ficam explícitas. A origem dessa orientação depende de Q1.
2. A Central confere o retorno editorial, mantém o documento mensal no Drive e registra sua referência, identidade, versão e vigência na fonte operacional. Trata-se de uma proposta de responsabilidade, sem definir novas abas, campos técnicos ou executar qualquer escrita. O CRM consulta esse registro pela captura autorizada, sem interpretar documento livre como decisão vigente.
3. A Central entrega ao Diretor apenas o recorte da semana, objetivo, pauta e referência à versão mensal de origem. A recomendação é aproveitar a preparação semanal existente de sexta-feira às 09h, em `America/Sao_Paulo`, sem criar agenda mensal. O modo de repasse depende de Q2.
4. O Diretor detalha tema e briefings semanais, podendo ajustar a pauta com justificativa; a Central registra o retorno. A proposta mensal anterior e a versão usada pela semana permanecem consultáveis. Nova versão mensal não reescreve semanas já vinculadas.

Este fluxo é uma proposta para o autor avaliar. A captura atual da 002 contém seis abas e não possui o contrato mensal: sua existência ou capacidade não é presumida. Uma instalação futura de perfil, alteração de prompts ou migração operacional requer escopo e evidência próprios.

## Clarifications

### Session 2026-10-05

Análise do `speckit-clarify` iniciada. Três perguntas selecionadas; nenhuma respondida. As recomendações abaixo são propostas, não decisões. As perguntas são apresentadas juntas para respeitar o pedido do autor de parar nesta etapa.

- **Q1 — Origem do objetivo:** [NEEDS CLARIFICATION: O objetivo do mês deve partir de uma orientação curta sua ou de uma proposta do Estrategista baseada na marca e no histórico?] **Recomendação A:** orientação curta do autor → proposta do Estrategista → registro pela Central; mantém a prioridade pessoal explícita. **Alternativa B:** Estrategista propõe sem orientação inicial, identificando o objetivo como sugestão para o autor avaliar. Sem fonte suficiente, não inventar objetivo vigente.
- **Q2 — Repasse semanal:** [NEEDS CLARIFICATION: A Central deve repassar o recorte mensal ao Diretor na preparação semanal existente ou apenas quando você solicitar cada semana?] **Recomendação A:** aproveitar a preparação existente de sexta às 09h, usando somente a versão mensal identificada como vigente na fonte; evita outra agenda e mantém o encadeamento atual. **Alternativa B:** pedido manual do autor à Central para cada semana; dá controle a cada repasse, com mais intervenção. Nenhuma opção cria botão de execução no CRM; falta de versão vigente gera pendência, sem escolha automática entre propostas.
- **Q3 — Transição da meta:** [NEEDS CLARIFICATION: A meta de uma imagem, um carrossel e um Reels deve valer somente para semanas novas ou também para semanas já planejadas e ainda não iniciadas?] Ambas as opções dependem de migração explícita dos contratos, documentos, perfis e consumidores. **Recomendação A:** somente semanas novas após a migração conferida; preserva o combinado das semanas existentes. **Alternativa B:** incluir semanas planejadas ainda não iniciadas, mediante nova versão e justificativa, preservando o registro anterior. Semanas em produção ou históricas e suas imagens B permanecem preservadas em ambas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Entender o objetivo e as pautas do mês (Priority: P1)

Como autor, quero consultar o objetivo e as pautas do mês em Planejamento para organizar meu conteúdo sem procurar documentos de várias semanas.

**Why this priority**: O objetivo mensal é o valor principal da 003; não exige novos controles operacionais.

**Independent Test**: Usar registros sintéticos de um mês com plano e outro sem plano; conferir o card e o detalhe mensal sem precisar executar o fluxo editorial.

**Acceptance Scenarios**:

1. **Given** um plano mensal vigente registrado com origem e versão, **When** o autor abre o mês correspondente, **Then** vê o objetivo curto e pode abrir o detalhe com pautas, versão, origem e semanas vinculadas.
2. **Given** um mês sem plano registrado, **When** abre Planejamento, **Then** vê **Ainda não definido**, sem objetivo inferido dos temas semanais e sem botão que abra um plano inexistente.
3. **Given** pautas, hipóteses ou datas apenas sugeridas, **When** abre o plano, **Then** cada sugestão aparece identificada e não passa a ser produção criada, data prevista confirmada ou publicação.

### User Story 2 — Conferir como a semana veio do mês (Priority: P2)

Como autor, quero ligar a semana ao plano mensal e entender os ajustes do Diretor para conferir se o conteúdo segue a intenção original.

**Why this priority**: Evita perder a intenção mensal quando a semana é detalhada ou ajustada.

**Independent Test**: Consultar uma semana sintética vinculada a uma versão mensal, com pauta original e ajuste justificado, sem gerar ou alterar produção.

**Acceptance Scenarios**:

1. **Given** uma semana vinculada a uma versão mensal, **When** o autor consulta seu detalhe em Planejamento, **Then** pode abrir essa origem e comparar a pauta mensal com o recorte semanal registrado.
2. **Given** um ajuste semanal registrado pelo Diretor via Central, **When** consulta a semana, **Then** vê o recorte atual e a justificativa, e consegue consultar a proposta mensal original sem sobrescrita.
3. **Given** uma nova versão mensal e uma semana ligada à anterior, **When** consulta a semana, **Then** a origem continua sendo a versão usada, até haver novo vínculo explicitamente registrado; o CRM não promove o vínculo sozinho.
4. **Given** uma semana sem vínculo mensal confirmado, **When** a consulta, **Then** vê **Origem mensal não registrada**, mantendo suas peças e tema existentes; a consulta não afirma repasse ao Diretor pelo simples calendário ou responsável.

### User Story 3 — Manter confiança na consulta e no histórico (Priority: P3)

Como autor, quero que versões, sugestões e falhas permaneçam distinguíveis para não planejar com uma informação incompleta nem perder semanas antigas.

**Why this priority**: A utilidade do plano depende de sua origem, sem alterar o funcionamento já aceito nas 001–002.

**Independent Test**: Reapresentar a mesma origem mensal, simular fonte mensal inválida e consultar semanas antigas com duas imagens; comparar contagens, versões e datas preservadas.

**Acceptance Scenarios**:

1. **Given** o mesmo mês, versão e origens já registrados, **When** ocorre reentrada editorial ou releitura, **Then** não surge novo mês, semana ou entrega pelo simples reenvio, nem duplicação na consulta.
2. **Given** falha ou informação mensal incompleta, **When** atualiza a consulta, **Then** a última captura válida e sua data permanecem, a falha é identificada e não aparece sincronização concluída nem plano vazio como resultado válido.
3. **Given** uma semana histórica com imagens A e B, **When** consulta a semana após a migração futura, **Then** ambas permanecem visíveis, com identidade, origem e versão preservadas, sem conversão para a nova meta.

### Edge Cases

- Semana que cruza meses aparece uma vez por identidade semanal; o vínculo mensal vem do registro, não do mês da data de publicação ou de uma inferência do CRM.
- Mês sem pauta para alguma semana mantém a lacuna explícita; não cria conteúdo, tema ou data para preencher o calendário.
- Duas versões declaradas vigentes para o mesmo mês, referência ausente ou semana apontando para versão inexistente produzem aviso de origem/vigência a confirmar; nenhuma escolha silenciosa da versão mais recente.
- Mesma identidade e versão com conteúdo divergente representam conflito, não nova entrega nem sobrescrita da origem anterior.
- Ajuste semanal sem justificativa aparece como justificativa não registrada; não é inventada pela consulta e não satisfaz o aceite editorial de ajuste.
- Plano mensal ainda indisponível não esconde as semanas capturadas; captura antiga/falha mantém o selo e horário da 002. Não misturar um plano novo com semanas de captura anterior como se fossem uma captura íntegra.
- Documento mensal ausente ou inacessível deixa a origem incompleta explícita; não recebe link fictício, prévia ou aprovação presumida.
- Sem migração operacional conferida, a meta nova não é aplicada. Releitura nunca remove a imagem B nem cria peças para completar uma meta.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O CRM DEVE mostrar, para o mês selecionado da NTV, objetivo curto e acesso ao plano mensal quando existir registro correspondente. Ausência de registro DEVE manter **Ainda não definido**.
- **FR-002**: O detalhe mensal DEVE apresentar somente objetivo, pautas, hipóteses/datas sugeridas quando houver, origem, versão, vigência registrada e semanas vinculadas. Não exigir metas numéricas, campanhas, orçamento ou indicadores para um plano existir.
- **FR-003**: Cada plano DEVE ter identidade por marca, mês civil e versão, com origem identificável. Uma semana DEVE manter sua identidade própria e a referência à versão mensal efetivamente usada, inclusive ao cruzar meses.
- **FR-004**: Proposta, registro vigente e execução/publicação DEVEM permanecer distintos. Uma sugestão não DEVE virar produção ou compromisso por aparecer no CRM.
- **FR-005**: O contrato editorial futuro DEVE manter o Estrategista como proponente, o Diretor como responsável pelo detalhamento/ajuste semanal e a Central como responsável pelo registro e repasse. A orientação inicial e o momento do repasse dependem de Q1/Q2; recomendações não DEVEM ser tratadas como respostas.
- **FR-006**: Todo ajuste semanal aceito DEVE registrar a justificativa e a versão mensal de origem, preservando a proposta anterior. A consulta DEVE permitir comparar pauta original e recorte atual, indicando justificativa ausente quando for o caso.
- **FR-007**: Nova versão mensal não DEVE reatribuir automaticamente semanas existentes; mudança de vínculo exige registro explícito de nova origem, sem apagar o histórico anterior.
- **FR-008**: Reentrada com a mesma identidade, versão e origens não DEVE duplicar mês, semana ou entrega. Conteúdo divergente para a mesma identidade/versão DEVE ser identificado como conflito.
- **FR-009**: Ausência, conflito, ambiguidade de vigência e falha da fonte DEVEM ser identificados sem objetivo fabricado ou substituição da última captura válida por conteúdo parcial. Dados mensais e semanais apresentados como íntegros DEVEM pertencer à mesma captura validada.
- **FR-010**: Planejamento DEVE preservar calendário/lista, gaveta do dia, filtros e peças sem data existentes. O resumo mensal e o vínculo semanal DEVEM ser acessíveis por teclado; o detalhe deve devolver o foco ao fechar e permanecer sem corte horizontal em 390 px.
- **FR-011**: O CRM DEVE permanecer somente consulta, sem editar plano, enviar repasse, aprovar, gerar, agendar ou publicar. O selo existente DEVE continuar informando o fim da captura, inclusive em falha, e levando à Planilha.
- **FR-012**: A meta futura DEVE ser uma imagem, um carrossel de 4–6 páginas e um Reels de 15–30 segundos por semana, sem Stories, após migração conjunta conferida. O alcance da transição depende de Q3; semanas históricas, suas duas imagens e versões anteriores DEVEM permanecer preservadas.
- **FR-013**: Identificadores internos DEVEM permanecer nos registros de origem, sem ocupar o resumo visual. Dados reais, credenciais, identificadores privados e e-mails de conta não DEVEM aparecer no repositório, exemplos, relatórios públicos ou logs; validação de produto usa dados sintéticos até demonstração privada autorizada.
- **FR-014**: A implementação da 003 DEVE aguardar a demonstração real T021 e o aceite da 002. Esta entrega DEVE ficar restrita à spec, checklist de qualidade e referências de status, sem código, plano, tarefas, novas abas, escrita remota, mudança de n8n, prompts, agentes, agendas ou flags.

### Key Entities *(include if feature involves data)*

- **Plano mensal**: proposta de objetivo e pautas para uma marca/mês; identidade, versão, origem e vigência registrada. A versão original é preservada.
- **Pauta mensal**: sugestão de conteúdo ligada ao plano; pode indicar recorte semanal e data sugerida, sempre distinta de produção já registrada.
- **Recorte semanal**: tema e detalhamento do Diretor para uma semana existente; liga à versão mensal de origem e conserva ajustes/justificativa. A referência de repasse é registro, não encaminhamento inferido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em um mês sintético com plano, o autor identifica o objetivo na tela Planejamento e acessa pautas, origem e versão com uma única abertura de detalhe, sem navegar por documentos de cada semana.
- **SC-002**: Em 100% das semanas sintéticas vinculadas, incluindo uma que cruza meses e uma ligada a versão anterior, o autor consegue conferir a versão mensal correta e comparar pauta/recorte; nenhum vínculo é inferido.
- **SC-003**: Em dois ajustes sucessivos de uma semana sintética, cada justificativa e sua origem permanecem consultáveis; nenhuma proposta mensal anterior é apagada.
- **SC-004**: Três reapresentações da mesma origem mensal mantêm as quantidades de meses, semanas e entregas; uma reapresentação divergente é identificada como conflito.
- **SC-005**: Nos cenários de plano ausente, fonte incompleta, vigência ambígua e falha de atualização, todos ficam identificados; captura válida e data anteriores permanecem em falha e nenhuma sugestão aparece como publicação ou produção executada.
- **SC-006**: Uma semana histórica com duas imagens conserva ambas após a transição; uma semana elegível à meta nova, conforme Q3 respondida, apresenta uma imagem, carrossel de 4–6 páginas e Reels de 15–30 segundos, sem conversão retroativa nem criação pela consulta.
- **SC-007**: As jornadas de consulta mensal e vínculo semanal funcionam por teclado e em 390 px, sem corte horizontal da página e sem escrita ou comando editorial durante a consulta.

## Assumptions

- Um autor, NTV e consulta local constituem o uso mínimo. Organização de várias marcas, permissões/equipes, escala e observabilidade de workflows ficam fora da 003.
- Os papéis e a autoridade da planilha/Drive já são definidos pela constituição; Q1/Q2 refinam entradas e repasse, não transferem a coordenação ao CRM.
- Mês civil e horários usam `America/Sao_Paulo`. Semana mantém identidade operacional existente; o vínculo mensal explicitamente registrado resolve a passagem entre meses.
- O plano mensal não precisa preencher todas as semanas. Datas sem confirmação são sugestões e não alteram o calendário de produção por conta própria.
- A operação atual continua com duas imagens por semana. A meta futura e a preservação do histórico vêm do ROADMAP; sua aplicação requer Q3 e migração posterior, não mudança operacional nesta especificação.
- As telas decididas orientam a consulta. O botão/detalhe de plano só pode aparecer com fonte mensal registrada, que ainda precisa de contrato posterior; não presumir que as seis abas da 002 já o fornecem.
- Dependências para implementar: T021/aceite da 002 concluídos, Q1–Q3 respondidas e contrato mensal/repasse/migração detalhado na fase futura de planejamento. Plano e tarefas não foram produzidos nesta rodada.
- Trade-off escolhido para este rascunho: reutilizar Planejamento e os papéis atuais, com poucos dados de mês/semana, em vez de editor de campanha, novo painel de agentes ou execução pelo CRM. As recomendações Q1–Q3 permanecem à escolha do autor.
