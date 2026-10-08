# Documentação

## Feature 006 — Layout v3 (Parte A implementada/testada, não integrada)

Rodada de 08/10/2026, branch `codex/006-layout-v3`, base `2be585a`; 001–005 concluídas na main conforme o autor. O escopo mantém 32 tarefas em duas partes autorizadas. T001–T016 verificadas na A; T017–T023 e fechamento B não iniciados, aguardando ok explícito na A. A mantém Planilha e entrega topo/objetivo/Semana/Mês/projetos; gate final Windows da fonte de testes 7fc1996 passou (673 PASS; código/PNG 5725b9f); [PR #24](https://github.com/Browsher/crm-social/pull/24) aberto/anexado após commits/push. Revisão independente, CI e review remoto têm acompanhamento/resultados no PR por head, com aprovação exigida no head final antes de concluir a entrega. Sem merge. Provas antigas abaixo permanecem históricas.

| Documento | Uso |
| --- | --- |
| [Spec](../specs/006-layout-v3/spec.md) | Quatro jornadas, requisitos, aceite, bordas e assunções |
| [Plano](../specs/006-layout-v3/plan.md) | Solução de apresentação e fronteira de execução |
| [Pesquisa](../specs/006-layout-v3/research.md) | Reuso, acoplamentos, alternativas e Context7 |
| [Modelo](../specs/006-layout-v3/data-model.md) | Derivados temporários sem mudança de captura |
| [Contrato](../specs/006-layout-v3/contracts/apresentacao.md) | Estados/bloqueios, progresso, fila, mídia, perfil e foco |
| [Tarefas](../specs/006-layout-v3/tasks.md) | 32 IDs, execução A/B e fechamento por recorte |
| [Quickstart sintético](../specs/006-layout-v3/quickstart.md) | Reprodução da Parte A e cenários futuros da B separados |
| [Validação](../specs/006-layout-v3/validacao.md) | RED/GREEN, regressões, gate, fontes e pendências A/B |
| [Relatório gate Parte A](reports/006-parte-a-local-gate.json) | Gate final Windows, fonte 7fc1996: 673 PASS, cobertura 95,5492%, baseline preservada |
| [Galeria Parte A](design/screenshots/LEIA-ME.md#006--layout-v3-parte-a) | 12 PNG sintéticos Semana/Mês/Produção nos dois temas e larguras |
| [Checklist](../specs/006-layout-v3/checklists/requirements.md) | Revisão de completude anterior ao plano |
| [Mockup sanitizado](design/mockups/layout-v3.html) | Referência aprovada, não aplicativo |
| [Decisões das telas](design/telas.md) | Precedência do pedido sobre divergências do mockup |

Como o índice de um álbum, esta página localiza decisões, módulos e evidências: 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). 002 concluída com T021 demonstrada; resultados históricos da 001 na [validação](../specs/001-consulta-local-producao/validacao.md). A captura histórica da 001 mantém seu limite; tipagem da coleta direta resolvida na T021, com categorias remanescentes na validação da 002. A 003 está concluída, 15/15 tarefas; demonstração pelo CRM conferida com uma linha fictícia marcada como teste, sem publicar conteúdo.

## Ordem de leitura

**Histórico das entregas anteriores à 006:** Estado em 08/10/2026: versões de páginas e cenas integrada pelo [PR #22](https://github.com/Browsher/crm-social/pull/22), merge `b90980a`; [validação](reports/versoes-unidades-validacao.md) e [galeria sintética](design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas). Pronta integrada pelo PR #21; 001–004 concluídas na main conforme o autor. Trabalho atual: [005 — Prévias de imagens](#feature-005--prévias-de-imagens), implementada/testada localmente no [PR #23](https://github.com/Browsher/crm-social/pull/23), com merge/exclusão da branch autorizados após gate/review aprovados no head final. As 21 tarefas foram aprovadas pelo autor em 08/10 após a parada inicial e estão concluídas; T002 confirmada pelo autor nessa data, sem teste de acesso real pelo agente. Constituição 1.2.0 aplicada na branch. [Evidência, entrega e checks/review por fonte](../specs/005-previas-imagens/validacao.md). Os demais registros preservam as rodadas e numeração históricas.

Histórico da entrega: [004 — Pautas no Planejamento](../specs/004-pautas-planejamento/spec.md), implementada/testada localmente; [PR #20](https://github.com/Browsher/crm-social/pull/20) acompanha entrega e integração, com merge condicionado ao gate/review do head vigente; resultados por head na validação. [Validação e limites](../specs/004-pautas-planejamento/validacao.md).

1. [README](../README.md): resultado atual e comandos de entrada.
2. [Roadmap](../ROADMAP.md), [AGENTS](../AGENTS.md) e [constituição](../.specify/memory/constitution.md): escopo e fronteiras.
3. [Arquitetura](architecture.md) e módulos abaixo: imports, persistência, HTTP e interface reais.
4. [Spec](../specs/001-consulta-local-producao/spec.md), [plano](../specs/001-consulta-local-producao/plan.md) e [tarefas](../specs/001-consulta-local-producao/tasks.md): requisitos da 001 completa e próxima entrega.
5. [Quickstart](../specs/001-consulta-local-producao/quickstart.md), [validação](../specs/001-consulta-local-producao/validacao.md) e [screenshots sintéticos](design/screenshots/LEIA-ME.md): executar/conferir o recorte e seus limites.

## Governança e arquitetura

| Documento | Para que serve |
| --- | --- |
| [README](../README.md) | Apresentação, estado e comandos reais |
| [ROADMAP](../ROADMAP.md) | Entregas do v1, 005 implementada/testada na branch e backlog futuro/v2 ilustrativo |
| [AGENTS](../AGENTS.md) | Regras locais e bloco gerenciado preservado |
| [CLAUDE](../CLAUDE.md) | Importador das instruções canônicas; não é outra regra de produto |
| [Constituição](../.specify/memory/constitution.md) | 1.2.0 aprovada/aplicada na 005 em 08/10; integração acompanhada no PR #23; preserva a emenda 1.1.0 da leitura de planilhas |
| [Regra curta de estrutura](../.claude/rules/project-structure.md) | EntryPoints/pastas/imports/testes observados, até 60 linhas |
| [architecture.md](architecture.md) | Mapa de módulos/imports, persistência, rotas/env e dívidas |
| [Este índice](index.md) | Todos os documentos autorais do projeto e referências de ferramenta |

## Módulos implementados

| Documento | Código explicado |
| --- | --- |
| [Google](modules/google.md) | JWT/fetch nativos, Sheets/Drive readonly por finalidade e tokens separados em RAM |
| [Mídia](modules/midia.md) | src/midia.cjs; resolução NTV, assinatura/tamanho/hash, cache privado e fingerprint final |
| [Coleta](modules/coleta.md) | Seis grades obrigatórias, Meses/Pautas opcionais independentes, duas leituras, metadados/hashes e datas |
| [Captura](modules/captura.md) | src/captura.cjs; envelope, 66 mínimos, allowlist compartilhada de campos opcionais, Meses/quatro e Pautas/doze opcionais, normalização/hash e origem física |
| [Triagem compartilhada](modules/triagem.md) | src/triagem.cjs; seleção NTV, redação e identidades validadas antes da promoção e na consulta |
| [Snapshot/persistência](modules/snapshot.md) | src/snapshot.cjs; trava, estado único, imutabilidade, falhas e órfãos |
| [Importador](modules/importador.md) | scripts/importar-captura.cjs; argumentos/saída e falhas de entrada |
| [Configuração do quadro](modules/quadro-config.md) | src/quadro-config.cjs e config/quadro-etapas.json; mapa validado e aplicado na US4 |
| [Projeção](modules/projecao.md) | src/projecao.cjs; seleção NTV, datas/formatos, frescor, detalhes/pacote de publicação/quadro e cópias dos mínimos/opcionais capturados para seis tabelas e Meses/Pautas opcionais; origem semanal e Histórico confirmado |
| [Pautas](modules/pautas.md) | src/pautas.cjs; identidade/calendário, duplicatas e origem semanal por ID/marca/início, sem inferência ou I/O |
| [Servidor](modules/servidor.md) | src/servidor.cjs; seis rotas fixas, mídia por ID interno, cinco estáticos explícitos e guardas de origem |
| [Iniciador Windows](modules/iniciador.md) | Abrir CRM.cmd por duplo clique, reabertura por GET local e sucesso sem pause; Iniciar CRM.ps1, Node existente, processo oculto, confirmação, retorno e logs privados |
| [Modelo visual](modules/layout-model.md) | src/web/layout-model.js; seis funções puras compartilhadas pela Parte A |
| [Web/Planejamento, Produção e Planilha](modules/web.md) | src/web; Parte A com Semana/Mês/projetos/topo, gaveta compacta, Planilha preservada e histórico 001–005; seis abas/Meses/Pautas opcionais/Histórico, card mensal e navegação/origem de pauta, releitura, avisos por peça, Pronta com pacote/legenda/cópia local e tema claro/escuro local; galeria sob demanda, ampliação e fallback005 |

## Feature 001 canônica

| Documento | Para que serve |
| --- | --- |
| [spec.md](../specs/001-consulta-local-producao/spec.md) | Requisitos/cenários/aceite da feature completa, preservados |
| [plan.md](../specs/001-consulta-local-producao/plan.md) | Solução planejada completa; cabeçalho distingue recorte implementado |
| [research.md](../specs/001-consulta-local-producao/research.md) | Pesquisa histórica de 03/10 e justificativas; não é status atual da implementação |
| [data-model.md](../specs/001-consulta-local-producao/data-model.md) | Modelo atual, entidades, guardas de leitura/projeção e transições; demonstração concluída, limites na validação |
| [Contrato captura/consulta](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) | Envelope e 66 mínimos, persistência e UI completas; pendências explícitas |
| [tasks.md](../specs/001-consulta-local-producao/tasks.md) | T001–T041 concluídas; rastreabilidade |
| [quickstart.md](../specs/001-consulta-local-producao/quickstart.md) | Ambiente/Node/PATH, oito suítes, iniciador, demo TEMP e roteiro da captura real executado em T039 e repetível |
| [validacao.md](../specs/001-consulta-local-producao/validacao.md) | Execuções reais RED/GREEN, revisão, regressões, gate e limitações |
| [Checklist e análise](../specs/001-consulta-local-producao/checklists/requirements.md) | Revisão documental anterior; não substitui testes do aplicativo |

## Feature 002 — Planilhas (concluída; T021 demonstrada, 24/24)

| Documento | Uso |
| --- | --- |
| [Spec](../specs/002-consulta-planilhas/spec.md) | Três histórias, leitura direta somente leitura, seis abas e continuidade da Central |
| [Emenda aplicada](../specs/002-consulta-planilhas/constitution-proposal.md) | Princípio VI/versão 1.1.0; aprovada pelo autor em05/10 |
| [Plano](../specs/002-consulta-planilhas/plan.md) | Interfaces, segurança, trava assíncrona e cinco riscos |
| [Pesquisa](../specs/002-consulta-planilhas/research.md) | Fontes oficiais/Context7 e alternativas |
| [Modelo](../specs/002-consulta-planilhas/data-model.md) | V1 seis abas, tipos e configuração privada |
| [Contrato](../specs/002-consulta-planilhas/contracts/leitura-planilha.md) | Integridade, transporte, HTTP e compatibilidade |
| [Tarefas](../specs/002-consulta-planilhas/tasks.md) | 24 tarefas com RED/GREEN e gates separados |
| [Quickstart](../specs/002-consulta-planilhas/quickstart.md) | Testes falsos e preparação da conta pelo autor para demonstração |
| [Validação](../specs/002-consulta-planilhas/validacao.md) | Decisões, RED/GREEN, screenshots e aceite remoto |
| [Checklist](../specs/002-consulta-planilhas/checklists/requirements.md) | Qualidade da especificação; não substitui testes ou aprovação |
| [Análise](../specs/002-consulta-planilhas/analysis.md) | Nova análise reduzida; ajustes antigos corrigidos pelo escopo aprovado |

T021 demonstrada; implementação, provas sintéticas e resultados reais sanitizados na validação da 002.

## Feature 003 — Consulta mensal (concluída, 15/15)

| Documento | Uso |
| --- | --- |
| [Spec](../specs/003-planejamento-mensal/spec.md) | Reescopo do autor em 05/10/2026: Meses opcional, objetivo/lista curta, duplicatas e compatibilidade |
| [Plano](../specs/003-planejamento-mensal/plan.md) | Extensão mínima dos módulos atuais; cinco camadas verificadas localmente |
| [Pesquisa](../specs/003-planejamento-mensal/research.md) | Código existente e documentação oficial da API consultada via Context7 |
| [Modelo](../specs/003-planejamento-mensal/data-model.md) / [Contrato](../specs/003-planejamento-mensal/contracts/meses.md) | Quatro mínimos, optionalidade/hash legado, linha física, avisos e consulta |
| [Tarefas](../specs/003-planejamento-mensal/tasks.md) | 15 tarefas concluídas; preparação do autor e demonstração pelo CRM com registro fictício |
| [Quickstart](../specs/003-planejamento-mensal/quickstart.md) | Instruções do autor e comandos para repetir ensaios sintéticos executados |
| [Validação](../specs/003-planejamento-mensal/validacao.md) | RED/GREEN, gates/reviews históricos, screenshots sintéticos e fechamento T002/T015 sanitizado |
| [Checklist](../specs/003-planejamento-mensal/checklists/requirements.md) | Histórico do planejamento preservado; fechamento registrado em spec/validação/tarefas |

Integração da main após T021, fonte `4263f660fa2a77d2be467f15c6cf43c66d4575f7`: gate Windows com 322 PASS sem pulos nas cinco camadas, cobertura 98,3871%, drop 0, complexidade PASS com 17 avisos e baseline preservada. Semgrep SKIP por ausência no Windows e audit N/A. [Relatório local da integração](reports/003-integracao-t021-local-gate.json); resultados anteriores são históricos. Código integrado pelo [PR #15](https://github.com/Browsher/crm-social/pull/15); o fechamento documental exige novos checks/review. Evidência na [validação da 003](../specs/003-planejamento-mensal/validacao.md). Objetivo definido usa cor principal; pautas restantes usam +N pautas/+1 pauta. T002/T015 concluídas com uma linha fictícia marcada como teste na fonte real; uso editorial real ainda não comprovado. Essa orientação pertence ao fechamento da 003; a 004 foi autorizada em 07/10 e está descrita abaixo.

## Feature 005 — Prévias de imagens

Implementada/testada localmente: galeria e ampliação das imagens vinculadas à peça aberta, com leitura Drive sob demanda pelo servidor e cache privado. A geração de 21 tarefas provocou a parada inicial; o autor aprovou todas em 08/10/2026. 21/21 tarefas concluídas; o autor confirmou em 08/10 a pasta Produções compartilhada como Leitor (T002), sem acesso real pelo agente. Gate Windows da fonte `4521975`: 578 PASS, sem pulos locais; 12 screenshots 4:5 atuais dessa fonte inspecionados. Rodadas anteriores permanecem históricas. Entrega, integração e checks/review por head no PR #23; merge/exclusão da branch autorizados após gate/review aprovados no head final.

| Documento | Uso |
| --- | --- |
| [Spec](../specs/005-previas-imagens/spec.md) | Valor, fronteiras, falhas e critérios de aceite |
| [Plano](../specs/005-previas-imagens/plan.md) | Solução implementada, interfaces, fases e limites |
| [Pesquisa](../specs/005-previas-imagens/research.md) | Decisões, justificativas, alternativas e fontes oficiais |
| [Modelo](../specs/005-previas-imagens/data-model.md) | Referências autorizadas, seleção da galeria, bytes e cache |
| [Contrato de mídia](../specs/005-previas-imagens/contracts/midia.md) | GET local por ID interno, guardas, status e limites de bytes/transporte |
| [Quickstart](../specs/005-previas-imagens/quickstart.md) | Preparação pendente do autor e repetição dos ensaios sintéticos |
| [Checklist](../specs/005-previas-imagens/checklists/requirements.md) | Qualidade da especificação; não comprova implementação |
| [Tarefas](../specs/005-previas-imagens/tasks.md) | 21 tarefas aprovadas após a parada inicial; rastreabilidade, dependências e estado de execução |
| [Análise independente](../specs/005-previas-imagens/analysis.md) | Pesquisa/revisão documental do planejamento, com aprovação posterior das 21 tarefas; não substitui teste do código |

| [Validação](../specs/005-previas-imagens/validacao.md) | Fontes, RED/GREEN, cinco camadas, gate, revisão e limites |
| [Gate local](reports/005-local-gate.json) | Relatório Windows da fonte de código/testes registrada na validação |

## Design e evidência visual

| Documento / artefato | Para que serve |
| --- | --- |
| [Telas decididas](design/telas.md) | Decisões do autor e nota de implementação parcial |
| [Screenshots reais/LEIA-ME](design/screenshots/LEIA-ME.md) | Aplicação em execução somente com dados fictícios; origem/limites |
| [Pronta para publicar — oito screenshots](design/screenshots/LEIA-ME.md#pronta-para-publicar) | Quadro e gaveta, dois temas, 1440/390; fixture sintética, clipboard em memória e estado em TEMP |
| [005 — 12 screenshots de prévias](design/screenshots/LEIA-ME.md#005--prévias-de-imagens) | Galeria, ampliação e indisponível, dois temas e 1440/390; imagens geradas sinteticamente, servidor/cliente falso e TEMP |
| [Versões de páginas e cenas — quatro screenshots](design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas) | Gaveta Pronta expandida, texto v3 com imagens de versões distintas, dois temas e 1440/390; fixture sintética/TEMP |
| [Tema claro/escuro — 16 screenshots](design/screenshots/LEIA-ME.md#tema-claro-e-escuro) | Quatro telas, dois temas, 1440/390; fixtures em TEMP, script reproduzível, provas sintéticas locais; tema integrado pelo PR #18 |
| [Planejamento 1440](design/screenshots/001-planejamento-1440.png) / [390](design/screenshots/001-planejamento-390.png) | Capturas sintéticas desktop/mobile |
| [Selo hoje 1440](design/screenshots/001-us2-hoje-1440.png) / [390](design/screenshots/001-us2-hoje-390.png) | Verde pelo fim da captura em São Paulo |
| [Selo anterior 1440](design/screenshots/001-us2-anterior-1440.png) / [390](design/screenshots/001-us2-anterior-390.png) | Âmbar para outro dia civil |
| [Selo falha 1440](design/screenshots/001-us2-falha-1440.png) / [390](design/screenshots/001-us2-falha-390.png) | Vermelho conserva as peças da captura válida |
| [Sem dados 1440](design/screenshots/001-us2-sem-dados-1440.png) / [390](design/screenshots/001-us2-sem-dados-390.png) | Cinza sem captura, mesmo com tentativa falha |
| [Gaveta com uma peça 1440](design/screenshots/001-us3-uma-peca-1440.png) / [390](design/screenshots/001-us3-uma-peca-390.png) | Primeira seção aberta; arquivos são registros sintéticos |
| [Gaveta com várias peças 1440](design/screenshots/001-us3-varias-pecas-1440.png) / [390](design/screenshots/001-us3-varias-pecas-390.png) | Carrossel com páginas e Reels com cenas, separados por versão |
| [Gaveta compacta com uma peça 1440](design/screenshots/001-us3-compacta-uma-peca-1440.png) / [390](design/screenshots/001-us3-compacta-uma-peca-390.png) | Aplicação com apresentação compacta e documentos semanais únicos |
| [Gaveta compacta com várias peças 1440](design/screenshots/001-us3-compacta-varias-pecas-1440.png) / [390](design/screenshots/001-us3-compacta-varias-pecas-390.png) | Carrossel e Reels sintéticos na apresentação compacta |
| [Gaveta final com várias peças 1440](design/screenshots/001-us3-final-varias-pecas-1440.png) / [390](design/screenshots/001-us3-final-varias-pecas-390.png) | Carrossel e Reels abertos por clique, revisão legível e avisos específicos de mídia |
| [Gaveta com links/avisos corrigidos 1440](design/screenshots/001-us3-ultima-varias-pecas-1440.png) / [390](design/screenshots/001-us3-ultima-varias-pecas-390.png) | Apresentação com link não permitido distinto de mídia ausente e contador dos avisos relacionados |
| [Produção 1440](design/screenshots/001-us4-producao-1440.png) / [390](design/screenshots/001-us4-producao-390.png) | Quadro executável com mapa e captura sintéticos em TEMP |
| [Produção com pendências por coluna 1440](design/screenshots/001-us4-ajuste-producao-1440.png) / [390](design/screenshots/001-us4-ajuste-producao-390.png) | Cartões com mídia ausente somente nas colunas aplicáveis e +N das pendências visíveis; captura/mapa sintéticos em TEMP |
| [Planilha/dados 1440](design/screenshots/001-us5-dados-1440.png) / [390](design/screenshots/001-us5-dados-390.png) | Seis abas com mínimos triados, contagens NTV e rolagem própria; fixture sintética em TEMP |
| [Planilha/avisos 1440](design/screenshots/001-us5-avisos-1440.png) / [390](design/screenshots/001-us5-avisos-390.png) | Painel Aba/Linha/Campo/Motivo da peça, com dados das seis abas NTV preservados |
| [Planilha/Histórico 1440](design/screenshots/001-us5-historico-1440.png) / [390](design/screenshots/001-us5-historico-390.png) | Aba final de tentativas confirmadas, recentes primeiro; dados sintéticos |
| [Planilha ajustada/dados 1440](design/screenshots/001-us5-ajuste-dados-1440.png) / [390](design/screenshots/001-us5-ajuste-dados-390.png) | Seis tabelas com rolagem própria e registros sintéticos |
| [Planilha ajustada/avisos 1440](design/screenshots/001-us5-ajuste-avisos-1440.png) / [390](design/screenshots/001-us5-ajuste-avisos-390.png) | Origem com falha/contador e painel único de avisos; dados sintéticos |
| [Planilha ajustada/Histórico 1440](design/screenshots/001-us5-ajuste-historico-1440.png) / [390](design/screenshots/001-us5-ajuste-historico-390.png) | Histórico confirmado sintético, sem repetir motivos no cabeçalho |
| [003 objetivo 1440](design/screenshots/003-objetivo-1440.png) / [390](design/screenshots/003-objetivo-390.png) | Objetivo definido na cor principal e pautas sintéticas |
| [003 mais 1440](design/screenshots/003-mais-1440.png) / [390](design/screenshots/003-mais-390.png) | Cinco pautas e +2 pautas sintéticos |
| [003 mais uma 1440](design/screenshots/003-mais-um-1440.png) / [390](design/screenshots/003-mais-um-390.png) | Cinco pautas e +1 pauta sintéticos |
| [003 indefinido 1440](design/screenshots/003-indefinido-1440.png) / [390](design/screenshots/003-indefinido-390.png) | Ausência mensal sem inferência |
| [003 confirmar 1440](design/screenshots/003-confirmar-1440.png) / [390](design/screenshots/003-confirmar-390.png) | Duplicatas sintéticas com A confirmar |
| [003 Planilha 1440](design/screenshots/003-planilha-1440.png) / [390](design/screenshots/003-planilha-390.png) | Meses na Planilha, sintética |
| [Mockup v2](design/mockups/telas-v2.html) | Demonstração visual histórica, incluindo variantes futuras |
| [Mockup da gaveta v2](design/mockups/gaveta-v2.html) | Referência compacta aprovada para a seção 2 das telas, somente dados sintéticos |
| [Limites do mockup](design/mockups/LEIA-ME.md) | Sanitização e diferenças entre demonstração e escopo |
| [Desenho histórico](design/desenho.md) | Proposta de 02/10 com referência às decisões vigentes |
| [Protótipo histórico](design/prototype/index.html) | Primeira demonstração offline |
| [Limites do protótipo](design/prototype/LEIA-ME.md) | Evidência histórica e fronteiras da cópia |
| [Estrategista mensal proposto](design/prototype/estrategista-mensal-proposto.md) | Perfil futuro da 003, sem instalação |
| [Recibo da preparação](PREPARACAO-2026-10-02.md) | Estado histórico, sem transformar planejamento em integração |

## Relatórios sanitizados

As evidências históricas da 001 têm origem, estado e limites registrados na [validação](../specs/001-consulta-local-producao/validacao.md). A manutenção do iniciador tem relatório próprio e detalhes no [módulo](modules/iniciador.md#entrada-por-duplo-clique).

- [Saída histórica de node:test](reports/001-pr6-node-test.txt).
- [Validação local de Pronta para publicar](reports/pronta-publicar-validacao.md): opcionais, pacote ZIP, clipboard simulado, 33 testes focados (14 UI), gate Windows com 475 PASS/cobertura 94,0568% e limites da evidência.
- [Relatório sanitizado do gate de Pronta](reports/pronta-publicar-local-gate.json): fonte eb74b23, 12 hashes de arquivos, métricas de seis funções, todos os 20 avisos e agregados completos; baseline preservada.
- [Validação local de versões de páginas e cenas](reports/versoes-unidades-validacao.md): ponteiros exatos, vigência por índice, limites de retirada/revisões, rótulos de imagem, 26 testes de versões sem pulos e rodada inicial de 497 PASS preservada como histórica.
- [Relatório sanitizado vigente do gate de versões](reports/versoes-unidades-local-gate.json): fonte af403ae, seis hashes de arquivos, oito funções destacadas, 501 PASS, cobertura 94,2065%, 491 métricas/máximo 18 e 20 avisos; baseline preservada.
- [Relatório do gate local e complexidade por função](reports/001-pr6-quality-gate.json).
- [LCOV com caminhos relativos](reports/001-pr6-lcov.info).
- [Gate local final do iniciador/PR #19](reports/019-iniciador-local-gate.json): 371 PASS, suíte `.cmd` com 18 PASS, hashes do código/testes, origem e limites; iniciador integrado pelo [PR #19](https://github.com/Browsher/crm-social/pull/19), com essas medições preservadas como histórico.

## Evidência histórica da US2

[Resumo histórico do gate da US2](reports/001-us2-gate-resumo.json); origem, limites e estado corrente somente na [validação](../specs/001-consulta-local-producao/validacao.md).

## Evidência local da US3

[Resumo do gate da gaveta](reports/001-us3-gate-resumo.json); resultados, limites e estado corrente somente na [validação](../specs/001-consulta-local-producao/validacao.md).

[Resumo sanitizado da última verificação local](reports/001-us3-ultima-local.json); origem, execução e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

[Resumo sanitizado das regressões de texto e JSON](reports/001-us3-regressao-local.json); origem, execução e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

## Evidência local da US4

[Resumo histórico do quadro de Produção](reports/001-us4-local.json) e [resumo do ajuste de pendências por coluna](reports/001-us4-ajuste-local.json); origem, execução, revisão e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md). A medição anterior permanece histórica.

## Evidência local da US5

[Resumo sanitizado de Planilha, avisos e Histórico](reports/001-us5-local.json); implementação local e verificações do incremento, sem aceite operacional. Origem, medições, revisão corrente e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

[Resumo do ajuste de Planilha](reports/001-us5-ajuste-local.json); execução e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

## Evidência local da fase final

[Resumo sanitizado de T035–T038](reports/001-fase8-local.json); iniciador, escala e regressões locais. Histórico de verificações, demonstração real e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

[Resumo da validação anterior à promoção](reports/001-fase8-preflight-local.json); triagem compartilhada e rejeição da candidata sem substituir a vigente. Execuções e limites somente na [validação](../specs/001-consulta-local-producao/validacao.md).

[Resumo sanitizado do CI da fase final](reports/001-fase8-ci.json); reproduz os estados e a versão do scanner observados no log oficial, sem substituir o relatório local ou declarar captura operacional.

[Resumo do CI do preflight](reports/001-fase8-preflight-ci.json); estados e scanner observados sobre o código corrigido, com procedência e limitações explícitas na [validação](../specs/001-consulta-local-producao/validacao.md).

## Referências de desenvolvimento preservadas

| Documento / catálogo | Papel |
| --- | --- |
| [Agente doc-sync-onboarding](../.claude/agents/doc-sync-onboarding.md) | Sincronização somente dos Markdown afetados |
| [Agente test-writer](../.claude/agents/test-writer.md) | Instruções de testes; não é um agente editorial instalado |
| [Agente reviewer](../.claude/agents/reviewer.md) | Revisão independente |
| [Agente security-auditor](../.claude/agents/security-auditor.md) | Auditoria conforme escopo |
| [Skill doc-init Codex](../.agents/skills/doc-init/SKILL.md) | Onboarding do código real e regra curta |
| [Skills Codex](../.agents/skills/) / [Claude](../.claude/skills/) | Catálogos de ferramenta, não documentos de arquitetura implementada |
| [Extensão Git do Spec Kit](../.specify/extensions/git/README.md) | Ferramenta oficial preservada |
| [Git initialize](../.specify/extensions/git/commands/speckit.git.initialize.md) / [remote](../.specify/extensions/git/commands/speckit.git.remote.md) | Comandos da extensão, sem nova execução nesta sincronização |
| [Git feature](../.specify/extensions/git/commands/speckit.git.feature.md) / [validate](../.specify/extensions/git/commands/speckit.git.validate.md) / [commit](../.specify/extensions/git/commands/speckit.git.commit.md) | Referências oficiais; documentação não concede autorização de Git |
| [Templates do Spec Kit](../.specify/templates/) | Fontes oficiais de scaffold, sem alteração |

Este índice cobre os Markdown autorais de docs/specs, governança/regra curta e referências locais pertinentes, além das evidências sanitizadas referenciadas acima. Templates e catálogos de skills são ferramentas preservadas, não uma segunda especificação. Dados privados de data/, dependências e demais relatórios temporários ficam fora do índice.

Regras de escrita: analogia e visão leiga primeiro, depois detalhe técnico; tabelas de campos/rotas/env; Mermaid de imports/persistência; PT-BR com acentos e caminhos relativos. Atualizar na mesma tarefa, separando planejado, implementado, testado e integrado.

## Evidência da 002

[Relatório completo do gate local](reports/002-local-gate.json) e [resumo do gate Linux extraído dos logs oficiais](reports/002-ci-gate.json). Heads, execuções, review e aceites somente na [validação](../specs/002-consulta-planilhas/validacao.md).

[Relatório local dos ajustes do PR #14](reports/002-ajustes-local-gate.json), com head validado explícito; os dois relatórios acima preservam as rodadas anteriores. Aceite Linux e reviews correspondentes na mesma validação.

[Resumo sanitizado do gate local da T021](reports/002-t021-local-gate.json). Resultados reais somente sanitizados na validação da 002; nenhum dado privado neste relatório.

## Evidência da 003

[Relatório inicial da consulta mensal](reports/003-local-gate.json): 312 PASS, preservado como histórico. [Relatório local dos ajustes](reports/003-ajustes-local-gate.json): fonte validada `84ab509`, 320 PASS, cobertura 98,3660%, drop 0, complexidade PASS com 17 avisos, Semgrep SKIP por ausência no Windows, audit N/A e baseline não atualizada. Identifica separadamente `gateProcessHead:f020d26`, pois o gate precedeu o commit de código. [Resumo histórico do gate Linux](reports/003-ci-gate.json): head `9ef4e6b`, Semgrep PASS, extraído dos logs oficiais sem inventar contagem/percentual remotos. [Resumo Linux dos ajustes](reports/003-ajustes-ci-gate.json): head `fd92f09`, gate/review conferidos. Novos commits exigem conferir os checks do PR. Execuções e reviews históricos, doze screenshots sintéticos e fechamento T002/T015 na [validação](../specs/003-planejamento-mensal/validacao.md). [PR #15](https://github.com/Browsher/crm-social/pull/15) integrado. T002/T015 concluídas com uma linha fictícia marcada como teste na fonte real; uso editorial real não comprovado. O fechamento documental exige seus próprios checks/review.

[Relatório completo do gate da integração após T021](reports/003-integracao-t021-local-gate.json); fonte, processo, revisão e limites na [validação da 003](../specs/003-planejamento-mensal/validacao.md).

## Feature 004 — Pautas no Planejamento

Implementada/testada localmente, com **449 PASS** no gate Windows, cobertura **93,8748%**, complexidade PASS/20 avisos, exit 0 e baseline preservada. Drop 0 é do modo full, sem comparação histórica; Semgrep SKIP por ferramenta ausente/audit N/A. [PR #20](https://github.com/Browsher/crm-social/pull/20) acompanha entrega e integração, com merge condicionado ao gate/review do head vigente; resultados de gate/review por head na [validação da 004](../specs/004-pautas-planejamento/validacao.md); prova local e screenshots não demonstram operação editorial real.

- [Spec](../specs/004-pautas-planejamento/spec.md), [plano](../specs/004-pautas-planejamento/plan.md), [tarefas](../specs/004-pautas-planejamento/tasks.md) e [checklist](../specs/004-pautas-planejamento/checklists/requirements.md).
- [Pesquisa](../specs/004-pautas-planejamento/research.md), [modelo](../specs/004-pautas-planejamento/data-model.md), [contrato](../specs/004-pautas-planejamento/contracts/pautas.md) e [quickstart](../specs/004-pautas-planejamento/quickstart.md).
- [Validação e limites](../specs/004-pautas-planejamento/validacao.md) e [módulo Pautas](modules/pautas.md).
- [Relatório histórico do gate Windows](reports/004-local-gate.json), [relatório atual dos ajustes](reports/004-ajustes-local-gate.json) e [galeria dos 20 screenshots](design/screenshots/LEIA-ME.md#004--pautas-no-planejamento).
- [Gerador sintético](../scripts/screenshots-pautas.cjs), [fixture compartilhada](../tests/pautas-fixtures.cjs), [testes de dados/I/O/projeção/HTTP](../tests/pautas.test.cjs), [testes de interface](../tests/pautas-interface.test.cjs) e [testes do gerador](../tests/screenshots-pautas.test.cjs).
