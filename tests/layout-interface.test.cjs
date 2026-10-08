const {test}=require('node:test');
const assert=require('node:assert/strict');
const {abrirLayout,navegar,atualizar,pedidosMidia,skip}=require('./layout-browser.cjs');
const {mudarPorId,adicionarRegistro}=require('./layout-fixtures.cjs');

const combinacoes=['light','dark'].flatMap(theme=>[1440,390].map(width=>({theme,width})));
async function semOverflow(page) {assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'página sem rolagem horizontal');}
async function modo(page,value) {
  const button=page.locator('[data-modo="'+value+'"]');assert.equal(await button.count(),1,'modo '+value+' disponível');
  await button.focus();await page.keyboard.press('Enter');
}
function row(page,id) {return page.locator('#quadro .project-row[data-producao-id="'+id+'"]');}

for(const config of combinacoes) {
  const label=config.theme+'/'+config.width;
  test('Layout A topo comum e menu preservam atualização única em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);
    assert.deepEqual(await page.locator('nav [data-tela]').allTextContents(),['Planejamento','Produção','Planilha']);
    for(const tela of ['planejamento','producao','planilha']) {
      await navegar(page,tela);
      const button=page.locator('#atualizar');assert.equal(await button.isVisible(),true,'atualização visível em '+tela);
      assert.equal((await button.textContent()).trim(),'⟳ Atualizar');
      assert.equal(await page.locator('#planilha #atualizar, #planilha #resultado-atualizacao').count(),0,'ação e resultado fora da Planilha');
      assert.equal(await page.locator('#atualizar').count(),1);
      assert.equal(await page.locator('#resultado-atualizacao').getAttribute('role'),'status');
      assert.equal(await page.locator('#selo').isVisible(),true);
      assert.equal(await page.getByRole('button',{name:'Ver no Instagram',exact:true}).count(),0);
      assert.equal(await page.locator('[data-tela="publicar"]').count(),0);await semOverflow(page);
    }
    await page.locator('#selo').click();assert.equal(await page.locator('#planilha').isVisible(),true);
    assert.ok(await page.locator('#abas-planilha [role=tab]').count()>=7,'consulta continua acessível');
  });
  test('Layout A Semana padrão, objetivo recolhível e dia inteiro em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);
    assert.equal(await page.locator('.planning-week:visible').count(),1,'Semana deve ser a entrada padrão');
    assert.deepEqual(await page.locator('.planning-week .planning-day').evaluateAll(ns=>ns.map(n=>n.dataset.data)),
      ['2026-10-05','2026-10-06','2026-10-07','2026-10-08','2026-10-09','2026-10-10','2026-10-11']);
    const today=page.locator('.planning-day[data-data="2026-10-08"]');
    assert.match((await today.getAttribute('class'))+' '+(await today.getAttribute('aria-label')),/today|hoje/i);
    assert.match(await page.locator('#week-progress').textContent(),/2 de 5 prontas/,'inclui peça órfã datada no calendário');
    const toggle=page.locator('#objetivo-toggle'),panel=page.locator('#pautas-mes');
    assert.equal(await toggle.count(),1,'objetivo possui acionador acessível');
    assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await panel.evaluate(n=>n.hidden),true);
    assert.equal(await panel.boundingBox(),null,'pautas fechadas não reservam espaço');
    await toggle.focus();await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await panel.isVisible(),true);
    assert.match(await panel.textContent(),/S1/);assert.match(await panel.textContent(),/S2/);
    await toggle.press('Enter');assert.equal(await panel.evaluate(n=>n.hidden),true);
    const card=today.locator('.layout-card[data-producao-id="peca-1"]');await card.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#dia').isVisible(),true);
    assert.deepEqual(await page.locator('#dia [data-peca]').evaluateAll(ns=>ns.map(n=>n.dataset.peca).sort()),['peca-1','peca-2']);
    await page.keyboard.press('Escape');assert.equal(await card.evaluate(n=>n===document.activeElement),true);await semOverflow(page);
    if(config.width===390)assert.equal(await page.locator('.planning-week').evaluate(n=>n.scrollWidth>n.clientWidth),true,'sete dias rolam na região própria');
  });
  test('Layout A Mês usa pontos e ativa semana vazia por teclado em '+label,{skip},async t=>{
    const context=await abrirLayout(t,config),{page}=context;
    await modo(page,'Mês');const calendar=page.locator('#calendario');
    assert.equal(await calendar.isVisible(),true);assert.equal(await calendar.locator('img[src]').count(),0,'Mês não renderiza imagens');
    const before=pedidosMidia(context).length;
    const dots=calendar.locator('.month-dot');assert.ok(await dots.count()>=10,'pontos representam peças reais');
    assert.ok((await dots.evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label')||n.title))).every(Boolean),'estado acessível independe de cor');
    const box=await calendar.boundingBox();assert.ok(box.height>=300,'Mês ocupa a altura disponível');
    await page.locator('#proximo').click();await page.locator('#anterior').click();
    assert.equal(pedidosMidia(context).length,before,'navegar no Mês não inicia mídia');
    const week=calendar.locator('[data-inicio-semana="2026-10-19"]').first();
    await week.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('.planning-week:visible').count(),1);
    assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-19');
    assert.match(await page.locator('#week-progress').textContent(),/0 de 0 prontas/);await semOverflow(page);
  });
  test('Layout A Mês anuncia peças e estados no nome acessível da semana em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);await modo(page,'Mês');
    const week=page.getByRole('button',{name:/Semana de 5 de outubro.*Oferta sintética de outubro.*Pronta.*Carrossel de cinco páginas.*Pronta/});
    assert.equal(await week.count(),1,'nomes e estados são anunciados no botão, não apenas em seus filhos');
    await week.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-05');
    await modo(page,'Mês');await page.locator('[data-formato="Reels"]').click();
    assert.equal(await page.getByRole('button',{name:/Semana de 5 de outubro.*Reels em produção.*Criação/}).count(),1);
    assert.equal(await page.getByRole('button',{name:/Semana de 5 de outubro.*Oferta sintética/}).count(),0,'nome acessível acompanha filtro');
  });
  test('Layout A dia de hoje e falta de prévia têm nomes acessíveis em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);
    const today=page.getByRole('button',{name:/8 de outubro.*hoje/});
    assert.equal(await today.count(),1,'botão do dia anuncia hoje');
    assert.equal(await page.locator('#lista').getByRole('region').count(),0,'dias são grupos, sem sete landmarks extras');
    assert.equal(await page.getByRole('button',{name:/Prévia indisponível.*Reels em produção/}).count(),1);
    assert.equal(await page.getByRole('button',{name:/◇/}).count(),0,'glifo decorativo não entra no nome');
    await today.focus();await page.keyboard.press('Enter');
    assert.equal(await page.locator('#dia').isVisible(),true);await page.keyboard.press('Escape');
    assert.equal(await today.evaluate(n=>n===document.activeElement),true);
  });
  test('Layout A alternância mantém o período do mês navegado em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);
    await modo(page,'Mês');await modo(page,'Semana');
    assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-05','alternância sem navegar preserva semana');
    for(const [steps,first,last,month] of [[1,'2026-10-26','2026-11-01','Novembro'],[-1,'2026-09-28','2026-10-04','Outubro'],[3,'2026-12-28','2027-01-03','Janeiro']]) {
      await modo(page,'Mês');
      for(let i=0;i<Math.abs(steps);i++)await page.locator(steps>0?'#proximo':'#anterior').click();
      assert.match(await page.locator('#mes').textContent(),new RegExp(month,'i'));
      await modo(page,'Semana');
      const days=await page.locator('.planning-day').evaluateAll(ns=>ns.map(n=>n.dataset.data));
      assert.equal(days[0],first,'primeira semana do mês selecionado');assert.equal(days[6],last);
      assert.match(await page.locator('#objetivo-toggle').textContent(),new RegExp(month,'i'));
      await semOverflow(page);
    }
  });
  test('Layout A Produção ordena projetos, progresso e motivos em '+label,{skip},async t=>{
    const {page}=await abrirLayout(t,config);await navegar(page,'producao');
    const projects=page.locator('#quadro .project');
    assert.ok(await projects.count()>=5,'preserva passada, futura e órfãs');
    assert.deepEqual((await projects.evaluateAll(ns=>ns.map(n=>n.dataset.semanaId))).slice(0,2),['semana-01','semana-proxima']);
    const current=page.locator('.project[data-semana-id="semana-01"]'),next=page.locator('.project[data-semana-id="semana-proxima"]');
    assert.match(await current.innerText(),/2 de 4 prontas/);assert.match(await next.innerText(),/2 de 4 prontas/);
    assert.match(await row(page,'peca-2').locator('.blocked-reason').textContent(),/Travado: precisa de correção/);
    assert.equal(await row(page,'peca-2').locator('.production-steps').count(),0);
    assert.match(await row(page,'peca-4').locator('.blocked-reason').textContent(),/Travado: falta gerar mídia/);
    for(const [id,status] of [['peca-1','Pronta'],['proxima-2','Publicada']]) {
      const steps=row(page,id).locator('.production-steps');
      assert.deepEqual(await steps.locator('li').allTextContents(),['Planejada','Criação','Revisão','Pronta','Publicada']);
      assert.equal((await steps.locator('[aria-current="step"]').textContent()).trim(),status);
      assert.equal(await row(page,id).locator('.blocked-reason').count(),0);
    }
    const future=page.locator('.project[data-semana-id="semana-futura"]');
    assert.equal(await future.locator('.project-row').count(),0);assert.match(await future.innerText(),/Planejamento na sexta-feira/);
    assert.doesNotMatch(await page.locator('#quadro').innerText(),/Com quem está|Equipe sintética|responsável|estrategista|n8n|redator|designer/i);
    await row(page,'peca-1').focus();await page.keyboard.press('Enter');
    assert.deepEqual(await page.locator('#dia [data-peca]').evaluateAll(ns=>ns.map(n=>n.dataset.peca).sort()),['peca-1','peca-2']);await semOverflow(page);
  });
}

