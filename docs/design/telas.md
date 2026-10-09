# Telas do CRM Social — especificação

## Layout v3 — referência aprovada para a 006

Como uma agenda pessoal, o layout organiza peças por semana e reúne o material da publicação manual. [layout-v3.html](mockups/layout-v3.html) é a cópia sanitizada da referência aprovada, sem dado operacional, credencial, ID de serviço ou acesso à API; o pedido escrito prevalece sobre a demonstração.

A [spec única](../../specs/006-layout-v3/spec.md)/[contrato](../../specs/006-layout-v3/contracts/apresentacao.md) mantêm 32 IDs e duas entregas. A integrada pelo [PR #24](https://github.com/Browsher/crm-social/pull/24), main a5be355 após aprovação em 09/10; B implementada/testada localmente, integrada em c4660d7 após aprovação expressa do autor, com revisão visual do Instagram solicitada pelo autor em 09/10/2026 e validada localmente. 32/32 tarefas executadas; implementação, testes e revisão concluídos, entrega integrada em c4660d7 após aprovação expressa do autor. Resultados do head final são conferidos no PR. [PR #25](https://github.com/Browsher/crm-social/pull/25) MERGED/anexado. Fonte de código/testes 08ba10b; gate oficial executado em bc74d6e: 756 PASS/0 SKIP, cobertura 95,5217%, 688 métricas/máximo 16/18 avisos, exit 0/baseline preservada; Semgrep SKIP local/audit N/A. Quatro PNG Instagram novos em 08ba10b; dezesseis PNG B preservados em 800d7ca. Push realizado e CI estrito do head aprovado a5c964c SUCCESS/Semgrep PASS; revisão independente de 1bcb4a8 aprovada, com Minor documental corrigido. Review remoto adjudicado sem bloqueio: I1 não reproduzido, I2 histórico corrigido; resultados do head final são conferidos no PR; restrição da entrega anterior cumprida; integração autorizada em c4660d7.

Menu final Planejamento/Produção/Publicar. Topo comum com selo indicador e ⟳ Atualizar único; selo antigo/falha conserva data/hora da captura em São Paulo, inclusive falha inicial sem dados; objetivo em linha recolhível, Semana padrão/sete colunas e Mês em altura disponível. Semana móvel centra hoje e conserva rolagem; em 390, semana nova sem hoje nem memória começa em scroll 0. Mês mostra ponto colorido pelo estado e tipo curto **Oferta/Carrossel/Reels**, conforme ajuste aprovado em 09/10; Imagem → Oferta é alias somente visual, sem inferir classificação editorial ou alterar API. Tipos completos em 390, acesso por teclado e nenhuma imagem carregada no Mês.

Produção agrupa projetos pela semana registrada, com progresso X de N e cinco passos ou motivo simples travado; futuro vazio tem somente Planejamento na sexta-feira no corpo. Ver no Instagram aparece em Produção, Publicar e gaveta. Prévia segue .phone: celular preto nos dois temas, largura próxima de 360 px, borda 10 px/cantos 38 px, Fechar acima/fora; avatar sintético de siglaMarca configurada, 40 px/fonte 7,5 px para três/quatro caracteres, perfil em negrito, Prévia · não publicado e ⋯ decorativo. Arte 4:5 contain, setas/contador sobrepostos, pontos abaixo; ícones decorativos ♡ 💬 ↗ … e SVG de salvar em `currentColor` e perfil em negrito seguido da legenda literal/hashtags azuis. Mantém teclado/arrasto. Seta desabilitada não retém foco: a outra habilitada ou Fechar recebe foco; ponto/seta ocultados ao reduzir a uma posição transferem foco a Fechar. Posições sem prévia permanecem no total; Imagem única conserva o primeiro slot lógico null em 1/1, sem setas/pontos, e Reels anuncia Cena/início/final; atualização mantém a mesma peça com versão nova, limita índice e fecha/restaura foco se removida. Selo/Dados/Atualizar/feedback permanecem somente na página, inerte com showModal. Uma atualização iniciada antes da abertura ou releitura programática recebida conserva as regras; para nova atualização pelo botão, fechar e usar o topo.

Publicar mostra fila de liberação literal e publicação vazia, por data, hoje destacado, cópia local e pacote seguro; publicadas recentes/travadas ao lado, depois da fila em 390. Planilha/atalhos/dados técnicos saem da interface, permanecendo completos na API; Dados a confirmar é o sinal mínimo global/no resumo da peça, fica somente na página e oculta quando nova captura não tem avisos; gaveta conserva dia, unidades, versões e galeria, sem nomes de agentes/ferramentas.

Mesmos dados/captura/API, temas e teclado; quantidade/dias de exemplo não viram regra, nem há operação editorial. [Módulo web](../modules/web.md), [prévia](../modules/instagram.md), [perfil](../modules/perfil-config.md), [20 screenshots B](screenshots/LEIA-ME.md#006--layout-v3-parte-b), [12 históricos A](screenshots/LEIA-ME.md#006--layout-v3-parte-a) e [validação](../../specs/006-layout-v3/validacao.md).

A manutenção visual de 09/10/2026 está implementada/testada localmente, não integrada; checks/review do head final ficam no PR. Tema de pauta vazio/somente espaços deixa apenas o rótulo no cabeçalho semanal, projeto e fallback, sem separador pendente. [Validação](../reports/006-ajustes-visuais-validacao.md) e [antes/depois sintéticos](screenshots/LEIA-ME.md#006--ajustes-visuais). A 006 permanece integrada com 32/32 tarefas; o emoji de salvar é histórico, substituído pelo SVG decorativo.

## Decisões históricas 001–005

Data: 03/10/2026. Decidido com o autor sobre o [mockup v2](mockups/telas-v2.html), construído sobre o [protótipo aprovado](prototype/index.html). Visual, componentes e identidade (Social Studio) seguem o protótipo.

Estado atual: a 001 está implementada, testada e demonstrada com captura real, T001–T041 concluídas; resultados e limites na [validação da 001](../../specs/001-consulta-local-producao/validacao.md). A [002](../../specs/002-consulta-planilhas/validacao.md) está mesclada na main; T021 real concluída, com tipagem numérica resolvida e evidência sanitizada na validação da 002. A [003](../../specs/003-planejamento-mensal/validacao.md) está concluída, com código integrado pelo PR #15; T002/T015 conferidas no CRM com uma linha fictícia marcada como teste. A 004 foi autorizada em 07/10 e está implementada/testada localmente, no [PR #20](https://github.com/Browsher/crm-social/pull/20), com entrega e integração acompanhadas no PR e merge condicionado ao gate/review do head vigente; resultados por head na [validação da 004](../../specs/004-pautas-planejamento/validacao.md). A tipagem da captura demonstrada na 001 deixa vínculos/vigência a confirmar, conforme sua validação.

As decisões abaixo preservam o recorte histórico de cada entrega. A 004 usa as mesmas três telas; seu acréscimo vigente está em [Pautas no Planejamento](#11-pautas-no-planejamento-004), com contrato canônico na pasta da feature.

Estado vigente da 005 em 08/10/2026: galeria/ampliação/fallback implementados e testados localmente no [PR #23](https://github.com/Browsher/crm-social/pull/23), com merge/exclusão da branch autorizados após gate/review aprovados no head final. [Evidências, entrega e integração](../../specs/005-previas-imagens/validacao.md). A manutenção de versões foi integrada pelo PR #22; os recortes anteriores abaixo permanecem históricos.

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
| Conteúdos | 006 | Não aparece |

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
- Esc fecha e devolve o foco. Sem prévia de imagem (feature 006).

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

## 6. Conteúdos (006)

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

**003 concluída (15/15; demonstração com registro fictício na fonte real):** consulta da aba opcional Meses (`mes`, `marca_id`, `objetivo`, `pautas`), preenchida à mão pelo autor. O card do mês exibido mostra objetivo definido na cor principal e até cinco pautas, restante **+N pautas** ou **+1 pauta** no singular; sem aba/linha/objetivo, **Ainda não definido** apagado; duplicata marca/mês, **A confirmar** apagado, sem escolher texto. Meses aparece na Planilha depois das seis tabelas e antes de Histórico, quando capturada, com avisos/teclado/rolagem existentes. Atualizar dados inclui a opcional somente se existir. Sem botão Plano do mês, escritor, campos extras, vínculo com semana ou fluxo de agentes/meta semanal no CRM. [Spec](../../specs/003-planejamento-mensal/spec.md), [plano](../../specs/003-planejamento-mensal/plan.md), [tarefas](../../specs/003-planejamento-mensal/tasks.md) e [validação](../../specs/003-planejamento-mensal/validacao.md). T002 (aba criada pelo autor) e T015 (demonstração pelo CRM com uma linha fictícia marcada como teste) concluídas. Essa orientação pertence ao fechamento da 003; a 004 foi autorizada em 07/10. A T021 da 002 foi demonstrada e integrada pelo [PR #16](https://github.com/Browsher/crm-social/pull/16); o pré-requisito da 003 foi atendido. O código da 003 foi integrado pelo PR #15. O fechamento documental exige gate/review vigentes sem bloqueio de segurança ou regressão. As regras das 001–002 abaixo continuam vigentes.

A [spec da 001](../../specs/001-consulta-local-producao/spec.md) é a especificação funcional canônica. Seu [plano](../../specs/001-consulta-local-producao/plan.md), [contrato](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) e [tarefas](../../specs/001-consulta-local-producao/tasks.md) traduzem estas decisões em requisitos verificáveis. O [roadmap](../../ROADMAP.md) define 002 Planilhas, 003 planejamento mensal, 004 Pautas, 005 revisões, 006 prévias/biblioteca e, fora do v1, Equipe/Workflow como v2 visual ilustrativo. A entrega local implementa US1–US5 e o iniciador; demonstração com captura real e onboarding final concluídos, com resultados e limites na validação.

- O cartão ou dia selecionado abre todas as peças NTV daquele dia, inclusive outros formatos que um filtro tenha escondido no calendário. O filtro serve para localizar; não recorta a gaveta. A gaveta de um dia vazio informa ausência e não cria peças. Sem data válida abre uma lista identificada; um cartão sem data no quadro leva ao conjunto sem data da semana.
- O selo usa a data civil de `completedAt` em America/Sao_Paulo. Sem captura válida, mostra **Sem dados**, com eventual falha no Histórico. Com captura válida e tentativa posterior falha, prevalece **Atualização falhou**; uma releitura HTTP bem-sucedida não apaga a falha da importação. Uma tentativa nova aceita encerra o aviso. A Planilha conserva fonte, instante e período completos.
- O autor aprovou `arte_aprovada` em **Visual** e manteve os oito valores do dicionário em **Mídia**, inclusive `montagem_pronta`, quando nenhuma prioridade superior vence. As listas atuais de liberação/prontidão e revisão em andamento são vazias: bloqueado não libera, aprovada/sem_rejeicao_documental não são revisão em andamento. Novos rótulos aprovados entram só pelo JSON versionado e reinício; configuração inválida gera erro claro.
- **Publicada** tem precedência com `publicado_em` preenchido; liberação vence revisão, revisão vence etapa e status nunca decide. Dado de publicação inconsistente conserva coluna com aviso, sem verificar publicação remota. Data prevista, status, aprovação ou arquivo sem o campo preenchido não comprovam publicação.
- **Outras · N valores novos** conta distintos originais dos cartões Outras na semana NTV selecionada, incluindo vazio uma vez (Não informada). Repetições, outra semana/marca e cartões vencidos por prioridade superior não somam. Original sempre visível; sem cartões, zero; singular para um.
- **Com quem está** é `Produções.responsavel_atual`, como registrado. **Quem corrige** vem da revisão vigente em `Revisoes.responsavel_correcao`, com versão e escopo separados. A 001 não infere **aguardando de**, agente trabalhando agora ou próxima ação. Falta de vínculo inequívoco aparece como aviso.
- As seis tabelas da Planilha preservam as 66 colunas mínimas do contrato; a 004 acrescenta Semanas.pauta_id somente quando capturado, incluindo identificadores e hashes registrados como texto de consulta **local**. Colunas adicionais e envelope da captura permanecem privados, sem exposição arbitrária por HTTP. Nenhuma captura, dado operacional ou credencial entra no Git, no mockup ou em fixtures.
- O Histórico reúne todas as tentativas completas e falhas confirmadas no estado local, com horários e motivos resumidos; não é uma lista calculada somente da última tentativa nem inclui arquivos órfãos de uma interrupção. Repetir a mesma captura aceita não duplica o registro de conclusão. Nunca renovar o horário da captura por clicar em **Atualizar dados**.
- Fontes de conferência: dicionário de cabeçalhos e domínios e inventário de agentes/workflows de 03/10/2026, lidos como referência. Eles não constituem captura nem monitoramento atual e não são copiados para ampliar a 001.

O [LEIA-ME do mockup](mockups/LEIA-ME.md) registra a sanitização e os limites da demonstração. O HTML conserva variantes visuais de features futuras e exemplos; os requisitos acima e as specs delimitam a implementação, inclusive menu, valores de etapa, abas exatas e histórico. A ausência de objetivo mensal pertence ao escopo original da 001; a 003 consulta Meses conforme seu contrato.

## 11. Pautas no Planejamento (004)

Como um índice do mês para a semana, a 004 aproxima objetivo e execução registrada sem criar um fluxo editorial. Implementada e testada localmente, com [spec](../../specs/004-pautas-planejamento/spec.md), [contrato](../../specs/004-pautas-planejamento/contracts/pautas.md) e [validação](../../specs/004-pautas-planejamento/validacao.md); [PR #20](https://github.com/Browsher/crm-social/pull/20) acompanha entrega e integração, com merge condicionado ao gate/review do head vigente; resultados por head na validação citada.

- **Card do mês:** conserva o objetivo de Meses; pautas estruturadas válidas aparecem em ordem semanal como `S1 · tema · modelo · status`, com selo **do autor** quando registrado. Sem Meses, objetivo **Ainda não definido**; mês sem pautas válidas preserva todo o card textual da 003, inclusive ausências/duplicatas e +N pautas.
- **Navegação:** cada pauta é um botão acionável por mouse/teclado. Foco e rolagem vão para sua segunda-feira no calendário ou destino semanal da lista, mesmo sem peças. Quando a semana não está capturada, o destino visual mostra **Pauta S1 de novembro · tema**, sem criar semana operacional ou origem inferida.
- **Origem:** calendário/lista e gaveta mostram **Pauta S2 de novembro** apenas para vínculo confirmado pelo backend por ID exato, marca e início. Na gaveta com peças, reúne origens das respectivas semanas; em dia vazio, reúne as origens já confirmadas das semanas capturadas cujo período abrange a data. Cada origem aparece uma vez.
- **Planilha:** Pautas opcional vem após Meses quando presente, antes de Histórico, com seus doze mínimos, contagem NTV, teclado e rolagem própria. Semanas.pauta_id aparece somente quando capturado. Linhas inválidas/duplicadas permanecem conferíveis, com avisos por linha física, sem destino inventado.
- **Apresentação:** modelo/origem/status desconhecidos continuam texto com aviso; status da pauta não confirma publicação. Claro/escuro e 1440/390 mantêm foco e contraste, sem corte horizontal da página. [20 imagens sintéticas](screenshots/LEIA-ME.md#004--pautas-no-planejamento) registram cinco cenários nos dois temas/larguras; não comprovam operação real.

## 12. Prévias de imagens — 005

Como uma folha de contato junto do texto, a gaveta mostra imagens das páginas/cenas vigentes na ordem, com versão da mídia e link permitido adjacente. Abrir a peça inicia somente suas imagens pelo servidor local; quadro/peças fechadas não buscam mídia e vídeos seguem somente por link. Em Pronta, a galeria fica junto do pacote/legenda/hashtags, fora da dobra recolhida de páginas/cenas. Imagens reaproveitadas preservam versões anteriores; não há extração ou conferência do ZIP.

A faixa tem rolagem lateral no celular. Miniaturas ficam inteiras e proporcionais em caixas 4:5 com contain; as fixtures da peça são PNG 1080×1350. Clique/Enter amplia a imagem num segundo dialog; **Fechar imagem** ou Escape fecha a ampliação e devolve foco à miniatura, preservando a gaveta. Escape seguinte pode fechar a gaveta. A imagem ampliada fica inteira e centralizada na área disponível em 390/1440, inclusive em viewport baixa; diálogo, imagem e Fechar cabem no viewport sem corte inferior ou rolagem da imagem.

Falha mostra **Prévia indisponível** somente na posição afetada, esconde o ícone quebrado e desabilita ampliação. Link Drive/Docs continua permitido por clique, Baixar pacote mantém sua allowlist exclusiva Drive, e texto/Pronta/contagem/Planilha permanecem. Nenhuma causa privada ou aviso editorial novo aparece.

O navegador solicita somente ID interno à origem local. Servidor resolve a captura vigente, confere PNG/JPEG/WEBP por bytes/tamanho/hash e usa cache privado ou Drive readonly. T002 confirmada pelo autor em 08/10/2026: pasta Produções compartilhada com a conta de serviço como Leitor, sem teste de acesso real pelo agente; testes sintéticos não demonstram acesso operacional. [Contrato005](../../specs/005-previas-imagens/contracts/midia.md), [interface](../modules/web.md#prévias-de-imagens--005) e [12 screenshots sintéticos atualizados da fonte 4521975](screenshots/LEIA-ME.md#005--prévias-de-imagens).
