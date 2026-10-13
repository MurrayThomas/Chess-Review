import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import {Chess} from '../../../../lib/chess.js';
import {calibratedReview, scoringEvidenceComplete} from '../../../../lib/calibrated-review.js';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const baselineSource=execFileSync('git',['show','b70ea93:lib/calibrated-review.js'],{encoding:'utf8',windowsHide:true});
const imports=baselineSource.replaceAll("'./chess.js'",JSON.stringify(pathToFileURL(path.resolve('lib/chess.js')).href))
  .replaceAll("'./public-scoring.js'",JSON.stringify(pathToFileURL(path.resolve('lib/public-scoring.js')).href));
const baseline=await import('data:text/javascript;base64,'+Buffer.from(imports).toString('base64'));
const calibration=JSON.parse(await readFile('data/calibration.json','utf8'));
// Independently authored sequence of legal moves; no real-game observations.
const moves='e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7 f1e1 b7b5 a4b3 d7d6 c2c3 e8g8 h2h3 c6b8 d2d4 b8d7 c3c4 c7c6 b1c3'.split(' ');
const chess=new Chess(),positions=[{fen:chess.fen()}];
for(const u of moves){const m=chess.move({from:u.slice(0,2),to:u.slice(2,4)});positions.push({...m,fen:chess.fen()});}
const examples=[];
for(const build of ['nnue','sf19lite']){
 const engine=build==='nnue'?'sf18':'sf19';
 const roots=moves.map(()=>({bestmove:'different',score:{cp:200},playedScore:{cp:-200},
  calibration:{version:calibration.version,build,nodes:build==='sf19lite'?20000:null,qualityVersion:build==='nnue'?calibration.quality.candidateVersion:null},
  ratingEvidence:{candidateVersion:calibration.movesOnly[engine].candidateVersion,best:{wdl:[400,400,200]},played:{wdl:[200,400,400]},bestmove:'different'}}));
 roots[0].playedScore={cp:-1500};
 const valid=baseline.calibratedReview(positions,roots,calibration,{},'moves').w;
 const current=calibratedReview(positions,roots,calibration,{},'moves').w;
 if(valid.accuracy!==current.accuracy||valid.rating!==current.rating)throw Error('Valid complete outputs changed');
 delete roots[0].playedScore;
 const omitted=baseline.calibratedReview(positions,roots,calibration,{},'moves').w;
 const guarded=calibratedReview(positions,roots,calibration,{},'moves').w;
 roots[0].playedScore={cp:-1500};roots[0].calibration.version='stale';
 const stale=baseline.calibratedReview(positions,roots,calibration,{},'moves').w;
 const rejected=calibratedReview(positions,roots,calibration,{},'moves').w;
 roots[0].calibration.version=calibration.version;roots[0].playedScore={mate:0};
 examples.push({build,completeAccuracy:valid.accuracy,oldAccuracyWithAdverseDecisionMissing:omitted.accuracy,newAccuracyWithAdverseDecisionMissing:guarded.accuracy,
  oldRatingWithStaleVersion:stale.rating,newRatingWithStaleVersion:rejected.rating,
  oldMalformedCacheAccepted:baseline.scoringEvidenceComplete(roots,moves.length,calibration),newMalformedCacheAccepted:scoringEvidenceComplete(roots,moves.length,calibration)});
}
const names=['lib/calibrated-review.js','lib/public-scoring.js','lib/chess.js','data/calibration.json','tests/scoring-integrity.test.mjs'];
const hashes=Object.fromEntries(await Promise.all(names.map(async name=>[name,createHash('sha256').update((await readFile(name,'utf8')).replaceAll('\r\n','\n')).digest('hex')])));
const evidence={date:'2026-10-13',baseline:'b70ea930ed234ae8e83de2008d79f4b67ca55cf4',node:process.version,scope:'Synthetic input-contract comparison; no human predictive claim',examples,hashMode:'UTF-8 with CRLF normalized to LF',hashes};
for (const example of examples) {
 assert.equal(example.newAccuracyWithAdverseDecisionMissing,null);
 assert.ok(example.oldAccuracyWithAdverseDecisionMissing>example.completeAccuracy);
 assert.equal(example.newRatingWithStaleVersion,null);
 assert.ok(Number.isFinite(example.oldRatingWithStaleVersion));
 assert.equal(example.oldMalformedCacheAccepted,true);
 assert.equal(example.newMalformedCacheAccepted,false);
}
if (process.argv.includes('--verify')) {
 const retained=JSON.parse(await readFile(new URL('./comparison.json',import.meta.url),'utf8'));
 assert.deepEqual(examples,retained.examples);
 assert.deepEqual(hashes,retained.hashes);
}
await mkdir('scratch',{recursive:true});
await writeFile('scratch/p008-comparison.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify(evidence,null,2));