test('Layout A atualização pendente faz um POST, preserva falha no no-op e objetivo via Planilha',{skip},async t=>{
  const context=await abrirLayout(t,{width:390}),{page}=context;
  assert.equal(await page.locator('#planilha #atualizar').count(),0,'atualização fica no topo comum');
  const objective=await page.locator('#objetivo-mes').textContent(),stamp=await page.locator('#selo').textContent();
  context.setMode('falha');await page.locator('#atualizar').click();
  await page.waitForFunction(()=>document.querySelector('#resultado-atualizacao').textContent==='Atualizando dados…');
  assert.equal(await page.locator('#atualizar').isDisabled(),true);
  await page.locator('#atualizar').evaluate(n=>n.click());assert.equal(context.calls(),1,'clique simultâneo não duplica coleta');
  context.release();await page.waitForFunction(()=>!document.querySelector('#atualizar').disabled);
  assert.equal(await page.locator('#selo').textContent(),'Atualização falhou');
  assert.equal(await page.locator('#objetivo-mes').textContent(),objective);
  context.setMode('sem_alteracao');await atualizar(context);
  assert.equal(await page.locator('#selo').textContent(),'Atualização falhou','no-op não apaga falha ativa');
  assert.notEqual(stamp,'Atualização falhou');
  const posts=context.requests.filter(r=>r.path==='/api/atualizar'&&r.method==='POST');
  assert.equal(posts.length,2);assert.ok(posts.every(r=>r.body==='{}'));
  await navegar(page,'planilha');await page.locator('[data-aba="Meses"]').click();
  assert.ok(await page.locator('#dados-planilha tbody tr').count()>0);
});

