# Implementation Plan: Prévias de vídeos
**Branch**: codex/007-previas-videos | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)
## Summary
Reusar captura/Arquivos, cache local, modal Instagram e controles nativos. Vídeo via rota local dedicada; capa pela rota de imagens. Leitura de vídeo é solicitada explicitamente pelo clique.
## Technical Context
JavaScript CommonJS e navegador; Node 24.19; node:http/fs/crypto existentes; DOM/CSS/HTMLVideoElement sem dependências. Cache privado em data/. Testes node:test e Playwright existente em TEMP. Windows loopback; um autor, vídeos MP4 até 64.000.000 bytes.
## Constitution Check
Princípios I–V preservados. Pedido explícito do autor amplia VI de imagens para capas e vídeos, mesmo escopo Drive readonly, limite privado e resolução por ID interno; emenda 1.3.0 aplicada na constituição. Sem escrita editorial pelo app, agendas ou geração. Reavaliação: fronteiras preservadas.
## Project Structure
Backend: src/midia.cjs, src/google.cjs, src/servidor.cjs e src/video-http.cjs dedicado à rota/Range.
Frontend: src/web/layout-model.js, app.js, instagram.js e styles.css.
Testes: tests/video-fixtures.cjs, video*.test.cjs e fixtures/video-sintetico.mp4.
Docs: esta pasta, constituição e documentação de módulos.
## Interfaces
GET/HEAD /api/video/:arquivo_id resolve arquivo tipo video da captura vigente; retorna MP4 validado e bytes totais ou faixa simples. 200/206/416; Content-Length, Content-Range e Accept-Ranges. Host/Origin/Fetch-Site como imagens; sem URL/path/ID remoto/query. Erros fixos sem detalhes privados. Imagens mantêm /api/midia e limite 15 MB.
criarServicoMidia().obterVideo(id) retorna {bytes,contentType:'video/mp4'}; valida assinatura MP4 e SHA opcional, cache e revogação após download. Drive getMidia ganha limite interno opcional até 64 MB com default 15 MB.
Layout.videoDaPeca(p) e capaVideo(p) escolhem registros inequívocos por produção, versão e final registrado. Capa papel capa_video, origens.video_arquivo_id exato; sem fallback para outro arquivo.
## Execution
TDD de backend e frontend em paralelo, interfaces acima congeladas; cada responsável possui arquivos distintos. Integrar, revisar independentemente, quality gate normal e estrito com limites registrados. Sincronizar docs por último. Instalar alteração testada na instância local, preservar backup e reiniciar apenas o processo do CRM identificado.
## Complexity Tracking
Sem nova infraestrutura ou framework. Uma rota de leitura e expansão limitada do modal existente.

## Estado local e limite operacional
Implementação, testes e instalação local com backup/demonstração concluídos em 2026-10-15, 12/12 tarefas; gate normal final aprovado, 823 testes sem pulos, sem integração Git. Semgrep indisponível impede afirmar aprovação estrita. [Validação](validacao.md) preserva as tentativas do gate e distingue o teste sintético da demonstração privada. A tentativa Drive real retornou 503; bytes locais autorizados foram validados e preparados no cache privado, sem código de fallback nem nova variável. Um cache miss permanece dependente de acesso Drive.
