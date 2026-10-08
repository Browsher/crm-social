const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {temporario,adicionarRegistro}=require('./fixtures.cjs');
const {capturaPrevias,mudarPorId,recalcularHashes,imagemPorArquivo,sha256,credencialSintetica,transporteFalso,respostaStream}=require('./previas-fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const google=require('../src/google.cjs');
const midia=require('../src/midia.cjs');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
async function abrir(t,{width=390,theme='light',editar=()=>{},download,timeoutMs=15000}={}) {
  const dir=temporario(t),raw=capturaPrevias();editar(raw);
  assert.equal(promoverCaptura(recalcularHashes(raw),dir).resultado,'completa');
  const credentials=credencialSintetica(t),transport=transporteFalso({download:download||(async(url,options)=>{
    const driveId=decodeURIComponent(new URL(url).pathname.split('/').at(-1));
    assert.match(driveId,/^drive-sintetico-/);
    return respostaStream([imagemPorArquivo(driveId.replace(/^drive-sintetico-/,''))],{signal:options.signal});
  })});
  assert.equal(typeof midia.criarServicoMidia,'function');
  const service=midia.criarServicoMidia({dataDir:dir,criarCliente:()=>google.criarClienteDrive({...credentials,fetchImpl:transport.fetchImpl,timeoutMs})});
  const server=criarServidor({dataDir:dir,port:0,midia:service});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  let browser;t.after(async()=>{try{if(browser)await browser.close();}finally{await new Promise(resolve=>server.close(resolve));}});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width,height:1050},colorScheme:theme,reducedMotion:'reduce'}),errors=[],requests=[],external=[],responses=[];
  page.on('response',response=>{if(new URL(response.url()).pathname.startsWith('/api/midia/'))responses.push({path:new URL(response.url()).pathname,status:response.status()});});
  page.setDefaultTimeout(3000);page.on('pageerror',error=>errors.push(error.message));
  await page.clock.setFixedTime(new Date('2026-10-02T14:00:00Z'));
  const origin='http://127.0.0.1:'+server.address().port;
  await page.route('**/*',route=>{
    const request=route.request(),url=new URL(request.url());requests.push({url:request.url(),method:request.method(),path:url.pathname});
    if(url.origin===origin)return route.continue();external.push(request.url());return route.abort();
  });
  t.after(()=>{assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.ok(requests.every(r=>r.method==='GET'));});
  await page.goto(origin);await page.locator('#objetivo-toggle:not(:empty)').waitFor();
  if(width===390)await page.locator('#menu').click();
  await page.getByRole('button',{name:'Produção',exact:true}).click();
  return {page,origin,transport,requests,responses,dir,raw,service};
}
const pedidosMidia=context=>context.requests.filter(request=>request.path.startsWith('/api/midia/'));
const downloads=context=>context.transport.calls.filter(call=>new URL(call.url).hostname==='www.googleapis.com');
async function abrirPeca(context,id='peca-3') {
  const {page}=context;
  await page.locator('#quadro [data-producao-id="'+id+'"]').click();
  const piece=page.locator('#dia [data-peca="'+id+'"]');
  if(!await piece.evaluate(node=>node.open))await piece.locator(':scope>summary').click();
  return piece;
}
async function imagensCarregadas(piece,count) {
  const gallery=piece.locator('[data-previas]');
  assert.equal(await gallery.count(),1,'a peça deve oferecer uma faixa de prévias');
  assert.equal(await gallery.locator('article[data-previa-arquivo]').count(),count);
  await gallery.locator('img').first().waitFor();
  await gallery.page().waitForFunction(expected=>{
    const piece=document.querySelector('#dia details[data-peca][open]');
    const images=[...piece.querySelectorAll('[data-previas] img')];
    return images.length===expected&&images.every(img=>img.complete&&img.naturalWidth>0);
  },count);
  return gallery;
}
async function idsDaGaleria(gallery) {return gallery.locator('article[data-previa-arquivo]').evaluateAll(nodes=>nodes.map(node=>node.dataset.previaArquivo));}
async function screenshot(page,theme,vista,width) {
  if(process.env.CRM_SCREENSHOTS_PREVIAS!=='1')return;
  const destination=path.resolve(__dirname,'../docs/design/screenshots');fs.mkdirSync(destination,{recursive:true});
  await page.screenshot({path:path.join(destination,`previas-${theme}-${vista}-${width}.png`),animations:'disabled'});
}
async function conferirMiniaturaVertical(position) {
  const img=position.locator('img'),button=position.getByRole('button'),box=await button.boundingBox();
  assert.deepEqual(await img.evaluate(node=>[node.naturalWidth,node.naturalHeight]),[1080,1350]);
  assert.equal(await img.evaluate(node=>getComputedStyle(node).objectFit),'contain');
  assert.ok(Math.abs(box.width/box.height-4/5)<0.005,`a caixa da miniatura preserva 4:5 (${box.width}×${box.height})`);
}
async function conferirAmpliacaoInteira(page,viewer,image) {
  const [large,dialog,close,viewport]=await Promise.all([image.boundingBox(),viewer.boundingBox(),
    viewer.getByRole('button',{name:'Fechar imagem',exact:true}).boundingBox(),page.evaluate(()=>{
      const v=visualViewport;return {left:v?.offsetLeft||0,top:v?.offsetTop||0,width:v?.width||innerWidth,height:v?.height||innerHeight};
    })]);
  assert.deepEqual(await image.evaluate(node=>[node.naturalWidth,node.naturalHeight]),[1080,1350]);
  assert.equal(await image.evaluate(node=>getComputedStyle(node).objectFit),'contain');
  assert.ok(Math.abs(large.width/large.height-4/5)<0.003,`a imagem ampliada preserva 4:5 (${large.width}×${large.height})`);
  for(const [name,box] of [['imagem',large],['dialog',dialog],['botão Fechar',close]]) {
    assert.ok(box.x>=viewport.left-1&&box.y>=viewport.top-1&&box.x+box.width<=viewport.left+viewport.width+1&&
      box.y+box.height<=viewport.top+viewport.height+1,`${name} deve caber inteiro na visualViewport ${viewport.width}×${viewport.height}`);
  }
  assert.ok(Math.abs(dialog.x+dialog.width/2-(viewport.left+viewport.width/2))<=2,'dialog centralizado horizontalmente');
  assert.ok(Math.abs(dialog.y+dialog.height/2-(viewport.top+viewport.height/2))<=2,'dialog centralizado verticalmente');
  assert.ok(Math.abs(large.x+large.width/2-(dialog.x+dialog.width/2))<=2,'imagem centralizada horizontalmente no dialog');
  assert.equal(await viewer.evaluate(node=>node.scrollWidth<=node.clientWidth+1&&node.scrollHeight<=node.clientHeight+1),true,'visualizador sem corte ou rolagem interna');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  return large;
}
function arquivoImagem(raw,id,record={}) {
  adicionarRegistro(raw,'Arquivos',{arquivo_id:id,producao_id:'peca-1',semana_id:'semana-01',tipo:'imagem',versao:1,
    id_drive:'drive-sintetico-'+id,sha256:sha256(imagemPorArquivo(id)),url:'https://drive.google.com/file/d/'+id+'/view',...record});
}
for(const theme of ['light','dark'])for(const width of [1440,390])test(`Prévias US1 galeria pronta ordenada, demanda e rolagem em ${theme}/${width}`,{skip},async t=>{
  const context=await abrir(t,{width,theme}),{page,origin}=context;
  assert.ok(pedidosMidia(context).every(r=>/\/api\/midia\/(imagem-pagina-1|cena-inicio)$/.test(r.path)),'listas visíveis carregam somente a primeira posição');
  const piece=await abrirPeca(context),gallery=await imagensCarregadas(piece,5);
  assert.deepEqual(await idsDaGaleria(gallery),[1,2,3,4,5].map(n=>'imagem-pagina-'+n));
  assert.equal(await piece.locator('[data-publicacao] [data-previas]').count(),1);
  assert.equal(await piece.locator('details[data-detalhes-producao]').evaluate(node=>node.open),false);
  assert.equal(await piece.locator('details[data-detalhes-producao] [data-previas]').count(),0);
  assert.equal(await piece.locator('.unit-record:visible').count(),0);
  assert.equal(await piece.getByRole('link',{name:'Baixar pacote',exact:true}).getAttribute('href'),'https://drive.google.com/file/d/pacote-sintetico-3/view');
  for(const n of [1,2,3,4,5]) {
    const position=gallery.locator('article[data-previa-arquivo="imagem-pagina-'+n+'"]');
    assert.equal(await position.locator('img').getAttribute('alt'),'Página '+n);
    assert.equal(await position.locator('img').getAttribute('src'),'/api/midia/imagem-pagina-'+n);
    assert.equal(await position.getByRole('link').getAttribute('href'),'https://drive.google.com/file/d/imagem-sintetica-'+n+'/view');
    await conferirMiniaturaVertical(position);
  }
  assert.equal(await page.locator('#dia [data-peca="peca-4"]').evaluate(node=>node.open),false);
  assert.equal(await page.locator('#dia [data-peca="peca-4"] img[src]').count(),0);
  assert.equal(downloads(context).filter(call=>call.url.includes('imagem-pagina-')).length,5);
  assert.ok(pedidosMidia(context).every(request=>request.url.startsWith(origin+'/api/midia/')));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('#dia').evaluate(node=>node.scrollWidth<=node.clientWidth),true);
  await screenshot(page,theme,'galeria',width);
  if(width===390) {
    assert.equal(await gallery.evaluate(node=>node.scrollWidth>node.clientWidth),true);
    await gallery.evaluate(node=>{node.scrollLeft=node.scrollWidth;});
    assert.equal(await gallery.locator('article').last().evaluate(node=>{const r=node.getBoundingClientRect(),p=node.parentElement.getBoundingClientRect();return r.right<=p.right+2&&r.left>=p.left-2;}),true);
    await gallery.evaluate(node=>{node.scrollLeft=0;});
  }
  await page.keyboard.press('Escape');await abrirPeca(context);await imagensCarregadas(page.locator('#dia [data-peca="peca-3"]'),5);
  assert.equal(downloads(context).filter(call=>call.url.includes('imagem-pagina-')).length,5,'reabrir reutiliza cache local sem novo download remoto');
  assert.equal(context.transport.calls.filter(call=>call.url.endsWith('/token')).length,1);
});
test('Prévias US1 cenas mostram início/final na ordem e vídeo permanece somente link',{skip},async t=>{
  const context=await abrir(t,{width:1440}),piece=await abrirPeca(context,'peca-3');await imagensCarregadas(piece,5);
  const scene=context.page.locator('#dia [data-peca="peca-4"]');
  assert.equal(await scene.evaluate(node=>node.open),false);assert.equal(downloads(context).filter(call=>call.url.includes('imagem-pagina-')).length,5);
  await piece.locator(':scope>summary').click();await scene.locator(':scope>summary').click();
  const gallery=await imagensCarregadas(scene,2);
  assert.deepEqual(await idsDaGaleria(gallery),['cena-inicio','cena-final']);
  assert.deepEqual(await gallery.locator('img').evaluateAll(nodes=>nodes.map(node=>node.alt)),['Cena 1 · início','Cena 1 · final']);
  assert.equal(await gallery.locator('[data-previa-arquivo="cena-video"]').count(),0);
  assert.equal(downloads(context).length,7);assert.ok(downloads(context).every(call=>!call.url.includes('cena-video')));
  await scene.locator('[data-detalhes-producao]>summary').click();
  assert.equal(await scene.locator('[data-cena="cena-v3-1"] a[href="https://drive.google.com/file/d/cena-video-sintetico/view"]').count(),1);
});
test('Prévias US1 maior versão por índice, empates e ponteiros repetidos conservam cada posição',{skip},async t=>{
  const context=await abrir(t,{width:1440,editar:raw=>{
    mudarPorId(raw,'Arquivos','imagem-pagina-1','pagina_id','');mudarPorId(raw,'Arquivos','imagem-pagina-3','pagina_id','');
    adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v3-1-z',producao_id:'peca-3',versao:3,indice:1,titulo:'Empate sintético',arquivo_imagem_id:'imagem-pagina-1'});
    adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-historica-2',producao_id:'peca-3',versao:2,indice:2,titulo:'Histórica fora da galeria',arquivo_imagem_id:'imagem-pagina-2'});
    adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v4-3',producao_id:'peca-3',versao:4,indice:3,titulo:'Texto atualizado',arquivo_imagem_id:'imagem-pagina-3'});
  }}),piece=await abrirPeca(context),gallery=await imagensCarregadas(piece,6);
  assert.deepEqual(await idsDaGaleria(gallery),['imagem-pagina-1','imagem-pagina-1','imagem-pagina-2','imagem-pagina-3','imagem-pagina-4','imagem-pagina-5']);
  assert.deepEqual(await gallery.locator('img').evaluateAll(nodes=>nodes.map(node=>node.alt)),['Página 1','Página 1','Página 2','Página 3','Página 4','Página 5']);
  assert.equal(downloads(context).filter(call=>call.url.includes('imagem-pagina-')).length,5);assert.equal(await gallery.getByText('Histórica fora da galeria').count(),0);
});
test('Prévias US1 imagem sem unidades usa versão da produção e preserva arquivos empatados por ID',{skip},async t=>{
  const context=await abrir(t,{width:390,editar:raw=>{
    arquivoImagem(raw,'imagem-sem-unidade-b');arquivoImagem(raw,'imagem-sem-unidade-a');
    arquivoImagem(raw,'imagem-versao-futura',{versao:2});arquivoImagem(raw,'imagem-outra-producao',{producao_id:'peca-5'});
    arquivoImagem(raw,'documento-sem-unidade',{tipo:'documento'});
  }}),piece=await abrirPeca(context,'peca-1'),gallery=await imagensCarregadas(piece,2);
  assert.deepEqual(await idsDaGaleria(gallery),['imagem-sem-unidade-a','imagem-sem-unidade-b']);
  assert.deepEqual(await gallery.locator('img').evaluateAll(nodes=>nodes.map(node=>node.alt)),['Imagem 1','Imagem 2']);
  assert.equal(downloads(context).filter(call=>/imagem-sem-unidade-[ab]$/.test(new URL(call.url).pathname)).length,2);assert.equal(await piece.locator('[data-publicacao]').count(),0);
});
function arquivosOperacionais(dir) {
  return fs.readdirSync(dir,{recursive:true}).filter(name=>!name.startsWith('midias')&&fs.statSync(path.join(dir,name)).isFile())
    .map(name=>[name,fs.readFileSync(path.join(dir,name)).toString('base64')]).sort((a,b)=>a[0].localeCompare(b[0]));
}
const falhasVisuais=[
  ['permissão',503,()=>new Response('falha-privada-sintetica@example.invalid',{status:403})],
  ['rede',503,()=>{throw new Error('falha-privada-sintetica@example.invalid');}],
  ['timeout',503,()=>respostaStream([],{stall:true})],
  ['tipo',422,()=>new Response('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
  ['tamanho',422,()=>respostaStream([Buffer.alloc(15000001)])],
  ['hash',422,()=>new Response(imagemPorArquivo('imagem-pagina-2'))],
  ['indecodificável',200,()=>new Response(Buffer.from([137,80,78,71,13,10,26,10]))]
];
const cenariosFalhas=falhasVisuais.flatMap(falha=>falha[0]==='permissão'?['light','dark'].flatMap(theme=>[1440,390].map(width=>[...falha,theme,width])):[[...falha,'light',390]]);
for(const [causa,status,falhar,theme,width] of cenariosFalhas)test(`Prévias US3 ${causa} em ${theme}/${width} mostra fallback localizado e conserva Pronta/Drive/captura`,{skip},async t=>{
  const context=await abrir(t,{width,theme,timeoutMs:100,editar:raw=>{
    if(causa!=='hash')mudarPorId(raw,'Arquivos','imagem-pagina-1','sha256','');
  },download:async(url,options)=>{
    const id=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/^drive-sintetico-/,'');
    return id==='imagem-pagina-1'?falhar():respostaStream([imagemPorArquivo(id)],{signal:options.signal});
  }}),before=arquivosOperacionais(context.dir),piece=await abrirPeca(context),gallery=piece.locator('[data-previas]');
  await context.page.waitForFunction(()=>{
    const images=[...document.querySelectorAll('#dia [data-peca="peca-3"] [data-previas] img')];
    return images.length===5&&images.every(img=>img.complete);
  });
  const failed=gallery.locator('[data-previa-arquivo="imagem-pagina-1"]');
  assert.equal(await failed.getByText('Prévia indisponível',{exact:true}).count(),1,'a imagem recusada deve oferecer uma mensagem local');
  assert.equal(await gallery.getByText('Prévia indisponível',{exact:true}).count(),1);
  assert.equal(await failed.getByRole('button',{name:'Ampliar imagem — Página 1',exact:true}).isDisabled(),true);
  assert.equal(await failed.locator('img:visible').count(),0,'o ícone de imagem quebrada deve ficar oculto');
  assert.equal(await failed.getByRole('link').getAttribute('href'),'https://drive.google.com/file/d/imagem-sintetica-1/view');
  assert.equal(await gallery.locator('img').evaluateAll(images=>images.filter(img=>img.complete&&img.naturalWidth>0).length),4);
  assert.deepEqual([...new Set(context.responses.filter(response=>response.path.endsWith('/imagem-pagina-1')).map(response=>response.status))],[status]);
  assert.match(await piece.locator('[data-publicacao]').innerText(),/Pronta para publicar.*Legenda sintética.*#ExemploSintetico/s);
  assert.equal(await piece.getByRole('link',{name:'Baixar pacote',exact:true}).getAttribute('href'),'https://drive.google.com/file/d/pacote-sintetico-3/view');
  assert.equal(await piece.locator('details[data-detalhes-producao]').evaluate(node=>node.open),false);
  assert.equal(await piece.locator('.notice').count(),0);
  assert.doesNotMatch(await piece.innerText(),/falha-privada-sintetica|example\.invalid|www\.googleapis|stack|Error:/);
  if(causa==='permissão')await screenshot(context.page,theme,'indisponivel',width);
  const view=await (await context.page.request.get(context.origin+'/api/visao')).json(),production=view.producoes.find(row=>row.producao_id==='peca-3');
  assert.equal(production.quadro.coluna,'Pronta');assert.equal(production.estado_liberacao,'liberado');assert.equal(production.publicado_em,'');
  assert.deepEqual(arquivosOperacionais(context.dir),before);
});
for(const theme of ['light','dark'])for(const width of [1440,390])test(`Prévias US2 ampliação, teclado, foco e Escape em ${theme}/${width}`,{skip},async t=>{
  const context=await abrir(t,{width,theme}),{page}=context,piece=await abrirPeca(context),gallery=await imagensCarregadas(piece,5);
  const first=gallery.locator('[data-previa-arquivo="imagem-pagina-1"]'),button=first.getByRole('button',{name:'Ampliar imagem — Página 1',exact:true});
  const thumbnail=await first.locator('img').boundingBox();
  assert.equal(await button.isDisabled(),false);await button.click();
  assert.equal(await page.locator('#previa-ampliada').count(),1,'a miniatura deve abrir uma imagem ampliada');
  const viewer=page.getByRole('dialog',{name:'Página 1',exact:true});
  assert.equal(await viewer.isVisible(),true);assert.equal(await page.locator('#dia').isVisible(),true);
  const image=viewer.locator('img');
  assert.equal(await image.getAttribute('src'),'/api/midia/imagem-pagina-1');assert.equal(await image.getAttribute('alt'),'Página 1');
  await page.waitForFunction(()=>{const img=document.querySelector('#previa-ampliada img');return img.complete&&img.naturalWidth>0;});
  const large=await conferirAmpliacaoInteira(page,viewer,image);
  assert.ok(large.width*large.height>thumbnail.width*thumbnail.height,'a imagem ampliada ocupa área maior que a miniatura');
  await screenshot(page,theme,'ampliada',width);
  await page.setViewportSize({width,height:width===390?640:720});
  await conferirAmpliacaoInteira(page,viewer,image);
  await page.keyboard.press('Escape');assert.equal(await viewer.isVisible(),false);assert.equal(await page.locator('#dia').isVisible(),true);
  assert.equal(await button.evaluate(node=>document.activeElement===node),true);
  const fifth=gallery.locator('[data-previa-arquivo="imagem-pagina-5"]').getByRole('button',{name:'Ampliar imagem — Página 5',exact:true});
  await fifth.focus();await page.keyboard.press('Enter');
  const selected=page.getByRole('dialog',{name:'Página 5',exact:true});assert.equal(await selected.isVisible(),true);
  assert.equal(await selected.locator('img').getAttribute('src'),'/api/midia/imagem-pagina-5');
  await selected.getByRole('button',{name:'Fechar imagem',exact:true}).click();
  assert.equal(await selected.isVisible(),false);assert.equal(await fifth.evaluate(node=>document.activeElement===node),true);
  await fifth.click();await page.keyboard.press('Escape');assert.equal(await page.locator('#dia').isVisible(),true);
  await page.keyboard.press('Escape');assert.equal(await page.locator('#dia').isVisible(),false);
  assert.ok(pedidosMidia(context).every(request=>new URL(request.url).origin===context.origin));
});
test('Prévias US2 posição indisponível não abre ampliação',{skip},async t=>{
  const context=await abrir(t,{width:390,download:async(url,options)=>{
    const id=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/^drive-sintetico-/,'');
    return id==='imagem-pagina-1'?new Response('falha privada',{status:403}):respostaStream([imagemPorArquivo(id)],{signal:options.signal});
  }}),piece=await abrirPeca(context),failed=piece.locator('[data-previa-arquivo="imagem-pagina-1"]');
  await failed.getByText('Prévia indisponível',{exact:true}).waitFor();
  const button=failed.getByRole('button',{name:'Ampliar imagem — Página 1',exact:true});
  assert.equal(await button.isDisabled(),true);
  await button.evaluate(node=>node.click());
  assert.equal(await context.page.locator('#previa-ampliada[open]').count(),0);
  assert.equal(await context.page.locator('#dia').isVisible(),true);
});
