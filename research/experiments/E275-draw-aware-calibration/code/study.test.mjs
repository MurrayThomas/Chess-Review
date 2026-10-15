import test from 'node:test';
import assert from 'node:assert/strict';
import {SPEC,rawProbability,predict,trainingData,objective,fitLog,fitCpDraw,fitConstant,cpObjective,cpMean} from './model.mjs';
import {independentProbability,optimality,targetFromResult} from './audit.mjs';
import {foldsFor} from './inputs.mjs';
import {metrics,bootstrap,groupComparison} from './method.mjs';
import {verifyOrigins} from '../../../data-policy.mjs';
const near=(a,b,t=1e-7)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
function authored(){
  const cases=[[[50,900,50],0,0],[[50,900,50],2,0],[[50,900,50],1,0],[[700,200,100],0,200],[[700,200,100],0,200],
    [[100,200,700],2,-200],[[100,200,700],2,-200],[[300,400,300],0,0],[[300,400,300],2,0],[[900,80,20],0,500],[[20,80,900],2,-500],[[300,400,300],1,0]];
  return cases.map(([wdl,target,cp],i)=>({gameId:'Auth'+String(i).padStart(4,'0'),split:'train',ply:1,color:'w',score:{cp,wdl},target,weight:1}));
}
test('probabilities normalize and mirror colors without losing draw mass',()=>{
  const score={cp:240,wdl:[650,300,50]},other={cp:-240,wdl:[50,300,650]},models=[{kind:'candidate',a:.7,b:-1.2},{kind:'temperature',a:.6,b:0},{kind:'cpDraw',r:.13}];
  for(const m of models){const a=predict(score,m),b=predict(other,m);near(a.reduce((s,p)=>s+p,0),1);a.forEach((p,j)=>near(p,b[2-j]));independentProbability(score,m).forEach((p,j)=>near(p,a[j]));}
});
test('zero engine entries are floored and equal mean points retain distinct distributions',()=>{
  const a=rawProbability({cp:0,wdl:[500,0,500]}),b=rawProbability({cp:0,wdl:[0,1000,0]});near(a[0]+a[1]/2,.5);near(b[0]+b[1]/2,.5);assert.ok(Math.abs(a[1]-b[1])>.9);assert.ok(a.every(p=>p>0));
  assert.throws(()=>rawProbability({cp:0,wdl:[0,1000,1]}));assert.throws(()=>rawProbability({mate:0}));
});
test('CP draw control preserves the clipped current mean exactly',()=>{
  for(const cp of [-20000,-100,0,100,20000])for(const r of [.0005,.1,.9,.9995]){const s={cp,wdl:[200,600,200]},p=predict(s,{kind:'cpDraw',r}),q=Math.max(.0005,Math.min(.9995,cpMean(s)));near(p[0]+p[1]/2,q,1e-12);assert.ok(p.every(x=>x>0));}
});
test('independent target decoding respects actual result and mover parity',()=>{
  assert.deepEqual([1,2].map(p=>targetFromResult('1-0',p)),[0,2]);assert.deepEqual([1,2].map(p=>targetFromResult('0-1',p)),[2,0]);assert.equal(targetFromResult('1/2-1/2',20),1);assert.throws(()=>targetFromResult('*',1));
});
test('multiclass objective gradients and Hessian agree with finite differences',()=>{
  const data=trainingData(authored()),a=.7,b=-1.1,h=1e-5,s=objective(data,a,b,true);
  near(s.gradient[0],(objective(data,a+h,b).value-objective(data,a-h,b).value)/(2*h));near(s.gradient[1],(objective(data,a,b+h).value-objective(data,a,b-h).value)/(2*h));
  near(s.hessian[0],(objective(data,a+h,b).gradient[0]-objective(data,a-h,b).gradient[0])/(2*h));near(s.hessian[1],(objective(data,a,b+h).gradient[0]-objective(data,a,b-h).gradient[0])/(2*h));
  near(s.hessian[2],(objective(data,a,b+h).gradient[1]-objective(data,a,b-h).gradient[1])/(2*h));
  near(cpObjective(data,.12).gradient,(cpObjective(data,.12+h).value-cpObjective(data,.12-h).value)/(2*h),1e-6);
});
test('training fits converge, lower the objective and satisfy independent KKT conditions',()=>{
  const rows=authored(),data=trainingData(rows),c=fitLog(rows),t=fitLog(rows,false),p=fitCpDraw(rows),k=fitConstant(rows);
  assert.ok(c.diagnostics.converged&&t.diagnostics.converged);assert.ok(c.diagnostics.objective<objective(data,1,0).value);assert.ok(c.b<0);
  for(const m of [c,t,p,k])optimality(rows,m);assert.equal(t.b,0);
});
test('absent draw labels produce a recorded CP boundary and smoothed positive constant',()=>{
  const rows=authored().filter(r=>r.target!==1),p=fitCpDraw(rows),k=fitConstant(rows);assert.equal(p.diagnostics.boundary,'lower');assert.ok(k.probabilities[1]>0);optimality(rows,p);optimality(rows,k);
});
test('invalid training roles, weights and scores cannot enter fits',()=>{
  const rows=authored();assert.throws(()=>fitLog(rows.map(r=>({...r,split:'validation'}))));
  assert.throws(()=>fitLog(rows.map(r=>({...r,weight:.5}))));const bad=structuredClone(rows);bad[0].score.wdl=[100,100,100];assert.throws(()=>fitLog(bad));
});
test('folds are deterministic, score-free and exclude nontraining games',()=>{
  const games=Array.from({length:450},(_,i)=>({id:'Auth'+String(i).padStart(4,'0'),split:'train'})),a=foldsFor(games),b=foldsFor([...games.map(g=>({...g,rating:9999,result:'1-0'})),{split:'validation'}]);assert.deepEqual(a,b);
  for(let f=0;f<5;f++)assert.equal(Object.values(a).filter(x=>x===f).length,90);
});
test('metrics weight each game equally rather than counting repeated roots independently',()=>{
  const rec=(gameId,p)=>({gameId,target:0,probabilities:{candidate:p}}),rows=[rec('a',[.8,.1,.1]),rec('a',[.8,.1,.1]),rec('b',[.2,.4,.4])],m=metrics(rows,'candidate');
  near(m.nll,(-Math.log(.8)-Math.log(.2))/2);assert.equal(m.games,2);assert.equal(metrics([],'candidate'),null);
});
test('bootstrap seeds, constant endpoints and primary multiplicity levels are fixed',()=>{
  const a=bootstrap([.2,-.1,.5,0],123,true,1000);assert.deepEqual(a,bootstrap([.2,-.1,.5,0],123,true,1000));near(a.level,1-.05/3);
  const b=bootstrap([.25,.25],99,false,100);near(b.lower,.25);near(b.upper,.25);assert.throws(()=>bootstrap([],1));
});
test('empty and sparse groups remain unresolved; sufficiently large deterioration fails',()=>{
  assert.equal(groupComparison([],'empty').passed,null);const rows=Array.from({length:30},(_,i)=>({gameId:'g'+i,target:0,probabilities:{candidate:[.2,.4,.4],cpDraw:[.8,.1,.1]}}));
  assert.equal(groupComparison(rows.slice(0,29),'sparse').passed,null);assert.equal(groupComparison(rows,'large').passed,false);
});
test('frozen per-game references pass unchanged origin checking and unknown references fail',()=>{
  const id='Fixture1',url='https://data.example/lichess_db_standard_rated_2026-06.pgn.zst',game={id,source:'https://lichess.org/'+id,sourceMonth:'2026-06',date:'2026.06.01',moves:['e2e4'],split:'train'};
  const registry={sources:[{id:'synthetic',exports:[url],termsUrl:'https://data.example/'}]},manifest={sourceIds:['synthetic'],sourceRecord:'source',normalized:'games',originFormat:'lichess-month-v1',provenance:{status:'legacy-partial'},artifacts:{summary:{kind:'summary'}}};
  const source={license:'CC0-1.0',licenseUrl:'https://data.example/',sources:[{url,license:'CC0-1.0',month:'2026-06',frames:[{url,start:0,end:9,bytes:10,sha256:'a'.repeat(64),retrievedAt:'2026-10-15',verification:'Authored fixture'}]}]},summary={cohort:[{gameId:id,split:'train'}],outcomes:[{gameId:id,target:0}]};
  const records=new Map([['source',source],['games',[game]],['summary',summary]]);assert.equal(verifyOrigins(manifest,registry,records).gameCount,1);summary.outcomes[0].gameId='Unknown1';assert.throws(()=>verifyOrigins(manifest,registry,records),/unknown summary game origin/);
});
