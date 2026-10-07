# CRM Social

Como um álbum de fotografias da produção, o CRM apresenta uma captura da operação para localizar as peças da NTV neste computador. Sheets e Drive continuam sendo as fontes operacionais; o desenho aprovado orienta a interface.

001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). 001 entregue; 002 concluída com T021 demonstrada; resultados históricos da 001 na [validação da 001](specs/001-consulta-local-producao/validacao.md), e aceite da 002 na [validação da 002](specs/002-consulta-planilhas/validacao.md). A captura histórica da 001 conserva seu limite de tipagem; a T021 da 002 resolveu a tipagem da coleta direta, mantendo avisos de vínculos/versões distintas e mídia ausente. Evidências sanitizadas na [validação da 002](specs/002-consulta-planilhas/validacao.md).

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e cenário sintético de escala estão verificados localmente; resultados na [validação](specs/001-consulta-local-producao/validacao.md). A UI fica fora do LCOV e há SKIP explícito de UI/PowerShell no Linux (pendência M8); isso não substitui a execução Windows local. Demonstração privada e onboarding final concluídos; limites conhecidos permanecem na validação.

## Estado da entrega

- **Planejado:** 004–005 no [roadmap](ROADMAP.md); Equipe/Workflow somente v2 ilustrativo. Uso real antes de decidir 004/005.
- **Implementado:** 001, leitura direta da 002 e consulta opcional de Meses da 003; JWT/fetch nativos, seis abas obrigatórias tipadas e POST local, com Meses incluída quando existe; importação manual preservada.
- **Testado:** 001 e 002 demonstradas com captura real; 003 verificada com fixtures/fakes/TEMP nas cinco camadas e demonstrada pelo CRM com uma linha fictícia marcada como teste na aba criada pelo autor. A leitura direta já aceita de Meses foi conferida pela API e pela tela. A integração da main passou no gate Windows com 322 testes e cobertura 98,3871%; baseline preservada. [Relatório da integração](docs/reports/003-integracao-t021-local-gate.json). Implementação integrada pelo PR #15; o fechamento documental exige seus próprios checks/review vigentes. Evidências/limites na [validação da 002](specs/002-consulta-planilhas/validacao.md) e na [validação da 003](specs/003-planejamento-mensal/validacao.md).
- **Integrado:** a 002 concluiu T021, 24/24 tarefas, e foi integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16). Coleta direta aceita pelo mesmo importador, com hashes iguais e Histórico preservado. Tipagem válida não afirma vigência de versões distintas nem comprova mídia. Código da 003 integrado pelo PR #15; 003 concluída, 15/15 tarefas, com T002/T015 conferidas. Sem escrita operacional pelo CRM.

## Onde começar

- [Roadmap do v1 e backlog ilustrativo v2](ROADMAP.md)
- [Feature 001: consulta da produção](specs/001-consulta-local-producao/spec.md)
- [Plano de implementação](specs/001-consulta-local-producao/plan.md)
- [Tarefas da primeira feature](specs/001-consulta-local-producao/tasks.md)
- [Feature 002: Planilhas](specs/002-consulta-planilhas/spec.md), [plano](specs/002-consulta-planilhas/plan.md), [24 tarefas](specs/002-consulta-planilhas/tasks.md) e [emenda aplicada](specs/002-consulta-planilhas/constitution-proposal.md)
- [Feature 003: consulta mensal](specs/003-planejamento-mensal/spec.md), [quickstart](specs/003-planejamento-mensal/quickstart.md) e [validação e fechamento](specs/003-planejamento-mensal/validacao.md)
- [Constituição](.specify/memory/constitution.md) e [instruções de desenvolvimento](AGENTS.md)
- [Desenho aprovado](docs/design/desenho.md) e [prévia visual](docs/design/prototype/index.html)
- [Telas decididas e escopo por feature](docs/design/telas.md)
- [Mockup de telas v2](docs/design/mockups/telas-v2.html) e [limites da demonstração](docs/design/mockups/LEIA-ME.md)
- [Índice da documentação](docs/index.md)
- [Arquitetura e fronteiras implementadas](docs/architecture.md)
- [Telas reais com dados fictícios](docs/design/screenshots/LEIA-ME.md)
- [Recibo da preparação](docs/PREPARACAO-2026-10-02.md)

