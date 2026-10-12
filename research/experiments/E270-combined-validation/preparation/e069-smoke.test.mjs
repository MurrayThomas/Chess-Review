import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE069Pilot} from './e069-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE069Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE069Replay,invasionIds},{Chess},{priority:parentPriority,explainMove:parent}]=await Promise.all([import('../../E069-checking-invasions/code/invasion.mjs'),import('../../E069-checking-invasions/code/fixtures.mjs'),import('./e069-whole-result.mjs'),import('../../../../lib/chess.js'),import('../../E068-rook-swings/code/swing.mjs')]);const {check}=await openE069Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>invasionIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence,reply=r=>frame(r).replies[0];
const outputs=new Map(),states=new Set(),kinds=new Set();let errors=0;
for(const f of all)test('original '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);errors++;return;}const r=explainMove(f);check(f,r);outputs.set(f.id,r);states.add(r.invasionAnalysis?.status||'disabled');for(const e of own(r))kinds.add(e.id);for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const positive=get('rook-seventh'),queen=get('queen-eighth'),history=get('rook-repetition-reply'),negative=get('rook-blocked-ray');
const mutations=[
 [positive,'actual identity',r=>frame(r).played.move='a2a8'],
 [history,'history missing',r=>frame(r).history.pop()],
 [positive,'entry origin rank',r=>frame(r).ranks.before=5],
 [positive,'entry final rank',r=>frame(r).ranks.after=6],
 [positive,'invader square',r=>frame(r).checkRay.invader='a8'],
 [positive,'king square',r=>frame(r).checkRay.king='h8'],
 [positive,'ray incomplete',r=>frame(r).checkRay.empty.pop()],
 [positive,'ray order',r=>frame(r).checkRay.empty.reverse()],
 [positive,'reply missing',r=>frame(r).replies.pop()],
 [positive,'reply order',r=>frame(r).replies.reverse()],
 [positive,'reply actual',r=>reply(r).move='h7h1'],
 [positive,'reply SAN',r=>reply(r).san='Winning'],
 [positive,'reply invader',r=>reply(r).invaderPresent=!reply(r).invaderPresent],
 [positive,'reply check',r=>reply(r).check=!reply(r).check],
 [positive,'reply checkmate',r=>reply(r).checkmate=!reply(r).checkmate],
 [positive,'reply stalemate',r=>reply(r).stalemate=!reply(r).stalemate],
 [history,'reply draw',r=>frame(r).replies.find(x=>x.draw).draw=false],
 [history,'reply terminal',r=>frame(r).replies.find(x=>x.gameOver).gameOver=false],
 [positive,'text',r=>event(r).text='Winning invasion.'],
 [positive,'quality claim',r=>event(r).qualityClaim=true],
 [positive,'piece label',r=>event(r).id='queen-invasion'],
 [positive,'schema',r=>r.schema='coach-concepts-v999'],
 [positive,'node ledger',r=>r.invasionAnalysis.nodes++],
 [positive,'limit',r=>r.invasionAnalysis.limit--],
 [positive,'mandatory event omitted',r=>r.events=r.events.filter(e=>!invasionIds.includes(e.id))],
 [negative,'negative laundered',r=>r.invasionAnalysis.status='proven'],
 [positive,'inherited field and selected comment',r=>{r.san='Wrong';r.comment='Best move.';}],
 [positive,'extra result field',r=>r.unsupported=true]
];assert.equal(all.length,192);assert.equal(mutations.length,28);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const f of [positive,queen,history,negative])test('every integer budget '+f.id,()=>{const full=outputs.get(f.id),needed=full.invasionAnalysis.nodes;for(let limit=0;limit<=needed+1;limit++){const input={...f,maxInvasionNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.invasionAnalysis.status,limit<needed?'exhausted':full.invasionAnalysis.status);assert.equal(r.invasionAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed)assert.equal(own(r).length,0);}});
test('strict null and disabled compatibility',()=>{for(const invasionTags of [false,undefined,null]){const f={...positive,invasionTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,maxInvasionNodes:null},r=explainMove(f);assert.equal(r.invasionAnalysis.limit,50000);check(f,r);for(const invasionTags of ['true',1,{},[]]){const f={...positive,invasionTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const maxInvasionNodes of [-1,50001,0.5,NaN,Infinity,'10'])for(const invasionTags of [true,false]){const f={...positive,maxInvasionNodes,invasionTags};assert.throws(()=>explainMove(f),/maxInvasionNodes/);assert.throws(()=>check(f,{}),/maxInvasionNodes/);}});
test('all original statuses and both piece labels',()=>{assert.equal(errors,8);assert.deepEqual([...states].sort(),['disabled','exhausted','ineligible','proven']);assert.deepEqual([...kinds].sort(),[...invasionIds].sort());});
test('full history repetition differs from fresh FEN for each unit and color',()=>{for(const piece of ['rook','queen'])for(const flip of [f=>f,reflect]){const f=flip(get(piece+'-repetition-reply')),r=explainMove(f);check(f,r);const terminal=frame(r).replies.find(x=>x.draw&&x.gameOver);assert(terminal);const fresh=new Chess(r.after);fresh.move(terminal.move);assert.equal(fresh.isGameOver(),false);const short={...f,maxInvasionNodes:0};check(short,explainMove(short));}});
test('complete captures interpositions check evasions and terminals retained',()=>{for(const piece of ['rook','queen']){for(const suffix of ['bishop-captures-invader','king-captures-invader'])assert(frame(outputs.get(piece+'-'+suffix)).replies.some(r=>r.captured&&!r.invaderPresent));assert(frame(outputs.get(piece+'-enemy-interposes')).replies.some(r=>r.invaderPresent&&r.to[1]==='7'));const evasion=get(piece+'-check-evasion');assert(new Chess(evasion.fen).isCheck());assert(event(outputs.get(evasion.id)));assert(frame(outputs.get(piece+'-terminal-replies')).replies.some(r=>r.draw&&r.gameOver));assert.equal(own(outputs.get(piece+'-actual-checkmate')).length,0);assert(new Chess(outputs.get(piece+'-actual-checkmate').after).isCheckmate());}});
test('returned proof mutation leaves next calls unchanged',()=>{const before=explainMove(positive),bad=structuredClone(before);frame(bad).checkRay.empty=[];frame(bad).replies=[];bad.events=[];assert.deepEqual(explainMove(positive),before);check(positive,before);});
test('parent priorities and inherited event order preserved',()=>{for(const f of [positive,queen,history,negative]){const r=outputs.get(f.id),base=parent(f);assert.deepEqual(r.events.filter(e=>!invasionIds.includes(e.id)),base.events);const priority=e=>e.id==='rook-invasion'?101.004:e.id==='queen-invasion'?101.005:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);}});
