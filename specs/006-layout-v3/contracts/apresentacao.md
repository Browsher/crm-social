# Contrato de apresentação — Layout v3

Estado em 08/10/2026: Parte A implementada/testada localmente, não integrada; Parte B planejada e não iniciada; não substitui o contrato de captura/consulta. A 006 transforma somente a apresentação da vista v1; GET /api/visao, POST /api/atualizar, GET /api/midia/ID e captura permanecem com os mesmos dados e guardas.

## Recorte de entrega autorizado

Parte A mantém a página Planilha e seus atalhos/avisos, menu Planejamento/Produção/Planilha e atualização única no topo; implementa Semana/Mês/objetivo e projetos de Produção sem Ver no Instagram. Publicar, configuração de perfil, modal e remoção de Planilha pertencem somente à Parte B, após ok do autor na A. Cada parte tem PR/gate/review próprios, sem merge. As seções de resultado final abaixo só se aplicam à medida que a parte correspondente for implementada.

## Estado simples e prioridade

Usar a classificação já existente em p.quadro.coluna; não inferir estado por título, status, agente ou existência de arquivo.

| Coluna/condição atual | Estado simples |
| --- | --- |
| Publicada, por publicado_em preenchido | Publicada |
| Pronta, por estado_liberacao literal liberado | Pronta |
| Revisão | Revisão |
| Planejamento | Planejada |
| Redação, Visual, Mídia, Outras | Criação |

Publicação preenchida precede liberação, revisão e etapa; string publicada ou pronto em status é apenas informativa. O mapa operacional config/quadro-etapas.json permanece intacto. Revisão em andamento conserva o conjunto reconhecido atual, que está vazio na configuração vigente; a 006 não cria novos rótulos reconhecidos.

O indicador tem cinco posições fixas, com posição atual distinguida por texto/aria-current. Posições anteriores são progresso visual, não prova de que cada revisão/etapa realmente foi executada.

## Travamento apresentado

1. Publicada e Pronta não ficam travadas pela apresentação; dados conflitantes seguem na API.
2. Nos demais estados, pendência tipo revisao já projetada das revisões vigentes com decisão revisar/refazer/reprovado/rejeitado produz “Travado: precisa de correção”.
3. Sem essa correção, coluna Mídia com pendência tipo midia produz “Travado: falta gerar mídia”.
4. Demais casos não geram travamento. Falha HTTP da prévia, pacote ausente, coleta falha, mídia ausente em outra coluna e revisão histórica/ambígua não criam bloqueio.

Motivo substitui o indicador de cinco passos na linha. Não mostrar motivo técnico arbitrário, responsável ou ferramenta. Travado pode ter cor própria nos cartões/pontos, mas não cria sexto estado de captura ou altera o progresso.

## Progresso, semana e datas

X = peças Pronta ou Publicada; N = todas as peças no bloco apresentado; 0 ≤ X ≤ N. Sem peças não inventa meta nem 100%. Semanas futuras vazias mostram somente Planejamento na sexta-feira no corpo; período pode permanecer no cabeçalho.

Hoje e semana atual são civis de America/Sao_Paulo; semana inicia segunda e termina domingo. Planejamento segue dataCivil, inclusive remarcadas para outra semana; projeto de Produção mantém semanaId e agrega órfãs em Semana não identificada. Sem data fica acessível em grupo próprio, sem dia inventado. Não fixar quantidade/dias/formato obrigatório.

## Menu, topo e atualização

Resultado final da Parte B: somente Planejamento, Produção e Publicar. Remover Planilha/Dados e avisos, seus renderizadores e atalhos; manter os dados completos na API, inclusive view.planilha consumida por objetivoMensal.

Selo é indicador, sem navegação para tela removida. Botão ⟳ Atualizar e feedback acessível ficam no topo comum. Usa o POST existente com JSON {} e GET posterior, botão desabilitado até o término de ambos. GET isolado/no-op não apaga falha ativa; falha conserva visão anterior e mensagens curtas existentes. Ausência inicial não menciona agentes.

## Objetivo, Semana e Mês

Linha única com mês/objetivo; truncamento visual não reduz nome acessível completo. Botão aria-expanded controla painel hidden, sem espaço recolhido. Pautas estruturadas: S1 · tema · modelo, sem status/agente. Fallback textual de Meses conserva texto sem criar numeração ou modelo.

Semana tem sete colunas; 390 px usa região horizontal focável sem overflow da página, começa centrada em hoje e preserva a rolagem visual por semana ao retornar, inclusive após atualizar em Produção. Cartão mostra formato/título/estado e primeira posição de imagem. Ativação abre gaveta completa do dia. Mês ocupa altura disponível, preserva linhas de sete dias e pontos por estado, com nome acessível da semana incluindo data/título/estado das peças filtradas ou Sem peças. Alternar Semana/Mês sem navegar conserva a semana; setas no Mês selecionam a segunda-feira da primeira linha do mês navegado. Abrir semana de borda conserva o mês escolhido para objetivo/pautas. Setas na Semana conservam o mês selecionado enquanto a semana intersectá-lo; sem interseção, usam o mês da quinta-feira da semana (maioria dos dias). Ativar pauta usa pauta.mes. O cabeçalho identifica a pauta confirmada como S# · tema, sem atribuir confirmação a vínculo inferido. Mês não inicia leitura de imagens. Dia é grupo, botão anuncia a data e hoje por aria-current=date; miniatura tem papel de imagem/nome e glifo decorativo oculto.

