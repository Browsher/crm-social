---
name: cyclomatic-complexity
description: Interpreta complexidade ESLint do gate e refatora por risco com testes verdes.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

Leia AGENTS.md, a spec e quality-gate-report.json recente; se faltar resultado, rode node tools/quality-gate.mjs --strict no escopo autorizado. Não instalar Radon/ ferramentas Python ou adicionar dependência ao app. A contagem é ESLint classic; não inferir CC de memória nem usar escala de linguagem diferente.

| Rank | CC | Ação |
| --- | --- | --- |
| A | 1-5 | Simples; manter |
| B | 6-10 | Estruturado; manter |
| C | 11-20 | Aviso; observar e refatorar ao tocar |
| D | 21-30 | Alto risco; refatorar função nova/pior |
| E | 31-40 | Prioridade alta |
| F | 41+ | Separar responsabilidades |

Use metrics/warnings da checagem complexity, com arquivo/linha/value. Gate reprova nova/pior >=21 e permite legado inalterado somente em baseline válida. Atualizar baseline exige comando explícito; não usar --update-baseline para fazer uma regressão desaparecer. Identidade de callbacks é conservadora: editar tokens pode mudar identidade; contextos duplicados não recebem tolerância. Atualizar ESLint exige rodar a suíte do gate por causa de eslint/use-at-your-own-risk.

Priorize risco de negócio, superfície de segurança e cobertura; número isolado não mede qualidade nem manutenibilidade. MI não é calculado pelo gate Node: não reportar MI ou inventar valor.

Refatore apenas depois de testes GREEN com a skill tdd-workflow. Padrões: guard clauses para reduzir aninhamento (podem não reduzir CC); dispatch por Map para casos discretos; regras de validação independentes; separar parsing/I/O de decisão pura; separar funções por responsabilidade coesa. Teste sucesso/erro/default; não ocultar complexidade em helpers artificiais ou dividir só para baixar número.

Depois compare métricas/identidades e rode a suíte pertinente e o gate. Acione doc-sync-onboarding por último quando fronteiras/imports mudarem. Retorne tabela antes/depois com valores medidos, testes/exits e limite de baseline aplicado, sem alegar diminuição sem medir.
