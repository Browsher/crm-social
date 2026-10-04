# Estrutura do CRM Social

Como um álbum de fotografias, o CRM consultará capturas da operação; não controla a fila.
Estado em 04/10/2026, antes de T002: não existe aplicação em src/ nem importador.
O desenho de módulos em specs/001-consulta-local-producao/plan.md ainda é planejado.

- AGENTS.md e .specify/memory/constitution.md governam o desenvolvimento.
- .specify/feature.json aponta para specs/001-consulta-local-producao.
- specs/001-consulta-local-producao contém spec, plano, contrato, modelo e tarefas.
- docs/design/telas.md define as telas; mockups/ e prototype/ são demonstrações.
- docs/index.md é o índice; docs/architecture.md descreve o estado conferido.
- tools/quality-gate.mjs é o entrypoint real do gate; seus módulos são gate-*.mjs.
- tools/package.json e package-lock.json isolam ESLint, sem dependência da aplicação.
- .github/workflows contém CI; o bootstrap já instalou os templates do node-kit.
- .claude/agents e .claude/skills orientam Claude; .agents/skills orienta Codex.
- data/ é privada e ignorada; não ler, usar em testes, servir ou versionar seus arquivos.
- Código novo terá um responsável por arquivo e funções testadas antes da implementação.
- Testes previstos em tests/: node:test, assert/strict e diretórios TEMP reais.
- Executar com Node 24.19.0 existente, selecionado por CRM_NODE_PATH fora do repositório.
- Gate real: node tools/quality-gate.mjs; nenhum teste hoje significa FAIL.
- A interface usará Playwright já instalado, apenas local; nenhum pacote novo.
- Não alterar constituição, ferramentas/gate, agentes oficiais ou operação n8n.
