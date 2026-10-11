import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
export async function saved(){const guard=await openResearchData(['D001'],{purpose:'test'}),p=JSON.parse(await readFile('research/experiments/E222-notation-variation-support/evidence/pilot.json','utf8'));assert.equal(p.error,null);assert.equal(p.rows.length,18);assert.equal(p.freshSearches,0);assert.deepEqual(p.receipt,guard.receipt);assert.deepEqual(p.inputHashes,await bindings(Object.keys(p.inputHashes)));return p;}
