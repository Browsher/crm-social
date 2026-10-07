const {randomUUID}=require('node:crypto');
const {CAMPOS,validarCaptura,hashCelulas,letraColuna}=require('./captura.cjs');
const {falha}=require('./google.cjs');
const nomes=Object.keys(CAMPOS), DIA=86400000, EPOCA=Date.parse('1899-12-30T00:00:00Z');
const NUMERICOS=Object.freeze({
  'Produções':['versao'], 'Páginas':['versao','indice'],
  Cenas:['versao','indice','inicio_segundos','duracao_segundos'],
  Arquivos:['versao'], Revisoes:['versao'], Pautas:['semana']
});
function inteiroTextual(value){
  if(typeof value!=='string'||!/^(?:0|[1-9][0-9]*)$/.test(value))return value;
  const number=Number(value);
  return Number.isSafeInteger(number)?number:value;
}
function exigir(ok){if(!ok)throw falha('dados');}
function formatador(timeZone){return new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',fractionalSecondDigits:3,hourCycle:'h23'});}
function civilEm(ms,fmt){
  const p=Object.fromEntries(fmt.formatToParts(new Date(ms)).map(x=>[x.type,x.value]));
  return Date.parse(`${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}.${p.fractionalSecond}Z`);
}
function dataSerial(value,timeZone,comHora){
  try {
    exigir(Number.isFinite(value));
    if(!comHora)exigir(Number.isInteger(value));
    const civil=EPOCA+Math.round(value*DIA),date=new Date(civil);
    exigir(Number.isFinite(date.getTime())&&date.getUTCFullYear()>=1&&date.getUTCFullYear()<=9999);
    if(!comHora)return date.toISOString().slice(0,10);
    const fmt=formatador(timeZone),offsets=new Set([-DIA,0,DIA].map(delta=>civilEm(civil+delta,fmt)-(civil+delta)));
    const candidates=[...offsets].map(offset=>civil-offset).filter(ms=>civilEm(ms,fmt)===civil);
    exigir(candidates.length===1);
    return new Date(candidates[0]).toISOString();
  }catch{throw falha('dados');}
}
function metadata(body,id){
  exigir(body&&body.spreadsheetId===id&&Array.isArray(body.sheets));
  const timeZone=body.properties?.timeZone;
  formatador(timeZone);exigir(typeof timeZone==='string');
  const result={};
  const capturados=[...nomes,...['Meses','Pautas'].filter(nome=>body.sheets.some(s=>s?.properties?.title===nome))];
  for(const nome of capturados){
    const matches=body.sheets.filter(s=>s?.properties?.title===nome);exigir(matches.length===1);
    const p=matches[0].properties,g=p.gridProperties;
    exigir(Number.isInteger(p.sheetId)&&p.sheetId>=0&&g&&Number.isInteger(g.rowCount)&&g.rowCount>0&&Number.isInteger(g.columnCount)&&g.columnCount>0);
    result[nome]={sheetId:p.sheetId,rowCount:g.rowCount,columnCount:g.columnCount};
  }
  return {meta:result,timeZone};
}
function converter(values,nome,timeZone){
  exigir(Array.isArray(values)&&values.length>0&&values.every(Array.isArray));
  const campos=['Semanas','Pautas'].includes(nome)?['inicio_semana']:nome==='Produções'?['data_prevista','publicado_em']:[];
  const numericos=NUMERICOS[nome]??[];
  return values.map((row,i)=>row.map((value,j)=>{
    if(i===0)return value;
    const field=values[0][j];
    if(campos.includes(field)&&typeof value==='number')return dataSerial(value,timeZone,field==='publicado_em');
    return numericos.includes(field)?inteiroTextual(value):value;
  }));
}
function tabelas(body,id,before,readAt){
  const capturados=Object.keys(before.meta);
  exigir(body&&body.spreadsheetId===id&&Array.isArray(body.valueRanges)&&body.valueRanges.length===capturados.length);
  const result={};
  capturados.forEach((nome,i)=>{
    const m=before.meta[nome],range='A1:'+letraColuna(m.columnCount)+m.rowCount,r=body.valueRanges[i];
    exigir(r&&r.majorDimension==='ROWS'&&[`${nome}!${range}`,`'${nome}'!${range}`].includes(r.range));
    result[nome]={sheetId:m.sheetId,range,readAt,complete:true,values:converter(r.values,nome,before.timeZone)};
  });
  return result;
}
async function coletarCaptura(client,{now=()=>new Date(),capturaId=randomUUID()}={}){
  const stamp=()=>new Date(now()).toISOString(),startedAt=stamp();
  try{
    const before=metadata(await client.getMetadata(),client.spreadsheetId);
    const ranges=Object.keys(before.meta).map(nome=>`'${nome}'!A1:${letraColuna(before.meta[nome].columnCount)}${before.meta[nome].rowCount}`);
    const first=tabelas(await client.batchGet(ranges),client.spreadsheetId,before,stamp());
    const firstReadSha256=hashCelulas(first);
    const second=tabelas(await client.batchGet(ranges),client.spreadsheetId,before,stamp());
    const secondReadSha256=hashCelulas(second);
    const after=metadata(await client.getMetadata(),client.spreadsheetId);
    exigir(JSON.stringify(before)===JSON.stringify(after)&&firstReadSha256===secondReadSha256);
    const result={schemaVersion:1,capturaId,brandId:'ntv',source:'google-sheets-api',spreadsheetId:client.spreadsheetId,startedAt,completedAt:stamp(),metadataBefore:before.meta,metadataAfter:after.meta,tables:second,firstReadSha256,secondReadSha256};
    validarCaptura(result);return result;
  }catch(error){throw falha(['configuracao','acesso','rede'].includes(error.categoria)?error.categoria:'dados');}
}
module.exports={coletarCaptura,dataSerial};
