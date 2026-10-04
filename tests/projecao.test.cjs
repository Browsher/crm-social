const {test}=require('node:test');
const assert=require('node:assert/strict');
const {capturaValida,mapaQuadroValido,temporario,carregarModulo,mudarCelula,redefinirHorario}=require('./fixtures.cjs');
const {promoverCaptura,lerEstado}=require('../src/snapshot.cjs');
const {projetarVisao}=carregarModulo('src/projecao.cjs',['projetarVisao']);
const {capturaDetalhada,adicionarRegistro,recalcularHashes}=require('./fixtures.cjs');
const NOW='2026-10-02T14:00:00Z';
const envelope=['schemaVersion','estado','selo','fonte','captura','ultimaTentativa','semanas','producoes','dias','quadro','planilha','historico','avisos'].sort();
function estado(raw,t) { const dir=temporario(t); promoverCaptura(raw,dir); return lerEstado(dir,NOW); }

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

test('P07 ponteiro quebrado, escopo/versão incompatível e revisão órfã não inventam relação', t=>{
  const raw=capturaDetalhada();
  mudarCelula(raw,'Páginas',1,'arquivo_imagem_id','arquivo-inexistente');
  mudarCelula(raw,'Arquivos',2,'versao',1);
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-orfa',producao_id:'peca-3',pagina_id:'pagina-inexistente',versao:2,estado_tratamento:'aberta'});
  const d=projetarVisao(estado(raw,t),NOW,mapaQuadroValido()).producoes[2].detalhes;
  assert.equal(d.paginas[1].arquivos[0],null);
  assert.equal(d.paginas[2].arquivos[0],null);
  assert.ok(d.avisos.some(a=>a.motivo.includes('Referência quebrada')));
  assert.ok(d.avisos.some(a=>a.motivo.includes('Escopo ou versão')));
  assert.ok(d.revisoes.ambiguas.some(r=>r.revisao_id==='revisao-orfa'));
  assert.ok(!d.revisoes.vigentes.some(r=>r.revisao_id==='revisao-orfa'));
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
  assert.equal(view.producoes[3].detalhes.documentosSemana.length,0);
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
