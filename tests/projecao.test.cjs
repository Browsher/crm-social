const {test}=require('node:test');
const assert=require('node:assert/strict');
const {capturaValida,mapaQuadroValido,temporario,carregarModulo,mudarCelula}=require('./fixtures.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {projetarVisao}=carregarModulo('src/projecao.cjs',['projetarVisao']);
const NOW='2026-10-02T14:00:00Z';
const envelope=['schemaVersion','estado','selo','fonte','captura','ultimaTentativa','semanas','producoes','dias','quadro','planilha','historico','avisos'].sort();
function estado(raw,t) { const dir=temporario(t); promoverCaptura(raw,dir); return lerEstado(dir,NOW); }

test('P-base conserva NTV uma vez, exclui outra marca sem filtro de elegibilidade', t => {
  const raw=capturaValida();
  mudarCelula(raw,'Produções',1,'status','concluida');
  mudarCelula(raw,'Produções',2,'estado_liberacao','bloqueado');
  const result=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(result.producoes.map(p=>p.producao_id).sort(),['peca-1','peca-2','peca-3','peca-4']);
  assert.equal(new Set(result.producoes.map(p=>p.producao_id)).size,4);
  assert.equal(result.producoes[1].slot,'imagem_b');
  assert.equal(result.producoes[1].estado_liberacao,'bloqueado');
});
test('P-base envelope público não expõe metadados, hashes, extras ou mapa bruto', t => {
  const result=projetarVisao(estado(capturaValida(),t),NOW,mapaQuadroValido());
  assert.deepEqual(Object.keys(result).sort(),envelope);
  const bytes=JSON.stringify(result);
  for (const sentinel of ['sentinela-nao-publicar','spreadsheetId','metadataBefore','secondReadSha256','__extra_privado','liberacaoPronta','google-drive-connector']) {
    assert.ok(!bytes.includes(sentinel),sentinel);
  }
  assert.deepEqual(Object.keys(result.captura).sort(),['capturaId','completedAt','contagens','periodo'].sort());
});
test('P-base sem captura não cria demonstração e conserva Histórico permitido', t => {
  const dir=temporario(t), raw=capturaValida();
  raw.tables.Cenas.complete=false;
  promoverCaptura(raw,dir);
  const result=projetarVisao(lerEstado(dir,NOW),NOW,mapaQuadroValido());
  assert.equal(result.estado,'sem_captura');
  assert.equal(result.captura,null);
  assert.deepEqual(result.producoes,[]);
  assert.deepEqual(result.semanas,[]);
  assert.equal(result.historico.length,1);
  assert.deepEqual(Object.keys(result.historico[0]).sort(),['tentativaId','concluidaEm','resultado','motivoResumo'].sort());
  assert.deepEqual(Object.keys(result.ultimaTentativa).sort(),Object.keys(result.historico[0]).sort());
});
test('P-base saída é independente do estado privado, sem alterar entrada', t => {
  const input=estado(capturaValida(),t), before=JSON.stringify(input);
  const result=projetarVisao(input,NOW,mapaQuadroValido());
  result.producoes[0].titulo='mudança somente na projeção';
  assert.equal(JSON.stringify(input),before);
});
test('P-base célula mínima com token/caminho indevido é suprimida com aviso', t => {
  const raw=capturaValida(), token='sk-ant-'+'a'.repeat(30), localPath='C:'+String.fromCharCode(92)+'Users'+String.fromCharCode(92)+'exemplo';
  mudarCelula(raw,'Produções',1,'legenda',token);
  mudarCelula(raw,'Semanas',1,'tema',localPath);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.ok(!JSON.stringify(view).includes(token));
  assert.ok(!JSON.stringify(view).includes(localPath));
  assert.equal(view.producoes[0].legenda,'[conteúdo suprimido]');
  assert.ok(view.avisos.some(a=>a.campo==='legenda'));
  assert.ok(view.avisos.some(a=>a.campo==='tema'));
});
