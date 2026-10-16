import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {Chess} from '../../../../lib/chess.js';
const p='research/experiments/E277-brilliant-evidence-admission/',out=process.argv[2];assert.ok(out?.startsWith('research/runs/E277/'));await mkdir(out,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
try{
  const run=JSON.parse(await readFile(p+'evidence/run.json')),bytes=await readFile(p+'evidence/results.json.gz');assert.equal(hash(bytes),run.outputs['results.json.gz']);
  const frozen=JSON.parse(await readFile(p+'evidence/freeze.json')),inputBytes=await readFile(p+'evidence/inputs.json');assert.equal(hash(inputBytes),frozen.outputs['inputs.json']);assert.deepEqual(run.sourceHashes,frozen.sourceHashes);
  for(const [file,h] of Object.entries(run.sourceHashes))assert.equal(hash(await readFile(file)),h,file);
  const inputs=JSON.parse(inputBytes),r=JSON.parse(gunzipSync(bytes));assert.equal(r.rows.length,252);const keys=new Set();
  const summary={rows:252,positive:0,invalidUsed:0,negative:0,baselineInvalidBrilliant:0,candidateInvalidAdmitted:0,candidatePositiveLost:0,candidateNegativeChanged:0,bluntPositiveLost:0,unchangedNumerics:true};
  let rawMetadataChecks=0,observedBaselinePositive=0,observedCandidatePositiveLost=0;const sharedPositiveFailures=[];
  for(const row of r.rows){
    assert.ok(inputs.scenarios.some(s=>s.id===row.id&&s.expectation===row.expectation));assert.ok(inputs.colors.includes(row.color)&&inputs.builds.includes(row.build)&&inputs.paths.includes(row.path));
    const key=[row.id,row.color,row.build,row.path].join(':');assert.ok(!keys.has(key));keys.add(key);const {B,C,U}=row.arms;
    assert.equal(B.numericSnapshot,C.numericSnapshot);assert.equal(B.numericSnapshot,U.numericSnapshot);
    if(row.path==='variation')for(const arm of [B,C,U])assert.equal(arm.mainlinePreserved,true);
    else for(const arm of [B,C,U])assert.equal(arm.numericalPreserved,true);
    if(B.category==='brilliant'){observedBaselinePositive++;if(C.category!=='brilliant')observedCandidatePositiveLost++;}
    if(row.expectation==='retain'){
      summary.positive++;if(B.category!=='brilliant'||C.category!=='brilliant')summary.candidatePositiveLost++;
      if(U.category!=='brilliant')summary.bluntPositiveLost++;
      if(B.category!=='brilliant'&&C.category===B.category)sharedPositiveFailures.push({id:row.id,color:row.color,build:row.build,path:row.path,sharedCategory:B.category});
    }else if(row.expectation==='withhold'){
      summary.invalidUsed++;if(B.category==='brilliant')summary.baselineInvalidBrilliant++;if(C.category!==null)summary.candidateInvalidAdmitted++;
    }else{summary.negative++;if(C.category!==B.category||C.grade!==B.grade||C.category==='brilliant')summary.candidateNegativeChanged++;}
    if(row.path==='raw'){
      // Read the actual retained input state, rather than the candidate/spec generator.
      const state=JSON.parse(B.numericSnapshot),root=state.bests[0],f=inputs.fixtures.find(f=>f.color===row.color),move=f.offer.lan;
      const candidates=root.lines.filter(l=>l.pv?.split(' ')[0]===move),paired=Object.hasOwn(root,'playedScore');
      let metadataValid=true;
      if(!paired&&candidates.length){const used=candidates[0],top=root.lines.find(l=>l.multipv===1)||root.lines[0];
        const legal=new Set(new Chess(f.fen).moves({verbose:true}).map(m=>m.lan)),first=top?.pv?.split(' ')[0];
        const clauses=[used.bound==='exact',top?.bound==='exact',Number.isSafeInteger(top?.depth)&&top.depth>0,used.depth===top?.depth,
          top?.multipv===1,!!root.bestmove&&first===root.bestmove,legal.has(first),legal.has(move),Number.isSafeInteger(used.multipv)&&used.multipv>0,
          move===first?used.multipv===1:used.multipv>=2];metadataValid=clauses.every(Boolean);
      }
      assert.equal(metadataValid,row.expectation!=='withhold',key);rawMetadataChecks++;
    }
  }
  assert.deepEqual(summary,r.totals);assert.equal(keys.size,21*2*2*3);
  let parserFrames=0,defaultFalseAwards=0;
  for(const witness of r.witnesses){assert.equal(witness.transcript.length,3);
    for(const frame of witness.rows){parserFrames++;assert.equal(frame.requireExact,witness.requireExact);const secondary=frame.root.lines.find(l=>l.multipv===2);
      if(witness.requireExact){assert.equal(secondary,undefined);assert.notEqual(frame.arms.B.category,'brilliant');}
      else{assert.equal(secondary.bound,'upperbound');assert.equal(secondary.depth,15);assert.equal(frame.root.lines.find(l=>l.multipv===1).depth,16);assert.equal(frame.arms.B.category,'brilliant');assert.equal(frame.arms.C.category,null);defaultFalseAwards++;}
    }
  }
  assert.equal(parserFrames,16);assert.equal(defaultFalseAwards,8);assert.equal(r.cache.length,40);
  for(const row of r.cache){const expected=row.mutation==='valid'||(row.mutation==='wrong-nodes'&&row.build==='nnue');assert.equal(row.admitted,expected);assert.equal(row.passed,true);}
  const independentPassed=summary.candidateInvalidAdmitted===0&&summary.candidatePositiveLost===0&&summary.candidateNegativeChanged===0;
  assert.equal(r.gates.matrix,independentPassed);assert.equal(r.gates.parser,true);assert.equal(r.gates.cache,true);assert.equal(r.passed,independentPassed);
  const repeatBytes=await readFile('research/runs/E277/repeat/results.json.gz');assert.equal(hash(repeatBytes),hash(bytes));
  const result={schema:'E277-independent-audit-v1',passed:true,scientificJointScreen:r.passed,exactReportRepeat:true,sourceAndInputHashes:true,rawMetadataChecks,parserFrames,defaultFalseAwards,cacheRows:40,
    sourceRoleCounts:summary,observedBaselinePositive,observedCandidatePositiveLost,sharedPositiveFailures,
    codeSha256:hash(await readFile(p+'code/audit.mjs')),inputSha256:hash(bytes),completedUtc:new Date().toISOString(),
    limitations:'Synthetic protocol reachability and label admission; no live-engine frequency, real-game precision or independent human validity. Audit verifies the unchanged failed screen.'};
  await writeFile(out+'/verification.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}catch(error){await writeFile(out+'/failure.json',JSON.stringify({message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}