test('Layout A pauta sem peças conserva seleção e calendário cruza mês/ano',{skip},async t=>{
  const {page}=await abrirLayout(t,{width:390});
  assert.equal(await page.locator('#objetivo-toggle').count(),1,'objetivo recolhível implementado');
  await page.locator('#objetivo-toggle').click();
  const pauta=page.locator('#pautas-mes [data-inicio-semana="2026-10-19"]');assert.equal(await pauta.count(),1);
  await pauta.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-19');
  await modo(page,'Mês');await modo(page,'Semana');
  assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-19','trocar modo preserva semana');
  await modo(page,'Mês');for(let n=0;n<2;n++)await page.locator('#proximo').click();
  const crossing=page.locator('#calendario [data-inicio-semana="2026-12-28"]').first();
  await crossing.focus();await page.keyboard.press('Enter');
  assert.equal(await page.locator('.planning-day').last().getAttribute('data-data'),'2027-01-03');
});

test('Layout A remarcação usa dataCivil e Sem data continua acessível',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>mudarPorId(raw,'Produções','peca-1','data_prevista','2026-10-14')});
  assert.equal(await page.locator('.planning-week:visible').count(),1,'Semana padrão');
  assert.equal(await page.locator('.planning-week [data-producao-id="peca-1"]').count(),0);
  await page.locator('#proximo').click();
  assert.equal(await page.locator('.planning-day[data-data="2026-10-14"] [data-producao-id="peca-1"]').count(),1);
  await page.locator('#abrir-sem-data').click();assert.match(await page.locator('#sem-data').innerText(),/Sem data/);
  assert.equal(await page.locator('#sem-data [data-producao-id="peca-sem-data"]').count(),1);
  await navegar(page,'producao');assert.equal(await row(page,'peca-1').locator('..').count(),1);
  assert.equal(await page.locator('.project[data-semana-id="semana-01"] [data-producao-id="peca-1"]').count(),1,'projeto mantém semanaId');
});

