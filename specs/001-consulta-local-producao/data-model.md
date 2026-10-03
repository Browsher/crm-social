# Modelo de consulta local

03/10/2026 — modelo planejado da feature 001, aplicativo não implementado.
[Spec](spec.md) e [contrato](contracts/captura-e-consulta.md) são as fontes dos requisitos
e interfaces. Nenhuma entidade de apresentação cria coluna ou estado remoto.

## Captura e identidade

Envelope privado versionado com fonte, marca, início/fim, matrizes completas e
metadados de duas observações. Preservar células e posição física para auditoria
privada; a linha não substitui identidade. Mapear pelos 66 nomes mínimos exatos:
Semanas 8, Produções 17, Páginas 8, Cenas 11, Arquivos 12, Revisoes 10.
Extras permanecem só na captura privada, sem exposição automática na consulta.

Aba mínima ausente/incompleta, hash divergente, cabeçalho não vazio duplicado,
ID duplicado ou linha preenchida sem chave invalida a tentativa. Aba com cabeçalhos
válidos e sem linhas é conjunto vazio válido. Falha mantém captura anterior.

## Entidades privadas e projeções

| Entidade | Identidade | Conteúdo / relações |
| --- | --- | --- |
| Captura | `capturaId` | fonte privada, tempos, metadados, hashes e seis matrizes |
| Tentativa | `tentativaId` | recibo imutável `completa`/`falhou`, instante, captura identificada quando possível e motivo resumido |
| Semana | `semana_id` | marca, `inicio_semana`, tema, objetivo semanal, ponteiros internos de plano/redação/visual |
| Produção | `producao_id` | marca/semana, slot, tipo, data, título/legenda, versão e facetas registradas |
| Página | `pagina_id` | produção, versão, índice, função, título/corpo, ponteiro interno de imagem |
| Cena | `cena_id` | produção, versão, índice, fala/texto em tela, janela e ponteiros de imagem/clipe |
| Arquivo | `arquivo_id` | relações com semana/produção/unidade, tipo/papel, versão, ID Drive, URL, origens e hash registrados |
| Revisão | `revisao_id` | produção/unidade/arquivo, versão avaliada, decisão, motivo, correção e tratamento |

IDs internos não são IDs Drive; nem versão de uma entidade é contador universal
de todas as demais. Versão/índice preenchidos devem ser inteiros positivos;
início/duração números finitos não negativos. Inválidos geram aviso localizado,
vazio permanece desconhecido, nunca zero. JSON inválido gera aviso e fica preservado
como célula na captura; não é executado.

## Recortes de consulta

`projetarVisao(estadoLocal, nowIso)` recebe o resultado de `lerEstado`: captura
vigente, recibos confirmados em `historicoIds` e ponteiro de estado. `nowIso` é relógio explícito
para testar o selo; não renova a captura.

| Projeção | Conteúdo |
| --- | --- |
| `semanas` | agrupamento NTV, tema, início/fim civil e objetivo semanal registrado |
| `producoes` | resumos e detalhe selecionado com facetas separadas, unidades e avisos |
| `dias` | peças por data civil válida; grupos Sem data por semana e sem semana |
| `quadro` | semana, oito colunas fixas, IDs de peças por classificação literal |
| `planilha` | seis abas com nomes, 66 cabeçalhos/valores mínimos e contagem de linhas NTV apresentadas |
| `historico` | todas as tentativas confirmadas no estado, recentes primeiro, resultado/instante/motivo resumidos; arquivos preparados/órfãos excluídos |
| `selo` | texto/cor/destino Planilha derivados de captura e falha ativa |

Outra marca é excluída. Unidade pertence à NTV pela produção; arquivo pode pertencer
pela produção ou pela semana. Relação órfã de peça NTV gera aviso, não desaparecimento.
Sem semana inequívoca, manter peça num grupo Semana não identificada. Contagem das
abas é de linhas apresentadas, não de células/linhas alocadas na origem.

Todos os 66 campos mínimos e valores fazem parte da **Planilha local** como registros,
inclusive IDs, hashes e origens JSON. Isso não autoriza servir captura/envelope bruto,
extras arbitrários, tokens, credenciais ou paths; célula mínima com segredo/caminho
indevido recebe supressão localizada e aviso, original somente na captura privada.
Fixtures e mockups compartilháveis são sintéticos. HTTP e interface renderizam
textos/JSON como dados, sem instruções, HTML executável ou navegação arbitrária.

## Formato, dia e objetivo

- Slot confirmado `imagem_a`/`imagem_b` define Imagem, `carrossel` define Carrossel,
  `reels` define Reels. `tipo_producao` permanece faceta original. Desconhecido é Outro,
  incluído no filtro Todos. Não copiar o filtro `institucional` do executor.
- Data prevista é `YYYY-MM-DD` civil válida. Sem data, serial sem regra e inválida
  vão para Sem data com original/aviso. UTC não pode mover a data editorial.
- Dia reúne **todas** as peças NTV naquela data; filtro do resumo não recorta a gaveta.
  Ordem ordinal por `producao_id` estabiliza primeiro cartão e primeiro acordeão.
- Link "N sem data" é total global das peças NTV sem data válida, independente de
  filtro/mês; lista delas agrupada por semana. No quadro, peça abre Sem data da sua semana.
