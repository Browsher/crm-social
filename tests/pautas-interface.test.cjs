const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {temporario,mapaQuadroValido,capturaValida,capturaMeses,mudarCelula,adicionarRegistro,recalcularHashes,redefinirHorario}=require('./fixtures.cjs');
const {capturaPautas,adicionarPautas,camposPautas}=require('./pautas-fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const skip=process.env.CI==='true'?'Interface exclusiva do computador; Playwright não é instalado no CI':false;

async function abrir(t,{width=1440,scheme='light',raw=capturaPautas(),depois=()=>{},atualizar}={}) {
  const root=temporario(t),dataDir=path.join(root,'dados'),quadroConfigPath=path.join(root,'quadro.json');
  fs.writeFileSync(quadroConfigPath,JSON.stringify(mapaQuadroValido()));
  assert.equal(promoverCaptura(raw,dataDir).resultado,'completa');depois(dataDir);
  const server=criarServidor({dataDir,quadroConfigPath,port:0,midia:{obter:async()=>{throw Object.assign(new Error('Prévia sintética indisponível'),{status:503});}},atualizar:atualizar?()=>atualizar(dataDir):async()=>({resultado:'sem_alteracao'})});
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  const {chromium}=require(process.env.CRM_PLAYWRIGHT_MODULE||'playwright'),browser=await chromium.launch();
  t.after(async()=>{await browser.close();await new Promise(resolve=>{server.closeAllConnections();server.close(resolve);});});
  const context=await browser.newContext({viewport:{width,height:1050},colorScheme:scheme,reducedMotion:'reduce'});
  const page=await context.newPage(),external=[],errors=[];
  page.setDefaultTimeout(3500);
  await page.clock.setFixedTime(new Date('2026-11-10T12:00:00Z'));
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():(external.push(route.request().url()),route.abort()));
  t.after(()=>{assert.deepEqual(external,[]);assert.deepEqual(errors,[]);});
  await page.goto(origin);await page.locator('#objetivo-toggle:not(:empty)').waitFor();await page.locator('#objetivo-toggle').click();
  return page;
}
async function contraste(page) {
  const failures=await page.evaluate(()=>{
    const rgba=s=>s.match(/[\d.]+/g)?.map(Number)??[0,0,0,0];
    const mix=(front,back)=>front.slice(0,3).map((c,i)=>c*(front[3]??1)+back[i]*(1-(front[3]??1)));
    const lum=rgb=>rgb.map(c=>{const x=c/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;}).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
    const bad=[];
    for(const n of document.querySelectorAll('.pauta-link,.pauta-link span,.pauta-author,.pauta-origin,.pauta-empty')) {
      if(!n.getBoundingClientRect().width||!n.getBoundingClientRect().height)continue;
      let bg=[255,255,255];const ancestors=[];for(let a=n;a;a=a.parentElement)ancestors.push(a);
      for(const a of ancestors.reverse())bg=mix(rgba(getComputedStyle(a).backgroundColor),bg);
      const l1=lum(mix(rgba(getComputedStyle(n).color),bg)),l2=lum(bg),ratio=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);
      if(ratio<4.5)bad.push({text:n.textContent,ratio});
    }return bad;
  });
  assert.deepEqual(failures,[],'Pautas e contexto devem ter contraste mínimo 4,5:1');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Página sem corte horizontal');
}

for(const width of [1440,390])for(const scheme of ['light','dark'])test('U004 card ordenado, autor e foco semanal sem peças '+width+' '+scheme,{skip},async t=>{
  const page=await abrir(t,{width,scheme}),card=page.locator('#objetivo-mes');
  assert.match(await card.textContent(),/Objetivo mensal sintético/);
  assert.equal(await card.locator('.pauta-link').count(),4);
  const lines=await card.locator('.pauta-link').allTextContents();
  for(let i=0;i<4;i++)assert.match(lines[i],new RegExp('S'+(i+1)+' · Tema sintético '+(i+1)+' · cabo'));
  assert.equal(await card.locator('.pauta-author').count(),0);
  assert.doesNotMatch(await card.textContent(),/Resumo textual sintético/);
  await contraste(page);
  for(const [index,date] of [[0,'2026-11-02'],[1,'2026-11-09'],[2,'2026-11-16'],[3,'2026-11-23']]) {
    const link=card.locator('.pauta-link').nth(index);await link.focus();await page.keyboard.press(index%2?'Space':'Enter');
    const target=page.locator('#lista');assert.equal(await target.isVisible(),true);
    assert.equal(await target.locator('.planning-day').first().getAttribute('data-data'),date);assert.equal(await target.evaluate(n=>document.activeElement===n),true);
  }
  await card.locator('.pauta-link').nth(1).click();assert.match(await page.locator('#week-title').textContent(),/Conexões do cotidiano/);
  await contraste(page);
  await page.locator('#lista [data-producao-id="peca-1"]').click();
  assert.deepEqual(await page.locator('#dia-pecas .pauta-origin').allTextContents(),['Pauta S2 de novembro']);
  await contraste(page);await page.keyboard.press('Escape');
});

