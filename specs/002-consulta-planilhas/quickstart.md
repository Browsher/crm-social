# Quickstart — 002

Constituição1.1.0 aplicada; implementação/aceite em [validação](validacao.md). T021 demonstrada, 24/24 tarefas; resultados sanitizados na validação. Sem npm install/ci de aplicação ou package.json; ferramentas continuam isoladas em tools/.

Selecionar Node24.19.0 conforme [001](../001-consulta-local-producao/quickstart.md): node --test; node tools/quality-gate.mjs; node src/servidor.cjs. Playwright existente por CRM_PLAYWRIGHT_MODULE. Testes geram RSA temporária e usam transporte/fonte falsos, nunca Google real. Clique mostra atualizando/sucesso/falha com preservação da captura anterior; screenshots sintéticos1440/390.

Importação manual: node scripts/importar-captura.cjs seguido de caminho privado do arquivo escolhido pelo autor; --data-dir opcional TEMP. GET/arquivo não dependem de chave. Não corrigir captura recusada à mão.

Se a leitura direta informar **Captura desatualizada; a vigente foi preservada**, a candidata não é posterior à captura local vigente; isso pode ocorrer enquanto uma captura da Central adiantada dentro da tolerância de 10 minutos ainda supera o relógio local. **Horário da captura mais de 10 minutos no futuro** indica que a candidata excedeu essa tolerância. Ambas preservam captura/data e registram falha de categoria `dados`, sem atribuir o problema a uma mudança da planilha. Confira o relógio local e o fim exibido da captura; não edite seus bytes nem force a promoção.

## Preparação pelo autor e repetição da demonstração

1. Criar conta de serviço dedicada e habilitar Sheets API no próprio projeto Google Cloud.
2. Gerar chave JSON em pasta privada fora do projeto; não colar/enviar/versionar chave/email.
3. Compartilhar planilha como Leitor, sem torná-la pública.
4. Definir CRM_GOOGLE_CREDENTIALS_FILE e CRM_SPREADSHEET_ID no ambiente do processo local, nunca no browser ou Git.
5. T021 foi autorizada e demonstrada. Para repetir, iniciar pelo Iniciar CRM.ps1 com Node existente e as variáveis herdadas privadamente; acionar Atualizar dados ou POST local. Conferir captura aceita, hashes iguais, contagens, selo, tipos e preservação do Histórico. Nunca imprimir o envelope nem produzir screenshots reais no repositório. Não mudar planilha para testar erro.

Testes automatizados usam somente dados sintéticos; demonstração real tem registro sanitizado separado na validação. Agentes/Controle/Execucoes serão tratados na v2 (visual ilustrativo). Falhas por configuração/acesso/rede/dados com mensagens curtas; todas preservam captura/data. Emenda já aprovada não bloqueia implementação.
