import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {sha256,openResearchData} from '../../../data-policy.mjs';
import {claimControl} from './fixtures.mjs';
export async function control(){const data=await openResearchData(['D001'],{purpose:'test'}),file='research/experiments/E191-tactical-decision-timing/evidence/claim-control.json.gz',bytes=await readFile(file),raw=JSON.parse(gunzipSync(bytes));assert.deepEqual(raw.datasetReceipt,data.receipt);assert.deepEqual(raw.sourceHashes,await bindings(['research/experiments/E191-tactical-decision-timing/code/collect-control.mjs']));assert.deepEqual(raw.input,claimControl.input);assert.deepEqual(raw.options,claimControl.options);assert.equal(raw.reuseAudit.matched,0);return{...raw,hash:sha256(bytes),file};}
