# CRM Social

Como um álbum de fotografias da produção, o CRM apresenta uma captura da operação para localizar as peças da NTV neste computador. Sheets e Drive continuam sendo as fontes operacionais; o desenho aprovado orienta a interface.

**Estado em 04/10/2026:** primeira entrega local da feature 001 implementada, cobrindo T001–T018: fundação de captura/persistência/API e US1 Planejamento. Há aplicativo executável com calendário, lista semanal, filtros, imagem B histórica, **N sem data**, objetivo **Ainda não definido** e abertura básica do dia inteiro. As 23 tarefas seguintes permanecem pendentes; a feature completa ainda não foi aceita. Não houve leitura real do Google nem validação com captura operacional.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge. O review **0.4.4** foi validado no [PR #2](https://github.com/Browsher/crm-social/pull/2#issuecomment-5974734150), commit `6f88479`, [execução 37162882452](https://github.com/Browsher/crm-social/actions/runs/37162882452). A **0.4.5** foi aceita no [PR #3](https://github.com/Browsher/crm-social/pull/3#issuecomment-5975683038), commit `afd8238` (merge `72efb98`), [execução 37170294491](https://github.com/Browsher/crm-social/actions/runs/37170294491). A **0.4.7** foi aceita no [PR #4](https://github.com/Browsher/crm-social/pull/4#issuecomment-5976055197), commit `c9d1e91` (merge `506d7a7`), [execução 37173190416](https://github.com/Browsher/crm-social/actions/runs/37173190416). A **0.4.8** foi aceita no [PR #5](https://github.com/Browsher/crm-social/pull/5#issuecomment-5976475669), head `bc0b02b` (merge `4f20f20`), [execução 37176292254](https://github.com/Browsher/crm-social/actions/runs/37176292254). O repositório é público e o ruleset ativo da `main` exige `quality-gate`.

O review do [PR #1](https://github.com/Browsher/crm-social/pull/1) precisou de 23 turnos; o kit 0.4.8 conserva o limite de 40 turnos e timeout de 20 minutos. Esse custo/limite permanece dívida de acompanhamento. Retenção por possível segredo e falha foram testadas somente localmente, sem prova desses caminhos no Actions; `gerar-testes` também não foi exercitado. Se `files` vier menor que `changedFiles`, o review recusa a lista incompleta; o teto numérico ainda não foi documentado.

O gate local desta entrega passou em testes, cobertura e complexidade; Semgrep ficou **SKIP** por ausência no Windows e audit **N/A** porque a aplicação não tem `package.json`. A evidência detalhada está em [validacao.md](specs/001-consulta-local-producao/validacao.md). PR e execução Linux desta entrega ainda aguardam; o histórico do kit não comprova o CI do aplicativo.

## Onde começar

- [Roadmap de seis features](ROADMAP.md)
- [Feature 001: consulta da produção](specs/001-consulta-local-producao/spec.md)
- [Plano de implementação](specs/001-consulta-local-producao/plan.md)
- [Tarefas da primeira feature](specs/001-consulta-local-producao/tasks.md)
- [Constituição](.specify/memory/constitution.md) e [instruções de desenvolvimento](AGENTS.md)
- [Desenho aprovado](docs/design/desenho.md) e [prévia visual](docs/design/prototype/index.html)
- [Telas decididas e escopo por feature](docs/design/telas.md)
- [Mockup de telas v2](docs/design/mockups/telas-v2.html) e [limites da demonstração](docs/design/mockups/LEIA-ME.md)
- [Índice da documentação](docs/index.md)
- [Arquitetura e fronteiras implementadas](docs/architecture.md)
- [Telas reais com dados fictícios](docs/design/screenshots/LEIA-ME.md)
- [Recibo da preparação](docs/PREPARACAO-2026-10-02.md)

## Como vamos construir

Spec Kit mantém requisitos, plano e tarefas de cada feature. Superpowers apoia a implementação em partes, testes e revisão. A 001 entregará Planejamento com cartões, lista semanal e gaveta do dia, Produção em quadro por etapa e Planilha com abas e histórico de capturas. O menu terá somente esses três itens. Depois vêm 002 Planilhas (leitura direta pelo servidor local), 003 planejamento mensal, 004 pedidos de ajuste, 005 biblioteca/prévias e 006 Equipe/Workflow.

A primeira versão recebe um arquivo de captura preparado pela Central e validado pelo importador local. Nesta entrega, o selo é **Captura local** quando há captura e **Sem dados** quando não há; ele ainda não classifica frescor/falha em quatro estados. **Atualizar dados**, os detalhes/acordeões, o quadro de Produção e as abas/Histórico de Planilha pertencem às próximas tarefas. Produção e Planilha já estão no menu, com mensagens de próxima entrega.

A busca direta no Google será a 002, mediante emenda explícita da constituição, somente leitura por conta de serviço com chave fora do repositório. A 003 tratará o objetivo mensal e a meta de uma imagem, um carrossel e um vídeo semanais, preservando as peças históricas existentes. Até lá, o objetivo do mês mostra **Ainda não definido**.

## Executar a primeira entrega local

Na raiz do repositório, selecione o Node 24.19.0 existente por `CRM_NODE_PATH` e siga o [quickstart](specs/001-consulta-local-producao/quickstart.md). Os entrypoints reais são:

```powershell
& $env:CRM_NODE_PATH scripts/importar-captura.cjs $crmCapturePath --data-dir $crmDataDir
& $env:CRM_NODE_PATH src/servidor.cjs --data-dir $crmDataDir --port 4318
```

`$crmCapturePath` identifica um JSON local já coletado e `$crmDataDir`, um diretório privado ou TEMP de demonstração. Sem captura, o servidor apresenta ausência real; não carrega uma demonstração automaticamente. Abrir `http://127.0.0.1:4318`; `localhost` não é o Host aceito. O iniciador PowerShell de duplo clique ainda não existe.

Testes locais: `node --test`, com Node 24.19.0 selecionado também à frente do PATH e Playwright existente resolvido por `CRM_PLAYWRIGHT_MODULE`; gate: `node tools/quality-gate.mjs`. Nenhuma instalação nova é necessária. No CI, os cinco testes de interface registram SKIP explícito; o aceite local exige executá-los.

**Próximo passo:** T019–T022, quatro estados do selo e releitura local. A integração operacional e a demonstração completa continuam posteriores. Esta consulta não instala agentes, muda agendas, gera mídia ou escreve na operação.
