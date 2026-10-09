# Validação — manutenção visual pós-006

Como pequenos ajustes numa página da agenda, esta manutenção melhora a apresentação sem mudar a leitura dos dados. A 006 segue concluída e integrada, 32/32 tarefas, pelo PR #25/merge `c4660d78c188793dddac3f44f4d42401a3542a83`; seu fechamento documental pelo PR #26 é a base main `596dc4f`.

Manutenção autorizada em 09/10/2026, sem nova feature Spec Kit nem reabertura de tarefas. Branch `codex/006-ajustes-visuais`: implementada/testada localmente, não integrada. Checks e review do head final são registrados no [PR #27](https://github.com/Browsher/crm-social/pull/27); esta prova local não declara aprovação de CI remoto. Entrega da manutenção sem merge.

## Escopo e fonte

Fonte atual de código/testes/depois: `7939e70524c5fa6d20600f2216433d9dfa0077f2`. A primeira prova `028778a63e417da3a0c4115bc1b952595fafd106` e os checks/review do head 910 permanecem históricos no PR #27.

| Ajuste | Comportamento verificado |
| --- | --- |
| Avatar em instagram/styles | Círculo de 40 px/borda 2 px; fonte min(10,30/sigla-normalizada.length): 1–3 usa 10 px, 4 usa 7,5 px, 5 usa 6 px. Validação original 1–5, maiúsculas e fallback preservados; cinco letras largas e expansão Unicode testadas. |
| Salvar em instagram | SVG decorativo com traço currentColor, aria-hidden/focusable=false; o teste confere diretamente o atributo focusable=false. Substitui o emoji sem acrescentar ação. |
| Pauta em app | Tema vazio/somente espaços deixa só o rótulo em Semana, Produção e fallback, sem separador pendente. |
| Semana móvel em app | Em 390, nova semana sem hoje nem memória começa em scroll 0; restauração, filtro e hoje preservados. |

Não muda API, captura, coleta, projeção, cache, configuração de perfil, dependências ou tecnologia. As notas de arquitetura somente completam a tabela dos estáticos existentes e identificam a apresentação Planilha como histórica 001–005. [Spec](../../specs/006-layout-v3/spec.md), [interface](../modules/web.md), [prévia](../modules/instagram.md) e [arquitetura](../architecture.md).

## Testes e gate

Fixtures exclusivamente sintéticas. Primeira rodada histórica 028778a: **RED 14 FAIL/0 SKIP, exit 1 → GREEN 14 PASS/0 SKIP**, revisão independente do código **Critical 0, Important 0, Minor 0**. O review automático do head 910 apontou três Minor (cinco letras, fonte pequena para sigla curta e teste SVG), resolvidos nesta rodada: **RED 4 FAIL/0 SKIP → GREEN 14 PASS/0 SKIP** em `tests/instagram-interface.test.cjs` e `tests/layout-interface.test.cjs`. Checks/review do head final ficam no PR #27; os anteriores não aprovam a nova fonte.

| Camada | Prova nesta manutenção |
| --- | --- |
| Interface | Novos casos focais de avatar/SVG/pauta/rolagem e regressões existentes exercidos pelo gate completo. |
| Regras de dados/validação | N/A para comportamento novo: sem alteração; suítes existentes executadas no gate completo. |
| Persistência/I/O | N/A para comportamento novo: sem alteração; suítes existentes executadas no gate completo. |
| Serviços/projeções | N/A para comportamento novo: sem alteração; suítes existentes executadas no gate completo. |
| HTTP/API/segurança | N/A para comportamento novo: sem alteração; suítes existentes executadas no gate completo. |

Gate oficial `node tools/quality-gate.mjs`, Windows/Node 24.19.0, fonte 7939e70: **PASS, 766 testes**, cobertura **95,5216989843%**, complexidade PASS (**689 métricas, máximo 16, 18 avisos**), **exit 0**, `baselineUpdated=false`. Semgrep **SKIP local** por ferramenta ausente; audit **N/A**, zero dependências de aplicação. A prova oficial anterior 028778a teve os mesmos totais de testes/cobertura/complexidade, exit 0 e baseline preservada; o [relatório sanitizado atual](006-ajustes-visuais-local-gate.json) identifica 7939e70. Não atribuir SKIP remoto, Semgrep PASS remoto ou cobertura de UI ao resultado local: módulos DOM continuam fora do LCOV e são exercidos pelo Playwright.

## Adjudicação do review — head 05f67af

O [review automático](https://github.com/Browsher/crm-social/pull/27#issuecomment-6087251563) do head `05f67af720a0ab04cb5d5f446feddd7f3fd5159b` registrou **Critical 0, Important 0 e três Minor**. A revisão independente confirmou a disposição segura: dois Minor aceitos/documentados, sem alteração de código, validação ou literal.

| Achado | Disposição |
| --- | --- |
| M1 — expansão Unicode | Aceito: o cálculo usa `.length` UTF-16 após maiúsculas; cinco ß tornam-se dez S e usam fonte de 3 px, explicitamente pequena. Melhor legibilidade permanece sugestão futura; fallback e validação original preservados. |
| M2 — prova de ausência de pulos | Fechado por execução complementar `node --test` com TAP no Windows/Node 24.19.0, head 05f67af: **766 PASS, 0 FAIL, 0 SKIP, 0 cancelled, exit 0**, duração **213260,1186 ms**. |
| M3 — painel de objetivo/pautas | Aceito: mantém “Não informado” para tema vazio. Omitir separador aplica-se somente a Semana, Produção e fallback, conforme escopo. |

A prova de **0 SKIP da suíte completa pertence exclusivamente à execução complementar TAP do head 05f67af**; não é atribuída retroativamente ao gate 7939e70, cujo relatório compacto não guarda esse contador. O [CI estrito 05f67af](https://github.com/Browsher/crm-social/actions/runs/37976138751/job/113974803004) foi conferido pelo coordenador: SUCCESS, Semgrep PASS, exit 0 e baseline preservada. Essa prova é por head e ficará histórica após o fechamento documental; checks/review do head final são registrados no PR #27. Código e PNG continuam na fonte 7939e70; 006 integrada, 32/32 tarefas; manutenção não integrada e sem merge.

## Evidência visual e limites

[Oito PNG antes/depois](../design/screenshots/LEIA-ME.md#006--ajustes-visuais): quatro anteriores da fonte 596dc4f e quatro posteriores novamente gerados na fonte 7939e70, claro/escuro × 1440/390. Os bytes depois são idênticos aos da prova 028778a porque DEMO conserva quatro letras/fonte 7,5 px; a regeneração comprova a fonte atual sem alterar os históricos. Gerador existente `scripts/screenshots-layout-v3.cjs.gerar({output:temporario})`: vinte PNG por fase em saída customizada; somente quatro Instagram de cada fase copiados à nova galeria. Históricos A/B e demais PNG intactos.

A evidência sintética não demonstra acesso real ao Drive/Instagram, arrasto físico, leitor de tela real ou publicação. Esta rodada não altera a seleção de mídia nem a política aprovada de retorno de foco.

## Disposição das observações recebidas

| Referência recebida | Disposição |
| --- | --- |
| 24/M1 e 24/M3 | Tratadas pelos ajustes visuais desta manutenção e seus testes. |
| 25/M4 | Tabela HTTP inclui os estáticos existentes layout-model.js, perfil-config.js e instagram.js em GET/HEAD, sob as mesmas guardas. |
| 25/M5 | Parágrafos API/Planilha em arquitetura e interface 001 em AGENTS identificados como históricos 001–005; dados continuam na API. |
| 24/M2 (cache) e 25/M1 (falha de módulo) | Fora deste ajuste visual; nenhum comportamento correspondente alterado. |
| 25/M2 (foco fallback) e 25/M3 (gatilho removido) | Contrato aprovado preservado, sem nova política de foco. |
| 25/M6 | Decisão já registrada, sem nova emenda ou autorização. |

Doc-sync-onboarding aplicado como última etapa após o gate, somente Markdown. Sonnet/Haiku indisponíveis neste host: documentação usa o modelo herdado disponível. Não houve nova execução de testes por este fechamento documental.
