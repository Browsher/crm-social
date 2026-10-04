# Consulta local da produção — Implementation Plan

Como um álbum montado por partes, o plano define o leitor completo e a sequência de entrega. A primeira parte já existe; o restante abaixo continua sendo a solução planejada para concluir a 001.

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` na execução desta feature, ou `superpowers:executing-plans` se ela for executada sequencialmente. Este documento é o plano canônico; não criar uma segunda cópia em `docs/superpowers/plans/`.

**Goal:** consultar a produção NTV nas telas Planejamento, Produção e Planilha, preservando os registros, suas relações e a data da captura.

**Architecture:** a Central obtém uma captura pelo conector autenticado existente. O importador local valida a captura, preserva a última válida e registra tentativas privadas. Um servidor em loopback oferece somente a projeção necessária às três telas; o processo do CRM não herda as ferramentas autenticadas do Codex.

**Tech Stack:** Node.js 24.19.0 já disponível, JavaScript, HTML e CSS; módulos nativos de arquivos, HTTP, criptografia e testes. Playwright existente para a interface. Sem nova dependência de aplicação.

**Spec:** [spec.md](spec.md), [modelo](data-model.md), [contrato](contracts/captura-e-consulta.md) e [telas aprovadas](../../docs/design/telas.md).

**Data:** 04/10/2026. **Estado:** T001–T022 implementadas e testadas localmente (fundação, US1 e US2); 19 tarefas T023–T041 pendentes. `src/`, importador, mapa versionado e sete suítes já existem. US2 entrega quatro estados, origem/avisos em Planilha e releitura GET local; `Iniciar CRM.ps1`/sua suíte não existem. Os diagramas e contratos completos deste plano continuam sendo a meta: detalhes/acordeões, classificação/quadro e seis tabelas/Histórico ainda serão completados. Interfaces efetivamente implementadas estão na [arquitetura](../../docs/architecture.md); evidência em [validacao.md](validacao.md). Correções do PR #6 integradas em `19e222a`; 0.4.9 aceita no PR #7, merge `7e17e85`. Novo aceite remoto da US2 e captura operacional aguardam; nenhuma leitura real Google.

**Branch:** `001-consulta-local-producao`, criada da `main` no repositório `crm-social` e conferida nesta tarefa. Não executar novamente a criação da feature para atualizar estes documentos.

## Global Constraints

- Primeira marca NTV; acesso somente neste computador, com bind `127.0.0.1:4318`.
- Captura aceita contém exatamente Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes; os 66 cabeçalhos mínimos continuam obrigatórios, por nome.
- Preservar todas as produções NTV, inclusive imagem B histórica, etapas desconhecidas e peças sem data válida. Consulta não usa o filtro de elegibilidade do n8n.
- Menu da 001: apenas Planejamento, Produção e Planilha. Objetivo mensal: “Ainda não definido”; sem ação “Plano do mês”.
- As tabelas locais mostram todos os valores registrados permitidos dos 66 campos mínimos, incluindo IDs internos, `id_drive`, `sha256` e `origens_json` como dados/texto. Conteúdo sensível indevido em célula mínima recebe supressão localizada e aviso, conforme contrato, sem retirar o cabeçalho. HTTP não entrega captura bruta, envelope privado, extras arbitrários, credenciais ou caminhos. Mockup compartilhável não contém valores operacionais privados.
- “Atualizar dados” relê a última captura local; não consulta Google. Busca direta é a futura 002 — Planilhas.
- Etapa, revisão, liberação, arquivo registrado e publicação continuam distintos. Responsável principal vem de `responsavel_atual`; correção vem de `responsavel_correcao`, separadamente. Sem inferência de “aguarda de” ou próxima ação na 001.
- Nenhuma aprovação, geração, publicação, nova agenda, escrita operacional ou mudança no n8n resulta da consulta.
- Todas as camadas de teste usam `node:test` e `node:assert/strict`. Interface em `tests/interface.test.cjs`, descoberta pelo `node --test` do quality gate.

## Summary

Planejamento oferece calendário com cartões, filtros e lista agrupada por semana. Produção oferece um quadro de consulta por etapa, sem arrastar cartões. Planilha reúne as seis tabelas e o Histórico de tentativas, além da explicação curta de atualização local. O selo comum leva até Planilha e indica hoje, outro dia, falha ou ausência de captura.

O clique em um cartão, dia ou peça da lista abre o dia inteiro, com uma seção em acordeão por produção e a primeira aberta. Todas as peças desse dia permanecem no detalhe, mesmo quando o ponto de entrada usa filtro de formato. Uma peça sem data válida abre a seção “Sem data” da própria semana. Não há prévias remotas nesta feature.

O retrato de 02/10 mostrou quatro peças em uma semana; esse número não fica fixo no código. A imagem B continua visível. A migração futura da meta editorial pertence à 003 — Planejamento mensal; 004 trata revisões, 005 prévias e 006 Equipe/Workflow. Esses recortes de backlog não ampliam os dados ou ações da 001.

## Technical Context

| Aspecto | Decisão |
| --- | --- |
| Plataforma | Windows, um operador, NTV |
| Interface | Identidade e componentes do protótipo; comportamento vigente em `docs/design/telas.md` e referência demonstrativa em `docs/design/mockups/telas-v2.html` |
| Armazenamento | Capturas e tentativas imutáveis em `data/`, ignorado e fora dos arquivos servidos |
| HTTP | Uma rota de consulta `/api/visao` e três estáticos permitidos; nenhum endpoint de importação/escrita |
| Atualização | Central coleta; importador promove; botão relê localmente sem alterar a tentativa ou o instante da captura |
| Datas | Datas editoriais civis preservadas; frescor e horários por `captura.completedAt` em `America/Sao_Paulo` |
| Celular | Em 390 px, lista semanal inicial, menu recolhido e gaveta em tela cheia; tabelas com rolagem horizontal própria |
| Testes | Funções puras, I/O temporário real, serviços/projeções, HTTP real em porta efêmera e interface Playwright local |
| Escala | Fixture sintética de 500 peças; medir filtros/navegação durante a implementação, sem promessa antecipada |
| Dependências | Node e Playwright existentes; sem framework, banco ou infraestrutura copiados de outro projeto |

O quality gate existente usa Node 24.19.0 e `testCommand: ["node", "--test"]`. ESLint 10.12.0 e seu lock ficam isolados em `tools/`; `npm ci --prefix tools` é preparação de ferramenta, não dependência do aplicativo. Semgrep é ferramenta do gate. A atualização documental não altera configuração, relatórios ou ferramentas do gate.

Conferência local de 03/10: o Node encontrado pelo PATH é 24.14.0, enquanto o runtime
existente escolhido para a feature é 24.19.0. Selecionar seu executável explicitamente
por `CRM_NODE_PATH`, validar a versão no quickstart e passá-lo por `-NodePath` ao
iniciador. Não versionar caminho pessoal. Os testes CLI usam `process.execPath`; o
gate existente também usa o próprio executável para os testes e o ESLint.

Antes da implementação, atender ao pré-requisito `.claude/rules/project-structure.md` pela skill `doc-init`, conforme o AGENTS local. Resolver o Playwright já instalado sem instalar outra cópia. Os comandos de aplicativo do quickstart só passam a existir após as tarefas correspondentes.

## Constitution Check

Conferência documental antes e depois do desenho: sem exceções necessárias na 001.

- I — Local e simples: servidor nativo, sem hospedagem, banco ou login novo.
- II — Fonte e identidade: captura explícita, registros preservados e falha sem substituição da última válida.
- III — Papéis: Central coleta; CRM consulta; nenhum perfil ou agendamento instalado aqui.
- IV — Evidência: testes antes de código nas cinco camadas; arquivo cadastrado não comprova mídia conferida.
- V — Incrementos: uma spec canônica, cinco histórias da 001 e demonstração antes da futura 002.

A futura 002 exige contrato e emenda próprios para leitura direta da planilha; isso não está autorizado nem implementado por este plano.

## Project Structure

Documentação canônica neste diretório: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/captura-e-consulta.md`, `quickstart.md`, `tasks.md` e checklist. Design é referência visual, não outra especificação de dados.

