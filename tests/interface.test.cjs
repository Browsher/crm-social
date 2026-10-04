const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,capturaDetalhada,capturaQuadro,adicionarRegistro,mapaQuadroValido,mapaQuadroSintetico,temporario,recalcularHashes,mudarCelula,redefinirHorario}=require('./fixtures.cjs');
const {promoverCaptura}=require('../src/snapshot.cjs');
const {criarServidor}=require('../src/servidor.cjs');
const CI=process.env.CI==='true';
const skip=CI?'Interface exclusiva do computador; Playwright não é instalado no CI':false;
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
  await pecas.nth(1).locator(':scope > summary').focus();await page.keyboard.press('Enter');
  assert.equal(await pecas.nth(1).evaluate(n=>n.open),true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#dia').isVisible(),false);
  assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
});

test('U05 dia/lista e dia vazio: no máximo dois acionamentos, sem recortar a gaveta', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.evaluate(()=>{window.acionamentos=0;document.addEventListener('click',()=>window.acionamentos++,true);});
  await page.getByRole('button',{name:'2 de outubro',exact:true}).click();
  assert.equal(await page.locator('#dia .peca-acordeao').count(),2);
  assert.equal(await page.evaluate(()=>window.acionamentos),1);
  assert.ok(await page.locator('#dia').evaluate(n=>n.scrollWidth<=n.clientWidth));
  assert.ok(await page.locator('.drawer-body').evaluate(n=>n.scrollWidth<=n.clientWidth));
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  assert.equal(await page.evaluate(()=>window.acionamentos),2);
  assert.equal(await page.locator('#dia [data-peca="peca-4"]').evaluate(n=>n.open),true);
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
  assert.match(await current.textContent(),/Revisar · versão 2 — Conferir texto de exemplo/);
  assert.ok(!(await current.textContent()).includes('revisao-resolvida'));
  assert.ok(!(await current.textContent()).includes('revisao-antiga'));
  assert.match(await carousel.locator('[data-revisoes="resolvidas"]').textContent(),/versão 2.*resolvida/s);
  assert.equal(await carousel.locator('[data-revisoes="resolvidas"]').getAttribute('class'),'detail-section history');
  assert.match(await carousel.textContent(),/Com quem está.*Equipe sintética/s);
  assert.match(await current.textContent(),/Corrige: Correção sintética · aberta/s);
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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

test('U06 review: API conserva avisos localizados; gaveta só mostra contagem e link Planilha', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Páginas',1,'indice',-1);mudarCelula(raw,'Páginas',2,'indice',-1);
  },()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  const response=await page.request.get(new URL('/api/visao',page.url()).href),view=await response.json();
  const avisos=view.producoes.find(p=>p.producao_id==='peca-3').detalhes.avisos;
  assert.ok(avisos.some(a=>a.aba==='Páginas' && a.linha===2 && a.campo==='indice'));
  assert.ok(avisos.some(a=>a.aba==='Páginas' && a.linha===3 && a.campo==='indice'));
  const carousel=page.locator('#dia [data-peca="peca-3"]');
  assert.doesNotMatch(await carousel.textContent(),/linha [23]|Inteiro positivo inválido|arquivo_imagem_id/);
  assert.equal(await carousel.locator('.data-notice').count(),1);
  assert.match(await carousel.locator('.data-notice').textContent(),new RegExp('^'+avisos.length+' avisos de dados nesta peça'));
  await carousel.getByRole('link',{name:'ver na Planilha'}).click();
  assert.equal(await page.locator('#dia').isVisible(),false);
  assert.equal(await page.locator('#planilha').isVisible(),true);
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  const body=await page.locator('#dia').textContent();
  assert.doesNotMatch(body,/usuario-sintetico|senha-sintetica|servidor-sintetico\.invalid|registro-recusado/);
  const response=await page.request.get(new URL('/api/visao',page.url()).href);
  assert.doesNotMatch(await response.text(),/usuario-sintetico|senha-sintetica/);
});
const estadosSelo=[
  {nome:'hoje',texto:'Atualizado hoje, 08:05',cor:'verde',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'anterior',texto:'Dados de 02/10',cor:'âmbar',fim:'2026-10-02T12:05:00Z',captura:true},
  {nome:'falha',texto:'Atualização falhou',cor:'vermelho',fim:'2026-10-04T11:05:00Z',captura:true},
  {nome:'ausente',texto:'Sem dados',cor:'cinza',captura:false}
];

