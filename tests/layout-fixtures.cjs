// Cenários exclusivamente sintéticos; capturas e credenciais são usadas somente em TEMP.
const {capturaPrevias,imagemPorArquivo,imagemPng,sha256,credencialSintetica,transporteFalso,respostaStream,mudarPorId}=require('./previas-fixtures.cjs');
const {capturaMeses,adicionarRegistro,recalcularHashes,redefinirHorario}=require('./fixtures.cjs');
const {adicionarPautas}=require('./pautas-fixtures.cjs');
const {campoOpcional}=require('./pronta-fixtures.cjs');
const AGORA='2026-10-08T14:00:00.000Z';
const HOJE='2026-10-08';

function alterar(raw,nome,id,campos) {
  for(const [campo,value] of Object.entries(campos))mudarPorId(raw,nome,id,campo,value);
}
function imagemDaProducao(raw,id,semana,versao=1) {
  const arquivo='imagem-'+id;
  adicionarRegistro(raw,'Arquivos',{arquivo_id:arquivo,producao_id:id,semana_id:semana,tipo:'imagem',versao,
    id_drive:'drive-sintetico-'+arquivo,sha256:sha256(imagemPorArquivo(arquivo)),
    url:'https://drive.google.com/file/d/'+arquivo+'-sintetica/view'});
}
function mesesEPautas(raw) {
  const mensal=capturaMeses([['2026-10','ntv','Apresentar a coleção sintética de outubro','Conexões para o cotidiano\nIdeias para a próxima semana']]);
  for(const campo of ['tables','metadataBefore','metadataAfter'])raw[campo].Meses=mensal[campo].Meses;
  campoOpcional(raw,'Semanas','pauta_id');
  const pautas=[
    ['pauta-outubro-1',1,'2026-10-05','Oferta sintética de outubro','oferta'],
    ['pauta-outubro-2',2,'2026-10-12','Conexões da próxima semana','cabo'],
    ['pauta-outubro-3',3,'2026-10-19','Ideias da semana futura','comparativo']
  ];
  adicionarPautas(raw,pautas.map(([id,semana,inicio,tema,modelo])=>({pauta_id:id,marca_id:'ntv',mes:'2026-10',semana,
    inicio_semana:inicio,tema,modelo_carrossel:modelo,mensagem:'Mensagem fictícia para teste',oferta:'Oferta sintética',
    origem:'autor',status:'planejada',observacao:'Somente teste de apresentação'})));
  for(const [id,pauta] of [['semana-01',1],['semana-proxima',2],['semana-futura',3]])mudarPorId(raw,'Semanas',id,'pauta_id','pauta-outubro-'+pauta);
}
function semanasEProducoes(raw) {
  alterar(raw,'Semanas','semana-01',{inicio_semana:'2026-10-05',tema:'Oferta sintética de outubro'});
  for(const [id,inicio,tema] of [
    ['semana-proxima','2026-10-12','Conexões da próxima semana'],
    ['semana-futura','2026-10-19','Ideias da semana futura'],
    ['semana-passada','2026-09-28','Coleção da semana passada']
  ])adicionarRegistro(raw,'Semanas',{semana_id:id,marca_id:'ntv',inicio_semana:inicio,tema});
  alterar(raw,'Produções','peca-1',{titulo:'Oferta sintética de outubro',data_prevista:'2026-10-08',publicado_em:'',status:'pronto'});
  alterar(raw,'Produções','peca-2',{titulo:'Imagem para corrigir',data_prevista:'2026-10-08',versao:2,etapa_producao:'arte_aprovada'});
  alterar(raw,'Produções','peca-3',{titulo:'Carrossel de cinco páginas',data_prevista:'2026-10-09'});
  alterar(raw,'Produções','peca-4',{titulo:'Reels em produção',data_prevista:'2026-10-11',estado_liberacao:'',status:'em_planejamento'});
  const producoes=raw.tables['Produções'];
  producoes.values=producoes.values.filter((row,i)=>i===0||row[0]!=='peca-5');
  for(const [i,dia] of [12,14,16,18].entries())adicionarRegistro(raw,'Produções',{
    producao_id:'proxima-'+(i+1),marca_id:'ntv',semana_id:'semana-proxima',slot:i===3?'reels':'imagem_a',versao:1,
    titulo:'Peça da próxima semana '+(i+1),data_prevista:'2026-10-'+dia,etapa_producao:i===3?'etapa-desconhecida':'arte_aprovada',
    estado_liberacao:i<2?'liberado':'',publicado_em:i===1?'2026-10-07T12:00:00Z':'',legenda:'Legenda sintética da próxima semana',
    status:i===3?'publicado':'em_planejamento'
  });
  for(const [id,semana,data,titulo,publicacao] of [
    ['peca-publicada','semana-passada','2026-10-02','Imagem publicada da semana passada','2026-10-02T12:00:00Z'],
    ['peca-orfa','','2026-10-10','Imagem sem semana',''],
    ['peca-sem-data','','','Imagem sem data','']
  ])adicionarRegistro(raw,'Produções',{producao_id:id,marca_id:'ntv',semana_id:semana,slot:'imagem_a',versao:1,
    titulo,data_prevista:data,etapa_producao:'arte_aprovada',publicado_em:publicacao,legenda:'Texto editorial sintético'});
}
function revisoesEMidias(raw) {
  const arquivos=raw.tables.Arquivos,producao=arquivos.values[0].indexOf('producao_id');
  arquivos.values=arquivos.values.filter((row,i)=>i===0||row[producao]!=='peca-4');
  alterar(raw,'Cenas','cena-v3-1',{arquivo_imagem_inicio_id:'',arquivo_imagem_final_id:'',arquivo_video_id:''});
  imagemDaProducao(raw,'peca-1','semana-01');
  imagemDaProducao(raw,'peca-publicada','semana-passada');
  imagemDaProducao(raw,'peca-orfa','');
  for(const n of [1,2])imagemDaProducao(raw,'proxima-'+n,'semana-proxima');
  for(const [id,peca,versao,estado] of [
    ['correcao-vigente','peca-2',2,'aberta'],['correcao-historica','peca-2',1,'aberta'],
    ['correcao-resolvida','peca-2',2,'resolvida'],['correcao-ambigua','peca-2',2,'aberta'],
    ['correcao-carrossel-anterior','peca-3',3,'aberta']
  ])adicionarRegistro(raw,'Revisoes',{revisao_id:id,producao_id:peca,versao,estado_tratamento:estado,
    decisao:'revisar',motivo:'Conferir texto sintético',responsavel_correcao:'Equipe sintética'});
  mudarPorId(raw,'Revisoes','correcao-ambigua','pagina_id','pagina-nao-identificada');
}
function capturaLayout() {
  const raw=capturaPrevias();raw.capturaId='captura-layout-v3-sintetica';
  semanasEProducoes(raw);mesesEPautas(raw);revisoesEMidias(raw);
  redefinirHorario(raw,'2026-10-08T13:45:00.000Z','2026-10-08T13:50:00.000Z');
  return recalcularHashes(raw);
}
module.exports={capturaLayout,AGORA,HOJE,mudarPorId,adicionarRegistro,recalcularHashes,redefinirHorario,campoOpcional,
  imagemPorArquivo,imagemPng,sha256,credencialSintetica,transporteFalso,respostaStream};
