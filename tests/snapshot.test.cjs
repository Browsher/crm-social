const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {capturaValida,temporario,carregarModulo,redefinirHorario,mudarCelula} = require('./fixtures.cjs');
const {promoverCaptura,lerEstado} = carregarModulo('src/snapshot.cjs',['promoverCaptura','lerEstado']);
const clock='2026-10-02T14:00:00Z';
const {capturaMeses}=require('./fixtures.cjs');
test('S003 promove mudança só em Meses, no-op e falha preservam bytes/horário',t=>{
  const dir=temporario(t),raw=capturaMeses();
  assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  const pointer=fs.readFileSync(path.join(dir,'atual.json'));
  assert.equal(promoverCaptura(raw,dir).resultado,'sem_alteracao');
  assert.deepEqual(fs.readFileSync(path.join(dir,'atual.json')),pointer);
  const next=capturaMeses([['2026-10','ntv','Novo objetivo','']]);next.capturaId='meses-nova';
  redefinirHorario(next,'2026-10-02T12:06:00Z','2026-10-02T12:07:00Z');
  assert.equal(promoverCaptura(next,dir).resultado,'completa');
  const file=path.join(dir,'capturas','meses-nova.json'),before=fs.readFileSync(file);
  const bad=capturaMeses();bad.capturaId='meses-parcial';bad.tables.Meses.complete=false;
  assert.equal(promoverCaptura(bad,dir).resultado,'falhou');
  assert.deepEqual(fs.readFileSync(file),before);
  const state=lerEstado(dir);assert.equal(state.captura.envelope.capturaId,'meses-nova');
  assert.equal(state.captura.envelope.completedAt,next.completedAt);assert.equal(state.historico.length,3);
  assert.equal(state.ultimaTentativa.resultado,'falhou');
});
function bytes(dir) {
  return fs.readFileSync(path.join(dir,'atual.json'),'utf8');
}

