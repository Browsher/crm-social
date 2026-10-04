const {test}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');

const repo=path.resolve(__dirname,'..');
const iniciador=path.join(repo,'Iniciar CRM.ps1');
const servidor=path.join(repo,'src','servidor.cjs');
const somenteWindows={
  skip:process.platform!=='win32' && 'Iniciador exige Windows PowerShell 5.1 real; plataforma diferente de win32.',
  timeout:60000,
};

// Os comandos PowerShell usam apenas literais ASCII; caminhos são argumentos citados.
function literalPS(value) {
  return "'"+String(value).replaceAll("'","''")+"'";
}
function powershell(command,env=process.env) {
  const systemRoot=env.SystemRoot || env.SYSTEMROOT || env.WINDIR;
  assert.ok(systemRoot,'Windows PowerShell 5.1 precisa de SystemRoot configurado.');
  const executable=path.join(systemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe');
  const childEnv={...env};
  delete childEnv.NODE_OPTIONS;
  delete childEnv.NODE_V8_COVERAGE;
  const prefix="[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue'; ";
  return new Promise((resolve,reject)=>{
    const child=spawn(executable,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-Command',prefix+command],{
      cwd:repo,env:childEnv,windowsHide:true,timeout:25000,stdio:['ignore','pipe','pipe'],
    });
    let stdout='',stderr='';
    child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{stdout+=chunk;});
    child.stderr.on('data',chunk=>{stderr+=chunk;});
    child.once('error',reject);
    // Um filho destacado pode herdar pipes; close aguarda esse filho, não o PS.
    child.once('exit',(code,signal)=>setImmediate(()=>{
      child.stdout.destroy();child.stderr.destroy();
      resolve({code,signal,stdout,stderr});
    }));
  });
}
let versaoPS;
async function exigirIniciador() {
  assert.ok(fs.existsSync(iniciador),'O iniciador real Iniciar CRM.ps1 deve existir para iniciar o CRM.');
  versaoPS ??=powershell('$PSVersionTable.PSVersion.ToString(2)');
  const result=await versaoPS;
  assert.equal(result.code,0,'Windows PowerShell 5.1 real deve estar disponível. '+result.stderr);
  assert.equal(result.stdout.trim(),'5.1','O iniciador deve ser exercitado no Windows PowerShell 5.1.');
}
function mesmaLocalizacao(a,b) {
  return path.resolve(a).toLowerCase()===path.resolve(b).toLowerCase();
}
async function inspecionarProcesso(processId) {
  assert.ok(Number.isSafeInteger(processId) && processId>0,'PID retornado deve ser inteiro positivo.');
  const command=[
    '$crmProcess = Get-CimInstance -ClassName Win32_Process -Filter '+literalPS('ProcessId = '+processId),
    'if ($null -eq $crmProcess) { exit 3 }',
    '$crmWindow = Get-Process -Id '+processId+' -ErrorAction Stop',
    "[pscustomobject]@{ processId = [int]$crmProcess.ProcessId; executablePath = $crmProcess.ExecutablePath; commandLine = $crmProcess.CommandLine; creationDate = $crmProcess.CreationDate.ToUniversalTime().ToString('o'); mainWindowHandle = [long]$crmWindow.MainWindowHandle } | ConvertTo-Json -Compress",
  ].join('; ');
  const result=await powershell(command);
  if (result.code===3) return null;
  assert.equal(result.code,0,'Deve ser possível inspecionar somente o PID retornado. '+result.stderr);
  return JSON.parse(result.stdout.trim());
}
function conferirProprietario(info,processId,dataDir) {
  assert.ok(info,'O processo devolvido pelo iniciador deve estar vivo.');
  assert.equal(info.processId,processId);
  assert.equal(typeof info.executablePath,'string');
  assert.ok(mesmaLocalizacao(info.executablePath,process.execPath),'Cleanup exige o executável Node selecionado.');
  assert.equal(typeof info.commandLine,'string');
  assert.ok(info.commandLine.toLowerCase().includes(servidor.toLowerCase()),'Cleanup exige o entrypoint real do CRM no comando.');
  assert.ok(info.commandLine.toLowerCase().includes(dataDir.toLowerCase()),'Cleanup exige o TEMP exclusivo deste teste no comando.');
}
async function encerrarProprioProcesso(processId,dataDir) {
  const info=await inspecionarProcesso(processId);
  if (!info) return;
  conferirProprietario(info,processId,dataDir);
  // Reconfere identidade/instante no mesmo comando que encerra somente este PID.
  const command=[
    '$crmProcess = Get-CimInstance -ClassName Win32_Process -Filter '+literalPS('ProcessId = '+processId),
    'if ($null -eq $crmProcess) { exit 0 }',
    'if ($crmProcess.ExecutablePath -ine '+literalPS(process.execPath)+") { throw 'Node executable ownership mismatch' }",
    "if ($crmProcess.CommandLine.IndexOf("+literalPS(servidor)+", [StringComparison]::OrdinalIgnoreCase) -lt 0) { throw 'Server command ownership mismatch' }",
    "if ($crmProcess.CommandLine.IndexOf("+literalPS(dataDir)+", [StringComparison]::OrdinalIgnoreCase) -lt 0) { throw 'Temporary directory ownership mismatch' }",
    "if ($crmProcess.CreationDate.ToUniversalTime().ToString('o') -ne "+literalPS(info.creationDate)+") { throw 'Process identity changed' }",
    'Stop-Process -Id '+processId+' -ErrorAction Stop',
  ].join('; ');
  const result=await powershell(command);
  assert.equal(result.code,0,'Encerramento deve atingir somente o PID criado neste teste. '+result.stderr);
  assert.equal(await inspecionarProcesso(processId),null,'O PID criado pelo teste deve estar encerrado.');
}
async function ambiente(t) {
  await exigirIniciador();
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'crm iniciador teste '));
  const dataDir=path.join(root,'dados privados com espacos');
  const processos=[];
  t.after(async()=>{
    try {
      for (const processId of processos) await encerrarProprioProcesso(processId,dataDir);
    } finally {
      assert.ok(mesmaLocalizacao(path.dirname(root),os.tmpdir()),'Remoção deve permanecer no TEMP autorizado.');
      assert.ok(path.basename(root).startsWith('crm iniciador teste '));
      fs.rmSync(root,{recursive:true,force:true});
    }
  });
  async function executar({nodePath=process.execPath,port=0,env=process.env}={}) {
    const nodeArg=nodePath===null ? '' : ' -NodePath '+literalPS(nodePath);
    const command='& '+literalPS(iniciador)+nodeArg+' -DataDir '+literalPS(dataDir)+' -Port '+literalPS(port)+' | ConvertTo-Json -Compress';
    const result=await powershell(command,env);
    let retorno;
    try { retorno=JSON.parse(result.stdout.trim()); } catch { /* Erros úteis podem ser texto. */ }
    if (Number.isSafeInteger(retorno?.processId) && retorno.processId>0) processos.push(retorno.processId);
    return {...result,retorno};
  }
  return {root,dataDir,executar};
}
function request(port,headers={}) {
  return new Promise((resolve,reject)=>{
    const req=http.get({hostname:'127.0.0.1',port,path:'/api/visao',headers},res=>{
      const chunks=[];
      res.on('data',chunk=>chunks.push(chunk));
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks).toString('utf8')}));
    });
    req.setTimeout(5000,()=>req.destroy(new Error('Resposta HTTP local excedeu o prazo.')));
    req.on('error',reject);
  });
}
async function iniciar(env) {
  const result=await env.executar();
  assert.equal(result.code,0,'O iniciador real deve retornar sucesso. '+result.stderr);
  assert.ok(result.retorno && !Array.isArray(result.retorno),'Saída deve ser um objeto serializável pelo ConvertTo-Json.');
  const {processId,url,logDir}=result.retorno;
  const info=await inspecionarProcesso(processId);
  conferirProprietario(info,processId,env.dataDir);
  assert.equal(typeof url,'string');
  const address=new URL(url);
  assert.equal(address.protocol,'http:');
  assert.equal(address.hostname,'127.0.0.1');
  assert.ok(Number(address.port)>0 && Number(address.port)<=65535,'Porta 0 deve retornar a porta efêmera efetivamente escolhida.');
  assert.equal(address.username,'');assert.equal(address.password,'');
  assert.equal(typeof logDir,'string');
  assert.ok(path.isAbsolute(logDir),'Diretório de logs deve ser um caminho absoluto.');
  const relativeLog=path.relative(env.root,logDir);
  assert.ok(!path.isAbsolute(relativeLog) && relativeLog!=='..' && !relativeLog.startsWith('..'+path.sep),'Logs devem ficar no TEMP atribuído ao teste.');
  assert.ok(fs.existsSync(logDir) && fs.statSync(logDir).isDirectory(),'Diretório de logs devolvido deve existir.');
  return {result,processId,address,info};
}

