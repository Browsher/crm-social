# Roteiro de verificação da feature 001

**Estado:** procedimento para executar após implementação. Em 02/10/2026 os arquivos de aplicativo e testes abaixo ainda não existem. A validação atual cobre apenas a estrutura e os documentos do Spec Kit.

## Ambiente

Abrir PowerShell em `CRM de referência local, caminho configurado fora do repositório`. Usar Node já disponível. Não instalar servidor externo ou novas credenciais. Dados de teste ficam em diretório temporário; não usar `producao/runtime/` nem adquirir trava da fila.

```powershell
$crmNode = (Get-Command node -CommandType Application | Select-Object -First 1).Source
& $crmNode tests/dados.test.cjs
& $crmNode tests/snapshot.test.cjs
& $crmNode tests/projecao.test.cjs
& $crmNode tests/servidor.test.cjs
& $crmNode tests/interface.cjs
```

Esperado após implementação: cinco comandos com saída zero, identificação de cenários executados e nenhuma consulta ou escrita remota. Antes de implementar cada comportamento, o teste pertinente deve falhar pelo motivo específico; registrar resultado real, não contagem antecipada.

## Primeira leitura real

1. Central relê metadados e as seis abas completas pelo conector Google autorizado, respeitando os limites por chamada do contrato.
2. Comparar as duas observações e metadados, salvar captura íntegra sob `data/entrada/` e importar pelo script local. Nome concreto do arquivo vem da coleta, não usar o exemplo como se existisse.
3. Iniciar pelo `Iniciar CRM.ps1` e acessar `http://127.0.0.1:4318`. Sem captura, esperar estado vazio explícito; nenhum calendário de demonstração.
4. Confirmar fonte/horário e comparar IDs/datas de todas as peças NTV da mesma captura com lista e calendário. Preservar registros históricos, inclusive imagem B. Data inválida permanece consultável fora do calendário.
5. Abrir uma arte, um carrossel e o Reels. Conferir texto, páginas/cenas, responsáveis e arquivos/versões. Roteiro disponível não aparece como vídeo final. Revisão resolvida não é exibida como nova solicitação.
6. Em teste isolado, tentar captura parcial: última válida e seu horário permanecem; erro novo fica visível. Nova captura válida com células iguais renova frescor.
7. Conferir teclado, Escape, foco, filtros e 390/1440; abrir links apenas por ação explícita. Bloquear e registrar requisições externas no teste de interface; esperar zero.
8. Fechar o servidor pelo procedimento documentado; não encerrar processos por nome global. Registrar evidência e limitações em `validacao.md`, criado na entrega.

Não alterar permissões do Drive, controles, agendamentos, n8n, prompts editoriais ou dados na planilha durante esses passos.

## Verificação documental disponível agora

```powershell
& './.specify/scripts/powershell/check-prerequisites.ps1' -Json -RequireSpec -RequireTasks -IncludeTasks
```

Esse comando confirma os documentos encontrados e a feature ativa. Não comprova testes da aplicação, integração ou backend pronto.
