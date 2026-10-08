'use strict';
const $=selector=>document.querySelector(selector);
const layout=globalThis.CrmLayout;
const hojeCivil=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const state={view:null,mes:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit'}).format(new Date()),
  formato:'Todos',modo:'Semana',inicioSemana:layout.segundaDaSemana(hojeCivil()),tela:'planejamento',
  abaPlanilha:'Semanas',avisosProducaoId:null};
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
let focoDia=null;
function abrirDia(data,ids,semanaId=null) {
  focoDia=document.activeElement;
  const semana=state.view.semanas.find(s=>s.semana_id===semanaId);
  $('#dia-titulo').textContent=data?civil(data,{weekday:'long',day:'2-digit',month:'long'}):'Sem data · '+(semana?.tema || 'Semana não identificada');
  $('#dia-quantidade').textContent=ids.length+(ids.length===1?' peça registrada':' peças registradas');
  const registros=idsParaPecas(ids),pecas=registros.map((p,i)=>acordeaoPeca(p,i===0));
  const origens=origensDoDia(registros,data,semanaId);
  if(pecas.length) pecas.push(documentosDoDia(registros));
  $('#dia-pecas').replaceChildren(...origens,...(pecas.length?pecas:[node('p','Nenhuma peça registrada neste dia.','empty')]));
  $('#dia').showModal();
  $('#dia').querySelectorAll('.peca-acordeao[open]').forEach(iniciarPrevias);
}
function rotuloPauta(pauta) {return 'Pauta S'+pauta.semana+' de '+civil(pauta.mes+'-01',{month:'long'});}
function origemPauta(week) {return week.pautaOrigem?node('p',rotuloPauta(week.pautaOrigem),'pauta-origin'):null;}
function origensDoDia(registros,data,semanaId) {
  const semanas=new Set(registros.map(p=>p.semanaId)),pautas=new Set(),origens=[];
  if(!registros.length) {
    for(const week of state.view.semanas) {
      const pertence=data?week.periodo.inicio && week.periodo.inicio<=data && data<=week.periodo.fim:
        semanaId!==null && semanaId!==undefined && week.semana_id===semanaId;
      if(pertence)semanas.add(week.semana_id);
    }
  }
  for(const week of state.view.semanas) {
    if(!semanas.has(week.semana_id) || !week.pautaOrigem || pautas.has(week.pautaOrigem.pauta_id))continue;
    pautas.add(week.pautaOrigem.pauta_id);origens.push(origemPauta(week));
  }
  return origens;
}
function valor(value) {return value===null || value===undefined || (typeof value==='string' && value.trim()==='')?'Não informado':String(value);}
const preenchido=value=>value!==null && value!==undefined && String(value).trim()!=='';
function plural(n,um,muitos=um+'s') {return n+' '+(n===1?um:muitos);}
function fatosPeca(p) {
  const dl=node('dl',undefined,'piece-facts');
  const campos=[['Estado',layout.estadoSimples(p)],
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
function imagensDaPeca(p) {return layout.imagensDaPeca(p);}
let focoPrevia=null;
function visualizadorPrevia() {
  if($('#previa-ampliada'))return $('#previa-ampliada');
  const dialog=node('dialog',undefined,'preview-viewer'),header=node('header',undefined,'preview-viewer-top');
  const title=node('h2'),close=node('button','Fechar imagem'),img=node('img');
  dialog.id='previa-ampliada';close.type='button';
  close.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{if(focoPrevia?.isConnected)focoPrevia.focus({preventScroll:true});focoPrevia=null;});
  header.append(title,close);dialog.append(header,img);document.body.append(dialog);return dialog;
}
function ampliarPrevia(button,img,contexto) {
  if(button.disabled||!img.complete||img.naturalWidth===0)return;
  const viewer=visualizadorPrevia(),grande=viewer.querySelector('img');
  focoPrevia=button;viewer.setAttribute('aria-label',contexto);viewer.querySelector('h2').textContent=contexto;
  grande.alt=contexto;grande.src=img.getAttribute('src');viewer.showModal();
}
function previaPosicao({arquivo,contexto}) {
  const article=node('article',undefined,'preview-item'),button=node('button',undefined,'preview-button'),img=node('img');
  const status=node('span','Carregando prévia…','preview-status');
  article.dataset.previaArquivo=arquivo.arquivo_id;article.dataset.previaEstado='nao-solicitada';
  button.type='button';button.disabled=true;button.setAttribute('aria-label','Ampliar imagem — '+contexto);
  button.addEventListener('click',()=>ampliarPrevia(button,img,contexto));
  img.alt=contexto;img.addEventListener('load',()=>{
    article.dataset.previaEstado='disponivel';article.removeAttribute('aria-busy');button.disabled=false;status.hidden=true;
  });
  img.addEventListener('error',()=>{
    article.dataset.previaEstado='indisponivel';article.removeAttribute('aria-busy');button.disabled=true;
    img.hidden=true;status.hidden=false;status.textContent='Prévia indisponível';
  });
  button.append(img,status);article.append(button,node('p',contexto,'preview-context'));
  const versao=Number.isSafeInteger(arquivo.versao)&&arquivo.versao>0?'imagem v'+arquivo.versao:'imagem: versão a confirmar';
  article.append(node('small',versao,'preview-version'));
  const link=linkArquivo(arquivo,'Abrir no Drive/Docs');if(link)article.append(link);
  return article;
}
function galeriaPrevias(p) {
  const posicoes=imagensDaPeca(p);
  if(!posicoes.length)return null;
  const gallery=node('div',undefined,'preview-gallery');gallery.dataset.previas='';gallery.setAttribute('aria-label','Imagens da peça');
  gallery.append(...posicoes.map(previaPosicao));return gallery;
}
function iniciarPrevias(peca) {
  if(!$('#dia').open||!peca.open)return;
  for(const posicao of peca.querySelectorAll('[data-previa-arquivo]')) {
    if(posicao.dataset.previaEstado!=='nao-solicitada')continue;
    posicao.dataset.previaEstado='carregando';
    posicao.setAttribute('aria-busy','true');
    posicao.querySelector('img').src='/api/midia/'+encodeURIComponent(posicao.dataset.previaArquivo);
  }
}
function arquivoRegistro(a) {
  const box=node('article',undefined,'file-record');
  box.append(node('strong',a.nomeApresentacao),node('small','Versão '+valor(a.versao)+' · registro'));
  const link=linkArquivo(a,'Abrir registro no Drive/Docs');
  if(link) box.append(link);
  else box.append(node('p','link não permitido','record-text'));
  return box;
}
function arquivosDaUnidade(records,avisoMidia,mostrarAvisos=true) {
  const list=node('span',undefined,'unit-files'),ids=new Set();let ausente=records.length===0,recusado=false;
  for(const a of records) {
    const link=linkArquivo(a,a?.nomeApresentacao || 'Mídia');
    if(!a) ausente=true;
    else if(!link) recusado=true;
    else if(!ids.has(a.arquivo_id)) {ids.add(a.arquivo_id);list.append(link);}
  }
  const aviso=[avisoMidia || (ausente?'Mídia ausente':null),recusado?'link não permitido':null].filter(preenchido).join('; ');
  if(aviso && mostrarAvisos) list.append(node('span',aviso,'notice'));
  return list;
}
function adicionarVersaoImagem(text,arquivo) {
  if(!arquivo)return;
  const rotulo=Number.isInteger(arquivo.versao) && arquivo.versao>0?'imagem v'+arquivo.versao:'imagem: versão a confirmar';
  text.append(node('small',rotulo,'image-version'));
}
function unidadeDetalhe(u,tipo,mostrarAvisos) {
  const pagina=tipo==='paginas',box=node('article',undefined,'unit-record');
  box.dataset[pagina?'pagina':'cena']=u[pagina?'pagina_id':'cena_id'];
  const text=node('span',undefined,'unit-text');
  box.append(node('span',(pagina?'Página ':'Cena ')+valor(u.indice),'unit-number'));
  if(pagina) {
    text.append(node('span',u.titulo || u.corpo || 'Texto não registrado'),node('small','Design novo: '+u.designNovo));
    adicionarVersaoImagem(text,u.arquivos[0]);
  } else {
    text.append(node('span',u.texto || 'Texto não registrado'));
    if(preenchido(u.inicio_segundos) || preenchido(u.duracao_segundos)) text.append(node('small',
      'Início: '+valor(u.inicio_segundos)+' s · duração: '+valor(u.duracao_segundos)+' s'));
  }
  box.append(text);
  box.append(arquivosDaUnidade(u.arquivos,pagina?undefined:u.avisoMidia,mostrarAvisos));return box;
}
function secaoUnidades(records,tipo,mostrarAvisos=true) {
  const section=secaoDetalhe(tipo==='paginas'?'Páginas':'Cenas');section.dataset.unidades=tipo;
  const groups=new Map();
  for(const u of records) {
    const key=JSON.stringify([u.vigente,u.versao]);
    if(!groups.has(key)) groups.set(key,[]);groups.get(key).push(u);
  }
  const ordenados=[...groups.values()].sort((a,b)=>Number(b[0].vigente)-Number(a[0].vigente));
  for(const group of ordenados) {
    const first=group[0],box=node(first.vigente?'section':'details',undefined,'version-group'+(first.vigente?'':' history'));
    box.dataset.versao=String(first.versao);
    box.append(node(first.vigente?'h4':'summary','Versão '+valor(first.versao)+(first.vigente?' · vigente':' · impacto atual a confirmar')));
    box.append(...group.map(u=>unidadeDetalhe(u,tipo,mostrarAvisos)));section.append(box);
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
  const correcao=[r.estado_tratamento].filter(preenchido);
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
function prontaParaPublicar(p) {
  const section=secaoDetalhe('Pronta para publicar');section.dataset.publicacao='';section.classList.add('publication-ready');
  const pacote=p.detalhes.pacotePublicacao,href=urlAutorizada(pacote?.url);
  const link=href && new URL(href).host==='drive.google.com'?linkArquivo(pacote,'Baixar pacote'):null;
  if(link) {link.classList.add('publication-action');section.append(link);}
  else section.append(node('p','Pacote indisponível','record-text'));
  section.append(node('p',preenchido(p.legenda)?p.legenda:'Legenda não informada','publication-caption'),
    node('p',preenchido(p.hashtags)?p.hashtags:'Hashtags não informadas','publication-hashtags'));
  const texto=[p.legenda,p.hashtags].filter(preenchido).join('\n\n');
  const copy=node('button','Copiar legenda','publication-action'),status=node('p','','copy-status');
  copy.type='button';copy.disabled=!texto;status.setAttribute('role','status');
  copy.addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(texto);status.textContent='Legenda copiada.';}
    catch {status.textContent='Não foi possível copiar. Selecione e copie o texto acima.';}
  });
  section.append(copy,status);
  const gallery=galeriaPrevias(p);if(gallery)section.append(gallery);
  return section;
}
function detalhesUnidades(p) {
  const pronta=p.quadro.coluna==='Pronta',sections=[];
  for(const tipo of ['paginas','cenas']) if(p.detalhes[tipo].length)sections.push(secaoUnidades(p.detalhes[tipo],tipo,!pronta));
  if(!pronta)return sections;
  const fold=recolhido('Páginas e cenas');fold.dataset.detalhesProducao='';fold.append(...sections);
  return sections.length?[fold]:[];
}
function acordeaoPeca(p,aberto) {
  const el=node('details',undefined,'peca-acordeao'),summary=node('summary'),d=p.detalhes;
  el.dataset.peca=p.producao_id;el.open=aberto;
  summary.append(node('span',p.formato,'format-label'),node('strong',p.titulo || 'Título não informado'),node('span',layout.estadoSimples(p),'status'),
    node('small',resumoPeca(d),'piece-hint'));
  const body=node('div',undefined,'piece-body');
  if(p.quadro.coluna==='Pronta')body.append(prontaParaPublicar(p));
  body.append(fatosPeca(p));
  if(p.quadro.coluna!=='Pronta') {const gallery=galeriaPrevias(p);if(gallery)body.append(gallery);}
  if(d.publicacaoRegistrada) body.append(node('p','Publicação: '+valor(p.publicado_em)+' · registro explícito','publication'));
  if(d.revisoes.vigentes.length) body.append(secaoRevisoes(d.revisoes.vigentes,'vigentes'));
  body.append(...detalhesUnidades(p));
  body.append(textosRegistrados(p));
  const historico=recolhido('Histórico');historico.dataset.historico='';
  for(const grupo of ['resolvidas','anteriores','ambiguas']) if(d.revisoes[grupo].length) historico.append(secaoRevisoes(d.revisoes[grupo],grupo));
  if(historico.children.length>1) body.append(historico);
  if(d.avisos.length) body.append(avisosPeca(p));
  el.append(summary,body);el.addEventListener('toggle',()=>iniciarPrevias(el));return el;
}

