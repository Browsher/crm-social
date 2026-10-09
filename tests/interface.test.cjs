const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,capturaDetalhada,capturaQuadro,adicionarRegistro,mapaQuadroValido,mapaQuadroSintetico,temporario,recalcularHashes,mudarCelula,redefinirHorario}=require('./fixtures.cjs');
const {campos,capturaPlanilha,capturaEscala}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const CI=process.env.CI==='true';
const skip=CI?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
const {capturaMeses}=require('./fixtures.cjs');
for(const width of [1440,390]) test('U003 API preserva Meses completa, duplicatas e avisos sem tabelas na interface em '+width,{skip},async t=>{
  const rows=[['2026-10','ntv','A','A\nB\nC\nD\nE\nF\nG'],[],['2026-10','ntv','B','Outra pauta'],['2026-10','outra','C','Ignorar']];
  const page=await abrir(t,width,true,()=>{},()=>{},()=>capturaMeses(rows));
  const view=await consultarVisao(page),meses=view.planilha.find(a=>a.nome==='Meses');
  assert.deepEqual(view.planilha.map(a=>a.nome),['Semanas','Produções','Páginas','Cenas','Arquivos','Revisoes','Meses']);
  assert.deepEqual(meses.cabecalhos,['mes','marca_id','objetivo','pautas']);
  assert.equal(meses.quantidadeLinhas,2);assert.equal(meses.linhas.length,2);
  assert.equal(meses.linhas[0].pautas,'A\nB\nC\nD\nE\nF\nG');
  assert.deepEqual(view.avisos.filter(a=>a.aba==='Meses'&&a.motivo==='Mês e marca repetidos')
    .map(a=>[a.aba,String(a.linha),a.campo,a.motivo]),[['Meses','2','mes','Mês e marca repetidos'],['Meses','4','mes','Mês e marca repetidos']]);
  await semPlanilhaVisual(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
test('U003 API Meses vazia existe e histórico localiza falha estrutural',{skip},async t=>{
  const page=await abrir(t,390,true,()=>{},dir=>{
    const bad=capturaMeses();bad.capturaId='meses-historico-incompleta';bad.tables.Meses.complete=false;promoverCaptura(bad,dir);
  },()=>capturaMeses([]));
  const view=await consultarVisao(page),meses=view.planilha.find(a=>a.nome==='Meses');
  assert.equal(meses.quantidadeLinhas,0);assert.deepEqual(meses.linhas,[]);
  assert.equal(view.historico[0].resultado,'falhou');assert.match(view.historico[0].motivoResumo,/Meses complete: inválido/);
  await semPlanilhaVisual(page);
});
for(const width of [1440,390]) test('U003 card acompanha mês, conserva texto literal e não cria ações em '+width,{skip},async t=>{
  const page=await abrir(t,width,true,()=>{},()=>{},()=>capturaMeses([
    ['2026-10','ntv','Objetivo de outubro sintético',' Primeira\r\n\r\n Segunda \nTerceira\nQuarta\nQuinta\nSexta\nSétima'],
    ['2026-10','outra','Outra marca','Ignorar'],['2026-11','ntv','<img src=x onerror=alert(1)>','<b>Pauta literal</b>']
  ]));
  const card=page.locator('#objetivo-mes');
  assert.match(await card.textContent(),/Objetivo de outubro sintético/);
  assert.deepEqual(await card.locator('li').allTextContents(),['Primeira','Segunda','Terceira','Quarta','Quinta']);
  assert.equal(await card.locator('.more-topics').textContent(),'+2 pautas');assert.equal(await card.locator('a,input,textarea,img').count(),0);
  await moverMes(page,1);
  assert.match(await card.textContent(),/<img src=x onerror=alert\(1\)>/);
  assert.deepEqual(await card.locator('li').allTextContents(),['<b>Pauta literal</b>']);
  await moverMes(page,1);
  assert.match(await card.textContent(),/Ainda não definido/);assert.equal(await card.locator('li').count(),0);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
for(const [nome,rows,objetivo,itens] of [
  ['ausente',null,'Ainda não definido',[]],['vazia',[],'Ainda não definido',[]],
  ['objetivo vazio',[['2026-10','ntv','','Pauta A']],'Ainda não definido',['Pauta A']],
  ['tipos inválidos',[['2026-10','ntv',12,true]],'Ainda não definido',[]],
  ['cinco',[['2026-10','ntv','Objetivo +2','Pauta +2\nB\nC\nD\nE']],'Objetivo +2',['Pauta +2','B','C','D','E']],
  ['zero',[['2026-10','ntv','Objetivo',' \r\n\n']],'Objetivo',[]],
  ['duplicada',[['2026-10','ntv','A','Pauta A'],['2026-10','ntv','B','Pauta B']],'A confirmar',[]]
]) test('U003 card '+nome,{skip},async t=>{
  const page=await abrir(t,390,true,()=>{},()=>{},rows===null?capturaValida:()=>capturaMeses(rows));
  const card=page.locator('#objetivo-mes');assert.equal((await card.locator('#objetivo-toggle').textContent()).replace(/^🎯 .* — /,''),objetivo);
  assert.deepEqual(await card.locator('li').allTextContents(),itens);assert.equal(await card.locator('.more-topics').count(),0);
});
for(const width of [1440,390]) {
  test('U003 objetivo mantém texto completo ao navegar entre definido e placeholders em '+width,{skip},async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},()=>capturaMeses([
      ['2026-10','ntv','Objetivo sintético definido','Pauta A'],['2026-11','ntv','','Pauta sem objetivo'],
      ['2026-12','ntv','A','Pauta A'],['2026-12','ntv','B','Pauta B']]));
    const objetivo=page.locator('#objetivo-toggle');
    assert.match(await objetivo.textContent(),/Objetivo sintético definido/);
    await moverMes(page,1);assert.match(await objetivo.textContent(),/Ainda não definido/);
    await moverMes(page,1);assert.match(await objetivo.textContent(),/A confirmar/);
    await moverMes(page,-1);await moverMes(page,-1);assert.match(await objetivo.textContent(),/Objetivo sintético definido/);
    assert.equal(await objetivo.getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#pautas-mes').isVisible(),false);
  });
  for(const [nome,pautas,marcador] of [
    ['singular','A\nB\nC\nD\nE\nF','+1 pauta'],
    ['plural','A\nB\nC\nD\nE\nF\nG','+2 pautas']
  ]) test('U003 pautas restantes com rótulo '+nome+' em '+width,{skip},async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},()=>capturaMeses([
      ['2026-10','ntv','Objetivo +2','Pauta +2\nB\nC\nD\nE'],
      ['2026-11','ntv','Objetivo seguinte',pautas],['2026-12','ntv','Objetivo sem pautas','']
    ]));
    const card=page.locator('#objetivo-mes');
    assert.equal(await card.locator('li').count(),5);
    assert.equal(await card.locator('.more-topics').count(),0);
    await moverMes(page,1);
    const texto=await card.locator('.more-topics').textContent();
    assert.equal(await card.locator('li').count(),5);
    await moverMes(page,1);
    assert.equal(await card.locator('li').count(),0);
    assert.equal(await card.locator('.more-topics').count(),0);
    assert.equal(texto,marcador,'O restante deve identificar pautas e flexionar o singular');
  });
  test('U003 card e avisos concordam para mês válido, duplicatas e espaços inválidos em '+width,{skip},async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},()=>capturaMeses([
      ['2026-10','ntv','Objetivo único','Pauta única'],['2026-10','outra','Ignorar','Ignorar'],
      ['2026-11','ntv','Objetivo A','Pauta A'],[],['2026-11','ntv','Objetivo B','Pauta B'],
      ['2026-11','outra','Ignorar','Ignorar'],[' 2026-12 ','ntv','Não selecionar','Não selecionar'],
      [' 2026-12 ','outra','Ignorar','Ignorar']
    ]));
    const card=page.locator('#objetivo-mes');
    await moverMes(page,0);assert.match(await page.locator('#mes').textContent(),/Outubro.*2026/);
    assert.equal((await card.locator('#objetivo-toggle').textContent()).replace(/^🎯 .* — /,''),'Objetivo único');
    assert.deepEqual(await card.locator('li').allTextContents(),['Pauta única']);
    await moverMes(page,1);
    assert.match(await page.locator('#mes').textContent(),/Novembro.*2026/);
    assert.equal((await card.locator('#objetivo-toggle').textContent()).replace(/^🎯 .* — /,''),'A confirmar');
    assert.equal(await card.locator('li').count(),0);
    await moverMes(page,1);
    assert.match(await page.locator('#mes').textContent(),/Dezembro.*2026/);
    assert.equal((await card.locator('#objetivo-toggle').textContent()).replace(/^🎯 .* — /,''),'Ainda não definido');
    assert.equal(await card.locator('li').count(),0);
    const view=await consultarVisao(page);assert.equal(view.planilha.find(a=>a.nome==='Meses').quantidadeLinhas,4);
    const avisos=view.avisos.filter(a=>a.aba==='Meses').map(a=>[a.aba,String(a.linha),a.campo,a.motivo])
      .sort((a,b)=>Number(a[1])-Number(b[1]));
    assert.deepEqual(avisos,[['Meses','4','mes','Mês e marca repetidos'],
      ['Meses','6','mes','Mês e marca repetidos'],['Meses','8','mes','Mês inválido']]);
  });
}
async function abrir(t,width=1440,captura=true,editar=()=>{},depois=()=>{},fixture=capturaValida,mapa=mapaQuadroValido(),incluirSemData=true) {
  t.mock.timers.enable({apis:['Date'],now:new Date('2026-10-04T12:00:00Z')});
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE || 'playwright');
  const root=temporario(t), dataDir=path.join(root,'dados'), quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapa));
  if (captura) {
    const raw=fixture(), table=raw.tables.Produções;
    const row=table.values[1].slice();
    row[table.values[0].indexOf('producao_id')]='peca-6';
    row[table.values[0].indexOf('titulo')]='Sem data sintética';
    row[table.values[0].indexOf('data_prevista')]='';
    if(incluirSemData)table.values.push(row);
    editar(raw);
    promoverCaptura(recalcularHashes(raw),dataDir);
  }
  depois(dataDir);
  const midia={obter:async()=>{throw Object.assign(new Error('Prévia sintética indisponível'),{status:503});}};
  const server=criarServidor({dataDir,quadroConfigPath,port:0,midia,atualizar:async()=>({resultado:'sem_alteracao'})});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  let browser;
  t.after(async()=>{
    try {if(browser) await browser.close();}
    finally {await new Promise(resolve=>server.close(resolve));}
  });
  browser=await chromium.launch();
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
  await page.locator('#objetivo-toggle:not(:empty), #erro:not([hidden])').first().waitFor({state:'visible'});
  return page;
}
test('U05 filtro e clique na segunda peça abrem o dia inteiro em acordeões com Esc/foco', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.getByRole('button',{name:'Reels',exact:true}).click();
  const trigger=page.locator('#lista [data-producao-id="peca-4"]');
  await trigger.click();
  const pecas=page.locator('#dia .peca-acordeao');
  assert.equal(await pecas.count(),2);
  assert.deepEqual(await pecas.evaluateAll(nodes=>nodes.map(n=>n.dataset.peca)),['peca-3','peca-4']);
  assert.deepEqual(await pecas.evaluateAll(nodes=>nodes.map(n=>n.open)),[true,false]);
  assert.match(await page.locator('#dia-titulo').textContent(),/sexta-feira.*02.*outubro/);
  assert.equal(await page.locator('#dia-quantidade').textContent(),'2 peças registradas');
  await pecas.nth(1).locator(':scope > summary').focus();await page.keyboard.press('Enter');
  assert.equal(await pecas.nth(1).evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dia').isVisible(),false);
  assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
});

