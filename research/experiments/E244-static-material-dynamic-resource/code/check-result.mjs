import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {readFen} from '../../FRIEND-shared/lib.mjs';
import {readAdmission} from '../../E212-rook-side-defense/code/admission.mjs';
import {validate,empty} from './contract.mjs';
// No own runtime/feature/classifier or E210 replay imports.
const uc=m=>m.from+m.to+(m.promotion??''),cats=['loss','blessed-loss','draw','cursed-win','win'];
const independentSnapshots=new WeakMap();
function conclude(base,context,requiredRecords){
 const available=context.domain&&context.staticRetained&&context.rootWdl===0&&context.successfulStderrRetained&&context.resources.includes(context.actual)&&context.losingQuietAlternatives.length>0;
 return{...base,available,status:available?'source-observed-material-activity-contrast':'no-qualifying-contrast',requiredRecords,usedRecords:requiredRecords,context,witness:available?{kind:'static-nominal-material-versus-dynamic-drawing-resource',materialOwner:context.materialOwner,materialEdge:1,defender:context.actor,actualDrawingCheck:context.actual,losingSameRookQuietMoves:[...context.losingQuietAlternatives],staticLedgerIdenticalAcrossEveryLegalAction:true,model:'WDL50 zero-counter observations, not arbitrary-clock/repetition/DTZ adjudication',interpretation:'The extra pawn persists across every legal choice; this rook check draws while listed quiet rook actions lose. Checking alone and general static/dynamic advantage are not established.',bestMoveClaim:false,independentTableTruth:false}:null};
}
function ledger(fen){const us=Object.entries(readFen(fen).board).sort(([a],[b])=>a.localeCompare(b)).map(([square,p])=>({square,type:p.toLowerCase(),color:p===p.toUpperCase()?'w':'b',value:({p:1,n:3,b:3,r:5,q:9,k:0})[p.toLowerCase()]}));return{us,totals:{w:us.reduce((n,p)=>n+(p.color==='w'?p.value:0),0),b:us.reduce((n,p)=>n+(p.color==='b'?p.value:0),0)}};}
export function rebuild(input,options={},token){
 const o=validate(input,options),b=empty(o);if(!o.enabled)return b;if(!input.history)return{...b,status:'history-prerequisite'};
 const c=legalPosition(input.history.fen);for(const m of input.history.moves){assert(!c.isGameOver(),'History terminal');assert(c.moves({verbose:true}).map(uc).includes(m));c.move(m);}assert.equal(c.fen(),legalPosition(input.fen).fen());
 if(c.isGameOver()||+c.fen().split(' ')[4]>=100)return{...b,status:'live-root-prerequisite'};
 const legal=c.moves({verbose:true}).sort((a,b)=>uc(a).localeCompare(uc(b)));assert(legal.map(uc).includes(input.move),'Illegal nominated move');
 if(input.history.moves.length||input.history.fen!==c.fen()||+c.fen().split(' ')[4]!==0||c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...b,status:'zero-counter-empty-history-prerequisite'};
 if(token===undefined)return{...b,status:'source-prerequisite'};const a=readAdmission(token),v=a.view;assert.deepEqual(a.input,{fen:input.fen,history:input.history});assert.equal(v.status,'observed');assert.equal(v.fen,input.fen);assert.equal(v.actor,c.turn());assert.equal(v.root.fen,input.fen);assert.equal(v.probes,legal.length+1);assert.deepEqual(v.rows.map(r=>r.move),legal.map(uc));
 const requiredRecords=v.probes;if(requiredRecords>o.maxRecords)return{...b,status:'budget-unavailable',requiredRecords};
 if(independentSnapshots.has(token)){const context=structuredClone(independentSnapshots.get(token));context.actual=input.move;return conclude(b,context,requiredRecords);}
 const {us:army,totals:material}=ledger(input.fen),actor=c.turn(),opponent=actor==='w'?'b':'w',pawns=army.filter(p=>p.type==='p'),materialOwner=pawns[0]?.color??null,rook=army.find(p=>p.color===actor&&p.type==='r');
 const actions=legal.map((m,i)=>{const r=v.rows[i],d=new Chess(input.fen);d.move(uc(m));assert.equal(d.fen(),r.fen);assert(Number.isInteger(r.wdl)&&r.wdl>=-2&&r.wdl<=2);const actorWdl=r.wdl===0?0:-r.wdl;assert.equal(r.rootActorWdl,actorWdl);const next=readFen(d.fen()).board,t=ledger(d.fen()).totals;let identitiesRetained=!m.captured&&!m.promotion;for(const u of army){const square=u.square===m.from?m.to:u.square,letter=u.color==='w'?u.type.toUpperCase():u.type;if(next[square]!==letter)identitiesRetained=false;}
  return{move:uc(m),fen:d.fen(),piece:m.piece,from:m.from,to:m.to,captured:m.captured??null,promotion:m.promotion??null,checking:d.isCheck(),terminal:d.isCheckmate()?'mate':d.isStalemate()||d.isInsufficientMaterial()?'board-draw':null,legalResponses:d.moves({verbose:true}).map(uc).sort(),material:t,actorMaterialBalance:t[actor]-t[opponent],identitiesRetained,actorWdl,actorCategory:cats[actorWdl+2]};});
 assert.equal(Math.max(...actions.map(r=>r.actorWdl)),v.root.wdl);
 const domain=army.length===5&&army.filter(p=>p.type==='k').length===2&&army.filter(p=>p.type==='r').length===2&&pawns.length===1&&materialOwner===opponent&&material[opponent]-material[actor]===1,staticRetained=actions.length>0&&actions.every(r=>r.identitiesRetained&&r.material.w===material.w&&r.material.b===material.b),resources=[],losingQuietAlternatives=[];
 for(const r of actions){if(r.piece!=='r'||r.from!==rook?.square||r.captured||r.promotion||r.terminal||!r.legalResponses.length)continue;if(r.checking&&r.actorWdl===0)resources.push(r.move);if(!r.checking&&r.actorWdl===-2)losingQuietAlternatives.push(r.move);}
 const context={before:input.fen,actor,actual:input.move,army,material,materialOwner,actorMaterialBalance:material[actor]-material[opponent],domain,staticRetained,rootWdl:v.root.wdl,rootCategory:cats[v.root.wdl+2],actions,resources,losingQuietAlternatives,source:a.source,outcomeScope:v.outcomeScope,successfulStderrRetained:v.successfulStderrRetained??false,priorHistoryComplete:input.history.fen===new Chess().fen(),actualGameAdjudicationClaim:false};
 independentSnapshots.set(token,structuredClone({...context,actual:null}));return conclude(b,context,requiredRecords);
}
export function checkMaterialActivity(input,options,token,result){assert.deepEqual(result,rebuild(input,options,token));return true;}