Arquivos de implementação **a criar**, relativos a `crm-social/`:

```text
src/captura.cjs                  valida e normaliza a captura privada
src/snapshot.cjs                 persiste captura/tentativas e preserva última válida
src/quadro-config.cjs            carrega e valida os rótulos configurados do quadro
src/projecao.cjs                 relações, calendário, dia, quadro e tabelas locais
src/servidor.cjs                 HTTP em loopback com rotas permitidas
src/web/index.html               três telas e gaveta acessíveis
src/web/app.js                   navegação, filtros, releitura e acordeões
src/web/styles.css               identidade aprovada e adaptação de telas
scripts/importar-captura.cjs     importação local sem Google
tests/fixtures.cjs               dados sintéticos novos por chamada
tests/dados.test.cjs
tests/snapshot.test.cjs
tests/importador.test.cjs
tests/quadro-config.test.cjs
tests/projecao.test.cjs
tests/servidor.test.cjs
tests/interface.test.cjs         node:test envolvendo Playwright existente
tests/iniciador.test.cjs
Iniciar CRM.ps1                  iniciador local com processo oculto
config/quadro-etapas.json        mapa versionado aprovado, sem dados de linhas
data/                           privado; criado na implementação
```

Interfaces internas propostas, com envelope e campos definidos somente pelo [contrato](contracts/captura-e-consulta.md):

