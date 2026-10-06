# Tasks — 002 Planilhas (24 tarefas)

Spec/plan/contrato vigentes nesta pasta. TDD com RED observado antes de GREEN; cinco camadas, dados sintéticos, nenhum Google real. Dependências na ordem abaixo; um dono por arquivo. Conta preparada e demonstração T021 conferida; 24/24 tarefas. PR original preservado; fechamento em PR autorizado com merge condicionado a gate/review vigentes.

## Fase1 — Governança
- [x] T001 Registrar decisões em validacao.md, aplicar constituiçãoVI/1.1.0/Last Amended2026-10-05, reduzir spec/plan/contrato/modelo/pesquisa/quickstart/tasks, adiar auxiliares no ROADMAP e repetir speckit-analyze: só LOW pode sobrar. FR-008/009.

## Fase2 — Cliente nativo
- [x] T002 RED tests/google.test.cjs: JWT assinatura RSA gerada, scope/aud/exp, caminho externo/env/config inválida, sem segredo em erro. FR-002/003, SC-003.
- [x] T003 GREEN src/google.cjs: configuração lexical/chaveRSA e JWT RS256 nativo, sem biblioteca/package.json. FR-002/003.
- [x] T004 RED tests/google.test.cjs: troca OAuth fixo, tokenRAM/expiração, GET Sheets, timeout/redirect e batchGet tipada, falhas acesso/rede sem echo; OAuth200 valida access_token string, Bearer e expires_in finito positivo, corpo inválido é rede. FR-001/002, SC-003.
- [x] T005 GREEN src/google.cjs: fetch injetável e getMetadata/batchGet, signal/redirect:error e mensagens fixas. FR-001/002.

## Fase3 — Captura e persistência
- [x] T006 RED tests/coleta.test.cjs: seis ranges alocados, batchGet×2, metadados/hashes iguais, números/bools/strings/datas, invalidez/mudança e source direto/legado; datas a milissegundo e horário civil ambíguo/inexistente recusado. FR-001/004, SC-001.
- [x] T007 GREEN src/coleta.cjs/src/captura.cjs: construção v1 seis/66, datas declaradas, mesmo hash/validação; exportar helpers existentes, sem perfil novo. FR-001/004.
- [x] T008 RED tests/atualizacao.test.cjs: trava durante await, CLI concorrente/cleanup e promoção única em TEMP real. FR-006.
- [x] T009 GREEN src/snapshot.cjs: atualizarCaptura async, mesmo lock/helpers, close/unlink separados e avisos[] fixos. FR-005/006.
- [x] T010 RED tests/atualizacao.test.cjs: um teste por quatro categorias, preservar bytes/data; falha confirmada versus I/O sem confirmação, no-op/GET não limpam falha. FR-005, SC-002.
- [x] T011 GREEN src/snapshot.cjs/src/google.cjs/src/coleta.cjs: recibos/motivos fixos, categorizar falhas sem dado bruto e preservar vigente/data. FR-005.

## Fase4 — HTTP e tela
- [x] T012 RED tests/servidor.test.cjs: POST local{} e guards400/403/413/415/405, sem rede antes de guarda; GET sem rede, categorias/aviso seguro. FR-006, SC-003.
- [x] T013 GREEN src/servidor.cjs: atualizar injetável/default, await protegido, loopback e POST; erro seguro sem captura/config. FR-001/006.
- [x] T014 RED tests/projecao.test.cjs: fonte direta legível e whitelist66/tipos, Central intacta. FR-004/007.
- [x] T015 GREEN src/projecao.cjs: origem enum direta, mesmos vínculos/projeção segura. FR-007.
- [x] T016 RED tests/atualizacao-interface.test.cjs: botão pendente/sucesso/falha, preservação de dados/filtros/recuperação e GET falhando, 1440/390 sem pageerror. FR-007, SC-004.
- [x] T017 GREEN src/web/app.js/index.html: POST→GET, mensagem curta role=status, botão disabled atéfim/finally, sem Google no browser. FR-001/007.

## Fase5 — Aceite e PR
- [x] T018 Verificar importador/GET legado sem chave/rede e suíte cinco camadas sintética em tests/; nenhum pacote de aplicação. FR-008/009, SC-003/004.
- [x] T019 Gerar screenshots sintéticos1440/390 para atualizando/sucesso/falha em docs/design/screenshots e vincular somente em validacao.md. SC-004.
- [x] T020 Revisão independente dos riscos do plan e análise consistente; corrigir Critical/Important/segurança/regressão com RED, resto LOW registrado em validacao.md. FR-009.
- [x] T021 Conta/read-only/chave externa/compartilhamento preparados pelo autor; demonstração real autorizada e conferida em 05/10/2026. Inteiros textuais canônicos dos campos numéricos normalizados na coleta direta após RED/GREEN sintético; contagens, hashes, selo, tipagem e Histórico passaram. Categorias remanescentes preservadas, sem valores privados; evidência em validacao.md. FR-008.
- [x] T022 Penúltima etapa técnica: node --test e node tools/quality-gate.mjs locais verdes com config vigente; registrar estados reais em validacao.md sem afrouxar baseline/checks. FR-009, SC-004.
- [x] T023 Última etapa técnica: doc-sync-onboarding para README/AGENTS fora do bloco/ROADMAP/índice/arquitetura/módulos/project-structure≤60; estado real/limites e links de validação. FR-009.
- [x] T024 Commit/push002 e UM PR sem merge; gate Linux verde e review publicado do head, links/comentário/checks em validacao.md. FR-009, SC-004.

## Rastreabilidade/dependências

FR-001:T004–T007/T012–T013/T016–T017; FR-002:T002–T005; FR-003:T002–T005/T012; FR-004:T006–T007/T014–T015; FR-005:T008–T011; FR-006:T008–T009/T012–T013; FR-007:T014–T019; FR-008:T001/T018/T021; FR-009:T001/T018/T020/T022–T024. SC-001:T006–T009; SC-002:T010–T011/T016–T017; SC-003:T002–T005/T012–T013/T018; SC-004:T016–T020/T022–T024.

Pares RED→GREEN sequenciais; T021 concluída no aceite real autorizado; evidências sanitizadas na validação. Testes existentes já verdes contam como cobertura reaproveitada, nunca fabricar RED. Cada tarefa concluída marca[x] e registra prova; nenhuma conta real é necessária para os testes automatizados. Autorização atual da T021 permite demonstração e merge nas condições registradas; limites anteriores permanecem históricos.
