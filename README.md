# CRM Social

Como um álbum de fotografias da produção, o CRM apresenta uma captura da operação para localizar as peças da NTV neste computador. Sheets e Drive continuam sendo as fontes operacionais; o desenho aprovado orienta a interface.

**Estado em 04/10/2026:** entrega local da feature 001 implementada até T022: fundação de captura/persistência/API, US1 Planejamento e US2/frescor e releitura. Há aplicativo executável com calendário, lista semanal, filtros, imagem B histórica, **N sem data**, objetivo **Ainda não definido** e abertura básica do dia inteiro. O selo contratual e a origem/atualização na Planilha já funcionam. As 19 tarefas T023–T041 permanecem pendentes; a feature completa ainda não foi aceita. Não houve leitura real do Google nem validação com captura operacional.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1 e US2 estão implementadas; a revisão corrente da US2 e as pendências estão na [validação](specs/001-consulta-local-producao/validacao.md). A interface tem SKIP explícito no CI e fica fora do LCOV (pendência M8); o aceite local exige executá-la. Captura operacional continua pendente.

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

A primeira versão recebe um arquivo de captura preparado pela Central e validado pelo importador local. O selo em todas as telas abre Planilha e mostra **Atualizado hoje, HH:MM**, **Dados de DD/MM**, **Atualização falhou** ou **Sem dados**, usando o fim da captura em São Paulo. Planilha apresenta fonte, fim, cobertura e avisos; **Atualizar dados** relê `GET /api/visao`, sem consultar Google nem renovar o horário. Falha de importação mantém a captura anterior e o selo vermelho até uma nova captura completa aceita; erro HTTP preserva a visão já carregada e permite repetir a consulta. Detalhes/acordeões, quadro de Produção e seis abas/Histórico de Planilha continuam nas próximas tarefas.

A busca direta no Google será a 002, mediante emenda explícita da constituição, somente leitura por conta de serviço com chave fora do repositório. A 003 tratará o objetivo mensal e a meta de uma imagem, um carrossel e um vídeo semanais, preservando as peças históricas existentes. Até lá, o objetivo do mês mostra **Ainda não definido**.

## Executar a primeira entrega local

Na raiz do repositório, selecione o Node 24.19.0 existente por `CRM_NODE_PATH` e siga o [quickstart](specs/001-consulta-local-producao/quickstart.md). Os entrypoints reais são:

```powershell
& $env:CRM_NODE_PATH scripts/importar-captura.cjs $crmCapturePath --data-dir $crmDataDir
& $env:CRM_NODE_PATH src/servidor.cjs --data-dir $crmDataDir --port 4318
```

`$crmCapturePath` identifica um JSON local já coletado e `$crmDataDir`, um diretório privado ou TEMP de demonstração. Sem captura, o servidor apresenta ausência real; não carrega uma demonstração automaticamente. Abrir `http://127.0.0.1:4318`; `localhost` não é o Host aceito. O iniciador PowerShell de duplo clique ainda não existe.

Testes locais: `node --test`, com Node 24.19.0 selecionado também à frente do PATH e Playwright existente resolvido por `CRM_PLAYWRIGHT_MODULE`; gate: `node tools/quality-gate.mjs`. Nenhuma instalação nova é necessária. No CI, os testes de interface registram SKIP explícito; o aceite local exige executá-los; a aplicabilidade dos pulos e a UI fora do LCOV são a pendência M8 da revisão.

**Próximo passo:** T023–T026, detalhes e acordeões do dia inteiro. Integração operacional e demonstração completa permanecem pendentes. Esta consulta não instala agentes, muda agendas, gera mídia ou escreve na operação.
