const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {validarCaptura}=require('../src/captura.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {carregarModulo,adicionarRegistro,temporario,redefinirHorario}=require('./fixtures.cjs');
const {capturaPrevias,mudarPorId,recalcularHashes,imagemPng,imagemJpeg,imagemWebp,imagemPorArquivo,sha256}=require('./previas-fixtures.cjs');
const {validarImagem,resolverArquivo,criarServicoMidia=()=>({obter:async()=>undefined})}=carregarModulo('src/midia.cjs',['validarImagem','resolverArquivo']);
const MAX_BYTES=15_000_000;
const INTERNO='imagem-pagina-1';
function estado(raw=capturaPrevias()) {return {captura:validarCaptura(raw),historico:[],ultimaTentativa:null};}
function recusa(operation,status) {
  assert.throws(operation,error=>{
    assert.equal(error.status,status,'status público da recusa');
    assert.equal(error.message,'Prévia indisponível','mensagem pública constante');
    return true;
  });
}
function alterar(campo,valor) {const raw=capturaPrevias();mudarPorId(raw,'Arquivos',INTERNO,campo,valor);return estado(raw);}
test('M005 regras: identifica PNG, JPEG e WEBP pelos bytes sintéticos',()=>{
  for(const [bytes,tipo] of [[imagemPng(),'image/png'],[imagemJpeg(),'image/jpeg'],[imagemWebp(),'image/webp']]) {
    assert.equal(validarImagem(bytes),tipo);
    assert.equal(validarImagem(bytes,''),tipo);
    assert.equal(validarImagem(bytes,sha256(bytes)),tipo);
  }
});
test('M005 regras: assinaturas mínimas completas são suficientes, sem prometer decodificação',()=>{
  assert.equal(validarImagem(Buffer.from([137,80,78,71,13,10,26,10])),'image/png');
  assert.equal(validarImagem(Buffer.from([0xff,0xd8,0xff])),'image/jpeg');
  assert.equal(validarImagem(imagemWebp().subarray(0,12)),'image/webp');
});
test('M005 regras: assinaturas truncadas ou marcadores WEBP incorretos são recusados',()=>{
  for(const bytes of [Buffer.alloc(0),imagemPng().subarray(0,7),imagemJpeg().subarray(0,2),imagemWebp().subarray(0,11),
    Buffer.from('RIFF1234WAVE'),Buffer.from('WEBP12345678'),
    Buffer.from([0xd2,0xc9,0xc6,0xc6,0,0,0,0,0xd7,0xc5,0xc2,0xd0])])recusa(()=>validarImagem(bytes),422);
});
test('M005 regras: SVG, GIF, vídeo, ZIP, HTML e JSON não são imagens permitidas',()=>{
  for(const bytes of [Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),Buffer.from('GIF89a'),
    Buffer.from([0,0,0,24,102,116,121,112,109,112,52,50]),Buffer.from([0x50,0x4b,3,4]),
    Buffer.from('<!doctype html><html/>'),Buffer.from('{"tipo":"image/png"}')])recusa(()=>validarImagem(bytes),422);
});
test('M005 regras: limite decimal inclusivo é aplicado aos bytes reais',()=>{
  const limite=Buffer.alloc(MAX_BYTES);imagemPng().subarray(0,8).copy(limite);
  assert.equal(validarImagem(limite),'image/png');
  recusa(()=>validarImagem(Buffer.concat([limite,Buffer.from([0])])),422);
});
test('M005 regras: SHA opcional aceita caixa diferente e recusa hash inválido ou divergente',()=>{
  const bytes=imagemPng();
  assert.equal(validarImagem(bytes,sha256(bytes).toUpperCase()),'image/png');
  for(const hash of [' ',123,true,'abc','g'.repeat(64),'a'.repeat(63),'a'.repeat(65),'0'.repeat(64)]) {
    recusa(()=>validarImagem(bytes,hash),422);
  }
});
test('M005 resolução: ID interno exato devolve referência própria e SHA normalizado',()=>{
  const raw=capturaPrevias(),hash=sha256(imagemPng());
  mudarPorId(raw,'Arquivos',INTERNO,'sha256',hash.toUpperCase());
  const loaded=estado(raw),before=JSON.stringify(loaded),arquivo=resolverArquivo(loaded,INTERNO);
  assert.equal(arquivo.arquivo_id,INTERNO);assert.equal(arquivo.versao,2);
  assert.equal(arquivo.id_drive,'drive-sintetico-'+INTERNO);assert.equal(arquivo.sha256,hash);
  assert.equal(JSON.stringify(loaded),before,'resolver não muda captura ou estado');
});
test('M005 resolução: ID remoto, prefixo, espaços e ID codificado não substituem ID interno',()=>{
  const loaded=estado();
  for(const id of ['drive-sintetico-'+INTERNO,'imagem-pagina',' '+INTERNO,INTERNO+' ','imagem%2Dpagina%2D1','nao-registrado']) {
    recusa(()=>resolverArquivo(loaded,id),404);
  }
});
test('M005 resolução: recorte NTV usa produção ou documento da semana sem produção',()=>{
  const raw=capturaPrevias();
  for(const [id,producao,semana] of [['fora-ntv','peca-5','semana-01'],['producao-ausente','peca-ausente','semana-01'],
    ['documento-semanal','','semana-01'],['semana-ausente','','semana-ausente']]) {
    adicionarRegistro(raw,'Arquivos',{arquivo_id:id,producao_id:producao,semana_id:semana,versao:1,tipo:'documento',id_drive:'drive-'+id});
  }
  const loaded=estado(raw);
  assert.equal(resolverArquivo(loaded,'documento-semanal').arquivo_id,'documento-semanal');
  for(const id of ['fora-ntv','producao-ausente','semana-ausente'])recusa(()=>resolverArquivo(loaded,id),404);
});
test('M005 resolução: captura ausente ou estrutura ilegível não concede acesso',()=>{
  for(const loaded of [null,{}, {captura:null},{captura:{}},{captura:{arquivos:[]}}])recusa(()=>resolverArquivo(loaded,INTERNO),503);
});
test('M005 resolução: duplicidade da identidade exata é recusada sem escolher a primeira',()=>{
  const loaded=estado();loaded.captura.arquivos.push({...loaded.captura.arquivos.find(a=>a.arquivo_id===INTERNO)});
  recusa(()=>resolverArquivo(loaded,INTERNO),422);
});
test('M005 resolução: versão exige inteiro positivo seguro, sem coerção textual',()=>{
  for(const value of ['',null,'2',0,-1,1.5,Number.MAX_SAFE_INTEGER+1])recusa(()=>resolverArquivo(alterar('versao',value),INTERNO),422);
  assert.equal(resolverArquivo(alterar('versao',Number.MAX_SAFE_INTEGER),INTERNO).versao,Number.MAX_SAFE_INTEGER);
});
test('M005 resolução: id_drive exige caracteres canônicos preenchidos e nunca deriva da URL',()=>{
  const id='AZaz09_-';assert.equal(resolverArquivo(alterar('id_drive',id),INTERNO).id_drive,id);
  for(const value of ['',null,123,' drive','drive ','drive/id','../drive','drive.id','drive%2Did','https://drive.google.com/file/d/sintetico/view']) {
    recusa(()=>resolverArquivo(alterar('id_drive',value),INTERNO),422);
  }
});
test('M005 resolução: SHA ausente é opcional; preenchido exige 64 hex, normaliza e não confere bytes ainda',()=>{
  for(const value of ['',null])assert.equal(resolverArquivo(alterar('sha256',value),INTERNO).sha256,'');
  assert.equal(resolverArquivo(alterar('sha256','A'.repeat(64)),INTERNO).sha256,'a'.repeat(64));
  for(const value of [' ',1,true,'a'.repeat(63),'g'.repeat(64),'a'.repeat(65)])recusa(()=>resolverArquivo(alterar('sha256',value),INTERNO),422);
});
test('M005 resolução: tipo/extensão declarados não autorizam nem impedem bytes',()=>{
  const loaded=alterar('tipo','documento'),arquivo=resolverArquivo(loaded,INTERNO);
  assert.equal(arquivo.arquivo_id,INTERNO);assert.equal(arquivo.tipo,'documento');
  assert.equal(validarImagem(imagemPng()),'image/png');
});

