import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {engineConfig} from '../../../../tools/calibration/engine.mjs';
import {prefix,hash,loadCases} from './cases.mjs';
import {FenEngine} from './engine.mjs';
import {currentClassifier,replayLabel} from './classifier.mjs';
const [mode,outArg]=process.argv.slice(2);assert.ok(['freeze','collect','report'].includes(mode));
const out=path.resolve(outArg||'');assert.ok(out.startsWith(path.resolve('research/runs/E276')+path.sep));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({mode,processId:process.pid,started:new Date().toISOString()})+'\n',{flag:'wx'});
const started=performance.now(),revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim();
const access=await loadCases();
const files=[...['cases.mjs','engine.mjs','classifier.mjs','run.mjs','study.test.mjs'].map(n=>prefix+'code/'+n),'analysis.js','lib/chess.js','lib/public-scoring.js','data/calibration.json',
  'tools/calibration/engine.mjs','tools/calibration/engine-host.cjs','node_modules/acorn/dist/acorn.mjs'];
const sources=Object.fromEntries(await Promise.all(files.map(async p=>[p,hash(await readFile(p))])));
const configs={};for(const engine of [18,19]){const file=engine===19?'engine/stockfish-19-lite-single.js':'engine/stockfish-nnue.js';
  configs[engine]={file,...await engineConfig(file,{kind:'nodes',value:200000}),position:'Explicit user-transcribed FEN; full history unavailable/not authenticated',options:{...(await engineConfig(file,{kind:'nodes',value:200000})).options}};}
const receipt={schema:'E276-run-v1',mode,revision,startedUtc:new Date().toISOString(),sources,caseEligibility:access.receipt,configs,
  environment:{node:process.version,platform:process.platform,arch:process.arch},command:process.argv.slice(1)};
async function write(name,value,gz=false){const b=Buffer.from(JSON.stringify(value,null,gz?0:2)+'\n'),bytes=gz?gzipSync(b):b;await writeFile(path.join(out,name),bytes,{flag:'wx'});return hash(bytes);}
if(mode==='freeze'){await write('freeze.json',receipt);console.log(JSON.stringify({frozen:true,cases:2,engineSearches:0}));}
else{
  const frozen=JSON.parse(await readFile(prefix+'evidence/freeze.json'));assert.deepEqual(frozen.sources,sources);assert.deepEqual(frozen.caseEligibility,access.receipt);assert.deepEqual(frozen.configs,configs);
  if(mode==='collect'){
    const queries=[];for(const value of [200000,2000000,8000000])for(const engine of [19,18])for(const c of access.input.cases)
      for(const role of ['best','played','after'])queries.push({engine,case:c.id,role,fen:role==='after'?c.after:c.before,budget:{kind:'nodes',value},multipv:role==='best'?3:1,restricted:role==='played'?c.uci:null});
    for(const c of access.input.cases)for(const role of ['best','played','after'])queries.push({engine:18,case:c.id,role,fen:role==='after'?c.after:c.before,budget:{kind:'depth',value:16},multipv:role==='best'?3:1,restricted:role==='played'?c.uci:null});
    for(const engine of [19,18])for(const c of access.input.cases)queries.push({engine,case:c.id,role:'repeat-best',fen:c.before,budget:{kind:'nodes',value:2000000},multipv:3,restricted:null});
    const observations=[],start=performance.now();let engine=null,active=null,error=null,smoke=null;
    try{for(const q of queries){assert.ok(performance.now()-start<1200000,'20-minute collection cap');
      if(active!==q.engine){engine?.close();engine=new FenEngine(configs[q.engine].file);await engine.init(configs[q.engine]);active=q.engine;}
      const result=await engine.query(q);observations.push(result);
      await writeFile(path.join(out,'progress.json'),JSON.stringify({done:observations.length,total:queries.length,last:{engine:q.engine,case:q.case,role:q.role,budget:q.budget},elapsedMs:performance.now()-start})+'\n');
      if(observations.length===3){const elapsed=performance.now()-start;smoke={elapsedMs:elapsed,passed:elapsed<=60000,roughNodeGridMs:elapsed*204};assert.ok(smoke.passed,'60-second pilot failed');console.log(JSON.stringify({smoke}));}
      console.log(JSON.stringify({done:observations.length,total:queries.length,case:q.case,engine:q.engine,role:q.role,budget:q.budget,score:result.score,bestmove:result.bestmove,depth:result.depth,seconds:Math.round((performance.now()-start)/1000)}));
    }}catch(e){error={message:e.message,stack:e.stack};}finally{engine?.close();}
    const outputHash=await write('observations.json.gz',{schema:'E276-engine-observations-v1',observations,queries,smoke,error,complete:observations.length===queries.length&&error===null},true);
    await write('collection-run.json',{...receipt,finishedUtc:new Date().toISOString(),elapsedMs:performance.now()-started,outputHash,observations:observations.length,planned:queries.length,error});if(error)throw Error(error.message);
  }else{
    // Report reads only the retained, hash-bound engine artifact below.
    const {gunzipSync}=await import('node:zlib');const bytes=await readFile(prefix+'evidence/observations.json.gz');
    const collection=JSON.parse(await readFile(prefix+'evidence/collection-run.json'));assert.equal(hash(bytes),collection.outputHash);assert.deepEqual(collection.sources,sources);
    const data=JSON.parse(gunzipSync(bytes));assert.equal(data.complete,true);const {api,extractedNames}=await currentClassifier(),rows=[];
    for(const c of access.input.cases)for(const engine of [19,18])for(const budget of [{kind:'nodes',value:200000},{kind:'nodes',value:2000000},{kind:'nodes',value:8000000},...(engine===18?[{kind:'depth',value:16}]:[])]){
      const pick=role=>data.observations.find(o=>o.query.case===c.id&&o.query.engine===engine&&o.query.role===role&&o.query.budget.kind===budget.kind&&o.query.budget.value===budget.value);
      const root=pick('best'),played=pick('played'),after=pick('after');assert.ok(root&&played&&after);
      rows.push({case:c.id,engine,budget,root:{score:root.score,bestmove:root.bestmove,pv:root.pv,lines:root.lines},played:{score:played.score,pv:played.pv},after:{score:after.score,bestmove:after.bestmove,pv:after.pv},
        current:replayLabel(api,c,root,played,after,engine),withoutHistory:replayLabel(api,c,root,played,after,engine,{history:false})});
    }
    const repeated=[];for(const o of data.observations.filter(o=>o.query.role==='repeat-best')){const original=data.observations.find(x=>x.query.case===o.query.case&&x.query.engine===o.query.engine&&x.query.role==='best'&&x.query.budget.kind==='nodes'&&x.query.budget.value===2000000);
      const core=x=>({score:x.score,bestmove:x.bestmove,pv:x.pv,depth:x.depth,nodes:x.nodes});assert.deepEqual(core(original),core(o));repeated.push({case:o.query.case,engine:o.query.engine,exactCore:true});}
    const result={schema:'E276-diagnostic-report-v1',rows,repeated,extractedNames,productionChanges:false,populationValidity:false,originalScreenshotReplay:false};
    const outputHash=await write('results.json',result);await write('report-run.json',{...receipt,elapsedMs:performance.now()-started,outputHash});console.log(JSON.stringify({rows:rows.map(r=>({case:r.case,engine:r.engine,budget:r.budget,current:r.current,after:r.after})),repeated}));
  }
}
