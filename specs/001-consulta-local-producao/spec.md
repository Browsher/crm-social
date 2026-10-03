# Feature Specification: Consulta local da produção NTV

**Feature Branch**: `001-consulta-local-producao`, criada de `main` no repositório local.

**Feature Directory**: `specs/001-consulta-local-producao`

**Created**: 2026-10-02 | **Updated**: 2026-10-03

**Status**: especificação atualizada às telas aprovadas; aplicativo e testes funcionais não implementados.

**Input**: CRM simples somente neste computador, com o desenho aprovado; usar o GitHub
Spec Kit e construir por features. A decisão de interface está em
[telas.md](../../docs/design/telas.md), subordinada aos requisitos desta única spec.

## User Scenarios & Testing

### User Story 1 - Consultar o Planejamento (Priority: P1)

Como responsável pelo conteúdo, quero localizar todas as peças NTV no mês e na semana,
com o mínimo de informação para escolher o dia que vou consultar.

**Why this priority**: permite distinguir planejamento registrado de entregas existentes.

**Independent Test**: comparar calendário, lista semanal e relação sem data com as
produções de uma captura identificada, incluindo a imagem B histórica.

**Acceptance Scenarios**:

1. **Given** quatro produções na semana da captura, **When** consulto o mês,
   **Then** encontro as quatro uma vez na lista semanal e nas datas válidas do calendário;
   o tema aparece no primeiro dia da semana, mesmo numa semana que cruza meses.
2. **Given** duas peças no mesmo dia, **When** consulto o calendário,
   **Then** vejo o primeiro cartão e "+1 no dia"; cartão e dia abrem todas as peças daquele dia.
3. **Given** uma semana sem registro de peça, **When** a consulto,
   **Then** os dias ficam vazios, sem sugestões inventadas.
4. **Given** filtro Todos, Imagem, Carrossel ou Reels, **When** alterno Calendário/Lista,
   **Then** a seleção mantém as mesmas identidades; formato desconhecido permanece em Todos.
5. **Given** peças NTV com data ausente ou inválida, **When** abro Planejamento,
   **Then** o link acessível "N sem data" conta todas elas, abre sua lista agrupada por
   semana e mantém cada peça acessível; filtros e troca de mês não apagam esse total.
6. **Given** a 001, **When** abro o menu e o objetivo do mês,
   **Then** vejo apenas Planejamento, Produção e Planilha; o objetivo diz "Ainda não definido",
   sem botão "Plano do mês" e sem usar objetivo semanal como objetivo mensal.

### User Story 2 - Reconhecer o frescor e as falhas (Priority: P1)

Quero reconhecer rapidamente de quando são os dados e consultar a fonte e as tentativas
na Planilha, sem confundir uma releitura local com coleta no Google.

**Why this priority**: uma captura antiga ou atualização rejeitada não pode parecer sincronização atual.

**Independent Test**: promover captura válida, registrar falha, reiniciar a consulta e
reler localmente; a última válida e a falha persistida continuam identificadas.

**Acceptance Scenarios**:

1. **Given** captura válida concluída hoje em America/Sao_Paulo e nenhuma falha ativa,
   **When** abro qualquer tela, **Then** o selo verde diz "Atualizado hoje, HH:MM";
   clicar nele abre Planilha com horário e cobertura do envelope.
2. **Given** captura válida de outro dia e nenhuma falha ativa, **When** consulto,
   **Then** o selo âmbar diz "Dados de DD/MM", calculado por `completedAt` no fuso de exibição.
3. **Given** falha de uma nova tentativa após a última captura válida,
   **When** consulto, reinicio ou aciono Atualizar dados, **Then** o selo vermelho
   "Atualização falhou" prevalece sobre hoje/outro dia; a captura válida, seu horário e
   a tentativa falha no Histórico permanecem. Resposta HTTP bem-sucedida não encerra o erro.
