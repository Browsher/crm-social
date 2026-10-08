const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturaValida,mapaQuadroValido,temporario,carregarModulo,mudarCelula,redefinirHorario}=require('./fixtures.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {projetarVisao}=carregarModulo('src/projecao.cjs',['projetarVisao']);
const {capturaDetalhada,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const {capturaQuadro,mapaQuadroSintetico}=require('./fixtures.cjs');
const {capturaPlanilha,capturaEscala,campos}=require('./fixtures.cjs');
const {carregarMapaQuadro}=require('../src/quadro-config.cjs');
const {validarCaptura}=require('../src/captura.cjs');
const NOW='2026-10-02T14:00:00Z';
const envelope=['schemaVersion','estado','selo','fonte','captura','ultimaTentativa','semanas','producoes','dias','quadro','planilha','historico','avisos'].sort();
const {capturaMeses}=require('./fixtures.cjs');
test('P003 Meses opcional filtra marca/extras e preserva raiz, semanas e contagens',t=>{
  const raw=capturaMeses([['2026-10','ntv','Objetivo sintético','Pauta A','privado'],['2026-10','outra','Outra marca',''],['2026-11','','Sem marca','']],['extra']);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const legacy=projetarVisao(estado(capturaValida(),t),NOW,mapaQuadroValido());
  assert.deepEqual(Object.keys(view).sort(),envelope);assert.deepEqual(view.semanas,legacy.semanas);
  assert.deepEqual(view.captura.contagens,legacy.captura.contagens);
  assert.deepEqual(view.planilha.at(-1),{nome:'Meses',cabecalhos:['mes','marca_id','objetivo','pautas'],quantidadeLinhas:1,linhas:[{mes:'2026-10',marca_id:'ntv',objetivo:'Objetivo sintético',pautas:'Pauta A'}]});
  assert.doesNotMatch(JSON.stringify(view),/Outra marca|Sem marca|privado|extra/);
});
test('P003 duplicatas preservadas com aviso em cada linha física inclusive após vazios',t=>{
  const raw=capturaMeses([['2026-10','ntv','A',''],[],['2026-10','ntv','B',''],['2026-10','outra','C',''],['2026-11','ntv','D','']]);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.equal(view.planilha.at(-1).linhas.length,3);
  assert.deepEqual(view.avisos.filter(a=>a.aba==='Meses'),[2,4].map(linha=>({aba:'Meses',linha,campo:'mes',motivo:'Mês e marca repetidos'})));
  assert.equal(view.estado,'atualizada_hoje');
});
test('P003 meses/tipos inválidos avisam sem eco e texto credenciado é redigido',t=>{
  const raw=capturaMeses([['2026-13','ntv',12,true],[46000,'ntv','',''],['2026-01','ntv','Veja https://usuario:senha@exemplo.invalid/item hoje','<b>Texto literal</b>'],['2026-02','outra',12,true]]);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const avisos=view.avisos.filter(a=>a.aba==='Meses');
  for(const [linha,campo,motivo] of [[2,'mes','Mês inválido'],[2,'objetivo','Texto mensal inválido'],[2,'pautas','Texto mensal inválido'],[3,'mes','Mês inválido'],[4,'objetivo','conteúdo sensível suprimido']]) assert.ok(avisos.some(a=>a.linha===linha&&a.campo===campo&&a.motivo===motivo));
  assert.equal(avisos.length,5);
  assert.equal(view.planilha.at(-1).linhas[2].objetivo,'Veja [conteúdo suprimido] hoje');
  assert.doesNotMatch(JSON.stringify(view),/usuario:senha|exemplo.invalid/);
});
test('P003 nova captura sem Meses remove somente opcional e não herda objetivo',t=>{
  const dir=temporario(t);promoverCaptura(capturaMeses(),dir);
  const next=capturaValida();next.capturaId='meses-removida';redefinirHorario(next,'2026-10-02T12:06:00Z','2026-10-02T12:07:00Z');
  assert.equal(promoverCaptura(next,dir).resultado,'completa');
  const view=projetarVisao(lerEstado(dir),NOW,mapaQuadroValido());
  assert.equal(view.planilha.length,6);assert.ok(!view.planilha.some(a=>a.nome==='Meses'));
});
function estado(raw,t) { const dir=temporario(t); promoverCaptura(raw,dir); return lerEstado(dir,NOW); }
const colunasQuadro=['Planejamento','Redação','Visual','Mídia','Revisão','Pronta','Publicada','Outras'];
test('P002 fonte direta enum e seis tabelas de 66 campos, sem envelope privado',t=>{
  const raw=capturaValida();raw.source='google-sheets-api';
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.equal(view.fonte,'Leitura direta pelo servidor local');assert.equal(view.planilha.length,6);
  assert.equal(view.planilha.reduce((n,tab)=>n+tab.cabecalhos.length,0),66);
  assert.equal(view.producoes[0].versao,1);assert.equal(view.producoes[0].data_prevista,raw.tables.Produções.values[1][raw.tables.Produções.values[0].indexOf('data_prevista')]);
  assert.doesNotMatch(JSON.stringify(view),/spreadsheetId|metadataBefore|google-sheets-api|__extra_privado/);
  assert.equal(projetarVisao(estado(capturaValida(),t),NOW,mapaQuadroValido()).fonte,'Captura pela Central');
});
function mapaTemp(t,mapa=mapaQuadroValido()) {
  const file=path.join(temporario(t),'quadro-etapas.json');fs.writeFileSync(file,JSON.stringify(mapa));
  return carregarMapaQuadro(file);
}

test('P08 quadro sem captura conserva oito nomes e nenhuma semana fictícia', ()=>{
  const view=projetarVisao({captura:null,historico:[],ultimaTentativa:null},NOW,mapaQuadroValido());
  assert.deepEqual(view.quadro,{colunas:colunasQuadro.map(nome=>({nome})),semanas:[]});
});

test('P08 quadro da semana conserva cada cartão uma vez nas oito colunas do mapa', t=>{
  const raw=capturaQuadro(),view=projetarVisao(estado(raw,t),NOW,mapaTemp(t,mapaQuadroSintetico()));
  assert.deepEqual(view.quadro.colunas.map(c=>c.nome),colunasQuadro);
  assert.deepEqual(view.quadro.semanas.map(s=>s.semanaId),['semana-01','semana-02']);
  const colunas=view.quadro.semanas[0].colunas;
  assert.deepEqual(colunas.map(c=>[c.nome,c.ids]),[
    ['Planejamento',['peca-1']],['Redação',['peca-2']],['Visual',['peca-3']],['Mídia',['peca-4']],
    ['Revisão',['peca-7']],['Pronta',['peca-8']],['Publicada',['peca-9']],['Outras',['peca-10','peca-11','peca-12']]
  ]);
  assert.equal(new Set(colunas.flatMap(c=>c.ids)).size,10);
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-7').quadro.coluna,'Revisão');
  assert.ok(!colunas.flatMap(c=>c.ids).includes('peca-5'));
  assert.equal(view.producoes.length,11);
  assert.deepEqual(Object.keys(view).sort(),envelope);
  assert.ok(!JSON.stringify(view.quadro).includes('liberada-sintetica'));
});

test('P08 prioridade desce publicação > liberação > revisão > etapa > Outras', t=>{
  const raw=capturaValida(),mapa=mapaTemp(t,mapaQuadroSintetico());
  mudarCelula(raw,'Produções',1,'status','rascunho');
  mudarCelula(raw,'Produções',1,'estado_liberacao','liberada-sintetica');
  mudarCelula(raw,'Produções',1,'estado_revisao','em-revisao-sintetica');
  mudarCelula(raw,'Produções',1,'publicado_em','2026-10-01T12:00:00Z');
  for(const [campo,valor,esperado] of [
    ['status','rascunho','Publicada'],['publicado_em','','Pronta'],
    ['estado_liberacao','','Revisão'],['estado_revisao','','Visual'],
    ['etapa_producao','etapa-nao-mapeada-sintetica','Outras']
  ]) {
    mudarCelula(raw,'Produções',1,campo,valor);
    const p=projetarVisao(estado(raw,t),NOW,mapa).producoes[0];
    assert.equal(p.quadro.coluna,esperado);assert.equal(p.status,'rascunho');
    assert.equal(p.responsavel_atual,'Equipe sintética');
  }
});

test('P09 mapa atual mantém arte em Visual e as oito etapas de mídia sem prontidão inferida', t=>{
  const mapa=mapaTemp(t);
  assert.deepEqual(mapa.liberacaoPronta,[]);assert.deepEqual(mapa.revisaoEmAndamento,[]);
  for(const [etapa,coluna] of [['arte_aprovada','Visual'],['prompts_imagem_prontos','Mídia'],
    ['imagens_em_producao','Mídia'],['voz_pronta_para_gerar','Mídia'],['voz_em_producao','Mídia'],
    ['clipes_prontos_para_gerar','Mídia'],['clipes_em_producao','Mídia'],['montagem_pronta','Mídia'],['montagem_em_producao','Mídia']]) {
    const raw=capturaValida();mudarCelula(raw,'Produções',1,'etapa_producao',etapa);
    mudarCelula(raw,'Produções',1,'estado_liberacao','bloqueado');mudarCelula(raw,'Produções',1,'estado_revisao','aprovada');
    const p=projetarVisao(estado(raw,t),NOW,mapa).producoes[0];
    assert.equal(p.quadro.coluna,coluna);assert.equal(p.etapa_producao,etapa);
  }
});

test('P09 status, aprovação e arquivo final não substituem publicação explicitamente registrada', t=>{
  for(const vazio of ['',null,'  ']) {
    const raw=capturaValida();mudarCelula(raw,'Produções',1,'status','publicado');
    mudarCelula(raw,'Produções',1,'estado_revisao','aprovada');mudarCelula(raw,'Produções',1,'estado_liberacao','aprovada');
    mudarCelula(raw,'Produções',1,'url_video_final','https://docs.google.com/document/d/exemplo-sintetico');
    mudarCelula(raw,'Produções',1,'id_drive_video_final','arquivo-final-sintetico');mudarCelula(raw,'Produções',1,'publicado_em',vazio);
    const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t)),p=view.producoes[0];
    assert.equal(p.quadro.coluna,'Visual');assert.equal(p.status,'publicado');
    assert.ok(!p.detalhes.avisos.some(a=>a.campo==='publicado_em'));
    assert.equal(raw.tables.Produções.values[1][raw.tables.Produções.values[0].indexOf('publicado_em')],vazio);
  }
});

