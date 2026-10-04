const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,mapaQuadroValido,temporario,recalcularHashes}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const CI=process.env.CI==='true';
const skip=CI?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
async function abrir(t,width=1440,captura=true) {
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE || 'playwright');
  const root=temporario(t), dataDir=path.join(root,'dados'), quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  if (captura) {
    const raw=capturaValida(), table=raw.tables.Produções;
    const row=table.values[1].slice();
    row[table.values[0].indexOf('producao_id')]='peca-6';
    row[table.values[0].indexOf('titulo')]='Sem data sintética';
    row[table.values[0].indexOf('data_prevista')]='';
    table.values.push(row);
    promoverCaptura(recalcularHashes(raw),dataDir);
  }
  const server=criarServidor({dataDir,quadroConfigPath,port:0});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const browser=await chromium.launch();
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:1050}});
  page.setDefaultTimeout(3000);
  await page.clock.setFixedTime(new Date('2026-10-04T12:00:00Z'));
  const origin='http://127.0.0.1:'+server.address().port, external=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
    if (!route.request().url().startsWith(origin+'/')) {external.push(route.request().url());return route.abort();}
    return route.continue();
  });
  t.after(()=>{assert.deepEqual(external,[]);assert.deepEqual(errors,[]);});
  await page.goto(origin);
  return page;
}
test('U01 menu exato, objetivo mensal indefinido e dia múltiplo', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('#planejamento').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('nav [data-tela]').allTextContents(),['Planejamento','Produção','Planilha']);
  assert.match(await page.locator('#objetivo-mes').textContent(),/Ainda não definido/);
  assert.equal(await page.getByRole('button',{name:'Plano do mês'}).count(),0);
  assert.equal(await page.locator('#calendario [data-producao-id="peca-3"]').count(),1);
  assert.equal(await page.locator('#calendario [data-producao-id="peca-4"]').count(),0);
  assert.equal(await page.getByRole('button',{name:'+1 no dia',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:'1 sem data',exact:true}).count(),1);
});
test('U01 lista/filtros conservam identidades e sem data não depende do mês', {skip}, async t => {
  const page=await abrir(t);
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-3','peca-4','peca-6']);
  await page.getByRole('button',{name:'Imagem',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-6']);
  await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
  await page.getByRole('button',{name:'1 sem data',exact:true}).click();
  assert.equal(await page.locator('#sem-data [data-producao-id="peca-6"]').count(),1);
  assert.match(await page.locator('#sem-data').textContent(),/Conexões do cotidiano/);
  await page.getByRole('button',{name:'Todos',exact:true}).click();
  await page.getByRole('button',{name:'Mês anterior',exact:true}).click();
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.equal(await page.locator('#lista [data-producao-id]').count(),5);
});
test('U02 celular começa em lista/menu recolhido e não tem corte horizontal', {skip}, async t => {
  const page=await abrir(t,390);
  await page.locator('#lista').waitFor({state:'visible'});
  assert.equal(await page.locator('#calendario').isVisible(),false);
  assert.equal(await page.locator('nav').isVisible(),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
  assert.equal(await page.locator('nav').isVisible(),true);
  await page.getByRole('button',{name:'Planejamento',exact:true}).click();
  assert.equal(await page.locator('nav').isVisible(),false);
});
test('U02 desktop sem corte e ausência real sem fallback de demonstração', {skip}, async t => {
  const page=await abrir(t,1440,false);
  await page.getByText('Peça a primeira leitura à Central.',{exact:true}).waitFor();
  assert.equal(await page.locator('[data-producao-id]').count(),0);
  assert.equal(await page.getByRole('button',{name:'Sem dados',exact:true}).count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
