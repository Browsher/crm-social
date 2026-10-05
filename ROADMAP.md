# Roadmap — CRM Social local

Como um álbum que ganha páginas em entregas pequenas, o CRM tem a 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas; resultados e limitações na [validação](specs/001-consulta-local-producao/validacao.md). 002–006 continuam planejadas; a [constituição](.specify/memory/constitution.md) permanece vigente. A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.

CI ativo: quality-gate obrigatório, review por comentário e geração opcional pelo rótulo `gerar-testes`; estado e evidências na [validação](specs/001-consulta-local-producao/validacao.md).

O review usa 60 turnos e timeout de 20 minutos; geração de testes mantém 20 turnos. Custo/tempo e teto numérico de arquivos permanecem dívidas. Retenção por possível segredo, aviso de falha e `gerar-testes` não têm prova remota; se `files` vier menor que `changedFiles`, a lista incompleta é recusada.

US1–US5, iniciador e escala sintética estão verificados localmente; revisão e limites na [validação](specs/001-consulta-local-producao/validacao.md). A UI fora do LCOV e os pulos explícitos UI/PowerShell no Linux permanecem na pendência M8; CLI segue coberta. Demonstração privada e onboarding final concluídos, com limites registrados.

O desenho aprovado orienta um CRM acessível somente neste computador, começando pela NTV. A planilha continua sendo a fonte de fila, versões e decisões; o Drive mantém documentos e mídias. As [decisões das telas](docs/design/telas.md), o [mockup v2](docs/design/mockups/telas-v2.html) e o [desenho histórico](docs/design/desenho.md) descrevem a intenção, sem representar funcionalidades entregues.

As seis features abaixo serão construídas em sequência. Somente a 001 recebe especificação detalhada agora; 002–006 são recortes de backlog, sujeitos ao detalhamento quando chegar sua vez. Os critérios abaixo são condições de aceite futuro, não resultados já verificados. Em 03/10 a nova 002 Planilhas deslocou as antigas 002–005 para 003–006.

## 001 — Consulta local da produção

**Implementado localmente neste recorte, em 04/10:** captura validada/importada localmente, persistência com ponteiro confirmado e arquivos imutáveis, mapa de etapas validado, API em loopback, US1 Planejamento, US2/frescor, US3/gaveta compacta do dia, US4/quadro por semana e US5/seis tabelas/Histórico. Calendário/lista/filtros, imagem B, “N sem data” e objetivo indefinido estão no aplicativo. A gaveta conserva todas as peças, leva aos avisos detalhados da peça na Planilha, reúne documentos semanais uma vez e recolhe texto/versões/Histórico; a API conserva os detalhes seguros e suprime URLs com credenciais. Planilha mostra os 66 mínimos triados em cópias independentes, contagens NTV, avisos Aba/Linha/Campo/Motivo e todas as tentativas confirmadas, recentes primeiro. As abas têm teclado/foco e rolagem própria; filtro de avisos não recorta as seis tabelas. Células dedicadas de URL recusadas mostram link não permitido; textos livres legítimos permanecem. Selo de quatro estados usa `completedAt` em São Paulo e abre Planilha, com fonte, fim, cobertura, avisos e **Atualizar dados** por GET local. Falha conserva dados/horário; GET/no-op não encerram a falha ativa. [Screenshots reais](docs/design/screenshots/LEIA-ME.md) usam somente fixture sintética.

**Implementação final local:** o [iniciador](docs/modules/iniciador.md) usa Node existente, processo oculto e logs privados. Leitura valida os recibos confirmados; projeção recusa identidade/vínculo alterado pela triagem e mantém mídia vigente a confirmar quando falta versão válida. Revisão e cenário sintético de escala têm evidência na [validação](specs/001-consulta-local-producao/validacao.md).

**Entregue na 001:** T039 demonstrada com captura real, T040 aprovado localmente e no Linux e T041 sincronizado. Vínculos/vigência da captura demonstrada ficam a confirmar por tipagem; limites e aceite remoto estão na [validação](specs/001-consulta-local-producao/validacao.md). Leitura direta Google permanece planejada na 002.

