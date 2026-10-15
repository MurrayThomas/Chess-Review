import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const close=(a,b,t=1e-9)=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=t,`${a} != ${b}`);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const qcp=s=>s.mate!=null?Number(s.mate>0):1/(1+Math.exp(-.368208*s.cp/100));
const raw=s=>{const v=s.wdl.map(x=>Math.max(.0005,x/1000)),sum=v[0]+v[1]+v[2];return v.map(x=>x/sum);};
export function targetFromResult(result,ply){assert.ok(['1-0','0-1','1/2-1/2'].includes(result)&&Number.isInteger(ply)&&ply>=1);
  if(result==='1/2-1/2')return 1;const whiteWins=result==='1-0',whiteMoves=ply%2===1;return whiteWins===whiteMoves?0:2;}
export function independentProbability(score,m){
  if(score.mate!=null){assert.ok(Number.isInteger(score.mate)&&score.mate!==0);return score.mate>0?[1,0,0]:[0,0,1];}
  if(m.kind==='constant')return [...m.probabilities];
  if(m.kind==='cpDraw'){const q=clamp(qcp(score),.0005,.9995),d=2*Math.min(q,1-q)*m.r;return [q-d/2,d,1-q-d/2];}
  const p=raw(score);if(m.kind==='raw')return p;
  if(m.kind==='temperature')assert.equal(m.b,0);
  const exponent=p.map((x,j)=>Math.exp(m.a*Math.log(x)+(j===1?m.b:0))),sum=exponent.reduce((a,b)=>a+b,0);return exponent.map(x=>x/sum);
}
export function optimality(rows,model){
  const games=new Set(rows.map(r=>r.gameId)).size;
  if(model.kind==='constant'){const counts=[0,0,0];for(const r of rows)counts[r.target]+=r.weight;
    model.probabilities.forEach((p,j)=>close(p,(counts[j]+.5)/(games+1.5)));return;}
  let nll=0,ga=0,gb=0,gr=0;
  for(const r of rows){const p=independentProbability(r.score,model),w=r.weight/games;nll-=w*Math.log(p[r.target]);
    if(model.kind==='cpDraw'){const q=clamp(qcp(r.score),.0005,.9995),m=Math.min(q,1-q);gr+=w*(r.target===1?-1/model.r:m/p[r.target]);}
    else{const x=raw(r.score).map(Math.log),ex=p.reduce((s,v,j)=>s+v*x[j],0);ga+=w*(ex-x[r.target]);gb+=w*(p[1]-Number(r.target===1));}}
  if(model.kind==='cpDraw'){assert.ok(model.r>=.0005&&model.r<=.9995);close(nll,model.diagnostics.objective);assert.ok(Math.abs(model.r-clamp(model.r-gr,.0005,.9995))<=1e-7);}
  else{ga+=.001*(model.a-1);gb+=.001*model.b;assert.ok(model.a>=0&&model.a<=20&&model.b>=-20&&model.b<=20);
    const pg=Math.max(Math.abs(model.a-clamp(model.a-ga,0,20)),model.kind==='candidate'?Math.abs(model.b-clamp(model.b-gb,-20,20)):0);
    assert.ok(pg<=1e-8,`Independent KKT ${pg}`);close(nll+.001*((model.a-1)**2+(model.kind==='candidate'?model.b**2:0))/2,model.diagnostics.objective);}
  assert.equal(model.diagnostics.trainingGames,games);assert.ok(model.diagnostics.converged);
}
function gameMetrics(rows,name){
  const sums=new Map();for(const r of rows){const p=r.probabilities[name],y=[1,.5,0][r.target],mean=p[0]+p[1]/2,q=clamp(mean,1e-12,1-1e-12),
    values=[-Math.log(p[r.target]),p.reduce((s,x,j)=>s+(x-Number(j===r.target))**2,0),(mean-y)**2,-y*Math.log(q)-(1-y)*Math.log1p(-q)];
    if(!sums.has(r.gameId))sums.set(r.gameId,{n:0,values:[0,0,0,0]});const s=sums.get(r.gameId);s.n++;values.forEach((v,j)=>s.values[j]+=v);}
  return [...sums.entries()].sort(([a],[b])=>a<b?-1:a>b?1:0).map(([gameId,s])=>({gameId,values:s.values.map(v=>v/s.n)}));
}
const average=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
function metric(rows,name){const games=gameMetrics(rows,name);return {games:games.length,observations:rows.length,...Object.fromEntries(['nll','brier','meanMse','pointNll'].map((k,j)=>[k,average(games.map(g=>g.values[j]))]))};}
function boot(values,seed,primary){const samples=[],tail=primary?1/120:.025;let state=BigInt(seed);
  for(let i=0;i<20000;i++){let s=0;for(let j=0;j<values.length;j++){state=(1664525n*state+1013904223n)%4294967296n;s+=values[Number(state*BigInt(values.length)/4294967296n)];}samples.push(s/values.length);}
  samples.sort((a,b)=>a-b);return {estimate:average(values),lower:samples[Math.floor(tail*19999)],upper:samples[Math.floor((1-tail)*19999)]};}
