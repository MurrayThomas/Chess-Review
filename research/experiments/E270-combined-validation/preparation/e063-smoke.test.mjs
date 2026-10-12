import test from 'node:test';import assert from 'node:assert/strict';import {admitTerminalRegression} from './semantic-gate.mjs';import {admitE063Pilot} from './e063-pilot-admission.mjs';const admission=await admitTerminalRegression();await admitE063Pilot(admission);
const [{explainMove},{fixtures,reflect},{openE063Replay,stormIds},{explainMove:parent,priority:parentPriority},{Chess}]=await Promise.all([import('../../E063-pawn-storm/code/storm.mjs'),import('../../E063-pawn-storm/code/fixtures.mjs'),import('./e063-whole-result.mjs'),import('../../E062-pawn-space/code/space.mjs'),import('../../../../lib/chess.js')]);
const {check}=await openE063Replay(),all=fixtures.flatMap(f=>[f,reflect(f)]),outputs=new Map(),audits=new Map(),get=id=>{const f=all.find(f=>f.id===id);assert(f,id);return f;},own=r=>r.events.filter(e=>stormIds.includes(e.id)),positive=get('connected-advances'),negative=get('wrong-flank'),exhausted=get('zero-budget'),frame=r=>own(r)[0].evidence,full=f=>{const c=new Chess(f.history?.fen||f.fen);for(const m of f.history?.moves||[])c.move(m);c.move(f.move);return c;};
for(const f of all)test('original whole '+f.id,()=>{if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);return;}const r=explainMove(f),p=check(f,r);outputs.set(f.id,r);audits.set(f.id,p);for(const id of f.expected)assert(r.events.some(e=>e.id===id));for(const id of f.absent)assert(!r.events.some(e=>e.id===id));});
const mutations=[
[positive,'before',r=>frame(r).beforeFen=frame(r).afterFen],
[positive,'after',r=>frame(r).afterFen=frame(r).beforeFen],
[positive,'history domain',r=>frame(r).history.pop()],
[positive,'history order',r=>frame(r).history.reverse()],
[positive,'history record',r=>frame(r).history[0].san='wrong'],
[positive,'castle index',r=>frame(r).castleIndex++],
[positive,'prior index',r=>frame(r).priorIndex--],
[positive,'castle origin',r=>frame(r).castle.from='d8'],
[positive,'castle destination',r=>frame(r).castle.to='h8'],
[positive,'castle SAN',r=>frame(r).castle.san='Kg8'],
[positive,'prior advance',r=>frame(r).priorAdvance.san='wrong'],
[positive,'actual record',r=>frame(r).played.san='wrong'],
[positive,'king square',r=>frame(r).king.square='h8'],
[positive,'king color',r=>frame(r).king.color='w'],
[positive,'side',r=>frame(r).side='q'],
[positive,'pawn domain',r=>frame(r).pawns.pop()],
[positive,'pawn order',r=>frame(r).pawns.reverse()],
[positive,'pawn identity',r=>frame(r).pawns[0].type='n'],
[positive,'file connection',r=>frame(r).connection.fileGap=2],
[positive,'rank connection',r=>frame(r).connection.rankGap=2],
[positive,'distance domain',r=>frame(r).distances.pop()],
[positive,'distance value',r=>frame(r).distances[0].to++],
[positive,'reply domain',r=>frame(r).responses.pop()],
[positive,'reply order',r=>frame(r).responses.reverse()],
[positive,'reply record',r=>frame(r).responses[0].reply.san='wrong'],
[positive,'reply terminal',r=>frame(r).responses[0].terminal=!frame(r).responses[0].terminal],
[positive,'reply pawn presence',r=>frame(r).responses[0].pawnPresent[0]=!frame(r).responses[0].pawnPresent[0]],
[positive,'reply frame',r=>frame(r).responses[0].reply.after=frame(r).beforeFen],
[positive,'text',r=>own(r)[0].text='Winning attack.'],
[positive,'quality',r=>own(r)[0].qualityClaim=true],
[positive,'mandatory tag',r=>r.events=r.events.filter(e=>!stormIds.includes(e.id))],
[positive,'ledger',r=>r.pawnStormAnalysis.nodes++],
[positive,'status',r=>r.pawnStormAnalysis.status='exhausted'],
[positive,'limit',r=>r.pawnStormAnalysis.limit--],
[positive,'schema',r=>r.schema='v999'],
[positive,'comment',r=>r.comment='Safe attack.'],
[positive,'inherited SAN',r=>r.san='wrong'],
[positive,'extra field',r=>r.unsupported=true],
[negative,'unsolicited negative tag',r=>r.events.push(structuredClone(own(outputs.get(positive.id))[0]))],
[exhausted,'incomplete exhausted tag',r=>r.events.push(structuredClone(own(outputs.get(positive.id))[0]))]
];assert.equal(all.length,100);assert.equal(mutations.length,40);
for(const [f,name,mutate]of mutations)test('forgery '+name,()=>{const r=outputs.get(f.id);assert(r);const bad=structuredClone(r);mutate(bad);assert.notDeepEqual(bad,r);assert.throws(()=>check(f,bad));});
for(const name of ['connected-advances','double-advances','capture-advances','actual-ep-capture','terminal-reply','missing-history','wrong-flank'])test('exhaustive domain budget '+name,()=>{const f=get(name),original=outputs.get(f.id),needed=original.pawnStormAnalysis.nodes;for(let limit=0;limit<=needed+1;limit++){const input={...f,maxPawnStormNodes:limit},r=explainMove(input);check(input,r);assert.equal(r.pawnStormAnalysis.status,limit<needed?'exhausted':'complete');assert.equal(r.pawnStormAnalysis.nodes,limit<needed?limit+1:needed);if(limit<needed){assert.equal(own(r).length,0);assert.deepEqual(r.events,parent(input).events);assert.equal(r.comment,parent(input).comment);}}});
test('strict null default disabled options',()=>{for(const pawnStormTags of [false,undefined,null]){const f={...positive,pawnStormTags},r=explainMove(f);assert.deepEqual(r,parent(f));check(f,r);}const f={...positive,maxPawnStormNodes:null},r=explainMove(f);assert.equal(r.pawnStormAnalysis.limit,50000);check(f,r);for(const pawnStormTags of [1,'true',{},[]]){const f={...positive,pawnStormTags};assert.throws(()=>explainMove(f),/boolean/);assert.throws(()=>check(f,{}),/boolean/);}for(const maxPawnStormNodes of [-1,50001,0.5,NaN,Infinity,'10'])for(const pawnStormTags of [true,false]){const f={...positive,maxPawnStormNodes,pawnStormTags};assert.throws(()=>explainMove(f),/maxPawnStormNodes/);assert.throws(()=>check(f,{}),/maxPawnStormNodes/);}});
test('original counts and positive replay metadata',()=>{assert.equal(outputs.size,96);let certificates=0;const states={},metrics={replies:0,leaves:0,historyPlies:0};for(const p of audits.values()){states[p.state]=(states[p.state]||0)+1;certificates+=p.certificates;for(const m of p.replayMetadata)for(const key of Object.keys(metrics))metrics[key]+=m[key];}assert.deepEqual(states,{complete:88,disabled:4,exhausted:4});assert.equal(certificates,32);assert.equal(metrics.replies,668);assert.equal(metrics.historyPlies,100);console.log('# E063-smoke-summary '+JSON.stringify({originalRows:100,errors:4,certificates,states,metrics}));});
test('standard castle both flanks colors chronological connected double staggered capture advances',()=>{for(const root of ['connected-advances','double-advances','staggered-connection','capture-advances'])for(const side of ['','-queenside'])for(const f of [get(root+side),reflect(get(root+side))]){const r=explainMove(f);check(f,r);const e=frame(r),home=e.king.color==='b'?'8':'1';assert.equal(e.castle.from,'e'+home);assert.equal(e.king.square,(side?'c':'g')+home);assert(e.castleIndex<e.priorIndex);assert.equal(e.priorIndex,e.history.length-2);assert.notEqual(e.priorAdvance.to,e.played.from);assert.equal(e.connection.fileGap,1);assert(e.connection.rankGap<=1);assert(e.distances.every(d=>d.from>d.to&&d.to>0));assert.equal(e.connection.rankGap,root==='staggered-connection'?1:0);if(root==='double-advances')for(const m of [e.priorAdvance,e.played])assert.equal(Math.abs(+m.to[1]-+m.from[1]),2);if(root==='capture-advances')for(const m of [e.priorAdvance,e.played])assert(m.captured);}});
test('physical full-history ALL positive reply terminal pawn loss and EP flags',()=>{const counts={replies:0,pawnLoss:0,terminal:0,ep:0};for(const f of all){const r=outputs.get(f.id);if(!r||!own(r).length)continue;const e=frame(r),c=full(f);assert.equal(c.fen().split(' ')[4],'0');assert.equal(c.moves().length,e.responses.length);for(const x of e.responses){assert.equal(c.fen(),x.reply.before);const m=c.move(x.reply.move);assert.equal(c.fen(),x.reply.after);assert.equal(c.isGameOver(),x.terminal);assert.deepEqual(e.pawns.map(p=>c.get(p.square)?.type==='p'&&c.get(p.square).color===p.color),x.pawnPresent);counts.replies++;counts.pawnLoss+=+x.pawnPresent.some(p=>!p);counts.terminal+=+x.terminal;if(m.flags.includes('e')){counts.ep++;assert.equal(c.get(e.played.to),undefined);assert.deepEqual(x.pawnPresent,[true,false]);}c.undo();}}assert.deepEqual(counts,{replies:668,pawnLoss:16,terminal:14,ep:4});});
test('earlier history EP expires through castle and actual irreversible advance',()=>{for(const side of ['','-queenside'])for(const f of [get('ep-right-history'+side),reflect(get('ep-right-history'+side))]){const r=explainMove(f);check(f,r);const e=frame(r),c=new Chess(f.history.fen);c.move(f.history.moves[0]);assert(c.moves({verbose:true}).some(m=>m.flags.includes('e')));c.move(f.history.moves[1]);assert.equal(c.fen().split(' ')[3],'-');assert.equal(e.history.length,4);assert.equal(e.castleIndex,1);assert.equal(e.priorIndex,2);assert.equal(e.played.after.split(' ')[4],'0');const bad=structuredClone(r),fields=frame(bad).afterFen.split(' ');fields[4]='99';frame(bad).afterFen=fields.join(' ');assert.throws(()=>check(f,bad));}});
test('all negative identity rank flank chronology history and king exclusions',()=>{for(const name of ['same-pawn-repeated','too-early','wrong-flank','separated-files','separated-ranks','missing-history','history-without-castle','advance-before-castle','king-moved','prior-pawn-captured','prior-move-not-pawn','actual-not-pawn'])for(const side of ['','-queenside'])for(const f of [get(name+side),reflect(get(name+side))]){const r=explainMove(f);check(f,r);assert.equal(r.pawnStormAnalysis.status,'complete');assert.equal(own(r).length,0);}});
test('actual promotion mate illegal exclusions both flanks colors',()=>{for(const side of ['','-queenside'])for(const root of ['actual-promotion','actual-mate','illegal-actual'])for(const f of [get(root+side),reflect(get(root+side))]){if(f.invalid){assert.throws(()=>explainMove(f),/^Error: Illegal move/);continue;}const r=explainMove(f),c=full(f);check(f,r);assert.equal(own(r).length,0);if(root==='actual-mate')assert(c.isCheckmate());else assert.equal(c.history({verbose:true}).at(-1).promotion,'q');}});
test('immutability inherited priority storm and urgent pawn-loss mate selection',()=>{const input=structuredClone(positive),snapshot=structuredClone(input),r=explainMove(input),bad=structuredClone(r);frame(bad).responses=[];bad.events=[];assert.deepEqual(input,snapshot);assert.deepEqual(explainMove(input),r);check(input,r);for(const name of ['connected-advances','actual-pawn-can-be-taken','terminal-reply','wrong-flank','disabled'])for(const side of ['','-queenside']){const f=get(name+side),r=outputs.get(f.id),base=parent(f);assert.deepEqual(r.events.filter(e=>!stormIds.includes(e.id)),base.events);const priority=e=>e.id==='pawn-storm'?101.05:parentPriority(e);assert.equal(r.comment,[...r.events].sort((a,b)=>priority(b)-priority(a))[0]?.text||null);if(['actual-pawn-can-be-taken','terminal-reply'].includes(name))assert.match(r.comment,/^Watch out:/);}});
