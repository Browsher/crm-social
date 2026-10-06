# Projeção de Planejamento, detalhe do dia, Produção e Planilha

Como o índice de um álbum que separa só as fotografias da NTV, a projeção seleciona registros permitidos e os reúne por semana/data. Ela não transforma registros em aprovação, atividade de agente ou mídia conferida.

Projeção, detalhes, quadro, seis tabelas, Meses opcional e regressões de identidade/versão implementados e verificados localmente; evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Fonte: [src/projecao.cjs](../../src/projecao.cjs). Demonstração privada e onboarding final concluídos; limites na validação.

Funções de entrada e fronteira: `reciboPublico` e `projetarVisao`; `redigirTexto` e `selecionarNtv` vêm do módulo compartilhado [triagem](triagem.md). Organização: `planejar`, `agruparDias`, `aplicarFrescor` e `montarPlanilha`. Detalhes e quadro: `detalhar`, `unidades`, `revisoes`, `documentosSemana`, `pendenciasMidia`, `colunaProducao` e `montarQuadro`. Usar os nomes da função na fonte, sem depender de linhas que mudam entre entregas.

## Interface, seleção e dados

Export real: `projetarVisao(estadoLocal, nowIso, mapaQuadro)`, conforme a interface do plano. `nowIso` e `captura.completedAt` determinam frescor em `America/Sao_Paulo`; a data das linhas não decide o selo. O mapa validado recebido do servidor é aplicado na classificação da US4.

Imports: `CAMPOS` de [captura](captura.md), `COLUNAS` de [quadro-config](quadro-config.md) e `chaves`/`redigirTexto`/`selecionarNtv` de [triagem](triagem.md). Não há I/O, rota própria, variável de ambiente ou escrita na entrada. A seleção NTV/66 mínimos e as regras de redação são compartilhadas com a validação anterior à promoção; não houve mudança no recorte ou nos formatos reconhecidos.

| Campo de saída | Comportamento atual |
| --- | --- |
| `schemaVersion` / `fonte` | 1 e rótulo Captura pela Central ou Leitura direta pelo servidor local, por source permitido |
| `captura` | null sem captura; senão capturaId, completedAt, período e contagens NTV |
| `estado` / `selo` | Quatro estados contratuais abaixo; destino planilha em todos eles |
| `semanas` | Mínimos selecionados + período civil de sete dias, objetivo mensal indefinido e IDs ordinais |
| `producoes` | Mínimos selecionados + dataCivil, semanaId resolvida ou null, formato por slot, detalhes e `quadro:{coluna,pendencias}` |
| `dias` | Grupos por data civil; sem data agrupado por semanaId, inclusive null |
| `quadro` | `colunas:[{nome}]` e `semanas:[{semanaId,colunas:[{nome,titulo,ids,quantidadeValoresNovos}]}]`; oito colunas por semana, inclusive semanaId null; IDs ordinais |
| `planilha` | Sem captura, lista vazia; com captura, seis abas `{nome,cabecalhos,quantidadeLinhas,linhas}` com cópias dos mínimos triados e contagens NTV; Meses acrescentada somente se capturada, com quatro mínimos |
| `historico` / `ultimaTentativa` | Todos os recibos confirmados selecionados, recentes primeiro; Histórico final na Planilha, sem órfãos/no-op duplicado |
| `avisos` | Mês/texto mensal inválido e duplicatas de Meses; data/semana/versão/índice/tempo/JSON/vínculo inválidos, ausência de mídia, empates, supressão localizada e aviso curto de última importação falha; origem por aba/linha física/campo quando há registro |

| Precedência | `estado` | Texto / cor |
| --- | --- | --- |
| Sem captura válida, mesmo após primeira falha | `sem_captura` | Sem dados / cinza |
| Captura válida e última tentativa falhou | `falha_atualizacao` | Atualização falhou / vermelho |
| Sem falha ativa e fim da captura no dia civil de nowIso em São Paulo | `atualizada_hoje` | Atualizado hoje, HH:MM / verde |
| Sem falha ativa e fim da captura em outro dia civil | `anterior_hoje` | Dados de DD/MM / âmbar |

