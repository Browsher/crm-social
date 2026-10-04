const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,temporario}=require('./fixtures.cjs');
const {lerEstado}=require('../src/snapshot.cjs');
const cli=path.resolve(__dirname,'../scripts/importar-captura.cjs');
function executar(args) {
  if (!fs.existsSync(cli)) return spawnSync(process.execPath,['-e',"process.stderr.write('CLI ainda não implementado'); process.exitCode=70;"],{encoding:'utf8'});
  return spawnSync(process.execPath,[cli,...args],{encoding:'utf8'});
}
test('C01 argumento ausente e URL são recusados antes de qualquer I/O', t => {
  const dir=temporario(t);
  for (const args of [[],['https://exemplo.invalid/captura'],['arquivo','--opcao-inesperada'],['arquivo','--data-dir']]) {
    const r=executar([...args,'--data-dir',dir]);
    assert.notEqual(r.status,0);
    assert.match(r.stderr,/caminho local|argument/);
    assert.equal(r.stdout,'');
    assert.deepEqual(fs.readdirSync(dir),[]);
  }
});
test('C02 arquivo ausente e JSON inválido não despejam células ou caminho', t => {
  const dir=temporario(t), input=path.join(dir,'entrada.json'), data=path.join(dir,'dados');
  const missing=executar([input,'--data-dir',data]);
  assert.notEqual(missing.status,0);
  assert.match(missing.stderr,/arquivo local/);
  fs.writeFileSync(input,'{"texto":"sentinela-nao-publicar"');
  const invalid=executar([input,'--data-dir',data]);
  assert.notEqual(invalid.status,0);
  assert.match(invalid.stderr,/JSON/);
  assert.doesNotMatch(invalid.stderr,/sentinela-nao-publicar/);
  assert.ok(!invalid.stderr.includes(dir));
});
test('C03 CLI real promove, repete sem duplicar e rejeita parcial/conflito', t => {
  const dir=temporario(t), input=path.join(dir,'entrada.json'), data=path.join(dir,'dados'), raw=capturaValida();
  fs.writeFileSync(input,JSON.stringify(raw));
  const accepted=executar([input,'--data-dir',data]);
  assert.equal(accepted.status,0);
  assert.match(accepted.stdout,/captura-sintetica-01.*completa/);
  assert.doesNotMatch(accepted.stdout,/sentinela-nao-publicar|fonte-sintetica/);
  const before=fs.readFileSync(path.join(data,'atual.json'),'utf8');
  assert.match(executar([input,'--data-dir',data]).stdout,/sem_alteracao/);
  assert.equal(fs.readFileSync(path.join(data,'atual.json'),'utf8'),before);
  raw.spreadsheetId='fonte-diferente-sintetica';
  fs.writeFileSync(input,JSON.stringify(raw));
  const conflict=executar([input,'--data-dir',data]);
  assert.notEqual(conflict.status,0);
  assert.match(conflict.stderr,/conflito/);
  assert.equal(lerEstado(data).historico.length,2);
  raw.capturaId='captura-incompleta'; raw.tables.Cenas.complete=false;
  fs.writeFileSync(input,JSON.stringify(raw));
  assert.notEqual(executar([input,'--data-dir',data]).status,0);
  assert.equal(lerEstado(data).captura.envelope.capturaId,'captura-sintetica-01');
});
