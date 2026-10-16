import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Chess} from '../../../../lib/chess.js';
import {prefix,hash,loadCases} from './cases.mjs';
import {currentClassifier,replayLabel} from './classifier.mjs';
async function saved(){const access=await loadCases(),bytes=await readFile(prefix+'evidence/results.json'),receipt=JSON.parse(await readFile(prefix+'evidence/report-run.json'));assert.equal(hash(bytes),receipt.outputHash);assert.deepEqual(access.receipt,receipt.caseEligibility);return {cases:access.input.cases,report:JSON.parse(bytes),api:(await currentClassifier()).api};}
test('reported Ke8 stays ordinary Best in all seven retained engine/budget settings',async()=>{
  const {cases,report,api}=await saved(),c=cases[1],rows=report.rows.filter(r=>r.case==='B');assert.equal(rows.length,7);
  for(const r of rows){const current=replayLabel(api,c,r.root,r.played,r.after,r.engine);assert.equal(current.category,'best');assert.equal(current.brilliantEligibility,false);assert.ok(current.playedMoverScore.cp<0);}
});
test('reported Qg3 keeps its sound new-threat sacrifice rather than being suppressed to fit a complaint',async()=>{
  const {cases,report,api}=await saved(),c=cases[0],rows=report.rows.filter(r=>r.case==='A');assert.equal(rows.length,7);
  for(const r of rows){assert.equal(replayLabel(api,c,r.root,r.played,r.after,r.engine).category,'brilliant');assert.equal(replayLabel(api,c,r.root,r.played,r.after,r.engine,{history:false}).category,'best');}
});
test('alternative e6 permits the complete forced Qxe6+ Kc7 Qxc8 mate witness',async()=>{
  const {input}=await loadCases(),c=new Chess(input.cases[1].before);c.move('e6');c.move('Qxe6+');assert.deepEqual(c.moves(),['Kc7']);c.move('Kc7');c.move('Qxc8#');assert.equal(c.isCheckmate(),true);
});
