# Modelo de consulta

02/10/2026 — contrato proposto para implementação da feature 001. Não cria colunas remotas.

## Captura

Envelope versionado com planilha, marca, início/fim, duas observações completas das tabelas e metadados antes/depois. Preservar `values` brutos e localização da linha para auditoria; a linha física não é identidade. O importador normaliza colunas pelos nomes reais.

Uma aba obrigatória ausente ou incompleta invalida a nova captura. Aba com apenas cabeçalho válido significa conjunto vazio. Cabeçalhos não vazios duplicados são inválidos; colunas vazias no fim são permitidas. Valores de identidade são strings não vazias e únicas dentro da aba. A validação não converte ID interno em ID Drive.

## Entidades e vínculos

| Entidade | Chave | Dados apresentados / vínculo |
| --- | --- | --- |
| Semana | `semana_id` | marca, início, tema, objetivo e ponteiros internos para documentos semanais |
| Produção | `producao_id` | marca, semana, formato, data prevista, textos, etapa, revisão, liberação e responsável |
| Página | `pagina_id` | produção, versão, índice, função, título, corpo, arquivo de imagem |
| Cena | `cena_id` | produção, versão, índice, falas, texto em tela, início/duração, referências de mídia |
| Arquivo | `arquivo_id` | produção/semana/unidade, papel/tipo, versão, `id_drive`, URL, origens e hash registrados |
| Revisão | `revisao_id` | produção/arquivo/unidade/versão avaliada, decisão, motivo, responsável e tratamento |

Versões e índices são inteiros positivos quando preenchidos; valores inválidos geram aviso localizado. Duração e início, quando preenchidos, são números finitos não negativos. Vazio significa desconhecido, nunca zero inferido. Formato desconhecido continua na lista como “Outro”. Célula JSON inválida não é executada nem descartada silenciosamente: mostrar aviso e conservar registro original na captura privada.

## Regras de projeção

- A marca de entrada é NTV. Vincular unidades por produção e arquivos por produção ou semana pertencente à NTV. Órfãos geram aviso; registros de outra marca não entram na visão.
- Documentos semanais vigentes são os apontados em Semanas. Arquivos relacionados podem aparecer como histórico. Sem ponteiro inequívoco ou com empate/origens incompatíveis, não rotular um Editor/Motion como vigente automaticamente.
- Arquivo cadastrado significa **registro disponível**, não bytes abertos, mídia validada ou aprovação. Não buscar bytes Drive nem mostrar miniatura remota nesta feature.
- Revisões exibem a versão afetada. Revisão antiga aberta não é automaticamente uma nova reprovação da versão atual. Preservar tratamento e decisão, com origem explícita.
- `etapa_producao`, `estado_revisao`, `estado_liberacao` e disponibilidade de arquivo são facetas distintas. Publicação confirmada requer registro explícito; não deduzir da aprovação.
- Data editorial é `YYYY-MM-DD` válida no calendário civil. Não passar a data por conversão UTC que a mova para o dia anterior. Valores ausentes, seriais não documentados ou inválidos vão para “Sem data válida”, com localização e aviso.
- Horários ISO completos usam fuso na origem e exibição America/Sao_Paulo. Campos sem horário/fuso confiável são mostrados como registrados, com aviso; não inventar horário.

## Estado local

`sem_captura` → `captura_valida` após validação e promoção completa. Captura válida passa a ser “anterior a hoje” pela data civil de `completedAt` em São Paulo. Falha de atualização mantém a última válida e acrescenta a última tentativa; falha não renova `completedAt`.

Reimportar mesmo ID e mesmos bytes não duplica. Mesmo ID com bytes diferentes é conflito. Novo ID, horário novo e mesmas células atualizam o frescor, mantendo os mesmos IDs editoriais. Essas transições são apenas de armazenamento local: não alteram o estado da fila.
