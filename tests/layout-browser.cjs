// Infraestrutura sintética compartilhada: nenhum acesso à operação real.
const assert=require('node:assert/strict');
const {temporario,redefinirHorario}=require('./fixtures.cjs');
const {capturaLayout,AGORA,recalcularHashes,credencialSintetica,transporteFalso,respostaStream,imagemPorArquivo}=require('./layout-fixtures.cjs');
const {promoverCaptura,atualizarCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const google=require('../src/google.cjs');
const {criarServicoMidia}=require('../src/midia.cjs');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;

async function abrirLayout(t,{width=390,theme='light',editar=()=>{},captura=capturaLayout,download,semCaptura=false}={}) {
  const dir=temporario(t),raw=captura();editar(raw);
  if(!semCaptura)assert.equal(promoverCaptura(recalcularHashes(raw),dir).resultado,'completa','fixture completa em TEMP');
  const credentials=credencialSintetica(t),transport=transporteFalso({download:download||(async(url,options)=>{
    const id=decodeURIComponent(new URL(url).pathname.split('/').at(-1));
    assert.match(id,/^drive-sintetico-/);
    return respostaStream([imagemPorArquivo(id.replace(/^drive-sintetico-/,''))],{signal:options.signal});
  })});
  let release,mode='sem_alteracao',calls=0;
  const midia=criarServicoMidia({dataDir:dir,criarCliente:()=>google.criarClienteDrive({...credentials,fetchImpl:transport.fetchImpl})});
  const server=criarServidor({dataDir:dir,port:0,midia,atualizar:()=>atualizarCaptura(dir,async()=>{
    calls++;await new Promise(resolve=>{release=resolve;});
    if(mode==='falha')throw google.falha('rede');
    if(mode==='sem_alteracao')return structuredClone(raw);
    const next=structuredClone(raw);next.source='google-sheets-api';next.capturaId='layout-releitura-'+calls;
    redefinirHorario(next,'2026-10-08T14:00:00.000Z',`2026-10-08T14:${String(calls).padStart(2,'0')}:00.000Z`);
    return next;
  })});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  t.after(async()=>{release?.();try{if(browser)await browser.close();}finally{await new Promise(resolve=>server.close(resolve));}});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch();
  const context=await browser.newContext({viewport:{width,height:width===390?844:1050},colorScheme:theme,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(value=>localStorage.setItem('crm-theme',value),theme);
  const page=await context.newPage(),errors=[],external=[],requests=[];
  page.setDefaultTimeout(2500);await page.clock.setFixedTime(new Date(AGORA));
  page.on('pageerror',error=>errors.push(error.message));
  const origin='http://127.0.0.1:'+server.address().port;
  await context.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());
    requests.push({url:request.url(),path:url.pathname,method:request.method(),body:request.postData()});
    if(url.origin===origin)return route.continue();external.push(request.url());return route.abort();
  });
  t.after(()=>{assert.deepEqual(errors,[],'sem erros JavaScript');assert.deepEqual(external,[],'sem requisições externas');});
  await page.goto(origin);await page.waitForFunction(()=>document.querySelector('#atualizar')?.disabled===false&&document.querySelector('#planejamento')?.hidden===false);
  return {page,origin,dir,raw,transport,requests,setMode:value=>{mode=value;},release:()=>release?.(),calls:()=>calls};
}
async function navegar(page,tela) {
  const menu=page.locator('#menu');
  if(await menu.isVisible()&&await menu.getAttribute('aria-expanded')!=='true')await menu.click();
  const button=page.locator('[data-tela="'+tela+'"]');await button.focus();await page.keyboard.press('Enter');
}
async function atualizar(context) {
  const {page}=context;await page.locator('#atualizar').click();
  await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao').textContent==='Atualizando dados…');
  context.release();await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
}
const pedidosMidia=context=>context.requests.filter(request=>request.path.startsWith('/api/midia/'));
module.exports={abrirLayout,navegar,atualizar,pedidosMidia,skip};
