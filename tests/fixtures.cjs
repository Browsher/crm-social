const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');

const campos = {
  Semanas: 'semana_id marca_id inicio_semana tema objetivo plano_json_arquivo_id redacao_json_arquivo_id visual_json_arquivo_id'.split(' '),
  Produções: 'producao_id marca_id semana_id slot tipo_producao data_prevista status etapa_producao estado_revisao estado_liberacao responsavel_atual versao titulo legenda publicado_em url_video_final id_drive_video_final'.split(' '),
  Páginas: 'pagina_id producao_id versao indice funcao titulo corpo arquivo_imagem_id'.split(' '),
  Cenas: 'cena_id producao_id versao indice texto texto_tela inicio_segundos duracao_segundos arquivo_imagem_inicio_id arquivo_imagem_final_id arquivo_video_id'.split(' '),
  Arquivos: 'arquivo_id producao_id semana_id cena_id pagina_id tipo papel versao id_drive url origens_json sha256'.split(' '),
  Revisoes: 'revisao_id producao_id cena_id pagina_id arquivo_id versao decisao motivo responsavel_correcao estado_tratamento'.split(' ')
};
const etapas = ['arte_aprovada', 'prompts_imagem_prontos', 'imagens_em_producao', 'voz_pronta_para_gerar', 'voz_em_producao', 'clipes_prontos_para_gerar', 'clipes_em_producao', 'montagem_pronta', 'montagem_em_producao'];
const vazio = value => value === '' || value === null || value === undefined;
function limparMatriz(values) {
  const rows = values.map(row => {
    const cells = row.slice();
    while (cells.length && vazio(cells.at(-1))) cells.pop();
    return cells;
  });
  while (rows.length && rows.at(-1).length === 0) rows.pop();
  return rows;
}
function recalcularHashes(raw) {
  const pairs = Object.keys(raw.tables).sort().map(nome => {
    const t = raw.tables[nome];
    return [nome, {sheetId: t.sheetId, range: t.range, values: limparMatriz(t.values)}];
  });
  const hash = crypto.createHash('sha256').update(JSON.stringify(pairs)).digest('hex');
  raw.firstReadSha256 = hash;
  raw.secondReadSha256 = hash;
  return raw;
}
function coluna(n) {
  let name = '';
  while (n) { n--; name = String.fromCharCode(65 + n % 26) + name; n = Math.floor(n / 26); }
  return name;
}
function capturaValida() {
  const raw = {
    schemaVersion: 1, capturaId: 'captura-sintetica-01', spreadsheetId: 'fonte-sintetica',
    brandId: 'ntv', source: 'google-drive-connector',
    startedAt: '2026-10-02T12:00:00.000Z', completedAt: '2026-10-02T12:05:00.000Z',
    metadataBefore: {}, metadataAfter: {}, tables: {}
  };
  const registros = {
    Semanas: [{semana_id: 'semana-01', marca_id: 'ntv', inicio_semana: '2026-09-28', tema: 'Conexões do cotidiano', objetivo: 'Objetivo semanal sintético'}],
    Produções: ['imagem_a','imagem_b','carrossel','reels','imagem_a'].map((slot, i) => ({
      producao_id: 'peca-' + (i + 1), marca_id: i === 4 ? 'outra-marca-sintetica' : 'ntv',
      semana_id: 'semana-01', slot, tipo_producao: 'tipo-original-' + slot,
      data_prevista: ['2026-09-30','2026-10-01','2026-10-02','2026-10-02','2026-10-03'][i],
      status: 'em_planejamento', etapa_producao: i === 0 ? 'arte_aprovada' : 'prompts_imagem_prontos',
      responsavel_atual: 'Equipe sintética', versao: 1, titulo: ['Imagem A sintética','Imagem B histórica sintética','Carrossel sintético','Reels sintético','Outra marca sintética'][i],
      legenda: 'Texto de exemplo sem dado operacional'
    })),
    Páginas: [{pagina_id:'pagina-01',producao_id:'peca-3',versao:1,indice:1,titulo:'Página sintética'}],
    Cenas: [{cena_id:'cena-01',producao_id:'peca-4',versao:1,indice:1,texto:'Cena sintética',inicio_segundos:0,duracao_segundos:5}],
    Arquivos: [{arquivo_id:'arquivo-01',producao_id:'peca-1',semana_id:'semana-01',tipo:'imagem',papel:'arte',versao:1}],
    Revisoes: [{revisao_id:'revisao-01',producao_id:'peca-1',versao:1,decisao:'revisar',motivo:'Exemplo',responsavel_correcao:'Equipe sintética',estado_tratamento:'aberta'}]
  };
  Object.entries(campos).forEach(([nome, headers], i) => {
    const cabecalhos = [...headers, '__extra_privado'];
    raw.metadataBefore[nome] = {sheetId:i,rowCount:20,columnCount:cabecalhos.length};
    raw.tables[nome] = {sheetId:i,range:'A1:' + coluna(cabecalhos.length) + '20',readAt:'2026-10-02T12:03:00.000Z',complete:true,
      values:[cabecalhos,...registros[nome].map(record => cabecalhos.map(h => h==='__extra_privado' ? 'sentinela-nao-publicar' : (record[h] ?? '')))]};
  });
  raw.metadataAfter = structuredClone(raw.metadataBefore);
  return recalcularHashes(raw);
}
function mapaQuadroValido() {
  return {schemaVersion:1,liberacaoPronta:[],revisaoEmAndamento:[],etapas:etapas.map(rotulo => ({rotulo,coluna:rotulo==='arte_aprovada'?'Visual':'Mídia'}))};
}
function mudarCelula(raw, nome, row, campo, value) {
  raw.tables[nome].values[row][raw.tables[nome].values[0].indexOf(campo)] = value;
  return recalcularHashes(raw);
}
function redefinirHorario(raw,startedAt,completedAt) {
  raw.startedAt=startedAt;raw.completedAt=completedAt;
  for(const table of Object.values(raw.tables)) table.readAt=completedAt;
  return raw;
}
function adicionarRegistro(raw,nome,record) {
  const table=raw.tables[nome];
  table.values.push(table.values[0].map(h=>record[h] ?? ''));
  return recalcularHashes(raw);
}
function capturaDetalhada() {
  const raw=capturaValida();
  mudarCelula(raw,'Produções',3,'versao',2);
  mudarCelula(raw,'Páginas',1,'versao',2);mudarCelula(raw,'Páginas',1,'indice',2);
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-02',producao_id:'peca-3',versao:2,indice:1,titulo:'Abertura sintética',corpo:'Texto da primeira página',arquivo_imagem_id:'arquivo-pagina'});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-antiga',producao_id:'peca-3',versao:1,indice:1,titulo:'Página de versão anterior'});
  mudarCelula(raw,'Cenas',1,'indice',2);
  adicionarRegistro(raw,'Cenas',{cena_id:'cena-02',producao_id:'peca-4',versao:1,indice:1,texto:'Primeira cena sintética',texto_tela:'Texto na tela',inicio_segundos:0,duracao_segundos:4,arquivo_video_id:'arquivo-clipe'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-pagina',producao_id:'peca-3',pagina_id:'pagina-02',semana_id:'semana-01',tipo:'imagem',papel:'página',versao:2,url:'https://drive.google.com/file/d/exemplo-sintetico'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-clipe',producao_id:'peca-4',cena_id:'cena-02',semana_id:'semana-01',tipo:'vídeo',papel:'clipe',versao:1,url:'https://docs.google.com/document/d/exemplo-sintetico'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-plano',semana_id:'semana-01',tipo:'documento',papel:'plano',versao:1});
  mudarCelula(raw,'Semanas',1,'plano_json_arquivo_id','arquivo-plano');
  for(const [id,v,estado] of [['revisao-atual',2,'aberta'],['revisao-resolvida',2,'resolvida'],['revisao-antiga',1,'aberta'],['revisao-incerta',2,'estado-novo-sintético']]) {
    adicionarRegistro(raw,'Revisoes',{revisao_id:id,producao_id:'peca-3',versao:v,decisao:'revisar',motivo:'Conferir texto de exemplo',responsavel_correcao:'Correção sintética',estado_tratamento:estado});
  }
  return raw;
}
// Somente cenários sintéticos: não acrescenta rótulos ao mapa versionado.
function mapaQuadroSintetico() {
  const mapa=mapaQuadroValido();
  mapa.liberacaoPronta=['liberada-sintetica'];mapa.revisaoEmAndamento=['em-revisao-sintetica'];
  mapa.etapas.push({rotulo:'planejada-sintetica',coluna:'Planejamento'},{rotulo:'texto-sintetico',coluna:'Redação'});
  return mapa;
}
function capturaQuadro() {
  const raw=capturaDetalhada();
  for(const [row,etapa] of [[1,'planejada-sintetica'],[2,'texto-sintetico'],[3,'arte_aprovada'],[4,'prompts_imagem_prontos']]) {
    mudarCelula(raw,'Produções',row,'etapa_producao',etapa);
  }
  const novas=[
    ['peca-7','Correção de texto sintética','arte_aprovada','em-revisao-sintetica','',''],
    ['peca-8','Entrega pronta sintética','arte_aprovada','','liberada-sintetica',''],
    ['peca-9','Publicação registrada sintética','arte_aprovada','','','2026-10-01T12:00:00Z'],
    ['peca-10','Etapa nova sintética','etapa_nova_sintetica','','',''],
    ['peca-11','Mesmo rótulo, outra peça','etapa_nova_sintetica','','',''],
    ['peca-12','Sem data e sem etapa','','','','']
  ];
  for(const [id,titulo,etapa,estadoRevisao,estadoLiberacao,publicado] of novas) adicionarRegistro(raw,'Produções',{
    producao_id:id,marca_id:'ntv',semana_id:'semana-01',slot:'imagem_a',versao:1,titulo,
    etapa_producao:etapa,estado_revisao:estadoRevisao,estado_liberacao:estadoLiberacao,publicado_em:publicado,
    data_prevista:id==='peca-12'?'':'2026-10-02',responsavel_atual:'Responsável sintético',status:'em_planejamento'
  });
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-quadro',producao_id:'peca-7',versao:1,
    decisao:'revisar',motivo:'Ajustar texto de exemplo',responsavel_correcao:'Correção sintética',estado_tratamento:'aberta'});
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-02',marca_id:'ntv',inicio_semana:'2026-10-05',tema:'Próxima semana sintética'});
  adicionarRegistro(raw,'Produções',{producao_id:'peca-13',marca_id:'ntv',semana_id:'semana-02',slot:'imagem_b',
    versao:1,titulo:'Etapa nova da outra semana',etapa_producao:'outra_etapa_sintetica',data_prevista:'2026-10-05',
    responsavel_atual:'Equipe sintética',status:'publicado'});
  return raw;
}
function capturaPlanilha() {
  const raw=capturaDetalhada();
  // Payload sintético para conferir texto literal; JSON é serializado antes de preencher a captura.
  const origensJson=JSON.stringify({arquivo_id:'origem-sintetica',texto:'<script>conteúdo como dado</script>'});
  mudarCelula(raw,'Semanas',1,'objetivo',0);
  mudarCelula(raw,'Produções',2,'etapa_producao',null);
  mudarCelula(raw,'Produções',2,'legenda',null);
  mudarCelula(raw,'Produções',1,'legenda','  Texto de exemplo  ');
  mudarCelula(raw,'Páginas',1,'corpo',false);
  mudarCelula(raw,'Cenas',1,'texto_tela','   ');
  mudarCelula(raw,'Arquivos',1,'id_drive','drive-ficticio-local');
  mudarCelula(raw,'Arquivos',1,'sha256','a'.repeat(64));
  mudarCelula(raw,'Arquivos',1,'origens_json',origensJson);
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-02',marca_id:'ntv',inicio_semana:'2026-10-05',tema:'Segunda semana sintética'});
  adicionarRegistro(raw,'Semanas',{semana_id:'semana-outra',marca_id:'outra-marca-sintetica',inicio_semana:'2026-10-12',tema:'Não pertence à consulta'});
  adicionarRegistro(raw,'Produções',{producao_id:'peca-6',marca_id:'ntv',semana_id:'semana-02',slot:'imagem_a',versao:1,titulo:'Nova peça sintética',data_prevista:'2026-10-05'});
  adicionarRegistro(raw,'Páginas',{pagina_id:'pagina-outra',producao_id:'peca-5',versao:1,indice:1,titulo:'Outra marca'});
  adicionarRegistro(raw,'Cenas',{cena_id:'cena-outra',producao_id:'peca-5',versao:1,indice:1,texto:'Outra marca'});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-outra',producao_id:'peca-5',semana_id:'semana-outra',versao:1});
  adicionarRegistro(raw,'Arquivos',{arquivo_id:'arquivo-semana-02',semana_id:'semana-02',tipo:'documento',papel:'plano',versao:1});
  adicionarRegistro(raw,'Revisoes',{revisao_id:'revisao-outra',producao_id:'peca-5',versao:1,decisao:'revisar'});
  for(const table of Object.values(raw.tables)) {
    table.values=table.values.map(row=>row.slice().reverse());
    table.values.splice(1,0,[]);
  }
  return recalcularHashes(raw);
}
function temporario(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'crm001-test-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  return dir;
}
function carregarModulo(relative, exports) {
  const filename = path.resolve(__dirname,'..',relative);
  if (fs.existsSync(filename)) return require(filename);
  return Object.fromEntries(exports.map(name => [name, () => { throw new Error(name + ': comportamento ainda não implementado'); }]));
}
module.exports = {campos,capturaValida,capturaDetalhada,capturaQuadro,capturaPlanilha,adicionarRegistro,mapaQuadroValido,mapaQuadroSintetico,recalcularHashes,mudarCelula,redefinirHorario,temporario,carregarModulo};
