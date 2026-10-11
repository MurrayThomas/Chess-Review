import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {verifyPanel} from '../../E174-comparative-piece-improvement/code/verify-panel.mjs';
// No own runtime/context/derive/collector imports. Parent verifier itself uses
// separate complete legal/counter and conservative outpost proof reconstruction.
const code=m=>m.from+m.to+(m.promotion||'');
export function checkMinorOutpost(input,options,panel,result){
 plain([input,options,panel,result]);assert.equal(options.enabled,true);const limit=options.maxNodes===undefined?5000:options.maxNodes;assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=5000);
 const mapped={fen:input.fen,move:input.move,history:input.history,improvementTarget:input.target,improvementAlternative:input.alternative},c=new Chess(input.history.fen);for(const m of input.history.moves)c.move(m);assert.equal(c.fen(),input.fen);assert.equal(c.isGameOver(),false);
 const actor=c.turn(),enemy=actor==='w'?'b':'w',army=color=>c.board().flat().filter(p=>p&&p.color===color&&!['k','p'].includes(p.type)),own=army(actor),opp=army(enemy);assert.equal(own.length,1);assert.equal(own[0].type,'n');assert.equal(opp.length,1);assert.equal(opp[0].type,'b');assert.equal(input.move.slice(0,2),own[0].square);
 const legal=c.moves({verbose:true}),a=legal.find(m=>code(m)===input.move),b=legal.find(m=>code(m)===input.alternative);assert.ok(a&&b&&a.from===b.from&&a.to!==b.to);for(const m of [a,b])assert.ok(m.piece==='n'&&!m.captured&&!m.promotion&&!/[+#]/.test(m.san));
 const checked=verifyPanel(mapped,panel),live=s=>Object.values(s.flags).every(v=>v===false),summaries=[];
 for(const v of panel.variants){const branches=[];for(const branch of v.branches){const successes=[];for(const attempt of branch.attempts)if(attempt.from===v.to&&attempt.piece===v.piece&&live(attempt.state)&&attempt.state.balance-panel.baseline>=1&&attempt.counters.length&&attempt.counters.every(r=>live(r.state)&&r.state.balance-panel.baseline>=1))successes.push({move:attempt.move,minimumGain:Math.min(attempt.state.balance-panel.baseline,...attempt.counters.map(r=>r.state.balance-panel.baseline))});branches.push({reply:branch.move,live:live(branch.state),successes});}summaries.push({move:v.move,passed:live(v.state)&&branches.length>0&&branches.every(b=>b.live&&b.successes.length),branches,refutations:branches.filter(b=>!b.live||!b.successes.length).map(b=>b.reply)});}
 const claim=panel.claimContexts.length>0,improved=!claim&&summaries[0].passed&&!summaries[1].passed,rank=actor==='w'?+a.from[1]:9-+a.from[1],outpost=improved&&rank<4&&panel.outpost.status==='proven',nodes=3+input.history.moves.length+2+checked.nodes+3;
 if(nodes>limit){assert.deepEqual(result,{schema:'E219-minor-ending-outpost',id:'C0717',available:false,status:'exhausted',limit,nodes:limit+1,qualityClaim:false,witness:null});return true;}
 assert.deepEqual(result,{schema:'E219-minor-ending-outpost',id:'C0717',available:outpost,status:outpost?'proven':claim?'claim-rule-prerequisite':'compared',limit,nodes,qualityClaim:false,witness:{before:input.fen,after:panel.variants[0].state.fen,actor,ending:{actorKnight:own[0].square,enemyBishop:opp[0].square},target:input.target,move:input.move,alternative:input.alternative,summaries,improved,outpost,panel}});return true;
}
