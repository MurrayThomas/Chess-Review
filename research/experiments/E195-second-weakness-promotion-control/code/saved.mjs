import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {key} from '../../E191-tactical-decision-timing/code/saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {parents} from './parent-saved.mjs';
export async function saved(){const a=await parents(),dir='research/experiments/E195-second-weakness-promotion-control',file=dir+'/evidence/observations.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes)),cf=dir+'/evidence/context-checks.json',cb=await readFile(cf),context=JSON.parse(cb);assert.deepEqual(raw.datasetReceipt,a.receipt);assert.deepEqual(raw.parentArchives,a.hashes);assert.deepEqual(raw.sourceHashes,await bindings([dir+'/code/collect.mjs']));assert.equal(raw.contextChecksSha256,sha256(cb));assert.equal(context.passed,true);assert.deepEqual(context.datasetReceipt,a.receipt);assert.deepEqual(context.sourceHashes,await bindings([dir+'/code/context-smoke.mjs']));assert.equal(raw.rows.length,6);for(const r of raw.rows){assert.equal(r.key,key('structure',r.input,{ownPlies:r.options.plies??2}));assert.equal(r.reuseMatches,r.fresh?0:1);}return{receipt:a.receipt,hashes:{...a.hashes,[file]:sha256(bytes),[cf]:sha256(cb)},rows:raw.rows,context,find(input,H){const k=key('structure',input,{ownPlies:H}),index=raw.rows.findIndex(r=>r.key===k);return index>=0?{panel:raw.rows[index].panel,ref:{file,index}}:a.find(input,H);}};}