test('L01 iniciador real atende API em loopback e mantém ausência de captura no TEMP com espaços',somenteWindows,async t=>{
  const env=await ambiente(t);
  const {address}=await iniciar(env);
  const response=await request(Number(address.port));
  assert.equal(response.status,200);
  assert.match(response.headers['content-type'],/application\/json/);
  const body=JSON.parse(response.body);
  assert.equal(body.estado,'sem_captura');
  assert.equal(body.selo.texto,'Sem dados');
  assert.deepEqual(body.producoes,[]);
  assert.equal((await request(Number(address.port),{Host:'localhost:'+address.port})).status,403);
});

test('L01 processo devolvido inicia oculto e escuta exclusivamente em 127.0.0.1',somenteWindows,async t=>{
  const env=await ambiente(t);
  const {address,processId,info,result}=await iniciar(env);
  assert.equal(info.mainWindowHandle,0,'O Node iniciado deve ter MainWindowHandle zero.');
  const command='$crmSockets = @(Get-NetTCPConnection -OwningProcess '+processId+' -State Listen -ErrorAction Stop | Select-Object LocalAddress, LocalPort); ConvertTo-Json -InputObject $crmSockets -Compress';
  const sockets=await powershell(command);
  assert.equal(sockets.code,0,'Sockets devem ser consultados somente para o PID criado. '+sockets.stderr);
  const listeners=JSON.parse(sockets.stdout.trim());
  assert.ok(Array.isArray(listeners) && listeners.length>0);
  for (const listener of listeners) assert.equal(listener.LocalAddress,'127.0.0.1','Nenhuma escuta pode expor o CRM à rede.');
  assert.ok(listeners.some(listener=>listener.LocalPort===Number(address.port)));
  const output=result.stdout+'\n'+result.stderr;
  assert.match(output,new RegExp('Stop-Process\\s+-Id\\s+'+processId+'(?:\\D|$)','i'),'Orientação deve identificar o encerramento somente do PID criado.');
});

