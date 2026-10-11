import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Chess} from '../../../../lib/chess.js';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {phaseContrast} from './geometry.mjs';
const dir='research/experiments/E214-named-rook-defense-phases',ctx=await context(),parent=JSON.parse(await readFile('research/experiments/E213-short-side-king-choice/build.json','utf8'));assert.deepEqual(parent.inputHashes,await bindings(Object.keys(parent.inputHashes)));await mkdir(dir+'/evidence',{recursive:true});
try{await access(dir+'/evidence/collection-started.json');throw Error('Refusing to restart registered collection');}catch(e){if(e.code!=='ENOENT')throw e;}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs',...Object.keys(parent.inputHashes)]),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();await writeFile(dir+'/evidence/collection-started.json',JSON.stringify({revision,inputHashes},null,2)+'\n',{flag:'wx'});
const barrier=boardFen({d5:'K',e5:'P',h2:'R',e8:'k',a6:'r'},'b'),p=new Chess(barrier);p.move('a6b6');p.move('e5e6');const authored={
 'philidor-barrier':{fen:barrier,history:{fen:barrier,moves:[]}},
 'philidor-retreat':{fen:p.fen(),history:{fen:barrier,moves:['a6b6','e5e6']}},
 'vancura-pressure':{fen:boardFen({a5:'K',a6:'P',a8:'R',g7:'k',f6:'r'},'b')},
 'vancura-check':{fen:boardFen({b6:'K',a6:'P',a8:'R',g7:'k',f5:'r'},'b')},
};for(const input of Object.values(authored))input.history??={fen:input.fen,moves:[]};
const decisions=[],families={};let stoppedForCost=false;
async function observe(id,phase,input){const options={maxProbes:128},start=performance.now(),bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-start)/1000;await writeFile(dir+'/evidence/'+id+'.json',JSON.stringify({revision,inputHashes,phase,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});const view=checkObservedRookPanel(input,options,bundle,ctx),contrast=phaseContrast(input,view,phase),decision={id,phase,seconds,probes:bundle.requiredProbes,contrast,costPass:seconds<=3};decisions.push(decision);await writeFile(dir+'/evidence/'+id+'-decision.json',JSON.stringify(decision,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(decision));if(!decision.costPass)stoppedForCost=true;return decision;}
for(const [family,phases]of [['philidor',['philidor-barrier','philidor-retreat']],['vancura',['vancura-pressure','vancura-check']]]){
 let passes=true;for(const phase of phases){if(stoppedForCost){passes=false;break;}const d=await observe(phase,phase,authored[phase]);if(!d.contrast.passes||phase==='philidor-barrier'&&!d.contrast.resources.includes('a6b6')){passes=false;break;}}
 if(passes&&!stoppedForCost)for(const phase of phases){const f=reflect({id:phase,fen:authored[phase].fen,history:authored[phase].history,move:'a1a2'}),d=await observe(phase+'-reflection',phase,{fen:f.fen,history:f.history});if(!d.contrast.passes||stoppedForCost){passes=false;break;}}
 families[family]=passes&&!stoppedForCost;if(stoppedForCost)break;
}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,decisions,families,stoppedForCost},null,2)+'\n',{flag:'wx'});
