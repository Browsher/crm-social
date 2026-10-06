# Executar e conferir — Meses

Consulta mensal concluída, 15/15 tarefas. Código integrado pelo PR #15; T002/T015 conferidas com a aba criada pelo autor e uma linha fictícia marcada como teste. Ambiente e Node/Playwright conforme o [quickstart da 002](../002-consulta-planilhas/quickstart.md); evidência sanitizada na [validação](validacao.md). Próximo passo: uso real antes de decidir 004/005.

## Tarefa do autor — criar/preencher Meses

Na planilha já usada pelo CRM, à mão:

1. Criar a aba com título exato **Meses**. Não alterar as seis abas de produção.
2. Na linha 1, preencher quatro cabeçalhos: **mes**, **marca_id**, **objetivo**, **pautas**.
3. Formatar **mes** como texto simples e preencher uma única linha do mês atual em **AAAA-MM**, marca **ntv**, objetivo curto e pautas, uma por linha dentro da mesma célula.
4. Manter apenas uma linha por mês/marca. Não fornecer IDs, e-mails de conta ou chaves em documentos públicos.

O CRM não cria/preenche a aba. T002 foi concluída pelo autor; T015 foi conferida pelo CRM com uma linha fictícia marcada como teste. Os passos acima permanecem orientação para uso real; as fixtures sintéticas continuam independentes da planilha.

## Repetir os ensaios sintéticos

Usar apenas TEMP e cliente falso; detalhes no [contrato](contracts/meses.md). Preservar fixtures antigas, acrescentando variantes sintéticas: opcional ausente/presente vazia, dois meses, 0/5/6/7 pautas, CRLF/vazios, duplicata de chave NTV, outra marca, mes/texto inválidos, HTML/URL credenciada e presença/conteúdo alterados entre leituras.

| Camada | Cenários e resultado esperado |
| --- | --- |
| Dados | Seis abas antigas/hash idênticos; sete quando opcional presente; duplicata não recusa; presença parcial/header/hash inválido recusa |
| Persistência/CLI | Importação antiga e nova em TEMP; no-op sem duplicar; alteração só em Meses promove; falha preserva bytes/horário/ponteiro conforme 002 |
| Serviço/projeção | Quatro mínimos NTV, linha física correta nos avisos e redação existente; nenhuma propriedade raiz/vínculo de semana novo |
| HTTP | POST falso coleta seis/sete ranges duas vezes; GET sem fetch; guards/falhas/configuração e vigente mantidos |
| Interface | Mês exibido correto; ausência/vazio/duplicata; listas 0/5/6/7→+1 pauta/+2 pautas; cores de objetivo/placeholders; marcador separado de +2 literal; card/avisos por linha física; Meses/avisos e retorno de seleção; teclado e 1440/390 px; POST→GET atualiza card |

Com Node 24.19.0 à frente do PATH e `CRM_PLAYWRIGHT_MODULE` configurado para o Playwright existente, na raiz do repositório:

```powershell
node --test tests/dados.test.cjs tests/snapshot.test.cjs tests/importador.test.cjs tests/projecao.test.cjs tests/coleta.test.cjs tests/servidor.test.cjs
node --test tests/interface.test.cjs tests/atualizacao-interface.test.cjs
node tools/quality-gate.mjs
```

Gate histórico local dos ajustes executado: fonte `84ab509`, Node 24.19.0, 320 testes PASS sem pulos nas cinco camadas, cobertura 98,3660%, drop 0 e complexidade PASS com 17 avisos; objetivoMensal 14, abaixo de 21. Baseline não atualizada; Semgrep SKIP por ausência no Windows, audit N/A sem dependências de aplicação. A seleção U003, incluindo oito novos cenários de interface, teve RED 12 PASS/8 FAIL e GREEN 20 PASS, sem pulos. O [gate inicial de 312 PASS](../../docs/reports/003-local-gate.json) permanece histórico. Consultar [validacao.md](validacao.md) para RED/GREEN e limites. O head `fd92f09`, com a fonte de código `84ab509`, tem [gate Linux](https://github.com/Browsher/crm-social/actions/runs/37389043475) e [review publicado](https://github.com/Browsher/crm-social/pull/15#issuecomment-6005518372) conferidos, sem Critical/Important/segurança/regressão. O código/testes/gate são idênticos entre esses heads; novos commits exigem conferir os checks do PR, sem atribuir-lhes um resultado anterior. Um novo head exige nova conferência; pulos UI/PowerShell no Linux não substituem a prova Windows local.

## Demonstração privada — T015

Autor conclui preparação manual e usa **Atualizar dados** após o aceite da 002 e implementação da 003. Conferir objetivo/pautas do mês atual e a tabela Meses contra a mesma captura vigente. Não criar duplicata deliberadamente na fonte real para testar: esses casos são sintéticos. Guardar apenas resultado/limites sanitizados, sem linha real, identificador de planilha, e-mail ou segredo em screenshot/relatório público.
