const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const http=require('node:http');
const {temporario,capturaValida}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');

async function servidor(t) {
  const dir=temporario(t),raw=capturaValida();
  assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  let updates=0;
  const server=criarServidor({dataDir:dir,port:0,atualizar:async()=>{updates++;return {resultado:'sem_alteracao'};}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return {dir,origin:'http://127.0.0.1:'+server.address().port,updates:()=>updates};
}
function bytesDiretorio(dir) {
  return Object.fromEntries(fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const file=path.join(dir,entry.name);
    return entry.isDirectory()?Object.entries(bytesDiretorio(file)).map(([name,hash])=>[entry.name+'/'+name,hash]):
      [[entry.name,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]];
  }));
}
function statusComHost(url,host) {
  return new Promise((resolve,reject)=>{
    const req=http.get(url,{headers:{Host:host}},res=>{res.resume();resolve(res.statusCode);});req.on('error',reject);
  });
}
test('layout A: modelo estático tem GET/HEAD, MIME, CSP e corpo sem dados privados',async t=>{
  const context=await servidor(t),url=context.origin+'/layout-model.js';
  const response=await fetch(url),body=await response.text();
  assert.equal(response.status,200);
  assert.match(response.headers.get('content-type'),/^text\/javascript/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.equal(response.headers.get('cache-control'),'no-store');
  assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);
  assert.doesNotMatch(body,/sentinela-nao-publicar|captura-sintetica-01/);
  const head=await fetch(url,{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(await head.text(),'');
});
test('layout A: estático recusa Host/Origin externos e métodos de escrita',async t=>{
  const {origin}=await servidor(t),url=origin+'/layout-model.js';
  assert.equal(await statusComHost(url,'example.invalid'),403);
  assert.equal((await fetch(url,{headers:{Origin:'https://example.invalid'}})).status,403);
  const post=await fetch(url,{method:'POST'});
  assert.equal(post.status,405);assert.equal(post.headers.get('allow'),'GET, HEAD');
  assert.equal((await fetch(origin+'/perfil-config.js')).status,200);
  assert.equal((await fetch(origin+'/instagram.js')).status,200);
});
test('layout A: consulta e estáticos preservam bytes/recibos e todos os dados da API',async t=>{
  const context=await servidor(t),before=bytesDiretorio(context.dir);
  const view=await (await fetch(context.origin+'/api/visao')).json();
  assert.equal(view.schemaVersion,1);assert.equal(view.planilha.length,6);
  assert.ok(Array.isArray(view.avisos));assert.ok(Array.isArray(view.historico));
  assert.ok(view.producoes[0].responsavel_atual);
  for(const route of ['/','/app.js','/styles.css','/theme.js','/layout-model.js','/perfil-config.js','/instagram.js']) {
    assert.equal((await fetch(context.origin+route)).status,200);
  }
  assert.deepEqual(await (await fetch(context.origin+'/api/visao')).json(),view);
  assert.deepEqual(bytesDiretorio(context.dir),before);assert.equal(context.updates(),0);
});
test('layout A: POST explícito mantém contrato e no-op conserva captura',async t=>{
  const context=await servidor(t),before=bytesDiretorio(context.dir);
  const result=await fetch(context.origin+'/api/atualizar',{method:'POST',
    headers:{Origin:context.origin,'Content-Type':'application/json'},body:'{}'});
  assert.equal(result.status,200);assert.equal((await result.json()).resultado,'sem_alteracao');
  assert.equal(context.updates(),1);
  assert.deepEqual(bytesDiretorio(context.dir),before);
});
for(const route of ['/perfil-config.js','/instagram.js'])test('Layout B estático '+route+' tem GET/HEAD e guardas HTTP completas',async t=>{
  const {origin}=await servidor(t),url=origin+route,response=await fetch(url),body=await response.text();
  assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^text\/javascript/);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('cache-control'),'no-store');
  assert.match(response.headers.get('content-security-policy'),/script-src 'self'/);
  assert.doesNotMatch(body,/sentinela-nao-publicar|captura-sintetica-01/);
  const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal(await statusComHost(url,'example.invalid'),403);
  assert.equal((await fetch(url,{headers:{Origin:'https://example.invalid'}})).status,403);
  for(const method of ['POST','PUT','DELETE']){const res=await fetch(url,{method});assert.equal(res.status,405);assert.equal(res.headers.get('allow'),'GET, HEAD');}
  assert.equal((await fetch(origin+'/config/')).status,404);
});
