const fs=require('node:fs');
const path=require('node:path');
const {promoverCaptura,registrarFalhaEntrada}=require('../src/snapshot.cjs');

function argumentos(argv) {
  if (![1,3].includes(argv.length) || !argv[0] || argv[0].startsWith('--')) throw new Error('argumentos: informe um caminho local');
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(argv[0])) throw new Error('caminho local obrigatório; URL não é aceita');
  if (argv.length===3 && (argv[1]!=='--data-dir' || !argv[2] || argv[2].startsWith('--'))) throw new Error('argumentos: --data-dir exige diretório local');
  if (argv[2] && /^[a-z][a-z0-9+.-]*:\/\//i.test(argv[2])) throw new Error('caminho local obrigatório');
  return {input:argv[0],dataDir:argv[2] ?? path.resolve(__dirname,'../data')};
}
function lerEntrada(input) {
  let bytes;
  try { bytes=fs.readFileSync(input,'utf8'); } catch { throw Object.assign(new Error('arquivo local ausente ou ilegível'),{code:'ENTRADA_ARQUIVO'}); }
  try { return JSON.parse(bytes); } catch { throw Object.assign(new Error('JSON inválido no arquivo local'),{code:'ENTRADA_JSON'}); }
}
function importarArquivo(input,dataDir) {
  let raw;
  try { raw=lerEntrada(input); }
  catch (e) { return registrarFalhaEntrada(dataDir,e.code); }
  return promoverCaptura(raw,dataDir);
}
function avisar(outcome) {
  for (const aviso of outcome.avisos ?? []) process.stderr.write('Aviso: '+aviso+'\n');
}
function main(argv) {
  try {
    const {input,dataDir}=argumentos(argv);
    const result=importarArquivo(input,dataDir);
    avisar(result);
    if (result.resultado==='falhou') {
      process.stderr.write('Importação falhou: '+result.motivoResumo+'\n');
      return 1;
    }
    process.stdout.write(result.capturaId+' '+result.resultado+'\n');
    return 0;
  } catch (e) {
    avisar(e);
    process.stderr.write(e.message+'\n');
    return 1;
  }
}
if (require.main===module) process.exitCode=main(process.argv.slice(2));
module.exports={main};