test('U05 dia/lista e dia vazio: no máximo dois acionamentos, sem recortar a gaveta', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.evaluate(()=>{window.acionamentos=0;document.addEventListener('click',()=>window.acionamentos++,true);});
  await page.locator('.planning-day[data-data="2026-10-02"] .planning-day-heading').click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  assert.equal(await page.evaluate(()=>window.acionamentos),1);
  assert.ok(await page.locator('#dia').evaluate(n=>n.scrollWidth<=n.clientWidth));
  assert.ok(await page.locator('.drawer-body').evaluate(n=>n.scrollWidth<=n.clientWidth));
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  assert.equal(await page.evaluate(()=>window.acionamentos),2);
  assert.equal(await page.locator('#dia [data-peca="peca-4"]').evaluate(n=>n.open),true);
  await page.getByRole('button',{name:'Fechar dia',exact:true}).click();
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  await page.locator('#lista [data-producao-id="peca-4"]').click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  await page.locator('.planning-day[data-data="2026-10-03"] .planning-day-heading').click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),0);
  assert.match(await page.locator('#dia-pecas').textContent(),/Nenhuma peça registrada/);
});

test('U06 versões/páginas/cenas e revisão vigente não se misturam ao histórico', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"]');
  assert.deepEqual(await carousel.locator('[data-unidades="paginas"] [data-versao="2"] [data-pagina]').evaluateAll(ns=>ns.map(n=>n.dataset.pagina)),['pagina-02','pagina-01']);
  assert.match(await carousel.textContent(),/Design novo: A confirmar/);
  const current=carousel.locator('[data-revisoes="vigentes"]');
  assert.match(await current.textContent(),/Revisar · versão 2 — Conferir texto de exemplo/);
  assert.ok(!(await current.textContent()).includes('revisao-resolvida'));
  assert.ok(!(await current.textContent()).includes('revisao-antiga'));
  assert.match(await carousel.locator('[data-revisoes="resolvidas"]').textContent(),/versão 2.*resolvida/s);
  assert.equal(await carousel.locator('[data-revisoes="resolvidas"]').getAttribute('class'),'detail-section history');
  assert.doesNotMatch(await carousel.textContent(),/Com quem está|Equipe sintética/);
  assert.doesNotMatch(await current.textContent(),/Corrige:|Correção sintética/);
  assert.equal(await carousel.locator('.publication').count(),0);
  const reels=page.locator('#dia [data-peca="peca-4"]');await reels.locator('summary').first().click();
  assert.deepEqual(await reels.locator('[data-cena]').evaluateAll(ns=>ns.map(n=>n.dataset.cena)),['cena-02','cena-01']);
  assert.match(await reels.textContent(),/imagens ausentes/);
});

test('U06 review: API conserva escopo de página, cena e arquivo; linha visual não expõe IDs', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Revisoes',2,'pagina_id','pagina-02');mudarCelula(raw,'Revisoes',2,'arquivo_id','arquivo-pagina');
    adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-cena',producao_id:'peca-4',cena_id:'cena-02',arquivo_id:'arquivo-clipe',versao:1,estado_tratamento:'aberta'});
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"] [data-revisoes="vigentes"]');
  assert.doesNotMatch(await carousel.textContent(),/pagina-02|arquivo-pagina|revisao-atual|Decisão:|Versão:|Motivo:/);
  const reels=page.locator('#dia [data-peca="peca-4"]');await reels.locator('summary').first().click();
  assert.doesNotMatch(await reels.locator('[data-revisoes="vigentes"]').textContent(),/cena-02|arquivo-clipe|revisao-cena/);
  const view=await (await page.request.get(new URL('/api/visao',page.url()).href)).json();
  const r=view.producoes.find(p=>p.producao_id==='peca-3').detalhes.revisoes.vigentes[0];
  assert.deepEqual([r.revisao_id,r.pagina_id,r.arquivo_id],['revisao-atual','pagina-02','arquivo-pagina']);
  const c=view.producoes.find(p=>p.producao_id==='peca-4').detalhes.revisoes.vigentes[0];
  assert.deepEqual([c.revisao_id,c.cena_id,c.arquivo_id],['revisao-cena','cena-02','arquivo-clipe']);
});

