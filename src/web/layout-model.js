(function() {
  'use strict';
  const estados={Planejamento:'Planejada',Redação:'Criação',Visual:'Criação',Mídia:'Criação',Outras:'Criação',
    Revisão:'Revisão',Pronta:'Pronta',Publicada:'Publicada'};
  function estadoSimples(p) {return Object.hasOwn(estados,p.quadro.coluna)?estados[p.quadro.coluna]:'Criação';}
  function motivoTravado(p) {
    const {coluna,pendencias}=p.quadro;
    if(coluna==='Pronta'||coluna==='Publicada')return '';
    if(pendencias.some(pendencia=>pendencia.tipo==='revisao'))return 'Travado: precisa de correção';
    if(coluna==='Mídia'&&pendencias.some(pendencia=>pendencia.tipo==='midia'))return 'Travado: falta gerar mídia';
    return '';
  }
  function progresso(pecas) {
    const prontas=pecas.filter(p=>['Pronta','Publicada'].includes(estadoSimples(p))).length,total=pecas.length;
    return {prontas,total,percentual:total?prontas*100/total:null};
  }
  function ordemId(a,b) {return a<b?-1:a>b?1:0;}
  // Seleção da galeria da 005: os ponteiros e a vigência já vêm resolvidos na API.
  function imagensDasUnidades(p,tipo) {
    const pagina=tipo==='paginas',key=pagina?'pagina_id':'cena_id';
    const unidades=p.detalhes[tipo].filter(u=>u.vigente).sort((a,b)=>a.indice-b.indice||ordemId(a[key],b[key]));
    return unidades.flatMap(u=>u.arquivos.slice(0,pagina?1:2).map((arquivo,index)=>({arquivo,
      contexto:pagina?'Página '+u.indice:'Cena '+u.indice+' · '+(index===0?'início':'final')}))).filter(posicao=>posicao.arquivo);
  }
  function imagensDaPeca(p) {
    const d=p.detalhes;
    if(d.paginas.length||d.cenas.length)return [...imagensDasUnidades(p,'paginas'),...imagensDasUnidades(p,'cenas')];
    if(p.formato!=='Imagem'||!Number.isSafeInteger(p.versao)||p.versao<=0)return [];
    return d.arquivos.filter(a=>a.tipo==='imagem'&&a.versao===p.versao&&a.producao_id===p.producao_id)
      .sort((a,b)=>ordemId(a.arquivo_id,b.arquivo_id)).map((arquivo,index)=>({arquivo,contexto:'Imagem '+(index+1)}));
  }
  function posicoesDasUnidades(p,tipo) {
    const pagina=tipo==='paginas',key=pagina?'pagina_id':'cena_id';
    const unidades=p.detalhes[tipo].filter(u=>u.vigente).sort((a,b)=>a.indice-b.indice||ordemId(a[key],b[key]));
    return unidades.flatMap(u=>Array.from({length:pagina?1:2},(_,index)=>({arquivo:u.arquivos[index]??null,
      contexto:pagina?'Página '+u.indice:'Cena '+u.indice+' · '+(index===0?'início':'final')})));
  }
  function posicoesInstagram(p) {
    if(p.formato==='Imagem')return [{arquivo:imagensDaPeca(p)[0]?.arquivo??null,contexto:'Imagem 1'}];
    const posicoes=[...posicoesDasUnidades(p,'paginas'),...posicoesDasUnidades(p,'cenas')];
    return posicoes.length?posicoes:[{arquivo:null,contexto:'Prévia indisponível'}];
  }
  const preenchido=value=>value!==null&&value!==undefined&&!(typeof value==='string'&&value.trim()==='');
  function filaPublicar(pecas) {
    return pecas.filter(p=>p.estado_liberacao==='liberado'&&!preenchido(p.publicado_em))
      .map(peca=>({peca,data:segundaDaSemana(peca.dataCivil)?peca.dataCivil:null}))
      .sort((a,b)=>Number(a.data===null)-Number(b.data===null)||ordemId(a.data,b.data)||ordemId(a.peca.producao_id,b.peca.producao_id))
      .map(item=>item.peca);
  }
  function instantePublicacao(value) {
    const iso=typeof value==='string'&&/^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value);
    if(!iso||!segundaDaSemana(value.slice(0,10)))return null;
    const instante=Date.parse(value);
    return Number.isFinite(instante)?instante:null;
  }
  function publicadasRecentes(pecas) {
    return pecas.filter(p=>preenchido(p.publicado_em)).map(peca=>({peca,instante:instantePublicacao(peca.publicado_em)}))
      .sort((a,b)=>Number(a.instante===null)-Number(b.instante===null)||ordemId(b.instante,a.instante)||ordemId(a.peca.producao_id,b.peca.producao_id))
      .slice(0,10).map(item=>item.peca);
  }
  function segundaDaSemana(isoCivil) {
    if(typeof isoCivil!=='string'||!/^\d{4}-\d\d-\d\d$/.test(isoCivil))return null;
    const date=new Date(isoCivil+'T00:00:00Z');
    if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==isoCivil)return null;
    date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
    return date.toISOString().slice(0,10);
  }
  function ordenarSemanas(semanas,hojeCivil) {
    const atual=segundaDaSemana(hojeCivil);
    if(!atual)return semanas.slice();
    return semanas.map(semana=>({semana,inicio:segundaDaSemana(semana.periodo.inicio)}))
      .sort((a,b)=>{
        const grupo=item=>item.inicio===null?2:item.inicio<atual?1:0;
        const diferenca=grupo(a)-grupo(b);
        if(diferenca)return diferenca;
        return grupo(a)===1?ordemId(b.inicio,a.inicio):ordemId(a.inicio,b.inicio);
      }).map(item=>item.semana);
  }
  const api={estadoSimples,motivoTravado,progresso,imagensDaPeca,segundaDaSemana,ordenarSemanas,
    filaPublicar,publicadasRecentes,posicoesInstagram,instantePublicacao};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else globalThis.CrmLayout=api;
})();
