import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {Chess} from '../../../../lib/chess.js';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {explainMove as parent,priority as inheritedPriority} from '../../E073-carlsbad-hedgehog/code/structures.mjs';
import {replay as replayEvent} from '../../E074-french-scheveningen/code/replay.mjs';
export const centerIds=Object.freeze(['french-pawn-chain','scheveningen-structure']);
const uci=m=>m.from+m.to+(m.promotion||'');
const moved=(c,value)=>{const before=c.fen(),m=c.move(value);return{move:uci(m),san:m.san,from:m.from,to:m.to,piece:m.piece,color:m.color,captured:m.captured||null,promotion:m.promotion||null,before,after:c.fen()};};
function derive(input,limit){
 const stop=Symbol('exhausted');let nodes=0,status='ineligible',roles=[];const tick=()=>{nodes++;if(nodes>limit)throw stop;};
 try{
  tick();const color=new Chess(input.fen).turn(),enemy=color==='w'?'b':'w',sq=s=>s[0]+(color==='w'?s[1]:9-Number(s[1])),c=new Chess(input.history?.fen||input.fen),isPawn=(b,s,side)=>b.get(s)?.type==='p'&&b.get(s)?.color===side;
  let own=isPawn(c,sq('c2'),color)?sq('c2'):null,other=isPawn(c,sq('d7'),enemy)?sq('d7'):null,first=null,exchange=null;
  for(const [ply,value]of (input.history?.moves||[]).entries()){
   tick();const from=value.slice(0,2),to=value.slice(2,4),piece=c.get(from),victim=c.get(to)?to:piece.type==='p'&&from[0]!==to[0]?to[0]+from[1]:null,ownMoved=own===from,otherMoved=other===from,ownLost=own!==null&&own===victim,otherLost=other!==null&&other===victim,row=moved(c,value);
   if(first&&row.captured&&to===first.capture.to&&piece.type!=='p'&&piece.color!==first.capture.color&&((first.order==='own-c-takes-enemy-d'&&ownLost)||(first.order==='enemy-d-takes-own-c'&&otherLost)))exchange={firstPly:first.ply,capture:first.capture,recapturePly:ply,recapture:row,order:first.order};
   first=row.piece==='p'&&((ownMoved&&otherLost)||(otherMoved&&ownLost))?{ply,capture:row,order:ownMoved?'own-c-takes-enemy-d':'enemy-d-takes-own-c'}:null;
   if(ownLost)own=null;else if(ownMoved)own=to;if(otherLost)other=null;else if(otherMoved)other=to;
  }
  if(own!==null||other!==null)exchange=null;assert.equal(c.fen(),new Chess(input.fen).fen());const before=new Chess(c.fen()),played=moved(c,input.move);tick();
  if(played.piece==='p'&&!c.isGameOver())for(const role of ['advanced','base','scheveningen']){
   const ownCore=(role==='advanced'?['d4','e5']:role==='base'?['d4','e3']:['d3','e3']).map(sq),enemyCore=(role==='advanced'?['d5','e6']:role==='base'?['d5','e4']:['e5']).map(sq),id=role==='scheveningen'?'scheveningen-structure':'french-pawn-chain';
   const shape=b=>{if(!ownCore.every(s=>isPawn(b,s,color))||!enemyCore.every(s=>isPawn(b,s,enemy)))return false;if(role==='scheveningen')for(let rank=1;rank<=8;rank++)if(isPawn(b,'c'+rank,color)||isPawn(b,'d'+rank,enemy))return false;return true;};
   if(!ownCore.includes(played.to)||!shape(c)||shape(before)||roles.some(r=>r.id===id))continue;
   const targets=role==='scheveningen'?[...'cdef'].map(file=>sq(file+'4')):[];if(role==='scheveningen'&&(!exchange||targets.some(s=>c.get(s))))continue;
   const specs=role==='advanced'?[[ownCore[1],[ownCore[0]],color],[enemyCore[0],[enemyCore[1]],enemy]]:role==='base'?[[ownCore[0],[ownCore[1]],color],[enemyCore[1],[enemyCore[0]],enemy]]:targets.map(target=>[target,ownCore.filter(source=>Math.abs(source.charCodeAt(0)-target.charCodeAt(0))===1&&Number(target[1])-Number(source[1])===(color==='w'?1:-1)),color]);
   const supports=[];for(const [target,sources,side]of specs){tick();const frame=new Chess(c.fen());frame.remove(target);frame.put({type:'n',color:side==='w'?'b':'w'},target);const fields=frame.fen().split(' ');fields[1]=side;fields[3]='-';let test;try{test=legalPosition(fields.join(' '));if(test.isGameOver())test=null;}catch{test=null;}if(!test){supports.push(false);continue;}const captures=test.moves({verbose:true}).filter(m=>m.piece==='p'&&m.to===target&&m.captured==='n');for(const m of captures)tick();supports.push(sources.every(s=>captures.some(m=>m.from===s)));}
   if(supports.some(x=>!x)){status='no-legal-support-control';continue;}
   const rams=[];if(role!=='scheveningen')for(const [side,core]of [[color,ownCore],[enemy,enemyCore]]){tick();const fields=c.fen().split(' ');fields[1]=side;fields[3]='-';let frame;try{frame=legalPosition(fields.join(' '));if(frame.isGameOver())frame=null;}catch{frame=null;}if(!frame){rams.push(false);continue;}const moves=frame.moves({verbose:true}).filter(m=>m.piece==='p'&&core.includes(m.from));for(const m of moves)tick();rams.push(moves.every(m=>m.from[0]!==m.to[0]));}
   if(rams.some(x=>!x)){status='no-legal-ram-frame';continue;}
   for(const reply of c.moves({verbose:true}))tick();roles.push({id,role});status='proven';
  }
 }catch(error){if(error!==stop)throw error;roles=[];status='exhausted';}
 return{status,nodes,roles};
}
export async function openE074Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.centerTags??false,limit=input.maxCenterNodes??50000;if(typeof enabled!=='boolean')throw Error('centerTags must be boolean');if(!Number.isInteger(limit)||limit<0||limit>50000)throw Error('maxCenterNodes must be an integer from 0 to 50000');const base=parent(input);assert(!base.events.some(e=>centerIds.includes(e.id)));
 if(!enabled){assert.deepEqual(actual,base);return{state:'disabled',certificates:0,parentEvaluations:1,oracleEvaluations:0,ownProofReplays:0,exactResult:true,parentSemanticReplayRequired:true};}
 const expected=derive(input,limit),own=actual.events.filter(e=>centerIds.includes(e.id));assert.deepEqual(actual.centerAnalysis,{limit,nodes:expected.nodes,status:expected.status});assert.deepEqual(own.map(e=>({id:e.id,role:e.evidence.role})),expected.roles);
 for(const event of own){assert.deepEqual(Object.keys(event).sort(),['id','qualityClaim','text','evidence'].sort());assert.deepEqual(Object.keys(event.evidence).sort(),['role','history','played','ownCore','enemyCore','targets','rams','pawnTurns','counterframes','exchange','beforeInventory','inventory','replies'].sort());replayEvent(input,event);}
 const events=[...base.events,...own],priority=e=>e.id==='french-pawn-chain'?101.012:e.id==='scheveningen-structure'?101.013:inheritedPriority(e),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;assert.deepEqual(actual,{...base,schema:'coach-concepts-v55',events,comment,centerAnalysis:{limit,nodes:expected.nodes,status:expected.status}});assert(!comment||comment.split(/\s+/).length<=24);
 return{state:expected.status,certificates:own.length,parentEvaluations:1,oracleEvaluations:1,ownProofReplays:own.length,exactResult:true,parentSemanticReplayRequired:true};
}};}
