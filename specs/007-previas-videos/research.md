# Decisões

Como usar os controles de um aparelho já conhecido, a solução estende o player nativo e o modal existente, mantendo bytes/credenciais no servidor.

- Player HTML nativo com controls/playsInline e play() no clique, tratando rejeição. MDN consultado via Context7 /mdn/content, HTMLMediaElement.play.
- requestFullscreen() por gesto explícito; falha exibida e Escape nativo preservado. MDN Element.requestFullscreen e Document.exitFullscreen.
- Range simples para busca: 206 com Content-Range, 416 com bytes */tamanho. MDN HTTP Range consultado.
- Servidor lê Drive e cache; rejeitado iframe remoto por quebrar origem privada e controles consistentes. Rejeitado caminho arbitrário vindo do cliente.
- Capas existentes vinculadas na planilha operacional por operação autorizada desta conversa; dados reais ficam fora de Git.

Fontes primárias consultadas via Context7 `/mdn/content`: [HTMLMediaElement.play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play), [Element.requestFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen), [Document.exitFullscreen](https://developer.mozilla.org/en-US/docs/Web/API/Document/exitFullscreen) e [HTTP Range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests). Rejeição de play/fullscreen é tratada; Range é simples e HEAD ignora a faixa.

Limite observado na conferência privada: Drive retornou 503 e o fluxo foi demonstrado com cache previamente validado de arquivos locais autorizados. Isso não altera a solução nem cria leitor de diretório; cache miss continua usando o cliente Drive. [Evidência e limites](validacao.md).