## Como vamos construir

Spec Kit mantém requisitos, plano e tarefas de cada feature. Superpowers apoia a implementação em partes, testes e revisão. A 001 já apresenta Planejamento com cartões, lista semanal e gaveta do dia, Produção em quadro por etapa e Planilha com abas e histórico de capturas. O menu tem somente esses três itens. 001–003 foram entregues. O próximo passo é uso real antes de decidir 004 pedidos de ajuste e 005 biblioteca/prévias. Equipe/Workflow permanece v2 visual ilustrativo.

A primeira versão recebe um arquivo de captura preparado pela Central e validado pelo importador local. O selo em todas as telas abre Planilha e mostra **Atualizado hoje, HH:MM**, **Dados de DD/MM**, **Atualização falhou** ou **Sem dados**, usando o fim da captura em São Paulo. Planilha apresenta fonte, fim, cobertura e avisos; **Atualizar dados** envia POST /api/atualizar, consulta as seis abas obrigatórias e Meses quando existe pelo servidor e só promove uma captura íntegra; depois relê GET /api/visao. GET continua sem rede. Falha de importação mantém a captura anterior e o selo vermelho até uma nova captura completa aceita; erro HTTP preserva a visão já carregada e permite repetir a consulta.

A [gaveta compacta](docs/design/mockups/gaveta-v2.html) reúne o dia inteiro em acordeões: primeira peça aberta, demais com resumo, faixa de quatro dados preenchidos e páginas/cenas em linhas compactas. Texto registrado, versões anteriores e Histórico começam recolhidos; a revisão vigente fica separada das resolvidas. Documentos Plano/Redação/Visual aparecem uma vez no fim do dia, com **—** quando ausentes. Avisos técnicos permanecem na API; a gaveta mostra quantidade e link para o painel detalhado da Planilha, filtrado pelos avisos da peça. Arquivos são registros; links só HTTPS Drive/Docs por clique, sem ecoar URL dedicada recusada. Nos campos de URL dedicados, usuário/senha ou URL malformada não vazia são suprimidos antes do HTTP, com aviso fixo sem valor; vazio é preservado. Em texto livre, somente o pedaço HTTP(S) credenciado separado por espaços em branco vira marcador, preservando a frase; limites e regra de JSON estão no [contrato](specs/001-consulta-local-producao/contracts/captura-e-consulta.md). Esc fecha e devolve o foco; no celular a gaveta ocupa a tela inteira. Produção mostra quadro por semana/tema, oito colunas e Outras com originais/contador distinto. Cartões têm status informativo, responsável/correção separados e primeira pendência/+N das pendências visíveis; mídia ausente fica oculta nos cartões de Planejamento, Redação e Visual. Clique abre dia inteiro ou Sem data da semana, sem arrastar/editar. Configuração versionada mantém nove etapas e liberação/revisão vazias; mapa completo de demonstração é só sintético em TEMP.

Planilha apresenta seis abas com os 66 mínimos triados, Meses opcional com quatro mínimos quando capturada e Histórico final com todas as tentativas confirmadas, recentes primeiro. Setas esquerda/direita, Home e End alternam as abas com foco; cada tabela tem rolagem própria. Meses vem depois de Revisoes e antes de Histórico; a releitura conserva a aba disponível selecionada ou retorna à primeira disponível quando Meses desaparece. O painel de avisos mostra Aba/Linha/Campo/Motivo; menu, selo e **Todos os avisos** restauram a visão geral dos avisos, enquanto as seis tabelas sempre mantêm o conjunto NTV completo. Sem captura, aparece somente Histórico e orientação à Central. Células dedicadas de URL recusadas exibem **link não permitido**; o marcador de supressão e os textos livres legítimos permanecem. Nenhum valor da tabela navega ou carrega mídia automaticamente.

