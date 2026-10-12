import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E065-king-triangulation/code/triangle.mjs';
import {replay} from '../../E066-pawn-races/code/replay.mjs';
export const raceIds=Object.freeze(['pawn-race']);
const notation=m=>m.from+m.to+(m.promotion||'');
function apply(board,uci){const before=board.fen(),m=board.move(uci);return{move:notation(m),san:m.san,from:m.from,to:m.to,piece:m.piece,color:m.color,captured:m.captured||null,promotion:m.promotion||null,before,after:board.fen()};}
const rank=(square,color)=>color==='w'?Number(square[1]):9-Number(square[1]);
const passed=(pawn,other)=>Math.abs(pawn.square.charCodeAt(0)-other.square.charCodeAt(0))>=2||rank(other.square,pawn.color)<rank(pawn.square,pawn.color);
function derive(input,depth,limit){
 let nodes=0,status='ineligible',evidence=null,refutationTree=null;const branchEnds=[],continuationEnds=[],sentinel=Symbol('exhausted');
 const charge=()=>{nodes++;if(nodes>limit)throw sentinel;};
 try{
  charge();const board=legalPosition(input.history?.fen||input.fen),history=[];
  if(input.history)for(const move of input.history.moves){charge();history.push(apply(board,move));}
  assert.equal(board.fen(),legalPosition(input.fen).fen());
  if(!board.isGameOver()){
   const beforeFen=board.fen(),played=apply(board,input.move),afterFen=board.fen();
   const pieces=board.board().flat().filter(Boolean).map(p=>({square:p.square,type:p.type,color:p.color})).sort((a,b)=>a.square.localeCompare(b.square));
   const ownPawns=pieces.filter(p=>p.type==='p'&&p.color===played.color),enemyPawns=pieces.filter(p=>p.type==='p'&&p.color!==played.color),pawn=ownPawns[0],rival=enemyPawns[0];
   const eligible=!board.isGameOver()&&played.piece==='p'&&played.captured===null&&played.promotion===null&&pieces.length===4&&pieces.filter(p=>p.type==='k').length===2&&ownPawns.length===1&&enemyPawns.length===1&&pawn.square===played.to&&rank(pawn.square,pawn.color)>=5&&rank(rival.square,rival.color)>=5&&passed(pawn,rival)&&passed(rival,pawn);
   if(eligible){
    const pushes=8-rank(pawn.square,pawn.color);
    if(depth<pushes*2)status='short-profile';else{
     // Distinct enemy and own resolvers preserve the full legal history through move/undo.
     function enter(square,left){charge();const state={fen:board.fen(),square,left};const p=board.get(square);if(p?.type!=='p'||p.color!==played.color)return{kind:'captured',win:false,...state};if(board.isGameOver())return{kind:'terminal',win:false,...state};if(left===0)return{kind:'limit',win:false,...state};return null;}
     function defenses(square,left){
      const stopped=enter(square,left);if(stopped)return stopped;
      assert.notEqual(board.turn(),played.color);const fen=board.fen(),domain=board.moves({verbose:true}).map(notation),branches=[];
      for(const uci of domain){charge();const move=apply(board,uci);let child;
       try{child=move.promotion?{kind:'rival-promoted',win:false,fen:board.fen(),promotion:move.promotion}:advance(square,left-1);}finally{board.undo();}
       branches.push({move,child});branchEnds.push({fen,move:uci,endNode:nodes,root:fen===afterFen});
      }
      return{kind:'all',fen,square,left,win:branches.length!==0&&branches.every(b=>b.child.win),branches};
     }
     function advance(square,left){
      const stopped=enter(square,left);if(stopped)return stopped;
      assert.equal(board.turn(),played.color);const fen=board.fen(),file=square[0],allowed=board.moves({verbose:true}).filter(m=>m.from===square&&m.piece==='p'&&!m.captured&&m.to[0]===file&&(!m.promotion||m.promotion==='q'));
      if(allowed.length===0)return{kind:'no-legal-push',win:false,fen,square,left};assert.equal(allowed.length,1);
      charge();const move=apply(board,notation(allowed[0]));let child;
      try{
       if(move.promotion){assert.equal(move.promotion,'q');const terminal=board.isGameOver(),promotionFen=board.fen(),continuations=[];
        if(!terminal)for(const replyUci of board.moves({verbose:true}).map(notation)){charge();const reply=apply(board,replyUci);try{const unit=board.get(move.to);continuations.push({reply,terminal:board.isGameOver(),queenPresent:unit?.type==='q'&&unit.color===played.color});}finally{board.undo();}continuationEnds.push({fen:promotionFen,move:replyUci,endNode:nodes});}
        assert.equal(board.fen(),promotionFen);child={kind:'first',win:true,fen:promotionFen,square:move.to,terminal,continuations};
       }else child=defenses(move.to,left-1);
      }finally{board.undo();}
      return{kind:'push',fen,square,left,win:child.win,move,child};
     }
     const tree=defenses(pawn.square,depth);assert.equal(board.fen(),afterFen);status=tree.win?'proven':'refuted';
     if(tree.win)evidence={beforeFen,afterFen,history,played,pieces,pawn,rival,passed:{own:true,rival:true},pushes,depth,tree};else refutationTree=tree;
    }
   }
  }
 }catch(error){if(error!==sentinel)throw error;status='exhausted';evidence=null;refutationTree=null;}
 return{nodes,status,evidence,refutationTree,branchEnds,continuationEnds};
}
export async function openE066Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.pawnRaceTags??false,depth=input.pawnRaceDepth??6,limit=input.maxPawnRaceNodes??50000;
 if(typeof enabled!=='boolean')throw Error('pawnRaceTags must be boolean');if(!Number.isInteger(depth)||depth<0||depth>6)throw Error('pawnRaceDepth must be an integer from 0 to 6');if(!Number.isInteger(limit)||limit<0||limit>50000)throw Error('maxPawnRaceNodes must be an integer from 0 to 50000');
 const base=parent(input);assert(!base.events.some(e=>raceIds.includes(e.id)));
 if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,parentEvaluations:1,oracleEvaluations:0,ownProofReplays:0,branchEnds:[],continuationEnds:[],exactResult:true,parentSemanticReplayRequired:true};}
 const d=derive(input,depth,limit),own=[];
 if(d.evidence){const {pawn,rival,pushes}=d.evidence;own.push({id:'pawn-race',qualityClaim:false,text:`Pawn race: ${pawn.square} can queen before ${rival.square} against every legal defense, using ${pushes} pawn ${pushes===1?'move':'moves'}.`,evidence:d.evidence});}
 const events=[...base.events,...own],priority=e=>e.id==='pawn-race'?157.05:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
 assert.deepEqual(actual,{...base,schema:'coach-concepts-v47',events,comment,pawnRaceAnalysis:{limit,nodes:d.nodes,depth,status:d.status,refutationTree:d.refutationTree}});assert(!comment||comment.split(/\s+/).length<=24);
 const replayMetadata=own.map(e=>replay(input,e));return{state:d.status,certificates:own.length,parentEvaluations:1,oracleEvaluations:1,ownProofReplays:own.length,replayMetadata,branchEnds:d.branchEnds,continuationEnds:d.continuationEnds,exactResult:true,parentSemanticReplayRequired:true};
 }};}