Com captura vigente e `ultimaTentativa.resultado=falhou`, a projeção acrescenta **Última importação falhou; captura anterior preservada**, sem expor motivo bruto, caminho ou conteúdo privado. A UI apresenta motivos resumidos distintos em Planilha. GET/no-op não apagam a tentativa confirmada, não renovam `completedAt` e não encerram a falha; nova captura completa aceita encerra a falha na persistência. O cálculo não modifica a entrada ou o horário da captura.

Semanas/produções exigem `marca_id=ntv`. Páginas, cenas e revisões são selecionadas pelo conjunto de produções; arquivos, pela produção ou semana quando não têm produção. Seus registros mínimos selecionados alimentam contagens e detalhes; nenhum seletor de elegibilidade do n8n é reutilizado.

Somente campos mínimos explícitos são considerados; envelope, metadados/hash de coleta, extras arbitrários e mapa bruto não são servidos. Recibo público contém apenas tentativaId, concluidaEm, resultado e motivoResumo.

## Seis tabelas de consulta

`montarPlanilha` (`src/projecao.cjs`) percorre `CAMPOS` na ordem Semanas,
Produções, Páginas, Cenas, Arquivos e Revisoes. Como cópias de folhas já selecionadas,
as linhas carregam somente os mínimos triados, sem herdar os dados calculados das
outras telas.

| Campo | Regra |
| --- | --- |
| `nome` | Nome literal da aba |
| `cabecalhos` | Nova lista dos mínimos daquela aba, na ordem contratual; 66 no total |
| `quantidadeLinhas` | Comprimento da lista de linhas NTV, não a alocação da fonte |
| `linhas` | Objetos novos com somente chaves de `CAMPOS` e os valores já triados |

A cópia ocorre antes de `planejar`, `detalhar` e `montarQuadro`, isolando as linhas
de períodos/IDs calculados, `detalhes`, `quadro`, envelope e extras. Cabeçalhos e
objetos de linha não são compartilhados com os registros enriquecidos. Semanas
sem `marca_id=ntv`, produções de outra marca e seus registros relacionados não
entram na consulta; arquivo semanal sem produção usa vínculo à semana NTV.

`base` conserva Histórico de todos os recibos confirmados, recentes primeiro,
mesmo sem captura válida; a US5 usa essa lista existente, sem alterar persistência.
GET/no-op não cria tentativa. A Planilha exibe linhas triadas, não a matriz bruta:
normalização null→string vazia permanece nos mínimos, exceto `etapa_producao`,
recuperada antes da triagem. Essa dívida e seus limites continuam no contrato.

Avisos gerais e `detalhes.avisos` conservam a origem física; o filtro visual da
peça não altera as seis tabelas da API. URLs dedicadas já triadas fora da allowlist
visual podem permanecer na API; a célula da interface mostra **link não permitido**.
Texto livre legítimo segue a redação parcial, sem aplicar a allowlist a toda frase.

## Datas, formatos e agrupamento

| Regra | Resultado real |
| --- | --- |
| data_prevista válida em YYYY-MM-DD | Mesmo dia civil, sem deslocamento por fuso |
| Data ausente/inválida/serial | dataCivil null, aviso e grupo Sem data |
| imagem_a / imagem_b | Imagem; tipo_producao original continua separado |
| carrossel / reels | Carrossel / Reels |
| Slot desconhecido | Outro, acessível em Todos |
| Semana registrada inexistente | semanaId null, grupo Semana não identificada, peça preservada |
| inicio_semana válido | Período início até início + seis dias civis |
| Cobertura | Menor início semanal válido até maior fim; limites null sem semanas válidas |
| Objetivo mensal | Ainda não definido; não agrega objetivo semanal |
| Ordem de IDs | Comparação ordinal, estabilizando primeiro cartão e lista de peças do dia |

Dia válido agrupa todas as peças NTV na data, independente de formato. Sem data agrupa por semana. O contador global é realizado pela UI sobre todas as produções sem dataCivil.

## Detalhes, versões e relações

Como páginas numeradas de um álbum, unidades de versões diferentes permanecem em conjuntos distintos. `detalhar` acrescenta `detalhes` em cada produção, sem atualizar registros ou preencher lacunas por inferência:

| Campo de `detalhes` | Regra real |
| --- | --- |
| `responsavelRegistrado` | `responsavel_atual` como registrado; vazio usa A confirmar |
| `publicacaoRegistrada` | `publicado_em` preenchido; original preservado, com aviso para formato/fuso inválidos ou instante posterior à captura, sem conferência remota |
| `paginas` / `cenas` | Todas as unidades da produção, ordenadas por versão positiva, índice positivo e ID ordinal; inválidos preservados com aviso e depois dos válidos |
| Cena `arquivos` / `avisoMidia` | Três slots na ordem imagem inicial/imagem final/vídeo, cada um arquivo ligado ou null; avisoMidia null se todos ligados, senão texto humano fixo das ausências |
| Unidade `vigente` | Versão inteira positiva igual à versão registrada da produção; UI mostra essa versão primeiro e as demais recolhidas, com impacto a confirmar |
| `designNovo` | A confirmar nas páginas; versão/template/arquivo não prova classificação de design |
| `revisoes` | Grupos vigentes, resolvidas, anteriores e ambíguas, sem substituir responsável da peça por responsável da correção |
| `arquivos` | Registros da produção ordenados por arquivo_id; nome de apresentação é tipo/papel ou Arquivo registrado, sem fabricar nome original |
| `documentosSemana` | Três papéis Plano/Redação/Visual resolvidos por arquivo_id e semana_id; ausentes/incompatíveis null, inclusive sem semana identificada |
| `avisos` | Avisos próprios e relacionados já globais, mais avisos novos do detalhe, com origem física e motivo fixo; associação não duplica o conjunto global |

Revisões `resolvido`/`resolvida` vão ao histórico mesmo quando de outra versão. Nas demais, versão inválida ou ponteiro de página/cena/arquivo sem produção e versão compatíveis vai ao grupo ambíguas; versão válida diferente da produção vai a anteriores. Só revisão com vínculo e versão atual é vigente. Tratamento desconhecido não é encerramento: permanece vigente com aviso. Decisão, motivo, versão e `responsavel_correcao` conservam seus valores e aparecem separados de `responsavel_atual`; não se infere aguardando-de ou próxima ação.

Os IDs de página/cena/arquivo e demais campos de cada revisão permanecem na API; a linha visual da gaveta omite IDs e rótulos técnicos, sem inventar o escopo. Em revisão não resolvida com vínculo inválido, `vinculoRevisao` localiza o primeiro campo falho na ordem pagina_id/cena_id/arquivo_id; `versao` é usado quando a versão da revisão ou da produção não é válida, não como rótulo genérico de vínculo. `avisarPublicacao` verifica o valor preenchido contra formato ISO com fuso explícito, data civil válida, instante reconhecido e `captura.completedAt`; inconsistência acrescenta aviso em Produções/linha física/`publicado_em`, mantendo o registro e o original.

Cada ponteiro de mídia de página/cena procura o arquivo por ID, exigindo a mesma produção e versão positiva; se o arquivo registra página/cena, também exige a unidade esperada. Ponteiro vazio, ID ausente ou escopo incompatível produz ausência/aviso e não escolhe substituto. Os demais arquivos continuam aparecendo como registros, incluindo empates por papel/versão/página/cena: empate e origens JSON inválidas são avisos, sem escolha automática de vigente. Referência e registro não comprovam bytes, aprovação ou publicação.

`midiasCena` resolve os três ponteiros sem reduzir a lista de slots. `faltasMidiaCena` identifica **imagens ausentes** quando faltam as duas, **imagem inicial ausente** ou **imagem final ausente** quando falta somente uma; **vídeo ausente** é combinado com ponto e vírgula quando necessário. O texto de `avisoMidia` tem apenas essas causas humanas fixas, nunca o valor de uma célula. A ausência, referência quebrada ou vínculo incompatível gera um único aviso técnico agregado de mídia por cena, localizado no primeiro ponteiro falho e com causas distintas reunidas. Avisos de índice, tempo e versão inválidos continuam independentes; não são absorvidos por essa agregação. Quando os três arquivos estão ligados, avisoMidia é null, sem comprovar bytes ou URL clicável.

`documentosSemana` usa um Map por consulta e semanaId para não resolver os mesmos três ponteiros a cada peça. Os documentos continuam em `detalhes` de cada produção; aviso de vínculo semanal entra uma vez no conjunto global e é copiado aos avisos locais de todas as peças afetadas. O cache não atravessa consultas nem muda a captura; a UI reúne os documentos uma vez no fim do dia e usa **—** para arquivo null.

