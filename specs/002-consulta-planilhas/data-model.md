# Modelo — 002 reduzida

Mesmo [v1 da 001](../001-consulta-local-producao/data-model.md), seis tabelas/66 cabeçalhos, tipos/IDs/versões existentes. Source acrescenta google-sheets-api; nenhum perfil/aba extra. Configuração privada contém caminho externo e identidade da fonte, nunca na projeção. JWT/token somente memória.

Tentativa completa/falhou confirma via atual.json; captura vigente preservada em falha. API entrega categoria/mensagem fixa, registrada boolean e avisos[] de limpeza seguros; não entrega exception Google nem dados privados. Ver [contrato](contracts/leitura-planilha.md).

Números/booleanos da batchGet mantêm tipo; strings numéricas continuam inválidas quando versão exige número. Datas seriais declaradas convertidas antes dos hashes; não altera capturas antigas. Agentes/Controle/Execucoes pertencem à v2 (visual ilustrativo), fora da coleta/projeção da 002.
