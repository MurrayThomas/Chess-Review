import assert from 'node:assert/strict';
import {expectedPoints,SF19_OUTCOME} from '../../../../lib/public-scoring.js';
export const SPEC=Object.freeze({epsilon:.0005,penalty:.001,maxIterations:200,gradientTolerance:1e-9,
  aBounds:[0,20],bBounds:[-20,20],cpIterations:100,cpWidth:1e-12,folds:5,foldSeed:'E275-fold-v1:',
  iterations:20000,primarySeeds:[20261021,20261022,20261023],crossFitSeeds:[20261031,20261032,20261033],
  controls:['cpDraw','temperature','constant'],minimumGain:.01,meanPointTolerance:.002,stabilityTolerance:.01});
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
export function cpMean(score){return expectedPoints(score,SF19_OUTCOME);}
export function rawProbability(score){
  if(score?.mate!=null){assert.ok(Number.isInteger(score.mate)&&score.mate!==0);return score.mate>0?[1,0,0]:[0,0,1];}
  assert.ok(Number.isFinite(score?.cp));assert.ok(Array.isArray(score.wdl)&&score.wdl.length===3&&score.wdl.every(x=>Number.isInteger(x)&&x>=0));
  assert.equal(score.wdl.reduce((a,b)=>a+b,0),1000);
  const p=score.wdl.map(x=>Math.max(SPEC.epsilon,x/1000)),sum=p.reduce((a,b)=>a+b,0);return p.map(x=>x/sum);
}
export function softmax(logits){const m=Math.max(...logits),p=logits.map(x=>Math.exp(x-m)),s=p.reduce((a,b)=>a+b,0);return p.map(x=>x/s);}
export function predict(score,model){
  if(score?.mate!=null)return rawProbability(score);
  if(model.kind==='constant')return [...model.probabilities];
  if(model.kind==='cpDraw'){const q=clamp(cpMean(score),SPEC.epsilon,1-SPEC.epsilon),m=Math.min(q,1-q),r=model.r;assert.ok(r>=SPEC.epsilon&&r<=1-SPEC.epsilon);return [q-m*r,2*m*r,1-q-m*r];}
  const p=rawProbability(score);if(model.kind==='raw')return p;
  assert.ok(['candidate','temperature'].includes(model.kind));assert.ok(model.a>=0&&model.a<=20&&model.b>=-20&&model.b<=20);
  return softmax(p.map((x,j)=>model.a*Math.log(x)+(j===1?model.b:0)));
}
function training(rows){
  assert.ok(rows.length&&rows.every(r=>r.split==='train'&&[0,1,2].includes(r.target)&&Number.isFinite(r.weight)&&r.weight>0&&!r.score.mate));
  const byGame=new Map();for(const r of rows)byGame.set(r.gameId,(byGame.get(r.gameId)||0)+r.weight);
  for(const w of byGame.values())assert.ok(Math.abs(w-1)<1e-10);
  const games=byGame.size;return {games,rows:rows.map(r=>({x:rawProbability(r.score).map(Math.log),target:r.target,w:r.weight/games,
    q:clamp(cpMean(r.score),SPEC.epsilon,1-SPEC.epsilon)}))};
}
export function objective(data,a,b,draw=true){
  let nll=0,ga=0,gb=0,haa=0,hab=0,hbb=0;
  for(const r of data.rows){const logits=r.x.map((x,j)=>a*x+(j===1?b:0)),p=softmax(logits),maximum=Math.max(...logits),logZ=maximum+Math.log(logits.reduce((n,l)=>n+Math.exp(l-maximum),0));
    nll+=r.w*(logZ-logits[r.target]);const ex=p.reduce((n,v,j)=>n+v*r.x[j],0),varX=p.reduce((n,v,j)=>n+v*(r.x[j]-ex)**2,0);
    ga+=r.w*(ex-r.x[r.target]);gb+=r.w*(p[1]-Number(r.target===1));haa+=r.w*varX;hab+=r.w*p[1]*(r.x[1]-ex);hbb+=r.w*p[1]*(1-p[1]);}
  const penalty=SPEC.penalty*((a-1)**2+(draw?b*b:0))/2;
  return {value:nll+penalty,nll,penalty,gradient:[ga+SPEC.penalty*(a-1),draw?gb+SPEC.penalty*b:0],hessian:[haa+SPEC.penalty,draw?hab:0,draw?hbb+SPEC.penalty:1]};
}
const projected=(a,b,g,draw)=>Math.max(Math.abs(a-clamp(a-g[0],0,20)),draw?Math.abs(b-clamp(b-g[1],-20,20)):0);
export function fitLog(rows,draw=true){
  const data=training(rows);let a=1,b=0,iterations=0,s;
  for(;iterations<=SPEC.maxIterations;iterations++){
    s=objective(data,a,b,draw);const pg=projected(a,b,s.gradient,draw);
    if(pg<=SPEC.gradientTolerance)return {kind:draw?'candidate':'temperature',a,b,diagnostics:{converged:true,iterations,projectedGradient:pg,
      objective:s.value,nll:s.nll,penalty:s.penalty,trainingGames:data.games,boundary:a===0||a===20||(draw&&(b===-20||b===20))}};
    if(iterations===SPEC.maxIterations)break;
    const [haa,hab,hbb]=s.hessian,det=haa*hbb-hab*hab;assert.ok(det>0);
    const [ga,gb]=s.gradient,direction=draw?[(hbb*ga-hab*gb)/det,(haa*gb-hab*ga)/det]:[ga/haa,0];
    let accepted=false;
    for(const d of [direction,[ga/haa,draw?gb/hbb:0]]){
      for(let step=1;step>=2**-40;step/=2){const nextA=clamp(a-step*d[0],0,20),nextB=draw?clamp(b-step*d[1],-20,20):0;
        const slope=ga*(nextA-a)+gb*(nextB-b);if(slope>=0)continue;
        const next=objective(data,nextA,nextB,draw);
        if(next.value<=s.value+1e-4*slope+1e-14){a=nextA;b=nextB;accepted=true;break;}}
      if(accepted)break;
    }
    if(!accepted)throw Error('Bounded Newton line search failed');
  }
  throw Error('Unconverged log-WDL fit: '+JSON.stringify({a,b,iterations,gradient:s.gradient}));
}
export function cpObjective(data,r){
  let value=0,gradient=0;
  for(const row of data.rows){const q=row.q,m=Math.min(q,1-q),base=row.target===0?q:1-q;
    const p=row.target===1?2*m*r:base-m*r;
    value-=row.w*Math.log(p);gradient+=row.w*(row.target===1?-1/r:m/p);}
  return {value,gradient};
}
export function fitCpDraw(rows){
  const data=training(rows);let lo=SPEC.epsilon,hi=1-SPEC.epsilon,r,boundary=null,iterations=0;
  if(cpObjective(data,lo).gradient>=0){r=lo;boundary='lower';}
  else if(cpObjective(data,hi).gradient<=0){r=hi;boundary='upper';}
  else{for(;iterations<SPEC.cpIterations&&hi-lo>SPEC.cpWidth;iterations++){const m=(lo+hi)/2;if(cpObjective(data,m).gradient>0)hi=m;else lo=m;}r=(lo+hi)/2;}
  const s=cpObjective(data,r),pg=Math.abs(r-clamp(r-s.gradient,SPEC.epsilon,1-SPEC.epsilon));
  assert.ok(boundary||hi-lo<=SPEC.cpWidth);return {kind:'cpDraw',r,diagnostics:{converged:true,boundary,iterations,projectedGradient:pg,objective:s.value,trainingGames:data.games}};
}
export function fitConstant(rows){
  const data=training(rows),counts=[0,0,0];for(const r of rows)counts[r.target]+=r.weight;
  return {kind:'constant',probabilities:counts.map(n=>(n+.5)/(data.games+1.5)),diagnostics:{trainingGames:data.games,weightedCounts:counts,smoothing:.5}};
}
export function fitRecipes(rows){return {candidate:fitLog(rows,true),temperature:fitLog(rows,false),cpDraw:fitCpDraw(rows),constant:fitConstant(rows)};}
export function trainingData(rows){return training(rows);}
