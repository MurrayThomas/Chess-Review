import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {Chess} from '../../../../lib/chess.js';
import {verifyPanel} from '../../E143-forcing-tempo-initiative/code/check-witness.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const admissions=[],code=m=>m.from+m.to+(m.promotion||'');
export function checkResult(input,options,panel,result){
  plain([input,options,panel,result]);
  assert.ok(input&&typeof input==='object'&&!Array.isArray(input)&&options&&typeof options==='object'&&!Array.isArray(options));
  assert.ok(Object.keys(options).every(k=>['enabled','plies','maxNodes'].includes(k)));
  const enabled=options.enabled===undefined?false:options.enabled,H=options.plies===undefined?1:options.plies,limit=options.maxNodes===undefined?50000:options.maxNodes;
  assert.ok(typeof enabled==='boolean'&&Number.isSafeInteger(H)&&H>=0&&H<=2&&Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);
  const e={schema:'E201-check-capture-threat-question',status:'disabled',limit,plies:H,nodes:0,answer:null,panel:null},done=()=>{assert.deepEqual(result,e);return true;};
  if(!enabled)return done();
  const h=input.history,L=h?.moves.length||0,exhaust=()=>{e.status='exhausted';e.nodes=limit+1;e.answer=null;e.panel=null;return done();};
  if(L+1>limit)return exhaust();
  const c=new Chess(h?.fen||input.fen);
  if(h!==undefined){assert.ok(h&&typeof h.fen==='string'&&Array.isArray(h.moves)&&h.moves.length<=1000);for(const m of h.moves){assert.match(m,/^[a-h][1-8][a-h][1-8][qrbn]?$/);assert.equal(c.isGameOver(),false);c.move(m);}assert.equal(c.fen(),new Chess(input.fen).fen());}
  if(c.isGameOver()){e.status='not-live';e.nodes=L+1;return done();}
  const legal=c.moves({verbose:true}).sort((a,b)=>code(a).localeCompare(code(b))),setup=2+L+legal.length;if(setup>limit)return exhaust();
  const moves=legal.map(m=>({move:code(m),san:m.san,from:m.from,to:m.to,piece:m.piece,captured:m.captured||null,promotion:m.promotion||null,enPassant:m.flags.includes('e'),check:/[+#]/.test(m.san),mate:m.san.includes('#')}));
  const threats={status:h===undefined?'history-prerequisite':panel===undefined?'panel-prerequisite':'pending',continuationPlies:H,totalPliesIncludingCandidate:H+1,resources:[],candidateOutcomes:[],notCertifiedGeneralThreats:moves.map(m=>m.move),generalThreatCompleteness:false};
  e.nodes=setup;e.status='answered';e.answer={id:'C1061',fen:c.fen(),actor:c.turn(),historyKnown:h!==undefined,moves,checks:moves.filter(m=>m.check).map(m=>m.move),captures:moves.filter(m=>m.captured).map(m=>m.move),threats};
  if(h===undefined||panel===undefined)return done();
  assert.ok(panel&&Number.isSafeInteger(panel.nodes)&&panel.nodes>=0&&Array.isArray(panel.rows));
  const cost=setup+2+L+panel.nodes+panel.rows.length;if(cost>limit)return exhaust();
  const sourceInput={fen:input.fen,history:h,move:moves[0].move,forcingTempoPlies:H},key=[sourceInput,panel];
  let admitted=admissions.find(a=>isDeepStrictEqual(a.key,key));if(!admitted){const q=verifyPanel(sourceInput,panel);admitted={key:structuredClone(key),nodes:q.nodes,claim:q.claimContext};admissions.push(admitted);}
  e.nodes=setup+2+L+admitted.nodes+panel.rows.length;e.panel=structuredClone(panel);
  if(admitted.claim){threats.status='claim-rule-prerequisite';return done();}
  threats.status='bounded-domain-answered';
  for(const [index,row]of panel.rows.entries()){
    c.move(row.move);let role='unresolved-within-bound';
    if(row.actor.tree.win){role='actor-mate';const kind=row.mate?'immediate-mate':row.check?'checking-mating-continuation':row.capture?'capture-mating-threat':'quiet-mating-threat';threats.resources.push({move:row.move,san:row.san,after:c.fen(),kind,proofRow:index});}
    else if(row.opponent.tree.win)role='opponent-mate';else if(c.isStalemate()||c.isInsufficientMaterial())role='mechanical-draw';
    threats.candidateOutcomes.push({move:row.move,after:c.fen(),role,proofRow:index});c.undo();
  }
  const certified=new Set(threats.resources.map(r=>r.move));threats.notCertifiedGeneralThreats=legal.filter(m=>!certified.has(code(m))).map(code);return done();
}
