# Telas do CRM Social — especificação

Data: 03/10/2026. Decidido com o autor sobre o [mockup v2](mockups/telas-v2.html), construído sobre o [protótipo aprovado](prototype/index.html). Visual, componentes e identidade (Social Studio) seguem o protótipo.

Como uma agenda que começa pelas páginas do mês, a entrega atual implementa T001–T026/US1, US2 e US3; revisão corrente e evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Os requisitos abaixo continuam sendo a meta completa: quadro e seis tabelas/Histórico ainda são futuros; a captura operacional permanece pendente.

## Princípios

- **Pouco texto.** Só o essencial na tela; nada de parágrafos explicativos.
- **Conteúdo da peça no detalhe do dia.** Calendário, lista e quadro mostram o mínimo para localizar; registros complementares abrem por clique na gaveta, enquanto avisos técnicos ficam na API/Planilha.
- **Tudo sobre a planilha fica na página Planilha.** Nas outras telas, um selo curto de status leva até ela.
- **Nada inventado.** Dia sem peça fica vazio. Campo vazio é "desconhecido", nunca zero. Valor fora do conhecido aparece como está, em "Outras".
- **Registrado, evidência e sugestão são coisas diferentes.** A 001 mostra o registrado na planilha e avisos; interpretações de encaminhamento ficam para a 006.
- **Consulta apenas.** Nenhuma tela aprova, gera mídia, agenda ou publica.

## Menu por feature

| Item | Feature | Na 001 |
| --- | --- | --- |
| Planejamento | 001 | Sim |
| Produção | 001 | Sim |
| Planilha | 001 (busca direta: 002 Planilhas) | Sim |
| Conteúdos | 005 | Não aparece |
| Equipe | 006 | Não aparece |
| Workflow | 006 | Não aparece |

## Selo de status (todas as telas, no topo)

| Estado | Texto | Cor |
| --- | --- | --- |
| Captura de hoje | Atualizado hoje, HH:MM | Verde |
| Captura de outro dia | Dados de DD/MM | Âmbar |
| Última atualização falhou | Atualização falhou | Vermelho (a última captura válida continua na tela) |
| Sem captura | Sem dados | Cinza |

O horário vem do fim da captura (envelope), não da maior data das linhas. Clicar no selo abre a Planilha.

## 1. Planejamento (001)

- Título do mês e selo de status.
- **Objetivo do mês:** card do protótipo. A planilha atual não tem fonte para o objetivo mensal (depende do contrato de planejamento mensal da feature 003); na 001 o card aparece discreto com "Ainda não definido", sem botão "Plano do mês".
- Filtros: Todos, Imagem, Carrossel, Reels. Troca Calendário / Lista.
- **Calendário com cartões** (protótipo): formato, título e estado registrado. Tema da semana no primeiro dia da semana.
- Dia com mais de uma peça: primeiro cartão + "+N no dia".
- Peças sem data válida: link discreto "N sem data" abaixo do calendário quando N > 0, abrindo a lista delas (nunca somem do total); com zero, o link não aparece.
- **Clicar num cartão ou no dia abre a gaveta do dia inteiro.**
- Lista: agrupada por semana (tema + período), mesma informação.

## 2. Gaveta do dia (001)

