# Proposta de emenda — leitura direta local

2026-10-05. **PENDENTE do ok do autor; não aplicada.** A [constituição](../../.specify/memory/constitution.md) permanece 1.0.0, intacta.

## Versão e motivo

**1.0.0 → 1.1.0 (minor)**: acrescentar um princípio para a leitura direta prevista na 002. Planilha/Drive continuam autoritativos; o servidor ganha leitura, sem responsabilidade editorial ou escrita. A 001 e a importação por arquivo continuam válidas.

## Texto proposto em Core Principles, depois do V

### VI. Leitura remota explícita, mínima e privada

O servidor local PODE ler a planilha configurada por meio de conta de serviço própria,
com escopo único `https://www.googleapis.com/auth/spreadsheets.readonly` e compartilhamento
como leitora. A chave DEVE permanecer fora do repositório, inclusive pelo caminho real,
e NÃO DEVE ser enviada ao navegador. Credenciais, tokens, identificadores privados e
dados reais NÃO DEVEM aparecer em arquivos versionados, testes, comentários ou logs públicos.

Toda leitura direta DEVE produzir a captura íntegra do contrato vigente, com metadados
antes/depois, duas leituras completas e hashes iguais, e passar pelo mesmo importador
e validação da captura por arquivo. Falha DEVE preservar a última captura válida e sua data.
O caminho de importação da Central DEVE continuar disponível. Abas auxiliares reservadas
para features posteriores NÃO DEVEM ser expostas na interface por consequência da coleta.

Essa capacidade NÃO concede escrita no Google/Drive, fila, n8n ou mídia, NÃO instala agenda
e NÃO transforma o CRM em coordenador. Preparação da conta e compartilhamento exigem ação
do autor; testes DEVEM usar cliente falso e dados sintéticos. O servidor permanece em loopback.

## Aplicação somente após aprovação

1. Registrar o ok explícito e a data real em `validacao.md` da 002.
2. Inserir princípio VI, mantendo I–V, limites, fluxo e governança.
3. Version 1.1.0; Ratified permanece 2026-10-02; Last Amended recebe a data do aceite.
4. Conferir documentos da 002 contra texto aprovado; não alterar templates oficiais.
5. Só então implementar. Credencial para demonstração é outro bloqueio, não pré-requisito dos testes falsos.

## Impacto e migração proposta

- Adição: VI. Remoções/renomeações: nenhuma. Proibição de escrita e autoria editorial preservadas.
- 001: comportamento/capturas antigas intactos; limitação de tipagem permanece evidência histórica.
- 002: perfil explícito de nove abas dentro de schemaVersion 1; novo runtime lê legado. Binário da 001 rejeita perfil novo: rollback requer conservar captura legada, sem converter arquivos.
- 006: registros privados para interpretação futura; cadastro/flag não comprova agenda ou integração.
- Documentos de estado serão sincronizados quando implementação tiver evidência, separando planejado, implementado, testado e integrado.

Decisão pendente de governança: aprovar ou revisar esta proposta. Nenhuma autorização de coleta real é concedida por este documento.
