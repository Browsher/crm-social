# Validação — primeiro PR da feature 001

Como conferir um álbum antes de entregá-lo: cada regra será provada com uma captura sintética, sem tocar na operação. Recorte autorizado: T001–T018, fundação e US1 Planejamento; as demais tarefas continuam pendentes.

## Preparação T001

Em 04/10/2026, feature ativa e branch conferidas; árvore inicial limpa. Pré-requisitos oficiais encontrados. Hooks before/after_analyze de commit são opcionais e não foram executados. A regra project-structure foi gerada do estado real e sincronizada ao final da implementação: **35 linhas**, sem tratar módulos planejados como implementados.

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

Dados, I/O, CLI, configuração, projeção e HTTP rodam Windows/Linux. Interface usa Playwright local; CI=true registra pulo explícito dos nove casos atuais antes de carregar a ferramenta. Não há iniciador neste recorte (T035–T036 posteriores). Aceite local deste PR exige todos os casos aplicáveis verdes, sem pulos.

## Registro RED/GREEN

Resultados serão acrescentados após execução real, sem contagens antecipadas.

Análise speckit-analyze anterior ao código: 25 requisitos, 41 tarefas, cobertura documental 100%, 0 CRITICAL e nenhuma inconsistência material. Fases posteriores conservadas.

T002: seis abas/66 mínimos, quatro peças NTV mais outra marca, nove etapas e independência entre fixtures conferidas.
T003 RED: 0 passados, 12 falhos, 0 pulados; comportamento ausente, sem erro de importação. T004 GREEN: 12/0/0. A primeira tentativa no sandbox deu spawn EPERM e não foi contada como RED; runner real autorizado fora do sandbox executou os casos.

T005 RED {'pass': 0, 'fail': 8, 'skipped': 0}; T006 GREEN {'pass': 20, 'fail': 0, 'skipped': 0}.

T007 RED {'pass': 0, 'fail': 3, 'skipped': 0}; T008 GREEN {'pass': 23, 'fail': 0, 'skipped': 0}.

T009 RED {'pass': 0, 'fail': 7, 'skipped': 0}; T010 GREEN {'pass': 30, 'fail': 0, 'skipped': 0}.

T011 RED {'pass': 0, 'fail': 5, 'skipped': 0}; T012 GREEN {'pass': 35, 'fail': 0, 'skipped': 0}.

T013 RED {'pass': 0, 'fail': 7, 'skipped': 0}; T014 GREEN {'pass': 42, 'fail': 0, 'skipped': 0}.

T015 RED {'pass': 5, 'fail': 6, 'skipped': 0}; T016 GREEN {'pass': 48, 'fail': 0, 'skipped': 0}.

T017 RED {'pass': 0, 'fail': 4, 'skipped': 0}; T018 GREEN {'pass': 52, 'fail': 0, 'skipped': 0}.

## Revisão independente e regressões

Revisão somente leitura do HEAD 119b0fd, contra main 4f20f20: 0 Critical, 4 Important e 2 Minor. Os quatro Important foram reproduzidos antes da correção: conjunto afetado RED com 18 passados, 6 falhos e 0 pulados. Depois da correção, suíte completa GREEN com 58 passados, 0 falhos e 0 pulados (3,68 s).

| Achado Important | Correção e evidência |
| --- | --- |
| URL HTTPS confundida com caminho Windows | Prefixo de drive reconhecido sem casar o final do esquema HTTP; título, URL e texto JSON em legenda preservados; token/caminho continuam suprimidos |
| Leitura/JSON inválido não confirmavam tentativa | CLI confirma recibo saneado; ausência de arquivo e JSON quebrado entram no Histórico sem apagar captura; persistência indisponível informa que a falha não foi registrada |
| Peça remarcada fora da semana sumia da Lista | Seleção considera data civil da peça, preserva agrupamento registrado e Sem data; teste de navegador muda outubro/novembro e compara as duas vistas |
| Duas importações sobrescreviam o estado | Trava exclusiva por diretório antes da leitura/até confirmação; teste com dois processos reais e barreira impede perda de recibos/rollback, inclusive tentativa inválida concorrente |

Minor conservados como dívida explícita para as próximas fases: null explícito normalizado para célula vazia (envelope original preservado); número de linha nos avisos deriva da coleção filtrada, não da linha física original. Não houve alteração de tools/, configuração do gate, baseline, workflows ou manifesto.

A lista de comportamentos fora deste PR foi conferida: quatro selos e releitura (US2), gaveta detalhada/acordeões (US3), quadro (US4), tabelas/Histórico na interface (US5), iniciador, escala e captura oficial continuam pendentes. Resistência a queda de energia não foi comprovada por testes de falha do rename.

Correções durante GREEN: o menu recebeu aria-label para separar o nome acessível do ícone CSS, mantendo o teste; a criação de diretório indisponível foi separada da aquisição da trava. Uma nova regressão citava origens_json na aba Produções, onde esse campo não existe; o teste foi corrigido para legenda (campo mínimo real) com JSON como texto. Os critérios de privacidade/preservação não foram reduzidos.

