# Projeção de Planejamento e detalhe do dia

Como o índice de um álbum que separa só as fotografias da NTV, a projeção seleciona registros permitidos e os reúne por semana/data. Ela não transforma registros em aprovação, atividade de agente ou mídia conferida.

Projeção e detalhes implementados até T024/US3; estado e evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Fonte: [src/projecao.cjs](../../src/projecao.cjs), `motivoUrl` (linha 6), `selecionar` (11), `selecionarNtv` (33), `planejar` (62), `agruparDias` (84), `aplicarFrescor` (93), `unidades` (150), `revisoes` (168), `documentosSemana` (200), `avisarPublicacao` (211), `detalhar` (220) e `projetarVisao` (233).

## Interface, seleção e dados

Export real: `projetarVisao(estadoLocal, nowIso, mapaQuadro)`, conforme a interface do plano. `nowIso` e `captura.completedAt` determinam frescor em `America/Sao_Paulo`; a data das linhas não decide o selo. O mapa é recebido do servidor, com classificação dos cartões reservada a US4.

Imports: `CAMPOS` de [captura](captura.md) e `COLUNAS` de [quadro-config](quadro-config.md). Não há I/O, rota própria, variável de ambiente ou escrita na entrada.

| Campo de saída | Comportamento atual |
| --- | --- |
| `schemaVersion` / `fonte` | 1 e rótulo Captura pela Central |
| `captura` | null sem captura; senão capturaId, completedAt, período e contagens NTV |
| `estado` / `selo` | Quatro estados contratuais abaixo; destino planilha em todos eles |
| `semanas` | Mínimos selecionados + período civil de sete dias, objetivo mensal indefinido e IDs ordinais |
| `producoes` | Mínimos selecionados + dataCivil, semanaId resolvida ou null, formato por slot e detalhes de cada produção |
| `dias` | Grupos por data civil; sem data agrupado por semanaId, inclusive null |
| `quadro` | Oito colunas fixas com IDs vazios; classificação futura |
| `planilha` | Lista vazia; seis tabelas futuras em US5 |
| `historico` / `ultimaTentativa` | Recibos confirmados selecionados, recentes primeiro; tela ainda pendente |
| `avisos` | Data/semana/versão/índice/tempo/JSON/vínculo inválidos, ausência de mídia, empates, supressão localizada e aviso curto de última importação falha; origem por aba/linha física/campo quando há registro |

| Precedência | `estado` | Texto / cor |
| --- | --- | --- |
| Sem captura válida, mesmo após primeira falha | `sem_captura` | Sem dados / cinza |
| Captura válida e última tentativa falhou | `falha_atualizacao` | Atualização falhou / vermelho |
| Sem falha ativa e fim da captura no dia civil de nowIso em São Paulo | `atualizada_hoje` | Atualizado hoje, HH:MM / verde |
| Sem falha ativa e fim da captura em outro dia civil | `anterior_hoje` | Dados de DD/MM / âmbar |

Com captura vigente e `ultimaTentativa.resultado=falhou`, a projeção acrescenta **Última importação falhou; captura anterior preservada**, sem expor motivo bruto, caminho ou conteúdo privado. A UI apresenta motivos resumidos distintos em Planilha. GET/no-op não apagam a tentativa confirmada, não renovam `completedAt` e não encerram a falha; nova captura completa aceita encerra a falha na persistência. O cálculo não modifica a entrada ou o horário da captura.

Semanas/produções exigem `marca_id=ntv`. Páginas, cenas e revisões são selecionadas pelo conjunto de produções; arquivos, pela produção ou semana quando não têm produção. Seus registros mínimos selecionados alimentam contagens e detalhes; nenhum seletor de elegibilidade do n8n é reutilizado.

Somente campos mínimos explícitos são considerados; envelope, metadados/hash de coleta, extras arbitrários e mapa bruto não são servidos. Recibo público contém apenas tentativaId, concluidaEm, resultado e motivoResumo.

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
| Unidade `vigente` | Versão inteira positiva igual à versão registrada da produção; UI mostra essa versão primeiro e as demais recolhidas, com impacto a confirmar |
| `designNovo` | A confirmar nas páginas; versão/template/arquivo não prova classificação de design |
| `revisoes` | Grupos vigentes, resolvidas, anteriores e ambíguas, sem substituir responsável da peça por responsável da correção |
| `arquivos` | Registros da produção ordenados por arquivo_id; nome de apresentação é tipo/papel ou Arquivo registrado, sem fabricar nome original |
| `documentosSemana` | Três papéis Plano/Redação/Visual resolvidos por arquivo_id e semana_id; ausentes/incompatíveis null, inclusive sem semana identificada |
| `avisos` | Avisos locais de detalhe também presentes no conjunto global, com origem física e motivo fixo |

