---
name: doc-init
description: Documenta projeto Node existente a partir do código e gera regra curta de estrutura.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

Leia AGENTS.md e as regras documentais vigentes. Explore primeiro código real, package.json, entrypoints, rotas, persistência, serviços, configuração e infraestrutura pertinentes. Não ler data/, node_modules/, tools/node_modules/ ou anexos privados. Não executar aplicativo ou chamar serviço para inventar estado.

Escreva PT-BR, visão leiga antes do técnico e use analogias para explicar o objetivo e o fluxo; caminhos relativos, referências a funções/linhas reais, tabelas e Mermaid. Separe planejado, implementado, testado e integrado; documentar não demonstra execução. Preserve seções não afetadas, sem reescrever regras pessoais ou CLAUDE.md canônico/importador.

Atualize docs/index.md com ordem de leitura e links; docs/architecture.md com mapa Mermaid dos módulos/imports, fronteiras e fluxo de requisição; docs/modules/<nome>.md por módulo com arquivos/responsabilidades, dados, rotas, erros e testes. Documente persistência e variáveis apenas quando existirem, sem copiar seus valores privados. README deve apontar para docs/index.md e ter comandos reais conferidos.

Durante a leitura do código Node, registre dívidas técnicas e pegadinhas: bugs latentes, TODOs, acoplamentos, segredos versionados e divergências de fluxo. Documentar o que está torto é tão importante quanto o que está certo. Cite o módulo, o trecho e o impacto de cada achado; para um segredo versionado, informe somente a localização, sem reproduzir o valor.

Seja completo, não superficial: prefira detalhe à brevidade nos documentos de onboarding.

Gere .claude/rules/project-structure.md lido do código, no máximo 60 linhas, incluindo frontmatter/cercas se usados. Não copiar uma estrutura desejada da spec como implementada. Conte as linhas antes de salvar; use estes campos, preenchidos somente com fatos observados: objetivo do projeto; entrypoints reais; mapa curto de pastas/módulos; fronteiras/ imports; comandos de teste; índice docs. Elimine detalhe que pertence a docs/modules, nunca truncar uma regra no meio para atingir o limite.

Se project-structure.md já existir, leia e mescle somente fatos novos, preservando orientações do autor; se houver conflito, reporte em vez de substituir. Não criar constitution ou executar specify/ hooks. Bugs/dúvidas são registro com evidência, não correção de código.

## Checklist final de qualidade

- [ ] Módulos e fluxos implementados estão cobertos pela documentação.

- [ ] Cada documento afetado começa com visão leiga e avança até o detalhe técnico.
- [ ] docs/index.md cobre 100% dos documentos existentes, e o README mantém um link visível para docs/.
- [ ] Mermaid presente na arquitetura e nos fluxos relevantes, incluindo a persistência quando existir.
- [ ] Rotas, variáveis de ambiente e contratos de dados reais documentados a partir do código, sem reproduzir valores privados.
- [ ] Nada inventado: cada comportamento, comando e dado descrito foi conferido no código.
- [ ] Dívidas técnicas e pegadinhas registradas com localização, evidência e impacto.
- [ ] Todas as cercas de código e de diagrama estão fechadas e balanceadas.
- [ ] Seções não afetadas permanecem intactas, preservando decisões e convenções do projeto.

Conferir links/ caminhos reais e cercas balanceadas. Não confundir template docs vazio com arquitetura documentada. Retorne documentos alterados, fonte do código para cada mudança, contagem <=60 de project-structure.md, limites e divergências que dependem do autor.
