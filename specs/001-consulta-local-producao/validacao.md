# Validação — primeiro PR da feature 001

Como conferir um álbum antes de entregá-lo: cada regra será provada com uma captura sintética, sem tocar na operação. Recorte autorizado: T001–T018, fundação e US1 Planejamento; as demais tarefas continuam pendentes.

## Preparação T001

Em 04/10/2026, feature ativa e branch conferidas; árvore inicial limpa. Pré-requisitos oficiais encontrados. Hooks before/after_analyze de commit são opcionais e não foram executados. A regra project-structure foi gerada do estado real, com 22 linhas, sem tratar módulos planejados como implementados.

Ambiente: Node 24.19.0 existente via CRM_NODE_PATH; PATH padrão 24.14.0. Playwright existente resolvido por CRM_PLAYWRIGHT_MODULE fora do repositório; Windows PowerShell 5.1.26100.9444. ESLint já preparado em tools/. Configuração do gate preservada: node --test, modo full, Node 24.19.0.

Responsável único de implementação: coordenador Codex, em todos os arquivos de T001–T018. Análise e revisão independentes são somente leitura. Testes também feitos pelo coordenador: a ferramenta de subagentes não oferece os modelos Sonnet/Haiku indicados pelo template; nenhum modelo diferente foi apresentado como se fosse um deles.

## Interfaces e aplicabilidade

| Produz / consome | Conferência |
| --- | --- |
| T002 -> T003 | Envelope sintético e hash canônico do contrato |
| T004 -> T006 -> T008 | Captura validada, estado confirmado e CLI local |
| T010 -> T012/T014 | Mapa validado, nunca exposto como JSON bruto |
| T012/T016 -> T014/T018 | Projeção permitida sem envelope/extras |
| T014 -> T017 | Servidor real e dados TEMP; estáticos só surgem em T018 |

Dados, I/O, CLI, configuração, projeção e HTTP rodam Windows/Linux. Interface usa Playwright local; CI=true registra pulo explícito antes de carregar a ferramenta. Não há iniciador neste recorte (T035–T036 posteriores). Aceite local deste PR exige todos os casos aplicáveis verdes, sem pulos.

## Registro RED/GREEN

Resultados serão acrescentados após execução real, sem contagens antecipadas.

Análise speckit-analyze anterior ao código: 25 requisitos, 41 tarefas, cobertura documental 100%, 0 CRITICAL e nenhuma inconsistência material. Fases posteriores conservadas.

T002: seis abas/66 mínimos, quatro peças NTV mais outra marca, nove etapas e independência entre fixtures conferidas.
T003 RED: 0 passados, 12 falhos, 0 pulados; comportamento ausente, sem erro de importação. T004 GREEN: 12/0/0. A primeira tentativa no sandbox deu spawn EPERM e não foi contada como RED; runner real autorizado fora do sandbox executou os casos.

T005 RED {'pass': 0, 'fail': 8, 'skipped': 0}; T006 GREEN {'pass': 20, 'fail': 0, 'skipped': 0}.

T007 RED {'pass': 0, 'fail': 3, 'skipped': 0}; T008 GREEN {'pass': 23, 'fail': 0, 'skipped': 0}.

T009 RED {'pass': 0, 'fail': 7, 'skipped': 0}; T010 GREEN {'pass': 30, 'fail': 0, 'skipped': 0}.

T011 RED {'pass': 0, 'fail': 5, 'skipped': 0}; T012 GREEN {'pass': 35, 'fail': 0, 'skipped': 0}.
