import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validate,empty} from './contract.mjs';
// Independent history, terminal, inventory, role and policy reconstruction.
// No import of E243 comparison/collector or E210 replay/rule derivation.
const uc=m=>m.from+m.to+(m.promotion??''),k=c=>c.fen().split(' ').slice(0,4).join(' ');
const moves=c=>c.moves({verbose:true}).map(uc).sort();
function end(c,n){if(c.isCheckmate())return'mate';if(c.isStalemate()||c.isInsufficientMaterial())return'board-draw';if((n.get(k(c))??0)>=5)return'automatic-fivefold';if(+c.fen().split(' ')[4]>=150)return'automatic-seventy-five';return null;}
function claim(c,n){if(end(c,n))return null;if((n.get(k(c))??0)>=3)return'actor-threefold-claim';if(+c.fen().split(' ')[4]>=100)return'actor-fifty-claim';return null;}
function copyMove(c,n,m){const next=new Chess(c.fen()),counts=new Map(n),meta=next.move(m);counts.set(k(next),(counts.get(k(next))??0)+1);return[next,counts,meta];}
export function reconstruct(input,options={},policy=false){
 const o=validate(input,options,policy),result=empty(o,policy);if(!o.enabled)return result;if(!input.history)return{...result,status:'unavailable',reason:'history-prerequisite'};
 let used=input.history.moves.length;const halt={};let why=null;
 function view(c,n){used+=130;if(used>o.maxWork){why='logical-work-cap';throw halt;}const legal=moves(c);if(legal.length>o.maxReplies){why='reply-domain-cap';throw halt;}return{fen:c.fen(),check:c.isCheck(),terminal:end(c,n),knownClaim:claim(c,n),legal,knownOccurrences:n.get(k(c))??0};}
 try{
  if(used+130>o.maxWork){why='logical-work-cap';throw halt;}
  const root=legalPosition(input.history.fen),counts=new Map([[k(root),1]]);
  for(const m of input.history.moves){if(end(root,counts)||!moves(root).includes(m))throw Error('Invalid replay history');root.move(m);counts.set(k(root),(counts.get(k(root))??0)+1);}
  if(root.fen()!==legalPosition(input.fen).fen())throw Error('History endpoint mismatch');
  const actor=root.turn(),start=view(root,counts);if(start.terminal||start.knownClaim)return{...result,status:'unavailable',reason:start.terminal??start.knownClaim,work:used};
  function policyTree(first,nextMove){
   const [c,n]=copyMove(root,counts,first),after=view(c,n),replies=[];
   for(const m of after.terminal?[]:after.legal){const [d,dn]=copyMove(c,n,m),afterReply=view(d,dn);const legalFollowup=!afterReply.terminal&&afterReply.legal.includes(nextMove);let followupPiece=null,captured=null,final=null;
    if(legalFollowup){followupPiece=d.get(nextMove.slice(0,2));const [f,fn,meta]=copyMove(d,dn,nextMove);captured=meta.captured??null;final=view(f,fn);}
    replies.push({reply:m,afterReply,followup:legalFollowup?nextMove:null,legalFollowup,followupPiece,captured,final});
   }
   return{move:first,followup:nextMove,after,replies,allMate:!after.terminal&&!after.knownClaim&&replies.length>0&&replies.every(x=>!x.afterReply.knownClaim&&x.final?.terminal==='mate'&&x.final.fen.split(' ')[1]!==actor)};
  }
  if(policy){assert(start.legal.includes(input.move),'Illegal first');const tree=policyTree(input.move,input.followup);result.context={id:input.id,source:input.source,actor,root:start,tree,priorHistoryComplete:input.history.fen===new Chess().fen(),actualGameAdjudicationClaim:false};result.status=tree.allMate?'policy-established':'not-established';}
  else{
   assert(start.legal.includes(input.attack)&&start.legal.includes(input.preparation),'Illegal attack/preparation');
   const [a,an,am]=copyMove(root,counts,input.attack),after=view(a,an),replies=[];
   for(const m of after.terminal?[]:after.legal){const [d,dn]=copyMove(a,an,m);replies.push({reply:m,frame:view(d,dn)});}
   const preparation=policyTree(input.preparation,input.attack),attacker=root.get(input.attack.slice(0,2)),target=root.get(input.attack.slice(2,4)),preparer=root.get(input.preparation.slice(0,2));
   const pm=root.moves({verbose:true}).find(m=>uc(m)===input.preparation),roles={attacker:{square:input.attack.slice(0,2),...attacker},target:target?{square:input.attack.slice(2,4),...target}:null,preparer:{square:input.preparation.slice(0,2),...preparer},attack:!!am.captured&&!am.promotion&&!['p','k'].includes(attacker.type)&&after.check,preparation:input.preparation.slice(0,2)!==input.attack.slice(0,2)&&!pm.captured&&!pm.promotion&&!preparation.after.terminal};
   const enemyMatingReplies=replies.filter(x=>x.frame.terminal==='mate'&&x.frame.fen.split(' ')[1]===actor).map(x=>x.reply),sameAttackMates=preparation.allMate&&preparation.replies.every(x=>x.followupPiece?.color===attacker.color&&x.followupPiece?.type===attacker.type&&x.captured===target?.type&&x.final.check),registeredComparison=roles.attack&&roles.preparation&&enemyMatingReplies.length>0&&sameAttackMates;
   result.context={id:input.id,source:input.source,actor,root:start,attack:input.attack,roles,direct:{after,replies,enemyMatingReplies},preparation,sameAttackMates,registeredComparison,priorHistoryComplete:input.history.fen===new Chess().fen(),actualGameAdjudicationClaim:false,scope:'Fixed same-attack finite timing comparison; broader strategy and unknown claims unverified.'};result.status=registeredComparison?'comparison-established':'not-established';
  }
  result.work=used;return result;
 }catch(e){if(e!==halt)throw e;return{...result,status:'budget-unavailable',reason:why,work:o.maxWork+1,context:null};}
}
export function checkComparison(input,options,result,policy=false){assert.deepEqual(result,reconstruct(input,options,policy));return true;}
