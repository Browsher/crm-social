'use strict';
const $=selector=>document.querySelector(selector);
const state={view:null,mes:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).format(new Date()),
  formato:'Todos',modo:matchMedia('(max-width:720px)').matches?'Lista':'Calendário',
  semanaId:undefined,abaPlanilha:'Semanas',avisosProducaoId:null};
function node(tag,text,className) {
  const el=document.createElement(tag);
  if (text!==undefined) el.textContent=text;
  if (className) el.className=className;
  return el;
}
function civil(date,options) {
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'UTC',...options}).format(new Date(date+'T12:00:00Z'));
}
function idsParaPecas(ids) { return ids.map(id=>state.view.producoes.find(p=>p.producao_id===id)); }
function aceito(p) { return state.formato==='Todos' || state.formato===p.formato; }
const rotulosStatus={em_planejamento:'Em planejamento',pronto:'Pronto',publicado:'Publicado',erro:'Erro',cancelado:'Cancelado',cancelada:'Cancelada'};
function statusLegivel(value) {
  return Object.hasOwn(rotulosStatus,value)?rotulosStatus[value]:(value || 'Estado não informado');
}
let focoDia=null;
function abrirDia(data,ids,semanaId=null) {
  focoDia=document.activeElement;
  const semana=state.view.semanas.find(s=>s.semana_id===semanaId);
  $('#dia-titulo').textContent=data?civil(data,{weekday:'long',day:'2-digit',month:'long'}):'Sem data · '+(semana?.tema || 'Semana não identificada');
  $('#dia-quantidade').textContent=ids.length+(ids.length===1?' peça registrada':' peças registradas');
  const registros=idsParaPecas(ids),pecas=registros.map((p,i)=>acordeaoPeca(p,i===0));
  if(pecas.length) pecas.push(documentosDoDia(registros));
  $('#dia-pecas').replaceChildren(...(pecas.length?pecas:[node('p','Nenhuma peça registrada neste dia.','empty')]));
  $('#dia').showModal();
}
function valor(value) {return value===null || value===undefined || (typeof value==='string' && value.trim()==='')?'Não informado':String(value);}
const preenchido=value=>value!==null && value!==undefined && String(value).trim()!=='';
function plural(n,um,muitos=um+'s') {return n+' '+(n===1?um:muitos);}
const rotulosEtapa={arte_aprovada:'Arte aprovada',prompts_imagem_prontos:'Prompts de imagem prontos',
  imagens_em_producao:'Imagens em produção',voz_pronta_para_gerar:'Voz pronta para gerar',voz_em_producao:'Voz em produção',
  clipes_prontos_para_gerar:'Clipes prontos para gerar',clipes_em_producao:'Clipes em produção',
  montagem_pronta:'Montagem pronta',montagem_em_producao:'Montagem em produção'};