test('U06 review: API conserva avisos localizados; gaveta remove atalhos de dados', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Páginas',1,'indice',-1);mudarCelula(raw,'Páginas',2,'indice',-1);
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const response=await page.request.get(new URL('/api/visao',page.url()).href),view=await response.json();
  const avisos=view.producoes.find(p=>p.producao_id==='peca-3').detalhes.avisos;
  assert.ok(avisos.some(a=>a.aba==='Páginas' && a.linha===2 && a.campo==='indice'));
  assert.ok(avisos.some(a=>a.aba==='Páginas' && a.linha===3 && a.campo==='indice'));
  const carousel=page.locator('#dia [data-peca="peca-3"]');
  assert.doesNotMatch(await carousel.textContent(),/linha [23]|Inteiro positivo inválido|arquivo_imagem_id/);
  assert.equal(await carousel.locator('.data-notice').count(),0);
  assert.equal(await carousel.getByRole('link',{name:'ver na Planilha'}).count(),0);
  assert.equal(await page.locator('#dia').isVisible(),true);
  await semPlanilhaVisual(page);
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
  await page.locator('#abrir-sem-data').click();await page.locator('#lista-sem-data [data-producao-id="peca-6"]').click();
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
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  assert.equal(await page.locator('#dia .peca-acordeao > summary img, #dia [data-textos] img').count(),0);
  assert.equal(await page.locator('#dia [data-peca="peca-3"] > summary strong').textContent(),text);
  assert.equal(await page.locator('#dia [data-peca="peca-3"] [data-textos]').getByText('Página 1 · versão 2 · Corpo: '+text,{exact:true}).textContent(),'Página 1 · versão 2 · Corpo: '+text);
  const imagens=await page.locator('#dia img').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));
  assert.ok(imagens.length>0);
  assert.ok(imagens.every(src=>typeof src==='string'&&src.startsWith('/api/midia/')));
  assert.ok((await page.locator('#dia').textContent()).includes(text));
  const links=page.locator('#dia a[target="_blank"]');
  const hrefs=await links.evaluateAll(ns=>ns.map(n=>n.href));
  assert.deepEqual([...new Set(hrefs)].sort(),['https://docs.google.com/document/d/exemplo-sintetico','https://docs.google.com/document/d/segundo-sintetico','https://drive.google.com/file/d/exemplo-sintetico']);
  for(const href of hrefs) {
    const url=new URL(href);assert.equal(url.protocol,'https:');
    assert.ok(['drive.google.com','docs.google.com'].includes(url.host));
    assert.equal(url.username+url.password,'');
  }
  for(const link of await links.all()) assert.equal(await link.getAttribute('rel'),'noopener noreferrer');
  assert.ok(!(await page.locator('#dia').textContent()).includes('URL inválida sintética'));
});

test('U-review I1 gaveta não ecoa URL recusada nem parte de credencial sintética', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Arquivos',2,'url','https://usuario-sintetico:senha-sintetica@docs.google.com/x');
    mudarCelula(raw,'Produções',3,'url_video_final','https://usuario-sintetico:senha-sintetica@docs.google.com:porta-invalida');
    adicionarRegistro(raw,'Arquivos',{arquivo_id:'url-recusada',producao_id:'peca-3',versao:2,url:'https://servidor-sintetico.invalid/registro-recusado'});
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const body=await page.locator('#dia').textContent();
  assert.doesNotMatch(body,/usuario-sintetico|senha-sintetica|servidor-sintetico\.invalid|registro-recusado/);
  const response=await page.request.get(new URL('/api/visao',page.url()).href);
  assert.doesNotMatch(await response.text(),/usuario-sintetico|senha-sintetica/);
});
const estadosSelo=[
  {nome:'hoje',texto:'Atualizado hoje, 08:05',cor:'verde',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'anterior',texto:'Dados de 02/10/2026 às 09:05',cor:'âmbar',fim:'2026-10-02T12:05:00Z',captura:true},
  {nome:'falha',texto:'Atualização falhou · dados de 04/10/2026 às 08:05',cor:'vermelho',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'ausente',texto:'Atualização falhou · sem dados',cor:'vermelho',captura:false}
];

test('U-regressao gaveta mantém o texto ao redor da credencial sem recebê-la', {skip}, async t=>{
  const url='https://pessoa-ficticia:senha-ficticia@docs.google.com/x';
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Produções',3,'legenda','Leia ('+url+'). Depois siga @perfil.');
    mudarCelula(raw,'Arquivos',2,'origens_json',JSON.stringify({texto:'Veja '+url+' antes de revisar',contato:'equipe@example.invalid'}));
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const texto=page.locator('#dia [data-peca="peca-3"] details[data-textos]');
  await texto.locator('summary').click();
  assert.equal(await texto.locator(':scope > p').first().textContent(),'Leia ([conteúdo suprimido]). Depois siga @perfil.');
  assert.doesNotMatch(await page.locator('#dia').textContent(),/pessoa-ficticia|senha-ficticia/);
  const response=await page.request.get(new URL('/api/visao',page.url()).href);
  const body=await response.text();assert.doesNotMatch(body,/pessoa-ficticia|senha-ficticia/);
  const view=JSON.parse(body),arquivo=view.producoes.find(p=>p.producao_id==='peca-3').detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina');
  assert.equal(arquivo.origens_json,JSON.stringify({texto:'Veja [conteúdo suprimido] antes de revisar',contato:'equipe@example.invalid'}));
});

test('U-regressao legenda com domínio puro e @perfil permanece inteira na gaveta', {skip}, async t=>{
  const literal='Saiba mais em https://exemplo.invalid e siga @perfil';
  const page=await abrir(t,390,true,raw=>mudarCelula(raw,'Produções',3,'legenda',literal),()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const texto=page.locator('#dia [data-peca="peca-3"] details[data-textos]');
  await texto.locator('summary').click();
  assert.equal(await texto.locator(':scope > p').first().textContent(),literal);
});

test('U-ultima I1 avisos da própria linha permanecem na API sem link técnico da gaveta', {skip}, async t=>{
  for(const [aba,row,campo,value] of [
    ['Produções',3,'data_prevista',''],['Produções',3,'semana_id','semana-ausente'],
    ['Produções',3,'url_video_final','https://pessoa-ficticia:senha-ficticia@docs.google.com/x'],
    ['Arquivos',2,'url','https://pessoa-ficticia:senha-ficticia@drive.google.com/x']
  ]) await t.test(campo+' '+aba,async sub=>{
    const page=await abrir(sub,1440,true,raw=>mudarCelula(raw,aba,row,campo,value),()=>{},capturaDetalhada);
    const view=await (await page.request.get(new URL('/api/visao',page.url()).href)).json();
    const d=view.producoes.find(p=>p.producao_id==='peca-3').detalhes;
    assert.ok(d.avisos.some(a=>a.aba===aba && a.linha===row+1 && a.campo===campo));
    assert.equal(d.avisos.length,4);
    if(campo==='data_prevista') {
      await page.locator('#abrir-sem-data').click();
      await page.locator('#lista-sem-data [data-producao-id="peca-3"]').click();
    } else await page.locator('#lista [data-producao-id="peca-3"]').click();
    const p=page.locator('#dia [data-peca="peca-3"]');
    assert.doesNotMatch(await p.locator(':scope>summary .piece-hint').textContent(),/avisos?/);
    assert.equal(await p.locator('.data-notice').count(),0);
    assert.equal(await p.getByRole('link',{name:'ver na Planilha'}).count(),0);
  });
});

test('U-ultima m1 arquivo ligado sem link permitido não afirma mídia ausente', {skip}, async t=>{
  for(const url of ['', 'http://drive.google.com/x', 'https://nao-permitido.invalid/x']) {
    await t.test(url || 'URL vazia',async sub=>{
      const page=await abrir(sub,1440,true,raw=>mudarCelula(raw,'Arquivos',2,'url',url),()=>{},capturaDetalhada);
      await page.locator('#lista [data-producao-id="peca-3"]').click();
      const pagina=page.locator('#dia [data-pagina="pagina-02"]');
      assert.equal(await pagina.locator('.notice').textContent(),'link não permitido');
      assert.doesNotMatch(await pagina.textContent(),/Mídia ausente/);
      assert.equal(await page.locator('#dia [data-pagina="pagina-01"] .notice').textContent(),'Mídia ausente');
    });
  }
});

test('U-ultima m3 texto registrado usa número/versão sem ID de página ou cena', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Páginas',2,'corpo','Corpo sintético da página');
    mudarCelula(raw,'Cenas',2,'texto_tela','Texto sintético da cena');
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const c=page.locator('#dia [data-peca="peca-3"] details[data-textos]');
  const r=page.locator('#dia [data-peca="peca-4"] details[data-textos]');
  await c.locator('summary').click();await r.locator('summary').click();
  assert.match(await c.textContent(),/Página 1 · versão 2 · Corpo: Corpo sintético/);
  assert.match(await r.textContent(),/Cena 1 · versão 1 · Texto na tela: Texto sintético/);
  assert.doesNotMatch(await c.textContent(),/pagina-01|pagina-02|pagina-antiga/);
  assert.doesNotMatch(await r.textContent(),/cena-01|cena-02/);
});

test('U-ultima m1 cena conserva ausência e link não permitido em um só aviso', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>mudarCelula(raw,'Arquivos',3,'url','https://nao-permitido.invalid/clipe'),()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const notice=page.locator('#dia [data-cena="cena-02"] .notice');
  assert.equal(await notice.count(),1);
  assert.equal(await notice.textContent(),'imagens ausentes; link não permitido');
});

