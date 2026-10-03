# Feature Specification: Consulta local da produção NTV

**Feature Branch**: nenhuma; projeto ainda sem repositório Git.

**Feature Directory**: `specs/001-consulta-local-producao`

**Created**: 2026-10-02

**Status**: especificada para discussão e planejamento; implementação não iniciada.

**Input**: CRM simples somente neste computador, com o desenho aprovado; usar o GitHub
Spec Kit, dividir em features e construir junto com o usuário, apoiado por Superpowers.

## User Scenarios & Testing

### User Story 1 - Entender o que existe na semana e no mês (Priority: P1)

Como responsável pelo conteúdo, quero abrir um painel e encontrar as peças da NTV,
com data prevista, formato, estado e responsável, sem navegar pelos workflows.

**Why this priority**: resolve a confusão entre planejamento e entregas disponíveis.

**Independent Test**: carregar uma captura real identificada da planilha e comparar a
lista do painel com as produções da mesma captura, incluindo a imagem B já existente.

**Acceptance Scenarios**:

1. **Given** quatro produções da semana 05/10/2026 na captura, **When** abro outubro,
   **Then** encontro as quatro, uma vez cada, nas datas previstas da fonte.
2. **Given** nenhum registro para uma semana, **When** a consulto, **Then** vejo
   ausência de conteúdo registrado, sem ideias fictícias preenchidas automaticamente.
3. **Given** filtro Reels, **When** alterno calendário e lista, **Then** os mesmos
   IDs permanecem selecionados e os demais formatos ficam fora da seleção.
4. **Given** geração desabilitada, **When** abro a produção, **Then** seus conteúdos
   continuam visíveis; consulta não equivale a autorização para executar.

### User Story 2 - Saber de quando são os dados (Priority: P1)

Quero distinguir a última leitura confirmada de uma atualização que falhou.

**Why this priority**: o usuário já relatou não enxergar atualizações no Drive e na planilha.

**Independent Test**: abrir com captura válida e depois tentar substituir por captura
parcial; a anterior permanece visível, acompanhada do motivo da falha recente.

**Acceptance Scenarios**:

1. **Given** captura válida, **When** abro o painel, **Then** leio fonte e horário
   de coleta em America/Sao_Paulo e a indicação de que a atualização é por captura.
2. **Given** nenhuma captura, **When** abro, **Then** vejo orientação para obter a
   primeira leitura pela Central; o painel não mostra uma demonstração como produção.
3. **Given** uma aba obrigatória não foi lida, **When** tento atualizar, **Then**
   o painel preserva a última leitura completa e informa qual aba faltou.
4. **Given** captura de ontem, **When** consulto hoje, **Then** o aviso de dados
   anteriores a hoje aparece sem alterar os registros apresentados.

### User Story 3 - Abrir o conteúdo e entender o próximo passo (Priority: P2)

Quero ver roteiro, texto, documentos relacionados, páginas/cenas e pendências de cada peça.

**Why this priority**: permite revisar a organização e localizar materiais sem trocar de projeto.

**Independent Test**: abrir o Reels de 22 segundos registrado e localizar roteiro e
pendências, sem vê-lo anunciado como vídeo final disponível.

**Acceptance Scenarios**:

1. **Given** roteiro registrado e vídeo final ausente, **When** abro o Reels,
   **Then** o roteiro aparece como documento e o vídeo como indisponível.
2. **Given** revisão aberta, **When** abro a peça, **Then** encontro motivo,
   responsável e versão/unidade afetada; revisão resolvida fica como histórico.
3. **Given** documento relacionado a uma peça, **When** abro sua fonte,
   **Then** sigo o link registrado do arquivo correspondente, com versão indicada.
4. **Given** registro de arquivo inconsistente, **When** abro o detalhe,
   **Then** vejo uma pendência de referência e nenhuma mídia substituta inventada.

### Edge Cases

- Datas ausentes ou inválidas ficam em “Sem data válida”; não somem do total da lista.
- Semana cruzando o mês mantém suas identidades; o calendário usa a data da peça.
- Cabeçalho obrigatório ausente/duplicado, ID duplicado e leitura parcial invalidam a
  nova captura e preservam a anterior; não escolher uma linha silenciosamente.
