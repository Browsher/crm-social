# Roadmap — CRM Social local

Como um álbum que ganha páginas em entregas pequenas, o CRM tem a 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). 001 entregue; implementação da 002 em aceite; resultados e limitações na [validação](specs/001-consulta-local-producao/validacao.md). 002 e 003 implementadas/testadas localmente; 004–005 continuam planejadas; Equipe/Workflow somente v2 ilustrativo; a [constituição](.specify/memory/constitution.md) permanece vigente. A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e escala sintética estão verificados localmente; revisão e limites na [validação](specs/001-consulta-local-producao/validacao.md). A UI fora do LCOV e os pulos explícitos UI/PowerShell no Linux permanecem na pendência M8; CLI segue coberta. Demonstração privada e onboarding final concluídos, com limites registrados.

O desenho aprovado orienta um CRM acessível somente neste computador, começando pela NTV. A planilha continua sendo a fonte de fila, versões e decisões; o Drive mantém documentos e mídias. As [decisões das telas](docs/design/telas.md), o [mockup v2](docs/design/mockups/telas-v2.html) e o [desenho histórico](docs/design/desenho.md) descrevem a intenção, sem representar funcionalidades entregues.

As cinco features do v1 serão construídas em sequência. A 001 foi entregue; a [002](specs/002-consulta-planilhas/spec.md) está implementada/testada localmente, com conta/demonstração reais pendentes; 003 implementada/testada localmente e com demonstração real pendente; 004–005 continuam backlog; Equipe/Workflow saíram do v1 para v2 ilustrativo. Critérios futuros não são resultados verificados. Em 03/10 a nova 002 Planilhas deslocou as antigas 002–005 para 003–006.

## 001 — Consulta local da produção

**Implementado localmente neste recorte, em 04/10:** captura validada/importada localmente, persistência com ponteiro confirmado e arquivos imutáveis, mapa de etapas validado, API em loopback, US1 Planejamento, US2/frescor, US3/gaveta compacta do dia, US4/quadro por semana e US5/seis tabelas/Histórico. Calendário/lista/filtros, imagem B, “N sem data” e objetivo indefinido estão no aplicativo. A gaveta conserva todas as peças, leva aos avisos detalhados da peça na Planilha, reúne documentos semanais uma vez e recolhe texto/versões/Histórico; a API conserva os detalhes seguros e suprime URLs com credenciais. Planilha mostra os 66 mínimos triados em cópias independentes, contagens NTV, avisos Aba/Linha/Campo/Motivo e todas as tentativas confirmadas, recentes primeiro. As abas têm teclado/foco e rolagem própria; filtro de avisos não recorta as seis tabelas. Células dedicadas de URL recusadas mostram link não permitido; textos livres legítimos permanecem. Selo de quatro estados usa `completedAt` em São Paulo e abre Planilha, com fonte, fim, cobertura, avisos e **Atualizar dados** por GET local. Falha conserva dados/horário; GET/no-op não encerram a falha ativa. [Screenshots reais](docs/design/screenshots/LEIA-ME.md) usam somente fixture sintética.

**Implementação final local:** o [iniciador](docs/modules/iniciador.md) usa Node existente, processo oculto e logs privados. Leitura valida os recibos confirmados; projeção recusa identidade/vínculo alterado pela triagem e mantém mídia vigente a confirmar quando falta versão válida. Revisão e cenário sintético de escala têm evidência na [validação](specs/001-consulta-local-producao/validacao.md).

**Entregue na 001:** demonstração e limites na [validação](specs/001-consulta-local-producao/validacao.md). A leitura tipada da 002 está implementada/testada com fonte falsa; seu aceite real aguarda conta e demonstração pelo autor.

**Resultado visível:** menu com Planejamento, Produção e Planilha. Planejamento mostra calendário com cartões, lista semanal, objetivo **Ainda não definido** e **N sem data**. Clicar no cartão ou no dia abre a gaveta do dia inteiro, com acordeões por peça. Produção organiza as peças em quadro por etapa, com **Outras** preservando valores desconhecidos. Planilha apresenta as seis abas capturadas e Histórico. O selo de status tem quatro estados; no celular, Planejamento usa lista e a gaveta ocupa a tela.

