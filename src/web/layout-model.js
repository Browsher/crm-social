(function() {
  'use strict';
  const estados={Planejamento:'Planejada',Redação:'Criação',Visual:'Criação',Mídia:'Criação',Outras:'Criação',
    Revisão:'Revisão',Pronta:'Pronta',Publicada:'Publicada'};
  function estadoSimples(p) {return estados[p.quadro.coluna]||'Criação';}
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
  const api={estadoSimples,motivoTravado,progresso,imagensDaPeca,segundaDaSemana,ordenarSemanas};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else globalThis.CrmLayout=api;
})();
