const {CAMPOS_PAUTAS}=require('./captura.cjs');
const enums={modelo_carrossel:['cabo','faixa','formas','virada'],origem:['estrategista','autor'],status:['planejada','em_producao','concluida']};
const preenchido=value=>value!==''&&!(typeof value==='string'&&value.trim()==='');
function segundaDoMes(mes,semana) {
  if(typeof mes!=='string'||!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(mes)||mes.startsWith('0000'))return null;
  if(!Number.isInteger(semana)||semana<1||semana>4)return null;
  const primeiro=new Date(mes+'-01T00:00:00Z');
  primeiro.setUTCDate(1+(8-primeiro.getUTCDay())%7+7*(semana-1));
  return primeiro.toISOString().slice(0,10);
}
function contar(records,key) {
  const counts=new Map();for(const record of records){const value=key(record);counts.set(value,(counts.get(value)??0)+1);}return counts;
}
function conferirCalendario(p,invalidar) {
  if(!segundaDoMes(p.mes,1))invalidar('mes','Mês da pauta inválido');
  if(!Number.isInteger(p.semana)||p.semana<1||p.semana>4)invalidar('semana','Ordinal da pauta inválido; esperado inteiro de 1 a 4');
  const esperado=segundaDoMes(p.mes,p.semana);
  if(!esperado||p.inicio_semana!==esperado)invalidar('inicio_semana','Início incompatível com a segunda-feira ordinal do mês');
}
function conferirPauta(p,counts,avisar) {
  let valida=true;
  const invalidar=(campo,motivo)=>{valida=false;avisar(p,campo,motivo);};
  if(typeof p.pauta_id!=='string'||!p.pauta_id.trim())invalidar('pauta_id','Identidade da pauta inválida');
  if(counts.ids.get(p.pauta_id)>1)invalidar('pauta_id','Identidade da pauta repetida');
  if(counts.inicios.get(JSON.stringify([p.marca_id,p.inicio_semana]))>1)invalidar('inicio_semana','Marca e início repetidos');
  conferirCalendario(p,invalidar);
  return valida;
}
function conferirTextos(p,avisar) {
  for(const campo of CAMPOS_PAUTAS.slice(5)) {
    if(!preenchido(p[campo]))continue;
    if(typeof p[campo]!=='string')avisar(p,campo,'Texto da pauta inválido; valor original preservado');
    else if(enums[campo]&&!enums[campo].includes(p[campo]))avisar(p,campo,'Valor de pauta desconhecido; texto original preservado');
  }
}
function projetarPautas(ntv,avisos,origens) {
  const records=ntv.pautas??[],counts={ids:contar(records,p=>p.pauta_id),inicios:contar(records,p=>JSON.stringify([p.marca_id,p.inicio_semana]))};
  const avisar=(record,campo,motivo)=>avisos.push({...origens.get(record),campo,motivo});
  const validas=records.filter(p=>{conferirTextos(p,avisar);return conferirPauta(p,counts,avisar);});
  const indice=new Map(validas.map(p=>[p.pauta_id,p]));
  for(const semana of ntv.semanas) {
    if(!Object.hasOwn(semana,'pauta_id'))continue;
    const pauta=indice.get(semana.pauta_id);
    const confirma=pauta&&pauta.marca_id===semana.marca_id&&pauta.inicio_semana===semana.inicio_semana;
    semana.pautaOrigem=confirma?{...pauta}:null;
    if(preenchido(semana.pauta_id)&&!confirma)avisar(semana,'pauta_id','Pauta ausente, ambígua ou incompatível; origem não confirmada');
  }
  return validas.map(p=>({...p}));
}
module.exports={projetarPautas};