**Dependências:** definir o contrato da captura e conferir os registros disponíveis. Preservar IDs internos, versões e relações entre semana, produção e arquivos. Não há acesso contínuo à fonte nesta feature.

**Aceite:** os conteúdos da captura aparecem sem duplicação, inclusive semanas que cruzam meses e a imagem B histórica. Calendário, lista, quadro e gaveta concordam entre si; o dia inteiro não é reduzido pelo filtro de formato. **Publicada** exige registro explícito de publicação; **com quem está** mantém `responsavel_atual`, separado de `responsavel_correcao` da revisão vigente. Sem inferir encaminhamentos. Captura antiga, parcial, inválida ou indisponível fica identificada e falha mantém a anterior. **Atualizar dados** apenas relê a captura local. Teclado, Esc e 390 px funcionam sem corte da página; tabelas têm rolagem própria. Nenhuma consulta edita, gera, ativa ou publica.

Registro detalhado: `specs/001-consulta-local-producao/spec.md`.

## 002 — Planilhas

**Resultado visível:** **Atualizar dados** busca diretamente no Google pelo servidor local, somente leitura. Conta de serviço própria, com chave fora do repositório e nunca enviada ao navegador.

**Dependências:** 001 concluída, emenda 1.1.0 aprovada/aplicada em 05/10. Seis abas existentes, chave externa, JWT nativo sem dependência de aplicação, batchGet duas vezes e mesmo importador. Conta do autor pendente não bloqueia testes falsos. Sem abas auxiliares nesta feature.

**Aceite:** seis abas tipadas/íntegras, sem escrita Google/Drive, chave fora de Git/browser/log, quatro falhas preservando vigente/data e Central por arquivo. Objetivo **Ainda não definido** até 003. Conta/demonstração real pendentes; estado na [validação da 002](specs/002-consulta-planilhas/validacao.md).

**002 reduzida:** [24 tarefas](specs/002-consulta-planilhas/tasks.md), tipos nativos, datas declaradas e mesmo v1 sem perfil novo; [emenda aplicada](specs/002-consulta-planilhas/constitution-proposal.md). Não converter captura histórica. Estado somente na [validação](specs/002-consulta-planilhas/validacao.md).

## 003 — Consulta do planejamento mensal

**Estado em 05/10/2026:** [spec reescopada pelo autor](specs/003-planejamento-mensal/spec.md), [plano](specs/003-planejamento-mensal/plan.md) e [tarefas](specs/003-planejamento-mensal/tasks.md); implementação e testes locais concluídos com fixtures/fakes/TEMP. [Validação](specs/003-planejamento-mensal/validacao.md) e [gate local](docs/reports/003-local-gate.json): Node 24.19.0, 312 PASS sem pulos, cobertura 98,3660%, drop 0, complexidade PASS com 17 avisos, baseline preservada; Semgrep SKIP por ausência no Windows e audit N/A. Gate Linux/reviews serão conferidos no PR. Nenhuma integração real comprovada.

**Resultado visível:** objetivo e pautas do mês exibido, lidos da aba opcional **Meses** (`mes`, `marca_id`, `objetivo`, `pautas`). Card com até cinco pautas e **+N**; sem aba/linha, **Ainda não definido**; duplicata por marca/mês, **A confirmar** com aviso na Planilha. Meses aparece na Planilha como as outras tabelas, quando capturada.

**Dependências:** o autor autorizou implementação, push e PR; T021/aceite da 002 bloqueia somente o merge. T002/criar-preencher Meses à mão e T015/demonstração real da 003 permanecem pendentes, sem bloquear testes sintéticos ou consulta sem a aba. Atualizar dados lê Meses se existir, preservando as seis obrigatórias e as capturas anteriores da Central.

**Aceite:** consulta somente leitura; Meses opcional sem migração histórica; integridade, falhas, frescor, privacidade e histórico da 002 preservados. Pouco texto, quatro mínimos, sem campos extras, repasse, vínculo mensal com semana ou migração da meta semanal pelo CRM.

