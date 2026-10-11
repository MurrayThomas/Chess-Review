import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
const fields=(x,allowed)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>allowed.includes(k));
const exact=(x,keys)=>fields(x,keys)&&Object.keys(x).length===keys.length;
const key=c=>c.fen().split(' ').slice(0,4).join(' ');
function goal(c,occurrences,actor){
 if(c.isCheckmate())return'mate';if(!c.moves().length||c.isInsufficientMaterial())return'board-draw';
 const count=occurrences.get(key(c))||0,counter=Number(c.fen().split(' ')[4]);
 if(count>=5)return'automatic-fivefold';if(counter>=150)return'automatic-seventy-five';
 if(c.turn()===actor){if(count>=3)return'actor-threefold-claim';if(counter>=100)return'actor-fifty-claim';}return null;
}
export function checkPerpetualAttack(input,options,certificate,result){
 plain([input,options,certificate,result]);assert.ok(fields(input,['fen','history'])&&typeof input.fen==='string'&&fields(options,['enabled','player','maxNodes']));if(input.history!==undefined)assert.ok(exact(input.history,['fen','moves']));
 const enabled=options.enabled===undefined?false:options.enabled,actor=options.player,limit=options.maxNodes===undefined?50000:options.maxNodes;assert.equal(typeof enabled,'boolean');assert.ok(actor===undefined||['w','b'].includes(actor));assert.ok(!enabled||actor!==undefined);assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);
 let nodes=0;const empty=()=>({id:'C0467',available:false,side:null,frame:null,move:null,qualityClaim:false}),make=(status,witness=null,answer=empty())=>({schema:'E210-perpetual-attack',status,limit,nodes,player:actor??null,answer,witness}),finish=q=>{assert.deepEqual(result,q);return true;},exhaust=()=>{nodes=limit+1;return finish(make('exhausted'));};
 if(!enabled)return finish(make('disabled'));if(!input.history)return finish(make('history-prerequisite'));
 const h=input.history;assert.ok(typeof h.fen==='string'&&Array.isArray(h.moves)&&h.moves.length<=1000);const current=legalPosition(h.fen),occurrences=new Map();const add=()=>occurrences.set(key(current),(occurrences.get(key(current))||0)+1);add();
 for(const code of h.moves){assert.equal(goal(current,occurrences,null),null,'Automatic terminal cannot be continued');assert.ok(typeof code==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(code));current.move(code);add();}
 assert.equal(current.fen(),legalPosition(input.fen).fen());nodes=2+h.moves.length;if(nodes>limit)return exhaust();const end=goal(current,occurrences,actor);if(end)return finish(make(end.startsWith('actor-')?'already-claimable':'not-live'));if(current.turn()!==actor)return finish(make('player-turn-prerequisite'));if(current.isCheck())return finish(make('nonchecking-prerequisite'));if(certificate===undefined)return finish(make('policy-prerequisite'));
 assert.ok(exact(certificate,['schema','actor','root','states']));assert.equal(certificate.schema,'perpetual-policy-v1');assert.equal(certificate.actor,actor);assert.equal(certificate.root,key(current));assert.ok(Array.isArray(certificate.states)&&certificate.states.length>=1&&certificate.states.length<=64);
 const graph=new Map();for(const s of certificate.states){assert.ok(fields(s,['key','move','next','mateThreat','replies'])&&typeof s.key==='string'&&!graph.has(s.key));const c=legalPosition(s.key+' 0 1');assert.equal(key(c),s.key);graph.set(s.key,s);}
 // Validate sorted vertices first, independently of runtime's forward BFS admission.
 const verified=[],adjacency=new Map();let actorStates=0,graphCost=0;
 for(const [position,s]of [...graph.entries()].sort(([x],[y])=>x.localeCompare(y))){
  const c=legalPosition(position+' 0 1');assert.equal(c.isCheck(),false);assert.equal(c.isInsufficientMaterial(),false);const domain=c.moves({verbose:true});assert.ok(domain.length);graphCost+=2;
  if(c.turn()===actor){
   assert.ok(exact(s,['key','move','next','mateThreat']));actorStates++;const m=domain.find(m=>uci(m)===s.move);assert.ok(m&&!m.captured&&!m.promotion&&!/[+#]/.test(m.san));c.move(s.move);assert.equal(key(c),s.next);assert.ok(graph.has(s.next));graphCost+=3;
   const f=c.fen().split(' ');f[1]=actor;f[3]='-';const diagram=legalPosition(f.join(' ')),frame=diagram.fen();assert.ok(typeof s.mateThreat==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(s.mateThreat));assert.ok(diagram.moves({verbose:true}).some(m=>uci(m)===s.mateThreat),'Threat must use legal UCI');diagram.move(s.mateThreat);assert.equal(diagram.isCheckmate(),true);
   verified.push({key:position,turn:actor,move:s.move,next:s.next,threat:{model:'turn-flipped-diagram-not-a-legal-pass',history:null,fen:frame,move:s.mateThreat,after:diagram.fen(),mate:true}});adjacency.set(position,[s.next]);
  }else{
   assert.ok(exact(s,['key','replies'])&&Array.isArray(s.replies)&&s.replies.length<=218);assert.deepEqual(s.replies.map(e=>{assert.ok(exact(e,['move','next']));return e.move;}),domain.map(uci).sort());
   for(const e of s.replies){c.move(e.move);assert.equal(key(c),e.next);assert.ok(graph.has(e.next));c.undo();graphCost++;}
   adjacency.set(position,s.replies.map(e=>e.next));verified.push({key:position,turn:c.turn(),replies:structuredClone(s.replies)});
  }
 }
 const seen=new Set(),visit=position=>{if(seen.has(position))return;seen.add(position);for(const child of adjacency.get(position))visit(child);};visit(certificate.root);assert.equal(seen.size,graph.size,'Unreachable padding');
 nodes+=graphCost;const bound=4*actorStates,sample=[];let sampleGoal=null;
 for(let step=0;step<=bound;step++){sampleGoal=goal(current,occurrences,actor);if(sampleGoal)break;assert.ok(step<bound,'Finite closed actor-state recurrence bound');const s=graph.get(key(current)),move=current.turn()===actor?s.move:s.replies[0].move,before=current.fen();current.move(move);add();sample.push({before,move,after:current.fen(),occurrences:occurrences.get(key(current))});nodes++;}
 assert.notEqual(sampleGoal,'mate');nodes++;if(nodes>limit)return exhaust();
 const witness={actual:{fen:input.fen,history:structuredClone(h),actor},certificate:structuredClone(certificate),states:verified,recurrence:{actorStates,maxFurtherPlies:bound,defenses:'every-legal-reply',goal:'actor-threefold-or-fifty-claim-or-earlier-automatic-draw',claim:'opportunity-not-automatically-awarded'},sample:{kind:'one-deterministic-path-not-all-path-enumeration',moves:sample,goal:sampleGoal,final:current.fen()}};
 return finish(make('proven',witness,{id:'C0467',available:true,side:actor,frame:input.fen,move:graph.get(certificate.root).move,qualityClaim:false}));
}
