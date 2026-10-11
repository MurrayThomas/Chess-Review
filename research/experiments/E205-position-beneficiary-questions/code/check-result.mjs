import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {checkMinorContext} from '../../E186-minor-context-comparisons/code/check-result.mjs';
// Whole inherited source is independently replayed; own reconstruction imports
// no own runtime, E186 classifier/context, search collector or archive labels.
export function checkPositionBeneficiary(input,options,result,fullParent){
 plain([input,options,result,fullParent]);assert.ok(options&&typeof options==='object'&&!Array.isArray(options)&&Object.keys(options).every(k=>['enabled','player','ids','maxNodes','comparison'].includes(k)));
 const enabled=options.enabled===undefined?false:options.enabled,player=options.player,ids=options.ids===undefined?['C1069','C1070']:options.ids,limit=options.maxNodes===undefined?50000:options.maxNodes,comparison=options.comparison===undefined?{}:options.comparison;
 assert.equal(typeof enabled,'boolean');assert.ok(player===undefined||['w','b'].includes(player));assert.ok(!enabled||player!==undefined);assert.ok(Array.isArray(ids)&&ids.length&&new Set(ids).size===ids.length&&ids.every(id=>['C1069','C1070'].includes(id)));assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);assert.ok(comparison&&typeof comparison==='object'&&!Array.isArray(comparison)&&Object.keys(comparison).every(k=>['pawn','contextMoves','plies','proofs'].includes(k)));
 let nodes=0;const answers=ids.map(id=>({id,available:false,side:null,relation:null,frame:null,criterion:'finite-conversion-or-mate-context-resource',reason:null})),base=status=>({schema:'E205-position-beneficiary',status,limit,nodes,player:player??null,ids:[...ids],answers,source:null,witness:null}),exhaust=()=>{nodes=limit+1;return base('exhausted');};
 if(!enabled){assert.deepEqual(result,base('disabled'));return true;}if(!limit){assert.deepEqual(result,exhaust());return true;}
 nodes=1;
 // Exhaustion discards the source, so admit the inherited atomic result directly
 // under the remaining allowance. This cannot hide a sufficient source budget.
 if(result.status==='exhausted'&&result.source===null){
  const inherited={experiment:'E186',enabled:true,plies:comparison.plies===undefined?2:comparison.plies,limit:limit-1,nodes:limit,status:'exhausted',claims:{C0711:false,C0712:false,C0714:false},witness:null};
  let parentExhausted=false;try{checkMinorContext(input,{...comparison,enabled:true,maxNodes:limit-1},inherited);parentExhausted=true;}catch{}
  if(parentExhausted){assert.deepEqual(result,exhaust());return true;}
 }
 // Reconstruct a full parent for own-overhead exhaustion using supplied proofs,
 // rather than trusting an absent source. Neutral parent admission below checks it.
 let source=result.source;
 if(source===null&&result.status==='exhausted'){assert.ok(fullParent,'Full independently admitted source required for own-overhead exhaustion');source=fullParent;}
 assert.ok(source);checkMinorContext(input,{...comparison,enabled:true,maxNodes:source.limit},source);assert.ok(source.limit===limit-1||result.status==='exhausted'&&source.limit===50000);
 nodes+=source.nodes;if(!source.witness){assert.deepEqual(result,{...base(source.status),source});return true;}
 const w=source.witness,c=legalPosition(input.history.fen);for(const move of input.history.moves)c.move(move);const actor=c.turn();c.move(input.move);assert.equal(c.fen(),w.after);
 const names=['actual','fresh','replaced','context','contextReplaced'],q=w.queries,role=w.blockedKingRoute;
 let cost=2;for(const pawn of w.actualType.pawns){assert.equal(c.get(pawn.square)?.type,'p');assert.equal(c.get(pawn.square).color,pawn.color);cost++;}for(const r of w.relocations){assert.ok(r.from&&r.to);cost++;}for(const key of names){assert.equal(q[key].actor,actor);cost++;}if(role)cost++;for(const id of ids)cost++;
 if(nodes+cost>limit){assert.deepEqual(result,exhaust());return true;}nodes+=cost;
 const open=w.actualType.type==='open'&&w.piece.type==='b'&&q.actual.win&&q.fresh.win&&!q.replaced.win&&q.context.win===q.contextReplaced.win&&role!==null;
 const witness={actor,frame:c.fen(),frameKind:'recorded-after-actual',history:structuredClone(input.history),goal:{kind:'actor-mate-or-positive-retained-queen-after-every-immediate-defense',pawn:w.pawn,plies:source.plies,baseline:w.before},operationalContext:structuredClone(w.actualType),comparison:{kind:'artificial-material-matched-pawn-relocation-and-equal-valued-minor-replacement',frame:w.contextAfter,context:structuredClone(w.counterType),relocations:structuredClone(w.relocations),queries:names.map(key=>({key,frame:q[key].rootFen,win:q[key].win}))},functionalRole:structuredClone(role),observedClosedComparison:w.observedClosedComparison,closedPrerequisite:'fixed-pawn-causal-route-or-blockage-proof'};
 const mapped=ids.map(id=>{const available=id==='C1069'&&open;return{id,available,side:available?actor:null,relation:available?(actor===player?'own':'opponent'):null,frame:c.fen(),criterion:'finite-conversion-or-mate-context-resource',reason:available?null:id==='C1070'?'context-causality-prerequisite':'functional-open-resource-prerequisite'};});
 const status=mapped.some(a=>a.available)?'proven':source.status==='context-causality-prerequisite'?'context-causality-prerequisite':'bounded-unresolved';assert.deepEqual(result,{...base(status),source,witness,answers:mapped});return true;
}
