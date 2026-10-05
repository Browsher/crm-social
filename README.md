# CRM Social

Como um álbum de fotografias da produção, o CRM apresenta uma captura da operação para localizar as peças da NTV neste computador. Sheets e Drive continuam sendo as fontes operacionais; o desenho aprovado orienta a interface.

001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas; resultados e limitações na [validação](specs/001-consulta-local-producao/validacao.md). A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e cenário sintético de escala estão verificados localmente; resultados na [validação](specs/001-consulta-local-producao/validacao.md). A UI fica fora do LCOV e há SKIP explícito de UI/PowerShell no Linux (pendência M8); isso não substitui a execução Windows local. Demonstração privada e onboarding final concluídos; limites conhecidos permanecem na validação.

## Estado da entrega

- **Planejado:** 002 Planilhas; acesso somente leitura pelo servidor, credencial fora do repositório e emenda da constituição ainda por definir.
- **Implementado:** importação/persistência privadas, API local, Planejamento, Produção, Planilha/Histórico e iniciador.
- **Testado:** cinco camadas locais e comparação com captura real, conforme a [validação](specs/001-consulta-local-producao/validacao.md).
- **Integrado:** captura da Central aceita pelo importador e consultada no CRM local. Runtime sem Google, escrita editorial ou comprovação de mídia/publicação. A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; limites e decisão pendente estão na [validação](specs/001-consulta-local-producao/validacao.md).

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

Spec Kit mantém requisitos, plano e tarefas de cada feature. Superpowers apoia a implementação em partes, testes e revisão. A 001 já apresenta Planejamento com cartões, lista semanal e gaveta do dia, Produção em quadro por etapa e Planilha com abas e histórico de capturas. O menu tem somente esses três itens. Depois vêm 002 Planilhas (leitura direta pelo servidor local), 003 planejamento mensal, 004 pedidos de ajuste, 005 biblioteca/prévias e 006 Equipe/Workflow.

A primeira versão recebe um arquivo de captura preparado pela Central e validado pelo importador local. O selo em todas as telas abre Planilha e mostra **Atualizado hoje, HH:MM**, **Dados de DD/MM**, **Atualização falhou** ou **Sem dados**, usando o fim da captura em São Paulo. Planilha apresenta fonte, fim, cobertura e avisos; **Atualizar dados** relê `GET /api/visao`, sem consultar Google nem renovar o horário. Falha de importação mantém a captura anterior e o selo vermelho até uma nova captura completa aceita; erro HTTP preserva a visão já carregada e permite repetir a consulta.

A [gaveta compacta](docs/design/mockups/gaveta-v2.html) reúne o dia inteiro em acordeões: primeira peça aberta, demais com resumo, faixa de quatro dados preenchidos e páginas/cenas em linhas compactas. Texto registrado, versões anteriores e Histórico começam recolhidos; a revisão vigente fica separada das resolvidas. Documentos Plano/Redação/Visual aparecem uma vez no fim do dia, com **—** quando ausentes. Avisos técnicos permanecem na API; a gaveta mostra quantidade e link para o painel detalhado da Planilha, filtrado pelos avisos da peça. Arquivos são registros; links só HTTPS Drive/Docs por clique, sem ecoar URL dedicada recusada. Nos campos de URL dedicados, usuário/senha ou URL malformada não vazia são suprimidos antes do HTTP, com aviso fixo sem valor; vazio é preservado. Em texto livre, somente o pedaço HTTP(S) credenciado separado por espaços em branco vira marcador, preservando a frase; limites e regra de JSON estão no [contrato](specs/001-consulta-local-producao/contracts/captura-e-consulta.md). Esc fecha e devolve o foco; no celular a gaveta ocupa a tela inteira. Produção mostra quadro por semana/tema, oito colunas e Outras com originais/contador distinto. Cartões têm status informativo, responsável/correção separados e primeira pendência/+N das pendências visíveis; mídia ausente fica oculta nos cartões de Planejamento, Redação e Visual. Clique abre dia inteiro ou Sem data da semana, sem arrastar/editar. Configuração versionada mantém nove etapas e liberação/revisão vazias; mapa completo de demonstração é só sintético em TEMP.

