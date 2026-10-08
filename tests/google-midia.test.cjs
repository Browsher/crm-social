const {test}=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const google=require('../src/google.cjs');
const {credencialSintetica,transporteFalso,respostaStream,imagemPng,OAUTH}=require('./previas-fixtures.cjs');
const DRIVE_SCOPE='https://www.googleapis.com/auth/drive.readonly';
const SHEETS_SCOPE='https://www.googleapis.com/auth/spreadsheets.readonly';
const LIMITE=15000000;
function cliente(t,options={}) {
  assert.equal(typeof google.criarClienteDrive,'function','o cliente Drive deve existir e preservar Sheets');
  return google.criarClienteDrive({...credencialSintetica(t),...options});
}
function claims(options) {
  const assertion=new URLSearchParams(options.body).get('assertion');
  return {assertion,claims:JSON.parse(Buffer.from(assertion.split('.')[1],'base64url'))};
}
function privado(error,status=503) {
  assert.equal(error.status,status);
  assert.equal(error.message,'Prévia indisponível');
  assert.doesNotMatch(JSON.stringify(error)+error.message,/sentinela|example\.invalid|drive-sintetico|Bearer|private_key|www\.googleapis/);
  return true;
}
test('D01 Drive dispensa spreadsheet, assina RS256 com scope exclusivo e usa somente destinos fixos',async t=>{
  const config=credencialSintetica(t),now=Date.parse('2026-10-08T12:00:00Z'),bytes=imagemPng();
  const fake=transporteFalso({bytes});
  const client=cliente(t,{...config,now:()=>now,fetchImpl:fake.fetchImpl});
  assert.equal(config.env.CRM_SPREADSHEET_ID,undefined);
  assert.deepEqual(await client.getMidia('drive-sintetico_A-1'),bytes);
  assert.equal(fake.calls.length,2);
  const [token,download]=fake.calls;
  assert.equal(token.url,OAUTH);assert.equal(token.options.method,'POST');
  assert.equal(token.options.headers['Content-Type'],'application/x-www-form-urlencoded');
  const signed=claims(token.options),[head,body,signature]=signed.assertion.split('.');
  assert.deepEqual(JSON.parse(Buffer.from(head,'base64url')),{alg:'RS256',typ:'JWT'});
  assert.deepEqual(signed.claims,{iss:config.credentials.client_email,scope:DRIVE_SCOPE,aud:OAUTH,iat:now/1000,exp:now/1000+3600});
  assert.ok(crypto.verify('RSA-SHA256',Buffer.from(head+'.'+body),config.pair.publicKey,Buffer.from(signature,'base64url')));
  assert.equal(download.url,'https://www.googleapis.com/drive/v3/files/drive-sintetico_A-1?alt=media');
  assert.equal(download.options.method,'GET');assert.equal(download.options.headers.Authorization,'Bearer token-sintetico');
  for(const call of fake.calls) {assert.equal(call.options.redirect,'error');assert.ok(call.options.signal instanceof AbortSignal);}
  assert.equal(Object.hasOwn(client,'spreadsheetId'),false);
});
test('D02 tokens separados por finalidade, em RAM; Sheets mantém assinatura e exports antigos',async t=>{
  const config=credencialSintetica(t,{spreadsheet:true}),oauthScopes=[];
  const fake=transporteFalso({oauth:async(_url,options)=>{
    const scope=claims(options).claims.scope;oauthScopes.push(scope);
    return Response.json({access_token:scope===DRIVE_SCOPE?'drive-token':'sheets-token',token_type:'Bearer',expires_in:3600});
  },download:async(url,options)=>{
    if(new URL(url).hostname==='sheets.googleapis.com') {
      assert.equal(options.headers.Authorization,'Bearer sheets-token');
      return Response.json({spreadsheetId:'fonte-sintetica',sheets:[]});
    }
    assert.equal(options.headers.Authorization,'Bearer drive-token');return new Response(imagemPng());
  }});
  const drive=cliente(t,{...config,fetchImpl:fake.fetchImpl}),sheets=google.criarClienteGoogle({...config,fetchImpl:fake.fetchImpl});
  await drive.getMidia('drive-sintetico');await sheets.getMetadata();await drive.getMidia('drive-sintetico');await sheets.batchGet(["'Semanas'!A1:I20"]);
  assert.deepEqual(oauthScopes,[DRIVE_SCOPE,SHEETS_SCOPE]);
  assert.equal(claims({body:new URLSearchParams({assertion:google.assinarJwt(config.credentials)}).toString()}).claims.scope,SHEETS_SCOPE);
  assert.equal(google.carregarConfig(config).spreadsheetId,'fonte-sintetica');
  assert.throws(()=>google.carregarConfig({...config,env:{CRM_GOOGLE_CREDENTIALS_FILE:config.env.CRM_GOOGLE_CREDENTIALS_FILE}}));
  const files=fs.readdirSync(config.root,{recursive:true});assert.deepEqual(files.sort(),['credencial-sintetica.json','repo']);
});
test('D03 cache do token Drive reaproveita RAM e expira sem reaproveitar token de outro cliente',async t=>{
  let now=Date.parse('2026-10-08T12:00:00Z');
  const fake=transporteFalso({oauth:async()=>Response.json({access_token:'token-sintetico',token_type:'Bearer',expires_in:120})});
  const client=cliente(t,{fetchImpl:fake.fetchImpl,now:()=>now});
  await client.getMidia('drive-sintetico');await client.getMidia('drive-sintetico');
  assert.equal(fake.calls.filter(c=>c.url===OAUTH).length,1);
  now+=120000;await client.getMidia('drive-sintetico');assert.equal(fake.calls.filter(c=>c.url===OAUTH).length,2);
});
test('D04 ID Drive não canônico é recusado sem OAuth ou download',async t=>{
  const fake=transporteFalso(),client=cliente(t,{fetchImpl:fake.fetchImpl});
  for(const id of ['',null,undefined,1,' a','a/b','a?alt=media','https://externo.invalid','../a','a%2Fb','a\\b'])await assert.rejects(client.getMidia(id),e=>privado(e,422));
  assert.equal(fake.calls.length,0);
});
test('D05 configuração interna, ausente ou inválida não expõe caminho, e-mail ou chave',t=>{
  const config=credencialSintetica(t);assert.equal(typeof google.criarClienteDrive,'function');
  for(const env of [{},{CRM_GOOGLE_CREDENTIALS_FILE:path.join(config.repoRoot,'sentinela.json')}])assert.throws(()=>google.criarClienteDrive({...config,env}),e=>privado(e));
  fs.writeFileSync(config.env.CRM_GOOGLE_CREDENTIALS_FILE,JSON.stringify({type:'service_account',client_email:'sentinela@example.invalid',private_key:'sentinela-chave'}));
  assert.throws(()=>google.criarClienteDrive(config),e=>privado(e));
});
test('D06 limite inclusivo conta bytes reais sem confiar em Content-Length ou MIME',async t=>{
  for(const headers of [{},{'Content-Length':'1','Content-Type':'application/octet-stream'}]) {
    const bytes=Buffer.alloc(LIMITE,7),fake=transporteFalso({download:async()=>respostaStream([bytes.subarray(0,7000000),bytes.subarray(7000000)],{headers})});
    assert.equal((await cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico')).length,LIMITE);
  }
});
test('D07 excesso sem Content-Length cancela stream e não inicia retry',async t=>{
  let cancelled=0;
  const fake=transporteFalso({download:async()=>respostaStream([Buffer.alloc(LIMITE),Buffer.alloc(1),Buffer.alloc(1)],{stall:true,onCancel:()=>cancelled++})});
  await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico'),e=>privado(e,422));
  assert.equal(cancelled,1);assert.equal(fake.calls.length,2);
});
test('D08 Content-Length acima do máximo recusa e cancela corpo ainda não consumido',async t=>{
  let cancelled=0;
  const fake=transporteFalso({download:async()=>respostaStream([imagemPng()],{headers:{'Content-Length':String(LIMITE+1)},stall:true,onCancel:()=>cancelled++})});
  await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico'),e=>privado(e,422));
  assert.equal(cancelled,1);assert.equal(fake.calls.length,2);
});
test('D09 permissões, redirects e erro Google não leem corpo nem fazem retry',async t=>{
  for(const stage of ['oauth','download'])for(const status of [400,401,403,404,302,500]) {
    let reads=0;
    const bad=async()=>({ok:false,status,headers:new Headers(),json(){reads++;throw new Error('sentinela');},text(){reads++;throw new Error('sentinela');},body:null});
    const fake=transporteFalso(stage==='oauth'?{oauth:bad}:{download:bad});
    await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico'),e=>privado(e));
    assert.equal(reads,0);assert.equal(fake.calls.length,stage==='oauth'?1:2);
  }
});
test('D10 rede recusada e OAuth malformado viram somente erro constante',async t=>{
  const values=[{}, {access_token:'x x',token_type:'Bearer',expires_in:3600},{access_token:'x',token_type:'Outro',expires_in:3600},{access_token:'x',token_type:'Bearer',expires_in:-1}];
  for(const value of values) {
    const fake=transporteFalso({oauth:async()=>Response.json(value)});
    await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico'),e=>privado(e));assert.equal(fake.calls.length,1);
  }
  for(const stage of ['oauth','download']) {
    const bad=async()=>{throw new Error('sentinela-google-privada');},fake=transporteFalso(stage==='oauth'?{oauth:bad}:{download:bad});
    await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico'),e=>privado(e));
    assert.equal(fake.calls.length,stage==='oauth'?1:2);
  }
});
test('D11 timeout abrange fetch OAuth que ignora signal',async t=>{
  const keepalive=setTimeout(()=>{},1000);t.after(()=>clearTimeout(keepalive));
  const fake=transporteFalso({oauth:()=>new Promise(()=>{})}),client=cliente(t,{fetchImpl:fake.fetchImpl,timeoutMs:25});
  const started=Date.now();await assert.rejects(client.getMidia('drive-sintetico'),e=>privado(e));
  assert.ok(Date.now()-started<1000);assert.equal(fake.calls.length,1);assert.equal(fake.calls[0].options.signal.aborted,true);
});
test('D12 timeout abrange JSON OAuth após headers e aborta sem download',async t=>{
  const keepalive=setTimeout(()=>{},1000);t.after(()=>clearTimeout(keepalive));
  const fake=transporteFalso({oauth:async()=>({ok:true,status:200,json:()=>new Promise(()=>{})})});
  await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl,timeoutMs:25}).getMidia('drive-sintetico'),e=>privado(e));
  assert.equal(fake.calls.length,1);assert.equal(fake.calls[0].options.signal.aborted,true);
});
test('D13 timeout do download abrange fetch que ignora signal',async t=>{
  const keepalive=setTimeout(()=>{},1000);t.after(()=>clearTimeout(keepalive));
  const fake=transporteFalso({download:()=>new Promise(()=>{})});
  await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl,timeoutMs:25}).getMidia('drive-sintetico'),e=>privado(e));
  assert.equal(fake.calls.length,2);assert.equal(fake.calls[1].options.signal.aborted,true);
});
test('D14 timeout do download inclui stall depois dos headers e cancela stream',async t=>{
  const keepalive=setTimeout(()=>{},1000);t.after(()=>clearTimeout(keepalive));let cancelled=0;
  // O fake ignora abort: o cliente deve cancelar ativamente o reader ao terminar o prazo.
  const fake=transporteFalso({download:async()=>respostaStream([Buffer.from([1])],{stall:true,onCancel:()=>cancelled++})});
  await assert.rejects(cliente(t,{fetchImpl:fake.fetchImpl,timeoutMs:25}).getMidia('drive-sintetico'),e=>privado(e));
  assert.equal(fake.calls.length,2);assert.equal(fake.calls[1].options.signal.aborted,true);assert.equal(cancelled,1);
});
test('D15 tokens e bytes não são persistidos pelo cliente; nenhum acesso real ao Google',async t=>{
  const config=credencialSintetica(t),before=fs.readdirSync(config.root,{recursive:true}),fake=transporteFalso();
  await cliente(t,{...config,fetchImpl:fake.fetchImpl}).getMidia('drive-sintetico');
  assert.deepEqual(fs.readdirSync(config.root,{recursive:true}),before);
  assert.equal(fake.calls.length,2);
});
test('D16 downloads concorrentes compartilham uma aquisição OAuth pendente',async t=>{
  let liberar;const bloqueio=new Promise(resolve=>{liberar=resolve;});
  const fake=transporteFalso({oauth:async()=>{await bloqueio;return Response.json({access_token:'token-sintetico',token_type:'Bearer',expires_in:3600});}});
  const client=cliente(t,{fetchImpl:fake.fetchImpl}),pedidos=[1,2,3,4,5].map(n=>client.getMidia('drive-sintetico-'+n));
  await new Promise(resolve=>setImmediate(resolve));liberar();await Promise.all(pedidos);
  assert.equal(fake.calls.filter(call=>call.url===OAUTH).length,1,'downloads simultâneos aguardam o mesmo token em RAM');
  assert.equal(fake.calls.filter(call=>call.url!==OAUTH).length,5);
});
