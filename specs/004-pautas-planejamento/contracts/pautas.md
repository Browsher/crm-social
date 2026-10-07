# Contrato de consulta — Pautas
Extensão aditiva de schemaVersion 1, sem reserializar capturas antigas.

## Captura
Seis abas continuam obrigatórias. Meses/Pautas são opcionais independentes; quando presentes exigem tabela completa, metadados antes/depois coerentes, dois hashes iguais incluindo conteúdo ordenado por nome. Pautas exige 12 cabeçalhos do modelo. Semanas.pauta_id permanece fora dos mínimos obrigatórios. Coleta normaliza somente semana textual inteira canônica segura e data serial declarada; IDs/mes não são convertidos. Arquivo importado mantém tipagem original; inconsistências semânticas viram aviso.

`mes` deve chegar como texto `AAAA-MM`; `pauta_id`, como texto opaco. Na fonte, essas colunas devem ser mantidas como texto simples, inclusive `Semanas.pauta_id`. Número ou data serial em `mes` não é convertido silenciosamente: gera aviso e impede usar aquela pauta no calendário. O CRM não altera a formatação da fonte.

## Projeção
`pautas` é propriedade opcional da raiz, presente quando capturada, com linhas NTV triadas de identidade/calendário unívocos. `planilha` inclui Pautas com todos os 12 mínimos e linhas triadas, inclusive inválidas. Campos extras/outras marcas não saem. Avisos contêm aba, linha física, campo e motivo fixo.
Com coluna capturada, cada semana inclui `pauta_id` e `pautaOrigem` (cópia da pauta confirmada ou null); sem coluna, ambas propriedades ausentes. Vínculo confirma só ID exato + mesma marca/início. Ausente/duplicado/incoerente avisa sem inferência.

## Interface
Card preserva objetivo Meses. Havendo pautas válidas do mês, mostra linhas semana/tema/modelo/status e selo só origem=autor. Sem pautas desse mês, fallback da 003 completo. Ativação leva a inicio_semana, com foco e destino mesmo sem peças. Na Lista, o grupo criado para pauta sem semana capturada é identificado como pauta, sem criar vínculo ou registro semanal. No Calendário, o destino é a célula da segunda-feira, com foco e rótulo acessível da data da semana; a estratégia permanece no card mensal. Semana calendário/lista e gaveta mostram `Pauta S2 de novembro` quando há vínculo confirmado; gaveta reúne origens únicas das semanas das peças do dia ou, no dia vazio, das semanas capturadas que abrangem a data e já têm origem confirmada. Status legível não significa publicação. Sem HTML executável ou edição.

## Segurança e compatibilidade
Unicidade e índice são avaliados no conjunto NTV, depois da seleção da marca. Uma pauta apenas de outra marca não resolve vínculo NTV; registros de outra marca não criam avisos ou conteúdo na consulta. IDs são comparados exatamente, sem normalização ou preenchimento.

GET local nunca consulta Google. POST protegido conserva fluxo existente. Identidades/vínculos inseguros recusam antes de no-op/promoção; leitura de captura antiga corrompida também recusa. Falha preserva vigente/data e não é encerrada por GET/no-op. Sem operações remotas, notas ou novos endpoints.
