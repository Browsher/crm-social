const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaVersoes}=require('./versoes-fixtures.cjs');
const {temporario,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
async function abrir(t,{width=390,theme='light',editar=()=>{}}={}) {
  const dir=temporario(t),raw=capturaVersoes();editar(raw);
  assert.equal(promoverCaptura(recalcularHashes(raw),dir).resultado,'completa');
  const server=criarServidor({dataDir:dir,port:0});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  t.after(async()=>{try{if(browser)await browser.close();}finally{await new Promise(resolve=>server.close(resolve));}});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width,height:1050},colorScheme:theme,reducedMotion:'reduce'}),errors=[],requests=[];
  page.setDefaultTimeout(3000);page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-02T14:00:00Z'));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.route('**/*',route=>{
    const request=route.request();requests.push(request.method()+' '+new URL(request.url()).pathname);
    return request.url().startsWith(origin+'/')?route.continue():route.abort();
  });
  t.after(()=>{assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.startsWith('GET ')));});
  await page.goto(origin);await page.locator('#objetivo-mes .month-content').waitFor();
  if(width===390)await page.locator('#menu').click();
  await page.getByRole('button',{name:'Produção',exact:true}).click();
  await page.locator('#quadro [data-coluna="Pronta"] [data-producao-id="peca-3"]').click();
  const p=page.locator('#dia [data-peca="peca-3"]');
  await p.locator('details[data-detalhes-producao]>summary').click();
  return {page,p};
}
async function screenshot(page,theme,width) {
  if(process.env.CRM_SCREENSHOTS_VERSOES!=='1')return;
  const destination=path.resolve(__dirname,'../docs/design/screenshots');fs.mkdirSync(destination,{recursive:true});
  await page.screenshot({path:path.join(destination,`versoes-${theme}-gaveta-${width}.png`),animations:'disabled'});
}
for(const theme of ['light','dark'])for(const width of [1440,390])test(`Versões gaveta pronta apresenta texto vigente e imagem reaproveitada em ${theme}/${width}`,{skip},async t=>{
  const {page,p}=await abrir(t,{width,theme}),pages=p.locator('[data-unidades="paginas"]');
  assert.equal(await pages.locator('.unit-record:visible').count(),5);
  assert.match(await pages.innerText(),/Versão 3 · vigente/);
  assert.doesNotMatch(await pages.innerText(),/impacto atual a confirmar|Mídia ausente/);
  for(const [i,version] of [2,1,1,2,3].entries()) {
    const unit=pages.locator('[data-pagina="pagina-v3-'+(i+1)+'"]');
    assert.match(await unit.innerText(),new RegExp('imagem v'+version));
    assert.equal(await unit.getByRole('link').getAttribute('href'),'https://drive.google.com/file/d/imagem-sintetica-'+(i+1)+'/view');
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.match(await p.locator('[data-publicacao]').innerText(),/Pronta para publicar/);
  await screenshot(page,theme,width);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dia').isVisible(),false);
});

test('Versões gaveta não mistura página vigente e histórica que compartilham número de versão',{skip},async t=>{
  const {page,p}=await abrir(t,{width:1440,editar:raw=>{
    adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v4-2',producao_id:'peca-3',versao:4,indice:2,titulo:'Segunda página atualizada'});
  }}),pages=p.locator('[data-unidades="paginas"]');
  const currentV3=pages.locator('section.version-group[data-versao="3"]'),historyV3=pages.locator('details.version-group[data-versao="3"]');
  assert.equal(await currentV3.count(),1);assert.equal(await historyV3.count(),1);
  assert.deepEqual(await currentV3.locator('[data-pagina]').evaluateAll(nodes=>nodes.map(n=>n.dataset.pagina)),['pagina-v3-1','pagina-v3-3','pagina-v3-4','pagina-v3-5']);
  assert.equal(await historyV3.locator('[data-pagina="pagina-v3-2"]').isVisible(),false);
  await historyV3.locator(':scope>summary').click();
  assert.equal(await historyV3.locator('[data-pagina="pagina-v3-2"]').isVisible(),true);
  assert.match(await pages.locator('section.version-group[data-versao="4"]').innerText(),/Versão 4 · vigente/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});
