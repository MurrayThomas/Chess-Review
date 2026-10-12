import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {admitSaved as parentSaved,readAdmission as parentRead,collectAdmission as parentCollect} from '../../E212-rook-side-defense/code/admission.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
const dir='research/experiments/E213-short-side-king-choice',tokens=new WeakMap();
export const artifactHashes={d2:'8dc473b13d5cee97b551692742ef530b0b83c5622936fcf105bd645438ca771c',b2:'6c4703c5b8881ba7d8771749bb351dbcc73a4517b2c5e6c28e1aaab001d321a2',h2:'141a99d7e8cbe55d89358ee0dab43c39a1fb82215c050b76212295142cd6ad6f',reflection:'55b1e8d7b6ab1c305c1381769558bb11964167dfc10288b6ae3fea1619170a28'};
function seal(value){const token=Object.freeze({});tokens.set(token,structuredClone(value));return token;}
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted short-side observation');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 const ctx=await context(),rows=[];
 for(const [id,hash]of Object.entries(artifactHashes)){const bytes=await readFile(dir+'/evidence/'+id+'.json');assert.equal(sha256(bytes),hash);const r=JSON.parse(bytes);await assertSourceEpochs(r.inputHashes);const view=(await readHistoricalPanel('E213/'+id)).view;rows.push({id,token:seal({input:r.input,view,source:{artifact:dir+'/evidence/'+id+'.json',sha256:hash,ruleModel:view.outcomeScope}})});}
 for(const r of await parentSaved())rows.push({id:'E212-'+r.id,token:seal(parentRead(r.token))});return rows;
}
// The parent collector takes authored input, never caller-supplied outcome data.
export async function collectAdmission(input,options={maxProbes:128}){const r=await parentCollect(input,options);return{token:r.token?seal(parentRead(r.token)):null,bundle:r.bundle};}
