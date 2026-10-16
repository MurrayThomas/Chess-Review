import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync} from 'node:zlib';
import {Engine} from '../../../../engine/uci.js';
import {Chess} from '../../../../lib/chess.js';
import {loadCases,hash} from '../../E276-reported-brilliant-cases/code/cases.mjs';
import {rejection} from '../../E277-brilliant-evidence-admission/code/candidate.mjs';
const base='research/experiments/E276-reported-brilliant-cases/';
export async function openTraffic(){
  const access=await loadCases(),manifest=JSON.parse(await readFile(base+'evidence/manifest.json'));
  assert.equal(manifest.publicDatasetAdmission,false);
  for(const [name,a] of Object.entries(manifest.artifacts)){const bytes=await readFile(base+'evidence/'+name);assert.equal(hash(bytes),a.sha256,name);assert.equal(bytes.length,a.bytes);}
  assert.equal(hash(await readFile(base+'code/cases.mjs')),manifest.codeSha256['cases.mjs']);
  const freeze=JSON.parse(await readFile(base+'evidence/freeze.json'));assert.deepEqual(freeze.caseEligibility,access.receipt);
  const archives=[],streams=[],excluded=[];
  for(const name of ['observations.json.gz','tactics.json.gz']){
    const file=base+'evidence/'+name,bytes=await readFile(file),data=JSON.parse(gunzipSync(bytes));assert.equal(data.complete,true);
    archives.push({file,sha256:hash(bytes),observations:data.observations.length});
    for(let index=0;index<data.observations.length;index++){
      const row=data.observations[index];
      if(!row.raw){excluded.push({file,index,engine:row.query.engine,reason:'Selected-info-only inferred-history record; no full UCI sequence'});continue;}
      for(const segment of ['originalRaw','raw'])if(row[segment]){
        assert.ok(row[segment].some(line=>line.startsWith('bestmove ')));
        streams.push({id:name+':'+index+':'+segment,file,index,segment,query:row.query,raw:row[segment]});
      }
    }
  }
  return {streams,receipt:{schema:'E278-E276-specific-traffic-admission-v1',caseAuthorization:access.receipt,parentManifestSha256:hash(await readFile(base+'evidence/manifest.json')),archives,fullStreams:streams.length,excluded,
    scope:'Exactly the two explicitly user-supplied cases/continuations. No public-dataset admission or population sample.'}};
}
class WorkerStub{commands=[];postMessage(command){this.commands.push(command);}terminate(){}line(data){this.onmessage({data});}}
export function inspectFrame(stream,phase,eventIndex,root){
  const board=new Chess(stream.query.fen),legal=new Set(board.moves({verbose:true}).map(m=>m.lan));
  const top=root.lines.find(l=>l.multipv===1)||root.lines[0],first=top?.pv?.split(' ')[0];
  const topSupported=!!top&&top.bound==='exact'&&top.multipv===1&&Number.isInteger(top.depth)&&top.depth>0&&first===root.bestmove&&legal.has(first);
  const seen=new Set(),candidates=[];let duplicate=0,empty=0,illegal=0;
  for(const line of root.lines){if(line.multipv<2)continue;const move=(line.pv||'').split(' ')[0];if(!move){empty++;continue;}if(move===root.bestmove||seen.has(move)){duplicate++;continue;}seen.add(move);if(!legal.has(move)){illegal++;continue;}
    const state={bests:[root],positions:[{fen:stream.query.fen},{from:move.slice(0,2),to:move.slice(2,4),promotion:move[4]}]};
    candidates.push({move,rank:line.multipv,depth:line.depth,bound:line.bound,ownBounded:line.bound!=='exact',depthMismatch:line.depth!==top?.depth,rejection:rejection(1,state)});
  }
  return {streamId:stream.id,engine:stream.query.engine,phase,eventIndex,root,topSupported,duplicate,empty,illegal,candidates};
}
export function summarize(frames){
  const summary={frames:frames.length,logicalProgress:0,final:0,streamsWithSecondaryIssues:0,candidateInspections:0,rejected:0,topSupportedInspections:0,topSupportedSecondaryIssues:0,boundedInTopSupported:0,depthMismatchInTopSupported:0,duplicates:0,empty:0,illegal:0,byContext:{}};
  const streams=new Set();
  for(const frame of frames){summary[frame.phase==='final'?'final':'logicalProgress']++;summary.duplicates+=frame.duplicate;summary.empty+=frame.empty;summary.illegal+=frame.illegal;
    const key=frame.engine+':'+frame.phase,group=summary.byContext[key]||(summary.byContext[key]={frames:0,inspections:0,topSupportedSecondaryIssues:0});group.frames++;
    for(const c of frame.candidates){summary.candidateInspections++;group.inspections++;if(c.rejection)summary.rejected++;
      if(frame.topSupported){summary.topSupportedInspections++;if(c.ownBounded)summary.boundedInTopSupported++;if(c.depthMismatch)summary.depthMismatchInTopSupported++;
        if(c.ownBounded||c.depthMismatch){summary.topSupportedSecondaryIssues++;group.topSupportedSecondaryIssues++;streams.add(frame.streamId);}}
    }
  }summary.streamsWithSecondaryIssues=streams.size;return summary;
}
export async function census(streams){
  const started=performance.now(),frames=[],nativeFinals=[];const previous=globalThis.Worker;globalThis.Worker=WorkerStub;
  try{for(const stream of streams){let eng;
    try{
      eng=new Engine(stream.query.engine===19?'engine/stockfish-19-lite-single.js':'engine/stockfish-nnue.js');eng.worker.line('uciok');eng.worker.line('readyok');
      const pending=eng.analyse(stream.query.fen,16,stream.query.multipv,null,null,{budget:stream.query.budget});await Promise.resolve();
      for(let i=0;i<stream.raw.length;i++){
        const text=stream.raw[i];eng.worker.line(text);
        if(/^info /.test(text)&&/\bscore /.test(text)&&/\bpv /.test(text)&&! /\b(?:lowerbound|upperbound)\b/.test(text)
          &&Number(/\bmultipv (\d+)/.exec(text)?.[1]||1)===1&&Number(/\bdepth (\d+)/.exec(text)?.[1])>=4){
          const job=eng.current;assert.ok(job);const lines=Object.keys(job.lines).sort((a,b)=>+a-+b).map(k=>structuredClone(job.lines[k]));
          const root={bestmove:job.lastPv.split(' ')[0],score:structuredClone(job.lastScore),pv:job.lastPv,lines};frames.push(inspectFrame(stream,'logical-progress',i,root));
        }
      }
      const root=await pending;nativeFinals.push({streamId:stream.id,root});frames.push(inspectFrame(stream,'final',stream.raw.length-1,root));
      assert.ok(performance.now()-started<=120000,'Traffic census cap');
    }finally{eng?.terminate();}
  }}finally{globalThis.Worker=previous;}
  return {summary:summarize(frames),frames,nativeFinals,elapsedMs:performance.now()-started,
    interpretation:'Logical progress states have no original timing; final native-parser objects preserve complete recorded UCI order. Counts are correlated diagnostic traffic, not false-label or population frequency.'};
}
