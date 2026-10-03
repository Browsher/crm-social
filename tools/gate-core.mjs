import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
export const names = ['tests','coverage','complexity','semgrep','audit'];
export function result(name,state,reason='',data={}) {
  if (!['PASS','FAIL','N/A','SKIP','ERROR'].includes(state)) throw new Error('estado invalido');
  if (['N/A','SKIP'].includes(state) && !reason) throw new Error('motivo obrigatorio');
  return { name, state, reason, ...data };
}
export function exitCode(rows,strict) {
  if (rows.some(r => r.state==='ERROR')) return 2;
  if (rows.some(r => r.state==='FAIL' || (strict && r.state==='SKIP'))) return 1;
  return 0;
}
export function configError(message) {
  return Object.assign(new Error(message), {code:3});
}
export function loadConfig(root) {
  try {
    const c=JSON.parse(fs.readFileSync(path.join(root,'quality-gate.config.json'),'utf8'));
    const modes=['full','changed','baseline'];
    const strings = a => Array.isArray(a) && a.length>0 && a.every(x=>typeof x==='string' && x.length>0 && !x.includes('\0'));
    if (c.schemaVersion!==1 || !/^\d+\.\d+\.\d+$/.test(c.nodeVersion)) throw Error('nodeVersion deve ser major.minor.patch');
    if (!strings(c.testCommand) || c.testCommand[0]!=='node' || !c.testCommand.includes('--test')) throw Error('testCommand deve ser argv do node --test (TAP)');
    if (c.testCommand.some(x=>/^--test-reporter|^--test-coverage|^--experimental-test-coverage/.test(x))) throw Error('reporters/cobertura pertencem ao gate');
    if (!modes.includes(c.mode) || typeof c.baseBranch!=='string' || !c.baseBranch || c.baseBranch.startsWith('-')) throw Error('modo/baseBranch invalidos');
    if (!strings(c.include) || !strings(c.exclude)) throw Error('include/exclude invalidos');
    for (const n of names) {
      if (typeof c.checks?.[n]?.enabled!=='boolean' || !modes.includes(c.checks[n].mode)) throw Error('checagem invalida: '+n);
    }
    const {coverage,complexity,semgrep,audit}=c.checks;
    if (!Number.isFinite(coverage.maxDrop) || coverage.maxDrop<0 || coverage.maxDrop>100) throw Error('maxDrop invalido');
    if (!Number.isInteger(complexity.failAt) || !Number.isInteger(complexity.warnAt) || complexity.warnAt<1 || complexity.failAt<=complexity.warnAt) throw Error('limites de complexidade invalidos');
    if (!strings(semgrep.command) || !strings(semgrep.rules)) throw Error('comando/regras Semgrep invalidos');
    if (semgrep.minSeverity!=='medium' || audit.minSeverity!=='high') throw Error('limites de seguranca: medium/high');
    if (coverage.enabled && !c.checks.tests.enabled) throw Error('cobertura exige testes habilitados');
    return c;
  } catch(e) { throw configError('quality-gate.config.json: '+(e.name==='SyntaxError'?'JSON invalido':e.message)); }
}
export function run(argv,cwd) {
  const env={...process.env,SEMGREP_ENABLE_VERSION_CHECK:'0'};
  delete env.NODE_TEST_CONTEXT;
  const r=spawnSync(argv[0],argv.slice(1),{
    cwd, encoding:'utf8', shell:false, windowsHide:true,
    timeout:1200000, maxBuffer:64*1024*1024,
    env
  });
  return {status:r.status,stdout:r.stdout??'',stderr:r.stderr??'',missing:r.error?.code==='ENOENT',error:r.error?.code??null};
}
export function batches(prefix,files,limit=8000) {
  // Contagem conservadora inclui aspas/escape de cada caractere e separadores.
  const size=argv=>argv.reduce((n,a)=>n+2*a.length+3,0);
  if(size(prefix)>=limit) throw Error('prefixo de argv excede limite');
  const out=[]; let chunk=[];
  for(const file of files) {
    if(size([...prefix,file])>=limit) throw Error('arquivo excede limite de argv');
    if(size([...prefix,...chunk,file])>=limit) { out.push([...prefix,...chunk]); chunk=[]; }
    chunk.push(file);
  }
  if(chunk.length) out.push([...prefix,...chunk]);
  return out;
}
export function npmCommand() {
  const candidates=[
    path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js'),
    path.resolve(path.dirname(process.execPath),'../node_modules/npm/bin/npm-cli.js')
  ];
  for (const dir of (process.env.PATH??'').split(path.delimiter)) {
    const file=path.join(dir,process.platform==='win32'?'npm.cmd':'npm');
    if (fs.existsSync(file)) {
      candidates.push(path.join(dir,'node_modules/npm/bin/npm-cli.js'));
      if (process.platform!=='win32') candidates.push(fs.realpathSync(file));
    }
  }
  const cli=candidates.find(p=>fs.existsSync(p) && p.endsWith('npm-cli.js'));
  return cli?[process.execPath,cli]:null;
}