A 002 implementa leitura direta pelo servidor local, com a emenda 1.1.0 aprovada e chave externa; demonstração T021 foi conferida e integrada pelo PR #16. A 003 consulta objetivo/pautas da aba opcional Meses, preenchida à mão pelo autor. O card acompanha o mês exibido, mostra objetivo definido na cor principal e até cinco pautas; o restante usa **+N pautas** ou **+1 pauta**. Ausência/objetivo vazio mostra **Ainda não definido**, duplicata mostra **A confirmar**, ambos apagados, com avisos de mês/tipo/duplicatas por linha física na Planilha. Textos usam `textContent`. As capturas antigas mantêm hash e bytes; Meses participa do hash ordenado por nome só quando presente. Nenhuma escrita ou fluxo de agentes; migração da meta semanal permanece operação externa. A demonstração da leitura pela fonte real usou uma linha fictícia marcada como teste; isso não comprova uso editorial real.

## Tema claro e escuro — ajuste de interface

Implementado e testado localmente em 06/10/2026, com ajuste do botão em 07/10/2026, sem nova feature Spec Kit. Ao lado de **Neste computador**, o botão indica a ação: no tema claro, **☾ Escuro** com `aria-label="Ativar tema escuro"`; no escuro, **☀ Claro** com `aria-label="Ativar tema claro"`. Funciona com mouse, Enter e Espaço, sem `aria-pressed`, pois oferece a troca em vez de anunciar um estado pressionado. Na primeira visita, acompanha a preferência do sistema até uma escolha manual. A escolha válida fica em `localStorage` como `crm-theme`; se o armazenamento estiver bloqueado, a alternância continua funcionando durante a página aberta. O tema é aplicado antes do CSS, evitando carregar a página com a paleta errada.

Todas as cores de `src/web/styles.css` usam variáveis de `:root`, redefinidas em `[data-theme=dark]`. A paleta escura azulada cobre calendário/lista, objetivo mensal, gaveta, Produção, tabelas/abas/avisos/Histórico, selos, erros e estados vazios. Imagem mantém verde, carrossel âmbar e Reels roxo nos dois temas. A preferência altera somente a apresentação neste navegador.

TDD com fixtures sintéticas: **27 testes de tema passaram sem pulos** após o ajuste, incluindo texto/aria-label da ação, ausência de `aria-pressed`, teclado, persistência após recarga, preferência do sistema, armazenamento bloqueado, aplicação antes da resposta CSS, rota GET/HEAD e varredura de cores fixas. Os cenários de contraste verificaram texto visível com razão mínima **4,5:1** nas quatro telas em 1440/390, Meses/Histórico, erro e ausência de captura. Gate Windows histórico de 06/10: **350 PASS**. Em 07/10, o gate final da árvore local teve **353 PASS**, incluindo **3 testes preexistentes do iniciador fora deste PR**; cobertura **98,3871%**, drop **0**, complexidade PASS com **17 avisos**, baseline preservada e exit **0**; Semgrep SKIP no Windows e audit N/A. O CI Linux mantém pulos explícitos de UI/PowerShell; gate Linux e review do novo head são verificações separadas. **Integração pendente, condicionada aos checks e review vigentes do [PR #18](https://github.com/Browsher/crm-social/pull/18).**

[Galeria dos 16 screenshots sintéticos](docs/design/screenshots/LEIA-ME.md#tema-claro-e-escuro) e [comportamento técnico](docs/modules/web.md#tema-claro-e-escuro). Para reproduzir as imagens, com Node e Playwright existentes configurados:

```powershell
& $env:CRM_NODE_PATH scripts/screenshots-tema.cjs
```

O script resolve Playwright por `CRM_PLAYWRIGHT_MODULE` (ou `playwright` já disponível), cria servidor/estado em TEMP e substitui somente os 16 arquivos `tema-*.png` da galeria. Não usa o CRM do autor nem lê a planilha.

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

**Próximo passo:** uso real antes de decidir 004/005; evidências e limites na [validação da 003](specs/003-planejamento-mensal/validacao.md).