for(const scenario of ['ausente','duplicado','fallback'])test('Layout A objetivo '+scenario+' não inventa associação',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    if(scenario==='ausente'){delete raw.tables.Meses;delete raw.metadataBefore.Meses;delete raw.metadataAfter.Meses;}
    if(scenario==='duplicado')adicionarRegistro(raw,'Meses',{mes:'2026-10',marca_id:'ntv',objetivo:'Outro objetivo sintético',pautas:'Pauta conflitante'});
    if(scenario==='fallback'){delete raw.tables.Pautas;delete raw.metadataBefore.Pautas;delete raw.metadataAfter.Pautas;}
  }});
  assert.equal(await page.locator('#objetivo-toggle').count(),1,'acionador de objetivo');
  if(scenario!=='fallback')assert.match(await page.locator('#objetivo-toggle').textContent(),scenario==='duplicado'?/A confirmar/:/Ainda não definido/);
  await page.locator('#objetivo-toggle').click();
  if(scenario==='fallback')assert.doesNotMatch(await page.locator('#pautas-mes').textContent(),/S1\s*·/,'fallback textual não cria número/modelo');
});

test('Layout A correção histórica, mídia em outra etapa e precedência não travam',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    mudarPorId(raw,'Produções','peca-4','etapa_producao','arte_aprovada');
    mudarPorId(raw,'Produções','peca-2','estado_liberacao','liberado');
    mudarPorId(raw,'Produções','proxima-3','versao',2);
    adicionarRegistro(raw,'Revisoes',{revisao_id:'historica-proxima',producao_id:'proxima-3',versao:1,decisao:'revisar',motivo:'Correção histórica',estado_tratamento:'aberta'});
    adicionarRegistro(raw,'Revisoes',{revisao_id:'correcao-publicada',producao_id:'proxima-2',versao:1,decisao:'revisar',motivo:'Conflito sintético',estado_tratamento:'aberta'});
  }});await navegar(page,'producao');
  assert.ok(await page.locator('#quadro .project-row').count()>0,'linhas de projeto disponíveis');
  for(const id of ['peca-2','peca-4','proxima-3','proxima-2'])assert.equal(await row(page,id).locator('.blocked-reason').count(),0,id+' não trava');
  assert.equal((await row(page,'peca-2').locator('[aria-current="step"]').textContent()).trim(),'Pronta');
  assert.equal((await row(page,'peca-4').locator('[aria-current="step"]').textContent()).trim(),'Criação');
});

test('Layout A miniatura conserva arte inteira 4:5 e não carrega projetos ocultos',{skip},async t=>{
  const context=await abrirLayout(t,{width:1440}),{page}=context;
  const img=page.locator('.planning-week [data-producao-id="peca-1"] img');
  await img.evaluate(n=>n.decode());
  assert.equal(await img.evaluate(n=>getComputedStyle(n).objectFit),'contain');
  const box=await img.boundingBox();assert.ok(Math.abs(box.width/box.height-0.8)<0.02);
  assert.equal(pedidosMidia(context).some(r=>r.path.includes('proxima')),false,'projeto oculto não solicita imagem');
  await modo(page,'Mês');
  const before=pedidosMidia(context).length;await page.locator('#proximo').click();
  assert.equal(pedidosMidia(context).length,before,'Mês sem prefetch de imagens');
});

test('Layout A falha de miniatura conserva peça e texto externo permanece literal',{skip},async t=>{
  const {page}=await abrirLayout(t,{width:1440,
    editar:raw=>mudarPorId(raw,'Produções','peca-1','titulo','<img src=x onerror=alert(1)> título sintético'),
    download:async()=>{throw new Error('falha sintética de transporte');}});
  const card=page.locator('.planning-week [data-producao-id="peca-1"]');
  await page.waitForFunction(()=>document.querySelector('.planning-week [data-producao-id="peca-1"] .piece-thumbnail')?.getAttribute('aria-label')==='Prévia indisponível');
  assert.match(await card.textContent(),/<img src=x onerror=alert\(1\)> título sintético/);
  assert.equal(await card.locator('img').count(),0);await card.click();assert.equal(await page.locator('#dia').isVisible(),true);
});

