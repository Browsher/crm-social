# Modelo de apresentação — Layout v3

Este modelo organiza a vista já consultada; não define captura, migração ou escrita. Selo visual conserva instante e falha da captura; badge global Dados a confirmar deriva captura presente + view.avisos, e resumo da peça deriva detalhes.avisos, sem novo estado capturado; selo.destino legado permanece apenas como dado na API. Parte A integrada; B implementada/testada localmente e não integrada, incluindo fila/perfil/estado de pop-up. Revisão visual 08ba10b/gate bc74d6e PASS/756 testes dentro dos mesmos 32 IDs; push/CI/review atuais pendentes, provas anteriores históricas. [Provas e limites](validacao.md). Os nomes abaixo são derivados efêmeros do navegador.

## Peça apresentada

Entrada: producao_id, semanaId, dataCivil, titulo, formato, versao, estado_liberacao, publicado_em, legenda, hashtags, quadro e detalhes já presentes na API. Identidades não são normalizadas ou reconstruídas.

| Derivado | Regra |
| --- | --- |
| estadoSimples | um de Planejada, Criação, Revisão, Pronta, Publicada; mapa do contrato |
| motivoTravado | vazio ou motivo curto de correção vigente/mídia na etapa Mídia |
| imagens | Parte A preserva a seleção da galeria da 005; falha de bytes mantém placeholder. posicoesInstagram preserva na B todos os slots, inclusive sem arquivo, no contador |
| miniatura | primeira imagem disponível da seleção histórica 005 ou Prévia indisponível; pode diferir da primeira posição lógica ausente de Imagem única no modal |
| textoCopia | legenda/hashtags preenchidas unidas por duas quebras de linha |
| pacote | detalhes.pacotePublicacao já resolvido; link sujeito à allowlist atual |

Preenchido conserva a regra existente: null/undefined/string com somente espaços são vazios; não converte versão inválida em número. Texto vira textContent; URL tem guarda dedicada. Não alterar objetos de view.

## Semana apresentada

Identidade: segunda-feira civil para navegação; semana_id para projeto da semana registrada. Campos: período, tema/pauta confirmados, lista de peças, total N, prontas X, proporção (null quando N=0).

Planejamento agrupa pela data civil e exibe todas as peças do dia; Produção usa semanaId e mantém órfãs em Semana não identificada. Sem data não é descartada. X conta estados Pronta/Publicada; bloqueios não alteram captura ou liberação. Progresso de Planejamento segue os cartões da semana civil após o filtro de formato ativo; Produção conserva o projeto inteiro por semana registrada, sem herdar esse filtro.

Atual primeiro, próxima semana depois, demais futuras em ordem crescente e passadas em ordem decrescente. Calendário pode apresentar período vazio sem criar Semanas/Produções. Período é texto identificador; futuro é calculado comparando as segundas-feiras civis normalizadas, sem tratar um início posterior na semana atual como futuro. Semana registrada sem período usa Período não identificado; grupo órfão tem h2 Semana não identificada e subtítulo compacto Sem semana. Corpo vazio futuro tem somente a mensagem autorizada.

## Objetivo/pautas

Meses continua vindo de view.planilha e Pautas de view.pautas. Alternância Semana/Mês sem navegação preserva a semana selecionada. Setas no Mês selecionam a segunda-feira da primeira linha do mês navegado; abrir uma semana de borda conserva esse mês para objetivo/pautas. Ao navegar por setas na Semana, conservar o mês selecionado enquanto algum dia da semana pertencer a ele; ao sair desse mês, selecionar o mês da quinta-feira da semana (maioria de seus sete dias). Ativar pauta usa pauta.mes explicitamente. Ambiguidade/ausência mantém a regra atual; fallback textual de Meses não recebe S1/tema/modelo inventados.

## Fila de publicação — implementada na Parte B

Peças com estado_liberacao === liberado e publicado_em vazio. Data crescente; sem data ao final; desempate estável por producao_id exato. Publicadas: publicação preenchida, instante ISO com fuso/dia civil real válido decrescente; preenchidas inválidas ao final por ID, até dez. Inválida mostra Data de publicação a confirmar. Travadas: motivoTravado preenchido. Publicadas/Pronta não são classificadas como travadas.

## Perfil de apresentação — implementado na Parte B

Configuração versionada pública: nomePerfil é string não vazia após trim, no máximo 80 caracteres, sem controle C0/DEL; nenhuma URL, e-mail, chave ou ID de serviço é solicitado. siglaMarca também é string não vazia após trim, até cinco caracteres sem C0/DEL, exibida uppercase como texto literal no avatar; inválida usa •. Valores versionados sintéticos: perfil.exemplo/DEMO; personalização com nome real somente local, não commit, sem mecanismo ignored/env implementado. Ausente/inválida: Perfil não configurado, sem falhar a consulta.

## Estado visual temporário

Tela ativa; modo Semana/Mês; semana/mês; objetivo expandido; referência de acionador; pop-up aberto e índice inteiro 0 ≤ índice < total. Nenhum dado persiste além da preferência de tema existente. Se a seta focada passar a disabled, outra habilitada ou Fechar recebe foco. Se seta ou ponto focados forem ocultados quando o total cair a 1, Fechar recebe foco; pontos recriados com total maior recebem foco no índice corrente. Imagem única tem total=1 e 1/1 mesmo sem arquivo, conservando a primeira posição lógica null em vez de saltar à imagem seguinte; sem posições usa a seleção/fallback 005. Carrossel conta todas as páginas vigentes, com placeholder “prévia indisponível” nos slots sem imagem. Releitura da mesma peça atualiza conteúdo e limita índice ao total novo; remoção fecha/restaura foco; falha conserva o conteúdo anterior. Modal implementado na Parte B; Reels usa nomes acessíveis por Cena N · início/final, reaplicados em releitura mesmo com total constante. A abertura consulta a identidade vigente; captura/selo/Dados/Atualizar/feedback permanecem somente na página, inerte durante showModal, sem transporte/clonagem. Releitura recebida de atualização iniciada antes da abertura ou programática durante modal mantém os estados descritos; o usuário fecha a prévia para iniciar outra atualização pelo botão do topo.
