// Independent explanation reconstruction. No classifier or pilot imports.
import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {readAdmission} from './admission.mjs';
const uci=m=>m.from+m.to+(m.promotion||'');
const points={p:1,n:3,b:3,r:5,q:9,k:0};
function army(c,color){return c.board().flat().filter(p=>p?.color===color);}
function ledger(c,actor){let n=0;for(const row of c.board())for(const p of row)if(p)n+=(p.color===actor?1:-1)*points[p.type];return n;}
export function checkDefensiveExchange(input,token,result){
 const admitted=readAdmission(token);assert.deepEqual(admitted.input,input);const c=new Chess(input.history.fen);for(const m of input.history.moves){assert.equal(c.isGameOver(),false);c.move(m);}assert.equal(c.fen(),input.fen);
 const actor=c.turn(),enemy=actor==='w'?'b':'w',baseline=ledger(c,actor),bishop=army(c,actor).filter(p=>p.type==='b');assert.equal(bishop.length,1);const square=bishop[0].square;
 const offer=c.moves({verbose:true}).find(m=>uci(m)===input.move);assert.equal(offer.piece,'r');assert.equal(offer.captured,'b');c.move(input.move);
 const replies=c.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));assert.ok(replies.length);assert.equal(admitted.observations.length,2*replies.length);
 const branches=[],sources=[];let records=0;
 for(const reply of replies){
  assert.equal(reply.captured,'r');assert.equal(reply.to,offer.to);const d=new Chess(c.fen());d.move(uci(reply));assert.equal(d.isGameOver(),false);assert.equal(ledger(d,actor)-baseline,-2);
  assert.equal(army(d,actor).map(p=>p.type).sort().join(''),'bk');assert.equal(army(d,enemy).map(p=>p.type).sort().join(''),'kr');assert.equal(d.get(square).color,actor);assert.equal(d.get(square).type,'b');assert.equal(d.moves({verbose:true}).some(m=>m.captured==='r'),false);
  const acceptInput={fen:d.fen(),history:{fen:input.history.fen,moves:[...input.history.moves,input.move,uci(reply)]}},a=admitted.observations.filter(o=>JSON.stringify(o.input)===JSON.stringify(acceptInput));assert.equal(a.length,1);assert.equal(a[0].view.actor,actor);assert.equal(a[0].view.root.wdl,0);
  const q=d.move(input.quietMove);assert.equal(q.piece,'k');assert.equal(q.captured,undefined);assert.equal(d.isCheck(),false);assert.equal(d.isGameOver(),false);
  const quietInput={fen:d.fen(),history:{fen:input.history.fen,moves:[...acceptInput.history.moves,input.quietMove]}},b=admitted.observations.filter(o=>JSON.stringify(o.input)===JSON.stringify(quietInput));assert.equal(b.length,1);assert.equal(b[0].view.actor,enemy);assert.equal(b[0].view.root.wdl,0);
  const legal=d.moves({verbose:true}).sort((a,b)=>uci(a).localeCompare(uci(b)));assert.deepEqual(b[0].view.rows.map(r=>r.move),legal.map(uci));
  const defenses=[];for(const r of b[0].view.rows){const x=new Chess(d.fen());x.move(r.move);assert.equal(x.fen(),r.fen);assert.equal(x.get(square).type,'b');assert.equal(x.get(square).color,actor);assert.equal(army(x,enemy).filter(p=>p.type==='r').length,1);assert.equal(ledger(x,actor)-baseline,-2);assert.ok(r.wdl>=0);defenses.push({move:r.move,fen:r.fen,actorWdl:r.wdl});}
  branches.push({reply:uci(reply),acceptedFen:acceptInput.fen,acceptedActorWdl:0,quietMove:input.quietMove,quietFen:quietInput.fen,quietActorWdl:0,materialDelta:-2,bishop:square,defenses});sources.push(a[0].source,b[0].source);records+=a[0].view.probes+b[0].view.probes;
 }
 assert.deepEqual(result,{schema:'E217-defensive-exchange-resource',claims:['C0092','C0907'],available:true,status:'observed-defensive-exchange',actor,requiredRecords:records,usedRecords:records,branches,sources,outcomeScope:'WDL50 zero-counter observations at actual recorded FENs; no arbitrary-clock/repetition adjudication or initial-position quality claim',qualityClaim:false});return{passed:true,branches:branches.length,defenses:branches.reduce((n,b)=>n+b.defenses.length,0),records};
}