## Mídia e perfil

Reutilizar seleção da 005: unidades vigentes, índice/ID em ordem, páginas com seu slot e cenas com início/final; empates preservados, mídias de versões distintas permitidas pelos ponteiros exatos. Sem unidades e formato Imagem, fallback exige versão positiva e arquivos exatos dessa produção/versão. Não preencher slot com arquivo arbitrário nem extrair ZIP.

Miniaturas visíveis passam a carregar na tela ativa, alteração autorizada do gatilho da 005. Telas ocultas e Mês não carregam mídia. URL local é /api/midia/ + ID interno codificado; servidor/cache/autorização não mudam. 4:5 usa contain, sem corte; falha mostra Prévia indisponível no lugar original.

Parte B, ainda não implementada: perfil virá de src/web/perfil-config.js; nomePerfil: string não vazia após trim, até 80 caracteres, sem controles C0/DEL. Configuração inválida usa Perfil não configurado. Arquivo inicial é sintético e não contém conta/credencial operacional.

## Pop-up Instagram

Parte B, ainda não implementada: modal nativo em formato de celular, sem contato com Instagram. Recebe peça e posições já resolvidas. Perfil, arte 4:5, legenda e hashtags; carrossel tem setas, pontos com nomes, contador atual/total e índice sem wrap. Contar todas as páginas vigentes, inclusive as sem arquivo/bytes; cada posição indisponível mostra “prévia indisponível”. Imagem única conserva uma posição 1/1 mesmo sem arquivo, com setas indisponíveis. Reels sem imagem exibe placeholder; vídeo continua link na gaveta. A seleção de slots do pop-up não filtra páginas indisponíveis; a galeria histórica da 005 preserva seu contrato.

Releitura bem-sucedida com modal aberto resolve novamente a mesma producao_id na vista nova: atualizar texto, versão e posições sem fechar; preservar índice quando válido e limitá-lo à última posição quando o total diminuir. Se não houver mais a peça, fechar e devolver foco ao acionador conectado ou ao título da tela. Falha de releitura mantém a vista anterior e o modal com o conteúdo anterior. Nenhuma atualização inicia publicação ou busca peça por título.

←/→ funcionam apenas no modal aberto; arrasto horizontal ≥40 px e dominante sobre vertical navega uma posição. Arrasto vertical não troca página. Foco contido no modal; Fechar/Esc fecha só o modal e restaura acionador; se ele não existir mais, título da tela. A posição da imagem falha permanece na navegação. Contador muda com anúncio acessível, sem legenda explicativa permanente.

## Publicar e ações

Fila: liberação literal liberado e publicação vazia, mesmo se arquivo/pacote indisponível; por data crescente, sem data ao final. Contador do menu é o tamanho integral da fila.

Texto copiado: legenda/hashtags preenchidas unidas por duas quebras de linha; vazio desabilita cópia, falha oferece seleção manual. Pacote é o único detalhes.pacotePublicacao já validado por produção, tipo pacote, extensão zip e pacote_versao positivos/exatos. Link HTTPS drive.google.com sem credenciais/porta não padrão, aberto só por clique. Recusa/ausência/ambiguidade: Pacote indisponível. Ver no Instagram abre o mesmo modal.

Publicadas recentes: até dez, data válida decrescente, preenchidas inválidas depois; não converter data inválida em zero. Travadas: mesmas regras acima, em seção separada. Em 390 px, seções seguem a fila; não há botão de publicar, escrita ou geração.

## Gaveta, conteúdo e ausência de agentes

Preservar dia inteiro, páginas/cenas vigentes/históricas, versões de mídia e textos seguros. A remove Com quem está, Corrige, responsável e metadados de ferramentas/agentes da peça. Atalhos de avisos/Planilha permanecem na A; a remoção desses destinos pertence à B. Revisão mantém decisão/motivo editorial e grupos, sem nomes de executores. API conserva avisos, responsáveis e histórico completos.

Não reescrever legenda/título capturados para ocultar palavras: a proibição incide nos metadados de produto; conteúdo editorial permanece literal via textContent. Identificadores técnicos não viram texto da interface.

## Segurança e invariância

Nenhum endpoint de dados novo. Parte A adiciona somente /layout-model.js; Parte B adicionará /perfil-config.js e /instagram.js à allowlist de estáticos, sob as mesmas guardas de Host/método/CSP/MIME. Não servir config genérica ou diretórios. Testes HTTP verificam GET/HEAD, métodos recusados, Host e ausência de dados privados. GET/miniatura/pop-up não escrevem captura/recibos; cache mantém somente o comportamento já contratado na 005.

## Referência e aceite

[Mockup sanitizado](../../../docs/design/mockups/layout-v3.html) conserva a composição aprovada. A spec prevalece sobre Dados e avisos, botões de download individual, textos explicativos, duas colunas móveis e dados de exemplo. A cópia não prova funcionamento.

Evidência global em duas partes: A tem 12 screenshots Semana/Mês/Produção; B prevê oito Publicar/pop-up, além das regressões visuais finais. Combinações globais: Semana, Mês, Produção, Publicar e carrossel no pop-up × claro/escuro × 1440/390. Testes adicionais cobrem imagem única, foco, viewport baixa, falha e arrasto sintético; não comprovam gesto físico, ZIP, operação real ou publicação.
