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
  test('Instagram celular do mockup tem composição visual e topo externo '+theme+'/'+width,{skip},async t=>{
    const context=await preparar(t,{theme,width}),{page}=context,dialog=await abrir(context,'peca-3',{
      legenda:'Legenda visual sintética',hashtags:'#exemplo #colecao'});
    const phone=dialog.locator('.phone.instagram-phone');
    assert.equal(await phone.count(),1,'celular do mockup presente');
    assert.match(await dialog.getAttribute('aria-label'),/Prévia/);
    assert.equal(await dialog.getByRole('heading').count(),0,'sem título visível dentro do modal');
    const visual=await phone.evaluate(n=>{const s=getComputedStyle(n);return {background:s.backgroundColor,radius:s.borderTopLeftRadius,border:s.borderTopWidth};});
    assert.deepEqual(visual,{background:'rgb(0, 0, 0)',radius:'38px',border:'10px'});
    const frame=await phone.boundingBox();assert.ok(frame.width>=350&&frame.width<=361,'celular de 360 px');
    assert.ok(frame.x>=12&&frame.x+frame.width<=width-12,'margens do celular');
    const close=dialog.getByRole('button',{name:'Fechar prévia',exact:true});
    assert.equal((await close.textContent()).trim(),'Fechar');
    assert.equal(await close.evaluate(n=>n.closest('.phone')===null),true,'Fechar fica fora da moldura');
    const closeBox=await close.boundingBox();assert.ok(closeBox.y>=0&&closeBox.y+closeBox.height<=frame.y+1,'Fechar acima do celular');
    assert.equal(await dialog.locator('.instagram-header #instagram-avatar').textContent(),'DEMO');
    assert.equal(await dialog.locator('.instagram-header #instagram-perfil').evaluate(n=>n.tagName==='STRONG'&&Number(getComputedStyle(n).fontWeight)>=600),true);
    assert.equal(await dialog.locator('.instagram-header small').textContent(),'Prévia · não publicado');
    assert.equal(await dialog.locator('.instagram-header [aria-hidden="true"]').last().textContent(),'⋯');
    const slider=dialog.locator('.instagram-slider'),media=await slider.boundingBox();
    assert.ok(Math.abs(media.width/media.height-0.8)<0.01,'slider 4:5');
    for(const id of ['instagram-anterior','instagram-proximo']) {
      const button=slider.locator('#'+id),box=await button.boundingBox();
      assert.equal(await button.evaluate(n=>getComputedStyle(n).position),'absolute');
      assert.ok(box.x>=media.x&&box.x+box.width<=media.x+media.width&&Math.abs(box.y+box.height/2-media.y-media.height/2)<3,'seta sobre a arte');
    }
    const count=await dialog.locator('#instagram-contador').boundingBox();
    assert.ok(count.x>=media.x+media.width/2&&count.x+count.width<=media.x+media.width&&count.y>=media.y&&count.y+count.height<media.y+50,'contador no alto à direita');
    const dots=await dialog.locator('#instagram-pontos').boundingBox();assert.ok(dots.y>=media.y+media.height-1,'pontos abaixo da arte');
    const actions=dialog.locator('.instagram-actions');assert.equal(await actions.getAttribute('aria-hidden'),'true');
    for(const icon of ['♡','💬','↗','🔖'])assert.ok((await actions.textContent()).includes(icon),'ícone decorativo '+icon);
    const caption=dialog.locator('#instagram-legenda-perfil');
    assert.equal(await caption.textContent(),'perfil.exemplo');assert.equal(await caption.evaluate(n=>n.tagName==='STRONG'),true);
    assert.equal(await caption.locator('..').textContent(),'perfil.exemplo Legenda visual sintética');
    const color=await dialog.locator('#instagram-hashtags').evaluate(n=>getComputedStyle(n).color),rgb=color.match(/\d+/g).map(Number);
    assert.ok(rgb[2]>rgb[0]+40&&rgb[2]>=180,'hashtags azuis');
    assert.equal(await dialog.locator('#selo,#atualizar,#dados-a-confirmar,#resultado-atualizacao,#erro').count(),0,'topo e feedback continuam na página');
    assert.equal(await page.locator('.page-heading #atualizar').count(),1);
    assert.equal(await page.locator('.page-heading #atualizar').evaluate(n=>{n.focus();return n===document.activeElement;}),false,'topo nativo inerte enquanto modal aberto');
    assert.equal(await close.evaluate(n=>n===document.activeElement),true,'foco permanece no modal');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  });
}
test('Instagram avatar usa sigla configurada, normaliza maiúsculas e recusa controles',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);
  assert.equal(await page.locator('#instagram-avatar').count(),1,'avatar de perfil disponível');
  for(const value of [undefined,null,{},[],0,'','   ','abcdef','ab\u0000','ab\u007f']) {
    await page.evaluate(value=>{globalThis.CrmPerfil.siglaMarca=value;},value);await abrir(context);
    assert.equal(await page.locator('#instagram-avatar').textContent(),'•');
  }
  for(const [value,expected] of [[' demo ','DEMO'],['a1b2c','A1B2C'],['é','É'],['<b>','<B>']]) {
    await page.evaluate(value=>{globalThis.CrmPerfil.siglaMarca=value;},value);await abrir(context);
    assert.equal(await page.locator('#instagram-avatar').textContent(),expected);
    assert.equal(await page.locator('#instagram-avatar b').count(),0,'sigla é texto literal');
    assert.equal(await page.locator('#instagram-perfil').textContent(),'perfil.exemplo');
  }
});
test('Instagram imagem única permanece 1/1 inclusive sem mídia, Reels placeholder',{skip},async t=>{
  const context=await preparar(t),{page}=context;
  let dialog=await abrir(context,'peca-1');await indice(page,'1/1');await imagem(page,'imagem-peca-1');
  assert.equal(await dialog.getByRole('button',{name:'Próxima página',exact:true,includeHidden:true}).isDisabled(),true);
  assert.equal(await dialog.locator('#instagram-anterior,#instagram-proximo').evaluateAll(ns=>ns.length===2&&ns.every(n=>n.hidden&&n.disabled)),true,'imagem única não oferece setas');
  assert.equal(await dialog.locator('#instagram-pontos').isVisible(),false,'imagem única não oferece pontos');
  await page.keyboard.press('ArrowRight');await indice(page,'1/1');
  dialog=await abrir(context,'peca-sem-data');await indice(page,'1/1');
  assert.equal(await page.locator('#instagram-indisponivel').textContent(),'prévia indisponível');
  await abrir(context,'peca-4');await indice(page,'1/2');
  assert.equal(await page.locator('#instagram img').count(),0);
  await page.keyboard.press('ArrowRight');await indice(page,'2/2');
  assert.equal(await page.locator('#instagram-indisponivel').isVisible(),true);
});
test('Instagram Reels identifica destinos por cena e início/final nos controles acessíveis',{skip},async t=>{
  const context=await preparar(t,{editar:raw=>{
    adicionarRegistro(raw,'Cenas',{cena_id:'cena-v3-2',producao_id:'peca-4',versao:3,indice:2,texto:'Segunda cena sintética'});
    adicionarRegistro(raw,'Cenas',{cena_id:'cena-v2-2',producao_id:'peca-4',versao:2,indice:2,texto:'Cena histórica sintética'});
  }}),{page}=context,dialog=await abrir(context,'peca-4');
  await indice(page,'1/4');
  const nomes=['Ir para Cena 1 · início','Ir para Cena 1 · final','Ir para Cena 2 · início','Ir para Cena 2 · final'];
  for(const nome of nomes)assert.equal(await dialog.getByRole('button',{name:nome,exact:true}).count(),1,'destino '+nome);
  assert.equal(await dialog.getByRole('group',{name:'Cenas da prévia',exact:true}).count(),1);
  assert.equal(await dialog.getByRole('button',{name:'Anterior: Cena 1 · início',exact:true}).isDisabled(),true);
  await dialog.getByRole('button',{name:'Próxima: Cena 1 · final',exact:true}).click();await indice(page,'2/4');
  assert.equal(await dialog.getByRole('button',{name:'Anterior: Cena 1 · início',exact:true}).isDisabled(),false);
  await page.keyboard.press('ArrowRight');await indice(page,'3/4');
  assert.equal(await dialog.getByRole('button',{name:'Anterior: Cena 1 · final',exact:true}).count(),1);
  await dialog.getByRole('button',{name:'Ir para Cena 2 · final',exact:true}).click();await indice(page,'4/4');
  assert.equal(await dialog.getByRole('button',{name:'Próxima: Cena 2 · final',exact:true}).isDisabled(),true);
  await page.evaluate(async()=>{
    const view=await (await fetch('/api/visao')).json(),p=view.producoes.find(p=>p.producao_id==='peca-4');
    p.detalhes.cenas.forEach(cena=>{cena.indice+=3;});globalThis.CrmInstagram.atualizar(p);
  });
  await indice(page,'4/4');
  assert.equal(await dialog.getByRole('button',{name:'Ir para Cena 5 · final',exact:true}).count(),1,'releitura troca contexto com total igual');
  assert.equal(await dialog.getByRole('button',{name:'Anterior: Cena 5 · início',exact:true}).count(),1);
  await page.evaluate(async()=>{
    const view=await (await fetch('/api/visao')).json(),p=view.producoes.find(p=>p.producao_id==='peca-3');
    p.detalhes.paginas=p.detalhes.paginas.filter(pagina=>pagina.indice<=4);
    globalThis.CrmInstagram.abrir({peca:p,acionador:document.querySelector('#instagram-acionador-teste')});
  });
  await indice(page,'1/4');
  assert.equal(await dialog.getByRole('button',{name:'Ir para página 4',exact:true}).count(),1,'carrossel com mesmo total conserva nomes');
  assert.equal(await dialog.getByRole('button',{name:'Próxima página',exact:true}).count(),1);
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
test('Instagram limites transferem imediatamente foco para a seta habilitada',{skip},async t=>{
  const context=await preparar(t),{page}=context,dialog=await abrir(context);
  const proximo=dialog.getByRole('button',{name:'Próxima página',exact:true});
  const anterior=dialog.getByRole('button',{name:'Página anterior',exact:true});
  await proximo.focus();
  for(let i=0;i<4;i++)await page.keyboard.press('Enter');await indice(page,'5/5');
  assert.equal(await proximo.isDisabled(),true);
  assert.equal(await anterior.evaluate(node=>node===document.activeElement),true,'última página devolve foco à seta anterior');
  for(let i=0;i<4;i++)await anterior.click();await indice(page,'1/5');
  assert.equal(await anterior.isDisabled(),true);
  assert.equal(await proximo.evaluate(node=>node===document.activeElement),true,'primeira página devolve foco à próxima seta');
  for(const tecla of ['Tab','Shift+Tab']) {await page.keyboard.press(tecla);assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#instagram')),true);}
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(node=>node===document.activeElement),true);
});
test('Instagram releitura 1/1 com seta ou ponto focado devolve foco a Fechar',{skip},async t=>{
  const context=await preparar(t),{page}=context,dialog=await abrir(context);
  const limitarAUma=()=>page.evaluate(async()=>{
    const view=await (await fetch('/api/visao')).json(),p=view.producoes.find(p=>p.producao_id==='peca-3');
    p.detalhes.paginas=p.detalhes.paginas.filter(pagina=>pagina.indice<=1);globalThis.CrmInstagram.atualizar(p);
  });
  await dialog.getByRole('button',{name:'Ir para página 5',exact:true}).click();
  await dialog.getByRole('button',{name:'Página anterior',exact:true}).focus();
  await limitarAUma();
  await indice(page,'1/1');
  assert.equal(await dialog.getByRole('button',{name:'Página anterior',exact:true,includeHidden:true}).isDisabled(),true);
  assert.equal(await dialog.getByRole('button',{name:'Próxima página',exact:true,includeHidden:true}).isDisabled(),true);
  assert.equal(await dialog.locator('#instagram-anterior,#instagram-proximo').evaluateAll(ns=>ns.length===2&&ns.every(n=>n.hidden)),true);
  assert.equal(await dialog.locator('#instagram-pontos').isVisible(),false);
  assert.equal(await dialog.getByRole('button',{name:'Fechar prévia',exact:true}).evaluate(node=>node===document.activeElement),true);
  for(const tecla of ['Shift+Tab','Tab']) {await page.keyboard.press(tecla);assert.equal(await page.evaluate(()=>!!document.activeElement.closest('#instagram')),true);}
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(node=>node===document.activeElement),true);
  await abrir(context);
  const ponto=dialog.getByRole('button',{name:'Ir para página 5',exact:true});await ponto.click();
  assert.equal(await ponto.evaluate(node=>node===document.activeElement),true,'ponto é o foco antes da releitura');
  await limitarAUma();await indice(page,'1/1');
  assert.equal(await dialog.locator('#instagram-pontos').isVisible(),false);
  assert.equal(await dialog.getByRole('button',{name:'Fechar prévia',exact:true}).evaluate(node=>node===document.activeElement),true,'ponto ocultado devolve foco a Fechar');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#instagram-acionador-teste').evaluate(node=>node===document.activeElement),true);
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
test('Instagram atualização programática mantém versão e topo único fora do modal',{skip},async t=>{
  const context=await preparar(t),{page}=context;await abrir(context);
  assert.equal(await page.locator('#atualizar').count(),1);
  assert.equal(await page.locator('#instagram #atualizar').count(),0);
  assert.equal(await page.locator('.page-heading #atualizar').count(),1);
  context.setMode('nova');mudarPorId(context.raw,'Produções','peca-3','legenda','Legenda atualizada sintética');
  await page.getByRole('button',{name:'Ir para página 5',exact:true}).click();await atualizar(context);
  assert.equal(await page.locator('#instagram').isVisible(),true);await indice(page,'5/5');
  assert.equal(await page.locator('#instagram-legenda').textContent(),'Legenda atualizada sintética');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.page-heading #atualizar').isVisible(),true);
  assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
});
test('Instagram atualização iniciada pelo botão antes de abrir preserva nova versão da peça',{skip},async t=>{
  const context=await preparar(t),{page}=context;
  const before=await (await page.request.get(context.origin+'/api/visao')).json(),anterior=before.producoes.find(p=>p.producao_id==='peca-3');
  context.setMode('nova');
  mudarPorId(context.raw,'Produções','peca-3','legenda','Legenda nova após atualização já iniciada');
  mudarPorId(context.raw,'Produções','peca-3','versao',anterior.versao+1);
  await page.locator('#atualizar').click();
  await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao').textContent==='Atualizando dados…');
  await abrir(context);await page.getByRole('button',{name:'Ir para página 4',exact:true}).click();
  assert.equal(await page.locator('#instagram-legenda').textContent(),anterior.legenda,'modal abre captura anterior durante atualização');
  context.release();await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await page.locator('#instagram').isVisible(),true);await indice(page,'4/5');
  assert.equal(await page.locator('#instagram-legenda').textContent(),'Legenda nova após atualização já iniciada');
  const after=await (await page.request.get(context.origin+'/api/visao')).json();
  assert.equal(after.producoes.find(p=>p.producao_id==='peca-3').versao,anterior.versao+1);
  const posts=context.requests.filter(r=>r.path==='/api/atualizar'&&r.method==='POST');assert.equal(posts.length,1);assert.equal(posts[0].body,'{}');
  await page.keyboard.press('Escape');assert.equal(await page.locator('#instagram-acionador-teste').evaluate(n=>n===document.activeElement),true);
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
