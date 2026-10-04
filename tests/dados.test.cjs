const {test} = require('node:test');
const assert = require('node:assert/strict');
const {capturaValida,recalcularHashes,mudarCelula,carregarModulo} = require('./fixtures.cjs');
const {validarCaptura} = carregarModulo('src/captura.cjs',['validarCaptura']);
const {validarTempoImportacao}=require('../src/captura.cjs');

test('D-review m4 tolera exatamente dez minutos de relógio adiantado, não mais', () => {
  const now='2026-10-04T12:00:00.000Z';
  assert.doesNotThrow(()=>validarTempoImportacao('2026-10-04T12:10:00.000Z',now));
  assert.throws(()=>validarTempoImportacao('2026-10-04T12:10:00.001Z',now),/inválida.*10 minutos/);
});

test('D-review m4 captura nova tem de terminar depois da vigente', () => {
  const now='2026-10-04T12:00:00Z',current='2026-10-04T11:05:00Z';
  for(const end of [current,'2026-10-04T11:04:59.999Z']) {
    assert.throws(()=>validarTempoImportacao(end,now,current),/desatualizada/);
  }
  assert.doesNotThrow(()=>validarTempoImportacao('2026-10-04T11:05:00.001Z',now,current));
});

test('D01 captura válida normaliza nomes e conserva extras só no privado', () => {
  const raw = capturaValida();
  const result = validarCaptura(raw);
  assert.equal(result.producoes.length,5);
  assert.equal(result.producoes[1].slot,'imagem_b');
  assert.equal(result.producoes[0].__extra_privado,'sentinela-nao-publicar');
  assert.equal(raw.tables.Produções.values[1][0],'peca-1');
});
test('D01 cabeçalhos reordenados e aba só com cabeçalho são válidos', () => {
  const raw = capturaValida();
  raw.tables.Produções.values = raw.tables.Produções.values.map(row => row.toReversed());
  raw.tables.Cenas.values = [raw.tables.Cenas.values[0]];
  const result = validarCaptura(recalcularHashes(raw));
  assert.equal(result.producoes[0].producao_id,'peca-1');
  assert.deepEqual(result.cenas,[]);
});
test('D02 mínimo ausente identifica aba/campo sem despejar células', () => {
  const raw=capturaValida();
  raw.tables.Produções.values[0][12]='cabecalho_errado';
  assert.throws(() => validarCaptura(recalcularHashes(raw)),/Produções.*titulo/);
});
test('D02 qualquer cabeçalho não vazio duplicado invalida', () => {
  const raw=capturaValida();
  raw.tables.Produções.values[0][17]='titulo';
  assert.throws(() => validarCaptura(recalcularHashes(raw)),/Produções.*duplicado/);
});
test('D03 ID ausente/duplicado ou de tipo errado invalida; vazias são ignoradas', () => {
  for (const value of ['', 'peca-1', 42]) {
    const raw=mudarCelula(capturaValida(),'Produções',2,'producao_id',value);
    assert.throws(() => validarCaptura(raw),/Produções.*linha 3.*producao_id/);
  }
  const raw=capturaValida();
  raw.tables.Produções.values.push(['',null]);
  assert.equal(validarCaptura(recalcularHashes(raw)).producoes.length,5);
});
test('D04 aba ausente, extra ou complete false impede promoção', () => {
  const a=capturaValida(); delete a.tables.Cenas;
  assert.throws(() => validarCaptura(a),/abas/);
  const b=capturaValida(); b.tables.Extra={};
  assert.throws(() => validarCaptura(b),/abas/);
  const c=capturaValida(); c.tables.Cenas.complete=false;
  assert.throws(() => validarCaptura(c),/Cenas.*complete/);
});
test('D04 range/metadados divergentes e retângulo além das dimensões invalidam', () => {
  const a=capturaValida(); a.tables.Cenas.range='A1:L19';
  assert.throws(() => validarCaptura(recalcularHashes(a)),/Cenas.*range/);
  const b=capturaValida(); b.metadataAfter.Cenas.rowCount=21;
  assert.throws(() => validarCaptura(b),/Cenas.*metadata/);
  const c=capturaValida(); c.tables.Cenas.values[1]=Array(13).fill('x');
  assert.throws(() => validarCaptura(recalcularHashes(c)),/Cenas.*dimens/);
  const d=capturaValida(); d.metadataBefore.Cenas.sheetId=-1;
  assert.throws(() => validarCaptura(d),/Cenas.*metadata/);
});
test('D04 escalar JSON inválido e matriz malformada são rejeitados', () => {
  for (const value of [{objeto:true},Infinity,undefined]) {
    const raw=capturaValida(); raw.tables.Cenas.values[1][4]=value;
    assert.throws(() => validarCaptura(raw),/Cenas.*célula/);
  }
  const raw=capturaValida(); raw.tables.Cenas.values[1]='linha incorreta';
  assert.throws(() => validarCaptura(raw),/Cenas.*linha/);
});
test('D05 hashes discordantes, adulterados ou malformados invalidam', () => {
  const a=capturaValida(); a.firstReadSha256='0'.repeat(64);
  assert.throws(() => validarCaptura(a),/hash/);
  const b=capturaValida(); b.tables.Cenas.values[1][4]='conteúdo alterado';
  assert.throws(() => validarCaptura(b),/hash/);
  const c=capturaValida(); c.secondReadSha256='XYZ';
  assert.throws(() => validarCaptura(c),/hash/);
});
test('D05 vazios finais têm normalização canônica idêntica', () => {
  const raw=capturaValida();
  const hash=raw.secondReadSha256;
  raw.tables.Cenas.values.push(['',null]);
  raw.tables.Cenas.values[1].push('');
  // Dentro do retângulo: última célula extra já é sentinela, não aumentar sua largura.
  raw.tables.Cenas.values[1].pop();
  assert.equal(recalcularHashes(raw).secondReadSha256,hash);
  assert.equal(validarCaptura(raw).cenas.length,1);
});
test('D05 identidade, schema, marca/fonte e tempos são estritos', () => {
  for (const [field,value] of [['capturaId','../fora'],['capturaId',''],['capturaId','a'.repeat(101)],['schemaVersion',2],['brandId','outra'],['source','desconhecida'],['startedAt','2026-10-02T13:00:00Z'],['completedAt','2026-10-02T12:05:00-03:00'],['startedAt','2026-02-30T12:00:00Z']]) {
    const raw=capturaValida(); raw[field]=value;
    assert.throws(() => validarCaptura(raw),new RegExp(field+'|intervalo'));
  }
  const raw=capturaValida(); raw.tables.Cenas.readAt='2026-10-02T12:06:00Z';
  assert.throws(() => validarCaptura(raw),/Cenas.*readAt/);
  assert.throws(() => validarCaptura(null),/envelope/);
});
test('D01 etapa desconhecida é válida e conservada', () => {
  const raw=mudarCelula(capturaValida(),'Produções',1,'etapa_producao','etapa-nova-sintética');
  assert.equal(validarCaptura(raw).producoes[0].etapa_producao,'etapa-nova-sintética');
});
