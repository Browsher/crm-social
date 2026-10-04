const {CAMPOS}=require('./captura.cjs');
const {COLUNAS}=require('./quadro-config.cjs');
const chaves=['semanas','producoes','paginas','cenas','arquivos','revisoes'];
// Triagem conservadora de conteúdo indevido; não comprova ausência de todo segredo possível.
const sensivel=/(?:sk-ant-|gh[opsur]_|github_pat_|n8n_api_)[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{35}|ya29\.[A-Za-z0-9._-]{20,}|1\/\/[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----|[A-Za-z]:[\\/]|\/(?:home|Users)\//;
function selecionar(record,fields,nome,index,avisos) {
  return Object.fromEntries(fields.map(field=>{
    const value=record[field] ?? '';
    if (typeof value==='string' && sensivel.test(value)) {
      avisos.push({aba:nome,linha:index+2,campo:field,motivo:'conteúdo sensível suprimido'});
      return [field,'[conteúdo suprimido]'];
    }
    return [field,value];
  }));
}
function reciboPublico(receipt) {
  if (!receipt) return null;
  return {tentativaId:receipt.tentativaId,concluidaEm:receipt.concluidaEm,resultado:receipt.resultado,motivoResumo:receipt.motivoResumo};
}
function base(estadoLocal) {
  const historico=estadoLocal.historico.map(reciboPublico).reverse();
  return {schemaVersion:1,estado:'sem_captura',selo:{texto:'Sem dados',cor:'cinza',destino:'planilha'},fonte:'Captura pela Central',
    captura:null,ultimaTentativa:reciboPublico(estadoLocal.ultimaTentativa),semanas:[],producoes:[],dias:[],
    quadro:{colunas:COLUNAS.map(nome=>({nome,ids:[]}))},planilha:[],historico,avisos:[]};
}
function selecionarNtv(captura,avisos) {
  const semanas=captura.semanas.filter(r=>r.marca_id==='ntv');
  const producoes=captura.producoes.filter(r=>r.marca_id==='ntv');
  const ids=new Set(producoes.map(r=>r.producao_id)), weeks=new Set(semanas.map(r=>r.semana_id));
  const linhas=[semanas,producoes,captura.paginas.filter(r=>ids.has(r.producao_id)),captura.cenas.filter(r=>ids.has(r.producao_id)),
    captura.arquivos.filter(r=>ids.has(r.producao_id) || (!r.producao_id && weeks.has(r.semana_id))),captura.revisoes.filter(r=>ids.has(r.producao_id))];
  return Object.fromEntries(Object.entries(CAMPOS).map(([nome,fields],i)=>[
    chaves[i],linhas[i].map((r,index)=>selecionar(r,fields,nome,index,avisos))]));
}
function projetarVisao(estadoLocal) {
  const result=base(estadoLocal), captura=estadoLocal.captura;
  if (!captura) return result;
  const ntv=selecionarNtv(captura,result.avisos);
  result.semanas=ntv.semanas;
  result.producoes=ntv.producoes;
  result.captura={capturaId:captura.envelope.capturaId,completedAt:captura.envelope.completedAt,
    periodo:{inicio:null,fim:null},contagens:Object.fromEntries(chaves.map(k=>[k,ntv[k].length]))};
  // O selo completo é US2; esta base conserva a data real sem declarar sincronização.
  result.estado='anterior_hoje';
  result.selo={texto:'Captura local',cor:'âmbar',destino:'planilha'};
  return result;
}
module.exports={projetarVisao};