- `validarCaptura(raw)` retorna captura normalizada; erro identifica aba/linha/campo sem despejar células.
- `promoverCaptura(raw, dataDir)` valida e promove conforme as regras de identidade; falha preserva a última válida e registra tentativa resumida quando a persistência permite. Mesmo ID e bytes já aceitos é `sem_alteracao`; mesmo ID com outros bytes é conflito. Bytes preparados sem confirmação podem ser revalidados e promovidos numa nova tentativa.
- `lerEstado(dataDir, nowIso)` lê captura e tentativas, inclusive ausência; não faz rede.
- O estado único `data/atual.json` contém `{capturaId, ultimaTentativaId, historicoIds}`; captura e última tentativa podem ser null, lista inicial vazia. Capturas e recibos imutáveis são preparados antes da substituição atômica no mesmo diretório. Essa substituição confirma os IDs do Histórico e a captura vigente juntos; arquivos órfãos/preparados não comprovam aceitação nem entram no Histórico. Falha confirmada conserva `capturaId`, acrescenta seu recibo e troca a última tentativa; `data/ultima-tentativa.json` é resumo derivado, sem autoridade concorrente. Falha ao gravar recibo/estado é erro explícito de persistência, nunca sucesso ou garantia de recibo durável.
- `validarMapaQuadro(raw)` é função pura; `carregarMapaQuadro(configPath)` lê JSON real e valida antes de devolver o mapa. Schema/conteúdo inicial no contrato; rótulo repetido no mesmo campo ou coluna inexistente é erro claro. Não codificar os rótulos como tabela paralela no JavaScript.
- `projetarVisao(estadoLocal, nowIso, mapaQuadro)` recebe o estado de `lerEstado`, inclusive captura ausente/falha, e o mapa validado, retornando o envelope local de `/api/visao`. Não enviar estado privado nem configuração bruta diretamente ao HTTP.
- `criarServidor({dataDir, port, webDir, quadroConfigPath})` carrega o mapa antes de devolver servidor Node ainda não iniciado; erro impede início. O ponto de entrada escuta exclusivamente em `127.0.0.1`. `quadroConfigPath` padrão `config/quadro-etapas.json` e `webDir` padrão `src/web/` são argumentos confiáveis de teste, nunca entradas HTTP. T013 cria os três estáticos sintéticos em TEMP para testar a fundação antes de T018; a allowlist permanece fixa mesmo com diretório injetado.
- Importador: `node scripts/importar-captura.cjs <caminho-local> [--data-dir <diretorio-local>]`; diretório padrão `data/`.
- Iniciador: `Iniciar CRM.ps1 [-DataDir <diretorio-local>] [-Port <porta>] [-NodePath <exe>]`. Padrões locais; argumentos permitem teste real em diretório e porta isolados. Porta ocupada não encerra outro processo.

