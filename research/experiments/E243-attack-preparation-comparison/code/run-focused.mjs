import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {spawnSync,execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {openResearchData} from '../../../data-policy.mjs';
import {cases,positiveControl,on} from './fixtures.mjs';
import {inspectAttackPreparation,collectFixedPolicy} from './comparison.mjs';
import {checkComparison,rejectedPreparation} from './check-result.mjs';
const dir='research/experiments/E243-attack-preparation-comparison',out=dir+'/evidence/amended',guard=await openResearchData(['D001'],{purpose:'test'});await mkdir(out,{recursive:true});
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/AMENDMENT.md',dir+'/code/run-focused.mjs',dir+'/code/comparison.test.mjs','research/concepts/catalog.json']),receipt=guard.receipt;
await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});
const rows=[];let error=null;try{for(const input of [...cases(),positiveControl()]){const policy=!!input.followup,row={input,policy,result:null,rejection:null,seconds:null};rows.push(row);const t=performance.now();try{row.result=(policy?collectFixedPolicy:inspectAttackPreparation)(input,on);checkComparison(input,on,row.result,policy);}catch(e){if(policy||e.message!=='Illegal attack/preparation')throw e;row.rejection=rejectedPreparation(input);}row.seconds=(performance.now()-t)/1000;if(row.result&&rows.filter(r=>r.result).length===1)assert(row.seconds<=1,'Representative exceeds one second');}assert(rows.at(-1).result.context.tree.allMate);}catch(e){error=e.stack;}
await writeFile(out+'/'+(error?'pilot-failure':'pilot')+'.json.gz',gzipSync(JSON.stringify({revision,inputHashes,receipt,rows,error,freshSearches:0})+'\n'),{flag:'wx'});console.log(JSON.stringify({cases:rows.length,seconds:rows.reduce((n,r)=>n+(r.seconds??0),0),first:rows.find(r=>r.result)?.seconds,statuses:rows.map(x=>({id:x.input.id,status:x.result?.status??x.rejection?.kind})),error}));assert.equal(error,null);
const t=performance.now(),r=spawnSync(process.execPath,['--test',dir+'/code/comparison.test.mjs'],{encoding:'utf8',windowsHide:true,timeout:30000}),seconds=(performance.now()-t)/1000;
await writeFile(out+'/'+(r.status===0?'focused-checks':'focused-failure')+'.json',JSON.stringify({revision,inputHashes,receipt,command:'node --test '+dir+'/code/comparison.test.mjs',seconds,exitCode:r.status,signal:r.signal,error:r.error?.message??null,stdout:r.stdout,stderr:r.stderr},null,2)+'\n',{flag:'wx'});console.log(r.stdout);console.error(r.stderr);assert.equal(r.status,0);console.log(JSON.stringify({seconds}));
