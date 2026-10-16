const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const {temporario,recalcularHashes}=require('./fixtures.cjs');
const {mudarPorId,imagemPng}=require('./previas-fixtures.cjs');
const {capturaVideo,videoMp4}=require('./video-fixtures.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const {criarServicoMidia}=require('../src/midia.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const ID='video-final-sintetico',URL='/api/video/'+ID;
function request(port,url=URL,method='GET',headers={}) {
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:url,method,headers},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));res.on('error',reject);
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,bytes:Buffer.concat(chunks)}));
    });req.on('error',reject);req.setTimeout(5000,()=>req.destroy(new Error('timeout local')));req.end();
  });
}
async function ambiente(t,{editar=()=>{},download=async()=>videoMp4(),servico}={}) {
  const dataDir=temporario(t),raw=capturaVideo();editar(raw);assert.equal(promoverCaptura(recalcularHashes(raw),dataDir).resultado,'completa');
  let calls=0;const midia=servico||criarServicoMidia({dataDir,criarCliente:()=>({getMidia:async()=>{calls++;return download();}})});
  const server=criarServidor({port:0,dataDir,midia});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));return {port:server.address().port,calls:()=>calls};
}
function privados(response) {
  assert.equal(response.headers['cache-control'],'no-store');assert.equal(response.headers['x-content-type-options'],'nosniff');
  assert.equal(response.headers['cross-origin-resource-policy'],'same-origin');assert.equal(response.headers['access-control-allow-origin'],undefined);
  assert.match(response.headers['content-security-policy'],/media-src 'self';/);
  assert.doesNotMatch(JSON.stringify(response.headers),/Bearer|drive-sintetico|token|sentinela/);
}
function erro(response,status,head=false) {assert.equal(response.status,status);privados(response);assert.equal(response.bytes.toString(),head?'':'Prévia indisponível');}
test('VH01 GET e HEAD servem MP4 local com comprimento, faixa e segurança; HEAD ignora Range',async t=>{
  const a=await ambiente(t),bytes=videoMp4();
  for(const method of ['GET','HEAD']) {
    const response=await request(a.port,URL,method,method==='HEAD'?{Range:'bytes=invalid'}:{});
    assert.equal(response.status,200);privados(response);assert.equal(response.headers['content-type'],'video/mp4');
    assert.equal(response.headers['accept-ranges'],'bytes');assert.equal(response.headers['content-length'],String(bytes.length));
    assert.equal(response.headers['content-range'],undefined);assert.deepEqual(response.bytes,method==='HEAD'?Buffer.alloc(0):bytes);
  }
  assert.equal(a.calls(),1);
});
test('VH02 GET suporta início-fim, aberto e sufixo sem confiar em números fora de precisão',async t=>{
  const a=await ambiente(t),bytes=videoMp4(),n=bytes.length;
  for(const [range,start,end] of [['bytes=0-0',0,0],['bytes=10-19',10,19],['bytes=15-',15,n-1],['bytes=-12',n-12,n-1],['bytes=0-999999',0,n-1],['bytes=-999999',0,n-1]]) {
    const response=await request(a.port,URL,'GET',{Range:range});assert.equal(response.status,206);privados(response);
    assert.equal(response.headers['content-type'],'video/mp4');assert.equal(response.headers['accept-ranges'],'bytes');
    assert.equal(response.headers['content-range'],`bytes ${start}-${end}/${n}`);assert.equal(response.headers['content-length'],String(end-start+1));
    assert.deepEqual(response.bytes,bytes.subarray(start,end+1));
  }
  assert.equal(a.calls(),1);
});
test('VH03 faixa múltipla, malformada, vazia ou insatisfeita devolve 416 com tamanho total',async t=>{
  const a=await ambiente(t),n=videoMp4().length;
  for(const range of ['bytes=0-1,3-4','items=0-1','bytes=','bytes=-','bytes=-0','bytes=20-10',`bytes=${n}-`,'bytes=9007199254740992-','bytes=1.5-4','bytes=+1-4']) {
    const response=await request(a.port,URL,'GET',{Range:range});erro(response,416);
    assert.equal(response.headers['content-range'],`bytes */${n}`);assert.equal(response.headers['accept-ranges'],'bytes');
    assert.equal(Number(response.headers['content-length']),response.bytes.length);
  }
});
test('VH04 origem e método inválidos precedem resolução e não consultam serviço',async t=>{
  let calls=0;const a=await ambiente(t,{servico:{obterVideo:async()=>{calls++;return {bytes:videoMp4(),contentType:'video/mp4'};}}});
  for(const headers of [{Host:'localhost:'+a.port},{Origin:'https://externo.invalid'},{'Sec-Fetch-Site':'same-site'},{'Sec-Fetch-Site':'cross-site'}])erro(await request(a.port,URL,'GET',headers),403);
  for(const method of ['POST','PUT','DELETE','OPTIONS']) {const response=await request(a.port,URL,method);erro(response,405);assert.equal(response.headers.allow,'GET, HEAD');}
  for(const url of ['/api/video','/api/video/','/api/video/..','/api/video/a%2Fb','/api/video/a%5Cb','/api/video/https%3A%2F%2Fx','/api/video/%00','/api/video/%ZZ',URL+'?maxBytes=1','/api/video/a#fragment'])erro(await request(a.port,url),400);
  assert.equal(calls,0);
});
test('VH05 ID interno decodificado uma vez; ID remoto não concede acesso e captura errada falha',async t=>{
  const a=await ambiente(t);assert.equal((await request(a.port,'/api/video/%76ideo-final-sintetico')).status,200);
  erro(await request(a.port,'/api/video/drive-sintetico-'+ID),404);erro(await request(a.port,'/api/video/%2576ideo-final-sintetico'),404);
  const wrong=await ambiente(t,{editar:raw=>mudarPorId(raw,'Arquivos',ID,'tipo','imagem')});erro(await request(wrong.port),422);assert.equal(wrong.calls(),0);
  const invalid=await ambiente(t,{download:async()=>imagemPng()});erro(await request(invalid.port),422);
});
test('VH06 erros inesperados ficam sanitizados; HEAD de erro não contém corpo',async t=>{
  for(const status of [404,422,503,401,200,undefined]) {
    const a=await ambiente(t,{servico:{obterVideo:async()=>{throw Object.assign(new Error('Bearer sentinela /privado'),{status});}}});
    erro(await request(a.port),[404,422,503].includes(status)?status:503);
    erro(await request(a.port,URL,'HEAD'),[404,422,503].includes(status)?status:503,true);
  }
});
