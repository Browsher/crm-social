// Evidências da Parte A: somente captura e mídia sintéticas em TEMP.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {abrirLayout,navegar}=require('../tests/layout-browser.cjs');
const destination=path.resolve(__dirname,'../docs/design/screenshots/layout-v3-parte-a');

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
        }]
      ]) {
        await prepare();
        await page.waitForFunction(()=>[...document.querySelectorAll('img[src]')].every(img=>img.complete));
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'página sem corte horizontal');
        assert.equal(await page.locator('[data-tela="publicar"]').count(),0,'Parte B permanece ausente');
        await page.screenshot({path:path.join(output,`layout-v3-${theme}-${vista}-${width}.png`),fullPage:vista==='producao',animations:'disabled'});
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
if(require.main===module)gerar().then(count=>process.stdout.write(`Screenshots Layout v3 Parte A: ${count}; passou\n`)).catch(()=>{
  process.stderr.write('Screenshots Layout v3 Parte A: falhou\n');process.exitCode=1;
});
module.exports={gerar};