4. **Given** nenhuma captura aceita, ainda que uma tentativa tenha falhado,
   **When** abro, **Then** vejo selo cinza "Sem dados", orientação para pedir a primeira
   leitura à Central e a falha no Histórico.
5. **Given** falha ativa, **When** uma nova tentativa completa é aceita e promovida,
   **Then** o selo volta ao frescor dessa captura; a tentativa anterior permanece no Histórico.
6. **Given** captura local disponível, **When** aciono Atualizar dados,
   **Then** o CRM relê a captura local e o histórico persistido, sem consulta ao Google,
   nova coleta, mudança de horário ou exclusão de tentativa.

### User Story 3 - Consultar a gaveta do dia inteiro (Priority: P2)

Quero abrir o dia escolhido e consultar todas as suas peças, versões e pendências,
com informações completas apenas nesse detalhe.

**Why this priority**: reduz ruído nas telas e permite localizar os materiais corretos.

**Independent Test**: abrir um dia com imagem e Reels, navegar pelo acordeão e fechar
com Escape, conferindo as versões e o foco restaurado.

**Acceptance Scenarios**:

1. **Given** um dia com várias peças, **When** aciono qualquer cartão ou o dia,
   **Then** a gaveta informa dia da semana, data e quantidade; contém uma seção por peça
   em acordeão, com a primeira aberta, inclusive peças escondidas pelo resumo "+N no dia".
2. **Given** a gaveta aberta, **When** consulto uma peça,
   **Then** vejo estado, formato, etapa e responsável registrados, data prevista e
   publicação; sem `publicado_em` explícito, válido e coerente, leio "não comprovada".
3. **Given** revisão vigente com pedido de correção, **When** consulto o detalhe,
   **Then** vejo decisão, motivo, versão/unidade e `responsavel_correcao` separado de
   `responsavel_atual`; revisões resolvidas aparecem em cinza como histórico.
4. **Given** carrossel ou Reels, **When** consulto as unidades,
   **Then** vejo páginas ou cenas ordenadas por índice dentro da versão correspondente;
   página mostra versão e indicador de design novo, com "A confirmar" sem fonte inequívoca.
5. **Given** arquivo relacionado, ausente ou vínculo quebrado, **When** consulto,
   **Then** o arquivo mostra nome de apresentação, versão e "registro"; ausência e
   inconsistência geram avisos, sem prévia nem mídia substituta. Link permitido abre
   apenas por clique em HTTPS nos hosts exatos Drive/Docs autorizados pelo contrato.
6. **Given** gaveta aberta por teclado, **When** pressiono Escape,
   **Then** ela fecha e devolve o foco ao acionador; em 390 px ocupa a tela inteira.

### User Story 4 - Localizar peças no quadro de Produção (Priority: P2)

Quero consultar a semana por etapa registrada e saber a quem a peça está atribuída,
sem alterar a fila nem receber encaminhamentos presumidos.

**Why this priority**: organiza a produção e mantém desconhecidos visíveis.

**Independent Test**: projetar os oito valores confirmados de mídia, etapa vazia,
`arte_aprovada` e publicação com/sem timestamp válido; comparar coluna e valor original.

**Acceptance Scenarios**:

1. **Given** a semana selecionada, **When** abro Produção ou uso as setas de semana,
   **Then** vejo tema e colunas Planejamento, Redação, Visual, Mídia, Revisão, Pronta,
   Publicada e Outras, sem arrastar cartões; colunas sem valores confirmados podem ficar vazias.
2. **Given** qualquer um dos oito valores de mídia confirmados no contrato, sem publicação comprovada,
   **When** projeto o quadro, **Then** a peça fica em Mídia. Valor desconhecido ou vazio
   fica em Outras com o original preservado; etapas de envelope não viram aliases da coluna.
3. **Given** `status=publicado`, aprovação ou arquivo final sem registro válido de publicação,
   **When** projeto, **Then** nenhum desses sinais coloca a peça em Publicada;
   somente `publicado_em` explícito, ISO com fuso e coerente confirma essa coluna.
