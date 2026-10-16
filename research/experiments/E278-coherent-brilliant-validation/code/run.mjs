import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {scenarios,colors,builds,paths} from '../../E277-brilliant-evidence-admission/code/spec.mjs';
import {parserWitness,cacheAudit} from '../../E277-brilliant-evidence-admission/code/routes.mjs';
import {runRow,evaluate} from './matrix.mjs';
import {openTraffic,census} from './traffic.mjs';
const p='research/experiments/E278-coherent-brilliant-validation/',old='research/experiments/E277-brilliant-evidence-admission/';
const hash=b=>createHash('sha256').update(b).digest('hex');
const [mode,output]=process.argv.slice(2);assert.ok(['freeze','evaluate'].includes(mode));const out=path.resolve(output||'');assert.ok(out.startsWith(path.resolve('research/runs/E278')+path.sep));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,processId:process.pid,startedUtc:new Date().toISOString()})+'\n',{flag:'wx'});
const started=performance.now(),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();let sourceHashes;
try{
  const oldFreeze=JSON.parse(await readFile(old+'evidence/freeze.json'));
  const files=[...Object.keys(oldFreeze.sourceHashes),...['matrix.mjs','traffic.mjs','run.mjs'].map(n=>p+'code/'+n),'research/experiments/E276-reported-brilliant-cases/code/cases.mjs'];
  sourceHashes=Object.fromEntries(await Promise.all(files.map(async file=>[file,hash(await readFile(file))])));
  for(const [file,h] of Object.entries(oldFreeze.sourceHashes))assert.equal(sourceHashes[file],h,file);
  const parentInput=await readFile(old+'evidence/inputs.json');assert.equal(hash(parentInput),oldFreeze.outputs['inputs.json']);
  const oldRunBytes=await readFile(old+'evidence/run.json'),oldRun=JSON.parse(oldRunBytes),oldBytes=await readFile(old+'evidence/results.json.gz');assert.equal(hash(oldBytes),oldRun.outputs['results.json.gz']);
  const oldResult=JSON.parse(gunzipSync(oldBytes));assert.equal(oldResult.passed,false);assert.equal(oldResult.totals.candidatePositiveLost,8);
  const traffic=await openTraffic();
  const receipt={schema:'E278-run-v1',mode,revision,sourceHashes,candidateSha256:sourceHashes[old+'code/candidate.mjs'],parentResultSha256:hash(oldBytes),parentInputSha256:hash(parentInput),trafficEligibility:traffic.receipt,command:process.argv.slice(1),startedUtc:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch},engineSearches:0};
  async function write(name,value,gz=false){const plain=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(plain):plain;await writeFile(path.join(out,name),bytes,{flag:'wx'});return hash(bytes);}
  if(mode==='freeze'){
    const outputs={'inputs.json':await write('inputs.json',{schema:'E278-fixture-correction-v1',parentInputSha256:hash(parentInput),candidateSha256:receipt.candidateSha256,scenarios,colors,builds,paths,correction:'All overlays: coherent completed losing child plus explicit legal exact child preview with the declared scenario score. No candidate/gate/other-path change.',trafficEligibility:traffic.receipt})};
    await write('freeze.json',{...receipt,outputs,assessments:0});console.log(JSON.stringify({frozen:true,matrixRows:252,fullTrafficStreams:traffic.streams.length,excluded:traffic.receipt.excluded.length}));
  }else{
    const frozen=JSON.parse(await readFile(p+'evidence/freeze.json'));assert.deepEqual(sourceHashes,frozen.sourceHashes);assert.deepEqual(receipt.trafficEligibility,frozen.trafficEligibility);assert.equal(receipt.parentResultSha256,frozen.parentResultSha256);
    const inputBytes=await readFile(p+'evidence/inputs.json');assert.equal(hash(inputBytes),frozen.outputs['inputs.json']);
    const calibration=JSON.parse(await readFile('data/calibration.json')),pilotStart=performance.now();
    for(const [id,color,build,path] of [['valid-exact','w','nnue','raw'],['valid-no-candidate','w','sf19lite','overlay'],['used-upperbound','b','nnue','variation'],['valid-no-lines','b','nnue','overlay']]){
      const s=scenarios.find(s=>s.id===id);for(const arm of ['B','C','U'])runRow(s,color,build,path,arm,calibration);}
    const pilotMs=performance.now()-pilotStart;assert.ok(pilotMs<=30000);console.log(JSON.stringify({pilotMs}));
    const assessmentStarted=performance.now(),rows=[];let nonOverlayUnchanged=0,changedOverlayLabels=0;
    for(const s of scenarios)for(const color of colors)for(const build of builds)for(const path of paths){
      const row={...s,color,build,path,arms:Object.fromEntries(['B','C','U'].map(arm=>[arm,runRow(s,color,build,path,arm,calibration)]))};rows.push(row);
      const parent=oldResult.rows.find(x=>x.id===s.id&&x.color===color&&x.build===build&&x.path===path);assert.ok(parent);
      if(path!=='overlay'){assert.deepEqual(row,parent);nonOverlayUnchanged++;}
      else{const intended=['valid-no-candidate','valid-no-lines'].includes(s.id);let changed=false;
        for(const arm of ['B','C','U']){if(intended&&arm!=='U'){assert.equal(parent.arms[arm].category,'blunder');assert.equal(row.arms[arm].category,'brilliant');changed=true;}
          else{assert.equal(row.arms[arm].category,parent.arms[arm].category);assert.equal(row.arms[arm].grade,parent.arms[arm].grade);}}
        if(changed)changedOverlayLabels++;
      }assert.ok(performance.now()-assessmentStarted<=180000,'Matrix cap');
    }
    assert.equal(nonOverlayUnchanged,168);assert.equal(changedOverlayLabels,8);
    const matrix=evaluate(rows),witnesses=[];for(const color of colors)for(const build of builds)for(const exact of [false,true])witnesses.push(await parserWitness(color,build,exact,calibration));
    const cache=colors.flatMap(color=>builds.flatMap(build=>cacheAudit(color,build,calibration)));
    assert.deepEqual(witnesses,oldResult.witnesses);assert.deepEqual(cache,oldResult.cache);
    const natural=await census(traffic.streams);
    const result={schema:'E278-coherent-validation-v1',...matrix,passed:matrix.passed&&cache.every(c=>c.passed),nonOverlayUnchanged,changedOverlayLabels,witnesses,cache,rows,natural,
      scope:'Synthetic contract validation plus descriptive authorized two-case engine metadata; no real false-Brilliant rate or human precision claim.'};
    const outputs={'results.json.gz':await write('results.json.gz',result,true)};
    await write('run.json',{...receipt,outputs,pilotMs,elapsedMs:performance.now()-started});console.log(JSON.stringify({passed:result.passed,totals:result.totals,nonOverlayUnchanged,changedOverlayLabels,natural:natural.summary}));
  }
}catch(error){await writeFile(path.join(out,'failure.json'),JSON.stringify({revision,mode,sourceHashes,message:error.message,stack:error.stack,elapsedMs:performance.now()-started},null,2)+'\n',{flag:'wx'});throw error;}
