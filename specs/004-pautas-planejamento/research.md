# Pesquisa — 004
- **Decisão**: estender opcionais da captura v1. **Motivo**: Meses já prova o fluxo; preserva histórico. **Alternativa descartada**: versão nova/migração, desnecessárias.
- **Decisão**: resolver vínculos no backend por ID exato e mesma marca/início. **Motivo**: uma regra para todos os consumidores. **Alternativa**: join no navegador duplica semântica.
- **Decisão**: Pautas estruturadas substituem só a lista do mês quando há linhas válidas. **Motivo**: preserva fallback 003. **Alternativa**: mostrar resumo e linhas juntos duplica texto.
- **Decisão**: gerador sintético separado. **Motivo**: conserva galeria anterior e permite repetir os cenários 004.
- **Documentação conferida via Context7 em 07/10/2026**: [Sheets batchGet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet), ranges retornados na ordem pedida; metadados determinam opcionais. [Playwright](https://github.com/microsoft/playwright/blob/main/docs/src/clock.md), relógio fixo e screenshot/contexto existentes.
- Campos foram entendidos por consulta somente leitura ao contrato externo autorizado; nenhum conteúdo operacional foi incorporado. Não há lacuna de desenho pendente.
