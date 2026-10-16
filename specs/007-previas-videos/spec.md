# Feature Specification: Prévias de vídeos
**Feature Branch**: `codex/007-previas-videos`
**Created**: 2026-10-15
**Status**: Concluída localmente em 2026-10-15, 12/12 tarefas: implementada, testada e instalada com demonstração/backup e gate normal final aprovado; sem integração Git. [Validação](validacao.md).
**Input**: Capa do vídeo; Ver no Instagram inicia reprodução no CRM; botão Tela cheia.

## User Scenarios & Testing
### User Story 1 — Capa e reprodução no CRM (P1)
O autor reconhece o vídeo pela capa no calendário, na publicação e no painel. Ver no Instagram abre a prévia existente e inicia o vídeo final registrado.
**Independent Test**: capa e MP4 sintéticos; clique no botão; tempo avança sem requisição externa.
**Acceptance Scenarios**:
1. Vídeo final unívoco com capa da mesma produção/versão mostra a capa no painel.
2. Ver no Instagram inicia o arquivo final correto com controles de pausa, busca e volume.
3. Fechar pausa e libera a fonte; reabrir começa do início.
### User Story 2 — Tela cheia (P2)
Tela cheia expande o vídeo; controle nativo ou Escape retorna à prévia.
**Independent Test**: fullscreen real no navegador compatível e retorno preservando controles.
### Edge Cases
Sem capa: estado neutro. Sem vídeo, vínculo ambíguo, bytes inválidos ou permissão ausente: prévia indisponível. Bloqueio de autoplay mantém controles para reprodução manual. Remover a peça durante atualização encerra a prévia. Imagens e carrosséis mantêm a galeria.

Releitura da mesma referência de vídeo/capa preserva tempo e pausa; referência alterada libera a mídia anterior. Gestos do carrossel não capturam os controles nativos do vídeo.

## Requirements
### Functional Requirements
- **FR-001**: Mostrar capa registrada; não carregar bytes do vídeo antes da abertura.
- **FR-002**: Selecionar somente vídeo final unívoco da mesma produção/versão pelo ID final registrado.
- **FR-003**: Reproduzir no CRM por ação do usuário, com controles e proporção preservada.
- **FR-004**: Botão Tela cheia acessível, retorno e erro tratados.
- **FR-005**: Fechar/trocar peça pausa e libera o vídeo.
- **FR-006**: Servidor resolve somente ID interno pela captura vigente; recusa caminhos, URLs, outra marca e bytes inválidos.
- **FR-007**: Cache privado validado, limite de tamanho, leitura mínima e busca por bytes.
- **FR-008**: Preservar estados editoriais, datas, agendas e geração; nenhuma dependência nova.
- **FR-009**: TDD com regras, cache TEMP, serviço, HTTP e interface sintéticos.
### Key Entities
Vídeo final: Arquivos tipo video, mesma produção/versão e id_drive final.
Capa: Arquivos tipo imagem, papel capa_video, mesma produção/versão e video_arquivo_id nas origens.

## Success Criteria
### Measurable Outcomes
- **SC-001**: Um clique abre a prévia e faz o tempo do vídeo avançar no navegador.
- **SC-002**: Tela cheia funciona em navegador compatível e fechar interrompe a reprodução.
- **SC-003**: Zero acesso direto do navegador ao Drive ou exposição de credenciais.
- **SC-004**: Galerias anteriores continuam passando nos testes.
## Assumptions
MP4 H.264 inicial. Banco com múltiplos arquivos sem final escolhido não inventa um vídeo único. Usar capas já produzidas.
