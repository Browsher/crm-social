const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {criarServidor}=require('../src/servidor.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {temporario,capturaMeses,mapaQuadroValido,mudarCelula}=require('./fixtures.cjs');
const web=path.resolve(__dirname,'../src/web');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
const namedColors=new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato transparent turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '));

function coresFixas(css) {
  const stack=[],found=[];
  const clean=css.replace(/\/\*[\s\S]*?\*\//g,'');
  let start=0;
  for(let i=0;i<clean.length;i++) {
    if(clean[i]==='{') {stack.push(clean.slice(start,i).trim());start=i+1;}
    else if(clean[i]===';'||clean[i]==='}') {
      const declaration=clean.slice(start,i).trim(),colon=declaration.indexOf(':');
      if(colon>0) {
        const property=declaration.slice(0,colon).trim(),value=declaration.slice(colon+1);
        const withoutVars=value.replace(/var\(\s*--[\w-]+\s*\)/g,'');
        const colors=[...(withoutVars.match(/#[\da-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)\s*\(/gi)??[]),...(withoutVars.match(/\b[a-z]+\b/gi)??[]).filter(word=>namedColors.has(word.toLowerCase()))];
        if(colors.length&&(!property.startsWith('--')||!/^:root$|^\[data-theme\s*=\s*["']?dark["']?\]$/.test(stack.at(-1)))) found.push({selector:stack.at(-1),property,colors});
      }
      if(clean[i]==='}')stack.pop();
      start=i+1;
    }
  }
  return found;
}
test('Tema: scanner identifica cores em regras, inclusive em media queries',()=>{
  assert.deepEqual(coresFixas(':root{--x:#fff;--shadow:0 1px rgb(0 0 0 / .2)}[data-theme=dark]{--x:black}.x{color:var(--x)}'),[]);
  assert.equal(coresFixas('@media(max-width:390px){.x{background:white;color:#fff;box-shadow:0 0 rgba(0,0,0,.2)}}').length,3);
  assert.equal(coresFixas('.x{--x:transparent}').length,1);
  assert.equal(coresFixas('.x{color:rebeccapurple;background:papayawhip}').length,2);
});
test('Tema: nenhuma cor literal fora das variáveis de :root e data-theme dark',()=>{
  assert.deepEqual(coresFixas(fs.readFileSync(path.join(web,'styles.css'),'utf8')),[]);
});
test('Tema: bootstrap síncrono antecede CSS e não depende do aplicativo defer',()=>{
  const html=fs.readFileSync(path.join(web,'index.html'),'utf8');
  const script=/<script\b([^>]*\bsrc=["']\/theme\.js["'][^>]*)>\s*<\/script>/.exec(html);
  assert.ok(script,'Bootstrap externo de tema deve existir');
  assert.doesNotMatch(script[1],/\b(?:async|defer)\b/);
  assert.ok(script.index<html.indexOf('href="/styles.css"'),'Tema aplicado antes de carregar estilos');
});
for(const [stored,preferred,expected] of [[null,true,'dark'],[null,false,'light'],['light',true,'light'],['dark',false,'dark'],['inválido',true,'dark']]) {
  test('Tema: bootstrap precoce com preferência '+preferred+' e escolha '+stored,()=>{
    const element={dataset:{},setAttribute(name,value){this[name]=value;}};
    const sandbox={document:{documentElement:element,addEventListener(){}},localStorage:{getItem(){return stored;}},matchMedia(){return {matches:preferred,addEventListener(){}};}};
    sandbox.window=sandbox;
    vm.runInNewContext(fs.readFileSync(path.join(web,'theme.js'),'utf8'),sandbox);
    assert.equal(element.dataset.theme??element['data-theme'],expected,'Aplica imediatamente antes de DOMContentLoaded');
  });
}
async function servidor(t,{captura=true}={}) {
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  const root=temporario(t),dataDir=path.join(root,'dados'),quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  if(captura) {
    const raw=capturaMeses([['2026-10','ntv','Objetivo sintético de tema','Pauta A\nPauta B\nPauta C']]);
    mudarCelula(raw,'Produções',4,'data_prevista','2026-10-03');
    promoverCaptura(raw,dataDir);
  }
  const server=criarServidor({dataDir,quadroConfigPath,port:0});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);}));
  return 'http://127.0.0.1:'+server.address().port;
}
test('Tema: rota GET/HEAD possui MIME JavaScript, CSP intacta e guarda local',async t=>{
  const origin=await servidor(t),response=await fetch(origin+'/theme.js');
  assert.equal(response.status,200);
  assert.equal(response.headers.get('content-type'),'text/javascript; charset=utf-8');
  assert.equal(response.headers.get('content-security-policy'),"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.ok((await response.text()).length>0);
  const head=await fetch(origin+'/theme.js',{method:'HEAD'});
  assert.equal(head.status,200);assert.equal(await head.text(),'');
  assert.equal((await fetch(origin+'/theme.js',{method:'POST'})).status,405);
  assert.equal((await fetch(origin+'/theme.js',{headers:{Origin:'https://example.invalid'}})).status,403);
});
async function abrir(t,{scheme='light',stored,width=1440,storageThrows=false,beforeNavigate,captura=true,ready='#objetivo-mes .month-content'}={}) {
  const origin=await servidor(t,{captura}),{chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');
  const browser=await chromium.launch();
  t.after(()=>browser.close());
  const context=await browser.newContext({viewport:{width,height:1050},colorScheme:scheme});
  if(stored!==undefined)await context.addInitScript(value=>{if(!localStorage.getItem('crm-theme'))localStorage.setItem('crm-theme',value);},stored);
  if(storageThrows)await context.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('bloqueado');};Storage.prototype.setItem=()=>{throw new Error('bloqueado');};});
  const page=await context.newPage(),errors=[],external=[];
  page.setDefaultTimeout(2500);
  page.on('pageerror',e=>errors.push(e.message));
  await page.clock.setFixedTime(new Date('2026-10-04T12:00:00Z'));
  await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():(external.push(route.request().url()),route.abort()));
  t.after(()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);});
  if(beforeNavigate)await beforeNavigate(page);
  await page.goto(origin);
  await page.locator(ready).waitFor();
  return page;
}
for(const scheme of ['dark','light'])test('Tema: primeira visita respeita prefers-color-scheme '+scheme,{skip},async t=>{
  const page=await abrir(t,{scheme});
  assert.equal(await page.locator('html').getAttribute('data-theme'),scheme);
  assert.equal(await page.locator('#theme-toggle').textContent(),scheme==='dark'?'☀ Claro':'☾ Escuro');
  assert.equal(await page.locator('#theme-toggle').getAttribute('aria-label'),scheme==='dark'?'Ativar tema claro':'Ativar tema escuro');
  assert.equal(await page.locator('#theme-toggle').getAttribute('aria-pressed'),null,'Ação não anuncia estado de botão pressionado');
});
for(const width of [1440,390])test('Tema: teclado alterna e ambos os temas persistem após reload em '+width,{skip},async t=>{
  const page=await abrir(t,{scheme:'light',width}),button=page.locator('#theme-toggle');
  assert.equal(await button.isVisible(),true);
  assert.equal(await button.textContent(),'☾ Escuro');
  assert.equal(await button.getAttribute('aria-label'),'Ativar tema escuro');
  const rect=await button.boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=width);
  await button.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.equal(await button.getAttribute('aria-pressed'),null);
  assert.equal(await button.textContent(),'☀ Claro');
  assert.equal(await button.getAttribute('aria-label'),'Ativar tema claro');
  assert.equal(await page.evaluate(()=>localStorage.getItem('crm-theme')),'dark');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  assert.equal(await button.textContent(),'☀ Claro');
  assert.equal(await button.getAttribute('aria-label'),'Ativar tema claro');
  await button.focus();await page.keyboard.press('Space');
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await button.getAttribute('aria-pressed'),null);
  assert.equal(await button.textContent(),'☾ Escuro');
  assert.equal(await button.getAttribute('aria-label'),'Ativar tema escuro');
  assert.equal(await page.evaluate(()=>localStorage.getItem('crm-theme')),'light');
  await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  assert.equal(await button.textContent(),'☾ Escuro');
  assert.equal(await button.getAttribute('aria-label'),'Ativar tema escuro');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
test('Tema: escolha salva sobrepõe preferência do sistema',{skip},async t=>{
  const page=await abrir(t,{scheme:'dark',stored:'light'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
});
test('Tema: armazenamento indisponível não impede preferência ou alternância',{skip},async t=>{
  const page=await abrir(t,{scheme:'dark',storageThrows:true});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
});
for(const storageThrows of [false,true])test('Tema: acompanha sistema até escolha manual, armazenamento bloqueado '+storageThrows,{skip},async t=>{
  const page=await abrir(t,{scheme:'light',storageThrows});
  await page.emulateMedia({colorScheme:'dark'});
  await page.waitForFunction(()=>document.documentElement.dataset.theme==='dark');
  await page.locator('#theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.emulateMedia({colorScheme:'light'});
  await page.emulateMedia({colorScheme:'dark'});
  assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
});
for(const [scheme,stored,expected] of [['dark',undefined,'dark'],['dark','light','light']])test('Tema: correto antes da resposta CSS e do primeiro render '+expected,{skip},async t=>{
  let observed;
  const page=await abrir(t,{scheme,stored,beforeNavigate:async page=>{
    await page.route('**/styles.css',async route=>{
      observed=await page.locator('html').getAttribute('data-theme');
      await route.continue();
    });
  }});
  assert.equal(observed,expected);assert.equal(await page.locator('html').getAttribute('data-theme'),expected);
});
async function conferirContraste(page) {
  const failures=await page.evaluate(()=>{
    const rgba=text=>text.match(/[\d.]+/g)?.map(Number)??[0,0,0,0];
    const mix=(front,back)=>{const a=front[3]??1;return front.slice(0,3).map((c,i)=>c*a+back[i]*(1-a));};
    const lum=rgb=>rgb.map(c=>{const x=c/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
    const failures=[];
    for(const node of document.querySelectorAll('body *')) {
      if(![...node.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim())||node.closest('[hidden],[aria-hidden="true"],button:disabled,[aria-disabled="true"]'))continue;
      const rect=node.getBoundingClientRect(),style=getComputedStyle(node);
      if(!rect.width||!rect.height||style.visibility==='hidden'||style.display==='none')continue;
      let bg=[255,255,255];
      const ancestors=[];for(let n=node;n;n=n.parentElement)ancestors.push(n);
      for(const ancestor of ancestors.reverse())bg=mix(rgba(getComputedStyle(ancestor).backgroundColor),bg);
      const fg=mix(rgba(style.color),bg),light=lum(fg),dark=lum(bg);
      const ratio=(Math.max(light,dark)+.05)/(Math.min(light,dark)+.05);
      // A single AA threshold of 4.5 also covers large text conservatively.
      if(ratio<4.5)failures.push({element:node.tagName.toLowerCase()+(node.id?'#'+node.id:'')+(node.className?'.'+String(node.className).trim().replace(/\s+/g,'.'):''),ratio:Number(ratio.toFixed(3)),foreground:style.color,background:bg.map(Math.round)});
    }
    return failures;
  });
  assert.deepEqual(failures,[],'Texto visível deve atingir contraste AA de 4.5:1');
}
for(const scheme of ['light','dark'])for(const width of [1440,390])test('Tema: contraste AA e formatos distintos em todas as telas '+scheme+' '+width,{skip,timeout:20000},async t=>{
  const page=await abrir(t,{scheme,width});
  await conferirContraste(page);
  const colors=await page.locator('#calendario .post').evaluateAll(nodes=>[...new Set(nodes.map(n=>getComputedStyle(n).backgroundColor))]);
  assert.equal(colors.length,3,'Imagem, carrossel e Reels possuem superfícies distintas');
  if(width===1440)await page.getByRole('button',{name:'Lista',exact:true}).click();
  const rows=page.locator('#lista .agenda-row');
  const listColors=await rows.evaluateAll(nodes=>[...new Set(nodes.map(n=>getComputedStyle(n).backgroundColor))]);
  assert.equal(listColors.length,3,'A lista conserva a cor de cada formato');
  await conferirContraste(page);
  if(width===1440)await page.getByRole('button',{name:'Calendário',exact:true}).click();
  await page.locator((width===1440?'#calendario':'#lista')+' [data-producao-id="peca-4"]').click();
  await conferirContraste(page);
  await page.keyboard.press('Escape');
  for(const screen of ['Produção','Planilha']) {
    if(width===390)await page.locator('#menu').click();
    await page.getByRole('button',{name:screen,exact:true}).click();
    await conferirContraste(page);
  }
  await page.locator('[data-aba="Meses"]').click();await conferirContraste(page);
  await page.locator('[data-aba="Histórico"]').click();await conferirContraste(page);
});
for(const scheme of ['light','dark']) {
  test('Tema: erro de consulta mantém texto AA em '+scheme,{skip},async t=>{
    const page=await abrir(t,{scheme,ready:'#erro',beforeNavigate:page=>page.route('**/api/visao',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({erro:'Estado local indisponível; última captura não foi alterada'})}))});
    assert.equal(await page.locator('#erro').isVisible(),true);await conferirContraste(page);
  });
  test('Tema: estado sem captura e selo têm contraste AA em '+scheme,{skip},async t=>{
    const page=await abrir(t,{scheme,captura:false,ready:'#sem-captura'});
    assert.equal(await page.locator('#sem-captura').isVisible(),true);await conferirContraste(page);
  });
}