4. **Given** cartão, **When** o consulto,
   **Then** vejo formato, data prevista, título, responsável registrado e pendência
   localizada de revisão vigente ou mídia ausente; "com quem está" é `responsavel_atual`,
   sem inferir "aguarda de", agente trabalhando ou próxima ação.
5. **Given** peça sem data válida no quadro, **When** aciono seu cartão,
   **Then** abre a seção "Sem data" da semana com suas peças, sem inventar um dia.

### User Story 5 - Consultar Planilha e Histórico (Priority: P2)

Quero consultar as tabelas que sustentam a visão e as tentativas de atualização,
preservando dados privados apenas neste computador.

**Why this priority**: concentra fonte, cobertura e erros numa tela de consulta verificável.

**Independent Test**: abrir as seis abas e Histórico, conferir contagens e nomes dos
66 cabeçalhos mínimos, com todos os seus valores registrados renderizados como dados seguros.

**Acceptance Scenarios**:

1. **Given** captura completa aceita, **When** abro Planilha,
   **Then** vejo horário de fim e período coberto, Atualizar dados, seis abas Semanas,
   Produções, Páginas, Cenas, Arquivos e Revisoes com contagem de linhas e os 66 cabeçalhos
   mínimos com seus valores registrados, inclusive IDs, hashes e origens, como texto/dados.
2. **Given** colunas extras na captura, **When** consulto as tabelas,
   **Then** elas são preservadas somente na captura privada; não aparecem automaticamente
   no HTTP nem criam exigência de coluna na planilha operacional.
3. **Given** tentativas completas e falhas, **When** abro Histórico,
   **Then** vejo todas as tentativas confirmadas no estado local, recentes primeiro, com resultado
   "completa"/"falhou" e motivo resumido; registros são imutáveis e falha não apaga a anterior.
   Arquivo preparado sem confirmação não aparece como conclusão aceita.
4. **Given** uma tabela larga em 390 px, **When** consulto,
   **Then** a própria tabela tem rolagem horizontal; a página não corta conteúdo nem rola lateralmente.

### Edge Cases

- Sem data válida permanece no total NTV e numa lista acessível; vínculo de semana
  ausente recebe grupo "Semana não identificada" e aviso, sem esconder a peça.
- Semana cruzando o mês mantém sua identidade; calendário usa a data civil da peça.
- Filtro aplicado ao resumo não reduz a gaveta do dia: ela contém todas as peças NTV daquele dia.
- Cabeçalho mínimo ausente/duplicado, ID duplicado, captura parcial ou hash divergente
  invalida a tentativa, mantém a última válida e registra falha resumida no Histórico.
- Interrupção antes da promoção conserva a captura anterior e exclui recibos não
  confirmados do Histórico; repetir os mesmos bytes ainda não aceitos permite nova
  tentativa de promoção. Armazenamento indisponível gera erro explícito de persistência,
  sem fingir que o recibo de falha foi gravado.
- Arquivo inexistente, empate de versão, origem incompatível ou revisão de vigência incerta
  gera aviso localizado; não seleciona documento nem reprova versão nova arbitrariamente.
- `arte_aprovada` é observação histórica sem mapeamento confirmado de etapa; permanece Outras.
- Publicação com data sem fuso, inválida ou posterior ao fim da captura não comprova publicação.
- Texto livre, JSON e URL são dados; nenhum deles executa HTML, instrução ou ação operacional.
- Responsável vazio aparece "A confirmar"; vazio de etapa aparece "Não informada", com valor original vazio preservado.
- Dados de outra marca não aparecem como produção ou exemplos NTV.
- Coluna mínima não autoriza expor tokens, credenciais ou caminhos locais embutidos em célula;
  conteúdo sensível indevido recebe aviso e supressão localizada, preservado na captura privada.

