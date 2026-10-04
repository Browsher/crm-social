# Estado privado e persistência

Como um álbum que só troca a capa depois de guardar as novas páginas, este módulo prepara arquivos e confirma o estado por um único ponteiro. Uma captura rejeitada não substitui a última válida.

Persistência e validação dos recibos confirmados implementadas e verificadas localmente; evidências na [validação](../../specs/001-consulta-local-producao/validacao.md). Fonte: [src/snapshot.cjs](../../src/snapshot.cjs); funções `ponteiro`, `instanteRecibo`, `lerRecibo`, `lerEstado`, `confirmar`, `exclusiva`, `registrarFalhaEntrada`, `promoverComTrava` e `promoverCaptura`.

## Interfaces

| Export | Responsabilidade |
| --- | --- |
| `lerEstado(dataDir)` | Valida ponteiro, cada recibo confirmado e captura; não escreve, repara ou reaplica a política temporal relativa |
| `promoverCaptura(raw, dataDir)` | Adquire exclusividade, confere estrutura e identidades NTV antes do no-op, depois identidade da captura/tempo; prepara arquivos e promove ou confirma falha |
| `registrarFalhaEntrada(dataDir, codigo)` | Confirma falha de arquivo/JSON que não chegou à validação, preservando captura |

Não há rota, variável de ambiente ou rede. Imports nativos: fs, path e randomUUID; imports locais: [validação](captura.md) e `validarIdentidadesNtv` de [triagem](triagem.md). Não importa configuração ou projeção do quadro. `dataDir` é argumento do chamador confiável, não dado de uma requisição.

## Arquivos e autoridade

| Caminho relativo ao diretório privado | Papel |
| --- | --- |
| `.importacao.lock` | Exclusividade de escrita por diretório; contém PID e instante do processo proprietário |
| `capturas/<capturaId>.json` | Serialização do envelope validado; criada exclusivamente, sem sobrescrita |
| `tentativas/<tentativaId>.json` | Recibo imutável preparado |
| `atual.json` | Única autoridade: `{capturaId, ultimaTentativaId, historicoIds}` |
| `atual-<uuid>.tmp` | Novo ponteiro preparado no mesmo diretório antes do rename |
| `ultima-tentativa.json` | Resumo derivado; falha deste cache não desfaz confirmação |

Recibo privado: `{tentativaId, capturaId, concluidaEm, resultado, motivoResumo}`. Resultado é `completa` ou `falhou`; ID de captura pode ser null. Apenas IDs em `historicoIds` são tentativas confirmadas; `ultimaTentativaId` deve corresponder ao último ID, ou null com lista vazia. Diretório sem ponteiro retorna ausência estruturada.

`lerRecibo` exige um objeto, recusando null e array. Confere tentativaId igual ao ID referenciado, capturaId seguro ou null, concluidaEm como ISO de data real com `Z`/offset explícito, resultado `completa`/`falhou` e motivoResumo string. Recibo `completa` exige capturaId não nulo. Essa validação ocorre em toda leitura dos IDs confirmados, sem tratar texto válido de JSON como recibo válido.

Se um recibo confirmado for inválido ou ilegível, `lerEstado` recusa o estado. O [servidor](servidor.md) devolve 503 genérico; não reescreve recibos, ponteiro ou captura para reparar o incidente. Recibos órfãos continuam fora da leitura confirmada e do Histórico.

## Fluxo de escrita e leitura

```mermaid
flowchart TD
  Entrada[Promover captura ou registrar falha de entrada] --> Trava["Abrir .importacao.lock com wx"]
  Trava --> Estado[Ler estado confirmado]
  Estado --> Validar{Estrutura válida?}
  Validar -->|sim| Identidades{Identidades e vínculos NTV passam na triagem?}
  Identidades -->|não| Falha
  Identidades -->|sim| Conflito{Mesmo ID com outros bytes?}
  Conflito -->|sim| Falha
  Conflito -->|não| Repetida{ID e serialização já aceitos?}
  Repetida -->|sim| NoOp[sem_alteracao sem novo recibo]
  Repetida -->|não| Tempo{Futuro até 10 min e fim posterior ao vigente?}
  Tempo -->|não| Falha
  Tempo -->|sim| Arquivo[Preparar captura imutável]
  Arquivo --> Recibo[Preparar recibo imutável]
  Validar -->|não ou falha de entrada| Falha[Preparar recibo falhou preservando captura]
  Falha --> Temporario[Preparar ponteiro temporário com fsync]
  Recibo --> Temporario
  Temporario --> Rename[rename no mesmo diretório confirma atual.json]
  Temporario -->|gravação falhou| Limpeza[Remover somente temporário preparado se possível]
  Rename -->|rename falhou| Limpeza
  Limpeza --> Original[Conservar erro original e estado anterior]
  Rename --> Cache[Atualizar resumo derivado]
  Cache --> Liberar[Fechar e liberar somente trava adquirida]
  NoOp --> Liberar
  Rename --> Leitor[lerEstado consulta apenas IDs confirmados]
```

`promoverComTrava` primeiro obtém `candidata=validarCaptura(raw)` e chama `validarIdentidadesNtv(candidata)`. Se um campo interno NTV terminado em `_id` seria redigido, a candidata é recusada antes de no-op, gravação de seus bytes ou mudança da captura vigente. A falha confirmável conserva a anterior e registra localização estática de aba/linha física/campo, sem incluir a célula. A mesma seleção/triagem usada na consulta valida esse recorte; campos sensíveis comuns continuam privados na captura e triados na projeção, conforme o contrato.

