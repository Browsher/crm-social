# Documentação

Como o índice de um álbum, esta página localiza decisões, módulos e evidências: 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas; resultados e limitações na [validação](../specs/001-consulta-local-producao/validacao.md). A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.

## Ordem de leitura

1. [README](../README.md): resultado atual e comandos de entrada.
2. [Roadmap](../ROADMAP.md), [AGENTS](../AGENTS.md) e [constituição](../.specify/memory/constitution.md): escopo e fronteiras.
3. [Arquitetura](architecture.md) e módulos abaixo: imports, persistência, HTTP e interface reais.
4. [Spec](../specs/001-consulta-local-producao/spec.md), [plano](../specs/001-consulta-local-producao/plan.md) e [tarefas](../specs/001-consulta-local-producao/tasks.md): requisitos da 001 completa e próxima entrega.
5. [Quickstart](../specs/001-consulta-local-producao/quickstart.md), [validação](../specs/001-consulta-local-producao/validacao.md) e [screenshots sintéticos](design/screenshots/LEIA-ME.md): executar/conferir o recorte e seus limites.

## Governança e arquitetura

| Documento | Para que serve |
| --- | --- |
| [README](../README.md) | Apresentação, estado e comandos reais |
| [ROADMAP](../ROADMAP.md) | Cinco features do v1 e v2 visual ilustrativo |
| [AGENTS](../AGENTS.md) | Regras locais e bloco gerenciado preservado |
| [CLAUDE](../CLAUDE.md) | Importador das instruções canônicas; não é outra regra de produto |
| [Constituição 1.1.0](../.specify/memory/constitution.md) | Princípios e limites; emenda VI aprovada/aplicada em05/10 |
| [Regra curta de estrutura](../.claude/rules/project-structure.md) | EntryPoints/pastas/imports/testes observados, até 60 linhas |
| [architecture.md](architecture.md) | Mapa de módulos/imports, persistência, rotas/env e dívidas |
| [Este índice](index.md) | Todos os documentos autorais do projeto e referências de ferramenta |

## Módulos implementados

| Documento | Código explicado |
| --- | --- |
| [Google](modules/google.md) | JWT/fetch nativos, configuração externa e token em memória |
| [Coleta](modules/coleta.md) | Seis grades tipadas, duas leituras, metadados/hashes e datas |
| [Captura](modules/captura.md) | src/captura.cjs; envelope, 66 mínimos, normalização e hash |
| [Triagem compartilhada](modules/triagem.md) | src/triagem.cjs; seleção NTV, redação e identidades validadas antes da promoção e na consulta |
| [Snapshot/persistência](modules/snapshot.md) | src/snapshot.cjs; trava, estado único, imutabilidade, falhas e órfãos |
| [Importador](modules/importador.md) | scripts/importar-captura.cjs; argumentos/saída e falhas de entrada |
| [Configuração do quadro](modules/quadro-config.md) | src/quadro-config.cjs e config/quadro-etapas.json; mapa validado e aplicado na US4 |
| [Projeção](modules/projecao.md) | src/projecao.cjs; seleção NTV, datas/formatos, frescor, detalhes/quadro e cópias dos mínimos para seis tabelas; Histórico confirmado |
| [Servidor](modules/servidor.md) | src/servidor.cjs; quatro rotas fixas e Host/Origin |
| [Iniciador Windows](modules/iniciador.md) | Iniciar CRM.ps1; Node existente, processo oculto, confirmação, retorno e logs privados |
| [Web/Planejamento, Produção e Planilha](modules/web.md) | src/web; calendário/lista/filtros, gaveta compacta, quadro, seis abas/Histórico, releitura e avisos por peça |

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

## Feature 002 — Planilhas (implementada localmente; conta/demonstração reais pendentes)

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

Nenhuma coleta real; implementação e provas sintéticas da002 na validação.

## Design e evidência visual

| Documento / artefato | Para que serve |
| --- | --- |
| [Telas decididas](design/telas.md) | Decisões do autor e nota de implementação parcial |
| [Screenshots reais/LEIA-ME](design/screenshots/LEIA-ME.md) | Aplicação em execução somente com dados fictícios; origem/limites |
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
| [Mockup v2](design/mockups/telas-v2.html) | Demonstração visual histórica, incluindo variantes futuras |
| [Mockup da gaveta v2](design/mockups/gaveta-v2.html) | Referência compacta aprovada para a seção 2 das telas, somente dados sintéticos |
| [Limites do mockup](design/mockups/LEIA-ME.md) | Sanitização e diferenças entre demonstração e escopo |
| [Desenho histórico](design/desenho.md) | Proposta de 02/10 com referência às decisões vigentes |
| [Protótipo histórico](design/prototype/index.html) | Primeira demonstração offline |
| [Limites do protótipo](design/prototype/LEIA-ME.md) | Evidência histórica e fronteiras da cópia |
| [Estrategista mensal proposto](design/prototype/estrategista-mensal-proposto.md) | Perfil futuro da 003, sem instalação |
| [Recibo da preparação](PREPARACAO-2026-10-02.md) | Estado histórico, sem transformar planejamento em integração |

## Relatórios sanitizados

As evidências têm origem, estado e limites registrados somente na [validação](../specs/001-consulta-local-producao/validacao.md).

- [Saída histórica de node:test](reports/001-pr6-node-test.txt).
- [Relatório do gate local e complexidade por função](reports/001-pr6-quality-gate.json).
- [LCOV com caminhos relativos](reports/001-pr6-lcov.info).

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
