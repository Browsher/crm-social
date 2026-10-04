# Roadmap — CRM Social local

Data: 02/10/2026. **Estado: estrutura do Spec Kit inicializada; features ainda não implementadas.** A integração Codex/PowerShell e a [constituição 1.0.0](.specify/memory/constitution.md) estão presentes. Isso não instala perfis editoriais nem comprova integração com a operação.

CI instalado em 03/10/2026: quality-gate em cada PR; review do Claude por comentário, sem bloquear o merge. O review foi validado no [PR #2](https://github.com/Browsher/crm-social/pull/2#issuecomment-5974734150), commit `6f88479`, [execução 37162882452](https://github.com/Browsher/crm-social/actions/runs/37162882452). O gate permanece vermelho até a 001 trazer testes reais; a geração de testes pelo rótulo `gerar-testes` ainda não foi exercitada.

O desenho aprovado orienta um CRM acessível somente neste computador, começando pela NTV. A planilha continua sendo a fonte de fila, versões e decisões; o Drive mantém documentos e mídias. O [desenho de referência](docs/design/desenho.md) e o protótipo descrevem a intenção, sem representar funcionalidades entregues.

As cinco features abaixo serão construídas em sequência. Somente a 001 recebe especificação detalhada agora; 002–005 são recortes de backlog, sujeitos ao detalhamento quando chegar sua vez. Os critérios abaixo são condições de aceite futuro, não resultados já verificados.

## 001 — Consulta local da produção

**Resultado visível:** calendário e lista da produção NTV a partir de uma captura oficial da planilha, preparada pela Central. Cada conteúdo permite consultar tema, formato, etapa, responsável, pendência e links dos arquivos no Drive. A interface mostra fonte, instante da captura e período coberto.

**Dependências:** definir o contrato da captura e conferir os registros disponíveis. Preservar IDs internos, versões e relações entre semana, produção e arquivos. Não há acesso contínuo à fonte nesta feature.

**Aceite:** os conteúdos da captura aparecem sem duplicação, inclusive semanas que cruzam meses e a imagem B histórica. Calendário, lista, filtros e detalhes concordam entre si; links correspondem aos registros. Captura antiga, parcial, inválida ou indisponível fica identificada, sem converter ausência em zero ou conclusão. A consulta funciona por teclado e em tela de 390 px, sem corte horizontal. Consultar não edita dados, gera mídia, ativa controles nem publica.

Registro detalhado: `specs/001-consulta-local-producao/spec.md`.

## 002 — Planejamento mensal e repasse ao Diretor

**Resultado visível:** objetivo do mês, pautas sugeridas e ligação de cada semana ao plano mensal. O Estrategista de Conteúdo Mensal será um perfil delegado pela Central; o Diretor detalha e ajusta o recorte semanal, registrando a justificativa e preservando a origem mensal.

**Dependências:** concluir a 001, definir identidade por marca/mês/versão e o contrato de repasse mês/semana. Planejar uma migração conjunta de documentos, perfis e consumidores para a meta futura de uma imagem, um carrossel de 4–6 páginas e um Reels de 15–30 segundos por semana. Conferir fontes antes de qualquer mudança remota.

**Aceite:** o plano mensal mantém origem e versão; ajustes semanais não apagam a proposta anterior. Reentrada com as mesmas origens não duplica mês, semana ou entrega. A meta nova vale conforme a migração definida, preservando as duas imagens das semanas históricas, incluindo a imagem B. Hipóteses e datas sugeridas continuam identificadas. Este backlog não instala o perfil, muda prompts ou cria agenda; esses passos exigem escopo e evidência próprios quando a feature for detalhada.

## 003 — Revisões e pedidos de ajuste

**Resultado visível:** o usuário solicita ajustes pelo CRM e acompanha o retorno. Toda solicitação identifica conteúdo, versão de origem e pedido; a Central confere a versão vigente e registra a decisão nos campos autorizados.

**Dependências:** concluir 001–002 e definir o contrato de solicitação, confirmação, conflito e recibo, incluindo tratamento de reenvio.

**Aceite:** uma solicitação permanece pendente até existir confirmação da Central para a versão correta. Versão divergente produz conflito explícito; reenvio não aplica a mesma mudança duas vezes. O recibo permite conferir o resultado na fonte. Rejeição confirmada bloqueia as dependências pertinentes. A interface não se torna um segundo escritor operacional, e aprovação humana não substitui conferência técnica nem habilita geração ou publicação.

## 004 — Materiais e biblioteca visual

**Resultado visível:** prévias reais dos arquivos autorizados, com origem, versão e relação com o conteúdo. Referências visuais e materiais de produção aparecem identificados; no carrossel, cada página mostra o arquivo efetivamente disponível.

**Dependências:** concluir 001–003, conferir os registros de Biblioteca/Arquivos e definir como disponibilizar localmente os materiais permitidos.

**Aceite:** cada prévia corresponde a um arquivo real e à versão informada. Referência não aparece como peça produzida; arquivo ausente ou inacessível não recebe prévia fictícia. Mídia disponível, conferida e aprovada mantém estados distintos. Não há geração automática, exposição de credenciais nem mudança de permissões públicas do Drive.

## 005 — Acompanhamento da operação

**Resultado visível:** execuções conhecidas, pendências, responsáveis e próxima ação, acompanhados da fonte e do instante de atualização. O usuário entende o que avançou e o que depende de material, capacidade ou integração.

**Dependências:** concluir 001–004 e definir a leitura dos registros operacionais autorizados, com vínculo entre execução, conteúdo e versão.

**Aceite:** cada estado pode ser conferido na origem; configuração de agenda não aparece como execução comprovada. Dados antigos, falhas e pendências continuam explícitos. Abrir ou atualizar a visão não dispara geração, cobrança ou publicação. Não há métricas comerciais inventadas de alcance, leads ou vendas.

## Como vamos construir

Cada feature terá um registro canônico em `specs/<id>-<nome>/`: `spec.md` descreve valor, escopo e aceite; `plan.md` registra solução, dependências e verificações; `tasks.md` organiza a execução rastreável à mesma especificação. O Spec Kit organiza esses documentos. O Superpowers apoia decisões, plano, implementação, testes proporcionais, revisão independente e verificação, sem criar contratos concorrentes.

A cada entrega, registraremos separadamente o que está planejado, implementado, testado e integrado, com evidência e limitações. Multimarcas, servidor remoto e publicação automática ficam fora deste ciclo. A preparação documental não altera a produção existente.

**Próximo passo:** revisar o [plano da feature 001](specs/001-consulta-local-producao/plan.md) e executar suas [22 tarefas](specs/001-consulta-local-producao/tasks.md). A especificação e o plano estão preparados; implementação não iniciada. Não avançar para a feature seguinte sem demonstrar a anterior, conferir seus critérios de aceite e registrar pendências reais.
