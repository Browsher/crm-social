const {test}=require('node:test');
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,capturaPlanilha,mapaQuadroValido,temporario,carregarModulo,mudarCelula,redefinirHorario,campos,recalcularHashes}=require('./fixtures.cjs');
const {promoverCaptura,registrarFalhaEntrada,lerEstado,atualizarCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=carregarModulo('src/servidor.cjs',['criarServidor']);
const {capturaMeses}=require('./fixtures.cjs');
const {coletarCaptura}=require('../src/coleta.cjs');
test('H003 POST coleta Meses, GET não busca rede e falha conserva bytes/horário',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-05T12:00:00Z')});
  let dataDir,calls=0,invalid=false;
  const raw=capturaMeses(),client={spreadsheetId:raw.spreadsheetId,
    async getMetadata(){calls++;return {spreadsheetId:raw.spreadsheetId,properties:{timeZone:'America/Sao_Paulo'},sheets:Object.entries(raw.metadataBefore).map(([title,m])=>({properties:{title,sheetId:m.sheetId,gridProperties:m}}))};},
    async batchGet(ranges){calls++;return {spreadsheetId:raw.spreadsheetId,valueRanges:Object.values(raw.tables).map((tab,i)=>({range:invalid&&i===6?"'Meses'!A1:D19":ranges[i],majorDimension:'ROWS',values:tab.values}))};}
  };
  const a=await ambiente(t,true,{atualizar:()=>atualizarCaptura(dataDir,()=>coletarCaptura(client,{capturaId:invalid?'mensal-http-invalida':'mensal-http'}))});dataDir=a.dataDir;
  const post=()=>request(a.port,'/api/atualizar','POST',{Origin:'http://127.0.0.1:'+a.port,'Content-Type':'application/json'},'{}');
  assert.equal((await post()).status,200);
  const view=JSON.parse((await request(a.port,'/api/visao')).body);
  assert.equal(view.planilha.at(-1).nome,'Meses');assert.equal(view.planilha.at(-1).linhas[0].objetivo,'Organizar conteúdo sintético');
  assert.equal(calls,4);
  const file=path.join(dataDir,'capturas','mensal-http.json'),before=fs.readFileSync(file);invalid=true;
  const failed=await post();assert.equal(failed.status,422);assert.equal(JSON.parse(failed.body).categoria,'dados');
  assert.deepEqual(fs.readFileSync(file),before);
  const confirmed=JSON.parse((await request(a.port,'/api/visao')).body);
  assert.deepEqual(confirmed.captura,view.captura);assert.deepEqual(confirmed.planilha,view.planilha);
  assert.equal(lerEstado(dataDir).ultimaTentativa.resultado,'falhou');
});
async function ambiente(t,captura=true,options={}) {
  const root=temporario(t), webDir=path.join(root,'web'), dataDir=path.join(root,'privado'), quadroConfigPath=path.join(root,'mapa.json');
  fs.mkdirSync(webDir); fs.mkdirSync(dataDir);
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  for (const name of ['index.html','app.js','theme.js','styles.css','extra.txt']) fs.writeFileSync(path.join(webDir,name),'estático sintético '+name);
  if (captura) promoverCaptura(capturaValida(),dataDir);
  const server=criarServidor({dataDir,port:0,webDir,quadroConfigPath,...options});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  return {server,dataDir,port:server.address().port};
}
function request(port,url='/',method='GET',headers={},body='') {
  return new Promise((resolve,reject)=>{
    const req=http.request({hostname:'127.0.0.1',port,path:url,method,headers},res=>{
      const chunks=[]; res.on('data',c=>chunks.push(c)); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });
    req.on('error',reject);req.end(body);
  });
}
test('Htema script externo permitido, HEAD e guards com CSP preservada',async t=>{
  const {port}=await ambiente(t,false);
  const response=await request(port,'/theme.js');
  assert.equal(response.status,200);
  assert.equal(response.body,'estático sintético theme.js');
  assert.match(response.headers['content-type'],/text\/javascript/);
  assert.match(response.headers['content-security-policy'],/script-src 'self';/);
  assert.doesNotMatch(response.headers['content-security-policy'],/unsafe-inline/);
  const head=await request(port,'/theme.js','HEAD');
  assert.equal(head.status,200);assert.equal(head.body,'');
  assert.equal((await request(port,'/theme.js','POST')).status,405);
  assert.equal((await request(port,'/theme.js','GET',{Host:'externo.invalid'})).status,403);
});
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
test('H002 POST local permitido; guards antes do callback e GET sem rede',async t=>{
  let calls=0;const {port}=await ambiente(t,true,{atualizar:async()=>{calls++;return {resultado:'completa'};}});
  const headers={Origin:'http://127.0.0.1:'+port,'Content-Type':'application/json'};
  assert.equal((await request(port,'/api/visao')).status,200);assert.equal(calls,0);
  const ok=await request(port,'/api/atualizar','POST',headers,'{}');assert.equal(ok.status,200);
  assert.equal(JSON.parse(ok.body).mensagem,'Dados atualizados');assert.equal(calls,1);
  for(const [url,method,h,body,status] of [
    ['/api/atualizar','POST',{'Content-Type':'application/json'},'{}',403],
    ['/api/atualizar','POST',{...headers,Origin:'https://fora.invalid'},'{}',403],
    ['/api/atualizar','POST',{...headers,Host:'fora.invalid'},'{}',403],
    ['/api/atualizar','POST',{...headers,'Content-Type':'text/plain'},'{}',415],
    ['/api/atualizar','POST',headers,'{',400],['/api/atualizar','POST',headers,'{"id":"externo"}',400],
    ['/api/atualizar?x=y','POST',headers,'{}',400],['/api/atualizar','POST',headers,'[]',400],
    ['/api/atualizar','POST',headers,' '.repeat(1025),413],['/api/atualizar','PUT',headers,'{}',405]
  ])assert.equal((await request(port,url,method,h,body)).status,status);
  assert.equal(calls,1);
});

