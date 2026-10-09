# Reprodução sintética — Layout v3

Como uma agenda de demonstração, os testes e screenshots usam somente peças fictícias para verificar o acompanhamento. A integrada pelo PR #24 em a5be355; B implementada/testada localmente em 09/10/2026, no [PR #25](https://github.com/Browsher/crm-social/pull/25), integrada após aprovação expressa do autor em c4660d7. [Fontes, resultados e limites](validacao.md); os 32 IDs permanecem.

## Pré-requisitos

Windows do projeto, Node 24.19.0 existente em CRM_NODE_PATH e Playwright existente em CRM_PLAYWRIGHT_MODULE; diretório Node à frente do PATH para subprocessos. Não instalar pacotes, usar o CRM do autor, ler data/ ou consultar Google/Instagram. Tests criam TEMP e servidor loopback em porta efêmera. Sem CI=true, Playwright ausente falha.

## Comandos vigentes da Parte B

```powershell
& $env:CRM_NODE_PATH --test tests/layout-model.test.cjs tests/layout-http.test.cjs
& $env:CRM_NODE_PATH --test tests/layout-interface.test.cjs tests/instagram-interface.test.cjs
& $env:CRM_NODE_PATH --test tests/screenshots-layout-v3.test.cjs
& $env:CRM_NODE_PATH scripts/screenshots-layout-v3.cjs
& $env:CRM_NODE_PATH tools/quality-gate.mjs
```

Esses comandos foram executados; medições por fonte somente em validacao.md. Fonte de código/testes 08ba10b; gate oficial executado em bc74d6e: 756 PASS/0 SKIP, cobertura 95,5217%, 688 métricas/máximo 16/18 avisos, exit 0/baseline preservada; Semgrep SKIP local/audit N/A. Quatro PNG Instagram novos em 08ba10b; dezesseis PNG B preservados em 800d7ca. Push realizado e CI estrito do head aprovado a5c964c SUCCESS/Semgrep PASS; revisão independente de 1bcb4a8 aprovada, com Minor documental corrigido. Review remoto adjudicado sem bloqueio: I1 não reproduzido, I2 histórico corrigido; resultados do head final são conferidos no PR; restrição da entrega anterior cumprida; integração autorizada em c4660d7. O gerador atual grava 20 PNG em docs/design/screenshots/layout-v3-parte-b/ (Semana/Mês/Produção/Publicar/Instagram×temas×1440/390); nesta revisão só 4 Instagram foram efetivamente renovados, e 16 B preservam fonte 800d7ca. Servidor/serviço reais em TEMP validado, transporte/credencial falsos, rede externa bloqueada e limpeza restrita. Galeria A/históricos permanecem na fonte original; gerador atual não recria automaticamente checkout antigo.

Os geradores de regressão de tema/pautas usam agora destinos padrão dedicados docs/design/screenshots/tema-layout-v3/ e pautas-layout-v3/, com nome publicar, preservando as 16/20 imagens históricas na raiz. Em uso normal, a saída é a galeria do workspace; somente os testes CLI executam cópias inteiras em TEMP para provar preservação byte a byte de arquivos com nomes históricos/marcadores sintéticos e limpeza restrita. Não confundir servidor/dados TEMP com destino padrão dos PNG.

## Cinco camadas verificadas

1. Funções puras: estados/bloqueios/progresso, datas/ordem, fila/publicadas, seleção de imagens e slots ausentes sem mutação.
2. Persistência: arquivos reais em TEMP, bytes/hashes de captura/recibos preservados por consultas/estáticos; cache mantém contrato 005.
3. Integração: projeção atual alimenta derivados; view.planilha/avisos/responsáveis/Histórico completos na API, mesmo removidos da interface.
4. HTTP: GET/HEAD e guardas de layout-model/perfil-config/instagram, demais rotas preservadas; atualização falsa/falha/no-op.
5. Interface: temas, 1440/390, teclado/foco/contraste, objetivo, sete dias/Mês/projetos/fila, imagem contain/falha, modal/slots/gesto/viewport baixa; versões/pacote/clipboard/galeria são regressões preservadas.

## Fixture e conferência

Relógio fixo em 08/10/2026; oferta, carrossel com cinco páginas PNG sintéticas 1080×1350, Reels travado, próxima semana com quatro peças em dias variados, futura vazia, publicada, sem data/sem semana, correções vigentes/históricas e opcionais Meses/Pautas. Perfil inicial público sintético perfil.exemplo / siglaMarca DEMO; personalização real apenas local, nunca commit, sem mecanismo ignored/env. Miniatura pode mostrar imagem seguinte disponível da galeria da 005 enquanto Imagem 1/1 no modal conserva primeira posição lógica ausente. Nenhuma conta/planilha/texto operacional.

Conferir topo/POST único, data/hora antiga e falha inicial visíveis no selo, reload/no-op sem renovar instante, Dados a confirmar global/peça somente na página, sem selo/Atualizar/feedback no modal, conforme avisos e nova captura limpa, objetivo hidden, pautas/períodos/bordas, hoje/rolagem em 390, Mês com Oferta/Carrossel/Reels completos e sem mídia, dia inteiro e projetos reais sem meta fixa. Conferir fila/contador/cópia/pacote/URL recusada, publicadas inválidas/travadas e ausência de Planilha/metadados de agentes.

Abrir prévia por Produção/Publicar/gaveta, verificar cinco páginas e imagem única com primeira posição ausente preservada, slots indisponíveis incluídos, cenas início/final e nomes atualizados mesmo com total constante, botões/pontos/←→, limites sem wrap, arrasto horizontal versus vertical, Esc/Tab/restauração e viewport baixa; foco migra à outra seta habilitada/Fechar quando a seta anterior se torna disabled. Conferir moldura preta 360/borda 10/cantos 38, Fechar fora/acima, avatar/perfil/subtítulo, setas/contador sobrepostos e pontos abaixo, ícones decorativos, legenda literal/hashtags azuis e imagem única 1/1 sem setas/pontos. Ponto ou seta ocultados pela redução a 1 recebem foco em Fechar. Clique real em Atualizar antes de abrir comprova POST recebido com modal aberto; helper programático no botão real testa releitura durante modal, sem afirmar que usuário aciona fundo inerte. Mesma identidade recebe texto/versão nova e índice limitado, remoção fecha/foco; falha mantém vista anterior. Para nova atualização pelo botão, fechar e usar topo. Botão da gaveta resolve ID vigente no clique após atualização. Testes sintéticos de gesto não demonstram uso físico.

## Entrega

A foi integrada somente após autorização explícita do autor. B foi entregue no PR #25 com gate/doc-sync/review/CI conferidos no head aprovado a5c964c e push somente Browsher/crm-social; commits com noreply autorizado e sem coautoria. A entrega sem merge foi cumprida; após aprovação expressa do autor, PR #25 integrado em c4660d7. [Galeria B](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-b). Fixtures/screenshots não demonstram operação editorial real; pulos UI/PowerShell do CI Linux na dívida M8 não substituem prova Windows local.
