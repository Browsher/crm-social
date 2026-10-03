# Roadmap — CRM Social local

Data: 03/10/2026. **Estado: estrutura do Spec Kit inicializada; features ainda não implementadas.** A integração Codex/PowerShell e a [constituição 1.0.0](.specify/memory/constitution.md) estão presentes. Isso não instala perfis editoriais nem comprova integração com a operação.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge; geração de testes pelo rótulo `gerar-testes`. O review foi validado no [PR #2](https://github.com/Browsher/crm-social/pull/2#issuecomment-5974707424); o gate permanece vermelho por ausência de testes da aplicação.

O desenho aprovado orienta um CRM acessível somente neste computador, começando pela NTV. A planilha continua sendo a fonte de fila, versões e decisões; o Drive mantém documentos e mídias. As [decisões das telas](docs/design/telas.md), o [mockup v2](docs/design/mockups/telas-v2.html) e o [desenho histórico](docs/design/desenho.md) descrevem a intenção, sem representar funcionalidades entregues.

As seis features abaixo serão construídas em sequência. Somente a 001 recebe especificação detalhada agora; 002–006 são recortes de backlog, sujeitos ao detalhamento quando chegar sua vez. Os critérios abaixo são condições de aceite futuro, não resultados já verificados. Em 03/10 a nova 002 Planilhas deslocou as antigas 002–005 para 003–006.

## 001 — Consulta local da produção

**Resultado visível:** menu com Planejamento, Produção e Planilha. Planejamento mostra calendário com cartões, lista semanal, objetivo **Ainda não definido** e **N sem data**. Clicar no cartão ou no dia abre a gaveta do dia inteiro, com acordeões por peça. Produção organiza as peças em quadro por etapa, com **Outras** preservando valores desconhecidos. Planilha apresenta as seis abas capturadas e Histórico. O selo de status tem quatro estados; no celular, Planejamento usa lista e a gaveta ocupa a tela.

**Dependências:** definir o contrato da captura e conferir os registros disponíveis. Preservar IDs internos, versões e relações entre semana, produção e arquivos. Não há acesso contínuo à fonte nesta feature.

**Aceite:** os conteúdos da captura aparecem sem duplicação, inclusive semanas que cruzam meses e a imagem B histórica. Calendário, lista, quadro e gaveta concordam entre si; o dia inteiro não é reduzido pelo filtro de formato. **Publicada** exige registro explícito de publicação; **com quem está** mantém `responsavel_atual`, separado de `responsavel_correcao` da revisão vigente. Sem inferir encaminhamentos. Captura antiga, parcial, inválida ou indisponível fica identificada e falha mantém a anterior. **Atualizar dados** apenas relê a captura local. Teclado, Esc e 390 px funcionam sem corte da página; tabelas têm rolagem própria. Nenhuma consulta edita, gera, ativa ou publica.

Registro detalhado: `specs/001-consulta-local-producao/spec.md`.

## 002 — Planilhas

**Resultado visível:** **Atualizar dados** busca diretamente no Google pelo servidor local, somente leitura. Conta de serviço com chave configurada fora do repositório e nunca enviada ao navegador. Não herdar autenticação deste chat.

**Dependências:** concluir a 001 e aprovar uma emenda explícita da constituição antes de implementar a leitura direta. Definir contrato de acesso mínimo, erros, cobertura e integridade; ampliar a captura para **Agentes, Controle e Execucoes**, além das seis abas da 001. A identidade real de Agentes é `Coluna 1`. Não renomear cabeçalhos remotos nem colocar chave/captura em fixtures.

**Aceite:** leitura sem escritas em Google/Drive, credenciais fora da interface e do Git, falha preservando a última captura válida e sua data. As três abas novas mantêm fonte/horário e servem à 006; cadastro ou flag não prova agenda ativa ou integração. A 002 não cria fonte de objetivo mensal: **Ainda não definido** permanece até o contrato da 003. Esta rodada registra a emenda como futura e conserva a constituição vigente.

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

**Próximo passo:** executar o [plano da feature 001](specs/001-consulta-local-producao/plan.md) e suas [tarefas](specs/001-consulta-local-producao/tasks.md), com teste antes do código em cada camada. A especificação e o plano estão preparados; implementação não iniciada. Não avançar para a feature seguinte sem demonstrar a anterior, conferir seus critérios de aceite e registrar pendências reais.