test('Layout A Semana móvel começa mostrando hoje e preserva rolagem ao filtrar',{skip},async t=>{
  const {page}=await abrirLayout(t,{width:390});
  const region=page.locator('.planning-week'),today=page.locator('.planning-day.today');
  const box=await region.boundingBox(),day=await today.boundingBox();
  assert.ok(day.x>=box.x&&day.x+day.width<=box.x+box.width,'hoje visível dentro da região');
  await region.evaluate(n=>{n.scrollLeft=0;});await page.locator('[data-formato="Imagem"]').click();
  assert.equal(await region.evaluate(n=>n.scrollLeft),0,'rolagem escolhida permanece no mesmo período');
});

test('Layout A rolagem volta após atualizar pela Produção',{skip},async t=>{
  const context=await abrirLayout(t,{width:390}),{page}=context,region=page.locator('#lista');
  await region.evaluate(n=>{n.scrollLeft=137;});
  await navegar(page,'producao');context.setMode('completa');await atualizar(context);await navegar(page,'planejamento');
  assert.equal(context.calls(),1);
  assert.equal(await region.evaluate(n=>n.scrollLeft),137,'retorno restaura posição mesmo com grade recriada em outra tela');
});

test('Layout A setas conservam mês selecionado enquanto a semana o intersecta',{skip},async t=>{
  const {page}=await abrirLayout(t);await page.locator('#anterior').click();
  assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-09-28');
  assert.match(await page.locator('#objetivo-toggle').textContent(),/Outubro/);
  await page.locator('#anterior').click();assert.match(await page.locator('#objetivo-toggle').textContent(),/Setembro/);
  await page.locator('#proximo').click();assert.match(await page.locator('#objetivo-toggle').textContent(),/Setembro/);
  await page.locator('#proximo').click();assert.match(await page.locator('#objetivo-toggle').textContent(),/Outubro/);
  await modo(page,'Mês');await page.locator('#proximo').click();
  await page.locator('.month-week[data-inicio-semana="2026-11-02"]').click();await page.locator('#anterior').click();
  assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-26');
  assert.match(await page.locator('#objetivo-toggle').textContent(),/Novembro/);
});

test('Layout A cabeçalho mostra pauta confirmada da semana',{skip},async t=>{
  const {page}=await abrirLayout(t);
  assert.match(await page.locator('#week-title').textContent(),/S1.*Oferta sintética de outubro/);
  await page.locator('#proximo').click();
  assert.match(await page.locator('#week-title').textContent(),/S2.*Conexões da próxima semana/);
});

test('Layout A cabeçalho não confirma pauta pelo início quando a Semana diverge',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    mudarPorId(raw,'Semanas','semana-01','tema','');
    mudarPorId(raw,'Semanas','semana-01','pauta_id','pauta-outubro-2');
  }});
  assert.equal(await page.locator('#week-title').textContent(),'');
  assert.equal(await page.locator('.layout-card').count(),5);
  const view=await (await page.request.get(new URL('/api/visao',page.url()).href)).json();
  assert.equal(view.semanas.find(w=>w.semana_id==='semana-01').pautaOrigem,null);
  assert.ok(view.avisos.some(a=>a.aba==='Semanas'&&a.campo==='pauta_id'));
});

test('Layout A tema aceita semana registrada fora da segunda-feira',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    mudarPorId(raw,'Semanas','semana-01','inicio_semana','2026-10-06');
    mudarPorId(raw,'Semanas','semana-01','tema','Tema sintético fora da segunda');
  }});
  assert.match(await page.locator('#week-title').textContent(),/Tema sintético fora da segunda/);
  await navegar(page,'producao');
  assert.match(await page.locator('.project[data-semana-id="semana-01"] h2').textContent(),/Tema sintético fora da segunda/);
});