test('H002 composicao padrao sem configuracao confirma falha sem fetch e preserva captura',async t=>{
  const keys=['CRM_GOOGLE_CREDENTIALS_FILE','CRM_SPREADSHEET_ID'];
  const saved=keys.map(key=>[key,process.env[key]]);
  t.after(()=>{for(const [key,value] of saved){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
  for(const key of keys)delete process.env[key];
  const spy=t.mock.method(globalThis,'fetch',()=>{throw new Error('rede nao permitida no teste');});
  const {port,dataDir}=await ambiente(t);
  // Uma falha ativa nao deve virar frescor/sucesso por causa de POST ou GET.
  registrarFalhaEntrada(dataDir,'ENTRADA_JSON');
  const pointer=path.join(dataDir,'atual.json'),beforeBytes=fs.readFileSync(pointer),before=JSON.parse(beforeBytes);
  const file=path.join(dataDir,'capturas',before.capturaId+'.json'),bytes=fs.readFileSync(file);
  const completedAt=lerEstado(dataDir).captura.envelope.completedAt;
  const initial=await request(port,'/api/visao');assert.equal(initial.status,200);
  const initialView=JSON.parse(initial.body);
  assert.deepEqual(fs.readFileSync(pointer),beforeBytes);
  const response=await request(port,'/api/atualizar','POST',{Origin:'http://127.0.0.1:'+port,'Content-Type':'application/json'},'{}');
  assert.equal(response.status,503);
  assert.deepEqual(JSON.parse(response.body),{resultado:'falhou',mensagem:'Configuração da leitura indisponível',categoria:'configuracao',registrada:true,avisos:[]});
  const state=lerEstado(dataDir);
  assert.equal(state.ultimaTentativa.resultado,'falhou');
  assert.equal(state.ultimaTentativa.motivoResumo,'Configuração da leitura indisponível');
  assert.equal(state.historico.length,before.historicoIds.length+1);
  assert.deepEqual(fs.readFileSync(file),bytes);
  assert.equal(state.captura.envelope.completedAt,completedAt);
  assert.equal(state.estado.capturaId,before.capturaId);
  assert.deepEqual(JSON.parse(fs.readFileSync(pointer,'utf8')),{
    ...before,ultimaTentativaId:state.ultimaTentativa.tentativaId,
    historicoIds:[...before.historicoIds,state.ultimaTentativa.tentativaId]
  });
  const receipt=JSON.parse(fs.readFileSync(path.join(dataDir,'tentativas',state.ultimaTentativa.tentativaId+'.json'),'utf8'));
  assert.deepEqual(receipt,state.ultimaTentativa);
  const confirmedBytes=fs.readFileSync(pointer),after=await request(port,'/api/visao');
  assert.equal(after.status,200);const view=JSON.parse(after.body);
  assert.deepEqual(view.captura,initialView.captura);
  assert.equal(view.captura.completedAt,completedAt);
  assert.equal(view.estado,'falha_atualizacao');
  assert.deepEqual(view.selo,initialView.selo);
  assert.deepEqual(view.selo,{texto:'Atualização falhou',cor:'vermelho',destino:'planilha'});
  const reread=JSON.parse((await request(port,'/api/visao')).body);
  assert.deepEqual(reread.captura,view.captura);assert.deepEqual(reread.selo,view.selo);
  assert.deepEqual(fs.readFileSync(pointer),confirmedBytes);
  assert.deepEqual(fs.readFileSync(file),bytes);
  assert.equal(spy.mock.callCount(),0);
});
test('H002 categorias e I/O retornam somente motivo fixo; nenhum dado privado',async t=>{
  for(const categoria of ['configuracao','acesso','rede','dados',null]){
    const {port}=await ambiente(t,true,{atualizar:async()=>{
      if(!categoria)throw new Error('sentinela-privada');
      return {resultado:'falhou',categoria,motivoResumo:'sentinela-privada',spreadsheetId:'privado',avisos:['falha ao liberar a trava; confira o estado local']};
    }});
    const r=await request(port,'/api/atualizar','POST',{Origin:'http://127.0.0.1:'+port,'Content-Type':'application/json'},'{}');
    assert.equal(r.status,categoria==='dados'?422:503);assert.doesNotMatch(r.body,/sentinela-privada|spreadsheetId|stack/);
    assert.equal(JSON.parse(r.body).registrada,!!categoria);
    assert.equal((await request(port,'/api/visao')).status,200);
  }
});
test('H002 erro original e aviso de trava permanecem seguros no HTTP',async t=>{
  const {port}=await ambiente(t,true,{atualizar:async()=>{throw Object.assign(new Error('privado'),{avisos:['privado']});}});
  const r=await request(port,'/api/atualizar','POST',{Origin:'http://127.0.0.1:'+port,'Content-Type':'application/json'},'{}');
  assert.equal(r.status,503);assert.deepEqual(JSON.parse(r.body).avisos,['falha ao liberar a trava; confira o estado local']);
  assert.doesNotMatch(r.body,/privado/);
});

test('H002 recusa temporal direta informa motivo fixo no POST e no recibo',async t=>{
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-05T12:00:00Z')});
  let dataDir;
  const env=await ambiente(t,true,{atualizar:()=>atualizarCaptura(dataDir,async()=>{
    const raw=capturaValida();raw.source='google-sheets-api';raw.capturaId='direta-tempo-http';
    return raw;
  })});dataDir=env.dataDir;
  const pointerBefore=lerEstado(dataDir).estado,captureFile=path.join(dataDir,'capturas',pointerBefore.capturaId+'.json');
  const captureBytes=fs.readFileSync(captureFile);
  const response=await request(env.port,'/api/atualizar','POST',{Origin:'http://127.0.0.1:'+env.port,'Content-Type':'application/json'},'{}');
  assert.equal(response.status,422);
  const body=JSON.parse(response.body);
  assert.equal(body.categoria,'dados');assert.equal(body.registrada,true);
  assert.equal(body.mensagem,'Captura desatualizada; a vigente foi preservada');
  const state=lerEstado(dataDir);
  assert.equal(state.ultimaTentativa.motivoResumo,body.mensagem);
  assert.equal(state.estado.capturaId,pointerBefore.capturaId);
  assert.deepEqual(fs.readFileSync(captureFile),captureBytes);
});
test('H01 ausência estruturada não vira dados de demonstração', async t => {
  const {port}=await ambiente(t,false);
  const body=JSON.parse((await request(port,'/api/visao')).body);
  assert.equal(body.estado,'sem_captura');assert.deepEqual(body.producoes,[]);
});

test('H-fase8 recibo aninhado inválido retorna 503 genérico sem segredo e sem escrita',async t=>{
  const {port,dataDir}=await ambiente(t),pointer=path.join(dataDir,'atual.json');
  const before=fs.readFileSync(pointer,'utf8'),state=JSON.parse(before);
  const file=path.join(dataDir,'tentativas',state.ultimaTentativaId+'.json'),receipt=JSON.parse(fs.readFileSync(file,'utf8'));
  receipt.motivoResumo={dado:'sk-ant-'+'S'.repeat(25),caminho:'/home/usuario-sintetico-recibo/privado'};
  const privado=JSON.stringify(receipt);fs.writeFileSync(file,privado);
  const response=await request(port,'/api/visao');
  assert.equal(response.status,503);
  assert.deepEqual(JSON.parse(response.body),{erro:'Estado local indisponível; última captura não foi alterada'});
  assert.doesNotMatch(response.body,/sk-ant-|usuario-sintetico-recibo|motivoResumo|stack/);
  assert.equal(fs.readFileSync(file,'utf8'),privado);assert.equal(fs.readFileSync(pointer,'utf8'),before);
});

test('H-fase8 identidade sensível recusa projeção sem valor nem mistura de registros',async t=>{
  const {port,dataDir}=await ambiente(t,false),raw=capturaValida();
  assert.equal(promoverCaptura(raw,dataDir).resultado,'completa');
  const ids=['sk-ant-'+'A'.repeat(30),'sk-ant-'+'B'.repeat(30)];
  for(const table of Object.values(raw.tables)) table.values=table.values.map(row=>row.map(cell=>cell==='peca-1'?ids[0]:cell==='peca-2'?ids[1]:cell));
  // Defesa de leitura para corrupção externa de bytes privados, não promoção aceita.
  recalcularHashes(raw);fs.writeFileSync(path.join(dataDir,'capturas',raw.capturaId+'.json'),JSON.stringify(raw));
  const pointer=path.join(dataDir,'atual.json'),before=fs.readFileSync(pointer,'utf8');
  const response=await request(port,'/api/visao');
  assert.equal(response.status,503);assert.doesNotMatch(response.body,/sk-ant-|conteúdo suprimido|Arquivos|Revisoes/);
  assert.equal(fs.readFileSync(pointer,'utf8'),before);
});

test('H-fase8-preflight captura recusada mantém HTTP 200 e falha ativa sobre os dados válidos',async t=>{
  const {port,dataDir}=await ambiente(t),vigente=capturaValida(),candidata=capturaValida();
  candidata.capturaId='captura-http-preflight-recusada';
  redefinirHorario(candidata,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
  const sensivel='ghp_'+'identificador-ficticio-'.repeat(2);
  mudarCelula(candidata,'Páginas',1,'arquivo_imagem_id',sensivel);
  assert.equal(promoverCaptura(candidata,dataDir).resultado,'falhou');
  const response=await request(port,'/api/visao'),view=JSON.parse(response.body);
  assert.equal(response.status,200);assert.equal(view.estado,'falha_atualizacao');
  assert.equal(view.captura.capturaId,vigente.capturaId);
  assert.equal(view.captura.completedAt,vigente.completedAt);
  assert.deepEqual(view.producoes.map(p=>p.producao_id),['peca-1','peca-2','peca-3','peca-4']);
  assert.ok(!response.body.includes(sensivel));
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
test('H02 quatro estáticos fixos têm bytes/HEAD corretos, extras nunca são servidos', async t => {
  const {port}=await ambiente(t);
  for (const [url,file] of [['/','index.html'],['/app.js','app.js'],['/theme.js','theme.js'],['/styles.css','styles.css']]) {
    const get=await request(port,url);
    assert.equal(get.status,200); assert.equal(get.body,'estático sintético '+file);
    const head=await request(port,url,'HEAD');
    assert.equal(head.status,200); assert.equal(head.body,'');
    assert.equal(head.headers['content-type'],get.headers['content-type']);
  }
  assert.equal((await request(port,'/extra.txt')).status,404);
});

test('H-ultima m4 HTTP suprime userinfo em texto livre e JSON de origens', async t=>{
  const {port,dataDir}=await ambiente(t,false),raw=capturaValida();
  const url='https://pessoa-ficticia:senha-ficticia@docs.google.com/x';
  mudarCelula(raw,'Produções',1,'legenda','Leia '+url+' antes de revisar');
  mudarCelula(raw,'Revisoes',1,'motivo','Conferir '+url);
  mudarCelula(raw,'Arquivos',1,'origens_json',JSON.stringify({url}));
  mudarCelula(raw,'Semanas',1,'tema','Tema '+url);
  promoverCaptura(raw,dataDir);
  const response=await request(port,'/api/visao');
  assert.equal(response.status,200);
  assert.doesNotMatch(response.body,/pessoa-ficticia|senha-ficticia/);
  const view=JSON.parse(response.body),p=view.producoes[0];
  assert.equal(p.legenda,'Leia [conteúdo suprimido] antes de revisar');
  assert.equal(p.detalhes.revisoes.vigentes[0].motivo,'Conferir [conteúdo suprimido]');
  assert.equal(p.detalhes.arquivos[0].origens_json,JSON.stringify({url:'[conteúdo suprimido]'}));
  assert.ok(p.detalhes.avisos.some(a=>a.campo==='legenda'));
  assert.ok(p.detalhes.avisos.some(a=>a.campo==='origens_json'));
});

test('H-regressao quatro textos legítimos permanecem exatos no JSON público', async t=>{
  for(const texto of ['Saiba mais em https://exemplo.invalid e siga @perfil',
    'Visite https://site.invalid. Dúvidas: contato@site.invalid','Texto // siga @perfil',
    JSON.stringify({url:'https://exemplo.invalid',contato:'contato@site.invalid'})]) {
    const {port,dataDir}=await ambiente(t,false),raw=capturaValida();
    mudarCelula(raw,'Produções',1,'legenda',texto);promoverCaptura(raw,dataDir);
    const response=await request(port,'/api/visao');assert.equal(response.status,200);
    const view=JSON.parse(response.body);assert.equal(view.producoes[0].legenda,texto);
    assert.ok(!view.avisos.some(a=>a.campo==='legenda'));
  }
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

test('H05 HTTP entrega seis tabelas mínimas com valores permitidos e suprime célula sensível', async t=>{
  const {port,dataDir}=await ambiente(t,false),raw=capturaPlanilha();
  mudarCelula(raw,'Produções',2,'legenda','Antes https://usuario-http-ficticio:senha-http-ficticia@docs.google.com/x depois');
  promoverCaptura(raw,dataDir);
  const before=fs.readFileSync(path.join(dataDir,'atual.json'),'utf8');
  const response=await request(port,'/api/visao');
  assert.equal(response.status,200);
  const view=JSON.parse(response.body);
  assert.equal(view.planilha.length,6);
  assert.deepEqual(view.planilha.map(tab=>[tab.nome,tab.quantidadeLinhas]),[
    ['Semanas',2],['Produções',5],['Páginas',3],['Cenas',2],['Arquivos',5],['Revisoes',5]
  ]);
  for(const tab of view.planilha) {
    assert.deepEqual(tab.cabecalhos,campos[tab.nome]);
    for(const linha of tab.linhas) assert.deepEqual(Object.keys(linha),campos[tab.nome]);
  }
  const p=view.planilha[1].linhas[0];
  assert.equal(p.legenda,'Antes [conteúdo suprimido] depois');
  assert.equal(view.planilha[4].linhas[0].id_drive,'drive-ficticio-local');
  assert.equal(view.planilha[4].linhas[0].sha256,'a'.repeat(64));
  assert.equal(view.planilha[4].linhas[0].origens_json,'{"arquivo_id":"origem-sintetica","texto":"<script>conteúdo como dado</script>"}');
  assert.ok(view.avisos.some(a=>a.aba==='Produções' && a.linha===3 && a.campo==='legenda'));
  assert.doesNotMatch(response.body,/usuario-http-ficticio|senha-http-ficticia|sentinela-nao-publicar|__extra_privado|metadataBefore|metadataAfter|spreadsheetId|firstReadSha256|secondReadSha256|tables|stack/);
  assert.equal(fs.readFileSync(path.join(dataDir,'atual.json'),'utf8'),before);
});

test('H05 Histórico HTTP lista todas as confirmadas recentes primeiro, preserva sucesso e ignora órfãos e no-op', async t=>{
  const {port,dataDir}=await ambiente(t,false),raw=capturaPlanilha();
  promoverCaptura(raw,dataDir);
  const receiptsDir=path.join(dataDir,'tentativas');
  const first=lerEstado(dataDir).historico[0];
  const firstBytes=fs.readFileSync(path.join(receiptsDir,first.tentativaId+'.json'),'utf8');
  for(let i=0;i<11;i++) registrarFalhaEntrada(dataDir,'ENTRADA_JSON');
  const latest=structuredClone(raw);latest.capturaId='captura-planilha-sintetica-02';
  redefinirHorario(latest,'2026-10-03T12:00:00.000Z','2026-10-03T12:05:00.000Z');
  promoverCaptura(latest,dataDir);
  const lastFailure=registrarFalhaEntrada(dataDir,'ENTRADA_ARQUIVO');
  const confirmed=lerEstado(dataDir), before=fs.readFileSync(path.join(dataDir,'atual.json'),'utf8');
  const prepared={tentativaId:'tentativa-preparada-sintetica',capturaId:'captura-orfa-sintetica',concluidaEm:'2026-10-04T12:00:00Z',resultado:'completa',motivoResumo:'não confirmada',erroBruto:'C:/usuario-ficticio/dados'};
  fs.writeFileSync(path.join(receiptsDir,prepared.tentativaId+'.json'),JSON.stringify(prepared));
  fs.writeFileSync(path.join(dataDir,'ultima-tentativa.json'),JSON.stringify(prepared));
  fs.writeFileSync(path.join(dataDir,'capturas',prepared.capturaId+'.json'),JSON.stringify(raw));
  assert.equal(promoverCaptura(latest,dataDir).resultado,'sem_alteracao');
  const response=await request(port,'/api/visao'),view=JSON.parse(response.body);
  assert.equal(response.status,200);
  assert.equal(view.historico.length,14);
  assert.deepEqual(view.historico.map(r=>r.tentativaId),confirmed.historico.map(r=>r.tentativaId).reverse());
  assert.equal(view.historico[0].tentativaId,lastFailure.tentativaId);
  assert.equal(view.historico[0].resultado,'falhou');
  assert.equal(view.historico[0].motivoResumo,'arquivo local ausente ou ilegível');
  assert.equal(view.historico.at(-1).tentativaId,first.tentativaId);
  assert.equal(view.historico.at(-1).resultado,'completa');
  assert.equal(view.ultimaTentativa.tentativaId,lastFailure.tentativaId);
  assert.equal(view.captura.capturaId,latest.capturaId);
  assert.equal(view.captura.completedAt,'2026-10-03T12:05:00.000Z');
  assert.equal(view.estado,'falha_atualizacao');
  for(const r of view.historico) assert.deepEqual(Object.keys(r).sort(),['tentativaId','concluidaEm','resultado','motivoResumo'].sort());
  assert.doesNotMatch(response.body,/tentativa-preparada-sintetica|captura-orfa-sintetica|erroBruto|usuario-ficticio/);
  assert.equal(fs.readFileSync(path.join(dataDir,'atual.json'),'utf8'),before);
  assert.equal(fs.readFileSync(path.join(receiptsDir,first.tentativaId+'.json'),'utf8'),firstBytes);
});
