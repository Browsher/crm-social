# Validação local — versões de páginas e cenas

Como um texto revisado que conserva sua fotografia, esta correção permite consultar mídia reaproveitada sem tratá-la como ausente. Manutenção pequena autorizada em 08/10/2026, sem nova feature/Spec Kit; implementada e testada localmente. A integração depende do gate/review do head final; a 005 permanece no backlog até esse merge.

## Fonte e comportamento

Base main: `5b296938dde98ff9f5f3b240ff68972870e76b9d`, que integra Pronta pelo [PR #21](https://github.com/Browsher/crm-social/pull/21). Fonte de código, testes e quatro PNG: `7b0ab46a44bfb14d80d6dffbab6ec78b06c028da`, branch `codex/versoes-paginas-cenas`. A sincronização documental posterior não atribui uma nova execução Windows ao head documental. Constituição 1.1.0 preservada.

| Regra implementada | Fonte e resultado |
| --- | --- |
| Ponteiro explícito de página/cena | `arquivoLigado`/`escopoArquivo`, em `src/projecao.cjs`: arquivo exato da mesma produção, com unidade coincidente quando preenchida; unidade vazia no arquivo é aceita. Versão da mídia pode diferir do texto |
| Vínculo quebrado ou incompatível | Null e aviso localizado; não escolhe substituto. Versão inválida do arquivo conserva aviso numérico independente, sem desfazer vínculo válido |
| Unidade vigente | `versoesUnidades`/`unidades`: maior versão inteira positiva por produção/índice inteiro positivo/tipo de unidade, separando páginas e cenas; `Produções.versao` não participa |
| Empates e inválidos | Todos os registros empatados na maior versão permanecem vigentes; índice/versão inválidos permanecem no detalhe sem vigência. IDs são exclusivos por registro; seu formato não define sequência |
| Faltas reais de mídia | `pendenciasMidia` conserva as faltas de unidades vigentes válidas mesmo com versão da produção inválida. Fallback sem unidades vigentes exige versão válida da produção |
| Gaveta | `secaoUnidades`, em `src/web/app.js`: grupos por `[vigente,versao]`, atuais primeiro e históricos recolhidos, inclusive para o mesmo número de versão. `unidadeDetalhe` mostra **imagem vN** do arquivo ligado à página |
| Contratos preservados | Revisões mantêm versão/vínculos próprios; pacote exige `pacote_versao` exata. Pronta continua recolhendo páginas/cenas e preservando avisos na API/Planilha |

O [contrato canônico](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#versões-das-unidades--manutenção-de-08102026) foi atualizado na mesma manutenção. Não há migração de capturas, nova rota, dependência, operação editorial ou mudança de fonte de dados.

## Execuções locais informadas pelo coordenador

| Rodada | Resultado e alcance |
| --- | --- |
| Preparação de teste | Erro inicial do helper TEMP corrigido; excluído da contagem de RED de comportamento |
| RED backend | 16 falhas de comportamento antes da implementação correspondente |
| RED interface | 5 falhas de comportamento antes da implementação correspondente |
| GREEN backend/projeção | 93 PASS sem pulos |
| GREEN interface | 107 PASS sem pulos |
| Testes novos | 22: 17 backend e 5 de interface |
| Gate completo Windows / Node 24.19.0 | 497 PASS, exit 0 |
| Cobertura | 94,20654911838791%; drop 0 em modo full, sem comparação histórica |
| Complexidade | PASS; 490 métricas, máximo 18 e 20 avisos |
| Baseline | `baselineUpdated=false` |
| Semgrep / audit | SKIP por Semgrep ausente (CE 1.179.0 configurado); audit N/A, sem dependências de aplicação |
| Revisão independente técnica | Sem achados; conferiu agregados do relatório sanitizado contra a saída original |
| Conferência visual | Coordenador inspecionou os quatro PNG finais, temas claro/escuro e larguras 1440/390 |

O [relatório sanitizado do gate](versoes-unidades-local-gate.json) registra execução em `2026-10-08T14:22:27.569Z`, fontes, seis hashes de arquivos, hash do relatório original, agregados e todos os 20 avisos. Os seis hashes foram conferidos pelo coordenador contra `7b0ab46`. Sete funções destacadas têm complexidade entre 1 e 12: `escopoArquivo` 1, `arquivoLigado` 4, `versoesUnidades` 5, `unidades` 2, `pendenciasMidia` 5, `unidadeDetalhe` 12 e `secaoUnidades` 10. UI permanece fora do LCOV; CI Linux conserva os pulos de UI/PowerShell existentes. Esta prova local não antecipa checks/review do head final.

Com Node/Playwright existentes configurados (`CRM_NODE_PATH`/`CRM_PLAYWRIGHT_MODULE`), fora de `CI=true`, as rodadas focadas correspondem a:

```powershell
& $env:CRM_NODE_PATH --test tests/versoes.test.cjs tests/projecao.test.cjs
& $env:CRM_NODE_PATH --test tests/versoes-interface.test.cjs tests/interface.test.cjs
```

O gate completo foi executado antes da sincronização documental final:

```powershell
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

## Evidência e limites

[tests/versoes-fixtures.cjs](../../tests/versoes-fixtures.cjs) contém exclusivamente registros sintéticos: cinco páginas de texto v3 usam imagens v2/v1/v1/v2/v3 numa produção v8; uma cena v3 usa imagens v1/v2 e vídeo v2 numa produção v9. O texto da fixture menciona mídia aprovada como cenário fictício; a consulta comprova somente o registro e o vínculo, sem inferir aprovação ou bytes.

[tests/versoes.test.cjs](../../tests/versoes.test.cjs) confere ponteiros reaproveitados, unidade vazia, recusa de produção/unidade diferente e referência quebrada, vigência por índice/produção/tipo, empates, números inválidos e pendência real com versão da produção inválida. Persistência TEMP e GET real em porta efêmera conferem captura/arquivos intactos, 405 em POST de consulta e 403 para Origin externo. [tests/projecao.test.cjs](../../tests/projecao.test.cjs) conserva a regressão do fallback sem unidades vigentes.

[tests/versoes-interface.test.cjs](../../tests/versoes-interface.test.cjs) confere cinco páginas atuais, **imagem vN**, links exatos, grupos atuais/históricos com a mesma versão, Escape e ausência de corte horizontal. Usa estado TEMP, porta efêmera, relógio sintético, somente GET local, bloqueio de requisições externas e verificação de erros de página. [Quatro PNG sintéticos](../design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas) mostram a gaveta Pronta expandida nos dois temas e larguras; não mostram todos os casos de borda.

Nenhum teste desta manutenção leu a planilha ou o CRM privado, escreveu no Google/Drive, gerou mídia editorial ou publicou conteúdo. As imagens demonstram apresentação sintética; vínculo e link não comprovam acesso, bytes ou uso editorial real.

## Conferência documental

Doc-sync final restrito aos 13 Markdown afetados: estado da manutenção, contrato, projeção/interface, roteiro, índice, galeria e este relatório. A verificação local conferiu 632 links relativos, 63 âncoras e 24 blocos cercados, sem destino ausente, âncora ausente ou cerca aberta. `git diff --check` passou. O diagrama de imports preserva as relações existentes; não há mapa Graphify neste checkout. Código, testes, PNG, JSON do gate, constituição e backlog 005 não foram alterados por esta sincronização.
