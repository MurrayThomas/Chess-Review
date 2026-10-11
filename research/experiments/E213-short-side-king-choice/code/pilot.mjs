import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {boardFen,reflect} from '../../FRIEND-shared/lib.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {pilotContrast} from '../../E212-rook-side-defense/code/geometry.mjs';
const dir='research/experiments/E213-short-side-king-choice',ctx=await context(),parent=JSON.parse(await readFile('research/experiments/E212-rook-side-defense/build.json','utf8'));
assert.deepEqual(parent.inputHashes,await bindings(Object.keys(parent.inputHashes)));await mkdir(dir+'/evidence',{recursive:true});for(const id of ['d2','b2','h2','reflection']){try{await access(dir+'/evidence/'+id+'.json');throw Error('Refusing to overwrite pilot '+id);}catch(e){if(e.code!=='ENOENT')throw e;}}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs',...Object.keys(parent.inputHashes)]),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),decisions=[];
async function observe(id,input){const options={maxProbes:128},start=performance.now(),bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-start)/1000;
 await writeFile(dir+'/evidence/'+id+'.json',JSON.stringify({revision,inputHashes,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});const view=checkObservedRookPanel(input,options,bundle,ctx),contrast=pilotContrast(view,'short');contrast.passes=contrast.passes&&contrast.geometry.rookOnLongSide;const decision={id,seconds,probes:bundle.requiredProbes,contrast,costPass:seconds<=3};decisions.push(decision);await writeFile(dir+'/evidence/'+id+'-decision.json',JSON.stringify(decision,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(decision));return decision;}
for(const rook of ['d2','b2','h2']){const fen=boardFen({f5:'K',f6:'P',[rook]:'R',f8:'k',a8:'r'},'b'),input={fen,history:{fen,moves:[]}},decision=await observe(rook,input);if(!decision.costPass)break;if(decision.contrast.passes){const mirrored=reflect({id:rook,fen,history:input.history,move:'f8g8'});await observe('reflection',{fen:mirrored.fen,history:mirrored.history});break;}}
await writeFile(dir+'/evidence/decisions.json',JSON.stringify({revision,decisions,ready:decisions.some(d=>d.id!=='reflection'&&d.contrast.passes&&d.costPass)&&decisions.some(d=>d.id==='reflection'&&d.contrast.passes&&d.costPass)},null,2)+'\n',{flag:'wx'});
