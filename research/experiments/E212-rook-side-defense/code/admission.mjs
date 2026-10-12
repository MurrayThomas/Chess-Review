import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved as oldSaved} from '../../E211-rook-tablebase-admission/code/saved.mjs';
import {context,python} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {collectObservedRookPanel} from '../../E211-rook-tablebase-admission/code/collect-observed.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
const dir='research/experiments/E212-rook-side-defense',tokens=new WeakMap();
export const artifactHashes={
 'long-pilot':'a98d1123553a0e950ff6d712154ce245a92b9212cca5ae4a4d08d16d9a41bd67',
 'short-pilot':'22b03bddbf712e6ce9b8495c0d3468425a6054d5b9aa34187b7d02ec03e972d2',
 'long-reflection':'74608bd7f696c8323e9da2fbf1a7c1f4fa459b18ce167edee042cffe37539c1d',
};
function seal(input,view,source){const token=Object.freeze({});tokens.set(token,structuredClone({input,view,source}));return token;}
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted rook observation');return structuredClone(tokens.get(token));}
// These capabilities can only originate from fixed authenticated saved bytes or
// the guarded local collector; structural legality cannot authenticate WDL truth.
export async function admitSaved(){
 const ctx=await context(),out=[];
 for(const [id,hash]of Object.entries(artifactHashes)){const bytes=await readFile(dir+'/evidence/'+id+'.json');assert.equal(sha256(bytes),hash);const r=JSON.parse(bytes);await assertSourceEpochs(r.inputHashes);const view=(await readHistoricalPanel('E212/'+id)).view;out.push({id,token:seal(r.input,view,{artifact:dir+'/evidence/'+id+'.json',sha256:hash,ruleModel:view.outcomeScope})});}
 const old=await oldSaved();for(const r of old.rows.filter(r=>r.fixture.id==='rook-pawn-root'||r.fixture.id==='rook-pawn-root-black'))out.push({id:r.fixture.id,token:seal(r.fixture.input,r.view,{artifact:'E211 fixed archive',sha256:old.archiveSha256,ruleModel:r.view.outcomeScope,legacySuccessStderrUnavailable:true})});
 return out;
}
export async function collectAdmission(input,options={maxProbes:128}){
 const ctx=await context(),bundle=await collectObservedRookPanel(input,options,python),view=checkObservedRookPanel(input,options,bundle,ctx);
 if(view.status!=='observed')return{token:null,bundle};
 return{token:seal(input,view,{kind:'guarded-live-V2',tablebaseReceipt:bundle.tablebaseReceipt,probeSource:bundle.probeSource,execution:bundle.execution,ruleModel:view.outcomeScope}),bundle};
}
