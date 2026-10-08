const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {temporario}=require('./fixtures.cjs');
const {capturaPrevias,imagemPng,imagemJpeg,imagemWebp,imagemPorArquivo,credencialSintetica,transporteFalso,mudarPorId,recalcularHashes}=require('./previas-fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const google=require('../src/google.cjs');
const midia=require('../src/midia.cjs');
const ERRO='Prévia indisponível';
async function ambiente(t,{captura=true,servico,editar=()=>{},download}={}) {
  const dataDir=temporario(t),raw=capturaPrevias();editar(raw);
  if(captura)assert.equal(promoverCaptura(recalcularHashes(raw),dataDir).resultado,'completa');
  const transport=transporteFalso({download:download||((url)=>{
    const id=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/^drive-sintetico-/,'');
    return new Response(imagemPorArquivo(id));
  })});
  let client;
  const criarCliente=()=>client??=google.criarClienteDrive({...credencialSintetica(t),fetchImpl:transport.fetchImpl});
  const service=servico||(midia.criarServicoMidia?.({dataDir,criarCliente})||{obter:async()=>{throw new Error('Serviço ainda não implementado');}});
  const server=criarServidor({dataDir,port:0,midia:service});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return {server,port:server.address().port,dataDir,transport};
}
function request(port,url,method='GET',headers={}) {
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:url,method,headers},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,bytes:Buffer.concat(chunks)}));
      res.on('error',reject);res.on('aborted',()=>reject(new Error('Resposta local interrompida')));
    });req.setTimeout(5000,()=>req.destroy(new Error('Tempo limite da requisição local')));
    req.on('error',reject);req.end();
  });
}
function headersPrivados(response) {
  assert.equal(response.headers['x-content-type-options'],'nosniff');
  assert.equal(response.headers['cache-control'],'no-store');
  assert.equal(response.headers['cross-origin-resource-policy'],'same-origin');
  assert.equal(response.headers['access-control-allow-origin'],undefined);
  assert.match(response.headers['content-security-policy'],/img-src 'self';/);
  assert.doesNotMatch(JSON.stringify(response.headers),/sentinela|example\.invalid|drive-sintetico|Bearer|stack/);
}
function erro(response,status,{head=false}={}) {
  assert.equal(response.status,status);headersPrivados(response);
  assert.match(response.headers['content-type'],/^text\/plain; charset=utf-8$/);
  assert.equal(response.bytes.toString('utf8'),head?'':ERRO);
}
function bytesEstado(dataDir) {
  return Object.fromEntries(['capturas','tentativas'].map(folder=>[folder,
    Object.fromEntries(fs.readdirSync(path.join(dataDir,folder)).sort().map(file=>
      [file,fs.readFileSync(path.join(dataDir,folder,file))]))]));
}
test('HTTP mídia serve bytes da captura com cliente nativo falso e cache, sem escrever captura/recibos',async t=>{
  const a=await ambiente(t),pointer=path.join(a.dataDir,'atual.json'),before=fs.readFileSync(pointer);
  const files=bytesEstado(a.dataDir);
  const response=await request(a.port,'/api/midia/imagem-pagina-1');
  assert.equal(response.status,200);headersPrivados(response);
  assert.equal(response.headers['content-type'],'image/png');assert.deepEqual(response.bytes,imagemPorArquivo('imagem-pagina-1'));
  assert.equal(a.transport.calls.length,2);
  const again=await request(a.port,'/api/midia/imagem-pagina-1');assert.deepEqual(again.bytes,response.bytes);
  assert.equal(a.transport.calls.length,2);assert.deepEqual(fs.readFileSync(pointer),before);
  assert.deepEqual(bytesEstado(a.dataDir),files);
  const view=await request(a.port,'/api/visao');assert.equal(view.status,200);assert.equal(a.transport.calls.length,2);
});
test('HTTP mídia aceita ID interno codificado uma vez, sem interpretar como ID remoto',async t=>{
  const id='imagem interna á-1',a=await ambiente(t,{editar:raw=>{
    mudarPorId(raw,'Arquivos','imagem-pagina-1','arquivo_id',id);
    mudarPorId(raw,'Páginas','pagina-v3-1','arquivo_imagem_id',id);
  }});
  assert.equal((await request(a.port,'/api/midia/'+encodeURIComponent(id))).status,200);
  const calls=a.transport.calls.length;
  for(const entry of ['drive-sintetico-imagem-pagina-1','ausente','imagem%252Dpagina%252D1']) {
    erro(await request(a.port,'/api/midia/'+entry),404);
  }
  assert.equal(a.transport.calls.length,calls);
});
test('HTTP mídia forma inválida é recusada antes do serviço, sem proxy por URL ou caminho',async t=>{
  let calls=0;const a=await ambiente(t,{servico:{obter:async()=>{calls++;return {bytes:imagemPng(),contentType:'image/png'};}}});
  for(const url of ['/api/midia','/api/midia/','/api/midia/id?drive=sentinela','/api/midia/id/extra','/api/midia/%ZZ',
    '/api/midia/%2Fetc','/api/midia/%5Cprivado','/api/midia/..','/api/midia/https%3A%2F%2Fdrive.google.com',
    '/api/midia/C%3A%5Cprivado','/api/midia/%00'])erro(await request(a.port,url),400);
  assert.equal(calls,0);
});
test('HTTP mídia Host/Origin/Sec-Fetch-Site precedem método, resolução e serviço',async t=>{
  let calls=0;const a=await ambiente(t,{servico:{obter:async()=>{calls++;return {bytes:imagemPng(),contentType:'image/png'};}}});
  for(const headers of [{Host:'externo.invalid'},{Origin:'https://externo.invalid'},{'Sec-Fetch-Site':'cross-site'},{'Sec-Fetch-Site':'same-site'}]) {
    for(const method of ['GET','POST'])erro(await request(a.port,'/api/midia/ausente',method,headers),403);
  }
  assert.equal(calls,0);
  for(const headers of [{},{'Sec-Fetch-Site':'none'},{'Sec-Fetch-Site':'same-origin',Origin:'http://127.0.0.1:'+a.port}]) {
    assert.equal((await request(a.port,'/api/midia/id','GET',headers)).status,200);
  }
  assert.equal(calls,3);
});
test('HTTP mídia GET exclusivo, HEAD/POST/PUT/DELETE/OPTIONS não consultam serviço',async t=>{
  let calls=0;const a=await ambiente(t,{servico:{obter:async()=>{calls++;throw new Error('sentinela');}}});
  for(const method of ['HEAD','POST','PUT','DELETE','OPTIONS']) {
    const response=await request(a.port,'/api/midia/imagem-pagina-1',method);
    erro(response,405,{head:method==='HEAD'});assert.equal(response.headers.allow,'GET');
  }
  assert.equal(calls,0);
});
test('HTTP mídia recusa captura/registro/bytes sem vazar detalhes do provedor',async t=>{
  const empty=await ambiente(t,{captura:false});erro(await request(empty.port,'/api/midia/imagem-pagina-1'),503);
  assert.equal(empty.transport.calls.length,0);
  const invalid=await ambiente(t,{editar:raw=>mudarPorId(raw,'Arquivos','imagem-pagina-1','sha256','invalido')});
  erro(await request(invalid.port,'/api/midia/imagem-pagina-1'),422);assert.equal(invalid.transport.calls.length,0);
  const outside=await ambiente(t,{editar:raw=>mudarPorId(raw,'Produções','peca-3','marca_id','outra')});
  erro(await request(outside.port,'/api/midia/imagem-pagina-1'),404);assert.equal(outside.transport.calls.length,0);
  for(const [download,status] of [[async()=>new Response('sentinela-Google',{status:403}),503],
    [async()=>{throw new Error('sentinela@example.invalid');},503],
    [async()=>new Response('<svg>sentinela</svg>'),422],[async()=>new Response(imagemPng({cor:[1,2,3]})),422]]) {
    const a=await ambiente(t,{download});erro(await request(a.port,'/api/midia/imagem-pagina-1'),status);
  }
});
test('HTTP mídia deriva PNG/JPEG/WEBP dos bytes e saneia status/erros inesperados',async t=>{
  for(const [bytes,contentType] of [[imagemPng(),'image/png'],[imagemJpeg(),'image/jpeg'],[imagemWebp(),'image/webp']]) {
    const a=await ambiente(t,{editar:raw=>mudarPorId(raw,'Arquivos','imagem-pagina-1','sha256',''),download:async()=>new Response(bytes,{headers:{'Content-Type':'text/html'}})});
    const response=await request(a.port,'/api/midia/imagem-pagina-1');assert.equal(response.status,200);
    headersPrivados(response);assert.equal(response.headers['content-type'],contentType);assert.deepEqual(response.bytes,bytes);
  }
  for(const status of [404,422,503,401,200,undefined]) {
    const a=await ambiente(t,{servico:{obter:async()=>{throw Object.assign(new Error('sentinela@example.invalid /privado'),{status});}}});
    erro(await request(a.port,'/api/midia/id'),[404,422,503].includes(status)?status:503);
  }
});
test('HTTP mídia composição padrão sem credencial falha genericamente, sem fetch',async t=>{
  const dataDir=temporario(t);assert.equal(promoverCaptura(capturaPrevias(),dataDir).resultado,'completa');
  const saved=['CRM_GOOGLE_CREDENTIALS_FILE','CRM_SPREADSHEET_ID'].map(key=>[key,process.env[key]]);
  for(const [key] of saved)delete process.env[key];
  t.after(()=>{for(const [key,value] of saved) {if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  const spy=t.mock.method(globalThis,'fetch',async()=>{throw new Error('Rede real bloqueada');});
  const server=criarServidor({dataDir,port:0});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  erro(await request(server.address().port,'/api/midia/imagem-pagina-1'),503);assert.equal(spy.mock.callCount(),0);
});
