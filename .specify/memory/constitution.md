# CRM Social Constitution

## Core Principles

### I. Local, simples e útil desde a primeira feature

O CRM DEVE funcionar neste computador e iniciar com a NTV. A primeira entrega funcional
DEVE permitir consultar a produção existente. Não exigir hospedagem, autenticação multiusuário,
novo banco remoto ou infraestrutura de outra marca para essa consulta. Dependência nova
exige necessidade concreta registrada no plano da feature.

### II. Planilha e Drive continuam sendo as fontes da operação

A planilha NTV — Produção DEVE manter a autoridade sobre fila, versões e decisões.
O Drive DEVE manter documentos e mídias. O CRM NÃO DEVE inventar um segundo estado operacional.
Toda captura DEVE identificar fonte, período coberto, instante e falhas. Informação antiga,
incompleta ou indisponível NÃO DEVE aparecer como sincronização concluída nem dado igual a zero.
IDs internos, versões, referências e histórico DEVEM ser preservados.

### III. Cada papel mantém sua responsabilidade

O Estrategista mensal propõe objetivo e pautas; o Diretor detalha e ajusta a semana;
os especialistas produzem e revisam; a Central registra os retornos editoriais.
O CRM NÃO DEVE virar outro coordenador. Instalar o Spec Kit não instala o agente mensal,
não muda os prompts da produção e não cria agenda. Solicitações futuras feitas pela interface
só DEVEM aparecer como aplicadas após confirmação da Central para a versão correta.

### IV. Evidência antes de conclusão

Ideia, documento, mídia registrada, mídia conferida, aprovação técnica e publicação
DEVEM ser estados distintos. O código DEVE ter testes proporcionais de identidade,
versão, captura parcial, dados inválidos e fluxos do usuário; testes de regras de dados
DEVEM ser escritos antes da implementação correspondente. Consultas e testes locais
NÃO DEVEM produzir mídia editorial, alterar flags ou publicar. Imagens sintéticas
geradas exclusivamente como fixtures de teste NÃO constituem produção editorial e
NÃO DEVEM incorporar dados reais. Todo aceite DEVE citar o que foi
executado e separar planejado, implementado, testado e integrado.

### V. Uma feature por vez, com especificação e revisão

Cada feature DEVE ter escopo, cenários de uso, critérios de aceite e dependências no Spec Kit.
O Superpowers DEVE apoiar descoberta, plano, delegação, testes, revisão e verificação.
Plano e tarefas DEVEM apontar para uma única especificação vigente, sem documentos
concorrentes que descrevam contratos diferentes. O usuário participa das decisões de
produto por feature; autorizações existentes DEVEM ser preservadas, sem repetição ritual.

### VI. Leitura remota explícita, mínima e privada

O servidor local PODE ler a planilha configurada por meio de conta de serviço própria,
com escopo `https://www.googleapis.com/auth/spreadsheets.readonly` e compartilhamento
como leitora. Para prévias de imagens, também PODE ler arquivos do Drive com o escopo
`https://www.googleapis.com/auth/drive.readonly`. Cada finalidade DEVE solicitar somente
seu escopo de leitura. A conta só acessa o que o autor compartilhar com ela; o escopo
NÃO concede acesso a arquivos não compartilhados. Toda comunicação com o Google DEVE
ocorrer exclusivamente pelo servidor local; o navegador NÃO DEVE acessar o Google
para obter prévias. A chave DEVE permanecer fora do repositório e NÃO DEVE ser enviada ao navegador.
Credenciais, tokens, identificadores privados e dados reais NÃO DEVEM aparecer em arquivos
versionados, testes, comentários ou logs públicos.

Toda leitura direta da planilha DEVE produzir a captura íntegra do contrato vigente, com metadados
antes/depois, duas leituras completas e hashes iguais, e passar pelo mesmo importador
e validação da captura por arquivo. Falha DEVE preservar a última captura válida e sua data.
O caminho de importação da Central DEVE continuar disponível.