test('U-final I1 resumo fechado distingue revisão atual, a confirmar e sem revisão', {skip}, async t=>{
  const casos=[
    {versao:1,estado:'aberta',campo:'',esperado:'revisão aberta'},
    {versao:1,estado:'aberta',campo:'pagina-inexistente',esperado:'revisão a confirmar'},
    {versao:2,estado:'aberta',campo:'',esperado:'revisão a confirmar'},
    {versao:1,estado:'resolvida',campo:'',esperado:'sem revisão'},
    {semRevisao:true,esperado:'sem revisão'}
  ];
  for(const caso of casos) {
    await t.test(JSON.stringify(caso),async sub=>{
    const page=await abrir(sub,1440,true,raw=>{
      if(!caso.semRevisao) adicionarRegistro(raw,'Revisoes',{revisao_id:'resumo-sintetico',producao_id:'peca-4',
        versao:caso.versao,estado_tratamento:caso.estado,pagina_id:caso.campo});
    },()=>{},capturaDetalhada);
    await page.locator('#lista [data-producao-id="peca-3"]').click();
    const p=page.locator('#dia [data-peca="peca-4"]');
    assert.equal(await p.evaluate(n=>n.open),false);
    const hint=await p.locator(':scope>summary .piece-hint').textContent();
    assert.ok(hint.includes(caso.esperado),JSON.stringify({caso,hint}));
    if(caso.esperado!=='sem revisão') assert.ok(!hint.includes('sem revisão'));
    await page.close();
    });
  }
});

test('U-final revisão em duas linhas e adicional com plural, sem rótulos nem ID técnico', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-extra',producao_id:'peca-3',versao:2,estado_tratamento:'aberta'});
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const current=page.locator('#dia [data-peca="peca-3"] [data-revisoes="vigentes"]');
  const first=current.locator(':scope>.review-record').first();
  assert.equal(await first.locator('span').textContent(),'Revisar · versão 2 — Conferir texto de exemplo');
  assert.equal(await first.locator('small').textContent(),'aberta');assert.doesNotMatch(await first.textContent(),/Corrige:|Correção sintética/);
  assert.doesNotMatch(await first.textContent(),/Decisão:|Versão:|Motivo:|revisao-atual/);
  assert.equal(await current.locator('details>summary').textContent(),'+2 revisões abertas');
});

test('U-final singular de página, cena e aviso e faixa sem separador pendurado', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    raw.tables.Páginas.values=raw.tables.Páginas.values.filter((row,i)=>i===0 || row[0]==='pagina-02');
    raw.tables.Cenas.values=raw.tables.Cenas.values.filter((row,i)=>i===0 || row[0]==='cena-02');
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  assert.match(await page.locator('#dia [data-peca="peca-3"] .piece-hint').textContent(),/^1 página ·/);
  assert.equal(await page.locator('#dia [data-peca="peca-4"] .piece-hint').textContent(),'1 cena · sem revisão');
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const notice=page.locator('#dia [data-peca="peca-4"] .data-notice');
  assert.equal(await notice.count(),0);
  const view=await consultarVisao(page);
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-4').detalhes.avisos.length,1);
});

test('U-final cena identifica imagem final ausente em um único aviso', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    adicionarRegistro(raw,'Arquivos',{arquivo_id:'imagem-inicio',producao_id:'peca-4',cena_id:'cena-02',versao:1,
      tipo:'imagem',url:'https://drive.google.com/file/d/inicio-sintetico'});
    mudarCelula(raw,'Cenas',2,'arquivo_imagem_inicio_id','imagem-inicio');
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const c=page.locator('#dia [data-cena="cena-02"]');
  assert.equal(await c.locator('.notice').count(),1);
  assert.equal(await c.locator('.notice').textContent(),'imagem final ausente');
});
test('U-review compacta: resumo fechado, quatro dados, publicação e etapa legível sem mudar API', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Produções',3,'publicado_em','2026-10-02T12:04:00Z');
    mudarCelula(raw,'Produções',4,'etapa_producao','Etapa_nova_original');
    mudarCelula(raw,'Produções',4,'responsavel_atual','');
  },()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"]'),reels=page.locator('#dia [data-peca="peca-4"]');
  assert.equal(await carousel.locator('.piece-facts').count(),1);
  assert.equal(await carousel.locator('.piece-facts>div').count(),3);
  assert.match(await carousel.locator('.piece-facts').textContent(),/Publicada/);
  assert.match(await carousel.locator('.publication').textContent(),/2026-10-02T12:04:00Z/);
  assert.match(await reels.locator('summary .piece-hint').textContent(),/2 cenas.*revisão/);
  assert.doesNotMatch(await reels.locator('summary .piece-hint').textContent(),/avisos?/);
  assert.equal(await reels.locator('.piece-body').isVisible(),false);
  await reels.locator('summary').first().click();
  assert.match(await reels.locator('.piece-facts').textContent(),/Criação/);
  assert.doesNotMatch(await reels.locator('.piece-facts').textContent(),/Com quem está|A confirmar/);
  const response=await page.request.get(new URL('/api/visao',page.url()).href),view=await response.json();
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-3').etapa_producao,'prompts_imagem_prontos');
});

test('U-review compacta: texto, histórico e versões anteriores recolhidos, revisão adicional +N', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"]');
  const extra=carousel.locator('[data-revisoes="vigentes"] details');
  assert.equal(await extra.locator('summary').textContent(),'+1 revisão aberta');
  assert.equal(await extra.evaluate(n=>n.open),false);
  const text=carousel.locator('details[data-textos]'),history=carousel.locator('details[data-historico]');
  for(const fold of [text,history,carousel.locator('[data-unidades="paginas"] details[data-versao="1"]')]) {
    assert.equal(await fold.evaluate(n=>n.open),false);
    await fold.locator('summary').first().click();assert.equal(await fold.evaluate(n=>n.open),true);
  }
  assert.match(await history.textContent(),/resolvida.*versão 1.*Impacto atual a confirmar/s);
  assert.match(await text.textContent(),/Texto de exemplo sem dado operacional/);
});

test('U-review compacta: páginas/cenas têm um aviso por linha e documentos só no fim do dia', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  assert.equal(await page.locator('#dia [data-documentos-dia]').count(),1);
  assert.equal(await page.locator('#dia .peca-acordeao [data-documentos-dia]').count(),0);
  assert.equal(await page.locator('#dia-pecas>*').last().getAttribute('data-documentos-dia'),'');
  const docs=page.locator('#dia [data-documentos-dia]');
  assert.deepEqual(await docs.locator('[data-papel]').evaluateAll(ns=>ns.map(n=>[n.dataset.papel,n.textContent])),
    [['Plano','Plano: documento · plano'],['Redação','Redação: —'],['Visual','Visual: —']]);
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const rows=page.locator('#dia [data-cena]');assert.equal(await rows.count(),2);
  for(const row of await rows.all()) {
    assert.equal(await row.locator('.notice').count(),1);
    assert.match(await row.textContent(),/imagens ausentes/);
  }
  assert.equal(await page.locator('#dia [data-pagina="pagina-02"] .notice').count(),0);
  assert.match(await page.locator('#dia [data-pagina="pagina-02"]').textContent(),/Página 1.*Abertura sintética/);
});

test('U-review m-B semana não identificada conserva três documentos ausentes com travessão', {skip}, async t=>{
  const page=await abrir(t,390,true,raw=>mudarCelula(raw,'Produções',3,'semana_id','semana-ausente'),()=>{},capturaDetalhada);
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const grupos=page.locator('#dia [data-documentos-dia] [data-semana]');
  assert.equal(await grupos.count(),2); // Dia também inclui o Reels da semana identificada.
  const orphan=grupos.filter({hasText:'Semana não identificada'});
  assert.deepEqual(await orphan.locator('[data-papel]').allTextContents(),['Plano: —','Redação: —','Visual: —']);
});

test('U-review m1 primeira carga falha com erro visível e filtros continuam seguros', {skip}, async t=>{
  const page=await abrir(t,1440,false,()=>{},dir=>{
    fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'atual.json'),'{');
  });
  await page.locator('#erro').waitFor({state:'visible'});
  assert.equal(await page.locator('#selo').textContent(),'Consulta indisponível');
  assert.equal(await page.locator('#abrir-sem-data').isVisible(),false);
  await page.getByRole('button',{name:'Imagem',exact:true}).click();
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  assert.equal(await page.locator('#erro').isVisible(),true);
  assert.equal(await page.locator('[data-producao-id]').count(),0);
});

