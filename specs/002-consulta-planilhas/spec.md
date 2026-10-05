# Feature Specification: 002 — Planilhas

**Branch:** `002-consulta-planilhas`. **Created:** 2026-10-05.
**Status:** escopo reduzido aprovado; constituição 1.1.0 aplicada. Implementação e aceite serão registrados somente em [validacao.md](validacao.md).
**Input:** leitura pessoal da planilha pelo servidor local, sem dependências e sem escrita remota.

## User Scenarios & Testing

### US1 — Atualizar dados (P1)

O usuário clica **Atualizar dados**; o servidor consulta as seis abas e promove uma captura íntegra pelo importador existente. GET continua sem rede. Mensagem curta informa atualizando/sucesso/falha.

**Independent Test:** cliente/transporte falsos, seis abas sintéticas, duas chamadas batchGet iguais, metadados estáveis e mesma validação/persistência.
**Acceptance Scenarios:**
1. Dada captura vigente, ao atualizar com fonte estável, a nova captura completa e tipada substitui a anterior; selo e três telas concordam.
2. Durante a leitura, botão desabilitado e dados anteriores visíveis; após promoção há mensagem curta de sucesso.
3. Números/booleanos da fonte permanecem tipos nativos; texto numérico permanece texto. Versões/índices numéricos válidos resolvem a ambiguidade por tipagem da 001.

### US2 — Falha preserva dados (P1)

**Independent Test:** um caso por categoria — configuração, acesso negado, rede/timeout, dados inválidos/fonte mudou — conserva captura e data. Sem captura, o vazio permanece navegável.
**Acceptance Scenarios:**
1. Toda falha mostra mensagem curta sem valores privados e preserva captura/completedAt.
2. Duas leituras/hashes ou metadados divergentes são recusados, sem candidata válida no disco.
3. Uma tentativa concorrente não inicia coleta nem substitui dados. Importação manual usa a mesma trava.

### US3 — Central continua disponível (P2)

**Independent Test:** comando por arquivo e GET funcionam sem credencial Google; hashes/validação antigos intactos.
**Acceptance Scenarios:** mesmo importador aceita v1 seis abas da Central e fonte direta; consulta não autentica nem chama Google. Falha ativa só acaba com captura nova aceita, não GET/no-op.

## Requirements

- **FR-001:** botão → POST local → seis abas Semanas, Produções, Páginas, Cenas, Arquivos, Revisoes; A1 até última linha/coluna alocadas; metadados antes/depois e batchGet duas vezes; hashes calculados em código e iguais antes da promoção.
- **FR-002:** JWT RS256 nativo com node:crypto, escopo readonly único, aud/endpoint fixos https://oauth2.googleapis.com/token, exp−iat≤3600; fetch sem redirect, timeout; token apenas em memória. Sheets somente GET em sheets.googleapis.com.
- **FR-003:** chave por CRM_GOOGLE_CREDENTIALS_FILE fora da pasta do projeto; CRM_SPREADSHEET_ID privado no servidor. Nenhuma chave/token/email/ID da fonte no navegador, arquivo versionado, erro ou log. Sem testes de links/junções.
- **FR-004:** envelope schemaVersion 1, exatamente seis abas/66 mínimos e mesmo validador/importador/promoção; preservar tipos, IDs, regras de frescor e bytes legados. Sem perfil novo. Datas numéricas declaradas convertidas deterministicamente antes dos hashes.
- **FR-005:** quatro categorias de falha, um teste por categoria; preservar vigente/data. Recibo confirmado informa falha ao selo/Histórico; falha de I/O sem recibo e lock ocupado não fingem confirmação. Aviso de liberação de trava usa texto fixo na resposta/UI, sem mudar resultado original.
- **FR-006:** manter uma trava durante await e promoção, sem writer paralelo ou reacquisição aninhada; GET exclusivamente local; loopback e origem local obrigatória no POST.
- **FR-007:** botão desabilitado enquanto atualiza, mensagem curta, recuperação e três telas existentes sem regressão em 1440/390. Fonte direta tem rótulo legível.
- **FR-008:** arquivo da Central continua importável e consultável sem configurar Google. Conta real é tarefa pendente do autor, não bloqueia testes/PR; demonstração real fora desta rodada.
- **FR-009:** TDD cinco camadas com fixtures/fakes e RSA gerada no teste; nenhuma dependência/package.json de aplicação; um PR para a 002 inteira, gate Linux verde e review publicado, sem merge autorizado.

## Success Criteria

- **SC-001:** fake estável produz duas batchGet e captura v1 validada, tipos numéricos/vínculos corretos e promoção confirmada.
- **SC-002:** quatro falhas preservam bytes/completedAt; resposta/UI/recibo sem dado sensível.
- **SC-003:** GET/CLI sem rede; JWT verificável por chave pública gerada, scope/aud/exp corretos, somente hosts/métodos permitidos e chamadas com timeout/sem redirects.
- **SC-004:** suíte/gate local verdes, screenshots sintéticos atualizando/sucesso/falha 1440/390; gate Linux verde e review do PR, sem demonstração real.

## Edge Cases e limites

Abas/cabeçalhos/intervalos ausentes, hashes/meta diferentes, escalar inválido, captura futura >10min ou não mais recente: recusar, manter vigente. Textos numéricos reais não são convertidos. Dupla leitura não é transação remota; alteração desfeita entre observações pode não ser detectada. API batchGet omite finais vazios legitimamente; range declarado deve cobrir a grade inteira.

Fora: Agentes/Controle/Execucoes (v2, visual ilustrativo), escala de 500 peças, links/junções, perfil nove, polling, escrita Google/Drive/fila/n8n/mídia e objetivo mensal (003). Nenhuma coleta real nesta rodada.
