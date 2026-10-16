import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import vm from 'node:vm';
import {Chess} from '../../../../lib/chess.js';
import {expectedPoints,SF19_OUTCOME} from '../../../../lib/public-scoring.js';
import {prefix,hash,loadCases} from './cases.mjs';
import {replayLabel} from './classifier.mjs';
const out=process.argv[2];assert.ok(out?.startsWith('research/runs/E276/'));await mkdir(out,{recursive:true});
const access=await loadCases(),freeze=JSON.parse(await readFile(prefix+'evidence/freeze.json'));
for(const p of ['lib/chess.js','lib/public-scoring.js','data/calibration.json',prefix+'code/classifier.mjs'])assert.equal(hash(await readFile(p)),freeze.sources[p]);
const bytes=await readFile(prefix+'evidence/results.json'),run=JSON.parse(await readFile(prefix+'evidence/report-run.json'));assert.equal(hash(bytes),run.outputHash);assert.deepEqual(access.receipt,run.caseEligibility);
const report=JSON.parse(bytes),metadata=JSON.parse(await readFile(prefix+'evidence/classifier-snapshot.json')),compressed=await readFile(prefix+'evidence/classifier-declarations.js.gz');
assert.equal(metadata.parentAnalysisSha256,freeze.sources['analysis.js']);assert.equal(hash(compressed),metadata.snapshotSha256);
const source=gunzipSync(compressed).toString(),api=vm.runInNewContext(source+'\n;({'+report.extractedNames.join(',')+'})',{
  Chess,expectedPoints,SF19_OUTCOME,CALIB:JSON.parse(await readFile('data/calibration.json')),S:null});
let rows=0;for(const row of report.rows){const c=access.input.cases.find(c=>c.id===row.case);for(const history of [true,false]){const actual=replayLabel(api,c,row.root,row.played,row.after,row.engine,{history});assert.deepEqual(actual,history?row.current:row.withoutHistory);rows++;}}
await writeFile(out+'/verification.json',JSON.stringify({schema:'E276-saved-declaration-replay-v1',passed:true,rows,caseEligibility:access.receipt,inputSha256:hash(bytes),snapshotSha256:hash(compressed),codeSha256:hash(await readFile(prefix+'code/replay-saved.mjs')),completedUtc:new Date().toISOString(),
  liveAnalysisFileRead:false,claim:'Exact archived scientific declaration replay; full app and clean-checkout reproduction remain separate.'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,rows,liveAnalysisFileRead:false}));
