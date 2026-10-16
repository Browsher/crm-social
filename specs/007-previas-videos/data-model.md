# Modelo

Como relacionar a capa ao filme na mesma ficha, o modelo usa os vínculos já capturados e mantém o estado de reprodução somente no navegador.

Nenhuma coluna nova.
Vídeo: Arquivos.tipo=video; id_drive corresponde a Produções.id_drive_video_final; producao_id/versao iguais, versão inteira positiva; uma correspondência.
Capa: Arquivos.tipo=imagem; papel=capa_video; produção e versão iguais; origens_json contém video_arquivo_id do vídeo. Uma correspondência.
Estado de player fica só no navegador; não altera liberação/publicação. Cache local vincula arquivo_id, versão, Drive e SHA e só é acessível após resolver a captura vigente.

MIME de vídeo ausente é compatível; se capturado, precisa ser literal video/mp4. Final declarado inválido produz posição de vídeo indisponível, sem escolher outra cena. Final ausente conserva o comportamento anterior; banco sem final não escolhe um dos vários arquivos.

A chave privada de vídeo é SHA-256 de [arquivo_id,versao,id_drive,sha256Normalizado,'video',tipo,producao_id]; imagem conserva a tupla histórica de quatro campos. A separação não concede autorização sem snapshot atual e não migra capturas.
