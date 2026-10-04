const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {mapaQuadroValido,temporario,carregarModulo}=require('./fixtures.cjs');
const {validarMapaQuadro,carregarMapaQuadro}=carregarModulo('src/quadro-config.cjs',['validarMapaQuadro','carregarMapaQuadro']);
test('Q01 JSON versionado tem exatamente nove etapas e prioridades vazias', () => {
  const map=carregarMapaQuadro(path.resolve(__dirname,'../config/quadro-etapas.json'));
  assert.deepEqual(map,mapaQuadroValido());
  assert.notEqual(validarMapaQuadro(map),map);
});
test('Q02 coluna inexistente ou reservada é erro claro', () => {
  for (const coluna of ['Inventada','Publicada','Outras']) {
    const map=mapaQuadroValido(); map.etapas[0].coluna=coluna;
    assert.throws(()=>validarMapaQuadro(map),/etapas.*0.*coluna/);
  }
});
test('Q02 rótulo repetido informa campo e os dois índices', () => {
  const map=mapaQuadroValido(); map.etapas.push({rotulo:'arte_aprovada',coluna:'Redação'});
  assert.throws(()=>validarMapaQuadro(map),/etapas.*0.*9.*repetido/);
  for (const field of ['liberacaoPronta','revisaoEmAndamento']) {
    const m=mapaQuadroValido(); m[field]=['rótulo-sintético','rótulo-sintético'];
    assert.throws(()=>validarMapaQuadro(m),new RegExp(field+'.*0.*1.*repetido'));
  }
});
test('Q02 rótulo vazio e schema/tipos inválidos são rejeitados', () => {
  for (const value of ['', '   ', 3, null]) {
    const map=mapaQuadroValido(); map.etapas[0].rotulo=value;
    assert.throws(()=>validarMapaQuadro(map),/etapas.*0.*rótulo/);
  }
  for (const map of [null,[],{schemaVersion:2}, {...mapaQuadroValido(),etapas:null},{...mapaQuadroValido(),liberacaoPronta:'x'}]) {
    assert.throws(()=>validarMapaQuadro(map),/configuração|schemaVersion|etapas|liberacaoPronta/);
  }
});
test('Q03 arquivo ausente/JSON malformado impede carregar, sem fallback', t => {
  const file=path.join(temporario(t),'mapa.json');
  assert.throws(()=>carregarMapaQuadro(file),/configuração.*arquivo/);
  fs.writeFileSync(file,'{incorreto');
  assert.throws(()=>carregarMapaQuadro(file),/configuração.*JSON/);
});
test('Q03 acrescentar rótulo só no JSON muda carregamento sem editar código', t => {
  const file=path.join(temporario(t),'mapa.json'), map=mapaQuadroValido();
  map.etapas.push({rotulo:'etapa-nova-sintética',coluna:'Planejamento'});
  map.liberacaoPronta=['prontidão-sintética'];
  map.revisaoEmAndamento=['revisão-sintética'];
  fs.writeFileSync(file,JSON.stringify(map));
  assert.deepEqual(carregarMapaQuadro(file),map);
});
test('Q02 mesmo rótulo em campos diferentes tem identidades diferentes', () => {
  const map=mapaQuadroValido();
  map.liberacaoPronta=['arte_aprovada']; map.revisaoEmAndamento=['arte_aprovada'];
  assert.deepEqual(validarMapaQuadro(map),map);
});
