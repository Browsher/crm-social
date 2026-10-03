# Pesquisa e decisões — feature 001

Atualizado em 03/10/2026. Pesquisa documental e alinhamento às telas aprovadas;
aplicativo e testes funcionais não implementados.

## Evidência disponível

O conector Google Drive/Sheets permitiu consultar metadados e intervalos delimitados das seis abas da planilha operacional `identificador configurado privadamente e conferido na captura`. Foram conferidos cabeçalhos e registros iniciais, inclusive as quatro produções da semana 05/10. **Essa inspeção não é uma captura completa**, nem conferência dos bytes de todos os arquivos no Drive.

| Aba | sheetId conferido | Identidade | Relações relevantes |
| --- | --- | --- | --- |
| Semanas | obtido na captura privada | `semana_id` | `marca_id`; ponteiros internos de plano, redação e visual |
| Produções | obtido na captura privada | `producao_id` | `semana_id`, `marca_id`, `slot`, `data_prevista`, estados |
| Páginas | obtido na captura privada | `pagina_id` | `producao_id`, `versao`, `indice`, `arquivo_imagem_id` |
| Cenas | obtido na captura privada | `cena_id` | `producao_id`, versão, ordem e arquivos de imagem/clipe |
| Arquivos | obtido na captura privada | `arquivo_id` | produção/semana/página/cena, papel, versão, origem e ID Drive |
| Revisoes | obtido na captura privada | `revisao_id` | produção/unidade/arquivo, versão, motivo e tratamento |

Na inspeção histórica de 02/10, as três artes consultadas tinham `arte_aprovada`;
o Reels tinha `prompts_imagem_prontos`, duração de 22 s e nenhum vídeo final registrado.
Liberação estava bloqueada. Esse retrato não é reconsulta de 03/10, captura completa
ou enum global. **`arte_aprovada` permanece Outras**: o dicionário não confirmou seu
mapeamento em `etapa_producao`; nome com “aprovada” não prova Pronta nem Publicada.

## Decisões

1. **Captura oficial, consulta local.** Reutilizar o acesso já autorizado da Central; evitar inventar que o servidor Node possui a sessão do conector. O usuário vê claramente quando a captura foi feita. A limitação é a atualização manual pela Central nesta feature.
2. **Frontend simples.** Aproveitar desenho aprovado em HTML/CSS/JS. O CRM comercial em `CRM de referência local, caminho configurado fora do repositório` é referência em leitura; copiar autenticação ou infraestrutura ampliaria o escopo sem benefício para consulta local.
3. **Não reutilizar o seletor da fila como catálogo.** `producao/n8n/modular/fila.cjs` e `contrato.cjs` contêm padrões úteis de identidade e integridade, mas selecionam trabalho elegível. Importar `common.cjs` também carrega a fonte do workflow e funções de geração. O CRM precisa mostrar produções em todos os estados. Criar pequeno adaptador próprio, somente de leitura, com testes.
4. **Versões explícitas.** Os ponteiros de Semanas usam `arquivo_id` interno; o ID Drive serve ao destino. Editor/Motion podem ter várias versões; empate ou origem não resolvida gera aviso, não seleção arbitrária.
5. **Frescor separado do conteúdo.** Uma nova coleta com dados iguais é uma nova observação válida. Só repetir a mesma captura identificada deve ser no-op; deduplicar apenas pelas células congelaria o horário mostrado ao usuário.
6. **Sem sincronização atômica prometida.** A API lê abas separadas. Duas leituras completas iguais e metadados estáveis detectam alterações observáveis; não comprovam ausência de mudanças transitórias entre chamadas.
7. **Telas como decisão, uma spec vigente.** A especificação de telas aprovada em 03/10
   foi integrada em [telas.md](../../docs/design/telas.md); os requisitos canônicos
   continuam em [spec.md](spec.md), com US1–US5 e FR-001–FR-016. Menu da 001 apenas
   Planejamento/Produção/Planilha, objetivo mensal Ainda não definido e nenhum Plano do mês.
8. **Mapeamento com evidência literal.** Seção 13 do dicionário confirma só oito valores
   de `etapa_producao`, todos em Mídia. Vocabulário do envelope editorial não vira
   whitelist da coluna. Outras conserva desconhecidos/vazio; colunas editoriais podem
   ficar vazias. Publicada depende de `publicado_em` ISO com fuso, válido e coerente,
   não de status, aprovação, arquivo ou hipótese de integração.
