import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {readAdmission} from './admission.mjs';
const code=m=>m.from+m.to+(m.promotion||''),names=new Map([[-2,'loss'],[-1,'blessed-loss'],[0,'draw'],[1,'cursed-win'],[2,'win']]);
function reconstruct(record,player){
 const input=record.input,c=new Chess(input.history.fen);for(const m of input.history.moves){assert.equal(c.isGameOver(),false);c.move(m);}assert.equal(c.fen(),input.fen);const view=record.view;assert.equal(view.status,'observed');assert.equal(view.fen,c.fen());assert.equal(view.actor,c.turn());assert.equal(view.root.fen,c.fen());
 const legal=c.moves({verbose:true}).sort((a,b)=>code(a).localeCompare(code(b)));assert.deepEqual(view.rows.map(r=>r.move),legal.map(code));const actor=c.turn(),actions=[];
 for(const [i,m]of legal.entries()){const r=view.rows[i];c.move(code(m));assert.equal(c.fen(),r.fen);assert.ok(names.has(r.wdl));const actorWdl=r.wdl===0?0:-r.wdl;assert.equal(r.rootActorWdl,actorWdl);const playerWdl=player===actor?actorWdl:actorWdl===0?0:-actorWdl;actions.push({move:code(m),fen:c.fen(),actorWdl,actorCategory:names.get(actorWdl),playerWdl,playerCategory:names.get(playerWdl)});c.undo();}
 assert.equal(view.probes,actions.length+1);return{actor,fen:input.fen,rootWdl:view.root.wdl,records:view.probes,actions,preserving:actions.filter(r=>r.actorWdl===0).map(r=>r.move),maximum:Math.max(...actions.map(r=>r.actorWdl))};
}
export function checkEndgameEquality(input,options,token,result){
 plain([input,options,result]);assert.equal(options.enabled,true);assert.ok(['w','b'].includes(options.player));const limit=options.maxRecords===undefined?256:options.maxRecords;assert.ok(Number.isSafeInteger(limit)&&limit>=0&&limit<=256);
 const a=readAdmission(token);assert.deepEqual(a.input,input);const required=a.root.view.probes+(a.next?.view.probes||0),base={schema:'E220-source-qualified-equality',claims:['C0571','C0580','C0968'],available:false,status:'disabled',player:options.player,limit,requiredRecords:required,usedRecords:0,qualityClaim:false,witness:null};
 if(required>limit){assert.deepEqual(result,{...base,status:'budget-unavailable'});return true;}
 const root=reconstruct(a.root,options.player);if(root.rootWdl!==0){assert.deepEqual(result,{...base,status:'nonzero-outcome',usedRecords:required});return true;}assert.ok(a.next);
 const c=new Chess(input.history.fen);for(const m of input.history.moves)c.move(m);assert.equal(c.isGameOver(),false);const m=c.move(input.move);assert.ok(!m.captured&&!m.promotion&&!/[+#]/.test(m.san));assert.equal(c.isGameOver(),false);assert.equal(c.fen(),a.next.input.fen);assert.deepEqual(a.next.input.history,{fen:input.history.fen,moves:[...input.history.moves,input.move]});
 const next=reconstruct(a.next,options.player);assert.equal(root.rootWdl,0);assert.equal(next.rootWdl,0);assert.equal(root.maximum,0);assert.equal(next.maximum,0);assert.ok(root.preserving.includes(input.move)&&next.preserving.length);assert.notEqual(root.actor,next.actor);assert.equal(root.actions.find(r=>r.move===input.move).fen,next.fen);
 assert.deepEqual(result,{...base,available:true,status:'source-observed-equality',usedRecords:required,witness:{before:input.fen,actualMove:input.move,after:next.fen,root,next,sources:[a.root.source,a.next.source],model:'WDL50 zero-counter observations; actual FEN/history counters retained; no arbitrary-clock/repetition/DTZ adjudication',interpretation:'theoretical outcome equality with draw-preserving actions for both actual actors, not equal practical chances or opening equalization'}});return true;
}
