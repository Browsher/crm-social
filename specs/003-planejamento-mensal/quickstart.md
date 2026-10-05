# Validação futura — Meses

Data: 2026-10-05. Guia de execução futura; nenhum comando abaixo foi rodado como implementação da 003 nesta entrega. Pré-requisito: T021/aceite da 002 concluídos. Ambiente local e Node/Playwright existentes conforme o [quickstart da 002](../002-consulta-planilhas/quickstart.md).

## Tarefa do autor — criar/preencher Meses

Na planilha já usada pelo CRM, à mão:

1. Criar a aba com título exato **Meses**. Não alterar as seis abas de produção.
2. Na linha 1, preencher quatro cabeçalhos: **mes**, **marca_id**, **objetivo**, **pautas**.
3. Formatar **mes** como texto simples e preencher uma única linha do mês atual em **AAAA-MM**, marca **ntv**, objetivo curto e pautas, uma por linha dentro da mesma célula.
4. Manter apenas uma linha por mês/marca. Não fornecer IDs, e-mails de conta ou chaves em documentos públicos.

O CRM não cria/preenche a aba. Esta tarefa é manual e não bloqueia testes: sem a aba real, usar as fixtures sintéticas. Preparação não comprova integração nem destrava a implementação antes da T021 da 002.

## Ensaios sintéticos após implementar

Usar apenas TEMP e cliente falso; detalhes no [contrato](contracts/meses.md). Preservar fixtures antigas, acrescentando variantes sintéticas: opcional ausente/presente vazia, dois meses, 0/5/7 pautas, CRLF/vazios, duplicata de chave NTV, outra marca, mes/texto inválidos, HTML/URL credenciada e presença/conteúdo alterados entre leituras.

| Camada | Cenários e resultado esperado |
| --- | --- |
| Dados | Seis abas antigas/hash idênticos; sete quando opcional presente; duplicata não recusa; presença parcial/header/hash inválido recusa |
| Persistência/CLI | Importação antiga e nova em TEMP; no-op sem duplicar; alteração só em Meses promove; falha preserva bytes/horário/ponteiro conforme 002 |
| Serviço/projeção | Quatro mínimos NTV, linha física correta nos avisos e redação existente; nenhuma propriedade raiz/vínculo de semana novo |
| HTTP | POST falso coleta seis/sete ranges duas vezes; GET sem fetch; guards/falhas/configuração e vigente mantidos |
| Interface | Mês exibido correto; ausência/vazio/duplicata; listas 0/5/7→+2; Meses/avisos e retorno de seleção; teclado e 1440/390 px; POST→GET atualiza card |

Com Node 24.19.0 à frente do PATH e `CRM_PLAYWRIGHT_MODULE` configurado para o Playwright existente, na raiz do repositório:

```powershell
node --test tests/dados.test.cjs tests/snapshot.test.cjs tests/importador.test.cjs tests/projecao.test.cjs tests/coleta.test.cjs tests/servidor.test.cjs
node --test tests/interface.test.cjs tests/atualizacao-interface.test.cjs
node tools/quality-gate.mjs
```

Executar testes antes do código correspondente e registrar RED/GREEN reais. Ao final, gate local sem pulos das cinco camadas, gate Linux com limitações UI/PowerShell explícitas, review independente e documentação sincronizada. Não alterar baseline para acomodar a feature. Evidências futuras em `validacao.md`, sem dados reais ou falsificação de resultado.

## Demonstração privada após implementar

Autor conclui preparação manual e usa **Atualizar dados** após o aceite da 002 e implementação da 003. Conferir objetivo/pautas do mês atual e a tabela Meses contra a mesma captura vigente. Não criar duplicata deliberadamente na fonte real para testar: esses casos são sintéticos. Guardar apenas resultado/limites sanitizados, sem linha real, identificador de planilha, e-mail ou segredo em screenshot/relatório público.
