import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {sha256,openResearchData} from '../../../data-policy.mjs';
import {bindings} from '../../E138-bounded-engine-panels/code/source-bindings.mjs';
import {savedPanels,key} from '../../E156-piece-objective-effectiveness/code/saved-panels.mjs';
import {fixtures} from '../../E156-piece-objective-effectiveness/code/fixtures.mjs';
export const dir='research/experiments/E203-objective-piece-question-profiles';
export async function saved(){
  const data=await openResearchData(['D001'],{purpose:'test'}),s=await savedPanels(),origin='research/experiments/E156-piece-objective-effectiveness/evidence',rb=await readFile(origin+'/run.json'),run=JSON.parse(rb),bytes=await readFile(origin+'/observations.json.gz'),smoke=await readFile(origin+'/smoke.json.gz');
  assert.equal(sha256(bytes),run.outputHashes['observations.json.gz']);assert.equal(sha256(smoke),run.outputHashes['smoke.json.gz']);assert.equal(s.reuseAudit.smokeSha256,sha256(smoke));assert.equal(run.engine,null);
  const collector=await bindings(['research/experiments/E156-piece-objective-effectiveness/code/panel.mjs']);for(const [p,h]of Object.entries(collector))assert.equal(s.sourceHashes[p],h,'Missing full original collector source '+p);
  const archives={[origin+'/run.json']:sha256(rb),[origin+'/observations.json.gz']:sha256(bytes),[origin+'/smoke.json.gz']:sha256(smoke)},base=[];
  for(const [index,f]of fixtures.slice(0,6).entries()){
    const sourceIndex=s.rows.findIndex(row=>JSON.stringify(row.key)===JSON.stringify(key(f)));assert.ok(sourceIndex>=0);const p=s.rows[sourceIndex].panel,input={fen:f.fen,history:f.history,move:f.move,objectiveTarget:f.objectiveTarget,objectiveUnits:f.objectiveUnits};
    base.push({id:f.id,role:['base','defender','both-cover'][Math.floor(index/2)],current:{fen:p.variants[0].state.fen,history:{fen:f.history.fen,moves:[...f.history.moves,f.move]}},source:{input,panel:p},ref:{file:origin+'/observations.json.gz',index:sourceIndex}});
  }
  const claimBytes=await readFile(dir+'/evidence/claim-control.json.gz'),claim=JSON.parse(gunzipSync(claimBytes));assert.deepEqual(claim.receipt,data.receipt);assert.deepEqual(claim.sourceHashes,await bindings([dir+'/code/collect-claim.mjs',dir+'/plan.md',dir+'/AMENDMENT-2026-10-11.md']));assert.ok(claim.panel.nodes<=500&&claim.panel.claimContexts.length>0);archives[dir+'/evidence/claim-control.json.gz']=sha256(claimBytes);
  base.push({id:'visited-claim',role:'claim',current:{fen:claim.panel.variants[0].state.fen,history:{fen:claim.input.history.fen,moves:[...claim.input.history.moves,claim.input.move]}},source:{input:claim.input,panel:claim.panel},ref:{file:dir+'/evidence/claim-control.json.gz'}});
  const rows=base.flatMap(f=>[f.source.panel.actor,f.source.panel.actor==='w'?'b':'w'].map(player=>({...f,id:f.id+'-view-'+player,options:{enabled:true,player}})));
  return {rows,receipt:data.receipt,archives,sourceHashes:s.sourceHashes,collectorHashes:collector,freshPanels:1,freshMateQueries:0,freshNodes:claim.panel.nodes};
}
