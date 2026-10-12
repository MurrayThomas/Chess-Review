import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E075-board-material/code/foundations.mjs';
import {replayResult as replayOwn} from '../../E076-pawn-army-inventories/code/replay.mjs';
export const inventoryIds=Object.freeze(['pawn-skeleton','paired-bishop-armies','rook-minor-armies','passed-count-imbalance','flank-count-imbalance']);
export async function openE076Replay(){
 const {receipt}=await openResearchData(['D001'],{purpose:'test'});
 return {receipt,check(input,actual){
  const enabled=input.inventoryTags??false;if(typeof enabled!=='boolean')throw Error('inventoryTags must be boolean');
  const limit=input.maxInventoryNodes??50000;
  if(enabled&&(!Number.isSafeInteger(limit)||limit<0||limit>50000))throw Error('maxInventoryNodes must be integer 0..50000');
  const base=parent(input);assert.ok(!base.events.some(e=>inventoryIds.includes(e.id)));
  if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,legacyReportedCertificates:null,exactResult:true,parentSemanticReplayRequired:true};}
  const legacy=replayOwn(input,actual),own=actual.events.filter(e=>inventoryIds.includes(e.id));
  assert.equal(legacy.certificates,own.length,'E076 legacy checker must report emitted certificates');
  const events=[...base.events,...own],priority=e=>inventoryIds.includes(e.id)?4.2:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
  assert.deepEqual(actual,{...base,schema:'coach-concepts-v57',events,comment,inventoryAnalysis:actual.inventoryAnalysis},'E076 whole result differs');
  if(actual.inventoryAnalysis.status==='exhausted')assert.equal(own.length,0);
  assert.ok(!comment||comment.split(/\s+/).length<=24);
  return{state:legacy.state,certificates:own.length,legacyReportedCertificates:legacy.certificates,exactResult:true,parentSemanticReplayRequired:true};
 }};
}
