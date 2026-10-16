// Vídeo e capa exclusivamente sintéticos; nenhuma credencial ou mídia operacional.
const fs=require('node:fs');
const path=require('node:path');
const {capturaLayout,mudarPorId,adicionarRegistro,recalcularHashes,imagemPorArquivo,sha256}=require('./layout-fixtures.cjs');
function videoMp4() {return fs.readFileSync(path.join(__dirname,'fixtures/video-sintetico.mp4'));}
function capturaVideo() {
  const raw=capturaLayout();raw.capturaId='captura-video-sintetica';
  for(const [campo,value] of Object.entries({titulo:'Reels sintético pronto',estado_liberacao:'liberado',status:'pronto',
    id_drive_video_final:'drive-sintetico-video-final-sintetico',url_video_final:'https://drive.google.com/file/d/drive-sintetico-video-final-sintetico/view'}))mudarPorId(raw,'Produções','peca-4',campo,value);
  const cenas=raw.tables.Cenas,producao=cenas.values[0].indexOf('producao_id');
  cenas.values=cenas.values.filter((row,i)=>i===0||row[producao]!=='peca-4');
  const producoes=raw.tables['Produções'],headers=producoes.values[0];
  const versao=producoes.values.find((row,i)=>i>0&&row[headers.indexOf('producao_id')]==='peca-4')[headers.indexOf('versao')];
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'video-final-sintetico',producao_id:'peca-4',semana_id:'semana-01',tipo:'video',papel:'video_final',versao,
    id_drive:'drive-sintetico-video-final-sintetico',sha256:sha256(videoMp4())});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'capa-video-sintetica',producao_id:'peca-4',semana_id:'semana-01',tipo:'imagem',papel:'capa_video',versao,
    id_drive:'drive-sintetico-capa-video-sintetica',sha256:sha256(imagemPorArquivo('capa-video-sintetica')),origens_json:JSON.stringify({video_arquivo_id:'video-final-sintetico'})});
  return recalcularHashes(raw);
}
module.exports={capturaVideo,videoMp4};
