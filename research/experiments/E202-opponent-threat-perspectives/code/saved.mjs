import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved as parentSaved} from '../../E201-check-capture-threat-question/code/saved.mjs';
export const dir='research/experiments/E202-opponent-threat-perspectives';
export async function saved(){
  const p=await parentSaved(),parent='research/experiments/E201-check-capture-threat-question',b=JSON.parse(await readFile(parent+'/build.json','utf8'));
  assert.deepEqual(await bindings(Object.keys(b.inputHashes)),b.inputHashes);
  const checks=await readFile(parent+'/evidence/focused-checks.json'),provenance=JSON.parse(await readFile(parent+'/evidence/provenance.json','utf8'));
  assert.equal(sha256(checks),provenance.artifactHashes[parent+'/evidence/focused-checks.json']);assert.deepEqual(provenance.archives,p.hashes);assert.deepEqual(provenance.datasetReceipt,p.receipt);
  const file='research/experiments/E145-critical-mating-decisions/evidence/observations.json.gz',bytes=await readFile(file);assert.equal(sha256(bytes),p.hashes[file]);const original=JSON.parse(gunzipSync(bytes));
  for(const index of [2,4]){const q=original.panels[index];assert.equal(q.key.history.moves.length,2);p.rows.push({id:'recorded-current-'+q.panel.actor,input:{fen:q.key.fen,history:q.key.history},options:{enabled:true,plies:q.key.plies},panel:q.panel,ref:{file,index},role:'genuine'});}
  const rows=p.rows.flatMap(row=>['w','b'].map(player=>({...row,id:row.id+'-view-'+player,options:{...row.options,perspective:player},mode:player===row.panel.actor?'own':'enemy'})));
  return {...p,rows,parentBindings:b.inputHashes,hashes:{...p.hashes,[parent+'/build.json']:sha256(await readFile(parent+'/build.json')),[parent+'/evidence/focused-checks.json']:sha256(checks),[parent+'/evidence/provenance.json']:sha256(await readFile(parent+'/evidence/provenance.json'))},freshQueries:0,freshPanels:0};
}
