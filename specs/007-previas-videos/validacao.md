# Validação — Prévias de vídeos

Como conferir o filme e sua etiqueta antes de usar o acervo, esta validação separa o comportamento testado com dados inventados da demonstração privada com os arquivos autorizados pelo autor.

## Estado e origem

Em 2026-10-15, a feature está concluída localmente, **12/12 tarefas**: implementada, testada e instalada na instância do autor, com backup, demonstração e gate normal completo aprovado. Branch `codex/007-previas-videos`, baseada na main `5c9baa7`; sem integração Git, commit de entrega, PR ou CI desta feature. Os resultados abaixo pertencem à árvore local de trabalho; não são checks de um head remoto. [Spec](spec.md), [plano](plan.md), [contrato](contracts/video.md) e [tarefas](tasks.md).

O autor pediu expressamente capa, reprodução ao clicar em **Ver no Instagram** e botão **Tela cheia**. A emenda 1.3.0 registra a leitura MP4 readonly pelo servidor, sem migração de capturas ou escrita editorial pelo app.

## Testes sintéticos e revisão

Ambiente Windows com Node **24.19.0** e Playwright já existente, sem dependência instalada. Serviços/HTTP usam diretórios TEMP e portas efêmeras; transporte Google falso, credenciais efêmeras de teste e rede externa bloqueada no navegador. A fixture `tests/fixtures/video-sintetico.mp4` é H.264 inteiramente sintética, com dois segundos e sem conteúdo operacional.

| Camada / rodada | Evidência observada |
| --- | --- |
| Baseline de backend | 55/55 PASS antes da implementação de vídeo |
| Baseline de layout/Instagram anterior | 90/90 PASS, sem pulos |
| Seleção de final/capa | RED com 17 falhas por seletores ausentes; GREEN com modelos anteriores e novos, 77/77 PASS |
| Backend/cache/HTTP/Google | 99/99 PASS nas suítes focadas; limites MP4/imagem, estrutura/hash, cache, concorrência, revogação e Range/HEAD |
| Regressão final sem navegador | 465/465 PASS, sem pulos; regras, serviços, I/O e HTTP nas suítes dedicadas |
| Interface de vídeo inicial | RED com quatro falhas por capa/player ausentes; implementação cobre reprodução, busca, encerramento e fullscreen |
| Interface final dedicada | 6/6 PASS, sem pulos; inclui 1440/390, play bloqueado, controles sem gesto de carrossel e releitura preservando pausa/tempo |
| Regressão final de Instagram/vídeo | 36/36 PASS, sem pulos: 30 casos anteriores e seis novos |
| Revisão técnica independente | Sem pendências após achado P2 sobre atualização do player corrigido com RED→GREEN; mesma referência conserva elemento/pausa/tempo. Referência alterada continua liberando a anterior |

A seleção exige produção/versão exatas, final único por `id_drive_video_final`, capa com `papel=capa_video` e origem exata; casos de MIME inválido, vínculo/versão/produção ambíguos, JSON inválido, capa ausente e galeria anterior foram exercitados. Bancos sem final escolhido não ganham uma seleção por ordem.

O servidor real responde 200/206/416 com comprimentos/faixas corretos, HEAD sem corpo ignorando Range e recusa origem/método/ID inválidos antes do serviço. Validação MP4 não garante todo codec; o erro nativo do player mantém indisponibilidade sem alterar estado editorial. A UI continua fora do LCOV, com evidência comportamental de navegador.

## Quality gate

A primeira execução de `node tools/quality-gate.mjs` terminou com **exit 1**, etapa de testes **FAIL** e cobertura dependente não aprovada. Complexidade passou, máximo **16**, **23 avisos**; Semgrep **SKIP** por ferramenta ausente, audit **N/A** e baseline não alterada. O resumo inicial não identificou os testes que falharam; o coordenador iniciou nova execução com log TAP privado para diagnóstico. Essa tentativa não autoriza marcar T010 concluída ou declarar gate verde.

A segunda execução, com a mesma configuração e wrapper privado para registrar o TAP sem alterar `tools/`, mostrou **823 testes: 822 PASS, 1 FAIL, 0 SKIP**. A única falha estava em `tests/tema.test.cjs:76`: o teste comparava a CSP anterior, sem `media-src 'self'`. A expectativa estrita foi atualizada para o contrato de vídeo autorizado; o teste isolado passou **1/1**. Nenhum código de aplicação foi alterado nessa correção.

