import fs from 'node:fs';
import path from 'node:path';
import { result, run, batches } from './gate-core.mjs';
import { selectFiles } from './gate-scope.mjs';
export function complexityFromJson(records,root) {
  if(!Array.isArray(records)) throw Error('ESLint JSON invalido');
  const metrics=[];
  for(const record of records) {
    const rel=path.relative(root,record.filePath).split(path.sep).join('/');
    if(rel.startsWith('../')||path.isAbsolute(rel)||!Array.isArray(record.messages)) throw Error('ESLint arquivo invalido');
    const counts=new Map();
    for(const m of record.messages) {
      if(m.fatal) throw Error('ESLint erro de sintaxe');
      if(!['complexity','node-kit/complexity'].includes(m.ruleId)) continue;
      const match=/^(.*?) has a complexity of (\d+)\./.exec(m.message);
      if(!match || !Number.isInteger(m.line)) throw Error('ESLint mensagem invalida');
      const name=match[1], occurrence=(counts.get(name)??0)+1; counts.set(name,occurrence);
      const identity=/ Identity: ([a-f0-9]{64})\.$/.exec(m.message)?.[1];
      metrics.push({key:identity?`${rel}::ast::${identity}`:`${rel}::${name}::${occurrence}`,file:rel,line:m.line,value:Number(match[2]),matchable:Boolean(identity)});
    }
  }
  const counts=new Map();
  for(const metric of metrics) counts.set(metric.key,(counts.get(metric.key)??0)+1);
  for(const metric of metrics) if(counts.get(metric.key)!==1) metric.matchable=false;
  return metrics;
}
export function evaluateComplexity(metrics,limits,baseline,mode) {
  const bad=metrics.filter(m=>m.value>=limits.failAt && (mode!=='baseline' || m.matchable===false || !Object.hasOwn(baseline.complexity,m.key) || m.value>baseline.complexity[m.key]));
  const warnings=metrics.filter(m=>m.value>=limits.warnAt && m.value<limits.failAt);
  return result('complexity',bad.length?'FAIL':'PASS',bad.length?'funcao nova/pior acima do limite':'',{metrics,warnings});
}
export function checkComplexity(root,c,baseline,mode,toolsDir=path.join(root,'tools')) {
  if(!c.checks.complexity.enabled) return result('complexity','N/A','enabled:false');
  const files=selectFiles(root,c,mode);
  if(files.length===0) return result('complexity','N/A','nenhum arquivo no escopo',{metrics:[],warnings:[]});
  const cli=path.join(toolsDir,'node_modules/eslint/bin/eslint.js');
  if(!fs.existsSync(cli)) return result('complexity','SKIP','ESLint ausente; npm ci --prefix tools');
  const metrics=[];
  const prefix=[process.execPath,cli,'--no-config-lookup','--config',path.join(toolsDir,'eslint.complexity.config.mjs'),'--no-ignore','--format','json'];
  for(const argv of batches(prefix,files.map(file=>path.join(root,file)))) {
    const r=run(argv,root);
    if(r.error || ![0,1].includes(r.status)) return result('complexity','ERROR','ESLint nao executou corretamente');
    try { metrics.push(...complexityFromJson(JSON.parse(r.stdout),root)); }
    catch { return result('complexity','ERROR','ESLint JSON/sintaxe invalido'); }
  }
  return evaluateComplexity(metrics,c.checks.complexity,baseline,mode);
}
