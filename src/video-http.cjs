function idVideo(url) {
  if(!url.startsWith('/api/video/')||/[?#]/.test(url))return null;
  try {
    const id=decodeURIComponent(url.slice('/api/video/'.length));
    return !id||id==='.'||id==='..'||/[\\/:\u0000-\u001f\u007f]/.test(id)?null:id;
  }catch {return null;}
}
function faixaVideo(range,tamanho) {
  const match=/^bytes=(\d*)-(\d*)$/.exec(range);
  if(!match||!match[1]&&!match[2])return null;
  const inicio=match[1]===''?null:Number(match[1]),fim=match[2]===''?null:Number(match[2]);
  if([inicio,fim].some(n=>n!==null&&!Number.isSafeInteger(n)))return null;
  if(inicio===null)return fim>0?{inicio:Math.max(0,tamanho-fim),fim:tamanho-1}:null;
  if(inicio>=tamanho||fim!==null&&fim<inicio)return null;
  return {inicio,fim:fim===null?tamanho-1:Math.min(fim,tamanho-1)};
}
async function getVideo(req,res,{permitida,servico,enviar}) {
  const headers={'Cross-Origin-Resource-Policy':'same-origin'},mensagem='Prévia indisponível';
  const erro=(status,extras={})=>enviar(req,res,status,'text/plain; charset=utf-8',mensagem,
    {...headers,'Content-Length':Buffer.byteLength(mensagem),...extras});
  if(!permitida()||['cross-site','same-site'].includes(req.headers['sec-fetch-site']))return erro(403);
  if(!['GET','HEAD'].includes(req.method))return erro(405,{Allow:'GET, HEAD'});
  const id=idVideo(req.url);if(id===null)return erro(400);
  try {
    const {bytes}=await servico().obterVideo(id),total=bytes.length;
    const comuns={...headers,'Accept-Ranges':'bytes','Content-Length':total};
    if(req.method==='HEAD'||req.headers.range===undefined)return enviar(req,res,200,'video/mp4',bytes,comuns);
    const faixa=faixaVideo(req.headers.range,total);
    if(!faixa)return erro(416,{'Accept-Ranges':'bytes','Content-Range':'bytes */'+total});
    const body=bytes.subarray(faixa.inicio,faixa.fim+1);
    return enviar(req,res,206,'video/mp4',body,{...comuns,'Content-Length':body.length,'Content-Range':`bytes ${faixa.inicio}-${faixa.fim}/${total}`});
  }catch(error) {return erro([404,422,503].includes(error?.status)?error.status:503);}
}
module.exports={getVideo};
