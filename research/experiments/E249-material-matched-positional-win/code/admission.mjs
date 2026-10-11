import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
import {parents,after} from './parents.mjs';
export const dir='research/experiments/E249-material-matched-positional-win';const tokens=new WeakMap();
export function snapshot(token){assert(tokens.has(token),'Unadmitted stopped-study observations');return structuredClone(tokens.get(token));}
export function verifySaved(record,ctx){const view=checkObservedRookPanel(record.input,record.options,record.bundle,ctx);assert.equal(record.error,null);return view;}
export async function admitSaved(){const guard=await openResearchData(['D001'],{purpose:'test'}),ctx=await context(),lock=JSON.parse(await readFile(dir+'/code/archive-lock.json','utf8'));assert.equal(lock.schema,'E249-stopped-archive-v1');for(const [file,h]of Object.entries(lock.evidenceHashes))assert.equal(sha256(await readFile(dir+'/evidence/'+file)),h);const report=JSON.parse(await readFile(dir+'/evidence/collection-failure.json','utf8'));assert.equal(report.observed.length,1);assert.equal(report.positionProbes,15);assert.match(report.error,/Panel exceeds three-second gate/);assert.deepEqual(report.inputHashes,await bindings(Object.keys(report.inputHashes)));assert.deepEqual(report.receipt,guard.receipt);const family=(await parents(ctx)).find(r=>r.id==='h2'),raw=JSON.parse(gunzipSync(await readFile(dir+'/evidence/h2-win.json.gz')));assert.deepEqual(raw.input,after(family.roles.win.input));assert.deepEqual(raw.inputHashes,report.inputHashes);assert.equal(raw.seconds,report.observed[0].seconds);assert(raw.seconds>3);assert.equal(raw.revision,report.revision);const view=verifySaved(raw,ctx),token=Object.freeze({});tokens.set(token,structuredClone({family,raw,view,costGatePassed:false,completedPanels:1,plannedPanels:4}));return{input:structuredClone(family.roles.win.input),token,ctx};}