test('U-review m1 Atualizar dados permanece desabilitado enquanto GET está pendente', {skip}, async t=>{
  const page=await abrir(t);
  await page.locator('#lista [data-producao-id]').first().waitFor();
  let liberar,recebido;
  const barreira=new Promise(resolve=>{liberar=resolve;}),entrada=new Promise(resolve=>{recebido=resolve;});
  await page.route('**/api/visao',async route=>{recebido();await barreira;await route.continue();});
  const button=page.getByRole('button',{name:'⟳ Atualizar',exact:true});
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
  test('U03 selo '+scenario.nome+' é indicador nas três telas; metadados permanecem na API', {skip}, async t=>{
    const page=await abrir(t,1440,scenario.captura,raw=>{
      redefinirHorario(raw,scenario.fim.replace('05:00Z','00:00Z'),scenario.fim);
    },dir=>{
      if(scenario.nome==='falha' || !scenario.captura) {
        const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
      }
    });
    await page.locator('#planejamento').waitFor({state:'visible'});
    for(const tela of ['planejamento','producao','publicar']) {
      await page.locator('[data-tela="'+tela+'"]').click();
      assert.equal(await page.locator('#selo').textContent(),scenario.texto);
      assert.ok((await page.locator('#selo').getAttribute('class')).split(' ').includes(scenario.cor));
      assert.equal(await page.locator('#selo').isVisible(),true);
      assert.equal(await page.locator('#selo').getAttribute('role'),'status');
      assert.equal(await page.locator('#'+tela).isVisible(),true);
    }
    const view=await consultarVisao(page);await semPlanilhaVisual(page);
    assert.equal(await page.getByRole('button',{name:'⟳ Atualizar',exact:true}).isVisible(),true);
    if(scenario.captura) {
      assert.equal(view.captura.completedAt,scenario.fim);
      assert.deepEqual(view.captura.periodo,{inicio:'2026-09-28',fim:'2026-10-04'});
    } else {
      assert.equal(view.captura,null);assert.deepEqual(view.producoes,[]);
    }
    if(scenario.nome==='falha') {
      assert.equal(view.ultimaTentativa.resultado,'falhou');
      assert.equal(view.historico[0].resultado,'falhou');
    }
  });
}
test('U04 celular relê só API local, conserva falha/horário e recupera erro sem apagar dados', {skip}, async t=>{
  let dataDir;
  const page=await abrir(t,390,true,raw=>redefinirHorario(raw,'2026-10-04T11:00:00Z','2026-10-04T11:05:00Z'),dir=>{
    dataDir=dir;const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
  });
  await page.locator('#planejamento').waitFor({state:'visible'});
  const seen=[];page.on('request',req=>seen.push({url:new URL(req.url()).pathname,method:req.method()}));
  const pointer=path.join(dataDir,'atual.json'),before=fs.readFileSync(pointer,'utf8');
  const button=page.getByRole('button',{name:'⟳ Atualizar',exact:true});
  let response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await button.click();await response;
  await button.waitFor({state:'visible'});
  assert.match(await page.locator('#selo').textContent(),/^Atualização falhou · dados de \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}$/);
  assert.equal((await consultarVisao(page)).captura.completedAt,'2026-10-04T11:05:00Z');
  assert.equal(fs.readFileSync(pointer,'utf8'),before);
  assert.equal(await page.locator('#planejamento').isVisible(),true);
  const newer=capturaValida();newer.capturaId='captura-releitura';
  redefinirHorario(newer,'2026-10-04T11:20:00Z','2026-10-04T11:30:00Z');promoverCaptura(newer,dataDir);
  response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await button.click();await response;
  await page.waitForFunction(()=>document.querySelector('#selo').textContent==='Atualizado hoje, 08:30');
  assert.equal((await consultarVisao(page)).captura.completedAt,'2026-10-04T11:30:00Z');
  assert.equal((await consultarVisao(page)).ultimaTentativa.resultado,'completa');
  const saved=fs.readFileSync(pointer,'utf8');fs.writeFileSync(pointer,'{');
  try {
    response=page.waitForResponse(r=>r.url().endsWith('/api/visao') && r.status()===503);
    await button.click();await response;
    await page.locator('#erro').waitFor({state:'visible'});
    assert.equal(await page.locator('#selo').textContent(),'Atualizado hoje, 08:30');
    assert.equal(await page.locator('#planejamento').isVisible(),true);
    assert.equal(await button.isEnabled(),true);
  } finally {fs.writeFileSync(pointer,saved);}
  assert.deepEqual(seen.filter(r=>r.url==='/api/atualizar'),[1,2,3].map(()=>({url:'/api/atualizar',method:'POST'})));
  assert.ok(seen.every(r=>r.url==='/api/visao'&&r.method==='GET'||r.url==='/api/atualizar'&&r.method==='POST'||r.url.startsWith('/api/midia/')&&r.method==='GET'));
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
});
test('U01 menu exato, objetivo mensal indefinido e dia múltiplo', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('#planejamento').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('nav [data-tela]').evaluateAll(ns=>ns.map(n=>n.dataset.tela)),['planejamento','producao','publicar']);
  assert.deepEqual(await page.locator('nav [data-tela]').evaluateAll(ns=>ns.map(n=>n.textContent.trim().replace(/\s*\d+\s*$/,''))),['Planejamento','Produção','Publicar']);
  assert.match(await page.locator('#objetivo-mes').textContent(),/Ainda não definido/);
  assert.equal(await page.getByRole('button',{name:'Plano do mês'}).count(),0);
  assert.equal(await page.locator('#lista [data-producao-id="peca-3"]').count(),1);
  assert.equal(await page.locator('#lista [data-producao-id="peca-4"]').count(),1);
  assert.equal(await page.getByRole('button',{name:'+1 no dia',exact:true}).count(),0);
  assert.equal(await page.getByRole('button',{name:'1 sem data',exact:true}).count(),1);
});
test('U01 lista/filtros conservam identidades e sem data não depende do mês', {skip}, async t => {
  const page=await abrir(t);
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-3','peca-4']);
  await page.getByRole('button',{name:'Imagem',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2']);
  await moverMes(page,1);
  await page.getByRole('button',{name:'1 sem data',exact:true}).click();
  assert.equal(await page.locator('#sem-data [data-producao-id="peca-6"]').count(),1);
  assert.match(await page.locator('#sem-data').textContent(),/Sem data sintética/);
  await page.getByRole('button',{name:'Todos',exact:true}).click();
  await moverMes(page,-1);
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  assert.equal(await page.locator('#lista [data-producao-id]').count(),4);
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
  await page.getByRole('heading',{name:'Nenhuma captura disponível',exact:true}).waitFor();
  assert.equal(await page.locator('[data-producao-id]').count(),0);
  assert.equal(await page.locator('#selo').textContent(),'Sem dados');assert.equal(await page.locator('#selo').getAttribute('role'),'status');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
test('U01 remarcação aparece no ponto do mês e na semana civil escolhida',{skip},async t=>{
  const page=await abrir(t,1440,true,raw=>mudarCelula(raw,'Produções',3,'data_prevista','2026-11-10'));
  assert.equal(await page.locator('#lista [data-producao-id="peca-3"]').count(),0);
  await moverMes(page,1);
  assert.equal(await page.locator('.month-dot[aria-label="Carrossel sintético · Criação"]').count(),1);
  await page.locator('#calendario [data-inicio-semana="2026-11-09"]').click();
  assert.equal(await page.locator('.planning-day[data-data="2026-11-10"] [data-producao-id="peca-3"]').count(),1);
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
  await page.locator('#lista [data-producao-id="peca-1"]').waitFor();
  assert.equal(await page.locator('#lista [data-producao-id="peca-1"] .simple-state').textContent(),'Criação');
  await page.getByRole('button',{name:'Semana',exact:true}).click();
  for (const id of ['peca-1','peca-2','peca-3','peca-4','peca-6','peca-7','peca-8']) {
    if(id==='peca-6'){await page.locator('#abrir-sem-data').click();assert.equal(await page.locator('#lista-sem-data [data-producao-id="'+id+'"]').count(),1);}else assert.equal(await page.locator('#lista [data-producao-id="'+id+'"] .simple-state').textContent(),'Criação');
  }
  const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json()));
  for(const [id,status] of [['peca-1','em_planejamento'],['peca-2','pronto'],['peca-3','publicado'],['peca-4','erro'],['peca-6','cancelado'],['peca-7','cancelada'],['peca-8','estado_NOVO-Sintético']]) {
    assert.equal(view.producoes.find(p=>p.producao_id===id).status,status);
  }
});
test('U-review mês tem inicial maiúscula e preposição minúscula na apresentação', {skip}, async t => {
  const page=await abrir(t);
  await page.locator('[data-modo="Mês"]').click();await page.locator('.month-grid').waitFor();
  assert.equal(await page.locator('#mes').textContent(),'Outubro de 2026');
  assert.equal(await page.locator('#mes').evaluate(el=>getComputedStyle(el).textTransform),'none');
  await moverMes(page,1);
  assert.equal(await page.locator('#mes').textContent(),'Novembro de 2026');
});
test('U-review calendário elimina semanas inteiras fora do mês, inclusive fevereiro de quatro semanas', {skip}, async t => {
  const page=await abrir(t);
  await moverMes(page,0);await page.locator('.month-grid').waitFor();
  assert.equal(await page.locator('.month-grid .month-day').count(),35);
  assert.equal(await page.locator('.month-day[data-data="2026-11-02"]').count(),0);
  for (let i=0;i<4;i++) await moverMes(page,1);
  assert.equal(await page.locator('.month-grid .month-day').count(),28);
  assert.equal(await page.locator('.month-day[data-data="2027-03-01"]').count(),0);
  assert.equal(await page.locator('.month-grid .outside').count(),0);
});
test('U-review fundo lateral cobre a página longa e a página menor que a janela', {skip}, async t => {
  const page=await abrir(t);
  await moverMes(page,0);await page.locator('.month-grid').waitFor();
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
test('U07 US4 projetos conservam identidades, classes da API e registros em desktop/celular',{skip},async t=>{
  for(const width of [1440,390])await t.test(width+'px',async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaQuadro,mapaQuadroSintetico(),false);
    if(width===390)await page.locator('#menu').click();await page.locator('[data-tela="producao"]').click();
    const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json())),cards=page.locator('#quadro .project-row [data-producao-id]');
    assert.deepEqual((await cards.evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),view.producoes.map(p=>p.producao_id).sort());
    assert.deepEqual(view.quadro.semanas.find(w=>w.semanaId==='semana-01').colunas.map(c=>c.nome),['Planejamento','Redação','Visual','Mídia','Revisão','Pronta','Publicada','Outras']);
    assert.equal(await page.locator('#quadro [draggable="true"],#quadro input,#quadro select,#quadro textarea,#quadro [contenteditable="true"]').count(),0);
    assert.match(await page.locator('#quadro [data-producao-id="peca-7"]').textContent(),/Travado: precisa de correção/);
    assert.equal(await page.locator('#quadro [data-producao-id="peca-9"] [aria-current="step"]').textContent(),'Publicada');
    assert.doesNotMatch(await page.locator('#quadro').textContent(),/Responsável sintético|Correção sintética|Com quem está/);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await cards.evaluateAll(ns=>ns.every(n=>n.scrollWidth<=n.clientWidth)));
    assert.match(await page.locator('#selo').textContent(),/^Dados de 02\/10\/2026 às \d{2}:\d{2}$/);
  });
});