test('U-regressao gaveta mantém o texto ao redor da credencial sem recebê-la', {skip}, async t=>{
  const url='https://pessoa-ficticia:senha-ficticia@docs.google.com/x';
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Produções',3,'legenda','Leia ('+url+'). Depois siga @perfil.');
    mudarCelula(raw,'Arquivos',2,'origens_json',JSON.stringify({texto:'Veja '+url+' antes de revisar',contato:'equipe@example.invalid'}));
  },()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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

test('U-ultima I1 avisos da própria linha entram na contagem e no link da gaveta', {skip}, async t=>{
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
    } else await page.locator('#calendario [data-producao-id="peca-3"]').click();
    const p=page.locator('#dia [data-peca="peca-3"]');
    assert.match(await p.locator(':scope>summary .piece-hint').textContent(),/4 avisos$/);
    assert.equal(await p.locator('.data-notice>span').textContent(),'4 avisos de dados nesta peça');
    assert.equal(await p.getByRole('link',{name:'ver na Planilha'}).count(),1);
  });
});

test('U-ultima m1 arquivo ligado sem link permitido não afirma mídia ausente', {skip}, async t=>{
  for(const url of ['', 'http://drive.google.com/x', 'https://nao-permitido.invalid/x']) {
    await t.test(url || 'URL vazia',async sub=>{
      const page=await abrir(sub,1440,true,raw=>mudarCelula(raw,'Arquivos',2,'url',url),()=>{},capturaDetalhada);
      await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
    await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  const current=page.locator('#dia [data-peca="peca-3"] [data-revisoes="vigentes"]');
  const first=current.locator(':scope>.review-record').first();
  assert.equal(await first.locator('span').textContent(),'Revisar · versão 2 — Conferir texto de exemplo');
  assert.equal(await first.locator('small').textContent(),'Corrige: Correção sintética · aberta');
  assert.doesNotMatch(await first.textContent(),/Decisão:|Versão:|Motivo:|revisao-atual/);
  assert.equal(await current.locator('details>summary').textContent(),'+2 revisões abertas');
});

test('U-final singular de página, cena e aviso e faixa sem separador pendurado', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    raw.tables.Páginas.values=raw.tables.Páginas.values.filter((row,i)=>i===0 || row[0]==='pagina-02');
    raw.tables.Cenas.values=raw.tables.Cenas.values.filter((row,i)=>i===0 || row[0]==='cena-02');
  },()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  assert.match(await page.locator('#dia [data-peca="peca-3"] .piece-hint').textContent(),/^1 página ·/);
  assert.match(await page.locator('#dia [data-peca="peca-4"] .piece-hint').textContent(),/^1 cena · sem revisão · 1 aviso$/);
  await page.locator('#dia [data-peca="peca-4"]>summary').click();
  const notice=page.locator('#dia [data-peca="peca-4"] .data-notice');
  assert.equal(await notice.locator('span').textContent(),'1 aviso de dados nesta peça');
  assert.equal(await notice.getByRole('link').textContent(),'ver na Planilha');
});

test('U-final cena identifica imagem final ausente em um único aviso', {skip}, async t=>{
  const page=await abrir(t,1440,true,raw=>{
    adicionarRegistro(raw,'Arquivos',{arquivo_id:'imagem-inicio',producao_id:'peca-4',cena_id:'cena-02',versao:1,
      tipo:'imagem',url:'https://drive.google.com/file/d/inicio-sintetico'});
    mudarCelula(raw,'Cenas',2,'arquivo_imagem_inicio_id','imagem-inicio');
  },()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
  const carousel=page.locator('#dia [data-peca="peca-3"]'),reels=page.locator('#dia [data-peca="peca-4"]');
  assert.equal(await carousel.locator('.piece-facts').count(),1);
  assert.equal(await carousel.locator('.piece-facts>div').count(),4);
  assert.match(await carousel.locator('.piece-facts').textContent(),/Prompts de imagem prontos/);
  assert.match(await carousel.locator('.publication').textContent(),/2026-10-02T12:04:00Z/);
  assert.match(await reels.locator('summary .piece-hint').textContent(),/2 cenas.*revisão.*\d+ avisos/);
  assert.equal(await reels.locator('.piece-body').isVisible(),false);
  await reels.locator('summary').first().click();
  assert.match(await reels.locator('.piece-facts').textContent(),/Etapa_nova_original/);
  assert.doesNotMatch(await reels.locator('.piece-facts').textContent(),/Com quem está|A confirmar/);
  const response=await page.request.get(new URL('/api/visao',page.url()).href),view=await response.json();
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-3').etapa_producao,'prompts_imagem_prontos');
});

test('U-review compacta: texto, histórico e versões anteriores recolhidos, revisão adicional +N', {skip}, async t=>{
  const page=await abrir(t,1440,true,()=>{},()=>{},capturaDetalhada);
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
  await page.locator('#calendario [data-producao-id="peca-3"]').click();
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
test('U07 US4 quadro conserva colunas, cartões e registros em desktop/celular', {skip}, async t=>{
  for(const width of [1440,390]) await t.test(width+'px',async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaQuadro,mapaQuadroSintetico(),false);
    if(width===390)await page.locator('#menu').click();
    await page.getByRole('button',{name:'Produção',exact:true}).click();
    const cols=page.locator('#quadro .quadro-coluna');
    assert.deepEqual(await cols.evaluateAll(nodes=>nodes.map(n=>n.dataset.coluna)),
      ['Planejamento','Redação','Visual','Mídia','Revisão','Pronta','Publicada','Outras']);
    assert.equal(await page.locator('#semana-tema').textContent(),'Conexões do cotidiano');
    assert.match(await page.locator('#quadro-total').textContent(),/10 peças/);
    const cards=page.locator('#quadro .quadro-card');
    assert.deepEqual((await cards.evaluateAll(nodes=>nodes.map(n=>n.dataset.producaoId))).sort(),
      ['peca-1','peca-10','peca-11','peca-12','peca-2','peca-3','peca-4','peca-7','peca-8','peca-9']);
    assert.equal(await page.locator('#quadro [draggable="true"], #quadro input, #quadro select, #quadro textarea, #quadro [contenteditable="true"]').count(),0);
    const review=page.locator('#quadro [data-coluna="Revisão"] [data-producao-id="peca-7"]');
    assert.match(await review.textContent(),/Responsável sintético/);
    assert.match(await review.textContent(),/Ajustar texto de exemplo/);
    assert.match(await review.textContent(),/Corrige: Correção sintética/);
    assert.match(await review.textContent(),/Em planejamento/);
    assert.match(await page.locator('#quadro [data-producao-id="peca-3"]').textContent(),/Carrossel.*02\/10/s);
    assert.match(await page.locator('#quadro [data-producao-id="peca-4"]').textContent(),/[Mm]ídia ausente|imagens ausentes/);
    assert.equal(await page.locator('#quadro [data-coluna="Publicada"] .quadro-card').count(),1);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    assert.ok(await cards.evaluateAll(nodes=>nodes.every(n=>n.scrollWidth<=n.clientWidth)));
    assert.equal(await page.locator('#selo').textContent(),'Dados de 02/10');
  });
});

test('U08 US4 Outras conta valores por semana e cartão abre dia inteiro por teclado', {skip}, async t=>{
  for(const width of [1440,390])await t.test(width+'px',async t=>{
    const page=await abrir(t,width,true,()=>{},()=>{},capturaQuadro,mapaQuadroSintetico(),false);
    if(width===390)await page.locator('#menu').click();
    await page.getByRole('button',{name:'Produção',exact:true}).click();
    const outras=page.locator('#quadro [data-coluna="Outras"]');
    assert.equal(await outras.locator('h3').textContent(),'Outras · 2 valores novos');
    for(const id of ['peca-10','peca-11'])assert.match(await outras.locator('[data-producao-id="'+id+'"]').textContent(),/etapa_nova_sintetica/);
    assert.match(await outras.locator('[data-producao-id="peca-12"]').textContent(),/Não informada/);
    const trigger=page.locator('#quadro [data-producao-id="peca-3"]');
    await trigger.focus();await page.keyboard.press('Enter');
    assert.deepEqual(await page.locator('#dia .peca-acordeao').evaluateAll(nodes=>nodes.map(n=>n.dataset.peca)),
      ['peca-10','peca-11','peca-3','peca-4','peca-7','peca-8','peca-9']);
    assert.equal(await page.locator('#dia .peca-acordeao[open]').count(),1);
    await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
    await outras.locator('[data-producao-id="peca-12"]').click();
    assert.match(await page.locator('#dia-titulo').textContent(),/Sem data/);
    assert.deepEqual(await page.locator('#dia .peca-acordeao').evaluateAll(nodes=>nodes.map(n=>n.dataset.peca)),['peca-12']);
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#semana-anterior').isDisabled(),true);
    await page.locator('#semana-proxima').click();
    assert.equal(await page.locator('#semana-tema').textContent(),'Próxima semana sintética');
    assert.equal(await outras.locator('h3').textContent(),'Outras · 1 valor novo');
    assert.equal(await page.locator('#quadro .quadro-card').count(),1);
    assert.match(await outras.textContent(),/outra_etapa_sintetica.*Publicado/s);
    assert.equal(await page.locator('#quadro [data-coluna="Publicada"] .quadro-card').count(),0);
    assert.equal(await page.locator('#quadro .coluna-vazia').count(),7);
    assert.equal(await page.locator('#semana-proxima').isDisabled(),true);
    await page.locator('#semana-anterior').click();
    assert.equal(await outras.locator('h3').textContent(),'Outras · 2 valores novos');
    assert.equal(await page.locator('#quadro .quadro-card').count(),10);
  });
});

test('U07-vazio US4 sem captura não inventa semana, cartão ou atividade', {skip},async t=>{
  const page=await abrir(t,390,false);
  await page.locator('#menu').click();await page.getByRole('button',{name:'Produção',exact:true}).click();
  assert.match(await page.locator('#quadro-vazio').textContent(),/primeira leitura à Central/);
  assert.equal(await page.locator('#quadro .quadro-card').count(),0);
  assert.equal(await page.locator('#semana-anterior').isDisabled(),true);
  assert.equal(await page.locator('#semana-proxima').isDisabled(),true);
  assert.equal(await page.locator('#selo').textContent(),'Sem dados');
});

test('U08 revisão m1 filtra mídia por coluna só no cartão e conserva a API', {skip},async t=>{
  const page=await abrir(t,1440,true,raw=>{
    mudarCelula(raw,'Arquivos',1,'producao_id','peca-4');
    for(let i=1;i<raw.tables.Revisoes.values.length;i++)mudarCelula(raw,'Revisoes',i,'decisao','aprovado');
  },()=>{},capturaQuadro,mapaQuadroSintetico(),false);
  await page.getByRole('button',{name:'Produção',exact:true}).click();
  const view=await page.evaluate(async()=>await (await fetch('/api/visao')).json());
  const casos=[['peca-1','Planejamento',false],['peca-2','Redação',false],['peca-3','Visual',false],
    ['peca-4','Mídia',true],['peca-7','Revisão',true],['peca-8','Pronta',true],['peca-9','Publicada',true],['peca-10','Outras',true]];
  for(const [id,coluna,visivel] of casos) {
    const p=view.producoes.find(p=>p.producao_id===id);
    assert.equal(p.quadro.coluna,coluna);
    assert.ok(p.quadro.pendencias.some(r=>r.tipo==='midia'),'API conserva mídia em '+coluna);
    const box=page.locator('#quadro [data-producao-id="'+id+'"] .board-pending');
    assert.equal(await box.count(),visivel?1:0,coluna);
    if(visivel) {
      assert.equal(await box.locator('span').first().textContent(),'Mídia ausente',coluna);
      assert.doesNotMatch(await box.textContent(),/sem arquivo registrado nesta versão/);
    }
  }
});

test('U08 revisão m1 mantém revisão e conta somente as pendências exibidas', {skip},async t=>{
  const page=await abrir(t,390,true,raw=>mudarCelula(raw,'Arquivos',1,'producao_id','peca-4'),
    ()=>{},capturaQuadro,mapaQuadroSintetico(),false);
  await page.locator('#menu').click();await page.getByRole('button',{name:'Produção',exact:true}).click();
  const view=await page.evaluate(async()=>await (await fetch('/api/visao')).json());
  assert.deepEqual(view.producoes.find(p=>p.producao_id==='peca-1').quadro.pendencias.map(r=>r.tipo),['revisao','midia']);
  const inicial=page.locator('#quadro [data-producao-id="peca-1"] .board-pending');
  assert.match(await inicial.textContent(),/Revisão: Exemplo/);
  assert.match(await inicial.textContent(),/Corrige: Equipe sintética/);
  assert.doesNotMatch(await inicial.textContent(),/Mídia ausente|\+1 pendência/);
  const revisao=page.locator('#quadro [data-producao-id="peca-7"] .board-pending');
  assert.match(await revisao.textContent(),/Revisão: Ajustar texto de exemplo/);
  assert.match(await revisao.textContent(),/\+1 pendência/);
});