## Requirements

### Functional Requirements

- **FR-001**: exibir Planejamento com calendário mensal de cartões e lista agrupada
  por semana (tema e período), filtros Todos/Imagem/Carrossel/Reels e tema no primeiro dia da semana.
- **FR-002**: usar exclusivamente produções da captura aceita, preservando identidades,
  datas e históricos, inclusive as duas imagens existentes; cada peça aparece uma vez na lista.
- **FR-003**: mostrar em todas as telas o selo de quatro estados que leva a Planilha:
  hoje HH:MM verde, outro dia DD/MM âmbar, falha vermelho com última válida ou sem captura cinza.
  Falha ativa com captura válida prevalece sobre frescor; sem captura mantém falha no Histórico.
- **FR-004**: coletar pela Central com acesso autorizado; Atualizar dados somente relê
  captura e histórico locais. Falha persistida só encerra quando nova tentativa completa é aceita,
  nunca por resposta HTTP de sucesso ou releitura da mesma captura.
- **FR-005**: separar data prevista de publicação; aceitar publicação somente com
  `publicado_em` explícito ISO com fuso e coerente. Manter "N sem data" acessível contando
  todas as peças NTV sem data válida, sem desaparecer por filtro ou navegação de mês.
- **FR-006**: detalhar semana, textos, páginas/cenas, estados, responsável, revisões e
  documentos relacionados, mantendo suas versões e pendências de vínculo separadas.
- **FR-007**: resolver arquivos por IDs internos, mostrar nome de apresentação, versão,
  "registro" e link permitido por clique, sem confundir IDs internos e Drive nem carregar prévias.
- **FR-008**: distinguir etapa, revisão, liberação e disponibilidade; arquivo cadastrado
  não comprova bytes ou aprovação. Revisão de correção mantém responsável e versão próprios.
- **FR-009**: manter consulta: nenhum controle aprova, rejeita, gera, custa, publica,
  agenda, muda etapa, arrasta cartão ou dispara agente/workflow.
- **FR-010**: restringir acesso a este computador e servir projeção local de campos
  selecionados: Planilha inclui todos os mínimos como registro, sem envelope/captura bruta,
  extras arbitrários, credenciais, tokens ou caminhos de filesystem. Dados locais não entram
  em Git, fixtures nem capturas de interface compartilhadas.
- **FR-011**: permitir teclado e Escape com foco restaurado; em 390 px usar lista semanal,
  menu recolhido, gaveta de tela inteira e tabelas com rolagem própria, sem corte da página;
  em 1440 px preservar o desenho aprovado e o calendário.
- **FR-012**: verificar interpretação de identidade, data, versão, etapa, publicação,
  projeção segura, captura/histórico e cinco fluxos de usuário antes de concluir a implementação.
- **FR-013**: menu da 001 contém somente Planejamento, Produção e Planilha; objetivo
  mensal discreto "Ainda não definido", sem Plano do mês ou objetivo inventado por semana.
- **FR-014**: Produção é quadro semanal sem arrastar, com oito colunas fixas e mapeamento
  literal documentado; somente os oito valores confirmados entram em Mídia, publicação
  confirmada entra em Publicada, desconhecidos/vazios em Outras com original. Cartão exibe
  formato, data, título, `responsavel_atual` e pendência; não infere encaminhamento.
- **FR-015**: cartão ou dia abre gaveta do dia inteiro, título/data/quantidade e uma seção
  por peça em acordeão, primeira aberta. Peça sem data no quadro abre seção Sem data da semana;
  páginas/cenas ordenadas, correção separada, revisões resolvidas em cinza e mídias ausentes explícitas.
- **FR-016**: Planilha reúne horário/cobertura, releitura local, seis abas com contagens e
  os 66 cabeçalhos mínimos e valores registrados, mais Histórico de tentativas completas/falhas,
  resumidas, imutáveis, persistidas privadamente e confirmadas no estado local;
  arquivos preparados/órfãos não são conclusões. Extras ficam somente na captura privada.

