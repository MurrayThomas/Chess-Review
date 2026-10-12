import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {admitSaved as roots,readAdmission as rootRead} from '../../E212-rook-side-defense/code/admission.mjs';
const dir='research/experiments/E245-adaptive-rook-defense',tokens=new WeakMap();
export function readAdmission(token){if(!tokens.has(token))throw Error('Unadmitted adaptive-defense observations');return structuredClone(tokens.get(token));}
export async function admitSaved(){
 await openResearchData(['D001'],{purpose:'test'});const ctx=await context(),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8')),reportBytes=await readFile(dir+'/evidence/'+lock.collection.file);assert.equal(sha256(reportBytes),lock.collection.sha256);
 const report=JSON.parse(reportBytes);assert.equal(report.error,null);assert.equal(report.observed.length,12);assert.equal(report.positionProbes,194);await assertSourceEpochs(report.inputHashes);
 const views=new Map();for(const p of lock.panels){assert.match(p.file,/^[a-z0-9-]+\.json\.gz$/);const bytes=await readFile(dir+'/evidence/'+p.file);assert.equal(sha256(bytes),p.sha256);const r=JSON.parse(gunzipSync(bytes));assert.equal(r.error,null);assert(r.seconds<=3);assert.deepEqual(r.inputHashes,report.inputHashes);assert.equal(r.revision,report.revision);assert.equal(r.id,p.id);views.set(p.file,{input:r.input,view:checkObservedRookPanel(r.input,r.options,r.bundle,ctx),source:{artifact:dir+'/evidence/'+p.file,sha256:p.sha256,successfulProcessMetadataRetained:true}});}
 assert.equal(views.size,12);const old=await roots(),out=[];for(const g of report.groups){const s=old.find(r=>r.id===g.id);assert(s);const root=rootRead(s.token);assert.deepEqual(g.input,{...root.input,move:g.id==='long-pilot'?'a8a5':'a1a4'});assert.deepEqual(g.rootSource,root.source);
  const afterCheck=views.get(g.afterCheck.file);assert(afterCheck);const replies=g.replies.map(r=>{const a=views.get(r.file);assert(a);return{reply:r.reply,...a};});assert.deepEqual(replies.map(r=>r.reply),afterCheck.view.rows.map(r=>r.move));
  const token=Object.freeze({});tokens.set(token,structuredClone({id:g.id,input:g.input,root,afterCheck,replies,collectionRevision:report.revision,collectionSha256:lock.collection.sha256}));out.push({id:g.id,input:structuredClone(g.input),token});
 }assert.equal(out.length,2);return out;
}