Revisões `resolvido`/`resolvida` vão ao histórico mesmo quando de outra versão. Nas demais, versão inválida ou ponteiro de página/cena/arquivo sem produção e versão compatíveis vai ao grupo ambíguas; versão válida diferente da produção vai a anteriores. Só revisão com vínculo e versão atual é vigente. Tratamento desconhecido não é encerramento: permanece vigente com aviso. Decisão, motivo, versão e `responsavel_correcao` conservam seus valores e aparecem separados de `responsavel_atual`; não se infere aguardando-de ou próxima ação.

Os IDs de página/cena/arquivo de cada revisão também permanecem na API e na gaveta, para explicar o escopo avaliado sem inferir a unidade por posição. `avisarPublicacao` verifica o valor preenchido contra formato ISO com fuso explícito, data civil válida, instante reconhecido e `captura.completedAt`; inconsistência acrescenta aviso em Produções/linha física/`publicado_em`, mantendo o registro e o original.

Cada ponteiro de mídia de página/cena procura o arquivo por ID, exigindo a mesma produção e versão positiva; se o arquivo registra página/cena, também exige a unidade esperada. Ponteiro vazio, ID ausente ou escopo incompatível produz ausência/aviso e não escolhe substituto. Os demais arquivos continuam aparecendo como registros, incluindo empates por papel/versão/página/cena: empate e origens JSON inválidas são avisos, sem escolha automática de vigente. Referência e registro não comprovam bytes, aprovação ou publicação.

`documentosSemana` usa um Map por consulta e semanaId para não resolver os mesmos três ponteiros a cada peça. Os documentos continuam em `detalhes` de cada produção; aviso de vínculo semanal entra uma vez no conjunto global e é copiado aos avisos locais de todas as peças afetadas. O cache não atravessa consultas nem muda a captura; a UI reúne os documentos uma vez no fim do dia e usa **—** para arquivo null.

Versão/índice preenchidos exigem inteiros positivos; início/duração preenchidos exigem números finitos não negativos. Valores inválidos são mantidos com aviso, nunca coercidos a zero. A linha dos avisos vem do ID na matriz original e acompanha o registro selecionado em WeakMap; linhas vazias e marcas filtradas não deslocam a localização física. A API não envia a matriz bruta nem os mapas internos.

## Supressão, testes e dívidas

A expressão `sensivel` (linha 5) procura formatos conhecidos de segredo/chave e caminhos pessoais indevidos; troca a célula por **[conteúdo suprimido]** e acrescenta aviso. É triagem conservadora, sem garantia de detectar todos os segredos. Separadamente, `motivoUrl` usa `new URL` em `Arquivos.url` e `Produções.url_video_final`: usuário **ou** senha causa a mesma supressão com `aba`, linha física, campo e motivo fixo **conteúdo sensível suprimido**, sem anexar o valor. String não vazia que o construtor recusa também é suprimida, com motivo fixo **URL inválida suprimida**; o erro de parsing não devolve uma possível credencial malformada ao HTTP. Vazio, inclusive somente espaços, é preservado, sem aviso de URL inválida. A allowlist da UI ainda decide quais URLs válidas podem virar link, sem ecoar recusadas. A regressão preserva URLs comuns sem credenciais, inclusive como texto dentro de JSON; a regra de drive Windows não confunde o final do esquema com caminho. O original permanece intacto na captura privada.

[tests/projecao.test.cjs](../../tests/projecao.test.cjs) cobre seleção NTV, isolamento da entrada, campos selecionados, supressão e preservação de URLs, datas civis, formatos, cobertura, órfãos e ordem. US2 verifica fim da captura, virada do dia em São Paulo, quatro estados e precedência da falha sem payload privado; US3 cobre responsáveis/revisões, ordenação e isolamento de versões, mídias ausentes/incompatíveis/empatadas, números/JSON inválidos, linha física dos avisos e resolução semanal sem duplicar avisos globais. Casos de usuário/senha sintéticos, inclusive URLs malformadas, verificam supressão, motivos fixos, vazios preservados e captura original intacta; [servidor](../../tests/servidor.test.cjs) e [interface](../../tests/interface.test.cjs) conferem ausência das credenciais no JSON real e no dia. Regressões em [tests/snapshot.test.cjs](../../tests/snapshot.test.cjs) conferem GET/no-op preservando falha/horário e nova captura encerrando a falha. Resultados em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

Uma pegadinha permanece explícita: `registros` em `src/captura.cjs:81` normaliza null explícito para string vazia na entidade; o envelope privado conserva o original. A linha física dos avisos já é preservada, inclusive após linhas vazias ou de outra marca. A classificação de Produção e as seis tabelas de Planilha continuam futuras; detalhe e recibo não comprovam integração operacional.
