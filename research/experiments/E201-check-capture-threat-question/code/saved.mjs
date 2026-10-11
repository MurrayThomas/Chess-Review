import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved as decisionSaved} from '../../E189-bounded-decision-support/code/saved.mjs';
import {fixtures} from '../../E189-bounded-decision-support/code/fixtures.mjs';
import {savedPanels as tempoSaved} from '../../E143-forcing-tempo-initiative/code/saved-panels.mjs';
export const dir='research/experiments/E201-check-capture-threat-question';
export async function saved(){
  const data=await openResearchData(['D001'],{purpose:'test'}),old=await decisionSaved(),tempo=await tempoSaved(),rows=[],hashes={...old.hashes};
  const source='research/experiments/E143-forcing-tempo-initiative/evidence',runBytes=await readFile(source+'/run.json'),run=JSON.parse(runBytes),bytes=await readFile(source+'/observations.json.gz');
  assert.equal(sha256(bytes),run.outputHashes['observations.json.gz']);hashes[source+'/observations.json.gz']=sha256(bytes);hashes[source+'/run.json']=sha256(runBytes);
  const collectorHashes=await bindings(['research/experiments/E143-forcing-tempo-initiative/code/panel.mjs']);
  for(const [p,h]of Object.entries(collectorHashes))assert.equal(tempo.sourceHashes[p],h,'Missing original collector dependency '+p);
  for(const index of [0,1]){const p=tempo.panels[index];rows.push({id:'checking-H2-'+p.panel.actor,input:{fen:p.key.fen,history:p.key.history},options:{enabled:true,plies:2},panel:p.panel,ref:{file:source+'/observations.json.gz',index},role:'checking'});}
  for(const index of [0,3,5,6,9,11]){const f=fixtures[index],H=f.options.plies??1,p=old.find(f.input,H);rows.push({id:f.id,input:{fen:f.input.fen,history:f.input.history},options:{enabled:true,plies:H},panel:p.panel,ref:p.ref,role:f.id.startsWith('earlier')?'empty':'mate'});}
  const qb=await readFile(dir+'/evidence/quiet-controls.json.gz'),quiet=JSON.parse(gunzipSync(qb));assert.deepEqual(quiet.receipt,data.receipt);assert.deepEqual(quiet.sourceHashes,await bindings([dir+'/code/collect-controls.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']));assert.equal(quiet.rows.length,2);assert.ok(quiet.rows.every(r=>r.nominatedQuietResource));assert.equal(quiet.rows.reduce((n,r)=>n+r.panel.nodes,0),2230);hashes[dir+'/evidence/quiet-controls.json.gz']=sha256(qb);
  for(const [index,p]of quiet.rows.entries())rows.push({id:'quiet-H2-'+p.panel.actor,input:{fen:p.input.fen,history:p.input.history},options:{enabled:true,plies:2},panel:p.panel,ref:{file:dir+'/evidence/quiet-controls.json.gz',index},role:'quiet',nominated:p.input.move});
  rows.push({id:'visited-fifty-claim',input:{fen:old.focus.input.fen,history:old.focus.input.history},options:{enabled:true,plies:0},panel:old.focus.result.panel,ref:{file:'research/experiments/E187-queen-exposure-tempo/evidence/focus.json.gz'},role:'claim'});
  return {rows,receipt:data.receipt,hashes,freshQueries:quiet.freshQueries,freshPanels:2,freshNodes:2230,collectorHashes};
}
