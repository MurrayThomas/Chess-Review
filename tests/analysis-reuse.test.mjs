import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,fakeEngine} from './helpers/app.mjs';

function review(t){const a=app(t),S=loadGame(a,'1. e4 e5 2. Nf3 Nc6 3. Bb5 a6');a.call('computeDerived');a.call('buildUI');a.replace('renderEngineCurrent',()=>{});a.replace('saveToLibrary',()=>{});return a;}
function sf19(a){const S=a.state,c=a.context.__publicCalibration;Object.assign(S.settings,{enginePath:'sf19lite',engineDepth:16,engineHash:16,engineSkill:20,classifyLines:1});S.activeEngineBuild='sf19lite';
  S.bests=S.positions.map((p,i)=>{const bestmove=S.positions[i+1]?S.positions[i+1].from+S.positions[i+1].to:'a1a1';return {bestmove,score:{cp:20,wdl:[400,400,200]},playedScore:{cp:10,wdl:[350,400,250]},lines:[],
    calibration:{version:c.version,build:'sf19lite',nodes:20000,contextVersion:c.context.sf19.candidateVersion},
    ratingEvidence:{candidateVersion:c.movesOnly.sf19.candidateVersion,bestmove,best:{cp:20,wdl:[400,400,200]},played:{cp:10,wdl:[350,400,250]}}};});a.call('computeDerived');
  return {pgn:S.pgn,settingsKey:a.call('analysisSettingsKey'),engineBuild:'sf19lite',bests:structuredClone(S.bests),evals:structuredClone(S.evals)};
}
test('completed worker-count changes keep all evidence and active engines intact',async t=>{
  const a=review(t),S=a.state;let scheduled=0,resets=0;a.replace('scheduleReanalyze',()=>scheduled++);a.replace('resetLiveEngine',()=>resets++);
  const roots=S.bests;S.activeEngineBuild='nnue';await a.call('setEngineSetting','engineWorkers',2);
  assert.equal(scheduled,0);assert.equal(resets,0);assert.equal(S.bests,roots);assert.equal(S.activeEngineBuild,'nnue');
  S.analyzing=true;let preserve;a.replace('scheduleReanalyze',value=>{preserve=value;});await a.call('setEngineSetting','engineWorkers',3);assert.equal(preserve,true);
});
test('worker-pool resizing preserves completed roots and only searches unfinished positions',async t=>{
  const a=review(t),S=a.state;S.settings.engineWorkers=1;S.activeEngineBuild='nnue';S.analyzedSettingsKey=a.call('analysisSettingsKey');
  const completed=S.bests[0];S.bests.fill(null,1);S.evals.fill(null,1);const searched=[];
  for(const name of ['renderReview','renderStats','renderGraph','renderMoves','renderControls','paintBoard','renderEvalBar','renderBestArrow'])a.replace(name,()=>{});
  a.replace('analyseCalibratedPosition',async(engine,request)=>{searched.push(request.fen);return {score:{cp:0},lines:[],bestmove:'a1a1'};});
  a.replace('createEngine',async()=>({...fakeEngine(),buildKey:'nnue'}));await a.call('startAnalysis',{preserveCompleted:true});
  assert.equal(S.bests[0],completed);assert.equal(searched.length,S.total);assert.equal(S.completed,S.total);
});
test('compatible SF19 settings and rating-mode changes reuse complete scoring evidence',async t=>{
  const a=review(t),S=a.state,saved=sf19(a);let scheduled=0;a.replace('scheduleReanalyze',()=>scheduled++);
  const evidence=JSON.stringify(S.bests),accuracy=JSON.stringify(S.acc);
  for(const [key,value]of [['engineHash',64],['engineDepth',8],['engineSkill',3],['classifyLines',4],['ratingMode','moves']])await a.call('setEngineSetting',key,value);
  assert.equal(scheduled,0);assert.equal(JSON.stringify(S.bests),evidence);assert.equal(JSON.stringify(S.acc),accuracy);
  assert.equal(S._panelNeedsLive,true);assert.equal(S.activeEngineBuild,'sf19lite');assert.equal(a.call('canRestoreAnalysis',saved),true);
  const full=a.call('sideAccuracies');assert.deepEqual(JSON.parse(JSON.stringify(full)),JSON.parse(accuracy));
});
test('SF19 reuse rejects incomplete, stale, fallback, wrong-history and malformed rating evidence',t=>{
  const a=review(t),S=a.state,saved=sf19(a);S.settings.engineHash=64;
  for(const mutate of [s=>s.engineBuild='nnue',s=>s.pgn='1. d4 d5',s=>s.bests[0].calibration.nodes=80000,
    s=>s.bests[0].calibration.contextVersion='old',s=>s.bests[0].ratingEvidence.candidateVersion='old',
    s=>s.bests[0].ratingEvidence.best.wdl=[1,2,3],s=>delete s.bests[1],s=>s.settingsKey=s.settingsKey.replace('public-scoring-v4','old')]){
    const wrong=structuredClone(saved);mutate(wrong);assert.equal(a.call('canRestoreAnalysis',wrong),false);
  }
  S.settings.enginePath='nnue';assert.equal(a.call('canRestoreAnalysis',saved),false);
});
test('display line changes do not restart an active game analysis',async t=>{
  const a=review(t);a.state.analyzing=true;let count=0;a.replace('scheduleReanalyze',()=>count++);await a.call('setEngineSetting','engineLines',3);assert.equal(count,0);
});