Referência de apresentação: [mockup da gaveta compacta v2](mockups/gaveta-v2.html), com os [limites da demonstração](mockups/LEIA-ME.md#gaveta-compacta-v2). Como fichas dobráveis de um mesmo dia, o resumo permite localizar a peça e o clique revela seus registros; a API continua completa.

- Título: dia da semana e data. Subtítulo: quantidade de peças. Largura de 520 px no desktop; tela inteira no celular, sem corte horizontal.
- Uma seção por peça em acordeão; só a primeira começa aberta. As demais mostram resumo de uma linha com quantidade de páginas/cenas da versão vigente, revisão e quantidade de avisos.
- Estado e formato em selos; faixa de quatro dados: etapa, com quem está, prevista e versão. Campo vazio não aparece. Etapas conhecidas recebem rótulo legível; desconhecidas aparecem exatamente como registradas, sem mudar o valor da API.
- Publicação aparece em uma linha somente com registro preenchido; ausência não comprova publicação e não ocupa uma faixa. Registro inconsistente permanece com aviso, sem conferência remota.
- Primeira revisão vigente em uma linha: decisão, versão, motivo e quem corrige (`responsavel_correcao`), separado do responsável da peça; valores e IDs de escopo preenchidos permanecem identificados. Outras vigentes ficam em **+N**; resolvidas, outras versões e vínculos a confirmar ficam dentro de **Histórico**, recolhido.
- Páginas e cenas em listas compactas: número, texto, link permitido ou **mídia ausente**, no máximo um aviso de ausência por linha. Versão vigente primeiro; versões anteriores recolhidas por clique. Design novo fica **A confirmar** sem classificação explícita documentada da página/versão; não deduzir por arquivo ou template.
- **Texto registrado** (legenda, campos textuais complementares e arquivos como registros) e **Histórico** começam recolhidos. Arquivo conserva nome de apresentação por tipo/papel, versão e rótulo **registro**, sem comprovar bytes ou disponibilidade.
- Link somente por clique em HTTPS nos hosts exatos `drive.google.com` / `docs.google.com`, sem usuário/senha. URL recusada nunca aparece como texto bruto. A projeção usa `new URL` e troca `Arquivos.url` e `Produções.url_video_final` com credenciais, ou não vazias que não podem ser analisadas, por **[conteúdo suprimido]**, com aviso localizado fixo sem o valor. URL inválida usa motivo **URL inválida suprimida**; vazio/somente espaços é preservado sem esse aviso. A captura privada conserva o original.
- Avisos técnicos (aba, linha e campo) ficam fora da gaveta, preservados na API. Por peça aparece somente **N avisos de dados nesta peça · ver na Planilha**. O link abre Planilha; as tabelas detalhadas dos avisos vêm na US5, sem antecipar essa entrega.
- Documentos da semana aparecem uma vez por semana representada no dia, no fim da gaveta, com os três papéis **Plano**, **Redação** e **Visual**; **—** quando ausentes, inclusive peça sem semana identificada. Não repetir a faixa em cada peça.
- Esc fecha e devolve o foco. Sem prévia de imagem (feature 005).

## 3. Produção (001)

- Semana com setas (anterior/próxima) e tema.
- **Quadro por etapa.** Primeiro publicação preenchida, depois liberação/prontidão, depois revisão em andamento; senão etapa por mapa aprovado. Mapeamento em JSON versionado, lido/validado pelo servidor; rótulo novo não exige mudar código. Colunas fixas do contrato; **Outras · N valores novos** conta rótulos distintos da semana e conserva o original no cartão.
- "Publicada" só com registro explícito de publicação.
- Cartão: formato, data prevista, título, status informativo, responsável registrado e pendência (revisão vigente que pede correção ou mídia ausente). Status não decide coluna. Clicar abre a gaveta do dia da peça.
- Quadro não é arrastável: mudar etapa é na planilha, pela Central.

## 4. Planilha (001)

- Cabeçalho: data e hora da última captura e período coberto. Botão **Atualizar dados**: na 001, relê a última captura salva pela Central; a busca direta no Google é a feature 002 Planilhas.
- **Dados organizados por aba:** uma aba por tabela capturada (Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes), com a contagem de linhas. Cada aba mostra as colunas mínimas do contrato em tabela com rolagem horizontal.
- Aba final **Histórico**: tentativas de captura/importação recentes confirmadas no estado local, resultado (completa / falhou) e motivo resumido. Falha nunca apaga a captura anterior; arquivos preparados sem confirmação não aparecem como conclusões.
- Sem captura: estado vazio com a orientação de pedir a primeira leitura à Central.
- Os dados ficam só neste computador (servidor local); nada vai para o repositório.

## 5. Celular (001)

- Lista por semana no lugar do calendário; menu recolhido. A gaveta do dia abre em tela cheia. Sem corte horizontal em 390 px.

## 6. Conteúdos (005)

Como no protótipo. Prévias só de arquivos liberados; referência não aparece como peça final.

## 7. Equipe (006) — cartões, aba própria

- Cartão por agente (6): nome, área, estado da agenda com a fonte, "com ele agora" (peças em que é o responsável registrado) e o que aguarda.
- Central com duas funções: Coordenação e Diretor criativo. Estrategista Mensal separado, como Proposto. Stories em Histórico, recolhido.
- Divergência entre cadastro e configuração real aparece como aviso (ex.: cadastro "ativa", agenda pausada), com as duas fontes e o horário.
- Detalhe do agente: recebe → faz → entrega → repassa; quem aciona; maturidade (planejado, implementado, testado, integrado).
- Fontes: aba Agentes (chave real: "Coluna 1") e a configuração real das agendas. Nunca expor prompt, configuração, IDs ou caminhos.

## 8. Workflow (006) — painel, aba própria

- Flags da aba Controle no topo (ligada / desligada / opcional).
- Tabela dos workflows da operação atual: estado (vários selos: "Publicado · Geração bloqueada · Integração pendente"), gatilho, última execução conhecida (aba Execucoes) e bloqueio.
- Gargalos com quem destrava.
- Histórico (arquivados, LAB, exports) recolhido no fim.
- Pré-requisito: a Fila de produção hoje não grava o próprio resultado; para o CRM explicar "por que a fila não andou", ela precisa registrar um resumo em Execucoes (mudança no n8n, com autorização).

## 9. Planilhas (002, logo após a 001)

- Botão Atualizar dados busca direto na planilha, só leitura, pelo servidor local, com conta de serviço do Google e chave fora do repositório.
- Emenda na constituição (o CRM passa a poder ler a planilha, só leitura, nunca no navegador).
- Amplia a captura para Agentes, Controle e Execucoes (base da feature 006).

## 10. Aplicação destas decisões no repositório

A [spec da 001](../../specs/001-consulta-local-producao/spec.md) é a especificação funcional canônica. Seu [plano](../../specs/001-consulta-local-producao/plan.md), [contrato](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) e [tarefas](../../specs/001-consulta-local-producao/tasks.md) traduzem estas decisões em requisitos verificáveis. O [roadmap](../../ROADMAP.md) define 002 Planilhas, 003 planejamento mensal, 004 revisões, 005 prévias/biblioteca e 006 Equipe/Workflow. A entrega parcial implementa US1/US2/US3; as decisões completas abaixo permanecem requisitos das próximas tarefas, conforme a nota de estado acima.

- O cartão ou dia selecionado abre todas as peças NTV daquele dia, inclusive outros formatos que um filtro tenha escondido no calendário. O filtro serve para localizar; não recorta a gaveta. A gaveta de um dia vazio informa ausência e não cria peças. Sem data válida abre uma lista identificada; um cartão sem data no quadro leva ao conjunto sem data da semana.
- O selo usa a data civil de `completedAt` em America/Sao_Paulo. Sem captura válida, mostra **Sem dados**, com eventual falha no Histórico. Com captura válida e tentativa posterior falha, prevalece **Atualização falhou**; uma releitura HTTP bem-sucedida não apaga a falha da importação. Uma tentativa nova aceita encerra o aviso. A Planilha conserva fonte, instante e período completos.
- O autor aprovou `arte_aprovada` em **Visual** e manteve os oito valores do dicionário em **Mídia**, inclusive `montagem_pronta`, quando nenhuma prioridade superior vence. As listas atuais de liberação/prontidão e revisão em andamento são vazias: bloqueado não libera, aprovada/sem_rejeicao_documental não são revisão em andamento. Novos rótulos aprovados entram só pelo JSON versionado e reinício; configuração inválida gera erro claro.
- **Publicada** tem precedência com `publicado_em` preenchido; liberação vence revisão, revisão vence etapa e status nunca decide. Dado de publicação inconsistente conserva coluna com aviso, sem verificar publicação remota. Data prevista, status, aprovação ou arquivo sem o campo preenchido não comprovam publicação.
- **Outras · N valores novos** conta distintos originais dos cartões Outras na semana NTV selecionada, incluindo vazio uma vez (Não informada). Repetições, outra semana/marca e cartões vencidos por prioridade superior não somam. Original sempre visível; sem cartões, zero; singular para um.
- **Com quem está** é `Produções.responsavel_atual`, como registrado. **Quem corrige** vem da revisão vigente em `Revisoes.responsavel_correcao`, com versão e escopo separados. A 001 não infere **aguardando de**, agente trabalhando agora ou próxima ação. Falta de vínculo inequívoco aparece como aviso.
- As seis tabelas da Planilha usam exatamente as 66 colunas mínimas do contrato, incluindo identificadores e hashes registrados como texto de consulta **local**. Colunas adicionais e envelope da captura permanecem privados, sem exposição arbitrária por HTTP. Nenhuma captura, dado operacional ou credencial entra no Git, no mockup ou em fixtures.
- O Histórico reúne todas as tentativas completas e falhas confirmadas no estado local, com horários e motivos resumidos; não é uma lista calculada somente da última tentativa nem inclui arquivos órfãos de uma interrupção. Repetir a mesma captura aceita não duplica o registro de conclusão. Nunca renovar o horário da captura por clicar em **Atualizar dados**.
- Fontes de conferência: dicionário de cabeçalhos e domínios e inventário de agentes/workflows de 03/10/2026, lidos como referência. Eles não constituem captura nem monitoramento atual e não são copiados para ampliar a 001.

O [LEIA-ME do mockup](mockups/LEIA-ME.md) registra a sanitização e os limites da demonstração. O HTML conserva variantes visuais de features futuras e exemplos; os requisitos acima e a spec delimitam a implementação, inclusive menu, valores de etapa, abas exatas, histórico e ausência de objetivo mensal.
