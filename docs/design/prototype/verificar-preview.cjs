const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {pathToFileURL}=require('node:url');
const {chromium}=require(process.env.NODEKIT_PLAYWRIGHT_MODULE||'playwright');
async function main(){
 const browser=await chromium.launch({headless:true}),errors=[],requests=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 try{
  page.on('pageerror',e=>errors.push(e.message));
  await page.route(/^https?:/,route=>{requests.push('requisicao externa bloqueada');return route.abort();});
  const html=path.join(__dirname,'index.html');
  await page.goto(pathToFileURL(html).href);
  assert.equal(await page.locator('#calendarGrid .post').count(),12);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const shot=name=>page.screenshot({path:path.join(__dirname,'preview-sintetico-'+name+'.png'),fullPage:true});
  await shot('desktop');
  for(const format of ['imagem','carrossel','reels']){
   await page.locator('[data-filter="'+format+'"]').click();
   assert.equal(await page.locator('#calendarGrid .post').count(),4);
  }
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-view="list"]').click();
  assert.equal(await page.locator('#agenda .agenda-row:visible').count(),12);
  await page.locator('#agenda [data-post="p2"]').click();
  assert.equal(await page.locator('dialog').isVisible(),true);
  assert.equal(await page.locator('dialog .source-links a').count(),0);
  await shot('detalhe');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('dialog').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.activeElement.dataset.post),'p2');
  await page.locator('[data-section="content"]').click();
  assert.equal(await page.locator('#content .content-card:visible').count(),3);
  await shot('conteudos');
  await page.locator('[data-section="planning"]').click();
  await page.locator('[data-view="calendar"]').click();
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await shot('mobile');
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  const receipt={estado:'previa_sintetica_saneada_sem_integracao',verificado_em:new Date().toISOString(),html_sha256:crypto.createHash('sha256').update(fs.readFileSync(html)).digest('hex'),desktop:[1440,1000],mobile:[390,844],overflow_horizontal:false,erros_javascript:[],requisicoes_rede:[],interacoes:['12 itens','4 por formato','calendario/lista','Escape e foco','detalhe sem fontes externas','conteudos','390 px']};
  fs.writeFileSync(path.join(__dirname,'verificacao-sintetica.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log('PASS: interface saneada offline; quatro capturas sinteticas, recibo proprio.');
 }finally{await browser.close();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
