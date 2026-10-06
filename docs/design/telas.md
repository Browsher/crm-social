# Telas do CRM Social — especificação

Data: 03/10/2026. Decidido com o autor sobre o [mockup v2](mockups/telas-v2.html), construído sobre o [protótipo aprovado](prototype/index.html). Visual, componentes e identidade (Social Studio) seguem o protótipo.

Estado atual: a 001 está implementada, testada e demonstrada com captura real, T001–T041 concluídas; resultados e limites na [validação da 001](../../specs/001-consulta-local-producao/validacao.md). A [002](../../specs/002-consulta-planilhas/validacao.md) está mesclada na main; T021 real concluída, com tipagem numérica resolvida e evidência sanitizada na validação da 002. A [003](../../specs/003-planejamento-mensal/validacao.md) está concluída, com código integrado pelo PR #15; T002/T015 conferidas no CRM com uma linha fictícia marcada como teste. Uso real antes de decidir 004/005. A tipagem da captura demonstrada na 001 deixa vínculos/vigência a confirmar, conforme sua validação.

## Princípios

- **Pouco texto.** Só o essencial na tela; nada de parágrafos explicativos.
- **Conteúdo da peça no detalhe do dia.** Calendário, lista e quadro mostram o mínimo para localizar; registros complementares abrem por clique na gaveta, enquanto avisos técnicos ficam na API/Planilha.
- **Tudo sobre a planilha fica na página Planilha.** Nas outras telas, um selo curto de status leva até ela.
- **Nada inventado.** Dia sem peça fica vazio. Campo vazio é "desconhecido", nunca zero. Valor fora do conhecido aparece como está, em "Outras".
- **Registrado, evidência e sugestão são coisas diferentes.** A 001 mostra o registrado na planilha e avisos; interpretações de encaminhamento ficam fora do v1, para v2 visual ilustrativo.
- **Consulta apenas.** Nenhuma tela aprova, gera mídia, agenda ou publica.

## Menu por feature

| Item | Feature | Na 001 |
| --- | --- | --- |
| Planejamento | 001 | Sim |
| Produção | 001 | Sim |
| Planilha | 001 (busca direta: 002 Planilhas) | Sim |
| Conteúdos | 005 | Não aparece |

Equipe/Workflow fora do menu planejado do v1: **v2 (visual ilustrativo)**, decisão05/10. Abas auxiliares e mudança da Fila no n8n no mesmo backlog futuro.

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
- Uma seção por peça em acordeão; só a primeira começa aberta. As demais mostram resumo de uma linha com quantidade de páginas/cenas da versão vigente, revisão e quantidade de avisos, com singular/plural corretos. Revisão é **aberta** quando há vigente; **a confirmar** quando há somente ambígua/anterior não resolvida; **sem revisão** quando nenhuma ou somente resolvidas.
- Estado e formato em selos; faixa de quatro dados: etapa, com quem está, prevista e versão. Campo vazio não aparece. Etapas conhecidas recebem rótulo legível; desconhecidas aparecem exatamente como registradas, sem mudar o valor da API.
- Publicação aparece em uma linha somente com registro preenchido; ausência não comprova publicação e não ocupa uma faixa. Registro inconsistente permanece com aviso, sem conferência remota.
- Primeira revisão vigente com título legível, por exemplo **Revisar · versão 2 — motivo**; abaixo, **Corrige: pessoa · tratamento**, separado do responsável da peça. Sem IDs/rótulos técnicos na linha; escopos completos permanecem na API. Outras vigentes ficam em **+1 revisão aberta** ou **+N revisões abertas**; resolvidas, outras versões e vínculos a confirmar ficam dentro de **Histórico**, recolhido.
- Páginas e cenas em listas compactas: número, texto, link permitido ou **mídia ausente**, no máximo um aviso de ausência por linha. Versão vigente primeiro; versões anteriores recolhidas por clique. Design novo fica **A confirmar** sem classificação explícita documentada da página/versão; não deduzir por arquivo ou template.
- Cena distingue **imagens ausentes**, **imagem inicial ausente**, **imagem final ausente** e/ou **vídeo ausente**, num único texto humano. A API conserva os três slots de mídia, sem escolher substitutos; registros existentes sem link permitido usam **link não permitido**, sem URL bruta.
- **Texto registrado** (legenda, campos textuais complementares e arquivos como registros) e **Histórico** começam recolhidos. Arquivo conserva nome de apresentação por tipo/papel, versão e rótulo **registro**, sem comprovar bytes ou disponibilidade.
- Link somente por clique em HTTPS nos hosts exatos `drive.google.com` / `docs.google.com`, sem usuário/senha. URL recusada nunca aparece como texto bruto. A projeção usa `new URL` e troca `Arquivos.url` e `Produções.url_video_final` com credenciais, ou não vazias que não podem ser analisadas, por **[conteúdo suprimido]**, com aviso localizado fixo sem o valor. URL inválida usa motivo **URL inválida suprimida**; vazio/somente espaços é preservado sem esse aviso. A captura privada conserva o original.
- Por decisão do autor, texto mínimo/recibo preserva frase e espaços: somente pedaço HTTP(S) separado por espaços em branco e identificado com usuário/senha por `new URL` vira marcador, conservando pontuação de contorno. Não promete detectar outros esquemas, URL relativa, espaços em userinfo ou forma fora desse pedaço; campos de URL dedicados mantêm seu guarda. JSON é dado: só tokens de string alterados são reserializados, mantendo os demais bytes. Arquivo ligado sem URL segura mostra **link não permitido**, sem confundir recusa de link com mídia ausente. Texto registrado identifica **Página/Cena número · versão**, sem IDs técnicos; API mantém os campos completos. Avisos globais dos registros relacionados entram no contador da peça, sem duplicar o conjunto global.
- Avisos técnicos (aba, linha e campo) ficam fora da gaveta, preservados na API/Planilha. Por peça aparece quantidade de **aviso(s) de dados nesta peça** e link **ver na Planilha**, com plural correto e sem separador pendurado. O link fecha a gaveta, abre Produções e dá rolagem/foco ao painel Aba/Linha/Campo/Motivo da peça; as seis tabelas continuam com todas as linhas NTV.
- Documentos da semana aparecem uma vez por semana representada no dia, no fim da gaveta, com os três papéis **Plano**, **Redação** e **Visual**; **—** quando ausentes, inclusive peça sem semana identificada. Não repetir a faixa em cada peça.
- Esc fecha e devolve o foco. Sem prévia de imagem (feature 005).

