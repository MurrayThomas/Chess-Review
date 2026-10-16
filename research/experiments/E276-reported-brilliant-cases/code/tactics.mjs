import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {Chess} from '../../../../lib/chess.js';
import {Engine,engineConfig} from '../../../../tools/calibration/engine.mjs';
import {prefix,hash,loadCases} from './cases.mjs';
import {FenEngine} from './engine.mjs';
const out=process.argv[2];assert.ok(out?.startsWith('research/runs/E276/'));await mkdir(out,{recursive:true});
await writeFile(out+'/claim.json',JSON.stringify({startedUtc:new Date().toISOString(),processId:process.pid})+'\n',{flag:'wx'});
const access=await loadCases(),frozen=JSON.parse(await readFile(prefix+'evidence/freeze.json'));
for(const [p,h] of Object.entries(frozen.sources))assert.equal(hash(await readFile(p)),h,p);
const started=performance.now(),observations=[],configurations={},sources={...frozen.sources,[prefix+'code/tactics.mjs']:hash(await readFile(prefix+'code/tactics.mjs'))};
let error=null,engine=null;
try{
  const c=access.input.cases[0],board=new Chess(c.after);board.move('hxg4');const afterHxg4=board.fen();board.move('Nxg4');const afterNxg4=board.fen();
  const direct=new Chess(c.after);direct.move('Qxg4');
  const historical=new Chess();historical.loadPgn(c.inferredPgn);const moves=historical.history({verbose:true}).map(m=>m.lan);assert.equal(historical.fen(),c.after);
  for(const build of [19,18]){
    const file=build===19?'engine/stockfish-19-lite-single.js':'engine/stockfish-nnue.js';
    const config=await engineConfig(file,{kind:'nodes',value:2000000});configurations[build]=config;
    engine=new FenEngine(file);await engine.init(config);
    for(const q of [{name:'after-hxg4',fen:afterHxg4,multipv:3},{name:'after-hxg4-Nxg4',fen:afterNxg4,multipv:3},
      {name:'unsafe-later-Qxg4',fen:afterNxg4,multipv:1,restricted:'d1g4'},{name:'immediate-Qxg4',fen:direct.fen(),multipv:3}]){
      assert.ok(performance.now()-started<300000);const row=await engine.query({...q,engine:build,budget:config.budget});observations.push(row);console.log(JSON.stringify({engine:build,name:q.name,score:row.score,bestmove:row.bestmove,pv:row.pv}));
    }engine.close();engine=new Engine(file);await engine.init(config);
    for(const [name,history] of [['inferred-history-before',moves.slice(0,-1)],['inferred-history-after',moves]]){
      assert.ok(performance.now()-started<300000);const row=await engine.search(history,null,config.budget);observations.push({query:{engine:build,name,history,budget:config.budget,multipv:1,historyStatus:'Inferred opening, not authenticated game'},...row});console.log(JSON.stringify({engine:build,name,score:row.score,bestmove:row.bestmove}));
    }engine.close();engine=null;
  }
}catch(e){error={message:e.message,stack:e.stack};}finally{engine?.close();}
const b=access.input.cases[1],mate=new Chess(b.before),proof=[];
for(const san of ['e6','Qxe6+','Kc7','Qxc8#']){const legal=mate.moves(),move=mate.move(san);proof.push({before:move.before,legal,san:move.san,after:move.after});}
assert.equal(proof[2].legal.length,1);assert.equal(mate.isCheckmate(),true);
const result={schema:'E276-tactical-followup-v1',observations,complete:observations.length===12&&error===null,error,mateProof:proof,
  caseEligibility:access.receipt,sources,configurations,revision:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8',windowsHide:true}).trim(),
  completedUtc:new Date().toISOString(),elapsedMs:performance.now()-started,historyLimitation:'Startpos history is an inferred sensitivity check, not original-game reconstruction.'};
const bytes=gzipSync(JSON.stringify(result)+'\n');await writeFile(out+'/tactics.json.gz',bytes,{flag:'wx'});
await writeFile(out+'/run.json',JSON.stringify({outputHash:hash(bytes),sources,complete:result.complete,error,elapsedMs:result.elapsedMs},null,2)+'\n',{flag:'wx'});
if(error)throw Error(error.message);
