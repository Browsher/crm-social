const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaVersoes,mudarPorId}=require('./versoes-fixtures.cjs');
const {temporario,mudarCelula,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {validarCaptura}=require('../src/captura.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {projetarVisao}=require('../src/projecao.cjs');
const {carregarMapaQuadro}=require('../src/quadro-config.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const NOW='2026-10-02T14:00:00Z';
const mapa=()=>carregarMapaQuadro(path.resolve(__dirname,'../config/quadro-etapas.json'));
function projetar(raw) {
  return projetarVisao({captura:validarCaptura(recalcularHashes(raw)),historico:[],ultimaTentativa:null},NOW,mapa());
}
function peca(view,id='peca-3'){return view.producoes.find(p=>p.producao_id===id);}
const avisosUnidade=p=>p.detalhes.avisos.filter(a=>['Páginas','Cenas'].includes(a.aba));
function bytesTemporarios(dir,prefix='') {
  return fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(entry=>{
    const file=path.join(dir,entry.name),relative=path.join(prefix,entry.name);
    return entry.isDirectory()?[[relative,'diretório'],...bytesTemporarios(file,relative)]:[[relative,fs.readFileSync(file).toString('hex')]];
  });
}

test('Versões ponteiros explícitos aceitam cinco imagens aprovadas de versões distintas do texto',()=>{
  const raw=capturaVersoes(),before=JSON.stringify(raw),p=peca(projetar(raw));
  assert.equal(p.quadro.coluna,'Pronta');assert.equal(p.versao,8);
  assert.deepEqual(p.detalhes.paginas.map(u=>u.arquivos[0]?.versao),[2,1,1,2,3]);
  assert.deepEqual(p.detalhes.paginas.map(u=>u.vigente),[true,true,true,true,true]);
  assert.deepEqual(avisosUnidade(p),[]);
  assert.deepEqual(p.quadro.pendencias.filter(a=>a.tipo==='midia'),[]);
  assert.equal(JSON.stringify(raw),before);
});

test('Versões cenas aceitam os três ponteiros de mídia independentemente da versão da produção',()=>{
  const p=peca(projetar(capturaVersoes()),'peca-4'),c=p.detalhes.cenas[0];
  assert.deepEqual(c.arquivos.map(a=>a?.versao),[1,2,2]);
  assert.equal(c.vigente,true);assert.equal(c.avisoMidia,null);assert.deepEqual(avisosUnidade(p),[]);
  assert.deepEqual(p.quadro.pendencias.filter(a=>a.tipo==='midia'),[]);
});

test('Versões ponteiro aceita arquivo sem a unidade declarada, mas exige a produção exata',()=>{
  const raw=capturaVersoes();
  mudarPorId(raw,'Arquivos','imagem-pagina-1','pagina_id','');
  for(const id of ['cena-inicio','cena-final','cena-video'])mudarPorId(raw,'Arquivos',id,'cena_id','');
  const view=projetar(raw);
  assert.equal(peca(view).detalhes.paginas[0].arquivos[0]?.arquivo_id,'imagem-pagina-1');
  assert.deepEqual(peca(view,'peca-4').detalhes.cenas[0].arquivos.map(a=>a?.arquivo_id),['cena-inicio','cena-final','cena-video']);
  assert.deepEqual(avisosUnidade(peca(view)),[]);assert.deepEqual(avisosUnidade(peca(view,'peca-4')),[]);
});

for(const [label,edit] of [
  ['referência quebrada',raw=>mudarPorId(raw,'Páginas','pagina-v3-1','arquivo_imagem_id','arquivo-inexistente')],
  ['produção diferente',raw=>mudarPorId(raw,'Arquivos','imagem-pagina-1','producao_id','peca-4')],
  ['página diferente',raw=>mudarPorId(raw,'Arquivos','imagem-pagina-1','pagina_id','pagina-v3-2')],
])test('Versões página recusa '+label+' mesmo com outras mídias reaproveitadas válidas',()=>{
  const raw=capturaVersoes();edit(raw);const p=peca(projetar(raw));
  assert.equal(p.detalhes.paginas[0].arquivos[0],null);
  assert.ok(avisosUnidade(p).some(a=>a.campo==='arquivo_imagem_id' && /Referência quebrada|Escopo incompatível/.test(a.motivo)));
  assert.equal(p.detalhes.paginas.slice(1).filter(u=>u.arquivos[0]).length,4);
  assert.ok(p.quadro.pendencias.some(a=>a.tipo==='midia'));
});

for(const [campo,id] of [['arquivo_imagem_inicio_id','cena-inicio'],['arquivo_imagem_final_id','cena-final'],['arquivo_video_id','cena-video']]) {
  for(const [scope,value] of [['producao_id','peca-3'],['cena_id','cena-distinta']])test('Versões cena recusa '+campo+' com '+scope+' diferente',()=>{
    const raw=capturaVersoes();mudarPorId(raw,'Arquivos',id,scope,value);
    const p=peca(projetar(raw),'peca-4'),index=['arquivo_imagem_inicio_id','arquivo_imagem_final_id','arquivo_video_id'].indexOf(campo);
    assert.equal(p.detalhes.cenas[0].arquivos[index],null);
    assert.ok(avisosUnidade(p).some(a=>a.campo===campo && /Escopo incompatível/.test(a.motivo)));
    assert.equal(p.detalhes.cenas[0].arquivos.filter(Boolean).length,2);
  });
}

test('Versões vigência usa maior versão por índice e produção, separando páginas e cenas',()=>{
  const raw=capturaVersoes();
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v2-1',producao_id:'peca-3',versao:2,indice:1,arquivo_imagem_id:'imagem-pagina-1'});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v4-2',producao_id:'peca-3',versao:4,indice:2,arquivo_imagem_id:'imagem-pagina-2'});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-outra-producao',producao_id:'peca-4',versao:20,indice:1});
  adicionarRegistro(raw,'Cenas',{cena_id:'cena-v2-1',producao_id:'peca-4',versao:2,indice:1});
  adicionarRegistro(raw,'Cenas',{cena_id:'cena-v1-2',producao_id:'peca-4',versao:1,indice:2});
  const view=projetar(raw),pages=peca(view).detalhes.paginas,scenes=peca(view,'peca-4').detalhes.cenas;
  assert.deepEqual(pages.map(u=>[u.pagina_id,u.vigente]),[
    ['pagina-v2-1',false],['pagina-v3-1',true],['pagina-v3-2',false],['pagina-v3-3',true],['pagina-v3-4',true],['pagina-v3-5',true],['pagina-v4-2',true]
  ]);
  assert.deepEqual(scenes.map(u=>[u.cena_id,u.vigente]),[['cena-v1-2',true],['cena-v2-1',false],['cena-v3-1',true]]);
});

test('Versões empates permanecem visíveis e índices ou versões inválidos não são vigentes',()=>{
  const raw=capturaVersoes();
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-v3-1-empate',producao_id:'peca-3',versao:3,indice:1});
  for(const [id,version,index] of [['versao-zero',0,1],['versao-texto','99',1],['indice-zero',99,0],['indice-texto',99,'1'],['versao-negativa',-1,1]]) {
    adicionarRegistro(raw,'Páginas',{pagina_id:id,producao_id:'peca-3',versao:version,indice:index});
  }
  const pages=peca(projetar(raw)).detalhes.paginas;
  assert.equal(pages.length,11);
  assert.deepEqual(pages.filter(u=>u.indice===1 && u.versao===3).map(u=>[u.pagina_id,u.vigente]),[['pagina-v3-1',true],['pagina-v3-1-empate',true]]);
  for(const id of ['versao-zero','versao-texto','indice-zero','indice-texto','versao-negativa'])assert.equal(pages.find(u=>u.pagina_id===id).vigente,false);
});

test('Versões arquivo explicitamente apontado com versão inválida fica ligado com aviso numérico independente',()=>{
  const raw=capturaVersoes();mudarPorId(raw,'Arquivos','imagem-pagina-1','versao','dois');
  const p=peca(projetar(raw));
  assert.equal(p.detalhes.paginas[0].arquivos[0]?.arquivo_id,'imagem-pagina-1');
  assert.equal(p.detalhes.paginas[0].arquivos[0].versao,'dois');
  assert.deepEqual(avisosUnidade(p),[]);
  assert.ok(p.detalhes.avisos.some(a=>a.aba==='Arquivos' && a.campo==='versao' && /Inteiro positivo inválido/.test(a.motivo)));
});

test('Versões produção inválida não impede aviso de mídia realmente ausente em unidade válida',()=>{
  const raw=capturaVersoes();mudarCelula(raw,'Produções',3,'versao','desconhecida');
  mudarPorId(raw,'Páginas','pagina-v3-1','arquivo_imagem_id','');
  const p=peca(projetar(raw));
  assert.equal(p.detalhes.paginas[0].vigente,true);
  assert.ok(p.quadro.pendencias.some(a=>a.tipo==='midia'));
  assert.ok(avisosUnidade(p).some(a=>/Mídia ausente/.test(a.motivo)));
});

test('Versões persistência TEMP e GET real preservam os ponteiros e a captura sem escrita na consulta',async t=>{
  const dir=temporario(t),raw=capturaVersoes();assert.equal(promoverCaptura(raw,dir).resultado,'completa');
  const before=bytesTemporarios(dir);
  const local=peca(projetarVisao(lerEstado(dir),NOW,mapa()));
  assert.deepEqual(local.detalhes.paginas.map(u=>u.arquivos[0]?.versao),[2,1,1,2,3]);
  const server=criarServidor({dataDir:dir,port:0});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const origin='http://127.0.0.1:'+server.address().port;
  const response=await fetch(origin+'/api/visao'),view=await response.json();
  assert.equal(response.status,200);assert.deepEqual(peca(view).detalhes.paginas.map(u=>u.arquivos[0]?.versao),[2,1,1,2,3]);
  assert.deepEqual(avisosUnidade(peca(view)),[]);
  assert.equal((await fetch(origin+'/api/visao',{method:'POST'})).status,405);
  assert.equal((await fetch(origin+'/api/visao',{headers:{Origin:'https://exemplo.invalid'}})).status,403);
  assert.deepEqual(bytesTemporarios(dir),before);
});
