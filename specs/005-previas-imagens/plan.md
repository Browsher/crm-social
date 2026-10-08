# Implementation Plan: 005 — Prévias de imagens

**Branch**: `codex/005-previas-imagens` | **Date**: 2026-10-08 | **Spec**: [spec.md](spec.md)

**Input**: `specs/005-previas-imagens/spec.md`; tarefa 1 integrada pelo PR #22, base `b90980a15fad653937fd024ac3c9bb2738e9d99a`.

## Summary

A gaveta ganha uma folha de contato das imagens vinculadas à peça e um visualizador maior. O navegador pede somente um arquivo interno; o servidor consulta a captura vigente, reutiliza bytes locais válidos ou lê o Drive. Falha de prévia preserva texto, links e estado editorial.

Planejamento somente; nenhuma linha de produção/teste da 005 implementada. O speckit-tasks gerou 21 tarefas: 20 do agente e uma externa do autor. A execução está parada por exceder o limite de 20; [tasks.md](tasks.md#rastreabilidade-e-peso) apresenta a distribuição. Nenhum merge da 005 autorizado.

## Technical Context

**Language/Version**: Node.js 24.19.0; CommonJS no servidor, JS/CSS existentes no navegador.

**Primary Dependencies**: Somente APIs nativas: node:crypto, node:fs, node:path, node:http e fetch. JWT RS256 e cliente nativo da 002 reutilizados. Playwright existente apenas para testes locais, sem instalar dependências.

**Storage**: Captura existente em data/ permanece somente leitura; novo cache privado data/midias/ ignorado por Git. Diretórios TEMP exclusivos nos testes.

**Testing**: node:test + node:assert/strict; transporte falso com Response/ReadableStream e imagens sintéticas geradas em teste; HTTP real em loopback/porta efêmera; Playwright local. Preservar suites de Google/coleta/servidor/Pronta/versões/tema.

**Target Platform**: Windows pessoal; CI Linux conserva limites UI/PowerShell existentes.

**Project Type**: Leitor local de captura com leitura remota de imagens sob demanda.

**Performance Goals**: Nenhum download antes de abrir a peça; cache hit válido sem OAuth/download; limite efetivo 15.000.000 bytes; timeout 15.000 ms para aquisição de token e 15.000 ms para download completo (inclui streaming). Sem retry automático ou espera indefinida.

**Constraints**: Origem local, host Google fixo, nenhuma credencial/ID remoto em URL de mídia/erro/log. PNG/JPEG/WEBP por assinatura, sha256 opcional, sem SVG/vídeo/extração ZIP/transcodificação. Link externo já permitido continua uma ação explícita do autor.

**Scale/Scope**: Um autor, uma marca, imagens da peça aberta; não criar biblioteca, editor, fila ou cache em memória ilimitado. Cache em disco não tem política automática de expiração/limpeza nesta feature; pode ser removido localmente pelo autor, sem alterar captura.

## Constitution Check

*GATE antes da pesquisa e novamente após os contratos.*

| Princípio | Decisão e prova planejada |
| --- | --- |
| I — local/simples | Reutilizar Node e cliente nativo; um módulo novo de mídia, nenhum framework ou servidor remoto |
| II — fontes/identidades | Resolver pela captura validada e recorte NTV; cache nunca concede acesso a arquivo removido; preserva ponteiros/versões da T1 |
| III — responsabilidades | Nenhuma escrita remota, geração, publicação, fila ou agente; estados visuais não viram estado editorial |
| IV — evidência/TDD | RED antes de cada implementação, cinco camadas, imagens sintéticas; preview não comprova aprovação nem ZIP |
| V — escopo/revisão | Única spec005, tarefas rastreáveis, limite20; review independente e CI final; PR sem merge |
| VI — leitura mínima | Emenda1.2.0 aprovada2026-10-08: escopo Drive readonly separado de Sheets, credencial externa, tokenRAM, Google só no servidor |

Emenda aplicada no branch da 005; features001–004 e capturas não são migradas. Pré/pós-desenho: PASS, sem exceção constitucional. Compartilhamento pelo autor pendente e não bloqueante para os testes falsos.

## Project Structure

### Documentation (this feature)

```text
specs/005-previas-imagens/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── contracts/midia.md
├── quickstart.md
└── tasks.md
```

### Source Code (repository root)

```text
src/google.cjs                 # autenticação nativa reutilizada + factory Drive
src/midia.cjs                  # novo: regra bytes/hash, resolução/cache/serviço
src/servidor.cjs               # rota binária e guardas
src/web/app.js                 # seleção, demanda, galeria e ampliação
src/web/styles.css             # faixa e visualizador com tokens existentes
tests/google-midia.test.cjs    # transporte/OAuth Drive e preservação Sheets
tests/midia.test.cjs           # regras, cache e serviço
tests/midia-http.test.cjs      # servidor real e fronteira de origem
tests/previas-fixtures.cjs     # fixtures/imagens sintéticas geradas
tests/previas-interface.test.cjs
tests/pronta-interface.test.cjs # seletores adaptados sem remover provas XSS
tests/tema.test.cjs            # CSP img-src self
docs/modules/midia.md          # documentação de código quando implementado
```

**Structure Decision**: Manter módulos atuais; midia.cjs reúne responsabilidade nova de bytes/cache. Não dividir em novos repositórios/camadas genéricas. Testes de cada módulo novo devem carregá-lo explicitamente para LCOV não omitir fonte nunca executada.

## Phase 0 — Research

Fontes: inspeção estreita de google.cjs/snapshot.cjs/triagem.cjs/servidor.cjs/app.js e testes; Context7 `/websites/developers_google_workspace_drive`, consultas de downloads e escopos; documentação oficial de downloads/escopos/OAuth em research.md. Questão opcional sobre galeria: hipótese mínima declarada na spec, sem resposta presumida. Demais escolhas técnicas abaixo são defaults explícitos, não perguntas de produto pendentes.

## Phase 1 — Design & Contracts

### Cliente nativo

Reutilizar internamente carga de chave RSA externa, assinatura JWT e validação de token da 002. Manter exports/comportamento de carregarConfig, assinarJwt(config,now) e criarClienteGoogle para Sheets; seus testes existentes são regressão obrigatória. Acrescentar criarClienteDrive({env,repoRoot,fetchImpl,now,timeoutMs}) com getMidia(idDrive) -> Promise<Buffer>. Config Drive não exige CRM_SPREADSHEET_ID, pois captura manual é suportada. Scope exclusivo drive.readonly por factory, sem delegação de domínio ou escrita; tokens em RAM separados por finalidade. Instanciar cliente somente no primeiro cache miss; cache hit/início/GET visao não devem carregar credenciais nem acessar OAuth.

OAuth continua em https://oauth2.googleapis.com/token. Download é GET https://www.googleapis.com/drive/v3/files/<id_drive codificado>?alt=media, único host e caminho construído pelo servidor a partir do registro. redirect:error; resposta3xx recusada. ID remoto preenchido com caracteres canônicos A–Z/a–z/0–9/_/-; nunca derivar da URL. Content-Length só antecipa recusa; contar bytes reais durante leitura do stream, cancelar ao exceder limite e abortar timeout durante corpo. Não confiar em Content-Type remoto, não ler/propagar corpo de erro Google, não registrar URL/token/config.

### Regras e serviço de mídia

Exports propostos em midia.cjs: validarImagem(bytes,sha256), resolverArquivo(estado,arquivoId), criarServicoMidia({dataDir,criarCliente}). Interface do serviço: obter(arquivoId) -> Promise<{bytes,contentType}>; falha constante com status público documentado. Nomes podem ser ajustados na implementação mantendo contrato e cobertura.

Resolver em cada pedido: lerEstado(dataDir), selecionarNtv(captura,[],WeakMap,WeakMap), localizar ID interno exato único em arquivos do recorte. Exigir versão inteira positiva segura e id_drive válido; nenhum fallback por URL/nome. O tipo declarado não autoriza bytes: a assinatura é obrigatória. Recusa de captura inválida/ausente antes de cache/rede. PNG pelos oito bytes de assinatura; JPEG FF D8 FF; WEBP RIFF + WEBP e tamanho mínimo para identificação. Assinatura não garante decodificação completa; onerror do navegador deve cobrir isso. Hash ausente admite tipo/tamanho; hash preenchido exige 64 hex e igualdade SHA-256 (case-insensitive para representação hex). Validar no download e cache hit.

Cache em data/midias/<sha256-da-tupla>.bin; tupla inclui arquivo_id, versão, id_drive e sha256 normalizado. Hash é nome do arquivo, nunca ID/path recebido. Derivar/validar caminho dentro da raiz fixa. Nunca abrir caminho vindo da captura. Ler no máximo limite+1; cache inválido é descartado/ignorado e pode ser baixado novamente; registro ou hash inválido não inicia rede. Promover somente bytes validados via temporário exclusivo+rename, limpando staging em erro. Cache indisponível pode servir bytes novos já validados sem persistência; nunca alterar captura/recibos. Coalescer pedidos concorrentes da mesma chave com Map de promises removidas ao finalizar, sem guardar Buffer global indefinidamente.

Antes de responder, reler/resolver captura e conferir fingerprint: mudança de captura que remove/alterou referência durante download recusa resposta anterior. Entrada antiga pode permanecer em disco, mas não é acessível sem resolução vigente. Sem sha256, mesma versão/id_drive não comprova imutabilidade remota; esse limite é documentado, sem agenda para revalidar Google.

### Rota e origem

GET /api/midia/<arquivo_id codificado> resolve somente um ID interno exato. Nenhuma query, segmento extra, URL, caminho ou parâmetro de ID Drive. Decodificar uma única vez, recusar encoding inválido e formas de caminho; mensagem não ecoa entrada. ID remoto que não é ID interno na captura resulta404 sem rede; não existe endpoint de proxy genérico.

Adaptador recebe/injeta serviço no criarServidor, mas defaults criam serviço lazy. Guardas Host/Origin existentes precedem serviço. Como imagens podem chegar sem Origin, rejeitar Sec-Fetch-Site cross-site/same-site; aceitar same-origin/none/ausente mantendo Host/Origin. Acrescentar Cross-Origin-Resource-Policy:same-origin e nenhum CORS. GET exclusivo; HEAD/outros405 Allow:GET sem consulta/download. CSP global muda somente img-src de none para self. Sucesso200 binário Content-Type image/png|image/jpeg|image/webp, nosniff, no-store e CORP. Status públicos/falhas fixas no contrato; usar catch de Promise sem rejection não tratada no callback HTTP.

### Galeria e visualizador

Usar unidades já resolvidas na projeção, somente vigentes, ordenadas por índice com desempate de ID: página imagem; cena início/final, sem vídeo. Sem unidades, peça tipoimagem usa arquivos de imagem da produção na sua versão; preservar empates, sem escolher arbitrariamente. Não filtrar imagens reaproveitadas por pacote_versao. Mesma imagem repetida conserva contexto de posição. Não criar novos campos de captura, nem interpretar origens_json como manifesto ZIP.

abrirDia monta todas as peças: reservar galeria sem src; inicializar após showModal somente na peça aberta e depois em toggle com gaveta+peça abertas. Pronta inclui galeria fora da dobra de páginas/cenas; demais peças recebem galeria junto do resumo. src somente /api/midia/ + encodeURIComponent(IDinterno). Links continuam usando a allowlist atual HTTPS Drive/Docs via linkArquivo; Baixar pacote conserva sua regra exclusiva drive.google.com. Cada miniatura usa botão nomeado por contexto, link adjacente, data-previa-arquivo próprio (não duplicar data-pagina/cena legado), alt contextual e estado carregando/erro. Erro genérico desabilita ampliação e não usa classe notice de avisos editoriais.

Segundo dialog nativo para imagem grande com botão Fechar, foco devolvido à miniatura, evento cancel/Escape somente no topo. CSS específico sobrescreve dimensão da gaveta; imagem cabe na viewport, faixa overflow-x:auto e filhos sem encolhimento. Cores somente tokens existentes; sem modal extra de confirmação ou mensagens de implementação.

### Testes, prova visual e documentação

RED específico por regra/módulo antes de implementar, não depender de erro de import. Testes sintéticos geram bytes/imagens (PNG por node:zlib/crypto; JPEG/WEBP a partir de amostra sintética conhecida ou geração pelo navegador no teste), sem gravar credencial PEM literal em fixture. Chaves RSA dos testes geradas em RAM/TEMP como G01–G06; mensagens de sentinela não podem aparecer em resposta pública. Transporte falso exercita OAuth e streaming, inclusive stream que excede limite sem Content-Length e stall depois dos headers.

Cache em TEMP real: hits, versão/origem/hash alterados, corrupção, gravação falha/parcial, concorrência, captura mudando durante download. HTTP real porta0/127.0.0.1: IDinterno, rejeições sem rede, status/headers, Host/Origin/Sec-Fetch-Site, sem CORS, método, CSP e não regressão da atualização/visao.

Playwright com servidor real e transporte falso, sem page.route contornando a rota de mídia na prova principal. Bloquear requisições externas, conferir ausência antes da abertura/peças fechadas, seleção/ordem, cache, Pronta, fallback/link, teclado/Escape/foco e rolagem390. Ajustes legados somente em seletores: pacote recusado testa Baixar pacote, XSS testa caption em vez de proibir qualquer img legítima. Exportar12PNG opt-in em docs/design/screenshots/ e inspecionar todos; estado e servidores continuam TEMP.

Depois do gate completo node tools/quality-gate.mjs, doc-sync-onboarding atualiza AGENTS/README/ROADMAP/índice/arquitetura/módulos/contrato e validação, separando planejado/testado/integrado. Revisão independente no head e CIquality-gate remoto verdes; PR único da005 sem merge. Compartilhamento real pelo autor permanece tarefa externa, sem log/ID/e-mail/screenshot real.

## Complexity Tracking

Nenhuma violação constitucional exige exceção. Funções pequenas por responsabilidade; não modificar gate/baseline para absorver regressão. Critérios >=21 em função nova/piorada e demais regras do quality-gate permanecem vigentes. Map Graphify ausente no checkout: atualizar mapa Mermaid real somente quando os imports forem implementados.
