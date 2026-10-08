# Validação — Layout v3

A Parte A entrega uma nova forma de acompanhar as mesmas capturas. O autor manteve 32 tarefas e autorizou duas entregas em 08/10/2026. **Parte A implementada e testada localmente, não integrada; Parte B não iniciada e dependente do ok explícito do autor na A. Nenhum merge autorizado.**

## Parte A — fonte e escopo

Base: `2be585a` (main com 005 integrada). Branch: `codex/006-layout-v3`. Fonte final do código, PNG e relatório: `5ac5d7c`, commit da Parte A baseado em `2be585a`; o gate foi executado sobre sua árvore antes do commit. Depois do gate houve somente whitespace no mockup/script, sem mudança semântica. Documentação sincronizada em commit posterior; o commit base não contém a implementação nova. Implementados T001–T016: modelo puro, topo com ⟳ Atualizar único, objetivo em linha recolhível, Planejamento Semana/Mês e Produção por projetos semanais. Planilha, avisos e atalhos permanecem; Publicar, perfil, pop-up e botão Instagram não foram implementados.

São seis funções públicas em `src/web/layout-model.js`; servidor acrescenta somente `/layout-model.js` à allowlist estática. Miniaturas usam seleção da 005, carregam somente na tela ativa quando visíveis, mantêm imagem inteira com contain e placeholder na falha. Semana móvel começa centrada em hoje e conserva rolagem ao retornar; futura vazia mostra período no cabeçalho e somente a frase autorizada no corpo. API completa, captura/recibos, projeção, coleta, cache, constituição 1.2.0, configuração, CI/gate e dependências permanecem. Nenhuma nova instalação ou operação editorial.

