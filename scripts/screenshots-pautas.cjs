// Regressão visual de pautas no Layout v3: somente fixture sintética em servidor TEMP efêmero.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {mock}=require('node:test');
const {capturaPautas}=require('../tests/pautas-fixtures.cjs');
const {adicionarRegistro,mapaQuadroSintetico,recalcularHashes,redefinirHorario,mudarCelula}=require('../tests/fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');

const destination=path.resolve(__dirname,'../docs/design/screenshots/pautas-layout-v3');
function preparar(root) {
  const dataDir=path.join(root,'dados'),quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroSintetico()));
  const raw=capturaPautas();
  for(const [i,modelo] of ['cabo','faixa','formas','virada'].entries())mudarCelula(raw,'Pautas',i+1,'modelo_carrossel',modelo);
  mudarCelula(raw,'Pautas',1,'status','concluida');
  mudarCelula(raw,'Pautas',2,'status','em_producao');
  adicionarRegistro(raw,'Meses',{mes:'2026-12',marca_id:'ntv',objetivo:'Objetivo sintético de dezembro',pautas:'Resumo textual sintético de dezembro\nExemplo sem pautas estruturadas'});
  raw.capturaId='pautas-galeria-sintetica';
  redefinirHorario(raw,'2026-11-10T12:00:00.000Z','2026-11-10T12:05:00.000Z');
  assert.equal(promoverCaptura(recalcularHashes(raw),dataDir).resultado,'completa');
  return criarServidor({dataDir,quadroConfigPath,port:0,midia:{obter:async()=>{throw Object.assign(new Error('Prévia sintética indisponível'),{status:503});}},atualizar:async()=>({resultado:'sem_alteracao'})});
}

async function navegar(page,width,label) {
  if(width===390)await page.locator('#menu').click();
  await page.getByRole('button',{name:label,exact:true}).click();
}

async function capturarContexto(browser,origin,theme,width) {
  const context=await browser.newContext({viewport:{width,height:1050},colorScheme:theme,reducedMotion:'reduce'});
  try {
    const page=await context.newPage(),errors=[],external=[];
    page.setDefaultTimeout(5000);
    page.on('pageerror',error=>errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-11-10T12:10:00Z'));
    await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():(external.push('requisição externa'),route.abort()));
    await page.goto(origin);
    await page.locator('#objetivo-toggle:not(:empty)').waitFor();await page.locator('#objetivo-toggle').click();await page.locator('#objetivo-mes .pauta-link').first().waitFor();
    assert.equal(await page.locator('#objetivo-mes .pauta-link').count(),4);
    assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
    const capture=async name=>{
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Página sem corte horizontal');
      await page.screenshot({path:path.join(destination,`pautas-${theme}-${name}-${width}.png`),fullPage:name!=='gaveta',animations:'disabled'});
    };
    await capture('card');

    await page.locator('#objetivo-mes .pauta-link').nth(1).click();
    assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-11-09');
    assert.equal(await page.locator('#lista').evaluate(n=>document.activeElement===n),true);
    await capture('semana-origem');
    await page.locator('#lista [data-producao-id="peca-1"]').click();
    assert.equal(await page.locator('#dia-pecas .pauta-origin').innerText(),'Pauta S2 de novembro');
    await capture('gaveta');
    await page.keyboard.press('Escape');
    await page.locator('[data-modo="Mês"]').click();await page.locator('#proximo').click();
    assert.equal(await page.locator('#objetivo-mes .pauta-link').count(),0);
    assert.match(await page.locator('#objetivo-mes').innerText(),/Resumo textual sintético de dezembro/);
    await capture('mes-sem-pautas');
    if(width===390)await page.locator('#menu').click();
    await page.locator('[data-tela="publicar"]').click();
    assert.equal(await page.locator('#planilha').count(),0);
    await capture('publicar');
    assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  } finally {await context.close();}
}

async function main() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm-pautas-sintetico-'));
  let server,browser;
  mock.timers.enable({apis:['Date'],now:Date.parse('2026-11-10T12:10:00Z')});
  try {
    server=preparar(root);
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const origin='http://127.0.0.1:'+server.address().port;
    const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');
    browser=await chromium.launch();fs.mkdirSync(destination,{recursive:true});
    for(const theme of ['light','dark'])for(const width of [1440,390])await capturarContexto(browser,origin,theme,width);
    process.stdout.write('Screenshots de pautas sintéticos: 20; passou\n');
  } finally {
    try {
      if(browser)await browser.close();
    } finally {
      if(server?.listening)await new Promise(resolve=>server.close(resolve));
      mock.timers.reset();
      // Exclusão limitada ao TEMP exato criado acima, sem caminhos operacionais.
      assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));
      assert.ok(path.basename(root).startsWith('crm-pautas-sintetico-'));
      fs.rmSync(root,{recursive:true,force:true});
    }
  }
}
main().catch(()=>{process.stderr.write('Screenshots de pautas sintéticos: falhou\n');process.exitCode=1;});
