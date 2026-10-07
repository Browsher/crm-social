const {CAMPOS,CAMPOS_MESES,CAMPOS_PAUTAS,linhaMensal,linhaPauta}=require('./captura.cjs');
const chaves=['semanas','producoes','paginas','cenas','arquivos','revisoes'];
// Triagem conservadora de conteúdo indevido; não comprova ausência de todo segredo possível.
const sensivel=/(?:sk-ant-|gh[opsur]_|github_pat_|n8n_api_)[A-Za-z0-9_-]{20,}|AIza[A-Za-z0-9_-]{35}|ya29\.[A-Za-z0-9._-]{20,}|1\/\/[A-Za-z0-9_-]{20,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----|(?<![A-Za-z0-9_])[A-Za-z]:[\\/]|\/(?:home|Users)\//;
function redigirPedacoUrl(pedaco) {
  const inicio=pedaco.match(/^[('"“”‘’«»`]+/)?.[0] ?? '';
  const miolo=pedaco.slice(inicio.length),fim=miolo.match(/[.,;:!?()'"“”‘’«»`]+$/)?.[0] ?? '';
  const candidato=miolo.slice(0,miolo.length-fim.length);
  if(!/^https?:\/\//i.test(candidato)) return pedaco;
  // Pontuação só delimita o pedaço; o parser URL decide se há userinfo.
  try {
    const url=new URL(candidato);
    return url.username || url.password?inicio+'[conteúdo suprimido]'+fim:pedaco;
  } catch {return pedaco;}
}
function redigirTexto(texto) {
  if(sensivel.test(texto)) return '[conteúdo suprimido]';
  if(jsonValido(texto)) {
    // JSON é dado. Somente strings redigidas são reserializadas, inclusive chaves
    // e JSON aninhado em strings; todos os demais bytes permanecem intactos.
    return texto.replace(/"(?:\\.|[^"\\])*"/g,token=>{
      const value=JSON.parse(token),redigido=redigirTexto(value);
      return redigido===value?token:JSON.stringify(redigido);
    });
  }
  return texto.split(/(\s+)/).map(redigirPedacoUrl).join('');
}
function jsonValido(value) {
  try {JSON.parse(value);return true;} catch {return false;}
}
function motivoUrl(value) {
  if(value.trim()==='') return null;
  try {const url=new URL(value);return url.username || url.password?'conteúdo sensível suprimido':null;}
  catch {return 'URL inválida suprimida';}
}
function selecionar(record,fields,nome,linha,avisos) {
  return Object.fromEntries(fields.map(field=>{
    const value=field==='etapa_producao' && record[field]===null?null:record[field] ?? '';
    const redigido=typeof value==='string'?redigirTexto(value):value;
    // Identidades e vínculos não podem virar uma chave compartilhada de redação.
    if(redigido!==value && field.endsWith('_id')) throw Object.assign(new Error('Identidade ou vínculo sensível não pode ser projetado'),{code:'IDENTIDADE_SENSIVEL',aba:nome,linha,campo:field});
    const motivo=redigido!==value?'conteúdo sensível suprimido':
      (typeof value==='string' && ['url','url_video_final'].includes(field)?motivoUrl(value):null);
    if (motivo) {
      avisos.push({aba:nome,linha,campo:field,motivo});
      return [field,redigido!==value?redigido:'[conteúdo suprimido]'];
    }
    return [field,value];
  }));
}
function selecionarNtv(captura,avisos,origens,validadeJson) {
  const semanas=captura.semanas.filter(r=>r.marca_id==='ntv');
  const producoes=captura.producoes.filter(r=>r.marca_id==='ntv');
  const ids=new Set(producoes.map(r=>r.producao_id)), weeks=new Set(semanas.map(r=>r.semana_id));
  const linhas=[semanas,producoes,captura.paginas.filter(r=>ids.has(r.producao_id)),captura.cenas.filter(r=>ids.has(r.producao_id)),
    captura.arquivos.filter(r=>ids.has(r.producao_id) || (!r.producao_id && weeks.has(r.semana_id))),captura.revisoes.filter(r=>ids.has(r.producao_id))];
  const result=Object.fromEntries(Object.entries(CAMPOS).map(([nome,fields],i)=>{
    const table=captura.envelope.tables[nome],keyIndex=table.values[0].indexOf(fields[0]);
    const fisicas=new Map(table.values.slice(1).map((row,index)=>[row[keyIndex],index+2]));
    return [chaves[i],linhas[i].map(r=>{
      const origem={aba:nome,linha:fisicas.get(r[fields[0]])};
      // Recupera a célula de etapa em todas as linhas para conservar null:
      // registros normaliza null/undefined; selecionar reaplica a triagem.
      const entrada=nome==='Produções'?{...r,etapa_producao:table.values[origem.linha-1][table.values[0].indexOf('etapa_producao')]}:r;
      const selecionados=nome==='Semanas'&&table.values[0].includes('pauta_id')?[...fields,'pauta_id']:fields;
      const selected=selecionar(entrada,selecionados,nome,origem.linha,avisos);
      origens.set(selected,origem);
      if(Object.hasOwn(selected,'origens_json')) validadeJson.set(selected,jsonValido(r.origens_json));
      return selected;
    })];
  }));
  if(Object.hasOwn(captura,'pautas')) {
    result.pautas=captura.pautas.filter(r=>r.marca_id==='ntv').map(record=>{
      const linha=linhaPauta(record),selected=selecionar(record,CAMPOS_PAUTAS,'Pautas',linha,avisos);
      origens.set(selected,{aba:'Pautas',linha});return selected;
    });
  }
  if(Object.hasOwn(captura,'meses')) {
    const grupos=new Map();
    result.meses=captura.meses.filter(r=>r.marca_id==='ntv').map(record=>{
      const linha=linhaMensal(record),selected=selecionar(record,CAMPOS_MESES,'Meses',linha,avisos);
      origens.set(selected,{aba:'Meses',linha});
      const avisar=(campo,motivo)=>avisos.push({aba:'Meses',linha,campo,motivo});
      if(typeof selected.mes!=='string'||!/^\d{4}-(?:0[1-9]|1[0-2])$/.test(selected.mes)) avisar('mes','Mês inválido');
      else {const grupo=grupos.get(selected.mes)??[];grupo.push(linha);grupos.set(selected.mes,grupo);}
      for(const campo of ['objetivo','pautas']) if(selected[campo]!==''&&typeof selected[campo]!=='string') avisar(campo,'Texto mensal inválido');
      return selected;
    });
    for(const grupo of grupos.values()) if(grupo.length>1) for(const linha of grupo) avisos.push({aba:'Meses',linha,campo:'mes',motivo:'Mês e marca repetidos'});
  }
  return result;
}
function validarIdentidadesNtv(captura) {
  try { selecionarNtv(captura,[],new WeakMap(),new WeakMap()); }
  catch (error) {
    if(error.code!=='IDENTIDADE_SENSIVEL') throw error;
    // Aba/campo vêm de CAMPOS; linha é índice físico. Nunca incluir a célula.
    throw new Error(`${error.aba} linha ${error.linha} ${error.campo}: identidade ou vínculo sensível`);
  }
}
module.exports={chaves,redigirTexto,selecionarNtv,validarIdentidadesNtv};
