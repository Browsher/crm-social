# Consulta local da produção — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use `superpowers:subagent-driven-development` na execução desta feature, ou `superpowers:executing-plans` se ela for executada sequencialmente. Este documento é o plano canônico; não criar uma segunda cópia em `docs/superpowers/plans/`.

**Goal:** permitir consultar conteúdos reais da NTV, suas datas, versões, pendências e arquivos, com origem e horário da leitura visíveis.

**Architecture:** a Central obtém uma captura pelo conector autenticado existente. Um importador local valida essa captura e conserva a última válida. Um servidor restrito ao próprio computador oferece uma projeção de consulta para a interface aprovada. O processo do CRM não herda as ferramentas autenticadas do Codex.

**Tech Stack:** Node.js 24.19.0 já disponível, JavaScript, HTML e CSS; módulos nativos de arquivos, HTTP, criptografia e assert. Playwright já disponível para verificação da interface. Sem nova dependência de aplicação.

**Data:** 02/10/2026. **Estado:** planejado; código e testes do CRM ainda não implementados.

**Branch:** nenhuma; sem repositório Git. O nome retornado pelo script de preparação do Spec Kit é a identificação da feature, não prova de criação de branch.

**Entradas:** [spec.md](spec.md), [constituição](../../.specify/memory/constitution.md), [desenho aprovado](../../docs/design/desenho.md).

## Summary

A primeira entrega reúne calendário, lista, filtro por formato, visão semanal e detalhe do conteúdo. Usa as seis abas necessárias: Semanas, Produções, Páginas, Cenas, Arquivos e Revisoes. Não importa seletores da fila que mostram apenas trabalhos elegíveis: peças concluídas e bloqueadas também precisam aparecer.

A consulta conferida em 02/10 encontrou quatro peças na semana 05/10, com datas previstas de 05 a 08/10. Isso é evidência pontual; a implementação deve reler a fonte. Nenhuma data ou quantidade fica fixa no código. A imagem B histórica permanece; a migração para três peças semanais pertence à feature 002.

## Technical Context

| Aspecto | Decisão |
| --- | --- |
| Plataforma | Windows, um operador, primeira marca NTV |
| Interface | Aproveitar desenho de `docs/design/prototype/index.html`, substituindo dados demonstrativos e removendo ações fora do escopo |
| Acesso | `127.0.0.1:4318`; porta ocupada gera orientação, sem encerrar outro processo |
| Armazenamento | Capturas locais imutáveis em `data/`, fora do conteúdo servido e da indexação |
| Atualização | Central faz nova coleta; botão do CRM apenas relê os dados locais e informa essa diferença |
| Datas | Datas editoriais civis preservadas; horários apresentados em America/Sao_Paulo |
| Testes | Execução direta de arquivos Node com `node:assert/strict`; Playwright do runtime existente |
| Escala de verificação | Fixture sintética de 500 peças para conferir filtros/navegação; sem promessa de desempenho ainda medido |
| Dependências | Não copiar autenticação, banco ou pipeline do CRM comercial nem de `ntv-video-motor` |

Ferramentas de desenvolvimento: ESLint 10.12.0 e seu lock ficam isolados em tools/, necessários para o quality gate; npm ci --prefix tools. Semgrep CE 1.179.0 é ferramenta externa do CI. O aplicativo continua sem dependências.

Runtime conferido: `CRM de referência local, caminho configurado fora do repositório`. Resolver o Playwright já instalado durante a implementação; não instalar dependência apenas para o teste. Os comandos de aplicação do quickstart são futuros até a entrega da feature.

## Constitution Check

Conferência documental antes e depois do desenho: sem exceções necessárias.

- I — Local e simples: um servidor pequeno e uma interface, sem hospedagem, banco ou login novo.
- II — Fonte e identidade: captura explícita, IDs preservados, falha não apaga a leitura anterior.
- III — Papéis: Central coleta; CRM consulta; nenhum perfil editorial ou agendamento instalado aqui.
- IV — Evidência: testes solicitados em FR-012, estados separados, nenhum registro equivale a mídia inspecionada.
- V — Incrementos: apenas feature 001 detalhada; Spec Kit organiza e Superpowers executa/revisa o mesmo plano.

## Project Structure

Documentação existente: `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/captura-e-consulta.md`, `quickstart.md`, `tasks.md` e `checklists/requirements.md` neste diretório.

Arquivos de implementação **a criar**, relativos a `crm-social/`:

