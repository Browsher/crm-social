const fs=require('node:fs');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
const {validarCaptura,idSeguro}=require('./captura.cjs');

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
function lerEstado(dataDir) {
  const state=ponteiro(dataDir);
  try {
    const historico=state.historicoIds.map(id=>json(path.join(dataDir,'tentativas',id+'.json')));
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
  gravarDuravel(staged,JSON.stringify(next));
  fs.renameSync(staged,path.join(dataDir,'atual.json'));
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
function exclusiva(dataDir,operation) {
  const lock=path.join(dataDir,'.importacao.lock');
  let fd;
  try { fs.mkdirSync(dataDir,{recursive:true}); }
  catch { throw new Error('persistência: falha não pôde ser registrada'); }
  try { fd=fs.openSync(lock,'wx'); }
  catch (e) {
    throw new Error(e.code==='EEXIST'?'persistência: importação em andamento; confira a instância antes de tentar novamente':'persistência: falha não pôde ser registrada');
  }
  try {
    try { fs.writeFileSync(fd,JSON.stringify({pid:process.pid,iniciadaEm:new Date().toISOString()}),'utf8'); fs.fsyncSync(fd); }
    catch { throw new Error('persistência: falha não pôde ser registrada'); }
    return operation();
  } finally {
    try { fs.closeSync(fd); fs.unlinkSync(lock); }
    catch { throw new Error('persistência: falha ao liberar a trava; confira o estado local'); }
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
function promoverComTrava(raw,dataDir) {
  let before;
  try { prepararDiretorios(dataDir); before=lerEstado(dataDir); }
  catch { throw new Error('persistência: falha não pôde ser registrada'); }
  try {
    validarCaptura(raw);
    gravarImutavel(path.join(dataDir,'capturas',raw.capturaId+'.json'),JSON.stringify(raw));
    if (before.historico.some(r=>r.resultado==='completa' && r.capturaId===raw.capturaId)) {
      return {resultado:'sem_alteracao',capturaId:raw.capturaId};
    }
    return confirmar(dataDir,before.estado,recibo(raw,'completa',''),raw.capturaId);
  } catch (e) {
    const reason=e.message.endsWith(': inválido') ? e.message : motivoSeguro(e);
    try { return confirmar(dataDir,before.estado,recibo(raw,'falhou',reason),before.estado.capturaId); }
    catch { throw new Error('persistência: falha não pôde ser registrada'); }
  }
}
function promoverCaptura(raw,dataDir) { return exclusiva(dataDir,()=>promoverComTrava(raw,dataDir)); }
module.exports={promoverCaptura,lerEstado,registrarFalhaEntrada};
