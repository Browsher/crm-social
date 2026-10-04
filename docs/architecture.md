# Arquitetura

O CRM é como um álbum de capturas: a Central entrega uma fotografia da operação e o leitor local a apresenta. Em 04/10/2026, antes da implementação, há documentação e ferramentas de qualidade; nenhum servidor do aplicativo está implementado.

## Estrutura observada

~~~mermaid
flowchart LR
  Regras[AGENTS e constituição] --> Feature[Spec / plano / contrato / tarefas]
  Feature --> Design[docs/design/telas.md]
  Gate[tools/quality-gate.mjs] --> Core[gate-core.mjs]
  Gate --> Tests[gate-tests.mjs]
  Gate --> Scope[gate-scope.mjs]
  Gate --> Complexity[gate-complexity.mjs]
  Gate --> Security[gate-security.mjs]
~~~

O código real do gate está em tools/; ESLint e lock isolam suas dependências. Os workflows instalados executam o gate e publicam review. O runtime da aplicação, seus imports e suas rotas ainda são planejados no [plano](../specs/001-consulta-local-producao/plan.md).

## Fronteiras e pegadinhas

data/ é privada e ignorada. Nenhuma captura operacional é necessária para implementar: fixtures serão sintéticas e persistidas somente em TEMP. O servidor futuro escutará em 127.0.0.1 e não herdará os conectores autenticados da Central.

O Node padrão do PATH é 24.14.0; o runtime existente selecionado para a feature é 24.19.0. Configure CRM_NODE_PATH fora do repositório. Playwright existe no runtime compartilhado e ainda não é dependência do aplicativo.

O gate usa node --test, e a cobertura não detecta fonte nunca carregada. Portanto cada módulo novo terá teste próprio. O review já validado no PR #5 usa kit 0.4.8, embora textos históricos do CRM ainda indiquem aceite pendente: esses estados serão sincronizados na entrega.
