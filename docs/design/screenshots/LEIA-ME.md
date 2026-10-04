# Telas reais da primeira entrega

Como fotografias de uma agenda de demonstração, estes arquivos mostram a aplicação executável, preenchida somente com dados fictícios. São capturas de tela do código implementado em `src/web/`, diferentes do mockup e do protótipo históricos.

Estado em 04/10/2026: evidência visual local de T001–T026/US1, US2 e US3. As duas imagens originais da US1 foram refeitas após a revisão da US1; oito imagens adicionais registram os quatro selos da US2. O coordenador gerou as imagens com servidor/estado em diretório temporário e Playwright existente. Não houve leitura Google, captura operacional, importação em `data/` real ou mídia carregada remotamente. Consulte o [registro de validação](../../../specs/001-consulta-local-producao/validacao.md).

| Arquivo | O que mostra |
| --- | --- |
| [001-planejamento-1440.png](001-planejamento-1440.png) | Desktop 1440 × 1240: cinco semanas de outubro, Em planejamento, Outubro de 2026 e fundo lateral até o rodapé |
| [001-planejamento-390.png](001-planejamento-390.png) | Celular 390 × 1050: lista semanal, estado legível e menu recolhido |

Fixture da demonstração: cinco peças NTV fictícias, uma sem data, duas em 02/10 e semana de 28/09 a 04/10/2026. Quantidades/datas são exemplos sintéticos, sem valor operacional. A imagem B histórica está representada no conjunto; o objetivo mensal permanece **Ainda não definido**.

![Aplicação local em 1440 px, com dados fictícios](001-planejamento-1440.png)

Aplicação em execução, dados fictícios — calendário desktop da primeira entrega.

![Aplicação local em 390 px, com dados fictícios](001-planejamento-390.png)

Aplicação em execução, dados fictícios — lista semanal mobile da primeira entrega.

## Limites da evidência

As imagens originais comprovam a aparência histórica do Planejamento da US1, não todas as interações, o CI Linux ou a feature completa. O selo **Captura local** dessas duas imagens era provisório e foi substituído na US2. US4/quadro, US5/abas completas e Histórico e o iniciador continuam pendentes. Produção exibe mensagem de próxima entrega; Planilha já mostra detalhes da captura e releitura local, sem as tabelas futuras.

Não substituir essas imagens por screenshots com dados privados. [Telas decididas](../telas.md) e [spec canônica](../../../specs/001-consulta-local-producao/spec.md) mantêm os requisitos completos; resultados de testes ficam no registro de validação, não deduzidos da imagem.

## US2 — quatro estados, desktop e celular

As oito imagens abaixo registram a implementação da US2 em 04/10/2026; procedência e head na [validação](../../../specs/001-consulta-local-producao/validacao.md). Desktop 1440 × 1240 e celular 390 × 1050. Agenda somente fictícia; captura.completedAt sintético de 04/10/2026 09:46 (hoje/falha) ou 03/10/2026 09:46 (anterior), no fuso America/Sao_Paulo. A ausência tem uma tentativa falha sem captura válida e conserva o selo cinza. Nenhuma imagem foi alterada para simular resultado.

| Selo | Desktop | Celular | Conferência visual |
| --- | --- | --- | --- |
| Atualizado hoje, 09:46 | [1440](001-us2-hoje-1440.png) | [390](001-us2-hoje-390.png) | Verde, horário vem do fim da captura |
| Dados de 03/10 | [1440](001-us2-anterior-1440.png) | [390](001-us2-anterior-390.png) | Âmbar, mesmas peças conservadas |
| Atualização falhou | [1440](001-us2-falha-1440.png) | [390](001-us2-falha-390.png) | Vermelho, última captura válida continua visível |
| Sem dados | [1440](001-us2-sem-dados-1440.png) | [390](001-us2-sem-dados-390.png) | Cinza, sem cartões ou fallback inventado |

O selo permanece no cabeçalho das três telas e abre Planilha. O teste real de interface e a inspeção no navegador conferiram detalhes/aviso e a legenda **Reler captura local; não consulta o Google**. As imagens documentam o estado de apresentação; somente os testes e o registro de validação comprovam as interações de releitura/conservação.

## US3 — gaveta com uma e várias peças

Quatro imagens da aplicação real com fixtures sintéticas, servidor loopback e
estado em TEMP, sem requisição externa ou erro de página. A gaveta de 01/10 contém
uma imagem; 02/10 contém carrossel com páginas e Reels com cenas. O segundo acordeão
foi aberto por clique somente para a imagem; a primeira abertura da gaveta mantém
apenas a primeira peça aberta, conforme o teste de interface. Versões antigas
permanecem recolhidas; revisão resolvida é cinza e responsável/correção são separados.

