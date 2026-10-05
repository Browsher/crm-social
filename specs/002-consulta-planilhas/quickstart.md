# Quickstart — validação futura da 002

**Planejado, não executado.** Aplicação atual é a 001. Não rodar coleta real nem instalar dependência por consequência deste guia antes da aprovação e da implementação. Contrato: [leitura-planilha](contracts/leitura-planilha.md).

## Gates separados

1. Autor aprova [emenda](constitution-proposal.md); T001 aplica o texto/versionamento e registra aceite. Sem isso, não implementar.
2. Desenvolvimento testa com cliente falso/fixtures sintéticas em TEMP, sem chave ou Google.
3. Autor prepara conta e compartilhamento na T048, antes da demonstração real. Essa tarefa não bloqueia as anteriores.

## Preparação do autor — conta somente leitora

1. No projeto Google Cloud do autor, habilitar Google Sheets API e criar conta de serviço dedicada à consulta. Não conceder Editor/Owner de projeto para ler planilha.
2. Criar chave JSON e guardá-la numa pasta privada externa ao checkout. Não enviá-la ao assistente, navegador, chat ou Git.
3. Na planilha, Compartilhar com a conta de serviço como **Leitor**. Não alterar abas/cabeçalhos/permissão pública. O e-mail real permanece apenas na configuração privada do autor.
4. No ambiente do processo local, definir CRM_GOOGLE_CREDENTIALS_FILE (caminho privado absoluto) e CRM_SPREADSHEET_ID (identidade privada). Não criar exemplo com valores reais nem arquivo versionado de configuração.
5. Iniciar o servidor e clicar Atualizar dados somente na demonstração autorizada. Aguardar; confirmar captura/contagens/selo. Falha de autenticação exige conferir configuração/compartilhamento, nunca ampliar scope ou escrever Google.

Fontes: [criar conta de serviço](https://docs.cloud.google.com/iam/docs/service-accounts-create), [criar chave](https://docs.cloud.google.com/iam/docs/keys-create-delete), [compartilhamento](https://support.google.com/drive/answer/2494822), [escopos Sheets](https://developers.google.com/workspace/sheets/api/scopes).

## Comandos após implementação

Selecionar o mesmo Node do quality-gate (24.19.0), conforme [guia atual](../001-consulta-local-producao/quickstart.md). Na raiz do repositório:

```powershell
node --version
npm ci
npm ci --prefix tools
node --test
node tools/quality-gate.mjs
node src/servidor.cjs
```

As primeiras duas preparações npm só serão válidas após T003/T004 criarem lock/CI da aplicação. Playwright existente usa CRM_PLAYWRIGHT_MODULE; aceite local exige interface sem SKIP. Não instalar outra cópia por hábito. Semgrep local Windows pode ter SKIP declarado; CI strict precisa PASS real.

## Cenários sintéticos

- US1: fake com nove abas e 111 mínimos, fragmentos/offsets/vazios, números e datas. Um POST local e GET seguinte mostram captura nova e fonte correta. Verificar mesma captura privada com hashes iguais e ausência de abas auxiliares na API.
- US2: acesso negado, 429/5xx, timeout, hash/meta diferente, ausência/parcial, captura desatualizada/futura e falha de I/O. Preservar hashes/ponteiro/data; confirmar recibo/selo ou distinguir falha não registrada. Concorrência com importador usa TEMP real; relógio falso testa prazo, sem aguardar 90 s.
- US3: envelopes seis/nove por arquivo, sem configuração Google; verificar hashes legados, no-op, imports rejeitados e nenhuma rede no GET/CLI. Strings numéricas inválidas continuam avisadas.
- Interface: 1440 e 390, pendente/sucesso/falha/configuração ausente/primeira falha/recuperação; teclado e navegação existentes sem pageerror. Screenshots somente sintéticos em docs/design/screenshots, com legenda de fixture.
- Escala: 500 peças sintéticas e nove abas; validar contagens/identidade/inteireza, sem concluir performance da rede a partir de fake.

## Importação da Central preservada

Mesmo comando existente, com arquivo privado escolhido pelo autor em data/entrada; não colocar caminho/ID real neste documento:

```powershell
node scripts/importar-captura.cjs $env:CRM_CAPTURE_FILE
```

Argumento inicial é o caminho local; --data-dir é opcional para testes em TEMP. Ambos os perfis usam o mesmo importador, não writer novo. Não alterar captura recusada à mão ou relaxar validação.

## Demonstração real e evidência pública mínima

Depois da T048 e autorização de coleta, comparar captura aceita e CRM: seis contagens editoriais, existência/validação das três auxiliares sem conteúdo, datas, versões/vínculos, selo/fonte, falha preservando vigente e importação manual. Não editar a planilha para provocar erro; simular falhas exclusivamente com fake.

Registrar em validacao.md somente capturaId, instantes, contagens, hashes e passou/falhou/limites. Nunca título, ID da planilha/produção/Drive, e-mail, chave, prompt, flag, URL, caminho pessoal ou valor de célula. Screenshots reais ficam privados e não são citados por caminho.

Gate é penúltima tarefa; doc-sync/onboarding é a última. Review/execuções de cada história ficam somente em validacao.md, com frases curtas e links nos demais documentos. Esta rodada termina em commit/push dos documentos, sem PR.
