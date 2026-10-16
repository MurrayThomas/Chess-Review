import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync,gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {Chess} from '../../../../lib/chess.js';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {openTraffic} from '../../E278-coherent-brilliant-validation/code/traffic.mjs';
import {loadCases} from '../../E276-reported-brilliant-cases/code/cases.mjs';
import {connect} from './bridge.mjs';
import {graders} from './grader.mjs';
const p='research/experiments/E280-timestamped-progress-pilot/',parent='research/experiments/E279-coherent-multipv-emission/',hash=b=>createHash('sha256').update(b).digest('hex');
const [mode,output]=process.argv.slice(2);assert.ok(['freeze','collect'].includes(mode));const out=path.resolve(output||'');assert.ok(out.startsWith(path.resolve('research/runs/E280')+path.sep));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,processId:process.pid,startedUtc:new Date().toISOString()})+'\n',{flag:'wx'});
const started=performance.now(),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();let sourceHashes;
try{
  const parentRun=JSON.parse(await readFile(parent+'evidence/run.json')),sources=[...Object.keys(parentRun.sourceHashes),...['bridge.mjs','grader.mjs','run.mjs'].map(n=>p+'code/'+n),'research/experiments/E276-reported-brilliant-cases/code/classifier.mjs','tools/calibration/engine.mjs','tools/calibration/engine-host.cjs'];
  sourceHashes=Object.fromEntries(await Promise.all(sources.map(async file=>[file,hash(await readFile(file))])));for(const [file,h] of Object.entries(parentRun.sourceHashes))assert.equal(sourceHashes[file],h,file);
  const traffic=await openTraffic(),access=await loadCases(),calibration=JSON.parse(await readFile('data/calibration.json'));
  const cases=access.input.cases,configs={};for(const major of [19,18]){const file=major===19?'engine/stockfish-19-lite-single.js':'engine/stockfish-nnue.js';configs[major]={file,...await engineConfig(file,{kind:'nodes',value:2000000})};}
  const receipt={schema:'E280-run-v1',mode,revision,sourceHashes,trafficEligibility:traffic.receipt,caseEligibility:access.receipt,configs,command:process.argv.slice(1),startedUtc:new Date().toISOString(),environment:{node:process.version,platform:process.platform,arch:process.arch}};
  async function save(name,value,gz=false){const plain=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(plain):plain;await writeFile(path.join(out,name),bytes,{flag:'wx'});return hash(bytes);}
  if(mode==='freeze'){
    const outputs={'inputs.json':await save('inputs.json',{schema:'E280-fixed-pilot-v1',cases,configs,order:['19:A','19:B','18:A','18:B'],budgetNodes:2000000,smokeNodes:200000,sourceRole:'Specific user-authorized diagnostic cases; current host Node/DOM timing, no browser rendering or population claims.'})};
    await save('freeze.json',{...receipt,outputs,engineSearches:0});console.log(JSON.stringify({frozen:true,primaryQueries:12,smokeQueries:1,maxRecoveries:4}));
  }else{
    const frozen=JSON.parse(await readFile(p+'evidence/freeze.json'));assert.deepEqual(sourceHashes,frozen.sourceHashes);assert.deepEqual(configs,frozen.configs);assert.deepEqual(access.receipt,frozen.caseEligibility);
    assert.equal(hash(await readFile(p+'evidence/inputs.json')),frozen.outputs['inputs.json']);
    const report=JSON.parse(await readFile('research/experiments/E276-reported-brilliant-cases/evidence/results.json')),observations=[];let recoveryCount=0,connection=null,grade=null,stopReason='complete',error=null,smoke=null;
    const limit=setTimeout(()=>{stopReason='collection-time-cap';connection?.close();},480000);
    async function query(spec,gradeFn){assert.ok(performance.now()-started<480000);const row=await connection.query(spec,gradeFn);observations.push(row);console.log(JSON.stringify({id:spec.id,error:row.error?.message||null,seconds:Math.round((performance.now()-started)/1000),callbacks:[row.B.length,row.PC.length]}));return row;}
    async function child(spec){let row=await query(spec);if(row.error?.scoringMove){assert.ok(recoveryCount<4,'Recovery cap');recoveryCount++;row=await query({...spec,id:spec.id+':recovery',searchMove:row.error.scoringMove,multipv:1});}if(row.error)throw Error(row.error.message);return row.result;}
    try{
      connection=await connect(configs[19].file,configs[19]);const first=await query({id:'smoke',fen:cases[0].before,multipv:3,budget:{kind:'nodes',value:200000},requireExact:false});
      const smokeMs=first.finishedPerf-first.goAt;smoke={smokeMs,projectionMs:smokeMs*120,passed:smokeMs<=30000&&smokeMs*120<=360000};assert.ok(!first.error&&smoke.passed,'Smoke or projection failed');connection.close();connection=null;
      for(const major of [19,18]){
        connection=await connect(configs[major].file,configs[major]);
        for(const c of cases){const alt=new Chess(c.before);alt.move({from:'d7',to:c.id==='A'?'d6':'e6'});const common={budget:{kind:'nodes',value:2000000},requireExact:true,multipv:1,engine:major,case:c.id};
          const reported=await child({...common,id:major+':'+c.id+':child-reported',fen:c.after}),alternative=await child({...common,id:major+':'+c.id+':child-alternative',fen:alt.fen()});
          const seed=report.rows.find(r=>r.case===c.id&&r.engine===major&&r.budget.kind==='nodes'&&r.budget.value===2000000);grade=graders(c,major===19?'sf19lite':'nnue',{reported,alternative},seed,calibration);
          const root=await query({...common,id:major+':'+c.id+':root',fen:c.before,requireExact:false,multipv:3},(arm,snapshot)=>grade.evaluate(arm,snapshot));if(root.error)throw Error(root.error.message);
          root.endpoint={B:grade.evaluate('B',root.result),BC:grade.evaluate('BC',root.result),PC:grade.evaluate('PC',root.result)};grade.close();grade=null;
          await writeFile(path.join(out,'progress.json'),JSON.stringify({queries:observations.length,finishedGroup:major+':'+c.id,stopReason})+'\n');
        }connection.close();connection=null;
      }
    }catch(e){error={message:e.message,stack:e.stack};stopReason=stopReason==='complete'?'collection-error':stopReason;}
    finally{clearTimeout(limit);grade?.close();connection?.close();}
    const complete=stopReason==='complete'&&!error,outputs={'observations.json.gz':await save('observations.json.gz',{schema:'E280-timestamped-observations-v1',complete,stopReason,error,smoke,recoveryCount,observations},true)};
    await save('collection-run.json',{...receipt,outputs,complete,stopReason,error,engineSearches:observations.length,elapsedMs:performance.now()-started,finishedUtc:new Date().toISOString()});if(error)throw Error(error.message);
  }
}catch(error){await writeFile(path.join(out,'failure.json'),JSON.stringify({mode,revision,sourceHashes,message:error.message,stack:error.stack},null,2)+'\n',{flag:'wx'});throw error;}
