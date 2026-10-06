const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,mudarCelula}=require('./fixtures.cjs');
const {validarCaptura,hashCelulas}=require('../src/captura.cjs');
const coleta=fs.existsSync(path.join(__dirname,'../src/coleta.cjs'))?require('../src/coleta.cjs'):{};
function fake(raw=capturaValida(),mutate=()=>{}) {
  const calls=[];let reads=0,metas=0;
  return {calls,spreadsheetId:raw.spreadsheetId,
    async getMetadata(){calls.push('meta');const result={spreadsheetId:raw.spreadsheetId,properties:{timeZone:'UTC'},
      sheets:Object.entries(raw.metadataBefore).map(([title,m])=>({properties:{title,sheetId:m.sheetId,gridProperties:{rowCount:m.rowCount,columnCount:m.columnCount}}}))};mutate(result,'meta',++metas);return result;},
    async batchGet(ranges){calls.push('batch');assert.equal(ranges.length,Object.keys(raw.tables).length);const result={spreadsheetId:raw.spreadsheetId,valueRanges:Object.entries(raw.tables).map(([title,t],i)=>({range:ranges[i],majorDimension:'ROWS',values:structuredClone(t.values)}))};mutate(result,'batch',++reads);return result;}
  };
}
const {capturaMeses}=require('./fixtures.cjs');
test('C003 duas leituras incluem Meses com range completo e mes textual/serial conservado',async()=>{
  for(const mes of ['2026-10',46300]) {
    const client=fake(capturaMeses([[mes,'ntv','Objetivo','Pauta A']]));
    const raw=await coleta.coletarCaptura(client,{now:()=>new Date('2026-10-05T12:00:00Z')});
    assert.equal(Object.keys(raw.tables).length,7);assert.equal(raw.tables.Meses.range,'A1:D20');
    assert.equal(validarCaptura(raw).meses[0].mes,mes);assert.equal(raw.firstReadSha256,hashCelulas(raw.tables));
    assert.deepEqual(client.calls,['meta','batch','batch','meta']);
  }
});
for(const [nome,raw,mutate] of [
  ['criação',capturaValida(),(r,k,n)=>{if(k==='meta'&&n===2)r.sheets.push({properties:{title:'Meses',sheetId:6,gridProperties:{rowCount:20,columnCount:4}}});}],
  ['remoção',capturaMeses(),(r,k,n)=>{if(k==='meta'&&n===2)r.sheets.pop();}],
  ['id',capturaMeses(),(r,k,n)=>{if(k==='meta'&&n===2)r.sheets.at(-1).properties.sheetId++;}],
  ['mudança somente Meses',capturaMeses(),(r,k,n)=>{if(k==='batch'&&n===2)r.valueRanges.at(-1).values[1][2]='Mudança';}],
  ['range parcial',capturaMeses(),(r,k)=>{if(k==='batch')r.valueRanges.at(-1).range="'Meses'!A1:D19";}],
  ['header',capturaMeses(),(r,k)=>{if(k==='batch')r.valueRanges.at(-1).values[0][2]='outro';}]
]) test('C003 recusa '+nome+' sem retry',async()=>{
  const client=fake(raw,mutate);await assert.rejects(()=>coleta.coletarCaptura(client),{categoria:'dados'});
  assert.ok(client.calls.filter(c=>c==='batch').length<=2);
});
test('C01 duas batchGet tipadas, ranges completos, hashes e fonte direta v1',async()=>{
  const raw=capturaValida();mudarCelula(raw,'Produções',1,'data_prevista',46296);
  const client=fake(raw),result=await coleta.coletarCaptura?.(client,{now:()=>new Date('2026-10-05T12:00:00Z'),capturaId:'nova-sintetica'});
  assert.ok(result,'coletor deve produzir envelope');assert.deepEqual(client.calls,['meta','batch','batch','meta']);
  assert.equal(result.source,'google-sheets-api');assert.equal(result.schemaVersion,1);assert.equal(result.firstReadSha256,result.secondReadSha256);
  const value=validarCaptura(result);assert.equal(value.producoes[0].versao,1);assert.equal(value.producoes[0].data_prevista,'2026-10-01');
  assert.equal(Object.keys(result.tables).length,6);assert.equal(result.captureProfile,undefined);
});
test('C04 coleta converte publicado_em serial no fuso Sao Paulo antes do hash',async()=>{
  const raw=capturaValida();
  mudarCelula(raw,'Semanas',1,'inicio_semana',46293);
  mudarCelula(raw,'Produções',1,'publicado_em',46296.5);
  const client=fake(raw,(body,kind)=>{if(kind==='meta')body.properties.timeZone='America/Sao_Paulo';});
  const result=await coleta.coletarCaptura(client,{now:()=>new Date('2026-10-05T12:00:00Z'),capturaId:'publicacao-sintetica'});
  const table=result.tables.Produções;
  assert.equal(table.values[1][table.values[0].indexOf('publicado_em')],'2026-10-01T15:00:00.000Z');
  assert.equal(validarCaptura(result).semanas[0].inicio_semana,'2026-09-28');
  const expected=structuredClone(raw);
  mudarCelula(expected,'Semanas',1,'inicio_semana','2026-09-28');
  mudarCelula(expected,'Produções',1,'publicado_em','2026-10-01T15:00:00.000Z');
  assert.equal(result.firstReadSha256,hashCelulas(expected.tables));
  assert.equal(result.secondReadSha256,result.firstReadSha256);
  assert.deepEqual(client.calls,['meta','batch','batch','meta']);
});