test('P09 publicação preenchida inconsistente mantém Publicada e aviso único localizado', t=>{
  for(const [valor,invalido] of [['registro sintético',true],['2026-10-02T11:00:00',true],
    ['2026-02-30T11:00:00Z',true],['2026-10-03T12:00:00Z',true],[42,true],[false,true],['2026-10-02T12:05:00Z',false]]) {
    const raw=capturaValida();mudarCelula(raw,'Produções',1,'publicado_em',valor);
    const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t)),p=view.producoes[0];
    assert.equal(p.quadro.coluna,'Publicada');assert.equal(p.publicado_em,valor);
    const globais=view.avisos.filter(a=>a.aba==='Produções' && a.linha===2 && a.campo==='publicado_em');
    assert.equal(globais.length,invalido?1:0);assert.deepEqual(p.detalhes.avisos.filter(a=>a.campo==='publicado_em'),globais);
    if(invalido) assert.match(globais[0].motivo,/Publicação registrada inconsistente/);
  }
});

test('P10 Outras conta rótulos distintos por semana, vazio único e originais preservados', t=>{
  const raw=capturaQuadro();
  raw.metadataBefore.Produções.rowCount=40;raw.metadataAfter.Produções.rowCount=40;
  raw.tables.Produções.range=raw.tables.Produções.range.replace(/20$/,'40');
  mudarCelula(raw,'Produções',11,'etapa_producao',null);
  for(const [id,etapa,extras] of [
    ['vazio-string','',{}],['vazio-espacos',' \t ',{}],['vazio-omitido','',{}],
    ['rotulo-diferente','segundo_valor',{}],['rotulo-espacos-emvolta',' etapa_nova_sintetica ',{}],
    ['prioridade-publicacao','nao-contar-publicacao',{publicado_em:'2026-10-01T12:00:00Z'}],
    ['prioridade-liberacao','nao-contar-liberacao',{estado_liberacao:'liberada-sintetica'}],
    ['prioridade-revisao','nao-contar-revisao',{estado_revisao:'em-revisao-sintetica'}]
  ]) {
    adicionarRegistro(raw,'Produções',{producao_id:id,marca_id:'ntv',semana_id:'semana-01',slot:'imagem_a',versao:1,
      data_prevista:'2026-10-03',etapa_producao:etapa,...extras});
  }
  const table=raw.tables.Produções,etapaIndex=table.values[0].indexOf('etapa_producao');
  const omitido=table.values.findIndex(r=>r[0]==='vazio-omitido');table.values[omitido]=table.values[omitido].slice(0,etapaIndex);
  mudarCelula(raw,'Produções',5,'etapa_producao','fora-da-marca');recalcularHashes(raw);
  const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t,mapaQuadroSintetico()));
  const outras=view.quadro.semanas[0].colunas.find(c=>c.nome==='Outras');
  assert.equal(outras.quantidadeValoresNovos,4);assert.equal(outras.titulo,'Outras · 4 valores novos');
  assert.deepEqual(outras.ids,['peca-10','peca-11','peca-12','rotulo-diferente','rotulo-espacos-emvolta','vazio-espacos','vazio-omitido','vazio-string']);
  for(const [id,original] of [['peca-12',null],['vazio-string',''],['vazio-espacos',' \t '],['vazio-omitido',''],
    ['rotulo-espacos-emvolta',' etapa_nova_sintetica ']]) {
    assert.equal(view.producoes.find(p=>p.producao_id===id).etapa_producao,original,id);
  }
  assert.equal(view.quadro.semanas[1].colunas.find(c=>c.nome==='Outras').quantidadeValoresNovos,1);
  assert.ok(!view.producoes.some(p=>p.producao_id==='peca-5'));
  assert.equal(raw.tables.Produções.values[11][etapaIndex],null);
});

test('P10 novo rótulo só no JSON TEMP retira cartão de Outras e atualiza singular/zero', t=>{
  const raw=capturaValida();mudarCelula(raw,'Produções',2,'etapa_producao','novo-rotulo-sintetico');
  const state=estado(raw,t),mapa=mapaQuadroValido();
  const before=projetarVisao(state,NOW,mapaTemp(t,mapa));
  const outras=before.quadro.semanas[0].colunas.find(c=>c.nome==='Outras');
  assert.equal(outras.titulo,'Outras · 1 valor novo');assert.equal(outras.quantidadeValoresNovos,1);assert.deepEqual(outras.ids,['peca-2']);
  mapa.etapas.push({rotulo:'novo-rotulo-sintetico',coluna:'Redação'});
  const after=projetarVisao(state,NOW,mapaTemp(t,mapa));
  assert.equal(after.producoes[1].quadro.coluna,'Redação');
  assert.deepEqual(after.quadro.semanas[0].colunas.find(c=>c.nome==='Outras'),{nome:'Outras',titulo:'Outras · 0 valores novos',ids:[],quantidadeValoresNovos:0});
  assert.equal(mapaQuadroValido().etapas.length,9);assert.equal(state.captura.producoes[1].etapa_producao,'novo-rotulo-sintetico');
});

test('P10 semanas vazias e órfãs mantêm colunas e identidades sem somar outra semana', t=>{
  const raw=capturaValida();
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-vazia',marca_id:'ntv',inicio_semana:'2026-10-05',tema:'Semana vazia sintética'});
  mudarCelula(raw,'Produções',2,'semana_id','semana-ausente');mudarCelula(raw,'Produções',2,'etapa_producao','rotulo-orfa');
  const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t));
  assert.deepEqual(view.quadro.semanas.map(s=>s.semanaId),['semana-01','semana-vazia',null]);
  const vazia=view.quadro.semanas[1];assert.deepEqual(vazia.colunas.map(c=>c.nome),colunasQuadro);
  assert.ok(vazia.colunas.every(c=>c.ids.length===0 && c.quantidadeValoresNovos===0));
  const orfa=view.quadro.semanas[2].colunas.find(c=>c.nome==='Outras');
  assert.deepEqual(orfa.ids,['peca-2']);assert.equal(orfa.quantidadeValoresNovos,1);
  assert.equal(view.quadro.semanas[0].colunas.find(c=>c.nome==='Outras').quantidadeValoresNovos,0);
});

test('P10 pendências são registros vigentes: revisão pede correção e mídia não é link indisponível', t=>{
  const raw=capturaDetalhada();
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-aprovacao-sintetica',producao_id:'peca-3',versao:2,decisao:'aprovado',estado_tratamento:'aberta'});
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-vinculo-ambiguo',producao_id:'peca-3',versao:2,pagina_id:'pagina-inexistente',decisao:'revisar',estado_tratamento:'aberta'});
  mudarCelula(raw,'Revisoes',1,'estado_tratamento','resolvida');
  mudarCelula(raw,'Arquivos',2,'url','');
  const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t)),carousel=view.producoes[2],reels=view.producoes[3];
  const revisoes=carousel.quadro.pendencias.filter(p=>p.tipo==='revisao');
  assert.deepEqual(revisoes.map(p=>p.revisaoId),['revisao-atual','revisao-incerta']);
  assert.ok(revisoes.every(p=>p.texto==='Conferir texto de exemplo' && p.responsavelCorrecao==='Correção sintética' && p.versao===2));
  assert.equal(carousel.responsavel_atual,'Equipe sintética');assert.equal(carousel.detalhes.responsavelRegistrado,'Equipe sintética');
  const midias=carousel.quadro.pendencias.filter(p=>p.tipo==='midia');
  assert.deepEqual(midias.map(p=>[p.unidade,p.unidadeId,p.texto]),[['pagina','pagina-01','Imagem ausente']]);
  assert.deepEqual(reels.quadro.pendencias.filter(p=>p.tipo==='midia').map(p=>[p.unidadeId,p.texto]),[
    ['cena-02','imagens ausentes'],['cena-01','imagens ausentes; vídeo ausente']]);
  assert.deepEqual(view.producoes[0].quadro.pendencias,[]);
  assert.deepEqual(view.producoes[1].quadro.pendencias,[{tipo:'midia',texto:'Mídia ausente: sem arquivo registrado nesta versão'}]);
  assert.equal(new Set(revisoes.map(p=>p.revisaoId)).size,revisoes.length);
  const avisos=view.avisos.map(a=>JSON.stringify(a));assert.equal(new Set(avisos).size,avisos.length);
});

test('P10 etapa original recuperada do envelope continua passando pela triagem', t=>{
  for(const etapa of ['sk-ant-'+'s'.repeat(30),'C:\\pasta-privada-sintetica\\arquivo',
    'https://usuario-sintetico:senha-sintetica@exemplo.invalid']) {
    const raw=capturaValida();mudarCelula(raw,'Produções',1,'etapa_producao',etapa);
    const view=projetarVisao(estado(raw,t),NOW,mapaTemp(t)),p=view.producoes[0];
    assert.equal(p.etapa_producao,'[conteúdo suprimido]');assert.equal(p.quadro.coluna,'Outras');
    assert.ok(p.detalhes.avisos.some(a=>a.campo==='etapa_producao' && a.motivo==='conteúdo sensível suprimido'));
    assert.equal(raw.tables.Produções.values[1][raw.tables.Produções.values[0].indexOf('etapa_producao')],etapa);
  }
});

