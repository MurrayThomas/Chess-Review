import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {openTraffic,census} from '../../E278-coherent-brilliant-validation/code/traffic.mjs';
import {assess,replay} from './method.mjs';
const p='research/experiments/E279-coherent-multipv-emission/',parent='research/experiments/E278-coherent-brilliant-validation/';
const hash=b=>createHash('sha256').update(b).digest('hex');const [mode,output]=process.argv.slice(2);assert.ok(['freeze','evaluate'].includes(mode));const out=path.resolve(output||'');assert.ok(out.startsWith(path.resolve('research/runs/E279')+path.sep));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,processId:process.pid,startedUtc:new Date().toISOString()})+'\n',{flag:'wx'});
const started=performance.now(),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();let sourceHashes;
try{
  const parentRun=JSON.parse(await readFile(parent+'evidence/run.json'));
  const files=[...Object.keys(parentRun.sourceHashes),parent+'code/traffic.mjs',...['producer.mjs','method.mjs','producer.test.mjs','run.mjs'].map(n=>p+'code/'+n)];
  sourceHashes=Object.fromEntries(await Promise.all(files.map(async file=>[file,hash(await readFile(file))])));
  for(const [file,h] of Object.entries(parentRun.sourceHashes))assert.equal(sourceHashes[file],h,file);
  const bytes=await readFile(parent+'evidence/results.json.gz');assert.equal(hash(bytes),parentRun.outputs['results.json.gz']);const previous=JSON.parse(gunzipSync(bytes));assert.equal(previous.passed,true);
  const traffic=await openTraffic(),pilot=[];
  for(const engine of [18,19])for(const multi of [false,true]){const choices=traffic.streams.filter(s=>s.query.engine===engine&&(s.query.multipv>1)===multi).sort((a,b)=>hash('E279-pilot:'+a.id).localeCompare(hash('E279-pilot:'+b.id)));assert.ok(choices.length);pilot.push(choices[0].id);}
  const receipt={schema:'E279-run-v1',mode,revision,sourceHashes,parentResultSha256:hash(bytes),trafficEligibility:traffic.receipt,command:process.argv.slice(1),startedUtc:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch},engineSearches:0};
  async function write(name,value,gz=false){const b=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),output=gz?gzipSync(b):b;await writeFile(path.join(out,name),output,{flag:'wx'});return hash(output);}
  if(mode==='freeze'){
    const inputs={schema:'E279-fixed-replay-v1',parentResultSha256:hash(bytes),trafficEligibility:traffic.receipt,pilot,streams:traffic.streams.map(s=>({id:s.id,rawSha256:hash(JSON.stringify(s.raw)),query:s.query})),gates:{minCoveredMulti:22,minEligibleSecondary:493,minWithinOneDepth:20,invalidAllowed:0},dataRole:'Exposed two-case diagnostic metadata; no population/human validity.'};
    const outputs={'inputs.json':await write('inputs.json',inputs)};await write('freeze.json',{...receipt,outputs,assessments:0});console.log(JSON.stringify({frozen:true,streams:traffic.streams.length,pilotStreams:pilot.length}));
  }else{
    const frozen=JSON.parse(await readFile(p+'evidence/freeze.json'));assert.deepEqual(frozen.sourceHashes,sourceHashes);assert.deepEqual(frozen.trafficEligibility,traffic.receipt);assert.equal(frozen.parentResultSha256,hash(bytes));
    const inputBytes=await readFile(p+'evidence/inputs.json');assert.equal(hash(inputBytes),frozen.outputs['inputs.json']);const inputs=JSON.parse(inputBytes);assert.deepEqual(inputs.pilot,pilot);
    assert.deepEqual(inputs.streams,traffic.streams.map(s=>({id:s.id,rawSha256:hash(JSON.stringify(s.raw)),query:s.query})));
    const smokeStarted=performance.now();for(const id of pilot){const s=traffic.streams.find(s=>s.id===id);replay(s,true);replay(s,false);}const smokeMs=performance.now()-smokeStarted;assert.ok(smokeMs<=15000);console.log(JSON.stringify({smokeStreams:4,smokeMs}));
    const assessmentStarted=performance.now(),result=assess(traffic.streams,previous),native=await census(traffic.streams);
    assert.deepEqual(native.nativeFinals,previous.natural.nativeFinals);assert.deepEqual(native.frames,previous.natural.frames);assert.deepEqual(native.summary,previous.natural.summary);assert.ok(performance.now()-assessmentStarted<=120000);
    result.gates.nativeFinals=true;result.passed=Object.values(result.gates).every(Boolean);result.nativeFinalsPreserved=54;result.sourceRole=inputs.dataRole;
    const outputs={'results.json.gz':await write('results.json.gz',{schema:'E279-producer-result-v1',...result},true)};
    await write('run.json',{...receipt,outputs,smokeMs,elapsedMs:performance.now()-started,nativeReplayMs:native.elapsedMs});
    console.log(JSON.stringify({passed:result.passed,gates:result.gates,baseline:result.baseline,producer:result.producer,depthOnly:result.depthOnly,singleLatestPreserved:result.singleLatestPreserved,singleStreams:result.singleStreams}));
  }
}catch(error){await writeFile(path.join(out,'failure.json'),JSON.stringify({mode,revision,sourceHashes,message:error.message,stack:error.stack,elapsedMs:performance.now()-started},null,2)+'\n',{flag:'wx'});throw error;}
