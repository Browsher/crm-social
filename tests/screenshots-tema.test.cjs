const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const {spawnSync}=require('node:child_process');
const {temporario}=require('./fixtures.cjs');
const project=path.resolve(__dirname,'..');
const script=path.join(project,'scripts/screenshots-tema.cjs');

for(const invalid of ['fora do TEMP','prefixo alheio'])test('Screenshots: limpeza recusa '+invalid,async t=>{
  const root=temporario(t),base=path.join(root,'temp');
  const target=invalid==='fora do TEMP'?path.join(root,'outro','crm-tema-sintetico-alvo'):path.join(base,'alheio');
  fs.mkdirSync(target,{recursive:true});
  const marker=path.join(target,'preservar.txt');fs.writeFileSync(marker,'arquivo sintético preservado');
  const removals=[],localRequire=createRequire(script),state={exitCode:0,stdout:{write(){}}};
  await new Promise(resolve=>{
    state.stderr={write(message){assert.equal(message,'Screenshots sintéticos: falhou\n');resolve();}};
    const fakeFs={...fs,mkdtempSync:()=>target,writeFileSync(){throw Error('interrupção sintética antes da captura');},rmSync:dir=>removals.push(dir)};
    vm.runInNewContext(fs.readFileSync(script,'utf8'),{
      __dirname:path.dirname(script),process:state,
      require:name=>name==='node:fs'?fakeFs:name==='node:os'?{tmpdir:()=>base}:name==='node:test'?{mock:{timers:{enable(){},reset(){}}}}:localRequire(name)
    },{filename:script});
  });
  assert.equal(state.exitCode,1);
  assert.deepEqual(removals,[],'Caminho recusado nunca chega à exclusão recursiva');
  assert.equal(fs.readFileSync(marker,'utf8'),'arquivo sintético preservado');
});

test('Screenshots: CLI padrão preserva 16 PNG históricos e gera tema-layout-v3 com Publicar em TEMP',{
  skip:process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false,
  timeout:60000
},t=>{
  const root=temporario(t),copy=path.join(root,'projeto'),temp=path.join(root,'temp');
  for(const dir of ['scripts','tests','src'])fs.mkdirSync(path.join(copy,dir),{recursive:true});
  fs.copyFileSync(script,path.join(copy,'scripts/screenshots-tema.cjs'));
  fs.copyFileSync(path.join(__dirname,'fixtures.cjs'),path.join(copy,'tests/fixtures.cjs'));
  fs.cpSync(path.join(project,'src'),path.join(copy,'src'),{recursive:true});
  const gallery=path.join(copy,'docs/design/screenshots');fs.mkdirSync(gallery,{recursive:true});
  const historical=new Map();
  for(const theme of ['light','dark'])for(const screen of ['planejamento','gaveta','producao','planilha'])for(const width of [1440,390]){
    const name=`tema-${theme}-${screen}-${width}.png`,bytes=Buffer.from('PNG histórico sintético preservado: '+name);
    historical.set(name,bytes);fs.writeFileSync(path.join(gallery,name),bytes);
  }
  const unrelated=path.join(gallery,'pautas-light-card-1440.png');
  fs.writeFileSync(unrelated,'Outra galeria sintética preservada');
  const other=path.join(temp,'crm-tema-sintetico-preservar');fs.mkdirSync(other,{recursive:true});
  fs.writeFileSync(path.join(other,'preservar.txt'),'arquivo sintético preservado');
  const result=spawnSync(process.execPath,[path.join(copy,'scripts/screenshots-tema.cjs')],{
    cwd:copy,encoding:'utf8',timeout:45000,env:{...process.env,TEMP:temp,TMP:temp,TMPDIR:temp}
  });
  assert.equal(result.error,undefined);
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout,'Screenshots sintéticos: 16; passou\n');
  for(const [name,bytes] of historical)assert.ok(fs.readFileSync(path.join(gallery,name)).equals(bytes),
    'A execução padrão não pode sobrescrever a evidência histórica '+name);
  assert.equal(fs.readFileSync(unrelated,'utf8'),'Outra galeria sintética preservada');
  assert.deepEqual(fs.readdirSync(gallery).sort(),[...historical.keys(),path.basename(unrelated),'tema-layout-v3'].sort());
  const output=path.join(gallery,'tema-layout-v3');
  assert.equal(fs.readdirSync(output).length,16);
  assert.ok(fs.readdirSync(output).every(name=>!name.includes('planilha')));
  for(const theme of ['light','dark'])for(const screen of ['planejamento','gaveta','producao','publicar'])for(const width of [1440,390]){
    const png=fs.readFileSync(path.join(output,`tema-${theme}-${screen}-${width}.png`));
    assert.deepEqual(png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
    assert.equal(png.readUInt32BE(16),width);
  }
  assert.deepEqual(fs.readdirSync(temp),['crm-tema-sintetico-preservar'],'Somente o TEMP criado pelo script foi removido');
  assert.equal(fs.readFileSync(path.join(other,'preservar.txt'),'utf8'),'arquivo sintético preservado');
});