test('P10 correção usa decisões literais conhecidas, sem inferir de aprovação ou pendência de capacidade', t=>{
  for(const [decisao,esperado] of [['revisar',true],['refazer',true],['reprovado',true],['rejeitado',true],
    ['aprovado',false],['aprovada',false],['pendente_material',false],['pendente_capacidade',false],['decisao-nova-sintetica',false]]) {
    const raw=capturaValida();mudarCelula(raw,'Revisoes',1,'decisao',decisao);
    const p=projetarVisao(estado(raw,t),NOW,mapaTemp(t)).producoes[0];
    const pendencias=p.quadro.pendencias.filter(p=>p.tipo==='revisao');
    assert.equal(pendencias.length,esperado?1:0,decisao);
    assert.equal(p.detalhes.revisoes.vigentes[0].decisao,decisao);
    if(esperado) {
      assert.equal(pendencias[0].decisao,decisao);assert.equal(pendencias[0].revisaoId,'revisao-01');
      assert.equal(pendencias[0].responsavelCorrecao,'Equipe sintética');
    }
  }
});

test('P05 dia inteiro, versões separadas, páginas/cenas em ordem e fontes internas', t=>{
  const raw=capturaDetalhada(),view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(view.dias.find(d=>d.data==='2026-10-02').ids,['peca-3','peca-4']);
  const carousel=view.producoes.find(p=>p.producao_id==='peca-3').detalhes;
  assert.deepEqual(carousel.paginas.map(p=>[p.pagina_id,p.versao,p.vigente]),[['pagina-antiga',1,false],['pagina-02',2,true],['pagina-01',2,true]]);
  assert.equal(carousel.paginas[1].arquivos[0].arquivo_id,'arquivo-pagina');
  assert.ok(carousel.paginas.every(p=>p.designNovo==='A confirmar'));
  const reels=view.producoes.find(p=>p.producao_id==='peca-4').detalhes;
  assert.deepEqual(reels.cenas.map(c=>c.cena_id),['cena-02','cena-01']);
  assert.equal(reels.cenas[0].arquivos.find(a=>a?.arquivo_id==='arquivo-clipe').nomeApresentacao,'vídeo · clipe');
  assert.equal(carousel.documentosSemana[0].arquivo.arquivo_id,'arquivo-plano');
  assert.equal(carousel.documentosSemana[1].arquivo,null);
  assert.deepEqual(Object.keys(view).sort(),envelope);
  assert.ok(!JSON.stringify(view).includes('sentinela-nao-publicar'));
});

