const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {capturaValida,temporario,carregarModulo} = require('./fixtures.cjs');
const {promoverCaptura,lerEstado} = carregarModulo('src/snapshot.cjs',['promoverCaptura','lerEstado']);
const clock='2026-10-02T14:00:00Z';
function bytes(dir) {
  return fs.readFileSync(path.join(dir,'atual.json'),'utf8');
}
test('S01 ausência é estruturada e leitura não escreve', t => {
  const dir=temporario(t), state=lerEstado(dir,clock);
  assert.equal(state.captura,null);
  assert.equal(state.ultimaTentativa,null);
  assert.deepEqual(state.historico,[]);
  assert.deepEqual(fs.readdirSync(dir),[]);
});
test('S02 promove captura/recibo antes de confirmar; mesmos bytes não duplicam', t => {
  const dir=temporario(t), raw=capturaValida();
  assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  const before=bytes(dir), state=lerEstado(dir,clock);
  assert.equal(state.captura.envelope.capturaId,raw.capturaId);
  assert.equal(state.historico.length,1);
  const receiptPath=path.join(dir,'tentativas',state.historico[0].tentativaId+'.json');
  const receipt=fs.readFileSync(receiptPath,'utf8');
  assert.equal(promoverCaptura(raw,dir).resultado,'sem_alteracao');
  assert.equal(bytes(dir),before);
  assert.equal(fs.readFileSync(receiptPath,'utf8'),receipt);
});
test('S02 repetição antiga não volta a captura vigente nem encerra falha posterior', t => {
  const dir=temporario(t), old=capturaValida(), newer=capturaValida();
  promoverCaptura(old,dir);
  newer.capturaId='captura-sintetica-02';
  promoverCaptura(newer,dir);
  const invalid=capturaValida(); invalid.tables.Cenas.complete=false;
  assert.equal(promoverCaptura(invalid,dir).resultado,'falhou');
  const state=lerEstado(dir,clock), before=bytes(dir);
  assert.equal(state.ultimaTentativa.resultado,'falhou');
  assert.equal(promoverCaptura(old,dir).resultado,'sem_alteracao');
  assert.equal(bytes(dir),before);
  assert.equal(lerEstado(dir,clock).captura.envelope.capturaId,newer.capturaId);
});
test('S03 parcial e conflito conservam bytes e captura anterior', t => {
  const dir=temporario(t), raw=capturaValida();
  promoverCaptura(raw,dir);
  const immutable=fs.readFileSync(path.join(dir,'capturas',raw.capturaId+'.json'),'utf8');
  const other=structuredClone(raw); other.spreadsheetId='outra-fonte-sintetica';
  assert.equal(promoverCaptura(other,dir).resultado,'falhou');
  assert.match(lerEstado(dir,clock).ultimaTentativa.motivoResumo,/conflito/);
  const partial=capturaValida(); partial.tables.Cenas.complete=false;
  assert.equal(promoverCaptura(partial,dir).resultado,'falhou');
  const state=lerEstado(dir,clock);
  assert.equal(state.historico.length,3);
  assert.equal(state.captura.envelope.completedAt,raw.completedAt);
  assert.equal(fs.readFileSync(path.join(dir,'capturas',raw.capturaId+'.json'),'utf8'),immutable);
});
test('S03 falha anterior à primeira captura mantém null e recibo confirmado', t => {
  const dir=temporario(t), raw=capturaValida();
  raw.capturaId='../segredo';
  assert.equal(promoverCaptura(raw,dir).resultado,'falhou');
  const state=lerEstado(dir,clock);
  assert.equal(state.captura,null);
  assert.equal(state.historico[0].capturaId,null);
  assert.equal(state.historico[0].resultado,'falhou');
});
test('S04 interrupção antes do estado deixa recibo órfão e retry promove de verdade', t => {
  const dir=temporario(t), raw=capturaValida();
  promoverCaptura(raw,dir);
  const next=capturaValida(); next.capturaId='captura-sintetica-02';
  const rename=fs.renameSync;
  t.mock.method(fs,'renameSync',(from,to)=>{
    if (to===path.join(dir,'atual.json')) throw Object.assign(new Error('falha sintética'),{code:'EIO'});
    return rename(from,to);
  });
  assert.throws(() => promoverCaptura(next,dir),/persistência.*não.*registrada/);
  fs.renameSync.mock.restore();
  const orphans=fs.readdirSync(path.join(dir,'tentativas'));
  assert.deepEqual(fs.readdirSync(dir).filter(f=>/^atual-.*\.tmp$/.test(f)),[]);
  const old=lerEstado(dir,clock);
  assert.equal(old.captura.envelope.capturaId,raw.capturaId);
  assert.equal(old.historico.length,1);
  assert.ok(orphans.length>1);
  const receiptBytes=orphans.map(f=>fs.readFileSync(path.join(dir,'tentativas',f),'utf8'));
  assert.equal(promoverCaptura(next,dir).resultado,'completa');
  const state=lerEstado(dir,clock);
  assert.equal(state.captura.envelope.capturaId,next.capturaId);
  assert.equal(state.historico.length,2);
  orphans.forEach((f,i)=>assert.equal(fs.readFileSync(path.join(dir,'tentativas',f),'utf8'),receiptBytes[i]));
});
test('S04 uma falha de promoção recuperável confirma falha, sem promover nova captura', t => {
  const dir=temporario(t), old=capturaValida();
  promoverCaptura(old,dir);
  const raw=capturaValida(); raw.capturaId='captura-sintetica-02';
  const rename=fs.renameSync;
  let failed=false;
  t.mock.method(fs,'renameSync',(from,to)=>{
    if (to===path.join(dir,'atual.json') && !failed) { failed=true; throw new Error('falha sintética'); }
    return rename(from,to);
  });
  assert.equal(promoverCaptura(raw,dir).resultado,'falhou');
  fs.renameSync.mock.restore();
  const state=lerEstado(dir,clock);
  assert.deepEqual(fs.readdirSync(dir).filter(f=>/^atual-.*\.tmp$/.test(f)),[]);
  assert.equal(state.captura.envelope.capturaId,old.capturaId);
  assert.equal(state.ultimaTentativa.resultado,'falhou');
  assert.equal(state.historico.length,2);
});
test('S04 armazenamento indisponível dá erro explícito sem fabricar durabilidade', t => {
  const dir=temporario(t), blocked=path.join(dir,'arquivo');
  fs.writeFileSync(blocked,'obstáculo sintético');
  assert.throws(() => promoverCaptura(capturaValida(),blocked),/persistência.*não.*registrada/);
  assert.equal(fs.readFileSync(blocked,'utf8'),'obstáculo sintético');
});

