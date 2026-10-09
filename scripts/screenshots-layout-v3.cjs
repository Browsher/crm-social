// Evidências da Parte B: somente captura e mídia sintéticas em TEMP; histórico A preservado.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {abrirLayout,navegar}=require('../tests/layout-browser.cjs');
const destination=path.resolve(__dirname,'../docs/design/screenshots/layout-v3-parte-b');

async function gerar({output=destination}={}) {
  fs.mkdirSync(output,{recursive:true});let count=0;
  for(const theme of ['light','dark'])for(const width of [1440,390]) {
    const cleanup=[],t={after:callback=>cleanup.push(callback)};let primaryError;
    try {
      const {page}=await abrirLayout(t,{theme,width});
      for(const [vista,prepare] of [
        ['semana',async()=>{}],
        ['mes',async()=>{await page.locator('[data-modo="Mês"]').click();}],
        ['producao',async()=>{
          await navegar(page,'producao');
          for(const img of await page.locator('#producao img[data-midia]').all()) {
            await img.scrollIntoViewIfNeeded();
            await page.waitForFunction(id=>{
              const image=document.querySelector('#producao img[data-midia="'+CSS.escape(id)+'"]');
              return image?.getAttribute('src')&&image.complete&&image.naturalWidth>0;
            },await img.getAttribute('data-midia'));
          }
          await page.evaluate(()=>scrollTo(0,0));
        }],
        ['publicar',async()=>{
          await navegar(page,'publicar');
          for(const img of await page.locator('#publicar img[data-midia]').all()) {
            await img.scrollIntoViewIfNeeded();
            await page.waitForFunction(id=>{
              const image=document.querySelector('#publicar img[data-midia="'+CSS.escape(id)+'"]');
              return image?.getAttribute('src')&&image.complete&&image.naturalWidth>0;
            },await img.getAttribute('data-midia'));
          }
          await page.evaluate(()=>scrollTo(0,0));
        }],
        ['instagram',async()=>{
          await page.locator('#publicar [data-instagram-id="peca-3"]').click();
          assert.equal(await page.locator('#instagram-contador').textContent(),'1/5');
          await page.waitForFunction(()=>document.querySelector('#instagram img')?.naturalWidth>0);
        }]
      ]) {
        await prepare();
        await page.waitForFunction(()=>[...document.querySelectorAll('img[src]')].every(img=>img.complete));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'página sem corte horizontal');
        assert.equal(await page.locator('[data-tela="planilha"]').count(),0,'Planilha visual removida');
        await page.screenshot({path:path.join(output,`layout-v3-${theme}-${vista}-${width}.png`),fullPage:['producao','publicar'].includes(vista),animations:'disabled'});
        count++;
      }
    }catch(error){primaryError=error;throw error;}finally{
      // Primeiro encerra navegador/servidor; só depois remove seus TEMP exatos.
      const failures=[];
      for(const callback of cleanup.reverse())try{await callback();}catch(error){failures.push(error);}
      if(failures.length&&!primaryError)throw new AggregateError(failures,'Falha ao encerrar contexto sintético');
    }
  }
  return count;
}
if(require.main===module)gerar().then(count=>process.stdout.write(`Screenshots Layout v3 Parte B: ${count}; passou\n`)).catch(()=>{
  process.stderr.write('Screenshots Layout v3 Parte B: falhou\n');process.exitCode=1;
});
module.exports={gerar};
