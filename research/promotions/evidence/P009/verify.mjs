import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {Engine} from '../../../../engine/uci.js';
import {openTraffic} from '../../../../research/experiments/E278-coherent-brilliant-validation/code/traffic.mjs';
import {Producer} from '../../../../research/experiments/E279-coherent-multipv-emission/code/producer.mjs';
import {runRow} from '../../../../research/experiments/E278-coherent-brilliant-validation/code/matrix.mjs';
import {loadCases,hash} from '../../../../research/experiments/E276-reported-brilliant-cases/code/cases.mjs';
import {currentClassifier,replayLabel} from '../../../../research/experiments/E276-reported-brilliant-cases/code/classifier.mjs';
import {app,loadGame} from '../../../../tests/helpers/app.mjs';
import {Chess} from '../../../../lib/chess.js';
const out='scratch/improvement-review/',traffic=await openTraffic(),access=await loadCases();
await fs.mkdir(out,{recursive:true});
const calibration=JSON.parse(await fs.readFile('data/calibration.json'));
const prefix='research/experiments/E278-coherent-brilliant-validation/evidence/';
const manifest=JSON.parse(await fs.readFile(prefix+'manifest.json'));
const bytes=await fs.readFile(prefix+'results.json.gz');assert.equal(hash(bytes),manifest.artifacts['results.json.gz'].sha256);
const archived=JSON.parse(gunzipSync(bytes));
class Stub {commands=[];postMessage(c){this.commands.push(c);}terminate(){}line(data){this.onmessage({data});}}
const clean=root=>({...root,lines:root.lines.map(({sourceIndex,...line})=>line)});
const previous=globalThis.Worker,now=Date.now;let clock=1000,snapshots=0;
globalThis.Worker=Stub;Date.now=()=>clock;
try {for(const stream of traffic.streams){
  const after=new Engine(),seen=[],expected=[],producer=new Producer(stream);
  try {
    after.worker.line('uciok');after.worker.line('readyok');
    const a=after.analyse(stream.query.fen,16,stream.query.multipv,null,s=>seen.push(s));await Promise.resolve();
    for(const [i,line] of stream.raw.entries()) {clock+=121;after.worker.line(line);const frame=producer.observe(line,i);if(frame)expected.push(clean(frame.root));}
    assert.deepEqual(await a,archived.natural.nativeFinals.find(x=>x.streamId===stream.id).root,'completed result '+stream.id);
    assert.deepEqual(after.worker.commands,['uci','isready',...(stream.query.multipv===1?[]:[`setoption name MultiPV value ${stream.query.multipv}`]),'ucinewgame',`position fen ${stream.query.fen}`,'go depth 16'],'commands '+stream.id);
    assert.deepEqual(seen,expected,'production progress versus frozen producer '+stream.id);snapshots+=seen.length;
  } finally {after.terminate();}
}} finally {Date.now=now;globalThis.Worker=previous;}
let matrixRows=0;
for(const row of archived.rows){
  const current=runRow({id:row.id,expectation:row.expectation},row.color,row.build,row.path,'B',calibration);
  assert.equal(current.category,row.arms.C.category,'category '+JSON.stringify([row.id,row.color,row.build,row.path]));
  assert.equal(current.grade,row.arms.C.grade);assert.equal(current.numericSnapshot,row.arms.C.numericSnapshot);matrixRows++;
}
const report=JSON.parse(await fs.readFile('research/experiments/E276-reported-brilliant-cases/evidence/results.json'));
const {api}=await currentClassifier(),cases=[];
for(const c of access.input.cases)for(const engine of [18,19]){
  const row=report.rows.find(r=>r.case===c.id&&r.engine===engine&&r.budget.kind==='nodes'&&r.budget.value===2000000);
  const result=replayLabel(api,c,row.root,row.played,row.after,engine);assert.equal(result.category,c.id==='A'?'brilliant':'best');
  const board=new Chess(c.visiblePrior||c.before);if(c.visiblePrior)board.move({from:c.visiblePrecedingMove.slice(0,2),to:c.visiblePrecedingMove.slice(2,4)});board.move({from:c.uci.slice(0,2),to:c.uci.slice(2,4)});
  const cleanup=[],a=app({after:f=>cleanup.push(f)});
  try {
    a.context.__canonical=calibration;a.run('CALIB=__canonical');const S=loadGame(a,board.pgn()),i=S.total;S.settings.enginePath=engine===19?'sf19lite':'nnue';
    S.evals[i-1]=a.call('whiteRel',row.root.score,c.before);S.evals[i]=a.call('whiteRel',row.after.score,c.after);
    S.bests[i-1]={...row.root,playedScore:row.played.score};S.bests[i]=row.after;a.call('computeDerived');
    assert.equal(S.classif[i],result.category);cases.push({id:c.id,engine,category:result.category,pgn:board.pgn(),positions:S.positions,evals:S.evals,bests:S.bests,ply:i,fen:c.before});
  } finally {cleanup.forEach(f=>f());}
}
assert.equal(matrixRows,252);assert.equal(snapshots,924);
const summary={baseline:'62dd162c',trafficReceipt:traffic.receipt,streams:traffic.streams.length,completedResultsIdentical:traffic.streams.length,uciCommandSequencesIdentical:traffic.streams.length,progressSnapshotsMatchingFrozenProducer:snapshots,syntheticRowsMatchingFrozenCandidate:matrixRows,cases:cases.map(({id,engine,category})=>({id,engine,category})),timeScope:'Saved-stream clock advances121ms per message to inspect every eligible snapshot; not real timing.'};
await fs.writeFile(out+'brilliant-implementation-replay.json',JSON.stringify(summary,null,2)+'\n');
await fs.writeFile(out+'brilliant-browser-inputs.json',JSON.stringify(cases)+'\n');console.log(JSON.stringify(summary));
