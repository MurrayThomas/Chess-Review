// Independent sorted-vertex verification; no runtime, fixture, or E210 rules imports.
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const uci=m=>m.from+m.to+(m.promotion||'');
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
const fields=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const exact=(v,keys)=>fields(v,keys)&&Object.keys(v).length===keys.length;
function snapshot(c){const out=[];for(const row of c.board())for(const p of row)if(p&&p.type!=='k')out.push({square:p.square,type:p.type,color:p.color});return out.sort((a,b)=>a.square.localeCompare(b.square));}
function score(c,actor){let n=0;for(const row of c.board())for(const p of row)if(p)n+=(p.color===actor?1:-1)*({k:0,p:1,n:3,b:3,r:5,q:9}[p.type]);return n;}
function goal(c,counts,actor){if(c.isCheckmate())return'mate';if(c.isStalemate()||c.isInsufficientMaterial())return'board-draw';const n=counts.get(key(c))||0,h=Number(c.fen().split(' ')[4]);if(n>=5)return'automatic-fivefold';if(h>=150)return'automatic-seventy-five';if(c.turn()===actor&&n>=3)return'actor-threefold-claim';if(c.turn()===actor&&h>=100)return'actor-fifty-claim';return null;}
export function checkPassiveCompensation(input,options,certificate,result){
 plain([input,options,certificate,result]);assert.ok(fields(input,['fen','history'])&&typeof input.fen==='string'&&fields(options,['enabled','player','maxNodes']));if(input.history!==undefined)assert.ok(exact(input.history,['fen','moves']));
 const enabled=options.enabled===undefined?false:options.enabled,actor=options.player,limit=options.maxNodes===undefined?5000:options.maxNodes;assert.equal(typeof enabled,'boolean');assert.ok(actor===undefined||['w','b'].includes(actor));assert.ok(!enabled||actor);assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=5000);let nodes=0;
 const finish=(status,witness=null)=>{assert.deepEqual(result,{schema:'E218-passive-compensation',claims:['C0280','C0519'],status,available:status==='proven',actor:actor??null,limit,nodes,qualityClaim:false,witness});return true;};
 if(!enabled)return finish('disabled');if(!input.history)return finish('history-prerequisite');const h=input.history;assert.ok(typeof h.fen==='string'&&Array.isArray(h.moves)&&h.moves.length<=1000);
 const current=new Chess(h.fen),counts=new Map(),add=()=>counts.set(key(current),(counts.get(key(current))||0)+1);add();
 for(const m of h.moves){assert.equal(goal(current,counts,null),null);assert.ok(typeof m==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(m));current.move(m);add();}assert.equal(current.fen(),new Chess(input.fen).fen());nodes=2+h.moves.length;
 const exhausted=()=>{nodes=limit+1;return finish('exhausted');};if(nodes>limit)return exhausted();const end=goal(current,counts,actor);if(end)return finish(end.startsWith('actor-')?'already-claimable':'not-live');if(current.turn()!==actor)return finish('actor-turn-prerequisite');if(current.isCheck()||current.fen().split(' ')[2]!=='-'||current.fen().split(' ')[3]!=='-')return finish('nonchecking-no-rights-ep-prerequisite');
 const baseline=score(current,actor),fixed=snapshot(current);if(baseline>=0||!fixed.some(p=>p.color===actor&&p.type==='r'))return finish('compensation-prerequisite');if(certificate===undefined)return finish('policy-prerequisite');
 assert.ok(exact(certificate,['schema','actor','root','states']));assert.equal(certificate.schema,'passive-fortress-policy-v1');assert.equal(certificate.actor,actor);assert.equal(certificate.root,key(current));assert.ok(Array.isArray(certificate.states)&&certificate.states.length>0&&certificate.states.length<=64);
 const graph=new Map();for(const s of certificate.states){assert.ok(fields(s,['key','move','next','replies'])&&typeof s.key==='string'&&!graph.has(s.key));const c=new Chess(s.key+' 0 1');assert.equal(key(c),s.key);graph.set(s.key,s);}
 const states=[],adjacency=new Map();let actorStates=0,cost=0;
 for(const [position,s]of [...graph].sort(([a],[b])=>a.localeCompare(b))){
  const c=new Chess(position+' 0 1');assert.equal(c.isCheck(),false);assert.equal(c.isGameOver(),false);assert.equal(c.fen().split(' ')[2],'-');assert.equal(c.fen().split(' ')[3],'-');assert.equal(score(c,actor),baseline);assert.deepEqual(snapshot(c),fixed);const legal=c.moves({verbose:true});cost+=2;
  if(c.turn()===actor){
   assert.ok(exact(s,['key','move','next']));assert.ok(typeof s.move==='string'&&/^[a-h][1-8][a-h][1-8]$/.test(s.move));const m=legal.find(m=>uci(m)===s.move);assert.ok(m&&m.piece==='k'&&!m.captured&&!/[+#]/.test(m.san));const rookMoves=legal.filter(m=>m.piece==='r'&&!m.captured&&!/[+#]/.test(m.san)).map(uci).sort();assert.ok(rookMoves.length);c.move(s.move);assert.equal(key(c),s.next);assert.ok(graph.has(s.next));actorStates++;cost++;adjacency.set(position,[s.next]);states.push({key:position,turn:actor,move:s.move,next:s.next,rookMoves});
  }else{
   assert.ok(exact(s,['key','replies'])&&Array.isArray(s.replies)&&s.replies.length<=218);assert.deepEqual(s.replies.map(e=>{assert.ok(exact(e,['move','next']));return e.move;}),legal.map(uci).sort());assert.ok(legal.length<=2);for(const m of legal)assert.ok(m.piece==='k'&&!m.captured&&!/[+#]/.test(m.san));
   for(const e of s.replies){c.move(e.move);assert.equal(key(c),e.next);assert.ok(graph.has(e.next));c.undo();cost++;}adjacency.set(position,s.replies.map(e=>e.next));states.push({key:position,turn:c.turn(),replies:structuredClone(s.replies),immobileNonkingUnits:fixed.filter(p=>p.color!==actor)});
  }
 }
 const reachable=new Set(),visit=k=>{if(reachable.has(k))return;reachable.add(k);for(const child of adjacency.get(k))visit(child);};visit(certificate.root);assert.equal(reachable.size,graph.size);nodes+=cost;
 const bound=4*actorStates,sample=[];let sampleGoal=null;
 for(let i=0;i<=bound;i++){sampleGoal=goal(current,counts,actor);if(sampleGoal)break;assert.ok(i<bound);const s=graph.get(key(current)),m=current.turn()===actor?s.move:s.replies[0].move,before=current.fen();current.move(m);add();sample.push({before,move:m,after:current.fen(),occurrences:counts.get(key(current))});nodes++;}assert.notEqual(sampleGoal,'mate');nodes++;if(nodes>limit)return exhausted();
 return finish('proven',{actual:{fen:input.fen,history:structuredClone(h)},certificate:structuredClone(certificate),material:{actorBalance:baseline,unrecovered:true,fixedNonkingUnits:fixed},states,recurrence:{actorStates,maxFurtherPlies:bound,defenses:'every-legal-reply',goal:'actor-threefold-or-fifty-claim-or-earlier-draw',claim:'opportunity-not-automatically-awarded'},sample:{kind:'one-deterministic-path-not-universal-enumeration',moves:sample,goal:sampleGoal,final:current.fen()}});
}