export function audit(input,models,result,records,sourceGames){
  const gameResults=new Map(sourceGames.map(g=>[g.id,g.result]));
  let fits=0,constant=0;
  for(const set of [models.final,...models.folds]){const rows=input.outcomes.filter(r=>r.split==='train'&&(set.fold===undefined||input.folds[r.gameId]!==set.fold)),ids=[...new Set(rows.map(r=>r.gameId))].sort();
    assert.equal(ids.length,set.trainingGames);assert.equal(createHash('sha256').update(ids.join('\n')).digest('hex'),set.trainingGameHash);
    for(const m of Object.values(set.models)){optimality(rows,m);if(m.kind==='constant')constant++;else fits++;}}
  assert.equal(fits,18);assert.equal(constant,6);assert.equal(input.outcomes.length,records.outcomes.length);
  const names=['candidate','cpDraw','temperature','constant','raw'],independent=[];
  for(let i=0;i<input.outcomes.length;i++){const r=input.outcomes[i],saved=records.outcomes[i],set=r.split==='train'?models.folds[input.folds[r.gameId]].models:models.final.models;
    assert.equal(r.target,targetFromResult(gameResults.get(r.gameId),r.ply));assert.equal(r.color,r.ply%2?'w':'b');
    assert.equal(saved.gameId,r.gameId);assert.equal(saved.ply,r.ply);assert.equal(saved.target,r.target);close(saved.currentMean,qcp(r.score));
    const probabilities={};for(const name of names){const p=independentProbability(r.score,name==='raw'?{kind:'raw'}:set[name]);p.forEach((v,j)=>close(saved.probabilities[name][j],v));probabilities[name]=p;}
    independent.push({...saved,probabilities});}
  let bootstrapReplicates=0;
  for(const [role,split,seeds,primary] of [['validation','validation',[20261021,20261022,20261023],true],['crossFit','train',[20261031,20261032,20261033],false]]){
    const rows=independent.filter(r=>r.split===split),candidate=gameMetrics(rows,'candidate');
    for(const name of names){const computed=metric(rows,name),saved=result.roles[role].metrics[name];assert.equal(computed.games,saved.games);assert.equal(computed.observations,saved.observations);
      for(const k of ['nll','brier','meanMse','pointNll'])close(computed[k],saved[k]);}
    for(const [j,name] of ['cpDraw','temperature','constant'].entries()){const control=gameMetrics(rows,name),values=control.map((r,i)=>{assert.equal(r.gameId,candidate[i].gameId);return r.values[0]-candidate[i].values[0];}),b=boot(values,seeds[j],primary),saved=result.roles[role].comparisons[name];
      close(b.estimate,saved.interval.estimate);close(b.lower,saved.interval.lower);close(b.upper,saved.interval.upper);bootstrapReplicates+=20000;
      assert.equal(saved.gates.practical,b.estimate>=(primary?.01:0));assert.equal(saved.gates.interval,primary?b.lower>0:true);
      assert.equal(saved.gates.brier,metric(rows,'candidate').brier<=metric(rows,name).brier+1e-12);}
  }
  const validation=independent.filter(r=>r.split==='validation');
  for(const group of result.groups){const rows=validation.filter(r=>group.label.startsWith('ply:')?(r.ply<=20?'ply:<=20':r.ply<=50?'ply:21-50':'ply:>50')===group.label:
    (r.currentMean<.1?'cpMean:<.1':r.currentMean>.9?'cpMean:>.9':'cpMean:.1-.9')===group.label),c=metric(rows,'candidate'),p=metric(rows,'cpDraw');
    assert.equal(group.games,c.games);assert.equal(group.sparse,c.games<30);assert.equal(group.passed,c.games<30?null:c.nll-p.nll<=.03+1e-12&&c.brier-p.brier<=.01+1e-12);}
  const original=new Map();for(const r of validation){if(!original.has(r.gameId))original.set(r.gameId,[]);original.get(r.gameId).push((r.currentMean-[1,.5,0][r.target])**2);}
  const originalMse=average([...original.values()].map(average));close(originalMse,result.roles.validation.originalCp.meanMse);
  assert.equal(result.gates.meanPoint,metric(validation,'candidate').meanMse<=originalMse+.002+1e-12);
  const sums=Object.fromEntries(names.map(n=>[n,0]));assert.equal(input.stability.length,45);
  for(let i=0;i<input.stability.length;i++){const r=input.stability[i],s=records.stability[i];assert.equal(r.gameId,s.gameId);
    for(const name of names){const m=name==='raw'?{kind:'raw'}:models.final.models[name],a=independentProbability(r.low,m),b=independentProbability(r.high,m),tv=a.reduce((t,p,j)=>t+Math.abs(p-b[j]),0)/2;
      a.forEach((p,j)=>close(p,s.low[name][j]));b.forEach((p,j)=>close(p,s.high[name][j]));close(tv,s.tv[name]);sums[name]+=tv;}}
  for(const name of names)close(result.stability.meanTv[name],sums[name]/45);
  assert.equal(result.gates.stability,sums.candidate/45<=sums.temperature/45+.01+1e-12);
  assert.equal(result.gates.primaryComparisons,Object.values(result.roles.validation.comparisons).every(r=>Object.values(r.gates).every(Boolean)));
  assert.equal(result.gates.crossFit,Object.values(result.roles.crossFit.comparisons).every(r=>Object.values(r.gates).every(Boolean)));
  assert.equal(result.gates.subgroups,result.groups.every(r=>r.passed!==false));assert.equal(result.gates.interior,[models.final,...models.folds].every(s=>!s.models.candidate.diagnostics.boundary));
  assert.equal(result.passed,Object.values(result.gates).every(Boolean));
  return {passed:true,independentNumericalFitKkt:fits,constantControls:constant,outcomeVectors:input.outcomes.length*5,stabilityVectors:45*5*2,
    independentHumanTargetMappings:input.outcomes.length,independentBootstrapReplicates:bootstrapReplicates,independentGroupAndPointMetrics:true,interpretation:'Separate target/probability/score/KKT/RNG arithmetic on observed human outcomes; no fresh confirmation or move-category judgment.'};
}
