import assert from 'node:assert/strict';
import {legalPosition,uci} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {readAdmission} from './admission.mjs';
const fields=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const categories={'-2':'loss','-1':'blessed-loss','0':'draw','1':'cursed-win','2':'win'};
function menu(input,view,player){
 const h=validateHistory(input),c=legalPosition(h?.start||input.fen);for(const m of h?.moves||[])c.move(m);
 assert.equal(c.fen(),input.fen);assert.equal(view.fen,input.fen);assert.equal(view.actor,c.turn());assert.equal(view.status,'observed');assert.equal(view.root.fen,input.fen);
 const legal=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));assert.deepEqual(view.rows.map(r=>r.move),legal.map(uci));
 const actions=view.rows.map(r=>{c.move(r.move);assert.equal(c.fen(),r.fen);c.undo();assert.ok(Number.isSafeInteger(r.wdl)&&r.wdl>=-2&&r.wdl<=2);const actorWdl=r.wdl===0?0:-r.wdl;assert.equal(r.rootActorWdl,actorWdl);const playerWdl=player===c.turn()?actorWdl:actorWdl===0?0:-actorWdl;return{move:r.move,fen:r.fen,actorWdl,actorCategory:categories[actorWdl],playerWdl,playerCategory:categories[playerWdl]};});
 assert.equal(view.probes,1+actions.length);const preserving=actions.filter(a=>a.actorWdl===0).map(a=>a.move),maximum=Math.max(...actions.map(a=>a.actorWdl));
 return{actor:c.turn(),fen:input.fen,rootWdl:view.root.wdl,records:view.probes,actions,preserving,maximum};
}
export function inspectEndgameEquality(input,options={},token){
 plain([input,options]);if(!fields(input,['fen','history','move'])||typeof input.fen!=='string'||typeof input.move!=='string'||!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input.move)||!fields(options,['enabled','player','maxRecords'])||options.enabled!==undefined&&typeof options.enabled!=='boolean'||options.player!==undefined&&!['w','b'].includes(options.player))throw Error('Invalid endgame equality interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid actual history');
 const limit=options.maxRecords===undefined?256:options.maxRecords;if(!Number.isSafeInteger(limit)||limit<0||limit>256||options.enabled&&options.player===undefined)throw Error('Invalid equality controls');
 const base={schema:'E220-source-qualified-equality',claims:['C0571','C0580','C0968'],available:false,status:'disabled',player:options.player??null,limit,requiredRecords:0,usedRecords:0,qualityClaim:false,witness:null};if(!options.enabled)return base;
 const h=validateHistory(input);if(!h)return{...base,status:'history-prerequisite'};const c=legalPosition(h.start);for(const m of h.moves)c.move(m);
 if(c.isGameOver()||c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...base,status:'live-no-rights-ep-prerequisite'};
 const actual=c.moves({verbose:true}).find(m=>uci(m)===input.move);if(!actual)throw Error('Illegal nominated actual move');if(token===undefined)return{...base,status:'source-prerequisite'};
 const a=readAdmission(token);assert.deepEqual(a.input,input,'Source input/history/move differs');const required=a.root.view.probes+(a.next?.view.probes||0),ledger={requiredRecords:required};if(required>limit)return{...base,...ledger,status:'budget-unavailable'};
 const root=menu(a.root.input,a.root.view,options.player);if(root.rootWdl!==0)return{...base,...ledger,status:'nonzero-outcome',usedRecords:required};
 if(!a.next)return{...base,...ledger,status:'paired-observation-prerequisite',usedRecords:required};
 assert.ok(!actual.captured&&!actual.promotion&&!/[+#]/.test(actual.san),'Pair requires genuine quiet continuation');c.move(input.move);assert.equal(c.isGameOver(),false);assert.equal(a.next.input.fen,c.fen());assert.deepEqual(a.next.input.history,{fen:h.start,moves:[...h.moves,input.move]});
 const next=menu(a.next.input,a.next.view,options.player);if(next.rootWdl!==0||root.maximum!==0||next.maximum!==0||!root.preserving.length||!next.preserving.length||!root.preserving.includes(input.move))return{...base,...ledger,status:'equality-consistency-prerequisite',usedRecords:required};
 assert.equal(root.actions.find(r=>r.move===input.move).fen,next.fen);assert.notEqual(root.actor,next.actor);
 return{...base,...ledger,available:true,status:'source-observed-equality',usedRecords:required,witness:{before:input.fen,actualMove:input.move,after:next.fen,root,next,sources:[a.root.source,a.next.source],model:'WDL50 zero-counter observations; actual FEN/history counters retained; no arbitrary-clock/repetition/DTZ adjudication',interpretation:'theoretical outcome equality with draw-preserving actions for both actual actors, not equal practical chances or opening equalization'}};
}
