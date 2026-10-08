# Validação local — Pronta para publicar

Como uma pasta preparada para publicação manual, o ajuste reúne o pacote e o texto da peça já liberada. Manutenção pequena autorizada em 08/10/2026, sem nova feature/Spec Kit; implementada e testada localmente. Integração depende do gate/review do head vigente.

## Fonte e escopo

Base main: `91c4b9d817e28e063456d826eff62ec75f9863d2`. O código/testes/fixture do gate de 474 PASS corresponde ao commit `7748445b592b901871b300aab8c36f30b99e747b`, branch `codex/pronta-para-publicar`; os PNG finais foram regenerados depois desse gate e incluídos no mesmo commit. A sequência foi: 32 testes focados → ajuste dos status sintéticos pronto/publicado na fixture → gate de 474 PASS → regeneração visual com 4 PASS → commit `7748445` → commits somente documentais `59260f2` e `4fb9df6`. Esses dois commits posteriores não alteraram código, testes, fixture ou PNG. A entrega é acompanhada no [PR #21](https://github.com/Browsher/crm-social/pull/21); esta evidência histórica não atribui uma nova execução Windows aos heads documentais.

- Mapa real: `liberacaoPronta=['liberado']`; publicação preenchida vence liberação, revisão e etapa.
- `camposCapturados` compartilha a allowlist com triagem/Planilha: `Semanas.pauta_id`, `Produções.pacote_versao`/`hashtags` e `Arquivos.extensao` somente se capturados, inclusive em capturas antigas que já contêm esses cabeçalhos. Seleção triada sem regravar envelope, alterar bytes/hashes ou converter tipos históricos; seis abas/66 mínimos preservados.
- Coleta direta normaliza `pacote_versao` textual canônico seguro antes dos dois hashes. Pacote exige candidato único, produção exata, tipo `pacote`, extensão `zip` e versão igual à versão de pacote positiva segura; ausência/ambiguidade retorna null.
- Gaveta Pronta prioriza pacote, legenda/hashtags seguras e cópia local por clique. Botão Baixar pacote permite somente HTTPS Drive sem userinfo/porta diferente da padrão. Páginas/cenas recolhidas e sem avisos de mídia nas unidades; API, contador e Planilha mantêm avisos. Cartão substitui pendências por Pronta para publicar.
- Sem endpoint, dependência, coleta operacional ou operação editorial nova.

## Execuções históricas informadas pelo coordenador

| Rodada | Resultado e alcance |
| --- | --- |
| RED inicial | 19 testes, 6 PASS e 13 falhas de comportamento após resolver o acesso ao TEMP; UI RED confirmou ausência do cartão Pronta |
| Focada anterior | 32 PASS sem pulos, incluindo 13 UI, com geração das primeiras imagens; depois dessa rodada e antes do gate de 474 PASS, a fixture recebeu o ajuste de status sintéticos pronto/publicado |
| Gate Windows após o ajuste da fixture | Node 24.19.0, 474 PASS, cobertura 94,03372243839169%, complexidade PASS/20 avisos, exit 0 e `baselineUpdated=false`; já inclui a fixture com status ajustados |
| Regeneração visual posterior | 4 PASS nos cenários Pronta quadro, dois temas e 1440/390, gerando os oito PNG finais a partir da fixture com status sintéticos ajustados |
| Revisão independente do código/testes | Sem achados; gate confirmado. A revisão documental final é uma etapa separada antes da integração |
| Conferência visual | Coordenador inspecionou os oito PNG finais de quadro/gaveta nos dois temas e larguras |

No gate, drop 0 é o valor do modo full, sem comparação histórica. Semgrep declarou SKIP por ferramenta ausente (CE 1.179.0 configurado); audit N/A sem dependências de aplicação. UI permanece fora do LCOV; CI Linux conserva os pulos de UI/PowerShell existentes. A lógica dos 32 testes focados passou também no gate de 474 PASS.

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

## Rodada após review do PR #21

O review do head `4fb9df6` motivou a precisão documental sobre o mapa inicial da 001, os opcionais já presentes em capturas antigas, `detalhes.pacotePublicacao`, hashtags ausentes/vazias e a ordem da validação anterior. A fonte de código desta nova rodada é `eb74b23fd68978531e4b5e66a48987a2f33a3f66`: a limpeza remove `Pronta` da lista de mídia já inalcançável após seu retorno antecipado e calcula a allowlist uma vez por aba. A apresentação e os oito PNG permanecem iguais, com a conferência visual anterior preservada. Um novo caso de interface verifica revisão vigente após a seção Pronta.

| Verificação local | Resultado informado pelo coordenador e relatório |
| --- | --- |
| Suíte focada | 33 PASS, incluindo 14 UI, sem pulos |
| Gate Windows / Node 24.19.0 | 475 PASS, exit 0 |
| Cobertura | 94,05684754521964%; drop 0 em modo full, sem comparação histórica |
| Complexidade | PASS; 484 métricas, máximo 18 e os mesmos 20 avisos |
| Baseline | `baselineUpdated=false` |
| Semgrep / audit | SKIP por Semgrep ausente (CE 1.179.0 configurado); audit N/A, sem dependências de aplicação |

O [relatório sanitizado do novo gate](pronta-publicar-local-gate.json) contém a fonte, 12 hashes de arquivos, o hash do relatório original, agregados completos e todos os 20 avisos. Destaca seis funções novas/ajustadas: `camposCapturados` 2, `pacotePublicacao` 4, `prontaParaPublicar` 7, `detalhesUnidades` 5, `pendenciaQuadro` 7 e `selecionarNtv` 6. A revisão independente conferiu esses dados contra o relatório original; a baseline permaneceu intacta.

O [CI anterior do head 4fb9df6](https://github.com/Browsher/crm-social/actions/runs/37787267760) teve quality-gate PASS, incluindo Semgrep PASS; não publicou artefato remoto. Essa execução anterior e o relatório Windows acima têm fontes distintas. O novo head após a sincronização documental ainda exige seu próprio CI e review antes da integração; esta seção não antecipa seus resultados. A UI continua fora do LCOV e os pulos de UI/PowerShell no CI Linux permanecem.

## Limites e evidência visual

Fixtures exclusivamente sintéticas em [tests/pronta-fixtures.cjs](../../tests/pronta-fixtures.cjs); persistência/HTTP em TEMP e porta efêmera. [Backend](../../tests/pronta.test.cjs) confere opcionais/legado, pacote/ambiguidades, tipagem/hashes e GET protegido. [Interface](../../tests/pronta-interface.test.cjs) bloqueia requisições externas, verifica somente GET, simula clipboard em memória e confere cópia/falha/texto literal, URLs recusadas, avisos preservados e publicação com prioridade. O clipboard pessoal não foi lido nem alterado pelos testes.

[Galeria de oito PNG sintéticos](../design/screenshots/LEIA-ME.md#pronta-para-publicar). As imagens mostram apresentação; os testes demonstram os comportamentos examinados. Não houve prova operacional, leitura da planilha real, publicação ou download real de ZIP. Seleção de registro/link não comprova disponibilidade, conteúdo ou acesso ao arquivo.