test('U004 calendário e gaveta reúnem todas as origens únicas do dia, sem inferir órfã',{skip},async t=>{
  const raw=capturaPautas();
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-2',marca_id:'ntv',inicio_semana:'2026-11-16',tema:'Outra semana',pauta_id:'pauta-novembro-3'});
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-orfa',marca_id:'ntv',inicio_semana:'2026-11-23',tema:'Órfã',pauta_id:'pauta-ausente'});
  mudarCelula(raw,'Produções',3,'semana_id','semana-2');mudarCelula(raw,'Produções',3,'data_prevista','2026-11-10');
  mudarCelula(raw,'Produções',4,'semana_id','semana-orfa');mudarCelula(raw,'Produções',4,'data_prevista','2026-11-10');
  const page=await abrir(t,{raw});
  await page.locator('.planning-day[data-data="2026-11-10"] .planning-day-heading').click();
  assert.deepEqual(await page.locator('#dia-pecas .pauta-origin').allTextContents(),['Pauta S2 de novembro','Pauta S3 de novembro']);
  await page.keyboard.press('Escape');await page.locator('#selo').click();
  assert.match(await page.locator('#avisos-tabela').textContent(),/Semanas.*pauta_id/s);
});

for(const width of [1440,390])for(const scheme of ['light','dark'])test('U004 semana focada conserva região e texto integral '+width+' '+scheme,{skip},async t=>{
  const page=await abrir(t,{width,scheme}),week=page.locator('#lista');
  const before=await week.boundingBox();await page.locator('.pauta-link').nth(1).focus();await page.keyboard.press('Enter');
  assert.equal(await week.evaluate(n=>document.activeElement===n),true);
  assert.equal(await week.locator('.planning-day').first().getAttribute('data-data'),'2026-11-09');
  assert.equal(await page.locator('#week-title').textContent(),'Conexões do cotidiano');
  const after=await week.boundingBox();assert.equal(after.width,before.width);assert.equal(after.height,before.height);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await contraste(page);
});

test('U004 semana atravessando mês conserva origem e não cria pauta no mês seguinte',{skip},async t=>{
  const raw=capturaPautas();const row=Object.fromEntries(camposPautas.map((c,i)=>[c,raw.tables.Pautas.values[1][i]]));
  adicionarPautas(raw,[{...row,pauta_id:'pauta-setembro-4',mes:'2026-09',semana:4,inicio_semana:'2026-09-28'}]);
  mudarCelula(raw,'Semanas',1,'inicio_semana','2026-09-28');mudarCelula(raw,'Semanas',1,'pauta_id','pauta-setembro-4');
  for(let i=1;i<=4;i++)mudarCelula(raw,'Produções',i,'data_prevista','2026-10-02');
  const page=await abrir(t,{width:390,raw});await page.locator('[data-modo="Mês"]').click();await page.locator('#anterior').click();
  await page.locator('#calendario [data-inicio-semana="2026-09-28"]').click();assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-09-28');
  await page.locator('#lista [data-producao-id="peca-1"]').click();
  assert.equal(await page.locator('#dia-pecas .pauta-origin').textContent(),'Pauta S4 de setembro');
});