## Comportamento por tela

| Tela | Projeção e limite |
| --- | --- |
| Planejamento | Mês, cartões por data, tema no início da semana, filtros Todos/Imagem/Carrossel/Reels e lista semanal; dia múltiplo mostra primeiro cartão e “+N no dia”; “N sem data” conta as peças NTV sem data válida e abre sua lista |
| Dia inteiro | Data e quantidade, todas as peças do dia em acordeões, primeira aberta; etapas/responsáveis registrados, revisão por versão, páginas/cenas ordenadas, arquivos como registro, mídia ausente e referências quebradas explícitas |
| Produção | Semana anterior/próxima e tema; agrupamento pelo mapa do contrato, valor original preservado em Outras, responsável registrado e pendência sustentada por registro; sem drag-and-drop |
| Planilha | Seis abas com contagens e todos os 66 campos mínimos com valores; cada tabela rola horizontalmente dentro de sua região; Histórico final com tentativas/resultados/motivo resumido |

O formato é derivado dos slots confirmados (`imagem_a`/`imagem_b`, `carrossel`, `reels`), preservando `tipo_producao` separadamente. Outro slot permanece Outro em Todos. Ordem ordinal por `producao_id` estabiliza o primeiro cartão e o primeiro acordeão. Sem semana inequívoca, a peça permanece em “Semana não identificada”. “N sem data” é global à captura NTV, independente de filtro/mês. Contagens de Planilha são das linhas NTV apresentadas; cobertura vem de inícios/fins civis de semanas válidas, ou limites null com aviso.

O mapa de Produção é carregado de `config/quadro-etapas.json`: publicação preenchida
vence liberação/prontidão configurada, que vence revisão em andamento configurada,
que vence etapa. `arte_aprovada` vai para Visual; os oito valores de mídia existentes,
inclusive `montagem_pronta`, permanecem em Mídia quando nenhuma prioridade superior
vence. As duas listas de liberação/revisão começam vazias. `status` aparece como
informação, sem decidir a coluna. Data de publicação inconsistente conserva Publicada
com aviso, sem comprovar publicação remota. Nenhum alias é inferido do nome de um estado.

Colunas fixas na ordem do contrato. Outras conserva originais de etapas não mapeadas,
vazio apresentado como Não informada, e mostra quantidade de rótulos distintos apenas
dos seus cartões NTV na semana selecionada. Não contar repetições, outras semanas ou
cartões cuja prioridade superior venceu. Carregar configuração inválida impede início
com erro claro, sem fallback silencioso; novo rótulo exige só editar JSON/reiniciar.

O selo usa exclusivamente `captura.completedAt` para o frescor: “Atualizado hoje, HH:MM” verde; “Dados de DD/MM” âmbar; “Atualização falhou” vermelho com captura válida preservada; “Sem dados” cinza sem captura. A falha ativa tem precedência sobre frescor quando existe captura válida. Sem captura, uma falha aparece no Histórico e o selo permanece cinza. Reler com sucesso não limpa a falha nem renova o horário; apenas nova tentativa completa aceita resolve a falha.

“Design novo” em páginas fica “A confirmar” sem classificação explícita documentada; versão ou nome de template isolado não comprova esse estado.

## Ordem de implementação e delegação

As tarefas executáveis estão em [tasks.md](tasks.md). Fundação primeiro; US1 Planejamento, US2 frescor, US3 dia inteiro, US4 quadro e US5 Planilha na sequência. Cada comportamento novo tem teste escrito e executado antes da implementação correspondente.

O coordenador atribui um único dono a `src/projecao.cjs`, aos testes de cada arquivo e ao conjunto `src/web/index.html`, `src/web/app.js`, `src/web/styles.css`. Esses arquivos não são editados simultaneamente por histórias diferentes. Após estabilizar o contrato, trabalho independente em validação, persistência e testes de HTTP pode ser delegado com entradas/saídas e aceite explícitos. Outros agentes trabalham no workspace; nenhum implementador desfaz mudanças alheias.

