# Modelo de consulta local

Como um índice de fotografias, o modelo conserva identidades e relações: 001 implementada, testada e demonstrada com captura real: T001–T041 concluídas (41 de 41 tarefas). Próximo passo: 002 — Planilhas; resultados e limitações na [validação](validacao.md). Interfaces atuais na [arquitetura](../../docs/architecture.md). A tipagem da captura demonstrada deixa vínculos/vigência a confirmar; decisão na validação já vinculada.

[Spec](spec.md) e [contrato](contracts/captura-e-consulta.md) são as fontes dos requisitos e interfaces. Nenhuma entidade de apresentação cria coluna ou estado remoto.

**Manutenção de 08/10/2026:** a introdução preserva o fechamento histórico da 001. As regras atuais de unidades abaixo foram corrigidas sem nova feature/Spec Kit, com implementação/testes locais e integração condicionada ao gate/review do head final. [Fonte e limites](../../docs/reports/versoes-unidades-validacao.md).

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

O módulo compartilhado triagem seleciona NTV/66 mínimos e valida identidades da
candidata após `validarCaptura`, antes de no-op, gravação ou promoção. Campo NTV
terminado em `_id` alterável pela redação recusa a candidata; falha confirmável
preserva a captura vigente e registra aba/linha física/campo sem o valor. Na consulta,
bytes antigos/corrompidos continuam recusando a projeção inteira, sem criar chave de
supressão compartilhada; HTTP responde 503 genérico e não escreve. Versão de produção
vazia gera aviso de vigente não informada; vazia ou inválida não sustenta pendência
categórica de mídia vigente ausente.

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
| `producoes[].detalhes.pacotePublicacao` | arquivo único da produção exata, tipo `pacote`, extensão `zip` e versão igual a `pacote_versao` positiva segura; null em ausência, ambiguidade ou versão inválida |
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
Nos campos dedicados `Arquivos.url` e `Produções.url_video_final`, após a redação
de texto, `new URL` detecta usuário ou senha nos valores ainda inalterados:
o campo projetado vira **[conteúdo suprimido]**, com origem e motivo fixo sem o valor.
O JSON HTTP não transporta a credencial; URL recusada pela UI também não é ecoada
como texto bruto. Não confundir essa seleção segura com alteração da captura privada.
String não vazia recusada pelo construtor também recebe o marcador e o motivo fixo
**URL inválida suprimida**, sem exceção bruta nem valor; userinfo malformado não
retorna ao HTTP. Vazio/somente espaços permanece sem aviso de URL inválida.
Fixtures e mockups compartilháveis são sintéticos. HTTP e interface renderizam
textos/JSON como dados, sem instruções, HTML executável ou navegação arbitrária.

Por decisão do autor, em texto livre mínimo e nos quatro campos do recibo público,
a redação divide o texto preservando espaços em branco: só pedaço iniciado em
HTTP(S), com aspas/parênteses de contorno e pontuação final desconsiderados, é
analisado por `new URL`. Somente o pedaço com usuário/senha vira marcador, mantendo
o restante da frase, espaços e pontuação, também se já redigido em campo de URL.
URL legítima seguida de `@`/e-mail e `//` solto permanecem exatos. Não promete
detectar outros esquemas, URL relativa, espaços em userinfo ou forma fora desse
pedaço; os campos de URL dedicados mantêm seu guarda. Segredo/caminho conhecido
continua suprimindo o texto reconhecido inteiro. Célula alterada tem aviso fixo
localizado; original e recibos privados permanecem intactos.

JSON válido é dado, nunca código ou expansão de campos HTTP. Strings decodificadas
são redigidas; somente tokens alterados são reserializados, incluindo chaves.
Demais bytes, números, ordem, espaços e escapes legítimos não alterados permanecem.
A validade original de origens_json fica como booleano em WeakMap privado, antes
da supressão: o marcador não cria falso aviso de JSON inválido quando o original
era válido, e JSON originalmente inválido continua identificado.

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

