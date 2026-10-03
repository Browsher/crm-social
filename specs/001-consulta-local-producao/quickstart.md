# Roteiro de verificação da feature 001

**Estado em 03/10/2026:** procedimento planejado para executar após implementação. Aplicativo, importador, iniciador e suítes funcionais abaixo ainda não foram criados. Esta entrega atualiza documentação, sem capturas reais ou execução do CRM. Branch vigente: `001-consulta-local-producao`, criada da `main`.

Consultar [spec](spec.md), [plano](plan.md), [tarefas](tasks.md) e [contrato](contracts/captura-e-consulta.md). O mockup de [telas](../../docs/design/mockups/telas-v2.html) serve como referência visual; não valida backend ou persistência.

## Ambiente da implementação futura

Abrir PowerShell na raiz de `crm-social/`. Usar Node 24.19.0 e o Playwright existentes. Antes de código, atender ao pré-requisito `.claude/rules/project-structure.md` conforme AGENTS. Ferramentas do gate permanecem isoladas em `tools/`, sem dependências novas de aplicação ou alteração na configuração vigente.

Todos os testes usam `node:test` e `node:assert/strict`, arquivos/diretórios temporários reais e porta efêmera em `127.0.0.1`. Não usar `data/` operacional, `producao/runtime/`, trava da fila ou autenticação remota para testes. A interface é testada com Playwright no computador, dentro de `tests/interface.test.cjs`, descoberto pelo runner padrão.

```powershell
$crmNode = $env:CRM_NODE_PATH
if (-not $crmNode) {
  $crmNode = (Get-Command node -CommandType Application | Select-Object -First 1).Source
}
$crmNodeVersion = & $crmNode --version
if ($LASTEXITCODE -ne 0 -or $crmNodeVersion -ne 'v24.19.0') {
  throw 'Selecione o Node 24.19.0 existente em CRM_NODE_PATH e repita; nao instale outra copia.'
}
if ($env:CI -eq 'true') {
  throw 'Aceite local exige CI diferente de true, para executar a interface.'
}
$crmNodeVersion
$crmTestFiles = @(
  'tests/dados.test.cjs'
  'tests/snapshot.test.cjs'
  'tests/importador.test.cjs'
  'tests/quadro-config.test.cjs'
  'tests/projecao.test.cjs'
  'tests/servidor.test.cjs'
  'tests/interface.test.cjs'
  'tests/iniciador.test.cjs'
)
& $crmNode --test @crmTestFiles
& $crmNode --test
```

Esperado após implementação: versão 24.19.0, oito suítes descobertas e todas as cinco camadas verdes — validação pura, I/O temporário real, serviços/projeções, HTTP real em porta efêmera e interface local. O `node --test` deve incluir a suíte de interface; não usar `tests/interface.cjs` nem execução direta como substituto do runner exigido pelo gate.

Na conferência de 03/10, o PATH encontrava Node 24.14.0, mas o runtime 24.19.0 já
existia na máquina. Defina `CRM_NODE_PATH` com o caminho desse executável somente no
ambiente local, sem versionar caminho pessoal. CLI e gate usam o mesmo executável;
o iniciador o recebe por `-NodePath`.

O CI vigente usa Linux sem Playwright local: dados, snapshot, importador, configuração do quadro, projeção e
HTTP rodam obrigatoriamente. Interface registra SKIP explícito com `CI=true` antes
de carregar Playwright; iniciador registra SKIP fora de `win32` antes de chamar
PowerShell. Esses pulos de aplicabilidade são visíveis no TAP, sem substituir o
aceite Windows. No computador, Playwright/Windows PowerShell ausentes são falhas;
as oito suítes precisam executar sem casos pulados. Não alterar workflows/configuração
ou instalar dependências para contornar essa fronteira. SKIP de ferramenta do gate
continua regido pelo `--strict`, independentemente dos pulos de testes por plataforma.

Durante implementação, executar o arquivo pertinente **antes** do código e registrar RED pelo comportamento ausente; depois registrar GREEN. Suítes ignoradas no aceite local, zero testes ou gate anterior à criação do aplicativo não comprovam aceite. Resultados e contagens vêm da execução real, sem número antecipado.

## Cenários sintéticos obrigatórios

