import assert from 'node:assert/strict';
import {access,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitSaved,readAdmission} from './admission.mjs';
import {inspectEndgameEquality} from './equality.mjs';
import {checkEndgameEquality} from './check-result.mjs';
const dir='research/experiments/E220-source-qualified-endgame-equality';await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/reuse-started.json');throw Error('Refusing to restart registered reuse pilot');}catch(e){if(e.code!=='ENOENT')throw e;}
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs']);await writeFile(dir+'/evidence/reuse-started.json',JSON.stringify({revision,inputHashes},null,2)+'\n',{flag:'wx'});
const start=performance.now(),cases=[];let failure=null;
try{const rows=await admitSaved();assert.equal(rows.length,6);for(const r of rows){const options={enabled:true,player:r.input.fen.split(' ')[1]},result=inspectEndgameEquality(r.input,options,r.token);checkEndgameEquality(r.input,options,r.token,result);const a=readAdmission(r.token),row={id:r.id,role:r.role,input:r.input,options,result,observedRootWdl:a.root.view.root.wdl};cases.push(row);await writeFile(dir+'/evidence/'+r.id+'.json',JSON.stringify({revision,inputHashes,...row},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({id:r.id,role:r.role,status:result.status,rootWdl:row.observedRootWdl,records:result.requiredRecords}));if(r.role==='equality-pair')assert.equal(result.available,true);else assert.equal(result.status,'nonzero-outcome');}assert.ok(cases.filter(r=>r.role==='nonzero-control').some(r=>r.observedRootWdl!==0));}catch(e){failure=e.message;}
const seconds=(performance.now()-start)/1000;if(seconds>5)failure??='Registered5second admission limit exceeded';await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,inputHashes,seconds,failure,passes:!failure,cases:cases.map(r=>({id:r.id,role:r.role,status:r.result.status,rootWdl:r.observedRootWdl}))},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({seconds,passes:!failure,failure,freshProbes:0}));
