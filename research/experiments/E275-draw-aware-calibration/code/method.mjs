import assert from 'node:assert/strict';
import {sha256} from '../../../data-policy.mjs';
import {SPEC,predict,cpMean,fitRecipes} from './model.mjs';
export const NAMES=['candidate','cpDraw','temperature','constant','raw'];
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const order=([a],[b])=>a<b?-1:a>b?1:0;
export function fitModels(input){
  const train=input.outcomes.filter(r=>r.split==='train');assert.equal(new Set(train.map(r=>r.gameId)).size,450);
  function fit(rows){const ids=[...new Set(rows.map(r=>r.gameId))].sort();return {trainingGames:ids.length,trainingGameHash:sha256(ids.join('\n')),models:fitRecipes(rows)};}
  const final=fit(train),folds=Array.from({length:5},(_,fold)=>({fold,...fit(train.filter(r=>input.folds[r.gameId]!==fold))}));
  assert.ok(folds.every(f=>f.trainingGames===360));return {schema:'E275-models-v1',spec:SPEC,final,folds,numericalFits:18,constantControls:6};
}
export function probabilityMetrics(p,target){
  assert.ok(p.length===3&&p.every(x=>Number.isFinite(x)&&x>0&&x<=1)&&Math.abs(p.reduce((a,b)=>a+b,0)-1)<1e-10);
  const points=[1,.5,0][target],m=p[0]+p[1]/2,q=Math.max(1e-12,Math.min(1-1e-12,m));
  return {nll:-Math.log(p[target]),brier:p.reduce((s,x,j)=>s+(x-Number(j===target))**2,0),meanMse:(m-points)**2,pointNll:-points*Math.log(q)-(1-points)*Math.log1p(-q)};
}
export function gameMetrics(records,name){
  const groups=new Map();for(const r of records){const m=probabilityMetrics(r.probabilities[name],r.target);if(!groups.has(r.gameId))groups.set(r.gameId,[]);groups.get(r.gameId).push(m);}
  return [...groups.entries()].sort(order).map(([gameId,rs])=>({gameId,...Object.fromEntries(['nll','brier','meanMse','pointNll'].map(k=>[k,mean(rs.map(r=>r[k]))]))}));
}
export function metrics(records,name){
  if(!records.length)return null;const games=gameMetrics(records,name);
  return {games:games.length,observations:records.length,...Object.fromEntries(['nll','brier','meanMse','pointNll'].map(k=>[k,mean(games.map(g=>g[k]))]))};
}
function originalPointMetrics(records){
  const groups=new Map();for(const r of records){if(!groups.has(r.gameId))groups.set(r.gameId,[]);const p=[1,.5,0][r.target],q=Math.max(1e-12,Math.min(1-1e-12,r.currentMean));groups.get(r.gameId).push({meanMse:(r.currentMean-p)**2,pointNll:-p*Math.log(q)-(1-p)*Math.log1p(-q)});}
  return {games:groups.size,meanMse:mean([...groups.values()].map(rs=>mean(rs.map(r=>r.meanMse)))),pointNll:mean([...groups.values()].map(rs=>mean(rs.map(r=>r.pointNll))))};
}
export function paired(records,control){const a=gameMetrics(records,control),b=gameMetrics(records,'candidate');assert.deepEqual(a.map(r=>r.gameId),b.map(r=>r.gameId));return a.map((r,i)=>r.nll-b[i].nll);}
export function bootstrap(values,seed,primary=true,iterations=SPEC.iterations){
  assert.ok(values.length&&values.every(Number.isFinite));let state=seed>>>0;const samples=[];
  for(let i=0;i<iterations;i++){let sum=0;for(let j=0;j<values.length;j++){state=(Math.imul(state,1664525)+1013904223)>>>0;sum+=values[Math.floor(state/4294967296*values.length)];}samples.push(sum/values.length);}
  samples.sort((a,b)=>a-b);const tail=primary ? .05/(2*3) : .025;
  return {estimate:mean(values),lower:samples[Math.floor(tail*(iterations-1))],upper:samples[Math.floor((1-tail)*(iterations-1))],level:1-2*tail,seed,iterations,
    unit:'game',method:primary?'paired percentile; Bonferroni three fixed comparisons; conditional exposed development':'descriptive paired cross-fit percentile; overlapping fits not independent confirmation'};
}
export function labels(r){return ['ply:'+(r.ply<=20?'<=20':r.ply<=50?'21-50':'>50'),'cpMean:'+(r.currentMean<.1?'<.1':r.currentMean>.9?'>.9':'.1-.9')];}
export function groupComparison(rs,label){
  if(!rs.length)return {label,games:0,sparse:true,candidate:null,control:null,passed:null};
  const candidate=metrics(rs,'candidate'),control=metrics(rs,'cpDraw'),sparse=candidate.games<30;
  return {label,games:candidate.games,sparse,candidate,control,passed:sparse?null:candidate.nll-control.nll<=.03+1e-12&&candidate.brier-control.brier<=.01+1e-12};
}
function diagnostics(records,name){
  const games=new Map();for(const r of records)games.set(r.gameId,(games.get(r.gameId)||0)+1);
  const total=games.size,classMeans=[0,0,0],observed=[0,0,0],counts=[0,0,0],sets=[new Set(),new Set(),new Set()],bins=Array.from({length:3},()=>Array.from({length:5},()=>({mass:0,predicted:0,observed:0,games:new Set()})));
  for(const r of records){const weight=1/games.get(r.gameId)/total;counts[r.target]++;sets[r.target].add(r.gameId);
    for(let j=0;j<3;j++){const p=r.probabilities[name][j],y=Number(r.target===j),b=bins[j][Math.min(4,Math.floor(p*5))];classMeans[j]+=weight*p;observed[j]+=weight*y;b.mass+=weight;b.predicted+=weight*p;b.observed+=weight*y;b.games.add(r.gameId);}}
  return {classRootCounts:counts,gamesWithClass:sets.map(s=>s.size),meanPredicted:classMeans,observed,
    classwiseBins:bins.map(rows=>rows.map((r,i)=>({bin:i,weight:r.mass,meanPredicted:r.mass?r.predicted/r.mass:null,observed:r.mass?r.observed/r.mass:null,games:r.games.size}))),
    classwiseEce:bins.map(rows=>rows.reduce((s,r)=>s+Math.abs(r.predicted-r.observed),0)),interpretation:'Descriptive fixed bins; class game counts overlap for decisive games with both movers; not a calibration guarantee.'};
}
export function evaluate(input,models){
  assert.deepEqual(models.spec,SPEC);const records=input.outcomes.map(r=>{
    const fitted=r.split==='train'?models.folds[input.folds[r.gameId]].models:models.final.models;
    assert.ok(['train','validation'].includes(r.split));return {gameId:r.gameId,split:r.split,ply:r.ply,target:r.target,weight:r.weight,currentMean:cpMean(r.score),
      probabilities:Object.fromEntries(NAMES.map(name=>[name,predict(r.score,name==='raw'?{kind:'raw'}:fitted[name])]))};
  });
  const roles={};
  for(const [role,split,seeds,primary] of [['validation','validation',SPEC.primarySeeds,true],['crossFit','train',SPEC.crossFitSeeds,false]]){
    const rs=records.filter(r=>r.split===split),ms=Object.fromEntries(NAMES.map(n=>[n,metrics(rs,n)])),comparisons={};
    for(const [j,name] of SPEC.controls.entries()){const interval=bootstrap(paired(rs,name),seeds[j],primary),gates={practical:primary?interval.estimate>=SPEC.minimumGain:interval.estimate>=0,
      interval:primary?interval.lower>0:true,brier:ms.candidate.brier<=ms[name].brier+1e-12};comparisons[name]={interval,gates,passed:Object.values(gates).every(Boolean)};}
    roles[role]={metrics:ms,originalCp:originalPointMetrics(rs),comparisons,calibration:Object.fromEntries(NAMES.map(n=>[n,diagnostics(rs,n)]))};
  }
  const validation=records.filter(r=>r.split==='validation'),groupNames=[...new Set(validation.flatMap(labels))].sort();
  const groups=groupNames.map(label=>groupComparison(validation.filter(r=>labels(r).includes(label)),label));
  const stabilityRecords=input.stability.map(r=>{const low={},high={},tv={},pointDrift={};
    for(const name of NAMES){const model=name==='raw'?{kind:'raw'}:models.final.models[name];low[name]=predict(r.low,model);high[name]=predict(r.high,model);
      tv[name]=low[name].reduce((s,p,j)=>s+Math.abs(p-high[name][j]),0)/2;pointDrift[name]=Math.abs(low[name][0]+low[name][1]/2-high[name][0]-high[name][1]/2);}
    return {gameId:r.gameId,split:r.split,ply:r.ply,low,high,tv,pointDrift,mateInfluenced:r.low.mate!=null||r.high.mate!=null};});
  const stability={games:stabilityRecords.length,matePairs:stabilityRecords.filter(r=>r.mateInfluenced).length,meanTv:Object.fromEntries(NAMES.map(n=>[n,mean(stabilityRecords.map(r=>r.tv[n]))])),
    meanPointDrift:Object.fromEntries(NAMES.map(n=>[n,mean(stabilityRecords.map(r=>r.pointDrift[n]))])),maxTv:Object.fromEntries(NAMES.map(n=>[n,Math.max(...stabilityRecords.map(r=>r.tv[n]))]))};
  const sets=[models.final,...models.folds];
  const gates={primaryComparisons:Object.values(roles.validation.comparisons).every(r=>r.passed),crossFit:Object.values(roles.crossFit.comparisons).every(r=>r.passed),
    meanPoint:roles.validation.metrics.candidate.meanMse<=roles.validation.originalCp.meanMse+SPEC.meanPointTolerance+1e-12,
    subgroups:groups.every(g=>g.passed!==false),stability:stability.meanTv.candidate<=stability.meanTv.temperature+SPEC.stabilityTolerance+1e-12,
    coverage:records.length===input.outcomes.length&&roles.validation.metrics.candidate.games===150&&roles.crossFit.metrics.candidate.games===450&&stability.games===45,
    interior:sets.every(s=>!s.models.candidate.diagnostics.boundary),convergence:sets.every(s=>['candidate','temperature','cpDraw'].every(n=>s.models[n].diagnostics.converged))};
  return {result:{schema:'E275-human-wdl-result-v1',spec:SPEC,roles,groups,stability,gates,passed:Object.values(gates).every(Boolean),sparseGroups:groups.filter(g=>g.sparse).map(g=>g.label),
    rawDiagnostics:input.diagnostics,excludedRoots:input.exclusions.length,modelFits:18,confirmation:false,promoted:false,
    interpretation:'Exposed development full human outcome forecast; no displayed accuracy, move-label, rating or counterfactual validation.'},records:{outcomes:records,stability:stabilityRecords}};
}
