import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {verifyPanel} from '../../E156-piece-objective-effectiveness/code/verify-panel.mjs';
import {checkResult as checkIdentity} from '../../E200-recorded-move-changes/code/check-result.mjs';
const admissions=[];
export function checkResult(current,options,source,result){
  plain([current,options,source,result]);assert.ok(current&&typeof current==='object'&&!Array.isArray(current)&&options&&typeof options==='object'&&!Array.isArray(options));assert.ok(Object.keys(options).every(k=>['enabled','player','ids','maxNodes'].includes(k)));
  const enabled=options.enabled===undefined?false:options.enabled,player=options.player,ids=options.ids===undefined?['C1063','C1064','C1065']:options.ids,limit=options.maxNodes===undefined?50000:options.maxNodes;
  assert.ok(typeof enabled==='boolean'&&(player===undefined||['w','b'].includes(player))&&(!enabled||player!==undefined)&&Array.isArray(ids)&&ids.length&&new Set(ids).size===ids.length&&ids.every(id=>['C1063','C1064','C1065'].includes(id))&&Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);
  const e={schema:'E203-objective-piece-questions',status:'disabled',limit,nodes:0,player:player??null,ids:[...ids],answers:[],witness:null},done=status=>{e.status=status;if(!e.answers.length)e.answers=ids.map(id=>({id,available:false,reason:status,units:[]}));assert.deepEqual(result,e);return true;},exhaust=()=>{e.nodes=limit+1;e.witness=null;e.answers=[];return done('exhausted');};
  if(!enabled)return done('disabled');if(!limit)return exhaust();e.nodes=1;
  if(current.history===undefined)return done('history-prerequisite');assert.ok(current.history&&Array.isArray(current.history.moves)&&current.history.moves.length<=1000&&typeof current.history.fen==='string'&&typeof current.fen==='string');
  if(!current.history.moves.length)return done('recorded-move-prerequisite');if(source===undefined)return done('source-prerequisite');
  const i=source.input,p=source.panel;assert.deepEqual(current.history,{fen:i.history.fen,moves:[...i.history.moves,i.move]});
  const identityCost=2*current.history.moves.length+260;if(1+identityCost>limit)return exhaust();e.nodes+=identityCost;assert.ok(Number.isSafeInteger(p.nodes)&&p.nodes>=0&&p.nodes<=50000);if(e.nodes+p.nodes>limit)return exhaust();
  const key=[i,p];let a=admissions.find(q=>isDeepStrictEqual(q.key,key));if(!a){const q=verifyPanel(i,p);a={key:structuredClone(key),nodes:q.nodes};admissions.push(a);}e.nodes+=a.nodes;
  const v=p.variants[0];assert.equal(v.state.fen,current.fen);if(p.claimContexts.length)return done('claim-rule-prerequisite');if(v.checking)return done('nonquiet-objective-prerequisite');if(Object.values(v.state.flags).some(Boolean))return done('not-live');
  // The identity proof is independently verified after the whole structural
  // work ledger is counted; an exhausted answer legitimately retains no proof.
  const identity=result.witness?.identity,units=[];
  // Full source-after board inventory, not only the two original nominees.
  const board=new Chess(v.state.fen);for(const row of board.board())for(const u of row)if(u&&u.color===p.actor&&'nbrq'.includes(u.type))units.push({square:u.square,type:u.type});
  units.sort((a,b)=>a.square.localeCompare(b.square));const raw=[];
  for(const u of units){e.nodes++;const branches=[];
    for(const b of v.branches){e.nodes++;const successes=[];
      for(const attempt of b.attempts){e.nodes++;if(attempt.from!==u.square||attempt.piece!==u.type)continue;
        let minimumGain=attempt.state.balance-p.baseline,valid=Object.values(attempt.state.flags).every(v=>!v)&&attempt.counters.length>0&&minimumGain>=1;
        for(const counter of attempt.counters){e.nodes++;minimumGain=Math.min(minimumGain,counter.state.balance-p.baseline);if(Object.values(counter.state.flags).some(Boolean)||counter.state.balance-p.baseline<1)valid=false;}
        if(valid)successes.push({capture:attempt.move,target:b.targets[attempt.target],minimumGain});
      }
      branches.push({reply:b.move,live:Object.values(b.state.flags).every(v=>!v),successes});
    }
    const refutations=branches.filter(b=>!b.live||!b.successes.length).map(b=>b.reply);raw.push({...u,covers:branches.length>0&&refutations.length===0,branches,refutations});
  }
  e.nodes++;if(e.nodes>limit)return exhaust();assert.ok(identity);checkIdentity({fen:current.fen,history:current.history,maxChangeNodes:limit-1},identity);assert.equal(identity.nodes,identityCost);assert.equal(identity.answer.before.fen,p.before);assert.equal(identity.answer.after.fen,v.state.fen);assert.equal(identity.answer.last.uci,i.move);assert.equal(identity.answer.last.color,p.actor);
  const profiles=raw.map(u=>{const original=identity.answer.after.inventory.find(unit=>unit.square===u.square&&unit.color===p.actor);assert.ok(original);return {id:original.id,color:original.color,originalType:original.originalType,type:u.type,square:u.square,covers:u.covers,branches:u.branches,refutations:u.refutations};}).sort((a,b)=>a.id.localeCompare(b.id));
  const covering=profiles.filter(p=>p.covers).map(p=>p.id),failing=profiles.filter(p=>!p.covers).map(p=>p.id),separates=covering.length>0&&failing.length>0,target=identity.answer.after.inventory.find(u=>u.square===i.objectiveTarget&&u.color!==p.actor);
  e.witness={frame:{fen:v.state.fen,actorToMove:board.turn(),unitColor:p.actor,player},objective:{kind:'all-defense-profitable-tracked-pawn-capture',target:{id:target.id,square:target.square,type:target.type},minimumGain:1,baseline:p.baseline},profiles,ranking:{criterion:'all-defense-objective-coverage',covering,failing,separates},source:structuredClone(source),identity:structuredClone(identity)};
  e.answers=ids.map(id=>{const allowed=id==='C1063'||id==='C1064'&&p.actor===player||id==='C1065'&&p.actor!==player,available=allowed&&separates,chosen=id==='C1065'?covering:failing;return {id,available,reason:!allowed?'other-side-profile':!separates?'no-objective-separation':'declared-objective-only',units:available?chosen.map(id=>{const u=profiles.find(p=>p.id===id);return {id:u.id,square:u.square,type:u.type};}):[]};});
  return done(e.answers.some(a=>a.available)?'proven':'compared');
}
