import {isDeepStrictEqual} from 'node:util';
import {controls,prepare} from './context.mjs';
import {features} from './features.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {verifyPanel} from '../../E143-forcing-tempo-initiative/code/check-witness.mjs';
const admitted=[];
export function inspectOutcomeDecisions(input,options={},panel){
 const o=controls(input,options),r={schema:'E192-outcome-decisions-v1',limit:o.limit,plies:o.H,nodes:0,status:'disabled',contexts:{C0823:'33. Practical chess concepts',C0828:'33. Practical chess concepts',C0979:'38. Chess terminology for position types',C0984:'38. Chess terminology for position types'},claims:{C0823:false,C0828:false,C0979:false,C0984:false},qualityClaim:false,witness:null,panel:null};if(!o.enabled)return r;
 const x=prepare(input);r.status=x.status;if(x.status!=='ready')return r;if(o.goal&&(o.goal.fen!==x.c.fen()||o.goal.actor!==x.c.turn()))throw Error('Goal belongs to different root/actor');const exhausted=()=>({...r,nodes:o.limit+1,status:'exhausted'});if(x.setup>o.limit)return exhausted();if(panel===undefined)return{...r,nodes:x.setup,status:'panel-prerequisite'};
 plain(panel);if(!panel||!Number.isSafeInteger(panel.nodes)||panel.nodes<0||!Array.isArray(panel.rows))throw Error('Require full source panel');if(x.setup+panel.nodes>o.limit)return exhausted();const key=[input.fen,input.history,o.H,panel];let v=admitted.find(a=>isDeepStrictEqual(a.key,key));if(!v){const q=verifyPanel({...input,forcingTempoPlies:o.H},panel);v={key:structuredClone(key),nodes:q.nodes,claim:q.claimContext};admitted.push(v);}
 if(v.claim){const cost=x.setup+v.nodes+2+panel.rows.length;if(cost>o.limit)return exhausted();return{...r,nodes:cost,status:'claim-rule-prerequisite',panel:structuredClone(panel)};}
 const w=features(input,o,panel,x.c),cost=x.setup+v.nodes+w.work;if(cost>o.limit)return exhausted();r.nodes=cost;r.witness=w;r.panel=structuredClone(panel);r.claims={C0823:w.safety.proven,C0828:!!w.goal&&w.goal.fulfilled&&w.goal.comparisonAvailable,C0979:w.evaluation?.outcome==='losing',C0984:w.stakes.proven};r.status=Object.values(r.claims).some(Boolean)?'proven':'compared';return r;
}