**Resultado visível:** menu com Planejamento, Produção e Planilha. Planejamento mostra calendário com cartões, lista semanal, objetivo **Ainda não definido** e **N sem data**. Clicar no cartão ou no dia abre a gaveta do dia inteiro, com acordeões por peça. Produção organiza as peças em quadro por etapa, com **Outras** preservando valores desconhecidos. Planilha apresenta as seis abas capturadas e Histórico. O selo de status tem quatro estados; no celular, Planejamento usa lista e a gaveta ocupa a tela.

**Dependências:** definir o contrato da captura e conferir os registros disponíveis. Preservar IDs internos, versões e relações entre semana, produção e arquivos. Não há acesso contínuo à fonte nesta feature.

**Aceite:** os conteúdos da captura aparecem sem duplicação, inclusive semanas que cruzam meses e a imagem B histórica. Calendário, lista, quadro e gaveta concordam entre si; o dia inteiro não é reduzido pelo filtro de formato. **Publicada** exige registro explícito de publicação; **com quem está** mantém `responsavel_atual`, separado de `responsavel_correcao` da revisão vigente. Sem inferir encaminhamentos. Captura antiga, parcial, inválida ou indisponível fica identificada e falha mantém a anterior. **Atualizar dados** apenas relê a captura local. Teclado, Esc e 390 px funcionam sem corte da página; tabelas têm rolagem própria. Nenhuma consulta edita, gera, ativa ou publica.

Registro detalhado: `specs/001-consulta-local-producao/spec.md`.

## 002 — Planilhas

**Resultado visível:** **Atualizar dados** busca diretamente no Google pelo servidor local, somente leitura. Conta de serviço própria, com chave fora do repositório e nunca enviada ao navegador.

**Dependências:** concluir a 001 e aprovar uma emenda explícita da constituição antes de implementar a leitura direta. Definir contrato de acesso mínimo, erros, cobertura e integridade; ampliar a captura para **Agentes, Controle e Execucoes**, além das seis abas da 001. A identidade real de Agentes é `Coluna 1`. Não renomear cabeçalhos remotos nem colocar chave/captura em fixtures.

**Aceite:** leitura sem escritas em Google/Drive, credenciais fora da interface e do Git, falha preservando a última captura válida e sua data. As três abas novas mantêm fonte/horário e servem à 006; cadastro ou flag não prova agenda ativa ou integração. A 002 não cria fonte de objetivo mensal: **Ainda não definido** permanece até o contrato da 003. Esta rodada registra a emenda como futura e conserva a constituição vigente.

**Decisão pendente da demonstração:** autor e Central precisam decidir a tipagem da próxima coleta e, se necessária, uma mudança explícita do contrato. O acompanhamento e o efeito sobre vínculos/vigência estão na [validação](specs/001-consulta-local-producao/validacao.md). Não converter a captura existente nem relaxar validação silenciosamente.

## 003 — Planejamento mensal e repasse ao Diretor

**Resultado visível:** objetivo do mês, pautas sugeridas e ligação de cada semana ao plano mensal. O Estrategista de Conteúdo Mensal será um perfil delegado pela Central; o Diretor detalha e ajusta o recorte semanal, registrando a justificativa e preservando a origem mensal.

**Dependências:** concluir 001–002, definir identidade por marca/mês/versão e o contrato de repasse mês/semana. Planejar uma migração conjunta de documentos, perfis e consumidores para a meta futura de uma imagem, um carrossel de 4–6 páginas e um Reels de 15–30 segundos por semana. Conferir fontes antes de qualquer mudança remota.

**Aceite:** o plano mensal mantém origem e versão; ajustes semanais não apagam a proposta anterior. Reentrada com as mesmas origens não duplica mês, semana ou entrega. A meta nova vale conforme a migração definida, preservando as duas imagens das semanas históricas, incluindo a imagem B. Hipóteses e datas sugeridas continuam identificadas. Este backlog não instala o perfil, muda prompts ou cria agenda; esses passos exigem escopo e evidência próprios quando a feature for detalhada.

## 004 — Revisões e pedidos de ajuste

