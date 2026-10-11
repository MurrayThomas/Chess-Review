import {controls,prepare} from './context.mjs';
import {defenseFeatures,structureFeatures} from './features.mjs';
import {verifyPanel as defenseVerify} from '../../E169-passive-defense-counterplay/code/verify-panel.mjs';
import {verifyPanel as structureVerify} from '../../E168-forced-pawn-weakness/code/verify-panel.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export function inspectTiming(source,input,options={},panel){
 const o=controls(source,input,options),r={schema:'E191-timing-v1',source,limit:o.limit,ownPlies:o.A,enemyPlies:source==='defense'?o.D:null,nodes:0,status:'disabled',claims:{C0810:false,C0811:false,C0813:false},qualityClaim:false,witness:null,panel:null};if(!o.enabled)return r;
 const x=prepare(source,input,o.A,o.D);r.status=x.status;if(x.status!=='ready')return r;const exhausted=()=>({...r,nodes:o.limit+1,status:'exhausted'});if(x.work>o.limit)return exhausted();if(panel===undefined)return{...r,nodes:x.work,status:'panel-prerequisite'};
 plain(panel);if(!panel||!Number.isSafeInteger(panel.nodes)||panel.nodes<0)throw Error('Require full source panel');if(x.work+panel.nodes>o.limit)return exhausted();const v=source==='defense'?defenseVerify(x.mapped,o.A,o.D,panel):structureVerify(x.mapped,o.A,panel),w=source==='defense'?defenseFeatures(input,panel,v.claim):structureFeatures(panel,v.claim),cost=x.work+v.nodes+w.work;if(cost>o.limit)return exhausted();r.nodes=cost;r.panel=structuredClone(panel);if(v.claim)return{...r,status:'claim-rule-prerequisite'};r.witness=w;
 if(source==='defense'){r.claims.C0811=w.comparison&&w.actualRole==='active';r.claims.C0810=r.claims.C0811&&w.policy.allChecking;}else r.claims.C0813=w.forced;r.status=Object.values(r.claims).some(Boolean)?'proven':'compared';return r;
}
