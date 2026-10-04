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
module.exports = {campos,capturaValida,mapaQuadroValido,recalcularHashes,mudarCelula,redefinirHorario,temporario,carregarModulo};
