import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {actual,key,outcome} from '../../E210-sustainable-threat-policy/code/rules.mjs';
const fields=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const exact=(v,keys)=>fields(v,keys)&&Object.keys(v).length===keys.length;
const values={p:1,n:3,b:3,r:5,q:9,k:0};
const pieces=c=>c.board().flat().filter(Boolean);
const nonkings=c=>pieces(c).filter(p=>p.type!=='k').map(p=>({square:p.square,type:p.type,color:p.color})).sort((a,b)=>a.square.localeCompare(b.square));
const balance=(c,actor)=>pieces(c).reduce((s,p)=>s+(p.color===actor?1:-1)*values[p.type],0);
export function inspectPassiveCompensation(input,options={},certificate){
 plain([input,options,certificate]);if(!fields(input,['fen','history'])||typeof input.fen!=='string'||input.history!==undefined&&!exact(input.history,['fen','moves'])||!fields(options,['enabled','player','maxNodes']))throw Error('Invalid passive policy interface');
 const enabled=options.enabled??false,actor=options.player,limit=options.maxNodes??5000;if(typeof enabled!=='boolean'||actor!==undefined&&!['w','b'].includes(actor)||enabled&&!actor||!Number.isSafeInteger(limit)||limit<0||limit>5000)throw Error('Invalid policy controls');
 let nodes=0;const done=(status,witness=null)=>({schema:'E218-passive-compensation',claims:['C0280','C0519'],status,available:status==='proven',actor:actor??null,limit,nodes,qualityClaim:false,witness});if(!enabled)return done('disabled');
 const a=actual(input);if(!a)return done('history-prerequisite');const tick=()=>{if(++nodes>limit)throw Error('passive-budget');};
 try{
  for(let i=0;i<2+input.history.moves.length;i++)tick();const end=outcome(a.c,a.counts,actor);if(end)return done(end.startsWith('actor-')?'already-claimable':'not-live');
  if(a.c.turn()!==actor)return done('actor-turn-prerequisite');if(a.c.isCheck()||a.c.fen().split(' ')[2]!=='-'||a.c.fen().split(' ')[3]!=='-')return done('nonchecking-no-rights-ep-prerequisite');
  const baseline=balance(a.c,actor),fixed=nonkings(a.c);if(baseline>=0||!pieces(a.c).some(p=>p.color===actor&&p.type==='r'))return done('compensation-prerequisite');
  if(certificate===undefined)return done('policy-prerequisite');
  if(!exact(certificate,['schema','actor','root','states'])||certificate.schema!=='passive-fortress-policy-v1'||certificate.actor!==actor||certificate.root!==key(a.c)||!Array.isArray(certificate.states)||certificate.states.length<1||certificate.states.length>64)throw Error('Invalid policy identity');
  const graph=new Map();for(const s of certificate.states){if(!fields(s,['key','move','next','replies'])||typeof s.key!=='string'||graph.has(s.key))throw Error('Invalid policy state');const c=legalPosition(s.key+' 0 1');if(key(c)!==s.key)throw Error('Noncanonical policy key');graph.set(s.key,s);}
  const queue=[certificate.root],seen=new Set(),states=[];let actorStates=0;
  for(let i=0;i<queue.length;i++){
   const position=queue[i];if(seen.has(position))continue;seen.add(position);const s=graph.get(position);if(!s)throw Error('Policy is not closed');tick();const c=legalPosition(position+' 0 1');
   if(c.isCheck()||c.isGameOver()||c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-'||balance(c,actor)!==baseline||JSON.stringify(nonkings(c))!==JSON.stringify(fixed))throw Error('Live fixed-material invariant failed');
   tick();const legal=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));
   if(c.turn()===actor){
    if(!exact(s,['key','move','next'])||typeof s.move!=='string'||!/^[a-h][1-8][a-h][1-8]$/.test(s.move))throw Error('Invalid actor state');
    const rookMoves=legal.filter(m=>m.piece==='r'&&!m.captured&&!/[+#]/.test(m.san)).map(uci),move=legal.find(m=>uci(m)===s.move);if(!rookMoves.length||!move||move.piece!=='k'||move.captured||/[+#]/.test(move.san))throw Error('Quiet waiting/activity invariant failed');
    actorStates++;tick();c.move(s.move);if(key(c)!==s.next)throw Error('Actor edge mismatch');queue.push(s.next);states.push({key:position,turn:actor,move:s.move,next:s.next,rookMoves});
   }else{
    if(!exact(s,['key','replies'])||!Array.isArray(s.replies)||s.replies.length>218||s.replies.some(e=>!exact(e,['move','next'])))throw Error('Invalid defender state');
    if(JSON.stringify(s.replies.map(e=>e.move))!==JSON.stringify(legal.map(uci)))throw Error('Incomplete defender inventory');
    if(legal.length>2||legal.some(m=>m.piece!=='k'||m.captured||/[+#]/.test(m.san)))throw Error('Immobility/cage invariant failed');
    for(const e of s.replies){tick();c.move(e.move);if(key(c)!==e.next)throw Error('Defender edge mismatch');queue.push(e.next);c.undo();}states.push({key:position,turn:c.turn(),replies:structuredClone(s.replies),immobileNonkingUnits:fixed.filter(p=>p.color!==actor)});
   }
  }
  if(seen.size!==graph.size)throw Error('Unreachable padding');const bound=4*actorStates,sample=[],c=a.c;let goal=null;
  for(let i=0;i<=bound;i++){goal=outcome(c,a.counts,actor);if(goal)break;if(i===bound)throw Error('Recurrence bound failed');const s=graph.get(key(c)),move=c.turn()===actor?s.move:s.replies[0].move,before=c.fen();tick();c.move(move);a.counts.set(key(c),(a.counts.get(key(c))||0)+1);sample.push({before,move,after:c.fen(),occurrences:a.counts.get(key(c))});}
  if(goal==='mate')throw Error('Unexpected mate');tick();
  return done('proven',{actual:{fen:input.fen,history:structuredClone(input.history)},certificate:structuredClone(certificate),material:{actorBalance:baseline,unrecovered:true,fixedNonkingUnits:fixed},states:states.sort((a,b)=>a.key.localeCompare(b.key)),recurrence:{actorStates,maxFurtherPlies:bound,defenses:'every-legal-reply',goal:'actor-threefold-or-fifty-claim-or-earlier-draw',claim:'opportunity-not-automatically-awarded'},sample:{kind:'one-deterministic-path-not-universal-enumeration',moves:sample,goal,final:c.fen()}});
 }catch(e){if(e.message!=='passive-budget')throw e;nodes=limit+1;return done('exhausted');}
}