test('U08 US4 Outras permanece Criação, projetos preservam dia inteiro e Sem data',{skip},async t=>{
  for(const width of [1440,390])await t.test(width+'px',async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaQuadro,mapaQuadroSintetico(),false);
    if(width===390)await page.locator('#menu').click();await page.locator('[data-tela="producao"]').click();
    for(const id of ['peca-10','peca-11','peca-12','peca-13'])assert.equal(await page.locator('#quadro [data-producao-id="'+id+'"] [aria-current="step"]').textContent(),'Criação');
    const trigger=page.locator('#quadro [data-producao-id="peca-3"]');await trigger.focus();await page.keyboard.press('Enter');
    assert.deepEqual(await page.locator('#dia .peca-acordeao').evaluateAll(ns=>ns.map(n=>n.dataset.peca)),['peca-10','peca-11','peca-3','peca-4','peca-7','peca-8','peca-9']);
    assert.equal(await page.locator('#dia .peca-acordeao[open]').count(),1);await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
    await page.locator('#quadro [data-producao-id="peca-12"]').click();assert.match(await page.locator('#dia-titulo').textContent(),/Sem data/);
    assert.deepEqual(await page.locator('#dia .peca-acordeao').evaluateAll(ns=>ns.map(n=>n.dataset.peca)),['peca-12']);await page.keyboard.press('Escape');
    assert.equal(await page.locator('.project[data-semana-id="semana-02"] .project-row').count(),1);
    const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json()));assert.equal(view.producoes.find(p=>p.producao_id==='peca-13').status,'publicado');
    assert.equal(view.producoes.find(p=>p.producao_id==='peca-13').quadro.coluna,'Outras');
  });
});

test('U07-vazio US4 sem captura não inventa semana, cartão ou atividade',{skip},async t=>{
  const page=await abrir(t,390,false);await page.locator('#menu').click();await page.locator('[data-tela="producao"]').click();
  assert.equal(await page.locator('#quadro-vazio').textContent(),'Nenhuma captura disponível');assert.equal(await page.locator('#quadro .project-row').count(),0);assert.equal(await page.locator('#selo').textContent(),'Sem dados');
});

test('U08 mídia só trava a coluna Mídia e conserva todas as pendências na API',{skip},async t=>{
  const page=await abrir(t,1440,true,raw=>{mudarCelula(raw,'Arquivos',1,'producao_id','peca-4');for(let i=1;i<raw.tables.Revisoes.values.length;i++)mudarCelula(raw,'Revisoes',i,'decisao','aprovado');},()=>{},capturaQuadro,mapaQuadroSintetico(),false);
  await page.locator('[data-tela="producao"]').click();const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json()));
  for(const [id,coluna] of [['peca-1','Planejamento'],['peca-2','Redação'],['peca-3','Visual'],['peca-4','Mídia'],['peca-7','Revisão'],['peca-8','Pronta'],['peca-9','Publicada'],['peca-10','Outras']]){
    const p=view.producoes.find(p=>p.producao_id===id);assert.equal(p.quadro.coluna,coluna);assert.ok(p.quadro.pendencias.some(r=>r.tipo==='midia'));
    assert.equal(await page.locator('#quadro [data-producao-id="'+id+'"] .blocked-reason').count(),coluna==='Mídia'?1:0,coluna);
  }
});

test('U08 revisão vigente substitui passos pelo motivo curto, sem responsável técnico',{skip},async t=>{
  const page=await abrir(t,390,true,raw=>mudarCelula(raw,'Arquivos',1,'producao_id','peca-4'),()=>{},capturaQuadro,mapaQuadroSintetico(),false);
  await page.locator('#menu').click();await page.locator('[data-tela="producao"]').click();const view=await page.evaluate(()=>fetch('/api/visao').then(r=>r.json()));
  assert.deepEqual(view.producoes.find(p=>p.producao_id==='peca-1').quadro.pendencias.map(r=>r.tipo),['revisao','midia']);
  for(const id of ['peca-1','peca-7']){const card=page.locator('#quadro [data-producao-id="'+id+'"]');assert.equal(await card.locator('.blocked-reason').textContent(),'Travado: precisa de correção');assert.equal(await card.locator('.production-steps').count(),0);}
});