**Operação (fora do CRM):** o preenchimento de Meses pode ser assumido pelo Estrategista ou pela Central no futuro, sem mudar o CRM. Fluxo dos agentes, repasse ao Diretor e migração da meta semanal são operação externa, com escopo/autorização/evidência próprios.

## 004 — Revisões e pedidos de ajuste

**Resultado visível:** o usuário solicita ajustes pelo CRM e acompanha o retorno. Toda solicitação identifica conteúdo, versão de origem e pedido; a Central confere a versão vigente e registra a decisão nos campos autorizados.

**Dependências:** concluir 001–003 e definir o contrato de solicitação, confirmação, conflito e recibo, incluindo tratamento de reenvio.

**Aceite:** uma solicitação permanece pendente até existir confirmação da Central para a versão correta. Versão divergente produz conflito explícito; reenvio não aplica a mesma mudança duas vezes. O recibo permite conferir o resultado na fonte. Rejeição confirmada bloqueia as dependências pertinentes. A interface não se torna um segundo escritor operacional, e aprovação humana não substitui conferência técnica nem habilita geração ou publicação.

## 005 — Materiais e biblioteca visual

**Resultado visível:** prévias reais dos arquivos autorizados, com origem, versão e relação com o conteúdo. Referências visuais e materiais de produção aparecem identificados; no carrossel, cada página mostra o arquivo efetivamente disponível.

**Dependências:** concluir 001–004, conferir os registros de Biblioteca/Arquivos e definir como disponibilizar localmente os materiais permitidos. A tela **Conteúdos** entra aqui, com prévias somente dos arquivos liberados.

**Aceite:** cada prévia corresponde a um arquivo real e à versão informada. Referência não aparece como peça produzida; arquivo ausente ou inacessível não recebe prévia fictícia. Mídia disponível, conferida e aprovada mantém estados distintos. Não há geração automática, exposição de credenciais nem mudança de permissões públicas do Drive.

## v2 (visual ilustrativo) — Equipe e Workflow (antiga 006)

**Resultado visível:** **Equipe** em cartões dos seis agentes, com Central/Coordenação e Diretor criativo como duas funções; Estrategista Mensal como Proposto e Stories em Histórico recolhido. **Workflow** em painel com Controle, vários selos por workflow, gatilho, última execução conhecida, gargalos e histórico recolhido. Responsável registrado, correção e eventual interpretação de dependência continuam separados e rastreáveis à fonte.

**Fora do v1, decisão 05/10:** Equipe/Workflow são somente visual ilustrativo para v2, fora do menu planejado do v1. Agentes/Controle/Execucoes e mudança da Fila no n8n para gravar resumo ficam nesse backlog, com especificação/autorização próprias. A 002 captura somente seis abas. Mockup não prova implantação/agenda/integração.

**Aceite:** cada estado pode ser conferido na origem; configuração de agenda não aparece como execução comprovada. Divergências de cadastro/configuração mostram as duas fontes e horários. **Publicado · geração bloqueada · integração pendente** podem coexistir; planejado, implementado, testado e integrado são dimensões distintas. Prompts, configurações, IDs de serviço, logs brutos e caminhos privados não vão para os cartões. Dados antigos, falhas e pendências continuam explícitos. Abrir ou atualizar não dispara geração, cobrança ou publicação. Não há métricas comerciais inventadas.

## Como vamos construir

Cada feature terá um registro canônico em `specs/<id>-<nome>/`: `spec.md` descreve valor, escopo e aceite; `plan.md` registra solução, dependências e verificações; `tasks.md` organiza a execução rastreável à mesma especificação. O Spec Kit organiza esses documentos. O Superpowers apoia decisões, plano, implementação, testes proporcionais, revisão independente e verificação, sem criar contratos concorrentes.

A cada entrega, registraremos separadamente o que está planejado, implementado, testado e integrado, com evidência e limitações. Multimarcas, servidor remoto e publicação automática ficam fora deste ciclo. A preparação documental não altera a produção existente.

**Próximo passo:** conferir gate Linux/reviews no PR da 003. Autor prepara conta/demonstração da 002 e Meses/demonstração privada da 003; pendências na [validação da 003](specs/003-planejamento-mensal/validacao.md). T021/aceite da 002 bloqueia somente o merge; nenhuma coleta real nesta rodada.
