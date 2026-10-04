const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,capturaDetalhada,adicionarRegistro,mapaQuadroValido,temporario,recalcularHashes,mudarCelula,redefinirHorario}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const CI=process.env.CI==='true';
const skip=CI?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
async function abrir(t,width=1440,captura=true,editar=()=>{},depois=()=>{},fixture=capturaValida) {
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE || 'playwright');
  const root=temporario(t), dataDir=path.join(root,'dados'), quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  if (captura) {
    const raw=fixture(), table=raw.tables.Produções;
    const row=table.values[1].slice();
    row[table.values[0].indexOf('producao_id')]='peca-6';
    row[table.values[0].indexOf('titulo')]='Sem data sintética';
    row[table.values[0].indexOf('data_prevista')]='';
    table.values.push(row);
    editar(raw);
    promoverCaptura(recalcularHashes(raw),dataDir);
  }
  depois(dataDir);
  const server=criarServidor({dataDir,quadroConfigPath,port:0});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const browser=await chromium.launch();
  t.after(()=>browser.close());
  const page=await browser.newPage({viewport:{width,height:1050}});
  page.setDefaultTimeout(3000);
  await page.clock.setFixedTime(new Date('2026-10-04T12:00:00Z'));
  const origin='http://127.0.0.1:'+server.address().port, external=[], errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
    if (!route.request().url().startsWith(origin+'/')) {external.push(route.request().url());return route.abort();}
    return route.continue();
  });
  t.after(()=>{assert.deepEqual(external,[]);assert.deepEqual(errors,[]);});
  await page.goto(origin);
  return page;
}
test('U05 filtro e clique na segunda peça abrem o dia inteiro em acordeões com Esc/foco', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.getByRole('button',{name:'Reels',exact:true}).click();
  const trigger=page.locator('#calendario [data-producao-id="peca-4"]');
  await trigger.click();
  const pecas=page.locator('#dia .peca-acordeao');
  assert.equal(await pecas.count(),2);
  assert.deepEqual(await pecas.evaluateAll(nodes=>nodes.map(n=>n.dataset.peca)),['peca-3','peca-4']);
  assert.deepEqual(await pecas.evaluateAll(nodes=>nodes.map(n=>n.open)),[true,false]);
  assert.match(await page.locator('#dia-titulo').textContent(),/sexta-feira.*02.*outubro/);
  assert.equal(await page.locator('#dia-quantidade').textContent(),'2 peças registradas');
  await pecas.nth(1).locator('summary').focus();await page.keyboard.press('Enter');
  assert.equal(await pecas.nth(1).evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dia').isVisible(),false);
  assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
});

test('U05 dia/lista e dia vazio: no máximo dois acionamentos, sem recortar a gaveta', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.getByRole('button',{name:'2 de outubro',exact:true}).click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  await page.getByRole('button',{name:'Fechar dia',exact:true}).click();
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  await page.locator('#lista [data-producao-id="peca-4"]').click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Calendário',exact:true}).click();
  await page.getByRole('button',{name:'3 de outubro',exact:true}).click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),0);
  assert.match(await page.locator('#dia-pecas').textContent(),/Nenhuma peça registrada/);
});

test('U06 versões/páginas/cenas e revisão vigente não se misturam ao histórico', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"]');
  assert.deepEqual(await carousel.locator('[data-unidades="paginas"] [data-versao="2"] [data-pagina]').evaluateAll(ns=>ns.map(n=>n.dataset.pagina)),['pagina-02','pagina-01']);
  assert.match(await carousel.textContent(),/Design novo: A confirmar/);
  const current=carousel.locator('[data-revisoes="vigentes"]');
  assert.match(await current.textContent(),/revisao-atual/);
  assert.ok(!(await current.textContent()).includes('revisao-resolvida'));
  assert.ok(!(await current.textContent()).includes('revisao-antiga'));
  assert.match(await carousel.locator('[data-revisoes="resolvidas"]').textContent(),/revisao-resolvida/);
  assert.equal(await carousel.locator('[data-revisoes="resolvidas"]').getAttribute('class'),'detail-section history');
  assert.match(await carousel.textContent(),/Com quem está.*Equipe sintética/s);
  assert.match(await current.textContent(),/Quem corrige.*Correção sintética/s);
  assert.match(await carousel.textContent(),/Publicação.*Não comprovada/s);
  const reels=page.locator('#dia [data-peca="peca-4"]');await reels.locator('summary').first().click();
  assert.deepEqual(await reels.locator('[data-cena]').evaluateAll(ns=>ns.map(n=>n.dataset.cena)),['cena-02','cena-01']);
  assert.match(await reels.textContent(),/Mídia ausente/);
});

