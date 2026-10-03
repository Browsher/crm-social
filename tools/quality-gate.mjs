import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {result,exitCode,loadConfig,configError} from './gate-core.mjs';
import {effectiveMode,readBaseline,saveBaseline} from './gate-scope.mjs';
import {testCoverage} from './gate-tests.mjs';
import {checkComplexity} from './gate-complexity.mjs';
import {checkSemgrep,checkAudit} from './gate-security.mjs';
export function parseArgs(argv) {
  const options={};
  for(let i=0;i<argv.length;i++) {
    if(argv[i]==='--strict') options.strict=true;
    else if(argv[i]==='--update-baseline') options.updateBaseline=true;
    else if(argv[i]==='--mode') options.mode=argv[++i];
    else if(argv[i].startsWith('--mode=')) options.mode=argv[i].slice(7);
    else throw configError('opcao desconhecida: '+argv[i]);
  }
  if(Object.hasOwn(options,'mode')&&!['full','changed','baseline'].includes(options.mode)) throw configError('--mode exige full, changed ou baseline');
  if(options.updateBaseline&&options.mode&&options.mode!=='full') throw configError('--update-baseline exige full');
  return options;
}
export function runGate({root,strict=false,updateBaseline=false,mode,toolsDir,quiet=false,argumentError}={}) {
  root=path.resolve(root??path.join(import.meta.dirname,'..'));
  const report={schemaVersion:1,nodeVersion:process.versions.node,exitCode:0,results:[],baselineUpdated:false};
  try {
    if(argumentError) throw argumentError;
    if(mode&&!['full','changed','baseline'].includes(mode)) throw configError('modo invalido');
    if(updateBaseline&&mode&&mode!=='full') throw configError('baseline so atualiza em full');
    const c=loadConfig(root);
    const expected=Number(c.nodeVersion.split('.')[0]), found=Number(process.versions.node.split('.')[0]);
    if(found!==expected) throw Error(`esperado ${expected}, encontrado ${found}`);
    const selected=n=>updateBaseline?'full':effectiveMode(c,n,mode);
    const required=['coverage','complexity'].some(n=>c.checks[n].enabled&&selected(n)==='baseline');
    const baseline=readBaseline(root,required);
    const protect=(name,fn)=>{
      try { return fn(); }
      catch { return result(name,'ERROR','falha de I/O/escopo; conferir Git, arquivos e configuracao'); }
    };
    try { report.results.push(...testCoverage(root,c,baseline,selected('coverage'))); }
    catch { report.results.push(result('tests','ERROR','execucao de testes quebrada'),result('coverage','ERROR','coleta de cobertura quebrada')); }
    report.results.push(protect('complexity',()=>checkComplexity(root,c,baseline,selected('complexity'),toolsDir)));
    report.results.push(protect('semgrep',()=>checkSemgrep(root,c,selected('semgrep'))));
    report.results.push(protect('audit',()=>checkAudit(root,c)));
    if(updateBaseline) {
      const get=n=>report.results.find(r=>r.name===n);
      const ready=get('tests').state==='PASS' && get('coverage').state==='PASS' && ['PASS','FAIL'].includes(get('complexity').state) && ['semgrep','audit'].every(n=>['PASS','N/A'].includes(get(n).state));
      if(!ready) report.results.push(result('baseline','ERROR','baseline preservada: exige testes/cobertura/complexidade validos e seguranca/audit sem falha ou SKIP'));
      else {
        const metrics=Object.fromEntries(get('complexity').metrics.filter(m=>m.matchable!==false).map(m=>[m.key,m.value]));
        saveBaseline(root,{schemaVersion:1,coverage:get('coverage').percent,complexity:metrics});
        report.baselineUpdated=true;
      }
    }
    report.exitCode=exitCode(report.results,strict);
  } catch(e) {
    report.results.push(result('gate','ERROR',e.code===3?e.message:/^esperado \d+, encontrado \d+$/.test(e.message)?e.message:'erro de execucao/configuracao do runtime'));
    report.exitCode=e.code===3?3:2;
  }
  try { fs.writeFileSync(path.join(root,'quality-gate-report.json'),JSON.stringify(report,null,2)+'\n'); }
  catch { report.results.push(result('report','ERROR','nao foi possivel gravar quality-gate-report.json')); if(report.exitCode!==3) report.exitCode=2; }
  if(!quiet) {
    console.table(report.results.map(r=>({checagem:r.name,estado:r.state,motivo:r.reason,avisos:r.warnings?.length??0})));
    console.log('exit code:',report.exitCode,'baseline atualizada:',report.baselineUpdated);
  }
  return report;
}
if(process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  let options;
  try { options=parseArgs(process.argv.slice(2)); }
  catch(e) { options={argumentError:e}; }
  process.exitCode=runGate(options).exitCode;
}