function dataMais(date,n) {
  const value=new Date(date+'T12:00:00Z');value.setUTCDate(value.getUTCDate()+n);return value.toISOString().slice(0,10);
}
function abrirDiaDaPeca(p) {
  const group=state.view.dias.find(d=>d.data===p.dataCivil && (d.data!==null || d.semanaId===p.semanaId));
  abrirDia(group.data,group.ids,group.semanaId);
}
function pecasDaData(data) {return state.view.producoes.filter(p=>p.dataCivil===data);}
function pecasDaSemana() {
  const fim=dataMais(state.inicioSemana,6);
  return state.view.producoes.filter(p=>p.dataCivil && p.dataCivil>=state.inicioSemana && p.dataCivil<=fim);
}
function estadoClasse(p) {return ['Planejada','Criação','Revisão','Pronta','Publicada'].indexOf(layout.estadoSimples(p));}
let observadorMiniaturas=null;
const rolagemSemanas=new Map();
function memorizarRolagemSemana() {
  const region=$('#lista'),inicio=region.firstElementChild?.dataset.data;
  if(inicio && !region.hidden && state.tela==='planejamento')rolagemSemanas.set(inicio,region.scrollLeft);
}
function posicionarSemana() {
  if(state.tela!=='planejamento'||state.modo!=='Semana')return;
  const region=$('#lista'),today=region.querySelector('.today');
  if(rolagemSemanas.has(state.inicioSemana))region.scrollLeft=rolagemSemanas.get(state.inicioSemana);
  else if(today && region.scrollWidth>region.clientWidth) {
    region.scrollLeft+=today.getBoundingClientRect().left-region.getBoundingClientRect().left-(region.clientWidth-today.clientWidth)/2;
  }
}
function miniatura(p) {
  const box=node('span',undefined,'piece-thumbnail'),posicao=imagensDaPeca(p)[0];
  box.setAttribute('role','img');box.setAttribute('aria-label','Prévia da peça');
  const indisponivel=()=>{const placeholder=node('span','◇','thumbnail-placeholder');placeholder.setAttribute('aria-hidden','true');box.replaceChildren(placeholder);box.setAttribute('aria-label','Prévia indisponível');};
  if(!posicao){indisponivel();return box;}
  const img=node('img');img.alt='';img.width=108;img.height=135;img.dataset.midia=posicao.arquivo.arquivo_id;img.decoding='async';
  img.addEventListener('error',indisponivel,{once:true});
  box.append(img);return box;
}
function carregarMiniaturas() {
  observadorMiniaturas?.disconnect();
  const tela=$('#'+state.tela),imgs=tela.querySelectorAll('img[data-midia]:not([src])');
  observadorMiniaturas=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting) {
      const img=entry.target;img.src='/api/midia/'+encodeURIComponent(img.dataset.midia);observadorMiniaturas.unobserve(img);
    }
  });
  imgs.forEach(img=>observadorMiniaturas.observe(img));
}
function cartao(p) {
  const el=node('button',undefined,'layout-card state-'+estadoClasse(p));el.type='button';el.dataset.producaoId=p.producao_id;
  el.append(miniatura(p),node('small',p.formato,'format-label'),node('strong',p.titulo || 'Título não informado'),
    node('span',layout.estadoSimples(p),'simple-state'));
  el.addEventListener('click',()=>abrirDiaDaPeca(p));return el;
}
function semanaPlanejamento() {
  const days=[];
  for(let n=0;n<7;n++) {
    const date=dataMais(state.inicioSemana,n),today=date===hojeCivil(),day=node('section',undefined,'planning-day'+(today?' today':''));
    day.dataset.data=date;day.setAttribute('role','group');day.setAttribute('aria-label',civil(date,{weekday:'long',day:'numeric',month:'long'})+(today?' · hoje':''));
    const header=node('button',undefined,'planning-day-heading');header.type='button';
    header.setAttribute('aria-label',day.getAttribute('aria-label'));if(today)header.setAttribute('aria-current','date');
    header.append(node('span',civil(date,{weekday:'short'})),node('strong',civil(date,{day:'2-digit'})));
    header.addEventListener('click',()=>abrirDia(date,pecasDaData(date).map(p=>p.producao_id)));
    day.append(header,...pecasDaData(date).filter(aceito).map(cartao));days.push(day);
  }
  $('#lista').replaceChildren(...days);
}
function abrirSemana(inicio,mes=inicio.slice(0,7)) {
  state.inicioSemana=inicio;state.mes=mes;state.modo='Semana';render();
  $('#lista').focus({preventScroll:true});
}
function calendario() {
  const header=node('div',undefined,'weekdays'),grid=node('div',undefined,'month-grid');
  for(const dia of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'])header.append(node('span',dia));
  const first=state.mes+'-01',start=layout.segundaDaSemana(first),next=new Date(first+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);
  const last=dataMais(next.toISOString().slice(0,10),-1),end=dataMais(layout.segundaDaSemana(last),6);
  for(let inicio=start;inicio<=end;inicio=dataMais(inicio,7)) {
    const week=node('button',undefined,'month-week'),labels=[];week.type='button';week.dataset.inicioSemana=inicio;
    week.setAttribute('aria-label','Semana de '+civil(inicio,{day:'numeric',month:'long'}));
    week.addEventListener('click',()=>abrirSemana(inicio,state.mes));
    for(let n=0;n<7;n++) {
      const date=dataMais(inicio,n),day=node('span',undefined,'month-day'+(!date.startsWith(state.mes)?' outside':'')+(date===hojeCivil()?' today':''));
      day.dataset.data=date;day.append(node('span',String(Number(date.slice(-2))),'month-date'));
      const dots=node('span',undefined,'month-dots');
      for(const p of pecasDaData(date).filter(aceito)) {
        const dot=node('span',undefined,'month-dot state-'+estadoClasse(p)),label=(p.titulo || p.formato)+' · '+layout.estadoSimples(p);
        dot.setAttribute('role','img');dot.setAttribute('aria-label',label);dot.title=label;dots.append(dot);
        labels.push(civil(date,{day:'numeric',month:'long'})+' · '+label);
      }
      day.append(dots);week.append(day);
    }
    week.setAttribute('aria-label',week.getAttribute('aria-label')+': '+(labels.join('; ') || 'Sem peças'));
    grid.append(week);
  }
  $('#calendario').replaceChildren(header,grid);
}
function progressoTexto(pecas) {const p=layout.progresso(pecas);return p.prontas+' de '+p.total+' prontas';}
function progressoProjeto(pecas) {
  const p=layout.progresso(pecas),box=node('div',undefined,'project-progress');box.append(node('span',progressoTexto(pecas)));
  if(p.total) {
    const bar=node('progress');bar.max=p.total;bar.value=p.prontas;bar.setAttribute('aria-label',progressoTexto(pecas));box.append(bar);
  }
  return box;
}
function passosProducao(p) {
  const reason=layout.motivoTravado(p);if(reason)return node('span',reason,'blocked-reason');
  const steps=node('ol',undefined,'production-steps'),estado=layout.estadoSimples(p),labels=['Planejada','Criação','Revisão','Pronta','Publicada'];
  const current=labels.indexOf(estado);steps.setAttribute('aria-label','Estado da peça');
  labels.forEach((label,index)=>{
    const li=node('li',label,index<=current?'done':'');if(index===current)li.setAttribute('aria-current','step');steps.append(li);
  });return steps;
}
function linhaProjeto(p) {
  const row=node('button',undefined,'project-row');row.type='button';row.dataset.producaoId=p.producao_id;
  const text=node('span',undefined,'project-piece');text.append(node('strong',p.titulo || 'Título não informado'),
    node('small',p.formato+' · '+(p.dataCivil?civil(p.dataCivil,{day:'2-digit',month:'2-digit'}):'Sem data')));
  row.append(miniatura(p),text,passosProducao(p));row.addEventListener('click',()=>abrirDiaDaPeca(p));return row;
}
function projetoSemana(week) {
  const project=node('section',undefined,'project');project.dataset.semanaId=week.semana_id ?? '';
  const pecas=idsParaPecas(week.ids),future=layout.segundaDaSemana(week.periodo.inicio)>layout.segundaDaSemana(hojeCivil());
  if(!pecas.length && future) {
    const header=node('header',undefined,'project-heading');
    header.append(node('small',civil(week.periodo.inicio,{day:'2-digit',month:'short'})+' – '+civil(week.periodo.fim,{day:'2-digit',month:'short'})));
    project.append(header,node('p','Planejamento na sexta-feira','future-project'));return project;
  }
  const header=node('header',undefined,'project-heading'),title=node('div');
  title.append(node('small',week.periodo.inicio?civil(week.periodo.inicio,{day:'2-digit',month:'short'})+' – '+civil(week.periodo.fim,{day:'2-digit',month:'short'}):(week.semana_id===null?'Sem semana':'Período não identificado')));
  title.append(node('h2',week.tema || 'Tema não informado'));
  if(week.pautaOrigem)title.append(node('p','S'+week.pautaOrigem.semana+' · '+week.pautaOrigem.tema,'project-topic'));
  header.append(title,progressoProjeto(pecas));project.append(header,...pecas.map(linhaProjeto));return project;
}
function renderProducao() {
  const weeks=layout.ordenarSemanas(state.view.semanas,hojeCivil());
  $('#quadro-vazio').hidden=!!state.view.captura && weeks.length>0;
  $('#quadro-vazio').textContent=state.view.captura?'Nenhuma semana registrada':'Nenhuma captura disponível';
  $('#quadro').replaceChildren(...(state.view.captura?weeks.map(projetoSemana):[]));
  $('#quadro-total').textContent='';
}
function row(p) {
  const el=node('button',undefined,'agenda-row');el.type='button';el.dataset.producaoId=p.producao_id;
  el.append(node('strong',p.titulo || 'Título não informado'),node('small',p.formato),node('small',layout.estadoSimples(p)));
  const semana=state.view.semanas.find(w=>w.semana_id===p.semanaId);
  const rotulo=semana?.tema || (semana?.periodo.inicio?'Semana de '+civil(semana.periodo.inicio,{day:'numeric',month:'long'}):'Semana não identificada');
  el.append(node('small',rotulo));
  el.addEventListener('click',()=>abrirDiaDaPeca(p));return el;
}
function listaSemData() {
  const pecas=state.view.producoes.filter(p=>p.dataCivil===null);
  $('#lista-sem-data').replaceChildren(...pecas.map(row));
}
function pautasDoMes() {return (state.view.pautas??[]).filter(p=>p.mes===state.mes).sort((a,b)=>a.semana-b.semana);}
function irParaPauta(pauta) {
  abrirSemana(pauta.inicio_semana,pauta.mes);
}
function listaPautas(pautas) {
  const list=node('ul',undefined,'pautas-list');
  for(const pauta of pautas) {
    const line=node('li'),button=node('button',undefined,'pauta-link');button.type='button';
    button.dataset.inicioSemana=pauta.inicio_semana;
    button.append(node('span','S'+pauta.semana+' · '+valor(pauta.tema)+' · '+valor(pauta.modelo_carrossel)));
    button.addEventListener('click',()=>irParaPauta(pauta));line.append(button);list.append(line);
  }
  return list;
}
function objetivoMensal() {
  const linhas=(state.view.planilha.find(a=>a.nome==='Meses')?.linhas ?? []).filter(r=>r.marca_id==='ntv'&&r.mes===state.mes);
  const registro=linhas.length===1?linhas[0]:null;
  const definido=typeof registro?.objetivo==='string'&&registro.objetivo.trim().length>0;
  const objetivo=linhas.length>1?'A confirmar':
    (definido?registro.objetivo:'Ainda não definido');
  const conteudo=node('div',undefined,'month-content');
  const mes=civil(state.mes+'-01',{month:'long'});
  $('#objetivo-toggle').textContent='🎯 '+mes.charAt(0).toUpperCase()+mes.slice(1)+' — '+objetivo;
  const pautas=typeof registro?.pautas==='string'?registro.pautas.split(/\r?\n/).map(p=>p.trim()).filter(Boolean):[];
  const estruturadas=pautasDoMes();
  if(estruturadas.length)conteudo.append(listaPautas(estruturadas));
  else if(pautas.length) {
    const lista=node('ul');lista.append(...pautas.slice(0,5).map(p=>node('li',p)));conteudo.append(lista);
    if(pautas.length>5) {
      const restantes=pautas.length-5;
      conteudo.append(node('span','+'+restantes+(restantes===1?' pauta':' pautas'),'more-topics'));
    }
  }
  $('#pautas-mes').replaceChildren(conteudo);
}
function cabecalhoPlanejamento() {
  const mensal=state.modo==='Mês',mes=civil(state.mes+'-01',{month:'long',year:'numeric'});
  $('#mes').textContent=mensal?mes.charAt(0).toUpperCase()+mes.slice(1):
    civil(state.inicioSemana,{day:'2-digit',month:'long'})+' – '+civil(dataMais(state.inicioSemana,6),{day:'2-digit',month:'long'});
  const semanas=state.view.semanas.filter(w=>layout.segundaDaSemana(w.periodo.inicio)===state.inicioSemana);
  const pauta=(state.view.pautas??[]).find(p=>p.inicio_semana===state.inicioSemana);
  $('#week-title').textContent=semanas.map(w=>w.pautaOrigem?'S'+w.pautaOrigem.semana+' · '+w.pautaOrigem.tema:w.tema).filter(Boolean).join(' · ') ||
    (pauta?'S'+pauta.semana+' · '+pauta.tema:'');
  $('#week-progress').textContent=progressoTexto(pecasDaSemana().filter(aceito));
  $('#week-title').hidden=mensal;$('#week-progress').hidden=mensal;
  $('#anterior').setAttribute('aria-label',mensal?'Mês anterior':'Semana anterior');
  $('#proximo').setAttribute('aria-label',mensal?'Próximo mês':'Próxima semana');
}
function render() {
  if(!state.view) return;
  memorizarRolagemSemana();
  objetivoMensal();cabecalhoPlanejamento();
  const empty=state.view.captura===null;
  $('#sem-captura').hidden=!empty;
  $('#calendario').hidden=empty || state.modo!=='Mês';
  $('#lista').hidden=empty || state.modo!=='Semana';
  const semData=state.view.producoes.filter(p=>p.dataCivil===null).length;
  $('#abrir-sem-data').textContent=semData+' sem data';
  $('#abrir-sem-data').hidden=semData===0;
  $('#total').textContent=state.view.producoes.length+' peças registradas';
  for (const b of document.querySelectorAll('[data-formato]')) { const active=b.dataset.formato===state.formato;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); }
  for (const b of document.querySelectorAll('[data-modo]')) { const active=b.dataset.modo===state.modo;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active)); }
  if(state.modo==='Mês') {calendario();$('#lista').replaceChildren();}
  else {semanaPlanejamento();$('#calendario').replaceChildren();}
  listaSemData();renderProducao();posicionarSemana();carregarMiniaturas();
}
function navegar(tela,producaoId=null) {
  state.tela=tela;
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
  if(state.view)carregarMiniaturas();
}
function controles() {
  for (const b of document.querySelectorAll('[data-tela]')) b.addEventListener('click',()=>navegar(b.dataset.tela));
  for (const b of document.querySelectorAll('[data-formato]')) b.addEventListener('click',()=>{state.formato=b.dataset.formato;render();});
  for (const b of document.querySelectorAll('[data-modo]')) b.addEventListener('click',()=>{state.modo=b.dataset.modo;render();});
  for (const [id,n] of [['anterior',-1],['proximo',1]]) $('#'+id).addEventListener('click',()=>{
    if(state.modo==='Semana') {
      state.inicioSemana=dataMais(state.inicioSemana,n*7);
      if(state.mes<state.inicioSemana.slice(0,7)||state.mes>dataMais(state.inicioSemana,6).slice(0,7))state.mes=dataMais(state.inicioSemana,3).slice(0,7);
    }
    else {const date=new Date(state.mes+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+n);state.mes=date.toISOString().slice(0,7);state.inicioSemana=layout.segundaDaSemana(state.mes+'-01');}
    render();
  });
  $('#objetivo-toggle').addEventListener('click',()=>{
    const expanded=$('#objetivo-toggle').getAttribute('aria-expanded')==='true';
    $('#objetivo-toggle').setAttribute('aria-expanded',String(!expanded));$('#pautas-mes').hidden=expanded;
  });
  $('#abrir-sem-data').addEventListener('click',()=>{$('#sem-data').hidden=false;$('#sem-data').scrollIntoView({block:'start'});});
  $('#fechar-sem-data').addEventListener('click',()=>{$('#sem-data').hidden=true;$('#abrir-sem-data').focus();});
  $('#fechar-dia').addEventListener('click',()=>$('#dia').close());
  $('#dia').addEventListener('close',()=>{if(focoDia?.isConnected) focoDia.focus();});
  $('#menu').addEventListener('click',()=>{const open=$('#sidebar').classList.toggle('open');$('#menu').setAttribute('aria-expanded',String(open));});
  $('#selo').addEventListener('click',()=>navegar('planilha'));
  $('#atualizar').addEventListener('click',atualizar);
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
    records.map(r=>[horarioLocal(r.concluidaEm),Object.hasOwn(rotulos,r.resultado)?rotulos[r.resultado]:'Resultado desconhecido',motivoHistorico(r.motivoResumo)]),'Histórico');
  [...table.querySelectorAll('tbody tr')].forEach((row,i)=>{row.dataset.resultado=records[i].resultado;});
  return table;
}
function motivoHistorico(motivo) {
  if(!motivo) return '';
  const aba=motivo.match(/^(Semanas|Produções|Páginas|Cenas|Arquivos|Revisoes|Meses|Pautas) (.+): inválido$/);
  if(aba) return 'Aba '+aba[1]+(aba[2]==='complete'?' incompleta':' inválida');
  const rotulos={
    'captura inválida: completedAt excede o relógio local em mais de 10 minutos':'Horário da captura mais de 10 minutos no futuro',
    'captura desatualizada: completedAt igual ou anterior ao da vigente':'Captura desatualizada; a vigente foi preservada',
    'Captura desatualizada; a vigente foi preservada':'Captura desatualizada; a vigente foi preservada',
    'Horário da captura mais de 10 minutos no futuro':'Horário da captura mais de 10 minutos no futuro',
    'arquivo local ausente ou ilegível':'Arquivo local ausente ou ilegível',
    'JSON inválido no arquivo local':'Formato do arquivo local inválido'
  };
  return Object.hasOwn(rotulos,motivo)?rotulos[motivo]:'Captura não pôde ser importada';
}
function motivoAviso(aviso) {
  if(!aviso.motivo.includes('Mídia ausente:')) return aviso.motivo;
  const partes=[...new Set(aviso.motivo.split('; ').filter(m=>!m.startsWith('Mídia ausente:')))];
  if(partes.length) {
    const texto=partes.join(' e ').replace('imagens ausentes e vídeo ausente','imagens e vídeo ausentes');
    return texto.charAt(0).toUpperCase()+texto.slice(1);
  }
  if(aviso.motivo.includes('nenhum arquivo da produção registrado')) return 'Nenhum arquivo da produção registrado';
  return aviso.aba==='Páginas'?'Imagem ausente':'Nenhum arquivo registrado';
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
    avisos.map(a=>[a.aba ?? '—',a.linha ?? '—',a.campo ?? '—',motivoAviso(a)]),'Avisos de dados'));
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
  const notice=$('#avisos-captura'),items=[];
  if(view.ultimaTentativa?.resultado==='falhou') items.push(node('p',captura?
    'Última importação falhou; captura anterior preservada':'Última importação falhou; nenhuma captura válida disponível'));
  if(view.avisos.length) {
    const link=node('a',plural(view.avisos.length,'aviso de dados','avisos de dados'));link.href='#avisos-dados';
    link.addEventListener('click',event=>{
      event.preventDefault();state.avisosProducaoId=null;state.abaPlanilha='Produções';renderPlanilha();
      $('#avisos-dados').focus();$('#avisos-dados').scrollIntoView({block:'start'});
    });items.push(link);
  }
  notice.replaceChildren(...items);notice.hidden=items.length===0;
  renderPlanilha();
}
async function reler({manterDesabilitado=false}={}) {
  $('#atualizar').disabled=true;
  try {
    const response=await fetch('/api/visao',{cache:'no-store'});
    if (!response.ok) throw new Error('consulta indisponível');
    state.view=await response.json();
    detalhesCaptura();render();$('#erro').hidden=true;
    return true;
  } catch {
    $('#erro').textContent='Não foi possível ler a captura local. Confira o servidor e tente novamente.';$('#erro').hidden=false;
    if(!state.view) $('#selo').textContent='Consulta indisponível';
    return false;
  } finally {
    if(!manterDesabilitado) $('#atualizar').disabled=false;
  }
}
async function atualizar() {
  const status=$('#resultado-atualizacao');$('#atualizar').disabled=true;status.textContent='Atualizando dados…';
  try {
    const response=await fetch('/api/atualizar',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
    const result=await response.json();
    const consultada=await reler({manterDesabilitado:true});
    const parts=[consultada?result.mensagem:result.resultado==='falhou'?result.mensagem+' · consulta local indisponível':'Atualização concluída; consulta local indisponível'];
    if(result.avisos?.length)parts.push('falha ao liberar a trava; confira o estado local');
    status.textContent=parts.join(' · ');
  }catch{status.textContent='Não foi possível atualizar os dados; confira o servidor e tente novamente';}
  finally{$('#atualizar').disabled=false;}
}
async function iniciar() {controles();navegar('planejamento');await reler();}
iniciar();
