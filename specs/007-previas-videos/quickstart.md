# Quickstart — Prévias de vídeos

Como ensaiar com um filme inventado antes de abrir o acervo, os testes abaixo usam apenas fixtures sintéticas, TEMP e portas efêmeras. O roteiro privado é separado das provas versionadas. [Resultados efetivos e pendências](validacao.md).

## Ensaios sintéticos

Usar Node **24.19.0** e configurar `CRM_PLAYWRIGHT_MODULE` para o Playwright já existente; não baixar outra dependência. Em PowerShell, `CRM_NODE_PATH` aponta para esse executável. A partir da raiz do checkout:

```powershell
& $env:CRM_NODE_PATH --test tests/video.test.cjs tests/video-http.test.cjs tests/video-model.test.cjs tests/video-interface.test.cjs
& $env:CRM_NODE_PATH --test tests/midia.test.cjs tests/midia-http.test.cjs tests/google-midia.test.cjs tests/layout-model.test.cjs tests/instagram-interface.test.cjs
& $env:CRM_NODE_PATH tools/quality-gate.mjs
& $env:CRM_NODE_PATH tools/quality-gate.mjs --strict
```

Registrar exit, falhas, pulos, cobertura/complexidade e scanner. Falta de Semgrep não equivale a aprovação estrita; não instalar ferramenta nem alterar baseline para contornar resultado. UI continua exigindo execução local, sem tratar os pulos de CI como demonstração dessa camada.

## Conferência privada no CRM

1. Abrir uma peça com vídeo final e capa confirmados; conferir a capa no cartão/painel e nenhuma requisição de vídeo antes do clique.
2. Clicar **Ver no Instagram**; observar avanço de tempo e usar pausa/busca/volume.
3. Clicar **Tela cheia** e retornar à prévia pelo controle/Escape nativo.
4. Fechar; conferir interrupção e foco no acionador. Reabrir começa do início.
5. Confirmar que o navegador usa somente URLs locais de poster/vídeo; dados/capturas reais não entram no Git.

Cache miss exige acesso Drive readonly pelo servidor. A preparação privada de cache usada na demonstração não cria fallback automático à pasta de vídeos. Bancos com múltiplos arquivos sem final escolhido não são casos de seleção única; não inferir um final por ordem.
