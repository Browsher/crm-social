const crypto = require('node:crypto');

const CAMPOS = Object.freeze({
  Semanas: 'semana_id marca_id inicio_semana tema objetivo plano_json_arquivo_id redacao_json_arquivo_id visual_json_arquivo_id'.split(' '),
  Produções: 'producao_id marca_id semana_id slot tipo_producao data_prevista status etapa_producao estado_revisao estado_liberacao responsavel_atual versao titulo legenda publicado_em url_video_final id_drive_video_final'.split(' '),
  Páginas: 'pagina_id producao_id versao indice funcao titulo corpo arquivo_imagem_id'.split(' '),
  Cenas: 'cena_id producao_id versao indice texto texto_tela inicio_segundos duracao_segundos arquivo_imagem_inicio_id arquivo_imagem_final_id arquivo_video_id'.split(' '),
  Arquivos: 'arquivo_id producao_id semana_id cena_id pagina_id tipo papel versao id_drive url origens_json sha256'.split(' '),
  Revisoes: 'revisao_id producao_id cena_id pagina_id arquivo_id versao decisao motivo responsavel_correcao estado_tratamento'.split(' ')
});
const nomes = Object.keys(CAMPOS);
const saidas = ['semanas','producoes','paginas','cenas','arquivos','revisoes'];
const vazio = value => value === '' || value === null;
const objeto = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const idSeguro = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value);
function exigir(condition, field) {
  if (!condition) throw new Error(field + ': inválido');
}
function instanteUtc(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value)) return false;
  const time=Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0,19)===value.slice(0,19);
}
function mesmosNomes(value) {
  return objeto(value) && Object.keys(value).sort().join('|')===nomes.slice().sort().join('|');
}
function validarEnvelope(raw) {
  exigir(objeto(raw),'envelope');
  exigir(raw.schemaVersion===1,'schemaVersion');
  exigir(idSeguro(raw.capturaId),'capturaId');
  exigir(typeof raw.spreadsheetId==='string' && raw.spreadsheetId.trim()!=='','spreadsheetId');
  exigir(raw.brandId==='ntv','brandId');
  exigir(raw.source==='google-drive-connector','source');
  exigir(instanteUtc(raw.startedAt),'startedAt');
  exigir(instanteUtc(raw.completedAt),'completedAt');
  exigir(Date.parse(raw.startedAt)<=Date.parse(raw.completedAt),'intervalo');
  exigir(mesmosNomes(raw.tables) && mesmosNomes(raw.metadataBefore) && mesmosNomes(raw.metadataAfter),'abas');
}
function letraColuna(n) {
  let name='';
  while (n>0) { n--; name=String.fromCharCode(65+n%26)+name; n=Math.floor(n/26); }
  return name;
}
function conferirMetadata(raw,nome) {
  const before=raw.metadataBefore[nome], after=raw.metadataAfter[nome];
  exigir(objeto(before) && objeto(after),nome+' metadata');
  for (const field of ['sheetId','rowCount','columnCount']) {
    const value=before[field];
    exigir(Number.isInteger(value) && value>=(field==='sheetId'?0:1) && value===after[field],nome+' metadata '+field);
  }
  return before;
}
function conferirMatriz(table,meta,nome) {
  exigir(Array.isArray(table.values) && table.values.length>0 && table.values.length<=meta.rowCount,nome+' dimensões');
  for (const [i,row] of table.values.entries()) {
    exigir(Array.isArray(row),nome+' linha '+(i+1));
    exigir(row.length<=meta.columnCount,nome+' dimensões linha '+(i+1));
    for (const [j,value] of row.entries()) {
      const valid=value===null || typeof value==='string' || typeof value==='boolean' || (typeof value==='number' && Number.isFinite(value));
      exigir(valid,nome+' linha '+(i+1)+' célula '+(j+1));
    }
  }
}
function conferirCabecalhos(headers,nome) {
  const seen=new Set();
  for (const h of headers) {
    if (vazio(h)) continue;
    exigir(typeof h==='string',nome+' cabeçalho');
    exigir(!seen.has(h),nome+' cabeçalho duplicado');
    seen.add(h);
  }
  for (const field of CAMPOS[nome]) exigir(seen.has(field),nome+' '+field);
}
function registros(table,nome) {
  const [headers,...rows]=table.values;
  conferirCabecalhos(headers,nome);
  const key=CAMPOS[nome][0], seen=new Set(), result=[];
  rows.forEach((row,index) => {
    if (row.every(vazio)) return;
    const record=Object.fromEntries(headers.filter(h=>!vazio(h)).map(h=>[h,row[headers.indexOf(h)] ?? '']));
    const id=record[key];
    exigir(typeof id==='string' && id.trim()!=='' && !seen.has(id),nome+' linha '+(index+2)+' '+key);
    seen.add(id); result.push(record);
  });
  return result;
}
function matrizCanonica(values) {
  const rows=values.map(row=>{
    const cells=row.slice();
    while (cells.length && vazio(cells.at(-1))) cells.pop();
    return cells;
  });
  while (rows.length && rows.at(-1).length===0) rows.pop();
  return rows;
}
function hashCelulas(tables) {
  const pairs=nomes.slice().sort().map(nome=>{
    const t=tables[nome];
    return [nome,{sheetId:t.sheetId,range:t.range,values:matrizCanonica(t.values)}];
  });
  return crypto.createHash('sha256').update(JSON.stringify(pairs),'utf8').digest('hex');
}
function validarCaptura(raw) {
  validarEnvelope(raw);
  const result={envelope:structuredClone(raw)};
  nomes.forEach((nome,index)=>{
    const meta=conferirMetadata(raw,nome), table=raw.tables[nome];
    exigir(objeto(table),nome+' tabela');
    exigir(table.sheetId===meta.sheetId,nome+' metadata sheetId');
    exigir(table.complete===true,nome+' complete');
    exigir(table.range==='A1:'+letraColuna(meta.columnCount)+meta.rowCount,nome+' range');
    exigir(instanteUtc(table.readAt) && Date.parse(table.readAt)>=Date.parse(raw.startedAt) && Date.parse(table.readAt)<=Date.parse(raw.completedAt),nome+' readAt');
    conferirMatriz(table,meta,nome);
    result[saidas[index]]=registros(table,nome);
  });
  exigir(typeof raw.secondReadSha256==='string' && /^[a-f0-9]{64}$/.test(raw.secondReadSha256),'hash');
  exigir(raw.firstReadSha256===raw.secondReadSha256 && raw.secondReadSha256===hashCelulas(raw.tables),'hash');
  return result;
}
function validarTempoImportacao(completedAt,nowIso,completedAtVigente=null) {
  const fim=Date.parse(completedAt);
  if (fim>Date.parse(nowIso)+10*60*1000) throw new Error('captura inválida: completedAt excede o relógio local em mais de 10 minutos');
  if (completedAtVigente!==null && fim<=Date.parse(completedAtVigente)) throw new Error('captura desatualizada: completedAt igual ou anterior ao da vigente');
}
module.exports={validarCaptura,validarTempoImportacao,CAMPOS,idSeguro,instanteUtc};
