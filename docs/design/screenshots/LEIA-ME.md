# Telas reais da primeira entrega

Como fotografias de uma agenda de demonstração, estes arquivos mostram a aplicação executável, preenchida somente com dados fictícios. São capturas de tela do código implementado em `src/web/`, diferentes do mockup e do protótipo históricos.

Estado em 04/10/2026: evidência visual local de T001–T022/US1 e US2. As duas imagens originais da US1 foram refeitas após a revisão do PR #6; oito imagens adicionais registram os quatro selos da US2. O coordenador gerou as imagens com servidor/estado em diretório temporário e Playwright existente. Não houve leitura Google, captura operacional, importação em `data/` real ou mídia carregada remotamente. Consulte o [registro de validação](../../../specs/001-consulta-local-producao/validacao.md).

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

As imagens originais comprovam a aparência histórica do Planejamento da US1, não todas as interações, o CI Linux ou a feature completa. O selo **Captura local** dessas duas imagens era provisório e foi substituído na US2. US3/detalhes e acordeões, US4/quadro, US5/abas completas e Histórico e o iniciador continuam pendentes. Produção exibe mensagem de próxima entrega; Planilha já mostra detalhes da captura e releitura local, sem as tabelas futuras.

Não substituir essas imagens por screenshots com dados privados. [Telas decididas](../telas.md) e [spec canônica](../../../specs/001-consulta-local-producao/spec.md) mantêm os requisitos completos; resultados de testes ficam no registro de validação, não deduzidos da imagem.

## US2 — quatro estados, desktop e celular

As oito imagens abaixo foram capturadas do código `3857816` em 04/10/2026. Desktop 1440 × 1240 e celular 390 × 1050. Agenda somente fictícia; captura.completedAt sintético de 04/10/2026 09:46 (hoje/falha) ou 03/10/2026 09:46 (anterior), no fuso America/Sao_Paulo. A ausência tem uma tentativa falha sem captura válida e conserva o selo cinza. Nenhuma imagem foi alterada para simular resultado.

| Selo | Desktop | Celular | Conferência visual |
| --- | --- | --- | --- |
| Atualizado hoje, 09:46 | [1440](001-us2-hoje-1440.png) | [390](001-us2-hoje-390.png) | Verde, horário vem do fim da captura |
| Dados de 03/10 | [1440](001-us2-anterior-1440.png) | [390](001-us2-anterior-390.png) | Âmbar, mesmas peças conservadas |
| Atualização falhou | [1440](001-us2-falha-1440.png) | [390](001-us2-falha-390.png) | Vermelho, última captura válida continua visível |
| Sem dados | [1440](001-us2-sem-dados-1440.png) | [390](001-us2-sem-dados-390.png) | Cinza, sem cartões ou fallback inventado |

O selo permanece no cabeçalho das três telas e abre Planilha. O teste real de interface e a inspeção no navegador conferiram detalhes/aviso e a legenda **Reler captura local; não consulta o Google**. As imagens documentam o estado de apresentação; somente os testes e o registro de validação comprovam as interações de releitura/conservação.