**Resultado visível:** o usuário solicita ajustes pelo CRM e acompanha o retorno. Toda solicitação identifica conteúdo, versão de origem e pedido; a Central confere a versão vigente e registra a decisão nos campos autorizados.

**Dependências:** concluir 001–003 e definir o contrato de solicitação, confirmação, conflito e recibo, incluindo tratamento de reenvio.

**Aceite:** uma solicitação permanece pendente até existir confirmação da Central para a versão correta. Versão divergente produz conflito explícito; reenvio não aplica a mesma mudança duas vezes. O recibo permite conferir o resultado na fonte. Rejeição confirmada bloqueia as dependências pertinentes. A interface não se torna um segundo escritor operacional, e aprovação humana não substitui conferência técnica nem habilita geração ou publicação.

## 005 — Materiais e biblioteca visual

**Resultado visível:** prévias reais dos arquivos autorizados, com origem, versão e relação com o conteúdo. Referências visuais e materiais de produção aparecem identificados; no carrossel, cada página mostra o arquivo efetivamente disponível.

**Dependências:** concluir 001–004, conferir os registros de Biblioteca/Arquivos e definir como disponibilizar localmente os materiais permitidos. A tela **Conteúdos** entra aqui, com prévias somente dos arquivos liberados.

**Aceite:** cada prévia corresponde a um arquivo real e à versão informada. Referência não aparece como peça produzida; arquivo ausente ou inacessível não recebe prévia fictícia. Mídia disponível, conferida e aprovada mantém estados distintos. Não há geração automática, exposição de credenciais nem mudança de permissões públicas do Drive.

## 006 — Acompanhamento da operação: Equipe e Workflow

**Resultado visível:** **Equipe** em cartões dos seis agentes, com Central/Coordenação e Diretor criativo como duas funções; Estrategista Mensal como Proposto e Stories em Histórico recolhido. **Workflow** em painel com Controle, vários selos por workflow, gatilho, última execução conhecida, gargalos e histórico recolhido. Responsável registrado, correção e eventual interpretação de dependência continuam separados e rastreáveis à fonte.

**Dependências:** concluir 001–005, aproveitar Agentes/Controle/Execucoes capturadas na 002 e definir os vínculos entre execução, conteúdo e versão. A **Fila de produção precisa gravar o próprio resumo em Execucoes** para explicar consultas sem avanço; essa escrita ainda não existe e exige mudança no n8n com autorização própria. Comparar cadastro com configuração real de agendas quando houver acesso autorizado; sem essa fonte, indicar **a confirmar**.

**Aceite:** cada estado pode ser conferido na origem; configuração de agenda não aparece como execução comprovada. Divergências de cadastro/configuração mostram as duas fontes e horários. **Publicado · geração bloqueada · integração pendente** podem coexistir; planejado, implementado, testado e integrado são dimensões distintas. Prompts, configurações, IDs de serviço, logs brutos e caminhos privados não vão para os cartões. Dados antigos, falhas e pendências continuam explícitos. Abrir ou atualizar não dispara geração, cobrança ou publicação. Não há métricas comerciais inventadas.

## Como vamos construir

Cada feature terá um registro canônico em `specs/<id>-<nome>/`: `spec.md` descreve valor, escopo e aceite; `plan.md` registra solução, dependências e verificações; `tasks.md` organiza a execução rastreável à mesma especificação. O Spec Kit organiza esses documentos. O Superpowers apoia decisões, plano, implementação, testes proporcionais, revisão independente e verificação, sem criar contratos concorrentes.

A cada entrega, registraremos separadamente o que está planejado, implementado, testado e integrado, com evidência e limitações. Multimarcas, servidor remoto e publicação automática ficam fora deste ciclo. A preparação documental não altera a produção existente.

**Próximo passo:** especificar 002 — Planilhas e aprovar a emenda da constituição para leitura direta pelo servidor local. A 001 foi demonstrada com captura real; [validação](specs/001-consulta-local-producao/validacao.md) concentra resultados, limites e aceite remoto. Nenhuma integração da 002 foi implementada.
