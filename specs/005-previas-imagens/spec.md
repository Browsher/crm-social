# Feature Specification: 005 — Prévias de imagens

**Feature Branch**: `codex/005-previas-imagens`

**Created**: 2026-10-08

**Status**: Implementada e testada localmente; 21 tarefas aprovadas pelo autor em 2026-10-08. Gate Windows da fonte `84aae5e` com 578 PASS e cobertura 95,0828%; [CI estrito dessa fonte](https://github.com/Browsher/crm-social/actions/runs/37812480393) PASS, inclusive Semgrep. A rodada inicial de 577 PASS e os 12 screenshots sintéticos inspecionados da fonte `392e109` permanecem históricos; entrega e checks/review por head acompanhados no PR #23 e na validação. T002 do autor permanece pendente, sem bloquear os testes. Sem integração ou merge. Evidências em [validacao.md](validacao.md).

**Input**: Solicitação do autor em 08/10/2026: imagens na gaveta, ampliação e falha localizada mantendo o Drive; leitura privada pelo servidor. Início após tarefa 1 integrada: [PR #22](https://github.com/Browsher/crm-social/pull/22), main `b90980a15fad653937fd024ac3c9bb2738e9d99a`.

Como uma folha de contato ao lado do texto, a gaveta permite reconhecer as imagens já registradas antes de abrir o Drive. Ver uma imagem não significa aprová-la, comprovar publicação ou conferir todo o conteúdo de um ZIP.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Reconhecer as imagens da peça (Priority: P1)

Como autor, quero abrir a peça e ver suas imagens na ordem das páginas, inclusive em Pronta para publicar, para conferir texto e visual juntos.

**Why this priority**: Valor principal; evita abrir cada arquivo separadamente e preserva o reaproveitamento de versões anteriores.

**Independent Test**: Carrossel sintético de cinco páginas em 1440/390 e claro/escuro: ordem, demanda, cache e rolagem lateral no celular.

**Acceptance Scenarios**:

1. **Given** texto v3 e imagens v2/v1/v1/v2/v3, **When** abre a peça, **Then** vê as cinco imagens na ordem das páginas, sem exigir igualdade de versões.
2. **Given** peça liberada, **When** abre a gaveta, **Then** vê a galeria na seção Pronta junto do pacote/legenda/hashtags; páginas/cenas continuam recolhidas.
3. **Given** quadro ou peças fechadas na gaveta, **When** consulta os textos, **Then** não busca bytes dessas peças; abrir uma delas busca somente suas imagens.
4. **Given** cena vigente com imagem inicial/final e vídeo, **When** abre a peça, **Then** vê as imagens na ordem de cena e ponteiro; vídeo conserva somente link.
5. **Given** cache válido do registro vigente, **When** reabre a peça, **Then** reutiliza os bytes; alteração/remoção do registro impede apresentar bytes antigos como atuais.

### User Story 2 - Conferir imagem ampliada (Priority: P2)

Como autor, quero ativar uma miniatura e ver a imagem maior, fechando com Escape e voltando ao mesmo ponto.

**Why this priority**: Conferir detalhes preservando o contexto da peça.

**Independent Test**: Ativação por mouse/teclado, botão de fechar, Escape e retorno de foco, com gaveta mantida aberta.

**Acceptance Scenarios**:

1. **Given** miniatura disponível, **When** é ativada, **Then** abre a mesma imagem ampliada, com nome acessível e botão Fechar.
2. **Given** ampliação aberta, **When** pressiona Escape, **Then** fecha somente a ampliação e devolve o foco; outro Escape pode fechar a gaveta.
3. **Given** largura 390, **When** amplia, **Then** imagem cabe na área disponível sem rolagem horizontal da página.

### User Story 3 - Continuar consultando quando a prévia falha (Priority: P1)

Como autor, quero “Prévia indisponível” somente no lugar da imagem que falhou, preservando o link permitido do Drive e as demais informações.

**Why this priority**: Rede, permissão e registros incompletos não podem bloquear a consulta ou expor valores privados.

**Independent Test**: Transporte falso com permissão negada, rede, timeout, tipo/tamanho/hash recusados; fallback localizado e nenhuma alteração editorial ou da captura.

**Acceptance Scenarios**:

1. **Given** acesso negado, rede ou timeout, **When** solicita prévia, **Then** somente a miniatura afetada fica indisponível, sem mensagem do provedor ou identificador privado.
2. **Given** bytes fora de PNG/JPEG/WEBP ou acima de 15 MB, **When** recebe o conteúdo, **Then** não apresenta nem promove ao cache válido.
3. **Given** sha256 declarado, **When** bytes divergem, **Then** não serve; sem hash, tipo/tamanho continuam obrigatórios.
4. **Given** arquivo ausente, fora da NTV ou captura inválida, **When** solicita a prévia, **Then** não acessa rede nem contorna a recusa com cache antigo.
5. **Given** falha numa peça Pronta, **When** consulta, **Then** mantém Pronta, pacote, legenda, hashtags e avisos da Planilha.

### Edge Cases

- Extensão/MIME declarado não substitui bytes; recusar SVG, GIF, vídeo, ZIP, HTML/JSON e assinatura truncada.
- Sem id_drive ou versão válida: sem download. IDs internos nunca formam caminhos.
- Captura alterada durante o download: não servir referência anterior como vigente.
- Mesmo ID/versão com id_drive ou hash novo: cache anterior não pode valer.
- Cache corrompido/parcial ou erro de disco: não servir bytes não conferidos nem derrubar textos.
- Ponteiro repetido preserva cada posição; nenhuma mídia substituta é inferida.
- Imagem aceita pelos bytes mas indecodificável no navegador: fallback localizado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Mostrar imagens explicitamente vinculadas às páginas/cenas vigentes, por índice e posição do ponteiro, preservando identidade/versões da tarefa 1. Peça de imagem sem unidades usa os arquivos de imagem da sua versão de produção, preservando empates.
- **FR-002**: Incluir a galeria em Pronta junto das ações existentes; não extrair ZIP, afirmar seus integrantes ou exigir versão da imagem igual à do pacote.
- **FR-003**: Miniaturas lado a lado, rolagem lateral em 390, sem corte horizontal da página/gaveta.
- **FR-004**: Ativação abre imagem maior; botão/Escape fecham ampliação, devolvem foco e preservam gaveta.
- **FR-005**: Buscar somente quando a peça abre; quadro e peças fechadas não iniciam download; vídeos fora.
- **FR-006**: Navegador identifica somente arquivo interno; servidor resolve a referência remota exclusivamente na captura vigente válida, recortada à NTV. Nunca aceitar ID do Drive, URL ou caminho do navegador.
- **FR-007**: Aceitar somente PNG/JPEG/WEBP conferidos pelos bytes, até 15 MB, com timeout finito e sem redirecionar para outro destino.
- **FR-008**: Cache local ignorado por Git, por arquivo/versão; mudança/remoção de referência invalida reutilização. Cache não substitui captura válida.
- **FR-009**: Conferir sha256 preenchido antes de servir, também no cache; hash preenchido inválido deve recusar prévia.
- **FR-010**: Imagens somente do servidor local, tipo correto conferido pelos bytes no servidor, sem sniffing de MIME pelo navegador (`nosniff`) ou armazenamento HTTP; credenciais, tokens e comunicação Google somente no servidor.
- **FR-011**: Falha mostra “Prévia indisponível” localizada e mantém link Drive da allowlist atual; nunca expor ID do Drive, e-mail, resposta Google ou stack em erro/headers/URL de mídia.
- **FR-012**: Prévia/cache não alteram captura, coleta/falha de coleta, aprovação, liberação, publicação, Google, n8n ou agentes.
- **FR-013**: Obedecer à constituição 1.2.0 aprovada em 2026-10-08: conta leitora, arquivos compartilhados, escopo de leitura e servidor loopback.
- **FR-014**: Testes com transporte falso/imagens sintéticas geradas no teste, RED antes da implementação e cinco camadas aplicáveis: regras, I/O, serviço/projeção, HTTP real e interface local.
- **FR-015**: Doze screenshots sintéticos: 1440/390, claro/escuro, galeria/ampliação/indisponível; gate/review vigentes e um PR sem merge.

### Key Entities *(include if feature involves data)*

- **Arquivo registrado**: ID interno, produção, versão, referência remota e hash opcional; registro vigente autoriza a busca.
- **Imagem vinculada**: ponteiro resolvido da unidade vigente, com posição/versão/link; não infere aprovação ou conteúdo ZIP.
- **Entrada de cache**: bytes privados validados ligados a arquivo/versão/referência, descartáveis e sem estado editorial.
- **Estado de prévia**: não solicitada, carregando, disponível ou indisponível, somente apresentação.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nos quatro temas/larguras, cinco imagens corretas na ordem; última alcançável no celular sem cortar a página.
- **SC-002**: Todos os cenários mouse/teclado abrem a imagem escolhida; Escape devolve foco e mantém gaveta.
- **SC-003**: Todos os casos US3 mantêm texto/link e não alteram captura/estado nem expõem valores privados.
- **SC-004**: Quadro e peça fechada geram zero buscas dessa peça; segunda abertura com cache válido gera zero downloads remotos adicionais.
- **SC-005**: Testes das cinco camadas passam, 12 screenshots inspecionados, quality-gate verde e review sem Critical, segurança ou regressão no head final.

## Assumptions

- “Miniaturas do pacote” usa as imagens vinculadas às unidades vigentes na seção Pronta. O contrato identifica ZIP, sem manifesto de conteúdo. Interpretação registrada no planejamento e incluída no escopo aprovado pelo autor em 2026-10-08.
- 15 MB = 15.000.000 bytes; timeout do plano abrange corpo completo.
- Bytes originais, sem transcodificação, geração de derivados ou dependência nova.
- Task do autor: compartilhar a pasta “Produções” da NTV como Leitor com a conta de serviço. Não bloqueia testes sintéticos, nem será executada pelo agente.
- A geração de 21 tarefas motivou a parada de planejamento prevista pelo autor. Após receber a distribuição, ele aprovou expressamente esse escopo em 2026-10-08, sem compressão de tarefas.
- Fora: vídeo, escrita/publicação, extração ZIP, auditoria editorial, novas regras de revisão/retirada/vigência.
