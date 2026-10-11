import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sha256} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {saved as parentSaved} from '../../E190-liquidation-commitment/code/saved.mjs';
import {fixtures} from '../../E190-liquidation-commitment/code/fixtures.mjs';
export const dir='research/experiments/E204-exchange-initiative-question-evidence';
export async function saved(){
  const p=await parentSaved(),origin='research/experiments/E177-queen-exchange-ending/evidence',runBytes=await readFile(origin+'/run.json'),run=JSON.parse(runBytes);assert.equal(p.hashes[origin+'/observations.json.gz'],run.outputs.observations);assert.equal(run.engine,null);
  const sourceHashes=await bindings(['research/experiments/E177-queen-exchange-ending/code/panel.mjs','research/experiments/E177-queen-exchange-ending/code/context.mjs']);
  const rows=fixtures.flatMap(f=>{const q=p.find(f.input);return ['w','b'].map(player=>({id:f.id+'-view-'+player,input:f.input,options:{enabled:true,player},panel:q.panel,ref:q.ref,role:f.id.replace(/-[01]$/,'')}));});
  return {rows,receipt:p.receipt,archives:{...p.hashes,[origin+'/run.json']:sha256(runBytes)},sourceHashes,freshQueries:0,freshPanels:0};
}
