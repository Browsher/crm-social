# Validação local — Pronta para publicar

Como uma pasta preparada para publicação manual, o ajuste reúne o pacote e o texto da peça já liberada. Manutenção pequena autorizada em 08/10/2026, sem nova feature/Spec Kit; implementada e testada localmente. Integração depende do gate/review do head vigente.

## Fonte e escopo

Base main: `91c4b9d817e28e063456d826eff62ec75f9863d2`. Código/testes/PNG validados no commit `7748445b592b901871b300aab8c36f30b99e747b`, branch `codex/pronta-para-publicar`. O gate executou essa mesma árvore antes do commit; a sincronização Markdown veio depois. Não houve alteração posterior de código. Não há PR ou head documental final atribuído a esta evidência.

- Mapa real: `liberacaoPronta=['liberado']`; publicação preenchida vence liberação, revisão e etapa.
- `camposCapturados` compartilha a allowlist com triagem/Planilha: `Semanas.pauta_id`, `Produções.pacote_versao`/`hashtags` e `Arquivos.extensao` somente se capturados; seis abas/66 mínimos preservados e nenhuma migração histórica.
- Coleta direta normaliza `pacote_versao` textual canônico seguro antes dos dois hashes. Pacote exige candidato único, produção exata, tipo `pacote`, extensão `zip` e versão igual à versão de pacote positiva segura; ausência/ambiguidade retorna null.
- Gaveta Pronta prioriza pacote, legenda/hashtags seguras e cópia local por clique. Botão Baixar pacote permite somente HTTPS Drive sem userinfo/porta diferente da padrão. Páginas/cenas recolhidas e sem avisos de mídia nas unidades; API, contador e Planilha mantêm avisos. Cartão substitui pendências por Pronta para publicar.
- Sem endpoint, dependência, coleta operacional ou operação editorial nova.

## Execuções informadas pelo coordenador

| Rodada | Resultado e alcance |
| --- | --- |
| RED inicial | 19 testes, 6 PASS e 13 falhas de comportamento após resolver o acesso ao TEMP; UI RED confirmou ausência do cartão Pronta |
| Focada anterior | 32 PASS sem pulos, incluindo 13 UI, com geração das primeiras imagens; a fixture recebeu depois o ajuste de status sintéticos pronto/publicado |
| Gate final Windows | Node 24.19.0, 474 PASS, cobertura 94,03372243839169%, complexidade PASS/20 avisos, exit 0 e `baselineUpdated=false` |
| Regeneração visual posterior | 4 PASS nos cenários Pronta quadro, dois temas e 1440/390, gerando os oito PNG finais a partir da fixture com status sintéticos ajustados |
| Revisão independente do código/testes | Sem achados; gate confirmado. A revisão documental final é uma etapa separada antes da integração |
| Conferência visual | Coordenador inspecionou os oito PNG finais de quadro/gaveta nos dois temas e larguras |

No gate, drop 0 é o valor do modo full, sem comparação histórica. Semgrep declarou SKIP por ferramenta ausente (CE 1.179.0 configurado); audit N/A sem dependências de aplicação. UI permanece fora do LCOV; CI Linux conserva os pulos de UI/PowerShell existentes. A lógica dos 32 testes focados passou também no gate final.

Com Node/Playwright existentes configurados (`CRM_NODE_PATH`/`CRM_PLAYWRIGHT_MODULE`), fora de `CI=true`, a rodada focada usou:

```powershell
$env:CRM_SCREENSHOTS_PRONTA = '1'
& $env:CRM_NODE_PATH --test tests/pronta.test.cjs tests/pronta-interface.test.cjs tests/quadro-config.test.cjs
```

O gate foi executado como penúltima etapa, antes da sincronização documental:

```powershell
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

A regeneração final usou:

```powershell
$env:CRM_SCREENSHOTS_PRONTA = '1'
& $env:CRM_NODE_PATH --test --test-name-pattern='Pronta quadro' tests/pronta-interface.test.cjs
```

## Limites e evidência visual

Fixtures exclusivamente sintéticas em [tests/pronta-fixtures.cjs](../../tests/pronta-fixtures.cjs); persistência/HTTP em TEMP e porta efêmera. [Backend](../../tests/pronta.test.cjs) confere opcionais/legado, pacote/ambiguidades, tipagem/hashes e GET protegido. [Interface](../../tests/pronta-interface.test.cjs) bloqueia requisições externas, verifica somente GET, simula clipboard em memória e confere cópia/falha/texto literal, URLs recusadas, avisos preservados e publicação com prioridade. O clipboard pessoal não foi lido nem alterado pelos testes.

[Galeria de oito PNG sintéticos](../design/screenshots/LEIA-ME.md#pronta-para-publicar). As imagens mostram apresentação; os testes demonstram os comportamentos examinados. Não houve prova operacional, leitura da planilha real, publicação ou download real de ZIP. Seleção de registro/link não comprova disponibilidade, conteúdo ou acesso ao arquivo.
