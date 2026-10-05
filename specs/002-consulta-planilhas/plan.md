# 002 Planilhas — Implementation Plan

**Date:** 2026-10-05. **Branch:** 002-consulta-planilhas. **Spec:** [spec.md](spec.md).
**Goal:** um botão lê seis abas e promove somente captura íntegra, mantendo caminho da Central.
**Architecture:** autenticação JWT nativa → metadados → batchGet×2 → hashes/validação → mesmo snapshot → GET/projeção. Cliente/transporte injetáveis.
**Tech Stack:** Node 24.19.0, node:crypto/fs/http, fetch nativo, CommonJS/HTML/CSS existentes. Zero dependência nova.

> Executar com speckit-implement e superpowers:executing-plans; testes antes de código, registro RED/GREEN em validacao.md. Plano canônico, sem duplicação.

## Global Constraints

- Constituição 1.1.0 aprovada/aplicada; nenhuma escrita remota ou coleta real nesta rodada.
- Privacidade: só fixtures; RSA gerada em runtime, nunca PEM/email/ID reais versionados. Conta do autor pendente não bloqueia.
- Um responsável por arquivo; cinco camadas; código novo precisa teste próprio. .ps1 ASCII.
- Não alterar configuração/tools/baseline do gate nem instalar pacote de aplicação.
- Uma trava até concluir await/promoção; recusa/erro preservam vigente/data. Limpeza avisa sem sobrescrever resultado.
- Um PR, sem merge; evidências de heads/review/checks só em validacao.md.

## Technical Context

| Aspecto | Decisão |
| --- | --- |
| Auth | RS256, PKCS1, scope readonly, aud/endpoint OAuth fixos, iat atual/exp+3600, sem subject |
| Chave | caminho absoluto por env externo lexicalmente à pasta do projeto, JSON service_account/RSA≥2048; sem realpath/junction |
| Transporte | fetch redirect:error, AbortSignal.timeout 15s por chamada, sem retry automático; JSON bruto nunca logado |
| Coleta | get metadata com IDs/dimensões/timeZone; dois batchGet com seis ranges alocados, ROWS/UNFORMATTED_VALUE/SERIAL_NUMBER |
| Tipos/datas | escalares preservados; números de inicio_semana/data_prevista viram dia civil; publicado_em serial vira ISO no fuso metadata via round-trip, inválido recusa |
| Persistência | atualizarCaptura async usa lock existente e promoverComTrava/recibo interno; CLI síncrono preservado |
| HTTP | POST /api/atualizar {} origem exata/host local, ≤1KiB; GET sem rede; erro/categorias/textos fixos |
| UI | POST depois GET confirmado, status role=status curto; botão desabilitado; dados anteriores preservados |

## Constitution Check

I simples/local sem pacote; II autoridade/captura; III nenhuma coordenação; IV TDD; V spec única; VI conta leitora/chave privada. Conferência antes/depois do desenho, sem exceção.

## Project Structure e interfaces

Novos: src/google.cjs (config/JWT/token/request/cliente), src/coleta.cjs (metadata/ranges/datas/dupla leitura), tests/google.test.cjs, tests/coleta.test.cjs, tests/atualizacao.test.cjs, tests/atualizacao-interface.test.cjs. Modificados: snapshot/captura/projecao/servidor, src/web/app.js/index.html, testes focalizados e docs. Sem package.json, workflow novo ou abas auxiliares.

- criarClienteGoogle({env,repoRoot,fetchImpl,now,timeoutMs}) → getMetadata(), batchGet(ranges). Token cache fechado em memória. Config/key lidos só ao criar cliente em POST, não ao iniciar servidor/GET.
- coletarCaptura(client,{now,capturaId}) → envelope v1 source google-sheets-api; hashCelulas reutilizado; não escreve.
- atualizarCaptura(dataDir,coletar) → Promise de resultado do snapshot, protegida pela mesma trava; falha classificada/fixa; cleanup avisos[] seguro.
- criarServidor ganha callback atualizar injetável; padrão compõe cliente/coletor/snapshot só após guarda POST.
- promoverCaptura, lerEstado, projetarVisao e CLI mantêm assinaturas antigas. Source passa a aceitar Central/direta, sempre seis abas.

## Review Focus

Segredo em saída/caminho/redirect; hashes e grade/tipos; trava await e atomicidade; preservação de data/erro; GET/CLI sem rede. Correções importantes com RED; melhorias não essenciais registradas como limites.

## Complexity Tracking

Helpers pequenos em dois módulos novos; complexidade<21. Sem SDK, retry/cenário de escala ou writer alternativo. Limite: verificação lexical de chave não detecta junction/symlink, deliberadamente excluído pelo autor.
