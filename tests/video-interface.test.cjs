const {test}=require('node:test');
const assert=require('node:assert/strict');
const {abrirLayout,navegar,skip}=require('./layout-browser.cjs');
const {imagemPorArquivo,respostaStream}=require('./layout-fixtures.cjs');
const {capturaVideo,videoMp4}=require('./video-fixtures.cjs');
async function preparar(t,options={}) {
 return abrirLayout(t,{captura:capturaVideo,...options,download:async(url,opts)=>{
  const id=decodeURIComponent(new URL(url).pathname.split('/').at(-1)).replace(/^drive-sintetico-/,'');
  return respostaStream([id==='video-final-sintetico'?videoMp4():imagemPorArquivo(id)],{signal:opts.signal});
 }});
}
async function painel(context) {
 const {page}=context;await navegar(page,'producao');
 await page.locator('#quadro .project-open[data-producao-id="peca-4"]').click();
 return page.locator('#dia .peca-acordeao[data-peca="peca-4"]');
}
for(const width of [1440,390])test('V007 capa no painel, play por clique e pausa ao fechar '+width,{skip},async t=>{
 const context=await preparar(t,{width}),{page}=context,body=await painel(context);
 const cover=body.locator('[data-video-capa] img');
 assert.equal(await cover.count(),1,'painel mostra capa própria do vídeo');
 assert.equal(await cover.getAttribute('src'),'/api/midia/capa-video-sintetica');
 await page.waitForFunction(()=>document.querySelector('[data-video-capa] img')?.naturalWidth>0);
 assert.equal(context.requests.some(r=>r.path.startsWith('/api/video/')),false,'não baixa vídeo antes do clique');
 await body.getByRole('button',{name:'Ver no Instagram',exact:true}).click();
 const video=page.locator('#instagram video');
 assert.equal(await video.count(),1,'prévia contém player de vídeo');
 assert.equal(await video.getAttribute('poster'),'/api/midia/capa-video-sintetica');
 assert.equal(await video.getAttribute('src'),'/api/video/video-final-sintetico');
 assert.equal(await video.getAttribute('playsinline'),'');
 await page.waitForFunction(()=>{const v=document.querySelector('#instagram video');return v&&!v.paused&&v.currentTime>0.1;},{timeout:5000});
 assert.equal(await video.evaluate(v=>v.controls),true);
 await video.evaluate(v=>v.pause());assert.equal(await video.evaluate(v=>v.paused),true);
 await video.evaluate(async v=>{v.currentTime=0.5;await v.play();});
 const player=await video.elementHandle();
 await page.getByRole('button',{name:'Fechar prévia',exact:true}).click();
 assert.equal(await player.evaluate(v=>v.paused),true);
 assert.equal(await player.evaluate(v=>v.hasAttribute('src')),false);
 assert.equal(await page.locator('#dia').evaluate(n=>n.open),true,'painel permanece aberto');
 assert.equal(await body.getByRole('button',{name:'Ver no Instagram',exact:true}).evaluate(n=>n===document.activeElement),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});
test('V007 botão Tela cheia usa fullscreen real e retorna à prévia',{skip},async t=>{
 const context=await preparar(t,{width:1440}),{page}=context,body=await painel(context);
 await body.getByRole('button',{name:'Ver no Instagram',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#instagram video')?.readyState>=2);
 await page.getByRole('button',{name:'Ver vídeo em tela cheia',exact:true}).click();
 await page.waitForFunction(()=>document.fullscreenElement?.tagName==='VIDEO');
 assert.equal(await page.locator('#instagram video').evaluate(v=>document.fullscreenElement===v),true);
 await page.evaluate(()=>document.exitFullscreen());
 await page.waitForFunction(()=>!document.fullscreenElement);
 assert.equal(await page.locator('#instagram').isVisible(),true);
 await page.getByRole('button',{name:'Fechar prévia',exact:true}).click();
});
test('V007 bloqueio de play automático mantém controles e orientação',{skip},async t=>{
 const context=await preparar(t),{page}=context;
 await page.evaluate(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Bloqueado no teste','NotAllowedError'));});
 const body=await painel(context);await body.getByRole('button',{name:'Ver no Instagram',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#instagram-video-status')?.textContent.includes('controles'));
 assert.equal(await page.locator('#instagram video').evaluate(v=>v.controls),true);
 await page.getByRole('button',{name:'Fechar prévia',exact:true}).click();
});
test('V007 controles de vídeo não são capturados pelo gesto do carrossel',{skip},async t=>{
 const context=await preparar(t),{page}=context,body=await painel(context);
 await body.getByRole('button',{name:'Ver no Instagram',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#instagram video')?.readyState>=2);
 await page.evaluate(()=>{const m=document.querySelector('#instagram-midia');m.setPointerCapture=()=>{m.dataset.capturado='sim';};});
 const box=await page.locator('#instagram video').boundingBox();
 await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
 assert.equal(await page.locator('#instagram-midia').getAttribute('data-capturado'),null);
 await page.getByRole('button',{name:'Fechar prévia',exact:true}).click();
});
test('V007 releitura pendente preserva tempo e pausa do mesmo vídeo',{skip},async t=>{
 const context=await preparar(t),{page}=context;
 await page.locator('#atualizar').click();
 const body=await painel(context);await body.getByRole('button',{name:'Ver no Instagram',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#instagram video')?.readyState>=2);
 const original=await page.locator('#instagram video').elementHandle();
 await original.evaluate(v=>{v.pause();v.currentTime=0.75;});
 context.release();await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
 assert.equal(await original.evaluate(v=>v===document.querySelector('#instagram video')),true);
 assert.equal(await original.evaluate(v=>v.paused&&v.currentTime>=0.7),true);
 await page.getByRole('button',{name:'Fechar prévia',exact:true}).click();
});