As duas decisões Medium do analyze estão em [spec.md](spec.md#clarifications--session-2026-10-08) e [contrato](contracts/apresentacao.md): posições sem prévia entram no contador; atualizar mantém a mesma peça aberta com a versão nova ou fecha/restaura foco se ela desaparecer, limita índice excedente e conserva conteúdo na falha. Serão implementadas/testadas somente na B.

## TDD observado

| Camada/comportamento | RED | GREEN focal |
| --- | --- | --- |
| Modelo puro | 1 PASS / 41 FAIL por asserção | 42 PASS |
| HTTP/persistência | 1 PASS / 3 FAIL por estático ausente | 4 PASS |
| Interface inicial | 23 FAIL por asserção, sem erros JS/rede externa | 23 PASS |
| Arte inteira e falha de miniatura/XSS | 1 PASS / 1 FAIL (`cover` versus `contain`) | 2 PASS |
| Hoje centrado no celular e futuro vazio | 0 PASS / 2 FAIL | 2 PASS |

Node 24.19.0 e Playwright existentes; capturas, credenciais efêmeras, transporte e PNG exclusivamente sintéticos, servidores reais em portas efêmeras e TEMP. A promoção atômica em TEMP exigiu execução fora do sandbox; nenhum dado operacional foi lido. Host é verificado com HTTP nativo, pois fetch não transmitia o Host customizado. Consultas/estáticos preservam bytes de capturas/recibos e API completa; cache mantém o contrato da 005.

## Regressões, isolamento e acessibilidade

As suítes de interface anteriores foram adaptadas somente nos contratos visuais substituídos: Semana/Mês, projetos, topo e retirada de metadados de agentes. Planilha e seus testes permanecem. Identidade, versões, links seguros, pacote/cópia, galeria/ampliação, falha/no-op, preferência/contraste e restauração de foco foram conservados.

A rodada de regressão inicial teve 102 casos: 99 PASS e três expectativas antigas migradas; a seleção final desses três passou (menu/dias e escala de 500 peças em 1440/390). A conferência delegada final de isolamento registrou **103 PASS, 0 SKIP**. Helpers/geradores históricos de tema/pautas agora injetam serviço de mídia falso com falha 503, garantindo que miniaturas novas não ativem cliente Google real. Evidências históricas não foram regeneradas como provas da 006.

A Parte A verifica claro/escuro, 1440/390, teclado/foco, contraste de texto mínimo 4,5:1 nos cenários testados, objetivo hidden, região semanal própria sem overflow da página, hoje móvel/rolagem preservada, acesso por teclado a semanas vazias/cruzamento de ano, falha individual de imagem e conteúdo seguro. Mês/telas ocultas não pedem imagens; só Atualizar explícito inicia o POST falso. Prova automatizada sintética não demonstra operação editorial real ou todos os conteúdos futuros. UI continua fora do LCOV; os pulos UI/PowerShell do CI Linux permanecem na dívida M8 e não substituem a prova local Windows.

## Gerador e screenshots

`scripts/screenshots-layout-v3.cjs` usa `tests/layout-browser.cjs` e `tests/layout-fixtures.cjs`, com TEMP validado, porta efêmera, relógio fixo, transporte falso e bloqueio de rede externa. Fecha navegador/servidor antes de remover seus diretórios TEMP exatos. O script real tem testes em `tests/screenshots-layout-v3.test.cjs`, incluídos no gate final.

**12 PNG finais gerados em 08/10/2026 às 16:17**, depois dos ajustes: Semana/Mês/Produção × claro/escuro × 1440/390. Viewports 1440×1050 e 390×844; Produção fullPage. Oferta, carrossel de cinco páginas PNG 1080×1350 e Reels travado são sintéticos. O coordenador inspecionou visualmente os doze PNG finais e aprovou a apresentação; nenhuma mudança semântica de código ocorreu depois. [Galeria com 12 links e reprodução](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-a). Não são screenshots do mockup, nem prova de acesso real, ZIP, aprovação ou publicação.

## Quality gate Windows — Parte A

Comando: `node tools/quality-gate.mjs`, com Node **24.19.0** e Playwright existentes; execução local Windows sem pulos de testes. Fonte de código: `5ac5d7c`, baseado em `2be585a`, testado antes do commit, com somente whitespace posterior; [relatório final sanitizado](../../docs/reports/006-parte-a-local-gate.json).

| Verificação | Resultado final |
| --- | --- |
| Testes | **654 PASS**, sem pulos locais |
| Cobertura | **95,40719696969697%** (95,4072%) |
| Complexidade | **PASS**, 634 métricas, máximo 16, 19 avisos |
| Semgrep | **SKIP local**, ferramenta ausente |
| Audit | **N/A** |
| Baseline | Preservada (`baselineUpdated: false`) |
| Saída | **exit 0** |

Rodada preliminar, preservada como histórico: 654 PASS, cobertura 95,123106%, 632 métricas de complexidade, máximo 16, 19 avisos, exit 0, baseline preservada, Semgrep SKIP/audit N/A. O resultado final acima substitui essa medição após o isolamento dos helpers. Depois do gate final, houve somente remoção de whitespace em `scripts/screenshots-pautas.cjs`, sem mudança semântica. Prova local não substitui CI/review do head final; Semgrep SKIP não é PASS.

## Fechamento e entrega

T024–T028 executadas no recorte A; T031 doc-sync-onboarding sincronizou AGENTS/README/ROADMAP, índice, arquitetura/import-map, módulos web/servidor/modelo, telas/mockups/galeria e artefatos 006. Não há mapa Graphify neste checkout; Mermaid da arquitetura registra app → layout-model e gerador → layout-browser → fixtures/servidor com mídia falsa. Só documentos `.md` foram alterados por doc-sync; templates/skills e constituição foram preservados. Sonnet/Haiku indisponíveis neste host; documentação usou fallback GPT-6.1-sol High.

Revisão independente de código (T029), commit/push/PR e CI/review do head final (T032) **pendentes**; registrar links/heads/resultados somente após executar. O gate local final T030 passou, mas correções posteriores de código por review exigem repetir verificações afetadas e gate no head entregue. Push/PR permitidos somente em Browsher/crm-social, commit noreply sem coautoria, sem merge.

## Parte B — não iniciada

T017–T023 e fechamento B de T024–T032 aguardam autorização explícita do autor após entrega da A. Perfil/modal/Instagram/Publicar e remoção visual de Planilha não têm implementação, screenshots ou validação nesta rodada. Os checkboxes globais de fechamento ficam abertos até ambas as partes estarem verificadas; a tabela de [tarefas](tasks.md) acompanha cada recorte separadamente.