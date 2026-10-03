# Pesquisa e decisões — feature 001

02/10/2026. Pesquisa concluída para o desenho; aplicativo não implementado.

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

As três artes consultadas tinham `arte_aprovada`; o Reels tinha `prompts_imagem_prontos`, duração de 22 s e nenhum vídeo final registrado. Liberação estava bloqueada. Não transformar esse retrato datado em regra fixa ou conclusão sobre todas as revisões.

## Decisões

1. **Captura oficial, consulta local.** Reutilizar o acesso já autorizado da Central; evitar inventar que o servidor Node possui a sessão do conector. O usuário vê claramente quando a captura foi feita. A limitação é a atualização manual pela Central nesta feature.
2. **Frontend simples.** Aproveitar desenho aprovado em HTML/CSS/JS. O CRM comercial em `CRM de referência local, caminho configurado fora do repositório` é referência em leitura; copiar autenticação ou infraestrutura ampliaria o escopo sem benefício para consulta local.
3. **Não reutilizar o seletor da fila como catálogo.** `producao/n8n/modular/fila.cjs` e `contrato.cjs` contêm padrões úteis de identidade e integridade, mas selecionam trabalho elegível. Importar `common.cjs` também carrega a fonte do workflow e funções de geração. O CRM precisa mostrar produções em todos os estados. Criar pequeno adaptador próprio, somente de leitura, com testes.
4. **Versões explícitas.** Os ponteiros de Semanas usam `arquivo_id` interno; o ID Drive serve ao destino. Editor/Motion podem ter várias versões; empate ou origem não resolvida gera aviso, não seleção arbitrária.
5. **Frescor separado do conteúdo.** Uma nova coleta com dados iguais é uma nova observação válida. Só repetir a mesma captura identificada deve ser no-op; deduplicar apenas pelas células congelaria o horário mostrado ao usuário.
6. **Sem sincronização atômica prometida.** A API lê abas separadas. Duas leituras completas iguais e metadados estáveis detectam alterações observáveis; não comprovam ausência de mudanças transitórias entre chamadas.

## Spec Kit efetivamente inicializado

O CLI `specify` já estava instalado na versão 1.0.13. Foi executado `specify init crm-social --integration codex --script ps --non-interactive`. A estrutura `.specify/` e as skills `.agents/skills/speckit-*/` foram criadas. Nenhuma reinstalação global ou repositório Git foi necessário. Não foi verificada origem por commit Git do executável instalado; a documentação oficial reconhece a distribuição PyPI `specify-cli` utilizada.

Fontes consultadas: [repositório oficial](https://github.com/github/spec-kit), [instalação oficial](https://github.github.io/spec-kit/installation.html) e documentação atual via Context7, biblioteca `/github/spec-kit`.

Superpowers organiza raciocínio, implementação, delegação e revisão; os arquivos em `specs/` continuam sendo a especificação e o plano canônicos. Instalar essas ferramentas de desenvolvimento não instala o Estrategista Mensal nem altera os agentes editoriais.