async function consultarVisao(page) {
  return (await page.request.get(new URL('/api/visao',page.url()).href)).json();
}
async function semPlanilhaVisual(page) {
  assert.equal(await page.locator('#planilha,#dados-planilha,#abas-planilha,#avisos-dados,[data-tela="planilha"]').count(),0);
  assert.equal(await page.getByRole('link',{name:/ver na Planilha|avisos de dados/i}).count(),0);
}
function consultaComMiniaturas(seen) {
  const midias=seen.filter(r=>r.url.startsWith('/api/midia/'));
  assert.ok(midias.every(r=>r.method==='GET'));
  assert.deepEqual(seen.filter(r=>!r.url.startsWith('/api/midia/')),
    [{url:'/api/atualizar',method:'POST'},{url:'/api/visao',method:'GET'}]);
}
function celulaPorId(raw,aba,id,campo,value) {
  const table=raw.tables[aba],key=table.values[0].indexOf(campos[aba][0]);
  mudarCelula(raw,aba,table.values.findIndex((row,i)=>i>0 && row[key]===id),campo,value);
}
for(const width of [1440,390]) {
  test('U09 API conserva seis abas/66 campos e valores literais sem tabela visual em '+width, {skip},async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaPlanilha,mapaQuadroValido(),false);
    const view=await consultarVisao(page);
    assert.deepEqual(view.planilha.map(a=>a.nome),Object.keys(campos));
    assert.equal(view.captura.completedAt,'2026-10-02T12:05:00.000Z');
    assert.deepEqual(view.captura.periodo,{inicio:'2026-09-28',fim:'2026-10-11'});
    let total=0;
    for(const aba of view.planilha) {
      assert.deepEqual(aba.cabecalhos,campos[aba.nome]);total+=aba.cabecalhos.length;
      assert.equal(aba.linhas.length,aba.quantidadeLinhas);
      assert.ok(aba.linhas.every(row=>aba.cabecalhos.every(header=>Object.hasOwn(row,header))));
    }
    assert.equal(total,66);
    const arquivos=JSON.stringify(view.planilha.find(a=>a.nome==='Arquivos'));
    assert.match(arquivos,/drive-ficticio-local/);assert.ok(arquivos.includes('a'.repeat(64)));
    assert.ok(arquivos.includes('<script>conteúdo como dado</script>'));
    await semPlanilhaVisual(page);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
  test('U09 menu final funciona por teclado sem controles de tabela em '+width, {skip},async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaPlanilha,mapaQuadroValido(),false);
    await semPlanilhaVisual(page);
    for(const [tela,titulo] of [['producao','Produção'],['publicar','Publicar'],['planejamento','Planejamento']]) {
      if(width===390)await page.locator('#menu').click();
      const trigger=page.locator('[data-tela="'+tela+'"]');await trigger.focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('#titulo').textContent(),titulo);
      assert.equal(await page.locator('#'+tela).isVisible(),true);
    }
  });
  test('U10 avisos localizados permanecem na API e dados credenciados não chegam à gaveta em '+width, {skip},async t=>{
    const page=await abrir(t,width,true,raw=>{
      celulaPorId(raw,'Produções','peca-3','legenda','Antes https://usuario-sintetico-us5:senha-sintetica-us5@exemplo.invalid depois');
      celulaPorId(raw,'Produções','peca-3','url_video_final','https://usuario-sintetico-us5:senha-sintetica-us5@exemplo.invalid');
    },()=>{},capturaPlanilha,mapaQuadroValido(),false);
    const view=await consultarVisao(page),p=view.producoes.find(p=>p.producao_id==='peca-3');
    const cards='#lista';await page.locator(cards+' [data-producao-id="peca-3"]').click();
    assert.ok(p.detalhes.avisos.some(a=>a.aba==='Produções'&&a.campo==='url_video_final'));
    assert.ok(p.detalhes.avisos.every(a=>typeof a.motivo==='string'));
    assert.equal(await page.locator('#dia').isVisible(),true);await semPlanilhaVisual(page);
    assert.doesNotMatch(JSON.stringify(view),/usuario-sintetico-us5|senha-sintetica-us5/);
    assert.doesNotMatch(await page.locator('#dia').textContent(),/usuario-sintetico-us5|senha-sintetica-us5/);
    assert.ok(view.avisos.length>=p.detalhes.avisos.length);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
  test('U10 Histórico conserva completa/falhou e releitura local em '+width, {skip},async t=>{
    let dataDir;
    const page=await abrir(t,width,true,()=>{},dir=>{
      dataDir=dir;const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
    },capturaPlanilha,mapaQuadroValido(),false);
    const view=await consultarVisao(page);await semPlanilhaVisual(page);
    assert.deepEqual(view.historico.map(r=>r.resultado),['falhou','completa']);
    assert.equal(view.historico[0].motivoResumo,'Cenas complete: inválido');
    assert.ok(view.historico[0].concluidaEm);
    assert.equal(await page.locator('#dados-planilha').count(),0);
    const pointer=path.join(dataDir,'atual.json'),before=fs.readFileSync(pointer,'utf8'),seen=[];
    page.on('request',req=>seen.push({url:new URL(req.url()).pathname,method:req.method()}));
    const response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
    await page.getByRole('button',{name:'⟳ Atualizar',exact:true}).click();await response;
    await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
    assert.deepEqual((await consultarVisao(page)).historico,view.historico);
    assert.equal(fs.readFileSync(pointer,'utf8'),before);
    consultaComMiniaturas(seen);
    assert.match(await page.locator('#selo').textContent(),/^Atualização falhou · dados de \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}$/);
  });
  test('U10 sem captura conserva API vazia e não menciona agentes em '+width, {skip},async t=>{
    const page=await abrir(t,width,false),view=await consultarVisao(page);
    assert.deepEqual(view.planilha,[]);
    assert.deepEqual(view.historico,[]);await semPlanilhaVisual(page);
    assert.equal(await page.locator('#sem-captura').isVisible(),true);
    assert.doesNotMatch(await page.locator('#sem-captura').textContent(),/Central|Diretor|Estrategista|n8n/i);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  });
}
test('U10 primeira importação falha sem inventar captura; histórico permanece na API', {skip},async t=>{
  const page=await abrir(t,390,false,()=>{},dir=>{
    const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
  });
  const view=await consultarVisao(page);await semPlanilhaVisual(page);
  assert.equal(view.captura,null);assert.deepEqual(view.historico.map(r=>r.resultado),['falhou']);
  assert.equal(view.historico[0].motivoResumo,'Cenas complete: inválido');
  assert.equal(await page.locator('#selo').textContent(),'Atualização falhou · sem dados');
  assert.equal(view.ultimaTentativa.resultado,'falhou');
});
test('U10 releitura de uma nova captura atualiza dados e histórico na API sem consultar Google', {skip},async t=>{
  let dataDir;
  const page=await abrir(t,390,true,()=>{},dir=>{dataDir=dir;},capturaPlanilha,mapaQuadroValido(),false);
  assert.equal((await consultarVisao(page)).planilha.find(a=>a.nome==='Produções').quantidadeLinhas,5);
  const raw=capturaPlanilha();raw.capturaId='captura-us5-releitura';
  redefinirHorario(raw,'2026-10-04T11:20:00Z','2026-10-04T11:30:00Z');
  adicionarRegistro(raw,'Produções',{producao_id:'peca-releitura-local',marca_id:'ntv',semana_id:'semana-02',
    slot:'imagem_a',versao:1,titulo:'Peça da nova captura sintética',data_prevista:'2026-10-06'});
  promoverCaptura(raw,dataDir);
  const seen=[];page.on('request',req=>seen.push({url:new URL(req.url()).pathname,method:req.method()}));
  const response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await page.getByRole('button',{name:'⟳ Atualizar',exact:true}).click();await response;
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  const view=await consultarVisao(page);await semPlanilhaVisual(page);
  assert.equal(view.planilha.find(a=>a.nome==='Produções').quantidadeLinhas,6);
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-releitura-local').titulo,'Peça da nova captura sintética');
  assert.equal(view.captura.completedAt,'2026-10-04T11:30:00Z');
  assert.deepEqual(view.historico.map(r=>r.resultado),['completa','completa']);
  consultaComMiniaturas(seen);
});
test('U10 título longo na gaveta não provoca corte no celular', {skip},async t=>{
  const page=await abrir(t,390,true,raw=>celulaPorId(raw,'Produções','peca-3','titulo','TituloSintetico'.repeat(35)),
    ()=>{},capturaPlanilha,mapaQuadroValido(),false);
  await page.locator('#lista [data-producao-id="peca-3"]').waitFor();
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  assert.match(await page.locator('#dia [data-peca="peca-3"]>summary').textContent(),/TituloSintetico/);
  await semPlanilhaVisual(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});
test('U10 URL dedicada recusada é link não permitido; texto livre e API preservam URLs legítimas', {skip},async t=>{
  const url='https://exemplo.invalid/arquivo-sintetico';
  const page=await abrir(t,390,true,raw=>{
    celulaPorId(raw,'Arquivos','arquivo-01','url',url);
    celulaPorId(raw,'Produções','peca-3','url_video_final',url);
    celulaPorId(raw,'Produções','peca-3','legenda','Saiba mais em https://exemplo.invalid e siga @perfil');
  },()=>{},capturaPlanilha,mapaQuadroValido(),false);
  const view=await consultarVisao(page);
  assert.equal(view.planilha.find(a=>a.nome==='Arquivos').linhas.find(r=>r.arquivo_id==='arquivo-01').url,url);
  await page.locator('#lista [data-producao-id="peca-1"]').click();
  const image=page.locator('#dia [data-peca="peca-1"]');
  assert.equal(await image.locator('a[href="'+url+'"]').count(),0);
  assert.match(await image.textContent(),/link não permitido/);
  await page.keyboard.press('Escape');
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  const piece=page.locator('#dia [data-peca="peca-3"]');
  assert.equal(await piece.locator('a[href="'+url+'"]').count(),0);
  await piece.locator('details[data-textos]>summary').click();
  assert.ok((await piece.textContent()).includes('Saiba mais em https://exemplo.invalid e siga @perfil'));
});

test('U10 falha ativa e avisos permanecem na API; selo não leva a lista técnica', {skip},async t=>{
  const page=await abrir(t,390,true,()=>{},dir=>{
    const invalid=capturaValida();invalid.tables.Cenas.complete=false;promoverCaptura(invalid,dir);
  },capturaPlanilha,mapaQuadroValido(),false);
  const view=await consultarVisao(page);await semPlanilhaVisual(page);
  assert.equal(view.ultimaTentativa.resultado,'falhou');
  assert.ok(view.avisos.some(a=>a.motivo==='Última importação falhou; captura anterior preservada'));
  assert.match(await page.locator('#selo').textContent(),/^Atualização falhou · dados de \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}$/);
  assert.equal(await page.locator('#selo').getAttribute('role'),'status');
  assert.equal(await page.getByRole('button',{name:'Todos os avisos',exact:true}).count(),0);
});