for(const [aba,campo] of [
  ['Semanas','semana_id'],['Produções','producao_id'],['Páginas','pagina_id'],
  ['Cenas','cena_id'],['Arquivos','arquivo_id'],['Revisoes','revisao_id'],['Páginas','arquivo_imagem_id'],
  ['Semanas','plano_json_arquivo_id']
]) test(`S-fase8-preflight ${aba}.${campo} sensível recusa promoção e conserva vigente`,t=>{
  const dir=temporario(t),vigente=capturaValida();
  assert.equal(promoverCaptura(vigente,dir).resultado,'completa');
  const antiga=path.join(dir,'capturas',vigente.capturaId+'.json'),antes=fs.readFileSync(antiga);
  const candidata=capturaValida();candidata.capturaId='captura-preflight-recusada';
  redefinirHorario(candidata,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
  // Identificador inteiramente sintético, só para exercitar a triagem compartilhada.
  const sensivel='ghp_'+'identificador-ficticio-'.repeat(2);
  mudarCelula(candidata,aba,1,campo,sensivel);
  const receipt=promoverCaptura(candidata,dir),estado=lerEstado(dir);
  assert.equal(receipt.resultado,'falhou');
  assert.ok(receipt.motivoResumo.includes(aba) && receipt.motivoResumo.includes(campo));
  assert.equal(estado.captura.envelope.capturaId,vigente.capturaId);
  assert.equal(estado.captura.envelope.completedAt,vigente.completedAt);
  assert.equal(estado.historico.length,2);
  assert.equal(estado.ultimaTentativa.resultado,'falhou');
  assert.deepEqual(fs.readFileSync(antiga),antes);
  assert.equal(fs.existsSync(path.join(dir,'capturas',candidata.capturaId+'.json')),false);
  assert.ok(!receipt.motivoResumo.includes(sensivel));
});

test('S-fase8-preflight respeita escopo NTV, mínimos e texto livre triável',t=>{
  const raw=capturaValida(),dir=temporario(t),sensivel='ghp_'+'identificador-ficticio-'.repeat(2);
  mudarCelula(raw,'Produções',5,'producao_id',sensivel);
  mudarCelula(raw,'Produções',1,'legenda',sensivel);
  mudarCelula(raw,'Produções',1,'__extra_privado',sensivel);
  mudarCelula(raw,'Arquivos',1,'id_drive',sensivel);
  assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  assert.equal(lerEstado(dir).captura.envelope.capturaId,raw.capturaId);
});

for(const [nome,value] of [
  ['URL com userinfo','https://usuario-preflight:senha-preflight@exemplo.invalid/item'],
  ['string JSON',JSON.stringify({origem:'ghp_'+'identificador-ficticio-'.repeat(2)})]
]) test(`S-fase8-preflight ${nome} em vínculo também é recusado antes da promoção`,t=>{
  const dir=temporario(t),raw=capturaValida();
  mudarCelula(raw,'Páginas',1,'arquivo_imagem_id',value);
  assert.equal(promoverCaptura(raw,dir).resultado,'falhou');
  const state=lerEstado(dir);
  assert.equal(state.captura,null);assert.equal(state.ultimaTentativa.resultado,'falhou');
  assert.ok(!state.ultimaTentativa.motivoResumo.includes(value));
});

test('S-fase8-preflight arquivo exclusivamente semanal sensível não escapa do recorte',t=>{
  const dir=temporario(t),raw=capturaValida();
  mudarCelula(raw,'Arquivos',1,'producao_id','');
  mudarCelula(raw,'Arquivos',1,'arquivo_id','ghp_'+'identificador-ficticio-'.repeat(2));
  assert.equal(promoverCaptura(raw,dir).resultado,'falhou');
  assert.equal(lerEstado(dir).captura,null);
});

for(const [nome,alteracao] of [
  ['motivo objeto',{motivoResumo:{dado:'/home/usuario-sintetico-recibo/privado'}}],
  ['motivo array',{motivoResumo:['dado-sintetico']}],
  ['motivo null',{motivoResumo:null}],
  ['resultado objeto',{resultado:{dado:'sintetico'}}],
  ['resultado não confirmado',{resultado:'sem_alteracao'}],
  ['horário objeto',{concluidaEm:{dado:'sintetico'}}],
  ['horário impossível',{concluidaEm:'2026-02-30T12:00:00Z'}],
  ['identidade diferente',{tentativaId:'tentativa-diferente'}],
  ['captura objeto',{capturaId:{dado:'sintetico'}}],
  ['completa sem captura',{capturaId:null}],
]) test('S-fase8 recibo confirmado recusa '+nome+' sem reescrever o estado',t=>{
  const dir=temporario(t),r=promoverCaptura(capturaValida(),dir);
  const file=path.join(dir,'tentativas',r.tentativaId+'.json'),original=bytes(dir);
  const alterado=JSON.stringify({...r,...alteracao});fs.writeFileSync(file,alterado);
  assert.throws(()=>lerEstado(dir),{message:'persistência: captura ou recibo confirmado ilegível'});
  assert.equal(fs.readFileSync(file,'utf8'),alterado);
  assert.equal(bytes(dir),original);
});

test('S-fase8 recibo confirmado aceita instante com fuso e motivo textual',t=>{
  const dir=temporario(t),r=promoverCaptura(capturaValida(),dir),file=path.join(dir,'tentativas',r.tentativaId+'.json');
  const before={...r,concluidaEm:'2026-10-04T09:00:00-03:00'};fs.writeFileSync(file,JSON.stringify(before));
  assert.deepEqual(lerEstado(dir).ultimaTentativa,before);
});

test('S-review m4 futuro excessivo, empate e captura antiga confirmam falha sem trocar a vigente', t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  const dir=temporario(t),old=capturaValida();
  assert.equal(promoverCaptura(old,dir).resultado,'completa');
  const file=path.join(dir,'capturas',old.capturaId+'.json'),immutable=fs.readFileSync(file,'utf8');
  const casos=[
    ['captura-futura','2026-10-04T12:10:00.001Z',/inválida.*10 minutos/],
    ['captura-empatada',old.completedAt,/desatualizada/],
    ['captura-antiga','2026-10-02T12:04:59Z',/desatualizada/]
  ];
  for(const [id,end,reason] of casos) {
    const raw=capturaValida();raw.capturaId=id;
    redefinirHorario(raw,'2026-10-02T12:00:00Z',end);
    const receipt=promoverCaptura(raw,dir),state=lerEstado(dir);
    assert.equal(receipt.resultado,'falhou');assert.match(receipt.motivoResumo,reason);
    assert.deepEqual(state.ultimaTentativa,receipt);
    assert.equal(state.captura.envelope.capturaId,old.capturaId);
    assert.equal(fs.existsSync(path.join(dir,'capturas',id+'.json')),false);
    assert.equal(fs.readFileSync(file,'utf8'),immutable);
  }
  const pointer=bytes(dir);
  assert.equal(promoverCaptura(old,dir).resultado,'sem_alteracao');
  assert.equal(bytes(dir),pointer);
  assert.equal(lerEstado(dir).historico.length,4);
});