test('C02 fonte mudou ou resposta/range incompleto recusa como dados',async()=>{
  for(const mutate of [
    (r,kind,n)=>{if(kind==='batch'&&n===2)r.valueRanges[0].values[1][3]='alteracao';},
    (r,kind,n)=>{if(kind==='meta'&&n===2)r.sheets[0].properties.gridProperties.rowCount++;},
    (r,kind)=>{if(kind==='batch')r.valueRanges.pop();},
    (r,kind)=>{if(kind==='batch')r.valueRanges[0].range="'Semanas'!A1:A1";},
    (r,kind)=>{if(kind==='batch')r.valueRanges[0].values[0].shift();},
    (r,kind)=>{if(kind==='meta')r.properties.timeZone='fuso-invalido';}]) {
    assert.equal(typeof coleta.coletarCaptura,'function');
    await assert.rejects(coleta.coletarCaptura(fake(capturaValida(),mutate)),e=>e.categoria==='dados');
  }
});
test('C03 datas a milissegundo, Sao Paulo, vazio/texto e DST ambiguo/inexistente',()=>{
  assert.equal(coleta.dataSerial?.(46296,'UTC',false),'2026-10-01');
  assert.equal(coleta.dataSerial(46296.5,'America/Sao_Paulo',true),'2026-10-01T15:00:00.000Z');
  assert.equal(coleta.dataSerial(46296+1/86400000,'UTC',true),'2026-10-01T00:00:00.001Z');
  for(const [civil,tz] of [['2026-11-01T01:30:00Z','America/New_York'],['2026-03-08T02:30:00Z','America/New_York']]) {
    const serial=(Date.parse(civil)-Date.parse('1899-12-30T00:00:00Z'))/86400000;
    assert.throws(()=>coleta.dataSerial(serial,tz,true),e=>e.categoria==='dados');
  }
  assert.throws(()=>coleta.dataSerial(46296.5,'UTC',false),e=>e.categoria==='dados');
});
module.exports={fake};

