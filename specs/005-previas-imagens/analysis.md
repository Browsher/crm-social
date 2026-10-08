# Análise do planejamento — 005

Como conferir um roteiro antes da execução, esta análise verifica a coerência dos documentos; não comprova comportamento implementado.

**Data:** 2026-10-08. **Base integrada:** [PR #22](https://github.com/Browsher/crm-social/pull/22), main `b90980a15fad653937fd024ac3c9bb2738e9d99a`. **Estado na análise de planejamento:** 21 tarefas geradas, 0 executadas; implementação então parada pelo limite de 20 do autor. Após receber essa distribuição, o autor aprovou as 21 tarefas e autorizou a implementação em 2026-10-08. O progresso vigente está em [tasks.md](tasks.md).

## Revisão independente

`speckit-analyze`, executado por subagente somente em leitura, comparou [spec](spec.md), [plano](plan.md), [tarefas](tasks.md) e constituição 1.2.0. Os 15 requisitos funcionais e cinco critérios de sucesso têm tarefas associadas: **20/20 cobertos no planejamento**, sem tarefas órfãs, ciclos ou conflito de responsabilidade. Isso é rastreabilidade documental, não cobertura de testes.

Não foram encontrados achados Critical, High ou Medium, nem conflito constitucional. A análise inicial encontrou uma ambiguidade LOW em FR-010: “sem detecção automática de tipo” poderia parecer impedir a conferência obrigatória de assinatura. O coordenador esclareceu **bytes conferidos no servidor e `nosniff` no navegador**; a rechecagem independente confirmou a correção. Nenhuma mudança de escopo decorreu desse ajuste.

Escopos separados, captura vigente como autoridade, transporte fixo, bytes/tamanho/hash, cache privado, demanda da peça aberta e falha localizada estão rastreados. Compartilhamento pelo autor é externo e não bloqueia testes falsos. A galeria de Pronta usa a hipótese declarada de imagens vinculadas vigentes, sem extrair ZIP nem atribuir resposta ao autor.

## Peso e parada obrigatória

| Área | Tarefas | Quantidade |
| --- | --- | --- |
| Preparação, incluindo ação externa do autor | T001–T002 | 2 |
| Transporte privado e regras de bytes/referência | T003–T006 | 4 |
| Cache/serviço, HTTP e galeria, com RED antes de implementar | T007–T012 | 6 |
| Falha visual localizada | T013–T014 | 2 |
| Ampliação, Escape e foco | T015–T016 | 2 |
| 12 screenshots, gate, doc-sync, review e PR/CI | T017–T021 | 5 |
| **Total** | **T001–T021** | **21** |

São **20 tarefas do agente e uma externa do autor**. A maior parte está nas três fronteiras distintas de cache/serviço, HTTP e interface, cada uma com provas antes da implementação, além do fechamento exigido. A tarefa externa permanece na contagem; itens não foram agrupados para contornar o limite.

Por determinação do autor, aquela rodada terminou no planejamento para apresentar esse peso, sem código, teste, gate de comportamento ou screenshot da 005. O PR rascunho de planejamento não concluiu T021. A autorização posterior permite implementar e completar o mesmo PR #23, com gate, review e screenshots; as provas ficam na validação da implementação. Nenhum merge da 005 está autorizado.
