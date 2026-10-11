import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync,spawnSync} from 'node:child_process';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {cases,on} from './fixtures.mjs';
import {inspectMaterialActivity} from './contrast.mjs';
import {checkMaterialActivity} from './check-result.mjs';
const dir='research/experiments/E244-static-material-dynamic-resource',guard=await openResearchData(['D001'],{purpose:'test'}),parent=JSON.parse(await readFile('research/experiments/E212-rook-side-defense/build.json','utf8'));assert.deepEqual(parent.inputHashes,await bindings(Object.keys(parent.inputHashes)));
await mkdir(dir+'/evidence',{recursive:true});const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/run-focused.mjs',dir+'/code/contrast.test.mjs','research/concepts/catalog.json',...Object.keys(parent.inputHashes)]),receipt=guard.receipt;await writeFile(dir+'/evidence/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});
const rows=[];let error=null,seconds=null;const t=performance.now();try{for(const x of await cases()){const result=inspectMaterialActivity(x.input,on,x.token);checkMaterialActivity(x.input,on,x.token,result);rows.push({id:x.id,input:x.input,expected:x.expected,result});assert.equal(result.available,x.expected,x.id);}seconds=(performance.now()-t)/1000;assert(seconds<=5,'Guarded complete pilot exceeds five seconds');assert.equal(rows.filter(r=>r.result.available).length,2);}catch(e){seconds=(performance.now()-t)/1000;error=e.stack;}
await writeFile(dir+'/evidence/'+(error?'pilot-failure':'pilot')+'.json.gz',gzipSync(JSON.stringify({revision,inputHashes,receipt,rows,seconds,error,freshProbes:0})+'\n'),{flag:'wx'});console.log(JSON.stringify({cases:rows.length,positives:rows.filter(r=>r.result.available).length,seconds,error}));assert.equal(error,null);
const start=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/contrast.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),focusedSeconds=(performance.now()-start)/1000;await writeFile(dir+'/evidence/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt,command:'node --test '+dir+'/code/contrast.test.mjs',seconds:focusedSeconds,exitCode:r.status,signal:r.signal,processError:r.error?.message??null,stdout:r.stdout,stderr:r.stderr,freshProbes:0},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({focusedSeconds}));
