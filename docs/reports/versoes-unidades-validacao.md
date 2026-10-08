# Validação e integração — versões de páginas e cenas

Como um texto revisado que conserva sua fotografia, esta correção permite consultar mídia reaproveitada sem tratá-la como ausente. Manutenção pequena autorizada em 08/10/2026, sem nova feature/Spec Kit; implementada, testada e integrada pelo [PR #22](https://github.com/Browsher/crm-social/pull/22) nessa data, merge `b90980a15fad653937fd024ac3c9bb2738e9d99a`. A 005 iniciou somente seu planejamento após esse merge; suas provas futuras não pertencem a esta manutenção.

## Fonte e comportamento

Base main: `5b296938dde98ff9f5f3b240ff68972870e76b9d`, que integra Pronta pelo [PR #21](https://github.com/Browsher/crm-social/pull/21). Fonte do gate local final de código/testes: `af403ae778bfa7eda711f853f00aa5bc1aacdbc0`, na então branch `codex/versoes-paginas-cenas`. A rodada inicial usou `7b0ab46a44bfb14d80d6dffbab6ec78b06c028da`, fonte da geração dos quatro PNG, que permanecem inalterados. O head final revisado foi `092d6cb`; a sincronização documental não lhe atribui nova execução Windows. A manutenção preservou a constituição 1.1.0.

| Regra implementada | Fonte e resultado |
| --- | --- |
| Ponteiro explícito de página/cena | `arquivoLigado`/`escopoArquivo`, em `src/projecao.cjs`: arquivo exato da mesma produção, com unidade coincidente quando preenchida; unidade vazia no arquivo é aceita. Versão da mídia pode diferir do texto |
| Vínculo quebrado ou incompatível | Null e aviso localizado; não escolhe substituto. Versão inválida do arquivo conserva aviso numérico independente, sem desfazer vínculo válido |
| Unidade vigente | `versoesUnidades`/`unidades`: maior versão inteira positiva por produção/índice inteiro positivo/tipo de unidade, separando páginas e cenas; `Produções.versao` não participa |
| Empates e inválidos | Todos os registros empatados na maior versão permanecem vigentes; índice/versão inválidos permanecem no detalhe sem vigência. IDs são exclusivos por registro; seu formato não define sequência |
| Faltas reais de mídia | `pendenciasMidia` conserva as faltas de unidades vigentes válidas mesmo com versão da produção inválida. Fallback sem unidades vigentes exige versão válida da produção |
| Gaveta | `secaoUnidades`, em `src/web/app.js`: grupos por `[vigente,versao]`, atuais primeiro e históricos recolhidos, inclusive para o mesmo número de versão. `adicionarVersaoImagem` mostra **imagem vN** para versão inteira positiva do arquivo ligado; vazia/inválida mostra **imagem: versão a confirmar**, sem converter o original nem desfazer o vínculo |
| Contratos preservados | Revisões continuam classificadas pela versão da produção e seus vínculos; pacote exige `pacote_versao` exata. Pronta continua recolhendo páginas/cenas e preservando avisos na API/Planilha |

O [contrato canônico](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#versões-das-unidades--manutenção-de-08102026) foi atualizado na mesma manutenção. Não há migração de capturas, nova rota, dependência, operação editorial ou mudança de fonte de dados.

## Rodada inicial — histórica, fonte 7b0ab46

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

A execução inicial ocorreu em `2026-10-08T14:22:27.569Z`. Seus seis hashes foram conferidos pelo coordenador contra `7b0ab46`. Naquela rodada, sete funções destacadas tinham complexidade entre 1 e 12: `escopoArquivo` 1, `arquivoLigado` 4, `versoesUnidades` 5, `unidades` 2, `pendenciasMidia` 5, `unidadeDetalhe` 12 e `secaoUnidades` 10. Esses dados são históricos; o JSON abaixo foi regenerado para a fonte vigente `af403ae` e não representa essa execução inicial.

Com Node/Playwright existentes configurados (`CRM_NODE_PATH`/`CRM_PLAYWRIGHT_MODULE`), fora de `CI=true`, as rodadas focadas correspondem a:

```powershell
& $env:CRM_NODE_PATH --test tests/versoes.test.cjs tests/projecao.test.cjs
& $env:CRM_NODE_PATH --test tests/versoes-interface.test.cjs tests/interface.test.cjs
```

O comando do gate completo, executado em cada rodada antes da respectiva sincronização documental, foi:

```powershell
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

## Rodada local final — fonte af403ae

O ajuste acrescenta `adicionarVersaoImagem` e caracteriza dois limites existentes: índice sem flag de retirada e revisões vinculadas à versão da produção. A revisão técnica independente aprovou `af403ae` sem achados. Os checks e a revisão do head final constam separadamente na integração abaixo.

| Verificação informada pelo coordenador | Resultado |
| --- | --- |
| RED do rótulo de versão inválida/vazia | 26 testes: 24 PASS e 2 FAIL de comportamento |
| GREEN da suíte de versões | 26 PASS sem pulos: 19 backend e 7 UI |
| Testes acrescentados após a rodada inicial | 4: dois de caracterização backend e dois de interface |
| Gate Windows / Node 24.19.0 | 501 PASS, exit 0 |
| Cobertura | 94,20654911838791%; drop 0 em modo full, sem comparação histórica |
| Complexidade | PASS; 491 métricas, máximo 18 e 20 avisos |
| Baseline | `baselineUpdated=false` |
| Semgrep / audit | SKIP por Semgrep ausente (CE 1.179.0 configurado); audit N/A |
| Screenshots | Quatro PNG inalterados, com a conferência visual da rodada inicial preservada |

O [relatório sanitizado vigente do gate](versoes-unidades-local-gate.json) registra execução em `2026-10-08T14:39:42.690Z`, fonte `af403ae778bfa7eda711f853f00aa5bc1aacdbc0`, seis hashes de arquivos, hash do relatório original, agregados e todos os 20 avisos. Oito funções destacadas têm complexidade entre 1 e 11: `escopoArquivo` 1, `arquivoLigado` 4, `versoesUnidades` 5, `unidades` 2, `pendenciasMidia` 5, `adicionarVersaoImagem` 4, `unidadeDetalhe` 11 e `secaoUnidades` 10. UI permanece fora do LCOV; CI Linux conserva os pulos de UI/PowerShell existentes. Não houve nova execução de testes ou gate durante esta sincronização documental.

## Integração — PR #22, 08/10/2026

| Verificação informada pelo coordenador | Resultado |
| --- | --- |
| Head final | `092d6cb` |
| [CI estrito — execução 37795153927](https://github.com/Browsher/crm-social/actions/runs/37795153927) | SUCCESS; Semgrep PASS; `baselineUpdated=false` |
| [Review remoto — execução 37795153635](https://github.com/Browsher/crm-social/actions/runs/37795153635) | SUCCESS; comentário `6062479615` lido e triado |
| Revisão independente do head final | Aprovada, sem Critical, achados de segurança ou regressão |
| Merge | [PR #22](https://github.com/Browsher/crm-social/pull/22), commit `b90980a15fad653937fd024ac3c9bb2738e9d99a` |
| Autoria | `204295625+Browsher@users.noreply.github.com`, sem coautoria |
| Branch da manutenção | Excluída localmente e no remoto após o merge |

No comentário remoto, I1 sugeriu aceitar outro ID da mesma unidade por índice. A sugestão foi rejeitada por contrariar a regra humana explícita: o ponteiro exige o ID exato da unidade ou campo de unidade vazio no arquivo; não é uma regressão. I2, sobre a prova de CI, foi resolvido pela execução estrita acima. O sucesso remoto não substitui a prova Windows de 501 PASS nem transforma os pulos Linux de UI/PowerShell em execução dessas camadas.

## Evidência e limites

[tests/versoes-fixtures.cjs](../../tests/versoes-fixtures.cjs) contém exclusivamente registros sintéticos: cinco páginas de texto v3 usam imagens v2/v1/v1/v2/v3 numa produção v8; uma cena v3 usa imagens v1/v2 e vídeo v2 numa produção v9. O texto da fixture menciona mídia aprovada como cenário fictício; a consulta comprova somente o registro e o vínculo, sem inferir aprovação ou bytes.

[tests/versoes.test.cjs](../../tests/versoes.test.cjs) confere ponteiros reaproveitados, unidade vazia, recusa de produção/unidade diferente e referência quebrada, vigência por índice/produção/tipo, empates, números inválidos e pendência real com versão da produção inválida. Persistência TEMP e GET real em porta efêmera conferem captura/arquivos intactos, 405 em POST de consulta e 403 para Origin externo. [tests/projecao.test.cjs](../../tests/projecao.test.cjs) conserva a regressão do fallback sem unidades vigentes.

[tests/versoes-interface.test.cjs](../../tests/versoes-interface.test.cjs) confere cinco páginas atuais, **imagem vN**, **imagem: versão a confirmar** para versão inválida/vazia sem perder o link, links exatos, grupos atuais/históricos com a mesma versão, Escape e ausência de corte horizontal. Usa estado TEMP, porta efêmera, relógio sintético, somente GET local, bloqueio de requisições externas e verificação de erros de página. [Quatro PNG sintéticos inalterados](../design/screenshots/LEIA-ME.md#versões-de-páginas-e-cenas) mostram a gaveta Pronta expandida nos dois temas e larguras; não mostram todos os casos de borda.

Não existe sinal capturado de retirada de índice: se ele só aparece em v1 ainda presente na captura, continua vigente nesse registro, mesmo com outros índices em v3. Revisões conservam `Produções.versao` como referência: numa produção v8/página vigente v3, revisão v3 da página fica em anteriores; revisão v8 ligada a ela fica ambígua. Ambas permanecem nos detalhes/Histórico, sem pendência vigente de revisão no quadro. Os dois testes de caracterização fixam esses limites preexistentes; a vigência das unidades não redefine revisões ou infere exclusões.

Nenhum teste desta manutenção leu a planilha ou o CRM privado, escreveu no Google/Drive, gerou mídia editorial ou publicou conteúdo. As imagens demonstram apresentação sintética; vínculo e link não comprovam acesso, bytes ou uso editorial real.

## Conferência documental

O doc-sync anterior à integração foi restrito aos 13 Markdown afetados: estado da manutenção, contrato, projeção/interface, roteiro, índice, galeria e este relatório. A verificação local conferiu 632 links relativos, 63 âncoras e 24 blocos cercados, sem destino ausente, âncora ausente ou cerca aberta. `git diff --check` passou. O diagrama de imports preservou as relações existentes; não havia mapa Graphify neste checkout. Código, testes, PNG, JSON do gate, constituição e backlog 005 não foram alterados por aquela sincronização.

O fechamento após o merge atualiza somente o estado integrado e as provas remotas neste relatório, junto do onboarding/índice e do status planejado da 005. Nenhum teste, gate ou screenshot novo foi executado nessa atualização documental.