## 3. Produção (001)

- Semana com setas (anterior/próxima) e tema.
- **Quadro por etapa.** Primeiro publicação preenchida, depois liberação/prontidão, depois revisão em andamento; senão etapa por mapa aprovado. Mapeamento em JSON versionado, lido/validado pelo servidor; rótulo novo não exige mudar código. Colunas fixas do contrato; **Outras · N valores novos** conta rótulos distintos da semana e conserva o original no cartão.
- "Publicada" só com registro explícito de publicação.
- Cartão: formato, data prevista, título, status informativo, responsável registrado e primeira pendência visível, com **+N pendências** para as demais visíveis. Status não decide coluna. Clicar abre a gaveta do dia da peça.
- **Mídia ausente** aparece no cartão de Mídia, Revisão, Pronta, Publicada e Outras; fica oculta no cartão de Planejamento, Redação e Visual. Revisão vigente que pede correção continua no resumo de qualquer coluna, com responsável de correção separado quando registrado. O contador considera somente pendências visíveis; sem elas, não há resumo. A regra é somente de apresentação do cartão (`pendenciaQuadro` em `src/web/app.js`); API e gaveta conservam os detalhes de mídia e revisão.
- Quadro não é arrastável: mudar etapa é na planilha, pela Central.

## 4. Planilha (001)

