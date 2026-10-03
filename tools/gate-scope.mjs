import fs from 'node:fs';
import path from 'node:path';
import { run, configError } from './gate-core.mjs';
export function effectiveMode(c,name,override) { return override??(c.mode!=='full'?c.mode:c.checks[name].mode); }
const forbidden=new Set(['node_modules','tools','data','.git','.quality-gate','.quality-gate-run','coverage']);
export function isExcludedDirectory(name) { return forbidden.has(name.toLowerCase()); }
export function selectFiles(root,c,mode) {
  const found=[];
  function walk(dir) {
    for(const entry of fs.readdirSync(dir,{withFileTypes:true})) {
      if(entry.isSymbolicLink()) continue;
      const abs=path.join(dir,entry.name);
      if(entry.isDirectory()) { if(!isExcludedDirectory(entry.name)) walk(abs); continue; }
      if(!entry.isFile()) continue;
      const rel=path.relative(root,abs).split(path.sep).join('/');
      if(c.include.some(g=>path.matchesGlob(rel,g)) && !c.exclude.some(g=>path.matchesGlob(rel,g))) found.push(rel);
    }
  }
  walk(root);
  if(mode!=='changed') return found.sort();
  const commands=[['git','diff','--name-only','-z','--diff-filter=ACMR',c.baseBranch,'--'],['git','ls-files','--others','--exclude-standard','-z']];
  const changed=new Set();
  for(const command of commands) {
    const r=run(command,root);
    if(r.error || r.status!==0) throw Error('changed exige Git e baseBranch existente: '+c.baseBranch);
    for(const p of r.stdout.split('\0').filter(Boolean)) changed.add(p.split('\\').join('/'));
  }
  return found.filter(f=>changed.has(f)).sort();
}
export function readBaseline(root,required) {
  const file=path.join(root,'.quality-gate/baseline.json');
  if(!fs.existsSync(file)) { if(required) throw configError('baseline ausente; rode --update-baseline em full'); return null; }
  try {
    const b=JSON.parse(fs.readFileSync(file,'utf8'));
    if(b.schemaVersion!==1 || !Number.isFinite(b.coverage) || b.coverage<0 || b.coverage>100 || !b.complexity || Array.isArray(b.complexity) || typeof b.complexity!=='object' || !Object.values(b.complexity).every(x=>Number.isInteger(x)&&x>=1)) throw Error('schema/metricas');
    return b;
  } catch(e) { throw configError('baseline invalida: '+e.message); }
}
export function saveBaseline(root,data) {
  const dir=path.join(root,'.quality-gate'); fs.mkdirSync(dir,{recursive:true});
  const file=path.join(dir,'baseline.json'), temp=path.join(dir,`baseline.${process.pid}.tmp`);
  try { fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n'); fs.renameSync(temp,file); }
  finally { fs.rmSync(temp,{force:true}); }
}
