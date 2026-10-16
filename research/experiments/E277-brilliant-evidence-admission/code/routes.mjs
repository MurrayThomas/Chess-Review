import assert from 'node:assert/strict';
import {Engine} from '../../../../engine/uci.js';
import {app,loadGame} from '../../../../tests/helpers/app.mjs';
import {fixture,scenarios,tag} from './spec.mjs';
import {runRow} from './matrix.mjs';
class WorkerStub{commands=[];postMessage(command){this.commands.push(command);}terminate(){}line(data){this.onmessage({data});}}
export async function parserWitness(color,build,requireExact,calibration){
  const previous=globalThis.Worker;globalThis.Worker=WorkerStub;let engine;
  try{
    engine=new Engine(build==='sf19lite'?'engine/stockfish-19-lite-single.js':'engine/stockfish-nnue.js');engine.worker.line('uciok');engine.worker.line('readyok');
    const f=fixture(color),snapshots=[],pending=engine.analyse(f.fen,16,3,null,p=>snapshots.push(p),{requireExact});await Promise.resolve();
    const transcript=['info depth 15 multipv 2 score cp 0 upperbound pv '+f.offer.lan,'info depth 16 multipv 1 score cp 0 pv '+f.safe,'bestmove '+f.safe];
    for(const line of transcript)engine.worker.line(line);const final=await pending;assert.equal(snapshots.length,1);
    const rows=[];
    for(const [phase,root] of [['progress',snapshots[0]],['final',final]]){
      const scenario=scenarios.find(s=>s.id==='used-upperbound');
      const arms=Object.fromEntries(['B','C','U'].map(arm=>[arm,runRow(scenario,color,build,'variation',arm,calibration,root)]));
      rows.push({color,build,requireExact,phase,root,arms});
    }
    return {color,build,requireExact,transcript,commands:engine.worker.commands,rows};
  }finally{engine?.terminate();globalThis.Worker=previous;}
}
export function cacheAudit(color,build,calibration){
  const rows=[];
  for(const mutation of ['valid','stale-version','unknown-root-build','unknown-envelope-build','wrong-nodes','missing-pair','scalar-nan','mate-zero','mate-fraction','mixed-builds']){
    const cleanup=[],a=app({after:f=>cleanup.push(f)});
    try{
      a.context.__canonical=calibration;a.run('CALIB = __canonical');a.state.settings.enginePath=build;
      const f=fixture(color),S=loadGame(a,mutation==='mixed-builds'?'1. e4 e5':'[SetUp "1"]\n[FEN "'+f.fen+'"]\n\n'+(color==='w'?'1. ':'1... ')+f.offer.san);
      for(let i=0;i<=S.total;i++)S.bests[i]={score:{cp:0},playedScore:{cp:0},bestmove:i<S.total?S.positions[i+1].lan:null,lines:[],calibration:tag(calibration,build)};
      const saved={pgn:S.pgn,bests:structuredClone(S.bests),evals:structuredClone(S.evals),settingsKey:a.call('analysisSettingsKey'),engineBuild:build};
      const root=saved.bests[0];let expected=mutation==='valid'||(mutation==='wrong-nodes'&&build==='nnue');
      switch(mutation){
        case 'stale-version':root.calibration.version='old';break;
        case 'unknown-root-build':root.calibration.build='unknown';break;
        case 'unknown-envelope-build':saved.engineBuild='unknown';break;
        case 'wrong-nodes':root.calibration.nodes=80000;break;
        case 'missing-pair':delete root.playedScore;break;
        case 'scalar-nan':root.playedScore={cp:NaN};break;
        case 'mate-zero':root.playedScore={mate:0};break;
        case 'mate-fraction':root.playedScore={mate:1.5};break;
        case 'mixed-builds':saved.bests[1].calibration=tag(calibration,build==='nnue'?'sf19lite':'nnue');break;
      }
      const admitted=a.call('canRestoreAnalysis',saved);rows.push({color,build,mutation,expected,admitted,passed:admitted===expected});
    }finally{for(const close of cleanup)close();}
  }
  return rows;
}
