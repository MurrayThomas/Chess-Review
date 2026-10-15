import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {captureSourceHashes} from '../../../replay-hashes.mjs';
import {prefix,PARENTS,loadParents,loadFrozen} from './inputs.mjs';
import {SPEC} from './model.mjs';
import {fitModels,evaluate} from './method.mjs';
import {audit} from './audit.mjs';
async function main(){
  const [mode,...args]=process.argv.slice(2);assert.ok(['freeze','fit','evaluate','verify'].includes(mode)&&args.length===2&&args[0]==='--out','Use freeze|fit|evaluate|verify --out research/runs/E275/unique-run');
  const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);assert.ok(out.startsWith(path.join(root,'research','runs','E275')+path.sep));
  const started=performance.now(),sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
  await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,sourceRevision,processId:process.pid})+'\n',{flag:'wx'});
  let access,deps,stage='admission';
  try{
    access=await openResearchData(['D001','D002'],{purpose:mode==='fit'?'train':mode==='evaluate'?'validate':'reuse'});
    deps=await captureSourceHashes(root,prefix+'code',['model.mjs','inputs.mjs','method.mjs','audit.mjs','run.mjs']);
    const receipt={schema:'research-run-v1',experiment:'E275',date:'2026-10-15',mode,sourceRevision,
      command:'node '+prefix+'code/run.mjs '+[mode,...args].join(' '),...deps,dataEligibility:access.receipt,
      environment:{node:process.version,platform:process.platform,arch:process.arch},seeds:{primary:SPEC.primarySeeds,crossFit:SPEC.crossFitSeeds,fold:SPEC.foldSeed},engineSearches:0,humanAnnotations:0};
    async function write(name,value,gz=false){const plain=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(plain):plain;await writeFile(path.join(out,name),bytes,{flag:'wx'});return sha256(bytes);}
    if(mode==='freeze'){
      stage='raw reconstruction';const input=await loadParents(access,root),outputs={'inputs.json.gz':await write('inputs.json.gz',input,true)};
      await write('freeze-run.json',{...receipt,outputs,modelFits:0,performanceEvaluations:0,elapsedMs:performance.now()-started});
      console.log(JSON.stringify({frozen:true,games:input.cohort.length,outcomeRoots:input.outcomes.length,excludedRoots:input.exclusions.length,stability:input.stability.length,modelFits:0}));return;
    }
    const input=await loadFrozen(access),frozen=await access.readJson(prefix+'evidence/freeze-run.json');
    for(const k of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(frozen[k],deps[k]);
    if(mode==='fit'){
      stage='training-only fits';const fitStarted=performance.now(),models=fitModels(input);assert.ok(performance.now()-fitStarted<=300000,'Fit budget exceeded');
      const outputs={'models.json':await write('models.json',models)};await write('fit-run.json',{...receipt,outputs,modelFits:18,constantControls:6,performanceEvaluations:0,elapsedMs:performance.now()-started});
      console.log(JSON.stringify({fitted:true,numericalFits:18,constantControls:6,final:models.final.models,foldCandidateConvergence:models.folds.map(f=>f.models.candidate.diagnostics)}));return;
    }
    const models=await access.readJson(prefix+'evidence/models.json'),fitRun=await access.readJson(prefix+'evidence/fit-run.json');
    for(const k of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(fitRun[k],deps[k]);
    stage='fixed outcome evaluation';const evaluationStarted=performance.now(),replay=evaluate(input,models);assert.ok(performance.now()-evaluationStarted<=120000,'Scoring budget exceeded');
    if(mode==='evaluate'){
      const outputs={'results.json':await write('results.json',replay.result),'predictions.json.gz':await write('predictions.json.gz',replay.records,true)};
      await write('run.json',{...receipt,outputs,configurations:input.configurations,modelFits:0,performanceEvaluations:1,evaluationRole:replay.result.interpretation,elapsedMs:performance.now()-started});
      console.log(JSON.stringify({passed:replay.result.passed,gates:replay.result.gates,validation:replay.result.roles.validation.metrics,comparisons:replay.result.roles.validation.comparisons,stability:replay.result.stability,sparseGroups:replay.result.sparseGroups}));
    }else{
      stage='exact and independent verification';const verificationStarted=performance.now(),saved=await access.readJson(prefix+'evidence/results.json'),predictions=await access.readJson(prefix+'evidence/predictions.json.gz'),run=await access.readJson(prefix+'evidence/run.json');
      assert.deepEqual(saved,replay.result);assert.deepEqual(predictions,replay.records);assert.deepEqual(await loadParents(access,root),input);
      assert.deepEqual(fitModels(input),models);const sourceGames=(await access.readJson(PARENTS[0])).filter(g=>['train','validation'].includes(g.split));
      const independent=audit(input,models,saved,predictions,sourceGames);
      const repeat=await readFile(path.join(root,'research/runs/E275/repeat/results.json'));assert.equal(sha256(repeat),run.outputs['results.json']);
      assert.ok(performance.now()-verificationStarted<=300000,'Verification budget exceeded');
      await write('verification.json',{...receipt,passed:true,exactInputReconstruction:true,exactRefits:true,exactReport:true,exactPredictions:true,exactOfflineRepeat:true,
        independent,verificationRefits:18,cleanCheckoutReplay:false,scientificConfirmation:false,elapsedMs:performance.now()-started});
      console.log(JSON.stringify({passed:true,exactRefits:true,exactReport:true,exactPredictions:true,independent}));
    }
  }catch(error){
    await writeFile(path.join(out,'failure.json'),JSON.stringify({schema:'E275-failed-attempt-v1',mode,stage,sourceRevision,...deps,dataEligibility:access?.receipt,
      command:'node '+prefix+'code/run.mjs '+[mode,...args].join(' '),error:{message:error.message,stack:error.stack},engineSearches:0,elapsedMs:performance.now()-started},null,2)+'\n',{flag:'wx'});throw error;
  }
}
await main();
