import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {boardFen} from '../../FRIEND-shared/lib.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {pilotContrast} from './geometry.mjs';
const dir='research/experiments/E212-rook-side-defense',ctx=await context();
const prior=JSON.parse(await readFile('research/experiments/E211-rook-tablebase-admission/support.json','utf8'));assert.deepEqual(prior.inputHashes,await bindings(Object.keys(prior.inputHashes)));
await mkdir(dir+'/evidence',{recursive:true});for(const name of ['long','short']){try{await access(dir+'/evidence/'+name+'-pilot.json');throw Error('Refusing to overwrite '+name+' pilot');}catch(e){if(e.code!=='ENOENT')throw e;}}
const inputHashes=await bindings([dir+'/plan.md',dir+'/code/pilot.mjs',...Object.keys(prior.inputHashes)]),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
for(const kind of ['long','short']){
 const fen=boardFen({f5:'K',f6:'P',e2:'R',[kind==='long'?'h7':'f8']:'k',a8:'r'},'b'),input={fen,history:{fen,moves:[]}},options={maxProbes:128},start=performance.now();
 const bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-start)/1000;
 // Preserve actual process evidence before any semantic assertion or hypothesis gate.
 await writeFile(dir+'/evidence/'+kind+'-pilot.json',JSON.stringify({revision,inputHashes,kind,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});
 const view=checkObservedRookPanel(input,options,bundle,ctx),contrast=pilotContrast(view,kind),summary={kind,seconds,probes:bundle.requiredProbes,contrast,costPass:seconds<=3};
 await writeFile(dir+'/evidence/'+kind+'-decision.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(summary));if(seconds>3)break;
}
