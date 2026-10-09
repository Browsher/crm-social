# Pesquisa — Layout v3

Data: 08/10/2026. Pesquisa documental anterior à implementação, sem prova de execução. A integrada após aprovação em 09/10; B implementada/testada localmente e não integrada. Revisão visual solicitada pelo autor em 09/10 preserva32 IDs e PR #25, semmerge; Fonte de código/testes 08ba10b; gate oficial executado em bc74d6e: 756 PASS/0 SKIP, cobertura 95,5217%, 688 métricas/máximo 16/18 avisos, exit 0/baseline preservada; Semgrep SKIP local/audit N/A. Quatro PNG Instagram novos em 08ba10b; dezesseis PNG B preservados em 800d7ca. Push/CI/review do novo head pendentes; merge B proibido. [Validação](validacao.md) preserva as fontes/resultados anteriores como história.

## Decisão 1 — preservar a tecnologia existente

**Decisão:** HTML/CSS/JS nativos; extrair derivados puros e pop-up compartilhados. **Motivo:** o projeto é local e pequeno; app.js já concentra calendário, gaveta e ações. **Alternativas:** concentrar tudo em app.js reduziria arquivos, mas acoplaria classificação, miniaturas e modal às quatro jornadas; framework criaria dependência e reescrita sem necessidade. Mantém-se a aplicação existente com dois módulos de comportamento e um arquivo de configuração.

## Decisão 2 — preservar API e fonte dos estados

**Decisão:** usar p.quadro.coluna e pendências já projetadas; derivados visuais ficam no navegador. **Motivo:** src/projecao.cjs já aplica publicado_em antes de liberação, revisão e etapa, e classifica revisão vigente/ambígua/histórica. **Alternativa:** reimplementar classificação a partir de status ou mudar a projeção arriscaria divergência. Outras → Criação é autorização explícita do pedido, não suposição do agente.

Funções relevantes: colunaProducao, pendenciasRevisao, pendenciasMidia, pacotePublicacao e projetarVisao em src/projecao.cjs; mapa em config/quadro-etapas.json. O campo status não comprova publicação/prontidão.

## Decisão 3 — retirar a página, manter os dados

**Decisão:** remover DOM/renderizadores/atalhos de Planilha, conservar view.planilha, avisos e histórico na API. **Motivo:** objetivoMensal em src/web/app.js lê Meses dentro de view.planilha. detalhesCaptura, controles, navegar e avisosPeca também usam elementos da tela antiga. O topo deve receber o botão e feedback antes de retirar esses vínculos. **Alternativa:** apenas esconder a página deixaria código acoplado e controles sem destino.

Pesquisa delegada ao explorer layout_research, somente leitura de módulos/contratos; não alterou arquivos, rodou testes ou acessou a operação. Não há mapa Graphify no checkout; docs/architecture.md registra os imports e essa ausência.

## Decisão 4 — reutilizar mídia da 005 com novo gatilho

**Decisão:** preservar imagensDaPeca/imagensDasUnidades e resolução por ID interno; miniaturas carregam em listas visíveis, galeria completa somente ao abrir peça e pop-up somente sua posição. **Motivo:** o pedido muda expressamente a demanda visual; iniciarPrevias hoje depende de dialog/gaveta abertos. **Alternativas:** carregar todas as imagens de todas as telas aumentaria demanda; usar URL Drive no browser quebraria privacidade. Sem extração ZIP, vídeo novo ou alteração de cache.

Versões e vínculos permanecem como PR #22/005: unidades vigentes por índice, ponteiros exatos e versões de mídia independentes. Falha de bytes, revisão e disponibilidade de pacote são sinais distintos.

## Decisão 5 — configuração de perfil declarativa

**Decisão:** src/web/perfil-config.js é um arquivo de configuração público, com nomePerfil sintético perfil.exemplo, carregado antes de instagram.js/app.js. **Motivo:** atende ao nome fora da lógica sem endpoint, conta autenticada ou dado operacional versionado. **Alternativas:** literal dentro do pop-up viola o requisito; configurar pelo snapshot muda dados; JSON remoto/API nova é desnecessário. Configuração ausente/inválida mostra “Perfil não configurado”.

