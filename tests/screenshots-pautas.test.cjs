const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const {spawnSync}=require('node:child_process');
const project=path.resolve(__dirname,'..');
const script=path.join(project,'scripts/screenshots-pautas.cjs');

function temporario(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm004-screenshots-test-'));
  t.after(()=>{
    assert.equal(path.dirname(path.resolve(root)),path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('crm004-screenshots-test-'));
    fs.rmSync(root,{recursive:true,force:true});
  });
  return root;
}

for(const invalid of ['fora do TEMP','prefixo alheio'])test('Pautas screenshots: limpeza recusa '+invalid,async t=>{
  const root=temporario(t),base=path.join(root,'temp');
  const target=invalid==='fora do TEMP'?path.join(root,'outro','crm-pautas-sintetico-alvo'):path.join(base,'alheio');
  fs.mkdirSync(target,{recursive:true});
  const marker=path.join(target,'preservar.txt');fs.writeFileSync(marker,'arquivo sintético preservado');
  const removals=[],localRequire=createRequire(script),state={exitCode:0,stdout:{write(){}}};
  await new Promise(resolve=>{
    state.stderr={write(message){assert.equal(message,'Screenshots de pautas sintéticos: falhou\n');resolve();}};
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

test('Pautas screenshots: falha do navegador encerra servidor, limpa TEMP e informa erro fixo',async t=>{
  const root=temporario(t),base=path.join(root,'temp');fs.mkdirSync(base);
  const localRequire=createRequire(script),state={exitCode:0,env:{CRM_PLAYWRIGHT_MODULE:'navegador-sintetico'},stdout:{write(){assert.fail('Falha não pode informar sucesso');}}};
  let server;
  await new Promise(resolve=>{
    state.stderr={write(message){assert.equal(message,'Screenshots de pautas sintéticos: falhou\n');resolve();}};
    vm.runInNewContext(fs.readFileSync(script,'utf8'),{
      __dirname:path.dirname(script),process:state,
      require:name=>{
        if(name==='node:os')return {tmpdir:()=>base};
        if(name==='navegador-sintetico')return {chromium:{async launch(){throw Error('Detalhe interno que não deve sair');}}};
        if(name==='../src/servidor.cjs')return {criarServidor:options=>(server=localRequire(name).criarServidor(options))};
        return localRequire(name);
      }
    },{filename:script});
  });
  assert.equal(state.exitCode,1);
  assert.ok(server,'Falha aconteceu após preparar o servidor sintético');
  assert.equal(server.listening,false);
  assert.deepEqual(fs.readdirSync(base),[],'Falha remove apenas o TEMP criado pelo gerador');
});

test('Pautas screenshots: CLI padrão preserva 20 PNG históricos e gera pautas-layout-v3 com Publicar em TEMP',{
  skip:process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false,
  timeout:90000
},t=>{
  const root=temporario(t),copy=path.join(root,'projeto'),temp=path.join(root,'temp');
  for(const dir of ['scripts','tests','src'])fs.mkdirSync(path.join(copy,dir),{recursive:true});
  fs.copyFileSync(script,path.join(copy,'scripts/screenshots-pautas.cjs'));
  for(const fixture of ['fixtures.cjs','pautas-fixtures.cjs'])fs.copyFileSync(path.join(__dirname,fixture),path.join(copy,'tests',fixture));
  fs.cpSync(path.join(project,'src'),path.join(copy,'src'),{recursive:true});
  const gallery=path.join(copy,'docs/design/screenshots');fs.mkdirSync(gallery,{recursive:true});
  const historical=new Map();
  for(const theme of ['light','dark'])for(const screen of ['card','semana-origem','gaveta','mes-sem-pautas','planilha'])for(const width of [1440,390]){
    const name=`pautas-${theme}-${screen}-${width}.png`,bytes=Buffer.from('PNG histórico sintético preservado: '+name);
    historical.set(name,bytes);fs.writeFileSync(path.join(gallery,name),bytes);
  }
  const existing=path.join(gallery,'tema-light-planejamento-1440.png');
  fs.writeFileSync(existing,'galeria anterior preservada');
  const other=path.join(temp,'crm-pautas-sintetico-preservar');fs.mkdirSync(other,{recursive:true});
  fs.writeFileSync(path.join(other,'preservar.txt'),'arquivo sintético preservado');
  const result=spawnSync(process.execPath,[path.join(copy,'scripts/screenshots-pautas.cjs')],{
    cwd:copy,encoding:'utf8',timeout:75000,env:{...process.env,TEMP:temp,TMP:temp,TMPDIR:temp}
  });
  assert.equal(result.error,undefined);
  assert.equal(result.status,0,result.stderr);
  assert.equal(result.stdout,'Screenshots de pautas sintéticos: 20; passou\n');
  for(const [name,bytes] of historical)assert.ok(fs.readFileSync(path.join(gallery,name)).equals(bytes),
    'A execução padrão não pode sobrescrever a evidência histórica '+name);
  assert.equal(fs.readFileSync(existing,'utf8'),'galeria anterior preservada');
  assert.deepEqual(fs.readdirSync(gallery).sort(),[...historical.keys(),path.basename(existing),'pautas-layout-v3'].sort());
  const output=path.join(gallery,'pautas-layout-v3');
  assert.equal(fs.readdirSync(output).length,20);
  assert.ok(fs.readdirSync(output).every(name=>!name.includes('planilha')));
  for(const theme of ['light','dark'])for(const screen of ['card','semana-origem','gaveta','mes-sem-pautas','publicar'])for(const width of [1440,390]){
    const png=fs.readFileSync(path.join(output,`pautas-${theme}-${screen}-${width}.png`));
    assert.deepEqual(png.subarray(0,8),Buffer.from([137,80,78,71,13,10,26,10]));
    assert.equal(png.readUInt32BE(16),width);
    assert.ok(png.readUInt32BE(20)>0);
  }
  assert.equal(fs.readFileSync(existing,'utf8'),'galeria anterior preservada');
  assert.deepEqual(fs.readdirSync(temp),['crm-pautas-sintetico-preservar'],'Somente o TEMP criado pelo script foi removido');
  assert.equal(fs.readFileSync(path.join(other,'preservar.txt'),'utf8'),'arquivo sintético preservado');
});
