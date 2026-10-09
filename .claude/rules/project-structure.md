# Estrutura do CRM Social

Como um álbum de fotografias, o CRM consulta capturas da operação; não controla a fila.
Trabalho atual: 006 Layout v3; A integrada pelo PR #24 em `a5be355`; B implementada/testada localmente na branch codex/006-layout-v3-parte-b, PR/CI/review final pendentes, merge B proibido; [validação](../../specs/006-layout-v3/validacao.md).
T001–T041 concluídas (41/41), com demonstração privada; 003 concluída (15/15), T002/T015 conferidas com registro fictício, 004 implementada/testada localmente, [PR #20](https://github.com/Browsher/crm-social/pull/20) acompanha entrega e integração, com merge condicionado ao gate/review do head vigente, resultados por head na [validação da 004](../../specs/004-pautas-planejamento/validacao.md); 002 concluída com T021 demonstrada; histórico na [validação da 001](../../specs/001-consulta-local-producao/validacao.md) e aceite real na [validação da 002](../../specs/002-consulta-planilhas/validacao.md). A captura histórica conserva o limite; a tipagem da coleta direta foi resolvida na T021.

- AGENTS.md e .specify/memory/constitution.md governam o desenvolvimento.
- .specify/feature.json é ponteiro local; remoto usa branch/specs da feature ativa.
- specs/001-consulta-local-producao contém spec, plano, contrato, modelo e tarefas.
- docs/design/telas.md define telas; mockups/ e prototype/ são demonstrações históricas.
- docs/design/screenshots/ mostra aplicação real com fixture fictícia, nunca produção.
- docs/index.md é o índice; docs/architecture.md documenta o código e suas fronteiras.
- docs/modules/ detalha captura, coleta, google, midia, triagem, pautas, snapshot, importador, quadro-config, projeção, servidor, iniciador, layout-model, instagram, perfil-config e web.
- EntryPoint real: scripts/importar-captura.cjs <arquivo-local> [--data-dir <diretorio>].
- EntryPoint real: src/servidor.cjs [--data-dir <diretorio>] [--port <porta>].
- EntryPoint Windows: Iniciar CRM.ps1 [-DataDir <diretorio>] [-Port <porta>] [-NodePath <exe>].
- Iniciador resolve -NodePath/CRM_NODE_PATH/PATH, usa Node oculto, confirma stdout em dez segundos e retorna PID/URL/logDir/encerrar.
- Porta 0–65535, data/ e 4318 padrão; logs privados em DataDir/runtime; erro encerra só filho criado, nunca ocupante.
- src/captura.cjs valida seis abas/66 mínimos e Meses/Pautas opcionais; camposCapturados compartilha a allowlist com triagem/Planilha; snapshot confirma estado privado.
- validarTempoImportacao confere candidata sob trava: futuro até 10 min; fim posterior ao vigente.
- Falha temporal confirma recibo e mantém vigente; no-op de ID aceito precede essa regra.
- GET/releitura/reinício validam estrutura sem reaplicar a política temporal da promoção.
- lerRecibo valida objeto/tipos/IDs/data ISO real com fuso dos recibos confirmados; inválido recusa leitura sem escrever.
- src/snapshot.cjs usa .importacao.lock exclusiva; interrupção exige reconciliação manual.
- src/triagem.cjs seleciona NTV/66 mínimos e redige; snapshot valida identidades antes do no-op/gravação, sem mapa do quadro.
- src/projecao.cjs usa triagem e pautas.cjs para origem/detalhes/quadro/tabelas; sem versão positiva, mídia vigente a confirmar.
- config/quadro-etapas.json: nove etapas, liberacaoPronta=[liberado] e revisaoEmAndamento vazia; publicação preenchida tem precedência.
- src/servidor.cjs importa snapshot/projecao/quadro-config/google/coleta/midia e escuta somente em 127.0.0.1.
- Rotas: GET/HEAD estáticos/visão; POST atualizar protegido; GET /api/midia/ID-interno exclusivo, guardas antes do serviço.
- src/web/ entrega Planejamento com navegação/origem de Pautas, gaveta, Produção e seis abas/Meses/Pautas/Histórico em Planilha.
- Gaveta: primeira aberta; Pronta prioriza pacote ZIP único por pacote_versao/produção/tipo/extensão, legenda/hashtags e clipboard local por clique; Esc devolve foco.
- Resumo distingue revisão vigente/a confirmar/ausência; IDs técnicos da revisão só na API.
- Cena: três slots inicial/final/vídeo; aviso de mídia agregado, validações numéricas independentes.
- Documentos semanais uma vez no fim do dia; três papéis com — na ausência, inclusive órfãos.
- Avisos técnicos na API/Planilha; gaveta só quantidade/link aos avisos da peça, sem recortar tabelas NTV.
- Prévia: servidor resolve captura NTV, valida PNG/JPEG/WEBP/hash, cache privado em data/midias; galeria demanda/ampliação/fallback local.
- URL dedicada tem guarda de userinfo/malformada na API; célula recusada na UI vira link não permitido.
- Texto livre/recibo redige só pedaço HTTP(S) com userinfo; preserva frase/espaços; demais formas fora do escopo.
- JSON é dado: só strings alteradas são reserializadas, demais bytes intactos; original/validade privados.
- Avisos globais relacionados entram no contador da peça; ligado sem link seguro é link não permitido.
- Avisos conservam linha física por ID/WeakMap; valor sensível não acompanha motivo público.
- Triagem recusa candidata com _id alterável e preserva vigente; projeção mantém guarda para bytes antigos/corrompidos.
- tools/quality-gate.mjs é o entrypoint do gate; seus módulos são gate-*.mjs.
- tools/package.json e package-lock.json isolam ESLint, sem dependência da aplicação.
- .github/workflows contém CI; o bootstrap instalou os templates do node-kit.
- .claude/agents e .claude/skills orientam Claude; .agents/skills orienta Codex.
- data/ é privada/ignorada; não usar operação em testes/log/Git; mídia serve somente bytes validados por ID interno autorizado na captura.
- Código tem um responsável por arquivo e testes de comportamento antes da implementação.
- Suítes em tests/: node:test, assert/strict, diretórios TEMP e HTTP em porta efêmera.
- Executar com Node 24.19.0 existente por CRM_NODE_PATH e seu diretório à frente do PATH.
- Testes: node --test; gate: node tools/quality-gate.mjs; zero testes significa FAIL.
- Interface usa Playwright existente por CRM_PLAYWRIGHT_MODULE, sem pacote novo; M8: UI fora do LCOV e pulos UI/PowerShell no Linux; CLI coberta; aceite Windows local exige zero pulos.
- Pronta mantém pacote/cópia e páginas/cenas recolhidas; projetos usam cinco passos ou motivo travado; API preserva avisos.
- 006 B: menu Planejamento/Produção/Publicar; Planilha/avisos/Histórico técnicos ficam na API; Mês usa Oferta/Carrossel/Reels junto à cor.
- Prévia local compartilha dialog em Produção/Publicar/gaveta; slots ausentes contam; Atualizar único é movido para modal aberto e restaura ao fechar.
- T039 captura real, T040 gate e T041 onboarding concluídos; resultados/limites só na validação.
- Google/coleta: JWT/fetch nativos; Sheets readonly/POST sob lock; midia importa google/snapshot/triagem e lê Drive readonly sob demanda.
- Chave externa/env CRM_GOOGLE_CREDENTIALS_FILE e CRM_SPREADSHEET_ID; sem browser/log.
- 002 concluída com T021 demonstrada; [validação](../../specs/002-consulta-planilhas/validacao.md).
- Preservar tools/gate, agentes oficiais e operação n8n.