function falharLiberacao(t,dir,{close=false,unlink=false}) {
  const open=fs.openSync, fechar=fs.closeSync, remover=fs.unlinkSync;
  const lock=path.join(dir,'.importacao.lock');
  let lockFd;
  t.mock.method(fs,'openSync',(file,...args)=>{
    const fd=open(file,...args);
    if (file===lock) lockFd=fd;
    return fd;
  });
  t.mock.method(fs,'closeSync',fd=>{
    fechar(fd);
    if (close && fd===lockFd) throw new Error('falha sintética de fechamento');
  });
  t.mock.method(fs,'unlinkSync',file=>{
    if (unlink && file===lock) throw new Error('falha sintética de remoção');
    return remover(file);
  });
}
test('S-review M1 close falha, mas unlink é tentado e o recibo completo é preservado', t => {
  const dir=temporario(t);
  falharLiberacao(t,dir,{close:true});
  const result=promoverCaptura(capturaValida(),dir);
  assert.equal(result.resultado,'completa');
  assert.ok(result.avisos.some(a=>a.includes('trava')));
  assert.equal(fs.existsSync(path.join(dir,'.importacao.lock')),false);
  assert.equal(lerEstado(dir).ultimaTentativa.resultado,'completa');
});
test('S-review M1 unlink falha sem transformar o recibo de validação em erro da trava', t => {
  const dir=temporario(t), raw=capturaValida();
  raw.tables.Cenas.complete=false;
  falharLiberacao(t,dir,{unlink:true});
  const result=promoverCaptura(raw,dir);
  assert.equal(result.resultado,'falhou');
  assert.equal(result.motivoResumo,'Cenas complete: inválido');
  assert.ok(result.avisos.some(a=>a.includes('trava')));
  assert.equal(fs.existsSync(path.join(dir,'.importacao.lock')),true);
  assert.equal(lerEstado(dir).ultimaTentativa.motivoResumo,result.motivoResumo);
});
test('S-review M1 erros de close/unlink não substituem o erro original da operação', t => {
  const dir=temporario(t);
  fs.writeFileSync(path.join(dir,'atual.json'),'JSON sintético inválido');
  falharLiberacao(t,dir,{close:true,unlink:true});
  assert.throws(()=>promoverCaptura(capturaValida(),dir),e=>{
    assert.equal(e.message,'persistência: falha não pôde ser registrada');
    assert.ok(e.avisos.some(a=>a.includes('trava')));
    return true;
  });
  assert.equal(fs.readFileSync(path.join(dir,'atual.json'),'utf8'),'JSON sintético inválido');
});
