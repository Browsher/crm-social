# Specification Quality Checklist: Consulta local da produção NTV

**Purpose**: conferir o recorte antes do plano de implementação.

**Created**: 2026-10-02 | **Updated**: 2026-10-03

**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] Especifica valor e comportamento sem impor framework ou código.
- [x] Foca em consulta da produção e compreensão do estado.
- [x] Seções obrigatórias preenchidas, sem placeholders.

## Requirement Completeness

- [x] Cinco histórias de Planejamento, frescor, gaveta do dia, quadro e Planilha definidas.
- [x] Critérios mensuráveis e sem promessa de integração concluída.
- [x] Falhas de captura, identidade, versão, datas e mídia ausente contempladas.
- [x] Fronteiras com features 002–006 e leitura direta futura da 002 explícitas.
- [x] Atualização manual por captura distinguida de sincronização contínua.
- [x] Semana histórica de quatro peças preservada.
- [x] Menu da 001 e objetivo mensal indefinido, sem Plano do mês ou fonte inventada.
- [x] Calendário/lista semanal e gaveta do dia inteiro, acordeão e foco definidos.
- [x] Contagem global N sem data e seção semanal no quadro preservam todas as peças.
- [x] Somente oito etapas confirmadas em Mídia; desconhecido/vazio/arte_aprovada em Outras.
- [x] Publicada exige publicado_em explícito ISO com fuso válido/coerente.
- [x] Responsável atual registrado separado do responsável de correção, sem encaminhamento inferido.
- [x] Planilha inclui os 66 cabeçalhos/valores mínimos locais; extras somente na captura privada.
- [x] Histórico completo/falhou confirmado no estado local, com recibos imutáveis, órfãos excluídos e última válida preservada; erro de persistência explícito.
- [x] Quatro selos e precedência da falha definidos; nova tentativa aceita encerra erro sem apagar histórico.
- [x] Celular de 390 px usa lista semanal, gaveta cheia e rolagem própria das tabelas.

## Feature Readiness

- [x] Requisitos podem ser ligados a testes de dados e fluxos de usuário.
- [x] Escopo pode ser demonstrado independentemente das próximas features.
- [x] Nenhuma instalação do agente mensal ou escrita remota implícita.

## Notes

Revisão documental atualizada em 03/10/2026 contra as fontes autorizadas e a decisão UI.
Marcas nesta lista significam qualidade da especificação, não requisitos implementados
ou cenários de software executados. FR-001–FR-012 preservados e atualizados;
FR-013–FR-016 acrescentados. Branch 001 real; aplicativo continua não implementado.

## Análise de consistência — 03/10/2026

A skill `speckit-analyze` foi executada em modo somente leitura contra spec, plano,
tarefas e constituição. O script de pré-requisitos identificou a feature 001 e
research/modelo/contratos/quickstart/tasks. Os hooks de commit antes/depois da análise
eram opcionais; nenhuma invocação do `specify` real foi necessária. As correções
documentais abaixo foram feitas depois da análise, conforme autorização do autor.

| Achado inicial | Gravidade | Correção e localização |
| --- | --- | --- |
| I1: recibo completo preparado podia aparecer como conclusão aceita após interrupção; repetição dos bytes podia impedir nova promoção | Alta | Contrato/modelo/plano/T005–T006/T029: confirmar captura e IDs do Histórico no mesmo estado atômico, excluir órfãos, revalidar bytes ainda não aceitos e relatar erro de persistência sem promessa falsa |
| I2: sete suítes exigidas sem distinguir CI Linux de interface/PowerShell disponíveis no computador | Alta | Plano/quickstart/T015/T033/T035: cinco suítes portáveis obrigatórias no CI, pulos explícitos por aplicabilidade; aceite Windows com sete suítes, cinco camadas e zero casos pulados |
| I3: quickstart selecionava o Node do PATH, que era 24.14.0, apesar do runtime 24.19.0 escolhido | Média | Plano/quickstart/T001/T007/T033: seleção por CRM_NODE_PATH, validação da versão, process.execPath nos testes CLI e -NodePath no iniciador |
| I4: teste HTTP dos estáticos precedia sua criação, sem fixture ou diretório injetável definido | Alta | Contrato/plano/T011–T012: webDir confiável e três estáticos sintéticos em TEMP; allowlist fixa, sem seleção por parâmetro HTTP |

Nova conferência independente fechou os quatro achados, sem outra inconsistência
material ou violação da constituição 1.0.0. Métricas finais: **25 requisitos**
(16 FR + 9 SC), **39 tarefas**, todas desmarcadas; **100% de cobertura documental**,
zero requisitos/tarefas sem mapeamento, zero ambiguidades materiais pendentes,
zero duplicações materiais e zero achados críticos. A [matriz de cobertura](../tasks.md)
identifica os testes e tarefas de cada FR/SC.

Próxima etapa: implementar a 001 conforme o plano e os pares RED/GREEN das tarefas,
em uma rodada autorizada para código. Esta análise não executou os testes planejados,
não validou a captura real e não comprova aplicativo funcional.
