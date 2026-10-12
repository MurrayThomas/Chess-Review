import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E076-pawn-army-inventories/code/inventories.mjs';
import {replayResult as replayOwn} from '../../E077-connected-passers-open-lines/code/replay.mjs';
export const openLineIds=Object.freeze(['connected-passer-proof','open-pawn-file-proof','open-rank-proof']);
export async function openE077Replay(){
 const {receipt}=await openResearchData(['D001'],{purpose:'test'});
 return {receipt,check(input,actual){
  const enabled=input.openLineTags??false;if(typeof enabled!=='boolean')throw Error('openLineTags must be boolean');
  const limit=input.maxOpenLineNodes??50000;
  if(enabled&&(!Number.isSafeInteger(limit)||limit<0||limit>50000))throw Error('maxOpenLineNodes must be integer 0..50000');
  const base=parent(input);assert.ok(!base.events.some(e=>openLineIds.includes(e.id)));
  if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,legacyDerivedCertificates:null,exactResult:true,parentSemanticReplayRequired:true};}
  const legacy=replayOwn(input,actual),own=actual.events.filter(e=>openLineIds.includes(e.id));
  const events=[...base.events,...own],priority=e=>openLineIds.includes(e.id)?4.1:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
  assert.deepEqual(actual,{...base,schema:'coach-concepts-v58',events,comment,openLineAnalysis:actual.openLineAnalysis},'E077 whole result differs');
  if(actual.openLineAnalysis.status==='exhausted')assert.equal(own.length,0);
  assert.ok(!comment||comment.split(/\s+/).length<=24);
  return{state:legacy.state,certificates:own.length,legacyDerivedCertificates:legacy.certificates,exactResult:true,parentSemanticReplayRequired:true};
 }};
}
