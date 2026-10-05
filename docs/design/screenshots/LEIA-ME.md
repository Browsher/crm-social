# Telas reais da primeira entrega

Como fotografias de uma agenda de demonstração, estes arquivos mostram a aplicação executável, preenchida somente com dados fictícios. São capturas de tela do código implementado em `src/web/`, diferentes do mockup e do protótipo históricos.

Registro histórico das imagens de 04/10/2026: evidência visual local de T001–T034/US1–US5. Na geração destas imagens, as sete tarefas finais ainda não tinham sido executadas. Hoje T001–T041 estão concluídas; resultados e limites ficam na validação, sem imagens da captura privada. As duas imagens originais da US1 foram refeitas após a revisão da US1; oito imagens adicionais registram os quatro selos da US2. O coordenador gerou as imagens com servidor/estado em diretório temporário e Playwright existente. Não houve leitura Google, captura operacional, importação em `data/` real ou mídia carregada remotamente. Consulte o [registro de validação](../../../specs/001-consulta-local-producao/validacao.md).

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

As imagens originais comprovam a aparência histórica do Planejamento da US1, não todas as interações, o CI Linux ou a feature completa. O selo **Captura local** dessas duas imagens era provisório e foi substituído na US2. US4/quadro e US5/abas, avisos e Histórico estão implementadas localmente. Iniciador e fechamento T039–T041 concluídos; limites da demonstração privada ficam na validação. Produção mostra quadro por semana; Planilha mostra captura/releitura, seis tabelas e Histórico. Revisão/integração corrente fica somente na validação.

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

## US4 — quadro de Produção

Aplicação executável por semana/tema, oito colunas, status informativo, responsável
e correção separados e primeira pendência/+N. Captura e mapa exclusivamente
sintéticos em TEMP exercitam todas as colunas; configuração versionada mantém
nove etapas e liberação/revisão vazias. Outras distingue rótulos de cartões.

| Desktop | Celular |
| --- | --- |
| [1440 × 1200](001-us4-producao-1440.png) | [390 × 2488](001-us4-producao-390.png) |

Servidor loopback, sem dado operacional, erro de página, requisição externa ou
corte horizontal. Não comprova coleta Google, bytes de mídia ou a 001 completa;
PR/aceite corrente na [validação](../../../specs/001-consulta-local-producao/validacao.md).

## US4 — pendências do cartão por coluna

As duas capturas novas de 04/10/2026 mostram o quadro com oito colunas e dez
cartões, usando somente `capturaQuadro` e `mapaQuadroSintetico` em TEMP. **Mídia
ausente** aparece nos cartões de Mídia, Revisão, Pronta, Publicada e Outras;
Planejamento, Redação e Visual conservam as revisões sem mostrar ausência de
mídia. O resumo e **+N** consideram somente as pendências visíveis no cartão;
API e gaveta mantêm os detalhes. A regra está no [contrato](../../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#quadro-prioridade-aprovada-e-configuração-versionada)
e nas [telas](../telas.md#3-produção-001).

| Desktop | Celular |
| --- | --- |
| [1440 × 1200](001-us4-ajuste-producao-1440.png) | [390 × 2456](001-us4-ajuste-producao-390.png) |

Aplicação real em loopback, captura e mapa exclusivamente sintéticos; conferência
sem corte horizontal, erro de página ou requisição externa. Os arquivos anteriores
permanecem como evidência da apresentação anterior. As imagens não comprovam
captura Google, bytes de mídia ou integração operacional; revisão/integração
corrente fica na [validação](../../../specs/001-consulta-local-producao/validacao.md).

## US5 — Planilha, avisos e Histórico

As seis capturas novas de 04/10/2026 mostram a aplicação executável com captura
exclusivamente sintética e estado em TEMP. Seis abas apresentam mínimos triados,
contagens de linhas NTV e regiões próprias de rolagem; Histórico é a aba final.
O atalho da gaveta abre Produções e os avisos da peça em Aba/Linha/Campo/Motivo,
sem reduzir os dados NTV das seis tabelas. O Histórico reúne tentativas completas
e falhas confirmadas, recentes primeiro.

| Vista | Desktop | Celular |
| --- | --- | --- |
| Dados NTV | [1440 × 1565](001-us5-dados-1440.png) | [390 × 1892](001-us5-dados-390.png) |
| Avisos da peça | [1440 × 1332](001-us5-avisos-1440.png) | [390 × 1641](001-us5-avisos-390.png) |
| Histórico confirmado | [1440 × 1200](001-us5-historico-1440.png) | [390 × 1179](001-us5-historico-390.png) |

Servidor loopback e dados fictícios, sem corte horizontal, erro de página ou
requisição externa na conferência. Células dedicadas recusadas usam **link não
permitido**, com marcador de supressão preservado e texto livre legítimo mantido;
nenhuma célula navega ou carrega mídia. As interações de teclado/foco, releitura e
avisos são verificadas nos testes, com resultados na [validação](../../../specs/001-consulta-local-producao/validacao.md)
e [resumo sanitizado](../../reports/001-us5-local.json), sem deduzi-los só das imagens.

As capturas anteriores permanecem históricas. Estes arquivos não comprovam coleta
Google, captura operacional, bytes de mídia, integração ou aceite completo da 001;
Quando estas imagens foram geradas, T035–T041 estavam pendentes; seu fechamento posterior está na validação. As regras de apresentação ficam nas [telas](../telas.md#4-planilha-001)
e no [contrato](../../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md#apresentação-de-planilha-e-alcance-das-urls).

## Planilha com origem compacta e motivos legíveis

Novas vistas sintéticas da apresentação, mantendo as anteriores como referência.
Origem resume falha e quantidade; a lista completa aparece somente na tabela.

| Vista | Desktop 1440 | Celular 390 |
| --- | --- | --- |
| Dados | [Abrir](001-us5-ajuste-dados-1440.png) | [Abrir](001-us5-ajuste-dados-390.png) |
| Avisos da peça | [Abrir](001-us5-ajuste-avisos-1440.png) | [Abrir](001-us5-ajuste-avisos-390.png) |
| Histórico | [Abrir](001-us5-ajuste-historico-1440.png) | [Abrir](001-us5-ajuste-historico-390.png) |

Evidências e limites permanecem na [validação](../../../specs/001-consulta-local-producao/validacao.md).
