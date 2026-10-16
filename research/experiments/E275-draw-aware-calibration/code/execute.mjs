// Provenance-only launcher. All game access and scientific work stay in the
// unchanged, hash-frozen run.mjs entry point and its guarded loader.
import assert from 'node:assert/strict';
import {mkdir,readFile,stat,writeFile} from 'node:fs/promises';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import path from 'node:path';
const [mode,...args]=process.argv.slice(2);
assert.ok(['freeze','fit','evaluate','verify'].includes(mode)&&args.length===2&&args[0]==='--out');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);
assert.ok(out.startsWith(path.join(root,'research','runs','E275')+path.sep));
for(const name of ['claim.json','execution-time.json']){
  try{await stat(path.join(out,name));throw Error('Refusing to reuse a claimed run: '+out);}catch(e){if(e.code!=='ENOENT')throw e;}
}
await mkdir(out,{recursive:true});
const startedUtc=new Date().toISOString(),sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
const entry=fileURLToPath(new URL('run.mjs',import.meta.url));
const result=spawnSync(process.execPath,[entry,mode,...args],{cwd:root,stdio:'inherit',windowsHide:true});
const record={schema:'E275-execution-time-v1',studyRegistrationDate:'2026-10-15',startedUtc,endedUtc:new Date().toISOString(),
  clientTimezone:'Europe/Copenhagen',mode,command:[process.execPath,entry,mode,...args],sourceRevision,
  launcherSha256:createHash('sha256').update(await readFile(fileURLToPath(import.meta.url))).digest('hex'),
  exitCode:result.status??1,signal:result.signal??null,error:result.error?.message??null,
  interpretation:'Child receipt date identifies the study registration; these UTC timestamps record actual execution. No scientific code, inputs or parameters changed.'};
await writeFile(path.join(out,'execution-time.json'),JSON.stringify(record,null,2)+'\n',{flag:'wx'});
process.exitCode=record.exitCode;
