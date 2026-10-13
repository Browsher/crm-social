# Pacote ZIP por MIME — validação sanitizada

Esta manutenção permite consultar o pacote registrado com MIME, preservando a leitura da fonte. A seleção não confere bytes, acesso, conteúdo ou aprovação editorial. Sem rota, dependência, escrita remota, migração ou feature nova.

## Evidência da implementação inicial

Fonte `f55282e4012caa4d6a6af78f647a5e175fa38f4f`, base `039f0ebd3b828103d06f2c1ff47e9fc6d6214f93`, [PR #29](https://github.com/Browsher/crm-social/pull/29). Gate local Windows em Node 24.19.0: `node tools/quality-gate.mjs`, 775 PASS, cobertura 95,5340699815838%, complexidade PASS/18 avisos, exit 0, baseline preservada. Drop 0 em modo full não representa comparação histórica. Semgrep SKIP por ausência local, audit N/A por não haver dependências do app. Suíte `node --test tests/pronta.test.cjs`: 20 PASS, sem pulos.

O [CI estrito do head f55282e](https://github.com/Browsher/crm-social/actions/runs/38409364970) passou, conforme conferência do coordenador. Esse check pertence à fonte inicial, não a um head posterior. O gate local não substitui segurança/revisão do head final.

Antes do gate aprovado, houve falha de ambiente TEMP com separadores diferentes, corrigida somente na configuração. Houve também um timeout UI na suíte completa; caso isolado passou na árvore corrigida e na base exata. Após encerramento da renderização paralela, gate completo passou. Nenhum limite ou fonte de teste foi alterado para contornar falhas.

## Contrato estrito e fonte real

A [regra contratual](../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#identificação-do-pacote-por-mime--manutenção-local-de-13102026) foi escolhida explicitamente pelo autor: MIME literal `application/zip` e ausência do cabeçalho `extensao` foram conferidos na fonte real pelo coordenador. Outros tipos, variações de caixa/espaços e coluna de extensão presente vazia são recusados intencionalmente. Essa conferência não autoriza ampliar MIME, normalizar valores ou alterar a fonte.

Metadados de operação, captura privada, conteúdo, IDs de arquivos e screenshots reais permanecem fora do Git. A demonstração readonly do coordenador é registrada no ledger privado; este documento entrega somente evidência sanitizada de código e contrato.

## Revisão round 1

I1: evidências por fonte e link CI entregues acima. I2: README, ROADMAP, AGENTS, data-model da 001, módulos captura/triagem/web e apresentação da 006 alinham opcionais e apontam ao contrato existente. Alias imagem_oferta integrado pelo PR #28 na base 039f0eb; provas locais anteriores preservadas como históricas. M1/M2: estrita igualdade permanece por decisão autorizada e conferência da fonte. M3: Planilha verifica valor MIME e ausência da propriedade extensão em todas as linhas; captura sem ambos recusa pacote mesmo com pacote_versao válida; casos MIME independentes.

O código de produção permanece byte a byte igual ao head inicial. Os casos novos reforçam comportamento existente e passam de imediato; não há RED fabricado nem alteração de implementação para esses testes.

Validação desta rodada em Node 24.19.0/Windows: `node --test tests/pronta.test.cjs`, **23 PASS/0 FAIL/0 SKIP, exit 0**. O único `node tools/quality-gate.mjs` desta rodada terminou **exit 1**: 778 testes contabilizados, tests FAIL, coverage FAIL, complexity PASS/18 avisos, Semgrep SKIP ausente, audit N/A, baseline preservada. O gate agrega e descarta a saída TAP; não entrega neste relatório os nomes dos testes que falharam. A causa desta falha geral não foi determinada e não é atribuída à pressão de execução por inferência. Não houve alteração do código de produção nem repetição do gate nesta rodada. O sucesso anterior no head f55282e não torna este resultado verde. Sem integração automática; CI/revisão final e resolução do gate pertencem ao novo head.
