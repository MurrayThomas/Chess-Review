import assert from 'node:assert/strict';
import {openResearchData} from '../../../data-policy.mjs';
import {Chess} from '../../../../lib/chess.js';
import {explainMove as parent,priority as inheritedPriority} from '../../E074-french-scheveningen/code/centers.mjs';
import {replayResult as replayOwn} from '../../E075-board-material/code/replay.mjs';
export const foundationIds=Object.freeze(['piece-movement','board-coordinates','legal-input','illegal-input','material-inventory','nominal-balance','material-imbalance']);
const key=m=>m.from+m.to+(m.promotion||'');
function position(fen){
 const c=new Chess(fen),fields=fen.split(/\s+/),rights=fields[2],ep=fields[3];
 assert.match(rights,/^(?:K?Q?k?q?|-)$/);assert.match(fields[4],/^(0|[1-9]\d*)$/);assert.match(fields[5],/^[1-9]\d*$/);assert(Number.isSafeInteger(+fields[4])&&Number.isSafeInteger(+fields[5]));
 for(const [right,color,rank,file]of [['K','w',1,'h'],['Q','w',1,'a'],['k','b',8,'h'],['q','b',8,'a']])if(rights.includes(right)){assert.deepEqual(c.get('e'+rank),{type:'k',color});assert.deepEqual(c.get(file+rank),{type:'r',color});}
 if(ep!=='-'){assert.equal(c.get(ep),undefined);assert.equal(c.get(ep[0]+(c.turn()==='w'?7:2)),undefined);assert.deepEqual(c.get(ep[0]+(c.turn()==='w'?5:4)),{type:'p',color:c.turn()==='w'?'b':'w'});assert.equal(+fields[4],0);}
 const enemy=c.turn()==='w'?'b':'w',king=c.board().flat().find(p=>p?.type==='k'&&p.color===enemy);assert(king);assert(!c.isAttacked(king.square,c.turn()));return c;
}
export async function openE075Replay(){const {receipt}=await openResearchData(['D001'],{purpose:'test'});return{receipt,check(input,actual){
 const enabled=input.foundationTags??false;if(typeof enabled!=='boolean')throw Error('foundationTags must be boolean');
 if(!enabled){const base=parent(input);assert.deepEqual(actual,base);return{state:'disabled',certificates:0,legacyReportedCertificates:null,parentEvaluations:1,exactResult:true,parentSemanticReplayRequired:true};}
 const limit=input.maxFoundationNodes??50000;assert(Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);assert.equal(typeof input.move,'string');assert.match(input.move,/^[a-h][1-8][a-h][1-8][qrbn]?$/);
 if(input.history)assert(Array.isArray(input.history.moves)&&input.history.moves.length<=1000);
 const root=position(input.history?.fen||input.fen);for(const value of input.history?.moves||[]){assert(!root.isGameOver());assert.equal(typeof value,'string');assert.match(value,/^[a-h][1-8][a-h][1-8][qrbn]?$/);assert(root.moves({verbose:true}).some(m=>key(m)===value));root.move(value);}assert.equal(root.fen(),position(input.fen).fen());
 const legacy=replayOwn(input,actual),own=actual.events.filter(e=>foundationIds.includes(e.id));assert.equal(legacy.certificates,own.length);
 if(root.isGameOver()){assert.deepEqual(actual,{schema:'coach-concepts-v56',events:[],comment:null,foundationAnalysis:{status:'unavailable',limit,nodes:0,reason:'terminal-root'}});return{state:legacy.state,certificates:0,legacyReportedCertificates:0,parentEvaluations:0,exactResult:true,parentSemanticReplayRequired:true};}
 const accepted=root.moves({verbose:true}).some(m=>key(m)===input.move),base=accepted?parent(input):{events:[],comment:null};assert(!base.events.some(e=>foundationIds.includes(e.id)));
 const events=[...base.events,...own],priority=e=>({'nominal-balance':4.8,'material-imbalance':4.7,'piece-movement':4.6,'material-inventory':4.5,'legal-input':4.4,'board-coordinates':4.3,'illegal-input':1000}[e.id]??inheritedPriority(e)),comment=[...events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null;
 assert.deepEqual(actual,{...base,schema:'coach-concepts-v56',events,comment,foundationAnalysis:actual.foundationAnalysis});assert(!comment||comment.split(/\s+/).length<=24);if(legacy.state==='exhausted')assert.equal(own.length,0);
 return{state:legacy.state,certificates:own.length,legacyReportedCertificates:legacy.certificates,parentEvaluations:accepted?1:0,exactResult:true,parentSemanticReplayRequired:true};
}};}
