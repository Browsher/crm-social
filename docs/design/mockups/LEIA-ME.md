# Mockup de telas v2

## Layout v3 — referência da 006

[layout-v3.html](layout-v3.html) é a cópia sanitizada da referência aprovada em 08/10/2026. Perfil/marca e textos comerciais foram substituídos por valores demonstrativos; não contém dados capturados, credenciais, IDs de serviço ou fontes remotas. A fonte foi somente lida. [Telas](../telas.md#layout-v3--referência-aprovada-para-a-006) e [spec da 006](../../../specs/006-layout-v3/spec.md) prevalecem sobre itens ilustrativos divergentes.

O HTML conserva Dados e avisos, mensagens e botões de exemplo para registrar a referência; eles não autorizam sua presença na UI final. A Parte A foi implementada/testada localmente, com 12 screenshots sintéticos de Semana/Mês/Produção nos dois temas e 1440/390; [evidências do aplicativo](../screenshots/LEIA-ME.md#006--layout-v3-parte-a). O autor manteve 32 tarefas e autorizou duas partes; perfil/pop-up/Instagram/Publicar e remoção visual da Planilha são B, não iniciada e dependente do ok explícito na A. Nenhum mockup é apresentado como screenshot do produto.

03/10/2026 — demonstração offline de decisões visuais, construída sobre o [protótipo de 02/10](../prototype/index.html). Abrir [telas-v2.html](telas-v2.html) no navegador. A [especificação das telas](../telas.md) e a [spec da 001](../../../specs/001-consulta-local-producao/spec.md) definem o escopo da implementação.

Peças, datas, versões, estados, responsabilidades e horários são exemplos do protótipo. Os nomes dos agentes e workflows são referências funcionais. Este HTML não é uma captura da planilha nem um monitor de agendas; não prova aprovação, integração ou publicação. Não lê Google, não salva decisões e não executa workflows. Não contém mídias operacionais.

Conferência antes da cópia: sem credenciais, URLs privadas, caminhos pessoais ou fontes remotas. A única URI externa é o namespace SVG do W3C, que não faz requisição. Identificadores de DOM e chaves curtas dos componentes pertencem à demonstração.

Saneamento da cópia: a chave da semana foi substituída por **SEMANA-EXEMPLO**, as chaves ilustrativas das peças por **PECA-EXEMPLO-A/B/C/R**, e as referências a entregas/execução histórica por texto de exemplo. O título e uma nota visível identificam a demonstração. A fonte foi preservada, somente lida.

O HTML conserva o seletor de variações e telas futuras para comparação do desenho. Para a 001:

- Menu somente **Planejamento, Produção e Planilha**; Conteúdos entra na 005 e Equipe/Workflow na 006.
- Objetivo **Ainda não definido**, sem botão Plano do mês; um objetivo mensal depende da 003.
- Gaveta com todas as peças do dia, inclusive formatos escondidos pelo filtro. O comportamento filtrado de uma variante do HTML não redefine esse aceite.
- Quadro usa o mapeamento do contrato, **Outras** e publicação comprovada; os rótulos ilustrativos do HTML não são enums da planilha.
- Planilha usa as seis abas exatas e seus 66 cabeçalhos mínimos, mais Histórico; agrupamentos reduzidos do mockup não substituem o contrato.
- Selo com quatro estados e celular em lista semanal. Horários fixos da demonstração não são horário de captura.

Nenhum dado real deve substituir esses exemplos no Git. A futura consulta real permanece local, com capturas privadas em `data/`.

## Gaveta compacta v2

[gaveta-v2.html](gaveta-v2.html) é a referência aprovada para a [seção 2 das telas](../telas.md#2-gaveta-do-dia-001). Como uma ficha dobrável, mostra a primeira peça aberta e as demais resumidas, faixa de dados, revisão em uma linha, unidades compactas e documentos semanais únicos. Texto registrado, versões anteriores e Histórico abrem por clique.

A cópia foi conferida antes de entrar no repositório: peças, textos, responsabilidades, revisões e avisos são sintéticos; links usam apenas `#`. Sem dados reais, credenciais, URLs privadas, caminhos pessoais, mídia operacional ou fontes remotas. A fonte foi somente lida. Este HTML demonstra apresentação, sem API, persistência ou coleta; comportamento e campos efetivamente implementados estão no [módulo web](../../modules/web.md), com evidências na [validação](../../../specs/001-consulta-local-producao/validacao.md).

A [spec canônica](../../../specs/001-consulta-local-producao/spec.md) e o [contrato](../../../specs/001-consulta-local-producao/contracts/captura-e-consulta.md) prevalecem sobre números e rótulos ilustrativos do HTML:

- A faixa **Publicação não comprovada** do mockup é omitida no aplicativo quando publicado_em está vazio; ausência não comprova publicação.
- **Versão 1 · 1 revisão** e outras contagens do exemplo não autorizam inferir revisão vigente nem quantidade de unidades de uma versão anterior. O aplicativo usa grupos/versões registrados, conta unidades vigentes e distingue revisão aberta, a confirmar e ausência.
- Valores de estado, etapa, decisão e responsabilidade ilustrados não definem enums ou aliases da planilha; desconhecidos conservam o original. Slots de imagem inicial/final/vídeo e os avisos humanos seguem o contrato, sem fabricar disponibilidade a partir de um link do desenho.
