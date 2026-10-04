# Consulta local da produção — Implementation Plan

Como um álbum montado por partes, o plano define o leitor completo e a sequência de entrega. As três primeiras histórias já existem; o restante abaixo continua sendo a solução planejada para concluir a 001.

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` na execução desta feature, ou `superpowers:executing-plans` se ela for executada sequencialmente. Este documento é o plano canônico; não criar uma segunda cópia em `docs/superpowers/plans/`.

**Goal:** consultar a produção NTV nas telas Planejamento, Produção e Planilha, preservando os registros, suas relações e a data da captura.

**Architecture:** a Central obtém uma captura pelo conector autenticado existente. O importador local valida a captura, preserva a última válida e registra tentativas privadas. Um servidor em loopback oferece somente a projeção necessária às três telas; o processo do CRM não herda as ferramentas autenticadas do Codex.

**Tech Stack:** Node.js 24.19.0 já disponível, JavaScript, HTML e CSS; módulos nativos de arquivos, HTTP, criptografia e testes. Playwright existente para a interface. Sem nova dependência de aplicação.

**Spec:** [spec.md](spec.md), [modelo](data-model.md), [contrato](contracts/captura-e-consulta.md) e [telas aprovadas](../../docs/design/telas.md).

T001–T030/fundação, US1, US2, US3 e US4 estão implementadas; revisão corrente e evidências na [validação](validacao.md). As interfaces reais estão na [arquitetura](../../docs/architecture.md); tabelas/Histórico e iniciador ainda são metas; PR da US4 pendente, sem captura operacional validada ou leitura real Google.

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
- `validarTempoImportacao(completedAt, nowIso, completedAtVigente=null)` confere a candidata já validada: até 10 minutos no futuro é permitido, inclusive o limite; mais que isso é captura inválida, e fim igual/anterior ao vigente é captura desatualizada. Motivos fixos são registrados no recibo, sem células privadas.
- `promoverCaptura(raw, dataDir)` valida e promove conforme identidade e tempo, mantendo a trava durante as comparações. Estrutura, conflito de ID e no-op previamente confirmado vêm antes da regra temporal; esta vem antes de gravar a candidata. Falha preserva a última válida e registra tentativa resumida quando a persistência permite. Mesmo ID e bytes já aceitos é `sem_alteracao`; mesmo ID com outros bytes é conflito. Bytes preparados sem confirmação podem ser revalidados e promovidos numa nova tentativa, desde que satisfaçam a política temporal vigente.
- `lerEstado(dataDir)` lê captura e tentativas, inclusive ausência; valida a estrutura, sem rede ou reaplicação da política temporal relativa à importação. GET/releitura/reinício não alteram captura, instante ou falha ativa.
- O estado único `data/atual.json` contém `{capturaId, ultimaTentativaId, historicoIds}`; captura e última tentativa podem ser null, lista inicial vazia. Capturas e recibos imutáveis são preparados antes da substituição atômica no mesmo diretório. Essa substituição confirma os IDs do Histórico e a captura vigente juntos; arquivos órfãos/preparados não comprovam aceitação nem entram no Histórico. Falha confirmada conserva `capturaId`, acrescenta seu recibo e troca a última tentativa; `data/ultima-tentativa.json` é resumo derivado, sem autoridade concorrente. Falha ao gravar recibo/estado é erro explícito de persistência, nunca sucesso ou garantia de recibo durável.
- `validarMapaQuadro(raw)` é função pura; `carregarMapaQuadro(configPath)` lê JSON real e valida antes de devolver o mapa. Schema/conteúdo inicial no contrato; rótulo repetido no mesmo campo ou coluna inexistente é erro claro. Não codificar os rótulos como tabela paralela no JavaScript.
- `projetarVisao(estadoLocal, nowIso, mapaQuadro)` recebe o estado de `lerEstado`, inclusive captura ausente/falha, e o mapa validado, retornando o envelope local de `/api/visao`. Não enviar estado privado nem configuração bruta diretamente ao HTTP.
- No recorte implementado até US3, cada produção contém `detalhes`: responsável/publicação registrados, páginas/cenas por versão, revisões vigentes/resolvidas/anteriores/ambíguas, arquivos e documentos da semana por ponteiro, com avisos localizados pela linha física. Três papéis documentais permanecem mesmo sem semana identificada; resolução por consulta/semana não duplica aviso global e conserva o aviso local de cada peça. Grupos do quadro por semana implementados na US4; tabelas de Planilha ainda futuras. A UI compacta usa os IDs completos do dia, primeiro acordeão aberto, demais resumidos, dados preenchidos e registros/versões/Histórico recolhidos. Documentos aparecem uma vez no fim do dia; avisos técnicos ficam na API, quantidade e link para Planilha na gaveta.
- Na seleção de `Arquivos.url` e `Produções.url_video_final`, `new URL` detecta usuário ou senha e causa **[conteúdo suprimido]**, com aviso localizado fixo sem o valor. Original permanece privado. UI só cria links HTTPS Drive/Docs sem credenciais, por clique, e nunca ecoa URL recusada como texto bruto.
- String de URL não vazia que o construtor recusa também é suprimida com motivo fixo **URL inválida suprimida**, sem devolver possível userinfo malformado ao HTTP; vazio/somente espaços é preservado, sem esse aviso.
- Por decisão do autor, texto livre mínimo/recibo público preserva frase e espaços: só pedaço HTTP(S) separado por espaços em branco e identificado com usuário/senha por `new URL` vira marcador, mantendo pontuação de contorno. Não promete detectar outros esquemas, URL relativa, espaços em userinfo ou forma fora desse pedaço; o guarda dos campos de URL dedicados permanece. Segredo/caminho conhecido continua suprimindo o texto reconhecido inteiro. JSON é dado: só tokens de string alterados são reserializados, conservando demais bytes, números, ordem, espaços e escapes legítimos. WeakMap privado conserva a validade original de origens_json para não produzir falso aviso de JSON inválido após supressão. Avisos globais relacionados são associados à peça por origem física, sem novas cópias globais. UI distingue arquivo ausente de link não permitido e usa Página/Cena número/versão em Texto registrado, mantendo IDs na API.
- Cena mantém três slots de mídia inicial/final/vídeo e avisoMidia null ou texto fixo das imagens/vídeo ausentes. Um aviso técnico agregado de mídia por cena reúne causas no primeiro ponteiro falho; validações de índice/tempo/versão são independentes. Vínculo de revisão não resolvida localiza primeiro pagina_id/cena_id/arquivo_id falho, usando versao somente para versão inválida.
- Resumo da peça distingue revisão aberta (vigente), a confirmar (ambígua/anterior não resolvida sem vigente) e ausência (nenhuma/somente resolvidas), contando somente unidades vigentes. A linha visual apresenta decisão/versão/motivo e correção/tratamento sem IDs técnicos, conservados na API; adicionais usam +N revisão aberta/revisões abertas. Helpers de plural evitam rótulos incorretos e a faixa de avisos não deixa separador pendurado.
- `criarServidor({dataDir, port, webDir, quadroConfigPath})` carrega o mapa antes de devolver servidor Node ainda não iniciado; erro impede início. O ponto de entrada escuta exclusivamente em `127.0.0.1`. `quadroConfigPath` padrão `config/quadro-etapas.json` e `webDir` padrão `src/web/` são argumentos confiáveis de teste, nunca entradas HTTP. T013 cria os três estáticos sintéticos em TEMP para testar a fundação antes de T018; a allowlist permanece fixa mesmo com diretório injetado.
- Importador: `node scripts/importar-captura.cjs <caminho-local> [--data-dir <diretorio-local>]`; diretório padrão `data/`.
- Iniciador: `Iniciar CRM.ps1 [-DataDir <diretorio-local>] [-Port <porta>] [-NodePath <exe>]`. Padrões locais; argumentos permitem teste real em diretório e porta isolados. Porta ocupada não encerra outro processo.

O quadro implementado usa `quadro.colunas:[{nome}]`, `quadro.semanas:[{semanaId,colunas:[{nome,titulo,ids,quantidadeValoresNovos}]}]` e `producoes[].quadro:{coluna,pendencias}`. A projeção aplica prioridade e contador distinto por semana; o browser resume primeira pendência/+N e abre dia inteiro/Sem data, sem recalcular mapas. Arquivo registrado na versão atual com URL vazia/recusada não é mídia ausente. A configuração versionada mantém nove etapas e liberação/revisão vazias; mapa/captura completos da demonstração são fixtures TEMP.

## Comportamento por tela

| Tela | Projeção e limite |
| --- | --- |
| Planejamento | Mês, cartões por data, tema no início da semana, filtros Todos/Imagem/Carrossel/Reels e lista semanal; dia múltiplo mostra primeiro cartão e “+N no dia”; “N sem data” conta as peças NTV sem data válida e abre sua lista |
| Dia inteiro | Gaveta compacta de 520 px/tela cheia mobile: primeira peça aberta, demais resumidas; faixa de quatro dados preenchidos, publicação registrada em uma linha, revisão inicial/adicionais +N, unidades compactas, registros/versões/Histórico recolhidos; documentos semanais únicos e quantidade de avisos com link para Planilha |
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
| D01–D05: puras | Cabeçalhos reordenados, 66 mínimos, duplicação/ausência de IDs/cabeçalhos, cobertura, tempos, hash e duas leituras; etapas desconhecidas não invalidam captura; tolerância temporal até 10 minutos e fim estritamente posterior ao vigente na importação | `tests/dados.test.cjs` |
| S01–S04: I/O real | Diretórios temporários, ausência, falha de gravação/importação, identidade/idempotência, conflito, tentativa imutável, interrupção/recibo órfão, promoção sujeita à política temporal, recibos de inválida/desatualizada preservando a vigente e no-op/GET sem reaplicar relógio | `tests/snapshot.test.cjs` |
| C01–C03: CLI | Caminho obrigatório, URL recusada, saída diferente de zero em erro, sucesso/no-op/conflito, nenhum dump de células e diretório isolado | `tests/importador.test.cjs` |
| Q01–Q03: puras e I/O real | Configuração válida, coluna inexistente/rótulo repetido, JSON/arquivo inválido e inclusão de rótulo por arquivo TEMP sem mudar código | `tests/quadro-config.test.cjs` |
| P01–P03: serviços | Todas as peças históricas NTV, calendário/lista/filtros, datas civis, semanas entre meses, sem data, formato desconhecido e objetivo não inventado | `tests/projecao.test.cjs` |
| P04: serviços | Quatro estados do selo, fronteira de dia em São Paulo, falha sobre frescor e releitura sem renovação | `tests/projecao.test.cjs` |
| P05–P07: serviços | Dia inteiro, versões/páginas/cenas, responsável/correção separados, ponteiros internos, revisões históricas, órfãos, empate e mídia ausente; três papéis semanais sem duplicação de aviso global e URLs com userinfo suprimidas | `tests/projecao.test.cjs` |
| P08–P10: serviços | Prioridade publicação > liberação > revisão > etapa, arte_aprovada em Visual, oito etapas de mídia, status informativo e contador distinto de Outras | `tests/projecao.test.cjs` |
| P11–P12: serviços | Seis tabelas, 66 campos mínimos e valores, contagens e Histórico; captura bruta/extras arbitrários/credenciais/caminhos não saem da projeção | `tests/projecao.test.cjs` |
| H01–H05: HTTP real | Servidor em porta efêmera, três estáticos sintéticos em TEMP via webDir confiável, métodos/status/HEAD, Host/Origin, traversal, privados, seleção de campos, ausência de credenciais de URL no JSON real e nenhuma escrita/importação HTTP | `tests/servidor.test.cjs` |
| U01–U02: interface | Menu de três itens, calendário/lista semanal, filtros, múltiplas peças, sem data, objetivo “Ainda não definido”, mobile com menu recolhido | `tests/interface.test.cjs` |
| U03–U04: interface | Quatro selos, clique para Planilha e Atualizar dados sem Google, falha preservada após releitura | `tests/interface.test.cjs` |
| U05–U06: interface | Gaveta compacta dia inteiro/sem data, primeiro acordeão aberto, recolhidos/+N, dados preenchidos, documentos únicos, aviso técnico fora do dia, link Planilha, contador até dois acionamentos, teclado/Escape/foco, 390/1440 sem corte, conjunto exato de links seguros e credenciais ausentes em JSON/#dia | `tests/interface.test.cjs` |
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