- Período coberto é mínimo início semanal válido até máximo fim civil semanal;
  sem datas semanais válidas, limites null e aviso. Semana cruzando mês mantém identidade.
- `Semanas.objetivo` é semanal. Objetivo mensal mostra "Ainda não definido" na 001,
  sem agregar textos semanais ou preencher mês fictício.

## Quadro: registro e classificação separados

Colunas fixas: Planejamento, Redação, Visual, Mídia, Revisão, Pronta, Publicada,
Outras. Valor original de `etapa_producao` sempre preservado. Publicação coerente
tem precedência; nos demais casos classificar somente estes valores literais:

| Etapa registrada | Coluna |
| --- | --- |
| `prompts_imagem_prontos` | Mídia |
| `imagens_em_producao` | Mídia |
| `voz_pronta_para_gerar` | Mídia |
| `voz_em_producao` | Mídia |
| `clipes_prontos_para_gerar` | Mídia |
| `clipes_em_producao` | Mídia |
| `montagem_pronta` | Mídia |
| `montagem_em_producao` | Mídia |
| Todo outro valor ou vazio | Outras |

Etapas do envelope de delegação não são aliases de célula. `arte_aprovada` permanece
Outras; colunas editoriais sem valor confirmado podem ficar vazias. Original vazio
é apresentado como Não informada, sem inventar estado. Quadro não muda/arrasta etapa.

Publicação exige `publicado_em` explícito ISO completo com `Z`/offset, instante real
válido e não posterior a `completedAt`. Status, aprovação, liberação, previsão ou
arquivo não a substituem. Divergência de status e publicação válida gera aviso;
sem timestamp coerente, publicação não comprovada e classificação pela etapa.

Responsável principal é `responsavel_atual` como registrado, vazio A confirmar;
correção é `responsavel_correcao` na revisão vigente, exibida separadamente. Não
inferir responsável, aguarda-de, próxima ação, agente trabalhando ou elegibilidade.

## Versões, revisão e materiais no detalhe

- Ponteiros de Semanas resolvem por `arquivo_id`. Editor/Motion precisam de produção,
  papel, versão e origens compatíveis; empate/ausência de vínculo gera aviso, sem vigente arbitrário.
- Páginas/cenas são ordenadas dentro da versão pertinente; não misturar versões para
  completar sequência. Design novo: A confirmar quando não há classificação explícita
  da página/versão; arquivo/template/estado presente não é prova. Não existe flag nos mínimos.
- Revisão mostra decisão, tratamento, versão/unidade e motivo separados. Resolvido/resolvida
  é histórico cinza; desconhecido não é encerrado. Revisão antiga aberta não reprova
  automaticamente a versão nova; sem vínculo, impacto a confirmar.
- Arquivo é registro, não bytes conferidos/validado/agendamento. Nome de apresentação
  vem de tipo/papel, fallback Arquivo registrado; não promete nome original ausente nos mínimos.
  Sem mídia = ausente; referência quebrada = aviso, sem substituta ou miniatura.
- URL selecionada interativa só HTTPS Drive/Docs exatos, sem userinfo e somente por clique;
  tabela guarda URL como texto. Nenhum download ou busca remota por renderização.

## Estado local e transições

`atual.json` contém `{capturaId, ultimaTentativaId, historicoIds}`. Capturas e recibos
imutáveis são preparados antes da substituição atômica desse estado no mesmo diretório.
Somente IDs confirmados em `historicoIds` integram o Histórico e comprovam aceitação;
`ultimaTentativaId` é o último desses IDs ou null com lista vazia. Arquivos órfãos de
interrupção não são tentativas concluídas nem motivo para no-op. Repetição dos seus
mesmos bytes revalida, prepara outro recibo e pode promover sem sobrescrever arquivos.
`ultima-tentativa.json` é resumo derivado, não segunda autoridade. Captura null admite
histórico de falhas. Se uma falha não pode ser persistida, informar erro de persistência
e preservar o estado anterior, sem fingir durabilidade do registro.

| Evento | Captura vigente | Histórico / selo |
| --- | --- | --- |
| Primeira tentativa completa promovida | nova captura | completa persistida; hoje verde ou outro dia âmbar |
| Nova tentativa falhou | anterior preservada | falhou persistida; vermelho se há válida, cinza se não há |
| GET/Atualizar dados/reinício | mesma captura | lê histórico; não apaga erro nem renova fim de captura |
| Mesmo capturaId e mesmos bytes, com aceitação anterior confirmada | sem alteração | sem duplicação/novo frescor nem retorno a captura antiga; falha posterior não é encerrada |
| Interrupção antes de confirmar o estado | anterior preservada | arquivos preparados excluídos do Histórico; mesmos bytes podem ser revalidados e promovidos numa nova tentativa |
| Mesmo capturaId e bytes diferentes | anterior preservada | conflito/falhou |
| Novo ID/fim novo, mesmas células, completa promovida | nova observação | encerra falha ativa, preservando todos os recibos |

Precedência: sem captura → cinza; captura + falha ativa posterior → vermelho;
captura sem falha + data civil hoje em São Paulo → verde HH:MM; outro dia → âmbar DD/MM.
Data usa `completedAt`, nunca máximos das linhas ou instante da requisição.
Essas transições são de consulta/persistência local; não alteram fila operacional.