test('U06 celular em tela cheia abre dia com várias peças; Esc retorna à lista', {skip}, async t=>{
  const page=await abrir(t,390,true,()=>{},()=>{},capturaDetalhada);
  const trigger=page.locator('#lista [data-producao-id="peca-3"]');await trigger.click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  const box=await page.locator('#dia').boundingBox();
  assert.deepEqual(box,{x:0,y:0,width:390,height:1050});
  assert.ok(await page.locator('#dia').evaluate(n=>n.scrollWidth<=n.clientWidth));
  await page.keyboard.press('Escape');
  assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
});

test('U06 Sem data abre somente o grupo da semana, em ordem ordinal', {skip}, async t=>{
  const page=await abrir(t,390,true,raw=>mudarCelula(raw,'Produções',3,'data_prevista',''),()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-6"]').click();
  assert.match(await page.locator('#dia-titulo').textContent(),/Sem data.*Conexões do cotidiano/);
  assert.deepEqual(await page.locator('#dia .peca-acordeao').evaluateAll(ns=>ns.map(n=>n.dataset.peca)),['peca-3','peca-6']);
});

test('U06 conteúdo HTML é texto; somente HTTPS Drive/Docs sem credenciais vira link', {skip}, async t=>{
  const text='<img src="https://example.invalid/x" onerror="throw 1">';
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Produções',3,'titulo',text);mudarCelula(raw,'Páginas',2,'corpo',text);
    for(const [i,url] of ['http://drive.google.com/x','https://drive.google.com.evil.invalid/x','https://usuario:senha@docs.google.com/x','javascript:alert(1)','https://drive.google.com:444/x','URL inválida sintética','https://docs.google.com/document/d/segundo-sintetico'].entries()) {
      adicionarRegistro(raw,'Arquivos',{arquivo_id:'url-'+i,producao_id:'peca-3',versao:2,url});
    }
  },()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  assert.equal(await page.locator('#dia img').count(),0);
  assert.ok((await page.locator('#dia').textContent()).includes(text));
  const links=page.locator('#dia a');
  const hrefs=await links.evaluateAll(ns=>ns.map(n=>n.href));
  assert.ok(hrefs.length>=2);
  for(const href of hrefs) {
    const url=new URL(href);assert.equal(url.protocol,'https:');
    assert.ok(['drive.google.com','docs.google.com'].includes(url.host));
    assert.equal(url.username+url.password,'');
  }
  for(const link of await links.all()) assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
  assert.ok((await page.locator('#dia').textContent()).includes('URL inválida sintética'));
});
const estadosSelo=[
  {nome:'hoje',texto:'Atualizado hoje, 08:05',cor:'verde',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'anterior',texto:'Dados de 02/10',cor:'âmbar',fim:'2026-10-02T12:05:00Z',captura:true},
  {nome:'falha',texto:'Atualização falhou',cor:'vermelho',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'ausente',texto:'Sem dados',cor:'cinza',captura:false}
];
test('U-review m1 primeira carga falha com erro visível e filtros continuam seguros', {skip}, async t=>{
  const page=await abrir(t,1440,false,()=>{},dir=>{
    fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'atual.json'),'{');
  });
  await page.locator('#erro').waitFor({state:'visible'});
  assert.equal(await page.locator('#selo').textContent(),'Consulta indisponível');
  assert.equal(await page.locator('#abrir-sem-data').isVisible(),false);
  await page.getByRole('button',{name:'Imagem',exact:true}).click();
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.equal(await page.locator('#erro').isVisible(),true);
  assert.equal(await page.locator('[data-producao-id]').count(),0);
});

