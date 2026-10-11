import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync,spawnSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved,controls,panel,dir} from './saved.mjs';
import {inspectPawnObstruction} from './assay.mjs';
import {checkPawnObstruction} from './check-result.mjs';
const guard=await openResearchData(['D001'],{purpose:'test'}),p=await saved(guard.receipt),out=dir+'/evidence/focused';await mkdir(out,{recursive:true});
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/assay.test.mjs',dir+'/code/record-evidence.mjs',...Object.keys(p.inputHashes)]),receipt=guard.receipt;await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});
const rows=[];let error=null;const start=performance.now();try{for(const x of p.rows){const result=inspectPawnObstruction(x.input,controls(x),panel(x));checkPawnObstruction(x.input,controls(x),panel(x),result);assert.equal(result.readinessCredit,false);rows.push({id:x.id,result});}}catch(e){error=e.stack;}
const seconds=(performance.now()-start)/1000;await writeFile(out+'/'+(error?'pilot-failure':'pilot')+'.json.gz',gzipSync(JSON.stringify({revision,inputHashes,receipt,rows,seconds,error,freshQueries:0})+'\n'),{flag:'wx'});console.log(JSON.stringify({rows:rows.length,seconds,error,observations:rows.map(r=>({id:r.id,nodes:r.result.nodes,observation:r.result.observation}))}));assert.equal(error,null);
const t=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/assay.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),focusedSeconds=(performance.now()-t)/1000;await writeFile(out+'/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt,command:'node --test '+dir+'/code/assay.test.mjs',seconds:focusedSeconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshQueries:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({focusedSeconds}));
