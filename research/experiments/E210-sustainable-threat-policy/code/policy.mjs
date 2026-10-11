import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {turnBoard} from '../../E027-defensive-resources/code/defense.mjs';
import {actual,key,outcome} from './rules.mjs';
const fields=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).every(k=>keys.includes(k));
const required=(x,keys)=>fields(x,keys)&&Object.keys(x).length===keys.length;
const fail=message=>{throw Error(message);};
export function inspectPerpetualAttack(input,options={},certificate){
 plain([input,options,certificate]);
 if(!fields(input,['fen','history'])||typeof input.fen!=='string'||!fields(options,['enabled','player','maxNodes']))fail('Invalid policy interface');
 if(input.history!==undefined&&!required(input.history,['fen','moves']))fail('Invalid actual history fields');
 const enabled=options.enabled===undefined?false:options.enabled,player=options.player,limit=options.maxNodes===undefined?50000:options.maxNodes;
 if(typeof enabled!=='boolean'||player!==undefined&&!['w','b'].includes(player)||enabled&&player===undefined||!Number.isSafeInteger(limit)||limit<0||limit>50000)fail('Invalid policy controls');
 let nodes=0;const empty=()=>({id:'C0467',available:false,side:null,frame:null,move:null,qualityClaim:false}),done=(status,witness=null,answer=empty())=>({schema:'E210-perpetual-attack',status,limit,nodes,player:player??null,answer,witness});
 if(!enabled)return done('disabled');const a=actual(input);if(!a)return done('history-prerequisite');
 const tick=()=>{if(++nodes>limit)throw Error('policy-budget');};
 try{
  for(let i=0;i<2+input.history.moves.length;i++)tick();
  const end=outcome(a.c,a.counts,player);if(end)return done(end.startsWith('actor-')?'already-claimable':'not-live');
  if(a.c.turn()!==player)return done('player-turn-prerequisite');if(a.c.isCheck())return done('nonchecking-prerequisite');
  if(certificate===undefined)return done('policy-prerequisite');
  if(!required(certificate,['schema','actor','root','states'])||certificate.schema!=='perpetual-policy-v1'||certificate.actor!==player||certificate.root!==key(a.c)||!Array.isArray(certificate.states)||certificate.states.length<1||certificate.states.length>64)fail('Invalid policy identity/size');
  const byKey=new Map();for(const s of certificate.states){if(!fields(s,['key','move','next','mateThreat','replies'])||typeof s.key!=='string'||byKey.has(s.key))fail('Invalid/duplicate policy state');const c=legalPosition(s.key+' 0 1');if(key(c)!==s.key)fail('Noncanonical policy key');byKey.set(s.key,s);}
  const queue=[certificate.root],seen=new Set(),verified=[];let actorStates=0;
  for(let i=0;i<queue.length;i++){
   const k=queue[i];if(seen.has(k))continue;seen.add(k);const s=byKey.get(k);if(!s)fail('Policy is not closed');tick();const c=legalPosition(k+' 0 1');
   if(c.isCheck()||c.isCheckmate()||c.isStalemate()||c.isInsufficientMaterial())fail('Policy state is not live/nonchecking');tick();const moves=c.moves({verbose:true}).sort((x,y)=>uci(x).localeCompare(uci(y)));
   if(c.turn()===player){
    if(!required(s,['key','move','next','mateThreat']))fail('Invalid actor state');actorStates++;const m=moves.find(m=>uci(m)===s.move);if(!m||m.captured||m.promotion||/[+#]/.test(m.san))fail('Actor policy must be quiet nonchecking');
    tick();c.move(s.move);if(key(c)!==s.next)fail('Actor edge mismatch');queue.push(s.next);
    tick();const diagram=turnBoard(c,player),model=diagram.fen();tick();if(typeof s.mateThreat!=='string'||!diagram.moves({verbose:true}).some(m=>uci(m)===s.mateThreat))fail('Illegal diagram threat');diagram.move(s.mateThreat);if(!diagram.isCheckmate())fail('Threat is not mate');
    verified.push({key:k,turn:player,move:s.move,next:s.next,threat:{model:'turn-flipped-diagram-not-a-legal-pass',history:null,fen:model,move:s.mateThreat,after:diagram.fen(),mate:true}});
   }else{
    if(!required(s,['key','replies'])||!Array.isArray(s.replies)||s.replies.length>218||s.replies.some(e=>!required(e,['move','next'])))fail('Invalid defender state');
    const supplied=s.replies.map(e=>e.move);if(JSON.stringify(supplied)!==JSON.stringify(moves.map(uci)))fail('Incomplete/unsorted defender domain');
    for(const e of s.replies){tick();c.move(e.move);if(key(c)!==e.next)fail('Defender edge mismatch');queue.push(e.next);c.undo();}
    verified.push({key:k,turn:c.turn(),replies:structuredClone(s.replies)});
   }
  }
  if(seen.size!==byKey.size)fail('Unreachable policy padding');
  const bound=4*actorStates,sample=[],c=a.c,counts=a.counts;let sampleGoal=null;
  for(let step=0;step<=bound;step++){
   sampleGoal=outcome(c,counts,player);if(sampleGoal)break;if(step===bound)fail('Recurrence theorem violated');
   const s=byKey.get(key(c)),move=c.turn()===player?s.move:s.replies[0].move,before=c.fen();tick();c.move(move);counts.set(key(c),(counts.get(key(c))||0)+1);sample.push({before,move,after:c.fen(),occurrences:counts.get(key(c))});
  }
  if(sampleGoal==='mate')fail('Unexpected mate in closed policy');tick();
  const witness={actual:{fen:input.fen,history:structuredClone(input.history),actor:player},certificate:structuredClone(certificate),states:verified.sort((x,y)=>x.key.localeCompare(y.key)),recurrence:{actorStates,maxFurtherPlies:bound,defenses:'every-legal-reply',goal:'actor-threefold-or-fifty-claim-or-earlier-automatic-draw',claim:'opportunity-not-automatically-awarded'},sample:{kind:'one-deterministic-path-not-all-path-enumeration',moves:sample,goal:sampleGoal,final:c.fen()}};
  return done('proven',witness,{id:'C0467',available:true,side:player,frame:input.fen,move:byKey.get(certificate.root).move,qualityClaim:false});
 }catch(e){if(e.message!=='policy-budget')throw e;nodes=limit+1;return done('exhausted');}
}
