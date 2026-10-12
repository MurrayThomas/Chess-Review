import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E064-blocked-position/code/blocked.mjs';
import {replay} from '../../E065-king-triangulation/code/replay.mjs';
export const triangleIds=Object.freeze(['king-triangulation']);
const uci=m=>m.from+m.to+(m.promotion||'');
function apply(board,move){const before=board.fen(),m=board.move(move);return{move:uci(m),san:m.san,from:m.from,to:m.to,piece:m.piece,color:m.color,captured:m.captured||null,promotion:m.promotion||null,before,after:board.fen()};}
const occupants=board=>board.board().flat().filter(Boolean).map(p=>({square:p.square,type:p.type,color:p.color})).sort((a,b)=>a.square.localeCompare(b.square));
const coordinates=s=>[s.charCodeAt(0)-97,Number(s[1])];
function derive(input,limit){
 let nodes=0,status='complete',evidence=null;const replyEndNodes=[],sentinel=Symbol('exhausted'),charge=()=>{nodes++;if(nodes>limit)throw sentinel;};
 try{
  charge();
  if(input.history&&input.history.moves.length>=4){
   const board=legalPosition(input.history.fen),history=[];
   for(const move of input.history.moves){charge();history.push(apply(board,move));}
   assert.equal(board.fen(),legalPosition(input.fen).fen());
   if(!board.isGameOver()){
    const beforeFen=board.fen(),played=apply(board,input.move),afterFen=board.fen(),segmentIndex=history.length-4,segment=history.slice(segmentIndex).concat(played);
    const own=[segment[0],segment[2],segment[4]],enemy=[segment[1],segment[3]],color=played.color;
    const quietSegment=segment.every(m=>m.captured===null&&m.promotion===null&&!/^O-O/.test(m.san));
    const sameOwnKing=own.every(m=>m.piece==='k'&&m.color===color)&&own[0].to===own[1].from&&own[1].to===own[2].from&&own[2].to===own[0].from;
    const reversibleEnemy=enemy.every(m=>m.color!==color&&m.piece!=='p')&&enemy[0].piece===enemy[1].piece&&enemy[0].to===enemy[1].from&&enemy[1].to===enemy[0].from;
    const route=[own[0].from,own[0].to,own[1].to,own[2].to],vertices=route.slice(0,3).map(coordinates);
    const area2=vertices.reduce((sum,[x,y],i)=>{const [nextX,nextY]=vertices[(i+1)%3];return sum+x*nextY-y*nextX;},0);
    const start=segment[0].before.split(' '),finish=afterFen.split(' '),sameRuleFields=[0,2,3].every(i=>start[i]===finish[i]);
    const triangle=new Set(route.slice(0,3)).size===3&&area2!==0,turnChanged=start[1]===color&&finish[1]!==color;
    if(!board.isGameOver()&&quietSegment&&sameOwnKing&&reversibleEnemy&&triangle&&sameRuleFields&&turnChanged){
     const startBoard=legalPosition(segment[0].before);assert(!startBoard.isGameOver());const startPieces=occupants(startBoard),afterPieces=occupants(board);assert.deepEqual(startPieces,afterPieces);assert.equal(Number(finish[4]),Number(start[4])+5);assert.equal(Number(finish[5]),Number(start[5])+(color==='w'?2:3));
     charge();const responses=[];
     for(const move of board.moves({verbose:true}).map(uci)){charge();const reply=apply(board,move);try{responses.push({reply,terminal:board.isGameOver()});}finally{board.undo();}replyEndNodes.push({move,endNode:nodes});}
     assert.equal(board.fen(),afterFen);
     if(responses.length)evidence={beforeFen,afterFen,history,played,segmentIndex,segment,startFen:startBoard.fen(),route,area2,enemy:{piece:enemy[0].piece,color:enemy[0].color,route:[enemy[0].from,enemy[0].to,enemy[1].to]},startPieces,afterPieces,state:{placement:start[0],castling:start[2],ep:start[3],beforeTurn:start[1],afterTurn:finish[1],beforeHalfmove:Number(start[4]),afterHalfmove:Number(finish[4]),beforeFullmove:Number(start[5]),afterFullmove:Number(finish[5])},responses};
    }
   }
  }
 }catch(error){if(error!==sentinel)throw error;status='exhausted';evidence=null;}
 return{nodes,status,evidence,replyEndNodes};
}
export async function openE065Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.triangulationTags??false,limit=input.maxTriangulationNodes??50000;
 if(typeof enabled!=='boolean')throw Error('triangulationTags must be boolean');if(!Number.isInteger(limit)||limit<0||limit>50000)throw Error('maxTriangulationNodes must be an integer from 0 to 50000');
 const base=parent(input);assert(!base.events.some(e=>triangleIds.includes(e.id)));
 if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,parentEvaluations:1,oracleEvaluations:0,ownProofReplays:0,replayMetadata:[],replyEndNodes:[],exactResult:true,parentSemanticReplayRequired:true};}
 const d=derive(input,limit),own=[];
 if(d.evidence){const route=d.evidence.route;own.push({id:'king-triangulation',qualityClaim:false,text:`Triangulation: your king returned via ${route[1]} and ${route[2]}, restoring piece placement and passing the move; clocks and history changed.`,evidence:d.evidence});}
 const events=[...base.events,...own],priority=e=>e.id==='king-triangulation'?101.015:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
 assert.deepEqual(actual,{...base,schema:'coach-concepts-v46',events,comment,triangulationAnalysis:{limit,nodes:d.nodes,status:d.status}});assert(!comment||comment.split(/\s+/).length<=24);
 const replayMetadata=own.map(e=>replay(input,e));return{state:d.status,certificates:own.length,parentEvaluations:1,oracleEvaluations:1,ownProofReplays:own.length,replayMetadata,replyEndNodes:d.replyEndNodes,exactResult:true,parentSemanticReplayRequired:true};
 }};}
