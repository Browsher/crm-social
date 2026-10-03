# Documentação

Mapa da documentação deste projeto. Comece pelo [README](../README.md) e pelo [roadmap de seis features](../ROADMAP.md). Estado em 03/10/2026: design e planejamento da 001 revisados; aplicativo ainda não implementado.

| Documento | Para que serve |
| --- | --- |
| [architecture.md](architecture.md) | Módulos, fluxo de uma requisição e fronteiras do sistema |
| [Telas decididas](design/telas.md) | Decisões do autor, telas da 001 e fronteiras das features 002–006 |
| [Mockup v2](design/mockups/telas-v2.html) | Demonstração visual com exemplos, sem dados operacionais |
| [Limites do mockup v2](design/mockups/LEIA-ME.md) | Conferência, saneamento e diferenças entre variantes e escopo da 001 |
| [Desenho histórico](design/desenho.md) | Proposta de 02/10, com referência às decisões vigentes |
| [Protótipo histórico](design/prototype/index.html) | Primeira demonstração offline |
| [Limites do protótipo](design/prototype/LEIA-ME.md) | Evidência histórica e fronteiras da cópia |
| [Estrategista mensal proposto](design/prototype/estrategista-mensal-proposto.md) | Perfil futuro da 003, sem instalação |
| [Recibo da preparação](PREPARACAO-2026-10-02.md) | Conferência documental histórica, com nota da renumeração |

O [registro da feature 001](../specs/001-consulta-local-producao/spec.md) contém requisitos; o [plano](../specs/001-consulta-local-producao/plan.md), o [contrato de captura e consulta](../specs/001-consulta-local-producao/contracts/captura-e-consulta.md), as [tarefas](../specs/001-consulta-local-producao/tasks.md) e o [roteiro de verificação](../specs/001-consulta-local-producao/quickstart.md) definem a entrega futura. O [checklist e resultado da análise](../specs/001-consulta-local-producao/checklists/requirements.md) registram a revisão documental. Consultar a [constituição](../.specify/memory/constitution.md) e as [instruções locais](../AGENTS.md) antes de implementar.

Documentos por módulo ficam em `docs/modules/<nome>.md` e entram nesta tabela quando forem criados.

Regras de escrita: visão leiga primeiro, depois o detalhe técnico; tabelas para campos, rotas e variáveis; diagramas Mermaid para relações e fluxos; português do Brasil. O agente `doc-sync-onboarding` mantém este índice; a primeira versão completa vem da skill `doc-init`.
