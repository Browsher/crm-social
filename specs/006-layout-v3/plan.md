# Implementation Plan: 006 — Layout v3

**Branch**: `codex/006-layout-v3-parte-b` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)
**Input**: especificação única em `specs/006-layout-v3/spec.md`.
**Estado**: Parte A integrada no PR #24, main a5be3553a26f6a7af9fdb9e84bbd24851a561ce2. Parte B autorizada em 09/10/2026 e implementada/testada localmente, não integrada, na branch codex/006-layout-v3-parte-b; 32 tarefas mantidas. [Validação de execução](validacao.md).

## Execução autorizada nesta rodada — Parte B

O autor aprovou A, autorizou o merge do PR #24 e iniciou B em 09/10/2026. T017–T023, regressões e fechamento T024–T032 agora estão autorizados; B terá PR próprio sem merge. Mês acrescenta rótulos Oferta (Imagem)/Carrossel/Reels junto ao ponto colorido. Atualizar/selo/feedback únicos são movidos para o diálogo aberto e restaurados ao fechar, permitindo teclado com fundo inerte.

## Recorte histórico da Parte A

A parada inicial foi resolvida pelo autor, que autorizou duas partes com PRs próprios e sem merge. Preservar os 32 IDs, com T001–T016 na Parte A, T017–T023 na B e T024–T032 executados por recorte em ambas. Parte A mantém Planilha/atalhos/API, move Atualizar para o topo e implementa Semana/Mês/objetivo/projetos; não adiciona perfil/instagram.js/Publicar/Ver no Instagram. Somente layout-model.js entra na allowlist agora; configuração/modal e remoção de Planilha ficam na B. Nenhum trabalho futuro é marcado concluído pela execução da A.

Parte A tem 12 screenshots (Semana/Mês/Produção × claro/escuro × 1440/390), regressões correspondentes, revisão independente, gate e doc-sync-onboarding, commit/push e PR próprio sem merge. Parar após entregar o PR A; B só começa após ok do autor. A branch atual codex/006-layout-v3 entrega A; branch/base da B serão escolhidas após esse ok, sem antecipar merge ou trabalho.

As duas decisões sobre falta de imagem/contador e releitura do pop-up estão em spec.md e contracts/apresentacao.md; não implementar o modal nesta rodada. Perfil e fila ainda não necessários são adiados para B, sem infraestrutura vazia.

## Summary

Trocar a apresentação das três telas pelo desenho v3, preservando a consulta completa, coleta e resolução privada das imagens. Reaproveitar HTML/CSS/JavaScript nativos, gaveta, seleção de mídia e ações de publicação existentes. Separar apenas funções puras de apresentação e o pop-up, pois serão compartilhados pelas telas e verificáveis sem navegador. Não alterar projeção, coleta, snapshot, mapa de etapas ou contratos Google.

A referência sanitizada é [layout-v3.html](../../docs/design/mockups/layout-v3.html). A especificação prevalece sobre Dados e avisos, downloads e textos do mockup. A decisão do autor manteve 32 tarefas; A foi aprovada/integrada e B autorizada em 09/10, com PR próprio sem merge.

## Technical Context

**Language/Version**: JavaScript nativo, CommonJS no servidor/testes; Node 24.19.0 existente.
**Primary Dependencies**: módulos nativos; Playwright já disponível por CRM_PLAYWRIGHT_MODULE. Nenhum pacote/framework novo.
**Storage**: captura/recibos existentes intactos; cache da 005 intacto. Estado visual de tela, período, objetivo expandido e índice do pop-up somente em memória; preferência crm-theme já existente.
**Testing**: node:test e node:assert/strict; arquivos reais em TEMP; HTTP real em porta efêmera; Playwright local sem pulos; transporte de mídia e atualização falsos.
**Target Platform**: computador Windows do autor; navegador em 1440×1050 e 390×844; cenário adicional de viewport baixa.
**Project Type**: aplicativo local de consulta, sem deploy.
**Performance Goals**: uma miniatura por peça visível, nenhuma imagem de tela oculta; Mês não busca mídia; reutilizar URL/cache da 005, sem polling ou prefetch global.
**Constraints**: captura/API iguais, só três telas, sem agentes/metadados operacionais, XSS via texto literal, allowlist de links, teclado/foco, sem dados reais, gate/review e nenhum merge B.
**Scale/Scope**: quatro jornadas; vinte screenshots de cinco vistas × dois temas × duas larguras. Quantidade de tarefas definida por speckit-tasks, sem condensação para caber no teto.

## Constitution Check

*GATE anterior à pesquisa e novamente após o desenho.*

