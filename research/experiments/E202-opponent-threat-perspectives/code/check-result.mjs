import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {checkResult as checkSource} from '../../E201-check-capture-threat-question/code/check-result.mjs';
const code=m=>m.from+m.to+(m.promotion||'');
export function checkResult(input,options,panel,result){
  plain([input,options,panel,result]);assert.ok(input&&typeof input==='object'&&!Array.isArray(input)&&options&&typeof options==='object'&&!Array.isArray(options));assert.ok(Object.keys(options).every(k=>['enabled','perspective','plies','maxNodes'].includes(k)));
  const enabled=options.enabled===undefined?false:options.enabled,player=options.perspective,H=options.plies===undefined?1:options.plies,limit=options.maxNodes===undefined?50000:options.maxNodes;
  assert.ok(typeof enabled==='boolean'&&(player===undefined||['w','b'].includes(player))&&(!enabled||player!==undefined)&&Number.isSafeInteger(H)&&H>=0&&H<=2&&Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);
  const expected={schema:'E202-opponent-resource-perspectives',status:'disabled',limit,plies:H,perspective:player??null,nodes:0,answer:null,source:null},done=()=>{assert.deepEqual(result,expected);return true;},exhaust=()=>{expected.status='exhausted';expected.nodes=limit+1;return done();};
  if(!enabled)return done();if(!limit)return exhaust();
  const L=input.history?.moves.length||0;if(L+2>limit)return exhaust();
  const c=new Chess(input.history?.fen||input.fen);if(input.history!==undefined){assert.ok(input.history&&Array.isArray(input.history.moves)&&L<=1000);for(const m of input.history.moves){assert.equal(c.isGameOver(),false);c.move(m);}assert.equal(c.fen(),new Chess(input.fen).fen());}
  const legal=c.isGameOver()?[]:c.moves({verbose:true}).sort((a,b)=>code(a).localeCompare(code(b)));
  const sourceCost=c.isGameOver()?L+1:2+L+legal.length+(input.history!==undefined&&panel!==undefined?2+L+panel.nodes+panel.rows.length:0),total=1+sourceCost+legal.length;
  if(total>limit)return exhaust();
  assert.ok(result.source);checkSource(input,{enabled:true,plies:H,maxNodes:limit-1},panel,result.source);
  expected.source=structuredClone(result.source);expected.nodes=1+result.source.nodes+legal.length;
  if(!result.source.answer){expected.status=result.source.status;return done();}
  const source=result.source.answer,opponent=player==='w'?'b':'w',mode=c.turn()===player?'after-each-own-candidate':'opponent-to-act-now';
  const a={id:'C1059',player,opponent,frame:{fen:c.fen(),actor:c.turn(),mode},evidenceStatus:source.threats.status,intent:'unavailable; resources do not establish what a player privately wants',resources:[],candidateReplies:[],uncertifiedCandidates:legal.map(code),generalThreatCompleteness:false};
  expected.answer=a;expected.status=source.threats.status==='bounded-domain-answered'?'answered':'unavailable';if(expected.status==='unavailable')return done();
  if(mode==='opponent-to-act-now'){
    for(const [i,row]of panel.rows.entries())if(row.actor.tree.win){a.resources.push({enemyMove:row.move,san:row.san,fromFen:c.fen(),afterEnemyMove:row.after,winner:opponent,kind:row.mate?'immediate-mate':row.check?'checking-mating-continuation':row.capture?'capture-mating-threat':'quiet-mating-threat',totalPlies:H+1,proofRow:i,querySide:'actor'});}
    a.uncertifiedCandidates=legal.filter(m=>!a.resources.some(q=>q.enemyMove===code(m))).map(code);
  }else{
    for(const [i,row]of panel.rows.entries()){
      c.move(row.move);assert.equal(c.turn(),opponent);let resource=null;
      if(row.opponent.tree.win){assert.equal(row.opponent.tree.kind,'choice');const reply=row.opponent.tree.move;assert.ok(c.moves({verbose:true}).some(m=>code(m)===reply));resource={enemyMove:reply,fromFen:c.fen(),winner:opponent,continuationPlies:H,proofRow:i,querySide:'opponent'};}
      a.candidateReplies.push({ownMove:row.move,afterOwnMove:c.fen(),enemyToMove:opponent,status:resource?'certified-enemy-mate':'not-certified-within-bound',resource});c.undo();
    }
    a.uncertifiedCandidates=a.candidateReplies.filter(q=>q.resource===null).map(q=>q.ownMove);
  }
  return done();
}
