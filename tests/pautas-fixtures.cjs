const {capturaMeses,recalcularHashes,mudarCelula}=require('./fixtures.cjs');
const camposPautas='pauta_id marca_id mes semana inicio_semana tema mensagem modelo_carrossel oferta origem status observacao'.split(' ');
function adicionarPautas(raw,registros=[]) {
  raw.metadataBefore.Pautas={sheetId:7,rowCount:Math.max(20,registros.length+1),columnCount:12};
  raw.metadataAfter.Pautas=structuredClone(raw.metadataBefore.Pautas);
  raw.tables.Pautas={sheetId:7,range:'A1:L'+raw.metadataBefore.Pautas.rowCount,readAt:raw.completedAt,complete:true,
    values:[camposPautas.slice(),...registros.map(r=>camposPautas.map(c=>r[c]??''))]};
  return recalcularHashes(raw);
}
function capturaPautas() {
  const raw=capturaMeses([['2026-11','ntv','Objetivo mensal sintético','Resumo textual sintético']]);
  const registros=[2,9,16,23].map((dia,i)=>({pauta_id:'pauta-novembro-'+(i+1),marca_id:'ntv',mes:'2026-11',semana:i+1,
    inicio_semana:'2026-11-'+String(dia).padStart(2,'0'),tema:'Tema sintético '+(i+1),mensagem:'Mensagem de teste',
    modelo_carrossel:'cabo',oferta:'Oferta fictícia',origem:i===1?'autor':'estrategista',status:'planejada',observacao:'Registro sintético de teste'}));
  const table=raw.tables.Semanas;
  table.values[0].push('pauta_id');table.values[1].push('pauta-novembro-2');
  raw.metadataBefore.Semanas.columnCount++;raw.metadataAfter.Semanas.columnCount++;
  table.range='A1:J20';
  mudarCelula(raw,'Semanas',1,'inicio_semana','2026-11-09');
  for(let row=1;row<raw.tables.Produções.values.length;row++) mudarCelula(raw,'Produções',row,'data_prevista','2026-11-'+(row<3?'10':'12'));
  return adicionarPautas(raw,registros);
}
module.exports={capturaPautas,adicionarPautas,camposPautas};
