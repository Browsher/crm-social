# Contrato 007
GET/HEAD /api/video/<ID interno>, sem query. Mesmo Host/Origin/Fetch-Site da mídia. Somente MP4 validado até 64.000.000 bytes; tipo video e identidade correta.
200 completo; HEAD mesmos cabeçalhos sem corpo, ignorando Range. GET com faixa única bytes=inicio-fim, inicio- ou -sufixo: 206 e Content-Range. Inválida, múltipla ou fora do tamanho: 416 e Content-Range bytes */tamanho. 400 ID/URL inválida, 403 origem, 404 ausente, 405 método, 422 tipo/tamanho/hash/bytes, 503 leitura.
Content-Type video/mp4; Accept-Ranges bytes; Content-Length correto; nosniff, no-store, CORP same-origin; media-src self na CSP. Nenhuma conexão do navegador ao Google.
Player mostra poster, controls, playsinline, só atribui fonte no clique; fechar pausa, remove src e chama load; tela cheia por botão e retorno nativo.

## Final e capa
O navegador seleciona um único Arquivos tipo video da mesma produção e versão inteira positiva segura, id_drive igual a Produções.id_drive_video_final; MIME capturado, se presente, deve ser video/mp4. Capa única exige tipo imagem, papel capa_video, produção/versão iguais e origens_json.video_arquivo_id igual ao arquivo de vídeo. Final declarado inválido não cai em outro arquivo/cena; sem final declarado, galeria anterior permanece. Banco com múltiplos vídeos sem final escolhido não recebe seleção automática.

## Bytes e cache
MP4 exige ftyp com marca suportada isom/iso2/avc1/mp41/mp42, caixas completas e moov/mdat não vazios; SHA opcional deve conferir. A estrutura não garante codec decodificável; erro do navegador mostra indisponibilidade. O arquivo completo é validado antes de Range. Cache privado separa chaves de vídeo/imagem, reconfere autorização/referência vigente antes/depois e não altera captura/estado editorial. Em miss usa Drive readonly no servidor, sem fallback automático a diretórios locais.

## Ciclo da prévia
Releitura da mesma referência final/capa preserva o elemento, tempo e pausa; mudança libera a mídia e inicia a nova posição. Vídeo não usa gestos de carrossel e conserva teclado/controles nativos. Falha de play mantém controles e orientação. Falha de fullscreen é tratada sem fechar. URLs do player/poster são somente locais; links documentais existentes permanecem separados.