test('P-review I1 URL com usuário/senha é suprimida sem expor valor em avisos', t=>{
  for(const url of ['https://usuario-sintetico:senha-sintetica@docs.google.com/x','https://usuario-sintetico@drive.google.com/x',
    'https://:senha-sintetica@drive.google.com/x','ftp://usuario%2Dsintetico:senha%2Dsintetica@example.invalid/x']) {
    const raw=capturaDetalhada();mudarCelula(raw,'Arquivos',2,'url',url);mudarCelula(raw,'Produções',3,'url_video_final',url);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    const serialized=JSON.stringify(view);
    assert.doesNotMatch(serialized,/usuario(?:-|%2D)sintetico|senha(?:-|%2D)sintetica/);
    assert.equal(view.producoes[2].url_video_final,'[conteúdo suprimido]');
    assert.equal(view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').url,'[conteúdo suprimido]');
    assert.ok(view.avisos.some(a=>a.aba==='Arquivos' && a.linha===3 && a.campo==='url' && a.motivo==='conteúdo sensível suprimido'));
    assert.ok(view.avisos.some(a=>a.aba==='Produções' && a.linha===4 && a.campo==='url_video_final'));
    assert.equal(raw.tables.Arquivos.values[2][raw.tables.Arquivos.values[0].indexOf('url')],url);
  }
});

test('P-review I1 URL malformada não devolve credencial e vazio continua vazio', t=>{
  for(const url of ['https://usuario-sintetico:senha-sintetica@exa[mple.invalid','https://usuario-sintetico:senha-sintetica@docs.google.com:porta-invalida','URL inválida sintética','', '  ']) {
    const raw=capturaDetalhada();mudarCelula(raw,'Arquivos',2,'url',url);mudarCelula(raw,'Produções',3,'url_video_final',url);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()),p=view.producoes[2];
    assert.doesNotMatch(JSON.stringify(view),/usuario-sintetico|senha-sintetica/);
    assert.equal(p.url_video_final,url.trim()?'[conteúdo suprimido]':url);
    assert.equal(p.detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').url,p.url_video_final);
    assert.equal(view.avisos.filter(a=>a.motivo==='URL inválida suprimida').length,url.trim()?2:0);
  }
});

test('P-round2 I1 avisos da própria produção entram nos locais sem duplicar globais', t=>{
  const raw=capturaDetalhada(),table=raw.tables.Produções;
  const foreign=table.values.pop();table.values.splice(1,0,[],foreign);
  const row=table.values.findIndex(r=>r[0]==='peca-1');
  mudarCelula(raw,'Produções',row,'data_prevista','');
  mudarCelula(raw,'Produções',row,'semana_id','semana-ausente-sintetica');
  mudarCelula(raw,'Produções',row,'url_video_final','https://usuario-sintetico:senha-sintetica@docs.google.com/x');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const p=view.producoes.find(p=>p.producao_id==='peca-1');
  for(const campo of ['data_prevista','semana_id','url_video_final']) {
    const globais=view.avisos.filter(a=>a.aba==='Produções' && a.linha===row+1 && a.campo===campo);
    const locais=p.detalhes.avisos.filter(a=>a.aba==='Produções' && a.linha===row+1 && a.campo===campo);
    assert.equal(globais.length,1,campo);assert.equal(locais.length,1,campo);
    assert.deepEqual(locais,globais);
  }
  assert.equal(p.detalhes.avisos.length,3);
  assert.ok(!view.producoes.find(p=>p.producao_id==='peca-2').detalhes.avisos.some(a=>a.aba==='Produções' && a.linha===row+1));
});

test('P-round2 I1 avisos selecionados de unidades/arquivos/revisões/documentos entram na peça relacionada', t=>{
  const raw=capturaDetalhada(),token='sk-ant-'+'s'.repeat(30);
  mudarCelula(raw,'Páginas',2,'corpo',token);mudarCelula(raw,'Cenas',2,'texto',token);
  mudarCelula(raw,'Revisoes',2,'motivo',token);mudarCelula(raw,'Semanas',1,'tema',token);
  mudarCelula(raw,'Arquivos',2,'url','https://usuario-sintetico:senha-sintetica@drive.google.com/x');
  mudarCelula(raw,'Arquivos',4,'url','https://usuario-sintetico:senha-sintetica@docs.google.com/x');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const carousel=view.producoes[2].detalhes,reels=view.producoes[3].detalhes;
  const origem=[['Páginas',3,'corpo'],['Revisoes',3,'motivo'],['Semanas',2,'tema'],['Arquivos',3,'url'],['Arquivos',5,'url']];
  for(const [aba,linha,campo] of origem) {
    const globais=view.avisos.filter(a=>a.aba===aba && a.linha===linha && a.campo===campo);
    const locais=carousel.avisos.filter(a=>a.aba===aba && a.linha===linha && a.campo===campo);
    assert.equal(globais.length,1,aba+'/'+campo);assert.equal(locais.length,1,aba+'/'+campo);
    assert.deepEqual(locais,globais);
  }
  assert.equal(reels.avisos.filter(a=>a.aba==='Cenas' && a.linha===3 && a.campo==='texto').length,1);
  assert.ok(!carousel.avisos.some(a=>a.aba==='Cenas'));
  assert.ok(!reels.avisos.some(a=>a.aba==='Páginas' || a.aba==='Revisoes' && a.linha===3 || a.aba==='Arquivos' && a.linha===3));
  assert.equal(reels.avisos.filter(a=>a.aba==='Semanas' && a.campo==='tema').length,1);
  assert.equal(reels.avisos.filter(a=>a.aba==='Arquivos' && a.linha===5 && a.campo==='url').length,1);
  const suprimidos=view.avisos.filter(a=>a.motivo==='conteúdo sensível suprimido');
  assert.equal(suprimidos.length,6);
});

test('P-round2 m4 pedaço HTTP(S) com userinfo é redigido nas tabelas preservando o texto', t=>{
  const campos=[['Semanas',1,'objetivo'],['Produções',3,'titulo'],['Páginas',2,'corpo'],
    ['Cenas',2,'texto_tela'],['Arquivos',2,'papel'],['Revisoes',2,'motivo']];
  const urls=['https://usuario-sintetico:senha-sintetica@docs.google.com/x',
    'https://usuario-sintetico@docs.google.com','https://:senha-sintetica@docs.google.com',
    'HTTPS://usuario-sintetico:senha-sintetica@docs.google.com',
    'https://usuario%2Dsintetico:senha%2Dsintetica@docs.google.com/x'];
  for(const url of urls) {
    const raw=capturaDetalhada(),texto='Referência: "'+url+'" — texto sintético';
    for(const [aba,row,campo] of campos) mudarCelula(raw,aba,row,campo,texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.doesNotMatch(JSON.stringify(view),/usuario(?:-|%2D| )sintetico|senha(?:-|%2D| )sintetica/);
    for(const [aba,row,campo] of campos) {
      assert.equal(raw.tables[aba].values[row][raw.tables[aba].values[0].indexOf(campo)],texto);
      assert.equal(view.avisos.filter(a=>a.aba===aba && a.linha===row+1 && a.campo===campo && a.motivo==='conteúdo sensível suprimido').length,1);
    }
    const esperado='Referência: "[conteúdo suprimido]" — texto sintético';
    assert.equal(view.semanas[0].objetivo,esperado);
    assert.equal(view.producoes[2].titulo,esperado);
    assert.equal(view.producoes[2].detalhes.paginas.find(p=>p.pagina_id==='pagina-02').corpo,esperado);
    assert.equal(view.producoes[3].detalhes.cenas.find(c=>c.cena_id==='cena-02').texto_tela,esperado);
    assert.equal(view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').papel,esperado);
    assert.equal(view.producoes[2].detalhes.revisoes.vigentes.find(r=>r.revisao_id==='revisao-atual').motivo,esperado);
  }
});

test('P-round2 m4 JSON válido com URL escapada é dado, mas não expõe userinfo', t=>{
  const url='https://usuario-sintetico:senha-sintetica@docs.google.com/x';
  const textos=[[JSON.stringify({url}),JSON.stringify({url:'[conteúdo suprimido]'})],
    [JSON.stringify({url}).replaceAll('/', '\\/'),JSON.stringify({url:'[conteúdo suprimido]'})],
    [JSON.stringify({url}).replaceAll('usuario','\\u0075suario'),JSON.stringify({url:'[conteúdo suprimido]'})],
    [JSON.stringify({origem:JSON.stringify([url])}),JSON.stringify({origem:JSON.stringify(['[conteúdo suprimido]'])})],
    [JSON.stringify({[url]:'valor sintético'}),JSON.stringify({'[conteúdo suprimido]':'valor sintético'})],
    [JSON.stringify(url),JSON.stringify('[conteúdo suprimido]')]];
  for(const [texto,esperado] of textos) {
    const raw=capturaDetalhada();mudarCelula(raw,'Arquivos',2,'origens_json',texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.doesNotMatch(JSON.stringify(view),/usuario-sintetico|senha-sintetica|u0075suario/);
    assert.equal(view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').origens_json,esperado);
    assert.ok(view.avisos.some(a=>a.aba==='Arquivos' && a.linha===3 && a.campo==='origens_json' && a.motivo==='conteúdo sensível suprimido'));
    assert.ok(!view.avisos.some(a=>a.aba==='Arquivos' && a.linha===3 && a.campo==='origens_json' && /JSON de origens inválido/.test(a.motivo)));
    assert.equal(raw.tables.Arquivos.values[2][raw.tables.Arquivos.values[0].indexOf('origens_json')],texto);
  }
});

test('P-round2 m4 JSON originalmente inválido conserva aviso mesmo após redação do pedaço', t=>{
  for(const [texto,esperado] of [['{ "url": "https://usuario-sintetico:senha-sintetica@docs.google.com/x','{ "url": "[conteúdo suprimido]'],
    ['[conteúdo suprimido]','[conteúdo suprimido]']]) {
    const raw=capturaDetalhada();mudarCelula(raw,'Arquivos',2,'origens_json',texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.equal(view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').origens_json,esperado);
    assert.doesNotMatch(JSON.stringify(view),/usuario-sintetico|senha-sintetica/);
    assert.equal(view.avisos.filter(a=>a.aba==='Arquivos' && a.linha===3 && a.campo==='origens_json' && /JSON de origens inválido/.test(a.motivo)).length,1);
  }
});

test('P-round2 m4 recibos públicos usam a mesma triagem sem alterar o estado privado', t=>{
  const state={captura:null,historico:[{tentativaId:'tentativa-sintetica',concluidaEm:NOW,resultado:'falhou',
    motivoResumo:'Falhou a leitura de https://usuario-sintetico:senha-sintetica@docs.google.com/x'}],ultimaTentativa:null};
  state.ultimaTentativa=state.historico[0];
  const view=projetarVisao(state,NOW,mapaQuadroValido());
  assert.equal(view.historico[0].motivoResumo,'Falhou a leitura de [conteúdo suprimido]');
  assert.equal(view.ultimaTentativa.motivoResumo,'Falhou a leitura de [conteúdo suprimido]');
  assert.doesNotMatch(JSON.stringify(view),/usuario-sintetico|senha-sintetica/);
  assert.match(state.ultimaTentativa.motivoResumo,/usuario-sintetico/);
});

test('P-round2 m4 texto normal, e-mail e URL sem userinfo permanecem literais', t=>{
  for(const texto of ['Texto normal: revisar a versão 2; contato equipe@example.invalid.',
    'Referência "https://docs.google.com/document/d/exemplo-sintetico" e https://drive.google.com/x.',
    '{"url":"https:\\/\\/docs.google.com/x","texto":"Contato: equipe@example.invalid"}',
    'Estado: revisar; página 1; campo usuário e senha apenas como palavras, sem URL.']) {
    const raw=capturaDetalhada();mudarCelula(raw,'Produções',3,'legenda',texto);
    mudarCelula(raw,'Arquivos',2,'origens_json',JSON.stringify({origem:texto}));
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.equal(view.producoes[2].legenda,texto);
    assert.equal(view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').origens_json,JSON.stringify({origem:texto}));
    assert.ok(!view.avisos.some(a=>a.motivo==='conteúdo sensível suprimido'));
  }
});

for(const [nome,texto] of [
  ['URL seguida de perfil','Saiba mais em https://exemplo.invalid e siga @perfil'],
  ['URL pontuada seguida de e-mail','Visite https://site.invalid. Dúvidas: contato@site.invalid'],
  ['barra solta seguida de perfil','Texto // siga @perfil'],
  ['JSON com URL e contato',JSON.stringify({url:'https://exemplo.invalid',contato:'contato@site.invalid'})]
]) {
  test('P-round3 regressão: preserva '+nome, t=>{
    const raw=capturaDetalhada();mudarCelula(raw,'Produções',3,'legenda',texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.equal(view.producoes[2].legenda,texto);
    assert.ok(!view.avisos.some(a=>a.aba==='Produções' && a.linha===4 && a.campo==='legenda'));
    assert.equal(raw.tables.Produções.values[3][raw.tables.Produções.values[0].indexOf('legenda')],texto);
  });
}

test('P-round3 peça nova com URL credenciada conserva frase, whitespace e pontuação', t=>{
  const raw=capturaDetalhada();
  const texto='Leia\t(https://pessoa-ficticia:senha-ficticia@exemplo.invalid).\r\nDepois  siga @perfil.';
  adicionarRegistro(raw,'Produções',{producao_id:'peca-credencial-sintetica',marca_id:'ntv',semana_id:'semana-01',
    slot:'imagem_a',data_prevista:'2026-10-03',versao:1,titulo:'Nova peça sintética',legenda:texto});
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const p=view.producoes.find(p=>p.producao_id==='peca-credencial-sintetica');
  assert.equal(p.legenda,'Leia\t([conteúdo suprimido]).\r\nDepois  siga @perfil.');
  assert.doesNotMatch(JSON.stringify(view),/pessoa-ficticia|senha-ficticia/);
  const avisos=view.avisos.filter(a=>a.aba==='Produções' && a.campo==='legenda');
  assert.equal(avisos.length,1);assert.equal(avisos[0].linha,7);assert.equal(avisos[0].motivo,'conteúdo sensível suprimido');
  assert.deepEqual(p.detalhes.avisos.filter(a=>a.campo==='legenda'),avisos);
  assert.equal(raw.tables.Produções.values[6][raw.tables.Produções.values[0].indexOf('legenda')],texto);
});

test('P-round3 pontuação ao redor do pedaço e URLs/e-mails legítimos não são concatenados', t=>{
  for(const [texto,esperado] of [
    ['Veja "https://pessoa-ficticia:senha-ficticia@exemplo.invalid", @perfil.','Veja "[conteúdo suprimido]", @perfil.'],
    ['Veja https://pessoa-ficticia:senha-ficticia@exemplo.invalid!? contato@site.invalid','Veja [conteúdo suprimido]!? contato@site.invalid'],
    ['https://exemplo.invalid; depois https://pessoa-ficticia:senha-ficticia@exemplo.invalid: fim','https://exemplo.invalid; depois [conteúdo suprimido]: fim'],
    ['Antes “(https://pessoa-ficticia:senha-ficticia@exemplo.invalid)” depois','Antes “([conteúdo suprimido])” depois']
  ]) {
    const raw=capturaDetalhada();mudarCelula(raw,'Produções',3,'legenda',texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.equal(view.producoes[2].legenda,esperado);
    assert.doesNotMatch(JSON.stringify(view),/pessoa-ficticia|senha-ficticia/);
    assert.equal(view.avisos.filter(a=>a.aba==='Produções' && a.campo==='legenda').length,1);
  }
});

test('P-round3 JSON preserva bytes sem redação e conserva outros valores quando redigido', t=>{
  for(const [texto,esperado] of [
    [' { "url" : "https:\\/\\/exemplo.invalid", "contato":"contato@site.invalid", "numero":1e2 } ',
      ' { "url" : "https:\\/\\/exemplo.invalid", "contato":"contato@site.invalid", "numero":1e2 } '],
    [' { "url" : "https:\\/\\/pessoa-ficticia:senha-ficticia@exemplo.invalid", "contato":"contato@site.invalid", "numero":1e2 } ',
      ' { "url" : "[conteúdo suprimido]", "contato":"contato@site.invalid", "numero":1e2 } ']
  ]) {
    const raw=capturaDetalhada();mudarCelula(raw,'Arquivos',2,'origens_json',texto);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    const output=view.producoes[2].detalhes.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').origens_json;
    assert.equal(output,esperado);assert.equal(JSON.parse(output).contato,'contato@site.invalid');
    assert.equal(JSON.parse(output).numero,100);
    assert.doesNotMatch(JSON.stringify(view),/pessoa-ficticia|senha-ficticia/);
  }
});

test('P06 responsável registrado não vira correção; resolvidas/antigas ficam separadas', t=>{
  const raw=capturaDetalhada();mudarCelula(raw,'Produções',3,'responsavel_atual','');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()),d=view.producoes[2].detalhes;
  assert.equal(d.responsavelRegistrado,'A confirmar');
  assert.deepEqual(d.revisoes.vigentes.map(r=>r.revisao_id),['revisao-atual','revisao-incerta']);
  assert.deepEqual(d.revisoes.resolvidas.map(r=>r.revisao_id),['revisao-resolvida']);
  assert.deepEqual(d.revisoes.anteriores.map(r=>r.revisao_id),['revisao-antiga']);
  assert.equal(d.revisoes.vigentes[0].responsavel_correcao,'Correção sintética');
  assert.ok(d.avisos.some(a=>a.campo==='estado_tratamento'));
  assert.equal(d.publicacaoRegistrada,false);
  mudarCelula(raw,'Produções',3,'publicado_em','registro explícito sintético');
  assert.equal(projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[2].detalhes.publicacaoRegistrada,true);
});

test('P07 review: publicação inconsistente conserva registro e gera aviso localizado', t=>{
  for(const value of ['registro sintético','2026-10-02T11:00:00','2026-02-30T11:00:00Z','2026-10-02T12:06:00Z',42,
    '2026-10-02T12:05:00Z','2026-10-02T09:04:00-03:00','',null,'  ']) {
    const raw=capturaDetalhada();mudarCelula(raw,'Produções',3,'publicado_em',value);
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()),p=view.producoes[2];
    const preenchido=value!==null && value!=='' && value!=='  ',invalido=preenchido && !['2026-10-02T12:05:00Z','2026-10-02T09:04:00-03:00'].includes(value);
    assert.equal(p.detalhes.publicacaoRegistrada,preenchido);
    assert.equal(p.publicado_em,value ?? '');
    const aviso=p.detalhes.avisos.find(a=>a.campo==='publicado_em');
    assert.equal(Boolean(aviso),invalido,'registro '+JSON.stringify(value));
    if(invalido) {assert.equal(aviso.aba,'Produções');assert.equal(aviso.linha,4);assert.match(aviso.motivo,/Publicação.*inconsistente/);}
  }
});

test('P07 ponteiro quebrado, produção incompatível e revisão órfã não inventam relação', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Páginas',1,'arquivo_imagem_id','arquivo-inexistente');
  mudarCelula(raw,'Arquivos',2,'producao_id','peca-4');
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-orfa',producao_id:'peca-3',pagina_id:'pagina-inexistente',versao:2,estado_tratamento:'aberta'});
  const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[2].detalhes;
  assert.equal(d.paginas[1].arquivos[0],null);
  assert.equal(d.paginas[2].arquivos[0],null);
  assert.ok(d.avisos.some(a=>a.motivo.includes('Referência quebrada')));
  assert.ok(d.avisos.some(a=>a.motivo.includes('Escopo incompatível')));
  assert.ok(d.revisoes.ambiguas.some(r=>r.revisao_id==='revisao-orfa'));
  assert.ok(!d.revisoes.vigentes.some(r=>r.revisao_id==='revisao-orfa'));
});

test('P-final m-a cenas qualificam mídia faltante em um único aviso por unidade', t=>{
  const casos=[
    [0,'imagens ausentes; vídeo ausente'],[1,'imagem final ausente; vídeo ausente'],
    [2,'imagem inicial ausente; vídeo ausente'],[3,'vídeo ausente'],
    [4,'imagens ausentes'],[5,'imagem final ausente'],[6,'imagem inicial ausente'],[7,null]
  ];
  for(const [mask,esperado] of casos) {
    const raw=capturaDetalhada();
    for(const [bit,campo,id] of [[1,'arquivo_imagem_inicio_id','imagem-inicio-sintetica'],
      [2,'arquivo_imagem_final_id','imagem-final-sintetica'],[4,'arquivo_video_id','video-sintetico']]) {
      adicionarRegistro(raw,'Arquivos',{arquivo_id:id,producao_id:'peca-4',cena_id:'cena-02',versao:1,tipo:'mídia sintética'});
      mudarCelula(raw,'Cenas',2,campo,(mask & bit)?id:'');
    }
    const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[3].detalhes;
    const cena=d.cenas.find(c=>c.cena_id==='cena-02');
    assert.equal(cena.avisoMidia,esperado,'combinação '+mask);
    assert.equal(cena.arquivos.length,3);
    assert.deepEqual(cena.arquivos.map(a=>a?.arquivo_id ?? null),[
      mask & 1?'imagem-inicio-sintetica':null,mask & 2?'imagem-final-sintetica':null,mask & 4?'video-sintetico':null]);
    const avisos=d.avisos.filter(a=>a.aba==='Cenas' && a.linha===3 && a.campo.startsWith('arquivo_'));
    assert.equal(avisos.length,esperado===null?0:1,'combinação '+mask);
    if(esperado!==null) assert.ok(avisos[0].motivo.includes(esperado));
  }
});

test('P-final m-a agregação conserva primeiro ponteiro e causas de referência/escopo', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Cenas',2,'arquivo_imagem_inicio_id','arquivo-ausente-sintetico');
  mudarCelula(raw,'Cenas',2,'arquivo_imagem_final_id','arquivo-clipe');
  mudarCelula(raw,'Arquivos',3,'cena_id','cena-01');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()),d=view.producoes[3].detalhes;
  const cena=d.cenas.find(c=>c.cena_id==='cena-02');
  assert.deepEqual(cena.arquivos,[null,null,null]);
  assert.equal(cena.arquivo_imagem_inicio_id,'arquivo-ausente-sintetico');
  assert.equal(cena.arquivo_video_id,'arquivo-clipe');
  assert.equal(cena.avisoMidia,'imagens ausentes; vídeo ausente');
  const avisos=d.avisos.filter(a=>a.aba==='Cenas' && a.linha===3 && a.campo.startsWith('arquivo_'));
  assert.equal(avisos.length,1);
  assert.equal(avisos[0].campo,'arquivo_imagem_inicio_id');
  assert.match(avisos[0].motivo,/Referência quebrada/);
  assert.match(avisos[0].motivo,/Escopo incompatível/);
  assert.equal(view.avisos.filter(a=>a.aba==='Cenas' && a.linha===3 && a.campo.startsWith('arquivo_')).length,1);
});

test('P-final m-a aviso agregado de mídia não absorve índice ou tempo inválido', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Cenas',2,'indice',-1);mudarCelula(raw,'Cenas',2,'inicio_segundos',-1);
  const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[3].detalhes;
  const avisos=d.avisos.filter(a=>a.aba==='Cenas' && a.linha===3);
  assert.deepEqual(avisos.map(a=>a.campo),['indice','inicio_segundos','arquivo_imagem_inicio_id']);
  assert.match(avisos[0].motivo,/Inteiro positivo inválido/);
  assert.match(avisos[1].motivo,/Tempo inválido/);
  assert.equal(d.cenas.find(c=>c.cena_id==='cena-02').avisoMidia,'imagens ausentes');
});

test('P-final m-b mesma produção/versão não permite arquivo ligado a outra página ou cena', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Arquivos',2,'pagina_id','pagina-01');
  mudarCelula(raw,'Arquivos',3,'cena_id','cena-01');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const carousel=view.producoes[2].detalhes,reels=view.producoes[3].detalhes;
  assert.equal(carousel.paginas.find(p=>p.pagina_id==='pagina-02').arquivos[0],null);
  assert.equal(reels.cenas.find(c=>c.cena_id==='cena-02').arquivos[2],null);
  assert.ok(carousel.avisos.some(a=>a.aba==='Páginas' && a.linha===3 && a.campo==='arquivo_imagem_id' && /Escopo/.test(a.motivo)));
  assert.ok(reels.avisos.some(a=>a.aba==='Cenas' && a.linha===3 && /Escopo/.test(a.motivo)));
  assert.equal(carousel.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').pagina_id,'pagina-01');
  assert.equal(reels.arquivos.find(a=>a.arquivo_id==='arquivo-clipe').cena_id,'cena-01');
});

test('P-final m-b ponteiro semanal recusa arquivo de outra semana sem escolher substituto', t=>{
  const raw=capturaDetalhada();
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-02',marca_id:'ntv',inicio_semana:'2026-10-05',tema:'Segunda semana sintética'});
  mudarCelula(raw,'Arquivos',4,'semana_id','semana-02');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  for(const p of view.producoes) assert.equal(p.detalhes.documentosSemana[0].arquivo,null);
  const avisos=view.avisos.filter(a=>a.aba==='Semanas' && a.campo==='plano_json_arquivo_id');
  assert.equal(avisos.length,1);assert.equal(avisos[0].linha,2);assert.match(avisos[0].motivo,/Escopo/);
});

test('P-final m-b versões inválidas em revisões/arquivos conservam original com aviso', t=>{
  for(const valor of [-1,0,'2',1.5]) {
    const raw=capturaDetalhada();
    mudarCelula(raw,'Arquivos',2,'versao',valor);mudarCelula(raw,'Revisoes',2,'versao',valor);
    const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[2].detalhes;
    assert.equal(d.arquivos.find(a=>a.arquivo_id==='arquivo-pagina').versao,valor);
    assert.equal(d.revisoes.ambiguas.find(r=>r.revisao_id==='revisao-atual').versao,valor);
    assert.equal(d.paginas.find(p=>p.pagina_id==='pagina-02').arquivos[0].arquivo_id,'arquivo-pagina');
    assert.equal(d.paginas.find(p=>p.pagina_id==='pagina-02').arquivos[0].versao,valor);
    assert.ok(!d.avisos.some(a=>a.aba==='Páginas' && a.campo==='arquivo_imagem_id' && /Escopo/.test(a.motivo)));
    for(const [aba,linha] of [['Arquivos',3],['Revisoes',3]]) {
      assert.ok(d.avisos.some(a=>a.aba===aba && a.linha===linha && a.campo==='versao' && /Inteiro positivo inválido/.test(a.motivo)));
    }
  }
});

test('P-final m-c revisão ambígua aponta o primeiro vínculo que falhou, não uma versão válida', t=>{
  for(const [pagina,cena,arquivo,versao,campo] of [
    ['pagina-inexistente','cena-inexistente','arquivo-inexistente',2,'pagina_id'],
    ['pagina-02','cena-02','arquivo-inexistente',2,'cena_id'],
    ['pagina-02','','arquivo-clipe',2,'arquivo_id'],
    ['pagina-02','','arquivo-pagina','2','versao']
  ]) {
    const raw=capturaDetalhada();
    adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-vinculo-sintetico',producao_id:'peca-3',pagina_id:pagina,
      cena_id:cena,arquivo_id:arquivo,versao,estado_tratamento:'aberta'});
    const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[2].detalhes;
    assert.ok(d.revisoes.ambiguas.some(r=>r.revisao_id==='revisao-vinculo-sintetico'));
    const aviso=d.avisos.find(a=>a.aba==='Revisoes' && a.linha===7 && /sem vínculo inequívoco/.test(a.motivo));
    assert.equal(aviso.campo,campo);
    assert.doesNotMatch(aviso.motivo,/inexistente|arquivo-clipe/);
  }
});

test('P07 empate/origens incompatíveis e JSON inválido são avisos, não escolha de mídia', t=>{
  const raw=capturaDetalhada();
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'editor-a',producao_id:'peca-4',papel:'editor',versao:1,origens_json:'{"origem":"a-sintética"}'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'editor-b',producao_id:'peca-4',papel:'editor',versao:1,origens_json:'{"origem":"b-sintética"}'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-json-invalido',producao_id:'peca-4',versao:1,origens_json:'{'});
  const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[3].detalhes;
  assert.ok(d.avisos.some(a=>/empatados.*origens/i.test(a.motivo)));
  assert.ok(d.avisos.some(a=>a.campo==='origens_json'));
  assert.equal(d.arquivos.find(a=>a.arquivo_id==='arquivo-json-invalido').nomeApresentacao,'Arquivo registrado');
  assert.equal(d.arquivos.filter(a=>a.papel==='editor').length,2);
});

test('P07 inteiros/tempos inválidos e vazios conservam originais sem virar zero', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Páginas',1,'indice',-1);mudarCelula(raw,'Páginas',1,'versao','');
  mudarCelula(raw,'Cenas',1,'inicio_segundos',-1);mudarCelula(raw,'Cenas',1,'duracao_segundos','');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const page=view.producoes[2].detalhes.paginas.find(p=>p.pagina_id==='pagina-01');
  assert.equal(page.versao,'');assert.equal(page.vigente,false);assert.equal(page.indice,-1);
  const scene=view.producoes[3].detalhes.cenas.find(c=>c.cena_id==='cena-01');
  assert.equal(scene.inicio_segundos,-1);assert.equal(scene.duracao_segundos,'');
  assert.ok(view.avisos.some(a=>a.campo==='indice'));
  assert.ok(view.avisos.some(a=>a.campo==='inicio_segundos'));
  assert.ok(!view.avisos.some(a=>a.campo==='duracao_segundos'));
});

test('P05 Sem data separa semanas e conserva documentos ausentes como registro a confirmar', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Produções',3,'data_prevista','');mudarCelula(raw,'Produções',4,'data_prevista','');
  mudarCelula(raw,'Produções',4,'semana_id','semana-inexistente');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(view.dias.filter(d=>d.data===null).map(d=>[d.semanaId,d.ids]),[['semana-01',['peca-3']],[null,['peca-4']]]);
  assert.deepEqual(view.producoes[3].detalhes.documentosSemana,[{papel:'Plano',arquivo:null},{papel:'Redação',arquivo:null},{papel:'Visual',arquivo:null}]);
});

test('P-review m1 documentos/avisos da mesma semana não se multiplicam pelas peças', t=>{
  const raw=capturaDetalhada();mudarCelula(raw,'Semanas',1,'plano_json_arquivo_id','documento-ausente');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const globais=view.avisos.filter(a=>a.aba==='Semanas' && a.campo==='plano_json_arquivo_id');
  assert.equal(globais.length,1);
  for(const p of view.producoes) {
    assert.deepEqual(p.detalhes.documentosSemana.map(d=>d.papel),['Plano','Redação','Visual']);
    assert.equal(p.detalhes.documentosSemana[0].arquivo,null);
    assert.deepEqual(p.detalhes.avisos.filter(a=>a.aba==='Semanas'),globais);
  }
});

test('P07 avisos preservam linha física depois de vazia e outra marca', t=>{
  const raw=capturaDetalhada(),table=raw.tables.Produções;
  const foreign=table.values.pop();table.values.splice(1,0,[],foreign);
  const index=table.values.findIndex(r=>r[0]==='peca-1');
  mudarCelula(raw,'Produções',index,'data_prevista','sem-data-sintética');
  mudarCelula(raw,'Produções',index,'legenda','sk-ant-'+'x'.repeat(30));
  const view=projetarVisao(estado(recalcularHashes(raw),t),NOW,mapaQuadroValido());
  assert.equal(view.avisos.find(a=>a.campo==='data_prevista').linha,index+1);
  assert.equal(view.avisos.find(a=>a.campo==='legenda').linha,index+1);
});

test('P04 frescor usa o fim da captura, e não o horário da consulta', t => {
  const input=estado(capturaValida(),t);
  for (const [now,expected,texto,cor] of [[NOW,'atualizada_hoje','Atualizado hoje, 09:05','verde'],
    ['2026-11-15T14:00:00Z','anterior_hoje','Dados de 02/10','âmbar']]) {
    const view=projetarVisao(input,now,mapaQuadroValido());
    assert.equal(view.estado,expected);
    assert.deepEqual(view.selo,{texto,cor,destino:'planilha'});
    assert.equal(view.captura.completedAt,'2026-10-02T12:05:00.000Z');
    assert.equal(view.producoes[0].status,'em_planejamento');
  }
});
test('P04 virada do dia em São Paulo muda só frescor, ignorando data das linhas', t => {
  const raw=capturaValida();
  redefinirHorario(raw,'2026-10-03T02:55:00Z','2026-10-03T02:59:30Z');
  mudarCelula(raw,'Produções',1,'data_prevista','2099-12-31');
  const input=estado(raw,t);
  const before=projetarVisao(input,'2026-10-03T02:59:59Z',mapaQuadroValido());
  assert.equal(before.estado,'atualizada_hoje');
  assert.deepEqual(before.selo,{texto:'Atualizado hoje, 23:59',cor:'verde',destino:'planilha'});
  const after=projetarVisao(input,'2026-10-03T03:00:00Z',mapaQuadroValido());
  assert.equal(after.estado,'anterior_hoje');
  assert.deepEqual(after.selo,{texto:'Dados de 02/10',cor:'âmbar',destino:'planilha'});
  assert.deepEqual(after.producoes,before.producoes);
});
test('P04 falha ativa precede frescor de captura de hoje ou antiga', t => {
  for (const [id,end] of [['hoje','2026-10-04T11:05:00Z'],['antiga','2026-10-02T12:05:00Z']]) {
    const dir=temporario(t),raw=capturaValida();raw.capturaId=id;raw.completedAt=end;
    promoverCaptura(raw,dir);
    const invalid=capturaValida();invalid.tables.Cenas.complete=false;
    promoverCaptura(invalid,dir);
    const input=lerEstado(dir),before=JSON.stringify(input);
    const view=projetarVisao(input,'2026-10-04T12:00:00Z',mapaQuadroValido());
    assert.equal(view.estado,'falha_atualizacao');
    assert.deepEqual(view.selo,{texto:'Atualização falhou',cor:'vermelho',destino:'planilha'});
    assert.equal(view.captura.completedAt,end);
    assert.equal(view.producoes.length,4);
    assert.equal(JSON.stringify(input),before);
  }
});
test('P-review I1 falha posterior avisa sem apagar captura; nova completa encerra aviso', t => {
  const dir=temporario(t), raw=capturaValida();
  promoverCaptura(raw,dir);
  const invalid=capturaValida(); invalid.tables.Cenas.complete=false;
  promoverCaptura(invalid,dir);
  promoverCaptura(raw,dir); // Repetição não encerra a falha posterior.
  const view=projetarVisao(lerEstado(dir),NOW,mapaQuadroValido());
  assert.equal(view.captura.capturaId,raw.capturaId);
  assert.ok(view.avisos.some(a=>a.motivo==='Última importação falhou; captura anterior preservada'));
  const newer=capturaValida(); newer.capturaId='captura-sintetica-02';
  redefinirHorario(newer,'2026-10-02T12:01:00Z','2026-10-02T12:06:00Z');
  promoverCaptura(newer,dir);
  const next=projetarVisao(lerEstado(dir),NOW,mapaQuadroValido());
  assert.ok(!next.avisos.some(a=>a.motivo.includes('Última importação falhou')));
});

test('P-base conserva NTV uma vez, exclui outra marca sem filtro de elegibilidade', t => {
  const raw=capturaValida();
  mudarCelula(raw,'Produções',1,'status','concluida');
  mudarCelula(raw,'Produções',2,'estado_liberacao','bloqueado');
  const result=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(result.producoes.map(p=>p.producao_id).sort(),['peca-1','peca-2','peca-3','peca-4']);
  assert.equal(new Set(result.producoes.map(p=>p.producao_id)).size,4);
  assert.equal(result.producoes[1].slot,'imagem_b');
  assert.equal(result.producoes[1].estado_liberacao,'bloqueado');
});
test('P-base envelope público não expõe metadados, hashes, extras ou mapa bruto', t => {
  const result=projetarVisao(estado(capturaValida(),t),NOW,mapaQuadroValido());
  assert.deepEqual(Object.keys(result).sort(),envelope);
  const bytes=JSON.stringify(result);
  for (const sentinel of ['sentinela-nao-publicar','spreadsheetId','metadataBefore','secondReadSha256','__extra_privado','liberacaoPronta','google-drive-connector']) {
    assert.ok(!bytes.includes(sentinel),sentinel);
  }
  assert.deepEqual(Object.keys(result.captura).sort(),['capturaId','completedAt','contagens','periodo'].sort());
});
test('P-base sem captura não cria demonstração e conserva Histórico permitido', t => {
  const dir=temporario(t), raw=capturaValida();
  raw.tables.Cenas.complete=false;
  promoverCaptura(raw,dir);
  const result=projetarVisao(lerEstado(dir,NOW),NOW,mapaQuadroValido());
  assert.equal(result.estado,'sem_captura');
  assert.deepEqual(result.selo,{texto:'Sem dados',cor:'cinza',destino:'planilha'});
  assert.equal(result.captura,null);
  assert.deepEqual(result.producoes,[]);
  assert.deepEqual(result.semanas,[]);
  assert.equal(result.historico.length,1);
  assert.deepEqual(Object.keys(result.historico[0]).sort(),['tentativaId','concluidaEm','resultado','motivoResumo'].sort());
  assert.deepEqual(Object.keys(result.ultimaTentativa).sort(),Object.keys(result.historico[0]).sort());
});
test('P-base saída é independente do estado privado, sem alterar entrada', t => {
  const input=estado(capturaValida(),t), before=JSON.stringify(input);
  const result=projetarVisao(input,NOW,mapaQuadroValido());
  result.producoes[0].titulo='mudança somente na projeção';
  assert.equal(JSON.stringify(input),before);
});
test('P-base célula mínima com token/caminho indevido é suprimida com aviso', t => {
  const raw=capturaValida(), token='sk-ant-'+'a'.repeat(30), localPath='C:'+String.fromCharCode(92)+'Users'+String.fromCharCode(92)+'exemplo';
  mudarCelula(raw,'Produções',1,'legenda',token);
  mudarCelula(raw,'Semanas',1,'tema',localPath);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.ok(!JSON.stringify(view).includes(token));
  assert.ok(!JSON.stringify(view).includes(localPath));
  assert.equal(view.producoes[0].legenda,'[conteúdo suprimido]');
  assert.ok(view.avisos.some(a=>a.campo==='legenda'));
  assert.ok(view.avisos.some(a=>a.campo==='tema'));
});
test('P-base URL legítima permanece texto e não é confundida com drive Windows', t => {
  const urls=['https://docs.google.com/document/d/exemplo-sintetico','https://drive.google.com/file/d/exemplo-sintetico','http://exemplo.invalid/referencia'];
  for (const url of urls) {
    const raw=capturaValida();
    mudarCelula(raw,'Produções',1,'titulo','Referência '+url);
    mudarCelula(raw,'Produções',1,'url_video_final',url);
    mudarCelula(raw,'Produções',1,'legenda',JSON.stringify({url}));
    const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
    assert.equal(view.producoes[0].titulo,'Referência '+url);
    assert.equal(view.producoes[0].url_video_final,url);
    assert.equal(view.producoes[0].legenda,JSON.stringify({url}));
    assert.ok(!view.avisos.some(a=>a.motivo==='conteúdo sensível suprimido'));
  }
});
test('P01 preserva quatro peças históricas e calendário civil entre meses', t => {
  const view=projetarVisao(estado(capturaValida(),t),NOW,mapaQuadroValido());
  assert.equal(view.producoes.length,4);
  assert.deepEqual(view.dias.map(d=>d.data),['2026-09-30','2026-10-01','2026-10-02']);
  assert.deepEqual(view.dias.find(d=>d.data==='2026-10-02').ids,['peca-3','peca-4']);
  assert.deepEqual(view.semanas[0].periodo,{inicio:'2026-09-28',fim:'2026-10-04'});
  assert.deepEqual(view.captura.periodo,{inicio:'2026-09-28',fim:'2026-10-04'});
  assert.deepEqual(view.semanas[0].ids,['peca-1','peca-2','peca-3','peca-4']);
});
test('P02 formatos vêm do slot, sem mudar tipo original; desconhecido permanece Outro', t => {
  const raw=capturaValida(); mudarCelula(raw,'Produções',4,'slot','novo-slot-sintético');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(view.producoes.map(p=>p.formato),['Imagem','Imagem','Carrossel','Outro']);
  assert.equal(view.producoes[1].tipo_producao,'tipo-original-imagem_b');
});
test('P02 datas inválidas/seriais/vazias ficam Sem data, independentemente do mês', t => {
  const raw=capturaValida();
  for (const [i,value] of [[1,'2026-02-30'],[2,46700],[3,''],[4,'2026-10-02T00:00:00Z']]) mudarCelula(raw,'Produções',i,'data_prevista',value);
  const state=estado(raw,t);
  for (const now of [NOW,'2026-11-15T14:00:00Z']) {
    const view=projetarVisao(state,now,mapaQuadroValido());
    assert.equal(view.producoes.filter(p=>p.dataCivil===null).length,4);
    assert.equal(view.dias.length,1);
    assert.equal(view.dias[0].data,null);
    assert.deepEqual(view.dias[0].ids,['peca-1','peca-2','peca-3','peca-4']);
    assert.ok(view.avisos.some(a=>a.campo==='data_prevista'));
  }
});
test('P03 peça órfã continua em Semana não identificada, sem período inventado', t => {
  const raw=capturaValida(); mudarCelula(raw,'Produções',2,'semana_id','semana-inexistente');
  mudarCelula(raw,'Produções',2,'data_prevista','');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  const orphan=view.semanas.find(s=>s.semana_id===null);
  assert.equal(orphan.tema,'Semana não identificada');
  assert.deepEqual(orphan.ids,['peca-2']);
  assert.deepEqual(orphan.periodo,{inicio:null,fim:null});
  assert.equal(view.producoes.length,4);
});
test('P03 ordem por ID é ordinal e não segue a ordem física das linhas', t => {
  const raw=capturaValida();
  mudarCelula(raw,'Produções',3,'producao_id','z-peca');
  mudarCelula(raw,'Produções',4,'producao_id','A-peca');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(view.dias.find(d=>d.data==='2026-10-02').ids,['A-peca','z-peca']);
});
test('P03 início semanal inválido deixa cobertura null e objetivo mensal indefinido', t => {
  const raw=capturaValida(); mudarCelula(raw,'Semanas',1,'inicio_semana','data-inválida');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.deepEqual(view.captura.periodo,{inicio:null,fim:null});
  assert.deepEqual(view.semanas[0].periodo,{inicio:null,fim:null});
  assert.equal(view.semanas[0].objetivoMensal,'Ainda não definido');
  assert.equal(view.semanas[0].objetivo,'Objetivo semanal sintético');
  assert.ok(view.avisos.some(a=>a.campo==='inicio_semana'));
});

test('P11 Planilha seleciona seis tabelas e os 66 mínimos na ordem canônica, excluindo vazios e outra marca', t=>{
  const view=projetarVisao(estado(capturaPlanilha(),t),NOW,mapaQuadroValido());
  assert.equal(view.planilha.length,6);
  assert.deepEqual(view.planilha.map(tab=>[tab.nome,tab.cabecalhos.length,tab.quantidadeLinhas]),[
    ['Semanas',8,2],['Produções',17,5],['Páginas',8,3],['Cenas',11,2],['Arquivos',12,5],['Revisoes',10,5]
  ]);
  assert.equal(view.planilha.reduce((n,tab)=>n+tab.cabecalhos.length,0),66);
  for(const tab of view.planilha) {
    assert.deepEqual(Object.keys(tab).sort(),['nome','cabecalhos','quantidadeLinhas','linhas'].sort());
    assert.deepEqual(tab.cabecalhos,campos[tab.nome]);
    assert.equal(tab.quantidadeLinhas,tab.linhas.length);
    for(const linha of tab.linhas) assert.deepEqual(Object.keys(linha),campos[tab.nome]);
  }
  assert.deepEqual(view.planilha.map(tab=>tab.linhas.map(r=>r[tab.cabecalhos[0]])),[
    ['semana-01','semana-02'],['peca-1','peca-2','peca-3','peca-4','peca-6'],
    ['pagina-01','pagina-02','pagina-antiga'],['cena-01','cena-02'],
    ['arquivo-01','arquivo-pagina','arquivo-clipe','arquivo-plano','arquivo-semana-02'],
    ['revisao-01','revisao-atual','revisao-resolvida','revisao-antiga','revisao-incerta']
  ]);
});

test('P11 Planilha conserva valores mínimos como dados, sem copiar os enriquecimentos da visão', t=>{
  const view=projetarVisao(estado(capturaPlanilha(),t),NOW,mapaQuadroValido());
  assert.equal(view.planilha.length,6);
  const [semanas,producoes,paginas,cenas,arquivos,revisoes]=view.planilha;
  assert.equal(semanas.linhas[0].objetivo,0);
  assert.equal(producoes.linhas[0].legenda,'  Texto de exemplo  ');
  assert.equal(producoes.linhas[1].etapa_producao,null);
  assert.equal(producoes.linhas[1].legenda,''); // normalização preexistente dos demais null
  assert.equal(producoes.linhas[4].url_video_final,'');
  assert.equal(paginas.linhas[0].corpo,false);
  assert.equal(cenas.linhas[0].inicio_segundos,0);
  assert.equal(cenas.linhas[0].texto_tela,'   ');
  assert.equal(arquivos.linhas[0].id_drive,'drive-ficticio-local');
  assert.equal(arquivos.linhas[0].sha256,'a'.repeat(64));
  assert.equal(arquivos.linhas[0].origens_json,'{"arquivo_id":"origem-sintetica","texto":"<script>conteúdo como dado</script>"}');
  assert.equal(revisoes.linhas[1].revisao_id,'revisao-atual');
  for(const linha of producoes.linhas) {
    for(const campo of ['dataCivil','semanaId','formato','detalhes','quadro']) assert.equal(Object.hasOwn(linha,campo),false);
  }
  for(const campo of ['periodo','objetivoMensal','ids']) assert.equal(Object.hasOwn(semanas.linhas[0],campo),false);
  assert.deepEqual(view.captura.periodo,{inicio:'2026-09-28',fim:'2026-10-11'});
});

test('P12 Planilha redige mínimos sensíveis mantendo a coluna e um aviso localizado por célula', t=>{
  const raw=capturaPlanilha(),user='pessoa-planilha-ficticia',password='senha-planilha-ficticia';
  const url='https://'+user+':'+password+'@docs.google.com/x';
  const alteracoes=[
    ['Semanas','tema','sk-ant-'+'A'.repeat(24),'[conteúdo suprimido]'],
    ['Produções','legenda','Antes '+url+' depois','Antes [conteúdo suprimido] depois'],
    ['Produções','url_video_final',url,'[conteúdo suprimido]'],
    ['Páginas','corpo','/home/usuario-ficticio/fonte','[conteúdo suprimido]'],
    ['Cenas','texto','C:/usuario-ficticio/dados','[conteúdo suprimido]'],
    ['Arquivos','origens_json',JSON.stringify({url,seguro:'texto de registro'}),JSON.stringify({url:'[conteúdo suprimido]',seguro:'texto de registro'})],
    ['Revisoes','motivo','ghp_'+'B'.repeat(24),'[conteúdo suprimido]']
  ];
  for(const [nome,campo,valor] of alteracoes) mudarCelula(raw,nome,2,campo,valor);
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido());
  assert.equal(view.planilha.length,6);
  for(const [nome,campo,,esperado] of alteracoes) {
    const tab=view.planilha.find(tab=>tab.nome===nome);
    assert.ok(tab.cabecalhos.includes(campo));
    assert.equal(tab.linhas[0][campo],esperado);
    assert.deepEqual(view.avisos.filter(a=>a.aba===nome && a.linha===3 && a.campo===campo && a.motivo==='conteúdo sensível suprimido'),[
      {aba:nome,linha:3,campo,motivo:'conteúdo sensível suprimido'}
    ]);
  }
  assert.doesNotMatch(JSON.stringify(view),/pessoa-planilha-ficticia|senha-planilha-ficticia|usuario-ficticio|sk-ant-A{24}|ghp_B{24}|sentinela-nao-publicar/);
  assert.doesNotMatch(JSON.stringify(view.planilha),/metadataBefore|spreadsheetId|firstReadSha256|secondReadSha256|__extra_privado/);
});

