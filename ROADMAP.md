# Roadmap — CRM Social local

**Estado atual informado pelo autor em 08/10/2026:** 001–004 concluídas na main. **Pronta para publicar** integrada pelo [PR #21](https://github.com/Browsher/crm-social/pull/21), base `5b29693`. A correção pequena de **versões de páginas e cenas** está implementada e testada localmente, com integração condicionada ao gate/review do head final. As seções das entregas preservam o estado e as provas históricas de suas rodadas; 005/006 continuam no backlog e a 005 só começa após integrar esta correção.

Como um álbum que ganha páginas em entregas pequenas, o CRM tem a 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). 001 entregue; 002 concluída com T021 demonstrada; resultados históricos da 001 na [validação](specs/001-consulta-local-producao/validacao.md). 003 concluída, 15/15 tarefas, com código integrado pelo PR #15; 004 implementada/testada localmente, no [PR #20](https://github.com/Browsher/crm-social/pull/20), com integração condicionada ao gate/review do head vigente; 005–006 continuam planejadas; Equipe/Workflow somente v2 ilustrativo; a [constituição](.specify/memory/constitution.md) permanece vigente. A captura histórica da 001 conserva seu limite de tipagem; a T021 da 002 resolveu a tipagem da coleta direta, mantendo avisos de vínculos/versões distintas e mídia ausente. Evidências sanitizadas na [validação da 002](specs/002-consulta-planilhas/validacao.md).

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e escala sintética estão verificados localmente; revisão e limites na [validação](specs/001-consulta-local-producao/validacao.md). A UI fora do LCOV e os pulos explícitos UI/PowerShell no Linux permanecem na pendência M8; CLI segue coberta. Demonstração privada e onboarding final concluídos, com limites registrados.

O desenho aprovado orienta um CRM acessível somente neste computador, começando pela NTV. A planilha continua sendo a fonte de fila, versões e decisões; o Drive mantém documentos e mídias. As [decisões das telas](docs/design/telas.md), o [mockup v2](docs/design/mockups/telas-v2.html) e o [desenho histórico](docs/design/desenho.md) descrevem a intenção, sem representar funcionalidades entregues.

As seis features do v1 serão construídas em sequência. A 001 foi entregue; a [002](specs/002-consulta-planilhas/spec.md) está implementada/testada localmente, com T021 demonstrada, 24/24 tarefas; 003 concluída, 15/15 tarefas, com código integrado pelo PR #15, com T002/T015 conferidas usando uma linha fictícia marcada como teste. A 004 está implementada/testada localmente, no [PR #20](https://github.com/Browsher/crm-social/pull/20), com integração condicionada ao gate/review do head vigente; revisões e biblioteca são backlog 005/006. Equipe/Workflow saíram do v1 para v2 ilustrativo. Critérios futuros não são resultados verificados. Em 03/10 a nova 002 Planilhas deslocou as antigas 002–005 para 003–006; em 07/10, Pautas assumiu a 004 e deslocou revisões/biblioteca para 005/006.

## 001 — Consulta local da produção

**Implementado localmente neste recorte, em 04/10:** captura validada/importada localmente, persistência com ponteiro confirmado e arquivos imutáveis, mapa de etapas validado, API em loopback, US1 Planejamento, US2/frescor, US3/gaveta compacta do dia, US4/quadro por semana e US5/seis tabelas/Histórico. Calendário/lista/filtros, imagem B, “N sem data” e objetivo indefinido estão no aplicativo. A gaveta conserva todas as peças, leva aos avisos detalhados da peça na Planilha, reúne documentos semanais uma vez e recolhe texto/versões/Histórico; a API conserva os detalhes seguros e suprime URLs com credenciais. Planilha mostra os 66 mínimos triados em cópias independentes, contagens NTV, avisos Aba/Linha/Campo/Motivo e todas as tentativas confirmadas, recentes primeiro. As abas têm teclado/foco e rolagem própria; filtro de avisos não recorta as seis tabelas. Células dedicadas de URL recusadas mostram link não permitido; textos livres legítimos permanecem. Selo de quatro estados usa `completedAt` em São Paulo e abre Planilha, com fonte, fim, cobertura, avisos e **Atualizar dados** por GET local. Falha conserva dados/horário; GET/no-op não encerram a falha ativa. [Screenshots reais](docs/design/screenshots/LEIA-ME.md) usam somente fixture sintética.