test('Layout A progresso da Semana acompanha o formato filtrado',{skip},async t=>{
  const {page}=await abrirLayout(t);
  assert.equal(await page.locator('#week-progress').textContent(),'2 de 5 prontas');
  await page.locator('[data-formato="Reels"]').click();
  assert.equal(await page.locator('.layout-card').count(),1);
  assert.equal(await page.locator('#week-progress').textContent(),'0 de 1 prontas');
  await navegar(page,'producao');
  assert.match(await page.locator('.project[data-semana-id="semana-01"]').textContent(),/2 de 4 prontas/,'Produção mantém o projeto inteiro');
  await navegar(page,'planejamento');await page.locator('[data-formato="Todos"]').click();
  assert.equal(await page.locator('#week-progress').textContent(),'2 de 5 prontas');
});

test('Layout A semana atual vazia normaliza início fora da segunda-feira',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>adicionarRegistro(raw,'Semanas',{
    semana_id:'semana-atual-vazia',marca_id:'ntv',inicio_semana:'2026-10-09',tema:'Semana sintética em curso'
  })});
  await navegar(page,'producao');const project=page.locator('.project[data-semana-id="semana-atual-vazia"]');
  assert.equal(await project.locator('.future-project').count(),0);
  assert.equal(await project.locator('h2').textContent(),'Semana sintética em curso');
  assert.equal(await page.locator('.project[data-semana-id="semana-futura"] .future-project').textContent(),'Planejamento na sexta-feira');
});

test('Layout A semana registrada sem período conserva sua identidade',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>mudarPorId(raw,'Semanas','semana-01','inicio_semana','')});
  await navegar(page,'producao');const project=page.locator('.project[data-semana-id="semana-01"]');
  assert.equal(await project.locator('.project-heading small').textContent(),'Período não identificado');
  assert.match(await project.locator('h2').textContent(),/Oferta sintética de outubro/);
  assert.equal(await project.locator('.project-row').count(),4);
  assert.equal(await page.locator('.project[data-semana-id=""] h2').textContent(),'Semana não identificada');
});

test('Layout A Sem data identifica vínculo e semana ausente',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    mudarPorId(raw,'Produções','peca-1','data_prevista','');
    mudarPorId(raw,'Semanas','semana-01','tema','Semana sintética com vínculo');
  }});
  await page.locator('#abrir-sem-data').click();
  const linked=page.locator('#lista-sem-data [data-producao-id="peca-1"]');
  assert.match(await linked.textContent(),/Semana sintética com vínculo/);
  assert.match(await page.locator('#lista-sem-data [data-producao-id="peca-sem-data"]').textContent(),/Semana não identificada/);
  await linked.focus();await page.keyboard.press('Enter');
  assert.match(await page.locator('#dia-titulo').textContent(),/Sem data.*Semana sintética com vínculo/);
});

test('Layout A Sem data suporta semana sem tema nem período',{skip},async t=>{
  const {page}=await abrirLayout(t,{editar:raw=>{
    mudarPorId(raw,'Produções','peca-1','data_prevista','');
    mudarPorId(raw,'Semanas','semana-01','tema','');mudarPorId(raw,'Semanas','semana-01','inicio_semana','');
  }});
  await page.locator('#abrir-sem-data').click();
  assert.match(await page.locator('#lista-sem-data [data-producao-id="peca-1"]').textContent(),/Semana não identificada/);
});

test('Layout A primeira semana cruzada conserva o mês escolhido',{skip},async t=>{
  const {page}=await abrirLayout(t);await modo(page,'Mês');await page.locator('#proximo').click();
  await page.locator('.month-week[data-inicio-semana="2026-10-26"]').click();
  assert.equal(await page.locator('.planning-day').first().getAttribute('data-data'),'2026-10-26');
  assert.match(await page.locator('#objetivo-toggle').textContent(),/Novembro/);
  await modo(page,'Mês');assert.match(await page.locator('#mes').textContent(),/Novembro/);
  await page.locator('#anterior').click();await page.locator('.month-week[data-inicio-semana="2026-09-28"]').click();
  assert.match(await page.locator('#objetivo-toggle').textContent(),/Outubro/);
  await modo(page,'Mês');assert.match(await page.locator('#mes').textContent(),/Outubro/);
});

test('Layout A projeto futuro vazio identifica período sem tema ou progresso inventados',{skip},async t=>{
  const {page}=await abrirLayout(t,{width:1440});await navegar(page,'producao');
  const future=page.locator('.project[data-semana-id="semana-futura"]');
  assert.match(await future.locator('header').textContent(),/19.*25/);
  assert.equal(await future.locator('.future-project').textContent(),'Planejamento na sexta-feira');
  assert.equal(await future.locator('h2,.project-topic,.project-progress').count(),0);
});
