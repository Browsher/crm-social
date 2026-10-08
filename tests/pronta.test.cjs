const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {capturaPronta}=require('./pronta-fixtures.cjs');
const {capturaValida,temporario,mudarCelula,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {carregarMapaQuadro}=require('../src/quadro-config.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {projetarVisao}=require('../src/projecao.cjs');
const {coletarCaptura}=require('../src/coleta.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const NOW='2026-10-02T14:00:00Z';
const mapa=()=>carregarMapaQuadro(path.resolve(__dirname,'../config/quadro-etapas.json'));
function visao(t,raw=capturaPronta()) {
  const dir=temporario(t);assert.equal(promoverCaptura(recalcularHashes(raw),dir).resultado,'completa');
  return projetarVisao(lerEstado(dir),NOW,mapa());
}
test('Pronta mapa real mantém publicação acima de liberado e etapas abaixo',t=>{
  const raw=capturaPronta();mudarCelula(raw,'Produções',3,'estado_revisao','revisar');
  mudarCelula(raw,'Produções',3,'etapa_producao','arte_aprovada');
  const view=visao(t,raw);
  assert.equal(view.producoes[0].quadro.coluna,'Publicada');
  assert.equal(view.producoes[2].quadro.coluna,'Pronta');
  assert.equal(view.producoes[3].quadro.coluna,'Pronta');
  for(const estado of ['','liberada','LIBERADO',' liberado ']) {
    mudarCelula(raw,'Produções',3,'estado_liberacao',estado);
    assert.equal(visao(t,raw).producoes[2].quadro.coluna,'Visual');
  }
});
test('Pronta opcionais passam pela triagem, Planilha e persistência sem migrar legado',t=>{
  const raw=capturaPronta(),before=JSON.stringify(raw),view=visao(t,raw),p=view.producoes[2];
  assert.equal(p.pacote_versao,3);assert.equal(p.hashtags,'#ExemploSintetico #PublicacaoManual');
  assert.equal(p.detalhes.arquivos.find(a=>a.tipo==='pacote').extensao,'zip');
  for(const [nome,campos] of [['Produções',['pacote_versao','hashtags']],['Arquivos',['extensao']]]) {
    for(const campo of campos)assert.ok(view.planilha.find(a=>a.nome===nome).cabecalhos.includes(campo));
  }
  assert.equal(JSON.stringify(raw),before);
  const old=visao(t,capturaValida());
  assert.equal(Object.hasOwn(old.producoes[0],'pacote_versao'),false);
  assert.equal(old.planilha.reduce((n,a)=>n+a.cabecalhos.length,0),66);
  mudarCelula(raw,'Produções',3,'hashtags','Antes https://usuario:senha@exemplo.invalid depois');
  assert.equal(visao(t,raw).producoes[2].hashtags,'Antes [conteúdo suprimido] depois');
});
test('Pronta pacote usa versão do pacote e identidade exata, sem ocultar avisos de mídia da API',t=>{
  const view=visao(t),p=view.producoes[2];
  assert.equal(p.versao,2);assert.equal(p.pacote_versao,3);
  assert.equal(p.detalhes.pacotePublicacao.arquivo_id,'pacote-sintetico-3');
  assert.ok(p.quadro.pendencias.some(a=>a.tipo==='midia'));
  assert.ok(p.detalhes.avisos.length>0);
});
for(const [nome,editar] of [
  ['outra produção',raw=>mudarCelula(raw,'Arquivos',5,'producao_id','peca-4')],
  ['versão anterior',raw=>mudarCelula(raw,'Arquivos',5,'versao',2)],
  ['versão textual histórica',raw=>mudarCelula(raw,'Produções',3,'pacote_versao','3')],
  ['versão vazia',raw=>mudarCelula(raw,'Produções',3,'pacote_versao','')],
  ['tipo errado',raw=>mudarCelula(raw,'Arquivos',5,'tipo','imagem')],
  ['extensão errada',raw=>mudarCelula(raw,'Arquivos',5,'extensao','png')],
  ['ambíguo',raw=>adicionarRegistro(raw,'Arquivos',{arquivo_id:'pacote-duplicado',producao_id:'peca-3',tipo:'pacote',extensao:'zip',versao:3,url:'https://drive.google.com/file/d/duplicado-sintetico'})]
]) test('Pronta recusa pacote '+nome,t=>{
  const raw=capturaPronta();editar(raw);
  assert.equal(visao(t,raw).producoes[2].detalhes.pacotePublicacao,null);
});
test('Pronta coleta normaliza pacote_versao canônico antes dos hashes e conserva inválidos',async()=>{
  for(const value of ['3','03','3.0','9007199254740992','',0]) {
    const raw=capturaPronta();mudarCelula(raw,'Produções',3,'pacote_versao',value);
    const client={spreadsheetId:raw.spreadsheetId,
      async getMetadata(){return {spreadsheetId:raw.spreadsheetId,properties:{timeZone:'UTC'},sheets:Object.entries(raw.metadataBefore).map(([title,m])=>({properties:{title,sheetId:m.sheetId,gridProperties:{rowCount:m.rowCount,columnCount:m.columnCount}}}))};},
      async batchGet(ranges){return {spreadsheetId:raw.spreadsheetId,valueRanges:Object.values(raw.tables).map((table,i)=>({range:ranges[i],majorDimension:'ROWS',values:structuredClone(table.values)}))};}
    };
    const collected=await coletarCaptura(client,{now:()=>new Date(NOW)});
    const table=collected.tables.Produções;
    assert.equal(table.values[3][table.values[0].indexOf('pacote_versao')],value==='3'?3:value);
    assert.equal(collected.firstReadSha256,collected.secondReadSha256);
  }
});
test('Pronta GET real publica pacote seguro projetado e mantém métodos e origem protegidos',async t=>{
  const dir=temporario(t);promoverCaptura(capturaPronta(),dir);
  const server=criarServidor({dataDir:dir,port:0});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const origin='http://127.0.0.1:'+server.address().port;
  const response=await fetch(origin+'/api/visao'),view=await response.json();
  assert.equal(response.status,200);assert.equal(view.producoes[2].quadro.coluna,'Pronta');
  assert.equal(view.producoes[2].detalhes.pacotePublicacao.arquivo_id,'pacote-sintetico-3');
  assert.equal((await fetch(origin+'/api/visao',{method:'POST'})).status,405);
  assert.equal((await fetch(origin+'/api/visao',{headers:{Origin:'https://exemplo.invalid'}})).status,403);
});
