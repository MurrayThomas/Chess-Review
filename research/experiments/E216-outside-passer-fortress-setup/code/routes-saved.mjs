import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {checkWitness} from '../../E097-promotion-race-restraint/code/check-witness.mjs';
const parent='research/experiments/E097-promotion-race-restraint';
export async function savedRoutes(){
 const data=await openResearchData(['D001'],{purpose:'test'}),run=JSON.parse(await readFile(parent+'/evidence/run.json','utf8')),bytes=await readFile(parent+'/evidence/results.json.gz');assert.equal(sha256(bytes),'3be67faff22729dfa82bed1559ecf8b5e96e46a83b0c66e15e25cb91ab24c4a5');assert.equal(sha256(bytes),run.outputHashes['results.json.gz']);const text=gunzipSync(bytes);assert.equal(sha256(text),run.uncompressedSha256);const report=JSON.parse(text);assert.deepEqual(run.inputHashes,report.inputHashes);assert.deepEqual(run.inputHashes,await bindings(Object.keys(run.inputHashes)));
 const old=structuredClone(report.eligibilityReceipt);assert.equal(old.policySha256,sha256(execFileSync('git',['show',report.revision+':research/DATA_POLICY.md'],{windowsHide:true})));old.policySha256=data.receipt.policySha256;assert.deepEqual(old,data.receipt);
 const rows=[];for(const r of report.rows.filter(r=>r.fixture.id==='rook-race'||r.fixture.id==='rook-race-black')){const w=r.result.endingRaceAnalysis.witness;checkWitness(w,r.result,r.fixture);const route=w.routes.find(r=>r.outside&&r.proof.win);assert.ok(route&&w.rookEnding);rows.push({id:r.fixture.id,input:{fen:r.fixture.fen,move:r.fixture.move,history:{fen:r.fixture.fen,moves:[]}},proof:route.proof,source:{artifact:parent+'/evidence/results.json.gz',sha256:sha256(bytes),originalReceipt:report.eligibilityReceipt,policyAudit:'original document hash verified at recorded Git revision; all other eligibility receipt fields match current guard'}});}assert.equal(rows.length,2);return{rows,receipt:data.receipt,parentInputHashes:run.inputHashes};
}