Planilha apresenta seis abas com os 66 mínimos triados, contagens de linhas NTV e Histórico final com todas as tentativas confirmadas, recentes primeiro. Setas esquerda/direita, Home e End alternam as abas com foco; cada tabela tem rolagem própria. A releitura conserva a aba disponível selecionada. O painel de avisos mostra Aba/Linha/Campo/Motivo; menu, selo e **Todos os avisos** restauram a visão geral dos avisos, enquanto as seis tabelas sempre mantêm o conjunto NTV completo. Sem captura, aparece somente Histórico e orientação à Central. Células dedicadas de URL recusadas exibem **link não permitido**; o marcador de supressão e os textos livres legítimos permanecem. Nenhum valor da tabela navega ou carrega mídia automaticamente.

A busca direta no Google será a 002, mediante emenda explícita da constituição, somente leitura por conta de serviço com chave fora do repositório. A 003 tratará o objetivo mensal e a meta de uma imagem, um carrossel e um vídeo semanais, preservando as peças históricas existentes. Até lá, o objetivo do mês mostra **Ainda não definido**.

## Executar a primeira entrega local

Na raiz do repositório, selecione o Node 24.19.0 existente por `CRM_NODE_PATH` e siga o [quickstart](specs/001-consulta-local-producao/quickstart.md). Os entrypoints reais são:

```powershell
& $env:CRM_NODE_PATH scripts/importar-captura.cjs $crmCapturePath --data-dir $crmDataDir
& $env:CRM_NODE_PATH src/servidor.cjs --data-dir $crmDataDir --port 4318
```

`$crmCapturePath` identifica um JSON local já coletado e `$crmDataDir`, um diretório privado ou TEMP de demonstração. Sem captura, o servidor apresenta ausência real; não carrega uma demonstração automaticamente. `localhost` não é o Host aceito. O [iniciador PowerShell](docs/modules/iniciador.md) usa o Node existente e inicia o servidor oculto:

```powershell
$crmNode = $env:CRM_NODE_PATH
$crmSession = & './Iniciar CRM.ps1' -NodePath $crmNode
Start-Process $crmSession.url
```

Se `CRM_NODE_PATH` não estiver definido, o iniciador resolve `node.exe` pelo PATH; confirmar Node 24.19.0 antes de iniciar. O retorno informa `processId`, `url`, `logDir` privado e uma orientação `encerrar`. Antes de encerrar, conferir que o PID ainda pertence à instância criada; parar somente esse processo. Porta ocupada não é encerrada pelo script.

Para a Central executar T039, seguir o [roteiro da captura real](specs/001-consulta-local-producao/quickstart.md#leitura-real-e-demonstração-local): preparar JSON esquema 1, seis abas/66 mínimos, duas leituras completas com metadados e hashes concordantes, salvar privadamente em `data/entrada/<capturaId>.json`, importar com `& $crmNode scripts/importar-captura.cjs $crmCapturePath` e comparar os registros no CRM com essa mesma captura. Esse roteiro foi executado com captura real; novas capturas repetem a validação. Nenhuma fixture comprova coleta oficial.

Testes locais: `node --test`, com Node 24.19.0 selecionado também à frente do PATH e Playwright existente resolvido por `CRM_PLAYWRIGHT_MODULE`; gate: `node tools/quality-gate.mjs`. Nenhuma instalação nova é necessária. No Linux, UI/PowerShell têm pulos explícitos; a UI fora do LCOV e essa fronteira de aplicabilidade são a pendência M8. CLI, dados, persistência, projeção e HTTP permanecem cobertos e obrigatórios.

**Próximo passo:** especificar 002 — Planilhas e aprovar a emenda da constituição antes da leitura direta pelo servidor local. Evidências e limitações na [validação](specs/001-consulta-local-producao/validacao.md). Esta consulta não instala agentes, muda agendas, gera mídia ou escreve na operação.