O JSON inicial da 001 continha nove etapas (uma Visual e oito Mídia), com listas de
liberação/prontidão e revisão em andamento vazias; `bloqueado`, `aprovada` e
`sem_rejeicao_documental` não ativam essas prioridades. Atualizações de rótulos
exigem só edição do JSON versionado e reinício, sem mudança de código. O servidor
valida schema/listas/rótulos e colunas ao carregar: rótulo repetido no mesmo campo
ou coluna inexistente é erro claro, sem iniciar com mapa parcial ou fallback silencioso.
Publicada/Outras são destinos reservados à publicação/fallback, sem entrada direta de etapa.

**Nota da manutenção de 08/10/2026:** as duas listas vazias acima descrevem o JSON inicial da 001. O mapa atual mantém nove etapas, contém somente `liberado` em `liberacaoPronta` e mantém `revisaoEmAndamento` vazia; publicação preenchida continua tendo precedência. Pacote, gaveta e fronteiras estão em [Pronta para publicar — manutenção de 08/10/2026](contracts/captura-e-consulta.md#pronta-para-publicar--manutenção-de-08102026).

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

## Quadro implementado na API

`quadro.colunas:[{nome}]` mantém a ordem contratual; `quadro.semanas:[{semanaId,colunas:[{nome,titulo,ids,quantidadeValoresNovos}]}]` contém oito colunas e IDs ordinais por semana, inclusive semanaId null das peças sem vínculo inequívoco. Sem captura, semanas vazias com nomes canônicos mantidos. Cada produção acrescenta `quadro:{coluna,pendencias}`.

Pendência de revisão vem de decisão vigente literal revisar/refazer/reprovado/rejeitado, com tipo/texto/revisaoId/decisao/versao/responsavelCorrecao. Mídia ausente conserva tipo/texto e unidade/unidadeId quando pertinente. Aprovação/desconhecido/versão anterior não criam correção inferida; arquivo registrado na versão atual com URL vazia/recusada não vira mídia ausente. UI resume primeira/+N, API conserva todas. Etapa null é recuperada antes da triagem e preservada no JSON; chave de vazio somente no contador Outras. Tratamento desconhecido permanece dívida da revisão final.

## Versões, revisão e materiais no detalhe

- Ponteiros de Semanas resolvem por `arquivo_id`. Editor/Motion precisam de produção,
  papel, versão e origens compatíveis; empate/ausência de vínculo gera aviso, sem vigente arbitrário.
- Páginas/cenas são ordenadas dentro da versão pertinente; a vigência é calculada por
  índice, permitindo versões atuais diferentes entre índices. Design novo: A confirmar quando não há classificação explícita
  da página/versão; arquivo/template/estado presente não é prova. Não existe flag nos mínimos.
- Na projeção implementada, `detalhes.paginas`/`cenas` conservam todas as versões:
  ordenação por versão/índice positivos e ID, com inválidos preservados ao final e aviso.
  `vigente` exige índice/versão inteiros positivos e a maior versão registrada por
  produção/índice/tipo de unidade, sem comparar com `Produções.versao`. Cada ID é exclusivo
  por registro; seu formato não identifica a sequência lógica. Empates preservam todos
  os registros vigentes e inválidos não são vigentes. A UI agrupa por vigência/versão,
  atuais primeiro e históricos recolhidos, inclusive com o mesmo número de versão.
  Sem flag de retirada de índice, seu maior registro ainda capturado continua vigente,
  mesmo que só exista numa versão anterior à dos demais índices.
- Revisão mostra decisão, tratamento, versão/unidade e motivo separados. Resolvido/resolvida
  é histórico cinza; desconhecido não é encerrado. Revisão antiga aberta não reprova
  automaticamente a versão nova; sem vínculo, impacto a confirmar.
- `detalhes.revisoes` separa `vigentes`, `resolvidas`, `anteriores` e `ambiguas`.
  Resolução explícita precede a classificação por versão; revisão sem versão/vínculo
  inequívoco é ambígua, outra versão válida é anterior e a versão atual é vigente.
  Tratamento desconhecido conserva a revisão vigente com aviso, sem fabricar encerramento.
  Essa classificação continua usando a versão da produção: produção v8/página vigente v3
  mantém revisão v3 em anteriores e revisão v8 dessa página em ambíguas, ambas nos
  detalhes/Histórico, sem pendência vigente de revisão no quadro.
  IDs originais de revisão/página/cena/arquivo e campos de escopo permanecem na API,
  sem IDs/rótulos técnicos na linha visual nem vínculo inventado. A API conserva avisos com aba/linha física/campo
  e motivo; a gaveta apresenta só quantidade e link para Planilha.
- Arquivo é registro, não bytes conferidos/validado/agendamento. Nome de apresentação
  vem de tipo/papel, fallback Arquivo registrado; não promete nome original ausente nos mínimos.
  Sem mídia = ausente; referência quebrada = aviso, sem substituta ou miniatura.
- URL selecionada interativa só HTTPS Drive/Docs exatos, sem userinfo e somente por clique;
  URL recusada nunca aparece como texto bruto na tela. Nenhum download ou busca remota por renderização.

A gaveta compacta não elimina dados: faixa de quatro campos preenchidos, publicação
em uma linha quando registrada, revisão vigente com decisão/versão/motivo e
correção/tratamento abaixo; adicionais em +N revisão aberta/revisões abertas. Texto
registrado, versões anteriores e Histórico ficam recolhidos por clique; páginas/cenas
em linhas compactas têm no máximo um aviso de ausência por linha. Campo vazio na
faixa é omitido, preservando o original/fallback de responsável na API e a regra
separada do cartão de Produção. Etapa conhecida usa rótulo legível só na UI;
desconhecida mantém o original. Detalhes técnicos dos avisos continuam na projeção,
com painel detalhado de Planilha implementado na US5, filtrável pelos avisos da peça.

Resumo da peça diferencia **revisão aberta** (há vigente), **revisão a confirmar**
(sem vigente, há ambígua ou anterior não resolvida) e **sem revisão** (nenhuma ou
somente resolvidas). Página/cena/aviso têm singular/plural corretos; a quantidade
considera somente unidades vigentes, sem inferir pela versão ilustrativa do mockup.

`documentosSemana` sempre contém Plano/Redação/Visual, com arquivo null na ausência,
inclusive peça sem semana identificada. A UI agrupa esses documentos uma vez por
semana representada no fim do dia, usando **—**. A resolução é reaproveitada somente
na mesma consulta: aviso semanal entra uma vez no conjunto global e permanece nos
avisos locais de cada peça afetada, sem mudar as relações ou a captura original.

Ponteiro explícito de unidade exige arquivo da mesma produção; página/cena preenchida
no arquivo também precisa corresponder, enquanto unidade vazia é aceita. A versão da
mídia pode diferir da versão do texto e a página mostra **imagem vN** do arquivo ligado
com versão inteira positiva; vazia/inválida mostra **imagem: versão a confirmar**.
Versão inválida do arquivo conserva aviso numérico independente sem desfazer esse
vínculo. Ausência, referência quebrada e escopo incompatível produzem aviso, sem
substituta. Empates por papel/versão/página/cena e origens JSON inválidas mantêm os
registros, sem selecionar arquivo vigente automático.
Avisos públicos trazem aba, linha física e campo quando disponíveis; o vínculo de
origem é mantido internamente por ID/WeakMap, sem enviar matriz bruta ou mapas privados.

Cena mantém `arquivos` com três posições imagem inicial/imagem final/vídeo, ligadas
ou null, e `avisoMidia` null quando todas ligadas. Ausências geram texto fixo:
**imagens ausentes**, **imagem inicial ausente** ou **imagem final ausente**, mais
**vídeo ausente** quando aplicável, unidos por ponto e vírgula. Um único aviso
técnico de mídia por cena reúne causas distintas no primeiro ponteiro falho;
índice, tempo e versão inválidos conservam avisos independentes. Na revisão não
resolvida, o aviso aponta ao primeiro pagina_id/cena_id/arquivo_id falho; versao
é usado quando a versão da revisão/produção é inválida. Escopos completos permanecem
na API, sem exposição técnica na linha visual.

Faltas reais de mídia das unidades vigentes com índice/versão válidos geram pendências
independentemente da validade de `Produções.versao`. Sem unidades vigentes, o fallback
que procura arquivo na versão da produção exige essa versão inteira positiva; sem
ela, não afirma ausência categórica. Revisões e seleção de pacote conservam regras
próprias. [Contrato de versões das unidades](contracts/captura-e-consulta.md#versões-das-unidades--manutenção-de-08102026).

## Tabelas e avisos da Planilha

**Extensão da manutenção de 08/10/2026:** a tabela abaixo preserva a descrição dos 66 mínimos da 001. A consulta atual usa `camposCapturados` e acrescenta `Semanas.pauta_id`, `Produções.pacote_versao`/`hashtags` e `Arquivos.extensao` somente quando seus cabeçalhos existem, inclusive em capturas antigas. Selecionar os valores triados não regrava o envelope nem altera bytes, hashes ou tipos históricos; demais extras continuam privados. [Contrato da manutenção](contracts/captura-e-consulta.md#pronta-para-publicar--manutenção-de-08102026).

Como folhas de consulta do mesmo álbum, `planilha` mantém as seis tabelas NTV
inteiras; o filtro do atalho da gaveta recorta somente avisos.

| Campo / estado | Forma e regra implementada |
| --- | --- |
| Aba | `{nome,cabecalhos,quantidadeLinhas,linhas}`, na ordem dos seis mínimos |
| Cabeçalhos | Cópia literal da lista daquela aba em `CAMPOS`, 66 campos no total |
| Linhas | Objetos novos com somente chaves mínimas e valores triados; sem `quadro`, `detalhes`, envelope ou extras |
| Contagem | Linhas NTV selecionadas; não é a quantidade alocada na planilha |
| Normalização | null→string vazia preexistente, exceto `etapa_producao` null recuperada; original só no envelope privado |
| Avisos gerais / da peça | Coleção global ou `detalhes.avisos`, com Aba/Linha/Campo/Motivo e — quando não há localização |
| Histórico | Recibos públicos confirmados, recentes primeiro; não recebe órfãos, recibo novo por no-op ou coleta por GET |
| Estado da interface | `semanaId` declarada, `abaPlanilha` e `avisosProducaoId`; releitura conserva aba disponível, sem mutar a API |

Sem captura, a projeção mantém `planilha=[]` e Histórico confirmado; a interface
apresenta somente Histórico e orientação à Central. Setas, Home e End alternam abas
com foco e cada tabela tem rolagem própria. O link da gaveta fecha o dia, abre
Produções e dá foco ao painel da peça; menu/selo/Todos os avisos restauram os avisos
gerais, com as seis tabelas sempre NTV completas. O painel fica oculto em Histórico.

Na célula dedicada `url`/`url_video_final`, recusa pela allowlist visual mostra
**link não permitido**, mantendo **[conteúdo suprimido]** quando já é o marcador
exato. A API conserva o valor triado permitido pelo contrato, sem aplicar essa
recusa de apresentação. Texto livre legítimo conserva suas URLs como texto;
nenhuma célula cria navegação ou carregamento automático.

## Estado local e transições

Cada recibo confirmado é validado na leitura: objeto, tentativaId correspondente,
capturaId seguro ou null, concluidaEm ISO de data real com fuso, resultado conhecido
e motivoResumo string. Completa exige capturaId não nulo. Recibo inválido/ilegível
recusa o estado e produz 503 genérico sem reparar ou alterar arquivos privados.

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
| Mesmo capturaId e mesmos bytes, com aceitação anterior confirmada e estrutura/identidades NTV válidas | sem alteração | sem duplicação/novo frescor nem retorno a captura antiga; falha posterior não é encerrada |
| Interrupção antes de confirmar o estado | anterior preservada | arquivos preparados excluídos do Histórico; mesmos bytes podem ser revalidados e promovidos numa nova tentativa |
| Mesmo capturaId e bytes diferentes | anterior preservada | conflito/falhou |
| Nova candidata mais de 10 minutos no futuro em relação ao relógio local | anterior preservada | falhou por captura inválida; motivo no recibo, candidata não gravada |
| Novo ID com fim igual ou anterior ao da vigente | anterior preservada | falhou por captura desatualizada; motivo no recibo, candidata não gravada |
| Novo ID/fim estritamente posterior ao vigente e até 10 minutos no futuro, mesmas células, completa promovida | nova observação | encerra falha ativa, preservando todos os recibos |

Precedência: sem captura → cinza; captura + falha ativa posterior → vermelho;
captura sem falha + data civil hoje em São Paulo → verde HH:MM; outro dia → âmbar DD/MM.
Data usa `completedAt`, nunca máximos das linhas ou instante da requisição.
Essas transições são de consulta/persistência local; não alteram fila operacional.