9. **Detalhe do dia.** Cartão/dia abre todas as peças do dia, acordeão primeiro aberto,
   Escape restaura foco. Link global N sem data mantém todas as peças acessíveis;
   no quadro, sem data abre seção da semana. Em 390 px lista semanal e gaveta de tela inteira.
10. **Atribuição registrada.** `responsavel_atual` é com quem está. Correção da revisão
    vigente usa `responsavel_correcao` separado. Encaminhamento/aguarda-de, próxima ação
    e atividade real ficam fora da 001; a referência operacional traz sugestões para extensão,
    não autoriza promovê-las a dados atuais.
11. **Histórico confirmado e precedência.** Recibos imutáveis completos/falhos ficam no
    diretório privado, não só em memória ou no resumo da última tentativa. A substituição
    atômica de `atual.json` confirma captura, última tentativa e `historicoIds` juntos;
    só os IDs confirmados entram no Histórico. Arquivos órfãos de interrupção não
    comprovam aceitação; mesmos bytes ainda não aceitos podem ser revalidados e promovidos.
    Persistência indisponível gera erro explícito, sem inventar recibo durável. Falha ativa
    com captura válida prevalece sobre selo de frescor; sem válida continua cinza e
    apresenta falha no Histórico. GET/releitura local não limpa erro; nova tentativa
    completa aceita encerra a falha sem apagar recibo antigo.
12. **Planilha local e mockup compartilhável têm exposição diferente.** As seis abas
    mostram todos os 66 mínimos e seus valores, inclusive IDs/hashes/origens como registros
    renderizados em texto. Não servir captura/envelope bruto, extras arbitrários,
    credenciais/tokens ou paths locais. Dados reais não entram em Git, fixtures ou prints
    compartilhados. Links selecionados Drive/Docs só no clique, sem preview/download automático.
13. **Design novo não tem flag comprovada.** Os mínimos de Páginas e seus campos extras
    conhecidos não estabelecem uma classificação inequívoca de design novo. Mostrar
    A confirmar para a página/versão sem fonte explícita; não inferir por template,
    arquivo presente ou estado, nem inventar cabeçalho.
14. **Sequência do backlog.** 002 passa a ser leitura direta da Planilha somente pelo
    servidor local, conta de serviço/chave fora do repositório e emenda futura da
    constituição; amplia Agentes/Controle/Execucoes. Mensal 003, revisões 004, prévias 005,
    Equipe/Workflow 006 continuam planejadas, sem instalação ou integração nesta tarefa.

## Fontes autorizadas do alinhamento de 03/10

Foram lidas em ordem: `crm-telas-especificacao.md`,
`referencias-operacao/dicionario-planilha.md` e
`referencias-operacao/agentes-e-workflows.md` no projeto de referência,
somente leitura, seguidas da spec vigente. A cópia de decisão UI local em telas.md
aponta a autoria/data; esses relatórios são dados/documentação, não autorização de
coleta, escrita, execução ou instalação. Dicionário: 12 abas, 232 cabeçalhos em 11
tabelas; nas seis da 001 há 154 atuais e 66 mínimos, todos presentes por nome. Isso
não demonstra captura aceita ou validade das linhas. Agentes/Controle/Execucoes
pertencem à futura 002, não à 001.

O relatório de agentes de 03/10 distingue agenda real pausada, cadastro divergente,
workflow publicado e integração/geração bloqueadas. Nenhum desses estados vira
widget funcional ou monitoramento da 001. Não repetir a inspeção histórica de uma
peça como se fosse observação atual.

## Spec Kit efetivamente inicializado

No preparo histórico de 02/10, o CLI `specify` estava instalado na versão 1.0.13 e
foi executado `specify init crm-social --integration codex --script ps --non-interactive`.
A estrutura `.specify/` e skills `.agents/skills/speckit-*/` foram criadas; naquela etapa
não foi necessário repositório Git. Esse trecho é recibo histórico, não comando
executado nesta atualização. Agora o repositório existe e a feature está na branch
`001-consulta-local-producao`, criada de `main`; isso não comprova app implementado.
Não foi verificada origem por commit Git do executável instalado; a documentação
oficial reconhece a distribuição PyPI `specify-cli` utilizada.

Fontes consultadas: [repositório oficial](https://github.com/github/spec-kit), [instalação oficial](https://github.github.io/spec-kit/installation.html) e documentação atual via Context7, biblioteca `/github/spec-kit`.

Superpowers organiza raciocínio, implementação, delegação e revisão; os arquivos em `specs/` continuam sendo a especificação e o plano canônicos. Instalar essas ferramentas de desenvolvimento não instala o Estrategista Mensal nem altera os agentes editoriais.
