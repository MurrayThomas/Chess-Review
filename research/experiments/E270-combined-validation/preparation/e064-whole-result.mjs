import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E063-pawn-storm/code/storm.mjs';
import {replay} from '../../E064-blocked-position/code/replay.mjs';
export const wallIds=Object.freeze(['blocked-position']);
const notation=m=>m.from+m.to+(m.promotion||'');
function apply(board,move){const before=board.fen(),m=board.move(move);return{move:notation(m),san:m.san,from:m.from,to:m.to,piece:m.piece,color:m.color,captured:m.captured||null,promotion:m.promotion||null,before,after:board.fen()};}
function pawnList(board,color){return board.board().flat().filter(p=>p?.type==='p'&&p.color===color).map(p=>({square:p.square,type:'p',color})).sort((a,b)=>a.square.localeCompare(b.square));}
function describeWall(board,color){
 const own=pawnList(board,color),enemy=pawnList(board,color==='w'?'b':'w');
 if(own.length<4||own.length!==enemy.length)return null;
 const ownFiles=new Map(),enemySquares=new Map(enemy.map(p=>[p.square,p]));
 for(const pawn of own){if(ownFiles.has(pawn.square[0]))return null;ownFiles.set(pawn.square[0],pawn);}
 const files=[...ownFiles.keys()].sort(),first=files[0].charCodeAt(0),last=files.at(-1).charCodeAt(0);
 if(!ownFiles.has('d')||!ownFiles.has('e')||last-first+1!==files.length)return null;
 const rams=[];for(const file of files){const pawn=ownFiles.get(file),rank=Number(pawn.square[1])+(color==='w'?1:-1),opponent=enemySquares.get(file+rank);if(!opponent)return null;rams.push({own:pawn,enemy:opponent,file});}
 return{own,enemy,rams};
}
function derive(input,limit){
 let nodes=0,status='complete',evidence=null,absenceReason='before-terminal',counterfactualFen=null;const stageAudits=[],responseEndNodes=[],sentinel=Symbol('exhausted');
 const charge=()=>{nodes++;if(nodes>limit)throw sentinel;};
 function enumerate(board,role){const rootFen=board.fen(),records=[];for(const move of board.moves({verbose:true}).map(notation)){charge();let record;try{record=apply(board,move);records.push(record);}finally{if(record)board.undo();}}assert.equal(board.fen(),rootFen);stageAudits.push({role,rootFen,legalMoves:records.length,endNode:nodes});return records;}
 try{
  charge();const board=legalPosition(input.history?.fen||input.fen),history=[];
  if(input.history)for(const move of input.history.moves){charge();history.push(apply(board,move));}
  assert.equal(board.fen(),legalPosition(input.fen).fen());
  if(!board.isGameOver()){
   const beforeFen=board.fen(),beforePawnMoves=enumerate(board,'before').filter(m=>m.piece==='p'),played=apply(board,input.move),afterFen=board.fen(),color=played.color;
   absenceReason='not-straight-advance';
   if(!board.isGameOver()&&played.piece==='p'&&played.captured===null&&played.promotion===null&&played.from[0]===played.to[0]){
    assert(beforePawnMoves.some(m=>m.move===played.move));charge();const geometry=describeWall(board,color);absenceReason='wall-geometry';
    if(geometry){
     const enemyMoves=enumerate(board,'enemy'),fields=afterFen.split(' ');fields[1]=color;fields[3]='-';counterfactualFen=fields.join(' ');let ownTurn;
     try{ownTurn=legalPosition(counterfactualFen);}catch{}
     absenceReason=!ownTurn?'illegal-own-turn':ownTurn.isGameOver()?'terminal-own-turn':'enemy-pawn-move';
     if(ownTurn&&!ownTurn.isGameOver()&&enemyMoves.every(m=>m.piece!=='p')){
      const ownTurnPawnMoves=enumerate(ownTurn,'own-turn').filter(m=>m.piece==='p');absenceReason='own-pawn-move';
      if(ownTurnPawnMoves.length===0){
       const responses=[];let valid=enemyMoves.length>0;absenceReason='reply-refuted';
       for(const move of enemyMoves){
        charge();const reply=apply(board,move.move);let response;
        try{
         const terminal=board.isGameOver(),next=describeWall(board,color),ownPawns=pawnList(board,color),enemyPawns=pawnList(board,color==='w'?'b':'w'),pawnMoves=terminal?[]:enumerate(board,'reply:'+move.move).filter(m=>m.piece==='p');
         response={reply,terminal,ownPawns,enemyPawns,pawnMoves};responses.push(response);
         if(terminal||!next||JSON.stringify(ownPawns)!==JSON.stringify(geometry.own)||JSON.stringify(enemyPawns)!==JSON.stringify(geometry.enemy)||pawnMoves.length!==0)valid=false;
        }finally{board.undo();}
        responseEndNodes.push({move:move.move,endNode:nodes,terminal:response.terminal});
       }
       assert.equal(board.fen(),afterFen);
       if(valid){absenceReason=null;evidence={beforeFen,afterFen,history,played,beforePawnMoves,ownPawns:geometry.own,enemyPawns:geometry.enemy,rams:geometry.rams,enemyMoves,ownTurnFen:ownTurn.fen(),ownTurnPawnMoves,responses};}
      }
     }
    }
   }
  }
 }catch(error){if(error!==sentinel)throw error;status='exhausted';evidence=null;absenceReason='exhausted';}
 return{nodes,status,evidence,absenceReason,counterfactualFen,stageAudits,responseEndNodes};
}
export async function openE064Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.blockedPositionTags??false,limit=input.maxBlockedPositionNodes??50000;
 if(typeof enabled!=='boolean')throw Error('blockedPositionTags must be boolean');if(!Number.isInteger(limit)||limit<0||limit>50000)throw Error('maxBlockedPositionNodes must be an integer from 0 to 50000');
 const base=parent(input);assert(!base.events.some(e=>wallIds.includes(e.id)));
 if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,parentEvaluations:1,oracleEvaluations:0,ownProofReplays:0,replayMetadata:[],stageAudits:[],responseEndNodes:[],absenceReason:'disabled',counterfactualFen:null,exactResult:true,parentSemanticReplayRequired:true};}
 const d=derive(input,limit),own=[];
 if(d.evidence){const {played,rams}=d.evidence;own.push({id:'blocked-position',qualityClaim:false,text:`Blocked position: ${played.san} completed ${rams.length} pawn rams; neither side has a pawn move now, and yours stay immobile after every reply.`,evidence:d.evidence});}
 const events=[...base.events,...own],priority=e=>e.id==='blocked-position'?101.025:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
 assert.deepEqual(actual,{...base,schema:'coach-concepts-v45',events,comment,blockedPositionAnalysis:{limit,nodes:d.nodes,status:d.status}});assert(!comment||comment.split(/\s+/).length<=24);
 const replayMetadata=own.map(e=>replay(input,e));return{state:d.status,certificates:own.length,parentEvaluations:1,oracleEvaluations:1,ownProofReplays:own.length,replayMetadata,stageAudits:d.stageAudits,responseEndNodes:d.responseEndNodes,absenceReason:d.absenceReason,counterfactualFen:d.counterfactualFen,exactResult:true,parentSemanticReplayRequired:true};
 }};}
