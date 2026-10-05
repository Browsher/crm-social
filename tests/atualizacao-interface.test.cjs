const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {temporario,capturaValida,mapaQuadroValido,redefinirHorario}=require('./fixtures.cjs');
const {promoverCaptura,atualizarCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const {falha}=require('../src/google.cjs');
const skip=process.env.CI==='true'?'Playwright local, sem instalação no CI':false;
async function abrir(t,width){
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');
  const root=temporario(t),dataDir=path.join(root,'dados'),map=path.join(root,'mapa.json');
  fs.writeFileSync(map,JSON.stringify(mapaQuadroValido()));promoverCaptura(capturaValida(),dataDir);
  let release,mode='sucesso',calls=0,warning=false;
  const server=criarServidor({dataDir,port:0,quadroConfigPath:map,atualizar:()=>atualizarCaptura(dataDir,async()=>{
    calls++;await new Promise(r=>{release=r;});if(mode==='falha')throw falha('rede');
    const raw=capturaValida();raw.source='google-sheets-api';raw.capturaId='direta-interface-'+calls;
    if(mode==='desatualizada')return raw;
    redefinirHorario(raw,'2026-10-05T11:00:00Z',`2026-10-05T11:${String(calls).padStart(2,'0')}:00Z`);return raw;
  }).then(r=>warning?{...r,avisos:['falha ao liberar a trava; confira o estado local']}:r)});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch();
  t.after(async()=>{release?.();try{await browser.close();}finally{await new Promise(r=>server.close(r));}});
  const page=await browser.newPage({viewport:{width,height:1050}}),errors=[],outside=[],seen=[];
  page.setDefaultTimeout(4000);await page.clock.setFixedTime(new Date('2026-10-05T12:00:00Z'));
  const origin='http://127.0.0.1:'+server.address().port;
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>seen.push([new URL(r.url()).pathname,r.method()]));
  await page.route('**/*',r=>{if(!r.request().url().startsWith(origin+'/')){outside.push(r.request().url());return r.abort();}return r.continue();});
  t.after(()=>{assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);});
  await page.goto(origin);await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  await page.locator('[data-formato="Reels"]').click();await page.locator('#selo').click();
  return {page,seen,setMode:value=>{mode=value;},setWarning:()=>{warning=true;},release:()=>release?.()};
}
for(const width of [1440,390])test('U002 POST pendente, sucesso, falha e recuperacao em '+width,{skip},async t=>{
  const a=await abrir(t,width),{page}=a,button=page.locator('#atualizar'),status=page.locator('#resultado-atualizacao');
  await button.click();await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');
  assert.equal(await button.isDisabled(),true);assert.equal(await status.getAttribute('role'),'status');
  a.release();await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await status.textContent(),'Dados atualizados');assert.equal(await page.locator('#fonte-captura').textContent(),'Leitura direta pelo servidor local');
  assert.equal(await page.locator('[data-formato="Reels"]').getAttribute('class'),'active');
  const previous=await page.locator('#fim-captura').textContent();a.setMode('falha');await button.click();
  await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await status.textContent(),'Não foi possível ler a planilha; tente novamente');
  assert.equal(await page.locator('#fim-captura').textContent(),previous);assert.equal(await page.locator('#selo').textContent(),'Atualização falhou');
  a.setMode('sucesso');await button.click();await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);assert.equal(await status.textContent(),'Dados atualizados');
  assert.ok(a.seen.some(([url,method])=>url==='/api/atualizar'&&method==='POST'));
});
test('U002 GET falha depois do POST: conserva vista e libera botao',{skip},async t=>{
  const a=await abrir(t,1440),{page}=a,previous=await page.locator('#fim-captura').textContent();
  await page.route('**/api/visao',r=>r.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await page.locator('#atualizar').click();await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await page.locator('#fim-captura').textContent(),previous);assert.equal(await page.locator('#erro').isVisible(),true);
  assert.equal(await page.locator('#resultado-atualizacao').textContent(),'Atualização concluída; consulta local indisponível');
});
test('U002 aviso fixo de trava nao altera sucesso e aparece na tela',{skip},async t=>{
  const a=await abrir(t,1440);a.setWarning();await a.page.locator('#atualizar').click();
  await a.page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await a.page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await a.page.locator('#resultado-atualizacao').textContent(),'Dados atualizados · falha ao liberar a trava; confira o estado local');
});
test('U002 POST falhou e GET falhou: motivo original nao vira sucesso',{skip},async t=>{
  const a=await abrir(t,390);a.setMode('falha');await a.page.route('**/api/visao',r=>r.fulfill({status:503,contentType:'application/json',body:'{}'}));
  await a.page.locator('#atualizar').click();await a.page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await a.page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await a.page.locator('#resultado-atualizacao').textContent(),'Não foi possível ler a planilha; tente novamente · consulta local indisponível');
});

for(const width of [1440,390])test('U002 recusa temporal mostra motivo no status e no Historico em '+width,{skip},async t=>{
  const a=await abrir(t,width),previous=await a.page.locator('#fim-captura').textContent();
  a.setMode('desatualizada');await a.page.locator('#atualizar').click();
  await a.page.waitForFunction(()=>document.querySelector('#resultado-atualizacao')?.textContent==='Atualizando dados…');a.release();
  await a.page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await a.page.locator('#resultado-atualizacao').textContent(),'Captura desatualizada; a vigente foi preservada');
  assert.equal(await a.page.locator('#fim-captura').textContent(),previous);
  await a.page.locator('#abas-planilha [data-aba="Histórico"]').click();
  assert.ok((await a.page.locator('tr[data-resultado="falhou"]').textContent()).includes('Captura desatualizada; a vigente foi preservada'));
});
