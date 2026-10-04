# Modelo de consulta local

Como um índice de fotografias, o modelo conserva identidades e relações: T001–T026/US1, US2 e US3 implementadas, com revisão corrente e evidências na [validação](validacao.md). O modelo completo ainda é a meta; interfaces atuais na [arquitetura](../../docs/architecture.md), sem captura operacional validada ou leitura Google.

[Spec](spec.md) e [contrato](contracts/captura-e-consulta.md) são as fontes dos requisitos e interfaces. Nenhuma entidade de apresentação cria coluna ou estado remoto.

## Captura e identidade

Envelope privado versionado com fonte, marca, início/fim, matrizes completas e
metadados de duas observações. Preservar células e posição física para auditoria
privada; a linha não substitui identidade. Mapear pelos 66 nomes mínimos exatos:
Semanas 8, Produções 17, Páginas 8, Cenas 11, Arquivos 12, Revisoes 10.
Extras permanecem só na captura privada, sem exposição automática na consulta.

Aba mínima ausente/incompleta, hash divergente, cabeçalho não vazio duplicado,
ID duplicado ou linha preenchida sem chave invalida a tentativa. Aba com cabeçalhos
válidos e sem linhas é conjunto vazio válido. Falha mantém captura anterior.

Na promoção sob trava, uma candidata estruturalmente válida admite `completedAt`
até 10 minutos no futuro em relação ao relógio local, inclusive o limite. Mais
que isso confirma tentativa `falhou` por captura inválida. Havendo vigente, ID
novo com fim igual ou anterior ao dela confirma tentativa `falhou` por captura
desatualizada. Ambas conservam a vigente e registram motivo fixo antes de gravar a
candidata. Conflito de ID e no-op já confirmado precedem a política temporal;
GET, releitura e reinício validam estrutura sem reaplicar essas comparações.

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

`projetarVisao(estadoLocal, nowIso, mapaQuadro)` recebe o resultado de `lerEstado`: captura
vigente, recibos confirmados em `historicoIds` e ponteiro de estado. `nowIso` é relógio explícito
para testar o selo; não renova a captura.

`mapaQuadro` vem do carregamento validado de `config/quadro-etapas.json` pelo
servidor. É configuração versionada, não entidade operacional nem parte da captura.
Seu schema e conteúdo inicial estão no [contrato](contracts/captura-e-consulta.md).

| Projeção | Conteúdo |
| --- | --- |
| `semanas` | agrupamento NTV, tema, início/fim civil e objetivo semanal registrado |
| `producoes` | resumos e detalhes com facetas separadas, unidades por versão, quatro grupos de revisões, arquivos/documentos e avisos localizados |
| `dias` | peças por data civil válida; grupos Sem data por semana e sem semana |
| `quadro` | semana, oito colunas fixas, IDs por classificação prioritária; Outras tem quantidadeValoresNovos e título derivados de seus rótulos distintos |
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
  filtro/mês; oculto quando zero, lista delas agrupada por semana. No quadro, peça abre Sem data da sua semana.
- Período coberto é mínimo início semanal válido até máximo fim civil semanal;
  sem datas semanais válidas, limites null e aviso. Semana cruzando mês mantém identidade.
- `Semanas.objetivo` é semanal. Objetivo mensal mostra "Ainda não definido" na 001,
  sem agregar textos semanais ou preencher mês fictício.

## Quadro: registro e classificação separados

Colunas fixas: Planejamento, Redação, Visual, Mídia, Revisão, Pronta, Publicada,
Outras. Valor original de `etapa_producao` sempre preservado. Primeira condição
satisfeita: `publicado_em` preenchido → Publicada; liberação configurada como pronta
→ Pronta; revisão configurada como em andamento → Revisão; senão etapa configurada;
sem mapeamento → Outras. `status` permanece informação no cartão, sem decidir coluna.

| Etapa registrada | Coluna |
| --- | --- |
| `arte_aprovada` | Visual |
| `prompts_imagem_prontos` | Mídia |
| `imagens_em_producao` | Mídia |
| `voz_pronta_para_gerar` | Mídia |
| `voz_em_producao` | Mídia |
| `clipes_prontos_para_gerar` | Mídia |
| `clipes_em_producao` | Mídia |
| `montagem_pronta` | Mídia |
| `montagem_em_producao` | Mídia |
| Todo outro valor ou vazio | Outras |

O JSON inicial contém nove etapas (uma Visual e oito Mídia), com listas de
liberação/prontidão e revisão em andamento vazias; `bloqueado`, `aprovada` e
`sem_rejeicao_documental` não ativam essas prioridades. Atualizações de rótulos
exigem só edição do JSON versionado e reinício, sem mudança de código. O servidor
valida schema/listas/rótulos e colunas ao carregar: rótulo repetido no mesmo campo
ou coluna inexistente é erro claro, sem iniciar com mapa parcial ou fallback silencioso.
Publicada/Outras são destinos reservados à publicação/fallback, sem entrada direta de etapa.

