import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {saved as inherited} from '../../E190-liquidation-commitment/code/saved.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export const key=i=>JSON.stringify([i.fen,i.history,i.alternative,4]);
export async function saved(){const a=await inherited(),file='research/experiments/E196-phase-change-simplification-window/evidence/delays.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes));assert.deepEqual(raw.datasetReceipt,a.receipt);assert.deepEqual(raw.parentArchives,a.hashes);assert.deepEqual(raw.sourceHashes,await bindings(['research/experiments/E196-phase-change-simplification-window/code/collect-delay.mjs']));assert.equal(raw.rows.length,3);assert.equal(raw.cap,5000);for(const r of raw.rows){assert.equal(r.error,undefined);assert.equal(r.reuseAudit.matched,0);}return{receipt:a.receipt,hashes:{...a.hashes,[file]:sha256(bytes)},rows:raw.rows,find:a.find,delay(input){const index=raw.rows.findIndex(r=>key(r.input)===key(input));assert.ok(index>=0,'No exact H4 delay proof');return{proof:raw.rows[index].proof,ref:{file,index}};}};}
