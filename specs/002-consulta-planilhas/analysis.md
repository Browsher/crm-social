# Registro do speckit-analyze — 002

2026-10-05. Resultado da análise somente leitura, registrado após sua conclusão. Nenhuma implementação, aprovação/aplicação da emenda ou remediação automática foi executada. Entradas: spec.md, plan.md, tasks.md, modelo, contrato, pesquisa, quickstart, proposta e constituição vigente 1.0.0.

## Specification Analysis Report

| ID | Categoria | Gravidade | Local | Achado | Recomendação |
| --- | --- | --- | --- | --- | --- |
| I1 | Inconsistência | MEDIUM | contracts/leitura-planilha.md:65 | A frase “Emenda aprovada bloqueia implementação” inverte a condição definida em T001/spec/plan | Trocar por “Ausência de aprovação/aplicação da emenda bloqueia implementação”; não aplicar a emenda agora |
| C1 | Cobertura parcial | MEDIUM | spec.md:107; tasks.md:89/93; plan.md:16 | SC-007 exige 500 peças/nove abas nas cinco camadas, mas T047 nomeia somente fixtures/coleta/interface; rodar suíte completa não demonstra escala em cada camada | Explicitar o mesmo cenário em persistência, projeção e HTTP e seus arquivos, além dos já citados |
| U1 | Subespecificação | MEDIUM | contracts/leitura-planilha.md:42/53–55; tasks.md:33/63–66 | Aviso de close/unlink deve preservar resultado original, mas não há campo/código de transporte ou destino de UI/log definido | Definir enum/texto/destino e teste, ou declarar que é somente aviso de log privado |

## Coverage Summary

FR-001–FR-016 e SC-001–SC-007 têm tarefas associadas conforme [tabela de rastreabilidade](tasks.md#cobertura-rastreável). SC-007 tem cobertura parcial de profundidade (C1), não ausência de associação.

| Métrica | Resultado |
| --- | --- |
| Requisitos funcionais / critérios | 16 / 7 |
| Associação com tarefas | 23/23 = 100% |
| Tarefas | 52 únicas/contínuas T001–T052, todas desmarcadas |
| Tarefas sem associação | 0 |
| Critical / High / Medium / Low | 0 / 0 / 3 / 0 |
| Ambiguidades / duplicações | 1 / 0 |
| Inconsistências / lacunas parciais | 1 / 1 |

## Constituição e dependências

Sem conflito constitucional presente. A emenda está somente proposta; T001 exige ok/aplicação futura antes da implementação. Constituição 1.0.0 preservada. T048 exige preparo do autor somente para T049; testes usam fake. Cliente/tipos/perfil/trava/coleção e histórias têm sequência coerente. Auxiliares fora da whitelist pública e GET sem rede estão previstos.

## Próximas ações

Revisar os três ajustes documentais com o autor antes da execução; ainda não foram aplicados. Aprovar/revisar a proposta constitucional é uma decisão separada. Conta, instalação de dependências, coleta real e PR não fazem parte desta preparação.

Hooks before_analyze/after_analyze: speckit.git.commit opcionais, não executados; auto_commit está desabilitado na configuração instalada. Hook obrigatório before_specify criou a branch e before_constitution confirmou repositório existente sem mudança. Commit final dos documentos é ação explicitamente autorizada pelo autor.