A leitura de mídia DEVE resolver o ID interno pela captura vigente, sem aceitar ID do
Drive, URL ou caminho fornecido pelo navegador. Cache de bytes DEVE permanecer local,
privado e fora do versionamento; falha de prévia NÃO DEVE alterar captura, aprovação ou
publicação. Conferir uma prévia não comprova aprovação editorial ou conteúdo do pacote.

Essa capacidade NÃO concede escrita no Google/Drive, fila, n8n ou mídia, NÃO instala agenda
e NÃO transforma o CRM em coordenador. Preparação da conta e compartilhamento exigem ação
do autor; testes DEVEM usar cliente falso e dados sintéticos. O servidor permanece em loopback.

## Limites do produto

- Acesso local: eventual servidor DEVE escutar apenas em loopback, não na rede inteira.
- Dados privados e credenciais NÃO DEVEM entrar no código público, capturas de interface
  compartilhadas ou arquivos de teste. A interface NÃO DEVE receber tokens Google/n8n.
- Referência visual: o protótipo aprovado em `../../docs/design/prototype/`.
  O CRM comercial em `CRM de referência local, caminho configurado fora do repositório` permanece somente referência de leitura.
- Meta futura: uma imagem, um carrossel de 4–6 páginas e um Reels de 15–30 segundos
  por semana, sem Stories. A semana existente com duas imagens DEVE continuar visível.
  Mudar a meta exige migração dos contratos, perfis e consumidores afetados.
- Multimarcas fica para feature futura; não copiar dados de outras marcas como exemplo.
- O projeto `ntv-video-motor`, os executores n8n e a fila editorial existente NÃO DEVEM
  ser alterados por consequência de uma feature apenas de consulta.

## Fluxo de desenvolvimento

1. Conferir a constituição, o `AGENTS.md` local e a fonte vigente da feature.
2. Especificar valor e aceite em `specs/<id>-<nome>/spec.md`.
3. Planejar solução e testes; decompor tarefas rastreáveis à especificação.
4. Implementar a fatia escolhida, com um responsável por arquivo e revisão independente.
5. Verificar os cenários definidos, demonstrar o resultado e registrar limitações reais.
6. Atualizar documentação na mesma mudança antes de avançar para a próxima feature.

## Governance

Esta constituição governa o subprojeto CRM e não concede permissões de operação remota.
Instruções explícitas do usuário e regras superiores prevalecem. Quando este repositório estiver dentro do workspace Social Midia, ../AGENTS.md também se aplica; fora dele, ignore esta referência.

Emendas DEVEM registrar motivo, impacto sobre features e migração quando houver mudança
de contrato. Incrementar major para quebra de princípios, minor para novo princípio e patch
para esclarecimento. Revisões de implementação DEVEM conferir esta constituição e a spec;
um desvio exige justificativa concreta, nunca alteração silenciosa do teste para aceitá-lo.

### Emenda 1.2.0 — leitura de imagens do Drive

O autor aprovou expressamente esta emenda em 2026-10-08, na solicitação da feature 005
“Prévias de imagens”, após condicionar seu início à integração da tarefa 1 (PR #22).
O motivo é permitir consultar imagens já registradas sem transferir credenciais ao
navegador. A expansão do princípio VI autoriza somente leitura pelo servidor local e
exige compartilhamento prévio pelo autor. A explicitação do princípio IV permite as
imagens sintéticas geradas em teste solicitadas pelo autor, sem produção editorial.
Não migra capturas nem autoriza escrita, geração, publicação ou alteração nos agentes.
As features 001–004 mantêm seus contratos;
a 005 define a rota, validação e cache de imagens. A versão minor registra a ampliação
material da capacidade de leitura, preservando os demais princípios.

**Version**: 1.2.0 | **Ratified**: 2026-10-02 | **Last Amended**: 2026-10-08
