import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {Chess} from '../../../../lib/chess.js';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {admitSaved,readAdmission} from '../../E212-rook-side-defense/code/admission.mjs';
import {inspectMaterialActivity} from '../../E244-static-material-dynamic-resource/code/contrast.mjs';
const dir='research/experiments/E245-adaptive-rook-defense',out=dir+'/evidence',guard=await openResearchData(['D001'],{purpose:'test'}),parent=JSON.parse(await readFile('research/experiments/E244-static-material-dynamic-resource/build.json','utf8'));
assert.deepEqual(parent.inputHashes,await bindings(Object.keys(parent.inputHashes)));await mkdir(out,{recursive:true});
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),inputHashes=await bindings([dir+'/plan.md',dir+'/code/collect-pilot.mjs',...Object.keys(parent.inputHashes)]),receipt=guard.receipt;
await writeFile(out+'/started.json',JSON.stringify({revision,inputHashes,receipt},null,2)+'\n',{flag:'wx'});
const observed=[],groups=[];let error=null;const ctx=await context(),sources=(await admitSaved()).filter(s=>['long-pilot','long-reflection'].includes(s.id));
function consistent(v){if(v.rows.length)assert.equal(v.root.wdl,Math.max(...v.rows.map(r=>r.rootActorWdl)));}
function after(input,move){const c=new Chess(input.fen);c.move(move);return{fen:c.fen(),history:{fen:input.history.fen,moves:[...input.history.moves,move]}};}
async function collect(id,input){
 const options={maxProbes:128},t=performance.now();let bundle=null,view=null,collectionError=null;
 try{bundle=await collectObservedRookPanel(input,options,python);view=checkObservedRookPanel(input,options,bundle,ctx);consistent(view);}catch(e){collectionError=e.stack;}
 const seconds=(performance.now()-t)/1000,record={id,input,options,revision,inputHashes,receipt,bundle,seconds,error:collectionError},bytes=gzipSync(JSON.stringify(record)+'\n'),file=id+'.json.gz';
 await writeFile(out+'/'+file,bytes,{flag:'wx'});observed.push({id,file,sha256:sha256(bytes),seconds,probes:view?.probes??0,error:collectionError});console.log(JSON.stringify(observed.at(-1)));
 assert.equal(collectionError,null);assert(seconds<=3,'Panel exceeds unchanged three-second gate');assert(observed.length<=12);assert(observed.reduce((n,r)=>n+r.probes,0)<=1536);return{file,sha256:sha256(bytes),input,view};
}
try{for(const s of sources){const root=readAdmission(s.token),move=s.id==='long-pilot'?'a8a5':'a1a4',input={...root.input,move},rootResult=inspectMaterialActivity(input,{enabled:true},s.token);assert(rootResult.available);consistent(root.view);
 const group={id:s.id,input,rootSource:root.source,afterCheck:null,replies:[]};groups.push(group);
 group.afterCheck=await collect(s.id+'-after-check',after(root.input,move));assert.equal(group.afterCheck.view.root.wdl,root.view.rows.find(r=>r.move===move).wdl);
 for(const r of group.afterCheck.view.rows){const branch=await collect(s.id+'-after-'+r.move,after(group.afterCheck.input,r.move));assert.equal(branch.view.root.wdl,r.wdl);group.replies.push({reply:r.move,...branch});}
 }assert.equal(groups.length,2);assert.equal(observed.length,12);}catch(e){error=e.stack;}
const report={revision,inputHashes,receipt,groups:groups.map(g=>({...g,afterCheck:g.afterCheck&&{file:g.afterCheck.file,sha256:g.afterCheck.sha256},replies:g.replies.map(r=>({reply:r.reply,file:r.file,sha256:r.sha256}))})),observed,totalSeconds:observed.reduce((n,r)=>n+r.seconds,0),positionProbes:observed.reduce((n,r)=>n+r.probes,0),reusedRootPanels:2,error};
await writeFile(out+'/'+(error?'collection-failure':'collection')+'.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({panels:observed.length,positionProbes:report.positionProbes,seconds:report.totalSeconds,error}));assert.equal(error,null);
await writeFile(dir+'/code/archive-lock.json',JSON.stringify({schema:'E245-fixed-archive-lock',collection:{file:'collection.json',sha256:sha256(await readFile(out+'/collection.json'))},panels:observed.map(({id,file,sha256})=>({id,file,sha256}))},null,2)+'\n',{flag:'wx'});
