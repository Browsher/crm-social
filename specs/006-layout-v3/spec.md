# Feature Specification: 006 — Layout v3

**Feature Branch**: `codex/006-layout-v3`
**Created**: 2026-10-08
**Status**: Parte A aprovada e integrada pelo PR #24 em 09/10/2026, main `a5be3553a26f6a7af9fdb9e84bbd24851a561ce2`. Parte B autorizada, implementada/testada localmente e não integrada na branch `codex/006-layout-v3-parte-b`, no [PR #25](https://github.com/Browsher/crm-social/pull/25), sem merge; gate/CI de código f46db33 aprovados, CI/review do head documental final pendentes. Evidências e pendências em [validacao.md](validacao.md).
**Input**: Pedido do autor em 08/10/2026: reorganizar a apresentação do CRM pessoal em Planejamento, Produção e Publicar, com referência visual aprovada, sem mudar dados/captura ou escrita operacional.

## User Scenarios & Testing *(mandatory)*

## Entrega em duas partes — decisão do autor em 08/10/2026

Escopo integral mantido com 32 tarefas. Parte A: fundação, topo com ⟳ Atualizar, Planejamento Semana/Mês/objetivo em linha e Produção por semana, com regressões dessas telas. Menu intermediário mantém Planejamento, Produção e Planilha; não oferece Publicar ou Ver no Instagram. Planilha e sua consulta/atalhos permanecem funcionais, com o botão de atualização realocado para o topo comum, sem duplicação.

Parte B: pop-up, Publicar, Ver no Instagram na Produção, remoção visual da Planilha e regressões restantes. O autor aprovou A e autorizou seu merge e o início de B em 09/10/2026. Requisitos de menu final/remoção valem para B. B tem PR próprio, gate/review do head final e screenshots, sem merge.

### Ajustes autorizados — Session 2026-10-09

- Mês mostra o ponto colorido e o tipo curto ao lado: “● Oferta”, “● Carrossel”, “● Reels”, conforme o mockup. Nesta visão, o formato Imagem usa o rótulo curto Oferta; isso não altera o formato nem classifica conteúdo operacional. Cor continua representando o estado simples, e o nome acessível conserva título/data/estado.
- O botão único ⟳ Atualizar e o selo são temporariamente apresentados dentro do pop-up aberto e retornam ao topo ao fechar, preservando seus controles e o POST existente. Isso permite acionar a atualização por teclado mesmo com o fundo inerte do diálogo nativo.

### Decisão de apresentação e alcance constitucional já fornecidos pelo autor

O escopo original da 006 determinou: “A página Planilha e a página de dados saem da interface (os dados continuam na API)” e “Sem informação de agentes na interface”, incluindo a retirada de “Com quem está”. O pedido da Parte B em 09/10/2026 reiterou a remoção da Planilha e a ausência de metadados de agentes. Esta seção registra essas decisões já fornecidas; não é uma nova resposta de clarify, aprovação adicional ou emenda à constituição 1.2.0.

A captura continua identificando fonte, período coberto, instante, falhas, IDs, versões e histórico, conforme o princípio II e os contratos de captura/consulta inalterados. GET /api/visao preserva captura, avisos localizados, view.planilha e Histórico. A UI mantém selo com instante em São Paulo e falha ativa, inclusive sem captura válida; projetos preservam o motivo simples de travamento editorial. O campo legado selo.destino = planilha permanece na API, mas o cliente o ignora porque esse destino visual foi retirado.

O trade-off autorizado é deixar fonte detalhada, cobertura e avisos técnicos consultáveis pela API, em vez de manter tabelas e metadados operacionais nas três telas pessoais. A UI perde essa inspeção técnica direta; não perde ou altera os registros capturados, não apresenta dado antigo/incompleto como coleta concluída e não cria estado operacional concorrente. A interpretação de conformidade verifica os dados da captura/contrato e a honestidade do selo, além do escopo explícito do usuário; não pressupõe que todos os metadados devam aparecer em toda tela. Contratos, autoridade da planilha/Drive e emenda 1.2.0 permanecem inalterados.

### Clarifications — Session 2026-10-08

