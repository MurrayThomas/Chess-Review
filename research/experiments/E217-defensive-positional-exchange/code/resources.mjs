import assert from 'node:assert/strict';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {validateHistory} from '../../E024-transitions/code/transitions.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {readAdmission} from './admission.mjs';
const fields=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>keys.includes(k));
const uci=m=>m.from+m.to+(m.promotion||'');
const values={p:1,n:3,b:3,r:5,q:9,k:0};
const units=(c,color)=>c.board().flat().filter(p=>p&&p.color===color);
const balance=(c,actor)=>c.board().flat().filter(Boolean).reduce((s,p)=>s+(p.color===actor?1:-1)*values[p.type],0);
export function inspectDefensiveExchange(input,options={},token){
 plain([input,options]);if(!fields(input,['fen','history','move','quietMove'])||typeof input.fen!=='string'||!['move','quietMove'].every(k=>typeof input[k]==='string'&&/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(input[k]))||!fields(options,['enabled','maxRecords'])||options.enabled!==undefined&&typeof options.enabled!=='boolean')throw Error('Invalid defensive exchange interface');
 if(input.history!==undefined&&(!fields(input.history,['fen','moves'])||Object.keys(input.history).length!==2||typeof input.history.fen!=='string'||!Array.isArray(input.history.moves)))throw Error('Invalid history');
 const max=options.maxRecords??256;if(!Number.isSafeInteger(max)||max<0||max>256)throw Error('maxRecords must be integer0..256');
 const base={schema:'E217-defensive-exchange-resource',claims:['C0092','C0907'],available:false,status:'disabled',actor:null,requiredRecords:0,usedRecords:0,branches:[],sources:[],outcomeScope:null,qualityClaim:false};
 if(!options.enabled)return base;
 const h=validateHistory(input),c=legalPosition(input.fen);if(!h)return{...base,status:'history-prerequisite'};
 if(c.isGameOver()||c.fen().split(' ')[2]!=='-'||c.fen().split(' ')[3]!=='-')return{...base,status:'live-frame-prerequisite'};
 const actor=c.turn(),enemy=actor==='w'?'b':'w',baseline=balance(c,actor),originalBishops=units(c,actor).filter(p=>p.type==='b');
 const move=c.moves({verbose:true}).find(m=>uci(m)===input.move);
 if(!move||move.piece!=='r'||move.captured!=='b'||originalBishops.length!==1)return{...base,status:'exchange-prerequisite'};
 c.move(input.move);const replies=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));
 if(!replies.length||replies.some(m=>m.to!==move.to||m.captured!=='r'))return{...base,status:'complete-acceptance-prerequisite'};
 for(const reply of replies){const d=legalPosition(c.fen());d.move(uci(reply));if(units(d,actor).map(p=>p.type).sort().join('')!=='bk'||units(d,enemy).map(p=>p.type).sort().join('')!=='kr'||balance(d,actor)-baseline!==-2||d.isGameOver()||d.moves({verbose:true}).some(m=>m.captured==='r'))return{...base,status:'nonmaterial-prerequisite'};}
 if(token===undefined)return{...base,status:'observation-prerequisite'};
 const admission=readAdmission(token);assert.deepEqual(admission.input,input,'Observation root/history/moves differ');
 const required=admission.observations.reduce((n,o)=>n+o.view.probes,0);if(required>max)return{...base,status:'budget-unavailable',requiredRecords:required};
 assert.equal(admission.observations.length,replies.length*2,'Missing/extra branch observations');
 const branches=[],sources=[];
 for(const reply of replies){
  const d=legalPosition(c.fen());d.move(uci(reply));
  const own=units(d,actor),opp=units(d,enemy),bishop=originalBishops[0].square;
  if(own.length!==2||opp.length!==2||!d.get(bishop)||own.map(p=>p.type).sort().join('')!=='bk'||opp.map(p=>p.type).sort().join('')!=='kr'||balance(d,actor)-baseline!==-2||d.isGameOver()||d.moves({verbose:true}).some(m=>m.captured==='r'))return{...base,status:'nonmaterial-prerequisite'};
  const accepts=admission.observations.filter(o=>o.input.history.moves.at(-1)===uci(reply)&&o.input.history.moves.length===h.moves.length+2);assert.equal(accepts.length,1);const accepted=accepts[0];assert.equal(accepted.input.fen,d.fen());assert.deepEqual(accepted.input.history,{fen:h.start,moves:[...h.moves,input.move,uci(reply)]});assert.equal(accepted.view.actor,actor);
  if(accepted.view.root.wdl!==0)return{...base,status:'draw-prerequisite'};
  const q=d.moves({verbose:true}).find(m=>uci(m)===input.quietMove);if(!q||q.piece!=='k'||q.captured)return{...base,status:'quiet-prerequisite'};d.move(input.quietMove);
  if(d.isCheck()||d.isGameOver())return{...base,status:'quiet-prerequisite'};
  const quiets=admission.observations.filter(o=>o.input.history.moves.at(-2)===uci(reply)&&o.input.history.moves.length===h.moves.length+3);assert.equal(quiets.length,1);const quiet=quiets[0];assert.equal(quiet.input.fen,d.fen());assert.deepEqual(quiet.input.history,{fen:h.start,moves:[...h.moves,input.move,uci(reply),input.quietMove]});assert.equal(quiet.view.actor,enemy);
  if(quiet.view.root.wdl!==0||quiet.view.rows.some(r=>{const x=legalPosition(r.fen);return x.get(bishop)?.type!=='b'||x.get(bishop)?.color!==actor||units(x,enemy).filter(p=>p.type==='r').length!==1||balance(x,actor)-baseline!==-2||r.wdl<0;}))return{...base,status:'quiet-outcome-prerequisite'};
  branches.push({reply:uci(reply),acceptedFen:accepted.input.fen,acceptedActorWdl:0,quietMove:input.quietMove,quietFen:quiet.input.fen,quietActorWdl:0,materialDelta:-2,bishop,defenses:quiet.view.rows.map(r=>({move:r.move,fen:r.fen,actorWdl:r.wdl}))});sources.push(accepted.source,quiet.source);
 }
 return{...base,available:true,status:'observed-defensive-exchange',actor,requiredRecords:required,usedRecords:required,branches,sources,outcomeScope:'WDL50 zero-counter observations at actual recorded FENs; no arbitrary-clock/repetition adjudication or initial-position quality claim'};
}