- Arquivo inexistente, empate de versão ou origem incompatível geram aviso localizado.
- Conteúdo de outra marca não entra na visão NTV; sua presença não vira dado de exemplo.
- Texto da planilha é conteúdo, nunca instrução executável ou permissão de operação.
- Uma aprovação técnica registrada não equivale a liberação, publicação ou revisão humana.

## Requirements

### Functional Requirements

- **FR-001**: exibir calendário mensal e lista da NTV, filtros de formato e visão semanal.
- **FR-002**: usar exclusivamente produções da captura operacional aceita; preservar todos
  os IDs históricos e datas previstas, inclusive as duas imagens da semana existente.
- **FR-003**: identificar fonte, cobertura e horário da captura; mostrar estados sem dados,
  captura válida, captura anterior a hoje e falha de atualização com última leitura preservada.
- **FR-004**: a atualização inicial deve ocorrer pela Central com acesso autorizado às fontes.
  A interface pode reler a captura local; não deve prometer consulta Google contínua.
- **FR-005**: mostrar data prevista separadamente de publicação confirmada e manter lista
  acessível para produções sem data válida.
- **FR-006**: detalhar peça, semana, textos, páginas/cenas, responsável, etapa, revisões e
  documentos relacionados, preservando diferenças entre suas versões.
- **FR-007**: resolver arquivos pelos identificadores internos registrados; apresentar
  versão e link de origem, sem confundir identificador do registro com identificador do Drive.
- **FR-008**: distinguir etapa editorial, revisão, liberação e disponibilidade de mídia.
  Um arquivo apenas cadastrado deve ser indicado como registro, não como bytes conferidos agora.
- **FR-009**: manter o painel somente para consulta: nenhum controle de aprovação, rejeição,
  custo, publicação, alteração de agenda ou disparo de agentes nesta feature.
- **FR-010**: manter acesso apenas neste computador e impedir exposição de credenciais ou
  navegação arbitrária pelos arquivos locais.
- **FR-011**: suportar navegação por teclado, fechamento de detalhe por Escape e uso sem
  corte horizontal em telas de 390px e 1440px, preservando o desenho aprovado.
- **FR-012**: testar interpretação de registros, versões, falhas de captura e os cenários
  de navegação antes de declarar a feature concluída.

### Key Entities

- **Captura**: leitura identificada da fonte, com início/fim, abas, intervalos e resultado.
- **Semana**: tema e objetivo editorial; referência para as produções e documentos semanais.
- **Produção**: peça com identidade, formato, data prevista e estados operacionais separados.
- **Página/Cena**: unidade ligada à produção, com ordem, textos e referências a materiais.
- **Arquivo**: documento ou mídia registrado, versão, origem e destino no Drive.
- **Revisão**: avaliação de uma versão/unidade, motivo, responsável e estado de tratamento.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das produções NTV da captura aceita aparecem uma única vez na lista;
  datas inválidas ou ausentes continuam acessíveis fora do calendário.
- **SC-002**: a fonte e o instante de captura ficam visíveis em todas as telas de consulta.
- **SC-003**: cada pendência do detalhe pode ser rastreada ao registro de origem;
  nenhuma mídia ausente é anunciada como disponível nos cenários de teste.
- **SC-004**: todos os cenários de falha preservam a última captura válida, sem apresentá-la
  como uma atualização concluída no instante da falha.
- **SC-005**: uma peça pode ser aberta em até dois acionamentos a partir do calendário
  ou da lista; filtro e fechamento por teclado funcionam em desktop e 390px.
- **SC-006**: os testes e a demonstração geram zero escritas remotas, zero mídias e
  zero publicações; nenhuma modificação de workflow é necessária.

## Assumptions

- Acesso somente neste computador e NTV como primeira marca foram confirmados pelo usuário.
- A primeira integração é uma captura oficial pela Central, seguida de leitura local;
  o servidor do CRM não recebe automaticamente as ferramentas autenticadas deste chat.
- O desenho visual foi aprovado em 02/10/2026. A demonstração de 12 sugestões do mês
  permanece separada; não é uma fonte de dados da feature.
- A coleta atual não é atômica entre abas; comparações antes/depois devem detectar mudanças
  relevantes, e uma captura em conflito não substitui a última versão válida.
- Planejamento mensal, novo agente e migração da meta são a feature 002.
- Escrita de revisões é a feature 003; prévias de mídia e biblioteca são a feature 004;
  acompanhamento aprofundado de execuções é a feature 005.