**Implementação final local:** o [iniciador](docs/modules/iniciador.md) usa Node existente, processo oculto e logs privados. Leitura valida os recibos confirmados; projeção recusa identidade/vínculo alterado pela triagem e mantém mídia vigente a confirmar quando falta versão válida. Revisão e cenário sintético de escala têm evidência na [validação](specs/001-consulta-local-producao/validacao.md).

**Entregue na 001:** demonstração e limites na [validação](specs/001-consulta-local-producao/validacao.md). A leitura tipada da 002 está implementada/testada com fonte falsa; seu aceite real T021 foi conferido, com regra numérica restrita e registro sanitizado na validação da 002.

**Resultado visível:** menu com Planejamento, Produção e Planilha. Planejamento mostra calendário com cartões, lista semanal, objetivo **Ainda não definido** e **N sem data**. Clicar no cartão ou no dia abre a gaveta do dia inteiro, com acordeões por peça. Produção organiza as peças em quadro por etapa, com **Outras** preservando valores desconhecidos. Planilha apresenta as seis abas capturadas e Histórico. O selo de status tem quatro estados; no celular, Planejamento usa lista e a gaveta ocupa a tela.

**Dependências:** definir o contrato da captura e conferir os registros disponíveis. Preservar IDs internos, versões e relações entre semana, produção e arquivos. Não há acesso contínuo à fonte nesta feature.

**Aceite:** os conteúdos da captura aparecem sem duplicação, inclusive semanas que cruzam meses e a imagem B histórica. Calendário, lista, quadro e gaveta concordam entre si; o dia inteiro não é reduzido pelo filtro de formato. **Publicada** exige registro explícito de publicação; **com quem está** mantém `responsavel_atual`, separado de `responsavel_correcao` da revisão vigente. Sem inferir encaminhamentos. Captura antiga, parcial, inválida ou indisponível fica identificada e falha mantém a anterior. **Atualizar dados** apenas relê a captura local. Teclado, Esc e 390 px funcionam sem corte da página; tabelas têm rolagem própria. Nenhuma consulta edita, gera, ativa ou publica.

Registro detalhado: `specs/001-consulta-local-producao/spec.md`.

## 002 — Planilhas

**Resultado visível:** **Atualizar dados** busca diretamente no Google pelo servidor local, somente leitura. Conta de serviço própria, com chave fora do repositório e nunca enviada ao navegador.

**Dependências:** 001 concluída, emenda 1.1.0 aprovada/aplicada em 05/10. Seis abas existentes, chave externa, JWT nativo sem dependência de aplicação, batchGet duas vezes e mesmo importador. Conta preparada pelo autor; testes continuam falsos/sintéticos. Sem abas auxiliares nesta feature.

**Aceite:** seis abas tipadas/íntegras, sem escrita Google/Drive, chave fora de Git/browser/log, quatro falhas preservando vigente/data e Central por arquivo. Na 003, objetivo **Ainda não definido** quando falta a linha/objetivo de Meses. T021 demonstrada; estado na [validação da 002](specs/002-consulta-planilhas/validacao.md).

**002 reduzida:** [24 tarefas](specs/002-consulta-planilhas/tasks.md), tipos nativos, datas declaradas e mesmo v1 sem perfil novo; [emenda aplicada](specs/002-consulta-planilhas/constitution-proposal.md). Não converter captura histórica. Estado somente na [validação](specs/002-consulta-planilhas/validacao.md).

## 003 — Consulta do planejamento mensal

