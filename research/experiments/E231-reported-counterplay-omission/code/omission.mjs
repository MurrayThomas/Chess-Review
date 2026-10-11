import {inspectOutcomeDecisions} from '../../E192-outcome-goal-decisions/code/outcomes.mjs';
import {validate,frame,empty} from './contract.mjs';
export function inspectCounterplayOmission(input,options={},panel){
 const o=validate(input,options),r=empty(o);if(!o.enabled)return r;const legalResource=frame(input),exhaust=()=>({...r,nodes:o.L+1,status:'budget-unavailable',reason:'combined-node-budget'});if(o.L<2)return exhaust();
 let used=2;const results=[];
 for(const move of [input.decision.move,input.alternative]){const opts={enabled:true,plies:o.H,maxNodes:Math.min(50000,o.L-used)},q=inspectOutcomeDecisions({...input.decision,move},opts,panel);if(q.status==='exhausted')return exhaust();used+=q.nodes;results.push(q);}
 r.nodes=used;r.contexts={actual:results[0],alternative:results[1],report:structuredClone(input.report),reportAuthentication:'caller-report-only',freshSearches:0};
 const [a,b]=results;if(!a.witness||!b.witness){r.status='unavailable';r.reason='source-history-or-claim-prerequisite';return r;}
 const edge=a.witness.policy?.edges[0];
 if(a.witness.actual.role!=='opponent-mate'||b.witness.actual.role!=='actor-mate'||!legalResource||edge?.role!=='winner-choice'||edge.turn===input.report.actor||edge.move!==input.report.resource){r.status='not-established';r.reason='no-matching-certified-counterplay-contrast';return r;}
 if(input.report.disposition!=='excluded'){r.status='not-established';r.reason='omission-not-reported';return r;}
 r.status='proven';r.witness={id:'C0879',kind:'reported-counterplay-omission',report:structuredClone(input.report),before:a.witness.before,after:a.witness.after,actual:input.decision.move,resource:structuredClone(edge),alternative:input.alternative,actualWinner:a.witness.policy.winner,alternativeWinner:b.witness.policy.winner,continuationPlies:o.H,reportAuthentication:'caller-report-only',mentalStateClaim:false,bestMoveClaim:false,generalCounterplayClaim:false,explanation:'The excluded opponent move has a complete mating certificate; a legal alternative instead certifies your own mate.'};return r;
}