test('C05 T021 inteiros textuais canonicos nos campos numericos resolvem vigencia sem regravar legado',async t=>{
  const {temporario,mapaQuadroValido,recalcularHashes}=require('./fixtures.cjs');
  const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
  const {projetarVisao}=require('../src/projecao.cjs');
  const raw=capturaValida(),dir=temporario(t);
  promoverCaptura(raw,dir);
  const oldFile=path.join(dir,'capturas',raw.capturaId+'.json'),oldBytes=fs.readFileSync(oldFile);
  for(const [aba,fields] of [['Produções',['versao']],['Páginas',['versao','indice']],['Cenas',['versao','indice','inicio_segundos','duracao_segundos']],['Arquivos',['versao']],['Revisoes',['versao']]]) {
    const table=raw.tables[aba];
    for(const row of table.values.slice(1))for(const field of fields){const i=table.values[0].indexOf(field);row[i]=String(row[i]);}
  }
  mudarCelula(raw,'Produções',1,'titulo','123');
  mudarCelula(raw,'Produções',1,'data_prevista','46296');
  mudarCelula(raw,'Cenas',1,'texto','456');
  const before=JSON.stringify(raw);
  const result=await coleta.coletarCaptura(fake(raw),{now:()=>new Date('2026-10-05T12:00:00Z'),capturaId:'tipagem-sintetica'});
  const accepted=validarCaptura(result);
  assert.equal(accepted.producoes[0].versao,1);
  assert.equal(accepted.paginas[0].versao,1);assert.equal(accepted.paginas[0].indice,1);
  assert.equal(accepted.cenas[0].versao,1);assert.equal(accepted.cenas[0].indice,1);
  assert.equal(accepted.cenas[0].inicio_segundos,0);assert.equal(accepted.cenas[0].duracao_segundos,5);
  assert.equal(accepted.arquivos[0].versao,1);assert.equal(accepted.revisoes[0].versao,1);
  assert.equal(accepted.producoes[0].titulo,'123');assert.equal(accepted.producoes[0].data_prevista,'46296');assert.equal(accepted.cenas[0].texto,'456');
  const expected=capturaValida();
  mudarCelula(expected,'Produções',1,'titulo','123');mudarCelula(expected,'Produções',1,'data_prevista','46296');mudarCelula(expected,'Cenas',1,'texto','456');
  recalcularHashes(expected);
  assert.equal(result.firstReadSha256,expected.firstReadSha256);assert.equal(result.secondReadSha256,expected.secondReadSha256);
  assert.equal(JSON.stringify(raw),before);
  assert.equal(promoverCaptura(result,dir).resultado,'completa');
  const state=lerEstado(dir),view=projetarVisao(state,'2026-10-05T12:01:00Z',mapaQuadroValido());
  assert.equal(view.producoes.find(p=>p.slot==='carrossel').detalhes.paginas[0].vigente,true);
  assert.equal(view.producoes.find(p=>p.slot==='reels').detalhes.cenas[0].vigente,true);
  assert.equal(view.avisos.filter(a=>/^(Inteiro positivo inválido|Tempo inválido);/.test(a.motivo)).length,0);
  assert.equal(view.estado,'atualizada_hoje');assert.equal(state.historico.length,2);
  assert.deepEqual(fs.readFileSync(oldFile),oldBytes);
});

test('C06 T021 rejeita coercoes gerais e conserva avisos dos valores fora da regra',async()=>{
  const {projetarVisao}=require('../src/projecao.cjs');
  const {mapaQuadroValido}=require('./fixtures.cjs');
  for(const value of ['01',' 1','1 ','1\n','1\r','1\r\n','1\t','+1','-1','1.0','1,0','1e2','outro','9007199254740993',true,-1,1.5,'0']) {
    const raw=capturaValida();mudarCelula(raw,'Páginas',1,'versao',value);
    const result=await coleta.coletarCaptura(fake(raw),{now:()=>new Date('2026-10-05T12:00:00Z'),capturaId:'invalida-sintetica'});
    const captura=validarCaptura(result);
    assert.equal(captura.paginas[0].versao,value==='0'?0:value);
    const view=projetarVisao({captura,historico:[],ultimaTentativa:null},'2026-10-05T12:01:00Z',mapaQuadroValido());
    assert.ok(view.avisos.some(a=>a.aba==='Páginas'&&a.campo==='versao'&&a.motivo.startsWith('Inteiro positivo inválido;')));
    assert.equal(view.producoes.find(p=>p.slot==='carrossel').detalhes.paginas[0].vigente,false);
  }
  const raw=capturaValida();mudarCelula(raw,'Cenas',1,'duracao_segundos',2.5);
  const result=await coleta.coletarCaptura(fake(raw),{now:()=>new Date('2026-10-05T12:00:00Z'),capturaId:'decimal-nativo-sintetico'});
  assert.equal(validarCaptura(result).cenas[0].duracao_segundos,2.5);
});
