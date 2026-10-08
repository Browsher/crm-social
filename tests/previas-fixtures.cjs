// Somente bytes, referências e credenciais sintéticos, gerados localmente no teste.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const zlib=require('node:zlib');
const {capturaVersoes,mudarPorId}=require('./versoes-fixtures.cjs');
const {temporario,recalcularHashes}=require('./fixtures.cjs');
const OAUTH='https://oauth2.googleapis.com/token';
function crc32(bytes) {
  let crc=0xffffffff;
  for(const byte of bytes) {crc^=byte;for(let n=0;n<8;n++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}
  return (crc^0xffffffff)>>>0;
}
function chunk(tipo,bytes) {
  const nome=Buffer.from(tipo),size=Buffer.alloc(4),crc=Buffer.alloc(4);
  size.writeUInt32BE(bytes.length);crc.writeUInt32BE(crc32(Buffer.concat([nome,bytes])));
  return Buffer.concat([size,nome,bytes,crc]);
}
function imagemPng({width=120,height=90,cor=[66,127,159]}={}) {
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=8;header[9]=2;
  const rows=Buffer.alloc(height*(1+width*3));
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const offset=y*(1+width*3)+1+x*3;
    for(let c=0;c<3;c++)rows[offset+c]=(cor[c]+Math.floor(x*35/width)+Math.floor(y*15/height))%256;
  }
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
const imagemJpeg=()=>Buffer.from([0xff,0xd8,0xff,0xe0,0,4,0,0,0xff,0xd9]);
const imagemWebp=()=>Buffer.from([0x52,0x49,0x46,0x46,4,0,0,0,0x57,0x45,0x42,0x50]);
const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function imagemPorArquivo(arquivoId) {
  const match=/imagem-pagina-(\d+)$/.exec(arquivoId),n=match?Number(match[1]):1;
  return imagemPng({cor:[(n*39)%190+30,(n*61)%170+35,(n*83)%160+40]});
}
function capturaPrevias() {
  const raw=capturaVersoes(),table=raw.tables.Arquivos,headers=table.values[0];
  for(const row of table.values.slice(1)) {
    const id=row[headers.indexOf('arquivo_id')];
    row[headers.indexOf('id_drive')]='drive-sintetico-'+id;
    row[headers.indexOf('sha256')]=row[headers.indexOf('tipo')]==='imagem'?sha256(imagemPorArquivo(id)):'';
  }
  return recalcularHashes(raw);
}
function credencialSintetica(t,{spreadsheet=false}={}) {
  const root=temporario(t),repoRoot=path.join(root,'repo'),file=path.join(root,'credencial-sintetica.json');
  const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048});fs.mkdirSync(repoRoot);
  const credentials={type:'service_account',client_email:['leitor-sintetico','example.invalid'].join('@'),private_key:pair.privateKey.export({type:'pkcs8',format:'pem'})};
  fs.writeFileSync(file,JSON.stringify(credentials));
  return {env:{CRM_GOOGLE_CREDENTIALS_FILE:file,...(spreadsheet?{CRM_SPREADSHEET_ID:'fonte-sintetica'}:{})},repoRoot,pair,credentials,root};
}
function respostaStream(chunks,{status=200,headers={},stall=false,signal,onCancel=()=>{}}={}) {
  let index=0;
  const body=new ReadableStream({
    start(controller) {signal?.addEventListener('abort',()=>controller.error(signal.reason),{once:true});},
    pull(controller) {if(index<chunks.length)controller.enqueue(chunks[index++]);else if(!stall)controller.close();},
    cancel(reason) {onCancel(reason);}
  });
  return new Response(body,{status,headers});
}
function transporteFalso({oauth,download,bytes=imagemPng()}={}) {
  const calls=[];
  async function fetchImpl(url,options) {
    calls.push({url:String(url),options});
    if(String(url)===OAUTH)return oauth?oauth(url,options,calls):Response.json({access_token:'token-sintetico',token_type:'Bearer',expires_in:3600});
    const parsed=new URL(url);
    if(parsed.hostname!=='www.googleapis.com'&&parsed.hostname!=='sheets.googleapis.com')throw new Error('Rede real bloqueada pelo teste');
    return download?download(url,options,calls):respostaStream([bytes],{signal:options.signal});
  }
  return {fetchImpl,calls};
}
module.exports={capturaPrevias,mudarPorId,recalcularHashes,imagemPng,imagemJpeg,imagemWebp,imagemPorArquivo,sha256,credencialSintetica,respostaStream,transporteFalso,OAUTH};
