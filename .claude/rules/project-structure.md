# Estrutura do CRM Social

Como um álbum de fotografias, o CRM consulta capturas da operação; não controla a fila.
T001–T026/US1, US2 e US3 implementadas; estado, evidências e pendências na [validação](../../specs/001-consulta-local-producao/validacao.md).

- AGENTS.md e .specify/memory/constitution.md governam o desenvolvimento.
- .specify/feature.json é ponteiro local não versionado; remoto usa branch/specs da 001.
- specs/001-consulta-local-producao contém spec, plano, contrato, modelo e tarefas.
- docs/design/telas.md define telas; mockups/ e prototype/ são demonstrações históricas.
- docs/design/screenshots/ mostra aplicação real com fixture fictícia, nunca produção.
- docs/index.md é o índice; docs/architecture.md documenta o código e suas fronteiras.
- docs/modules/ detalha captura, snapshot, importador, quadro-config, projeção, servidor e web.
- EntryPoint real: scripts/importar-captura.cjs <arquivo-local> [--data-dir <diretorio>].
- EntryPoint real: src/servidor.cjs [--data-dir <diretorio>] [--port <porta>].
- src/captura.cjs valida seis abas/66 mínimos; src/snapshot.cjs confirma estado privado.
- validarTempoImportacao confere candidata sob trava: futuro até 10 min; fim posterior ao vigente.
- Falha temporal confirma recibo e mantém vigente; no-op de ID aceito precede essa regra.
- GET/releitura/reinício validam estrutura sem reaplicar a política temporal da promoção.
- src/snapshot.cjs usa .importacao.lock exclusiva; interrupção exige reconciliação manual.
- src/projecao.cjs seleciona NTV/datas/formatos, frescor e detalhes por versão/relação; quadro-config valida mapa.
- config/quadro-etapas.json é versionado; mapa não é dado de linha nem entregue por HTTP.
- src/servidor.cjs importa snapshot/projecao/quadro-config e escuta somente em 127.0.0.1.
- Rotas fixas: /, /app.js, /styles.css, /api/visao; GET/HEAD e Host/Origin locais.
- src/web/ entrega Planejamento, selo, releitura e gaveta em acordeões; quadro/tabelas futuros.
- Gaveta compacta: primeira aberta, dados preenchidos, versões/texto/Histórico recolhidos; Esc devolve foco.
- Documentos semanais uma vez no fim do dia; três papéis com — na ausência, inclusive órfãos.
- Avisos técnicos na API; gaveta só quantidade/link Planilha; tabelas detalhadas ainda futuras.
- Arquivos são registros; link por clique só HTTPS Drive/Docs sem credenciais; sem prévia remota.
- URL com usuário/senha ou malformada não vazia é suprimida (new URL); recusada não vira texto bruto.
- Avisos conservam linha física por ID/WeakMap; valor sensível não acompanha motivo público.
- tools/quality-gate.mjs é o entrypoint do gate; seus módulos são gate-*.mjs.
- tools/package.json e package-lock.json isolam ESLint, sem dependência da aplicação.
- .github/workflows contém CI; o bootstrap instalou os templates do node-kit.
- .claude/agents e .claude/skills orientam Claude; .agents/skills orienta Codex.
- data/ é privada e ignorada; não ler, usar em testes, servir ou versionar seus arquivos.
- Código tem um responsável por arquivo e testes de comportamento antes da implementação.
- Sete suítes em tests/: node:test, assert/strict, diretórios TEMP e HTTP em porta efêmera.
- Executar com Node 24.19.0 existente por CRM_NODE_PATH e seu diretório à frente do PATH.
- Testes: node --test; gate: node tools/quality-gate.mjs; zero testes significa FAIL.
- Interface usa Playwright já instalado por CRM_PLAYWRIGHT_MODULE, sem pacote novo.
- CI=true pula os testes de UI, fora do LCOV (M8); aceite local exige zero pulos.
- Quadro/tabelas/Histórico/iniciador/escala continuam tarefas futuras.
- Não alterar constituição, ferramentas/gate, agentes oficiais ou operação n8n.