test('U10 motivo de mídia é consolidado uma vez por aviso, sem repetir ausência', {skip},async t=>{
  const page=await abrir(t,1440,true,raw=>{
    adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-inicio-sintetico',producao_id:'peca-4',cena_id:'cena-02',versao:1});
    celulaPorId(raw,'Cenas','cena-02','arquivo_imagem_inicio_id','arquivo-inicio-sintetico');
  },()=>{},capturaPlanilha,mapaQuadroValido(),false);
  const view=await consultarVisao(page);
  assert.ok(view.avisos.some(a=>a.aba==='Cenas'&&a.campo==='arquivo_imagem_final_id'));
  assert.ok(view.avisos.some(a=>a.aba==='Páginas'&&a.campo==='arquivo_imagem_id'));
  await page.locator('#lista [data-producao-id="peca-3"]').click();
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const notices=await page.locator('#dia .unit-record .notice').allTextContents();
  assert.ok(notices.some(text=>/imagens ausentes/.test(text)));
  assert.ok(notices.some(text=>/imagem final ausente/.test(text)));
  assert.ok(notices.some(text=>text==='Mídia ausente'));
  assert.ok(notices.every(text=>!text.includes('neste ponteiro')));
});

test('U10 título identifica Publicar e Planejamento ao navegar de volta',{skip},async t=>{
  const page=await abrir(t,1440);await page.locator('[data-tela="publicar"]').click();assert.equal(await page.locator('#titulo').textContent(),'Publicar');
  await page.locator('[data-tela="planejamento"]').click();assert.equal(await page.locator('#titulo').textContent(),'Planejamento');
  await page.locator('[data-tela="publicar"]').click();assert.equal(await page.locator('#titulo').textContent(),'Publicar');
});

for(const width of [1440,390]) test('U11 escala de 500 peças: navegação, avisos e releitura em '+width, {skip},async t=>{
  let dataDir;
  const inicio=performance.now();
  const page=await abrir(t,width,true,()=>{},dir=>{dataDir=dir;},capturaEscala,mapaQuadroSintetico(),false);
  page.setDefaultTimeout(10000);
  await page.locator('#lista [data-producao-id]').first().waitFor();
  const cargaMs=performance.now()-inicio,apiInicio=performance.now();
  const view=await page.evaluate(async()=>fetch('/api/visao').then(r=>r.json()));
  const apiMs=performance.now()-apiInicio;
  assert.equal(view.producoes.length,500);
  assert.equal(await page.locator('#total').textContent(),'500 peças registradas');
  assert.equal(await page.locator('#abrir-sem-data').textContent(),'46 sem data');
  if(width===1440) await page.getByRole('button',{name:'Semana',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),
    view.producoes.filter(p=>p.dataCivil&&p.dataCivil>='2026-09-28'&&p.dataCivil<='2026-10-04').map(p=>p.producao_id).sort());
  await page.locator('#abrir-sem-data').click();
  assert.deepEqual((await page.locator('#lista-sem-data [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),
    view.producoes.filter(p=>p.dataCivil===null).map(p=>p.producao_id).sort());
  await page.locator('#fechar-sem-data').click();
  const naveInicio=performance.now();
  await page.getByRole('button',{name:'Reels',exact:true}).click();
  assert.deepEqual((await page.locator('#lista [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),
    view.producoes.filter(p=>p.formato==='Reels'&&p.dataCivil&&p.dataCivil>='2026-09-28'&&p.dataCivil<='2026-10-04').map(p=>p.producao_id).sort());
  const trigger=page.locator('#lista [data-producao-id="peca-4"]');await trigger.click();
  assert.deepEqual((await page.locator('#dia .peca-acordeao').evaluateAll(ns=>ns.map(n=>n.dataset.peca))).sort(),
    view.dias.find(d=>d.data==='2026-10-04').ids.slice().sort());
  await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
  if(width===390) await page.locator('#menu').click();
  await page.locator('[data-tela="producao"]').click();
  assert.deepEqual((await page.locator('#quadro [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),
    view.producoes.map(p=>p.producao_id).sort());
  for(const semana of view.semanas) {
    const project=page.locator('.project[data-semana-id="'+(semana.semana_id??'')+'"]');
    assert.deepEqual((await project.locator('.project-row [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),semana.ids.slice().sort());
  }
  const navegacaoMs=performance.now()-naveInicio;
  const abasInicio=performance.now();
  let camposDisponiveis=0;
  for(const tab of view.planilha) {
    assert.equal(tab.linhas.length,tab.quantidadeLinhas);
    assert.deepEqual(tab.cabecalhos,campos[tab.nome]);camposDisponiveis+=tab.cabecalhos.length;
  }
  assert.equal(camposDisponiveis,66);await semPlanilhaVisual(page);
  const abasMs=performance.now()-abasInicio,avisosInicio=performance.now();
  assert.ok(view.avisos.every(a=>typeof a.motivo==='string'));
  assert.ok(view.producoes.some(p=>p.detalhes.avisos.length));
  const avisosMs=performance.now()-avisosInicio;
  const pointer=path.join(dataDir,'atual.json'),original=fs.readFileSync(pointer,'utf8');
  const parcial=capturaEscala();parcial.tables.Cenas.complete=false;promoverCaptura(parcial,dataDir);
  const aposFalha=fs.readFileSync(pointer,'utf8');
  assert.equal(JSON.parse(aposFalha).capturaId,JSON.parse(original).capturaId);
  const releituraInicio=performance.now(),response=page.waitForResponse(r=>r.url().endsWith('/api/visao'));
  await page.locator('#atualizar').click();await response;
  await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  const releituraMs=performance.now()-releituraInicio;
  assert.match(await page.locator('#selo').textContent(),/^Atualização falhou · dados de \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}$/);
  assert.equal(fs.readFileSync(pointer,'utf8'),aposFalha);
  const atual=await consultarVisao(page);
  assert.equal(atual.planilha.find(a=>a.nome==='Produções').quantidadeLinhas,500);
  assert.deepEqual(atual.historico.map(r=>r.resultado),['falhou','completa']);
  assert.match(atual.historico[0].motivoResumo,/Cenas complete: inválido/);
  assert.equal(await page.locator('#producao').isVisible(),true);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  t.diagnostic(JSON.stringify({cenario:'500 sintéticas',width,cargaMs,apiMs,navegacaoMs,abasMs,avisosMs,releituraMs,avisos:view.avisos.length}));
});

test('U-fase8 cartão com versão inválida não afirma mídia ausente nem perde registro', {skip},async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Produções',1,'versao','inválida');mudarCelula(raw,'Produções',1,'etapa_producao','imagens_em_producao');
  });
  await page.locator('[data-tela="producao"]').click();
  const card=page.locator('#quadro [data-producao-id="peca-1"]');
  assert.equal(await card.count(),1);assert.doesNotMatch(await card.textContent(),/Mídia ausente/);
  await card.click();
  assert.equal(await page.locator('#dia [data-peca="peca-1"] .data-notice').count(),0);
  const view=await consultarVisao(page);
  assert.ok(view.producoes.find(p=>p.producao_id==='peca-1').detalhes.avisos
    .some(a=>a.campo==='versao'&&a.motivo==='Inteiro positivo inválido; valor original preservado'));
  await semPlanilhaVisual(page);
});

async function moverMes(page,n) {await page.locator('[data-modo="Mês"]').click();if(n)await page.locator(n>0?'#proximo':'#anterior').click();}