- Página sem prévia no pop-up mostra “prévia indisponível” naquela posição; o contador conta todas as páginas, inclusive as indisponíveis. Imagem única mantém sua posição 1/1 mesmo sem arquivo; nenhuma página é eliminada para reduzir o contador.
- ⟳ Atualizar com pop-up aberto mantém o pop-up aberto com a versão nova da mesma peça. Se a peça não existir mais, fecha e devolve o foco. Ao reduzir páginas, limitar o índice ao último existente; falha de releitura conserva a versão já exibida. Estas regras estão implementadas/testadas localmente na Parte B; entrega remota permanece pendente.

### User Story 1 - Acompanhar semana e mês (Priority: P1)

Como autor que acompanha a produção e publica manualmente, quero localizar peças, objetivo e pautas sem abrir tabelas técnicas.

**Why this priority**: Semana é a entrada diária e reaproveita a consulta e a gaveta existentes.
**Independent Test**: Com captura sintética, abrir Planejamento, expandir objetivo, navegar Semana/Mês e abrir todas as peças de um dia; conferir datas, miniaturas e estados.

**Acceptance Scenarios**:

1. **Given** peças em datas variadas, **When** abrir o CRM, **Then** Semana é o padrão, há sete colunas de segunda a domingo, hoje está destacado e cada peça mostra miniatura, formato, título e estado simples.
2. **Given** objetivo e pautas capturados, **When** ativar a linha “🎯 Outubro — objetivo”, **Then** pautas S1 · tema · modelo aparecem logo abaixo; recolhidas, não reservam espaço.
3. **Given** uma semana com duas peças prontas/publicadas entre quatro peças, **When** consultar seu cabeçalho, **Then** tema/pauta e “2 de 4 prontas” correspondem ao registro, sem meta de três.
4. **Given** visão Mês, **When** ativar uma semana com mouse ou teclado, **Then** a visão muda para Semana no período escolhido, inclusive vazio; pontos de peças usam cor do estado simples, tipo curto Oferta (Imagem)/Carrossel/Reels e nomes acessíveis.
5. **Given** duas peças no mesmo dia, **When** ativar uma delas, **Then** a gaveta apresenta o dia inteiro e permite consultar ambas.

### User Story 2 - Acompanhar projetos por semana (Priority: P1)

Quero ver o progresso real de cada semana e o motivo de uma peça estar travada, sem nomes de agentes ou ferramentas.

**Why this priority**: Substitui o quadro técnico pelo acompanhamento pessoal solicitado.
**Independent Test**: Abrir Produção com semanas passada, atual, próxima e futura vazia, formatos distintos e registros inconsistentes.

**Acceptance Scenarios**:

1. **Given** semanas com peças, **When** abrir Produção, **Then** a atual aparece primeiro, a próxima depois, e cada bloco tem tema/pauta e progresso X de N.
2. **Given** peça com classificação atual conhecida, **When** consultar sua linha, **Then** miniatura, título, formato, data e o indicador Planejada → Criação → Revisão → Pronta → Publicada concordam com a regra existente.
3. **Given** mídia ausente na etapa Mídia ou revisão vigente pedindo correção, **When** consultar a peça, **Then** o indicador é substituído pelo motivo curto “Travado: falta gerar mídia” ou “Travado: precisa de correção”.
4. **Given** semana futura sem peças, **When** consultar seu bloco, **Then** o corpo mostra somente “Planejamento na sexta-feira”, sem inventar peças, tema, horários ou execução.

### User Story 3 - Conferir uma prévia de post (Priority: P1)

Quero conferir imagem ou carrossel no formato de celular, com perfil configurável, legenda e hashtags, antes de publicar manualmente.

**Why this priority**: A mesma interação atende Produção e Publicar; depende das imagens já vinculadas.
**Independent Test**: Abrir prévia de imagem única e de carrossel sintético de cinco páginas, navegar por botões, teclado e arrasto em 390 px.

**Acceptance Scenarios**:

1. **Given** carrossel de cinco páginas vigentes, **When** ativar “Ver no Instagram”, **Then** abre um pop-up em formato de celular com arte 4:5, perfil configurado, legenda, hashtags, setas, pontos e contador 1/5.
2. **Given** pop-up aberto, **When** usar ←, →, setas, pontos ou arrasto horizontal no celular, **Then** somente a página selecionada muda, sem ultrapassar os limites nem navegar no fundo.
3. **Given** imagem única, **When** abrir a prévia, **Then** aparece uma imagem 4:5, contador 1/1 e controles de avanço indisponíveis.
4. **Given** prévia aberta a partir de uma linha ou da gaveta, **When** fechar ou pressionar Esc, **Then** o foco volta ao acionador e a tela/gaveta anterior permanece.
5. **Given** mídia ausente ou inacessível, **When** abrir a prévia, **Then** o espaço afetado informa “Prévia indisponível”, mantendo ordem, legenda e hashtags; não inventa arte.

