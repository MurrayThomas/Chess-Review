import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE068Pilot} from './e068-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE068Pilot(admission);const [{explainMove},{fixtures,reflect},{openE068Replay,swingIds},{Chess},{priority:parentPriority,explainMove:parent}]=await Promise.all([import('../../E068-rook-swings/code/swing.mjs'),import('../../E068-rook-swings/code/fixtures.mjs'),import('./e068-whole-result.mjs'),import('../../../../lib/chess.js'),import('../../E067-waiting-tempi/code/tempi.mjs')]);const {check}=await openE068Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>swingIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence,reply=r=>frame(r).replies[0];const outputs=new Map(),states=new Set();let errors=0,proofs=0;
for(const f of all)test('original '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f);check(f,r);outputs.set(f.id,r);states.add(r.rookSwingAnalysis?.status||'disabled');proofs+=own(r).length;for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const positive=get('kingside'),negative=get('different-latest-own-move'),terminal=get('clock-terminal-replies');const mutations=[
 [positive,'history missing',r=>frame(r).history.pop()],
 [positive,'history order',r=>frame(r).history.reverse()],
 [positive,'lift index',r=>frame(r).liftIndex++],
 [positive,'lift origin',r=>frame(r).history[0].from='f2'],
 [positive,'lift unit',r=>frame(r).history[0].piece='q'],
 [positive,'actual origin',r=>frame(r).played.from='b3'],
 [positive,'actual destination',r=>frame(r).played.to='g3'],
 [positive,'actual capture',r=>frame(r).played.captured='q'],
 [positive,'ray rook',r=>frame(r).checkRay.rook='g3'],
 [positive,'ray king',r=>frame(r).checkRay.king='g8'],
 [positive,'ray omitted',r=>frame(r).checkRay.empty.pop()],
 [positive,'ray order',r=>frame(r).checkRay.empty.reverse()],
 [positive,'reply omitted',r=>frame(r).replies.pop()],
 [positive,'reply order',r=>frame(r).replies.reverse()],
 [positive,'reply SAN',r=>reply(r).san='Winning'],
 [positive,'reply after',r=>reply(r).after=frame(r).played.after],
 [positive,'rook presence',r=>reply(r).rookPresent=!reply(r).rookPresent],
 [positive,'reply check',r=>reply(r).check=!reply(r).check],
 [positive,'reply mate',r=>reply(r).checkmate=!reply(r).checkmate],
 [positive,'reply stalemate',r=>reply(r).stalemate=!reply(r).stalemate],
 [terminal,'reply draw and terminal',r=>{const x=frame(r).replies.find(x=>x.gameOver);x.draw=false;x.gameOver=false;}],
 [positive,'proof text',r=>event(r).text='Winning rook attack.'],
 [positive,'quality claim',r=>event(r).qualityClaim=true],
 [positive,'schema',r=>r.schema='coach-concepts-v999'],
 [positive,'ledger',r=>r.rookSwingAnalysis.nodes++],
 [positive,'limit',r=>r.rookSwingAnalysis.limit--],
 [positive,'mandatory certificate',r=>r.events=r.events.filter(e=>!swingIds.includes(e.id))],
 [negative,'negative laundered',r=>r.rookSwingAnalysis.status='proven']
];assert.equal(all.length,108);assert.equal(mutations.length,28);for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const f of [positive,get('rook-capturable'),terminal,get('missing-history')])test('every integer budget '+f.id,()=>{const full=outputs.get(f.id),needed=full.rookSwingAnalysis.nodes;for(let limit=0;limit<=needed+1;limit++){const input={...f,maxRookSwingNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.rookSwingAnalysis.status,limit<needed?'exhausted':full.rookSwingAnalysis.status);assert.equal(r.rookSwingAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed)assert.equal(own(r).length,0);}});
test('strict null disabled options',()=>{for(const rookSwingTags of [false,undefined,null]){const f={...positive,rookSwingTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,maxRookSwingNodes:null},r=explainMove(f);assert.equal(r.rookSwingAnalysis.limit,50000);check(f,r);for(const rookSwingTags of [1,'true',{},[]]){const f={...positive,rookSwingTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const maxRookSwingNodes of [-1,50001,0.5,NaN,Infinity,'10'])for(const rookSwingTags of [true,false]){const f={...positive,maxRookSwingNodes,rookSwingTags};assert.throws(()=>explainMove(f),/maxRookSwingNodes/);assert.throws(()=>check(f,{}),/maxRookSwingNodes/);}});
test('history freshness and absent versus empty ledger',()=>{const missing=get('missing-history'),a=explainMove(missing),empty={...missing,history:{fen:missing.fen,moves:[]}},b=explainMove(empty);check(missing,a);check(empty,b);assert.equal(a.rookSwingAnalysis.nodes,1);assert.equal(b.rookSwingAnalysis.nodes,2);assert.equal(own(a).length,0);assert.equal(own(b).length,0);assert.equal(own(outputs.get(negative.id)).length,0);for(const history of [{fen:positive.history.fen,moves:[]},{fen:positive.history.fen,moves:['f1h8']}]){const f={...positive,history};assert.throws(()=>explainMove(f));assert.throws(()=>check(f,{}));}});
test('check evasion capture interposition and terminal records',()=>{const evasion=get('swing-blocks-check');assert(new Chess(evasion.fen).isCheck());assert(event(outputs.get(evasion.id)));assert(frame(outputs.get('swing-capture')).played.captured);assert(frame(outputs.get('rook-capturable')).replies.some(r=>r.captured&&!r.rookPresent));assert(frame(outputs.get('enemy-interpose')).replies.some(r=>r.rookPresent&&r.to[0]==='h'));assert(frame(outputs.get(terminal.id)).replies.some(r=>r.draw&&r.gameOver));assert.equal(own(outputs.get('clock-terminal-actual')).length,0);assert(new Chess(outputs.get('clock-terminal-actual').after).isGameOver());});
test('all original states and rook label coverage',()=>{assert.equal(errors,4);assert(proofs>0);assert.deepEqual([...states].sort(),['disabled','exhausted','ineligible','proven']);assert.equal(event(outputs.get(positive.id)).id,'rook-swing');});
test('returned proof mutation leaves subsequent calls unchanged',()=>{const before=explainMove(positive),bad=structuredClone(before);frame(bad).history=[];frame(bad).replies=[];bad.events=[];assert.deepEqual(explainMove(positive),before);check(positive,before);});
test('parent priority inherited comment and extra fields',()=>{for(const f of [positive,negative,get('newly-hanging-rook')]){const r=outputs.get(f.id),base=parent(f);assert.deepEqual(r.events.filter(e=>!swingIds.includes(e.id)),base.events);const priority=e=>e.id==='rook-swing'?101.003:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);for(const mutate of [r=>r.san='Wrong',r=>r.comment='Best move.',r=>r.unsupported=true]){const bad=structuredClone(r);mutate(bad);assert.throws(()=>check(f,bad));}}assert(!outputs.get('newly-hanging-rook').comment.startsWith('Rook swing:'));});
