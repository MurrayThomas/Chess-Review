import assert from 'node:assert/strict';
import {readFile,writeFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {reflect} from '../../FRIEND-shared/lib.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {pilotContrast} from './geometry.mjs';
const dir='research/experiments/E212-rook-side-defense',file=dir+'/evidence/long-reflection.json',ctx=await context(),base=JSON.parse(await readFile(dir+'/evidence/long-pilot.json','utf8'));
assert.deepEqual(base.inputHashes,await bindings(Object.keys(base.inputHashes)));assert.ok(pilotContrast(checkObservedRookPanel(base.input,base.options,base.bundle,ctx),'long').passes);assert.ok(base.seconds<=3);
try{await access(file);throw Error('Refusing to overwrite reflection');}catch(e){if(e.code!=='ENOENT')throw e;}
const f=reflect({id:'long',fen:base.input.fen,history:base.input.history,move:'a8a5'}),input={fen:f.fen,history:f.history},options={maxProbes:128},inputHashes=await bindings([dir+'/code/reflect-pilot.mjs',...Object.keys(base.inputHashes)]),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),start=performance.now(),bundle=await collectObservedRookPanel(input,options,python),seconds=(performance.now()-start)/1000;
await writeFile(file,JSON.stringify({revision,inputHashes,input,options,bundle,seconds},null,2)+'\n',{flag:'wx'});const contrast=pilotContrast(checkObservedRookPanel(input,options,bundle,ctx),'long');
await writeFile(dir+'/evidence/reflection-decision.json',JSON.stringify({seconds,probes:bundle.requiredProbes,contrast,costPass:seconds<=3},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({seconds,probes:bundle.requiredProbes,contrast,costPass:seconds<=3}));
