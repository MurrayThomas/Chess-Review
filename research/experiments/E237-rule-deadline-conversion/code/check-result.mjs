import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {validate,empty} from './contract.mjs';
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
function end(c,n){if(c.isCheckmate())return'mate';if(c.isStalemate()||c.isInsufficientMaterial())return'board-draw';if((n.get(key(c))??0)>=5)return'automatic-fivefold';if(Number(c.fen().split(' ')[4])>=150)return'automatic-seventy-five';return null;}
export function checkDeadline(input,options,result){
 plain(result);const o=validate(input,options),expected=empty(o),compare=()=>assert.deepEqual(result,expected);
 if(!o.enabled)return compare();
 if(!input.history){expected.status='unavailable';expected.reason='history-prerequisite';return compare();}
 const minimum=133+input.history.moves.length,budget=reason=>{Object.assign(expected,{status:'budget-unavailable',reason,work:o.maxWork+1});return compare();};if(minimum>o.maxWork)return budget('logical-work-cap');
 const c=legalPosition(input.history.fen),n=new Map([[key(c),1]]);
 for(const m of input.history.moves){if(end(c,n))throw Error('History continues an automatic terminal');assert(c.moves({verbose:true}).some(x=>uci(x)===m));c.move(m);n.set(key(c),(n.get(key(c))??0)+1);}
 assert.equal(c.fen(),legalPosition(input.fen).fen());expected.work=minimum;const initial=end(c,n);if(initial){expected.status='unavailable';expected.reason=initial;return compare();}
 const legal=c.moves({verbose:true}).map(uci).sort();assert(legal.includes(input.move));if(Number(c.fen().split(' ')[4])!==149){expected.status='not-established';expected.reason='not-final-reversible-ply';return compare();}
 if(legal.length>o.maxChoices)return budget('choice-domain-cap');const work=133+input.history.moves.length+260*legal.length;if(work>o.maxWork)return budget('logical-work-cap');expected.work=work;
 const before=c.fen(),actor=c.turn(),lower=before.split(' ');lower[4]='148';const rows=[];
 for(const move of legal){const b=legalPosition(before),played=b.move(move),after=b.fen(),visits=new Map(n);visits.set(key(b),(visits.get(key(b))??0)+1);const terminal=end(b,visits),low=legalPosition(lower.join(' '));low.move(move);rows.push({move,after,zeroing:played.piece==='p'||played.captured!==undefined,terminal,value:terminal==='mate'?'win':terminal?'draw':'live',legalResponses:b.moves({verbose:true}).map(uci).sort(),lowerAfter:low.fen(),lowerTerminal:end(low,visits)});}
 const mates=rows.filter(x=>x.value==='win').map(x=>x.move),clockDraws=rows.filter(x=>x.terminal==='automatic-seventy-five'&&x.lowerTerminal===null).map(x=>x.move);let eligible=mates.length!==0&&clockDraws.length!==0;for(const row of rows)if(row.value!=='win'&&(row.zeroing||!['board-draw','automatic-seventy-five'].includes(row.terminal)))eligible=false;
 expected.status=eligible?'proven':'not-established';expected.claims={C0600:eligible,C1075:eligible,C1076:eligible&&mates.includes(input.move)};
 expected.context={actor,before,actual:input.move,rows,mates,clockDraws,windowPlies:1,measure:'immediate forced win versus automatic draw',expiry:'every nonmating ordinary move terminates as draw',counterfactual:'Same board and legal action with reversible counter 148; live does not assert a win.',optionalOwnDrawClaim:'May be declined; choosing a valid claim draws instead.',knownRootOccurrences:n.get(key(c))??0,priorHistoryComplete:input.history.fen===new Chess().fen(),ongoingRootAssumption:'Conditional on the supplied root being ongoing; incomplete prior history cannot exclude earlier adjudication or unrecorded automatic repetition.',actualGameAdjudicationClaim:false,generalStrategicValueClaim:false,mentalStateClaim:false,freshSearches:0};compare();
}