- Cabeçalho com subtítulo **Dados capturados da planilha, por aba**. Origem mostra data/hora da última captura e período coberto; avisos ficam resumidos na linha da última importação falha e no link **N avisos de dados**, com singular para um, sem lista de motivos repetida. A falha informa **captura anterior preservada** ou **nenhuma captura válida disponível**, conforme a existência de captura. O link restaura avisos gerais, abre Produções e dá foco/rolagem ao painel, inclusive saindo de Histórico. Botão **Atualizar dados**: na 001, relê a última captura salva pela Central; a busca direta no Google é a feature 002 Planilhas.
- **Dados organizados por aba:** Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes, nessa ordem, com contagem de linhas NTV e os 66 mínimos triados. Objetos de linha não recebem quadro/detalhes/envelope ou extras. Cada tabela tem região própria de rolagem horizontal, com foco; a página não rola lateralmente em 390 px.
- Setas esquerda/direita, Home e End alternam seleção/foco das abas. Releitura conserva a aba ainda disponível selecionada.
- Aba final **Histórico**: todas as tentativas completas/falhas confirmadas, recentes primeiro, horário em São Paulo e motivo em linguagem de tela: **Cenas complete: inválido** aparece como **Aba Cenas incompleta**. Outros erros recebem rótulos legíveis; desconhecido usa **Captura não pôde ser importada**. API e recibos conservam os motivos originais. Falha nunca apaga a captura anterior; órfãos não aparecem como conclusões e no-op não duplica tentativa. O painel de avisos fica oculto nessa aba.
- **Avisos de dados:** única lista no painel Aba/Linha/Campo/Motivo, com — quando não há localização. Motivos de mídia são consolidados só na apresentação, por exemplo **Imagens e vídeo ausentes**, **Imagem final ausente**, **Nenhum arquivo da produção registrado** e **Imagem ausente** para páginas; não mudam a API, origem ou quantidade de avisos. O atalho da gaveta mostra os relacionados à peça; menu, selo, Todos os avisos e contador de Origem restauram os gerais. Esse filtro não reduz dados das seis tabelas.
- Célula dedicada `url`/`url_video_final` recusada pela allowlist HTTPS Drive/Docs mostra **link não permitido**; marcador de supressão permanece. A API conserva o valor triado; texto livre legítimo mantém suas URLs como texto. Nenhuma célula cria link ou navegação/carregamento automático. Alcance e normalização null→string vazia, exceto etapa_producao, no [contrato](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#apresentação-de-planilha-e-alcance-das-urls).
- Sem captura: somente Histórico e orientação para pedir a primeira captura completa à Central; sem tentativa, ausência explícita de registros confirmados.
- Os dados ficam só neste computador (servidor local); nada vai para o repositório.

## 5. Celular (001)

- Lista por semana no lugar do calendário; menu recolhido. A gaveta do dia abre em tela cheia. Sem corte horizontal em 390 px.

## 6. Conteúdos (005)

Como no protótipo. Prévias só de arquivos liberados; referência não aparece como peça final.

## 7. Equipe — v2 (visual ilustrativo), fora do v1

- Cartão por agente (6): nome, área, estado da agenda com a fonte, "com ele agora" (peças em que é o responsável registrado) e o que aguarda.
- Central com duas funções: Coordenação e Diretor criativo. Estrategista Mensal separado, como Proposto. Stories em Histórico, recolhido.
- Divergência entre cadastro e configuração real aparece como aviso (ex.: cadastro "ativa", agenda pausada), com as duas fontes e o horário.
- Detalhe do agente: recebe → faz → entrega → repassa; quem aciona; maturidade (planejado, implementado, testado, integrado).
- Fontes: aba Agentes (chave real: "Coluna 1") e a configuração real das agendas. Nunca expor prompt, configuração, IDs ou caminhos.

## 8. Workflow — v2 (visual ilustrativo), fora do v1

- Flags da aba Controle no topo (ligada / desligada / opcional).
- Tabela dos workflows da operação atual: estado (vários selos: "Publicado · Geração bloqueada · Integração pendente"), gatilho, última execução conhecida (aba Execucoes) e bloqueio.
- Gargalos com quem destrava.
- Histórico (arquivados, LAB, exports) recolhido no fim.
- Pré-requisito: a Fila de produção hoje não grava o próprio resultado; para o CRM explicar "por que a fila não andou", ela precisa registrar um resumo em Execucoes (mudança no n8n, com autorização).

## 9. Planilhas (002, logo após a 001)

- Botão Atualizar dados busca direto na planilha, só leitura, pelo servidor local, com conta de serviço do Google e chave fora do repositório.
- Emenda na constituição (o CRM passa a poder ler a planilha, só leitura, nunca no navegador).
- [002 reduzida](../../specs/002-consulta-planilhas/spec.md): seis abas tipadas, batchGet duas vezes, hashes iguais e mesmo importadorv1. Falha preserva captura/data; emenda1.1.0 aplicada. Auxiliares/Equipe/Workflow/Fila são v2 ilustrativo, fora do v1; estado na [validação](../../specs/002-consulta-planilhas/validacao.md).

## 10. Aplicação destas decisões no repositório

**003 concluída (15/15; demonstração com registro fictício na fonte real):** consulta da aba opcional Meses (`mes`, `marca_id`, `objetivo`, `pautas`), preenchida à mão pelo autor. O card do mês exibido mostra objetivo definido na cor principal e até cinco pautas, restante **+N pautas** ou **+1 pauta** no singular; sem aba/linha/objetivo, **Ainda não definido** apagado; duplicata marca/mês, **A confirmar** apagado, sem escolher texto. Meses aparece na Planilha depois das seis tabelas e antes de Histórico, quando capturada, com avisos/teclado/rolagem existentes. Atualizar dados inclui a opcional somente se existir. Sem botão Plano do mês, escritor, campos extras, vínculo com semana ou fluxo de agentes/meta semanal no CRM. [Spec](../../specs/003-planejamento-mensal/spec.md), [plano](../../specs/003-planejamento-mensal/plan.md), [tarefas](../../specs/003-planejamento-mensal/tasks.md) e [validação](../../specs/003-planejamento-mensal/validacao.md). T002 (aba criada pelo autor) e T015 (demonstração pelo CRM com uma linha fictícia marcada como teste) concluídas. Próximo passo: uso real antes de decidir 004/005. A T021 da 002 foi demonstrada e integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16); o pré-requisito da 003 foi atendido. O código da 003 foi integrado pelo PR #15. O fechamento documental exige gate/review vigentes sem bloqueio de segurança ou regressão. As regras das 001–002 abaixo continuam vigentes.