| Princípio | Antes | Após desenho | Evidência/limite |
| --- | --- | --- | --- |
| I Local e simples | PASS documental | PASS documental | mesmo servidor e tecnologia, sem instalação |
| II Fontes e identidade | PASS documental | PASS documental | API, planilha, versões e hashes não mudam; derivados só no navegador |
| III Papéis | PASS documental | PASS documental | sem execução editorial, nomes técnicos removidos da UI |
| IV Evidência | PASS documental | PASS documental | A: evidências históricas preservadas; B: RED/GREEN, TEMP, cinco camadas, 20 screenshots e gate final executados; remoto pendente |
| V Feature única | PASS documental | PASS documental | somente pasta 006, sem design paralelo; desenho já autorizado pelo autor |
| VI Leitura privada | PASS documental | PASS documental | mesma rota de mídia, mesmos escopos e cache; thumbnails são demanda da tela visível |
| Governança | PASS documental | PASS documental | sem emenda, merge proibido; 32 IDs mantidos pelo autor em A/B, B depende de ok explícito |

“PASS documental” verifica conformidade do plano, não comportamento executado.

## Project Structure

### Documentation (this feature)

```text
specs/006-layout-v3/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/requirements.md
├── contracts/apresentacao.md
├── tasks.md
└── validacao.md
```

[validacao.md](validacao.md) registra fontes/execução de ambas e pendências remotas da B. O relatório analyze é emitido sem gravar arquivo, conforme a skill.

### Source Code (repository root)

```text
src/
├── servidor.cjs                 # só ampliar allowlist de estáticos
└── web/
    ├── index.html               # menu, topo, três regiões e diálogos
    ├── styles.css               # tokens existentes e layout responsivo
    ├── theme.js                 # comportamento preservado
    ├── app.js                   # renderização, navegação, atualização e gaveta
    ├── layout-model.js          # NOVO, derivados puros e seleção de imagens
    ├── perfil-config.js         # IMPLEMENTADO B, configuração pública sintética
    └── instagram.js             # IMPLEMENTADO B, pop-up e navegação/foco
tests/
├── layout-browser.cjs           # NOVO A, servidor/serviço TEMP e transporte falso
├── layout-fixtures.cjs          # NOVO, deriva das fixtures existentes
├── layout-model.test.cjs        # NOVO, estados/grupos/contagens/ordem
├── layout-http.test.cjs         # NOVO, estáticos/API/persistência intactas
├── layout-interface.test.cjs    # NOVO, topo/Planejamento/Produção/Publicar
└── instagram-interface.test.cjs # IMPLEMENTADO B, modal/teclado/gesto/falha
scripts/screenshots-layout-v3.cjs # NOVO, TEMP/porta efêmera/mídia falsa
tests/screenshots-layout-v3.test.cjs # NOVO, guardas reais do gerador
docs/design/screenshots/layout-v3-parte-a/*.png # 12 evidências A executadas
```

**Structure Decision**: módulos pequenos reutilizáveis, sem dividir em muitos componentes. Configuração em JS declarativo servido como estático para evitar endpoint/alteração de API. layout-model.js exporta as mesmas funções para navegador e CommonJS, sem ler DOM/arquivos/rede. instagram.js recebe peça e acionador, deriva posições com layout-model e lê perfil-config; não consulta Google. app.js resolve ID na vista vigente no clique, inclusive gaveta após releitura. app.js mantém a integração DOM.

## Phase 0 — Research

Pesquisa registrada em [research.md](research.md): funções e acoplamentos atuais, alternativas, fontes Context7 para Playwright e decisões sem lacunas críticas. Exploração delegada somente leitura, com responsabilidade exclusiva de mapear UI/contratos, sem alteração ou acesso operacional. Não há mapa Graphify neste checkout; usar o diagrama existente de docs/architecture.md, sem construir um grafo novo.

## Phase 1 — Design and contracts

### Derivados de apresentação

[Modelo](data-model.md) e [contrato](contracts/apresentacao.md) definem classificação, bloqueio, progresso, fila, agrupamento temporal e prévias. A autoridade é p.quadro.coluna da API; status textual não decide estado. “Outras” mapeia para Criação porque foi explicitamente solicitado pelo autor. Publicada/Pronta vencem bloqueio; revisão vigente de correção vence ausência de mídia. Não persistir nenhum derivado.

Peças aparecem uma vez por projeto da semana registrada; sem vínculo ficam em Semana não identificada. Planejamento usa dataCivil, incluindo remarcações, sem duplicar a peça em uma semana diferente por associação original. São agrupamentos distintos, explicitados no contrato. Progresso de Planejamento usa a semana civil após o filtro de formato, concordando com os cartões visíveis; Produção usa o projeto inteiro pela semana registrada, independente desse filtro. Futuro compara segundas-feiras civis normalizadas; semana registrada sem período conserva identidade e mostra Período não identificado.