test('U004 fallback 003 preserva resumo, duplicata e objetivo indefinido sem ações',{skip},async t=>{
  const raw=capturaMeses([['2026-11','ntv','Objetivo fallback','A\nB\nC\nD\nE\nF'],['2026-12','ntv','A',''],['2026-12','ntv','B','']]);
  adicionarPautas(raw,[]);const page=await abrir(t,{raw,width:390}),card=page.locator('#objetivo-mes');
  assert.deepEqual(await card.locator('li').allTextContents(),['A','B','C','D','E']);
  assert.equal(await card.locator('.more-topics').textContent(),'+1 pauta');
  assert.equal(await card.locator('#pautas-mes a,#pautas-mes button').count(),0);
  await page.locator('[data-modo="Mês"]').click();await page.locator('#proximo').click();assert.match(await card.textContent(),/A confirmar/);
  await page.locator('[data-modo="Mês"]').click();await page.locator('#proximo').click();assert.match(await card.textContent(),/Ainda não definido/);
});

test('U004 Pautas sem Meses conserva texto literal, tabela completa, teclado e releitura',{skip},async t=>{
  const raw=capturaPautas();delete raw.tables.Meses;delete raw.metadataBefore.Meses;delete raw.metadataAfter.Meses;
  mudarCelula(raw,'Pautas',1,'tema','<img src="https://example.invalid/x" onerror="alert(1)">');
  const page=await abrir(t,{width:390,raw:recalcularHashes(raw),atualizar:dir=>{
    const next=capturaMeses([['2026-11','ntv','Fallback após releitura','Pauta textual']]);next.capturaId='releitura-sem-pautas';
    redefinirHorario(next,'2026-10-03T12:00:00.000Z','2026-10-03T12:05:00.000Z');return promoverCaptura(next,dir);
  }});
  assert.match(await page.locator('#objetivo-mes').textContent(),/Ainda não definido/);
  assert.equal(await page.locator('#objetivo-mes img').count(),0);assert.match(await page.locator('.pauta-link').first().textContent(),/<img/);
  await page.locator('#selo').click();await page.locator('[data-aba="Revisoes"]').focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('[data-aba="Pautas"]').getAttribute('aria-selected'),'true');
  assert.deepEqual(await page.locator('#dados-planilha th').allTextContents(),camposPautas);
  assert.match(await page.locator('#dados-planilha').textContent(),/4 linhas da NTV/);
  assert.equal(await page.locator('#dados-planilha tbody tr').count(),4);
  await page.keyboard.press('Home');assert.ok((await page.locator('#dados-planilha th').allTextContents()).includes('pauta_id'));
  await page.locator('[data-aba="Pautas"]').click();await page.locator('#atualizar').click();
  await page.waitForFunction(()=>document.querySelector('[role=tab][aria-selected=true]')?.dataset.aba==='Semanas');
  assert.equal(await page.locator('[data-aba="Pautas"]').count(),0);
  assert.equal((await page.locator('#dados-planilha th').allTextContents()).includes('pauta_id'),false);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
});

test('U004 Histórico identifica falha estrutural de Pautas e preserva card vigente',{skip},async t=>{
  const page=await abrir(t,{depois:dir=>{const bad=capturaPautas();bad.tables.Pautas.complete=false;promoverCaptura(bad,dir);}});
  assert.equal(await page.locator('#objetivo-mes .pauta-link').count(),4);
  await page.locator('#selo').click();await page.locator('[data-aba="Histórico"]').click();
  assert.match(await page.locator('tr[data-resultado="falhou"]').textContent(),/Aba Pautas incompleta/);
});

test('U004 vocabulários desconhecidos são texto da fonte e não viram rótulos herdados',{skip},async t=>{
  const raw=capturaPautas();mudarCelula(raw,'Pautas',1,'status','constructor');mudarCelula(raw,'Pautas',1,'modelo_carrossel','modelo de teste');
  mudarCelula(raw,'Pautas',1,'origem','Autor');mudarCelula(raw,'Produções',1,'data_prevista','');
  const page=await abrir(t,{raw,width:390});
  assert.match(await page.locator('.pauta-link').first().textContent(),/modelo de teste/);
  assert.equal(await page.locator('.pauta-author').count(),0);assert.doesNotMatch(await page.locator('.pauta-link').first().textContent(),/constructor/);
  const view=await (await page.request.get(new URL('/api/visao',page.url()).href)).json();assert.equal(view.pautas[0].status,'constructor');
  await page.locator('#abrir-sem-data').click();await page.locator('#lista-sem-data [data-producao-id="peca-1"]').click();
  assert.deepEqual(await page.locator('#dia-pecas .pauta-origin').allTextContents(),['Pauta S2 de novembro']);
});

