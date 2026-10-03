import fs from 'node:fs';
import path from 'node:path';
import {result,run,npmCommand,batches} from './gate-core.mjs';
import {selectFiles} from './gate-scope.mjs';
const levels={INFO:'low',LOW:'low',WARNING:'medium',MEDIUM:'medium',ERROR:'high',HIGH:'high',CRITICAL:'critical'};
export function semgrepFromJson(data,root) {
  if(!Array.isArray(data.results)||!Array.isArray(data.errors)||data.errors.length) throw Error('Semgrep JSON/analise invalida');
  return data.results.map(r=>{
    const severity=levels[r.extra?.severity], file=path.relative(root,path.resolve(root,r.path)).split(path.sep).join('/');
    if(!severity||typeof r.check_id!=='string'||!Number.isInteger(r.start?.line)||file.startsWith('../')||path.isAbsolute(file)) throw Error('Semgrep achado invalido');
    return {rule:r.check_id,file,line:r.start.line,severity};
  });
}
export function checkSemgrep(root,c,mode) {
  const cfg=c.checks.semgrep;
  if(!cfg.enabled) return result('semgrep','N/A','enabled:false');
  const files=selectFiles(root,c,mode);
  if(files.length===0) return result('semgrep','N/A','nenhum arquivo no escopo',{findings:[]});
  const findings=[], missingFiles=[];
  const finish=(state,reason)=>result('semgrep',state==='SKIP'&&findings.some(f=>f.severity!=='low')?'FAIL':state,reason,{findings,missingFiles});
  const prefix=[...cfg.command,'scan',...cfg.rules.flatMap(rule=>['--config',rule]),'--json','--metrics=off','--disable-version-check'];
  for(const argv of batches(prefix,files.map(file=>path.join(root,file)))) {
    const requested=argv.slice(prefix.length);
    const r=run(argv,root);
    if(r.missing) return finish('SKIP','Semgrep ausente; instalar CE 1.179.0');
    if(r.error || ![0,1].includes(r.status)) {
      // Somente mensagem conhecida e explicita permite classificar falta de suporte.
      if(/(?:not supported|unsupported) (?:on )?windows/i.test(r.stderr)) return finish('SKIP','Semgrep declarou falta de suporte ao Windows');
      return finish('ERROR','Semgrep nao executou corretamente');
    }
    try {
      const data=JSON.parse(r.stdout);
      const clean=semgrepFromJson(data,root);
      if(!Array.isArray(data.paths?.scanned)) throw Error('Semgrep paths invalido');
      findings.push(...clean);
      for(const file of requested) if(!data.paths.scanned.some(p=>path.resolve(root,p)===file)) missingFiles.push(path.relative(root,file).split(path.sep).join('/'));
    }
    catch { return finish('ERROR','Semgrep JSON/analise invalida'); }
  }
  if(missingFiles.length) return finish('SKIP','Semgrep nao analisou arquivo no escopo; conferir ignores/tamanho');
  return finish(findings.some(f=>f.severity!=='low')?'FAIL':'PASS',findings.some(f=>f.severity!=='low')?'achado de seguranca media ou superior':'');
}
export function checkAudit(root,c,command) {
  if(!c.checks.audit.enabled) return result('audit','N/A','enabled:false');
  const pkg=path.join(root,'package.json');
  if(!fs.existsSync(pkg)) return result('audit','N/A','sem package.json/dependencias do app');
  let p;
  try { p=JSON.parse(fs.readFileSync(pkg,'utf8')); }
  catch { return result('audit','ERROR','package.json do app invalido'); }
  const applicable=['dependencies','devDependencies','optionalDependencies','peerDependencies'].some(k=>p[k] && Object.keys(p[k]).length);
  if(!applicable) return result('audit','N/A','sem dependencias do app');
  if(command===undefined) command=npmCommand();
  if(!command) return result('audit','SKIP','npm CLI ausente');
  const r=run([...command,'audit','--audit-level=high','--json'],root);
  if(r.missing) return result('audit','SKIP','npm ausente');
  if(r.error||![0,1].includes(r.status)) return result('audit','ERROR','npm audit nao executou corretamente');
  try {
    const j=JSON.parse(r.stdout), counts=j.metadata?.vulnerabilities;
    if(j.error || j.auditReportVersion!==2 || !counts || !['info','low','moderate','high','critical'].every(k=>Number.isInteger(counts[k])&&counts[k]>=0)) throw Error('audit invalido');
    return result('audit',counts.high+counts.critical>0?'FAIL':'PASS',counts.high+counts.critical>0?'dependencia alta/critica':'',{counts});
  } catch { return result('audit','ERROR','npm audit JSON/lock invalido; conferir package-lock.json do app'); }
}
