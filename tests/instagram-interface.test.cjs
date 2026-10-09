const {test}=require('node:test');
const assert=require('node:assert/strict');
const {abrirLayout,navegar,skip,pedidosMidia,atualizar}=require('./layout-browser.cjs');
const {mudarPorId,adicionarRegistro,recalcularHashes}=require('./layout-fixtures.cjs');

async function preparar(t,options={}) {
  const context=await abrirLayout(t,options),{page}=context;
  for(const [route,globalName] of [['perfil-config.js','CrmPerfil'],['instagram.js','CrmInstagram']]) {
    assert.equal((await page.request.get(context.origin+'/'+route)).status(),200,'módulo '+route+' disponível');
    if(!await page.evaluate(name=>!!globalThis[name],globalName))await page.addScriptTag({url:context.origin+'/'+route});
  }
  return context;
}
async function abrir(context,id='peca-3',modificar={}) {
  const {page}=context;
  await page.evaluate(async({id,modificar})=>{
    const view=await (await fetch('/api/visao')).json(),peca=view.producoes.find(p=>p.producao_id===id);
    Object.assign(peca,modificar);
    let button=document.querySelector('#instagram-acionador-teste');
    if(!button){button=document.createElement('button');button.id='instagram-acionador-teste';button.textContent='Abrir prévia de teste';(document.querySelector('#dia[open]')||document.querySelector('main')).append(button);}
    button.focus();globalThis.CrmInstagram.abrir({peca,acionador:button});
  },{id,modificar});
  return page.locator('#instagram');
}
const contador=page=>page.locator('#instagram-contador');
async function indice(page,value) {assert.equal(await contador(page).textContent(),value);}
async function imagem(page,id) {
  const image=page.locator('#instagram img');assert.equal(await image.getAttribute('src'),'/api/midia/'+encodeURIComponent(id));
  await page.waitForFunction(()=>document.querySelector('#instagram img')?.naturalWidth>0);
}
async function gesto(page,dx,dy) {
  const media=page.locator('#instagram-midia');
  await media.dispatchEvent('touchstart',{touches:[{identifier:1,clientX:180,clientY:180}]});
  await media.dispatchEvent('touchend',{changedTouches:[{identifier:1,clientX:180+dx,clientY:180+dy}]});
}
for(const theme of ['light','dark'])for(const width of [1440,390]) {
  test('Instagram carrossel cinco páginas, texto literal e navegação '+theme+'/'+width,{skip},async t=>{
    const context=await preparar(t,{theme,width}),{page}=context,dialog=await abrir(context,'peca-3',{
      legenda:'<img src=x onerror=alert(1)> Texto sintético',hashtags:'#exemplo #colecao'});
    assert.equal(await dialog.isVisible(),true);assert.equal(await dialog.getAttribute('aria-modal'),'true');
    assert.equal(await page.locator('#instagram-perfil').textContent(),'perfil.exemplo');await indice(page,'1/5');
    await imagem(page,'imagem-pagina-1');
    assert.equal(await page.locator('#instagram img').evaluate(n=>getComputedStyle(n).objectFit),'contain');
    const box=await page.locator('#instagram-midia').boundingBox();assert.ok(Math.abs(box.width/box.height-0.8)<0.01,'arte 4:5');
    assert.equal(await page.locator('#instagram-legenda').textContent(),'<img src=x onerror=alert(1)> Texto sintético');
    assert.equal(await page.locator('#instagram-hashtags').textContent(),'#exemplo #colecao');
    assert.equal(await dialog.locator('[onerror]').count(),0,'conteúdo é texto');
    assert.equal(await dialog.getByRole('button',{name:'Página anterior',exact:true}).isDisabled(),true);
    await page.keyboard.press('ArrowRight');await indice(page,'2/5');await imagem(page,'imagem-pagina-2');
    await dialog.getByRole('button',{name:'Ir para página 5',exact:true}).click();await indice(page,'5/5');
    assert.equal(await dialog.getByRole('button',{name:'Próxima página',exact:true}).isDisabled(),true);
    await page.keyboard.press('ArrowRight');await indice(page,'5/5');
    await page.keyboard.press('ArrowLeft');await indice(page,'4/5');
    assert.equal(pedidosMidia(context).some(request=>request.path==='/api/midia/imagem-pagina-3'),false,'página não selecionada não é carregada');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const close=dialog.getByRole('button',{name:'Fechar prévia',exact:true});await close.click();
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
    assert.equal(await dialog.locator('img[src]').count(),0,'fechamento encerra mídia do pop-up');
    assert.ok(pedidosMidia(context).every(r=>r.method==='GET'));
  });
}
test('Instagram imagem única permanece 1/1 inclusive sem mídia, Reels placeholder',{skip},async t=>{
  const context=await preparar(t),{page}=context;
  let dialog=await abrir(context,'peca-1');await indice(page,'1/1');await imagem(page,'imagem-peca-1');
  assert.equal(await dialog.getByRole('button',{name:'Próxima página',exact:true}).isDisabled(),true);
  await page.keyboard.press('ArrowRight');await indice(page,'1/1');
  dialog=await abrir(context,'peca-sem-data');await indice(page,'1/1');
  assert.equal(await page.locator('#instagram-indisponivel').textContent(),'prévia indisponível');
  await abrir(context,'peca-4');await indice(page,'1/2');
  assert.equal(await page.locator('#instagram img').count(),0);
  await page.keyboard.press('ArrowRight');await indice(page,'2/2');
  assert.equal(await page.locator('#instagram-indisponivel').isVisible(),true);
});
test('Instagram slots sem arquivo/bytes mantêm ordem, vigência e contador',{skip},async t=>{
  const context=await preparar(t,{editar:raw=>{
    const paginas=raw.tables['Páginas'].values,header=paginas[0],id=header.indexOf('pagina_id'),indice=header.indexOf('indice');
    const segunda=paginas.find((r,i)=>i&&r[indice]===2);
    mudarPorId(raw,'Páginas',segunda[id],'arquivo_imagem_id','');
    adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-1-historica',producao_id:'peca-3',indice:1,versao:1,arquivo_imagem_id:''});
  },download:async(url,options)=>{
    const {imagemPorArquivo,respostaStream}=require('./layout-fixtures.cjs');const id=new URL(url).pathname.split('/').at(-1).replace(/^drive-sintetico-/,'');
    if(id==='imagem-pagina-3')throw new Error('Falha sintética');
    return respostaStream([imagemPorArquivo(id)],{signal:options.signal});
  }}),{page}=context;
  await abrir(context);await indice(page,'1/5');await imagem(page,'imagem-pagina-1');
  await page.keyboard.press('ArrowRight');await indice(page,'2/5');assert.equal(await page.locator('#instagram img').count(),0);
  assert.equal(await page.locator('#instagram-indisponivel').isVisible(),true);
  await page.keyboard.press('ArrowRight');await indice(page,'3/5');await page.locator('#instagram-indisponivel:visible').waitFor();
  await page.keyboard.press('ArrowRight');await indice(page,'4/5');await imagem(page,'imagem-pagina-4');
});
test('Instagram perfil inválido tem fallback e válido conserva nome',{skip},async t=>{
  const context=await preparar(t),{page}=context;
  for(const value of [undefined,null,{},'', ' '.repeat(10),'x'.repeat(81),'exemplo\u0000','exemplo\u007f']) {
    await page.evaluate(value=>globalThis.CrmPerfil={nomePerfil:value},value);await abrir(context);
    assert.equal(await page.locator('#instagram-perfil').textContent(),'Perfil não configurado');
  }
  await page.evaluate(()=>globalThis.CrmPerfil={nomePerfil:'  perfil.alternativo  '});await abrir(context);
  assert.equal(await page.locator('#instagram-perfil').textContent(),'perfil.alternativo');
  await page.evaluate(()=>globalThis.CrmPerfil={nomePerfil:'x'.repeat(80)});await abrir(context);
  assert.equal(await page.locator('#instagram-perfil').textContent(),'x'.repeat(80));
});
test('Instagram modal contém foco, Esc conserva gaveta e restaura acionador',{skip},async t=>{
  const context=await preparar(t),{page}=context;await navegar(page,'producao');
  await page.locator('#quadro [data-producao-id="peca-3"]').click();assert.equal(await page.locator('#dia').isVisible(),true);
  const dialog=await abrir(context);
  assert.equal(await dialog.getByRole('button',{name:'Fechar prévia',exact:true}).evaluate(n=>n===document.activeElement),true);
  for(let i=0;i<15;i++){await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#instagram')),true);}
  await page.keyboard.press('Escape');assert.equal(await dialog.isVisible(),false);assert.equal(await page.locator('#dia').isVisible(),true);
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
});
test('Instagram gesto horizontal ≥40 e dominante navega sem wrap; vertical não navega',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);
  await gesto(page,-39,0);await indice(page,'1/5');await gesto(page,-40,41);await indice(page,'1/5');
  await gesto(page,-40,0);await indice(page,'2/5');await gesto(page,40,0);await indice(page,'1/5');
  await gesto(page,80,0);await indice(page,'1/5');await gesto(page,0,-120);await indice(page,'1/5');
  await page.getByRole('button',{name:'Ir para página 5',exact:true}).click();await gesto(page,-80,0);await indice(page,'5/5');
});
test('Instagram pointer e touch compatíveis avançam só uma página e cancelamento não navega',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);const midia=page.locator('#instagram-midia');
  const init={pointerId:2,pointerType:'touch',clientX:200,clientY:200};
  await midia.dispatchEvent('pointerdown',init);
  await midia.dispatchEvent('pointerup',{...init,clientX:120});await indice(page,'2/5');
  await midia.dispatchEvent('pointerdown',init);await midia.dispatchEvent('pointercancel',init);
  await midia.dispatchEvent('pointerup',{...init,clientX:120});await indice(page,'2/5');
  await midia.dispatchEvent('pointerdown',init);
  await midia.dispatchEvent('touchstart',{touches:[{identifier:2,clientX:200,clientY:200}]});
  await midia.dispatchEvent('pointerup',{...init,clientX:120});
  await midia.dispatchEvent('touchend',{changedTouches:[{identifier:2,clientX:120,clientY:200}]});await indice(page,'3/5');
});
test('Instagram botão Próxima até o limite conserva foco modal com Tab e Shift Tab',{skip},async t=>{
  const context=await preparar(t),{page}=context;const dialog=await abrir(context);
  for(let i=0;i<4;i++)await dialog.getByRole('button',{name:'Próxima página',exact:true}).click();await indice(page,'5/5');
  for(const tecla of ['Tab','Shift+Tab']) {await page.keyboard.press(tecla);assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#instagram')),true);}
});
test('Instagram releitura mesma peça preserva índice/limita total e remoção restaura foco ao título',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);
  await page.getByRole('button',{name:'Ir para página 5',exact:true}).click();
  await page.evaluate(async()=>{
    const view=await (await fetch('/api/visao')).json(),p=view.producoes.find(p=>p.producao_id==='peca-3');
    p.versao=9;p.legenda='Versão nova sintética';p.detalhes.paginas=p.detalhes.paginas.filter(u=>u.indice<=3);
    globalThis.CrmInstagram.atualizar(p);
  });
  assert.equal(await page.locator('#instagram').isVisible(),true);await indice(page,'3/3');
  assert.equal(await page.locator('#instagram-legenda').textContent(),'Versão nova sintética');
  await page.evaluate(()=>{document.querySelector('#instagram-acionador-teste').remove();document.querySelector('#titulo').tabIndex=-1;globalThis.CrmInstagram.atualizar(null);});
  assert.equal(await page.locator('#instagram').isVisible(),false);assert.equal(await page.locator('#titulo').evaluate(n=>n===document.activeElement),true);
});
test('Instagram Atualizar único é operável no modal e retorna ao topo após Esc',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);
  assert.equal(await page.locator('#atualizar').count(),1);
  assert.equal(await page.locator('#instagram #atualizar').isVisible(),true);
  context.setMode('nova');mudarPorId(context.raw,'Produções','peca-3','legenda','Legenda atualizada sintética');
  await page.getByRole('button',{name:'Ir para página 5',exact:true}).click();await atualizar(context);
  assert.equal(await page.locator('#instagram').isVisible(),true);await indice(page,'5/5');
  assert.equal(await page.locator('#instagram-legenda').textContent(),'Legenda atualizada sintética');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.page-heading #atualizar').isVisible(),true);
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
});
test('Instagram falha de Atualizar conserva modal, página e conteúdo anterior',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);context.setMode('falha');
  await page.getByRole('button',{name:'Ir para página 4',exact:true}).click();
  const legenda=await page.locator('#instagram-legenda').textContent();await atualizar(context);
  assert.equal(await page.locator('#instagram').isVisible(),true);await indice(page,'4/5');
  assert.equal(await page.locator('#instagram-legenda').textContent(),legenda);
});
test('Instagram Atualizar com peça removida fecha modal e restaura foco',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);context.setMode('nova');
  const prod=context.raw.tables['Produções'],indiceId=prod.values[0].indexOf('producao_id');
  prod.values=prod.values.filter((row,i)=>!i||row[indiceId]!=='peca-3');
  for(const nome of ['Páginas','Arquivos','Revisoes']) {
    const table=context.raw.tables[nome],indice=table.values[0].indexOf('producao_id');
    table.values=table.values.filter((row,i)=>!i||row[indice]!=='peca-3');
  }
  recalcularHashes(context.raw);
  await atualizar(context);assert.equal(await page.locator('#instagram').isVisible(),false);
  assert.equal(await page.locator('.page-heading #atualizar').isVisible(),true);
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
});
for(const theme of ['light','dark'])test('Instagram viewport baixa conserva Fechar/arte e rola legenda '+theme,{skip},async t=>{
  const context=await preparar(t,{theme,width:390}),{page}=context;await page.setViewportSize({width:390,height:480});
  const dialog=await abrir(context,'peca-3',{legenda:'Legenda extensa sintética. '.repeat(80)});
  for(const item of [dialog,dialog.getByRole('button',{name:'Fechar prévia',exact:true}),page.locator('#instagram-midia')]) {
    const box=await item.boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=391&&box.y+box.height<=481);
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('#instagram-textos').evaluate(n=>n.scrollHeight>n.clientHeight),true);
});