test('P12 sem captura mantém Planilha vazia e orientação estruturada, sem inventar seis abas com zero', ()=>{
  const view=projetarVisao({captura:null,historico:[],ultimaTentativa:null},NOW,mapaQuadroValido());
  assert.deepEqual(view.planilha,[]);
  assert.equal(view.captura,null);
  assert.equal(view.estado,'sem_captura');
  assert.deepEqual(view.selo,{texto:'Sem dados',cor:'cinza',destino:'planilha'});
  assert.equal(view.fonte,'Captura pela Central');
});

test('P13 escala conserva 500 peças sintéticas nas cinco histórias e nos 66 mínimos', t=>{
  const raw=capturaEscala(),dir=temporario(t),inicio=performance.now();
  const resultado=promoverCaptura(raw,dir);
  assert.equal(resultado.resultado,'completa');
  const importacaoMs=performance.now()-inicio,projecaoInicio=performance.now();
  const view=projetarVisao(lerEstado(dir,NOW),NOW,mapaTemp(t,mapaQuadroSintetico()));
  const projecaoMs=performance.now()-projecaoInicio;
  const ids=['peca-1','peca-2','peca-3','peca-4',...Array.from({length:496},(_,i)=>'escala-'+String(i+5).padStart(3,'0'))];
  assert.deepEqual(view.producoes.map(p=>p.producao_id).sort(),ids.slice().sort());
  const semData=view.producoes.filter(p=>p.dataCivil===null).map(p=>p.producao_id);
  assert.equal(semData.length,46);
  assert.equal(view.producoes.filter(p=>p.semanaId===null).length,14);
  assert.deepEqual(view.dias.flatMap(d=>d.ids).sort(),ids.slice().sort());
  assert.deepEqual(view.semanas.flatMap(s=>s.ids).sort(),ids.slice().sort());
  assert.deepEqual(view.quadro.semanas.flatMap(s=>s.colunas.flatMap(c=>c.ids)).sort(),ids.slice().sort());
  for(const slot of ['imagem_a','imagem_b','carrossel','reels']) {
    assert.equal(view.producoes.filter(p=>p.slot===slot).length,125);
  }
  const totalColunas=view.quadro.colunas.map(c=>[c.nome,view.producoes.filter(p=>p.quadro.coluna===c.nome).length]);
  assert.deepEqual(totalColunas,[['Planejamento',63],['Redação',63],['Visual',63],['Mídia',63],
    ['Revisão',62],['Pronta',62],['Publicada',62],['Outras',62]]);
  const tabs=view.planilha;
  assert.equal(tabs.reduce((n,tab)=>n+tab.cabecalhos.length,0),66);
  assert.equal(tabs.find(tab=>tab.nome==='Produções').quantidadeLinhas,500);
  for(const tab of tabs) {
    assert.deepEqual(tab.cabecalhos,campos[tab.nome]);
    for(const row of tab.linhas) assert.deepEqual(Object.keys(row),campos[tab.nome]);
  }
  const dia=view.dias.find(d=>d.data==='2026-10-04');
  assert.ok(dia.ids.includes('peca-4'));
  assert.ok(dia.ids.some(id=>view.producoes.find(p=>p.producao_id===id).formato==='Carrossel'));
  const paginas=view.producoes.find(p=>p.producao_id==='peca-3').detalhes.paginas;
  assert.equal(paginas.filter(p=>p.versao===2).length,2);
  assert.equal(paginas.filter(p=>p.versao===1).length,1);
  assert.equal(view.producoes.find(p=>p.producao_id==='peca-4').detalhes.cenas.length,2);
  assert.doesNotMatch(JSON.stringify(view),/spreadsheetId|metadataBefore|firstReadSha256|secondReadSha256|__extra_privado/);
  assert.equal(view.historico.length,1);
  t.diagnostic(JSON.stringify({cenario:'500 sintéticas',importacaoMs,projecaoMs,pecas:500,semData:46,avisos:view.avisos.length}));
});

