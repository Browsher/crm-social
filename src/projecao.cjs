const {CAMPOS,camposCapturados,CAMPOS_PAUTAS}=require('./captura.cjs');
const {projetarPautas}=require('./pautas.cjs');
const {COLUNAS}=require('./quadro-config.cjs');
const {chaves,redigirTexto,selecionarNtv}=require('./triagem.cjs');
function reciboPublico(receipt) {
  if (!receipt) return null;
  return Object.fromEntries(['tentativaId','concluidaEm','resultado','motivoResumo'].map(campo=>[
    campo,typeof receipt[campo]==='string'?redigirTexto(receipt[campo]):receipt[campo]
  ]));
}
function base(estadoLocal) {
  const historico=estadoLocal.historico.map(reciboPublico).reverse();
  return {schemaVersion:1,estado:'sem_captura',selo:{texto:'Sem dados',cor:'cinza',destino:'planilha'},fonte:estadoLocal.captura?.envelope.source==='google-sheets-api'?'Leitura direta pelo servidor local':'Captura pela Central',
    captura:null,ultimaTentativa:reciboPublico(estadoLocal.ultimaTentativa),semanas:[],producoes:[],dias:[],
    quadro:{colunas:COLUNAS.map(nome=>({nome})),semanas:[]},planilha:[],historico,avisos:[]};
}
function dataCivil(value) {
  if (typeof value!=='string' || !/^\d{4}-\d\d-\d\d$/.test(value)) return null;
  const ms=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0,10)===value ? value : null;
}
function fimSemana(inicio) {
  if (!inicio) return null;
  const day=new Date(inicio+'T00:00:00Z');
  day.setUTCDate(day.getUTCDate()+6);
  return day.toISOString().slice(0,10);
}
function ordinal(a,b) { return a<b?-1:a>b?1:0; }
function planejar(result,origens) {
  const idsSemanas=new Set(result.semanas.map(s=>s.semana_id));
  const formatos={imagem_a:'Imagem',imagem_b:'Imagem',carrossel:'Carrossel',reels:'Reels'};
  result.producoes=result.producoes.map(p=>{
    const data=dataCivil(p.data_prevista), semanaId=idsSemanas.has(p.semana_id)?p.semana_id:null;
    if (!data) result.avisos.push({...origens.get(p),campo:'data_prevista',motivo:'Sem data civil válida'});
    if (semanaId===null) result.avisos.push({...origens.get(p),campo:'semana_id',motivo:'Semana não identificada'});
    const next={...p,dataCivil:data,semanaId,formato:Object.hasOwn(formatos,p.slot)?formatos[p.slot]:'Outro'};
    origens.set(next,origens.get(p));return next;
  });
  result.semanas=result.semanas.map(s=>{
    const inicio=dataCivil(s.inicio_semana), fim=fimSemana(inicio);
    if (!inicio) result.avisos.push({...origens.get(s),campo:'inicio_semana',motivo:'Cobertura semanal não identificada'});
    const next={...s,periodo:{inicio,fim},objetivoMensal:'Ainda não definido',ids:result.producoes.filter(p=>p.semanaId===s.semana_id).map(p=>p.producao_id).sort(ordinal)};
    origens.set(next,origens.get(s));return next;
  });
  const orphanIds=result.producoes.filter(p=>p.semanaId===null).map(p=>p.producao_id).sort(ordinal);
  if (orphanIds.length) result.semanas.push({semana_id:null,tema:'Semana não identificada',periodo:{inicio:null,fim:null},objetivoMensal:'Ainda não definido',ids:orphanIds});
  const weeks=result.semanas.filter(s=>s.periodo.inicio!==null);
  result.captura.periodo={inicio:weeks.map(s=>s.periodo.inicio).sort().at(0) ?? null,fim:weeks.map(s=>s.periodo.fim).sort().at(-1) ?? null};
  result.dias=agruparDias(result.producoes);
}
function agruparDias(producoes) {
  const groups=new Map();
  for (const p of producoes) {
    const key=p.dataCivil ?? ('sem-data:'+p.semanaId);
    if (!groups.has(key)) groups.set(key,{data:p.dataCivil,semanaId:p.dataCivil?null:p.semanaId,ids:[]});
    groups.get(key).ids.push(p.producao_id);
  }
  return [...groups.values()].map(group=>({...group,ids:group.ids.sort(ordinal)})).sort((a,b)=>ordinal(a.data ?? 'z',b.data ?? 'z'));
}
function aplicarFrescor(result,estadoLocal,nowIso) {
  if(estadoLocal.ultimaTentativa?.resultado==='falhou') {
    result.estado='falha_atualizacao';
    result.selo={texto:'Atualização falhou',cor:'vermelho',destino:'planilha'};
    result.avisos.push({motivo:'Última importação falhou; captura anterior preservada'});
    return;
  }
  const completed=new Date(result.captura.completedAt),timeZone='America/Sao_Paulo';
  const day=new Intl.DateTimeFormat('sv-SE',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'});
  if(day.format(completed)===day.format(new Date(nowIso))) {
    const hour=new Intl.DateTimeFormat('pt-BR',{timeZone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(completed);
    result.estado='atualizada_hoje';
    result.selo={texto:'Atualizado hoje, '+hour,cor:'verde',destino:'planilha'};
  } else {
    const date=new Intl.DateTimeFormat('pt-BR',{timeZone,day:'2-digit',month:'2-digit'}).format(completed);
    result.estado='anterior_hoje';
    result.selo={texto:'Dados de '+date,cor:'âmbar',destino:'planilha'};
  }
}
const preenchido=v=>v!==null && v!==undefined && !(typeof v==='string' && v.trim()==='');
const inteiroPositivo=v=>Number.isInteger(v) && v>0;
function avisoRegistro(record,campo,motivo,ctx) {
  const aviso={...ctx.origens.get(record),campo,motivo};
  ctx.avisos.push(aviso);ctx.locais.push(aviso);
}
function validarNumeros(record,inteiros,tempos,ctx) {
  for(const campo of inteiros) {
    if(preenchido(record[campo]) && !inteiroPositivo(record[campo])) avisoRegistro(record,campo,'Inteiro positivo inválido; valor original preservado',ctx);
  }
  for(const campo of tempos) {
    const v=record[campo];
    if(preenchido(v) && !(typeof v==='number' && Number.isFinite(v) && v>=0)) avisoRegistro(record,campo,'Tempo inválido; valor original preservado',ctx);
  }
}
function arquivoApresentado(a) {
  const nome=[a.tipo,a.papel].filter(preenchido).join(' · ');
  return {...a,nomeApresentacao:nome || 'Arquivo registrado'};
}
function escopoArquivo(a,esperado) {
  return Object.entries(esperado).every(([campo,v])=>{
    if((campo==='pagina_id' || campo==='cena_id') && !preenchido(a[campo])) return true;
    return a[campo]===v;
  });
}
function arquivoLigado(record,campo,esperado,ctx) {
  const id=record[campo];
  if(!preenchido(id)) {avisoRegistro(record,campo,'Mídia ausente: nenhum arquivo registrado neste ponteiro',ctx);return null;}
  const a=ctx.arquivos.get(id);
  if(!a) {avisoRegistro(record,campo,'Referência quebrada: arquivo não identificado',ctx);return null;}
  if(!escopoArquivo(a,esperado)) {avisoRegistro(record,campo,'Escopo incompatível; vínculo a confirmar',ctx);return null;}
  return arquivoApresentado(a);
}
function ordenarUnidades(a,b,key) {
  const ordem=v=>inteiroPositivo(v)?v:Infinity;
  return ordem(a.versao)-ordem(b.versao) || ordem(a.indice)-ordem(b.indice) || ordinal(a[key],b[key]);
}
function faltasMidiaCena(arquivos) {
  const faltas=[];
  if(!arquivos[0] && !arquivos[1]) faltas.push('imagens ausentes');
  else if(!arquivos[0]) faltas.push('imagem inicial ausente');
  else if(!arquivos[1]) faltas.push('imagem final ausente');
  if(!arquivos[2]) faltas.push('vídeo ausente');
  return faltas.length?faltas.join('; '):null;
}
function midiasCena(record,esperado,ctx) {
  const pointers=['arquivo_imagem_inicio_id','arquivo_imagem_final_id','arquivo_video_id'];
  const mediaCtx={...ctx,avisos:[],locais:[]};
  const arquivos=pointers.map(campo=>arquivoLigado(record,campo,esperado,mediaCtx));
  const avisoMidia=faltasMidiaCena(arquivos);
  if(avisoMidia) {
    const motivos=[...new Set(mediaCtx.locais.map(a=>a.motivo))].join('; ');
    avisoRegistro(record,mediaCtx.locais[0].campo,avisoMidia+'; '+motivos,ctx);
  }
  return {arquivos,avisoMidia};
}
function versoesUnidades(records) {
  const maiores=new Map();
  for(const r of records) {
    if(inteiroPositivo(r.indice) && inteiroPositivo(r.versao)) maiores.set(r.indice,Math.max(maiores.get(r.indice) ?? 0,r.versao));
  }
  return maiores;
}
function unidades(producao,records,tipo,ctx) {
  const pagina=tipo==='paginas',key=pagina?'pagina_id':'cena_id';
  const ligadas=records.filter(r=>r.producao_id===producao.producao_id),maiores=versoesUnidades(ligadas);
  return ligadas.map(r=>{
    validarNumeros(r,['versao','indice'],pagina?[]:['inicio_segundos','duracao_segundos'],ctx);
    const esperado={producao_id:producao.producao_id,[key]:r[key]};
    return {...r,vigente:inteiroPositivo(r.indice) && inteiroPositivo(r.versao) && r.versao===maiores.get(r.indice),
      ...(pagina?{designNovo:'A confirmar',arquivos:[arquivoLigado(r,'arquivo_imagem_id',esperado,ctx)]}:midiasCena(r,esperado,ctx))};
  }).sort((a,b)=>ordenarUnidades(a,b,key));
}
function vinculoRevisao(r,p,ctx) {
  const tipos=[['pagina_id',ctx.paginas],['cena_id',ctx.cenas],['arquivo_id',ctx.arquivos]];
  for(const [campo,mapa] of tipos) {
    if(!preenchido(r[campo])) continue;
    const target=mapa.get(r[campo]);
    if(!(target?.producao_id===p.producao_id && inteiroPositivo(target.versao) && target.versao===r.versao)) return campo;
  }
  return null;
}
function revisoes(producao,records,ctx) {
  const groups={vigentes:[],resolvidas:[],anteriores:[],ambiguas:[]};
  for(const r of records.filter(r=>r.producao_id===producao.producao_id).sort((a,b)=>ordinal(a.revisao_id,b.revisao_id))) {
    validarNumeros(r,['versao'],[],ctx);
    const campo=!inteiroPositivo(r.versao) || !inteiroPositivo(producao.versao)?'versao':vinculoRevisao(r,producao,ctx);
    let grupo;
    if(['resolvido','resolvida'].includes(r.estado_tratamento)) grupo='resolvidas';
    else if(campo) {
      grupo='ambiguas';avisoRegistro(r,campo,'Revisão sem vínculo inequívoco; impacto atual a confirmar',ctx);
    } else if(r.versao!==producao.versao) grupo='anteriores';
    else {
      grupo='vigentes';
      if(r.estado_tratamento!=='aberta') avisoRegistro(r,'estado_tratamento','Estado de revisão desconhecido; resolução não comprovada',ctx);
    }
    groups[grupo].push({...r});
  }
  return groups;
}
function arquivosRegistrados(producao,records,ctx) {
  const files=records.filter(a=>a.producao_id===producao.producao_id),groups=new Map();
  for(const a of files) {
    validarNumeros(a,['versao'],[],ctx);
    if(preenchido(a.origens_json) && !ctx.validadeJson.get(a)) avisoRegistro(a,'origens_json','JSON de origens inválido; registro preservado',ctx);
    const key=JSON.stringify([a.papel,a.versao,a.pagina_id,a.cena_id]);
    if(preenchido(a.papel)) groups.set(key,[...(groups.get(key) ?? []),a]);
  }
  for(const group of groups.values()) {
    if(group.length>1) avisoRegistro(group[0],'origens_json','Arquivos empatados; origens e vínculo a confirmar, sem escolha automática',ctx);
  }
  return files.map(arquivoApresentado).sort((a,b)=>ordinal(a.arquivo_id,b.arquivo_id));
}
function pacotePublicacao(p,arquivos) {
  if(!Number.isSafeInteger(p.pacote_versao) || p.pacote_versao<=0)return null;
  const pacotes=arquivos.filter(a=>a.producao_id===p.producao_id && a.tipo==='pacote' && a.extensao==='zip' && a.versao===p.pacote_versao);
  return pacotes.length===1?pacotes[0]:null;
}
function documentosSemana(p,ntv,ctx) {
  const cache=ctx.documentos.get(p.semanaId);
  if(cache) {ctx.locais.push(...cache.avisos);return cache.records;}
  const s=ntv.semanas.find(s=>s.semana_id===p.semanaId);
  const inicio=ctx.locais.length;
  const records=[['Plano','plano_json_arquivo_id'],['Redação','redacao_json_arquivo_id'],['Visual','visual_json_arquivo_id']].map(([papel,campo])=>({
    papel,arquivo:s && preenchido(s[campo])?arquivoLigado(s,campo,{semana_id:s.semana_id},ctx):null
  }));
  ctx.documentos.set(p.semanaId,{records,avisos:ctx.locais.slice(inicio)});
  return records;
}
function avisarPublicacao(p,completedAt,ctx) {
  const value=p.publicado_em;
  if(!preenchido(value)) return;
  const iso=typeof value==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value);
  const instante=iso && dataCivil(value.slice(0,10))?Date.parse(value):NaN;
  if(!Number.isFinite(instante) || instante>Date.parse(completedAt)) {
    avisoRegistro(p,'publicado_em','Publicação registrada inconsistente: formato, fuso ou instante posterior à captura; original preservado',ctx);
  }
}
function chaveOrigem(origem) {return JSON.stringify([origem.aba,origem.linha]);}
function indexarAvisos(avisos) {
  const indice=new Map();
  for(const aviso of avisos) {
    if(!aviso.aba || !Number.isInteger(aviso.linha)) continue;
    const chave=chaveOrigem(aviso);
    if(!indice.has(chave)) indice.set(chave,[]);
    indice.get(chave).push(aviso);
  }
  return indice;
}
function avisosRelacionados(p,ntv,origens,indice) {
  const semana=ntv.semanas.find(s=>s.semana_id===p.semanaId);
  const documentos=new Set(semana?[semana.plano_json_arquivo_id,semana.redacao_json_arquivo_id,semana.visual_json_arquivo_id]:[]);
  const arquivos=ntv.arquivos.filter(a=>a.producao_id===p.producao_id ||
    (!preenchido(a.producao_id) && a.semana_id===p.semanaId) || documentos.has(a.arquivo_id));
  const unidades=[ntv.paginas,ntv.cenas,ntv.revisoes].flatMap(records=>records.filter(r=>r.producao_id===p.producao_id));
  const records=[p,...unidades,...arquivos,...(semana?[semana]:[])];
  return [...new Set(records.flatMap(r=>indice.get(chaveOrigem(origens.get(r))) ?? []))];
}
function detalhar(result,ntv,origens,validadeJson) {
  const indice=indexarAvisos(result.avisos);
  const ctxBase={origens,validadeJson,avisos:result.avisos,documentos:new Map(),arquivos:new Map(ntv.arquivos.map(a=>[a.arquivo_id,a])),
    paginas:new Map(ntv.paginas.map(p=>[p.pagina_id,p])),cenas:new Map(ntv.cenas.map(c=>[c.cena_id,c]))};
  for(const p of result.producoes) {
    const ctx={...ctxBase,locais:avisosRelacionados(p,ntv,origens,indice)};
    validarNumeros(p,['versao','pacote_versao'],[],ctx);
    if(!preenchido(p.versao)) avisoRegistro(p,'versao','Versão vigente não informada; mídia a confirmar',ctx);
    p.detalhes={responsavelRegistrado:preenchido(p.responsavel_atual)?p.responsavel_atual:'A confirmar',
      publicacaoRegistrada:preenchido(p.publicado_em),paginas:unidades(p,ntv.paginas,'paginas',ctx),cenas:unidades(p,ntv.cenas,'cenas',ctx),
      revisoes:revisoes(p,ntv.revisoes,ctx),arquivos:arquivosRegistrados(p,ntv.arquivos,ctx),documentosSemana:documentosSemana(p,ntv,ctx),avisos:ctx.locais};
    p.detalhes.pacotePublicacao=pacotePublicacao(p,p.detalhes.arquivos);
    if(p.detalhes.arquivos.length===0) avisoRegistro(p,'versao','Mídia ausente: nenhum arquivo da produção registrado',ctx);
    avisarPublicacao(p,result.captura.completedAt,ctx);
  }
}
function colunaProducao(p,mapa) {
  if(preenchido(p.publicado_em)) return 'Publicada';
  if(mapa.liberacao.has(p.estado_liberacao)) return 'Pronta';
  if(mapa.revisao.has(p.estado_revisao)) return 'Revisão';
  return mapa.etapas.get(p.etapa_producao) ?? 'Outras';
}
function pendenciasRevisao(p) {
  const correcoes=new Set(['revisar','refazer','reprovado','rejeitado']);
  return p.detalhes.revisoes.vigentes.filter(r=>correcoes.has(r.decisao)).map(r=>({
    tipo:'revisao',texto:preenchido(r.motivo)?r.motivo:'Correção solicitada',revisaoId:r.revisao_id,
    decisao:r.decisao,versao:r.versao,responsavelCorrecao:r.responsavel_correcao
  }));
}
function pendenciasMidia(p) {
  const paginas=p.detalhes.paginas.filter(u=>u.vigente),cenas=p.detalhes.cenas.filter(u=>u.vigente);
  const pendencias=[
    ...paginas.filter(u=>!u.arquivos[0]).map(u=>({tipo:'midia',texto:'Imagem ausente',unidade:'pagina',unidadeId:u.pagina_id})),
    ...cenas.filter(u=>u.avisoMidia).map(u=>({tipo:'midia',texto:u.avisoMidia,unidade:'cena',unidadeId:u.cena_id}))
  ];
  const arquivoVigente=p.detalhes.arquivos.some(a=>inteiroPositivo(a.versao) && a.versao===p.versao);
  if(paginas.length===0 && cenas.length===0 && inteiroPositivo(p.versao) && !arquivoVigente) {
    pendencias.push({tipo:'midia',texto:'Mídia ausente: sem arquivo registrado nesta versão'});
  }
  return pendencias;
}
function colunaSemana(nome,producoes) {
  const cards=producoes.filter(p=>p.quadro.coluna===nome),ids=cards.map(p=>p.producao_id).sort(ordinal);
  const quantidadeValoresNovos=nome==='Outras'?new Set(cards.map(p=>preenchido(p.etapa_producao)?p.etapa_producao:null)).size:0;
  const titulo=nome==='Outras'?`Outras · ${quantidadeValoresNovos} ${quantidadeValoresNovos===1?'valor novo':'valores novos'}`:nome;
  return {nome,titulo,ids,quantidadeValoresNovos};
}
function montarQuadro(result,mapaQuadro) {
  const mapa={liberacao:new Set(mapaQuadro.liberacaoPronta),revisao:new Set(mapaQuadro.revisaoEmAndamento),
    etapas:new Map(mapaQuadro.etapas.map(e=>[e.rotulo,e.coluna]))};
  for(const p of result.producoes) {
    p.quadro={coluna:colunaProducao(p,mapa),pendencias:[...pendenciasRevisao(p),...pendenciasMidia(p)]};
  }
  result.quadro.semanas=result.semanas.map(s=>({semanaId:s.semana_id,
    colunas:COLUNAS.map(nome=>colunaSemana(nome,result.producoes.filter(p=>p.semanaId===s.semana_id)))}));
}
function montarPlanilha(ntv,captura) {
  const result=Object.keys(CAMPOS).map((nome,i)=>{
    const cabecalhos=camposCapturados(nome,captura.envelope.tables[nome]);
    const linhas=ntv[chaves[i]].map(record=>Object.fromEntries(cabecalhos.map(campo=>[campo,record[campo]])));
    return {nome,cabecalhos:[...cabecalhos],quantidadeLinhas:linhas.length,linhas};
  });
  if(Object.hasOwn(ntv,'meses')) result.push({nome:'Meses',cabecalhos:['mes','marca_id','objetivo','pautas'],quantidadeLinhas:ntv.meses.length,linhas:ntv.meses});
  if(Object.hasOwn(ntv,'pautas')) result.push({nome:'Pautas',cabecalhos:[...CAMPOS_PAUTAS],quantidadeLinhas:ntv.pautas.length,linhas:ntv.pautas.map(p=>({...p}))});
  return result;
}
function projetarVisao(estadoLocal,nowIso,mapaQuadro) {
  const result=base(estadoLocal), captura=estadoLocal.captura;
  if (!captura) return result;
  const origens=new WeakMap(),validadeJson=new WeakMap(),ntv=selecionarNtv(captura,result.avisos,origens,validadeJson);
  const pautas=projetarPautas(ntv,result.avisos,origens);
  if(Object.hasOwn(ntv,'pautas'))result.pautas=pautas;
  result.semanas=ntv.semanas;
  result.producoes=ntv.producoes;
  result.planilha=montarPlanilha(ntv,captura);
  result.captura={capturaId:captura.envelope.capturaId,completedAt:captura.envelope.completedAt,
    periodo:{inicio:null,fim:null},contagens:Object.fromEntries(chaves.map(k=>[k,ntv[k].length]))};
  planejar(result,origens);
  detalhar(result,ntv,origens,validadeJson);
  montarQuadro(result,mapaQuadro);
  aplicarFrescor(result,estadoLocal,nowIso);
  return result;
}
module.exports={projetarVisao};
