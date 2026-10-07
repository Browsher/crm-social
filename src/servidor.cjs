const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {lerEstado,atualizarCaptura,MOTIVOS_TEMPO}=require('./snapshot.cjs');
const {criarClienteGoogle,MOTIVOS}=require('./google.cjs');
const {coletarCaptura}=require('./coleta.cjs');
const {projetarVisao}=require('./projecao.cjs');
const {carregarMapaQuadro}=require('./quadro-config.cjs');
const STATIC=Object.freeze({'/':['index.html','text/html; charset=utf-8'],'/app.js':['app.js','text/javascript; charset=utf-8'],'/theme.js':['theme.js','text/javascript; charset=utf-8'],'/styles.css':['styles.css','text/css; charset=utf-8']});
function enviar(req,res,status,type,body,headers={}) {
  res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
    'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",...headers});
  res.end(req.method==='HEAD'?'':body);
}
function permitida(req,port) {
  const host='127.0.0.1:'+port;
  return req.headers.host===host && (!req.headers.origin || req.headers.origin==='http://'+host);
}
function corpoVazio(req){
  return new Promise(resolve=>{
    const chunks=[];let size=0;
    req.on('data',chunk=>{size+=chunk.length;if(size<=1024)chunks.push(chunk);});
    req.on('error',()=>resolve(400));
    req.on('end',()=>{
      if(size>1024)return resolve(413);
      try{const body=JSON.parse(Buffer.concat(chunks).toString('utf8'));resolve(body&&typeof body==='object'&&!Array.isArray(body)&&Object.keys(body).length===0?0:400);}
      catch{resolve(400);}
    });
  });
}
function respostaAtualizacao(result){
  const categoria=Object.hasOwn(MOTIVOS,result.categoria)?result.categoria:null;
  const ok=['completa','sem_alteracao'].includes(result.resultado);
  const temporal=categoria==='dados'&&Object.values(MOTIVOS_TEMPO).includes(result.motivoResumo)?result.motivoResumo:null;
  return {status:ok?200:categoria==='dados'?422:503,body:{resultado:ok?result.resultado:'falhou',mensagem:ok?'Dados atualizados':temporal??MOTIVOS[categoria]??'Atualização indisponível; última captura não foi alterada',categoria:ok?null:categoria,registrada:!!categoria||result.resultado==='completa',avisos:result.avisos?.length?['falha ao liberar a trava; confira o estado local']:[]}};
}
async function postAtualizar(req,res,atualizar){
  if(req.url!=='/api/atualizar')return enviar(req,res,400,'text/plain; charset=utf-8','Requisição inválida');
  if(!req.headers.origin)return enviar(req,res,403,'text/plain; charset=utf-8','Origem local obrigatória');
  if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']??''))return enviar(req,res,415,'text/plain; charset=utf-8','JSON obrigatório');
  const invalid=await corpoVazio(req);
  if(invalid)return enviar(req,res,invalid,'text/plain; charset=utf-8','Requisição inválida');
  try {
    const response=respostaAtualizacao(await atualizar());
    return enviar(req,res,response.status,'application/json; charset=utf-8',JSON.stringify(response.body));
  }catch(error){
    const locked=error?.message==='persistência: importação em andamento; confira a instância antes de tentar novamente';
    return enviar(req,res,locked?409:503,'application/json; charset=utf-8',JSON.stringify({resultado:'falhou',mensagem:locked?'Importação em andamento; tente novamente':'Atualização indisponível; última captura não foi alterada',categoria:null,registrada:false,avisos:error?.avisos?.length?['falha ao liberar a trava; confira o estado local']:[]}));
  }
}
function criarServidor({dataDir=path.resolve(__dirname,'../data'),port=4318,webDir=path.join(__dirname,'web'),quadroConfigPath=path.resolve(__dirname,'../config/quadro-etapas.json'),atualizar=()=>atualizarCaptura(dataDir,()=>coletarCaptura(criarClienteGoogle()))}={}) {
  const mapa=carregarMapaQuadro(quadroConfigPath);
  const server=http.createServer((req,res)=>{
    if (!permitida(req,server.address()?.port ?? port)) return enviar(req,res,403,'text/plain; charset=utf-8','Origem local obrigatória');
    const route=req.url.split('?')[0];
    if(route==='/api/atualizar'){
      if(req.method!=='POST')return enviar(req,res,405,'text/plain; charset=utf-8','Método não permitido',{Allow:'POST'});
      return postAtualizar(req,res,atualizar);
    }
    if (!['GET','HEAD'].includes(req.method)) return enviar(req,res,405,'text/plain; charset=utf-8','Método não permitido',{Allow:'GET, HEAD'});
    if (route==='/api/visao') {
      try {
        const view=projetarVisao(lerEstado(dataDir),new Date().toISOString(),mapa);
        return enviar(req,res,200,'application/json; charset=utf-8',JSON.stringify(view));
      } catch { return enviar(req,res,503,'application/json; charset=utf-8',JSON.stringify({erro:'Estado local indisponível; última captura não foi alterada'})); }
    }
    if (!Object.hasOwn(STATIC,route)) return enviar(req,res,404,'text/plain; charset=utf-8','Não encontrado');
    const [filename,type]=STATIC[route];
    try { return enviar(req,res,200,type,fs.readFileSync(path.join(webDir,filename))); }
    catch { return enviar(req,res,404,'text/plain; charset=utf-8','Não encontrado'); }
  });
  return server;
}
function argumentos(argv) {
  let dataDir=path.resolve(__dirname,'../data'), port=4318;
  for (let i=0;i<argv.length;i+=2) {
    const value=argv[i+1];
    if (!value) throw new Error('Argumento exige valor');
    if (argv[i]==='--data-dir') dataDir=path.resolve(value);
    else if (argv[i]==='--port' && /^\d+$/.test(value)) port=Number(value);
    else throw new Error('Argumento inválido');
  }
  if (!Number.isInteger(port) || port<0 || port>65535) throw new Error('Porta inválida');
  return {dataDir,port};
}
function main(argv) {
  try {
    const options=argumentos(argv), server=criarServidor(options);
    server.on('error',()=>{process.stderr.write('Não foi possível iniciar o servidor local; confira a porta.\n');process.exitCode=1;});
    server.listen(options.port,'127.0.0.1',()=>process.stdout.write('CRM local: http://127.0.0.1:'+server.address().port+'\n'));
  } catch { process.stderr.write('Configuração local inválida; confira o mapa do quadro e os argumentos.\n');process.exitCode=1; }
}
if (require.main===module) main(process.argv.slice(2));
module.exports={criarServidor};
