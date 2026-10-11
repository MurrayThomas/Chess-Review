import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {context} from '../../E211-rook-tablebase-admission/code/context.mjs';
import {checkObservedRookPanel} from '../../E211-rook-tablebase-admission/code/check-execution.mjs';
const dir='research/experiments/E214-named-rook-defense-phases';
export const artifactHashes={'philidor-barrier':'ec59e91c8b50107206947a881e7cb64d340c77789ec7d9541b35e699e3b002fb','philidor-retreat':'736e2a54813381c7a2837d63c7cb90ac33d694a8b767a440d76e9344a3454252','vancura-pressure':'3accbcd757f5c2945566fb7c56af17b0c2a02224efd5317c3bf517869d99bc46'};
export function decodeRetained(id,bytes){assert.ok(Object.hasOwn(artifactHashes,id));assert.equal(sha256(bytes),artifactHashes[id]);return JSON.parse(bytes);}
export async function retained(){const ctx=await context(),rows=[];for(const id of Object.keys(artifactHashes)){const r=decodeRetained(id,await readFile(dir+'/evidence/'+id+'.json'));assert.deepEqual(r.inputHashes,await bindings(Object.keys(r.inputHashes)));rows.push({id,...r,view:checkObservedRookPanel(r.input,r.options,r.bundle,ctx)});}return{rows,ctx};}
