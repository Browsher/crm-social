# Preparação do CRM Social — 02/10/2026

Pedido: criar subprojeto dentro de Social Midia usando GitHub Spec Kit, dividir em features e construir em partes com apoio de Superpowers. Acesso somente neste computador já aprovado.

## Realizado

- CLI `specify` existente conferido na versão 1.0.13. Executado `specify init crm-social --integration codex --script ps --non-interactive` a partir do workspace; resultado concluído.
- Criados scaffold `.specify/` e skills Codex `.agents/skills/speckit-*`. Nenhuma atualização global de ferramenta nem inicialização Git.
- Escrita constituição 1.0.0; feature ativa `001-consulta-local-producao` registrada em `.specify/feature.json`.
- Preparados roadmap, especificação, checklist, pesquisa, modelo, contrato, plano, tarefas e roteiro de verificação.
- Scripts oficiais `setup-plan.ps1` e `setup-tasks.ps1` executados. As skills oficiais foram lidas; não existe `.specify/extensions.yml`, portanto não há hooks de extensão configurados para estas etapas.
- Consulta delimitada de metadados/cabeçalhos/registros pela conexão Google existente confirmou o formato das seis abas. Isso não é uma captura completa para o aplicativo.

## Limites do resultado

Nenhum código do CRM ou teste de produto foi executado: ainda não existem. Nenhuma captura completa, servidor, sincronização contínua ou integração operacional foi entregue nesta preparação. Nenhuma escrita remota, nova agenda, mídia, publicação ou alteração de workflow ocorreu.

O executável instalado vem de um ambiente `specify-cli` existente. Não foi verificado um commit Git de origem; não declarar que o CLI foi compilado de um clone. A documentação oficial admite instalação PyPI. Os comandos de inicialização e os arquivos produzidos comprovam o scaffold usado, não a aplicação final.

## Próxima entrega

Conferência documental realizada nesta preparação: o script oficial `check-prerequisites.ps1 -Json -RequireSpec -RequireTasks -IncludeTasks` retornou a feature correta e os cinco grupos de documentos esperados. Foram conferidos 13 documentos próprios, sem links locais quebrados ou marcadores de preenchimento pendentes; 22 tarefas sequenciais, sendo 6 da US1, 3 da US2, 4 da US3 e 9 de fundação/entrega. Seis tarefas permitem paralelismo dentro de seus pré-requisitos. Uma revisão independente não encontrou falha documental concreta. Isso verifica o plano, não testa um aplicativo.

Implementar a feature 001 a partir de `specs/001-consulta-local-producao/tasks.md`, demonstrar calendário/lista/detalhes com captura real e só então avançar para o planejamento mensal. O novo Estrategista Mensal pertence à feature 002; não foi instalado.
