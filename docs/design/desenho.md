# CRM Social local e planejamento mensal

Data: 02/10/2026. Estado: proposta de design para revisão, acompanhada de protótipo navegável. Não é contrato instalado, integração ou mudança da fila atual.

## Intenção e decisões já recebidas

O usuário quer visualizar a organização do conteúdo em um CRM simples, usando `CRM de referência local, caminho configurado fora do repositório` como referência. Confirmou acesso somente neste computador por enquanto. Propõe um agente para planejamento mensal e ajustes semanais pelo Diretor. A meta mais recente informada é uma imagem, um carrossel e um Reels por semana, sem Stories; marcas adicionais são uma direção futura.

Primeira versão: NTV, calendário mensal, visão da produção semanal, detalhes com materiais disponíveis e responsabilidades compreensíveis. A planilha continua sendo a fonte operacional; o Drive mantém documentos e mídias. O usuário precisa distinguir ideia, planejamento, material disponível e entrega revisada sem navegar pelos workflows.

## Referência conferida

Leitura do CRM comercial, sem alteração: AGENTS.md, PREFERENCIAS.md, REGRAS.md, README.md, src/components/crm/shell.tsx, shell.module.css, src/styles/ui.css e telas de gestão/empresas. Referência visual: lateral recolhível, topo, superfícies claras, Segoe UI, filtros, divisórias finas e estados textuais. Autenticação, banco, papéis gestor/vendedor e dados comerciais não serão incorporados por consequência dessa referência.

## Escopo da interface

1. Planejamento: mês e marca, objetivo sugerido, tema de cada semana, publicações por formato, calendário/lista e filtro. Datas propostas não aparecem como agendamento executado.
2. Produção: agrupamento semanal com responsável, próxima ação e impedimento específico. Uma peça com texto pronto e vídeo ausente continua sem vídeo.
3. Conteúdos: prévias existentes, roteiro e arquivos de origem; acesso ao detalhe de cada publicação. Carrossel exibe quais páginas têm o novo design e quais ainda usam o anterior.
4. Equipe: papel do planejador mensal, Diretor e especialistas. Nome de papel não comprova agenda instalada ou execução ativa.

Detalhe de conteúdo: tema, formato, objetivo, data sugerida/confirmada, responsável, etapa, material disponível, pendência e fonte da informação. Em todas as telas existe informação de atualização/sincronização. Não haverá métricas fictícias de alcance, leads ou vendas.

## Protótipo entregue nesta etapa

`prototype/index.html`, abre offline no navegador. É uma prévia de design: filtros, navegação, calendário/lista e detalhe funcionam localmente; não salva decisões operacionais, não chama agentes, não grava Sheets/Drive e não dispara workflows.

Usa cópias locais identificadas da semana NTV-2026-10-05 como referência, e nove ideias ilustrativas para as demais semanas de outubro. Datas de terça/quinta/sábado são sugestões, não a agenda real. A semana existente contém duas imagens; a imagem B não é removida ou ocultada como se deixasse de existir. As duas novas páginas do carrossel são propostas de design, não um novo pacote integral aprovado.

## Agente mensal e Diretor semanal

Nome proposto: **Estrategista de Conteúdo Mensal**. Trabalha como perfil delegado pela Central, com execução manual ou quando faltar o plano do próximo mês. Não precisa de um segundo coordenador nem de uma agenda horária concorrente.

- Mensal: consolida objetivo, público, pilares, fatos conferidos, histórico disponível, temas, ângulos por formato, datas sugeridas, direção visual e necessidades/custos ainda estimados. Entrega plano mensal versionado e hipóteses marcadas.
- Diretor: recebe o recorte da semana; confere fatos, disponibilidade e revisões; detalha a criação e a intenção do vídeo. Pode ajustar a pauta com justificativa registrada e sem reescrever a origem mensal. Encaminha aos especialistas pela Central.
- Central: valida e registra os documentos e mantém os ponteiros. O perfil mensal devolve propostas locais, sem escrita remota direta.
- Retorno: resultados e objeções das semanas alimentam o próximo planejamento mensal. Dados ausentes não são resultados iguais a zero.

