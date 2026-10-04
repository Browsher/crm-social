'use strict';
const $=selector=>document.querySelector(selector);
const state={view:null,mes:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).format(new Date()),
  formato:'Todos',modo:matchMedia('(max-width:720px)').matches?'Lista':'Calendário'};
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
  const pecas=idsParaPecas(ids).map((p,i)=>acordeaoPeca(p,i===0));
  $('#dia-pecas').replaceChildren(...(pecas.length?pecas:[node('p','Nenhuma peça registrada neste dia.','empty')]));
  $('#dia').showModal();
}
function valor(value) {return value===null || value===undefined || (typeof value==='string' && value.trim()==='')?'Não informado':String(value);}
function meta(campos) {
  const dl=node('dl',undefined,'detail-meta');
  for(const [nome,value] of campos) {
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
function arquivoRegistro(a) {
  const box=node('article',undefined,'file-record');
  box.append(node('strong',a.nomeApresentacao),node('small','Versão '+valor(a.versao)+' · registro'));
  const href=urlAutorizada(a.url);
  if(href) {
    const link=node('a','Abrir registro no Drive/Docs');link.href=href;link.target='_blank';link.rel='noopener noreferrer';box.append(link);
  } else if(a.url) box.append(node('p',String(a.url),'record-text'));
  return box;
}
function arquivosDaUnidade(records) {
  const list=node('div',undefined,'unit-files'),ids=new Set();
  for(const a of records) {
    if(!a) list.append(node('p','Mídia ausente ou referência a confirmar.','notice'));
    else if(!ids.has(a.arquivo_id)) {ids.add(a.arquivo_id);list.append(arquivoRegistro(a));}
  }
  return list;
}
function unidadeDetalhe(u,tipo) {
  const pagina=tipo==='paginas',box=node('article',undefined,'unit-record');
  box.dataset[pagina?'pagina':'cena']=u[pagina?'pagina_id':'cena_id'];
  box.append(node('h4',(pagina?'Página ':'Cena ')+valor(u.indice)),node('small','Versão '+valor(u.versao)));
  if(pagina) {
    box.append(node('p',valor(u.titulo)),node('p',valor(u.corpo)),node('p','Design novo: '+u.designNovo,'record-text'));
    if(u.funcao) box.append(node('p','Função: '+valor(u.funcao),'record-text'));
  } else box.append(node('p',valor(u.texto)),node('p','Texto na tela: '+valor(u.texto_tela)),
    meta([['Início (segundos)',u.inicio_segundos],['Duração (segundos)',u.duracao_segundos]]));
  box.append(arquivosDaUnidade(u.arquivos));return box;
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
  if(!records.length) section.append(node('p','Nenhum registro.','record-text'));
  for(const r of records) {
    const review=node('article',undefined,'review-record');
    review.append(node('small',r.revisao_id),meta([['Decisão',r.decisao],['Motivo',r.motivo],['Versão avaliada',r.versao],
      ['Quem corrige',r.responsavel_correcao],['Tratamento',r.estado_tratamento]]));
    if(grupo==='anteriores' || grupo==='ambiguas') review.append(node('p','Impacto atual a confirmar.','record-text'));
    section.append(review);
  }
  return section;
}
function documentosDetalhe(records) {
  const section=secaoDetalhe('Documentos da semana');
  for(const r of records) {
    section.append(node('h4',r.papel));
    section.append(r.arquivo?arquivoRegistro(r.arquivo):node('p','Documento não registrado ou referência a confirmar.','record-text'));
  }
  return section;
}
function acordeaoPeca(p,aberto) {
  const el=node('details',undefined,'peca-acordeao'),summary=node('summary'),d=p.detalhes;
  el.dataset.peca=p.producao_id;el.open=aberto;
  summary.append(node('span',p.formato,'format-label'),node('strong',p.titulo || 'Título não informado'),node('span',statusLegivel(p.status),'status'));
  const body=node('div',undefined,'piece-body');
  body.append(meta([['Etapa registrada',p.etapa_producao],['Com quem está',d.responsavelRegistrado],['Data prevista',p.dataCivil?civil(p.dataCivil,{day:'2-digit',month:'2-digit',year:'numeric'}):'Sem data'],
    ['Versão registrada',p.versao],['Publicação',d.publicacaoRegistrada?valor(p.publicado_em)+' · registro explícito':'Não comprovada']]));
  const textos=secaoDetalhe('Textos registrados');textos.append(node('p',valor(p.legenda)));body.append(textos);
  body.append(secaoRevisoes(d.revisoes.vigentes,'vigentes'));
  for(const tipo of ['paginas','cenas']) if(d[tipo].length) body.append(secaoUnidades(d[tipo],tipo));
  const files=secaoDetalhe('Arquivos · registros');files.append(...d.arquivos.map(arquivoRegistro));
  if(!d.arquivos.length) files.append(node('p','Mídia ausente: nenhum arquivo da produção registrado.','notice'));
  body.append(files);
  for(const grupo of ['resolvidas','anteriores','ambiguas']) if(d.revisoes[grupo].length) body.append(secaoRevisoes(d.revisoes[grupo],grupo));
  if(d.documentosSemana.length) body.append(documentosDetalhe(d.documentosSemana));
  if(d.avisos.length) {
    const section=secaoDetalhe('Avisos registrados');section.classList.add('notice');
    for(const a of d.avisos) section.append(node('p',a.motivo));body.append(section);
  }
  el.append(summary,body);return el;
}
function cartao(p,interactive=true) {
  const el=node(interactive?'button':'article',undefined,'post '+p.formato.toLowerCase());
  if (interactive) {
    el.type='button'; el.dataset.producaoId=p.producao_id;
    el.addEventListener('click',()=>{
      const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
      abrirDia(group.data,group.ids,group.semanaId);
    });
  }
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
  el.addEventListener('click',()=>{
    const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
    abrirDia(group.data,group.ids,group.semanaId);
  });
  return el;
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
  calendario();lista();lista(true);
}
function navegar(tela) {
  for (const id of ['planejamento','producao','planilha']) $('#'+id).hidden=id!==tela;
  for (const b of document.querySelectorAll('[data-tela]')) b.classList.toggle('active',b.dataset.tela===tela);
  const nome={planejamento:'Planejamento',producao:'Produção',planilha:'Planilha'}[tela];
  $('#titulo').textContent=nome;$('#caminho').textContent=nome;
  $('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');
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