Etapas do envelope de delegação não são aliases de célula. Original vazio é apresentado
como Não informada, sem inventar estado. Quadro não muda/arrasta etapa. O contador de
Outras conta distintos originais somente de seus cartões NTV na semana selecionada;
null/célula omitida/string vazia/somente espaços usam uma chave única de vazio só
para contagem, preservando originais na apresentação. Repetições não somam;
valores de outra semana/marca e etapas
desconhecidas vencidas por prioridade superior não entram. Título: Outras · N valores
novos (1 valor novo no singular); sem cartões, zero. Cada cartão conserva o rótulo original.

Publicação exige `publicado_em` preenchido, conforme definição do contrato. Data sem
fuso, inválida ou posterior a `completedAt` gera aviso de qualidade do registro, sem
alterar a coluna Publicada; ela não comprova publicação remota. Status, aprovação,
liberação, previsão ou arquivo sem o campo preenchido não a substituem.

Responsável principal é `responsavel_atual` como registrado, vazio A confirmar;
correção é `responsavel_correcao` na revisão vigente, exibida separadamente. Não
inferir responsável, aguarda-de, próxima ação, agente trabalhando ou elegibilidade.

## Versões, revisão e materiais no detalhe

- Ponteiros de Semanas resolvem por `arquivo_id`. Editor/Motion precisam de produção,
  papel, versão e origens compatíveis; empate/ausência de vínculo gera aviso, sem vigente arbitrário.
- Páginas/cenas são ordenadas dentro da versão pertinente; não misturar versões para
  completar sequência. Design novo: A confirmar quando não há classificação explícita
  da página/versão; arquivo/template/estado presente não é prova. Não existe flag nos mínimos.
- Na projeção implementada, `detalhes.paginas`/`cenas` conservam todas as versões:
  ordenação por versão/índice positivos e ID, com inválidos preservados ao final e aviso.
  `vigente` exige versão positiva igual à da produção; a UI exibe essa versão primeiro
  e as demais recolhidas, com impacto atual a confirmar.
- Revisão mostra decisão, tratamento, versão/unidade e motivo separados. Resolvido/resolvida
  é histórico cinza; desconhecido não é encerrado. Revisão antiga aberta não reprova
  automaticamente a versão nova; sem vínculo, impacto a confirmar.
- `detalhes.revisoes` separa `vigentes`, `resolvidas`, `anteriores` e `ambiguas`.
  Resolução explícita precede a classificação por versão; revisão sem versão/vínculo
  inequívoco é ambígua, outra versão válida é anterior e a versão atual é vigente.
  Tratamento desconhecido conserva a revisão vigente com aviso, sem fabricar encerramento.
  IDs originais de página/cena/arquivo são exibidos no detalhe; vazio é Não informado,
  sem descrição ou vínculo inventado. Avisos mostram aba/linha física/campo e motivo.
- Arquivo é registro, não bytes conferidos/validado/agendamento. Nome de apresentação
  vem de tipo/papel, fallback Arquivo registrado; não promete nome original ausente nos mínimos.
  Sem mídia = ausente; referência quebrada = aviso, sem substituta ou miniatura.
- URL selecionada interativa só HTTPS Drive/Docs exatos, sem userinfo e somente por clique;
  tabela guarda URL como texto. Nenhum download ou busca remota por renderização.

Ponteiro de unidade exige arquivo da mesma produção/versão; página/cena preenchida
no arquivo também precisa corresponder. Ausência, referência quebrada e escopo
incompatível produzem aviso, sem substituta. Empates por papel/versão/página/cena e
origens JSON inválidas mantêm os registros, sem selecionar vigente automático.
Avisos públicos trazem aba, linha física e campo quando disponíveis; o vínculo de
origem é mantido internamente por ID/WeakMap, sem enviar matriz bruta ou mapas privados.

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
| Nova candidata mais de 10 minutos no futuro em relação ao relógio local | anterior preservada | falhou por captura inválida; motivo no recibo, candidata não gravada |
| Novo ID com fim igual ou anterior ao da vigente | anterior preservada | falhou por captura desatualizada; motivo no recibo, candidata não gravada |
| Novo ID/fim estritamente posterior ao vigente e até 10 minutos no futuro, mesmas células, completa promovida | nova observação | encerra falha ativa, preservando todos os recibos |

Precedência: sem captura → cinza; captura + falha ativa posterior → vermelho;
captura sem falha + data civil hoje em São Paulo → verde HH:MM; outro dia → âmbar DD/MM.
Data usa `completedAt`, nunca máximos das linhas ou instante da requisição.
Essas transições são de consulta/persistência local; não alteram fila operacional.