// T007: serviço real, snapshots e cache em TEMP; cliente remoto exclusivamente falso.
function preparar(t,raw=capturaPrevias()) {
  const dataDir=path.join(temporario(t),'data');
  assert.equal(promoverCaptura(raw,dataDir).resultado,'completa');
  return {dataDir,raw,numero:0};
}
function proxima(ctx,editar=()=>{}) {
  const raw=structuredClone(ctx.raw),fim=Date.parse(raw.completedAt)+1000;
  raw.capturaId='previa-sintetica-'+(++ctx.numero);
  redefinirHorario(raw,new Date(fim-1000).toISOString(),new Date(fim).toISOString());
  editar(raw);recalcularHashes(raw);
  assert.equal(promoverCaptura(raw,ctx.dataDir).resultado,'completa');
  ctx.raw=raw;return raw;
}
function fotosEstado(dataDir) {
  const files=['atual.json','ultima-tentativa.json'];
  for(const dir of ['capturas','tentativas']) {
    if(fs.existsSync(path.join(dataDir,dir)))files.push(...fs.readdirSync(path.join(dataDir,dir)).map(file=>path.join(dir,file)));
  }
  return files.filter(file=>fs.existsSync(path.join(dataDir,file))).sort().map(file=>[file,fs.readFileSync(path.join(dataDir,file)).toString('base64')]);
}
function chaveCache(ctx,id=INTERNO) {
  const a=validarCaptura(ctx.raw).arquivos.find(record=>record.arquivo_id===id);
  return sha256(Buffer.from(JSON.stringify([a.arquivo_id,a.versao,a.id_drive,(a.sha256??'').toLowerCase()])));
}
function cacheFile(ctx,id=INTERNO) {return path.join(ctx.dataDir,'midias',chaveCache(ctx,id)+'.bin');}
function cachear(ctx,bytes,id=INTERNO) {
  const file=cacheFile(ctx,id);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);return file;
}
function remoto(download) {
  const remote={creates:0,calls:[]};
  remote.criarCliente=()=>{
    remote.creates++;
    return {getMidia:async id=>{
      remote.calls.push(id);
      return download?download(id,remote.calls):imagemPorArquivo(id.replace(/^drive-sintetico-/,''));
    }};
  };
  return remote;
}
function resultado(actual,bytes=imagemPorArquivo(INTERNO)) {
  assert.ok(actual&&typeof actual==='object','serviço devolve resultado de bytes');
  assert.deepEqual(Object.keys(actual).sort(),['bytes','contentType']);
  assert.equal(actual.contentType,'image/png');assert.deepEqual(actual.bytes,bytes);
}
async function recusaAsync(operation,status) {
  await assert.rejects(operation,error=>{
    assert.equal(error.status,status,'status público da recusa');
    assert.equal(error.message,'Prévia indisponível','mensagem pública constante');return true;
  });
}
test('M005 serviço: construtor lazy, miss/hit e nova instância sem credencial no hit',async t=>{
  const ctx=preparar(t),remote=remoto(),before=fotosEstado(ctx.dataDir);
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  assert.equal(remote.creates,0);assert.equal(remote.calls.length,0);
  resultado(await service.obter(INTERNO));resultado(await service.obter(INTERNO));
  assert.equal(remote.creates,1);assert.deepEqual(remote.calls,['drive-sintetico-'+INTERNO]);
  const files=fs.readdirSync(path.join(ctx.dataDir,'midias'));
  assert.deepEqual(files,[chaveCache(ctx)+'.bin']);assert.match(files[0],/^[a-f0-9]{64}\.bin$/);
  assert.deepEqual(fs.readFileSync(cacheFile(ctx)),imagemPorArquivo(INTERNO));
  const offline=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:()=>{assert.fail('cache hit não carrega credencial nem OAuth');}});
  resultado(await offline.obter(INTERNO));assert.deepEqual(fotosEstado(ctx.dataDir),before);
});
test('M005 serviço: cache por ID/versão/id_drive/hash normalizado e mudança invalida hit anterior',async t=>{
  const ctx=preparar(t);let bytes=imagemPorArquivo(INTERNO);
  const remote=remoto(()=>bytes),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  resultado(await service.obter(INTERNO));const keys=[chaveCache(ctx)];
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',INTERNO,'sha256',sha256(bytes).toUpperCase()));
  assert.equal(chaveCache(ctx),keys[0]);resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,1);
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',INTERNO,'versao',4));keys.push(chaveCache(ctx));resultado(await service.obter(INTERNO));
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',INTERNO,'id_drive','drive-sintetico-outra-origem'));keys.push(chaveCache(ctx));resultado(await service.obter(INTERNO));
  bytes=imagemPng({cor:[101,20,180]});
  proxima(ctx,raw=>mudarPorId(raw,'Arquivos',INTERNO,'sha256',sha256(bytes)));keys.push(chaveCache(ctx));resultado(await service.obter(INTERNO),bytes);
  assert.equal(new Set(keys).size,4);assert.equal(remote.calls.length,4);
  assert.deepEqual(fs.readdirSync(path.join(ctx.dataDir,'midias')).sort(),keys.map(key=>key+'.bin').sort());
});
test('M005 serviço: ID opaco nunca vira caminho de cache e cada identidade conserva sua chave',async t=>{
  const raw=capturaPrevias(),id='imagem/../interna';mudarPorId(raw,'Arquivos',INTERNO,'arquivo_id',id);
  const ctx=preparar(t,raw),remote=remoto(()=>imagemPorArquivo(INTERNO));
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  resultado(await service.obter(id));assert.deepEqual(fs.readdirSync(path.join(ctx.dataDir,'midias')),[chaveCache(ctx,id)+'.bin']);
  assert.ok(cacheFile(ctx,id).startsWith(path.join(ctx.dataDir,'midias')+path.sep));
});
test('M005 serviço: arquivo removido ou fora da NTV não ganha autorização pelo cache antigo',async t=>{
  for(const fora of [false,true]) {
    const ctx=preparar(t),remote=remoto(),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    resultado(await service.obter(INTERNO));
    proxima(ctx,raw=>{
      if(fora)mudarPorId(raw,'Produções','peca-3','marca_id','outra-marca-sintetica');
      else raw.tables.Arquivos.values=raw.tables.Arquivos.values.filter((row,i)=>i===0||row[0]!==INTERNO);
    });
    const before=fotosEstado(ctx.dataDir);await recusaAsync(()=>service.obter(INTERNO),404);
    assert.equal(remote.calls.length,1);assert.deepEqual(fotosEstado(ctx.dataDir),before);
  }
});
test('M005 serviço: ausente, snapshot corrompido ou recibo inválido recusam antes de cache/rede',async t=>{
  for(const modo of ['ausente','captura','recibo','ponteiro']) {
    const ctx=preparar(t);cachear(ctx,imagemPorArquivo(INTERNO));
    if(modo==='ausente')fs.writeFileSync(path.join(ctx.dataDir,'atual.json'),JSON.stringify({capturaId:null,ultimaTentativaId:null,historicoIds:[]}));
    if(modo==='captura')fs.writeFileSync(path.join(ctx.dataDir,'capturas',ctx.raw.capturaId+'.json'),'{');
    if(modo==='recibo')fs.writeFileSync(path.join(ctx.dataDir,'tentativas',lerEstado(ctx.dataDir).ultimaTentativa.tentativaId+'.json'),'{}');
    if(modo==='ponteiro')fs.writeFileSync(path.join(ctx.dataDir,'atual.json'),'{');
    const before=fotosEstado(ctx.dataDir),remote=remoto(),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    await recusaAsync(()=>service.obter(INTERNO),503);assert.equal(remote.creates,0);assert.equal(remote.calls.length,0);
    assert.deepEqual(fotosEstado(ctx.dataDir),before);
  }
});
test('M005 serviço: registro inválido ou ID ausente não inicia cliente/rede',async t=>{
  for(const [campo,valor] of [['versao',0],['id_drive',''],['sha256','hash-invalido']]) {
    const raw=capturaPrevias();mudarPorId(raw,'Arquivos',INTERNO,campo,valor);
    const ctx=preparar(t,raw),before=fotosEstado(ctx.dataDir),remote=remoto();
    const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    await recusaAsync(()=>service.obter(INTERNO),422);await recusaAsync(()=>service.obter('id-ausente'),404);
    assert.equal(remote.creates,0);assert.deepEqual(fotosEstado(ctx.dataDir),before);
  }
});
test('M005 serviço: cache corrompido, parcial ou grande é revalidado e refeito',async t=>{
  for(const modo of ['svg','parcial','grande']) {
    const ctx=preparar(t),remote=remoto();
    const file=cachear(ctx,modo==='svg'?Buffer.from('<svg/>'):imagemPng().subarray(0,8));
    if(modo==='grande')fs.truncateSync(file,MAX_BYTES+1);
    const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,1);
    assert.deepEqual(fs.readFileSync(file),imagemPorArquivo(INTERNO));
  }
});
test('M005 serviço: SHA opcional ainda exige revalidar assinatura no cache e no download',async t=>{
  const raw=capturaPrevias();mudarPorId(raw,'Arquivos',INTERNO,'sha256','');
  const ctx=preparar(t,raw),file=cachear(ctx,Buffer.from('<svg/>')),remote=remoto();
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,1);
  assert.deepEqual(fs.readFileSync(file),imagemPorArquivo(INTERNO));
});
test('M005 serviço: bytes baixados recusados não são promovidos e falha não fica coalescida',async t=>{
  for(const bytes of [Buffer.from('<svg/>'),imagemPng({cor:[111,12,13]})]) {
    const ctx=preparar(t);let resposta=bytes;
    const remote=remoto(()=>resposta),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    const before=fotosEstado(ctx.dataDir);await recusaAsync(()=>service.obter(INTERNO),422);
    assert.ok(!fs.existsSync(cacheFile(ctx)));assert.deepEqual(fotosEstado(ctx.dataDir),before);
    resposta=imagemPorArquivo(INTERNO);resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,2);
  }
});
test('M005 serviço: falhas de cliente/rede viram mensagem constante e podem ser tentadas novamente',async t=>{
  const ctx=preparar(t);let falhar=true;
  const remote=remoto(()=>{if(falhar)throw new Error('sentinela-privada-do-provedor');return imagemPorArquivo(INTERNO);});
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  await recusaAsync(()=>service.obter(INTERNO),503);falhar=false;resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,2);
  const offlineCtx=preparar(t),offline=criarServicoMidia({dataDir:offlineCtx.dataDir,criarCliente:()=>{throw new Error('sentinela-config-privada');}});
  await recusaAsync(()=>offline.obter(INTERNO),503);
});
test('M005 serviço: falha de mkdir ou rename serve bytes novos válidos e limpa só seu staging',async t=>{
  for(const modo of ['mkdir','rename']) {
    const ctx=preparar(t),dir=path.join(ctx.dataDir,'midias'),remote=remoto();
    if(modo==='mkdir')fs.writeFileSync(dir,'cache bloqueado sintético');
    else {fs.mkdirSync(dir);fs.mkdirSync(cacheFile(ctx));fs.writeFileSync(path.join(dir,'outro-pedido.tmp'),'staging alheio');}
    const before=fotosEstado(ctx.dataDir),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,1);assert.deepEqual(fotosEstado(ctx.dataDir),before);
    if(modo==='mkdir')assert.equal(fs.readFileSync(dir,'utf8'),'cache bloqueado sintético');
    else {
      assert.equal(fs.readFileSync(path.join(dir,'outro-pedido.tmp'),'utf8'),'staging alheio');
      assert.deepEqual(fs.readdirSync(dir).sort(),[chaveCache(ctx)+'.bin','outro-pedido.tmp'].sort());
    }
  }
});
test('M005 serviço: concorrentes da mesma chave compartilham download, não mantêm bytes em RAM após finalizar',async t=>{
  const ctx=preparar(t);let liberar;
  const bloqueio=new Promise(resolve=>{liberar=resolve;}),remote=remoto(async()=>{await bloqueio;return imagemPorArquivo(INTERNO);});
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  const pedidos=Array.from({length:6},()=>service.obter(INTERNO));
  await Promise.resolve();const count=remote.calls.length;liberar();
  for(const item of await Promise.all(pedidos))resultado(item);
  assert.equal(count,1);
  fs.unlinkSync(cacheFile(ctx));resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,2,'sem Buffer permanente depois do pedido');
});
test('M005 serviço: concorrência em falha é removida e pedido posterior pode recuperar',async t=>{
  const ctx=preparar(t);let liberar,falhar=true;
  const bloqueio=new Promise(resolve=>{liberar=resolve;}),remote=remoto(async()=>{
    await bloqueio;if(falhar)throw new Error('sentinela-privada');return imagemPorArquivo(INTERNO);
  });
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  const pedidos=Array.from({length:4},()=>recusaAsync(()=>service.obter(INTERNO),503));
  await Promise.resolve();const count=remote.calls.length;liberar();await Promise.all(pedidos);assert.equal(count,1);
  falhar=false;resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,2);
});
test('M005 serviço: referência removida, alterada ou captura inválida durante download não serve bytes antigos',async t=>{
  for(const modo of ['removido','versao','id_drive','sha256','captura']) {
    const ctx=preparar(t),remote=remoto(()=>{
      if(modo==='captura')fs.writeFileSync(path.join(ctx.dataDir,'atual.json'),'{');
      else proxima(ctx,raw=>{
        if(modo==='removido')raw.tables.Arquivos.values=raw.tables.Arquivos.values.filter((row,i)=>i===0||row[0]!==INTERNO);
        else mudarPorId(raw,'Arquivos',INTERNO,modo,modo==='versao'?7:modo==='id_drive'?'drive-origem-nova':'A'.repeat(64));
      });
      return imagemPorArquivo(INTERNO);
    });
    const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
    await recusaAsync(()=>service.obter(INTERNO),503);assert.equal(remote.calls.length,1);
  }
});
test('M005 serviço: captura nova com referência igual não invalida bytes válidos em andamento',async t=>{
  const ctx=preparar(t),remote=remoto(()=>{proxima(ctx,raw=>mudarPorId(raw,'Produções','peca-3','titulo','Título sintético atualizado'));return imagemPorArquivo(INTERNO);});
  const service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  resultado(await service.obter(INTERNO));assert.equal(remote.calls.length,1);
});
test('M005 serviço: troca entre lstat e open recusa hit e baixa bytes corretos sem SHA',async t=>{
  const raw=capturaPrevias();mudarPorId(raw,'Arquivos',INTERNO,'sha256','');
  const ctx=preparar(t,raw),corretos=imagemPorArquivo(INTERNO),trocados=imagemPng({cor:[17,99,203]});
  const file=cachear(ctx,corretos),substituto=path.join(ctx.dataDir,'substituto-sintetico.bin');
  const original=path.join(ctx.dataDir,'original-sintetico.bin'),before=fotosEstado(ctx.dataDir);
  fs.writeFileSync(substituto,trocados);
  const open=fs.openSync,close=fs.closeSync;let trocou=false,fdLeitura,fechouLeitura=false;
  const mockOpen=t.mock.method(fs,'openSync',(filename,flags,...args)=>{
    if(path.resolve(String(filename))===file&&flags==='r'&&!trocou) {
      trocou=true;fs.renameSync(file,original);fs.renameSync(substituto,file);
    }
    const fd=open(filename,flags,...args);
    if(path.resolve(String(filename))===file&&flags==='r')fdLeitura=fd;
    return fd;
  });
  const mockClose=t.mock.method(fs,'closeSync',fd=>{
    if(fd===fdLeitura)fechouLeitura=true;return close(fd);
  });
  const remote=remoto(),service=criarServicoMidia({dataDir:ctx.dataDir,criarCliente:remote.criarCliente});
  let answer;
  try {answer=await service.obter(INTERNO);}
  finally {mockOpen.mock.restore();mockClose.mock.restore();}
  t.diagnostic(JSON.stringify({trocaReal:trocou,downloads:remote.calls.length,serviuImagemTrocada:answer.bytes.equals(trocados),descritorFechado:fechouLeitura}));
  assert.equal(trocou,true,'o arquivo real deve ser substituído precisamente antes da abertura');
  assert.equal(remote.calls.length,1,'hit cuja identidade mudou deve causar novo download');
  resultado(answer,corretos);assert.equal(fechouLeitura,true,'descritor de cache deve ser fechado mesmo ao recusar o hit');
  assert.throws(()=>fs.fstatSync(fdLeitura),{code:'EBADF'});
  assert.deepEqual(fotosEstado(ctx.dataDir),before,'captura e recibos permanecem idênticos');
});
