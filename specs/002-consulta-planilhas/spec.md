# Feature Specification: Planilhas — leitura direta local

**Feature Branch**: `002-consulta-planilhas`
**Created**: 2026-10-05
**Status**: Especificada e planejada; implementação não iniciada; emenda proposta, não aplicada.
**Input**: Atualizar diretamente da planilha pelo servidor local, com conta de serviço leitora, captura íntegra e tipada e continuidade da importação por arquivo.

## Contexto e limites

A 001 é um álbum da operação. A 002 permite tirar outra fotografia por **Atualizar dados**, sem editar a fonte. Fontes: [ROADMAP](../../ROADMAP.md#002--planilhas), [telas](../../docs/design/telas.md) e [contrato v1 anterior](../001-consulta-local-producao/contracts/captura-e-consulta.md). A planilha continua autoritativa; o CRM não coordena a fila.

Esta rodada contém somente documentos. Implementação bloqueada até o aceite explícito da [emenda](constitution-proposal.md). Conta de serviço e compartilhamento são tarefas do autor: bloqueiam demonstração real, não testes com cliente falso.

Fora do escopo: objetivo mensal da 003, telas de Agentes/Controle/Execucoes, escrita no Google/Drive, fila, n8n ou mídia, agenda/polling e acesso por outros computadores. Menu permanece Planejamento, Produção e Planilha; objetivo **Ainda não definido**.

## User Scenarios & Testing

### User Story 1 — Atualizar com captura íntegra e tipada (Priority: P1)

O autor clica em **Atualizar dados** e vê uma captura completa da fonte configurada. Números e booleanos chegam com seu tipo; versões numéricas válidas deixam de ser tratadas como texto ambíguo.

**Why this priority**: valor principal e resolução da limitação de tipagem da 001.
**Independent Test**: cliente falso com nove abas completas, leituras iguais e metadados estáveis; conferir projeção, selo e persistência privada sem Google real.

**Acceptance Scenarios**:
1. **Given** configuração leitora válida e fonte estável, **When** atualiza, **Then** nove abas são capturadas e promovidas pelo mesmo importador; seis tabelas da interface e selo mostram a captura nova.
2. **Given** versões/índices numéricos válidos, **When** coleta, **Then** continuam números e permitem vínculos/vigência conforme regras existentes; strings não são coercidas nem decisões inferidas.
3. **Given** atualização pendente, **When** consulta outra tela, **Then** vê a captura anterior até promoção atômica e o botão fica desabilitado enquanto aguarda.
4. **Given** leitura direta aceita, **When** abre Planilha/Histórico, **Then** a fonte é identificada como leitura pelo servidor local, sem identificador da planilha, conta ou chave.

### User Story 2 — Continuar consultando quando a atualização falha (Priority: P1)

O autor entende a falha e continua vendo os dados válidos com sua data original. Erro não vira zero linhas nem sincronização concluída.

**Why this priority**: confiança no frescor faz parte do MVP.
**Independent Test**: captura válida sintética e cliente falso para acesso negado, indisponibilidade, timeout, aba ausente, mudança entre leituras e dados inválidos; comparar bytes, ponteiro e data.

**Acceptance Scenarios**:
1. **Given** captura vigente, **When** uma etapa falha, **Then** ela permanece íntegra; tentativa confirmada aparece no Histórico com motivo seguro e selo **Atualização falhou**.
2. **Given** hashes/metadados divergentes, **When** termina a coleta, **Then** não salva candidata como válida e informa conflito.
3. **Given** coleta/importação com trava adquirida, **When** outra atualização começa, **Then** retorna conflito sem iniciar outra coleta ou sobrescrever arquivos.
4. **Given** primeira atualização falha sem captura, **Then** vazio e falha ficam visíveis; filtros/navegação não causam erro de página.
5. **Given** falha de I/O impede confirmar recibo, **Then** informa falha não registrada, sem prometer alteração do Histórico.

### User Story 3 — Preservar importação por arquivo e reservar três abas (Priority: P2)

O autor continua recebendo arquivos da Central. Capturas antigas permanecem legíveis; abas auxiliares ficam privadas para a 006, sem anunciar agenda comprovada ou painel novo.

**Why this priority**: preservar operação existente e fronteiras da 006.
**Independent Test**: importar envelopes sintéticos antigos/novos pelo mesmo comando, consultar sem Google e conferir ausência das abas auxiliares em API, HTML e logs.

**Acceptance Scenarios**:
1. **Given** envelope v1 legado, **When** importa arquivo, **Then** conserva hashes/tipos e critérios de aceitação; consulta não chama Google.
2. **Given** perfil explícito de nove abas, **When** importa, **Then** valida exatamente esse conjunto; sete/oito abas são recusadas.
3. **Given** auxiliares capturadas, **When** navega, **Then** registros, prompts, flags e identificadores não chegam à interface; só seis abas editoriais têm telas.
4. **Given** chave ausente, **When** consulta/importa arquivo, **Then** esses caminhos funcionam; coleta direta informa configuração indisponível sem fingir que um GET atualizou Google.

### Edge Cases

- Aba ausente/duplicada, cabeçalho ausente/duplicado, erro de célula, fragmento incompleto ou escalar inválido: recusar captura.
- Grade maior que uma requisição: fragmentar e conferir toda cobertura, preservando vazios intermediários; nunca declarar sucesso parcial.
- Fórmula: capturar valor efetivo, sem executá-la; erro invalida coleta. Texto numérico continua texto.
- Datas: tipo/formato e fuso da fonte; não interpretar texto localizado. Data inválida/horário ambíguo dá erro claro.
- Futuro acima de dez minutos ou instante igual/anterior à vigente: mesmas recusas da 001; nova captura posterior com células iguais pode renovar frescor.
- Chave/configuração inválida, chave dentro do repositório por link/junção, origem externa, redirect e concorrência: recusar sem expor valores.
- Dupla leitura não é transação Google; mudança desfeita entre observações pode escapar à detecção.

## Requirements

### Functional Requirements

- **FR-001**: **Atualizar dados** DEVE solicitar coleta nova ao servidor; GET de consulta permanece local e sem rede.
- **FR-002**: Autenticar somente conta de serviço explícita, com escopo único `https://www.googleapis.com/auth/spreadsheets.readonly`, sem credenciais implícitas ou delegação de usuário.
- **FR-003**: Chave fora do repositório pelo caminho real, inclusive junções/links; chave, token, ID da planilha e e-mail da conta nunca chegam ao navegador, arquivos públicos, testes, logs ou erros.
- **FR-004**: Capturar Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes, Agentes, Controle e Execucoes completas de A1 até última linha/coluna alocadas, sem renomear cabeçalhos.
- **FR-005**: Executar metadados antes → leitura completa 1 → hash 1 → leitura completa 2 → hash 2 → metadados depois; divergência impede promoção.
- **FR-006**: Manter `schemaVersion: 1`, perfil explícito para nove abas e mesmo importador/validação/promoção atômica, identidade, frescor e colisão; perfil ausente significa seis abas legadas.
- **FR-007**: Preservar tipos efetivos e representação determinística de datas; não converter texto numérico/booleano, nem reescrever captura antiga.
- **FR-008**: Falha preserva vigente/data com motivo curto e seguro; só captura nova completa aceita encerra falha ativa; distinguir recibo não confirmado.
- **FR-009**: Coleta e importação compartilham uma trava durante toda operação, inclusive await, liberando só a própria e preservando resultado original.
- **FR-010**: Botão desabilitado enquanto pendente; tela/selo usam estado confirmado; menu e dados existentes funcionam em 1440 e 390 px.
- **FR-011**: Guardar/validar auxiliares privadamente, sem tela, registros na API ou alegação de agenda/integração.
- **FR-012**: Mesmo importador por arquivo aceita legado e perfil novo; consulta/importação manual funcionam sem configurar Google.
- **FR-013**: Limite total de 90 segundos com cancelamento; requisições até 50.000 células; falta de cobertura/timeout são falha.
- **FR-014**: Servidor somente loopback; rejeitar atualização de origem externa; navegador não escolhe planilha, escopo, chave ou destino.
- **FR-015**: Autor cria conta, habilita API e compartilha como leitora antes da demonstração; testes usam cliente falso/fixtures e independem disso.
- **FR-016**: Aprovar/aplicar emenda antes da implementação; RED observado antes de GREEN, revisão, gate e um PR por história; privacidade no repositório público.

### Key Entities

- **Configuração privada**: chave e fonte explícitas; não é estado editorial.
- **Captura v1**: perfil seis/nove, tabelas, metadados, hashes e intervalo.
- **Célula tipada**: valor efetivo/formato convertido deterministamente em escalar.
- **Tentativa confirmada**: completa/falhou e motivo seguro ligado ao Histórico.
- **Abas reservadas**: Agentes, Controle e Execucoes fora da projeção pública.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Um clique com cliente falso estável produz captura aceita, hashes iguais e três telas coerentes; cobertura de 100% dos intervalos alocados.
- **SC-002**: Todos os erros/conflitos preservam vigente e data byte a byte; nenhum vira sucesso/zero linhas.
- **SC-003**: Fixtures numéricas válidas demonstram vínculos/vigência sem aviso de número recebido como texto; strings inválidas continuam identificadas.
- **SC-004**: Testes HTTP/UI/logs/arquivos públicos não contêm credencial ou conteúdo auxiliar privado; zero requisições Google de escrita.
- **SC-005**: Legado continua importável/legível com hashes originais; mesmo comando aceita perfil novo e rejeita conjunto incompleto.
- **SC-006**: Sucesso, falha, pendente e falta de configuração legíveis em 1440/390, sem pageerror; limite de 90 segundos e exclusão mútua verificados com cliente/relógio falsos.
- **SC-007**: Cenário sintético de 500 peças/nove abas passa nas cinco camadas; gate Linux e review de cada história vinculados ao head antes do merge.

## Assumptions

- Um único usuário local; configuração sensível nunca versionada. Exemplos usam nomes de variáveis, sem valores reais.
- Aprovação constitucional e credencial são pré-requisitos distintos, ambos pendentes nesta rodada.
- Novo runtime lê legado; runtime da 001 não entende perfil novo. Sem conversão/migração automática.
- Sem dúvida de produto para `speckit-clarify`; decisões técnicas em [research.md](research.md).
