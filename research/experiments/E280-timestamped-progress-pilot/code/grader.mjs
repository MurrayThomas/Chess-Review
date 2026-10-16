import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {app,loadGame,branch} from '../../../../tests/helpers/app.mjs';
import {install} from '../../E277-brilliant-evidence-admission/code/candidate.mjs';
export function graders(c,build,children,seed,calibration){
  const contexts=[],cleanup=[];
  const snapshot=S=>JSON.stringify({bests:S.bests,evals:S.evals,classif:S.classif,grades:S.moveGrades,acc:S.acc,accElo:S.accElo});
  for(const arm of ['B','BC','PC'])for(const [name,uci] of [['reported',c.uci],['alternative',c.id==='A'?'d7d6':'d7e6']]){
    const a=app({after:f=>cleanup.push(f)});a.context.__canonical=calibration;a.run('CALIB = __canonical');
    const initial=c.visiblePrior||c.before,moves=c.visiblePrior?'13. h3 Qg3':'19... Ke8';const S=loadGame(a,'[SetUp "1"]\n[FEN "'+initial+'"]\n\n'+moves),rootIdx=S.total-1;
    S.settings.enginePath=build;S.bests[rootIdx]={...seed.root,playedScore:seed.played.score,calibration:{build}};
    S.evals[rootIdx]=a.call('whiteRel',seed.root.score,c.before);S.evals[rootIdx+1]=a.call('whiteRel',children.reported.score,c.after);S.bests[rootIdx+1]=children.reported;
    a.call('computeDerived');const immutable=snapshot(S),v=branch(a,rootIdx),board=new Chess(c.before),move=board.move({from:uci.slice(0,2),to:uci.slice(2,4)});
    v.positions[1]={...move,fen:move.after,eval:a.call('whiteRel',children[name].score,move.after),best:children[name]};v.idx=1;
    install(a,arm==='B'?'B':'C');contexts.push({arm,name,a,S,v,immutable});
  }
  return {evaluate(arm,root){return contexts.filter(c=>c.arm===arm).map(ctx=>{
    const startedPerf=performance.now();ctx.v.positions[0].best=structuredClone(root);ctx.v.positions[0].eval=ctx.a.call('whiteRel',root.score,c.before);ctx.a.call('classifyVariationMoves');
    assert.equal(snapshot(ctx.S),ctx.immutable,'Grade callback mutated completed mainline');
    return {move:ctx.name,category:ctx.v.positions[1].classif,grade:ctx.v.positions[1].moveGrade,startedPerf,finishedPerf:performance.now(),mainlinePreserved:true};
  });},close(){for(const close of cleanup)close();}};
}
