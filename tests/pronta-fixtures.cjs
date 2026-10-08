// Dados exclusivamente sintéticos; nunca usa o diretório operacional.
const {capturaDetalhada,mudarCelula,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
function campoOpcional(raw,nome,campo) {
  const table=raw.tables[nome];
  table.values[0].push(campo);
  for(const row of table.values.slice(1))row.push('');
  const n=table.values[0].length;
  for(const meta of [raw.metadataBefore,raw.metadataAfter])meta[nome].columnCount=n;
  table.range='A1:'+String.fromCharCode(64+n)+'20';
}
function capturaPronta() {
  const raw=capturaDetalhada();
  campoOpcional(raw,'Produções','pacote_versao');campoOpcional(raw,'Produções','hashtags');
  campoOpcional(raw,'Arquivos','extensao');
  for(const row of [3,4]) {
    mudarCelula(raw,'Produções',row,'estado_liberacao','liberado');
    mudarCelula(raw,'Produções',row,'status','pronto');
    mudarCelula(raw,'Produções',row,'pacote_versao',3);
    mudarCelula(raw,'Produções',row,'legenda','Legenda sintética para publicação manual.\nUma segunda linha de exemplo.');
    mudarCelula(raw,'Produções',row,'hashtags','#ExemploSintetico #PublicacaoManual');
    adicionarRegistro(raw,'Arquivos',{arquivo_id:'pacote-sintetico-'+row,producao_id:'peca-'+row,semana_id:'semana-01',
      tipo:'pacote',extensao:'zip',versao:3,url:'https://drive.google.com/file/d/pacote-sintetico-'+row+'/view'});
  }
  mudarCelula(raw,'Produções',1,'estado_liberacao','liberado');
  mudarCelula(raw,'Produções',1,'publicado_em','2026-10-01T12:00:00Z');
  mudarCelula(raw,'Produções',1,'status','publicado');
  raw.tables.Revisoes.values=raw.tables.Revisoes.values.filter((row,i)=>i===0 || !['revisao-atual','revisao-incerta'].includes(row[0]));
  return recalcularHashes(raw);
}
module.exports={capturaPronta,campoOpcional};
