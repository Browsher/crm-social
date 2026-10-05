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
    async batchGet(ranges){calls.push('batch');assert.equal(ranges.length,6);const result={spreadsheetId:raw.spreadsheetId,valueRanges:Object.entries(raw.tables).map(([title,t],i)=>({range:ranges[i],majorDimension:'ROWS',values:structuredClone(t.values)}))};mutate(result,'batch',++reads);return result;}
  };
}
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