### User Story 4 - Preparar a publicação manual (Priority: P1)

Quero encontrar peças liberadas, copiar legenda e acessar o pacote, vendo ao lado publicadas recentes e travadas.

**Why this priority**: É a saída operacional do acompanhamento, sem executar publicação.
**Independent Test**: Conferir fila sintética com liberadas, publicadas, travadas, datas inválidas e pacote ausente/ambíguo.

**Acceptance Scenarios**:

1. **Given** peças liberadas e ainda não publicadas, **When** abrir Publicar, **Then** aparecem por data, hoje destacado, com miniatura, formato, título, legenda, hashtags e as três ações solicitadas.
2. **Given** publicação preenchida, **When** atualizar a consulta, **Then** a peça sai da fila, entra em Publicadas recentes e o contador do menu acompanha a fila.
3. **Given** pacote exato e texto disponível, **When** usar “Copiar legenda” e “Baixar pacote”, **Then** a cópia combina legenda/hashtags como hoje e o link seguro do pacote abre por ação explícita.
4. **Given** pacote inexistente, ambíguo ou URL recusada, **When** consultar a peça, **Then** “Pacote indisponível” mantém a peça na fila; aprovação registrada e disponibilidade de mídia permanecem distintas.
5. **Given** menu em 1440 ou 390 px, **When** navegar por teclado, **Then** somente Planejamento, Produção e Publicar estão disponíveis, com contador acessível no último.

### Edge Cases