Antes dos novos avisos de detalhe, `indexarAvisos` e `avisosRelacionados` associam avisos globais pela aba/linha física à peça, páginas/cenas/revisões, semana e arquivos relacionados, inclusive documentos apontados pela semana. O contador e resumo de cada peça passam a incluir supressões e problemas de origem já presentes na projeção; avisos sem origem localizada permanecem globais. A mesma associação não acrescenta outra cópia no conjunto global nem repete o mesmo objeto de aviso na coleção local.

Versão/índice preenchidos exigem inteiros positivos; início/duração preenchidos exigem números finitos não negativos. Valores inválidos são mantidos com aviso, nunca coercidos a zero. A linha dos avisos vem do ID na matriz original e acompanha o registro selecionado em WeakMap; linhas vazias e marcas filtradas não deslocam a localização física. A API não envia a matriz bruta nem os mapas internos.

`detalhar` acrescenta aviso de versão vigente não informada quando `versao` está vazia. Sem versão inteira positiva da produção, `pendenciasMidia` retorna nenhuma pendência categórica de ausência de mídia vigente: não há versão segura para afirmar esse vínculo. Os registros, versões e avisos continuam no detalhe; isso não comprova disponibilidade de mídia.

## Quadro por semana

`colunaProducao` aplica publicação preenchida > liberação configurada > revisão configurada > etapa mapeada, com fallback Outras; status é informativo. `colunaSemana` conta rótulos distintos apenas dos cartões Outras daquela semana NTV; vazio/null/espaços usam uma chave somente no contador. Etapa null é recuperada da célula original antes da triagem e conservada na API. Repetição, outra semana/marca ou etapa vencida por prioridade superior não aumenta N; zero/singular/plural vêm da projeção. Configuração versionada mantém nove etapas e liberação/revisão vazias; `capturaQuadro`/`mapaQuadroSintetico` são fixtures TEMP para todas as colunas.

`quadro.pendencias` reúne revisões vigentes de decisão literal `revisar`, `refazer`, `reprovado` ou `rejeitado`, com revisãoId/decisão/versão/responsável de correção, seguidas de mídia ausente na página/cena vigente com unidade/identidade. Aprovação/desconhecido/versão anterior não gera correção inferida. Com versão positiva da produção e sem unidades vigentes, ausência de arquivo registrado nessa versão gera pendência; sem versão válida, mídia vigente fica a confirmar. Registro com URL vazia/recusada não vira mídia ausente nem comprova bytes. API conserva todas; o cartão aplica o filtro de mídia por coluna e mostra primeira/+N somente das pendências visíveis. Tratamento desconhecido continua dívida da revisão final. Casos US4 de prioridade, contador e pendências são conferidos em [tests/projecao.test.cjs](../../tests/projecao.test.cjs), com resultados somente na [validação](../../specs/001-consulta-local-producao/validacao.md).

## Supressão, testes e dívidas

A promoção já recusa identidades/vínculos NTV alteráveis pela redação antes de no-op ou gravação, conforme [triagem](triagem.md). Na consulta, `selecionar` desse módulo mantém erro se `redigirTexto` alterar campo terminado em `_id`, defendendo também bytes antigos/corrompidos. Esses campos não viram marcador compartilhado; captura privada permanece intacta e servidor responde 503 genérico sem gravar. As regressões cobrem essa defesa em `tests/projecao.test.cjs` e `tests/servidor.test.cjs`.

A expressão `sensivel` de [triagem](triagem.md) procura formatos conhecidos de segredo/chave e caminhos pessoais indevidos; troca o texto reconhecido inteiro por **[conteúdo suprimido]** e acrescenta aviso de célula. É triagem conservadora, sem garantia de detectar todos os segredos. Nos campos dedicados `Arquivos.url` e `Produções.url_video_final`, após a redação de texto, `motivoUrl` analisa com `new URL` os valores ainda inalterados: usuário **ou** senha causa o marcador e motivo fixo **conteúdo sensível suprimido**; string não vazia recusada pelo construtor recebe **URL inválida suprimida**. O aviso tem `aba`, linha física e campo, sem valor ou exceção bruta. Esse guarda também cobre outros esquemas e URL malformada nesses dois campos. Vazio, inclusive somente espaços, é preservado sem aviso de URL inválida. Se a redação de texto já substituiu um pedaço HTTP(S) credenciado, o restante da frase é preservado também nesses campos. A allowlist da UI decide quais URLs válidas podem virar link, sem ecoar recusadas. O original permanece intacto na captura privada.