## Test-first e verificações

Todas as suítes declaram casos com `node:test` e asserções com `node:assert/strict`. O teste de interface envolve Playwright dentro de `tests/interface.test.cjs`; não usar o antigo nome `interface.cjs`, que não é descoberto pelo comando do gate. A escrita do teste inclui execução RED e registro do motivo; a implementação inclui GREEN e refatoração sem mudar o resultado esperado.

O workflow vigente roda em `ubuntu-24.04` e prepara Node/ferramentas do gate, sem
Playwright local nem Windows PowerShell. Política de aplicabilidade, sem mudar esse
workflow ou instalar dependências nesta feature:

- Dados, snapshot, importador, configuração do quadro, projeção e HTTP são portáveis e obrigatórios no Linux
  do CI e no Windows local; processos CLI usam `process.execPath`.
- Interface é exclusiva do computador local: com `CI=true`, `node:test` registra
  SKIP com motivo explícito antes de carregar Playwright. Fora do CI, a suíte exige
  o Playwright existente; ferramenta ausente é falha com orientação, sem SKIP silencioso.
- Iniciador usa Windows PowerShell 5.1 real. Fora de `win32`, registrar SKIP por
  plataforma antes de tentar executar PowerShell; no Windows local, executar todos
  os seus casos e falhar se o pré-requisito estiver ausente.
- Aceite completo exige execução Windows local sem `CI=true`: oito suítes, cinco
  camadas verdes e zero casos pulados. Os pulos explícitos do CI aparecem no TAP e
  no registro de validação; o resultado Linux não comprova a camada de interface
  nem o iniciador. Nenhuma dessas condições altera estados SKIP/strict do próprio gate.

| Camada / casos | Comportamento observável | Arquivo |
| --- | --- | --- |
| D01–D05: puras | Cabeçalhos reordenados, 66 mínimos, duplicação/ausência de IDs/cabeçalhos, cobertura, tempos, hash e duas leituras; etapas desconhecidas não invalidam captura | `tests/dados.test.cjs` |
| S01–S04: I/O real | Diretórios temporários, ausência, falha de gravação/importação, identidade/idempotência, conflito, tentativa imutável, interrupção/recibo órfão, nova promoção dos bytes ainda não aceitos e preservação da última válida | `tests/snapshot.test.cjs` |
| C01–C03: CLI | Caminho obrigatório, URL recusada, saída diferente de zero em erro, sucesso/no-op/conflito, nenhum dump de células e diretório isolado | `tests/importador.test.cjs` |
| Q01–Q03: puras e I/O real | Configuração válida, coluna inexistente/rótulo repetido, JSON/arquivo inválido e inclusão de rótulo por arquivo TEMP sem mudar código | `tests/quadro-config.test.cjs` |
| P01–P03: serviços | Todas as peças históricas NTV, calendário/lista/filtros, datas civis, semanas entre meses, sem data, formato desconhecido e objetivo não inventado | `tests/projecao.test.cjs` |
| P04: serviços | Quatro estados do selo, fronteira de dia em São Paulo, falha sobre frescor e releitura sem renovação | `tests/projecao.test.cjs` |
| P05–P07: serviços | Dia inteiro, versões/páginas/cenas, responsável/correção separados, ponteiros internos, revisões históricas, órfãos, empate e mídia ausente | `tests/projecao.test.cjs` |
| P08–P10: serviços | Prioridade publicação > liberação > revisão > etapa, arte_aprovada em Visual, oito etapas de mídia, status informativo e contador distinto de Outras | `tests/projecao.test.cjs` |
| P11–P12: serviços | Seis tabelas, 66 campos mínimos e valores, contagens e Histórico; captura bruta/extras arbitrários/credenciais/caminhos não saem da projeção | `tests/projecao.test.cjs` |
| H01–H05: HTTP real | Servidor em porta efêmera, três estáticos sintéticos em TEMP via webDir confiável, métodos/status/HEAD, Host/Origin, traversal, privados, seleção de campos e nenhuma escrita/importação HTTP | `tests/servidor.test.cjs` |
| U01–U02: interface | Menu de três itens, calendário/lista semanal, filtros, múltiplas peças, sem data, objetivo “Ainda não definido”, mobile com menu recolhido | `tests/interface.test.cjs` |
| U03–U04: interface | Quatro selos, clique para Planilha e Atualizar dados sem Google, falha preservada após releitura | `tests/interface.test.cjs` |
| U05–U06: interface | Gaveta dia inteiro/sem data da semana, primeiro acordeão aberto, teclado, Escape e foco devolvido, 390/1440, texto não executável e links permitidos apenas por clique | `tests/interface.test.cjs` |
| U07–U08: interface | Quadro/semana/prioridades, status, título Outras · N valores novos e rótulos originais, responsável, nenhuma ação de arrastar, clique abre dia da peça | `tests/interface.test.cjs` |
| U09–U10: interface | Seis abas + Histórico, contagens, ordem, rolagem própria, estado vazio e campos mínimos completos | `tests/interface.test.cjs` |
| L01–L02: I/O/HTTP | Iniciador real em ambiente temporário, loopback/processo oculto, erro de porta sem encerrar ocupante e encerramento apenas do PID criado | `tests/iniciador.test.cjs` |

