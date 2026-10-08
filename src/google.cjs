const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const OAUTH='https://oauth2.googleapis.com/token';
const SCOPE='https://www.googleapis.com/auth/spreadsheets.readonly';
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.readonly';
const MAX_MIDIA_BYTES=15_000_000;
const MOTIVOS=Object.freeze({configuracao:'Configuração da leitura indisponível',acesso:'Acesso à planilha negado',
  rede:'Não foi possível ler a planilha; tente novamente',dados:'Captura inválida ou planilha mudou entre as leituras'});
function falha(categoria) { return Object.assign(new Error(MOTIVOS[categoria]),{categoria}); }
function carregarCredencial({env=process.env,repoRoot=path.resolve(__dirname,'..')}={}) {
  try {
    const file=env.CRM_GOOGLE_CREDENTIALS_FILE;
    if(typeof file!=='string'||!path.isAbsolute(file)) throw falha('configuracao');
    const relative=path.relative(path.resolve(repoRoot),path.resolve(file));
    if(!relative.startsWith('..'+path.sep)&&!path.isAbsolute(relative)) throw falha('configuracao');
    const key=JSON.parse(fs.readFileSync(file,'utf8'));
    if(key?.type!=='service_account'||typeof key.client_email!=='string'||!/^[^\s@]+@[^\s@]+$/.test(key.client_email)||typeof key.private_key!=='string') throw falha('configuracao');
    const privateKey=crypto.createPrivateKey(key.private_key);
    if(privateKey.asymmetricKeyType!=='rsa'||privateKey.asymmetricKeyDetails.modulusLength<2048) throw falha('configuracao');
    return {client_email:key.client_email,private_key:privateKey};
  } catch { throw falha('configuracao'); }
}
function carregarConfig({env=process.env,repoRoot=path.resolve(__dirname,'..')}={}) {
  try {
    const id=env.CRM_SPREADSHEET_ID;
    if(typeof id!=='string'||!/^[A-Za-z0-9_-]+$/.test(id))throw falha('configuracao');
    return {...carregarCredencial({env,repoRoot}),spreadsheetId:id};
  } catch {throw falha('configuracao');}
}
function assinarJwtEscopo(config,now,scope) {
  const encode=value=>Buffer.from(JSON.stringify(value)).toString('base64url'),iat=Math.floor(now/1000);
  const body=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:config.client_email,scope,aud:OAUTH,iat,exp:iat+3600});
  return body+'.'+crypto.sign('RSA-SHA256',Buffer.from(body),{key:config.private_key,padding:crypto.constants.RSA_PKCS1_PADDING}).toString('base64url');
}
function assinarJwt(config,now=Date.now()) {return assinarJwtEscopo(config,now,SCOPE);}
async function requisitar(url,options,fetchImpl,timeoutMs) {
  try {
    const response=await fetchImpl(url,{...options,redirect:'error',signal:AbortSignal.timeout(timeoutMs)});
    if([401,403].includes(response.status)) throw falha('acesso');
    if(!response.ok) {
      if(url===OAUTH&&response.status===400) {
        const body=await response.json();if(body.error==='invalid_grant') throw falha('acesso');
      }
      throw falha('rede');
    }
    try {return await response.json();}
    catch(e){if(e instanceof SyntaxError&&url!==OAUTH)throw falha('dados');throw e;}
  } catch(e) { throw falha(Object.hasOwn(MOTIVOS,e?.categoria)?e.categoria:'rede'); }
}
function validarToken(value) {
  if(typeof value?.access_token!=='string'||!value.access_token.trim()||/\s/.test(value.access_token)||value.token_type!=='Bearer'||!Number.isFinite(value.expires_in)||value.expires_in<=0) throw falha('rede');
  return value;
}
function criarClienteGoogle({env,repoRoot,fetchImpl=fetch,now=Date.now,timeoutMs=15000}={}) {
  const config=carregarConfig({env,repoRoot});let token=null,expires=0;
  async function acesso() {
    if(token&&now()<expires-30000) return token;
    const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:assinarJwt(config,now())});
    const value=validarToken(await requisitar(OAUTH,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()},fetchImpl,timeoutMs));
    token=value.access_token;expires=now()+Math.min(value.expires_in,3600)*1000;return token;
  }
  async function get(suffix,params) {
    const url=new URL('https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(config.spreadsheetId)+suffix);
    url.search=new URLSearchParams(params).toString();
    return requisitar(url.toString(),{method:'GET',headers:{Authorization:'Bearer '+await acesso()}},fetchImpl,timeoutMs);
  }
  return {
    spreadsheetId:config.spreadsheetId,
    getMetadata:()=>get('',{fields:'spreadsheetId,properties(timeZone),sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))'}),
    batchGet:ranges=>get('/values:batchGet',[...ranges.map(range=>['ranges',range]),['majorDimension','ROWS'],['valueRenderOption','UNFORMATTED_VALUE'],['dateTimeRenderOption','SERIAL_NUMBER']])
  };
}
function falhaMidia(status=503) {return Object.assign(new Error('Prévia indisponível'),{status});}
function cancelarCorpo(corpo) {
  try {Promise.resolve(corpo?.cancel()).catch(()=>{});} catch { /* cancelamento é melhor esforço */ }
}
async function requisitarDrive(url,options,fetchImpl,timeoutMs,consumir) {
  const controller=new AbortController();let timer,cancelar=()=>{};
  const prazo=new Promise((_,reject)=>{timer=setTimeout(()=>{
    controller.abort();cancelar();reject(falhaMidia());
  },timeoutMs);});
  const operacao=(async()=>{
    const response=await fetchImpl(url,{...options,redirect:'error',signal:controller.signal});
    if(controller.signal.aborted||!response.ok) {cancelarCorpo(response.body);throw falhaMidia();}
    return consumir(response,callback=>{cancelar=callback;});
  })();
  try {return await Promise.race([operacao,prazo]);}
  catch(error) {throw falhaMidia(error?.status===422?422:503);}
  finally {clearTimeout(timer);}
}
async function lerBytesMidia(response,aoCancelar) {
  if(Number(response.headers.get('Content-Length'))>MAX_MIDIA_BYTES) {
    cancelarCorpo(response.body);throw falhaMidia(422);
  }
  const reader=response.body?.getReader();
  if(!reader)throw falhaMidia();
  aoCancelar(()=>cancelarCorpo(reader));
  const chunks=[];let tamanho=0;
  try {
    while(true) {
      const {done,value}=await reader.read();
      if(done)break;
      tamanho+=value.byteLength;
      if(tamanho>MAX_MIDIA_BYTES) {cancelarCorpo(reader);throw falhaMidia(422);}
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks,tamanho);
  } finally {reader.releaseLock();}
}
function criarClienteDrive({env,repoRoot,fetchImpl=fetch,now=Date.now,timeoutMs=15000}={}) {
  let config;
  try {config=carregarCredencial({env,repoRoot});}catch {throw falhaMidia();}
  let token=null,expires=0,tokenPendente=null;
  async function obterToken() {
    const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:assinarJwtEscopo(config,now(),DRIVE_SCOPE)});
    const value=await requisitarDrive(OAUTH,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:body.toString()},fetchImpl,timeoutMs,
      async response=>validarToken(await response.json()));
    token=value.access_token;expires=now()+Math.min(value.expires_in,3600)*1000;return token;
  }
  async function acesso() {
    if(token&&now()<expires-30000)return token;
    tokenPendente??=obterToken().finally(()=>{tokenPendente=null;});
    return tokenPendente;
  }
  return {async getMidia(idDrive) {
    if(typeof idDrive!=='string'||!/^[A-Za-z0-9_-]+$/.test(idDrive))throw falhaMidia(422);
    try {
      const authorization='Bearer '+await acesso();
      return await requisitarDrive('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(idDrive)+'?alt=media',
        {method:'GET',headers:{Authorization:authorization}},fetchImpl,timeoutMs,lerBytesMidia);
    } catch(error) {throw falhaMidia(error?.status===422?422:503);}
  }};
}
module.exports={carregarConfig,assinarJwt,criarClienteGoogle,criarClienteDrive,falha,MOTIVOS};