Por decisão do autor, `redigirTexto` preserva o texto livre legítimo byte a byte e divide-o em pedaços separados por espaços em branco, conservando os próprios separadores. `redigirPedacoUrl` considera somente pedaço iniciado em HTTP(S), desconsiderando aspas/parênteses de contorno e pontuação final `. , ; : ! ?`; só `new URL` decide se há usuário/senha. Apenas o pedaço credenciado vira **[conteúdo suprimido]**: o restante da frase, os espaços e a pontuação permanecem. URL comum seguida de `@`/e-mail e `//` solto permanecem como estavam. **Limite de texto livre:** não há promessa de detectar outros esquemas, URL relativa, espaço dentro de userinfo ou forma fora desse pedaço HTTP(S). Essa regra vale para textos mínimos selecionados e os quatro campos públicos do recibo; não substitui o guarda dos campos de URL dedicados.

JSON válido é tratado como dado, sem execução ou expansão da whitelist HTTP: a redação examina strings decodificadas, incluindo chaves e JSON aninhado em string. Somente tokens de string alterados são reserializados; números, ordem, espaços, demais bytes e escapes legítimos de strings não alteradas ficam intactos. Célula alterada gera aviso fixo localizado sem valor; recibo público continua com apenas seus quatro campos. A regra de segredo/caminho conhecido continua substituindo o texto reconhecido inteiro, sem a preservação parcial reservada ao pedaço HTTP(S).

A validade de `origens_json` é calculada sobre o texto original antes da supressão e guardada apenas como booleano em WeakMap privado. Um JSON originalmente válido que foi saneado não recebe um falso aviso de JSON inválido por causa do marcador; JSON originalmente inválido mantém seu aviso. Captura, recibos privados e matriz original permanecem intactos, sem serem servidos para justificar a supressão.

[tests/projecao.test.cjs](../../tests/projecao.test.cjs) cobre seleção NTV, isolamento da entrada, campos selecionados, supressão e preservação de URLs, datas civis, formatos, cobertura, órfãos e ordem. US2 verifica fim da captura, virada do dia em São Paulo, quatro estados e precedência da falha sem payload privado; US3 cobre responsáveis/revisões, ordenação e isolamento de versões, mídias ausentes/incompatíveis/empatadas, números/JSON inválidos, linha física dos avisos e resolução semanal sem duplicar avisos globais. Casos de usuário/senha sintéticos, inclusive URLs malformadas, verificam supressão, motivos fixos, vazios preservados e captura original intacta; [servidor](../../tests/servidor.test.cjs) e [interface](../../tests/interface.test.cjs) conferem ausência das credenciais no JSON real e no dia. Regressões em [tests/snapshot.test.cjs](../../tests/snapshot.test.cjs) conferem GET/no-op preservando falha/horário e nova captura encerrando a falha. Resultados em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

Uma pegadinha permanece explícita: a função `registros` em `src/captura.cjs` normaliza null explícito para string vazia na entidade; o envelope privado conserva o original; etapa_producao null é recuperada antes da triagem. As seis tabelas da US5 conservam essa normalização nos demais mínimos. A linha física dos avisos já é preservada, inclusive após linhas vazias ou de outra marca. Classificação de Produção e tabelas de Planilha implementadas; detalhe, tabela e recibo não comprovam integração operacional. Verificações locais e revisão ficam somente na validação.

002 mantém seis tabelas/66 mínimos e tipos recebidos; origem direta não expõe source bruto ou ID privado. Teste P002 em tests/projecao.test.cjs; [validação](../../specs/002-consulta-planilhas/validacao.md).

003 acrescenta Meses em `montarPlanilha` somente quando a triagem retorna `meses`, mesmo sem linhas. São quatro mínimos NTV, sem propriedade raiz/contagem mensal nova, vínculo com semanas ou mudanças nos 66 mínimos anteriores. Avisos de mês/tipo/duplicata vêm da triagem, com linha física preservada em WeakMap pelo parser. O browser deriva o card pelo mês exibido a partir dessa tabela; `semanas[].objetivoMensal` não passa a ter autoridade mensal. [Validação da 003](../../specs/003-planejamento-mensal/validacao.md) registra provas sintéticas e T002/T015 concluídas com uma linha fictícia marcada como teste na fonte real, sem comprovar uso editorial real.
