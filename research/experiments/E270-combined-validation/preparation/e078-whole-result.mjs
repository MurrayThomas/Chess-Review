import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E077-connected-passers-open-lines/code/lines.mjs';
import {replayResult as replayOwn} from '../../E078-bishop-chains-batteries/code/replay.mjs';
export const placementIds=Object.freeze(['outside-chain-proof','behind-chain-proof','slider-battery-proof']);
export async function openE078Replay(){
 const {receipt}=await openResearchData(['D001'],{purpose:'test'});
 return {receipt,check(input,actual){
  const enabled=input.placementTags??false;if(typeof enabled!=='boolean')throw Error('placementTags must be boolean');
  const limit=input.maxPlacementNodes??50000;
  if(enabled&&(!Number.isSafeInteger(limit)||limit<0||limit>50000))throw Error('maxPlacementNodes must be integer 0..50000');
  const base=parent(input);assert.ok(!base.events.some(e=>placementIds.includes(e.id)));
  if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,legacyDerivedCertificates:null,exactResult:true,parentSemanticReplayRequired:true};}
  const legacy=replayOwn(input,actual),own=actual.events.filter(e=>placementIds.includes(e.id));
  const events=[...base.events,...own],priority=e=>placementIds.includes(e.id)?4.0:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
  assert.deepEqual(actual,{...base,schema:'coach-concepts-v59',events,comment,placementAnalysis:actual.placementAnalysis},'E078 whole result differs');
  if(actual.placementAnalysis.status==='exhausted')assert.equal(own.length,0);
  assert.ok(!comment||comment.split(/\s+/).length<=24);
  return{state:legacy.state,certificates:own.length,legacyDerivedCertificates:legacy.certificates,exactResult:true,parentSemanticReplayRequired:true};
 }};
}