**Estado:** 003 concluída, 15/15 tarefas; código integrado pelo [PR #15](https://github.com/Browsher/crm-social/pull/15). T002 (aba criada pelo autor) e T015 (demonstração pelo CRM) conferidas com uma linha fictícia marcada como teste; [validação sanitizada](specs/003-planejamento-mensal/validacao.md). As provas de fixtures/gates anteriores permanecem históricas. Essa era a orientação ao concluir a 003; a 004 foi autorizada em 07/10 e está descrita abaixo.

**Resultado visível:** objetivo e pautas do mês exibido, lidos da aba opcional **Meses** (`mes`, `marca_id`, `objetivo`, `pautas`). Card com objetivo definido na cor principal, até cinco pautas e **+N pautas** ou **+1 pauta** restantes; sem aba/linha, **Ainda não definido** apagado; duplicata por marca/mês, **A confirmar** apagado com aviso na Planilha. Meses aparece na Planilha como as outras tabelas, quando capturada.

**Dependências:** T021 atendida pelo PR #16; código da 003 integrado pelo PR #15. T002/criação da aba pelo autor e T015/demonstração pelo CRM concluídas com uma linha fictícia marcada como teste. Atualizar dados lê Meses se existir, preservando as seis obrigatórias e as capturas da Central. Fechamento documental autorizado com gate/review vigentes.

**Aceite:** consulta somente leitura; Meses opcional sem migração histórica; integridade, falhas, frescor, privacidade e histórico da 002 preservados. Pouco texto, quatro mínimos, sem campos extras, repasse, vínculo mensal com semana ou migração da meta semanal pelo CRM.

**Operação (fora do CRM):** o preenchimento de Meses pode ser assumido pelo Estrategista ou pela Central no futuro, sem mudar o CRM. Fluxo dos agentes, repasse ao Diretor e migração da meta semanal são operação externa, com escopo/autorização/evidência próprios.

## 004 — Pautas no Planejamento

**Estado:** implementada e testada localmente em 07/10/2026; [spec](specs/004-pautas-planejamento/spec.md), [plano](specs/004-pautas-planejamento/plan.md) e [15 tarefas](specs/004-pautas-planejamento/tasks.md). [PR #20](https://github.com/Browsher/crm-social/pull/20) acompanha entrega e integração, com merge condicionado ao gate/review do head vigente. Resultados de gate/review por head na [validação da 004](specs/004-pautas-planejamento/validacao.md). Esta prioridade desloca revisões e biblioteca para 005/006; registros históricos das entregas anteriores conservam sua numeração de época.

**Resultado implementado:** card conserva o objetivo de Meses e mostra pautas válidas do mês, uma linha por semana com tema/modelo/status e selo do autor; cada linha leva à segunda-feira com foco, mesmo sem peças. Calendário/lista e gaveta identificam a pauta confirmada da semana. Planilha apresenta Pautas opcional com todas as linhas NTV triadas e Semanas.pauta_id somente quando capturado. Pautas independe de Meses; mês sem pautas válidas mantém o card completo da 003.

**Verificação local:** 56 testes de backend, 18 de interface e quatro do gerador; gate Windows Node 24.19.0 com **449 PASS**, cobertura **93,8748%**, complexidade PASS/20 avisos, exit 0 e baseline preservada. Drop 0 é o valor do modo full, sem comparação histórica; Semgrep SKIP por ausência e audit N/A. [Relatório dos ajustes](docs/reports/004-ajustes-local-gate.json), [20 imagens sintéticas](docs/design/screenshots/LEIA-ME.md#004--pautas-no-planejamento) e [validação/limites](specs/004-pautas-planejamento/validacao.md). Prova local não substitui CI/review do novo head nem demonstra uso editorial real.

**Fronteiras:** consulta somente leitura, sem novos fluxos editoriais. Ausência da aba/coluna preserva capturas e comportamento anteriores. Dados incoerentes ou vínculos ambíguos geram avisos, sem associação inventada. Só fixtures sintéticas; um PR com gate/review e screenshots nos dois temas. O autor autorizou merge e exclusão da branch após aprovação do gate/review do head vigente.

## 005 — Revisões e pedidos de ajuste

**Resultado visível:** o usuário solicita ajustes pelo CRM e acompanha o retorno. Toda solicitação identifica conteúdo, versão de origem e pedido; a Central confere a versão vigente e registra a decisão nos campos autorizados.

**Dependências:** concluir 001–004 e definir o contrato de solicitação, confirmação, conflito e recibo, incluindo tratamento de reenvio.

**Aceite:** uma solicitação permanece pendente até existir confirmação da Central para a versão correta. Versão divergente produz conflito explícito; reenvio não aplica a mesma mudança duas vezes. O recibo permite conferir o resultado na fonte. Rejeição confirmada bloqueia as dependências pertinentes. A interface não se torna um segundo escritor operacional, e aprovação humana não substitui conferência técnica nem habilita geração ou publicação.

## 006 — Materiais e biblioteca visual

**Resultado visível:** prévias reais dos arquivos autorizados, com origem, versão e relação com o conteúdo. Referências visuais e materiais de produção aparecem identificados; no carrossel, cada página mostra o arquivo efetivamente disponível.

**Dependências:** concluir 001–005, conferir os registros de Biblioteca/Arquivos e definir como disponibilizar localmente os materiais permitidos. A tela **Conteúdos** entra aqui, com prévias somente dos arquivos liberados.

**Aceite:** cada prévia corresponde a um arquivo real e à versão informada. Referência não aparece como peça produzida; arquivo ausente ou inacessível não recebe prévia fictícia. Mídia disponível, conferida e aprovada mantém estados distintos. Não há geração automática, exposição de credenciais nem mudança de permissões públicas do Drive.

## v2 (visual ilustrativo) — Equipe e Workflow (antiga 006)

**Resultado visível:** **Equipe** em cartões dos seis agentes, com Central/Coordenação e Diretor criativo como duas funções; Estrategista Mensal como Proposto e Stories em Histórico recolhido. **Workflow** em painel com Controle, vários selos por workflow, gatilho, última execução conhecida, gargalos e histórico recolhido. Responsável registrado, correção e eventual interpretação de dependência continuam separados e rastreáveis à fonte.

**Fora do v1, decisão 05/10:** Equipe/Workflow são somente visual ilustrativo para v2, fora do menu planejado do v1. Agentes/Controle/Execucoes e mudança da Fila no n8n para gravar resumo ficam nesse backlog, com especificação/autorização próprias. A 002 captura somente seis abas. Mockup não prova implantação/agenda/integração.

**Aceite:** cada estado pode ser conferido na origem; configuração de agenda não aparece como execução comprovada. Divergências de cadastro/configuração mostram as duas fontes e horários. **Publicado · geração bloqueada · integração pendente** podem coexistir; planejado, implementado, testado e integrado são dimensões distintas. Prompts, configurações, IDs de serviço, logs brutos e caminhos privados não vão para os cartões. Dados antigos, falhas e pendências continuam explícitos. Abrir ou atualizar não dispara geração, cobrança ou publicação. Não há métricas comerciais inventadas.

## Manutenção de interface — tema claro e escuro

Ajuste pequeno solicitado pelo autor, sem Spec Kit e sem alterar as features 001–005. Em 06/10/2026, tema aplicado antes do CSS, botão acessível e preferência visual local implementados/testados nas telas existentes; gate Windows histórico com 350 PASS. Em 07/10, botão ajustado para indicar a ação (claro → Escuro; escuro → Claro), com aria-label correspondente e sem aria-pressed; 27 testes de tema PASS sem pulos e 16 screenshots sintéticos regenerados em 1440/390 nos dois temas. Gate final da árvore local com 356 PASS, incluindo três testes preexistentes do iniciador fora do PR, cobertura 96,3498% (antes 98,3871%, com escopo agora ampliado pelo gerador no LCOV) e baseline preservada. Três novos testes do gerador passaram localmente; no CI, dois VM executam e o CLI com navegador mantém SKIP. Integrado pelo [PR #18](https://github.com/Browsher/crm-social/pull/18); medições anteriores permanecem históricas. [Uso e limites](README.md#tema-claro-e-escuro--ajuste-de-interface), [interface](docs/modules/web.md#tema-claro-e-escuro) e [galeria](docs/design/screenshots/LEIA-ME.md#tema-claro-e-escuro).

## Manutenção do iniciador — reabrir o CRM

Ajuste pequeno solicitado pelo autor, sem nova feature ou Spec Kit. A entrada por duplo clique de 06/10/2026 foi ampliada em 07/10: [Abrir CRM.cmd](Abrir%20CRM.cmd) confere primeiro a porta 4318 e, quando ocupada, reconhece HTTP 200 com objeto JSON e `schemaVersion` numérico 1 por GET local com timeout de dois segundos. Reabre a URL fixa sem iniciar outro servidor; outro ocupante ou erro conserva a mensagem fixa e a espera por tecla, sem encerrar o processo. Sucessos fecham a janela sem `pause`. `Iniciar CRM.ps1` continua intacto.

Implementado/testado localmente: RED inicial com 3 PASS/9 FAIL, suíte final com 18 PASS sem pulos em CMD/PowerShell reais, TEMP e portas efêmeras, incluindo servidor real sem captura/com Meses sintética e PowerShell por caminho explícito do Windows. [Gate normal Windows final](docs/reports/019-iniciador-local-gate.json): 371 PASS, cobertura 96,3498%, drop 0, complexidade PASS/17 avisos, baseline preservada e exit 0; Semgrep SKIP/audit N/A. A tentativa estrita local anterior terminou com exit 1 por Semgrep ausente; a integração foi concluída pelo [PR #19](https://github.com/Browsher/crm-social/pull/19). Sem prova de duplo clique manual. [Uso](README.md#executar-a-primeira-entrega-local) e [detalhes/limites](docs/modules/iniciador.md#entrada-por-duplo-clique).

## Manutenção de interface — Pronta para publicar

Ajuste pequeno autorizado em 08/10/2026, sem nova feature/Spec Kit. O mapa versionado reconhece somente `liberado` como liberação para Pronta, conservando a prioridade de publicação preenchida. Cartão Pronta mostra **Pronta para publicar**; a gaveta prioriza pacote ZIP único da versão de pacote registrada, legenda, hashtags e cópia local por clique. Páginas/cenas começam recolhidas nessa coluna; avisos de mídia continuam na API, no contador e na Planilha. Opcionais capturados passam pela mesma triagem e aparecem nas tabelas; os 66 mínimos e capturas antigas permanecem.

Integrado pelo [PR #21](https://github.com/Browsher/crm-social/pull/21). Prova local preservada como histórico: 33 testes focados sem pulos, incluindo 14 UI; gate Windows com 475 PASS, cobertura 94,0568%, complexidade PASS/20 avisos, baseline preservada e exit 0. Drop 0 vem do modo full, sem comparação histórica; Semgrep SKIP por ausência e audit N/A. [Validação e limites](docs/reports/pronta-publicar-validacao.md), [uso](README.md#pronta-para-publicar) e [oito screenshots sintéticos](docs/design/screenshots/LEIA-ME.md#pronta-para-publicar). Somente fixtures/TEMP, sem coleta operacional, download real de ZIP, novo endpoint, dependência ou escrita editorial.

## Manutenção — versões de páginas e cenas

Correção pequena autorizada em 08/10/2026, sem nova feature/Spec Kit. Ponteiros explícitos de página/cena aceitam mídia de outra versão, exigindo produção exata e unidade exata quando preenchida no arquivo. A maior versão inteira positiva por produção/índice inteiro positivo/tipo de unidade é vigente, independentemente da versão da produção; empates permanecem e inválidos não são vigentes. Sem flag de retirada de índice, seu maior registro ainda capturado permanece vigente. A gaveta separa vigência/versão e identifica **imagem vN** nas páginas com versão de mídia inteira positiva; vazia/inválida mostra **imagem: versão a confirmar**. Faltas reais de mídia de unidades válidas independem da versão da produção; o fallback sem unidades vigentes continua exigindo versão válida. Revisões continuam classificadas pela versão da produção, mesmo quando a unidade vigente tem outra versão; pacote e Pronta seguem contratos próprios.

Implementado/testado localmente: rodada inicial com 22 testes novos, 93 PASS de backend/projeção, 107 PASS de interface e gate de 497 PASS, preservada como histórica. Rodada seguinte com 26 PASS na suíte de versões (19 backend/7 UI), sem pulos. Gate Windows vigente, fonte `af403ae`, Node 24.19.0: 501 PASS, cobertura 94,2065%, complexidade PASS/20 avisos, baseline preservada e exit 0. Drop 0 é do modo full, sem comparação histórica; Semgrep SKIP por ausência/audit N/A. [Validação e limites](docs/reports/versoes-unidades-validacao.md), [uso](README.md#versões-de-páginas-e-cenas) e [quatro screenshots sintéticos inalterados](docs/design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas). Integração condicionada ao gate/review do head final; somente TEMP/fixtures, sem leitura real, migração de capturas, dependência, rota ou operação editorial nova. A 005 permanece no backlog até o merge desta manutenção.

## Como vamos construir

Cada feature terá um registro canônico em `specs/<id>-<nome>/`: `spec.md` descreve valor, escopo e aceite; `plan.md` registra solução, dependências e verificações; `tasks.md` organiza a execução rastreável à mesma especificação. O Spec Kit organiza esses documentos. O Superpowers apoia decisões, plano, implementação, testes proporcionais, revisão independente e verificação, sem criar contratos concorrentes.

A cada entrega, registraremos separadamente o que está planejado, implementado, testado e integrado, com evidência e limitações. Multimarcas, servidor remoto e publicação automática ficam fora deste ciclo. A preparação documental não altera a produção existente.

**Integração autorizada:** o autor autorizou merge do [PR #20](https://github.com/Browsher/crm-social/pull/20) e exclusão da branch após gate e review aprovados no head vigente; resultados de gate/review por head, evidências e limites na [validação da 004](specs/004-pautas-planejamento/validacao.md).