| Dia | Desktop | Celular |
| --- | --- | --- |
| Uma peça, janela de 1050 px de altura | [1440](001-us3-uma-peca-1440.png) | [390](001-us3-uma-peca-390.png) |
| Várias peças, janela de 4800 px de altura | [1440](001-us3-varias-pecas-1440.png) | [390](001-us3-varias-pecas-390.png) |

A altura maior registra o conteúdo completo dos dois acordeões, sem montagem ou
alteração da imagem. O teste móvel usa janela normal 390 × 1050 e confirma tela
cheia, rolagem interna e Esc/foco. Arquivos são registros com links por clique;
nenhuma mídia foi carregada e as URLs apontam exemplos fictícios. Evidências de
execução e revisão ficam apenas na [validação](../../../specs/001-consulta-local-producao/validacao.md).

## Gaveta compacta — primeira apresentação

Quatro imagens novas em janelas 1440/390 × 1050, aplicação real em loopback,
captura exclusivamente sintética em TEMP. A primeira peça fica aberta, o Reels
do dia com várias peças fica recolhido; seus registros/cenas continuam completos
na API e são exercitados nos testes ao expandir. Textos, versões anteriores e
Histórico também ficam recolhidos. Documentos da semana aparecem no fim do dia.

| Dia | Desktop | Celular |
| --- | --- | --- |
| Uma peça | [1440](001-us3-compacta-uma-peca-1440.png) | [390](001-us3-compacta-uma-peca-390.png) |
| Carrossel + Reels | [1440](001-us3-compacta-varias-pecas-1440.png) | [390](001-us3-compacta-varias-pecas-390.png) |

Conferidas visualmente sem corte horizontal, pageerror ou acesso externo. As
imagens anteriores são históricas; estes arquivos não as sobrescrevem. Nenhuma
imagem comprova captura Google, bytes de mídia, aprovação ou publicação remota.
[Desenho compactado](../mockups/gaveta-v2.html), [telas](../telas.md#2-gaveta-do-dia-001)
e [evidências](../../../specs/001-consulta-local-producao/validacao.md) registram os limites.

## Gaveta compacta — revisão legível

As duas imagens novas mostram carrossel e Reels sintéticos abertos no mesmo dia.
O segundo acordeão foi expandido por clique para conferir páginas e cenas; abrir
a gaveta continua deixando somente a primeira peça aberta. Texto registrado,
versões anteriores e Histórico permanecem recolhidos. A revisão tem título
legível e correção/tratamento; a cena distingue imagens/vídeo ausentes em um texto
humano, enquanto os escopos e avisos técnicos completos continuam na API.

| Desktop | Celular | Conteúdo |
| --- | --- | --- |
| [1440 × 1440](001-us3-final-varias-pecas-1440.png) | [390 × 1600](001-us3-final-varias-pecas-390.png) | Carrossel com páginas e Reels com cenas, dois acordeões abertos por clique |

Aplicação real em loopback, captura exclusivamente sintética e estado em TEMP;
conferência sem erro de página, requisição externa ou corte horizontal. Os arquivos
anteriores permanecem como evidência da apresentação anterior. Nenhuma imagem
comprova coleta Google, mídia conferida, aprovação ou publicação. Estado, revisão
e evidências de execução ficam somente na [validação](../../../specs/001-consulta-local-producao/validacao.md).

## Gaveta compacta — links e avisos relacionados

As capturas mais recentes mostram carrossel e Reels sintéticos no mesmo dia,
com identificação humana das unidades e avisos relacionados no contador da peça.
Arquivo ligado sem URL segura é **link não permitido**, distinto de mídia ausente;
URL recusada não é ecoada. A API conserva IDs e registros completos selecionados.

| Desktop | Celular |
| --- | --- |
| [1440](001-us3-ultima-varias-pecas-1440.png) | [390](001-us3-ultima-varias-pecas-390.png) |

Aplicação real em loopback, apenas fixture sintética e estado em TEMP, sem erro
de página, requisição externa ou corte horizontal. As imagens anteriores ficam
preservadas; nenhuma captura comprova coleta Google, bytes de mídia ou integração
operacional. Estado e evidências reais ficam na [validação](../../../specs/001-consulta-local-producao/validacao.md).
