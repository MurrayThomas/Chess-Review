import {readHistoricalPanel} from '../../E270-combined-validation/code/historical-producer.mjs';
import {assertSourceEpochs} from '../../E270-combined-validation/code/source-epochs.mjs';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {parents,after} from './parents.mjs';
export const dir='research/experiments/E250-active-king-positional-contrast';const tokens=new WeakMap();
export function snapshot(token){assert(tokens.has(token),'Unadmitted active-king observations');return structuredClone(tokens.get(token));}
export function verifyRaw(raw,ctx){assert.equal(raw.error,null);return checkObservedRookPanel(raw.input,raw.options,raw.bundle,ctx);}
export async function admitSaved(){const guard=await openResearchData(['D001'],{purpose:'test'}),ctx=await context(),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8'));assert.equal(lock.schema,'E250-fixed-archive-v1');const bytes=await readFile(dir+'/evidence/collection.json');assert.equal(sha256(bytes),lock.collectionSha256);const report=JSON.parse(bytes);assert.equal(report.error,null);assert.equal(report.observed.length,4);assert.equal(report.positionProbes,56);assert(report.totalSeconds<=16);assert.deepEqual(report.receipt,guard.receipt);await assertSourceEpochs(report.inputHashes);const views=new Map();for(const p of lock.panels){assert.match(p.file,/^[a-z0-9-]+\.json\.gz$/);const bytes=await readFile(dir+'/evidence/'+p.file);assert.equal(sha256(bytes),p.sha256);const raw=JSON.parse(gunzipSync(bytes));assert.equal(raw.id,p.id);assert.equal(raw.revision,report.revision);assert.deepEqual(raw.inputHashes,report.inputHashes);assert(raw.seconds<=4);assert.equal(raw.error,null);const view=(await readHistoricalPanel('E250/'+p.id)).view;views.set(p.id,{raw,view,source:{path:dir+'/evidence/'+p.file,sha256:p.sha256}});}assert.equal(views.size,4);const out=[];for(const family of await parents(ctx)){const roles={};for(const role of ['win','draw']){const r=views.get(family.id+'-'+role);assert(r);assert.deepEqual(r.raw.input,after(family.roles[role].input));roles[role]=r;}const token=Object.freeze({});tokens.set(token,structuredClone({family,roles,collectionRevision:report.revision,collectionSha256:lock.collectionSha256}));out.push({id:family.id,input:structuredClone(family.roles.win.input),token,ctx:{data:ctx.data,probeSource:roles.win.raw.bundle.probeSource}});}return out;}
