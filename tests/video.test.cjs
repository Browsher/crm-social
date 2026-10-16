const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {temporario,redefinirHorario,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {mudarPorId,imagemPng,sha256}=require('./previas-fixtures.cjs');
const {capturaVideo,videoMp4}=require('./video-fixtures.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const midia=require('../src/midia.cjs');
const ID='video-final-sintetico',MAX=64_000_000;
function recusa(error,status=422) {assert.equal(error.status,status);assert.equal(error.message,'Prévia indisponível');return true;}
function validar(bytes,hash) {assert.equal(typeof midia.validarVideo,'function','validador MP4 disponível');return midia.validarVideo(bytes,hash);}
function preparar(t,editar=()=>{},download=async()=>videoMp4()) {
  const raw=capturaVideo();editar(raw);recalcularHashes(raw);
  const dataDir=temporario(t);assert.equal(promoverCaptura(raw,dataDir).resultado,'completa');
  let calls=0;const service=midia.criarServicoMidia({dataDir,criarCliente:()=>({getMidia:async(id,options)=>{
    calls++;assert.equal(id,'drive-sintetico-'+ID);assert.deepEqual(options,{maxBytes:MAX});return download();
  }})});
  const obter=()=>{assert.equal(typeof service.obterVideo,'function','serviço de vídeo disponível');return service.obterVideo(ID);};
  return {raw,dataDir,service,obter,calls:()=>calls};
}
function proxima(ctx,editar) {
  const raw=structuredClone(ctx.raw),fim=Date.parse(raw.completedAt)+1000;raw.capturaId+='-nova';
  redefinirHorario(raw,new Date(fim-1000).toISOString(),new Date(fim).toISOString());editar(raw);recalcularHashes(raw);
  assert.equal(promoverCaptura(raw,ctx.dataDir).resultado,'completa');ctx.raw=raw;
}
test('V01 MP4 completo sintético aceita SHA opcional e normalizado',()=>{
  const bytes=videoMp4();for(const hash of [undefined,'',sha256(bytes),sha256(bytes).toUpperCase()])assert.equal(validar(bytes,hash),'video/mp4');
});
test('V02 HTML, imagens, assinatura isolada e caixas truncadas não autorizam vídeo',()=>{
  const bytes=videoMp4();
  for(const invalid of [null,'mp4',Buffer.alloc(0),imagemPng(),Buffer.from('<html>'),bytes.subarray(0,24),bytes.subarray(0,bytes.length-1),Buffer.from('0000ftypisom0000')])
    assert.throws(()=>validar(invalid),e=>recusa(e));
  for(const hash of [' ',123,'a'.repeat(63),'g'.repeat(64),'0'.repeat(64)])assert.throws(()=>validar(bytes,hash),e=>recusa(e));
  const brand=Buffer.from(bytes);brand.write('qt  ',8,'latin1');brand.fill(0,16,Math.min(32,brand.readUInt32BE(0)));
  assert.throws(()=>validar(brand),e=>recusa(e));
});
test('V03 limite de vídeo é inclusivo em 64 MB; imagem conserva 15 MB',()=>{
  const bytes=videoMp4(),large=Buffer.alloc(MAX);bytes.copy(large);large.writeUInt32BE(MAX-bytes.length,bytes.length);large.write('free',bytes.length+4,'latin1');
  assert.equal(validar(large),'video/mp4');
  assert.throws(()=>validar(Buffer.concat([large,Buffer.alloc(1)])),e=>recusa(e));
  assert.throws(()=>midia.validarImagem(large),e=>recusa(e));
});
test('V04 cache privado MP4 é revalidado e pode servir nova instância sem cliente',async t=>{
  const ctx=preparar(t),before=JSON.stringify(lerEstado(ctx.dataDir));
  assert.deepEqual(await ctx.obter(),{bytes:videoMp4(),contentType:'video/mp4'});
  assert.deepEqual(await ctx.obter(),{bytes:videoMp4(),contentType:'video/mp4'});assert.equal(ctx.calls(),1);
  const other=midia.criarServicoMidia({dataDir:ctx.dataDir,criarCliente:()=>{throw new Error('não deve criar cliente');}});
  assert.deepEqual((await other.obterVideo(ID)).bytes,videoMp4());
  const cache=path.join(ctx.dataDir,'midias'),files=fs.readdirSync(cache);assert.equal(files.length,1);assert.match(files[0],/^[a-f0-9]{64}\.bin$/);
  fs.writeFileSync(path.join(cache,files[0]),imagemPng());await ctx.obter();assert.equal(ctx.calls(),2);
  assert.equal(JSON.stringify(lerEstado(ctx.dataDir)),before);
});
test('V05 tipo, versão, hash e Drive inválidos são recusados antes de qualquer download',async t=>{
  for(const [campo,valor] of [['tipo','imagem'],['tipo','documento'],['tipo','vídeo'],['versao','1'],['versao',0],['versao',1.5],['id_drive','https://drive.google.com/x'],['sha256','bad']]) {
    const ctx=preparar(t,raw=>mudarPorId(raw,'Arquivos',ID,campo,valor));
    await assert.rejects(ctx.obter(),e=>recusa(e));assert.equal(ctx.calls(),0);
  }
});
test('V06 outra marca e produção ausente não autorizam vídeo',async t=>{
  for(const [editar,status] of [
    [raw=>mudarPorId(raw,'Produções','peca-4','marca_id','outra'),404],
    [raw=>mudarPorId(raw,'Arquivos',ID,'producao_id','ausente'),404]
  ]) {
    const ctx=preparar(t,editar);await assert.rejects(ctx.obter(),e=>recusa(e,status));assert.equal(ctx.calls(),0);
  }
});
test('V07 bytes inválidos e SHA divergente não criam cache e permitem nova tentativa',async t=>{
  let valid=false;const ctx=preparar(t,()=>{},async()=>valid?videoMp4():imagemPng());
  await assert.rejects(ctx.obter(),e=>recusa(e));assert.equal(fs.existsSync(path.join(ctx.dataDir,'midias')),false);
  valid=true;await ctx.obter();assert.equal(ctx.calls(),2);
  const mismatch=preparar(t,raw=>mudarPorId(raw,'Arquivos',ID,'sha256','0'.repeat(64)));
  await assert.rejects(mismatch.obter(),e=>recusa(e));
});
test('V08 concorrentes compartilham download e mudança de referência revoga bytes em andamento',async t=>{
  let liberar;const pending=new Promise(resolve=>{liberar=resolve;});const ctx=preparar(t,()=>{},async()=>{await pending;return videoMp4();});
  const results=[ctx.obter(),ctx.obter()];assert.equal(ctx.calls(),1);
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',ID,'tipo','imagem'));liberar();
  for(const result of results)await assert.rejects(result,e=>recusa(e,503));
});
test('V09 cache não conserva autorização após remoção e mudança de versão exige novo download',async t=>{
  const ctx=preparar(t);await ctx.obter();
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',ID,'versao',2));await ctx.obter();assert.equal(ctx.calls(),2);
  proxima(ctx,raw=>{const table=raw.tables.Arquivos;table.values=table.values.filter((row,i)=>i===0||row[0]!==ID);});
  await assert.rejects(ctx.obter(),e=>recusa(e,404));assert.equal(ctx.calls(),2);
});
test('V10 erros privados do cliente viram somente erro público e não ficam pendentes',async t=>{
  let fail=true;const ctx=preparar(t,()=>{},async()=>{if(fail)throw new Error('token-sentinela /privado');return videoMp4();});
  await assert.rejects(ctx.obter(),e=>recusa(e,503));fail=false;await ctx.obter();assert.equal(ctx.calls(),2);
});
test('V11 captura corrompida com identidades repetidas recusa vídeo antes da rede',async t=>{
  for(const [table,record] of [['Arquivos',{arquivo_id:ID,producao_id:'peca-4',tipo:'video',versao:1,id_drive:'outro'}],
    ['Produções',{producao_id:'peca-4',marca_id:'ntv',semana_id:'semana-01',versao:1}]]) {
    const ctx=preparar(t);adicionarRegistro(ctx.raw,table,record);
    fs.writeFileSync(path.join(ctx.dataDir,'capturas',ctx.raw.capturaId+'.json'),JSON.stringify(ctx.raw));
    await assert.rejects(ctx.obter(),e=>recusa(e,503));assert.equal(ctx.calls(),0);
  }
});
test('V12 cache de imagem e vídeo nunca partilha autorização por assinatura sem SHA',async t=>{
  const ctx=preparar(t,raw=>mudarPorId(raw,'Arquivos',ID,'sha256',''));let calls=0;
  const service=midia.criarServicoMidia({dataDir:ctx.dataDir,criarCliente:()=>({getMidia:async(_id,options)=>{
    calls++;return options?videoMp4():imagemPng();
  }})});
  assert.equal((await service.obter(ID)).contentType,'image/png');
  assert.equal((await service.obterVideo(ID)).contentType,'video/mp4');
  assert.equal((await service.obter(ID)).contentType,'image/png');
  assert.equal((await service.obterVideo(ID)).contentType,'video/mp4');
  assert.equal(calls,2);assert.equal(fs.readdirSync(path.join(ctx.dataDir,'midias')).length,2);
});
test('V13 remoção ou corrupção durante download revoga o resultado e captura equivalente conserva bytes',async t=>{
  for(const mode of ['remover','corromper','igual']) {
    let liberar;const pending=new Promise(resolve=>{liberar=resolve;});const ctx=preparar(t,()=>{},async()=>{await pending;return videoMp4();});
    const result=ctx.obter();
    if(mode==='corromper')fs.writeFileSync(path.join(ctx.dataDir,'atual.json'),'invalid');
    else proxima(ctx,raw=>{
      if(mode==='igual')mudarPorId(raw,'Produções','peca-4','titulo','Título atualizado');
      else {const table=raw.tables.Arquivos;table.values=table.values.filter((row,i)=>i===0||row[0]!==ID);}
    });
    liberar();
    if(mode==='igual')assert.deepEqual((await result).bytes,videoMp4());
    else await assert.rejects(result,e=>recusa(e,503));
  }
});
test('V14 leitor MP4 trata caixas de tamanho estendido e final, e recusa limites estruturais',()=>{
  const bytes=videoMp4(),extended=Buffer.alloc(16);extended.writeUInt32BE(1);extended.write('free',4,'latin1');extended.writeBigUInt64BE(16n,8);
  assert.equal(validar(Buffer.concat([bytes,extended])),'video/mp4');
  const final=Buffer.from([0,0,0,0,102,114,101,101]);assert.equal(validar(Buffer.concat([bytes,final])),'video/mp4');
  const tooBig=Buffer.from(extended);tooBig.writeBigUInt64BE(64_000_001n,8);
  const tooSmall=Buffer.from(extended);tooSmall.writeBigUInt64BE(8n,8);
  for(const extra of [Buffer.alloc(7),extended.subarray(0,12),tooBig,tooSmall])assert.throws(()=>validar(Buffer.concat([bytes,extra])),e=>recusa(e));
  for(const tipo of ['moov','mdat']) {
    const invalid=Buffer.from(bytes),position=invalid.indexOf(Buffer.from(tipo));assert.ok(position>0);invalid.write('free',position,'latin1');
    assert.throws(()=>validar(invalid),e=>recusa(e));
  }
  const invalidType=Buffer.from(bytes);invalidType.write('free',4,'latin1');assert.throws(()=>validar(invalidType),e=>recusa(e));
});
