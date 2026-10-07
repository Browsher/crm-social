# Pautas

Como um índice entre o plano do mês e a semana, `src/pautas.cjs` confere pautas capturadas e identifica a origem semanal sem comandar a operação. Contrato canônico na [004](../../specs/004-pautas-planejamento/contracts/pautas.md).

Implementado e testado localmente; [validação e limites](../../specs/004-pautas-planejamento/validacao.md). PR/gate estrito/review pendentes. Importa somente `CAMPOS_PAUTAS` de [captura](captura.md) e é chamado por [projeção](projecao.md), depois de `selecionarNtv` e antes de montar Planilha/Planejamento.

`projetarPautas(ntv, avisos, origens)` recebe somente registros já selecionados e triados. Confere identidade textual, mês, ordinal inteiro de 1 a 4 e segunda-feira correspondente dentro do mês. Ano zero, datas impossíveis, quinta semana e calendário incoerente não habilitam navegação. Confere duplicatas de ID e de marca/início em todo o conjunto NTV, inclusive linhas inválidas, para não escolher a primeira linha silenciosamente.

Campos textuais e vocabulários conhecidos recebem avisos semânticos sem eliminar identidade/calendário válidos. Valores desconhecidos continuam dados da fonte; status não muda a produção nem significa publicação. Avisos usam aba, linha física e campo, com motivos fixos sem reproduzir valores.

Se a semana tem `pauta_id`, o módulo resolve ID exato, mesma marca e mesmo início. Devolve cópia em `pautaOrigem` ou null; vazio não avisa, preenchido sem confirmação avisa. Sem cabeçalho capturado, ambas as propriedades ficam ausentes. Não deduz vínculo por data, tema, ordem ou proximidade. `pautas` público contém cópias das linhas unívocas e existe somente quando a aba foi capturada; Planilha conserva todas as linhas NTV triadas para conferência. A unicidade é avaliada depois de selecionar NTV: uma pauta só de outra marca não confirma origem e não cria conteúdo/aviso naquela outra marca.

Não há I/O, rede, dependência nova, escrita ou transição editorial neste módulo. A triagem de identidades permanece antes da promoção/no-op em snapshot. Testes diretos e via projeção/HTTP em `tests/pautas.test.cjs`; toda fixture é sintética.
