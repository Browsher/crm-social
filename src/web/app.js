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
function abrirDia(data,ids) {
  $('#dia-titulo').textContent=data?civil(data,{weekday:'long',day:'2-digit',month:'long'}):'Sem data';
  $('#dia-quantidade').textContent=ids.length+(ids.length===1?' peça registrada':' peças registradas');
  $('#dia-pecas').replaceChildren(...idsParaPecas(ids).map(p=>cartao(p,false)));
  $('#dia').showModal();
}
function cartao(p,interactive=true) {
  const el=node(interactive?'button':'article',undefined,'post '+p.formato.toLowerCase());
  if (interactive) {
    el.type='button'; el.dataset.producaoId=p.producao_id;
    el.addEventListener('click',()=>{
      const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
      abrirDia(group.data,group.ids);
    });
  }
  el.append(node('small',p.formato),node('strong',p.titulo || 'Título não informado'),node('span',p.status || 'Estado não informado','status'));
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
  for (let i=0;i<42;i++) {
    const date=dataMais(start,i), outside=!date.startsWith(state.mes), cell=node('div',undefined,'day'+(outside?' outside':''));
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
    node('strong',p.titulo || 'Título não informado'),node('small',p.formato,'row-format'),node('small',p.status || 'Estado não informado','row-status'));
  el.addEventListener('click',()=>{
    const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
    abrirDia(group.data,group.ids);
  });
  return el;
}
function semanaVisivel(week) {
  if (!week.periodo.inicio) return true;
  return week.periodo.inicio.slice(0,7)<=state.mes && week.periodo.fim.slice(0,7)>=state.mes;
}
function lista(semData=false) {
  const groups=[];
  for (const week of state.view.semanas) {
    if (!semData && !semanaVisivel(week)) continue;
    const pecas=idsParaPecas(week.ids).filter(p=>semData?p.dataCivil===null:aceito(p));
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
  $('#mes').textContent=civil(state.mes+'-01',{month:'long',year:'numeric'});
  const empty=state.view.captura===null;
  $('#sem-captura').hidden=!empty;
  $('#calendario').hidden=empty || state.modo!=='Calendário';
  $('#lista').hidden=empty || state.modo!=='Lista';
  $('#abrir-sem-data').textContent=state.view.producoes.filter(p=>p.dataCivil===null).length+' sem data';
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
  $('#menu').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
  $('#selo').addEventListener('click',()=>navegar('planilha'));
}
async function iniciar() {
  const buttons=[...document.querySelectorAll('button')];
  buttons.forEach(b=>b.disabled=true);
  try {
    const response=await fetch('/api/visao',{cache:'no-store'});
    if (!response.ok) throw new Error('consulta indisponível');
    state.view=await response.json();
    $('#selo').textContent=state.view.selo.texto;$('#selo').className='badge '+state.view.selo.cor;
    controles();render();navegar('planejamento');
    buttons.forEach(b=>b.disabled=false);
  } catch {
    $('#erro').textContent='Não foi possível ler a captura local. Confira o servidor e tente novamente.';$('#erro').hidden=false;
    $('#selo').textContent='Consulta indisponível';
  }
}
iniciar();
