import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {openResearchData,sha256} from '../../../data-policy.mjs';
const args=process.argv.slice(2);
if(args.length!==2||args[0]!=='--out')throw Error('Use --out research/runs/E271/unique-verification');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);
if(!out.startsWith(path.join(root,'research','runs','E271')+path.sep))throw Error('Output outside E271 runs');
const access=await openResearchData(['D001','D002'],{purpose:'reuse'});
const prefix='research/experiments/E271-opportunity-feasibility/evidence/';
const result=await access.readJson(prefix+'results.json'),run=await access.readJson(prefix+'run.json');
const dataset=(await access.readJson('research/datasets/D002-fresh-prefix/games.json.gz')).filter(g=>['train','validation'].includes(g.split));
const raw=await access.readJson('research/experiments/E008-human-quality-curves/evidence/sf19-observations.json.gz');
const normalizedSides=dataset.flatMap(g=>['w','b'].map(color=>({key:g.id+':'+color,decisions:g.decisionCounts[color]})));
assert.equal(normalizedSides.reduce((n,s)=>n+s.decisions,0),result.nonforcedDecisions);
assert.equal(normalizedSides.filter(s=>s.decisions>=10).length,result.eligibleSides);
const vectorCounts=new Map(normalizedSides.map(s=>[s.key,0]));
for(const p of raw.positions){const k=p.gameId+':'+p.color;assert.ok(vectorCounts.has(k));vectorCounts.set(k,vectorCounts.get(k)+1);}
assert.equal(Math.max(...vectorCounts.values()),result.availablePerSide.max);
assert.equal(Math.min(...vectorCounts.values()),result.availablePerSide.min);
assert.equal(dataset.filter(g=>['w','b'].every(c=>vectorCounts.get(g.id+':'+c)>=10)).length,result.gamesWithTenVectorsBothSides);
assert.equal(result.queries.fullUnique-result.queries.compatibleReusedUnique,result.queries.missingUnique);
const totalMs=raw.searches.reduce((n,q)=>n+q.elapsedMs,0),totalBytes=raw.searches.reduce((n,q)=>n+Buffer.byteLength(JSON.stringify(q)+'\n'),0);
assert.equal(totalMs/raw.searches.length,result.cost.cachedMeanMs);
assert.equal(totalBytes/raw.searches.length,result.cost.cachedMeanJsonBytes);
assert.equal(result.queries.missingUnique*(totalMs/raw.searches.length)/3600000,result.cost.missingSerialHoursMean);
assert.equal(result.queries.missingUnique*(totalBytes/raw.searches.length)/2**30,result.cost.missingUncompressedGiB);
for(const [f,h] of Object.entries(run.codeSha256))assert.equal(sha256(await readFile(path.join(root,f))),h);
for(const [f,h] of Object.entries(run.dataEligibility.inputHashes))assert.equal(access.receipt.inputHashes[f],h);
assert.deepEqual(access.receipt.sourceEvidence,run.dataEligibility.sourceEvidence);
const canonical=await readFile(path.join(root,prefix+'results.json'));
assert.equal(sha256(canonical),run.outputSha256);
const repeat=await readFile(path.join(root,'research/runs/E271/repeat-optimized/results.json'));
assert.deepEqual(canonical,repeat);
const receipt={schema:'E271-verification-v1',passed:true,date:'2026-10-15',
  sourceRevision:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim(),
  verifierSha256:sha256(await readFile(fileURLToPath(import.meta.url))),
  command:'node research/experiments/E271-opportunity-feasibility/code/verify.mjs '+args.join(' '),
  checks:{exactRepeatedResultBytes:true,originalCodeBytes:true,originalInputBytes:true,independentNormalizationSideCounts:true,
    independentlyCountedVectorSides:true,independentCostArithmetic:true,independentGraphTraversal:result.playerComponents.independentGraphCheck},
  outputSha256:sha256(canonical),dataEligibility:access.receipt,
  cleanCheckoutReplay:false,scientificConfirmation:false,modelFits:0,engineSearches:0};
await mkdir(out,{recursive:true});await writeFile(path.join(out,'verification.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:true,checks:receipt.checks,outputSha256:receipt.outputSha256}));
