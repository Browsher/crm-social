# Projeção de Planejamento

Como o índice de um álbum que separa só as fotografias da NTV, a projeção seleciona registros permitidos e os reúne por semana/data. Ela não transforma registros em aprovação, atividade de agente ou mídia conferida.

Estado em 04/10/2026: base T012, US1/T016 e US2/T020 implementadas e testadas localmente. Fonte: [src/projecao.cjs](../../src/projecao.cjs), `selecionar` (linha 6), `selecionarNtv` (26), `planejar` (47), `agruparDias` (67), `aplicarFrescor` (76) e `projetarVisao` (95).

## Interface, seleção e dados

Export real: `projetarVisao(estadoLocal, nowIso, mapaQuadro)`, conforme a interface do plano. `nowIso` e `captura.completedAt` determinam frescor em `America/Sao_Paulo`; a data das linhas não decide o selo. O mapa é recebido do servidor, com classificação dos cartões reservada a US4.

Imports: `CAMPOS` de [captura](captura.md) e `COLUNAS` de [quadro-config](quadro-config.md). Não há I/O, rota própria, variável de ambiente ou escrita na entrada.

| Campo de saída | Comportamento atual |
| --- | --- |
| `schemaVersion` / `fonte` | 1 e rótulo Captura pela Central |
| `captura` | null sem captura; senão capturaId, completedAt, período e contagens NTV |
| `estado` / `selo` | Quatro estados contratuais abaixo; destino planilha em todos eles |
| `semanas` | Mínimos selecionados + período civil de sete dias, objetivo mensal indefinido e IDs ordinais |
| `producoes` | Mínimos selecionados + dataCivil, semanaId resolvida ou null e formato por slot |
| `dias` | Grupos por data civil; sem data agrupado por semanaId, inclusive null |
| `quadro` | Oito colunas fixas com IDs vazios; classificação futura |
| `planilha` | Lista vazia; seis tabelas futuras em US5 |
| `historico` / `ultimaTentativa` | Recibos confirmados selecionados, recentes primeiro; tela ainda pendente |
| `avisos` | Data/semana inválidas, supressão localizada de conteúdo sensível e aviso curto de última importação falha quando há captura vigente |

| Precedência | `estado` | Texto / cor |
| --- | --- | --- |
| Sem captura válida, mesmo após primeira falha | `sem_captura` | Sem dados / cinza |
| Captura válida e última tentativa falhou | `falha_atualizacao` | Atualização falhou / vermelho |
| Sem falha ativa e fim da captura no dia civil de nowIso em São Paulo | `atualizada_hoje` | Atualizado hoje, HH:MM / verde |
| Sem falha ativa e fim da captura em outro dia civil | `anterior_hoje` | Dados de DD/MM / âmbar |

Com captura vigente e `ultimaTentativa.resultado=falhou`, a projeção acrescenta **Última importação falhou; captura anterior preservada**, sem expor motivo bruto, caminho ou conteúdo privado. A UI apresenta motivos resumidos distintos em Planilha. GET/no-op não apagam a tentativa confirmada, não renovam `completedAt` e não encerram a falha; nova captura completa aceita encerra a falha na persistência. O cálculo não modifica a entrada ou o horário da captura.

Semanas/produções exigem `marca_id=ntv`. Páginas, cenas e revisões são selecionadas pelo conjunto de produções; arquivos, pela produção ou semana quando não têm produção. Seus conjuntos contribuem às contagens, sem detalhamento público já implementado. Nenhum seletor de elegibilidade do n8n é reutilizado.

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

## Supressão, testes e dívidas

A expressão `sensivel` (linha 5) procura formatos conhecidos de segredo/chave e caminhos pessoais indevidos; troca a célula por **[conteúdo suprimido]** e acrescenta aviso. É triagem conservadora, sem garantia de detectar todos os segredos. A regressão preserva HTTP/HTTPS comuns, inclusive como texto dentro de JSON; a regra de drive Windows não confunde o final do esquema com caminho.

[tests/projecao.test.cjs](../../tests/projecao.test.cjs) cobre seleção NTV, isolamento da entrada, campos selecionados, supressão e preservação de URLs, datas civis, formatos, cobertura, órfãos e ordem. US2 verifica fim da captura, virada do dia em São Paulo, quatro estados e precedência da falha sem payload privado; regressões em [tests/snapshot.test.cjs](../../tests/snapshot.test.cjs) conferem GET/no-op preservando falha/horário e nova captura encerrando a falha. Resultados em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

Duas dívidas Minor da revisão permanecem explícitas: `registros` em `src/captura.cjs:81` normaliza null explícito para string vazia na entidade (o envelope privado conserva o original); `selecionarNtv`/`planejar` em `src/projecao.cjs:33–62` usam índice da coleção filtrada + 2 nos avisos, que pode diferir da linha física original após linhas vazias/outra marca. Impacto: diagnóstico de célula não deve ser tratado como localização física comprovada. A correção da linha física (M3) está adiada para US3/US5, no módulo de origem e com regressão.
