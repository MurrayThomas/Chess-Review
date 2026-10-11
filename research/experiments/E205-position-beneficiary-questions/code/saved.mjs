import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {archive,finalObservation} from '../../E186-minor-context-comparisons/code/archive.mjs';
export const dir='research/experiments/E205-position-beneficiary-questions';
export async function saved(){
 const data=await openResearchData(['D001'],{purpose:'test'}),parent='research/experiments/E186-minor-context-comparisons',a=await archive(),archives={};
 const snapshot=parent+'/evidence/initial-semantic-source.json.gz',raw=await readFile(snapshot);assert.equal(sha256(raw),sha256(execFileSync('git',['show','05d3ff0:'+snapshot])));archives[snapshot]=sha256(raw);
 for(const prefix of ['','knight-','control-'])for(const name of ['smoke.json.gz','collection.json']){const file=parent+'/evidence/'+prefix+name,bytes=await readFile(file);archives[file]=sha256(bytes);const value=name.endsWith('.gz')?JSON.parse(gunzipSync(bytes)):JSON.parse(bytes);assert.deepEqual(value.receipt??value.datasetReceipt,data.receipt);}
 const sourceHashes=await bindings([parent+'/code/archive.mjs',parent+'/code/check-result.mjs']);
 const rows=a.allRows.map(r=>({id:r.id,input:r.input,comparison:{pawn:r.options.pawn,contextMoves:r.options.contextMoves,plies:r.options.plies,proofs:r.result.witness.queries},parent:finalObservation(r.result)}));assert.equal(rows.length,12);
 return{rows,receipt:data.receipt,archives,sourceHashes,freshPanels:0,freshQueries:0};
}
