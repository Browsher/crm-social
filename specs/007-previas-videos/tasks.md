# Tasks: Prévias de vídeos
## Setup
- [x] T001 Registrar pedido, limites e contratos em specs/007-previas-videos/.
- [x] T002 Conferir baseline e runtime existente nas suítes tests/midia*.test.cjs e tests/instagram-interface.test.cjs.
## US1 — Capas e reprodução
- [x] T003 [P] [US1] Escrever RED para validação/cache/HTTP em tests/video*.test.cjs; fixtures reais sintéticas em tests/video-fixtures.cjs.
- [x] T004 [P] [US1] Implementar leitura MP4 limitada e Range em src/midia.cjs, src/google.cjs, src/servidor.cjs e módulo de rota dedicado.
- [x] T005 [P] [US1] Escrever RED de seleção e navegador em tests/video-model.test.cjs e tests/video-interface.test.cjs.
- [x] T006 [P] [US1] Implementar seleção de final/capa e mostrar capas em src/web/layout-model.js e src/web/app.js.
- [x] T007 [US1] Implementar player, tratamento de play e limpeza em src/web/instagram.js e src/web/styles.css.
## US2 — Tela cheia
- [x] T008 [US2] Cobrir clique, fullscreen real, retorno e encerramento em tests/video-interface.test.cjs; implementar em src/web/instagram.js.
## Integração
- [x] T009 Registrar capas existentes dos vídeos na planilha autorizada, conferir captura operacional sem dados reais em Git.
- [x] T010 Executar regressões, revisão independente e quality gate em tools/quality-gate.mjs; registrar evidências em specs/007-previas-videos/validacao.md.
- [x] T011 Sincronizar somente documentação afetada e emenda de leitura de vídeo em .specify/memory/constitution.md.
- [x] T012 Instalar arquivos verificados na instância local e demonstrar capa, reprodução e tela cheia; preservar backup.
## Dependências e paralelismo
T001→T002. Backend T003→T004 e frontend T005→T006→T007 podem executar em arquivos distintos sob contrato de rota congelado. T008 depende de T007. T009 pode ocorrer durante implementação. T010→T011→T012.

## Estado em 2026-10-15
T001–T012 concluídas localmente, **12/12**. Duas tentativas identificaram expectativa antiga da CSP em um teste; correção estrita RED→GREEN e terceira execução normal completa aprovada: 823/823 PASS, zero pulos de testes. Instalação reversível com backup e demonstração ocorreu após revisão/regressões focadas, enquanto o gate completo final ainda executava; T010 só foi encerrada após o resultado verde. Semgrep indisponível; [evidências e limites](validacao.md). Conclusão local não significa integração Git.
