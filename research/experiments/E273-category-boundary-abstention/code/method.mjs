import {sf19MoveQuality} from '../../../../lib/public-scoring.js';
import {wilson} from '../../E009-search-stability/code/method.mjs';
export const SPEC=Object.freeze({boundaries:[.02,.05,.10,.20],labels:['excellent','good','inacc','mistake','blunder'],
  radius:.01,numericTolerance:1e-12,abstentionCost:.1,minimumGain:.02,minimumCoverage:.8,
  subgroupMinimum:10,subgroupCoverage:.6,subgroupRiskIncrease:.05,bootstrapIterations:20000,seed:20261015});
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
export function band(loss){if(!Number.isFinite(loss)||loss<0||loss>1)throw Error('Invalid expected-point loss');return SPEC.labels[SPEC.boundaries.filter(t=>loss>=t).length];}
export function select(lowLoss){band(lowLoss);return SPEC.boundaries.some(t=>Math.abs(lowLoss-t)<=SPEC.radius+SPEC.numericTolerance)?null:band(lowLoss);}
export function scoreLoss(obs){
  if(typeof obs.top!=='boolean')throw Error('Missing top status');
  for(const s of [obs.root,obs.played])if(s?.mate!=null?(!Number.isInteger(s.mate)||s.mate===0||Object.hasOwn(s,'cp')):!Number.isFinite(s?.cp))throw Error('Invalid frozen score');
  return sf19MoveQuality(obs.root,obs.played,{top:obs.top}).loss;
}
export function bootstrap(values,iterations=SPEC.bootstrapIterations,seed=SPEC.seed){
  if(!values.length||values.some(x=>!Number.isFinite(x))||!Number.isInteger(iterations)||iterations<1)throw Error('Invalid bootstrap');
  let state=seed>>>0;const samples=[];
  for(let b=0;b<iterations;b++){let sum=0;for(let i=0;i<values.length;i++){state=(Math.imul(state,1664525)+1013904223)>>>0;sum+=values[Math.floor(state/4294967296*values.length)];}samples.push(sum/values.length);}
  samples.sort((a,b)=>a-b);return {estimate:mean(values),lower:samples[Math.floor(.025*(iterations-1))],upper:samples[Math.floor(.975*(iterations-1))],
    level:.95,iterations,seed,unit:'one focal choice per player-disjoint game',method:'paired percentile bootstrap; exposed development operational policy'};
}
export function summarize(records){
  if(!records.length)throw Error('Empty panel');
  const emitted=records.filter(r=>r.emitted),withheld=records.filter(r=>!r.emitted),n=records.length;
  const baselineWrong=records.filter(r=>r.disagrees).length,emittedWrong=emitted.filter(r=>r.disagrees).length,withheldWrong=withheld.filter(r=>r.disagrees).length;
  const baselineRisk=baselineWrong/n,candidateRisk=emitted.length?emittedWrong/emitted.length:null;
  const baselineLoss=baselineRisk,candidateLoss=(emittedWrong+SPEC.abstentionCost*withheld.length)/n;
  return {games:n,emitted:emitted.length,withheld:withheld.length,coverage:emitted.length/n,
    baselineDisagreements:baselineWrong,retainedDisagreements:emittedWrong,withheldDisagreements:withheldWrong,withheldStable:withheld.length-withheldWrong,
    baselineRisk,candidateRisk,riskReduction:candidateRisk===null?null:baselineRisk-candidateRisk,
    baselinePolicyLoss:baselineLoss,candidatePolicyLoss:candidateLoss,policyGain:baselineLoss-candidateLoss,
    retainedAgreementInterval:emitted.length?wilson(emitted.length-emittedWrong,emitted.length):null,
    breakEvenAbstentionCost:withheld.length?withheldWrong/withheld.length:null};
}
export function evaluate(input){
  if(!Array.isArray(input)||!input.length||new Set(input.map(r=>r.gameId)).size!==input.length)throw Error('Missing or duplicate games');
  const records=input.map(r=>{
    if(!['train','validation'].includes(r.split))throw Error('Reserved/unknown role');
    const low=scoreLoss(r.low),high=scoreLoss(r.high),baseline=band(low),reference=band(high),candidate=select(low);
    return {gameId:r.gameId,split:r.split,ply:r.ply,lowLoss:low,highLoss:high,baseline,reference,candidate,emitted:candidate!==null,
      disagrees:baseline!==reference,drift:Math.abs(low-high),topChanged:r.low.top!==r.high.top,
      mateInfluenced:[r.low.root,r.low.played,r.high.root,r.high.played].some(s=>s.mate!=null)};
  });
  const summary=summarize(records),deltas=records.map(r=>Number(r.disagrees)-(r.emitted?Number(r.disagrees):SPEC.abstentionCost)),interval=bootstrap(deltas);
  const names=['role/train','role/validation',...SPEC.labels.map(b=>'band/'+b)];
  const groups=names.map(name=>{const [kind,label]=name.split('/'),rs=records.filter(r=>kind==='role'?r.split===label:r.baseline===label);
    if(!rs.length)return {name,games:0,sparse:true,summary:null,passed:null};const s=summarize(rs),sparse=rs.length<SPEC.subgroupMinimum;
    return {name,games:rs.length,sparse,summary:s,passed:sparse?null:s.coverage>=SPEC.subgroupCoverage&&s.candidateRisk!==null&&s.candidateRisk<=s.baselineRisk+SPEC.subgroupRiskIncrease};});
  const matrix=Object.fromEntries(SPEC.labels.map(a=>[a,Object.fromEntries(SPEC.labels.map(b=>[b,records.filter(r=>r.baseline===a&&r.reference===b).length]))]));
  const gates={practical:summary.policyGain>=SPEC.minimumGain,interval:interval.lower>0,coverage:summary.coverage>=SPEC.minimumCoverage,
    subgroups:groups.filter(g=>!g.sparse).every(g=>g.passed)};
  const result={schema:'E273-policy-result-v1',spec:SPEC,role:'exposed 45-game development comparison against higher-budget ordinary consequence bands; no human ground truth',
    summary,interval,groups,confusionMatrix:matrix,
    diagnostics:{driftWithinRadius:records.filter(r=>r.drift<=SPEC.radius).length,maximumDrift:Math.max(...records.map(r=>r.drift)),
      topStatusChanges:records.filter(r=>r.topChanged).length,mateInfluenced:records.filter(r=>r.mateInfluenced).length,
      sparseGroups:groups.filter(g=>g.sparse).map(g=>g.name),
      interpretation:'Radius is a fixed tolerance, not calibrated confidence; higher budget can also be wrong.'},
    gates,passed:Object.values(gates).every(Boolean),modelFits:0,engineSearches:0,humanLabels:0,confirmation:false,promoted:false};
  return {result,records};
}