test('U004 destino semanal acessível identifica sete dias e devolve foco à região',{skip},async t=>{
  const page=await abrir(t);await page.locator('.pauta-link').nth(1).click();
  assert.equal(await page.locator('#lista').getAttribute('role'),'region');
  assert.equal(await page.locator('#lista').evaluate(n=>document.activeElement===n),true);
  assert.equal(await page.locator('.planning-day').count(),7);
});

test('U004 dia vazio usa só origem confirmada da semana capturada que cobre a data',{skip},async t=>{
  const raw=capturaPautas();
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-orfa',marca_id:'ntv',inicio_semana:'2026-11-23',tema:'Órfã',pauta_id:'pauta-ausente'});
  const page=await abrir(t,{raw});
  for(const [dia,origens] of [[9,['Pauta S2 de novembro']],[15,['Pauta S2 de novembro']],[8,[]],[16,[]],[23,[]]]) {
    await page.locator('[data-modo="Mês"]').click();const date='2026-11-'+String(dia).padStart(2,'0');
    const start=new Date(date+'T12:00:00Z');start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7));
    await page.locator('#calendario [data-inicio-semana="'+start.toISOString().slice(0,10)+'"]').click();
    await page.locator('.planning-day[data-data="'+date+'"] .planning-day-heading').click();
    assert.deepEqual(await page.locator('#dia-pecas .pauta-origin').allTextContents(),origens,'Origem do dia '+dia);
    assert.equal(await page.locator('#dia-quantidade').textContent(),'0 peças registradas');
    assert.match(await page.locator('#dia-pecas').textContent(),/Nenhuma peça registrada neste dia/);
    assert.equal(await page.locator('#dia-pecas [data-peca], #dia-pecas [data-documentos-dia]').count(),0);
    await page.keyboard.press('Escape');
  }
});

test('U004 captura antiga preserva todas as peças sem data e semanas na API',{skip},async t=>{
  const raw=capturaValida();mudarCelula(raw,'Semanas',1,'inicio_semana','2026-11-16');
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-invalida',marca_id:'ntv',inicio_semana:'data inválida',tema:'Semana sem início válido'});
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-antecipada',marca_id:'ntv',inicio_semana:'2026-11-02',tema:'Semana física B'});
  mudarCelula(raw,'Produções',2,'semana_id','semana-invalida');mudarCelula(raw,'Produções',3,'semana_id','semana-antecipada');
  for(let i=1;i<=4;i++)mudarCelula(raw,'Produções',i,'data_prevista','');
  const page=await abrir(t,{width:390,raw});await page.locator('#abrir-sem-data').click();
  assert.deepEqual((await page.locator('#lista-sem-data [data-producao-id]').evaluateAll(ns=>ns.map(n=>n.dataset.producaoId))).sort(),['peca-1','peca-2','peca-3','peca-4']);
  const view=await (await page.request.get(new URL('/api/visao',page.url()).href)).json();
  assert.deepEqual(view.semanas.filter(w=>w.semana_id).map(w=>w.semana_id),['semana-01','semana-invalida','semana-antecipada']);
});

test('U004 pauta sem peças não cria semana capturada e conserva a consulta',{skip},async t=>{
  const page=await abrir(t,{width:390});await page.locator('.pauta-link').first().click();
  assert.equal(await page.locator('#week-title').textContent(),'Tema sintético 1');
  assert.equal(await page.locator('#lista [data-producao-id]').count(),0);
  assert.equal(await page.locator('#lista').evaluate(n=>document.activeElement===n),true);
  await page.locator('.pauta-link').nth(1).click();assert.equal(await page.locator('#week-title').textContent(),'Conexões do cotidiano');
  await page.locator('#selo').click();assert.equal(await page.locator('#dados-planilha tbody tr').count(),1);
  assert.equal(await page.locator('#dados-planilha tbody tr td').first().textContent(),'semana-01');
});
