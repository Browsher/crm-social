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
function dataCivil(value) {
  if (typeof value!=='string' || !/^\d{4}-\d\d-\d\d$/.test(value)) return null;
  const ms=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10)===value ? value : null;
}
function fimSemana(inicio) {
  if (!inicio) return null;
  const day=new Date(inicio+'T00:00:00Z');
  day.setUTCDate(day.getUTCDate()+6);
  return day.toISOString().slice(0,10);
}
function ordinal(a,b) { return a<b?-1:a>b?1:0; }
function planejar(result) {
  const idsSemanas=new Set(result.semanas.map(s=>s.semana_id));
  const formatos={imagem_a:'Imagem',imagem_b:'Imagem',carrossel:'Carrossel',reels:'Reels'};
  result.producoes=result.producoes.map((p,index)=>{
    const data=dataCivil(p.data_prevista), semanaId=idsSemanas.has(p.semana_id)?p.semana_id:null;
    if (!data) result.avisos.push({aba:'Produções',linha:index+2,campo:'data_prevista',motivo:'Sem data civil válida'});
    if (semanaId===null) result.avisos.push({aba:'Produções',linha:index+2,campo:'semana_id',motivo:'Semana não identificada'});
    return {...p,dataCivil:data,semanaId,formato:Object.hasOwn(formatos,p.slot)?formatos[p.slot]:'Outro'};
  });
  result.semanas=result.semanas.map((s,index)=>{
    const inicio=dataCivil(s.inicio_semana), fim=fimSemana(inicio);
    if (!inicio) result.avisos.push({aba:'Semanas',linha:index+2,campo:'inicio_semana',motivo:'Cobertura semanal não identificada'});
    return {...s,periodo:{inicio,fim},objetivoMensal:'Ainda não definido',ids:result.producoes.filter(p=>p.semanaId===s.semana_id).map(p=>p.producao_id).sort(ordinal)};
  });
  const orphanIds=result.producoes.filter(p=>p.semanaId===null).map(p=>p.producao_id).sort(ordinal);
  if (orphanIds.length) result.semanas.push({semana_id:null,tema:'Semana não identificada',periodo:{inicio:null,fim:null},objetivoMensal:'Ainda não definido',ids:orphanIds});
  const weeks=result.semanas.filter(s=>s.periodo.inicio!==null);
  result.captura.periodo={inicio:weeks.map(s=>s.periodo.inicio).sort().at(0) ?? null,fim:weeks.map(s=>s.periodo.fim).sort().at(-1) ?? null};
  result.dias=agruparDias(result.producoes);
}
function agruparDias(producoes) {
  const groups=new Map();
  for (const p of producoes) {
    const key=p.dataCivil ?? ('sem-data:'+p.semanaId);
    if (!groups.has(key)) groups.set(key,{data:p.dataCivil,semanaId:p.dataCivil?null:p.semanaId,ids:[]});
    groups.get(key).ids.push(p.producao_id);
  }
  return [...groups.values()].map(group=>({...group,ids:group.ids.sort(ordinal)})).sort((a,b)=>ordinal(a.data ?? 'z',b.data ?? 'z'));
}
function projetarVisao(estadoLocal) {
  const result=base(estadoLocal), captura=estadoLocal.captura;
  if (!captura) return result;
  const ntv=selecionarNtv(captura,result.avisos);
  result.semanas=ntv.semanas;
  result.producoes=ntv.producoes;
  result.captura={capturaId:captura.envelope.capturaId,completedAt:captura.envelope.completedAt,
    periodo:{inicio:null,fim:null},contagens:Object.fromEntries(chaves.map(k=>[k,ntv[k].length]))};
  planejar(result);
  // O selo completo é US2; esta base conserva a data real sem declarar sincronização.
  result.estado='anterior_hoje';
  result.selo={texto:'Captura local',cor:'âmbar',destino:'planilha'};
  return result;
}
module.exports={projetarVisao};