function etapaLegivel(value) {return Object.hasOwn(rotulosEtapa,value)?rotulosEtapa[value]:String(value);}
function fatosPeca(p) {
  const dl=node('dl',undefined,'piece-facts');
  const campos=[['Etapa',preenchido(p.etapa_producao)?etapaLegivel(p.etapa_producao):null],['Com quem está',p.responsavel_atual],
    ['Prevista',p.dataCivil?civil(p.dataCivil,{day:'2-digit',month:'2-digit'}):null],['Versão',p.versao]];
  for(const [nome,value] of campos) {
    if(!preenchido(value)) continue;
    const pair=node('div');pair.append(node('dt',nome),node('dd',valor(value)));dl.append(pair);
  }
  return dl;
}
function secaoDetalhe(titulo) {
  const section=node('section',undefined,'detail-section');section.append(node('h3',titulo));return section;
}
function urlAutorizada(value) {
  if(typeof value!=='string') return null;
  try {
    const u=new URL(value);
    return u.protocol==='https:' && ['drive.google.com','docs.google.com'].includes(u.host) && !u.username && !u.password?u.href:null;
  } catch {return null;}
}
function linkArquivo(a,label) {
  const href=urlAutorizada(a?.url);
  if(!href) return null;
  const link=node('a',label);link.href=href;link.target='_blank';link.rel='noopener noreferrer';return link;
}
function arquivoRegistro(a) {
  const box=node('article',undefined,'file-record');
  box.append(node('strong',a.nomeApresentacao),node('small','Versão '+valor(a.versao)+' · registro'));
  const link=linkArquivo(a,'Abrir registro no Drive/Docs');
  if(link) box.append(link);
  else box.append(node('p','link não permitido','record-text'));
  return box;
}
function arquivosDaUnidade(records,avisoMidia) {
  const list=node('span',undefined,'unit-files'),ids=new Set();let ausente=records.length===0,recusado=false;
  for(const a of records) {
    const link=linkArquivo(a,a?.nomeApresentacao || 'Mídia');
    if(!a) ausente=true;
    else if(!link) recusado=true;
    else if(!ids.has(a.arquivo_id)) {ids.add(a.arquivo_id);list.append(link);}
  }
  const aviso=[avisoMidia || (ausente?'Mídia ausente':null),recusado?'link não permitido':null].filter(preenchido).join('; ');
  if(aviso) list.append(node('span',aviso,'notice'));
  return list;
}
function unidadeDetalhe(u,tipo) {
  const pagina=tipo==='paginas',box=node('article',undefined,'unit-record');
  box.dataset[pagina?'pagina':'cena']=u[pagina?'pagina_id':'cena_id'];
  const text=node('span',undefined,'unit-text');
  box.append(node('span',(pagina?'Página ':'Cena ')+valor(u.indice),'unit-number'));
  if(pagina) {
    text.append(node('span',u.titulo || u.corpo || 'Texto não registrado'),node('small','Design novo: '+u.designNovo));
  } else {
    text.append(node('span',u.texto || 'Texto não registrado'));
    if(preenchido(u.inicio_segundos) || preenchido(u.duracao_segundos)) text.append(node('small',
      'Início: '+valor(u.inicio_segundos)+' s · duração: '+valor(u.duracao_segundos)+' s'));
  }
  box.append(text);
  box.append(arquivosDaUnidade(u.arquivos,pagina?undefined:u.avisoMidia));return box;
}
function secaoUnidades(records,tipo) {
  const section=secaoDetalhe(tipo==='paginas'?'Páginas':'Cenas');section.dataset.unidades=tipo;
  const groups=new Map();
  for(const u of records) {
    const key=JSON.stringify(u.versao);
    if(!groups.has(key)) groups.set(key,[]);groups.get(key).push(u);
  }
  const ordenados=[...groups.values()].sort((a,b)=>Number(b[0].vigente)-Number(a[0].vigente));
  for(const group of ordenados) {
    const first=group[0],box=node(first.vigente?'section':'details',undefined,'version-group'+(first.vigente?'':' history'));
    box.dataset.versao=String(first.versao);
    box.append(node(first.vigente?'h4':'summary','Versão '+valor(first.versao)+(first.vigente?' · vigente':' · impacto atual a confirmar')));
    box.append(...group.map(u=>unidadeDetalhe(u,tipo)));section.append(box);
  }
  return section;
}
function secaoRevisoes(records,grupo) {
  const nomes={vigentes:'Revisão vigente',resolvidas:'Revisões resolvidas · histórico',anteriores:'Revisões de outras versões',ambiguas:'Revisões com vínculo a confirmar'};
  const section=secaoDetalhe(nomes[grupo]);section.dataset.revisoes=grupo;
  if(grupo!=='vigentes') section.classList.add('history');
  if(grupo==='vigentes') {
    if(records[0]) section.append(revisaoLinha(records[0],grupo));
    if(records.length>1) {
      const more=recolhido('+'+plural(records.length-1,'revisão aberta','revisões abertas'));
      more.append(...records.slice(1).map(r=>revisaoLinha(r,grupo)));section.append(more);
    }
  } else section.append(...records.map(r=>revisaoLinha(r,grupo)));
  return section;
}
function revisaoLinha(r,grupo) {
  const review=node('article',undefined,'review-record');
  const titulo=[r.decisao==='revisar'?'Revisar':r.decisao,preenchido(r.versao)?'versão '+r.versao:null].filter(preenchido).join(' · ');
  review.append(node('span',titulo+(preenchido(r.motivo)?' — '+r.motivo:'')));
  const correcao=[preenchido(r.responsavel_correcao)?'Corrige: '+r.responsavel_correcao:null,r.estado_tratamento].filter(preenchido);
  if(correcao.length) review.append(node('small',correcao.join(' · ')));
  if(grupo==='anteriores' || grupo==='ambiguas') review.append(node('small','Impacto atual a confirmar.'));
  return review;
}
function recolhido(titulo) {
  const el=node('details',undefined,'fold');el.append(node('summary',titulo));return el;
}
function textosRegistrados(p) {
  const el=recolhido('Texto registrado');el.dataset.textos='';
  if(preenchido(p.legenda)) el.append(node('p',p.legenda));
  for(const [tipo,records] of [['Página',p.detalhes.paginas],['Cena',p.detalhes.cenas]]) for(const u of records) {
    const partes=[['Corpo',u.corpo],['Função',u.funcao],['Texto na tela',u.texto_tela]].filter(([,v])=>preenchido(v));
    if(partes.length) el.append(node('p',tipo+' '+valor(u.indice)+' · versão '+valor(u.versao)+' · '+partes.map(([nome,v])=>nome+': '+v).join(' · ')));
  }
  const files=secaoDetalhe('Arquivos · registros');files.append(...p.detalhes.arquivos.map(arquivoRegistro));
  el.append(files);return el;
}
function documentosDoDia(pecas) {
  const section=secaoDetalhe('Documentos da semana'),weeks=new Map();section.dataset.documentosDia='';
  for(const p of pecas) if(!weeks.has(p.semanaId)) weeks.set(p.semanaId,p.detalhes.documentosSemana);
  for(const [id,records] of weeks) {
    const group=node('div',undefined,'week-documents');group.dataset.semana=id ?? '';
    if(weeks.size>1 || id===null) group.append(node('small',state.view.semanas.find(s=>s.semana_id===id)?.tema || 'Semana não identificada'));
    for(const r of records) {
      const label=r.papel+': '+(r.arquivo?.nomeApresentacao || '—');
      const item=linkArquivo(r.arquivo,label) || node('span',label);
      item.dataset.papel=r.papel;group.append(item);
    }
    section.append(group);
  }
  return section;
}
function resumoPeca(d) {
  const unidades=['paginas','cenas'].map(tipo=>[tipo,d[tipo].filter(u=>u.vigente).length]).filter(([,n])=>n>0)
    .map(([tipo,n])=>plural(n,tipo==='paginas'?'página':'cena'));
  const revisao=d.revisoes.vigentes.length?'revisão aberta':
    (d.revisoes.ambiguas.length || d.revisoes.anteriores.length?'revisão a confirmar':'sem revisão');
  return [...unidades,revisao,plural(d.avisos.length,'aviso')].join(' · ');
}
function avisosPeca(p) {
  const avisos=p.detalhes.avisos;
  const box=node('div',undefined,'data-notice');
  box.append(node('span',plural(avisos.length,'aviso')+' de dados nesta peça'));
  const link=node('a','ver na Planilha');link.href='#planilha';
  link.addEventListener('click',e=>{
    e.preventDefault();focoDia=$('#avisos-dados');$('#dia').close();navegar('planilha',p.producao_id);
    $('#avisos-dados').scrollIntoView({block:'start'});$('#avisos-dados').focus({preventScroll:true});
  });
  box.append(link);return box;
}
function acordeaoPeca(p,aberto) {
  const el=node('details',undefined,'peca-acordeao'),summary=node('summary'),d=p.detalhes;
  el.dataset.peca=p.producao_id;el.open=aberto;
  summary.append(node('span',p.formato,'format-label'),node('strong',p.titulo || 'Título não informado'),node('span',statusLegivel(p.status),'status'),
    node('small',resumoPeca(d),'piece-hint'));
  const body=node('div',undefined,'piece-body');
  body.append(fatosPeca(p));
  if(d.publicacaoRegistrada) body.append(node('p','Publicação: '+valor(p.publicado_em)+' · registro explícito','publication'));
  if(d.revisoes.vigentes.length) body.append(secaoRevisoes(d.revisoes.vigentes,'vigentes'));
  for(const tipo of ['paginas','cenas']) if(d[tipo].length) body.append(secaoUnidades(d[tipo],tipo));
  body.append(textosRegistrados(p));
  const historico=recolhido('Histórico');historico.dataset.historico='';
  for(const grupo of ['resolvidas','anteriores','ambiguas']) if(d.revisoes[grupo].length) historico.append(secaoRevisoes(d.revisoes[grupo],grupo));
  if(historico.children.length>1) body.append(historico);
  if(d.avisos.length) body.append(avisosPeca(p));
  el.append(summary,body);return el;
}
function cartao(p) {
  const el=node('button',undefined,'post '+p.formato.toLowerCase());
    el.type='button'; el.dataset.producaoId=p.producao_id;
    el.addEventListener('click',()=>{
      const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
      abrirDia(group.data,group.ids,group.semanaId);
    });
  el.append(node('small',p.formato),node('strong',p.titulo || 'Título não informado'),node('span',statusLegivel(p.status),'status'));
  return el;
}
function dataMais(date,n) {
  const value=new Date(date+'T12:00:00Z');
  value.setUTCDate(value.getUTCDate()+n);
  return value.toISOString().slice(0,10);
}
function calendario() {
  const header=node('div',undefined,'weekdays'), grid=node('div',undefined,'calendar-grid');
  for (const dia of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']) header.append(node('span',dia));
  const first=state.mes+'-01', weekday=new Date(first+'T12:00:00Z').getUTCDay();
  const start=dataMais(first,-((weekday+6)%7));
  const nextMonth=new Date(first+'T12:00:00Z');
  nextMonth.setUTCMonth(nextMonth.getUTCMonth()+1);
  const last=dataMais(nextMonth.toISOString().slice(0,10),-1), end=dataMais(last,6-((new Date(last+'T12:00:00Z').getUTCDay()+6)%7));
  for (let date=start;date<=end;date=dataMais(date,1)) {
    const outside=!date.startsWith(state.mes), cell=node('div',undefined,'day'+(outside?' outside':''));
    const dateButton=node('button',String(Number(date.slice(-2))),'date-number');
    dateButton.type='button';dateButton.setAttribute('aria-label',civil(date,{day:'numeric',month:'long'}));
    const group=state.view.dias.find(d=>d.data===date), allIds=group?.ids ?? [];
    dateButton.addEventListener('click',()=>abrirDia(date,allIds));
    cell.append(dateButton);
    for (const week of state.view.semanas.filter(s=>s.periodo.inicio===date)) cell.append(node('p',week.tema || 'Tema não informado','week-theme'));
    const filtered=idsParaPecas(allIds).filter(aceito);
    if (filtered.length) cell.append(cartao(filtered[0]));
    if (filtered.length>1) {
      const more=node('button','+'+(filtered.length-1)+' no dia','more');
      more.type='button';more.addEventListener('click',()=>abrirDia(date,allIds));cell.append(more);
    }
    grid.append(cell);
  }
  $('#calendario').replaceChildren(header,grid);
}
function row(p) {
  const el=node('button',undefined,'agenda-row');
  el.type='button';el.dataset.producaoId=p.producao_id;
  el.append(node('small',p.dataCivil?civil(p.dataCivil,{day:'2-digit',month:'short'}):'Sem data'),
    node('strong',p.titulo || 'Título não informado'),node('small',p.formato,'row-format'),node('small',statusLegivel(p.status),'row-status'));
  el.addEventListener('click',()=>abrirDiaDaPeca(p));
  return el;
}
function abrirDiaDaPeca(p) {
  const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
  abrirDia(group.data,group.ids,group.semanaId);
}
function semanasQuadro() {
  return state.view.semanas.slice().sort((a,b)=>(a.periodo.inicio ?? 'z').localeCompare(b.periodo.inicio ?? 'z') ||
    String(a.semana_id).localeCompare(String(b.semana_id)));
}
function semanaDoQuadro(weeks) {
  let week=weeks.find(s=>s.semana_id===state.semanaId);
  if(week)return week;
  const hoje=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  week=weeks.find(s=>s.periodo.inicio && s.periodo.inicio<=hoje && s.periodo.fim>=hoje) ??
    weeks.filter(s=>s.periodo.inicio).at(-1) ?? weeks[0];
  state.semanaId=week?.semana_id;return week;
}
function pendenciaQuadro(p) {
  const mostrarMidia=['Mídia','Revisão','Pronta','Publicada','Outras'].includes(p.quadro.coluna);
  const records=p.quadro.pendencias.filter(r=>r.tipo!=='midia' || mostrarMidia);
  if(!records.length)return null;
  const first=records[0],box=node('span',undefined,'board-pending');
  box.append(node('span',first.tipo==='revisao'?'Revisão: '+first.texto:'Mídia ausente'));
  if(first.tipo==='revisao' && preenchido(first.responsavelCorrecao))box.append(node('small','Corrige: '+first.responsavelCorrecao));
  if(records.length>1)box.append(node('small','+'+plural(records.length-1,'pendência')));
  return box;
}
function cartaoQuadro(p) {
  const card=node('button',undefined,'quadro-card '+p.formato.toLowerCase());
  card.type='button';card.dataset.producaoId=p.producao_id;
  const meta=node('span',undefined,'board-card-meta');
  meta.append(node('small',p.formato),node('small',p.dataCivil?civil(p.dataCivil,{day:'2-digit',month:'2-digit'}):'Sem data'));
  card.append(meta,node('strong',p.titulo || 'Título não informado'));
  if(p.quadro.coluna==='Outras')card.append(node('span',preenchido(p.etapa_producao)?String(p.etapa_producao):'Não informada','board-stage'));
  card.append(node('small',statusLegivel(p.status),'board-status'),node('small','Com quem está: '+p.detalhes.responsavelRegistrado,'board-owner'));
  const pending=pendenciaQuadro(p);if(pending)card.append(pending);
  card.addEventListener('click',()=>abrirDiaDaPeca(p));return card;
}
function colunaQuadro(coluna) {
  const box=node('section',undefined,'quadro-coluna');box.dataset.coluna=coluna.nome;
  const heading=node('header');heading.append(node('h3',coluna.titulo),node('span',String(coluna.ids.length),'column-count'));
  const cards=node('div',undefined,'board-cards');
  cards.append(...(coluna.ids.length?idsParaPecas(coluna.ids).map(cartaoQuadro):[node('p','Sem peças','coluna-vazia')]));
  box.append(heading,cards);return box;
}
function renderProducao() {
  const weeks=semanasQuadro(),week=semanaDoQuadro(weeks),index=weeks.indexOf(week);
  $('#semana-anterior').disabled=index<=0;$('#semana-proxima').disabled=index<0 || index===weeks.length-1;
  const empty=!state.view.captura || !week;
  $('#quadro-vazio').hidden=!empty;
  $('#quadro-vazio').textContent=state.view.captura?'Nenhuma semana registrada nesta captura.':'Produção sem dados. Peça a primeira leitura à Central.';
  $('#semana-tema').textContent=week?.tema || (empty?'Sem dados':'Tema não informado');
  $('#semana-periodo').textContent=week?.periodo.inicio?
    civil(week.periodo.inicio,{day:'2-digit',month:'2-digit'})+' – '+civil(week.periodo.fim,{day:'2-digit',month:'2-digit'}):'';
  $('#quadro-total').textContent=week?plural(week.ids.length,'peça')+' nesta semana':'';
  const group=state.view.quadro.semanas.find(s=>s.semanaId===week?.semana_id);
  $('#quadro').replaceChildren(...(empty?[]:group.colunas.map(colunaQuadro)));
}
function trocarSemana(delta) {
  if(!state.view)return;
  const weeks=semanasQuadro(),index=weeks.findIndex(s=>s.semana_id===state.semanaId),next=weeks[index+delta];
  if(next){state.semanaId=next.semana_id;renderProducao();}
}
function pecaVisivel(p,week) {
  if (!p.dataCivil || p.dataCivil.startsWith(state.mes)) return true;
  if (!week.periodo.inicio) return false;
  const cruzaMes=week.periodo.inicio.slice(0,7)<=state.mes && week.periodo.fim.slice(0,7)>=state.mes;
  return cruzaMes && p.dataCivil>=week.periodo.inicio && p.dataCivil<=week.periodo.fim;
}
function lista(semData=false) {
  const groups=[];
  for (const week of state.view.semanas) {
    const pecas=idsParaPecas(week.ids).filter(p=>semData?p.dataCivil===null:aceito(p) && pecaVisivel(p,week));
    if (!pecas.length) continue;
    const group=node('section',undefined,'agenda-week'), header=node('header');
    header.append(node('h3',week.tema || 'Tema não informado'),node('small',week.periodo.inicio?civil(week.periodo.inicio,{day:'2-digit',month:'short'})+' – '+civil(week.periodo.fim,{day:'2-digit',month:'short'}):'Período não identificado'));
    const rows=node('div',undefined,'agenda-rows');rows.append(...pecas.map(row));
    group.append(header,rows);groups.push(group);
  }
  if (!groups.length) groups.push(node('p',semData?'Nenhuma peça sem data.':'Nenhuma peça neste mês e formato.','empty'));
  (semData?$('#lista-sem-data'):$('#lista')).replaceChildren(...groups);
}
function render() {
  if(!state.view) return;
  const mes=civil(state.mes+'-01',{month:'long',year:'numeric'});
  $('#mes').textContent=mes.charAt(0).toUpperCase()+mes.slice(1);
  const empty=state.view.captura===null;
  $('#sem-captura').hidden=!empty;
  $('#calendario').hidden=empty || state.modo!=='Calendário';
  $('#lista').hidden=empty || state.modo!=='Lista';
  const semData=state.view.producoes.filter(p=>p.dataCivil===null).length;
  $('#abrir-sem-data').textContent=semData+' sem data';
  $('#abrir-sem-data').hidden=semData===0;
  $('#total').textContent=state.view.producoes.length+' peças registradas';
  for (const b of document.querySelectorAll('[data-formato]')) { const active=b.dataset.formato===state.formato;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); }
  for (const b of document.querySelectorAll('[data-modo]')) { const active=b.dataset.modo===state.modo;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); }
  calendario();lista();lista(true);renderProducao();
}
function navegar(tela,producaoId=null) {
  for (const id of ['planejamento','producao','planilha']) $('#'+id).hidden=id!==tela;
  for (const b of document.querySelectorAll('[data-tela]')) b.classList.toggle('active',b.dataset.tela===tela);
  const nome={planejamento:'Planejamento',producao:'Produção',planilha:'Planilha'}[tela];
  $('#titulo').textContent=nome;$('#caminho').textContent=nome;
  $('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');
  if(tela==='planilha') {
    state.avisosProducaoId=producaoId;
    if(producaoId!==null) state.abaPlanilha='Produções';
    if(state.view) renderPlanilha();
  }
}
function controles() {
  for (const b of document.querySelectorAll('[data-tela]')) b.addEventListener('click',()=>navegar(b.dataset.tela));
  for (const b of document.querySelectorAll('[data-formato]')) b.addEventListener('click',()=>{state.formato=b.dataset.formato;render();});
  for (const b of document.querySelectorAll('[data-modo]')) b.addEventListener('click',()=>{state.modo=b.dataset.modo;render();});
  for (const [id,n] of [['anterior',-1],['proximo',1]]) $('#'+id).addEventListener('click',()=>{
    const date=new Date(state.mes+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+n);state.mes=date.toISOString().slice(0,7);render();
  });
  $('#abrir-sem-data').addEventListener('click',()=>{$('#sem-data').hidden=false;$('#sem-data').scrollIntoView({block:'start'});});
  $('#fechar-sem-data').addEventListener('click',()=>{$('#sem-data').hidden=true;$('#abrir-sem-data').focus();});
  $('#fechar-dia').addEventListener('click',()=>$('#dia').close());
  $('#dia').addEventListener('close',()=>{if(focoDia?.isConnected) focoDia.focus();});
  $('#menu').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
  $('#selo').addEventListener('click',()=>navegar('planilha'));
  $('#atualizar').addEventListener('click',reler);
  $('#semana-anterior').addEventListener('click',()=>trocarSemana(-1));
  $('#semana-proxima').addEventListener('click',()=>trocarSemana(1));
  $('#todos-avisos').addEventListener('click',()=>{state.avisosProducaoId=null;renderAvisosPlanilha();$('#avisos-dados').focus();});
}
function tabelaLocal(cabecalhos,linhas,nome) {
  const region=node('div',undefined,'table-scroll');region.setAttribute('role','region');
  region.setAttribute('aria-label',nome+' · rolagem horizontal');region.tabIndex=0;
  const table=node('table'),head=node('thead'),header=node('tr'),body=node('tbody');
  for(const campo of cabecalhos) {const th=node('th',campo);th.scope='col';header.append(th);}
  head.append(header);
  for(const linha of linhas) {
    const row=node('tr');for(const value of linha) row.append(node('td',String(value ?? '')));
    body.append(row);
  }
  table.append(head,body);region.append(table);return region;
}
function horarioLocal(value) {
  const time=Date.parse(value);
  if(!Number.isFinite(time)) return 'Horário não informado';
  return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',
    day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(time));
}
function historicoPlanilha() {
  const records=state.view.historico;
  if(!records.length) return node('p','Nenhuma tentativa confirmada.','empty');
  const rotulos={completa:'Completa',falhou:'Falhou'};
  const table=tabelaLocal(['Concluída em · São Paulo','Resultado','Motivo resumido'],
    records.map(r=>[horarioLocal(r.concluidaEm),rotulos[r.resultado] ?? r.resultado,r.motivoResumo]),'Histórico');
  [...table.querySelectorAll('tbody tr')].forEach((row,i)=>{row.dataset.resultado=records[i].resultado;});
  return table;
}
function renderAvisosPlanilha() {
  const p=state.view.producoes.find(p=>p.producao_id===state.avisosProducaoId);
  if(!p) state.avisosProducaoId=null;
  const avisos=p?p.detalhes.avisos:state.view.avisos;
  if(state.view.captura) $('#avisos-dados').dataset.producaoId=state.avisosProducaoId ?? '';
  else delete $('#avisos-dados').dataset.producaoId;
  $('#avisos-dados').hidden=state.abaPlanilha==='Histórico' || avisos.length===0;
  $('#avisos-filtro').textContent=(p?(p.titulo || 'Peça sem título')+' · ':'Todas as peças · ')+plural(avisos.length,'aviso');
  $('#todos-avisos').hidden=!p;
  $('#avisos-tabela').replaceChildren(tabelaLocal(['Aba','Linha','Campo','Motivo'],
    avisos.map(a=>[a.aba ?? '—',a.linha ?? '—',a.campo ?? '—',a.motivo]),'Avisos de dados'));
}
function escolherAba(nome) {
  state.abaPlanilha=nome;renderPlanilha();
  const selected=$('#abas-planilha [aria-selected="true"]');selected.focus();
  selected.scrollIntoView({block:'nearest',inline:'nearest'});
}
function tabPlanilha(aba,index,abas) {
  const button=node('button',aba.nome+' · '+aba.quantidadeLinhas);button.type='button';
  button.id='aba-planilha-'+index;button.dataset.aba=aba.nome;button.setAttribute('role','tab');
  button.setAttribute('aria-controls','dados-planilha');button.setAttribute('aria-selected',String(aba.nome===state.abaPlanilha));
  button.tabIndex=aba.nome===state.abaPlanilha?0:-1;
  button.addEventListener('click',()=>escolherAba(aba.nome));
  button.addEventListener('keydown',event=>{
    const destinos={ArrowRight:(index+1)%abas.length,ArrowLeft:(index+abas.length-1)%abas.length,Home:0,End:abas.length-1};
    if(!Object.hasOwn(destinos,event.key)) return;
    event.preventDefault();escolherAba(abas[destinos[event.key]].nome);
  });return button;
}
function renderPlanilha() {
  const abas=[...state.view.planilha,{nome:'Histórico',quantidadeLinhas:state.view.historico.length}];
  if(!abas.some(a=>a.nome===state.abaPlanilha)) state.abaPlanilha=abas[0].nome;
  $('#planilha-vazia').hidden=state.view.captura!==null;
  $('#abas-planilha').replaceChildren(...abas.map((aba,i)=>tabPlanilha(aba,i,abas)));
  const index=abas.findIndex(a=>a.nome===state.abaPlanilha),aba=abas[index],panel=$('#dados-planilha');
  panel.setAttribute('aria-labelledby','aba-planilha-'+index);
  const heading=node('header',undefined,'sheet-heading');
  heading.append(node('h2',aba.nome),node('p',plural(aba.quantidadeLinhas,aba.nome==='Histórico'?'tentativa confirmada':'linha da NTV',
    aba.nome==='Histórico'?'tentativas confirmadas':'linhas da NTV')));
  const contents=aba.nome==='Histórico'?historicoPlanilha():
    (aba.linhas.length?tabelaLocal(aba.cabecalhos,aba.linhas.map(r=>aba.cabecalhos.map(h=>celulaPlanilha(h,r[h]))),aba.nome):node('p','Nenhuma linha da NTV nesta tabela.','empty'));
  panel.replaceChildren(heading,contents);renderAvisosPlanilha();
}
function celulaPlanilha(campo,value) {
  const dedicada=['url','url_video_final'].includes(campo);
  if(dedicada && preenchido(value) && value!=='[conteúdo suprimido]' && !urlAutorizada(value)) return 'link não permitido';
  return value;
}
function detalhesCaptura() {
  const view=state.view,captura=view.captura;
  $('#selo').textContent=view.selo.texto;$('#selo').className='badge '+view.selo.cor;
  $('#fonte-captura').textContent=view.fonte;
  $('#fim-captura').textContent=captura?new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',
    year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(captura.completedAt)):'Sem captura disponível';
  const periodo=captura?.periodo;
  $('#periodo-captura').textContent=periodo?.inicio && periodo?.fim?
    civil(periodo.inicio,{day:'2-digit',month:'2-digit',year:'numeric'})+' a '+civil(periodo.fim,{day:'2-digit',month:'2-digit',year:'numeric'}):'Cobertura não disponível';
  const avisos=[...new Set(view.avisos.map(a=>a.motivo))];
  $('#avisos-captura').replaceChildren(...avisos.map(motivo=>node('p',motivo)));
  $('#avisos-captura').hidden=avisos.length===0;
  renderPlanilha();
}
async function reler() {
  $('#atualizar').disabled=true;
  try {
    const response=await fetch('/api/visao',{cache:'no-store'});
    if (!response.ok) throw new Error('consulta indisponível');
    state.view=await response.json();
    detalhesCaptura();render();$('#erro').hidden=true;
  } catch {
    $('#erro').textContent='Não foi possível ler a captura local. Confira o servidor e tente novamente.';$('#erro').hidden=false;
    if(!state.view) $('#selo').textContent='Consulta indisponível';
  } finally {
    $('#atualizar').disabled=false;
  }
}
async function iniciar() {controles();navegar('planejamento');await reler();}
iniciar();
