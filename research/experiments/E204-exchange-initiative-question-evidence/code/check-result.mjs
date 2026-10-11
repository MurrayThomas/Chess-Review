import assert from 'node:assert/strict';
import {isDeepStrictEqual} from 'node:util';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {verifyPanel} from '../../E177-queen-exchange-ending/code/verify-panel.mjs';
import {checkResult as checkSource} from '../../E190-liquidation-commitment/code/check-result.mjs';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
const admitted=[],criteria={C1068:'finite-H2-rook-ending-conversion-versus-alternative',C1073:'live-checking-forced-mate-policy',C1078:'removal-of-profitable-immediate-capture-policy-before-certified-mate'},code=m=>m.from+m.to+(m.promotion||'');
export function checkResult(input,options,panel,result){
  plain([input,options,panel,result]);assert.ok(input&&typeof input==='object'&&!Array.isArray(input)&&options&&typeof options==='object'&&!Array.isArray(options));assert.ok(Object.keys(options).every(k=>['enabled','player','ids','maxNodes'].includes(k)));
  const enabled=options.enabled===undefined?false:options.enabled,player=options.player,ids=options.ids===undefined?Object.keys(criteria):options.ids,limit=options.maxNodes===undefined?50000:options.maxNodes;
  assert.ok(typeof enabled==='boolean'&&(player===undefined||['w','b'].includes(player))&&(!enabled||player!==undefined)&&Array.isArray(ids)&&ids.length&&new Set(ids).size===ids.length&&ids.every(id=>Object.hasOwn(criteria,id))&&Number.isSafeInteger(limit)&&limit>=0&&limit<=50000);
  const e={schema:'E204-exchange-question-evidence',status:'disabled',limit,nodes:0,player:player??null,ids:[...ids],answers:ids.map(id=>({id,available:false,side:null,relation:null,frame:null,criterion:criteria[id]})),source:null,witness:null},done=()=>{assert.deepEqual(result,e);return true;},exhaust=()=>{e.nodes=limit+1;e.source=null;e.witness=null;e.answers=ids.map(id=>({id,available:false,side:null,relation:null,frame:null,criterion:criteria[id]}));e.status='exhausted';return done();};
  if(!enabled)return done();if(!limit)return exhaust();e.nodes=1;
  assert.equal(typeof input.fen,'string');assert.match(input.move,/^[a-h][1-8][a-h][1-8][qrbn]?$/);if(input.alternative!==undefined)assert.match(input.alternative,/^[a-h][1-8][a-h][1-8][qrbn]?$/);
  const h=input.history,c=legalPosition(h?.fen||input.fen);if(h!==undefined){assert.ok(h&&Array.isArray(h.moves)&&h.moves.length<=1000);for(const m of h.moves){assert.equal(c.isGameOver(),false);c.move(m);}assert.equal(c.fen(),legalPosition(input.fen).fen());}
  let prerequisite=null;
  if(c.isGameOver())prerequisite='not-live';else{const legal=c.moves({verbose:true}),actual=legal.find(m=>code(m)===input.move),alt=legal.find(m=>code(m)===input.alternative);assert.ok(actual);if(input.alternative!==undefined)assert.ok(alt&&input.alternative!==input.move&&!alt.captured&&!alt.promotion);if(h===undefined)prerequisite='history-prerequisite';else if(!alt)prerequisite='alternative-prerequisite';else{const u=c.board().flat().filter(Boolean),actor=c.turn();if(u.length!==5||u.filter(p=>p.type==='q'&&p.color===actor).length!==1||u.filter(p=>p.type==='q'&&p.color!==actor).length!==1||u.filter(p=>p.type==='r'&&p.color===actor).length!==1)prerequisite='material-prerequisite';else assert.ok(actual.piece==='q'&&actual.captured==='q'&&!actual.promotion);}}
  const sourceOptions={enabled:true,plies:2,maxNodes:limit-1};
  if(prerequisite){assert.ok(result.source);checkSource(input,sourceOptions,panel,result.source);e.source=structuredClone(result.source);e.status=prerequisite;return done();}
  const setup=3+h.moves.length;if(1+setup>limit)return exhaust();if(panel===undefined){assert.ok(result.source);checkSource(input,sourceOptions,panel,result.source);e.source=structuredClone(result.source);e.nodes+=setup;e.status='panel-prerequisite';return done();}
  assert.ok(panel&&Number.isSafeInteger(panel.nodes)&&panel.nodes>=0);if(1+setup+panel.nodes>limit)return exhaust();
  const key=[input.fen,input.history,input.move,input.alternative,panel];let checked=admitted.find(a=>isDeepStrictEqual(a.key,key));if(!checked){const q=verifyPanel({fen:input.fen,history:h,move:input.move,endingAlternative:input.alternative},2,panel);checked={key:structuredClone(key),...q};admitted.push(checked);}
  const [a,b]=panel.variants,sourceWork=3+panel.root.units.length+b.state.units.length+a.replies.reduce((n,r)=>n+1+r.state.units.length,0),sourceCost=setup+checked.nodes+sourceWork;if(1+sourceCost>limit)return exhaust();e.nodes+=sourceCost;
  if(checked.claim){assert.ok(result.source);checkSource(input,sourceOptions,panel,result.source);e.source=structuredClone(result.source);e.status='claim-rule-prerequisite';return done();}
  const live=s=>Object.values(s.flags).every(v=>!v);let work=1,claim=false;const observe=s=>{claim||=(s.flags.fifty||s.flags.threefold)&&!s.flags.mate;};observe(panel.root);const summaries=[];
  for(const v of panel.variants){work++;observe(v.state);claim||=v.query.searchClaim;const captures=[];for(const r of v.replies){work++;observe(r.state);let minimumGain=panel.root.balance-r.state.balance,success=!!r.played.captured&&live(r.state)&&r.counters.length>0&&minimumGain>0;for(const reply of r.counters){work++;observe(reply.state);minimumGain=Math.min(minimumGain,panel.root.balance-reply.state.balance);if(!live(reply.state)||panel.root.balance-reply.state.balance<=0)success=false;}if(r.played.captured)captures.push({move:r.played.move,minimumGain,success});}summaries.push({move:v.played.move,mate:v.query.tree.win,captures});}
  e.nodes+=work;if(e.nodes>limit)return exhaust();
  const rook=panel.root.units.find(u=>u.type==='r'&&u.color===panel.actor),endings=a.replies.map(r=>r.played.piece==='k'&&r.played.captured==='q'&&r.played.victim===a.played.to&&live(r.state)&&r.state.units.length===3&&r.state.units.filter(u=>u.type==='k').length===2&&r.state.units.some(u=>u.square===rook.square&&u.type==='r'&&u.color===panel.actor)),ending=!claim&&live(a.state)&&a.replies.length>0&&endings.every(Boolean)&&summaries[0].mate&&!summaries[1].mate,prevented=ending&&!summaries[0].captures.some(q=>q.success)&&summaries[1].captures.some(q=>q.success);
  const derivation={experiment:'E177',before:panel.root.fen,after:a.state.fen,panel:structuredClone(panel),work,claim,summaries,endings,ending,prevented};
  c.move(input.move);const actor=panel.actor,steps=[],isLive=!c.isGameOver(),checkedKing=c.isCheck();
  function visit(t){e.nodes++;if(c.isCheckmate())return t.win===true&&t.kind==='mate'&&c.turn()!==actor;if(c.isDraw())return false;const attacker=c.turn()===actor;
    if(attacker&&t.kind!=='choice'||!attacker&&(!c.isCheck()||t.kind!=='all'||t.branches.length===0))return false;
    const branches=attacker?[{move:t.move,child:t.child}]:t.branches;
    for(const branch of branches){const fromFen=c.fen(),color=c.turn();e.nodes++;c.move(branch.move);const checkAfter=c.isCheck();steps.push({role:attacker?'actor':'defender',color,move:branch.move,fromFen,afterFen:c.fen(),checkAfter});let ok;try{ok=(!attacker||checkAfter)&&visit(branch.child);}finally{c.undo();}if(!ok)return false;}return true;
  }
  const checkingPolicy=isLive&&checkedKing&&a.query.tree.win?visit(a.query.tree):false;e.nodes++;if(e.nodes>limit)return exhaust();
  assert.ok(result.source);checkSource(input,sourceOptions,panel,result.source);e.source=structuredClone(result.source);
  const satisfied=e.source.claims.C0808&&ending,flags={C1068:satisfied,C1073:checkingPolicy,C1078:prevented};
  e.witness={actor,frame:a.state.fen,benefit:{criterion:criteria.C1068,continuationPlies:2,actualMate:a.query.tree.win,alternativeMate:b.query.tree.win,satisfied},initiative:{live:isLive,checked:checkedKing,checkingPolicy,steps},counterplay:{satisfied:prevented,actualProfitable:summaries[0].captures.filter(q=>q.success),alternativeProfitable:summaries[1].captures.filter(q=>q.success)},derivation};
  e.answers=ids.map(id=>({id,available:!!flags[id],side:flags[id]?actor:null,relation:flags[id]?(actor===player?'own':'opponent'):null,frame:a.state.fen,criterion:criteria[id]}));e.status=e.answers.some(q=>q.available)?'proven':'compared';return done();
}
