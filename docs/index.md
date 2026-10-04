# Documentação

Como o índice de um álbum, esta página indica onde encontrar decisões, código explicado e evidências sem confundir uma fotografia de demonstração com a operação. Estado em 04/10/2026: primeira entrega local da 001/T001–T018 implementada; 23 tarefas pendentes; primeiro CI Linux do PR #6 passou, nova validação remota das correções está pendente no retrato pré-push desta rodada (04/10/2026), e captura operacional aguarda.

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
| [Projeção](modules/projecao.md) | src/projecao.cjs; seleção NTV, datas/formatos e bases futuras |
| [Servidor](modules/servidor.md) | src/servidor.cjs; quatro rotas fixas e Host/Origin |
| [Web/Planejamento](modules/web.md) | src/web; calendário/lista/filtros e diálogo básico |

## Feature 001 canônica

| Documento | Para que serve |
| --- | --- |
| [spec.md](../specs/001-consulta-local-producao/spec.md) | Requisitos/cenários/aceite da feature completa, preservados |
| [plan.md](../specs/001-consulta-local-producao/plan.md) | Solução planejada completa; cabeçalho distingue recorte implementado |
| [research.md](../specs/001-consulta-local-producao/research.md) | Pesquisa histórica de 03/10 e justificativas; não é status atual da implementação |
| [data-model.md](../specs/001-consulta-local-producao/data-model.md) | Modelo alvo completo, entidades e transições; estado parcial no início |
| [Contrato captura/consulta](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) | Envelope e 66 mínimos, persistência e UI completas; pendências explícitas |
| [tasks.md](../specs/001-consulta-local-producao/tasks.md) | T001–T018 marcadas e T019–T041 pendentes; rastreabilidade |
| [quickstart.md](../specs/001-consulta-local-producao/quickstart.md) | Ambiente/Node/PATH, sete suítes, demo TEMP e roteiro final futuro |
| [validacao.md](../specs/001-consulta-local-producao/validacao.md) | Execuções reais RED/GREEN, revisão, regressões, gate e limitações |
| [Checklist e análise](../specs/001-consulta-local-producao/checklists/requirements.md) | Revisão documental anterior; não substitui testes do aplicativo |

## Design e evidência visual

| Documento / artefato | Para que serve |
| --- | --- |
| [Telas decididas](design/telas.md) | Decisões do autor e nota de implementação parcial |
| [Screenshots reais/LEIA-ME](design/screenshots/LEIA-ME.md) | Aplicação em execução somente com dados fictícios; origem/limites |
| [Planejamento 1440](design/screenshots/001-planejamento-1440.png) / [390](design/screenshots/001-planejamento-390.png) | Capturas sintéticas desktop/mobile |
| [Mockup v2](design/mockups/telas-v2.html) | Demonstração visual histórica, incluindo variantes futuras |
| [Limites do mockup](design/mockups/LEIA-ME.md) | Sanitização e diferenças entre demonstração e escopo |
| [Desenho histórico](design/desenho.md) | Proposta de 02/10 com referência às decisões vigentes |
| [Protótipo histórico](design/prototype/index.html) | Primeira demonstração offline |
| [Limites do protótipo](design/prototype/LEIA-ME.md) | Evidência histórica e fronteiras da cópia |
| [Estrategista mensal proposto](design/prototype/estrategista-mensal-proposto.md) | Perfil futuro da 003, sem instalação |
| [Recibo da preparação](PREPARACAO-2026-10-02.md) | Estado histórico, sem transformar planejamento em integração |

## Evidências sanitizadas do PR #6

Capturadas no head ab3b036, com fixtures fictícias e armazenamento temporário; interpretação e limites em [validação](../specs/001-consulta-local-producao/validacao.md).

- [node:test completo, 67 PASS e nove casos de UI](reports/001-pr6-node-test.txt).
- [Relatório do gate local e complexidade por função](reports/001-pr6-quality-gate.json).
- [LCOV com caminhos relativos](reports/001-pr6-lcov.info).

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

Este índice cobre os Markdown autorais de docs/specs, governança/regra curta e referências locais pertinentes, mais as três evidências sanitizadas acima. Templates e catálogos de skills são ferramentas preservadas, não uma segunda especificação. Dados privados de data/, dependências e demais relatórios temporários ficam fora do índice.

Regras de escrita: analogia e visão leiga primeiro, depois detalhe técnico; tabelas de campos/rotas/env; Mermaid de imports/persistência; PT-BR com acentos e caminhos relativos. Atualizar na mesma tarefa, separando planejado, implementado, testado e integrado.
