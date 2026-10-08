// Cenários exclusivamente sintéticos para versões de texto e mídias reaproveitadas.
const {capturaPronta}=require('./pronta-fixtures.cjs');
const {mudarCelula,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
function limparRegistros(raw,nome) {raw.tables[nome].values=raw.tables[nome].values.slice(0,1);}
function mudarPorId(raw,nome,id,campo,value) {
  const table=raw.tables[nome],row=table.values.findIndex((r,i)=>i>0 && r[0]===id);
  if(row<1)throw new Error('Registro sintético não encontrado');
  return mudarCelula(raw,nome,row,campo,value);
}
function capturaVersoes() {
  const raw=capturaPronta();
  for(const nome of ['Páginas','Cenas','Revisoes'])limparRegistros(raw,nome);
  const files=raw.tables.Arquivos,header=files.values[0],tipo=header.indexOf('tipo');
  files.values=files.values.filter((r,i)=>i===0 || ['documento','pacote'].includes(r[tipo]));
  mudarCelula(raw,'Produções',3,'titulo','Carrossel pronto · imagens reaproveitadas');
  mudarCelula(raw,'Produções',3,'versao',8);
  mudarCelula(raw,'Produções',4,'versao',9);
  for(const [i,version] of [2,1,1,2,3].entries()) {
    const n=i+1,pagina='pagina-v3-'+n,arquivo='imagem-pagina-'+n;
    adicionarRegistro(raw,'Páginas',{pagina_id:pagina,producao_id:'peca-3',versao:3,indice:n,
      funcao:n===1?'abertura':'conteúdo',titulo:'Página sintética '+n,corpo:'Texto v3 com imagem aprovada reaproveitada.',arquivo_imagem_id:arquivo});
    adicionarRegistro(raw,'Arquivos',{arquivo_id:arquivo,producao_id:'peca-3',semana_id:'semana-01',pagina_id:pagina,
      tipo:'imagem',papel:'página',versao:version,url:'https://drive.google.com/file/d/imagem-sintetica-'+n+'/view'});
  }
  adicionarRegistro(raw,'Cenas',{cena_id:'cena-v3-1',producao_id:'peca-4',versao:3,indice:1,
    texto:'Cena sintética com três mídias reaproveitadas',inicio_segundos:0,duracao_segundos:5,
    arquivo_imagem_inicio_id:'cena-inicio',arquivo_imagem_final_id:'cena-final',arquivo_video_id:'cena-video'});
  for(const [arquivo,version,tipo] of [['cena-inicio',1,'imagem'],['cena-final',2,'imagem'],['cena-video',2,'vídeo']]) {
    adicionarRegistro(raw,'Arquivos',{arquivo_id:arquivo,producao_id:'peca-4',semana_id:'semana-01',cena_id:'cena-v3-1',
      tipo,papel:arquivo,versao:version,url:'https://drive.google.com/file/d/'+arquivo+'-sintetico/view'});
  }
  return recalcularHashes(raw);
}
module.exports={capturaVersoes,mudarPorId};
