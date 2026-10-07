# Modelo de dados — 004
Pautas tem 12 mínimos: pauta_id, marca_id, mes, semana, inicio_semana, tema, mensagem, modelo_carrossel, oferta, origem, status, observacao. ID opaco textual não vazio; marca do CRM; mês AAAA-MM; semana inteira 1–4; início civil corresponde à enésima segunda-feira do mês. Campos preenchidos de texto exigem string.
Unicidade: pauta_id e (marca_id, inicio_semana). Todas as linhas conflituosas geram aviso e não confirmam vínculo/navegação. Campos desconhecidos não são estados editoriais novos; modelo/origem/status desconhecidos ficam legíveis com aviso. Textos usam triagem existente.
Semanas.pauta_id é opcional por cabeçalho e vazio não exige pauta. Vínculo confirmado exige pauta unívoca de mesma marca e início. Nenhuma transição é comandada pelo CRM.
Meses permanece intacta. Pautas é independente e opcional. Captura ausente, tabela ausente e tabela vazia são estados distintos. Ver [contrato](contracts/pautas.md).

Vocabulários reconhecidos na consulta: modelo_carrossel = cabo/faixa/formas/virada; origem = estrategista/autor; status = planejada/em_producao/concluida. Desconhecidos preenchidos continuam visíveis com aviso e não impedem navegação por si sós quando identidade/calendário são válidos.
