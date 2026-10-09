const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {capturaLayout,AGORA,HOJE,mudarPorId,adicionarRegistro,recalcularHashes,imagemPorArquivo}=require('./layout-fixtures.cjs');
const {capturaPrevias}=require('./previas-fixtures.cjs');
const {validarCaptura}=require('../src/captura.cjs');
const {projetarVisao}=require('../src/projecao.cjs');
const mapa=require('../config/quadro-etapas.json');
const arquivo=path.resolve(__dirname,'../src/web/layout-model.js');
const nomes=['estadoSimples','motivoTravado','progresso','imagensDaPeca','segundaDaSemana','ordenarSemanas'];
const layout=require(arquivo);
function projetar(raw=capturaLayout()) {
  return projetarVisao({captura:validarCaptura(recalcularHashes(raw)),historico:[],ultimaTentativa:null},AGORA,mapa);
}
function peca(coluna,pendencias=[]) {return {quadro:{coluna,pendencias}};}
for(const coluna of ['constructor','toString','__proto__'])test('Layout estado simples recusa chave herdada '+coluna,()=>{
  assert.equal(layout.estadoSimples(peca(coluna)),'Criação');
});
function congelar(value) {
  if(value&&typeof value==='object'){Object.freeze(value);for(const item of Object.values(value))congelar(item);}
  return value;
}

test('Layout fixture válida contém os recortes reais sem inventar quantidade por semana',()=>{
  const raw=capturaLayout(),before=JSON.stringify(raw),view=projetar(raw);
  assert.equal(view.producoes.length,11);
  assert.equal(view.dias.filter(d=>d.data).flatMap(d=>d.ids).length,10);
  assert.deepEqual(view.semanas.map(s=>[s.semana_id,s.ids.length]),[
    ['semana-01',4],['semana-proxima',4],['semana-futura',0],['semana-passada',1],[null,2]
  ]);
  assert.deepEqual(view.dias.find(d=>d.data===HOJE).ids,['peca-1','peca-2']);
  assert.deepEqual(view.dias.find(d=>!d.data).ids,['peca-sem-data']);
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-orfa').semanaId,null);
  assert.equal(view.semanas.find(s=>s.semana_id==='semana-01').pautaOrigem.pauta_id,'pauta-outubro-1');
  assert.equal(view.planilha.find(tab=>tab.nome==='Meses').linhas[0].mes,'2026-10');
  const bytes=imagemPorArquivo('imagem-pagina-1');
  assert.equal(bytes.readUInt32BE(16),1080);assert.equal(bytes.readUInt32BE(20),1350);
  assert.equal(JSON.stringify(raw),before);
});

for(const [coluna,estado] of [
  ['Planejamento','Planejada'],['Redação','Criação'],['Visual','Criação'],['Mídia','Criação'],['Outras','Criação'],
  ['Revisão','Revisão'],['Pronta','Pronta'],['Publicada','Publicada']
])test('Layout estado simples '+coluna+' → '+estado,()=>{
  assert.equal(layout.estadoSimples(peca(coluna)),estado);
});

test('Layout classificação da API prevalece sobre status, arquivos ou metadados conflitantes',()=>{
  const p={...peca('Visual'),status:'publicado',estado_liberacao:'liberado',publicado_em:'preenchido',
    titulo:'Pronta',detalhes:{arquivos:[{tipo:'imagem'}]}};
  assert.equal(layout.estadoSimples(p),'Criação');
});
test('Layout publicação preenchida vence liberação e correção após a projeção existente',()=>{
  const raw=capturaLayout();
  mudarPorId(raw,'Produções','peca-2','estado_liberacao','liberado');
  mudarPorId(raw,'Produções','peca-2','publicado_em','data preenchida inválida');
  const p=projetar(raw).producoes.find(p=>p.producao_id==='peca-2');
  assert.equal(layout.estadoSimples(p),'Publicada');
  assert.equal(layout.motivoTravado(p),'');
});

