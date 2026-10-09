# Reprodução sintética — Layout v3

Como uma agenda de demonstração, os testes e screenshots usam somente peças fictícias para verificar o acompanhamento. A integrada pelo PR #24 em a5be355; B implementada/testada localmente em 09/10/2026, no [PR #25](https://github.com/Browsher/crm-social/pull/25), ainda não integrada. [Fontes, resultados e limites](validacao.md); os 32 IDs permanecem.

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

Esses comandos foram executados; medições por fonte somente em validacao.md. A fonte final f46db33 tem 740 testes PASS/0 SKIP, gate local e CI estrito da fonte aprovados; CI/review do head documental final devem ser conferidos. O gerador vigente grava 20 PNG em docs/design/screenshots/layout-v3-parte-b/: Semana/Mês/Produção/Publicar/Instagram × claro/escuro × 1440/390, preservando a galeria A. Servidor/serviço reais; captura/PNG/credencial/transporte falsos em TEMP validado por prefixo, rede externa bloqueada e limpeza restrita após fechar navegador/servidor. Os 12 PNG A reproduzem sua fonte histórica documentada: executar o gerador atual não recria automaticamente o checkout A.

Os geradores de regressão de tema/pautas usam agora destinos padrão dedicados docs/design/screenshots/tema-layout-v3/ e pautas-layout-v3/, com nome publicar, preservando as 16/20 imagens históricas na raiz. Em uso normal, a saída é a galeria do workspace; somente os testes CLI executam cópias inteiras em TEMP para provar preservação byte a byte de arquivos com nomes históricos/marcadores sintéticos e limpeza restrita. Não confundir servidor/dados TEMP com destino padrão dos PNG.

## Cinco camadas verificadas

1. Funções puras: estados/bloqueios/progresso, datas/ordem, fila/publicadas, seleção de imagens e slots ausentes sem mutação.
2. Persistência: arquivos reais em TEMP, bytes/hashes de captura/recibos preservados por consultas/estáticos; cache mantém contrato 005.
3. Integração: projeção atual alimenta derivados; view.planilha/avisos/responsáveis/Histórico completos na API, mesmo removidos da interface.
4. HTTP: GET/HEAD e guardas de layout-model/perfil-config/instagram, demais rotas preservadas; atualização falsa/falha/no-op.
5. Interface: temas, 1440/390, teclado/foco/contraste, objetivo, sete dias/Mês/projetos/fila, imagem contain/falha, modal/slots/gesto/viewport baixa; versões/pacote/clipboard/galeria são regressões preservadas.

## Fixture e conferência

Relógio fixo em 08/10/2026; oferta, carrossel com cinco páginas PNG sintéticas 1080×1350, Reels travado, próxima semana com quatro peças em dias variados, futura vazia, publicada, sem data/sem semana, correções vigentes/históricas e opcionais Meses/Pautas. Perfil inicial público sintético perfil.exemplo. Nenhuma conta/planilha/texto operacional.

Conferir topo/POST único, data/hora antiga e falha inicial visíveis no selo, reload/no-op sem renovar instante, objetivo hidden, pautas/períodos/bordas, hoje/rolagem em 390, Mês com Oferta/Carrossel/Reels completos e sem mídia, dia inteiro e projetos reais sem meta fixa. Conferir fila/contador/cópia/pacote/URL recusada, publicadas inválidas/travadas e ausência de Planilha/metadados de agentes.

Abrir prévia por Produção/Publicar/gaveta, verificar cinco páginas e imagem única com primeira posição ausente preservada, slots indisponíveis incluídos, cenas início/final e nomes atualizados mesmo com total constante, botões/pontos/←→, limites sem wrap, arrasto horizontal versus vertical, Esc/Tab/restauração e viewport baixa. Atualizar no diálogo conserva mesma identidade com texto/versão nova e índice limitado, remoção fecha/foco; falha mantém vista anterior. Botão da gaveta resolve ID vigente no clique após atualização. Testes sintéticos de gesto não demonstram uso físico.

## Entrega

A foi integrada somente após autorização explícita do autor. B está no PR #25 e exige gate/doc-sync/review/CI no head final, push somente Browsher/crm-social; commits com noreply autorizado e sem coautoria. **Deixar PR B aberto, sem merge.** [Galeria B](../../docs/design/screenshots/LEIA-ME.md#006--layout-v3-parte-b). Fixtures/screenshots não demonstram operação editorial real; pulos UI/PowerShell do CI Linux na dívida M8 não substituem prova Windows local.