test('U-review m1 Atualizar dados permanece desabilitado enquanto GET está pendente', {skip}, async t=>{
  const page=await abrir(t);
  await page.locator('#calendario [data-producao-id]').first().waitFor();
  await page.locator('#selo').click();
  let liberar,recebido;
  const barreira=new Promise(resolve=>{liberar=resolve;}),entrada=new Promise(resolve=>{recebido=resolve;});
  await page.route('**/api/visao',async route=>{recebido();await barreira;await route.continue();});
  const button=page.getByRole('button',{name:'Atualizar dados',exact:true});
  const response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  try {
    await button.click();await entrada;
    assert.equal(await button.isDisabled(),true);
  } finally {liberar();}
  await response;
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
});

for(const captura of [false,true]) {
  test('U-review link Sem data fica oculto sem peças sem data, captura '+captura, {skip}, async t=>{
    const page=await abrir(t,1440,captura,raw=>mudarCelula(raw,'Produções',6,'data_prevista','2026-10-03'));
    await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
    assert.equal(await page.locator('#abrir-sem-data').isVisible(),false);
  });
}
for(const scenario of estadosSelo) {
  test('U03 selo '+scenario.nome+' aparece nas três telas e abre detalhes locais', {skip}, async t=>{
    const page=await abrir(t,1440,scenario.captura,raw=>{
      redefinirHorario(raw,scenario.fim.replace('05:00Z','00:00Z'),scenario.fim);
    },dir=>{
      if(scenario.nome==='falha' || !scenario.captura) {
        const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
      }
    });
    await page.locator('#planejamento').waitFor({state:'visible'});
    for(const tela of ['planejamento','producao','planilha']) {
      await page.locator('[data-tela="'+tela+'"]').click();
      assert.equal(await page.locator('#selo').textContent(),scenario.texto);
      assert.ok((await page.locator('#selo').getAttribute('class')).split(' ').includes(scenario.cor));
      assert.equal(await page.locator('#selo').isVisible(),true);
      await page.locator('#selo').click();
      assert.equal(await page.locator('#planilha').isVisible(),true);
    }
    assert.equal(await page.locator('#fonte-captura').textContent(),'Captura pela Central');
    assert.equal(await page.getByRole('button',{name:'Atualizar dados',exact:true}).isVisible(),true);
    assert.match(await page.locator('#releitura-aviso').textContent(),/Reler captura local; não consulta o Google/);
    if(scenario.captura) {
      assert.match(await page.locator('#fim-captura').textContent(),scenario.nome==='anterior'?/02\/10\/2026.*09:05/:/04\/10\/2026.*08:05/);
      assert.equal(await page.locator('#periodo-captura').textContent(),'28/09/2026 a 04/10/2026');
    } else {
      assert.equal(await page.locator('#fim-captura').textContent(),'Sem captura disponível');
      assert.equal(await page.locator('#periodo-captura').textContent(),'Cobertura não disponível');
    }
    if(scenario.nome==='falha') {
      assert.match(await page.locator('#avisos-captura').textContent(),/Última importação falhou; captura anterior preservada/);
      assert.equal(await page.locator('#avisos-captura').getAttribute('role'),'status');
    }
  });
}
test('U04 celular relê só API local, conserva falha/horário e recupera erro sem apagar dados', {skip}, async t=>{
  let dataDir;
  const page=await abrir(t,390,true,raw=>redefinirHorario(raw,'2026-10-04T11:00:00Z','2026-10-04T11:05:00Z'),dir=>{
    dataDir=dir;const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
  });
  await page.locator('#planejamento').waitFor({state:'visible'});
  await page.locator('#selo').click();
  const seen=[];page.on('request',req=>seen.push({url:new URL(req.url()).pathname,method:req.method()}));
  const pointer=path.join(dataDir,'atual.json'),before=fs.readFileSync(pointer,'utf8');
  const button=page.getByRole('button',{name:'Atualizar dados',exact:true});
  let response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await button.click();await response;
  await button.waitFor({state:'visible'});
  assert.equal(await page.locator('#selo').textContent(),'Atualização falhou');
  assert.match(await page.locator('#fim-captura').textContent(),/04\/10\/2026.*08:05/);
  assert.equal(fs.readFileSync(pointer,'utf8'),before);
  assert.equal(await page.locator('#planilha').isVisible(),true);
  const newer=capturaValida();newer.capturaId='captura-releitura';
  redefinirHorario(newer,'2026-10-04T11:20:00Z','2026-10-04T11:30:00Z');promoverCaptura(newer,dataDir);
  response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await button.click();await response;
  await page.getByRole('button',{name:'Atualizado hoje, 08:30',exact:true}).waitFor();
  assert.match(await page.locator('#fim-captura').textContent(),/08:30/);
  assert.ok(!(await page.locator('#avisos-captura').textContent()).includes('Última importação falhou'));
  const saved=fs.readFileSync(pointer,'utf8');fs.writeFileSync(pointer,'{');
  try {
    response=page.waitForResponse(r=>r.url().endsWith('/api/visao') && r.status()===503);
    await button.click();await response;
    await page.locator('#erro').waitFor({state:'visible'});
    assert.equal(await page.locator('#selo').textContent(),'Atualizado hoje, 08:30');
    assert.equal(await page.locator('#planilha').isVisible(),true);
    assert.equal(await button.isEnabled(),true);
  } finally {fs.writeFileSync(pointer,saved);}
  assert.deepEqual(seen,[{url:'/api/visao',method:'GET'},{url:'/api/visao',method:'GET'},{url:'/api/visao',method:'GET'}]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});
test('U01 menu exato, objetivo mensal indefinido e dia múltiplo', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('#planejamento').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('nav [data-tela]').allTextContents(),['Planejamento','Produção','Planilha']);
  assert.match(await page.locator('#objetivo-mes').textContent(),/Ainda não definido/);
  assert.equal(await page.getByRole('button',{name:'Plano do mês'}).count(),0);
  assert.equal(await page.locator('#calendario [data-producao-id="peca-3"]').count(),1);
  assert.equal(await page.locator('#calendario [data-producao-id="peca-4"]').count(),0);
  assert.equal(await page.getByRole('button',{name:'+1 no dia',exact:true}).count(),1);
  assert.equal(await page.getByRole('button',{name:'1 sem data',exact:true}).count(),1);
});
test('U01 lista/filtros conservam identidades e sem data não depende do mês', {skip}, async t => {
  const page=await abrir(t);
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-3','peca-4','peca-6']);
  await page.getByRole('button',{name:'Imagem',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-6']);
  await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
  await page.getByRole('button',{name:'1 sem data',exact:true}).click();
  assert.equal(await page.locator('#sem-data [data-producao-id="peca-6"]').count(),1);
  assert.match(await page.locator('#sem-data').textContent(),/Conexões do cotidiano/);
  await page.getByRole('button',{name:'Todos',exact:true}).click();
  await page.getByRole('button',{name:'Mês anterior',exact:true}).click();
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.equal(await page.locator('#lista [data-producao-id]').count(),5);
});
test('U02 celular começa em lista/menu recolhido e não tem corte horizontal', {skip}, async t => {
  const page=await abrir(t,390);
  await page.locator('#lista').waitFor({state:'visible'});
  assert.equal(await page.locator('#calendario').isVisible(),false);
  assert.equal(await page.locator('nav').isVisible(),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.getByRole('button',{name:'Abrir menu',exact:true}).click();
  assert.equal(await page.locator('nav').isVisible(),true);
  await page.getByRole('button',{name:'Planejamento',exact:true}).click();
  assert.equal(await page.locator('nav').isVisible(),false);
});
test('U02 desktop sem corte e ausência real sem fallback de demonstração', {skip}, async t => {
  const page=await abrir(t,1440,false);
  await page.getByText('Peça a primeira leitura à Central.',{exact:true}).waitFor();
  assert.equal(await page.locator('[data-producao-id]').count(),0);
  assert.equal(await page.getByRole('button',{name:'Sem dados',exact:true}).count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
test('U01 peça remarcada fora do período semanal aparece no mês civil em ambas as vistas', {skip}, async t => {
  const page=await abrir(t,1440,true,raw=>mudarCelula(raw,'Produções',3,'data_prevista','2026-11-10'));
  assert.equal(await page.locator('#calendario [data-producao-id="peca-3"]').count(),0);
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.equal(await page.locator('#lista [data-producao-id="peca-3"]').count(),0);
  await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
  await page.getByRole('button',{name:'Calendário',exact:true}).click();
  assert.equal(await page.locator('#calendario [data-producao-id="peca-3"]').count(),1);
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  assert.equal(await page.locator('#lista [data-producao-id="peca-3"]').count(),1);
  assert.match(await page.locator('#lista').textContent(),/Conexões do cotidiano/);
  assert.equal(await page.getByRole('button',{name:'1 sem data',exact:true}).count(),1);
});

test('U-review rótulos conhecidos são legíveis; desconhecido e API preservam o original', {skip}, async t => {
  const page=await abrir(t,1440,true,raw=>{
    const table=raw.tables.Produções, header=table.values[0];
    for (const [id,status] of [['peca-7','cancelada'],['peca-8','estado_NOVO-Sintético']]) {
      const row=table.values[1].slice();
      row[header.indexOf('producao_id')]=id;
      row[header.indexOf('status')]=status;
      table.values.push(row);
    }
    for (const [i,status] of [[1,'em_planejamento'],[2,'pronto'],[3,'publicado'],[4,'erro'],[6,'cancelado']]) mudarCelula(raw,'Produções',i,'status',status);
  });
  await page.locator('#calendario [data-producao-id="peca-1"]').waitFor();
  assert.equal(await page.locator('#calendario [data-producao-id="peca-1"] .status').textContent(),'Em planejamento');
  await page.getByRole('button',{name:'Lista',exact:true}).click();
  for (const [id,label] of [['peca-1','Em planejamento'],['peca-2','Pronto'],['peca-3','Publicado'],['peca-4','Erro'],['peca-6','Cancelado'],['peca-7','Cancelada'],['peca-8','estado_NOVO-Sintético']]) {
    assert.equal(await page.locator('#lista [data-producao-id="'+id+'"] .row-status').textContent(),label);
  }
  const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json()));
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-1').status,'em_planejamento');
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-8').status,'estado_NOVO-Sintético');
});
test('U-review mês tem inicial maiúscula e preposição minúscula na apresentação', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('.calendar-grid').waitFor();
  assert.equal(await page.locator('#mes').textContent(),'Outubro de 2026');
  assert.equal(await page.locator('#mes').evaluate(el=>getComputedStyle(el).textTransform),'none');
  await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
  assert.equal(await page.locator('#mes').textContent(),'Novembro de 2026');
});
test('U-review calendário elimina semanas inteiras fora do mês, inclusive fevereiro de quatro semanas', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('.calendar-grid').waitFor();
  assert.equal(await page.locator('.calendar-grid > .day').count(),35);
  assert.equal(await page.locator('.calendar-grid').getByRole('button',{name:'2 de novembro',exact:true}).count(),0);
  for (let i=0;i<4;i++) await page.getByRole('button',{name:'Próximo mês',exact:true}).click();
  assert.equal(await page.locator('.calendar-grid > .day').count(),28);
  assert.equal(await page.locator('.calendar-grid').getByRole('button',{name:'1 de março',exact:true}).count(),0);
  assert.equal(await page.locator('.calendar-grid .outside').count(),0);
});
test('U-review fundo lateral cobre a página longa e a página menor que a janela', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('.calendar-grid').waitFor();
  const coberta=()=>page.evaluate(()=>{
    const sidebar=document.querySelector('.sidebar').getBoundingClientRect();
    return {sidebar:sidebar.height,pagina:document.documentElement.scrollHeight};
  });
  const longa=await coberta();
  // scrollHeight é inteiro; o retângulo CSS pode medir frações do último pixel.
  assert.ok(Math.ceil(longa.sidebar)>=longa.pagina,JSON.stringify(longa));
  await page.setViewportSize({width:1440,height:1600});
  const curta=await coberta();
  assert.ok(Math.ceil(curta.sidebar)>=curta.pagina,JSON.stringify(curta));
});
