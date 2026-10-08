# Reprodução sintética — Layout v3

Parte A implementada/testada localmente em 08/10/2026, não integrada; [resultados e fonte](validacao.md). O autor manteve 32 tarefas em duas entregas. Parte A é fundação/topo/Planejamento/Produção e regressões correspondentes; Planilha permanece. Parte B aguarda ok explícito na A.

## Pré-requisitos

Windows do projeto, Node 24.19.0 existente em CRM_NODE_PATH e Playwright existente em CRM_PLAYWRIGHT_MODULE. Diretório do Node à frente do PATH para subprocessos. Não instalar pacotes, usar o CRM do autor, ler data/ ou consultar Google/Instagram. Testes criam somente TEMP e servidor loopback com porta efêmera. Sem CI=true, Playwright ausente falha; não mascarar com SKIP.

## Comandos da Parte A

```powershell
& $env:CRM_NODE_PATH --test tests/layout-model.test.cjs tests/layout-http.test.cjs
& $env:CRM_NODE_PATH --test tests/layout-interface.test.cjs
& $env:CRM_NODE_PATH --test tests/screenshots-layout-v3.test.cjs
& $env:CRM_NODE_PATH scripts/screenshots-layout-v3.cjs
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

Os comandos acima foram executados nesta rodada; números, fontes e limites somente em validacao.md. O gerador grava 12 PNG em docs/design/screenshots/layout-v3-parte-a/: Semana/Mês/Produção × claro/escuro × 1440/390. Servidor/serviço reais, captura/PNG/credencial efêmera/transporte falsos e rede externa bloqueada; não toca Google ou o CRM do autor. Guardas de prefixo/TEMP e limpeza após fechar navegador/servidor protegem somente os diretórios temporários criados. Saída de screenshots é um destino explícito de evidências.

## Cinco camadas do recorte A

1. Funções puras: estados, bloqueio, progresso, ordenação/datas e seleção de imagens/vigência sem mutação.
2. Persistência: arquivos reais em TEMP, bytes/hashes de captura/recibos preservados por consultas/estáticos. Cache mantém o comportamento da 005.
3. Integração: projeção atual alimenta derivados; API completa, Planilha/avisos/responsáveis/Histórico preservados.
4. HTTP: GET/HEAD e guardas do único estático novo layout-model.js, rotas atuais, atualização com serviço falso/falha/no-op.
5. Interface: claro/escuro, 1440/390, teclado/foco/contraste, objetivo, Semana/Mês/projetos, miniatura contain/falha e carregamento restrito. Galeria/pacote/cópia e versões são regressões preservadas.

## Fixture e conferência

Relógio fixo em 08/10/2026; semana atual com oferta, carrossel de cinco páginas PNG 1080×1350 e Reels travado; próxima com quatro peças em dias variados; futura vazia; passada publicada; sem data/sem semana; correção vigente/histórica e Meses/Pautas opcionais. Tudo sintético, sem ID, conta ou texto operacional.

Conferir topo único/POST único/falha/no-op, expandir objetivo sem espaço recolhido, navegar pautas/períodos, sete dias e dia inteiro, hoje centrado/rolagem preservada em 390, Mês sem imagens/semana acessível, Produção com X de N/cinco passos/motivo, futura vazia com período/frase, Planilha e seus atalhos. Rede permanece na origem temporária, sem erro JS/overflow da página. O coordenador inspecionou os [12 PNG finais](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-a).

## Parte B — somente planejada

Não executar nesta rodada testes inexistentes de instagram-interface nem criar perfil/modal/Instagram/Publicar. Após ok explícito na A, B implementará fila/contador/cópia/pacote, pop-up de cinco páginas/imagem única/slots indisponíveis, teclado/setas/pontos/arrasto, foco/Esc/viewport baixa e atualização com modal aberto, além da remoção visual de Planilha. B terá screenshots Publicar/pop-up e regressões finais, gate/review e PR próprios.

## Entrega

Cada parte requer gate/review do head final, doc-sync e CI/review; push/PR somente Browsher/crm-social, commits 204295625+Browsher@users.noreply.github.com sem coautoria. Deixar os PRs abertos, **sem merge**. Testes sintéticos e screenshots não demonstram operação editorial real. UI/PowerShell no CI Linux mantêm a fronteira M8, sem substituir a prova Windows local.