test('L02 runtime ausente no PATH dá orientação NodePath sem escrever dados',somenteWindows,async t=>{
  const env=await ambiente(t);
  const emptyPath=path.join(env.root,'path sem runtime');
  fs.mkdirSync(emptyPath);
  const childEnv={...process.env};
  for (const key of Object.keys(childEnv)) if (key.toUpperCase()==='PATH' || key.toUpperCase()==='CRM_NODE_PATH') delete childEnv[key];
  childEnv.PATH=emptyPath;
  const result=await env.executar({nodePath:null,env:childEnv});
  assert.notEqual(result.code,0,'Sem runtime a inicialização deve falhar.');
  assert.match(result.stdout+'\n'+result.stderr,/NodePath/i,'Erro deve orientar a selecionar o runtime por -NodePath.');
  assert.equal(fs.existsSync(env.dataDir),false,'Runtime ausente deve ser recusado antes de criar dados ou logs.');
});

test('L02 NodePath inexistente é recusado sem usar outro Node do PATH ou escrever dados',somenteWindows,async t=>{
  const env=await ambiente(t);
  const result=await env.executar({nodePath:path.join(env.root,'runtime inexistente','node.exe')});
  assert.notEqual(result.code,0);
  assert.match(result.stdout+'\n'+result.stderr,/NodePath/i);
  assert.equal(fs.existsSync(env.dataDir),false);
});

test('L02 porta ocupada dá orientação e preserva a resposta real do ocupante',somenteWindows,async t=>{
  const env=await ambiente(t);
  const occupant=http.createServer((req,res)=>res.end('ocupante sintetico preservado'));
  await new Promise((resolve,reject)=>{
    occupant.once('error',reject);
    occupant.listen(0,'127.0.0.1',resolve);
  });
  try {
    const port=occupant.address().port;
    const before=await request(port);
    assert.equal(before.status,200);assert.equal(before.body,'ocupante sintetico preservado');
    const result=await env.executar({port});
    assert.notEqual(result.code,0,'O iniciador deve recusar a porta que pertence ao ocupante.');
    const message=result.stdout+'\n'+result.stderr;
    assert.match(message,/porta|port/i);
    assert.match(message,/ocupad|em uso|outra|escolh|alter|livre|confira/i,'Erro deve orientar como proceder com a porta ocupada.');
    assert.ok(message.includes(String(port)),'Orientação deve identificar a porta em uso.');
    assert.equal(occupant.listening,true);
    const after=await request(port);
    assert.equal(after.status,before.status);assert.equal(after.body,before.body);
  } finally {
    await new Promise(resolve=>occupant.close(resolve));
  }
});

test('L02 portas fora de 0 a 65535 são recusadas com orientação antes de escrever dados',somenteWindows,async t=>{
  const env=await ambiente(t);
  for (const port of [-1,65536]) {
    const result=await env.executar({port});
    assert.notEqual(result.code,0,'Porta fora da faixa deve ser recusada: '+port);
    assert.match(result.stdout+'\n'+result.stderr,/porta|port/i);
    assert.equal(fs.existsSync(env.dataDir),false);
  }
});