- Sem captura, leitura em andamento, falha inicial, falha com captura anterior e atualização sem alteração.
- Meses/Pautas ausentes, objetivo vazio, mês duplicado, pauta sem vínculo confirmado e semana que cruza mês/ano.
- Quantidades diferentes de três e datas em qualquer dia; múltiplas peças no mesmo dia; peça sem data/sem semana.
- Etapa desconhecida (Criação), versão inválida, mídia vinculada de outra versão, empates de unidades vigentes e arquivo inacessível.
- Publicação preenchida juntamente com liberação/correção; correção histórica/ambígua não trava a produção vigente.
- Carrossel parcialmente disponível, imagem única sem arquivo e Reels sem imagens/vídeo.
- Atualização com pop-up/gaveta abertos; acionador removido pela releitura; viewport baixa.
- Texto editorial literal com HTML/URLs; dados/nomes técnicos continuam na consulta, sem serem usados como metadados de interface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O menu DEVE conter somente Planejamento, Produção e Publicar, removendo da interface Planilha, página de dados, tabelas, histórico técnico e atalhos que levavam a essas páginas.
- **FR-002**: Todas as telas DEVEM mostrar no topo o selo da última atualização e “⟳ Atualizar”, com a mesma coleta explícita existente e os quatro estados de frescor, preservação da captura e prevenção de cliques simultâneos. Captura anterior DEVE conservar data/hora em São Paulo; falha inicial sem captura DEVE aparecer como Atualização falhou · sem dados, sem aparentar sucesso.
- **FR-003**: A mudança DEVE ser exclusivamente de apresentação: mesma captura, IDs, relações, versões, avisos e dados disponíveis na consulta; sem novo estado ou operação editorial.
- **FR-004**: Objetivo mensal DEVE ocupar uma única linha fechada, com mês e objetivo; sua ativação acessível DEVE expandir/recolher pautas S1 · tema · modelo logo abaixo, sem espaço reservado quando fechado.
- **FR-005**: Objetivo/pautas ausentes ou ambíguos DEVEM conservar os critérios da consulta existente, com “Ainda não definido” ou “A confirmar” e sem associação inventada.
- **FR-006**: Planejamento DEVE oferecer Semana | Mês e iniciar em Semana; navegar períodos e pautas DEVE conservar o período selecionado.
- **FR-007**: Semana DEVE ter sete colunas de segunda a domingo, hoje destacado e peças com miniatura, formato, título e estado simples; em 390 px, as sete colunas permanecem em região de rolagem própria.
- **FR-008**: O cabeçalho da semana e cada projeto DEVEM mostrar tema/pauta disponíveis e progresso “X de N prontas”, calculado só com peças reais: em Planejamento, somente peças visíveis pelo filtro de formato na semana civil; em Produção, o projeto inteiro da semana registrada. Zero peças não implica meta ou percentual concluído.
- **FR-009**: Mês DEVE usar a altura disponível da tela e pontos coloridos por estado simples, acompanhados pelo tipo curto Oferta (formato Imagem)/Carrossel/Reels; ativar qualquer semana DEVE abrir sua visão Semana, com identificação acessível independente de cor. Formatos desconhecidos conservam o texto registrado; nenhum rótulo muda a API.
- **FR-010**: Ativar peça DEVE abrir a gaveta do dia completo; peças sem data ou semana DEVEM continuar acessíveis, identificadas como “Sem data”/“Semana não identificada”. Em Produção, o grupo órfão tem título h2 “Semana não identificada” e subtítulo compacto “Sem semana”; semana registrada sem período usa “Período não identificado”.
- **FR-011**: Produção DEVE organizar projetos por semana, atual primeiro, próxima depois; outras semanas registradas continuam acessíveis e não são descartadas.
- **FR-012**: Linha de produção DEVE mostrar miniatura, título, formato e data, com os cinco passos Planejada → Criação → Revisão → Pronta → Publicada.
- **FR-013**: A classificação existente DEVE mapear Planejamento para Planejada; Redação, Visual, Mídia e Outras para Criação; Revisão para Revisão; liberação literal liberado para Pronta; publicação preenchida para Publicada, conservando a precedência de publicação.
- **FR-014**: Peça travada DEVE ser identificada somente por mídia ausente quando a classificação atual é Mídia ou por revisão vigente pedindo correção; o motivo curto substitui o indicador de passos, sem responsável técnico.
- **FR-015**: Semana futura sem peças DEVE mostrar somente “Planejamento na sexta-feira” no corpo, além da identificação do período.
- **FR-016**: Produção, Publicar e a gaveta do dia DEVEM oferecer “Ver no Instagram”, inclusive para imagem única, sem abrir Instagram, executar publicação ou conferir aprovação. A abertura DEVE resolver a identidade da peça na vista vigente, inclusive após atualizar com gaveta aberta; peça removida não reabre uma versão antiga.
- **FR-017**: O pop-up DEVE ter forma de celular, perfil vindo de configuração versionada, arte proporcional 4:5 sem corte e legenda/hashtags literais embaixo.
- **FR-018**: Carrossel DEVE preservar ordem/vigência dos vínculos existentes, oferecer setas, pontos, contador atual/total e navegação por ← → e arrasto horizontal; imagem única permanece em 1/1.
- **FR-019**: Pop-up DEVE ser modal por teclado, fechar por botão/Esc e restaurar foco; fechamento não fecha a gaveta de origem. Página sem prévia DEVE mostrar “prévia indisponível” na posição, incluída no contador total. Atualizar DEVE manter aberto com a versão nova da mesma peça; peça removida fecha/devolve foco; índice excedente é limitado à última posição e falha de releitura conserva conteúdo anterior.
- **FR-020**: Publicar DEVE listar todas e somente peças com liberação liberado e publicação vazia, por data crescente, hoje destacado e sem data ao final.
- **FR-021**: Cada item da fila DEVE mostrar miniatura, formato, título, legenda, hashtags, “Copiar legenda”, “Baixar pacote” e “Ver no Instagram”, mantendo os critérios atuais de texto, pacote único exato e URL segura.
- **FR-022**: Publicar DEVE mostrar ao lado publicadas recentes e travadas; em 390 px, essas seções seguem a fila na mesma página.
- **FR-023**: O contador no item Publicar DEVE equivaler à quantidade da fila e acompanhar releituras, sem depender de filtro de Planejamento.
- **FR-024**: A interface NÃO DEVE exibir metadados de agentes, nomes de responsáveis, “Com quem está”, horários de rotina, ferramentas operacionais ou textos explicativos/legendas de cores.
- **FR-025**: A interface DEVE funcionar em claro/escuro, 1440 e 390 px, com foco visível, nomes acessíveis, operação por teclado e sem rolagem horizontal da página.
- **FR-026**: Prévia e miniaturas DEVEM reutilizar imagens autorizadas da consulta vigente, permitir falha individual e não expor credenciais ou buscar mídias fora do serviço local existente.
- **FR-027**: A referência visual aprovada DEVE ser copiada como mockup sanitizado em docs/design/mockups/layout-v3.html e citada em docs/design/telas.md; o pedido escrito prevalece nas divergências da referência.
- **FR-028**: Testes e evidências DEVEM usar somente fixtures sintéticas, incluindo semana com oferta, carrossel de cinco páginas e Reels travado; nenhuma leitura da operação real é necessária.
- **FR-029**: Entrega DEVE incluir screenshots das vistas de cada parte nos dois temas e larguras, quality-gate verde e review do head final em dois PRs, um por parte; A foi integrada por autorização explícita posterior, B deve permanecer sem merge. A inclui Semana/Mês/Produção; B inclui Publicar/pop-up e regressões visuais finais.
- **FR-030**: A contagem gerada é 32, mantida pelo autor após a parada inicial. A foi integrada após aprovação explícita; B foi autorizada em 09/10/2026 e deve ser entregue em PR separado sem merge.

