const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaPronta,mudarPacote}=require('./pronta-fixtures.cjs');
const {temporario,mudarCelula,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
async function abrir(t,{width=390,theme='light',editar=()=>{}}={}) {
  const dir=temporario(t),raw=capturaPronta();editar(raw);
  assert.equal(promoverCaptura(recalcularHashes(raw),dir).resultado,'completa');
  const server=criarServidor({dataDir:dir,port:0});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;
  t.after(async()=>{try{if(browser)await browser.close();}finally{await new Promise(resolve=>server.close(resolve));}});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width,height:1050},colorScheme:theme,reducedMotion:'reduce'});
  page.setDefaultTimeout(3000);
  await page.clock.setFixedTime(new Date('2026-10-02T14:00:00Z'));
  // Clipboard em memória: teste não lê nem altera o clipboard pessoal do autor.
  await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{
    if(window.falharClipboard)throw new Error('Falha sintética');window.copiadoSintetico=text;
  }}}));
  const origin='http://127.0.0.1:'+server.address().port,errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{const request=route.request();requests.push(request.method()+' '+new URL(request.url()).pathname);
    return request.url().startsWith(origin+'/')?route.continue():route.abort();});
  t.after(()=>{assert.deepEqual(errors,[]);assert.ok(requests.every(r=>r.startsWith('GET ')));});
  await page.goto(origin);await page.locator('#objetivo-mes .month-content').waitFor();
  if(width===390)await page.locator('#menu').click();
  await page.getByRole('button',{name:'Produção',exact:true}).click();
  return page;
}
async function gaveta(page) {
  await page.locator('#quadro [data-producao-id="peca-3"]').click();
  return page.locator('#dia [data-peca="peca-3"]');
}
async function screenshot(page,name,theme,width) {
  if(process.env.CRM_SCREENSHOTS_PRONTA!=='1')return;
  // Exportação sintética opt-in solicitada pelo autor; dados e servidor dos testes ficam em TEMP.
  const destination=path.resolve(__dirname,'../docs/design/screenshots');fs.mkdirSync(destination,{recursive:true});
  await page.screenshot({path:path.join(destination,`pronta-${theme}-${name}-${width}.png`),fullPage:name==='quadro',animations:'disabled'});
}
for(const theme of ['light','dark'])for(const width of [1440,390])test(`Pronta quadro, gaveta, cópia e avisos em ${theme}/${width}`,{skip},async t=>{
  const page=await abrir(t,{width,theme}),card=page.locator('#quadro [data-coluna="Pronta"] [data-producao-id="peca-3"]');
  await card.waitFor();assert.match(await card.innerText(),/Pronta para publicar/);
  assert.equal(await card.locator('.board-pending').count(),0);
  await card.scrollIntoViewIfNeeded();await screenshot(page,'quadro',theme,width);
  const p=await gaveta(page),section=p.locator('[data-publicacao]');
  assert.equal(await p.locator('.piece-body>:first-child').getAttribute('data-publicacao'),'');
  assert.equal(await section.locator('h3').innerText(),'Pronta para publicar');
  const link=section.getByRole('link',{name:'Baixar pacote',exact:true});
  assert.equal(await link.getAttribute('href'),'https://drive.google.com/file/d/pacote-sintetico-3/view');
  assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
  assert.match(await section.innerText(),/Legenda sintética.*#ExemploSintetico/s);
  const fold=p.locator('details[data-detalhes-producao]');assert.equal(await fold.evaluate(n=>n.open),false);
  assert.equal(await p.locator('.unit-record:visible').count(),0);
  assert.equal(await p.locator('.notice').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await screenshot(page,'gaveta',theme,width);
  const copy=section.getByRole('button',{name:'Copiar legenda',exact:true});await copy.focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.copiadoSintetico);
  assert.equal(await page.evaluate(()=>window.copiadoSintetico),'Legenda sintética para publicação manual.\nUma segunda linha de exemplo.\n\n#ExemploSintetico #PublicacaoManual');
  assert.equal(await section.getByRole('status').innerText(),'Legenda copiada.');
  await fold.locator(':scope>summary').click();assert.ok(await p.locator('.unit-record:visible').count()>0);
  assert.equal(await p.locator('.notice').count(),0);
  await p.getByRole('link',{name:'ver na Planilha',exact:true}).click();
  assert.ok(await page.locator('#avisos-tabela tbody tr').count()>0);
  assert.match(await page.locator('#avisos-tabela').innerText(),/Imagem ausente/);
});
test('Pronta preserva revisão vigente na gaveta após a seção de publicação',{skip},async t=>{
  const page=await abrir(t,{editar:raw=>adicionarRegistro(raw,'Revisoes',{
    revisao_id:'revisao-liberada-sintetica',producao_id:'peca-3',versao:2,decisao:'revisar',
    motivo:'Correção sintética ainda registrada',responsavel_correcao:'Equipe sintética',estado_tratamento:'aberta'
  })});
  const card=page.locator('#quadro [data-coluna="Pronta"] [data-producao-id="peca-3"]');
  assert.match(await card.innerText(),/Pronta para publicar/);
  assert.equal(await card.locator('.board-pending').count(),0);
  const p=await gaveta(page),review=p.locator('[data-revisoes="vigentes"]');
  assert.equal(await review.isVisible(),true);
  assert.match(await review.innerText(),/Revisão vigente.*Correção sintética ainda registrada.*Equipe sintética/is);
  assert.equal(await p.evaluate(el=>Boolean(el.querySelector('[data-publicacao]').compareDocumentPosition(
    el.querySelector('[data-revisoes="vigentes"]'))&Node.DOCUMENT_POSITION_FOLLOWING)),true);
});
for(const url of ['https://docs.google.com/document/d/sintetico','http://drive.google.com/file/d/sintetico',
  'https://drive.google.com.exemplo.invalid/pacote','https://drive.google.com:444/pacote',
  'https://usuario:senha@drive.google.com/pacote','url-malformada',''])test('Pronta recusa URL de pacote fora da allowlist: '+url.replace(/usuario:senha/,'credencial-sintetica'),{skip},async t=>{
  const page=await abrir(t,{editar:raw=>mudarPacote(raw,'url',url)}),p=await gaveta(page);
  assert.equal(await p.locator('[data-publicacao]').getByRole('link',{name:'Baixar pacote',exact:true}).count(),0);
  assert.match(await p.locator('[data-publicacao]').innerText(),/Pacote indisponível/);
});
test('Pronta texto literal, falha de clipboard e nova tentativa sem escrever na operação',{skip},async t=>{
  const literal='<img src=x onerror=alert(1)> texto de exemplo';
  const page=await abrir(t,{editar:raw=>mudarCelula(raw,'Produções',3,'legenda',literal)}),p=await gaveta(page),section=p.locator('[data-publicacao]');
  assert.equal(await section.locator('.publication-caption img').count(),0);assert.match(await section.innerText(),/<img src=x/);
  await page.evaluate(()=>window.falharClipboard=true);
  await section.getByRole('button',{name:'Copiar legenda',exact:true}).click();
  await page.waitForFunction(()=>document.querySelector('[data-publicacao] [role=status]').textContent.includes('Não foi possível'));
  await page.evaluate(()=>window.falharClipboard=false);
  await section.getByRole('button',{name:'Copiar legenda',exact:true}).click();
  await page.waitForFunction(()=>window.copiadoSintetico);
  assert.equal(await page.evaluate(()=>window.copiadoSintetico),literal+'\n\n#ExemploSintetico #PublicacaoManual');
});
test('Pronta ausência de texto é explícita; publicada não mostra seção de pronta',{skip},async t=>{
  const page=await abrir(t,{editar:raw=>{mudarCelula(raw,'Produções',3,'legenda','');mudarCelula(raw,'Produções',3,'hashtags','');}}),p=await gaveta(page);
  assert.equal(await p.getByRole('button',{name:'Copiar legenda',exact:true}).isDisabled(),true);
  assert.match(await p.locator('[data-publicacao]').innerText(),/Legenda não informada.*Hashtags não informadas/s);
  await page.keyboard.press('Escape');
  await page.locator('#quadro [data-producao-id="peca-1"]').click();
  assert.equal(await page.locator('#dia [data-publicacao]').count(),0);
});
