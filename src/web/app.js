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
  const registros=idsParaPecas(ids),pecas=registros.map((p,i)=>acordeaoPeca(p,i===0));
  if(pecas.length) pecas.push(documentosDoDia(registros));
  $('#dia-pecas').replaceChildren(...(pecas.length?pecas:[node('p','Nenhuma peça registrada neste dia.','empty')]));
  $('#dia').showModal();
}
function valor(value) {return value===null || value===undefined || (typeof value==='string' && value.trim()==='')?'Não informado':String(value);}
const preenchido=value=>value!==null && value!==undefined && String(value).trim()!=='';
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
  else if(a.url) box.append(node('p','Link indisponível.','record-text'));
  return box;
}
function arquivosDaUnidade(records) {
  const list=node('span',undefined,'unit-files'),ids=new Set();let ausente=records.length===0;
  for(const a of records) {
    const link=linkArquivo(a,a?.nomeApresentacao || 'Mídia');
    if(!link) ausente=true;
    else if(!ids.has(a.arquivo_id)) {ids.add(a.arquivo_id);list.append(link);}
  }
  if(ausente) list.append(node('span','Mídia ausente','notice'));
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
  if(grupo==='vigentes') {
    if(records[0]) section.append(revisaoLinha(records[0],grupo));
    if(records.length>1) {
      const more=recolhido('+'+(records.length-1));more.append(...records.slice(1).map(r=>revisaoLinha(r,grupo)));section.append(more);
    }
  } else section.append(...records.map(r=>revisaoLinha(r,grupo)));
  return section;
}
function revisaoLinha(r,grupo) {
  const review=node('article',undefined,'review-record');
  const partes=[['Decisão',r.decisao],['Versão',r.versao],['Motivo',r.motivo],['Quem corrige',r.responsavel_correcao],
    ['Tratamento',r.estado_tratamento],['Página',r.pagina_id],['Cena',r.cena_id],['Arquivo',r.arquivo_id]];
  review.append(node('span',partes.filter(([,v])=>preenchido(v)).map(([nome,v])=>nome+': '+v).join(' · ')),node('small',r.revisao_id));
  if(grupo==='anteriores' || grupo==='ambiguas') review.append(node('small','Impacto atual a confirmar.'));
  return review;
}
function recolhido(titulo) {
  const el=node('details',undefined,'fold');el.append(node('summary',titulo));return el;
}
function textosRegistrados(p) {
  const el=recolhido('Texto registrado');el.dataset.textos='';
  if(preenchido(p.legenda)) el.append(node('p',p.legenda));
  for(const u of [...p.detalhes.paginas,...p.detalhes.cenas]) {
    const partes=[['Corpo',u.corpo],['Função',u.funcao],['Texto na tela',u.texto_tela]].filter(([,v])=>preenchido(v));
    if(partes.length) el.append(node('p',(u.pagina_id || u.cena_id)+' · versão '+valor(u.versao)+' · '+partes.map(([nome,v])=>nome+': '+v).join(' · ')));
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
    .map(([tipo,n])=>n+' '+(tipo==='paginas'?'páginas':'cenas'));
  return [...unidades,d.revisoes.vigentes.length?'revisão aberta':'sem revisão',d.avisos.length+' avisos'].join(' · ');
}
function avisosPeca(avisos) {
  const box=node('div',undefined,'data-notice');
  box.append(node('span',avisos.length+' avisos de dados nesta peça · '));
  const link=node('a','ver na Planilha');link.href='#planilha';
  link.addEventListener('click',e=>{e.preventDefault();focoDia=$('#selo');$('#dia').close();navegar('planilha');});
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
  if(d.avisos.length) body.append(avisosPeca(d.avisos));
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