| Caso | Ação | Resultado a conferir |
| --- | --- | --- |
| Captura/identidade | Reordenar cabeçalhos; tentar mínimo/aba/ID ausente ou repetido, cobertura parcial, hash/metadata divergente | Reordenação válida; inconsistência rejeitada sem substituir a última válida; etapa desconhecida continua válida |
| Persistência/CLI | Importar arquivo em diretório temporário, repetir ID/bytes e tentar mesmo ID/outros bytes; caminho ausente/URL | Sucesso resumido, no-op sem duplicar captura/recibo e conflito; erro diferente de zero, sem dump de células ou rede |
| Falha/interrupção | Falhar coleta/importação, interromper antes da confirmação e repetir bytes preparados ainda não aceitos | Última captura/horário preservados, arquivos órfãos fora do Histórico; nova tentativa pode promover sem no-op falso. Erro de persistência é explícito, sem prometer recibo gravado quando o armazenamento não permite |
| Planejamento | Navegar mês/semana, filtros Todos/Imagem/Carrossel/Reels, calendário/lista e dia múltiplo | IDs/datas concordam, slots definem formatos e tipo original permanece separado; imagem B visível, semana vazia sem peça inventada; primeiro cartão + “+N no dia”, ordem ordinal por ID |
| Objetivo/menu | Abrir as três telas | Apenas Planejamento/Produção/Planilha; “Ainda não definido” no objetivo, sem Plano do mês/Conteúdos/Equipe/Workflow |
| Sem data | Data ausente/inválida, inclusive peça no quadro, sem semana inequívoca e após trocar filtro/mês | Contagem global “N sem data” e lista; clique na peça abre Sem data da sua semana; órfã fica em Semana não identificada; ninguém some do total |
| Selo hoje | Fixar relógio na data local de `captura.completedAt` | “Atualizado hoje, HH:MM”, verde, horário de São Paulo; data das linhas não decide selo |
| Selo antigo | Fixar relógio em outro dia civil em São Paulo | “Dados de DD/MM”, âmbar, sem alterar a captura |
| Selo falha | Captura válida e tentativa posterior falha; reler e reimportar mesmos ID/bytes | “Atualização falhou”, vermelho, última válida preservada; GET/no-op não limpam falha nem renovam hora |
| Selo vazio | Sem captura, inclusive primeira tentativa falha | “Sem dados”, cinza; falha aparece no Histórico; nova captura completa aceita encerra falha |
| Gaveta | Clique em cartão/dia/lista/quadro, inclusive segunda peça e filtro ativo | Dia inteiro, título/quantidade, primeiro acordeão aberto; todas as peças do dia, não só a clicada |
| Relações/revisões | Reels sem vídeo, páginas/cenas com versões e ordem, revisão antiga/resolvida, órfão/empate | Arquivo como registro, mídia ausente e avisos; responsável principal/correção separados; não inferir próxima ação ou design novo |
| Configuração | Carregar JSON válido em TEMP; coluna inexistente, rótulo repetido, JSON/arquivo inválido; acrescentar rótulo sintético só no JSON | Erro claro ao carregar impede iniciar; mapa novo entra sem mudar código. O arquivo versionado inicial conserva nove etapas e duas listas vazias |
| Quadro/prioridade | Combinar publicação, rótulos sintéticos de liberação/revisão e etapa, retirando prioridades superiores | Publicação > liberação > revisão > etapa; sem prioridade superior, arte_aprovada em Visual e oito etapas em Mídia, inclusive montagem_pronta; status visível não decide coluna |
| Outras | Rótulo desconhecido repetido, segundo rótulo, vazio, outras semanas/marcas e cartão vencido por prioridade superior | N conta distintos só dos cartões Outras da semana NTV; vazio conta uma vez, repetidos não somam e excluídos não entram. Título Outras · N valores novos, original visível, singular para um e zero sem cartões |
| Publicação | publicado_em preenchido/vazio/null/espaços; status publicado sem campo; data preenchida inválida/sem fuso/futura | Preenchido dá Publicada com precedência; inconsistência gera aviso sem mudar coluna. Status/aprovação/arquivo sem o campo não comprovam; não há verificação remota |
| Planilha | Alternar seis abas e Histórico por teclado | 66 mínimos com valores e contagens de linhas NTV apresentadas, mínimos 8/17/8/11/12/10, inclusive IDs/id_drive/sha256/origens_json como dados; todas as tentativas confirmadas no estado, recentes primeiro, e falha sem apagar sucesso; órfãos não aparecem como conclusões |
| HTTP/segurança | Três estáticos sintéticos em TEMP via webDir confiável; métodos/HEAD, Host/Origin externos, traversal/privados, extras sentinela, célula mínima com conteúdo sensível indevido e texto malicioso | Rotas/status/bytes do contrato antes da criação da interface, allowlist fixa mesmo com webDir; zero escrita HTTP, sem captura bruta/envelope/extras arbitrários/credenciais/caminhos; sensível suprimido com aviso sem retirar coluna; texto não executa |
| Interface/links | Navegar por teclado/Escape; links Drive/Docs e links não permitidos | Escape fecha e devolve foco; somente HTTPS/hosts autorizados por clique, sem carga automática ou requisição externa durante teste |
| Mobile | 390 px e 1440 px nas três telas/gaveta/tabelas | 390: lista semanal, menu recolhido, gaveta cheia; sem corte da página; rolagem horizontal própria de cada tabela |
| Iniciador | Script real com diretório/porta isolados, porta ocupada e runtime ausente | Processo oculto, bind loopback, orientação em erro sem encerrar ocupante; cleanup só do PID criado |
| Escala | Fixture sintética de 500 peças | Contagens/filtros/navegação coerentes; registrar tempo observado, sem confundir teste com produção |