test('S-review m4 aceita limite futuro e leitura posterior não revalida relógio da importação', t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  const dir=temporario(t),raw=capturaValida();
  redefinirHorario(raw,'2026-10-04T12:00:00Z','2026-10-04T12:10:00Z');
  assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  t.mock.timers.setTime(new Date('2026-10-03T12:00:00Z').getTime());
  assert.equal(lerEstado(dir).captura.envelope.completedAt,raw.completedAt);
  assert.equal(promoverCaptura(raw,dir).resultado,'sem_alteracao');
});
test('S01 ausência é estruturada e leitura não escreve', t => {
  const dir=temporario(t), state=lerEstado(dir,clock);
  assert.equal(state.captura,null);
  assert.equal(state.ultimaTentativa,null);
  assert.deepEqual(state.historico,[]);
  assert.deepEqual(fs.readdirSync(dir),[]);
});
test('S03-US2 mesmo conteúdo com novo ID/fim renova captura sem alterar recibos antigos', t => {
  const dir=temporario(t),old=capturaValida();
  promoverCaptura(old,dir);
  const invalid=capturaValida();invalid.tables.Cenas.complete=false;
  promoverCaptura(invalid,dir);
  const failed=lerEstado(dir),pointer=bytes(dir);
  const receiptPath=path.join(dir,'tentativas',failed.ultimaTentativa.tentativaId+'.json');
  const receipt=fs.readFileSync(receiptPath,'utf8');
  assert.equal(promoverCaptura(old,dir).resultado,'sem_alteracao');
  for(let i=0;i<2;i++) {
    const read=lerEstado(dir);
    assert.equal(read.captura.envelope.completedAt,old.completedAt);
    assert.equal(read.ultimaTentativa.resultado,'falhou');
    assert.equal(bytes(dir),pointer);
    assert.equal(fs.readFileSync(receiptPath,'utf8'),receipt);
  }
  const newer=capturaValida();newer.capturaId='captura-horario-novo';
  redefinirHorario(newer,'2026-10-04T11:00:00Z','2026-10-04T11:05:00Z');
  for(const name of Object.keys(old.tables)) assert.deepEqual(newer.tables[name].values,old.tables[name].values);
  assert.equal(promoverCaptura(newer,dir).resultado,'completa');
  const next=lerEstado(dir);
  assert.equal(next.captura.envelope.completedAt,newer.completedAt);
  assert.equal(next.ultimaTentativa.resultado,'completa');
  assert.equal(next.historico.length,3);
  assert.equal(fs.readFileSync(receiptPath,'utf8'),receipt);
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
  redefinirHorario(newer,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
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
  redefinirHorario(next,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
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
  redefinirHorario(raw,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
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