### Key Entities

- **Captura**: leitura completa identificada, fonte privada, horários, cobertura e integridade.
- **Tentativa**: recibo imutável de importação completa ou falha, persistido separadamente da captura vigente.
- **Semana**: tema e objetivo semanal, período e ponteiros internos; não é plano mensal.
- **Produção**: peça com identidade, formato, data e facetas de etapa/revisão/liberação/publicação.
- **Dia/Sem data**: agrupamento de consulta que reúne peças NTV para a gaveta, sem novo estado operacional.
- **Página/Cena**: unidade versionada e ordenada, ligada à produção e a registros de mídia.
- **Arquivo**: documento/mídia registrado com relações privadas e apresentação selecionada.
- **Revisão**: avaliação de versão/unidade, decisão, motivo, correção e tratamento.

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% das produções NTV aceitas aparecem uma vez na lista semanal ou grupo
  sem semana; 100% das sem data permanecem acessíveis e contam no link, sem perda por filtro/mês.
- **SC-002**: em cada tela, os quatro estados de selo correspondem às regras de captura e
  falha; um acionamento abre Planilha com fonte, fim de captura e cobertura corretos.
- **SC-003**: toda pendência do detalhe aponta ao registro/unidade; nos testes, nenhuma
  mídia ausente recebe rótulo disponível, nenhuma aprovação/arquivo/status sozinho comprova publicação.
- **SC-004**: todas as falhas mantêm a última captura válida e seu horário; com
  persistência disponível, seus recibos confirmados sobrevivem a reinício/releitura e
  permanecem no Histórico após tentativa nova aceita. Falha de persistência é erro
  explícito, sem sucesso ou conclusão falsa no Histórico.
- **SC-005**: abrir cartão/dia exige até dois acionamentos a partir do calendário/lista/quadro;
  100% das peças do grupo aparecem na gaveta, com primeira seção aberta e foco restaurado por Escape.
- **SC-006**: testes e demonstração geram zero escritas remotas, mídias, publicações ou
  modificações de workflows; consulta HTTP não contém captura bruta, extras ou segredos.
- **SC-007**: publicação coerente entra em Publicada; sem ela, os oito valores confirmados
  entram em Mídia e 100% dos demais, incluindo vazio e `arte_aprovada`, permanecem em Outras.
- **SC-008**: Planilha contém as seis abas, contagens fiéis e os 66 cabeçalhos/valores mínimos;
  Histórico contém todas as tentativas confirmadas no estado local, exclui recibos
  preparados/órfãos e nenhuma célula extra é exposta automaticamente.
- **SC-009**: em 390 px e 1440 px, os cinco fluxos funcionam por teclado e sem rolagem
  horizontal da página; em 390 px lista substitui calendário e gaveta ocupa tela inteira.

## Assumptions

- NTV e uso somente neste computador foram confirmados; não há deploy ou versão pública.
- Captura oficial pela Central precede consulta local; o runtime do CRM não herda sessão Google.
- A decisão de telas de 03/10/2026 complementa o protótipo aprovado; demonstrações não são fonte operacional.
- Duas leituras completas iguais detectam diferenças observáveis, sem atomicidade entre abas.
- Apenas oito etapas de mídia estão confirmadas; colunas editoriais vazias são resultado fiel.
- Campos mínimos garantem cabeçalho, não mídia, responsável, design novo ou publicação preenchidos.
- A **002** será leitura direta da Planilha pelo servidor local, somente leitura, com conta
  de serviço/chave fora do repositório, emenda futura da constituição e extensão Agentes/Controle/Execucoes.
- Planejamento mensal fica na **003**, revisões/pedidos na **004**, prévias/biblioteca na **005**
  e Equipe/Workflow na **006**, cada uma com especificação futura. Esta atualização não instala nem integra essas capacidades.
