# Implementation Plan: Pautas no Planejamento

**Branch**: `codex/004-pautas-planejamento` | **Date**: 2026-10-07 | **Spec**: [spec.md](spec.md)
**Input**: Execução autorizada da 004, até 15 tarefas; contratos canônicos somente nesta pasta.

## Summary
Estender a captura v1 com Pautas opcional e Semanas.pauta_id opcional. Backend valida/resolve as pautas; UI apresenta card, navegação e origem. Sem migração histórica, nova dependência ou escrita operacional. Usar Spec Kit e Superpowers com TDD por responsabilidade e revisão independente ao final.

## Technical Context
- **Language/Version**: Node 24.19.0, CommonJS; navegador JavaScript/HTML/CSS nativos.
- **Primary Dependencies**: APIs nativas; Playwright existente somente para testes.
- **Storage**: capturas/recibos locais existentes; testes exclusivamente TEMP.
- **Testing**: node:test/assert, cliente Google falso, HTTP real em porta efêmera, Playwright Windows.
- **Target Platform**: computador local Windows, loopback.
- **Project Type**: leitor local de capturas.
- **Performance Goals**: preservar comportamento existente; quatro pautas, uma ação até semana.
- **Constraints**: somente leitura; sem dados reais/contrato operacional no repositório; gate/baseline/CI intactos; um PR sem merge.
- **Scale/Scope**: uma marca; Pautas independente de Meses; até 15 tarefas.

## Constitution Check
Antes e depois do desenho: I local/sem dependências PASS; II fonte única/capturas PASS; III CRM observador PASS; IV cinco camadas/evidência sintética previstas PASS; V spec única e execução autorizada PASS; VI escopo readonly e chave externa preservados PASS. Nenhuma emenda necessária.

## Project Structure
- Backend: `src/captura.cjs`, `src/coleta.cjs`, `src/triagem.cjs`, `src/projecao.cjs`; helper puro `src/pautas.cjs` somente se reduzir duplicação/complexidade. Preservar snapshot/servidor salvo necessidade demonstrada.
- UI: `src/web/app.js`, `src/web/styles.css`, `src/web/index.html` se necessário.
- Dados/testes: `tests/pautas-fixtures.cjs`, `tests/pautas.test.cjs` (inclui dados, I/O, projeção, HTTP), testes existentes pertinentes.
- UI/testes/evidência: `tests/pautas-interface.test.cjs`, `scripts/screenshots-pautas.cjs`, `tests/screenshots-pautas.test.cjs`, `docs/design/screenshots/pautas-*.png`.
- Documentos: esta pasta, README/ROADMAP/AGENTS, arquitetura/índice e módulos afetados; nenhum mapa Graphify existe neste checkout.

## Interfaces e responsabilidades
Backend é dono dos módulos CommonJS de dados e `tests/pautas-fixtures.cjs`, `tests/pautas.test.cjs`; UI é dona de web e `tests/pautas-interface.test.cjs`; coordenador integra documentação, screenshots e evidências. Ninguém reverte alterações de outro responsável.

`visao.pautas` existe somente quando Pautas foi capturada. Array de cópias triadas de pautas com identidade e calendário válidos e unívocos; os 12 campos são preservados. Desconhecidos em modelo/origem/status recebem aviso mas permanecem texto; não invalidam identidade/calendário por si sós. `visao.planilha` conserva todas as linhas NTV, inclusive inválidas/duplicadas.

Somente com cabeçalho Semanas.pauta_id, `semanas[].pauta_id` é copiado e `pautaOrigem` é cópia da pauta confirmada ou null. Exige ID exato, marca igual e início igual, sem associação inferida. Tabela Semanas acrescenta pauta_id somente quando capturado. Pautas vem após Meses (quando existir), antes de Histórico.

`tests/pautas-fixtures.cjs` exporta `capturaPautas()` (novembro/2026, quatro segundas 02/09/16/23, S2 origem autor, semana e peças sintéticas vinculadas à S2) e `adicionarPautas(raw, registros)`. Fixtures livres de dados reais. UI e gerador importam esse helper sem modificar `tests/fixtures.cjs`.

Card usa `visao.pautas` filtrada pelo mês; sem linhas, chama o comportamento Meses existente. IDs de destino internos vêm de inicio_semana validado. Em desktop foca calendário; em lista/mobile cria destino semanal mesmo sem peças. Contexto na gaveta deriva de todas as semanas dos registros, sem duplicar origem. Em dia vazio, considera as semanas capturadas cujo período contém a data, sempre com `pautaOrigem` já confirmada; isso não associa uma pauta à semana por data.

## Review Focus e TDD
1. Compatibilidade: hashes literais seis abas/com Meses, quatro combinações opcionais e ausência de coluna; testar antes de alterar captura.
2. Integridade: metadados/batches divergentes, falha preservando arquivo vigente e no-op; cliente falso e arquivos TEMP reais.
3. Vínculos: duplicatas ID/marca+início, data/ordinal incoerentes, outra marca, órfão, identidade redigível; avisos físicos sem ecoar valores.
4. UI: semana sem peças, atravessando mês, dia vazio e de múltiplas semanas, teclado/foco e fallback 003; teste antes do app.
5. Segurança/apresentação: texto HTML literal, URL credenciada redigida, somente mínimos públicos, nenhum request externo, contraste 4,5:1 e overflow 1440/390 dois temas.

Cada responsável escreve teste, observa RED por comportamento ausente, implementa mínimo, confirma GREEN e refatora sem ampliar escopo. Suíte completa/gate Windows ao fim; CI estrito e review do head do PR são evidências distintas. Documentação final por doc-sync-onboarding.
