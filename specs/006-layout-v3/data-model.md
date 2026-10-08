# Modelo de apresentação — Layout v3

Este modelo organiza a vista já consultada; não define captura, migração ou escrita. Parte A implementada/testada localmente, não integrada; fila, perfil e estado de pop-up permanecem planejados para B, não iniciada. [Provas e limites](validacao.md). Os nomes abaixo são derivados efêmeros do navegador.

## Peça apresentada

Entrada: producao_id, semanaId, dataCivil, titulo, formato, versao, estado_liberacao, publicado_em, legenda, hashtags, quadro e detalhes já presentes na API. Identidades não são normalizadas ou reconstruídas.

| Derivado | Regra |
| --- | --- |
| estadoSimples | um de Planejada, Criação, Revisão, Pronta, Publicada; mapa do contrato |
| motivoTravado | vazio ou motivo curto de correção vigente/mídia na etapa Mídia |
| imagens | Parte A preserva a seleção da galeria da 005; falha de bytes mantém placeholder. Slots sem arquivo no contador do pop-up pertencem à B |
| miniatura | primeira posição ou Prévia indisponível |
| textoCopia | legenda/hashtags preenchidas unidas por duas quebras de linha |
| pacote | detalhes.pacotePublicacao já resolvido; link sujeito à allowlist atual |

Preenchido conserva a regra existente: null/undefined/string com somente espaços são vazios; não converte versão inválida em número. Texto vira textContent; URL tem guarda dedicada. Não alterar objetos de view.

## Semana apresentada

Identidade: segunda-feira civil para navegação; semana_id para projeto da semana registrada. Campos: período, tema/pauta confirmados, lista de peças, total N, prontas X, proporção (null quando N=0).

Planejamento agrupa pela data civil e exibe todas as peças do dia; Produção usa semanaId e mantém órfãs em Semana não identificada. Sem data não é descartada. X conta estados Pronta/Publicada; bloqueios não alteram captura ou liberação.

Atual primeiro, próxima semana depois, demais futuras em ordem crescente e passadas em ordem decrescente. Calendário pode apresentar período vazio sem criar Semanas/Produções. Período é texto identificador; corpo vazio futuro tem somente a mensagem autorizada.

## Objetivo/pautas

Meses continua vindo de view.planilha e Pautas de view.pautas. Alternância Semana/Mês sem navegação preserva a semana selecionada. Setas no Mês selecionam a segunda-feira da primeira linha do mês navegado; abrir uma semana de borda conserva esse mês para objetivo/pautas. Ao navegar por setas na Semana, conservar o mês selecionado enquanto algum dia da semana pertencer a ele; ao sair desse mês, selecionar o mês da quinta-feira da semana (maioria de seus sete dias). Ativar pauta usa pauta.mes explicitamente. Ambiguidade/ausência mantém a regra atual; fallback textual de Meses não recebe S1/tema/modelo inventados.

## Fila de publicação — planejada para Parte B

Peças com estado_liberacao === liberado e publicado_em vazio. Data crescente; sem data ao final; desempate estável por producao_id exato. Publicadas: publicação preenchida, data válida decrescente, inválidas ao final, até dez. Travadas: motivoTravado preenchido. Publicadas/Pronta não são classificadas como travadas.

## Perfil de apresentação — planejado para Parte B

Configuração versionada pública: nomePerfil é string não vazia após trim, no máximo 80 caracteres, sem controle C0/DEL; nenhuma URL, e-mail, chave ou ID de serviço é solicitado. Valor inicial: perfil.exemplo. Ausente/inválida: Perfil não configurado, sem falhar a consulta.

## Estado visual temporário

Tela ativa; modo Semana/Mês; semana/mês; objetivo expandido; referência de acionador; pop-up aberto e índice inteiro 0 ≤ índice < total. Nenhum dado persiste além da preferência de tema existente. Imagem única tem total=1 e 1/1 mesmo sem arquivo. Carrossel conta todas as páginas vigentes, com placeholder “prévia indisponível” nos slots sem imagem. Releitura da mesma peça atualiza conteúdo e limita índice ao total novo; remoção fecha/restaura foco; falha conserva o conteúdo anterior. Modal pertence somente à Parte B.
