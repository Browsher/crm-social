# CRM Social

CRM de conteúdo para uso somente neste computador. NTV é a primeira marca. O desenho aprovado é a base visual; Sheets e Drive continuam sendo as fontes operacionais.

**Estado em 03/10/2026:** estrutura oficial GitHub Spec Kit 1.0.13 inicializada, constituição escrita e primeira feature especificada e planejada, com as telas decididas pelo autor. O aplicativo funcional ainda não foi implementado. Esta revisão documental não altera agentes editoriais, agendamentos ou workflows da operação.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge. O review **0.4.4** foi validado no [PR #2](https://github.com/Browsher/crm-social/pull/2#issuecomment-5974734150), commit `6f88479`, [execução 37162882452](https://github.com/Browsher/crm-social/actions/runs/37162882452). A **0.4.5** foi aceita no [PR #3](https://github.com/Browsher/crm-social/pull/3#issuecomment-5975683038), commit `afd8238` (merge `72efb98`), [execução 37170294491](https://github.com/Browsher/crm-social/actions/runs/37170294491). A **0.4.7 aguarda o aceite deste PR**.

Os cenários de retenção por possível segredo e de falha foram testados somente localmente; isso não comprova esses caminhos no Actions. Existe limite de arquivos por PR na lista retornada pelo gh: se `files` vier menor que `changedFiles`, o review recusa a lista incompleta; o teto numérico ainda não foi documentado. O gate fica vermelho até a 001 trazer testes reais; a geração de testes pelo rótulo `gerar-testes` ainda não foi exercitada.

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
- [Recibo da preparação](docs/PREPARACAO-2026-10-02.md)

## Como vamos construir

Spec Kit mantém requisitos, plano e tarefas de cada feature. Superpowers apoia a implementação em partes, testes e revisão. A 001 entregará Planejamento com cartões, lista semanal e gaveta do dia, Produção em quadro por etapa e Planilha com abas e histórico de capturas. O menu terá somente esses três itens. Depois vêm 002 Planilhas (leitura direta pelo servidor local), 003 planejamento mensal, 004 pedidos de ajuste, 005 biblioteca/prévias e 006 Equipe/Workflow.

A primeira versão lê uma captura oficial preparada pela Central. O botão **Atualizar dados** relê a última captura salva e o selo indica hoje, outro dia, falha ou ausência de dados. A busca direta no Google será a 002, mediante emenda explícita da constituição, somente leitura por conta de serviço com chave fora do repositório. A 003 tratará o objetivo mensal e a meta de uma imagem, um carrossel e um vídeo semanais, preservando as peças históricas existentes. Até lá, o objetivo do mês mostra **Ainda não definido**.

**Próxima entrega:** implementar e demonstrar a feature 001. Ainda não há comando para iniciar um CRM operacional. O [roteiro de verificação](specs/001-consulta-local-producao/quickstart.md) distingue comandos documentais já disponíveis de comandos futuros da aplicação.