```text
src/captura.cjs                  valida cabeçalhos, identidade e integridade da coleta
src/snapshot.cjs                 persiste captura e mantém a última válida
src/projecao.cjs                 relaciona os registros e monta a visão NTV
src/servidor.cjs                 servidor HTTP local com rotas permitidas
src/web/index.html               estrutura acessível
src/web/app.js                   navegação, filtros e detalhes
src/web/styles.css               desenho aprovado e adaptação de telas
scripts/importar-captura.cjs     importa arquivo local; não chama Google
tests/fixtures.cjs               dados sintéticos isolados
tests/dados.test.cjs
tests/snapshot.test.cjs
tests/projecao.test.cjs
tests/servidor.test.cjs
tests/interface.cjs
Iniciar CRM.ps1                  iniciador local com janela oculta
data/                           privado, ignorado; criado na implementação
```

Interfaces internas propostas:

- `validarCaptura(raw)` retorna captura normalizada; erro identifica aba/linha/campo sem despejar os dados.
- `promoverCaptura(raw, dataDir)` retorna `{resultado, capturaId}`; falha conserva a captura anterior. Reimportar o mesmo ID com mesmos bytes é `sem_alteracao`; o mesmo ID com conteúdo diferente é conflito. Uma coleta nova, mesmo com células iguais, atualiza a informação de frescor.
- `lerEstado(dataDir, nowIso)` retorna captura e última tentativa, inclusive ausência; não faz rede.
- `projetarVisao(captura, nowIso)` retorna calendário/lista/detalhes normalizados, com avisos localizados.
- `criarServidor({dataDir, port})` retorna um servidor Node ainda não iniciado; o ponto de entrada usa exclusivamente `127.0.0.1`.

## Ordem de implementação e delegação

As tarefas executáveis estão em [tasks.md](tasks.md). Primeiro validar a captura e preservar a última leitura; depois calendário/lista; depois informações de atualização e detalhes. O painel nunca utiliza exemplos como fallback de produção.

O coordenador mantém responsabilidade por arquivos compartilhados de interface e documentação. Após estabilizar o contrato da captura, delegações independentes podem cobrir persistência e projeção, com dono explícito por arquivo. Quem implementar não desfaz alterações de outros agentes. Uma revisão independente confere o contrato, seguida de teste integrado.

## Test-first e verificações

Escrever primeiro testes que falham por ausência do comportamento, executar e registrar essa falha; implementar o mínimo correto e executar novamente. Não testar frases desta documentação. Não adquirir a trava da fila nem usar seus diretórios para testes.

| Código | Cenário observável e saída esperada | Arquivo de teste |
| --- | --- | --- |
| D01–D03 | Colunas reordenadas funcionam; cabeçalho obrigatório faltante/duplicado e ID duplicado rejeitam a nova coleta; aba só com cabeçalho é vazia válida | `tests/dados.test.cjs` |
| D04–D05 | Hash recalculado difere, segunda leitura mudou ou aba parcial: captura rejeitada | `tests/dados.test.cjs` |
| S01–S03 | Ausência, falha parcial, repetição e novo horário: última válida preservada; repetição não duplica; coleta nova com células iguais renova horário | `tests/snapshot.test.cjs` |
| P01–P03 | Todas as quatro peças históricas, marca isolada, semana cruzando mês, formato desconhecido e data inválida continuam consultáveis | `tests/projecao.test.cjs` |
| P04–P06 | Ponteiro quebrado, versões empatadas, revisão histórica e vídeo ausente não geram aprovação, versão vigente ou mídia fictícia | `tests/projecao.test.cjs` |
| H01–H04 | API só de leitura; POST retorna 405; caminhos privados e traversal não entregam arquivo; Host/Origin externos rejeitados | `tests/servidor.test.cjs` |
| U01–U04 | Filtros/lista/calendário concordam, detalhe por teclado e Escape, 390/1440 sem corte, dados com marcação HTML não executam | `tests/interface.cjs` |

**Review focus:** conferir especialmente a integridade dos cabeçalhos (D01–D03), preservação da última captura (D04–D05/S01–S03), identidade e datas (P01–P03), estados e versões (P04–P06) e fronteira local/conteúdo não confiável (H02–H04/U04).

## Entrega e demonstração

Executar o [quickstart](quickstart.md), obter uma captura real completa pela Central e comparar os IDs listados com a mesma captura. Registrar data, resultado dos testes, limitações e imagem da interface, sem publicar dados privados. Demonstrar essa feature antes de iniciar 002. Atualizar status do README/roadmap somente com evidência de implementação e teste; um plano pronto não comprova software pronto.

## Complexity Tracking

Nenhuma violação da constituição identificada neste desenho. Autenticação própria, sincronização contínua, banco, escrita operacional e mídia incorporada ficam fora da feature.