for(const versao of ['inválida','',null,0]) test('P-fase8 versão vigente '+JSON.stringify(versao)+' não afirma mídia ausente',t=>{
  const raw=capturaValida();mudarCelula(raw,'Produções',1,'versao',versao);
  mudarCelula(raw,'Produções',1,'etapa_producao','imagens_em_producao');
  const view=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()),p=view.producoes.find(p=>p.producao_id==='peca-1');
  assert.equal(p.quadro.coluna,'Mídia');
  assert.deepEqual(p.quadro.pendencias.filter(r=>r.tipo==='midia'),[]);
  assert.equal(p.detalhes.arquivos.length,1);
  assert.ok(p.detalhes.avisos.some(a=>a.campo==='versao'));
});

test('P-fase8 identidades sensíveis distintas não se fundem após a triagem',t=>{
  const raw=capturaValida(),ids=['sk-ant-'+'A'.repeat(30),'sk-ant-'+'B'.repeat(30)];
  for(const table of Object.values(raw.tables)) {
    table.values=table.values.map(row=>row.map(cell=>cell==='peca-1'?ids[0]:cell==='peca-2'?ids[1]:cell));
  }
  // Projeção pura protege também capturas antigas: a importação agora as recusa.
  const local={...estado(capturaValida(),t),captura:validarCaptura(recalcularHashes(raw))};
  assert.equal(local.captura.producoes.length,5);
  assert.throws(()=>projetarVisao(local,NOW,mapaQuadroValido()),{message:'Identidade ou vínculo sensível não pode ser projetado'});
});

test('P-fase8 ponteiro interno sensível não cria uma relação a partir do marcador',t=>{
  const raw=capturaValida();mudarCelula(raw,'Páginas',1,'arquivo_imagem_id','ghp_'+'C'.repeat(30));
  const local={...estado(capturaValida(),t),captura:validarCaptura(raw)};
  assert.throws(()=>projetarVisao(local,NOW,mapaQuadroValido()),{message:'Identidade ou vínculo sensível não pode ser projetado'});
});
