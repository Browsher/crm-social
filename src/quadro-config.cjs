const fs=require('node:fs');
const COLUNAS=Object.freeze(['Planejamento','Redação','Visual','Mídia','Revisão','Pronta','Publicada','Outras']);
function erro(field) { throw new Error('configuração: '+field); }
function lista(value,field,etapas) {
  if (!Array.isArray(value)) erro(field+' deve ser lista');
  const seen=new Map();
  value.forEach((entry,index)=>{
    const rotulo=etapas?entry?.rotulo:entry;
    if (typeof rotulo!=='string' || rotulo.trim()==='') erro(field+' índice '+index+' rótulo inválido');
    if (seen.has(rotulo)) erro(field+' índices '+seen.get(rotulo)+' e '+index+' rótulo repetido');
    seen.set(rotulo,index);
    if (etapas && !COLUNAS.slice(0,6).includes(entry.coluna)) erro(field+' índice '+index+' coluna inválida ou reservada');
  });
}
function validarMapaQuadro(raw) {
  if (!raw || typeof raw!=='object' || Array.isArray(raw)) erro('objeto obrigatório');
  if (raw.schemaVersion!==1) erro('schemaVersion deve ser 1');
  lista(raw.liberacaoPronta,'liberacaoPronta',false);
  lista(raw.revisaoEmAndamento,'revisaoEmAndamento',false);
  lista(raw.etapas,'etapas',true);
  return {schemaVersion:1,liberacaoPronta:raw.liberacaoPronta.slice(),revisaoEmAndamento:raw.revisaoEmAndamento.slice(),
    etapas:raw.etapas.map(({rotulo,coluna})=>({rotulo,coluna}))};
}
function carregarMapaQuadro(file) {
  let bytes;
  try { bytes=fs.readFileSync(file,'utf8'); } catch { erro('arquivo ausente ou ilegível'); }
  let raw;
  try { raw=JSON.parse(bytes); } catch { erro('JSON inválido'); }
  return validarMapaQuadro(raw);
}
module.exports={validarMapaQuadro,carregarMapaQuadro,COLUNAS};
