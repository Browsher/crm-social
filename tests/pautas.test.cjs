const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {capturaValida,capturaMeses,recalcularHashes,mudarCelula,adicionarRegistro,mapaQuadroValido,temporario,redefinirHorario}=require('./fixtures.cjs');
const {capturaPautas,adicionarPautas,camposPautas}=require('./pautas-fixtures.cjs');
const {validarCaptura,hashCelulas,CAMPOS}=require('../src/captura.cjs');
const {projetarVisao}=require('../src/projecao.cjs');
const {coletarCaptura}=require('../src/coleta.cjs');
const {promoverCaptura,lerEstado,atualizarCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const clock='2026-10-07T12:00:00Z';
const view=raw=>projetarVisao({captura:validarCaptura(raw),historico:[],ultimaTentativa:null},clock,mapaQuadroValido());
function fake(raw,mutate=()=>{}) {
  let metas=0,reads=0;const calls=[];
  return {calls,spreadsheetId:raw.spreadsheetId,
    async getMetadata(){calls.push('meta');const r={spreadsheetId:raw.spreadsheetId,properties:{timeZone:'UTC'},sheets:Object.entries(raw.metadataBefore).map(([title,m])=>({properties:{title,sheetId:m.sheetId,gridProperties:m}}))};mutate(r,'meta',++metas);return r;},
    async batchGet(ranges){calls.push('batch');assert.equal(ranges.length,Object.keys(raw.tables).length);const r={spreadsheetId:raw.spreadsheetId,valueRanges:Object.values(raw.tables).map((tab,i)=>({range:ranges[i],majorDimension:'ROWS',values:structuredClone(tab.values)}))};mutate(r,'batch',++reads);return r;}
  };
}
test('P004 opcionais independentes e hashes literais legados',()=>{
  assert.equal(hashCelulas(capturaValida().tables),'f5ba75b762461e8e84c6b6e83696c0d1685761813f7992b5c875f8c57297e87a');
  assert.equal(hashCelulas(capturaMeses().tables),'640108f094a950f7df367f85ae2961ead46b4d56af99a202204f9da7d94f81f0');
  assert.equal(CAMPOS.Semanas.length,8);
  for(const mensal of [false,true]) for(const pautas of [false,true]) {
    const raw=mensal?capturaMeses():capturaValida();if(pautas)adicionarPautas(raw,[]);
    const visao=view(raw);assert.equal(Object.hasOwn(visao,'pautas'),pautas);
    assert.equal(visao.planilha.length,6+Number(mensal)+Number(pautas));
    assert.equal(Object.hasOwn(visao.semanas[0],'pauta_id'),false);assert.equal(Object.hasOwn(visao.semanas[0],'pautaOrigem'),false);
    if(pautas)assert.deepEqual(visao.pautas,[]);
  }
});
test('P004 quatro pautas e vínculo exato preservam IDs opacos e mínimos',()=>{
  const raw=capturaPautas(),id='opaque pauta: α/02';
  mudarCelula(raw,'Pautas',2,'pauta_id',id);mudarCelula(raw,'Semanas',1,'pauta_id',id);
  const visao=view(raw);assert.equal(visao.pautas.length,4);assert.deepEqual(Object.keys(visao.pautas[0]),camposPautas);
  assert.equal(visao.semanas[0].pautaOrigem.pauta_id,id);assert.equal(visao.semanas[0].pautaOrigem.origem,'autor');
  assert.deepEqual(visao.planilha.at(-1).cabecalhos,camposPautas);
  assert.equal(visao.planilha[0].cabecalhos.at(-1),'pauta_id');assert.doesNotMatch(JSON.stringify(visao),/sentinela-nao-publicar|spreadsheetId/);
});
for(const [campo,value] of [['pauta_id',''],['pauta_id',42],['mes','2026-13'],['mes','0000-11'],['mes',46300],['semana','2'],['semana',0],['semana',5],['semana',2.5],['inicio_semana','2026-02-30'],['inicio_semana','2026-11-10'],['inicio_semana','2026-12-09'],['inicio_semana','2026-11-30']]) {
  test('P004 inválido '+campo+' '+value+' permanece conferível sem origem',()=>{
    const raw=capturaPautas();mudarCelula(raw,'Pautas',2,campo,value);
    const v=view(raw);assert.equal(v.pautas.length,3);assert.equal(v.semanas[0].pautaOrigem,null);
    assert.equal(v.planilha.at(-1).linhas[1][campo],value);
    assert.ok(v.avisos.some(a=>a.aba==='Pautas'&&a.linha===3&&a.campo===campo));
  });
}
for(const [mes,semana,campos] of [['2026-13',2,['mes']],['2026-11',5,['semana']],['2026-13',5,['mes','semana']]]) {
  test('P004 review calendário inválido '+mes+' S'+semana+' não acusa início por cascata',()=>{
    const raw=capturaPautas();mudarCelula(raw,'Pautas',2,'mes',mes);mudarCelula(raw,'Pautas',2,'semana',semana);
    const v=view(raw);assert.equal(v.pautas.length,3);assert.equal(v.semanas[0].pautaOrigem,null);
    const avisos=v.avisos.filter(a=>a.aba==='Pautas'&&a.linha===3);
    assert.deepEqual(avisos.map(a=>a.campo),campos);
    assert.equal(v.planilha.at(-1).linhas[1].inicio_semana,'2026-11-09');
  });
}
for(const tipo of ['id','inicio']) test('P004 conflito '+tipo+' exclui todas as linhas sem escolher primeira',()=>{
  const raw=capturaPautas();raw.tables.Pautas.values.splice(1,0,[]);
  if(tipo==='id')mudarCelula(raw,'Pautas',2,'pauta_id','pauta-novembro-2');
  else {mudarCelula(raw,'Pautas',2,'inicio_semana','2026-11-09');mudarCelula(raw,'Pautas',2,'semana',2);}
  const v=view(raw);assert.equal(v.pautas.length,2);assert.equal(v.semanas[0].pautaOrigem,null);
  for(const linha of [3,4])assert.ok(v.avisos.some(a=>a.aba==='Pautas'&&a.linha===linha&&/repetid/.test(a.motivo)));
});
for(const [tipo,id] of [['vazio',''],['espaços','   '],['número',42],['booleano',false]]) {
  test('P004 review IDs inválidos repetidos '+tipo+' avisam somente identidade inválida',()=>{
    const raw=capturaPautas();
    for(const row of [1,2])mudarCelula(raw,'Pautas',row,'pauta_id',id);
    const v=view(raw);assert.equal(v.pautas.length,2);assert.equal(v.semanas[0].pautaOrigem,null);
    for(const linha of [2,3]) {
      const avisos=v.avisos.filter(a=>a.aba==='Pautas'&&a.linha===linha&&a.campo==='pauta_id');
      assert.deepEqual(avisos.map(a=>a.motivo),['Identidade da pauta inválida']);
    }
    assert.equal(v.planilha.at(-1).linhas[0].pauta_id,id);
  });
}
test('P004 review ID opaco conserva espaços sem fundir identidades distintas',()=>{
  const raw=capturaPautas(),id=' pauta-novembro-2 ';
  mudarCelula(raw,'Pautas',1,'pauta_id',id);
  const v=view(raw);assert.equal(v.pautas.length,4);assert.equal(v.pautas[0].pauta_id,id);
  assert.equal(v.semanas[0].pautaOrigem.pauta_id,'pauta-novembro-2');
  assert.equal(v.avisos.some(a=>a.aba==='Pautas'&&a.campo==='pauta_id'),false);
});
for(const [tipo,inicio] of [['vazio',''],['número',46300],['impossível','2026-02-30'],['não canônico','2026-11-9'],['timestamp','2026-11-09T00:00:00Z']]) {
  test('P004 review inícios inválidos repetidos '+tipo+' avisam somente calendário inválido',()=>{
    const raw=capturaPautas();
    for(const row of [1,2])mudarCelula(raw,'Pautas',row,'inicio_semana',inicio);
    const v=view(raw);assert.equal(v.pautas.length,2);assert.equal(v.semanas[0].pautaOrigem,null);
    for(const linha of [2,3]) {
      const avisos=v.avisos.filter(a=>a.aba==='Pautas'&&a.linha===linha&&a.campo==='inicio_semana');
      assert.deepEqual(avisos.map(a=>a.motivo),['Início incompatível com a segunda-feira ordinal do mês']);
    }
    assert.equal(v.planilha.at(-1).linhas[0].inicio_semana,inicio);
  });
}
test('P004 review data canônica duplicada com mês inválido impede confirmar ambas',()=>{
  const raw=capturaPautas();mudarCelula(raw,'Pautas',1,'inicio_semana','2026-11-09');mudarCelula(raw,'Pautas',1,'mes','mês inválido');
  const v=view(raw);assert.equal(v.pautas.length,2);assert.equal(v.semanas[0].pautaOrigem,null);
  for(const linha of [2,3])assert.ok(v.avisos.some(a=>a.aba==='Pautas'&&a.linha===linha&&a.campo==='inicio_semana'&&a.motivo==='Marca e início repetidos'));
});
test('P004 duplicata inválida também impede confirmação da pauta válida',()=>{
  for(const campo of ['pauta_id','inicio_semana']) {
    const raw=capturaPautas();mudarCelula(raw,'Pautas',1,campo,campo==='pauta_id'?'pauta-novembro-2':'2026-11-09');
    mudarCelula(raw,'Pautas',1,'semana',99);
    const v=view(raw);assert.equal(v.pautas.length,2);assert.equal(v.semanas[0].pautaOrigem,null);
  }
});
test('P004 textos desconhecidos preservados, tipos avisados, redação e marca isolada',()=>{
  const raw=capturaPautas();
  for(const c of ['modelo_carrossel','origem','status'])mudarCelula(raw,'Pautas',2,c,'desconhecido-sintetico');
  mudarCelula(raw,'Pautas',2,'tema',false);mudarCelula(raw,'Pautas',2,'observacao','Texto https://user:password@example.invalid/path fim <b>literal</b>');
  adicionarRegistro(raw,'Pautas',{pauta_id:'outra',marca_id:'outra-marca',tema:'nunca-publicar'});
  const v=view(raw);assert.equal(v.pautas.length,4);assert.equal(v.planilha.at(-1).linhas.length,4);
  for(const c of ['modelo_carrossel','origem','status','tema'])assert.ok(v.avisos.some(a=>a.aba==='Pautas'&&a.campo===c));
  assert.equal(v.pautas[1].observacao,'Texto [conteúdo suprimido] fim <b>literal</b>');assert.doesNotMatch(JSON.stringify(v),/password|nunca-publicar/);
});
test('P004 identidade igual em outra marca não interfere no vínculo NTV',()=>{
  const raw=capturaPautas();adicionarRegistro(raw,'Pautas',{pauta_id:'pauta-novembro-2',marca_id:'outra',mes:'2026-11',semana:2,inicio_semana:'2026-11-09',tema:'privado-outra-marca'});
  const v=view(raw);assert.equal(v.pautas.length,4);assert.equal(v.semanas[0].pautaOrigem.pauta_id,'pauta-novembro-2');assert.doesNotMatch(JSON.stringify(v),/privado-outra-marca/);
});
for(const tipo of ['vazio','orfa','outra-marca','data','sem-aba','tipo'])test('P004 ponteiro '+tipo+' não infere vínculo',()=>{
  const raw=capturaPautas();
  if(tipo==='vazio')mudarCelula(raw,'Semanas',1,'pauta_id','');
  if(tipo==='orfa')mudarCelula(raw,'Semanas',1,'pauta_id','ausente');
  if(tipo==='tipo')mudarCelula(raw,'Semanas',1,'pauta_id',2);
  if(tipo==='outra-marca')mudarCelula(raw,'Pautas',2,'marca_id','outra-marca');
  if(tipo==='data')mudarCelula(raw,'Semanas',1,'inicio_semana','2026-11-16');
  if(tipo==='sem-aba'){delete raw.tables.Pautas;delete raw.metadataBefore.Pautas;delete raw.metadataAfter.Pautas;recalcularHashes(raw);}
  const v=view(raw);assert.equal(v.semanas[0].pautaOrigem,null);
  assert.equal(v.avisos.some(a=>a.aba==='Semanas'&&a.campo==='pauta_id'),tipo!=='vazio');
});
test('P004 calendário enésima segunda-feira incluindo ano bissexto e mês cruzado',()=>{
  const raw=adicionarPautas(capturaValida(),[
    {pauta_id:'bissexto',marca_id:'ntv',mes:'2024-02',semana:4,inicio_semana:'2024-02-26'},
    {pauta_id:'segunda',marca_id:'ntv',mes:'2026-06',semana:1,inicio_semana:'2026-06-01'}]);
  assert.equal(view(raw).pautas.length,2);
});
test('P004 coleta converte só semana canônica e data declarada antes dos hashes',async()=>{
  for(const mensal of [false,true]) {
    const raw=capturaPautas();if(!mensal){delete raw.tables.Meses;delete raw.metadataBefore.Meses;delete raw.metadataAfter.Meses;}
    mudarCelula(raw,'Pautas',2,'semana','2');mudarCelula(raw,'Pautas',2,'inicio_semana',(Date.parse('2026-11-09')-Date.parse('1899-12-30'))/86400000);
    mudarCelula(raw,'Pautas',1,'semana','01');mudarCelula(raw,'Pautas',3,'mes',46300);
    const client=fake(raw),capturada=await coletarCaptura(client,{now:()=>new Date(clock)}),c=validarCaptura(capturada);
    assert.equal(c.pautas[1].semana,2);assert.equal(c.pautas[1].inicio_semana,'2026-11-09');assert.equal(c.pautas[0].semana,'01');assert.equal(c.pautas[2].mes,46300);
    assert.equal(capturada.firstReadSha256,hashCelulas(capturada.tables));assert.deepEqual(client.calls,['meta','batch','batch','meta']);
  }
});
for(const tipo of ['remocao','criacao','metadata','batch','range','header','incompleta','hash'])test('P004 recusa captura inconsistente '+tipo,async()=>{
  const raw=tipo==='criacao'?capturaMeses():capturaPautas();
  if(tipo==='incompleta'){raw.tables.Pautas.complete=false;assert.throws(()=>validarCaptura(raw),/Pautas complete/);return;}
  if(tipo==='hash'){raw.tables.Pautas.values[1][5]='alterada';assert.throws(()=>validarCaptura(raw),/hash/);return;}
  const client=fake(raw,(r,k,n)=>{
    if(k==='meta'&&n===2&&tipo==='remocao')r.sheets.pop();
    if(k==='meta'&&n===2&&tipo==='criacao')r.sheets.push({properties:{title:'Pautas',sheetId:7,gridProperties:{rowCount:20,columnCount:12}}});
    if(k==='meta'&&n===2&&tipo==='metadata')r.sheets.at(-1).properties.sheetId++;
    if(k==='batch'&&n===2&&tipo==='batch')r.valueRanges.at(-1).values[1][5]='diferente';
    if(k==='batch'&&tipo==='range')r.valueRanges.at(-1).range="'Pautas'!A1:L19";
    if(k==='batch'&&tipo==='header')r.valueRanges.at(-1).values[0][5]='outro';
  });
  await assert.rejects(()=>coletarCaptura(client),{categoria:'dados'});
  if(['remocao','criacao','metadata','batch'].includes(tipo))assert.deepEqual(client.calls,['meta','batch','batch','meta']);
});
test('P004 cabeçalhos reordenados/extras e coluna opcional com Semanas vazia',()=>{
  const raw=capturaPautas(),table=raw.tables.Pautas;
  table.values[0].push('__extra');for(const row of table.values.slice(1))row.push('privado-nao-projetar');
  raw.metadataBefore.Pautas.columnCount=13;raw.metadataAfter.Pautas.columnCount=13;table.range='A1:M20';
  table.values=table.values.map(row=>row.slice().reverse());table.values.splice(1,0,[]);recalcularHashes(raw);
  const v=view(raw);assert.equal(v.pautas[1].semana,2);assert.doesNotMatch(JSON.stringify(v),/privado-nao-projetar/);
  raw.tables.Semanas.values=raw.tables.Semanas.values.slice(0,1);recalcularHashes(raw);
  assert.equal(view(raw).planilha[0].cabecalhos.at(-1),'pauta_id');
});
test('P004 promoção preserva bytes, no-op/falha e aceita mudança somente em pauta',t=>{
  const dir=temporario(t),raw=capturaPautas();assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  const file=path.join(dir,'capturas',raw.capturaId+'.json'),antes=fs.readFileSync(file);
  const bad=structuredClone(raw);bad.tables.Pautas.complete=false;assert.equal(promoverCaptura(bad,dir).resultado,'falhou');
  assert.equal(promoverCaptura(raw,dir).resultado,'sem_alteracao');assert.equal(lerEstado(dir).ultimaTentativa.resultado,'falhou');assert.deepEqual(fs.readFileSync(file),antes);
  const next=structuredClone(raw);next.capturaId='pautas-mudanca';redefinirHorario(next,'2026-10-03T12:00:00Z','2026-10-03T12:05:00Z');mudarCelula(next,'Pautas',1,'tema','Mudou');
  assert.equal(promoverCaptura(next,dir).resultado,'completa');assert.equal(lerEstado(dir).captura.pautas[0].tema,'Mudou');
});
for(const aba of ['Pautas','Semanas'])test('P004 identidade sensível '+aba+' recusa promoção e leitura sem eco',t=>{
  const dir=temporario(t),raw=capturaPautas();assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  const secret='https://user:password@example.invalid/id';mudarCelula(raw,aba,1,'pauta_id',secret);
  const receipt=promoverCaptura(raw,dir);assert.equal(receipt.resultado,'falhou');assert.doesNotMatch(receipt.motivoResumo,/password/);
  assert.match(receipt.motivoResumo,new RegExp(aba+' linha 2 pauta_id'));
  assert.throws(()=>view(raw),/Identidade/);
  const file=path.join(dir,'capturas',raw.capturaId+'.json');fs.writeFileSync(file,JSON.stringify(raw));
  const before=fs.readFileSync(path.join(dir,'atual.json'));assert.throws(()=>projetarVisao(lerEstado(dir),clock,mapaQuadroValido()),/Identidade/);
  assert.deepEqual(fs.readFileSync(path.join(dir,'atual.json')),before);
});
test('P004 CLI importa arquivo com Pautas e sem reserializar arquivo de entrada',t=>{
  const dir=temporario(t),file=path.join(dir,'entrada.json'),dataDir=path.join(dir,'estado');
  const body=JSON.stringify(capturaPautas(),null,2);fs.writeFileSync(file,body);
  const r=spawnSync(process.execPath,[path.resolve(__dirname,'../scripts/importar-captura.cjs'),file,'--data-dir',dataDir],{encoding:'utf8'});
  assert.equal(r.status,0,r.stderr);assert.equal(lerEstado(dataDir).captura.pautas.length,4);assert.equal(fs.readFileSync(file,'utf8'),body);
});
test('P004 HTTP POST protegido coleta Pautas, GET sem rede e falha mantém vigente',async t=>{
  const dir=temporario(t),dataDir=path.join(dir,'estado'),config=path.join(dir,'mapa.json');fs.writeFileSync(config,JSON.stringify(mapaQuadroValido()));
  let invalid=false;const client=fake(capturaPautas(),(r,k)=>{if(invalid&&k==='batch')r.valueRanges.at(-1).values[0][0]='invalido';});
  const server=criarServidor({dataDir,webDir:path.resolve(__dirname,'../src/web'),port:0,quadroConfigPath:config,atualizar:()=>atualizarCaptura(dataDir,()=>coletarCaptura(client))});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url='http://127.0.0.1:'+server.address().port,post=()=>fetch(url+'/api/atualizar',{method:'POST',headers:{Origin:url,'Content-Type':'application/json'},body:'{}'});
  assert.equal((await fetch(url+'/api/atualizar',{method:'POST'})).status,403);assert.equal(client.calls.length,0);
  assert.equal((await post()).status,200);const v=await (await fetch(url+'/api/visao')).json();assert.equal(v.pautas.length,4);assert.equal(client.calls.length,4);
  assert.doesNotMatch(JSON.stringify(v),/spreadsheetId|metadataBefore|sentinela-nao-publicar/);
  invalid=true;assert.equal((await post()).status,422);const calls=client.calls.length,next=await (await fetch(url+'/api/visao')).json();
  assert.deepEqual(next.captura,v.captura);assert.deepEqual(next.pautas,v.pautas);assert.equal(next.estado,'falha_atualizacao');assert.equal(client.calls.length,calls);
});