### Key Entities *(include if feature involves data)*

- **Peça apresentada**: registro consultado com título, formato, data, classificação, liberação/publicação, vínculos de mídia e texto; nenhum campo operacional novo.
- **Semana apresentada**: período civil, tema/pauta confirmados, peças e contagem de prontas; semana vazia é apenas navegação de calendário.
- **Post em prévia**: seleção temporária de uma peça e posição visual entre imagens vinculadas; não é publicação ou novo arquivo editorial.
- **Perfil de apresentação**: nome público configurável, sem credencial, conta autenticada ou integração com Instagram.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As três entradas finais do menu e o botão de atualização funcionam por teclado nas três telas em 1440 e 390 px, nos dois temas.
- **SC-002**: Todos os registros sintéticos são localizáveis na semana/dia ou na lista sem data; nenhum é descartado por quantidade, dia fixo, ausência de semana ou etapa desconhecida.
- **SC-003**: Estado simples, progresso e contador de publicação concordam em 100% dos cenários sintéticos de precedência, liberação, publicação e correção vigente/histórica.
- **SC-004**: Nas cinco páginas do carrossel sintético, setas, pontos, teclado e arrasto selecionam a posição correta; imagem única fica em 1/1 e Esc devolve o foco em todos os acionadores testados.
- **SC-005**: As vinte combinações de cinco vistas × dois temas × duas larguras têm screenshots sintéticos inspecionados; pop-up de imagem única e falha também têm verificação comportamental.
- **SC-006**: Todas as verificações locais exigidas de dados, persistência, apresentação, HTTP e interface passam sem pulos no computador; nenhuma operação de escrita/publicação externa ocorre.
- **SC-007**: Cada parte tem seu PR com fonte de código, gate verde, review sem Critical, segurança ou regressão, evidências e limites; B não recebe merge nesta autorização. O merge de A foi autorizado em 09/10/2026.
- **SC-008**: A lista preserva 32 IDs; A tem prova própria e B executa o recorte restante após o ok explícito do autor em 09/10/2026.

## Assumptions

- O autor autorizou o desenho e a sequência integral Spec Kit; não se criam especificação paralela ou aprovações adicionais para decisões já dadas.
- Uma peça Publicada também conta como pronta no progresso, pois já ultrapassou essa etapa; a fila Publicar exige liberação literal e publicação vazia. “Travado” é sinal visual, não sexto estado persistido.
- “Publicadas recentes” mostra até dez peças, da publicação mais recente à mais antiga; data preenchida inválida mantém Publicada pela regra atual, fica após datas válidas e não recebe horário inventado.
- A configuração versionada começa com nome sintético “perfil.exemplo”, sem dado operacional real; o nome é conteúdo de configuração, não constante de lógica.
- Reels reaproveita imagens de cenas vinculadas quando disponíveis; o pop-up não adiciona reprodução de vídeo, download automático ou thumbnails de vídeo.
- Hoje/semana atual usam o calendário de São Paulo. Semanas de calendário vazias não criam registros de produção.
- As sete colunas da Semana usam rolagem dentro da região em 390 px; Mês permanece com sete dias por linha.
- Sem filtros novos: o recorte capturado continua completo. Textos editoriais da peça são literais e seguros; a proibição de agentes aplica-se aos metadados e textos de produto, sem alterar o texto capturado.
- Miniaturas das listas visíveis são uma alteração expressa do comportamento de demanda da 005, mantendo sua resolução e autorização locais. A API continua completa mesmo sem Planilha na interface.
