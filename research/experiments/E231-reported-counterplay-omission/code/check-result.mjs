// No own inspector or classifier import. Parent outputs undergo independent replay.
import assert from 'node:assert/strict';
import {inspectOutcomeDecisions} from '../../E192-outcome-goal-decisions/code/outcomes.mjs';
import {checkResult} from '../../E192-outcome-goal-decisions/code/check-result.mjs';
import {validate,frame,empty} from './contract.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
export function checkCounterplayOmission(input,options={},panel,result){
 plain(result);const o=validate(input,options),e=empty(o),done=()=>{assert.deepEqual(result,e);return true;};if(!o.enabled)return done();const legal=frame(input),exhaust=()=>{e.nodes=o.L+1;e.status='budget-unavailable';e.reason='combined-node-budget';return done();};if(o.L<2)return exhaust();
 let cost=2;const qs=[];for(const m of [input.decision.move,input.alternative]){const i={...input.decision,move:m},opts={enabled:true,plies:o.H,maxNodes:Math.min(50000,o.L-cost)},p=inspectOutcomeDecisions(i,opts,panel);checkResult(i,opts,panel,p);if(p.status==='exhausted')return exhaust();cost+=p.nodes;qs.push(p);}
 e.nodes=cost;e.contexts={actual:qs[0],alternative:qs[1],report:structuredClone(input.report),reportAuthentication:'caller-report-only',freshSearches:0};const aw=qs[0].witness,bw=qs[1].witness;
 if(!aw||!bw){e.status='unavailable';e.reason='source-history-or-claim-prerequisite';return done();}
 const p=aw.policy,first=p?.edges[0],actor=input.report.actor;
 const matches=aw.actual.role==='opponent-mate'&&bw.actual.role==='actor-mate'&&legal&&first?.role==='winner-choice'&&first.turn!==actor&&first.move===input.report.resource;
 if(!matches){e.status='not-established';e.reason='no-matching-certified-counterplay-contrast';return done();}if(input.report.disposition!=='excluded'){e.status='not-established';e.reason='omission-not-reported';return done();}
 e.status='proven';e.witness={id:'C0879',kind:'reported-counterplay-omission',report:structuredClone(input.report),before:aw.before,after:aw.after,actual:input.decision.move,resource:structuredClone(first),alternative:input.alternative,actualWinner:p.winner,alternativeWinner:bw.policy.winner,continuationPlies:o.H,reportAuthentication:'caller-report-only',mentalStateClaim:false,bestMoveClaim:false,generalCounterplayClaim:false,explanation:'The excluded opponent move has a complete mating certificate; a legal alternative instead certifies your own mate.'};return done();
}
