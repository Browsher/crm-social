const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const {temporario}=require('./fixtures.cjs');
const {gerar}=require('../scripts/screenshots-layout-v3.cjs');

for(const captureFails of [true,false])test('Screenshots Layout v3 encerra todos os recursos após '+(captureFails?'falha de captura':'falha de limpeza'),async()=>{
  const filename=path.resolve(__dirname,'../scripts/screenshots-layout-v3.cjs'),localRequire=createRequire(filename);
  const cleaned=[],primary=new Error('Falha sintética na captura'),cleanupError=new Error('Falha sintética ao encerrar servidor');
  const sandbox={__dirname:path.dirname(filename),module:{exports:{}},process:{},require:name=>{
    if(name==='node:fs')return {mkdirSync(){}};
    if(name==='../tests/layout-browser.cjs')return {navegar:async()=>{},abrirLayout:async t=>{
      t.after(()=>cleaned.push('TEMP'));
      t.after(()=>{cleaned.push('servidor');throw cleanupError;});
      t.after(()=>cleaned.push('navegador'));
      return {page:{locator:()=>({click:async()=>{},all:async()=>[],count:async()=>0}),evaluate:async()=>true,
        waitForFunction:async()=>{if(captureFails)throw primary;},screenshot:async()=>{}}};
    }};
    return localRequire(name);
  }};
  vm.runInNewContext(fs.readFileSync(filename,'utf8'),sandbox,{filename});
  await assert.rejects(sandbox.module.exports.gerar({output:'destino-sintetico'}),error=>
    captureFails?error===primary:error.name==='AggregateError'&&error.errors[0]===cleanupError);
  assert.deepEqual(cleaned,['navegador','servidor','TEMP'],'uma falha não interrompe a limpeza dos demais recursos');
});

test('Screenshots Layout v3 Parte A gera 12 PNG sintéticos e preserva arquivo alheio',{
  skip:process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false,timeout:60000
},async t=>{
  const root=temporario(t),output=path.join(root,'evidencias'),marker=path.join(root,'preservar.txt');
  fs.writeFileSync(marker,'arquivo alheio sintético');
  assert.equal(await gerar({output}),12);
  assert.equal(fs.readdirSync(output).length,12);
  for(const theme of ['light','dark'])for(const vista of ['semana','mes','producao'])for(const width of [1440,390]) {
    const bytes=fs.readFileSync(path.join(output,`layout-v3-${theme}-${vista}-${width}.png`));
    assert.deepEqual(bytes.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
    assert.equal(bytes.readUInt32BE(16),width);
    assert.ok(bytes.readUInt32BE(20)>0);
  }
  assert.equal(fs.readFileSync(marker,'utf8'),'arquivo alheio sintético');
});
