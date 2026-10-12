import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E062-pawn-space/code/space.mjs';
import {replay} from '../../E063-pawn-storm/code/replay.mjs';
export const stormIds=Object.freeze(['pawn-storm']);
const notation=m=>m.from+m.to+(m.promotion||'');
function apply(board,move){const before=board.fen(),m=board.move(move);return{move:notation(m),san:m.san,from:m.from,to:m.to,piece:m.piece,color:m.color,captured:m.captured||null,promotion:m.promotion||null,before,after:board.fen()};}
function hasPawn(board,square,color){const unit=board.get(square);return unit?.type==='p'&&unit.color===color;}
function derive(input,limit){
 let nodes=0,status='complete',evidence=null,historyEndNode=null,geometryEndNode=null;const replyEndNodes=[],sentinel=Symbol('exhausted'),charge=()=>{nodes++;if(nodes>limit)throw sentinel;};
 try{
  charge();const board=legalPosition(input.history?.fen||input.fen),history=[];
  if(input.history)for(const move of input.history.moves){charge();history.push(apply(board,move));}
  historyEndNode=nodes;assert.equal(board.fen(),legalPosition(input.fen).fen());
  if(!board.isGameOver()){
   const beforeFen=board.fen(),color=board.turn(),beforePawns=new Set(board.board().flat().filter(p=>p?.type==='p'&&p.color===color).map(p=>p.square)),played=apply(board,input.move),afterFen=board.fen(),enemy=color==='w'?'b':'w';
   let castleIndex=-1,priorIndex=-1;
   for(const [index,move]of history.entries()){if(move.color===enemy&&move.piece==='k')castleIndex=index;if(move.color===color)priorIndex=index;}
   const castle=history[castleIndex],first=history[priorIndex];
   const recordedSequence=!board.isGameOver()&&played.piece==='p'&&played.promotion===null&&castle&&first?.piece==='p'&&first.promotion===null&&castleIndex<priorIndex&&priorIndex===history.length-2;
   if(recordedSequence){
    charge();geometryEndNode=nodes;
    const home=enemy==='w'?'1':'8',side=castle.to[0]==='g'?'k':castle.to[0]==='c'?'q':null,wing=new Set(side==='k'?['f','g','h']:['a','b','c']),king=board.board().flat().find(p=>p?.type==='k'&&p.color===enemy),relative=s=>color==='w'?Number(s[1]):9-Number(s[1]),distance=s=>Math.abs(Number(king.square[1])-Number(s[1]));
    const castleVerified=side!==null&&castle.from==='e'+home&&castle.to===(side==='k'?'g':'c')+home&&castle.san.replace(/[+#]$/,'')===(side==='k'?'O-O':'O-O-O')&&king.square===castle.to;
    const distinctPresent=first.to!==played.from&&beforePawns.has(first.to)&&hasPawn(board,first.to,color)&&hasPawn(board,played.to,color);
    const advances=[first,played],toward=advances.every(m=>wing.has(m.from[0])&&wing.has(m.to[0])&&relative(m.to)>relative(m.from)&&distance(m.to)<distance(m.from));
    const squares=[first.to,played.to],fileGap=Math.abs(squares[0].charCodeAt(0)-squares[1].charCodeAt(0)),rankGap=Math.abs(Number(squares[0][1])-Number(squares[1][1])),advanced=squares.every(s=>relative(s)>=4&&distance(s)>0);
    if(castleVerified&&distinctPresent&&toward&&advanced&&fileGap===1&&rankGap<=1){
     const pawns=squares.map(square=>({square,type:'p',color})),responses=[];
     for(const move of board.moves({verbose:true}).map(notation)){
      charge();const reply=apply(board,move);
      try{responses.push({reply,terminal:board.isGameOver(),pawnPresent:squares.map(square=>hasPawn(board,square,color))});}finally{board.undo();}
      replyEndNodes.push({move,endNode:nodes});
     }
     assert.equal(board.fen(),afterFen);assert(responses.length>0);
     evidence={beforeFen,afterFen,history,played,castleIndex,priorIndex,castle,priorAdvance:first,king:{square:king.square,type:'k',color:enemy},side,pawns,connection:{fileGap,rankGap},distances:advances.map(m=>({from:distance(m.from),to:distance(m.to)})),responses};
    }
   }
  }
 }catch(error){if(error!==sentinel)throw error;status='exhausted';evidence=null;}
 return{nodes,status,evidence,historyEndNode,geometryEndNode,replyEndNodes};
}
export async function openE063Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.pawnStormTags??false,limit=input.maxPawnStormNodes??50000;
 if(typeof enabled!=='boolean')throw Error('pawnStormTags must be boolean');if(!Number.isInteger(limit)||limit<0||limit>50000)throw Error('maxPawnStormNodes must be an integer from 0 to 50000');
 const base=parent(input);assert(!base.events.some(e=>stormIds.includes(e.id)));
 if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,parentEvaluations:1,oracleEvaluations:0,ownProofReplays:0,replayMetadata:[],historyEndNode:null,geometryEndNode:null,replyEndNodes:[],exactResult:true,parentSemanticReplayRequired:true};}
 const d=derive(input,limit),own=[];
 if(d.evidence){const {priorAdvance,played,king}=d.evidence;own.push({id:'pawn-storm',qualityClaim:false,text:`Pawn storm: ${priorAdvance.san} and ${played.san} advanced distinct pawns toward their castled king on ${king.square}; both now occupy that flank.`,evidence:d.evidence});}
 const events=[...base.events,...own],priority=e=>e.id==='pawn-storm'?101.05:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
 assert.deepEqual(actual,{...base,schema:'coach-concepts-v44',events,comment,pawnStormAnalysis:{limit,nodes:d.nodes,status:d.status}});assert(!comment||comment.split(/\s+/).length<=24);
 const replayMetadata=own.map(e=>replay(input,e));return{state:d.status,certificates:own.length,parentEvaluations:1,oracleEvaluations:1,ownProofReplays:own.length,replayMetadata,historyEndNode:d.historyEndNode,geometryEndNode:d.geometryEndNode,replyEndNodes:d.replyEndNodes,exactResult:true,parentSemanticReplayRequired:true};
 }};}
