import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE070Pilot} from './e070-pilot-admission.mjs';
const admission=await admitTerminalRegression();await admitE070Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE070Replay,outpostIds},{Chess}]=await Promise.all([import('../../E070-knight-outposts/code/outpost.mjs'),import('../../E070-knight-outposts/code/fixtures.mjs'),import('./e070-whole-result.mjs'),import('../../../../lib/chess.js')]);
const {check}=await openE070Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),get=id=>{const f=fixtures.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>outpostIds.includes(e.id)),event=r=>own(r)[0],frame=r=>event(r).evidence,graph=r=>frame(r).graphs[0],reply=r=>frame(r).replies[0];
for(const f of all)test('original '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);return;}const r=explainMove(f);check(f,r);for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const positive=get('supported-fifth'),advanced=get('advanced-sixth'),history=get('history-repetition-reply'),refuted=get('legal-capture-file-chain');
const mutations=[
 [history,'history omitted',r=>frame(r).history.pop()],
 [positive,'played move forged',r=>frame(r).played.move='a1a8'],
 [positive,'relative rank forged',r=>frame(r).relativeRank=4],
 [positive,'counterframe forged',r=>frame(r).legalSupport.counterFen=frame(r).played.after],
 [positive,'legal supporter omitted',r=>frame(r).legalSupport.captures.pop()],
 [positive,'legal supporter invented',r=>frame(r).legalSupport.captures.push({...frame(r).legalSupport.captures[0],move:'a2f5'})],
 [positive,'pawn graph omitted',r=>frame(r).graphs.pop()],
 [positive,'pawn node omitted',r=>graph(r).nodes.pop()],
 [positive,'pawn edge omitted',r=>graph(r).edges.pop()],
 [positive,'pawn attacks forged',r=>graph(r).nodes[0].attacks=[]],
 [positive,'reply omitted',r=>frame(r).replies.pop()],
 [positive,'reply order forged',r=>frame(r).replies.reverse()],
 [positive,'knight presence forged',r=>reply(r).knightPresent=!reply(r).knightPresent],
 [positive,'geometric support forged',r=>reply(r).geometricSupport=[]],
 [positive,'attacking pawn invented',r=>reply(r).attackingPawns=['e6']],
 [history,'reply terminal forged',r=>frame(r).replies.find(x=>x.gameOver).gameOver=false],
 [positive,'reply promotion forged',r=>reply(r).promotion='q'],
 [positive,'reply SAN forged',r=>reply(r).san='Winning'],
 [positive,'proof text forged',r=>event(r).text='Permanent outpost.'],
 [positive,'quality claim forged',r=>event(r).qualityClaim=true],
 [positive,'schema forged',r=>r.schema='coach-concepts-v999'],
 [positive,'node ledger forged',r=>r.outpostAnalysis.nodes++],
 [positive,'limit forged',r=>r.outpostAnalysis.limit--],
 [positive,'selected comment forged',r=>r.comment='Best move.'],
 [positive,'inherited SAN forged',r=>r.san='Wrong'],
 [positive,'mandatory positive omitted',r=>r.events=r.events.filter(e=>!outpostIds.includes(e.id))],
 [advanced,'mandatory advanced omitted',r=>r.events=r.events.filter(e=>e.id!=='advanced-knight-outpost')],
 [positive,'extra top-level field',r=>r.unproved=true],
 [refuted,'refutation graph omitted',r=>r.outpostAnalysis.refutation.graphs.pop()],
 [refuted,'challenge witness omitted',r=>r.outpostAnalysis.refutation.witnesses.pop()],
 [refuted,'refutation laundered',r=>{r.outpostAnalysis.status='ineligible';r.outpostAnalysis.refutation=null;}],
 [positive,'advanced label at rank five',r=>r.events.push({...event(r),id:'advanced-knight-outpost'})]
];
assert.equal(all.length,148);assert.equal(mutations.length,32);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=explainMove(f);check(f,r);const changed=structuredClone(r);mutate(changed);assert.notDeepEqual(changed,r);assert.throws(()=>check(f,changed));});
for(const f of [advanced,refuted,get('absolute-pawn-pin'),history])test('every integer budget '+f.id,()=>{const full=explainMove(f),needed=full.outpostAnalysis.nodes;for(let limit=0;limit<=needed+1;limit++){const input={...f,maxOutpostNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.outpostAnalysis.status,limit<needed?'exhausted':full.outpostAnalysis.status);assert.equal(r.outpostAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed){assert.equal(own(r).length,0);assert.equal(r.outpostAnalysis.refutation,null);}}});
test('strict options null defaults and disabled identity',()=>{for(const value of ['yes',1,[],{}]){const f={...positive,outpostTags:value};assert.throws(()=>explainMove(f),/outpostTags/);assert.throws(()=>check(f,{}),/outpostTags/);}for(const value of [-1,50001,0.5,NaN,Infinity,'10'])for(const enabled of [true,false]){const f={...positive,outpostTags:enabled,maxOutpostNodes:value};assert.throws(()=>explainMove(f),/maxOutpostNodes/);assert.throws(()=>check(f,{}),/maxOutpostNodes/);}for(const input of [{...positive,outpostTags:null},{...positive,maxOutpostNodes:null},{...positive,outpostTags:false,maxOutpostNodes:0}])check(input,explainMove(input));});
test('original complete status and plain advanced certificate coverage',()=>{const states=new Set(),ids=new Set();let invalid=0;for(const f of all){if(f.invalid){invalid++;continue;}const r=explainMove(f);states.add(r.outpostAnalysis?.status||'disabled');for(const e of own(r))ids.add(e.id);}assert.deepEqual([...states].sort(),['disabled','exhausted','ineligible','no-legal-support','pawn-challenge-refuted','proven']);assert.deepEqual([...ids].sort(),[...outpostIds].sort());assert.equal(invalid,4);});
test('real legal capture chain attacks the fixed knight square',()=>{const r=explainMove(refuted),c=new Chess(r.after);c.move('a7b6');c.move('a1b1');c.move('b6c5');assert(c.attackers('d4','b').includes('c5'));assert.equal(c.get('d4').type,'n');check(refuted,r);});
test('full history repetition differs from fresh FEN',()=>{const r=explainMove(history);check(history,r);const terminal=frame(r).replies.find(x=>x.move==='g8h8');assert(terminal.draw&&terminal.gameOver);const fresh=new Chess(r.after);fresh.move('g8h8');assert.equal(fresh.isGameOver(),false);const short={...history,maxOutpostNodes:0};check(short,explainMove(short));const forged=structuredClone(r);frame(forged).history=[];assert.throws(()=>check(history,forged));});
test('complete domains include vacuity double steps supporters promotions and support loss',()=>{const vacuous=explainMove(get('no-enemy-pawns'));assert.equal(frame(vacuous).graphs.length,0);assert.equal(frame(explainMove(get('two-supporters'))).legalSupport.captures.length,2);const r=explainMove(get('enemy-pawn-can-advance'));assert(r.outpostAnalysis.refutation.graphs.some(g=>g.edges.some(e=>e.kind==='double')));const promotion=frame(explainMove(get('fourth-with-promotion-replies')));assert.deepEqual(promotion.replies.filter(r=>r.promotion).map(r=>r.promotion).sort(),['b','n','q','r']);assert(promotion.graphs.every(g=>g.nodes.every(n=>n.square[1]!=='1')));assert(frame(explainMove(get('support-can-be-captured'))).replies.some(r=>r.knightPresent&&r.geometricSupport.length===0));assert(frame(explainMove(get('enemy-knight-capture'))).replies.some(r=>!r.knightPresent));});
test('returned proof mutation cannot corrupt future derivation',()=>{const before=explainMove(advanced),changed=structuredClone(before);frame(changed).graphs=[];frame(changed).legalSupport.captures=[];changed.events=[];check(advanced,before);assert.deepEqual(explainMove(advanced),before);});