### Integração sem Planilha visual — implementada na Parte B

Retirar HTML/controles de Planilha e funções de renderização de tabelas. objetivoMensal continua lendo Meses de view.planilha; preservá-lo na API. Selo torna-se indicador de estado, sem destino de navegação. Mover resultado-atualizacao e botão para o topo, com mensagem curta acessível. Remover atalhos “ver na Planilha”, fatos de responsável, nomes de ferramentas e histórico técnico visual; gaveta continua apresentando conteúdo, unidades, versões e revisão em linguagem simples.

Não repetir justificativas/explicações de operação nas telas. aria-label, texto de erro e feedback de ação continuam necessários. Nenhuma URL editorial é carregada automaticamente como HTML.

### Mídia e pop-up

Extrair imagensDaPeca/imagensDasUnidades mantendo o algoritmo da 005/PR #22, inclusive empates e falhas. Miniatura é primeira posição; carrossel usa todas as páginas vigentes e Reels, quando houver, usa as imagens de cenas já vinculadas. Fallback só para Imagem sem unidades, como hoje.

Listas carregam miniaturas apenas na tela ativa e quando a peça entra na região visível, por IntersectionObserver; img loading=lazy reforça a demanda. A galeria completa da gaveta continua sob abertura; pop-up carrega a página corrente e conserva placeholders por posição. Mês exibe pontos sem imagens. Não alterar a autorização/cache da rota local.

Dialog nativo showModal(), foco inicial em Fechar, ←/→ restritos ao pop-up ativo, sem wrap, pontos acessíveis, contador aria-live. Arrasto horizontal mínimo de 40 px e maior que deslocamento vertical; vertical mantém rolagem da legenda. Fechar retira src das posições do pop-up; não destrói gaveta. Se o acionador sumir na atualização, foco retorna ao título da tela, que é focável programaticamente.

### Layout e temas

Reutilizar tokens e comportamento de theme.js. Objetivo com botão/aria-expanded e painel hidden. Semana com sete colunas em região rolável, sem rolagem lateral da página; preservar rolagem ao retornar, inclusive após atualização em Produção. Ao navegar semanas, manter o mês selecionado enquanto houver interseção; sem interseção, usar o mês da quinta-feira. Cabeçalho mostra S# · tema somente para pauta confirmada. Mês em flex/grid com altura disponível e overflow interno quando necessário. Linhas não são botões contendo outros botões: acionador de gaveta e Ver no Instagram são irmãos. Em 390 px, sidebar permanece acessível via menu e Publicadas/Travadas aparecem abaixo da fila.

### Testes e compatibilidade

[Quickstart](quickstart.md) define validação sintética. Testes precedem cada comportamento. Na A, atualizar somente quadro de oito colunas, entrada Calendário/Lista, topo e gatilho de miniaturas; Planilha/atalhos permanecem. Na B, adaptar expectativas de Planilha removida e novas jornadas; preservar testes de backend/API, identidade, versões, segurança e falhas. Geradores históricos que participam do gate tiveram seletores ajustados para testar o layout vigente, sem reescrever evidências antigas ou atribuir-lhes prova da 006.

Cinco camadas: funções puras, invariância em arquivos TEMP, integração/derivados, HTTP real, navegador. Não escrever testes que apenas comparem markup de implementação. Verificar ausência de rede externa, duplo POST, captura/hashes antes/depois de GET, token/perfil inválido, foco, clipboard e URL recusada.

## Delivery and execution boundary

A contagem completa é 32 IDs, preservada pelo autor após a parada inicial. T001–T016 e fechamento correspondente T024–T032 pertencem à A autorizada; T017–T023 e fechamento B foram autorizados em 09/10 após aprovação/integração da A. Checkboxes globais T024–T032 só encerram depois de ambas, sem marcar jornadas futuras concluídas.

Por parte: RED/GREEN → adaptar regressões → screenshots → revisão independente → quality-gate como penúltima etapa local → doc-sync-onboarding como última etapa de alterações de código → commit noreply sem coautoria → push somente Browsher/crm-social e PR próprio → acompanhar CI/review do head final → entregar evidências sem merge. A foi integrada após aprovação explícita; B usa codex/006-layout-v3-parte-b sobre main a5be355, sem merge B. Provas e pendências atuais em validacao.md.

## Complexity Tracking

Sem violação constitucional ou nova infraestrutura. O peso está em quatro jornadas interdependentes, substituição de controles antigos e provas de acessibilidade/regressão. O limite de tarefas é decisão de execução, não motivo para omitir testes ou agregar trabalho sem delimitação.
