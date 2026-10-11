import {isDeepStrictEqual} from 'node:util';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {checkTwoResultPolicy} from '../../E235-two-result-policy/code/check-result.mjs';
import {validate,empty} from './contract.mjs';
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
export function inspectCoveredRisk(input,options={},sources){
 const o=validate(input,options),r=empty(o);if(!o.enabled)return r;const exhaust=()=>({...r,status:'budget-unavailable',reason:'combined-logical-work-cap',work:o.maxWork+1});if(o.maxWork<2)return exhaust();
 if(sources===undefined){r.status='unavailable';r.reason='source-prerequisite';return r;}plain(sources);if(!sources||Array.isArray(sources)||Object.keys(sources).sort().join(',')!=='actual,reference')throw Error('Invalid source pair');
 for(const name of ['actual','reference'])checkTwoResultPolicy(input[name],{enabled:true},sources[name]);
 const charge=2+['actual','reference'].reduce((n,k)=>n+sources[k].work+(sources[k].context?.leaves.length??0)+(input[k].history?.moves.length??0)+1+130*(sources[k].context?.defenderMoves.length??0),0);if(charge>o.maxWork)return exhaust();r.work=charge;
 if(!input.model){r.status='unavailable';r.reason='declared-model-prerequisite';return r;}
 const a=input.actual,b=input.reference,m=input.model;if(a.fen!==b.fen||!isDeepStrictEqual(a.history,b.history)||a.move===b.move)throw Error('Distinct policies must share exact root/history');
 const ca=sources.actual.context,cb=sources.reference.context;if(!ca||!cb){r.status='unavailable';r.reason='policy-context-prerequisite';return r;}if(ca.before!==cb.before||ca.actor!==cb.actor||m.fen!==ca.before||m.actor!==ca.actor)throw Error('Declared model frame/actor mismatch');
 if([ca,cb].some(c=>!c.leaves.length||c.leaves.some(x=>!['win','draw','loss'].includes(x.outcome)))){r.status='unavailable';r.reason='unresolved-policy';return r;}
 const summaries={};for(const name of ['actual','reference']){
  const p=input[name],c=sources[name].context,board=new Chess(p.history.fen),counts=new Map([[key(board),1]]);for(const move of [...p.history.moves,p.move]){board.move(move);counts.set(key(board),(counts.get(key(board))??0)+1);}
  const half=+board.fen().split(' ')[4],occurrences=counts.get(key(board))??0,covered=half<=p.history.moves.length+1,enemyTurn=c.initialTerminal===null,currentClaims=[];
  if(enemyTurn){if(occurrences>=3)currentClaims.push('threefold');if(half>=100)currentClaims.push('fifty');}
  const intendedReplies=[];for(const move of c.defenderMoves){const b=new Chess(board.fen());b.move(move);const n=(counts.get(key(b))??0)+1,h=+b.fen().split(' ')[4],claims=[];if(n>=3)claims.push('threefold');if(h>=100)claims.push('fifty');intendedReplies.push({move,after:b.fen(),knownOccurrences:n,halfmove:h,claims});}
  const known=currentClaims.length>0||intendedReplies.some(x=>x.claims.length),unknown=enemyTurn&&!covered,addedDraw=enemyTurn&&(known||unknown),loss=outcome=>Math.max(0,m.utility[m.target]-m.utility[outcome]);
  const claimAudit={afterActual:board.fen(),halfmove:half,knownOccurrences:occurrences,recordedPlies:p.history.moves.length+1,reversibleSegmentCovered:covered,enemyTurn,currentClaims,intendedReplies,unknownEarlierRepetition:unknown};
  const leaves=c.leaves.map(l=>({defense:l.defense,outcome:l.outcome,basis:l.basis,leafFen:l.leafFen,shortfall:loss(l.outcome)})),allowance=addedDraw?{outcome:'draw',basis:known?'known-current-or-intended-enemy-claim':'uncovered-reversible-history-allowance',shortfall:loss('draw')}:null,values=leaves.map(l=>l.shortfall);if(allowance)values.push(allowance.shortfall);const worst=Math.max(...values);summaries[name]={move:p.move,followup:p.followup,leaves,allowance,claimAudit,bestShortfall:Math.min(...values),worstShortfall:worst,withinLimit:worst<=m.allowed,adverseOutcomes:[...new Set([...leaves,...(allowance?[allowance]:[])].filter(x=>x.shortfall>0).map(x=>x.outcome))].sort()};}
 r.claims={C0797:true,C0831:summaries.actual.withinLimit&&!summaries.reference.withinLimit&&summaries.actual.worstShortfall<summaries.reference.worstShortfall};r.status='proven';r.context={actor:ca.actor,before:ca.before,model:structuredClone(m),summaries,sourceResults:structuredClone(sources),scope:'Worst-case shortfall for exactly two declared complete finite policies, including current/intended claims and uncovered reversible history.',probabilityClaim:false,humanRiskToleranceClaim:false,globalOptimalityClaim:false,actualGameAdjudicationClaim:false,historyCondition:'Supplied roots/history are assumed ongoing; covered reversible segments admit known current/intended claims; uncovered earlier repetition remains a conservative draw allowance.',freshSearches:0};return r;
}