Testes usam diretório temporário próprio e porta efêmera. Não ler `data/` operacional, adquirir a trava da fila ou disparar serviços remotos. A suíte deve bloquear requisições externas da interface e esperar zero. O mockup é somente referência visual; fixtures sintéticas não vêm de produção.

## Review Focus

- Datas sem conversão documentada ou inválidas continuam acessíveis em Sem data, inclusive no quadro e na gaveta.
- Prioridade e configuração aprovadas são respeitadas; arte_aprovada em Visual, desconhecidos em Outras com originais/contador distinto, status informativo e publicação não deduzida de aprovação/arquivo.
- Tentativa parcial, conflito ou falha de I/O conserva dados e horário da última válida; o Histórico não falsifica uma nova coleta.
- Revisão histórica não substitui responsável atual, não vira correção nova e não mistura versões para completar páginas/cenas.
- Planilha conserva mínimos e valores, sem expor captura bruta/extras arbitrários/credenciais/caminhos; texto malicioso não executa e nenhuma URL remota carrega automaticamente.

## Entrega e demonstração

Executar o [quickstart](quickstart.md) somente após implementar, registrar resultados reais das cinco camadas e conferir a descoberta dos testes pelo `node --test`. A demonstração real usa uma captura completa preparada pela Central, em `data/`, sem dados privados nos registros compartilháveis. Comparar as identidades com essa mesma captura; não fabricar uma captura a partir do dicionário.

Revisão independente e correções precedem o quality gate. Como penúltima tarefa, executar `node tools/quality-gate.mjs` com a configuração vigente. Como última tarefa, ler `.claude/agents/doc-sync-onboarding.md` e sincronizar os documentos efetivamente afetados, incluindo README/roadmap/status e evidência em `validacao.md`. Se a sincronização identificar necessidade de novo código, voltar ao ciclo de testes e gate antes de concluí-la.

Um plano pronto, mockup ou gate sem suítes da aplicação não comprova software pronto.
Todas as cinco camadas precisam estar verdes no Windows local, sem casos pulados,
antes de concluir a feature. Demonstrar 001 antes de iniciar 002.

A rastreabilidade em [tasks.md](tasks.md) cobre FR-001–016 e SC-001–009: identidades/datas conservadas, selo rastreável, pendências por origem, falha persistida, dia inteiro/foco, zero operação remota, mapa do quadro, seis tabelas/Histórico completos e navegação em 390/1440. Registrar o resultado observado de cada critério na entrega, sem antecipar aprovação nesta revisão documental.

## Complexity Tracking

Nenhuma violação da constituição identificada neste desenho. Autenticação própria, leitura direta Google, sincronização contínua, banco, escrita operacional, prévias de mídia e inferência de encaminhamento ficam nas features futuras correspondentes.