## Gate e conferência visual local

Antes do primeiro push, Node 24.19.0; testes e cobertura executados pelo comando real do gate: exit 0, tests PASS (58), coverage PASS (95,91%), complexity PASS (um aviso, argumentos do CLI com 12), Semgrep SKIP por ferramenta ausente no Windows, audit N/A sem dependências de aplicação. Nenhuma baseline criada ou atualizada. ESLint existente em tools/ não foi alterado. O [primeiro gate Linux do PR #6](https://github.com/Browsher/crm-social/actions/runs/37182000254/job/111376275737) concluiu SUCCESS no head 8359604, com Semgrep 1.179.0 real PASS; o [review inicial](https://github.com/Browsher/crm-social/pull/6#issuecomment-5977215935) foi publicado. A rodada abaixo terá novo aceite remoto.

Aplicação aberta em loopback com armazenamento somente em TEMP. Conferência visual em 1440 e 390 px contra [telas](../../docs/design/telas.md) e [mockup](../../docs/design/mockups/telas-v2.html): identidade Social Studio, sidebar clara/verde discreto, calendário com cartões, objetivo Ainda não definido, filtro/Lista, menu de três itens, +1 no dia e N sem data. Celular inicia em Lista, menu recolhido e sem corte horizontal. Sem dados não há fallback de demonstração.

Screenshots da aplicação em execução, exclusivamente com fixture fictícia (não captura operacional):

![Planejamento em 1440 px](../../docs/design/screenshots/001-planejamento-1440.png)

![Planejamento em 390 px](../../docs/design/screenshots/001-planejamento-390.png)

[Origem e limites das imagens](../../docs/design/screenshots/LEIA-ME.md). Produção/Planilha são mensagens de próxima entrega; a abertura do dia é básica. Estas imagens não comprovam as histórias futuras nem integração com Google.

## Revisão do PR #6 — Claude e autor

Correções autorizadas em 04/10/2026, na mesma branch da 001. T019–T041 continuam desmarcadas: esta revisão não antecipa US2–US5.

| Item | RED observado | GREEN observado / comportamento |
| --- | --- | --- |
| I1 | Projeção: 12 PASS / 2 FAIL / 0 SKIP | 14 PASS; captura usa captura_local_provisoria e aviso curto de falha posterior. No-op não encerra aviso; nova promoção completa encerra |
| M1 | Snapshot: 8 PASS / 3 FAIL / 0 SKIP | Snapshot + CLI: 18 PASS; close/unlink tentados separadamente, recibo ou erro preservado e aviso transitório em avisos, exibido pelo CLI em stderr |
| M2 | Snapshot: 9 PASS / 2 FAIL / 0 SKIP | 11 PASS; temporário removido após rename falhar, mantendo captura/recibos imutáveis e erro original |
| Tela 1–4 | Interface: 5 PASS / 4 FAIL / 0 SKIP | 9 PASS em Chromium: rótulos conhecidos legíveis, desconhecidos literais/API original; Outubro de 2026; sidebar inteira; outubro com 35 dias e fevereiro/2027 com 28, sem semana inteiramente fora do mês |

M4: assinatura completa projetarVisao(estadoLocal, nowIso, mapaQuadro); relógio e mapa ficam reservados às US2/US4. M5: Mermaid registra o caminho padrão do mapa no servidor e snapshot → node:crypto. M6: nove etapas é conteúdo do JSON versionado, não quantidade fixa do validador. M7: contagem da regra conferida em disco, 35 linhas.

Durante GREEN, uma expectativa nova de M1 usava o termo genérico captura, mas a mensagem real do contrato é Cenas complete: inválido; a expectativa foi corrigida para esse motivo, sem alterar a validação. A medição da sidebar usa arredondamento ao pixel: DOMRect retornou 1239,5 px e scrollHeight 1240; Math.ceil conserva a verificação da cobertura visual e evita comparar um inteiro com um subpixel. O RED original mostrava o fundo limitado à altura da janela, sem chegar ao fim da página.

Suíte completa desta rodada: **67 PASS / 0 FAIL / 0 SKIP**, 7,02 s. Gate local: **exit 0**, testes PASS (67), cobertura PASS **96,06%**, complexidade/ESLint PASS (mesmo aviso CLI 12), Semgrep SKIP ausente no Windows, audit N/A. Baseline não atualizada; tools/, configuração do gate, workflows e manifesto intactos.

Screenshots acima substituídas após executar o código novo: 1440 × 1240 e 390 × 1050 px, só fixture fictícia e armazenamento TEMP. Conferidas a preposição de, Em planejamento, cinco semanas de outubro, fundo lateral até o rodapé e Lista no celular. Aplicação aberta em loopback; +1 no dia mostra as duas peças com rótulos legíveis.

### Pendências mantidas por decisão do autor

- **M3:** avisos usam índice após remoção de vazios/outra marca, podendo diferir da linha física. Resolver junto com os avisos da **US3/US5**, preservando a origem de cada registro; não corrigido nesta revisão.
- **M8:** nenhuma alteração de implementação ou do gate/CI. Playwright está em **SKIP no CI** (nove casos locais) e a UI não entra no LCOV de Node. A hipótese de o CLI também ficar fora do LCOV não se confirmou na verificação posterior abaixo; não foi necessário corrigi-lo.
- Normalização de null explícito para célula vazia permanece como dívida já registrada; envelope privado conserva o original.

Revisão independente somente leitura das alterações contra 8359604: zero Critical, regressão, segurança ou achado novo. Este é o registro pré-push de 04/10/2026: novo gate/review do head corrigido e decisão de merge ainda serão conferidos no GitHub; o merge exige gate verde e ausência de Critical, regressão ou segurança no review novo.

## Aceite remoto e evidência complementar do head ab3b036

Em 04/10/2026, o [gate Linux corrigido](https://github.com/Browsher/crm-social/actions/runs/37195637952/job/111416798742) concluiu **SUCCESS**, no head ab3b036542d6fa9cee5f15b8bd56d3f161129e0c: tests, coverage, complexity e Semgrep **PASS**, audit N/A, exit 0, baseline não atualizada. Semgrep **1.179.0** foi instalado e executado no Linux. O check quality-gate é obrigatório na main, com base atual exigida; nenhuma regra foi alterada.

O [novo review do Claude](https://github.com/Browsher/crm-social/pull/6#issuecomment-5979068911), [execução SUCCESS](https://github.com/Browsher/crm-social/actions/runs/37195637947/job/111416798724), não trouxe Critical. Generate-tests/publish-tests ficaram SKIPPED porque não houve rótulo gerar-testes. Segue a classificação técnica dos achados novos, sem ampliar o recorte:

- **I1 — ID novo com completedAt antigo/igual:** comportamento já presente antes desta correção, confirmado contra 8359604; não é regressão da rodada. O contrato não define rejeição por ordem temporal de IDs novos. Permanece questão de política de importação para decidir com o autor na US2, antes da captura operacional: rejeitar captura anterior/igual à vigente ou admitir consulta histórica explícita? Não foi escolhida uma regra nova nem alterada a persistência. O estado atual é captura_local_provisoria, sem afirmar sincronização concluída hoje.
- **I2 / M8 — cobertura e evidência:** a execução local foi repetida no head exato ab3b036 com o mesmo escopo de cobertura do gate: **67 PASS / 0 FAIL / 0 SKIP**, 7,51 s; os nove casos reais de UI passaram. O LCOV contém **scripts/importar-captura.cjs: 44/44 linhas**, portanto a hipótese de ausência do CLI estava incorreta. A UI continua fora do LCOV de Node e em SKIP no CI. Nenhuma ferramenta, configuração ou mecanismo de cobertura foi modificado.
- **M-a — motivo de erro:** endurecimento preventivo, sem vazamento atual reproduzido. Erros de leitura/JSON da entrada são substituídos por textos fixos; parsing do estado privado é encapsulado; erros de filesystem com code são saneados; validação e conflito usam mensagens próprias, sem interpolar valores de células/caminhos. A mensagem sintética sem code do teste não demonstra um vetor via arquivo JSON. Uma lista fechada de motivos permanece proposta de manutenção, sem alteração nesta rodada.
- **Demais Minor:** teste do entrypoint HTTP/argumentos (M-b), uso futuro de relógio/mapa (M-c), precisão de linha documental e aresta nativa do CLI (M-d/M-e), manter innerHTML do mockup fora da aplicação (M-f), linha física dos avisos já adiada à US3/US5 (M-g) e registrar a escolha segura de Object.fromEntries para cabeçalhos (M-h). Não foram corrigidos por consequência deste review.

Análise independente desses achados: nenhum Critical, regressão desta rodada ou problema de segurança atual identificado. O merge permanece condicionado aos checks verdes e ao review do head final, incluindo esta evidência documental.

Evidências locais sanitizadas, capturadas em ab3b036 e sem dados operacionais ou caminhos pessoais:

- [Saída completa node:test, incluindo os nove casos UI](../../docs/reports/001-pr6-node-test.txt).
- [quality-gate-report.json preservado com outro nome de evidência](../../docs/reports/001-pr6-quality-gate.json): testes 67, cobertura 96,06%, complexidade máxima **12**, nenhum valor ≥21; Semgrep SKIP apenas no Windows.
- [LCOV com caminhos relativos](../../docs/reports/001-pr6-lcov.info): CLI 44/44, captura 120/120, projeção 94/94, quadro-config 31/31, servidor 37/56 e snapshot 124/126. O helper tests/fixtures.cjs também aparece (87/88); a configuração atual não o exclui. Esses percentuais não comprovam cobertura de branches nem da UI.

Só documentação/evidências muda após ab3b036; código/testes/gate permanecem os mesmos. Os links acima são registros dessa execução específica, sem alegar que a captura operacional ou as demais histórias foram aceitas.