O prompt proposto está em `prototype/estrategista-mensal-proposto.md`. Não foi instalado nem conectado à automação.

## Integração operacional proposta, depois da escolha da interface

Começar por leitura: uma exportação controlada pela Central das abas e documentos vigentes alimenta o painel local. Preservar IDs, versões, origens, instante da captura e motivo de pendência. Mostrar explicitamente quando os dados vierem de snapshot, estiverem antigos ou não puderem ser atualizados. O protótipo não implementa essa exportação.

Edição/revisão é uma segunda etapa: solicitações do usuário devem incluir ID estável e versão de origem. A Central confere a versão vigente, aplica somente campos autorizados e devolve recibo. Enquanto não houver confirmação, a interface mostra solicitação pendente, nunca aprovação ou rejeição já aplicada. Rejeições confirmadas bloqueiam dependências; aprovação humana não elimina conferência técnica nem habilita custo/publicação por si só.

Não criar acesso público ao Drive, expor credenciais no navegador ou misturar controles da fila com comandos visuais. Para acesso apenas local não é necessário implantar agora autenticação multiusuário, banco remoto ou hospedagem. Se for necessário servidor local, limitar a interface a loopback; nada de exposição da rede por padrão.

Planejamento mensal precisa de um registro próprio por marca/mês/versão e ligação explícita com a semana. A escolha dos cabeçalhos e eventual aba nova será feita em migração documentada após leitura remota; não guardar ponteiros ocultos em observações nem acrescentar campos silenciosamente.

## Divergências a resolver antes da integração

- PRD, contrato e perfis instalados ainda descrevem duas imagens e quatro peças semanais. A proposta nova usa uma imagem e três peças. Ajustar documentos, consumidores e validações em conjunto; preservar semanas históricas e material já produzido.
- A origem mensal e sua ligação com o plano semanal não existem como contrato comprovado. Criar e validar antes de tratar o planejador como instalado.
- CRM antigo de demonstração e este protótipo não comprovam sincronização, aprovação persistida ou backend.
- Capacidade do vídeo e crédito do fornecedor continuam dependências próprias; o calendário não transforma um vídeo planejado em entregue.

## Sequência de aplicação

1. Conferir o protótipo local e o escopo desta proposta.
2. Implementar leitura real com estados/fontes/atualização, mantendo a planilha como origem.
3. Integrar o perfil mensal e adaptar o Diretor e a meta semanal com migração/testes pertinentes.
4. Implementar pedidos de ajuste/revisão e confirmação de escrita pela Central.

Não é necessário reformular o n8n para desenhar o painel. Alterações posteriores só atingem consumidores cujo contrato realmente mudar.

## Critérios de aceite da primeira integração

- O mês mostra as peças da fonte lida sem criar duplicatas; semanas que cruzam o mês mantêm IDs estáveis.
- Detalhes levam aos arquivos corretos e distinguem prévia/versão vigente/mídia ausente.
- Cache antigo, falha de leitura e ideias sugeridas ficam identificados.
- Formatos filtram corretamente, navegação funciona por teclado e não há corte horizontal em tela de 390px.
- Alteração ou solicitação não confirmada não aparece como sincronizada.
- Nenhum clique em consulta gera mídia, ativa flag ou publica.
- Nenhuma credencial ou informação de outra marca aparece no HTML.
- Planejamento mensal não duplica a semana existente nem sobrescreve ajuste semanal.

## Fontes de método editorial

- Buffer, planejamento mensal e produção semanal: https://buffer.com/resources/how-to-save-time-planning-social-media-content/
- Buffer, calendário e colaboração: https://buffer.com/resources/content-calendar-template/
- Relatos da comunidade sobre planejamento e lotes: https://www.reddit.com/r/socialmedia/comments/1ukt5im/how_do_you_actually_plan_your_week_of_posts_batch/

Essas fontes orientam o processo; não demonstram integração ou resultados da NTV.


A cópia pública do protótipo é autocontida, sem os arquivos da operação. As referências reais do desenho original são históricas, não comprovação de integração.
