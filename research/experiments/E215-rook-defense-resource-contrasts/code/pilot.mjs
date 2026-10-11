import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
import {retained} from '../../E214-named-rook-defense-phases/code/retained.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {contrast} from './contrast.mjs';
const dir='research/experiments/E215-rook-defense-resource-contrasts',{rows,ctx}=await retained(),parent=JSON.parse(await readFile('research/experiments/E214-named-rook-defense-phases/support.json','utf8'));assert.deepEqual(parent.inputHashes,await bindings(Object.keys(parent.inputHashes)));await mkdir(dir+'/evidence',{recursive:true});try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart collection');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs',...Object.keys(parent.inputHashes)]),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes},null,2)+'\n',{flag:'wx'});const decisions=[],families={};let stoppedForCost=false;
async function observe(id,phase,input){const options={maxProbes:128},start=performance.now(),bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-start)/1000;await writeFile(dir+'/evidence/'+id+'.json',JSON.stringify({revision,inputHashes,phase,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});const view=checkObservedRookPanel(input,options,bundle,ctx),q=contrast(input,view,phase),d={id,phase,seconds,probes:bundle.requiredProbes,contrast:q,costPass:seconds<=3};decisions.push(d);await writeFile(dir+'/evidence/'+id+'-decision.json',JSON.stringify(d,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(d));if(!d.costPass)stoppedForCost=true;return d;}
const reused=[['philidor-barrier','philidor-barrier'],['philidor-retreat','philidor-retreat'],['vancura-pressure','vancura-check-before-pressure']];for(const [id,phase]of reused){const r=rows.find(r=>r.id===id),q=contrast(r.input,r.view,phase);decisions.push({id:'E214-'+id,phase,contrast:q,reused:true});console.log(JSON.stringify({reused:id,phase,contrast:q}));}
for(const [family,pairs]of [['philidor',reused.slice(0,2)],['vancura',reused.slice(2)]]){
 let passes=true;for(const [id,phase]of pairs){if(stoppedForCost||!decisions.find(d=>d.id==='E214-'+id).contrast.passes){passes=false;break;}const r=rows.find(r=>r.id===id),f=reflect({id,fen:r.input.fen,history:r.input.history,move:'a1a2'}),d=await observe(phase+'-reflection',phase,{fen:f.fen,history:f.history});if(!d.contrast.passes||stoppedForCost){passes=false;break;}}
 if(family==='vancura'&&passes&&!stoppedForCost){const phase='vancura-check-at-pawn',fen=boardFen({b6:'K',a6:'P',a8:'R',g7:'k',f5:'r'},'b'),input={fen,history:{fen,moves:[]}},d=await observe(phase,phase,input);passes=d.contrast.passes&&!stoppedForCost;if(passes){const f=reflect({id:phase,fen,history:input.history,move:'a1a2'}),m=await observe(phase+'-reflection',phase,{fen:f.fen,history:f.history});passes=m.contrast.passes&&!stoppedForCost;}}
 families[family]=passes&&!stoppedForCost;if(stoppedForCost)break;
}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,decisions,families,stoppedForCost,reusedObservations:'previously exposed development, not fresh confirmation'},null,2)+'\n',{flag:'wx'});