Os arquivos de cada cenário e pares RED/GREEN estão em [tasks.md](tasks.md), com mapeamento de FR-001–016 e SC-001–009. SC-007 confere o mapa literal do quadro; SC-008, todas as seis tabelas/66 mínimos e tentativas; SC-009, teclado e 390/1440 nos cinco fluxos. Testes da interface bloqueiam e registram requisições externas; resultado esperado: zero. Dados mínimos registrados permitidos aparecem somente na consulta local; artefatos compartilháveis usam dados sintéticos.

## Primeira leitura real e demonstração futura

Executar somente após implementação e revisão, conforme T039. O dicionário não substitui a captura. Nenhum desses passos foi executado nesta atualização documental.

1. Central relê metadados e as seis abas completas pelo conector autenticado, por cabeçalho real e dentro dos limites de chamada do contrato. Duas observações canônicas e metadados estáveis precisam concordar; coleta parcial/conflitante não é promovida.
2. Salvar a captura íntegra em `data/entrada/`, privado/ignorado. Atribuir a `$crmCapturePath` o caminho local real da coleta; não copiar fixtures nem um nome fictício para esse lugar. Importar pelo comando futuro:

   ```powershell
   & $crmNode scripts/importar-captura.cjs $crmCapturePath
   ```

3. Iniciar pelo comando futuro e abrir `http://127.0.0.1:4318`. Se a porta estiver ocupada, verificar a instância; não encerrar processo alheio.

   ```powershell
   & './Iniciar CRM.ps1' -NodePath $crmNode
   ```

4. Confirmar somente os três itens de menu; Planejamento com objetivo ainda não definido, calendário/lista/filtros e “N sem data”. Comparar os IDs de todas as peças NTV com a **mesma captura**, inclusive imagem B e registros concluídos/bloqueados. Não usar filtros da fila n8n para essa comparação.
5. Clicar um dia com várias peças: conferir todas no acordeão e a primeira aberta, etapa/responsável registrados, revisão por versão e correção separada, páginas/cenas ordenadas e arquivos como registros. Roteiro não aparece como vídeo disponível. “Design novo” sem evidência é “A confirmar”. Escape fecha e devolve foco.
6. Conferir Produção por semana: mapa carregado do JSON, prioridade publicação > liberação > revisão > etapa, arte_aprovada em Visual e oito etapas de mídia preservadas quando não há prioridade superior. Status é informativo; Outras preserva original e conta distintos da semana, não cartões. Publicada vem de publicado_em preenchido, com aviso em dado inconsistente. Clique abre dia inteiro ou Sem data; sem arrastar/editar/encaminhamento inferido.
7. Clicar o selo para Planilha. Comparar contagens/valores mínimos nas seis tabelas e Histórico com a captura/recibos privados; conferir período/horário e rolagem própria. “Atualizar dados” relê a última captura salva, sem buscar Google, importar pelo navegador ou criar nova coleta.
8. Conferir teclado e 390/1440. Não compartilhar screenshot de dados operacionais privados; usar fixture sintética para evidência visual compartilhável. Falhas/importações destrutivas de teste permanecem no diretório temporário, não em `data/` real.
9. Encerrar apenas a instância/PID criada pelo procedimento documentado. Registrar evidência e limitações em `validacao.md`; zero escrita remota, geração ou publicação.

Não alterar permissões do Drive, controles, agendamentos, n8n, prompts editoriais ou células da planilha durante esses passos. Busca direta é a futura 002 — Planilhas, com contrato próprio; não executá-la para demonstrar 001.

## Verificação documental disponível agora

```powershell
& './.specify/scripts/powershell/check-prerequisites.ps1' -Json -RequireSpec -RequireTasks -IncludeTasks
```

Esse comando confirma documentos encontrados e feature ativa. Não cria o aplicativo nem comprova testes funcionais, integração, coleta ou backend. Esta revisão mantém todas as tarefas desmarcadas.

## Quality gate e sincronização final da implementação

Revisão independente/correções e demonstração precedem estas duas últimas tarefas. Todas as cinco camadas precisam estar verdes.

```powershell
& $crmNode tools/quality-gate.mjs
```

T040: quality gate é penúltima etapa, com a configuração vigente e runner `node --test`; registrar resultado real e impedir conclusão se falhar. T041: última etapa segue `.claude/agents/doc-sync-onboarding.md`, sincronizando README/roadmap/status/documentação afetada e `validacao.md`. Se a revisão documental exigir código, voltar ao ciclo teste/revisão/gate antes de fechar.

Não tratar comandos planejados como executados nem aprovação do mockup como cinco camadas verdes. Aceite da 001 exige evidência do aplicativo funcional; o planejamento atual não antecipa esse resultado.
