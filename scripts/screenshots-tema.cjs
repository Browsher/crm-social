// Evidência visual reproduzível: apenas fixtures sintéticas, nunca o CRM do autor.
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
const {mock}=require('node:test');
const {capturaQuadro,capturaMeses,mapaQuadroSintetico,recalcularHashes,redefinirHorario,mudarCelula}=require('../tests/fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');

const destination=path.resolve(__dirname,'../docs/design/screenshots');
function preparar(root) {
  const dataDir=path.join(root,'dados'),quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroSintetico()));
  const raw=capturaQuadro(),meses=capturaMeses([['2026-10','ntv','Objetivo sintético: planejar conexões do cotidiano','Pauta sintética A\nPauta sintética B\nPauta sintética C']]);
  raw.tables.Meses=meses.tables.Meses;
  raw.metadataBefore.Meses=meses.metadataBefore.Meses;
  raw.metadataAfter.Meses=meses.metadataAfter.Meses;
  mudarCelula(raw,'Produções',3,'data_prevista','2026-10-04');
  mudarCelula(raw,'Produções',4,'data_prevista','2026-10-03');
  const previous=structuredClone(raw);previous.capturaId='tema-anterior-sintetica';
  assert.equal(promoverCaptura(recalcularHashes(previous),dataDir).resultado,'completa');
  raw.capturaId='tema-atual-sintetica';
  redefinirHorario(raw,'2026-10-03T12:00:00.000Z','2026-10-03T12:05:00.000Z');
  assert.equal(promoverCaptura(recalcularHashes(raw),dataDir).resultado,'completa');
  return criarServidor({dataDir,quadroConfigPath,port:0,midia:{obter:async()=>{throw Object.assign(new Error('Prévia sintética indisponível'),{status:503});}},atualizar:async()=>({resultado:'sem_alteracao'})});
}
async function capturarContexto(browser,origin,theme,width) {
      const context=await browser.newContext({viewport:{width,height:1050},colorScheme:theme});
      try {
      const page=await context.newPage(),errors=[],external=[];
      page.setDefaultTimeout(5000);
      page.on('pageerror',error=>errors.push(error.message));
      await page.clock.setFixedTime(new Date('2026-10-04T12:00:00Z'));
      await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():(external.push('requisição externa'),route.abort()));
      await page.goto(origin);
      await page.locator('#objetivo-toggle:not(:empty)').waitFor();
      assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
      const capture=async name=>{
        await page.screenshot({path:path.join(destination,`tema-${theme}-${name}-${width}.png`),fullPage:name!=='gaveta',animations:'disabled'});
      };
      await capture('planejamento');
      await page.locator('#lista [data-producao-id="peca-4"]').click();
      await capture('gaveta');await page.keyboard.press('Escape');
      for(const [label,name] of [['Produção','producao'],['Planilha','planilha']]) {
        if(width===390)await page.locator('#menu').click();
        await page.getByRole('button',{name:label,exact:true}).click();
        await capture(name);
      }
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
      } finally {await context.close();}
}
async function main() {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm-tema-sintetico-'));
  let server,browser;
  mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  try {
    server=preparar(root);
    await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
    const origin='http://127.0.0.1:'+server.address().port;
    const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');
    browser=await chromium.launch();fs.mkdirSync(destination,{recursive:true});
    for(const theme of ['light','dark'])for(const width of [1440,390])await capturarContexto(browser,origin,theme,width);
    process.stdout.write('Screenshots sintéticos: 16; passou\n');
  } finally {
    if(browser)await browser.close();
    if(server?.listening)await new Promise(resolve=>server.close(resolve));
    mock.timers.reset();
    // root é criado por este script e nunca recebe um caminho configurado.
    assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('crm-tema-sintetico-'));
    fs.rmSync(root,{recursive:true,force:true});
  }
}
main().catch(()=>{process.stderr.write('Screenshots sintéticos: falhou\n');process.exitCode=1;});