## Decisão 6 — referências e responsividade

**Decisão:** copiar a referência autorizada, sanitizando perfil/marca/conteúdo demonstrativo; o pedido escrito prevalece sobre Dados e avisos, ações e texto explicativo do mockup. Sete colunas em 390 px ficam em região própria rolável; não converter para dois dias por linha como no CSS demonstrativo. **Motivo:** preservar o requisito de sete colunas e o layout visual, sem exigir funcionamento do mockup histórico como aplicativo.

## Decisão 7 — testes de teclado e gesto com ferramenta existente

**Decisão:** usar a instalação atual do Playwright, node:test e assert/strict; teclado real de automação, dialog nativo e eventos touch sintéticos para comprovar o handler de arrasto. **Motivo:** documentação atual confirma Escape em dialog e dispatchEvent para gestos. Eventos touch disparados não têm isTrusted; a prova é de comportamento automatizado, não gesto físico em aparelho real.

Context7: resolve-library-id Playwright → /microsoft/playwright (fonte High; documentação oficial); query-docs focada em dialog, Escape, foco, teclado e arrasto. Fontes primárias: [testes oficiais de teclado](https://github.com/microsoft/playwright/blob/main/tests/page/page-keyboard.spec.ts) e [documentação de eventos touch](https://github.com/microsoft/playwright/blob/main/docs/src/touch-events.md). Não se instala @playwright/test: adaptar os exemplos ao runner já existente.

## Complementos verificados na Parte B

Atualização em 09/10/2026: a prévia nativa torna o fundo inerte. Na revisão visual posterior, selo/Dados/Atualizar/feedback permanecem somente na página, sem transporte/clonagem; nova atualização pelo botão exige fechar a prévia. Releitura recebida de clique iniciado antes da abertura ou programática durante modal mantém as regras de identidade/remoção/falha. Botões resolvem ID na vista vigente no clique, conservando decisão de nova versão/remoção. A data de publicação usa validação ISO com dia civil real compartilhada, evitando Date.parse normalizar 30 de fevereiro. Mês usa o alias visual Imagem → Oferta conforme mockup e pedido, sem inferência de pauta/elegibilidade. Slots completos do modal são derivados separados da seleção histórica da galeria; Imagem única conserva o primeiro lógico mesmo indisponível. Reels usa nomes de Cena/início/final. Os geradores tema/pautas agora gravam em subdiretórios dedicados por padrão, com Publicar, para preservar as galerias históricas; apenas as cópias CLI dos testes têm galeria TEMP. O selo antigo e falha inicial conservaram data/hora/falha explícitas após review. Fonte/cobertura/avisos permanecem na captura/API por decisão visual explícita já fornecida pelo autor, sem novo clarify ou emenda. Review do head b5 apontou necessidade de um sinal mínimo de incerteza: Dados a confirmar agora deriva avisos globais/no resumo da peça e permanece somente na página, sem restabelecer a página técnica. Setas desabilitadas transferem foco; seta/ponto ocultados ao reduzir a 1 vão a Fechar. A revisão visual usa .phone preta 360/borda 10/cantos 38, Fechar fora, siglaMarca configurada DEMO, perfil/subtítulo, arte 4:5 com setas/contador sobrepostos e pontos abaixo, ícones decorativos e legenda literal/hashtags azuis; single 1/1 oculta navegação. Avatar valida trim/até 5/C0DEL, uppercase e fallback •. A divergência miniatura disponível versus primeira posição ausente no modal é deliberada para preservar 005 e slots. Perfil versionado permanece sintético; nome real seria somente personalização local, sem mecanismo ignored/env implementado. [Contrato](contracts/apresentacao.md).

## Assunções de produto

Progresso inclui Pronta e Publicada; publicadas recentes limita a dez e preserva publicação preenchida inválida sem inventar data; datas civis em São Paulo; semana futura vazia apenas anuncia Planejamento na sexta-feira. Reels usa imagens de cenas, quando existentes, sem playback. Assunções estão na spec e no contrato; nenhuma lacuna de produto exige clarify antes do plano.
