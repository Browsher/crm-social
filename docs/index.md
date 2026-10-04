# Documentação

Como o índice de um álbum, esta página localiza decisões, módulos e evidências: T001–T026/US1, US2 e US3 implementadas, com revisão corrente e pendências na [validação](../specs/001-consulta-local-producao/validacao.md).

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
| [ROADMAP](../ROADMAP.md) | Seis features, aceite futuro e progresso parcial |
| [AGENTS](../AGENTS.md) | Regras locais e bloco gerenciado preservado |
| [CLAUDE](../CLAUDE.md) | Importador das instruções canônicas; não é outra regra de produto |
| [Constituição 1.0.0](../.specify/memory/constitution.md) | Princípios e limites; nenhuma emenda nesta entrega |
| [Regra curta de estrutura](../.claude/rules/project-structure.md) | EntryPoints/pastas/imports/testes observados, até 60 linhas |
| [architecture.md](architecture.md) | Mapa de módulos/imports, persistência, rotas/env e dívidas |
| [Este índice](index.md) | Todos os documentos autorais do projeto e referências de ferramenta |

## Módulos implementados

| Documento | Código explicado |
| --- | --- |
| [Captura](modules/captura.md) | src/captura.cjs; envelope, 66 mínimos, normalização e hash |
| [Snapshot/persistência](modules/snapshot.md) | src/snapshot.cjs; trava, estado único, imutabilidade, falhas e órfãos |
| [Importador](modules/importador.md) | scripts/importar-captura.cjs; argumentos/saída e falhas de entrada |
| [Configuração do quadro](modules/quadro-config.md) | src/quadro-config.cjs e config/quadro-etapas.json; classificação ainda futura |
| [Projeção](modules/projecao.md) | src/projecao.cjs; seleção NTV, datas/formatos, frescor e detalhes por versão/relação; quadro/Planilha completos ainda futuros |
| [Servidor](modules/servidor.md) | src/servidor.cjs; quatro rotas fixas e Host/Origin |
| [Web/Planejamento](modules/web.md) | src/web; calendário/lista/filtros, gaveta compacta por peça, revisão/unidades/arquivos e origem/releitura em Planilha |

## Feature 001 canônica

| Documento | Para que serve |
| --- | --- |
| [spec.md](../specs/001-consulta-local-producao/spec.md) | Requisitos/cenários/aceite da feature completa, preservados |
| [plan.md](../specs/001-consulta-local-producao/plan.md) | Solução planejada completa; cabeçalho distingue recorte implementado |
| [research.md](../specs/001-consulta-local-producao/research.md) | Pesquisa histórica de 03/10 e justificativas; não é status atual da implementação |
| [data-model.md](../specs/001-consulta-local-producao/data-model.md) | Modelo alvo completo, entidades e transições; estado parcial no início |
| [Contrato captura/consulta](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) | Envelope e 66 mínimos, persistência e UI completas; pendências explícitas |
| [tasks.md](../specs/001-consulta-local-producao/tasks.md) | T001–T026 marcadas e T027–T041 pendentes; rastreabilidade |
| [quickstart.md](../specs/001-consulta-local-producao/quickstart.md) | Ambiente/Node/PATH, sete suítes, demo TEMP e roteiro final futuro |
| [validacao.md](../specs/001-consulta-local-producao/validacao.md) | Execuções reais RED/GREEN, revisão, regressões, gate e limitações |
| [Checklist e análise](../specs/001-consulta-local-producao/checklists/requirements.md) | Revisão documental anterior; não substitui testes do aplicativo |

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
