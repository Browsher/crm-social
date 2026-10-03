---
name: tdd-workflow
description: Executa Red Green Refactor em Node preservando spec e camadas aplicáveis.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash
---

Leia AGENTS.md, constituição, spec/tarefas e código pertinente. Confirme arquivos sob sua responsabilidade; outros agentes podem estar editando. Use node:test e node:assert/strict, sem frameworks novos.

1. RED: escreva um teste pequeno da regra desejada antes de implementar; rode node --test. Confirme falha por asserção do comportamento ausente, não sintaxe/ dependência. Registre comando e resultado.
2. GREEN: implemente a menor mudança que satisfaz a spec. Reexecute o teste e a suíte pertinente. Se falhar, corrija código; não mudar a asserção para aceitar bug.
3. Refactor: com GREEN observado, melhore nomes/fronteiras e reduza acoplamento. Preserve comportamento e repita testes. Não adicionar funcionalidade no refactor.

Exemplo de teste puro:

    import test from 'node:test';
    import assert from 'node:assert/strict';
    import {sum} from '../src/math.mjs';
    test('sum',()=>assert.equal(sum(1,2),3));

| Camada | Como verificar |
| --- | --- |
| Regras de dados e validação | Função pura, bordas e entrada inválida |
| Persistência e I/O | TEMP real criado com fs.mkdtemp; limpeza em finally e falhas de I/O |
| Serviços e projeções | Compor regras, testar sucesso/erro e idempotência pertinente |
| Servidor HTTP | Servidor real 127.0.0.1, porta efêmera; GET/HEAD/405, Host/Origin e erros |
| Interface | Playwright só local, já disponível e autorizado; fluxo, teclado e telas pequenas |

Registre N/A com motivo para camada inaplicável, pendência para camada aplicável não exercitada. Não declarar todas verdes quando a interface não foi verificada; não instalar dependência só para completar a tabela. Cada módulo novo deve ter teste, pois LCOV não conta fonte nunca carregada.

Penúltima etapa: node tools/quality-gate.mjs --strict; interpretar todos os estados/exits e corrigir falha antes de concluir. Última etapa: agente doc-sync-onboarding, mantendo docs e comportamento sincronizados. Não executar hook/ commit automático nem mudar baseline para mascarar regressão.