As gravações duráveis usam abertura `wx`, write, fsync e close. Arquivo imutável existente só é reaproveitado se o conteúdo for igual. A substituição de `atual.json` confirma captura, última tentativa e Histórico juntos. Falha na gravação/rename do ponteiro tenta remover somente o `atual-<uuid>.tmp` preparado, sem trocar o erro original por uma falha de limpeza. Essa remoção é tentativa, não garantia de recuperação após interrupção do processo.

O `finally` tenta fechar o descritor e remover sua própria trava separadamente: falha no close não impede a tentativa de unlink. O resultado da operação ou seu erro original é preservado; falha de liberação acrescenta `avisos` transitórios ao objeto devolvido/erro, sem mudar o recibo persistido. O [CLI](importador.md) escreve esses avisos em stderr e mantém o exit correspondente ao resultado original. Uma segunda instância, inclusive tentando registrar entrada inválida, falha com **importação em andamento**, antes de ler/mutar o estado. O teste usa dois processos reais e uma barreira antes da confirmação.

Se o processo for interrompido, a trava pode permanecer. **Não há expiração ou remoção automática**: conferir proprietário/PID, processo vivo e estado confirmado antes de qualquer recuperação manual. Nunca remover uma trava apenas porque outra importação falhou. Arquivos preparados sem confirmação não comprovam sucesso e não entram no Histórico.

## Idempotência e falhas

| Situação | Resultado real |
| --- | --- |
| ID e serialização já aceitos em recibo confirmado, após estrutura/identidades NTV válidas | `sem_alteracao`; não cria recibo, volta a captura antiga ou encerra falha posterior |
| Identidade/vínculo NTV alterável pela redação | Recibo falhou localizado, sem valor sensível; candidata não é gravada e captura anterior permanece vigente |
| Mesmo ID, serialização diferente | Recibo falhou por conflito; captura existente não é sobrescrita |
| Candidata mais de 10 minutos à frente do relógio local | Recibo falhou por captura inválida; vigente preservada, sem gravar a candidata |
| ID novo com fim igual ou anterior ao da vigente | Recibo falhou por captura desatualizada; vigente preservada, sem gravar a candidata |
| Mesmos bytes preparados, sem aceitação confirmada | Revalida e tenta nova promoção; não aplica no-op falso |
| Captura inválida ou gravação/promoção recuperável falhou | Tenta confirmar falha mantendo `capturaId` anterior |
| Arquivo ausente/ilegível ou JSON quebrado | Mensagens fixas de entrada; capturaId do recibo null |
| Persistência impossibilita confirmar a falha | Erro explícito **falha não pôde ser registrada**; sem garantia de Histórico durável |
| GET/reinício/releitura | Lê o mesmo estado e valida estrutura; não reaplica tolerância futura/ordem de importação, renova horário ou apaga falha |
| Falha ao fechar/remover trava | Resultado/erro original preservado com aviso transitório para conferir estado local; unlink é tentado mesmo se close falhar |

A comparação de identidade é entre bytes de `JSON.stringify(raw)`, não entre espaços/indentação do arquivo de entrada. Ordem de propriedades faz parte dessa serialização. Captura aceita previamente não é reativada por reimportar seu ID.

O no-op previamente aceito precede o relógio, mantendo idempotência mesmo se o relógio recuar ou existir uma captura vigente mais recente. Para uma candidata ainda não aceita, `validarTempoImportacao` recebe o relógio local atual e `before.captura.envelope.completedAt` enquanto a trava permanece adquirida. Até 10 minutos no futuro é aceito, inclusive o limite; com vigente, o fim também precisa ser estritamente posterior. Rejeições temporais confirmam uma tentativa `falhou` com motivo fixo e mantêm os arquivos/ID da vigente; a regra precede a gravação da candidata.

## Verificação e pegadinhas

[tests/snapshot.test.cjs](../../tests/snapshot.test.cjs) prova ausência, imutabilidade, no-op, conflito, falha, órfãos e promoção após interrupção da confirmação. As regressões cobrem close/unlink separados, preservação do resultado/erro e remoção do temporário após falha de rename. [tests/importador.test.cjs](../../tests/importador.test.cjs) cobre os recibos de falha de leitura e duas instâncias reais concorrentes. Tudo fica em TEMP; evidência em [validacao.md](../../specs/001-consulta-local-producao/validacao.md).

Regressões de estrutura/tipos e calendário/fuso de recibos confirmados, além do HTTP 503 sem escrita, estão em `tests/snapshot.test.cjs` e `tests/servidor.test.cjs`; execução e limites somente na validação.

Regressões em snapshot, importador e servidor conferem rejeição de identidades/vínculos antes da promoção, recibo localizado sem célula, manutenção da captura anterior consultável e defesa da consulta contra bytes antigos/corrompidos. Resultados somente na validação.

O nome “Histórico” aqui significa recibos persistidos/projetados; a US5 já os apresenta na aba final da Planilha, sem mudar esta persistência. A estrutura da captura é revalidada na leitura, sem a política temporal relativa exclusiva da importação. Falha de rename testada não comprova resistência a queda de energia. Capturas/recibos preparados sem confirmação permanecem preservados; temporários têm limpeza localizada por tentativa quando gravação/rename falham. Interrupção pode deixar arquivos/trava; não há varredura de limpeza automática nem restauração que fabrique aceitação.
