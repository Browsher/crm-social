# Planilhas — Implementation Plan

**Branch:** `002-consulta-planilhas`, criada pelo hook `before_specify` da main atualizada, base `64c14d424c77181bd72be328d792b5ca3fd04c9d`.
**Date:** 2026-10-05. **Estado:** somente especificado/planejado; nenhum código, teste, coleta ou instalação executado nesta rodada.

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` ou `superpowers:executing-plans` na execução. Este é o plano canônico Spec Kit; não criar cópia concorrente em docs/superpowers/plans.

**Goal:** ler a planilha sob demanda pelo servidor, mantendo integridade, tipos, privacidade e o caminho da Central.
**Architecture:** cliente Google mínimo/injetável → coletor de grade tipada → mesma validação/persistência → mesma projeção segura. POST local dispara a tentativa; GET continua lendo exclusivamente disco. Uma trava cobre o await da coleta e a promoção. Auxiliares não entram na whitelist pública.
**Tech Stack:** Node 24.19.0, CommonJS, módulos nativos, interface existente, `google-auth-library` 11.1.0 para JWT de conta de serviço. Playwright existente. Nenhuma dependência instalada nesta preparação.
**Spec:** [spec.md](spec.md), [modelo](data-model.md), [contratos](contracts/leitura-planilha.md), [pesquisa](research.md), [quickstart](quickstart.md), [emenda proposta](constitution-proposal.md).

## Global Constraints

- Não implementar antes do aceite/aplicação da emenda. Aprovação não foi inferida deste planejamento.
- TDD observado, nas cinco camadas: validação pura, I/O TEMP real, serviços/projeção, HTTP real efêmero e interface Playwright local. RED precisa falhar pelo comportamento ausente; depois GREEN/refactor. Registrar comando/resultado por tarefa em validacao.md.
- Fixtures sintéticas, sem Google real em testes. Dados reais só em data/, chave fora do repositório; nenhuma chave/email/ID real em Git/PR/log/screenshot.
- Só `spreadsheets.readonly`; somente GET de Sheets e POST de autenticação OAuth. Nenhuma escrita Sheets/Drive, alteração de fila, agenda, n8n, mídia ou objetivo mensal.
- Um responsável por arquivo. Não delegar simultaneamente snapshot, captura, servidor ou app.js a agentes diferentes; preservar trabalho alheio.
- Contrato v1 mantido com perfil explícito, sem reescrever bytes/hashes legados. Não usar nove abas como whitelist pública.
- Uma única trava .importacao.lock; sem adquirir novamente dentro da operação protegida. Não remover trava alheia nem usar TTL automático.
- Captura rejeitada nunca vira candidata aceita; tentativa pode produzir recibo privado confirmado. Falha de confirmação precisa ser reportada como não registrada.
- Cada história tem um PR. Gate verde Linux e review do head antes de merge; limites da UI fora do LCOV e SKIP no Linux continuam explícitos, com aceite completo local.
- Gate/config/tools não serão afrouxados. Mudanças de instalação da aplicação no CI são achado obrigatório do reviewer, com motivo/efeito.
- .ps1 permanece ASCII; specify real não participa de testes. Esta preparação só usa scripts locais oficiais do Spec Kit.

## Summary

US1 entrega atualização estável/tipada e UI; US2 acrescenta a matriz completa de falhas, timeouts e concorrência; US3 prova compatibilidade por arquivo, privacidade das auxiliares e funcionamento sem Google. O MVP inclui US1 e US2: sucesso sem tratamento comprovado de falha não é entrega pronta. Credenciais reais são preparadas pelo autor somente para a demonstração final.

## Technical Context

| Aspecto | Decisão |
| --- | --- |
| Runtime/plataforma | Node 24.19.0 do gate; Windows local, Linux no CI; processo em 127.0.0.1 |
| Autenticação | JWT explícito da biblioteca oficial 11.1.0; sem ADC, gcloud, metadata server ou impersonação |
| Configuração | CRM_GOOGLE_CREDENTIALS_FILE e CRM_SPREADSHEET_ID, lidos só pelo servidor; nunca retornados |
| Transporte | Adaptador com transporte/relógio injetáveis; hosts fixos Sheets e OAuth; redirect desabilitado; abort total 90 s |
| Coleta | spreadsheets.get, máscara explícita de effectiveValue/effectiveFormat e offsets; blocos até 50.000 células, grade inteira |
| Tipos | Números/bools efetivos nativos; strings intactas; datas declaradas convertidas de serial por fuso/tipo; erros de célula recusados |
| Integridade | Duas matrizes completas, SHA-256 canônico de ambas, metadados antes/depois; propriedades fuso/locale também estáveis |
| Estado | Mesmo snapshot/recibos/atual.json; coleta protegida durante await; GET pode ler vigente |
| HTTP | POST /api/atualizar com corpo vazio JSON e origem local estrita; GET /api/visao sem Google |
| Interface | Botão comum atualiza via POST e relê GET; mantém dados anteriores até resultado; fonte direta legível |
| Dependência | Futuro package.json/package-lock.json na raiz, com versão exata; npm ci antes de testes/servidor; tools continuam isolados |
| Limites | Tentativa 90 s, cada requisição 15 s, no máximo uma repetição por GET 429/5xx dentro do prazo; erro nunca implica captura parcial |
| Escala | 500 peças sintéticas, nove abas e fragmentação; sem afirmar SLA da rede Google a partir de teste falso |

## Constitution Check

Antes/depois do desenho: I local/simples (uma biblioteca para autenticação, necessidade na pesquisa); II captura íntegra/autoridade; III só leitura, sem coordenação; IV TDD/evidência; V spec única e PR por história. Não há alteração vigente nem implementação nesta rodada.

**Gate de governança pendente:** emenda VI proposta, não aplicada. T001 bloqueia qualquer implementação até o ok. Não é exceção silenciosa à constituição. Emenda aprovada deve ser revisada antes de continuar; conta real não bloqueia testes falsos.

## Project Structure

Documentação em specs/002-consulta-planilhas: spec.md, constitution-proposal.md, plan.md, research.md, data-model.md, contracts/leitura-planilha.md, quickstart.md, tasks.md e checklists/requirements.md. validacao.md será criado na execução, com evidências reais e dados públicos mínimos.

Arquivos futuros novos:

```text
src/google-config.cjs       configuração privada e validação de caminho/chave
src/google-client.cjs       JWT, transporte mínimo e cliente Google injetável
src/google-cells.cjs        intervalos, grade e conversão tipada determinística
src/coleta.cjs              sequência das duas leituras e igualdade
src/atualizacao.cjs         serviço da tentativa, prazo e categorias seguras
tests/google-config.test.cjs
tests/google-client.test.cjs
tests/google-cells.test.cjs
tests/coleta.test.cjs
tests/atualizacao.test.cjs
tests/fixtures-planilhas.cjs
package.json / package-lock.json   dependência oficial fixada na execução
```

Alterações futuras existentes: src/captura.cjs (perfil), src/snapshot.cjs (trava await e promoção compartilhada), src/projecao.cjs (fonte segura), src/servidor.cjs, src/web/app.js/index.html/styles.css (POST e estados), scripts/importar-captura.cjs (mesmo caminho), testes correspondentes, Iniciar CRM.ps1 (pré-requisito de dependência, sem valores sensíveis), .github/workflows/quality-gate.yml (npm ci da aplicação), README/AGENTS/ROADMAP/docs. Nenhum desses foi alterado nesta preparação, exceto links de estado documental.

## Interfaces e sequência

- Preservar validarCaptura(raw), promoverCaptura(raw,dataDir), lerEstado(dataDir), projetarVisao(estadoLocal,nowIso,mapaQuadro) e comando importar-captura.cjs.
- Novo carregarGoogleConfig(env,repoRoot): retorna configuração privada validada ou categoria CONFIGURACAO; sem logar env/key.
- Novo criarClienteGoogle(config,{transport,clock}): getMetadata({signal}) e readGridRange({sheetId,title,range,signal}); fake implementa a mesma interface.
- Novo coletarCaptura({client,capturaId,now,signal}): retorna envelope v1 sheets9 verificado, nunca grava arquivo.
- Novo executarColeta(dataDir,operation): rotina snapshot async que mantém a mesma trava; operation devolve envelope ou categoria segura. Promoção/recibo usam helpers internos já protegidos, nunca promoverCaptura aninhado.
- Novo atualizarDados({dataDir,clientFactory,now,deadline}): coordena tentativa; retorno/status definidos no contrato. Instancia cliente só quando POST autorizado.
- Injetar atualizar e now em criarServidor, preservando opções existentes. Falso usado em HTTP/UI; nenhum endpoint aceita chave, ID ou URL enviados pelo browser.

Fluxo: guarda HTTP → prazo/trava → validar configuração → metadados antes → duas leituras/hashes → metadados depois → validar perfil/identidades/frescor → preparar captura/recibo → confirmar atual.json → resposta segura → GET da visão. Erro antes da promoção registra apenas motivo fixo; lock/estado ilegível/I/O sem confirmação não fingem recibo confirmado.

## Review Focus — cinco riscos

1. Segredo/identidade/configuração atravessar API, logs, erro, symlink ou transporte.
2. Grade parcial, fuso/tipo errado ou hash feito sobre projeção em vez da matriz capturada.
3. Trava liberada antes do await, promoção aninhada ou falha de I/O alterando vigente.
4. Falha/no-op refrescar data ou ocultar falha ativa; origem/fonte falsa e recuperação UI.
5. Perfil nove quebrar legado ou auxiliares/prompt/flags escaparem da whitelist para API.

## Complexity Tracking

Sem quebra constitucional autorizada. A biblioteca oficial evita implementar JWT/OAuth à mão; cliente fake, coletor puro e helpers pequenos preservam complexidade <21. Não criar banco, framework, SDK googleapis completo nem writer paralelo.
