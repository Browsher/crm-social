# Modelo — Meses opcional

Data: 2026-10-05; implementado e testado localmente com dados sintéticos. [Spec](spec.md), [contrato](contracts/meses.md) e [evidências/limites](validacao.md); T002/T015 concluídas com uma linha fictícia marcada como teste na fonte real; uso editorial real não comprovado. Modelo inalterado; próximo passo: uso real antes de decidir 004/005.

## Linha da aba Meses

| Campo mínimo | Regra de consulta |
| --- | --- |
| mes | Texto `AAAA-MM`, ano de quatro dígitos e mês 01–12; sem conversão serial |
| marca_id | Somente literal `ntv` entra na consulta, como a seleção existente; outras/ausentes ficam fora |
| objetivo | Texto; vazio mostra Ainda não definido; tipo não textual gera aviso e é ausente no card |
| pautas | Texto com uma pauta por linha; LF/CRLF, trim das bordas, vazios descartados, ordem/repetições preservadas; tipo não textual gera aviso e nenhum item no card |

Chave semântica: `(marca_id, mes)`; não é unicidade estrutural da captura. Duas ou mais linhas NTV com a mesma chave são preservadas e avisadas individualmente, mesmo com texto igual. Nenhum ID novo, campo de versão mensal ou vínculo de semana. `registros` em `src/captura.cjs` conserva índice físico da fonte em WeakMap privado; `linhaMensal(record)` entrega essa origem à triagem, separado das quatro colunas expostas.

## Captura e projeção

- Seis abas obrigatórias e 66 mínimos continuam iguais. Meses opcional tem quatro mínimos adicionais; ordem visual depois de Revisoes e antes de Histórico. O hash ordena os pares pelo nome da aba, incluindo Meses só quando presente; hashes antigos são preservados.
- Ausência: `tables`, `metadataBefore` e `metadataAfter` omitem Meses conjuntamente. Não acrescentar chave com vazio à captura antiga.
- Presença: os três mapas incluem Meses; metadados/ranges/hashes e leitura completa obedecem ao v1. Cabeçalho mínimo obrigatório mesmo em tabela sem linhas. Colunas extras permanecem privadas.
- O retorno normalizado de `validarCaptura` conserva envelope/seis arrays existentes e acrescenta `meses` somente quando capturada; a triagem conserva duplicatas/localizações em `origens` por linha física, antes da projeção dos mínimos. Não introduzir wrapper `dados.abas` nem preencher opcional ausente.
- `visao.planilha` ganha `{nome:'Meses', cabecalhos:['mes','marca_id','objetivo','pautas'], quantidadeLinhas, linhas}`. Cada linha tem somente quatro campos triados. Não adicionar propriedade na raiz ou contador mensal em `visao.captura`.
- `visao.avisos` mantém `{aba, linha, campo, motivo}`; linha é a posição física da planilha, cabeçalho em 1. Avisos não contêm valor recusado, segredo ou conteúdo bruto.

## Estados derivados do card

Filtrar linhas NTV com mes válido igual ao `state.mes` exibido. Zero linhas: Ainda não definido, sem pautas. Uma: objetivo textual ou Ainda não definido, com lista curta derivada de pautas textuais. Duas ou mais: A confirmar, sem objetivo/pautas de qualquer candidata. O objetivo textual definido usa cor principal; somente os estados Ainda não definido/A confirmar ficam apagados. A lista mantém até cinco pautas; o restante aparece em marcador separado +N pautas, singular +1 pauta, sem interpretar números do texto registrado como contador.

O servidor publica os registros triados e os avisos; o navegador apenas deriva o card, sem outra autoridade ou requisição remota. Pautas inválidas nunca viram strings artificiais. Na Planilha, escalares originais permitidos continuam visíveis como dados, conforme as regras existentes de apresentação.

## Transições

- Nova captura íntegra com mudança somente em Meses: hash diferente e promoção pelas regras temporais atuais.
- Mesma captura repetida: no-op atual, sem novo recibo ou horário.
- Falha estrutural ou mudança entre leituras: recibo de falha quando confirmável, vigente preservada.
- Duplicata semântica: captura completa aceita, avisos e card A confirmar.
- Nova captura sem Meses: aba removida da consulta e card indefinido, sem carregar mês da captura anterior; seleção de tabela retorna a aba disponível.
- Nenhum registro imutável antigo é migrado/regravado e nenhum recibo antigo é editado.
