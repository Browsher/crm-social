const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,temporario,redefinirHorario}=require('./fixtures.cjs');
const snapshot=require('../src/snapshot.cjs');
const {MOTIVOS}=require('../src/google.cjs');
function nova(){const raw=capturaValida();raw.capturaId='direta-sintetica';raw.source='google-sheets-api';redefinirHorario(raw,'2026-10-05T10:00:00Z','2026-10-05T10:01:00Z');return raw;}
test('A01 trava cobre await e impede CLI concorrente; confirma uma promocao',async t=>{
  assert.equal(typeof snapshot.atualizarCaptura,'function');const dir=temporario(t);let release;
  const pending=snapshot.atualizarCaptura(dir,()=>new Promise(r=>{release=r;}));
  assert.ok(fs.existsSync(path.join(dir,'.importacao.lock')));
  assert.throws(()=>snapshot.promoverCaptura(capturaValida(),dir),/importação em andamento/);
  await assert.rejects(snapshot.atualizarCaptura(dir,()=>nova()),/importação em andamento/);
  release(nova());assert.equal((await pending).resultado,'completa');
  assert.equal(snapshot.lerEstado(dir).historico.length,1);assert.equal(fs.existsSync(path.join(dir,'.importacao.lock')),false);
});
test('A02 cleanup separado preserva recibo e aviso fixo; TEMP real',async t=>{
  assert.equal(typeof snapshot.atualizarCaptura,'function');const dir=temporario(t),unlink=fs.unlinkSync;
  t.mock.method(fs,'unlinkSync',file=>{if(file.endsWith('.importacao.lock'))throw new Error('valor-privado-sintetico');return unlink(file);});
  const result=await snapshot.atualizarCaptura(dir,async()=>nova());
  assert.equal(result.resultado,'completa');assert.deepEqual(result.avisos,['falha ao liberar a trava; confira o estado local']);
  fs.unlinkSync.mock.restore();
});
for(const categoria of ['configuracao','acesso','rede','dados'])test('A03 '+categoria+' confirma motivo fixo e preserva bytes/data',async t=>{
  const dir=temporario(t),raw=capturaValida();snapshot.promoverCaptura(raw,dir);
  const file=path.join(dir,'capturas',raw.capturaId+'.json'),bytes=fs.readFileSync(file);
  const result=await snapshot.atualizarCaptura(dir,async()=>{throw Object.assign(new Error('sentinela-privada'),{categoria});});
  assert.equal(result.resultado,'falhou');assert.equal(result.categoria,categoria);assert.equal(result.motivoResumo,MOTIVOS[categoria]);
  const state=snapshot.lerEstado(dir);assert.equal(state.captura.envelope.completedAt,raw.completedAt);assert.deepEqual(fs.readFileSync(file),bytes);
  assert.equal(state.historico.length,2);assert.equal(state.ultimaTentativa.motivoResumo,MOTIVOS[categoria]);
  assert.equal(snapshot.promoverCaptura(raw,dir).resultado,'sem_alteracao');assert.equal(snapshot.lerEstado(dir).ultimaTentativa.resultado,'falhou');
  assert.ok(!JSON.stringify(state).includes('sentinela-privada'));
});
test('A04 I/O nao confirmado e erro sem categoria nao expoem erro bruto',async t=>{
  const dir=temporario(t),raw=capturaValida();snapshot.promoverCaptura(raw,dir);
  const before=fs.readFileSync(path.join(dir,'atual.json'));
  t.mock.method(fs,'renameSync',()=>{throw new Error('sentinela-privada');});
  await assert.rejects(snapshot.atualizarCaptura(dir,async()=>{throw new Error('sentinela-privada');}),e=>e.message==='persistência: falha não pôde ser registrada');
  assert.deepEqual(fs.readFileSync(path.join(dir,'atual.json')),before);
  assert.equal(fs.existsSync(path.join(dir,'.importacao.lock')),false);
});
test('A05 candidata invalida usa categoria dados e motivo fixo',async t=>{
  const dir=temporario(t),raw=nova();raw.tables.Cenas.complete=false;
  const result=await snapshot.atualizarCaptura(dir,async()=>raw);
  assert.equal(result.categoria,'dados');assert.equal(result.motivoResumo,MOTIVOS.dados);
  assert.equal(snapshot.lerEstado(dir).captura,null);
});
test('A06 I/O na candidata direta nao confirma categoria dados nem recibo falso',async t=>{
  const dir=temporario(t),raw=capturaValida();snapshot.promoverCaptura(raw,dir);
  const before=fs.readFileSync(path.join(dir,'atual.json')),open=fs.openSync;
  t.mock.method(fs,'openSync',(file,...args)=>{
    if(typeof file==='string'&&file===path.join(dir,'capturas',nova().capturaId+'.json'))throw Object.assign(new Error('sentinela-privada'),{code:'ENOSPC'});
    return open(file,...args);
  });
  await assert.rejects(snapshot.atualizarCaptura(dir,async()=>nova()),e=>e.message==='persistência: falha não pôde ser registrada'&&e.categoria===undefined);
  assert.deepEqual(fs.readFileSync(path.join(dir,'atual.json')),before);
  assert.equal(snapshot.lerEstado(dir).historico.length,1);assert.equal(snapshot.lerEstado(dir).captura.envelope.completedAt,raw.completedAt);
});

test('A07 recusa temporal direta confirma motivo proprio e preserva vigente',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-05T12:00:00Z')});
  const dir=temporario(t),vigente=capturaValida();
  redefinirHorario(vigente,'2026-10-05T12:00:00Z','2026-10-05T12:05:00Z');
  snapshot.promoverCaptura(vigente,dir);
  const file=path.join(dir,'capturas',vigente.capturaId+'.json'),bytes=fs.readFileSync(file);
  for(const [fim,mensagem] of [
    ['2026-10-05T12:00:00Z','Captura desatualizada; a vigente foi preservada'],
    ['2026-10-05T12:11:00Z','Horário da captura mais de 10 minutos no futuro']
  ]){
    const raw=nova();raw.capturaId+='-'+fim.slice(14,16);
    redefinirHorario(raw,'2026-10-05T11:59:00Z',fim);
    const result=await snapshot.atualizarCaptura(dir,async()=>raw);
    assert.equal(result.resultado,'falhou');assert.equal(result.categoria,'dados');
    assert.equal(result.motivoResumo,mensagem);
    const state=snapshot.lerEstado(dir);
    assert.equal(state.ultimaTentativa.motivoResumo,mensagem);
    assert.equal(state.captura.envelope.completedAt,vigente.completedAt);
    assert.equal(state.estado.capturaId,vigente.capturaId);
    assert.deepEqual(fs.readFileSync(file),bytes);
    assert.equal(fs.existsSync(path.join(dir,'capturas',raw.capturaId+'.json')),false);
  }
});
