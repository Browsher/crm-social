# Pesquisa — decisões reduzidas da 002

Autor decidiu em 2026-10-05: JWT RS256 nativo, sem biblioteca/package.json; seis abas via batchGet×2, sem perfil nove/escala500/junções. Substitui desenho anterior; nenhum pacote instalado.

Context7 consultado para Node24 crypto/fetch e Sheets batchGet. Escolha: RS256 com node:crypto; fetch redirect:error/signal; endpoint OAuth e host Sheets fixos. Token apenas memória, scope readonly; RSA gerada em runtime de teste. Não usar SDK ou ADC.

batchGet com UNFORMATTED_VALUE/SERIAL_NUMBER retorna valores tipados e omite finais vazios; range informa retângulo inteiro. Metadados antes/depois dão grade/fuso. Dois lotes das mesmas seis ranges e hashes do envelope convertido, não da projeção. Dates declaradas convertem números, strings ficam intactas. Limite: não há transação entre observações.

Fontes oficiais: [OAuth JWT](https://developers.google.com/identity/protocols/oauth2/service-account#httprest), [batchGet](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet), [crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html), [fetch/AbortSignal](https://nodejs.org/docs/latest-v24.x/api/globals.html), [seriais](https://developers.google.com/workspace/sheets/api/guides/formats).

Uma trava await/promoção mantém importador síncrono e helpers internos, sem adquirir duas vezes. Quatro categorias fixas; exceções remotas não chegam a UI/recibo/log. Aviso de cleanup é texto fixo em avisos[]/mensagem, resolvendo analyze U1.
