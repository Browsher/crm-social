const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn,spawnSync}=require('node:child_process');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');

const launcher=path.join(__dirname,'..','Abrir CRM.cmd');
const somenteWindows={skip:process.platform==='win32'?false:'Iniciador de duplo clique exclusivo do Windows.'};

async function executar(t,{falha=false,variosRuntimes=false,ocupante,servidorReal,powershellAlheio=false,esperarTecla=falha}={}) {
  assert.ok(fs.existsSync(launcher),'Deve existir um iniciador .cmd executável por duplo clique.');
  const requisicoes=[];
  const servidor=servidorReal||http.createServer((req,res)=>{
    res.setHeader('Connection','close');
    if (req.url==='/ainda-ativo') { res.end('ocupante sintetico ativo');return; }
    if (ocupante?.silencioso) return;
    res.writeHead(ocupante?.status||200,{'Content-Type':'application/json',...ocupante?.headers});
    res.end(ocupante?.body||'{"schemaVersion":1}');
  });
  const registrarRequisicao=req=>requisicoes.push({method:req.method,url:req.url});
  servidor.prependListener('request',registrarRequisicao);
  if (!servidor.listening) await new Promise((resolve,reject)=>{
    servidor.once('error',reject);
    servidor.listen(0,'127.0.0.1',resolve);
  });
  const porta=servidor.address().port;
  assert.notEqual(porta,4318,'A suíte nunca deve consultar a porta operacional.');
  if (!ocupante && !servidorReal) await new Promise(resolve=>servidor.close(resolve));
  t.after(async()=>{
    servidor.removeListener('request',registrarRequisicao);
    servidor.closeAllConnections();
    if (servidor.listening) await new Promise(resolve=>servidor.close(resolve));
  });
  const root=fs.mkdtempSync(path.join(os.tmpdir(),"crm abrir teste & aspas ' "));
  t.after(()=>{
    assert.equal(path.dirname(root),os.tmpdir());
    assert.ok(path.basename(root).startsWith('crm abrir teste'));
    fs.rmSync(root,{recursive:true,force:true});
  });
  const destino=path.join(root,'projeto com espacos');
  const cwd=path.join(root,'outro diretorio');
  fs.mkdirSync(destino);fs.mkdirSync(cwd);
  if (powershellAlheio) fs.writeFileSync(path.join(cwd,'powershell.exe'),'arquivo sintetico que nao e executavel');
  const cmd=path.join(destino,'Abrir CRM.cmd');
  const original=fs.readFileSync(launcher,'utf8');
  const interceptarNavegador="function global:Start-Process { param([string]$FilePath) [System.IO.File]::WriteAllText($env:CRM_OPEN_TEST_BROWSER, $FilePath) }; ";
  assert.ok(original.includes('-Command "'),'A cópia deve permitir interceptar o navegador antes de qualquer ramo.');
  fs.writeFileSync(cmd,original.replace(/\b4318\b/g,String(porta)).replace('-Command "','-Command "'+interceptarNavegador));
  // O iniciador PowerShell real tem sua própria suíte. Aqui o substituto registra
  // o contrato do retorno e intercepta somente a abertura do navegador, sem UI/rede.
  fs.writeFileSync(path.join(destino,'Iniciar CRM.ps1'),[
    'param([string]$NodePath)',
    '[System.IO.File]::WriteAllText($env:CRM_OPEN_TEST_RESULT, $PSScriptRoot)',
    '[System.IO.File]::WriteAllText($env:CRM_OPEN_TEST_NODE, $NodePath)',
    falha?"throw 'Falha sintetica no inicio.'":"[pscustomobject]@{url='http://127.0.0.1:4318';processId=123;encerrar='Stop-Process -Id 123'}",
  ].join('\r\n'));
  const resultPath=path.join(root,'invocado.txt');
  const browserPath=path.join(root,'navegador.txt');
  const nodePathResult=path.join(root,'runtime.txt');
  const env={...process.env,CRM_OPEN_TEST_RESULT:resultPath,CRM_OPEN_TEST_BROWSER:browserPath,CRM_OPEN_TEST_NODE:nodePathResult};
  let primeiroRuntime;
  if (variosRuntimes) {
    const runtimes=['primeiro node','segundo node'].map(nome=>path.join(root,nome));
    for (const runtime of runtimes) { fs.mkdirSync(runtime);fs.writeFileSync(path.join(runtime,'node.exe'),'runtime sintetico nao executado'); }
    primeiroRuntime=path.join(runtimes[0],'node.exe');
    for (const key of Object.keys(env)) if (key.toUpperCase()==='CRM_NODE_PATH' || key.toUpperCase()==='PATH') delete env[key];
    env.PATH=[...runtimes,process.env.PATH].join(';');
  }
  const result=await new Promise((resolve,reject)=>{
    const child=spawn(process.env.ComSpec||'cmd.exe',['/d','/s','/c','""'+cmd+'""'],{
      cwd,windowsHide:true,windowsVerbatimArguments:true,
      env,
      stdio:['pipe','pipe','pipe'],
    });
    const stdout=[],stderr=[];
    const fecharStreams=()=>{
      child.stdin.destroy();child.stdout.destroy();child.stderr.destroy();
    };
    let tecla,aguardouTecla=false;
    const coletar=destino=>chunk=>{
      destino.push(chunk);
      const saida=Buffer.concat(stdout).toString()+Buffer.concat(stderr).toString();
      const pausaVisivel=/Pressione qualquer tecla|Press any key to continue/i.test(saida);
      if (esperarTecla && !tecla && pausaVisivel) {
        tecla=setTimeout(()=>{
          aguardouTecla=child.exitCode===null && child.signalCode===null;
          if (aguardouTecla) child.stdin.write('\r\n');
        },350);
      }
    };
    child.stdout.on('data',coletar(stdout));
    child.stderr.on('data',coletar(stderr));
    const timeout=setTimeout(()=>{
      try {
        spawnSync('taskkill.exe',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore',timeout:5000});
        child.stdin.end('\r\n');
        child.kill();
      } finally {
        fecharStreams();child.unref();
      }
      reject(new Error('Iniciador de duplo clique excedeu 15 segundos com stdin aberta.\n'+Buffer.concat(stdout).toString()+'\n'+Buffer.concat(stderr).toString()));
    },15000);
    child.once('error',error=>{clearTimeout(timeout);clearTimeout(tecla);reject(error);});
    child.once('close',code=>{
      clearTimeout(timeout);clearTimeout(tecla);
      fecharStreams();
      resolve({code,stdout:Buffer.concat(stdout).toString(),stderr:Buffer.concat(stderr).toString(),aguardouTecla});
    });
    child.stdin.on('error',()=>{});
  });
  return {...result,destino,resultPath,browserPath,nodePathResult,primeiroRuntime,porta,requisicoes,servidor};
}

async function confirmarOcupanteVivo(result) {
  assert.equal(result.servidor.listening,true,'O iniciador não deve encerrar quem ocupa a porta.');
  const resposta=await new Promise((resolve,reject)=>{
    const req=http.get(`http://127.0.0.1:${result.porta}/ainda-ativo`,res=>{
      const chunks=[];
      res.on('data',chunk=>chunks.push(chunk));
      res.on('end',()=>resolve(Buffer.concat(chunks).toString()));
    });
    req.on('error',reject);
    req.setTimeout(2000,()=>req.destroy(new Error('O ocupante sintético deixou de responder.')));
  });
  assert.equal(resposta,'ocupante sintetico ativo');
}

async function consultarVisao(porta) {
  return new Promise((resolve,reject)=>{
    const req=http.get(`http://127.0.0.1:${porta}/api/visao`,res=>{
      const chunks=[];
      res.on('data',chunk=>chunks.push(chunk));
      res.on('end',()=>{
        try { resolve({status:res.statusCode,visao:JSON.parse(Buffer.concat(chunks).toString())}); }
        catch (error) { reject(error); }
      });
    });
    req.on('error',reject);
    req.setTimeout(2000,()=>req.destroy(new Error('GET sintético da visão excedeu dois segundos.')));
  });
}

test('L03 duplo clique executa o PowerShell do projeto com espaços e abre a URL retornada',somenteWindows,async t=>{
  const result=await executar(t);
  assert.equal(result.code,0,result.stdout+'\n'+result.stderr);
  assert.equal(fs.readFileSync(result.resultPath,'utf8'),result.destino);
  assert.equal(fs.readFileSync(result.browserPath,'utf8'),'http://127.0.0.1:4318');
});

test('L03 vários Node no PATH selecionam um único executável para o iniciador',somenteWindows,async t=>{
  const result=await executar(t,{variosRuntimes:true});
  assert.equal(result.code,0,result.stdout+'\n'+result.stderr);
  assert.equal(fs.readFileSync(result.nodePathResult,'utf8'),result.primeiroRuntime);
});

test('L03 powershell.exe alheio no diretório atual não substitui o PowerShell do Windows',somenteWindows,async t=>{
  const result=await executar(t,{powershellAlheio:true,esperarTecla:true});
  assert.equal(result.code,0,result.stdout+'\n'+result.stderr);
  assert.equal(fs.readFileSync(result.resultPath,'utf8'),result.destino);
  assert.equal(fs.readFileSync(result.browserPath,'utf8'),'http://127.0.0.1:4318');
});

test('L03 falha do iniciador fica visível e não abre navegador nem retorna sucesso',somenteWindows,async t=>{
  const result=await executar(t,{falha:true});
  assert.notEqual(result.code,0);
  assert.equal(fs.readFileSync(result.resultPath,'utf8'),result.destino);
  assert.equal(fs.existsSync(result.browserPath),false);
  assert.equal(result.aguardouTecla,true,'A falha deve continuar visível até receber uma tecla.');
  assert.match(result.stdout+'\n'+result.stderr,/Nao foi possivel abrir o CRM/);
  assert.ok((result.stdout+'\n'+result.stderr).includes(String(result.porta)));
});

test('L03 CRM já na porta abre o navegador e termina sem iniciar outro servidor nem esperar tecla',somenteWindows,async t=>{
  const result=await executar(t,{ocupante:{body:'{"schemaVersion":1,"dados":"sinteticos"}'}});
  assert.equal(result.code,0,result.stdout+'\n'+result.stderr);
  assert.equal(fs.existsSync(result.resultPath),false,'O CRM reconhecido deve dispensar o iniciador PowerShell.');
  assert.equal(fs.readFileSync(result.browserPath,'utf8'),`http://127.0.0.1:${result.porta}`);
  assert.deepEqual(result.requisicoes,[{method:'GET',url:'/api/visao'}]);
  await confirmarOcupanteVivo(result);
});

test('L03 reabre o servidor real do CRM sem captura e com captura sintética incluindo Meses',somenteWindows,async t=>{
  const {criarServidor}=require('../src/servidor.cjs');
  const {promoverCaptura}=require('../src/snapshot.cjs');
  const {capturaMeses,mapaQuadroValido}=require('./fixtures.cjs');
  for (const comMeses of [false,true]) await t.test(comMeses?'captura com Meses':'sem captura',async st=>{
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm abrir servidor real '));
    const dataDir=path.join(root,'dados sinteticos');
    const quadroConfigPath=path.join(root,'mapa sintetico.json');
    fs.mkdirSync(dataDir);
    fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
    if (comMeses) assert.equal(promoverCaptura(capturaMeses(),dataDir).resultado,'completa');
    let atualizacoes=0;
    const servidor=criarServidor({dataDir,port:0,quadroConfigPath,atualizar:()=>{atualizacoes++;throw new Error('POST inesperado no teste.');}});
    try {
      const result=await executar(st,{servidorReal:servidor});
      assert.equal(result.code,0,result.stdout+'\n'+result.stderr);
      assert.equal(fs.existsSync(result.resultPath),false,'A reabertura do servidor real deve dispensar o iniciador.');
      assert.equal(fs.existsSync(result.nodePathResult),false,'A reabertura deve dispensar também a seleção de Node.');
      assert.equal(fs.readFileSync(result.browserPath,'utf8'),`http://127.0.0.1:${result.porta}`);
      assert.deepEqual(result.requisicoes,[{method:'GET',url:'/api/visao'}]);
      assert.equal(servidor.listening,true,'O servidor real existente deve continuar ativo.');
      const {status,visao}=await consultarVisao(result.porta);
      assert.equal(status,200,'O GET passa pelas guardas reais de Host e retorna HTTP 200.');
      assert.equal(visao.schemaVersion,1,'O objeto real que o PowerShell decodificou mantém schemaVersion numérico 1.');
      if (comMeses) {
        const meses=visao.planilha.at(-1);
        assert.equal(meses.nome,'Meses');
        assert.equal(meses.quantidadeLinhas,1);
      } else {
        assert.equal(visao.estado,'sem_captura');
        assert.equal(visao.captura,null);
      }
      assert.equal(atualizacoes,0,'Nenhuma reabertura pode coletar dados ou executar POST.');
    } finally {
      servidor.closeAllConnections();
      if (servidor.listening) await new Promise(resolve=>servidor.close(resolve));
      assert.equal(path.dirname(root),os.tmpdir());
      assert.ok(path.basename(root).startsWith('crm abrir servidor real '));
      fs.rmSync(root,{recursive:true,force:true});
    }
  });
});

test('L03 ocupante alheio falha com mensagem fixa e pausa sem iniciar servidor nem encerrar ocupante',somenteWindows,async t=>{
  for (const [nome,ocupante] of [
    ['schemaVersion textual',{body:'{"schemaVersion":"1"}'}],
    ['outra versão',{body:'{"schemaVersion":2}'}],
    ['array em vez de objeto',{body:'[{"schemaVersion":1}]'}],
    ['JSON inválido',{body:'resposta sintetica sem JSON'}],
    ['erro HTTP com JSON parecido',{status:503,body:'{"schemaVersion":1}'}],
    ['redirecionamento',{status:302,headers:{Location:'/destino'},body:'{"schemaVersion":1}'}],
    ['timeout',{silencioso:true}],
  ]) await t.test(nome,async st=>{
    const result=await executar(st,{ocupante,esperarTecla:true});
    assert.equal(result.code,1,result.stdout+'\n'+result.stderr);
    assert.equal(result.aguardouTecla,true,'A falha deve esperar uma tecla antes de fechar.');
    assert.equal(fs.existsSync(result.resultPath),false,'O ocupante alheio deve dispensar qualquer tentativa de iniciar outro servidor.');
    assert.equal(fs.existsSync(result.browserPath),false,'Resposta alheia não deve abrir o navegador.');
    assert.ok((result.stdout+'\n'+result.stderr).includes(`Nao foi possivel abrir o CRM. Confira se o Node esta configurado e se a porta ${result.porta} esta livre.`));
    assert.deepEqual(result.requisicoes,[{method:'GET',url:'/api/visao'}]);
    await confirmarOcupanteVivo(result);
  });
});
