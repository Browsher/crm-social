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
const nomes=['estadoSimples','motivoTravado','progresso','imagensDaPeca','segundaDaSemana','ordenarSemanas',
  'filaPublicar','publicadasRecentes','posicoesInstagram','instantePublicacao'];
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

function publicavel(id,dataCivil,publicado_em='',estado_liberacao='liberado') {
  return {producao_id:id,dataCivil,publicado_em,estado_liberacao};
}
test('Layout fila usa somente liberação literal e publicação vazia, independente de mídia e coluna',()=>{
  assert.equal(typeof layout.filaPublicar,'function');
  const entradas=congelar([
    {...publicavel('sem-pacote',HOJE),quadro:{coluna:'Mídia',pendencias:[{tipo:'midia'}]},detalhes:{pacotePublicacao:null}},
    publicavel('null',HOJE,null),publicavel('undefined',HOJE,undefined),publicavel('espacos',HOJE,' \n '),
    publicavel('publicada',HOJE,'registro inválido'),publicavel('numero',HOJE,0),
    publicavel('aparente',HOJE,'','pronto'),publicavel('capitalizada',HOJE,'','Liberado'),
    publicavel('trailing',HOJE,'','liberado '),publicavel('ausente',HOJE,'',null)
  ]);
  const resultado=layout.filaPublicar(entradas);
  assert.deepEqual(resultado.map(p=>p.producao_id),['espacos','null','sem-pacote','undefined']);
  assert.equal(resultado.find(p=>p.producao_id==='sem-pacote'),entradas[0]);
  assert.notEqual(resultado,entradas);
});
test('Layout fila ordena data civil real e ID exato, com inválidas ou sem data ao final sem mutação',()=>{
  const entradas=congelar([
    publicavel('sem-data',null),publicavel('B','2026-10-09'),publicavel('b','2026-10-09'),
    publicavel('anterior','2026-10-07'),publicavel('a','2026-10-09'),publicavel('posterior','2027-01-01'),
    publicavel('invalida','2026-02-30'),publicavel('nao-canonica','2026-2-09'),publicavel('vazia',''),
    publicavel('hora','2026-10-08T00:00:00Z')
  ]);
  assert.deepEqual(layout.filaPublicar(entradas).map(p=>p.producao_id),[
    'anterior','B','a','b','posterior','hora','invalida','nao-canonica','sem-data','vazia'
  ]);
  assert.equal(entradas[0].producao_id,'sem-data');
});
test('Layout fila vazia e recorte projetado incluem prontas sem exigir pacote ou filtro de formato',()=>{
  assert.deepEqual(layout.filaPublicar([]),[]);
  const view=congelar(projetar());
  assert.deepEqual(layout.filaPublicar(view.producoes).map(p=>p.producao_id),['peca-1','peca-3','proxima-1']);
});
test('Layout recentes usam instante ISO com fuso em ordem decrescente, preservando época e empates',()=>{
  assert.equal(typeof layout.publicadasRecentes,'function');
  const entradas=congelar([
    publicavel('Z','2026-10-08','2026-10-08T13:00:00Z'),
    publicavel('a','2026-10-08','2026-10-08T10:00:00-03:00'),
    publicavel('depois','2026-10-07','2026-10-08T13:00:00.001Z'),
    publicavel('antes','2026-10-09','2026-10-08T13:00:00+01:00'),
    publicavel('epoca','2026-10-08','1970-01-01T00:00:00Z'),
    publicavel('nao-publicada','2026-10-08',''),publicavel('espacos','2026-10-08',' \t ')
  ]);
  assert.deepEqual(layout.publicadasRecentes(entradas).map(p=>p.producao_id),['depois','Z','a','antes','epoca']);
  assert.equal(layout.publicadasRecentes(entradas)[0],entradas[2]);
  assert.equal(entradas[0].producao_id,'Z');
});
test('Layout recentes preservam publicação preenchida inválida no fim sem normalizar dia, hora ou fuso',()=>{
  const entradas=congelar([
    publicavel('dia-invalido',null,'2026-02-30T10:00:00Z'),
    publicavel('hora-invalida',null,'2026-10-08T24:00:00Z'),
    publicavel('sem-fuso',null,'2026-10-08T10:00:00'),
    publicavel('apenas-data',null,'2026-10-08'),publicavel('numero',null,0),
    publicavel('texto',null,'publicada'),publicavel('fuso-invalido',null,'2026-10-08T10:00:00+25:00'),
    publicavel('valida',null,'2024-02-29T10:00:00-03:00')
  ]);
  assert.deepEqual(layout.publicadasRecentes(entradas).map(p=>p.producao_id),[
    'valida','apenas-data','dia-invalido','fuso-invalido','hora-invalida','numero','sem-fuso','texto'
  ]);
});
test('Layout recentes limitam dez após ordenar todos os registros, sem mutar ou excluir inválidos prematuramente',()=>{
  assert.deepEqual(layout.publicadasRecentes([]),[]);
  const entradas=congelar(Array.from({length:12},(_,i)=>publicavel('p'+i,null,'2026-10-'+String(i+1).padStart(2,'0')+'T12:00:00Z')));
  assert.deepEqual(layout.publicadasRecentes(entradas).map(p=>p.producao_id),['p11','p10','p9','p8','p7','p6','p5','p4','p3','p2']);
  const invalidas=congelar(Array.from({length:12},(_,i)=>publicavel(String(i).padStart(2,'0'),null,'registro inválido')));
  assert.deepEqual(layout.publicadasRecentes(invalidas).map(p=>p.producao_id),['00','01','02','03','04','05','06','07','08','09']);
});
test('Layout Instagram conserva cinco posições de carrossel mesmo sem arquivo, sem alterar a galeria005',()=>{
  assert.equal(typeof layout.posicoesInstagram,'function');
  const raw=capturaLayout();mudarPorId(raw,'Páginas','pagina-v3-2','arquivo_imagem_id','arquivo-ausente');
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-3'));
  assert.deepEqual(layout.posicoesInstagram(p).map(i=>[i.arquivo?.arquivo_id??null,i.contexto]),[
    ['imagem-pagina-1','Página 1'],[null,'Página 2'],['imagem-pagina-3','Página 3'],
    ['imagem-pagina-4','Página 4'],['imagem-pagina-5','Página 5']
  ]);
  assert.equal(layout.imagensDaPeca(p).length,4);
  assert.equal(layout.posicoesInstagram(p)[0].arquivo,p.detalhes.paginas[0].arquivos[0]);
});
test('Layout Instagram ordem índice/ID preserva empates vigentes, não inclui versões históricas ou índices inválidos',()=>{
  const raw=capturaLayout();
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-empate',producao_id:'peca-3',versao:3,indice:1,arquivo_imagem_id:''});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-indice-invalido',producao_id:'peca-3',versao:3,indice:0,arquivo_imagem_id:''});
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-3'));
  const slots=layout.posicoesInstagram(p);
  assert.equal(slots.length,6);
  assert.deepEqual(slots.slice(0,2).map(i=>[i.arquivo?.arquivo_id??null,i.contexto]),[[null,'Página 1'],['imagem-pagina-1','Página 1']]);
  assert.equal(slots.filter(i=>i.contexto==='Página 2').length,1);
});
test('Layout Instagram imagem única conserva 1/1 com seleção exata e primeira imagem em ordem de ID',()=>{
  const p=congelar({producao_id:'imagem',formato:'Imagem',versao:2,detalhes:{paginas:[],cenas:[],arquivos:[
    {arquivo_id:'b',producao_id:'imagem',tipo:'imagem',versao:2},
    {arquivo_id:'a',producao_id:'imagem',tipo:'imagem',versao:2},
    {arquivo_id:'antiga',producao_id:'imagem',tipo:'imagem',versao:1},
    {arquivo_id:'outra',producao_id:'outra',tipo:'imagem',versao:2}
  ]}});
  assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:p.detalhes.arquivos[1],contexto:'Imagem 1'}]);
  assert.equal(layout.imagensDaPeca(p).length,2);
  for(const versao of [0,'2',null,2.5])assert.deepEqual(layout.posicoesInstagram({...p,versao}),[{arquivo:null,contexto:'Imagem 1'}]);
});
test('Layout Instagram imagem única sem mídia ou com só unidade histórica mantém placeholder sem buscar arquivo avulso',()=>{
  const p={producao_id:'sem-imagem',formato:'Imagem',versao:1,detalhes:{paginas:[],cenas:[],arquivos:[]}};
  assert.deepEqual(layout.posicoesInstagram(congelar(p)),[{arquivo:null,contexto:'Imagem 1'}]);
  const historica={...p,detalhes:{...p.detalhes,paginas:[{vigente:false,arquivos:[]}],arquivos:[
    {arquivo_id:'avulsa',producao_id:p.producao_id,tipo:'imagem',versao:1}
  ]}};
  assert.deepEqual(layout.posicoesInstagram(congelar(historica)),[{arquivo:null,contexto:'Imagem 1'}]);
});
test('Layout Instagram imagem única conserva a primeira página vigente indisponível, sem avançar à segunda',()=>{
  const raw=capturaLayout();
  mudarPorId(raw,'Produções','peca-3','slot','imagem_a');
  mudarPorId(raw,'Páginas','pagina-v3-1','arquivo_imagem_id','arquivo-ausente');
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-3'));
  assert.equal(p.detalhes.paginas.filter(pagina=>pagina.vigente).length,5);
  assert.equal(layout.imagensDaPeca(p)[0].arquivo.arquivo_id,'imagem-pagina-2');
  assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:null,contexto:'Imagem 1'}]);
});
test('Layout Instagram imagem única preserva ordem por ID de empate vigente sem retornar à página histórica',()=>{
  const raw=capturaLayout();mudarPorId(raw,'Produções','peca-3','slot','imagem_a');
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-empate',producao_id:'peca-3',versao:3,indice:1,arquivo_imagem_id:''});
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-3'));
  assert.equal(p.detalhes.paginas.filter(pagina=>pagina.vigente&&pagina.indice===1).length,2);
  assert.equal(layout.imagensDaPeca(p)[0].arquivo.arquivo_id,'imagem-pagina-1');
  assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:null,contexto:'Imagem 1'}]);
});
test('Layout Instagram imagem única com cenas conserva início indisponível e precedência de páginas',()=>{
  const raw=capturaPrevias();mudarPorId(raw,'Produções','peca-4','slot','imagem_a');
  mudarPorId(raw,'Cenas','cena-v3-1','arquivo_imagem_inicio_id','arquivo-ausente');
  const p=congelar(projetar(raw).producoes.find(p=>p.producao_id==='peca-4'));
  assert.equal(layout.imagensDaPeca(p)[0].arquivo.arquivo_id,'cena-final');
  assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:null,contexto:'Imagem 1'}]);
  const cenaCompleta=structuredClone(p);cenaCompleta.detalhes.cenas[0].arquivos[0]={arquivo_id:'inicio-sintetico'};
  cenaCompleta.detalhes.paginas=[{pagina_id:'pagina-sintetica',vigente:true,indice:2,arquivos:[null]}];
  assert.equal(layout.imagensDaPeca(cenaCompleta)[0].arquivo.arquivo_id,'inicio-sintetico');
  assert.deepEqual(layout.posicoesInstagram(congelar(cenaCompleta)),[{arquivo:null,contexto:'Imagem 1'}]);
});
test('Layout Instagram Reels conta início e final por cena vigente mesmo com ausências e ignora vídeo',()=>{
  const p=congelar(projetar(capturaPrevias()).producoes.find(p=>p.producao_id==='peca-4'));
  assert.deepEqual(layout.posicoesInstagram(p).map(i=>[i.arquivo?.arquivo_id??null,i.contexto]),[
    ['cena-inicio','Cena 1 · início'],['cena-final','Cena 1 · final']
  ]);
  const semInicio=structuredClone(p);semInicio.detalhes.cenas[0].arquivos[0]=null;
  assert.deepEqual(layout.posicoesInstagram(congelar(semInicio)).map(i=>[i.arquivo?.arquivo_id??null,i.contexto]),[
    [null,'Cena 1 · início'],['cena-final','Cena 1 · final']
  ]);
  const travado=congelar(projetar().producoes.find(p=>p.producao_id==='peca-4'));
  assert.deepEqual(layout.posicoesInstagram(travado),[
    {arquivo:null,contexto:'Cena 1 · início'},{arquivo:null,contexto:'Cena 1 · final'}
  ]);
});
test('Layout Instagram carrossel ou Reels sem unidades vigentes conserva uma posição indisponível',()=>{
  for(const formato of ['Carrossel','Reels','Outro']) {
    const p=congelar({producao_id:'sem-unidade',formato,versao:1,detalhes:{paginas:[],cenas:[],arquivos:[
      {arquivo_id:'avulsa',producao_id:'sem-unidade',tipo:'imagem',versao:1}
    ]}});
    assert.deepEqual(layout.posicoesInstagram(p),[{arquivo:null,contexto:'Prévia indisponível'}]);
  }
});
