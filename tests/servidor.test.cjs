const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,mapaQuadroValido,temporario,carregarModulo,mudarCelula}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=carregarModulo('src/servidor.cjs',['criarServidor']);
async function ambiente(t,captura=true) {
  const root=temporario(t), webDir=path.join(root,'web'), dataDir=path.join(root,'privado'), quadroConfigPath=path.join(root,'mapa.json');
  fs.mkdirSync(webDir); fs.mkdirSync(dataDir);
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  for (const name of ['index.html','app.js','styles.css','extra.txt']) fs.writeFileSync(path.join(webDir,name),'estático sintético '+name);
  if (captura) promoverCaptura(capturaValida(),dataDir);
  const server=criarServidor({dataDir,port:0,webDir,quadroConfigPath});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return {server,dataDir,port:server.address().port};
}
function request(port,url='/',method='GET',headers={}) {
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:url,method,headers},res=>{
      const chunks=[]; res.on('data',c=>chunks.push(c)); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });
    req.on('error',reject);req.end();
  });
}
test('H01 consulta real seleciona campos e não escreve no estado', async t => {
  const {port,dataDir,server}=await ambiente(t);
  assert.equal(server.address().address,'127.0.0.1');
  const before=fs.readFileSync(path.join(dataDir,'atual.json'),'utf8');
  const r=await request(port,'/api/visao');
  assert.equal(r.status,200); assert.match(r.headers['content-type'],/application\/json/);
  assert.match(r.headers['cache-control'],/no-store/);
  const body=JSON.parse(r.body);
  assert.equal(body.producoes.length,4);
  assert.doesNotMatch(r.body,/sentinela-nao-publicar|metadataBefore|spreadsheetId/);
  assert.equal(fs.readFileSync(path.join(dataDir,'atual.json'),'utf8'),before);
});
test('H01 ausência estruturada não vira dados de demonstração', async t => {
  const {port}=await ambiente(t,false);
  const body=JSON.parse((await request(port,'/api/visao')).body);
  assert.equal(body.estado,'sem_captura');assert.deepEqual(body.producoes,[]);
});

test('H-review I1 JSON de /api/visao não entrega credenciais em URLs registradas', async t=>{
  for(const url of ['https://usuario-sintetico:senha-sintetica@drive.google.com/x','https://usuario-sintetico:senha-sintetica@docs.google.com:porta-invalida']) {
  const {port,dataDir}=await ambiente(t,false),raw=capturaValida();
  mudarCelula(raw,'Arquivos',1,'url',url);mudarCelula(raw,'Produções',1,'url_video_final',url);
  promoverCaptura(raw,dataDir);
  const response=await request(port,'/api/visao');
  assert.equal(response.status,200);assert.doesNotMatch(response.body,/usuario-sintetico|senha-sintetica/);
  const body=JSON.parse(response.body);
  assert.equal(body.producoes[0].url_video_final,'[conteúdo suprimido]');
  assert.equal(body.producoes[0].detalhes.arquivos[0].url,'[conteúdo suprimido]');
  }
});
test('H02 três estáticos fixos têm bytes/HEAD corretos, extras nunca são servidos', async t => {
  const {port}=await ambiente(t);
  for (const [url,file] of [['/','index.html'],['/app.js','app.js'],['/styles.css','styles.css']]) {
    const get=await request(port,url);
    assert.equal(get.status,200); assert.equal(get.body,'estático sintético '+file);
    const head=await request(port,url,'HEAD');
    assert.equal(head.status,200); assert.equal(head.body,'');
    assert.equal(head.headers['content-type'],get.headers['content-type']);
  }
  assert.equal((await request(port,'/extra.txt')).status,404);
});
test('H03 métodos de escrita são 405, sem endpoint de importação', async t => {
  const {port}=await ambiente(t);
  for (const method of ['POST','PUT','DELETE','PATCH','OPTIONS']) {
    const r=await request(port,'/api/visao',method);
    assert.equal(r.status,405); assert.equal(r.headers.allow,'GET, HEAD');
  }
  assert.equal((await request(port,'/api/importar')).status,404);
});
test('H03 privados e traversal literal/codificado são 404', async t => {
  const {port}=await ambiente(t);
  for (const url of ['/data/atual.json','/.specify/memory/constitution.md','/.agents/skills/doc-init/SKILL.md','/../app.js','/%2e%2e/app.js','/%2e%2e%2fdata/atual.json','/app.js%00','/%252e%252e/app.js','/config/quadro-etapas.json']) {
    assert.equal((await request(port,url)).status,404,url);
  }
});
test('H04 Host e Origin externos são recusados, sem CORS externo', async t => {
  const {port}=await ambiente(t);
  for (const headers of [{Host:'externo.invalid'},{Host:'localhost:'+port},{Origin:'https://externo.invalid'},{Origin:'null'}]) {
    const r=await request(port,'/api/visao','GET',headers);
    assert.equal(r.status,403); assert.equal(r.headers['access-control-allow-origin'],undefined);
  }
  const local=await request(port,'/api/visao','GET',{Origin:'http://127.0.0.1:'+port});
  assert.equal(local.status,200);
});
test('H04 mapa inválido impede criar servidor; query nunca seleciona configuração', async t => {
  const root=temporario(t), map=path.join(root,'invalido.json');
  fs.writeFileSync(map,'{}');
  assert.throws(()=>criarServidor({dataDir:root,port:0,quadroConfigPath:map}),/configuração/);
  const {port}=await ambiente(t);
  const r=await request(port,'/api/visao?quadroConfigPath='+encodeURIComponent(map));
  assert.equal(r.status,200);
});
