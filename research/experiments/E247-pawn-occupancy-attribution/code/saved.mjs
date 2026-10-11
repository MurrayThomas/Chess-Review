import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {cases} from './fixtures.mjs';
export const dir='research/experiments/E247-pawn-occupancy-attribution';
export async function saved(receipt){const p=JSON.parse(gunzipSync(await readFile(dir+'/evidence/panels.json.gz')));assert.equal(p.error,null);assert.equal(p.receipt.registrySha256,receipt.registrySha256);assert.deepEqual(p.inputHashes,await bindings(Object.keys(p.inputHashes)));const fixtures=cases();assert.equal(p.rows.length,fixtures.length);for(const [i,r]of p.rows.entries()){const {frames,proofs,audits,groups,...fixture}=r;assert.deepEqual(fixture,fixtures[i]);}return p;}
