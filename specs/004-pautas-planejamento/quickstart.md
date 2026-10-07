# Validação rápida — 004
Usar Node 24.19.0 existente, seu diretório primeiro no PATH e Playwright existente em CRM_PLAYWRIGHT_MODULE. Não definir CI no Windows. Todos os testes usam fixtures/cliente falso e TEMP.

```powershell
& $env:CRM_NODE_PATH --test tests/pautas.test.cjs
& $env:CRM_NODE_PATH --test tests/pautas-interface.test.cjs
& $env:CRM_NODE_PATH scripts/screenshots-pautas.cjs
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```
Esperado: quatro pautas, S2 do autor, navegação/origem, Planilha opcional, fallback sem pautas; nenhum acesso externo. Galeria: três cenários obrigatórios, mais gaveta e Planilha, em 1440/390 e claro/escuro. Gate normal local deve passar; CI estrito comprova scanner disponível no ambiente remoto. Não confundir CI com aceite de UI Windows. Resultados na [validação](validacao.md); nenhum teste comprova operação editorial real.
