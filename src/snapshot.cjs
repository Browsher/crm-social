const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {validarCaptura,validarTempoImportacao,idSeguro,instanteUtc}=require('./captura.cjs');
const {validarIdentidadesNtv}=require('./triagem.cjs');
const {MOTIVOS}=require('./google.cjs');

function json(file) { return JSON.parse(fs.readFileSync(file,'utf8')); }
function ponteiro(dataDir) {
  try {
    const p=json(path.join(dataDir,'atual.json'));
    const ids=p.historicoIds;
    if (!Array.isArray(ids) || ids.some(id=>!idSeguro(id)) || new Set(ids).size!==ids.length) throw new Error('estado inválido');
    if (p.capturaId!==null && !idSeguro(p.capturaId)) throw new Error('estado inválido');
    if (p.ultimaTentativaId!==(ids.at(-1) ?? null)) throw new Error('estado inválido');
    return p;
  } catch (e) {
    if (e.code==='ENOENT') return {capturaId:null,ultimaTentativaId:null,historicoIds:[]};
    throw new Error('persistência: estado local inválido ou ilegível');
  }
}
function instanteRecibo(value) {
  return typeof value==='string' && /(?:Z|[+-]\d\d:\d\d)$/.test(value) &&
    Number.isFinite(Date.parse(value)) && instanteUtc(value.replace(/(?:Z|[+-]\d\d:\d\d)$/,'Z'));
}
function lerRecibo(dataDir,id) {
  const r=json(path.join(dataDir,'tentativas',id+'.json'));
  if(r===null || typeof r!=='object' || Array.isArray(r)) throw new Error('recibo inválido');
  const captura=r.capturaId===null || idSeguro(r.capturaId);
  if(r.tentativaId!==id || !captura || !instanteRecibo(r.concluidaEm) ||
    !['completa','falhou'].includes(r.resultado) || typeof r.motivoResumo!=='string') throw new Error('recibo inválido');
  if(r.resultado==='completa' && r.capturaId===null) throw new Error('recibo inválido');
  return r;
}
function lerEstado(dataDir) {
  const state=ponteiro(dataDir);
  try {
    const historico=state.historicoIds.map(id=>lerRecibo(dataDir,id));
    const ultimaTentativa=historico.at(-1) ?? null;
    const captura=state.capturaId===null ? null : validarCaptura(json(path.join(dataDir,'capturas',state.capturaId+'.json')));
    return {estado:state,captura,ultimaTentativa,historico};
  } catch {
    throw new Error('persistência: captura ou recibo confirmado ilegível');
  }
}
function gravarDuravel(file,body) {
  const fd=fs.openSync(file,'wx');
  try { fs.writeFileSync(fd,body,'utf8'); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
}
function gravarImutavel(file,body) {
  try { gravarDuravel(file,body); }
  catch (e) {
    if (e.code!=='EEXIST') throw e;
    if (fs.readFileSync(file,'utf8')!==body) throw new Error('captura: conflito de conteúdo no mesmo ID');
  }
}
function confirmar(dataDir,before,receipt,capturaId) {
  const body=JSON.stringify(receipt);
  gravarImutavel(path.join(dataDir,'tentativas',receipt.tentativaId+'.json'),body);
  const next={capturaId,ultimaTentativaId:receipt.tentativaId,historicoIds:[...before.historicoIds,receipt.tentativaId]};
  const staged=path.join(dataDir,'atual-'+randomUUID()+'.tmp');
  try {
    gravarDuravel(staged,JSON.stringify(next));
    fs.renameSync(staged,path.join(dataDir,'atual.json'));
  } catch (e) {
    try { fs.unlinkSync(staged); } catch { /* conservar o erro original de gravação/promoção */ }
    throw e;
  }
  // Resumo derivado: a confirmação já está no estado único, mesmo se este cache falhar.
  try { fs.writeFileSync(path.join(dataDir,'ultima-tentativa.json'),body,'utf8'); } catch { /* sem autoridade */ }
  return receipt;
}
function recibo(raw,resultado,motivoResumo) {
  return {tentativaId:'tentativa-'+randomUUID(),capturaId:idSeguro(raw?.capturaId)?raw.capturaId:null,
    concluidaEm:new Date().toISOString(),resultado,motivoResumo};
}
function prepararDiretorios(dataDir) {
  fs.mkdirSync(path.join(dataDir,'capturas'),{recursive:true});
  fs.mkdirSync(path.join(dataDir,'tentativas'),{recursive:true});
}
function motivoSeguro(error) {
  if (error.message.startsWith('captura: conflito')) return error.message;
  if (error.code) return 'persistência: falha na gravação';
  return error.message;
}
function adquirir(dataDir) {
  const lock=path.join(dataDir,'.importacao.lock');
  let fd;
  try { fs.mkdirSync(dataDir,{recursive:true}); }
  catch { throw new Error('persistência: falha não pôde ser registrada'); }
  try { fd=fs.openSync(lock,'wx'); }
  catch (e) {
    throw new Error(e.code==='EEXIST'?'persistência: importação em andamento; confira a instância antes de tentar novamente':'persistência: falha não pôde ser registrada');
  }
  return {fd,lock};
}
function identificarTrava({fd}) {
  try { fs.writeFileSync(fd,JSON.stringify({pid:process.pid,iniciadaEm:new Date().toISOString()}),'utf8'); fs.fsyncSync(fd); }
  catch { throw new Error('persistência: falha não pôde ser registrada'); }
}
function liberar({fd,lock},outcome) {
  let warning=false;
  try { fs.closeSync(fd); } catch { warning=true; }
  try { fs.unlinkSync(lock); } catch { warning=true; }
  if (warning) outcome.avisos=[...(outcome.avisos ?? []),'falha ao liberar a trava; confira o estado local'];
}
function exclusiva(dataDir,operation) {
  const lock=adquirir(dataDir);let outcome;
  try {
    identificarTrava(lock);
    outcome=operation();
    return outcome;
  } catch (e) {
    outcome=e;
    throw e;
  } finally {
    liberar(lock,outcome);
  }
}
function registrarFalhaEntrada(dataDir,codigo) {
  const motivos={ENTRADA_ARQUIVO:'arquivo local ausente ou ilegível',ENTRADA_JSON:'JSON inválido no arquivo local'};
  if (!Object.hasOwn(motivos,codigo)) throw new Error('persistência: tipo de falha de entrada desconhecido');
  return exclusiva(dataDir,()=>{
    try {
      prepararDiretorios(dataDir);
      const before=lerEstado(dataDir);
      return confirmar(dataDir,before.estado,recibo(null,'falhou',motivos[codigo]),before.estado.capturaId);
    } catch { throw new Error('persistência: falha não pôde ser registrada'); }
  });
}
function promoverComTrava(raw,dataDir,direta=false) {
  let before;
  try { prepararDiretorios(dataDir); before=lerEstado(dataDir); }
  catch { throw new Error('persistência: falha não pôde ser registrada'); }
  try {
    const candidata=validarCaptura(raw);
    validarIdentidadesNtv(candidata);
    const file=path.join(dataDir,'capturas',raw.capturaId+'.json'),body=JSON.stringify(raw);
    if (fs.existsSync(file) && fs.readFileSync(file,'utf8')!==body) throw new Error('captura: conflito de conteúdo no mesmo ID');
    if (before.historico.some(r=>r.resultado==='completa' && r.capturaId===raw.capturaId)) {
      gravarImutavel(file,body);
      return {resultado:'sem_alteracao',capturaId:raw.capturaId};
    }
    validarTempoImportacao(raw.completedAt,new Date().toISOString(),before.captura?.envelope.completedAt ?? null);
    gravarImutavel(file,body);
    return confirmar(dataDir,before.estado,recibo(raw,'completa',''),raw.capturaId);
  } catch (e) {
    if(direta&&e.code)throw new Error('persistência: falha não pôde ser registrada');
    const reason=direta?MOTIVOS.dados:(e.message.endsWith(': inválido') ? e.message : motivoSeguro(e));
    try {
      const result=confirmar(dataDir,before.estado,recibo(raw,'falhou',reason),before.estado.capturaId);
      return direta?{...result,categoria:'dados'}:result;
    }
    catch { throw new Error('persistência: falha não pôde ser registrada'); }
  }
}
function promoverCaptura(raw,dataDir) { return exclusiva(dataDir,()=>promoverComTrava(raw,dataDir)); }
async function atualizarCaptura(dataDir,coletar) {
  const lock=adquirir(dataDir);let outcome;
  try {
    identificarTrava(lock);
    outcome=await coletarComTrava(dataDir,coletar);return outcome;
  }catch(error){outcome=error;throw error;}
  finally{liberar(lock,outcome);}
}
async function coletarComTrava(dataDir,coletar) {
  let raw;
  try {raw=await coletar();}
  catch(error){
    const categoria=Object.hasOwn(MOTIVOS,error?.categoria)?error.categoria:'rede';
    try {
      prepararDiretorios(dataDir);const before=lerEstado(dataDir);
      return {...confirmar(dataDir,before.estado,recibo(null,'falhou',MOTIVOS[categoria]),before.estado.capturaId),categoria};
    }catch{throw new Error('persistência: falha não pôde ser registrada');}
  }
  return promoverComTrava(raw,dataDir,true);
}
module.exports={promoverCaptura,lerEstado,registrarFalhaEntrada,atualizarCaptura};