for(const decisao of ['revisar','refazer','reprovado','rejeitado'])test('Layout correção vigente '+decisao+' vence ausência de mídia',()=>{
  const raw=capturaLayout();
  mudarPorId(raw,'Revisoes','correcao-vigente','decisao',decisao);
  mudarPorId(raw,'Produções','peca-2','etapa_producao','imagens_em_producao');
  const p=projetar(raw).producoes.find(p=>p.producao_id==='peca-2');
  assert.equal(layout.motivoTravado(p),'Travado: precisa de correção');
});
test('Layout histórico, resolução e revisão ambígua não travam a peça',()=>{
  const raw=capturaLayout();mudarPorId(raw,'Revisoes','correcao-vigente','estado_tratamento','resolvida');
  const p=projetar(raw).producoes.find(p=>p.producao_id==='peca-2');
  assert.ok(p.detalhes.revisoes.anteriores.length);assert.ok(p.detalhes.revisoes.ambiguas.length);
  assert.ok(p.detalhes.revisoes.resolvidas.length);
  assert.equal(layout.motivoTravado(p),'');
});
for(const coluna of ['Pronta','Publicada'])test('Layout '+coluna+' vence todos os motivos de travamento',()=>{
  assert.equal(layout.motivoTravado(peca(coluna,[{tipo:'revisao'},{tipo:'midia'}])),'');
});
for(const coluna of ['Planejamento','Redação','Visual','Revisão','Outras'])test('Layout falta de mídia não trava a coluna '+coluna,()=>{
  assert.equal(layout.motivoTravado(peca(coluna,[{tipo:'midia'}])),'');
});
test('Layout falta de mídia só trava Mídia; falha de prévia e pacote não criam bloqueio',()=>{
  assert.equal(layout.motivoTravado(peca('Mídia',[{tipo:'midia'}])),'Travado: falta gerar mídia');
  assert.equal(layout.motivoTravado(peca('Mídia',[{tipo:'previa'},{tipo:'pacote'},{tipo:'coleta'}])),'');
  assert.equal(layout.motivoTravado(peca('Mídia')),'');
});

test('Layout progresso conta Pronta e Publicada em todas as peças do bloco sem mutação',()=>{
  const pecas=congelar(['Planejamento','Pronta','Publicada','Visual'].map(coluna=>peca(coluna)));
  assert.deepEqual(layout.progresso(pecas),{prontas:2,total:4,percentual:50});
});
test('Layout progresso vazio não inventa meta ou conclusão e preserva frações',()=>{
  assert.deepEqual(layout.progresso([]),{prontas:0,total:0,percentual:null});
  assert.deepEqual(layout.progresso([peca('Visual')]),{prontas:0,total:1,percentual:0});
  assert.deepEqual(layout.progresso([peca('Pronta'),peca('Publicada')]),{prontas:2,total:2,percentual:100});
  assert.deepEqual(layout.progresso([peca('Pronta'),peca('Visual'),peca('Visual')]),{prontas:1,total:3,percentual:100/3});
});
test('Layout Planejamento segue datas e projeto preserva vínculo original, órfãs e sem data',()=>{
  const raw=capturaLayout();mudarPorId(raw,'Produções','proxima-3','data_prevista','2026-10-07');
  const view=congelar(projetar(raw)),atual=view.semanas.find(s=>s.semana_id==='semana-01');
  assert.equal(view.producoes.find(p=>p.producao_id==='proxima-3').semanaId,'semana-proxima');
  const planejamento=view.producoes.filter(p=>layout.segundaDaSemana(p.dataCivil)==='2026-10-05');
  assert.deepEqual(layout.progresso(planejamento),{prontas:2,total:6,percentual:100/3});
  assert.deepEqual(layout.progresso(view.producoes.filter(p=>atual.ids.includes(p.producao_id))),{prontas:2,total:4,percentual:50});
  assert.deepEqual(layout.ordenarSemanas(view.semanas,HOJE).at(-1).ids,['peca-orfa','peca-sem-data']);
});

for(const [data,segunda] of [
  ['2026-10-05','2026-10-05'],['2026-10-08','2026-10-05'],['2026-10-11','2026-10-05'],
  ['2026-10-12','2026-10-12'],['2026-11-01','2026-10-26'],['2027-01-01','2026-12-28'],
  ['2024-02-29','2024-02-26']
])test('Layout segunda civil para '+data,()=>assert.equal(layout.segundaDaSemana(data),segunda));
test('Layout data ausente ou inválida não vira dia nem semana por normalização',()=>{
  for(const data of [null,undefined,'',0,'2026-02-30','2026-2-09','2026-13-01','2026-10-08T00:00:00Z']) {
    assert.equal(layout.segundaDaSemana(data),null,String(data));
  }
});
test('Layout ordena atual, próxima, futuras e passadas; inválidas ficam no fim sem mutar',()=>{
  const datas=['2026-09-21','2026-11-02','2026-10-19',null,'2026-10-12','2026-09-28','2026-10-05','2026-02-30'];
  const semanas=congelar(datas.map((inicio,i)=>({semana_id:'s'+i,periodo:{inicio}})));
  const resultado=layout.ordenarSemanas(semanas,HOJE);
  assert.deepEqual(resultado.map(s=>s.periodo.inicio),[
    '2026-10-05','2026-10-12','2026-10-19','2026-11-02','2026-09-28','2026-09-21',null,'2026-02-30'
  ]);
  assert.notEqual(resultado,semanas);
  assert.equal(resultado[0],semanas[6]);
  assert.deepEqual(semanas.map(s=>s.periodo.inicio),datas);
});
test('Layout ordem de semanas preserva empates, virada de ano e hoje inválido',()=>{
  const semanas=[
    {semana_id:'passada',periodo:{inicio:'2026-12-21'}},{semana_id:'atual-b',periodo:{inicio:'2026-12-28'}},
    {semana_id:'proxima',periodo:{inicio:'2027-01-04'}},{semana_id:'atual-a',periodo:{inicio:'2026-12-28'}}
  ];
  assert.deepEqual(layout.ordenarSemanas(semanas,'2027-01-01').map(s=>s.semana_id),['atual-b','atual-a','proxima','passada']);
  const semHoje=layout.ordenarSemanas(semanas,null);
  assert.deepEqual(semHoje,semanas);assert.notEqual(semHoje,semanas);
});

