const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const {selecionarNtv}=require('./triagem.cjs');
const {lerEstado}=require('./snapshot.cjs');
const {criarClienteDrive}=require('./google.cjs');
const MAX_BYTES=15_000_000;
const MAX_VIDEO_BYTES=64_000_000;
const PNG=Buffer.from([137,80,78,71,13,10,26,10]);
function falha(status) {return Object.assign(new Error('Prévia indisponível'),{status});}
function normalizarHash(hash) {
  if(hash===undefined||hash===null||hash==='')return '';
  if(typeof hash!=='string'||!/^[a-fA-F0-9]{64}$/.test(hash))throw falha(422);
  return hash.toLowerCase();
}
function tipoImagem(bytes) {
  if(bytes.length>=8&&bytes.subarray(0,8).equals(PNG))return 'image/png';
  if(bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';
  if(bytes.length>=12&&bytes.toString('latin1',0,4)==='RIFF'&&bytes.toString('latin1',8,12)==='WEBP')return 'image/webp';
  throw falha(422);
}
function validarImagem(bytes,sha256) {
  if(!Buffer.isBuffer(bytes)||bytes.length>MAX_BYTES)throw falha(422);
  const hash=normalizarHash(sha256),contentType=tipoImagem(bytes);
  if(hash&&crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw falha(422);
  return contentType;
}
function caixaMp4(bytes,offset) {
  if(bytes.length-offset<8)throw falha(422);
  let tamanho=bytes.readUInt32BE(offset),header=8;
  const tipo=bytes.toString('latin1',offset+4,offset+8);
  if(tamanho===1) {
    if(bytes.length-offset<16)throw falha(422);
    const longo=bytes.readBigUInt64BE(offset+8);
    if(longo>BigInt(MAX_VIDEO_BYTES))throw falha(422);
    tamanho=Number(longo);header=16;
  } else if(tamanho===0)tamanho=bytes.length-offset;
  if(tamanho<header||tamanho>bytes.length-offset)throw falha(422);
  return {tipo,tamanho,header};
}
function primeiraCaixaMp4(bytes) {
  const primeira=caixaMp4(bytes,0);
  if(primeira.tipo!=='ftyp'||primeira.header!==8||primeira.tamanho<16||(primeira.tamanho-16)%4!==0)throw falha(422);
  for(let n=8;n<primeira.tamanho;n+=4) {
    if(n!==12&&['isom','iso2','avc1','mp41','mp42'].includes(bytes.toString('latin1',n,n+4)))return primeira;
  }
  throw falha(422);
}
function validarVideo(bytes,sha256) {
  if(!Buffer.isBuffer(bytes)||bytes.length>MAX_VIDEO_BYTES||bytes.length<24)throw falha(422);
  const hash=normalizarHash(sha256),primeira=primeiraCaixaMp4(bytes);
  let offset=primeira.tamanho,moov=false,mdat=false;
  while(offset<bytes.length) {
    const caixa=caixaMp4(bytes,offset);
    if(caixa.tipo==='moov'&&caixa.tamanho>caixa.header)moov=true;
    if(caixa.tipo==='mdat'&&caixa.tamanho>caixa.header)mdat=true;
    offset+=caixa.tamanho;
  }
  if(!moov||!mdat||hash&&crypto.createHash('sha256').update(bytes).digest('hex')!==hash)throw falha(422);
  return 'video/mp4';
}
function resolverArquivo(estado,arquivoId) {
  let arquivos;
  try {arquivos=selecionarNtv(estado.captura,[],new WeakMap(),new WeakMap()).arquivos;}
  catch {throw falha(503);}
  const encontrados=arquivos.filter(arquivo=>arquivo.arquivo_id===arquivoId);
  if(encontrados.length===0)throw falha(404);
  if(encontrados.length!==1)throw falha(422);
  const arquivo=encontrados[0];
  if(!Number.isSafeInteger(arquivo.versao)||arquivo.versao<=0||
    typeof arquivo.id_drive!=='string'||!/^[A-Za-z0-9_-]+$/.test(arquivo.id_drive))throw falha(422);
  return {...arquivo,sha256:normalizarHash(arquivo.sha256)};
}
function resolverVideo(estado,arquivoId) {
  const arquivo=resolverArquivo(estado,arquivoId);
  if(arquivo.tipo!=='video')throw falha(422);
  if(estado.captura.arquivos.filter(a=>a.arquivo_id===arquivoId).length!==1)throw falha(422);
  const producoes=estado.captura.producoes.filter(p=>p.producao_id===arquivo.producao_id);
  if(producoes.length!==1)throw falha(422);
  if(producoes[0].marca_id!=='ntv')throw falha(404);
  return arquivo;
}
function referenciaAtual(dataDir,arquivoId,video=false) {
  let estado;
  try {estado=lerEstado(dataDir);}catch {throw falha(503);}
  return video?resolverVideo(estado,arquivoId):resolverArquivo(estado,arquivoId);
}
function chaveArquivo(arquivo,video=false) {
  const tupla=[arquivo.arquivo_id,arquivo.versao,arquivo.id_drive,arquivo.sha256];
  if(video)tupla.push('video',arquivo.tipo,arquivo.producao_id);
  return crypto.createHash('sha256').update(JSON.stringify(tupla)).digest('hex');
}
function caminhoCache(raiz,chave) {
  const file=path.resolve(raiz,chave+'.bin');
  if(path.dirname(file)!==raiz)throw falha(503);
  return file;
}
function diretorioCache(raiz) {
  const stat=fs.lstatSync(raiz);
  return stat.isDirectory()&&!stat.isSymbolicLink();
}
function lerLimitado(file,maxBytes) {
  const antes=fs.lstatSync(file,{bigint:true});
  if(!antes.isFile())throw falha(422);
  const fd=fs.openSync(file,'r'),chunks=[];let total=0;
  try {
    const aberto=fs.fstatSync(fd,{bigint:true});
    if(!aberto.isFile()||aberto.dev!==antes.dev||aberto.ino!==antes.ino)throw falha(422);
    while(total<=maxBytes) {
      const chunk=Buffer.alloc(Math.min(65536,maxBytes+1-total));
      const lidos=fs.readSync(fd,chunk,0,chunk.length,null);
      if(lidos===0)break;
      total+=lidos;chunks.push(chunk.subarray(0,lidos));
    }
    return Buffer.concat(chunks,total);
  } finally {fs.closeSync(fd);}
}
function lerCache(raiz,file,hash,video) {
  try {
    if(!diretorioCache(raiz))return null;
    const bytes=lerLimitado(file,video?MAX_VIDEO_BYTES:MAX_BYTES),contentType=(video?validarVideo:validarImagem)(bytes,hash);
    return {bytes,contentType};
  } catch {return null;}
}
function promoverCache(raiz,file,bytes) {
  const staged=path.join(raiz,crypto.randomUUID()+'.tmp');let proprio=false;
  try {
    fs.mkdirSync(raiz,{recursive:true});
    if(!diretorioCache(raiz))return;
    const fd=fs.openSync(staged,'wx');proprio=true;
    try {fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally {fs.closeSync(fd);}
    fs.renameSync(staged,file);
  } catch { /* bytes novos validados continuam utilizáveis sem cache */ }
  finally {if(proprio)try {fs.unlinkSync(staged);}catch { /* promovido ou disco indisponível */ }}
}
function conferirReferencia(dataDir,arquivoId,chave,video) {
  try {if(chaveArquivo(referenciaAtual(dataDir,arquivoId,video),video)===chave)return;}
  catch { /* referência indisponível ao concluir o pedido */ }
  throw falha(503);
}
function criarServicoMidia({dataDir=path.resolve(__dirname,'../data'),criarCliente=criarClienteDrive}={}) {
  const raiz=path.resolve(dataDir,'midias'),pendentes=new Map();let cliente;
  async function obterBytes(arquivo,chave,video) {
    const file=caminhoCache(raiz,chave),hit=lerCache(raiz,file,arquivo.sha256,video);
    if(hit)return hit;
    let bytes;
    try {
      cliente??=criarCliente();
      bytes=video?await cliente.getMidia(arquivo.id_drive,{maxBytes:MAX_VIDEO_BYTES}):await cliente.getMidia(arquivo.id_drive);
    }
    catch(error) {throw falha(error?.status===422?422:503);}
    const contentType=(video?validarVideo:validarImagem)(bytes,arquivo.sha256);
    promoverCache(raiz,file,bytes);
    return {bytes,contentType};
  }
  async function obter(arquivoId,video=false) {
    const arquivo=referenciaAtual(dataDir,arquivoId,video),chave=chaveArquivo(arquivo,video);
    if(!pendentes.has(chave))pendentes.set(chave,obterBytes(arquivo,chave,video).finally(()=>pendentes.delete(chave)));
    const resultado=await pendentes.get(chave);
    conferirReferencia(dataDir,arquivoId,chave,video);
    return resultado;
  }
  return {obter:arquivoId=>obter(arquivoId),obterVideo:arquivoId=>obter(arquivoId,true)};
}
module.exports={validarImagem,validarVideo,resolverArquivo,criarServicoMidia};
