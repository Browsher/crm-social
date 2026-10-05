const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {temporario}=require('./fixtures.cjs');
const google=fs.existsSync(path.join(__dirname,'../src/google.cjs'))?require('../src/google.cjs'):{};
const pair=crypto.generateKeyPairSync('rsa',{modulusLength:2048});
const credentials=()=>({type:'service_account',client_email:['leitor','example.invalid'].join('@'),private_key:pair.privateKey.export({type:'pkcs8',format:'pem'})});
function config(t) {
  const root=temporario(t),repoRoot=path.join(root,'projeto'),file=path.join(root,'chave.json');
  fs.mkdirSync(repoRoot);fs.writeFileSync(file,JSON.stringify(credentials()));
  return {env:{CRM_GOOGLE_CREDENTIALS_FILE:file,CRM_SPREADSHEET_ID:'fonte-sintetica'},repoRoot};
}
test('G01 JWT RS256 verificavel, scope readonly e validade de uma hora',()=>{
  const now=Date.parse('2026-10-05T12:00:00Z'),jwt=google.assinarJwt?.(credentials(),now);
  assert.match(jwt??'',/^[^.]+\.[^.]+\.[^.]+$/);
  const [h,p,s]=jwt.split('.'),header=JSON.parse(Buffer.from(h,'base64url')),claims=JSON.parse(Buffer.from(p,'base64url'));
  assert.deepEqual(header,{alg:'RS256',typ:'JWT'});
  assert.equal(claims.iss,credentials().client_email);assert.equal(claims.scope,'https://www.googleapis.com/auth/spreadsheets.readonly');
  assert.equal(claims.aud,'https://oauth2.googleapis.com/token');assert.equal(claims.iat,now/1000);assert.equal(claims.exp-claims.iat,3600);assert.equal(claims.sub,undefined);
  assert.ok(crypto.verify('RSA-SHA256',Buffer.from(h+'.'+p),pair.publicKey,Buffer.from(s,'base64url')));
});
test('G02 configuracao le chave externa e rejeita ausente/interna/invalida sem ecoar',t=>{
  const options=config(t),value=google.carregarConfig?.(options);
  assert.equal(value?.spreadsheetId,'fonte-sintetica');
  for(const env of [{},{...options.env,CRM_GOOGLE_CREDENTIALS_FILE:path.join(options.repoRoot,'privada.json')},{...options.env,CRM_SPREADSHEET_ID:'https://nao-permitido.invalid'}]) {
    assert.throws(()=>google.carregarConfig({...options,env}),e=>e.categoria==='configuracao'&&!e.message.includes(options.repoRoot));
  }
  fs.writeFileSync(options.env.CRM_GOOGLE_CREDENTIALS_FILE,JSON.stringify({type:'authorized_user',private_key:'sentinela-secreta'}));
  assert.throws(()=>google.carregarConfig(options),e=>e.categoria==='configuracao'&&!e.message.includes('sentinela'));
});
test('G03 OAuth fixo, cache RAM expira e Sheets somente GET tipado',async t=>{
  const calls=[];let now=Date.parse('2026-10-05T12:00:00Z');
  const client=google.criarClienteGoogle?.({...config(t),now:()=>now,fetchImpl:async(url,options)=>{
    calls.push({url,options});assert.equal(options.redirect,'error');assert.ok(options.signal instanceof AbortSignal);
    if(url==='https://oauth2.googleapis.com/token') {
      assert.equal(options.method,'POST');const form=new URLSearchParams(options.body);
      assert.equal(form.get('grant_type'),'urn:ietf:params:oauth:grant-type:jwt-bearer');
      const claims=JSON.parse(Buffer.from(form.get('assertion').split('.')[1],'base64url'));
      assert.equal(claims.aud,url);return Response.json({access_token:'token-sintetico',token_type:'Bearer',expires_in:120});
    }
    const parsed=new URL(url);assert.equal(parsed.hostname,'sheets.googleapis.com');assert.equal(options.method,'GET');
    assert.equal(options.headers.Authorization,'Bearer token-sintetico');assert.equal(parsed.searchParams.get('access_token'),null);
    return Response.json({spreadsheetId:'fonte-sintetica',sheets:[]});
  }});
  assert.ok(client,'cliente de leitura deve existir');
  await client.getMetadata();await client.batchGet(["'Semanas'!A1:I20"]);
  const batch=new URL(calls[2].url);assert.equal(batch.searchParams.get('valueRenderOption'),'UNFORMATTED_VALUE');
  assert.equal(batch.searchParams.get('dateTimeRenderOption'),'SERIAL_NUMBER');assert.equal(batch.searchParams.get('majorDimension'),'ROWS');
  now+=120000;await client.getMetadata();assert.equal(calls.filter(c=>c.url==='https://oauth2.googleapis.com/token').length,2);
});
test('G04 resposta OAuth malformada e erro bruto nao vazam',async t=>{
  for(const payload of [{},{access_token:'x',token_type:'Outro',expires_in:10},{access_token:'x',token_type:'Bearer',expires_in:-1}]) {
    const client=google.criarClienteGoogle?.({...config(t),fetchImpl:async()=>Response.json(payload)});
    assert.ok(client);await assert.rejects(client.getMetadata(),e=>e.categoria==='rede'&&e.message===google.MOTIVOS.rede);
  }
});
test('G05 acesso negado, rede, timeout e redirect permanecem motivos fixos',async t=>{
  for(const [categoria,fetchImpl] of [
    ['acesso',async()=>new Response('saida-sensivel',{status:403})],
    ['acesso',async()=>Response.json({error:'invalid_grant',error_description:'sentinela'},{status:400})],
    ['rede',async()=>{throw new Error('sentinela-secreta');}],
    ['rede',async()=>{throw new DOMException('sentinela','TimeoutError');}],
    ['rede',async()=>new Response(null,{status:302,headers:{Location:'https://externo.invalid'}})]]) {
    const client=google.criarClienteGoogle?.({...config(t),fetchImpl});assert.ok(client);
    await assert.rejects(client.getMetadata(),e=>e.categoria===categoria&&e.message===google.MOTIVOS[categoria]);
  }
});
test('G06 Sheets HTTP200 com JSON invalido e dados; OAuth malformado e rede',async t=>{
  const client=google.criarClienteGoogle({...config(t),fetchImpl:async url=>url==='https://oauth2.googleapis.com/token'?Response.json({access_token:'sintetico',token_type:'Bearer',expires_in:3600}):new Response('{')});
  await assert.rejects(client.getMetadata(),e=>e.categoria==='dados'&&e.message===google.MOTIVOS.dados);
});