test('Layout imagens conserva cinco páginas vigentes com versões de mídia distintas',()=>{
  const p=congelar(projetar().producoes.find(p=>p.producao_id==='peca-3'));
  const imagens=layout.imagensDaPeca(p);
  assert.deepEqual(imagens.map(i=>[i.arquivo.arquivo_id,i.arquivo.versao,i.contexto]),[
    ['imagem-pagina-1',2,'Página 1'],['imagem-pagina-2',1,'Página 2'],['imagem-pagina-3',1,'Página 3'],
    ['imagem-pagina-4',2,'Página 4'],['imagem-pagina-5',3,'Página 5']
  ]);
  assert.equal(imagens[0].arquivo,p.detalhes.paginas[0].arquivos[0]);
});
test('Layout galeria mantém seleção da 005: vigente, índice/ID, empate e indisponível',()=>{
  const raw=capturaPrevias();
  mudarPorId(raw,'Arquivos','imagem-pagina-1','pagina_id','');
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v2-1',producao_id:'peca-3',versao:2,indice:1,arquivo_imagem_id:'imagem-pagina-1'});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v3-1-empate',producao_id:'peca-3',versao:3,indice:1,arquivo_imagem_id:'imagem-pagina-1'});
  mudarPorId(raw,'Páginas','pagina-v3-2','arquivo_imagem_id','arquivo-ausente');
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-3'));
  assert.deepEqual(layout.imagensDaPeca(p).map(i=>[i.arquivo.arquivo_id,i.contexto]),[
    ['imagem-pagina-1','Página 1'],['imagem-pagina-1','Página 1'],['imagem-pagina-3','Página 3'],
    ['imagem-pagina-4','Página 4'],['imagem-pagina-5','Página 5']
  ]);
});
test('Layout imagens de cenas mantêm início/final e excluem vídeo; ausência não usa arquivo avulso',()=>{
  const raw=capturaPrevias();
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-4'));
  assert.deepEqual(layout.imagensDaPeca(p).map(i=>[i.arquivo.arquivo_id,i.contexto]),[
    ['cena-inicio','Cena 1 · início'],['cena-final','Cena 1 · final']
  ]);
  const semInicio=structuredClone(p);semInicio.detalhes.cenas[0].arquivos[0]=null;
  assert.deepEqual(layout.imagensDaPeca(congelar(semInicio)).map(i=>i.contexto),['Cena 1 · final']);
  assert.deepEqual(layout.imagensDaPeca(projetar().producoes.find(p=>p.producao_id==='peca-4')),[]);
});
test('Layout fallback Imagem sem unidades exige produção e versão exatas em ordem de ID',()=>{
  const p={producao_id:'imagem',formato:'Imagem',versao:2,detalhes:{paginas:[],cenas:[],arquivos:[
    {arquivo_id:'b',producao_id:'imagem',tipo:'imagem',versao:2},
    {arquivo_id:'antiga',producao_id:'imagem',tipo:'imagem',versao:1},
    {arquivo_id:'outra',producao_id:'outra',tipo:'imagem',versao:2},
    {arquivo_id:'video',producao_id:'imagem',tipo:'vídeo',versao:2},
    {arquivo_id:'a',producao_id:'imagem',tipo:'imagem',versao:2}
  ]}};
  assert.deepEqual(layout.imagensDaPeca(congelar(p)).map(i=>[i.arquivo.arquivo_id,i.contexto]),[['a','Imagem 1'],['b','Imagem 2']]);
  for(const versao of [0,-1,'2',NaN,2.5])assert.deepEqual(layout.imagensDaPeca({...p,versao}),[]);
  for(const formato of ['Reels','Carrossel','Outro'])assert.deepEqual(layout.imagensDaPeca({...p,formato}),[]);
  const historica={...p,detalhes:{...p.detalhes,paginas:[{vigente:false,arquivos:[]}]}};
  assert.deepEqual(layout.imagensDaPeca(historica),[]);
});
test('Layout exporta a mesma API no navegador sem DOM, rede ou módulos Node',()=>{
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(arquivo,'utf8'),context,{filename:arquivo});
  for(const nome of nomes)assert.equal(typeof context.CrmLayout?.[nome],'function',nome);
  assert.equal(context.CrmLayout.estadoSimples(peca('Pronta')),'Pronta');
  assert.equal(context.CrmLayout.segundaDaSemana(HOJE),'2026-10-05');
});
