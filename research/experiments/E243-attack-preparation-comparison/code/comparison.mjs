import {Chess} from '../../../../lib/chess.js';
import {uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {actual,outcome,key} from '../../E210-sustainable-threat-policy/code/rules.mjs';
import {validate,empty} from './contract.mjs';
const exhausted=Symbol('exhausted');
function run(input,options,policy){
 const o=validate(input,options,policy),r=empty(o,policy);if(!o.enabled)return r;
 if(!input.history)return{...r,status:'unavailable',reason:'history-prerequisite'};
 let work=input.history.moves.length,reason=null;
 const reserve=()=>{work+=130;if(work>o.maxWork){reason='logical-work-cap';throw exhausted;}};
 const makeFrame=(c,n)=>{reserve();const legal=c.moves({verbose:true}).map(uci).sort();if(legal.length>o.maxReplies){reason='reply-domain-cap';throw exhausted;}const terminal=outcome(c,n,null),claim=outcome(c,n,c.turn());return{fen:c.fen(),check:c.isCheck(),terminal,knownClaim:claim!==terminal?claim:null,legal,knownOccurrences:n.get(key(c))??0};};
 const advance=(c,n,m)=>{const b=new Chess(c.fen()),counts=new Map(n),move=b.move(m);counts.set(key(b),(counts.get(key(b))??0)+1);return{c:b,counts,move};};
 function fixed(root,counts,first,followup){
  const p=advance(root,counts,first),after=makeFrame(p.c,p.counts),replies=[];
  if(!after.terminal)for(const reply of after.legal){const d=advance(p.c,p.counts,reply),frame=makeFrame(d.c,d.counts),legalFollowup=!frame.terminal&&frame.legal.includes(followup);let final=null,followupPiece=null,captured=null;
   if(legalFollowup){followupPiece=d.c.get(followup.slice(0,2));const a=advance(d.c,d.counts,followup);captured=a.move.captured??null;final=makeFrame(a.c,a.counts);}
   replies.push({reply,afterReply:frame,followup:legalFollowup?followup:null,legalFollowup,followupPiece,captured,final});
  }
  const allMate=!after.terminal&&!after.knownClaim&&replies.length>0&&replies.every(x=>!x.afterReply.knownClaim&&x.final?.terminal==='mate'&&new Chess(x.final.fen).turn()!==root.turn());
  return{move:first,followup,after,replies,allMate};
 }
 try{
  // Minimum reservation precedes replay; the root frame consumes it below.
  if(work+130>o.maxWork){reason='logical-work-cap';throw exhausted;}
  const {c:root,counts}=actual(input),frame=makeFrame(root,counts),actor=root.turn();
  if(frame.terminal||frame.knownClaim)return{...r,status:'unavailable',reason:frame.terminal??frame.knownClaim,work};
  if(policy){if(!frame.legal.includes(input.move))throw Error('Illegal first move');const tree=fixed(root,counts,input.move,input.followup);r.context={id:input.id,source:input.source,actor,root:frame,tree,priorHistoryComplete:input.history.fen===new Chess().fen(),actualGameAdjudicationClaim:false};r.status=tree.allMate?'policy-established':'not-established';}
  else{
   if(!frame.legal.includes(input.attack)||!frame.legal.includes(input.preparation))throw Error('Illegal attack/preparation');
   const attacker=root.get(input.attack.slice(0,2)),target=root.get(input.attack.slice(2,4)),preparer=root.get(input.preparation.slice(0,2));
   const a=advance(root,counts,input.attack),directFrame=makeFrame(a.c,a.counts),directReplies=[];
   if(!directFrame.terminal)for(const reply of directFrame.legal){const d=advance(a.c,a.counts,reply);directReplies.push({reply,frame:makeFrame(d.c,d.counts)});}
   const preparation=fixed(root,counts,input.preparation,input.attack),prepMove=root.moves({verbose:true}).find(m=>uci(m)===input.preparation);
   const roles={attacker:{square:input.attack.slice(0,2),...attacker},target:target?{square:input.attack.slice(2,4),...target}:null,preparer:{square:input.preparation.slice(0,2),...preparer},attack:!!a.move.captured&&!a.move.promotion&&!['p','k'].includes(attacker.type)&&directFrame.check,preparation:input.preparation.slice(0,2)!==input.attack.slice(0,2)&&!prepMove.captured&&!prepMove.promotion&&!preparation.after.terminal};
   const enemyMatingReplies=directReplies.filter(x=>x.frame.terminal==='mate'&&new Chess(x.frame.fen).turn()===actor).map(x=>x.reply);
   const sameAttackMates=preparation.allMate&&preparation.replies.every(x=>x.followupPiece?.color===attacker.color&&x.followupPiece?.type===attacker.type&&x.captured===target?.type&&x.final.check);
   const registeredComparison=roles.attack&&roles.preparation&&enemyMatingReplies.length>0&&sameAttackMates;
   r.context={id:input.id,source:input.source,actor,root:frame,attack:input.attack,roles,direct:{after:directFrame,replies:directReplies,enemyMatingReplies},preparation,sameAttackMates,registeredComparison,priorHistoryComplete:input.history.fen===new Chess().fen(),actualGameAdjudicationClaim:false,scope:'Fixed same-attack finite timing comparison; broader strategy and unknown claims unverified.'};r.status=registeredComparison?'comparison-established':'not-established';
  }
  r.work=work;return r;
 }catch(e){if(e!==exhausted)throw e;return{...r,status:'budget-unavailable',reason,work:o.maxWork+1,context:null};}
}
export const inspectAttackPreparation=(input,options={})=>run(input,options,false);
export const collectFixedPolicy=(input,options={})=>run(input,options,true);