A terceira execução normal completa terminou com **exit 0**, no Node **24.19.0**, sobre a mesma configuração. O wrapper privado apenas reteve stdout/TAP para diagnóstico; não alterou o gate, regras ou aplicação.

| Etapa final | Resultado |
| --- | --- |
| Testes | **823/823 PASS**, 0 FAIL, 0 cancelados, 0 SKIP |
| Cobertura | **PASS, 95,7771%**; valor bruto `95.77710056595559`, drop 0 em modo full, sem comparação histórica |
| Complexidade | **PASS**, 710 métricas, máximo 16, 23 avisos |
| Semgrep | **SKIP**, CE 1.179.0 ausente |
| Audit | **N/A** |
| Baseline | Preservada; `baselineUpdated:false` |

O modo `--strict` **não foi executado nem aprovado** nesta rodada; ausência de Semgrep não equivale a auditoria de segurança aprovada. O gate normal obrigatório está aprovado; os resultados das tentativas anteriores permanecem acima como histórico. Nenhuma configuração, ferramenta ou baseline foi ajustada para obter o resultado.

## Demonstração operacional privada

Esta conferência usou a captura operacional e o mesmo código em servidor isolado com porta efêmera. Os dados, URLs, IDs, caminhos, capturas de tela e bytes operacionais permanecem privados e fora do Git.

- Treze capas já existentes foram vinculadas aos treze vídeos finais semanais na fonte autorizada, com produção/versão e origem exatas; a captura foi atualizada pelo POST local.
- A tentativa de leitura real pelo cliente Drive retornou **503**. Não há evidência de download remoto bem-sucedido nesta rodada.
- Os **47 vídeos** e **13 capas** dos arquivos locais autorizados foram conferidos e preparados no cache privado validado, preservando os originais. Isso foi preparação operacional fora do código/testes, sem nova variável ou fallback automático a diretórios locais.
- No servidor isolado, **13/13 capas** e **13/13 HEAD de vídeos finais** responderam 200.
- Um vídeo real de **20 segundos**, **1080 × 1920**, reproduziu dentro da prévia, entrou/saiu de tela cheia e foi encerrado sem erro JavaScript. Isso demonstra o fluxo com o cache preparado; não comprova que os 47 vídeos foram assistidos integralmente ou que há acesso Drive.

O navegador do player usa apenas URLs locais de capa/vídeo. O ensaio privado não publicou conteúdo nem alterou flags editoriais pelo CRM.

### Instalação local — T012

O coordenador instalou **39 arquivos** verificados com backup e comparação de hashes, reiniciando somente o processo identificado do CRM na porta habitual **4318**. Na instância habitual, Playwright confirmou as treze capas e o fluxo de um vídeo real de 20 segundos/1080 × 1920: play, tela cheia, retorno e fechamento, com zero erro JavaScript. A instância de ensaio efêmera foi encerrada. Conferência final confirmou **8/8 hashes dos arquivos de aplicação** iguais aos da fonte testada; a última correção após a instalação foi somente a expectativa CSP de teste.

T012 está concluída; a instalação reversível ocorreu após revisão e regressões focadas, enquanto o gate completo final executava. T010 só foi encerrada após a terceira execução verde. Isso não afirma integração Git. Backup, hashes e artefatos operacionais continuam privados.

## Limites da conclusão local

- **T010 concluída:** terceira execução normal completa aprovada; tentativas iniciais falharam por expectativa anterior da CSP, corrigida com RED→GREEN.
- **T011 concluída:** sincronização documental e emenda 1.3.0; resultados históricos das 001–006 preservados.
- Conferência documental local: 22 documentos com links locais existentes, nove artefatos da 007 cobertos pelo índice e cercas de código balanceadas; `git diff --check` sem erro. Nenhum código/configuração/teste alterado por doc-sync.
- **T012 concluída:** instalação local verificada com backup e demonstração da instância habitual; integração Git não realizada.
- Não houve execução/aprovação `--strict` ou scanner Semgrep nesta rodada; o SKIP é uma limitação explícita do gate normal.
- Um cache miss continua dependendo da conta de serviço com acesso Drive readonly. Perda/remoção do cache preparado exige restaurar esse acesso; o código não procura os arquivos na pasta local do autor.
- MP4 é validado inteiro antes de Range; até HEAD pode baixar/ler o arquivo completo. Primeiro play pode esperar download de até 64 MB. Sem transcodificação, streaming remoto por faixa, retenção/eviction de cache ou ensaio de escala concorrente operacional.
- Testes locais não substituem CI/review do eventual head de entrega; esta rodada não cria PR nem declara integração.
