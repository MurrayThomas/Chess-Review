import assert from 'node:assert/strict';
import {Chess} from '../../../../lib/chess.js';
import {app,loadGame,branch} from '../../../../tests/helpers/app.mjs';
import {fixture,stateFor,tag} from '../../E277-brilliant-evidence-admission/code/spec.mjs';
import {install} from '../../E277-brilliant-evidence-admission/code/candidate.mjs';
const pack=S=>JSON.stringify({positions:S.positions,evals:S.evals,bests:S.bests,classif:S.classif,grades:S.moveGrades,acc:S.acc,accElo:S.accElo,calibrated:S.calibrated});
const numeric=S=>JSON.stringify({evals:S.evals,bests:S.bests,acc:S.acc,accElo:S.accElo,calibrated:S.calibrated});
export function runRow(scenario,color,build,path,arm,calibration,rootOverride=null){
  const cleanup=[],a=app({after:f=>cleanup.push(f)});
  try{
    a.context.__canonical=calibration;a.run('CALIB = __canonical');
    const setup=stateFor(scenario,color,build,calibration),f=setup.fixture,paired=setup.paired;
    const mainUci=path==='variation'&&!paired?f.safe:f.offer.lan;
    const mainBoard=new Chess(f.fen),main=mainBoard.move({from:mainUci.slice(0,2),to:mainUci.slice(2,4)});
    const S=loadGame(a,'[SetUp "1"]\n[FEN "'+f.fen+'"]\n\n'+(color==='w'?'1. ':'1... ')+main.san);
    S.settings.enginePath=build;
    const root=structuredClone(rootOverride||setup.root);
    S.evals[0]={cp:0};S.evals[1]={cp:setup.afterMoverCp*(color==='w'?1:-1)};
    S.bests[1]={score:{cp:-setup.afterMoverCp},bestmove:null,lines:[{multipv:1,depth:16,bound:'exact',score:{cp:-setup.afterMoverCp},pv:''}]};
    if(path==='raw')S.bests[0]=root;
    else S.bests[0]={bestmove:mainUci,score:{cp:path==='overlay'?0:0},playedScore:{cp:path==='overlay'?-600:0},calibration:tag(calibration,build),lines:[]};
    let childPreview=null;
    if(path==='overlay'){
      const reply=new Chess(f.offer.after).moves({verbose:true})[0];
      childPreview={score:{cp:-setup.afterMoverCp},bestmove:reply.lan,pv:reply.lan,lines:[{multipv:1,depth:16,bound:'exact',score:{cp:-setup.afterMoverCp},pv:reply.lan}]};
      S.bests[0].bestmove=f.safe;S.evals[1]={cp:-600*(color==='w'?1:-1)};
      S.bests[1]={score:{cp:600},bestmove:reply.lan,pv:reply.lan,lines:[{multipv:1,depth:16,bound:'exact',score:{cp:600},pv:reply.lan}]};
      assert.equal(a.call('whiteRel',S.bests[1].score,f.offer.after).cp,S.evals[1].cp);
      assert.equal(a.call('whiteRel',childPreview.score,f.offer.after).cp,setup.afterMoverCp*(color==='w'?1:-1));
    }
    a.call('computeDerived');const before=pack(S),beforeNumeric=numeric(S),events=install(a,arm);
    let category,grade,evidence;
    if(path==='variation'){
      const v=branch(a,0);v.positions[0].best=root;v.positions[0].eval={cp:0};
      v.positions[1]={...f.offer,fen:f.offer.after,eval:{cp:setup.afterMoverCp*(color==='w'?1:-1)},best:S.bests[1]};v.idx=1;
      a.call('classifyVariationMoves');category=v.positions[1].classif;grade=v.positions[1].moveGrade;
      evidence=null;assert.equal(pack(S),before,'variation mutated mainline');
    }else{
      if(path==='overlay'){S.searchPreviews[0]=root;S.searchPreviews[1]=childPreview;}
      a.call('computeDerived');category=S.classif[1];grade=S.moveGrades[1];evidence=S.annotationEvidence[1];
      assert.equal(numeric(S),beforeNumeric,'annotation changed completed numerical/search evidence');
    }
    return {category,grade,evidenceRole:path==='variation'?'variation-state-not-exported':evidence?.paired?'paired':evidence?'unpaired':'none',rejections:events,
      mainlinePreserved:path==='variation',numericalPreserved:path!=='variation',numericSnapshot:numeric(S),
      ...(path==='overlay'?{overlayEvidence:{childPreview,completedChild:S.bests[1],completedWhiteEval:S.evals[1],afterFen:f.offer.after,declaredMoverCp:setup.afterMoverCp}}:{})};
  }finally{for(const close of cleanup)close();}
}
export function evaluate(rows){
  const totals={rows:rows.length,positive:0,invalidUsed:0,negative:0,baselineInvalidBrilliant:0,candidateInvalidAdmitted:0,candidatePositiveLost:0,candidateNegativeChanged:0,bluntPositiveLost:0,unchangedNumerics:true};
  for(const row of rows){const {B,C,U}=row.arms;
    assert.equal(B.numericSnapshot,C.numericSnapshot);assert.equal(B.numericSnapshot,U.numericSnapshot);
    if(row.expectation==='retain'){totals.positive++;if(C.category!=='brilliant'||B.category!=='brilliant')totals.candidatePositiveLost++;if(U.category!=='brilliant')totals.bluntPositiveLost++;}
    else if(row.expectation==='withhold'){totals.invalidUsed++;if(B.category==='brilliant')totals.baselineInvalidBrilliant++;if(C.category!==null)totals.candidateInvalidAdmitted++;}
    else{totals.negative++;if(C.category!==B.category||C.grade!==B.grade||C.category==='brilliant')totals.candidateNegativeChanged++;}
  }
  return {totals,passed:totals.candidatePositiveLost===0&&totals.candidateInvalidAdmitted===0&&totals.candidateNegativeChanged===0};
}
