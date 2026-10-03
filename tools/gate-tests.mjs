import fs from 'node:fs';
import path from 'node:path';
import { result, run } from './gate-core.mjs';
import { selectFiles, isExcludedDirectory } from './gate-scope.mjs';
export function parseTap(text) {
  const lines=text.trim().split(/\r?\n/);
  const invalid=()=>{throw Error('TAP sem estrutura/contagem valida');};
  if(lines[0]!=='TAP version 13') invalid();
  const plans=lines.filter(line=>/^1\.\.\d+(?: #.*)?$/.test(line));
  if(plans.length!==1) invalid();
  const planned=Number(/^1\.\.(\d+)/.exec(plans[0])[1]);
  const results=lines.filter(line=>/^\s*(?:not ok|ok) \d+(?: -.*)?(?: #.*)?$/.test(line));
  const top=results.filter(line=>!/^\s/.test(line));
  if(top.length!==planned || top.some((line,i)=>Number(/^(?:not ok|ok) (\d+)/.exec(line)[1])!==i+1)) invalid();
  const summary={};
  for(const name of ['tests','suites','pass','fail','cancelled','skipped','to'+'do']) {
    const matches=lines.filter(line=>new RegExp('^# '+name+' \\d+$').test(line));
    if(matches.length!==1) invalid();
    summary[name]=Number(matches[0].split(' ')[2]);
  }
  if(results.length!==summary.tests+summary.suites || summary.pass+summary.fail+summary.cancelled+summary.skipped+summary['to'+'do']!==summary.tests) invalid();
  if(summary.fail+summary.cancelled>0 && !results.some(line=>/^\s*not ok /.test(line))) invalid();
  if(lines.filter(line=>/^# duration_ms \d+(?:\.\d+)?$/.test(line)).length!==1) invalid();
  if(lines.some(line=>line && !/^\s|^#|^(?:not ok|ok) \d+|^1\.\.\d+|^TAP version 13$/.test(line))) invalid();
  return summary.tests;
}
function testFiles(root,command) {
  const files=[];
  const selectors=command.slice(1).filter(x=>!x.startsWith('-'));
  function walk(dir) {
    for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
      if(e.isSymbolicLink()) continue;
      const abs=path.join(dir,e.name);
      if(e.isDirectory()) { if(!isExcludedDirectory(e.name)) walk(abs); continue; }
      const rel=path.relative(root,abs).split(path.sep).join('/');
      if(e.isFile() && /\.(js|cjs|mjs)$/.test(rel) && (selectors.length?selectors.some(g=>path.matchesGlob(rel,g)):/\.test\.(js|cjs|mjs)$/.test(rel))) files.push(abs);
    }
  }
  walk(root); return files.sort();
}
export function parseLcov(text,root,c) {
  const allowed=new Set(selectFiles(root,c,'full'));
  const hits=new Map(); let current=null;
  for(const raw of text.split(/\r?\n/)) {
    if(raw.startsWith('SF:')) {
      const file=path.resolve(root,raw.slice(3));
      current=path.relative(root,file).split(path.sep).join('/');
    } else if(raw.startsWith('DA:') && allowed.has(current)) {
      const parts=raw.slice(3).split(',');
      const line=Number(parts[0]), count=Number(parts[1]);
      if(parts.length<2 || !Number.isInteger(line) || line<1 || !Number.isFinite(count) || count<0) throw Error('LCOV DA invalido');
      const key=current+':'+line;
      hits.set(key,(hits.get(key)??false)||count>0);
    } else if(raw==='end_of_record') current=null;
  }
  if(hits.size===0) throw Error('LCOV sem linhas de fonte no escopo');
  return [...hits.values()].filter(Boolean).length/hits.size*100;
}
export function testCoverage(root,c,baseline=null,mode='full') {
  const tc=c.checks.tests, cc=c.checks.coverage;
  if(!tc.enabled) return [result('tests','N/A','enabled:false'),result('coverage','N/A','enabled:false')];
  const files=testFiles(root,c.testCommand);
  if(files.length===0) return [result('tests','FAIL','nenhum teste encontrado',{count:0}),result('coverage',cc.enabled?'FAIL':'N/A',cc.enabled?'nenhum teste encontrado':'enabled:false')];
  const base=path.join(root,'.quality-gate-run'); fs.mkdirSync(base,{recursive:true});
  const dir=fs.mkdtempSync(path.join(base,'run-')), lcov=path.join(dir,'lcov.info');
  try {
    const flags=['--test-reporter=tap','--test-reporter-destination=stdout'];
    if(cc.enabled) {
      flags.push('--experimental-test-coverage','--test-reporter=lcov','--test-reporter-destination='+lcov);
      for(const g of c.include) flags.push('--test-coverage-include='+g);
      for(const g of c.exclude) flags.push('--test-coverage-exclude='+g);
    }
    const r=run([process.execPath,...flags,...c.testCommand.slice(1).filter(x=>x.startsWith('-')),...files],root);
    if(r.error) return [result('tests','ERROR','Node nao executou: '+r.error),result('coverage',cc.enabled?'ERROR':'N/A',cc.enabled?'Node nao executou':'enabled:false')];
    let count;
    try { count=parseTap(r.stdout); }
    catch { return [result('tests','ERROR','TAP sem contagem valida'),result('coverage',cc.enabled?'ERROR':'N/A',cc.enabled?'execucao TAP invalida':'enabled:false')]; }
    const tr=result('tests',count>0&&r.status===0?'PASS':'FAIL',count===0?'nenhum teste encontrado':r.status===0?'':'teste falhando',{count});
    if(!cc.enabled) return [tr,result('coverage','N/A','enabled:false')];
    if(tr.state!=='PASS') return [tr,result('coverage','FAIL','execucao de testes sem sucesso')];
    try {
      const percent=parseLcov(fs.readFileSync(lcov,'utf8'),root,c);
      const drop=mode==='baseline'?baseline.coverage-percent:0;
      return [tr,result('coverage',drop>cc.maxDrop+1e-9?'FAIL':'PASS',drop>cc.maxDrop+1e-9?'queda de cobertura':'',{percent,drop})];
    } catch { return [tr,result('coverage','ERROR','LCOV ausente ou invalido')]; }
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
}