A [spec da 001](../../specs/001-consulta-local-producao/spec.md) é a especificação funcional canônica. Seu [plano](../../specs/001-consulta-local-producao/plan.md), [contrato](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) e [tarefas](../../specs/001-consulta-local-producao/tasks.md) traduzem estas decisões em requisitos verificáveis. O [roadmap](../../ROADMAP.md) define 002 Planilhas, 003 planejamento mensal, 004 revisões, 005 prévias/biblioteca e, fora do v1, Equipe/Workflow como v2 visual ilustrativo. A entrega local implementa US1–US5 e o iniciador; demonstração com captura real e onboarding final concluídos, com resultados e limites na validação.

- O cartão ou dia selecionado abre todas as peças NTV daquele dia, inclusive outros formatos que um filtro tenha escondido no calendário. O filtro serve para localizar; não recorta a gaveta. A gaveta de um dia vazio informa ausência e não cria peças. Sem data válida abre uma lista identificada; um cartão sem data no quadro leva ao conjunto sem data da semana.
- O selo usa a data civil de `completedAt` em America/Sao_Paulo. Sem captura válida, mostra **Sem dados**, com eventual falha no Histórico. Com captura válida e tentativa posterior falha, prevalece **Atualização falhou**; uma releitura HTTP bem-sucedida não apaga a falha da importação. Uma tentativa nova aceita encerra o aviso. A Planilha conserva fonte, instante e período completos.
- O autor aprovou `arte_aprovada` em **Visual** e manteve os oito valores do dicionário em **Mídia**, inclusive `montagem_pronta`, quando nenhuma prioridade superior vence. As listas atuais de liberação/prontidão e revisão em andamento são vazias: bloqueado não libera, aprovada/sem_rejeicao_documental não são revisão em andamento. Novos rótulos aprovados entram só pelo JSON versionado e reinício; configuração inválida gera erro claro.
- **Publicada** tem precedência com `publicado_em` preenchido; liberação vence revisão, revisão vence etapa e status nunca decide. Dado de publicação inconsistente conserva coluna com aviso, sem verificar publicação remota. Data prevista, status, aprovação ou arquivo sem o campo preenchido não comprovam publicação.
- **Outras · N valores novos** conta distintos originais dos cartões Outras na semana NTV selecionada, incluindo vazio uma vez (Não informada). Repetições, outra semana/marca e cartões vencidos por prioridade superior não somam. Original sempre visível; sem cartões, zero; singular para um.
- **Com quem está** é `Produções.responsavel_atual`, como registrado. **Quem corrige** vem da revisão vigente em `Revisoes.responsavel_correcao`, com versão e escopo separados. A 001 não infere **aguardando de**, agente trabalhando agora ou próxima ação. Falta de vínculo inequívoco aparece como aviso.
- As seis tabelas da Planilha usam exatamente as 66 colunas mínimas do contrato, incluindo identificadores e hashes registrados como texto de consulta **local**. Colunas adicionais e envelope da captura permanecem privados, sem exposição arbitrária por HTTP. Nenhuma captura, dado operacional ou credencial entra no Git, no mockup ou em fixtures.
- O Histórico reúne todas as tentativas completas e falhas confirmadas no estado local, com horários e motivos resumidos; não é uma lista calculada somente da última tentativa nem inclui arquivos órfãos de uma interrupção. Repetir a mesma captura aceita não duplica o registro de conclusão. Nunca renovar o horário da captura por clicar em **Atualizar dados**.
- Fontes de conferência: dicionário de cabeçalhos e domínios e inventário de agentes/workflows de 03/10/2026, lidos como referência. Eles não constituem captura nem monitoramento atual e não são copiados para ampliar a 001.

O [LEIA-ME do mockup](mockups/LEIA-ME.md) registra a sanitização e os limites da demonstração. O HTML conserva variantes visuais de features futuras e exemplos; os requisitos acima e as specs delimitam a implementação, inclusive menu, valores de etapa, abas exatas e histórico. A ausência de objetivo mensal pertence ao escopo original da 001; a 003 consulta Meses conforme seu contrato.
