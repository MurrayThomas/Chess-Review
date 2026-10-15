import assert from 'node:assert/strict';
import {readFile,writeFile,appendFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {Engine,engineConfig} from '../../../../tools/calibration/engine.mjs';
import {openResearchData,sha256} from '../../../data-policy.mjs';
import {captureSourceHashes} from '../../../replay-hashes.mjs';
import {prefix,PARENTS,SPEC,select,mergeCaches,validateObservation,smokeDecision,stopReason} from './protocol.mjs';
const args=process.argv.slice(2);if(args.length!==2||args[0]!=='--out')throw Error('Use --out research/runs/E274/unique-collection');
const root=fileURLToPath(new URL('../../../../',import.meta.url)),out=path.resolve(root,args[1]);if(!out.startsWith(path.join(root,'research','runs','E274')+path.sep))throw Error('Unsafe output');
const access=await openResearchData(['D001','D002'],{purpose:'collect'}),selection=await access.readJson(prefix+'evidence/selection-v2.json.gz'),freeze=await access.readJson(prefix+'evidence/freeze-v2-run.json');
const deps=await captureSourceHashes(root,prefix+'code',['protocol.mjs','collect.mjs','method.mjs','run.mjs','audit.mjs'],['tools/calibration/engine-host.cjs']);
for(const k of ['codeSha256','sharedCodeSha256','sharedSourceRepresentation'])assert.deepEqual(deps[k],freeze[k]);
const dataset=await access.readJson(PARENTS[0]),cached=await access.readJson(PARENTS[1]),extra=await access.readJson(PARENTS[3]),file=path.join(root,'engine/stockfish-19-lite-single.js'),config=await engineConfig(file,{kind:'nodes',value:SPEC.nodes});
const cache=mergeCaches(cached,extra,config);assert.deepEqual(selection,select(dataset,config,new Set(cache.keys())));
await mkdir(out,{recursive:true});await writeFile(path.join(out,'claim.json'),JSON.stringify({processId:process.pid,started:new Date().toISOString()})+'\n',{flag:'wx'});
const sourceRevision=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',windowsHide:true}).trim();
let engine=null,timer=null,engineStart=null,startupWallMs=null,smoke=null,reason=null,error=null,startup=null,requests=0,pendingQuery=null,pendingObservation=null;const fresh=[];
async function progress(state){await writeFile(path.join(out,'progress.json'),JSON.stringify({state,processId:process.pid,engineProcessId:engine?.child.pid??null,
  sourceRevision,newUniqueQueries:fresh.length,plannedNew:selection.newQueries,requests,collectorElapsedMs:engineStart===null?0:performance.now()-engineStart})+'\n');}
await progress('admitted');
try{
  if(selection.newQueries>SPEC.maxNewQueries){reason='planned-query-cap';}
  else{
    engineStart=performance.now();engine=new Engine(file);timer=setTimeout(()=>{reason='time-cap';engine.close();},SPEC.maxCollectorMs);
    startup=await engine.init(config);startupWallMs=performance.now()-engineStart;await progress('collecting');
    for(const planned of selection.queries.filter(q=>!q.cached)){
      const stop=stopReason(performance.now()-engineStart,fresh.length,requests);if(stop){reason=stop;break;}
      const p=selection.positions[planned.positionIndex],started=performance.now();pendingQuery={key:planned.key,history:p.history,restricted:planned.restricted};
      const observation=await engine.search(p.history,planned.restricted,{kind:'nodes',value:SPEC.nodes});
      const callerWallMs=performance.now()-started;
      const row={key:planned.key,history:p.history,restricted:planned.restricted,...observation,callerWallMs,
        requestCount:observation.exactRecovery?2:1,finalNodes:Number(/\bnodes (\d+)/.exec(observation.finalSearchInfo)?.[1])};
      pendingObservation=row;requests+=row.requestCount;validateObservation(row,selection);fresh.push(row);pendingQuery=null;pendingObservation=null;
      await appendFile(path.join(out,'searches.jsonl'),JSON.stringify(row)+'\n');
      if(fresh.length===SPEC.smokeNewQueries){smoke=smokeDecision(fresh.map(r=>r.callerWallMs),selection.newQueries);await progress(smoke.passed?'smoke-passed':'smoke-stopped');
        console.log(JSON.stringify({stage:'smoke',...smoke}));if(!smoke.passed){reason='smoke-projection-stop';break;}}
      if(fresh.length%100===0){await progress('collecting');console.log(JSON.stringify({newQueries:fresh.length,planned:selection.newQueries,requests,seconds:Math.round((performance.now()-engineStart)/1000)}));}
    }
    if(!reason)reason=fresh.length===selection.newQueries?'complete':'incomplete';
  }
}catch(e){error={message:e.message,stack:e.stack};reason=reason||'engine-or-integrity-failure';}
finally{if(timer)clearTimeout(timer);engine?.close();}
const collectorWallMs=engineStart===null?0:performance.now()-engineStart;
const raw={schema:'E274-collection-v1',configHash:selection.configHash,selectionHash:sha256(JSON.stringify(selection)),complete:reason==='complete'&&error===null,
  stopReason:reason,error,smoke,newUniqueQueries:fresh.length,requests,collectorWallMs,startupWallMs,startup,
  newSearches:fresh,failedObservation:pendingObservation,pendingQuery,
  requestAccounting:'Returned observations counted exactly; any query that throws before returning has unknown in-flight request count (at most two reserved); preserved as pendingQuery.',
  gameIds:selection.games.map(g=>g.gameId),reusedKeys:selection.queries.filter(q=>q.cached).map(q=>q.key)};
const bytes=gzipSync(JSON.stringify(raw)+'\n');await writeFile(path.join(out,'observations.json.gz'),bytes,{flag:'wx'});
await writeFile(path.join(out,'collection-run.json'),JSON.stringify({schema:'research-run-v1',experiment:'E274',date:'2026-10-15',sourceRevision,
  command:'node '+prefix+'code/collect.mjs '+args.join(' '),...deps,dataEligibility:access.receipt,selectionHash:raw.selectionHash,
  environment:{node:process.version,platform:process.platform,arch:process.arch,cpuModel:os.cpus()[0]?.model,logicalCpus:os.cpus().length},config,
  complete:raw.complete,stopReason:reason,error,requests,newQueries:fresh.length,collectorWallMs,
  outputs:{'observations.json.gz':sha256(bytes)},compressedBytes:bytes.length,uncompressedBytes:Buffer.byteLength(JSON.stringify(raw)+'\n'),modelFits:0,humanLabels:0},null,2)+'\n',{flag:'wx'});
await progress(raw.complete?'completed':'stopped');console.log(JSON.stringify({complete:raw.complete,stopReason:reason,newQueries:fresh.length,requests,collectorWallMs,compressedBytes:bytes.length,error:error?.message??null}));
if(error)process.exitCode=1;
