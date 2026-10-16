const {test}=require('node:test');
const assert=require('node:assert/strict');
const layout=require('../src/web/layout-model.js');
function peca() {
 const video={arquivo_id:'video-final',producao_id:'p-video',versao:1,tipo:'video',id_drive:'drive-video',mime_type:'video/mp4'};
 const capa={arquivo_id:'capa-final',producao_id:'p-video',versao:1,tipo:'imagem',papel:'capa_video',id_drive:'drive-capa',origens_json:JSON.stringify({video_arquivo_id:'video-final'})};
 return {producao_id:'p-video',versao:1,formato:'Reels',id_drive_video_final:'drive-video',detalhes:{paginas:[],cenas:[],arquivos:[video,capa]}};
}
test('V007 layout seleciona vídeo final e capa registrados sem mutar a peça',()=>{
 const p=peca(),antes=JSON.stringify(p);
 assert.equal(layout.videoDaPeca(p).arquivo_id,'video-final');
 assert.equal(layout.capaVideo(p).arquivo_id,'capa-final');
 assert.deepEqual(layout.imagensDaPeca(p),[{arquivo:p.detalhes.arquivos[1],contexto:'Capa do vídeo'}]);
 assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:p.detalhes.arquivos[0],contexto:'Vídeo final',tipo:'video',capa:p.detalhes.arquivos[1]}]);
 assert.equal(JSON.stringify(p),antes);
});
for(const alterar of [
 p=>{p.id_drive_video_final='outro';},
 p=>{p.detalhes.arquivos[0].producao_id='outra';},
 p=>{p.detalhes.arquivos[0].versao=2;},
 p=>{p.detalhes.arquivos[0].tipo='imagem';},
 p=>{p.detalhes.arquivos[0].mime_type='text/html';},
 p=>{p.versao='1';},
 p=>{p.detalhes.arquivos.push({...p.detalhes.arquivos[0],arquivo_id:'duplicado'});}
])test('V007 layout recusa vídeo com vínculo/versão/tipo ambíguo '+alterar.toString(),()=>{
 const p=peca();alterar(p);
 assert.equal(layout.videoDaPeca(p),null);assert.equal(layout.capaVideo(p),null);
 assert.equal(layout.posicoesInstagram(p)[0].arquivo,null);
});
for(const alterar of [
 p=>{p.detalhes.arquivos[1].producao_id='outra';},
 p=>{p.detalhes.arquivos[1].versao=2;},
 p=>{p.detalhes.arquivos[1].papel='arte';},
 p=>{p.detalhes.arquivos[1].origens_json='{}';},
 p=>{p.detalhes.arquivos[1].origens_json='{';},
 p=>{p.detalhes.arquivos[1].origens_json=JSON.stringify({video_arquivo_id:'outro'});},
 p=>{p.detalhes.arquivos.push({...p.detalhes.arquivos[1],arquivo_id:'capa-duplicada'});}
])test('V007 layout recusa capa alheia ou ambígua '+alterar.toString(),()=>{
 const p=peca();alterar(p);
 assert.equal(layout.capaVideo(p),null);assert.equal(layout.videoDaPeca(p).arquivo_id,'video-final');
 assert.deepEqual(layout.imagensDaPeca(p),[]);
});
test('V007 layout conserva vídeo sem capa e usa estado neutro para capa ausente',()=>{
 const p=peca();p.detalhes.arquivos.pop();
 assert.equal(layout.capaVideo(p),null);assert.equal(layout.posicoesInstagram(p)[0].tipo,'video');
 assert.equal(layout.posicoesInstagram(p)[0].capa,null);
});
test('V007 layout conserva galeria anterior quando não há final de vídeo declarado',()=>{
 const p=peca();delete p.id_drive_video_final;p.formato='Imagem';p.detalhes.arquivos=[p.detalhes.arquivos[1]];
 assert.equal(layout.videoDaPeca(p),null);assert.equal(layout.imagensDaPeca(p).length,1);
 assert.equal(layout.posicoesInstagram(p)[0].contexto,'Imagem 1');
});
