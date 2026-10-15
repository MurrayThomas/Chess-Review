import {publicGameAccuracy,sf19GameAccuracy} from '../../../../lib/public-scoring.js';
const mean=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
function checked(moves){
  const rows=moves.filter(m=>m.eligible);
  for(const m of rows) if(!Number.isFinite(m.quality)||m.quality<0||m.quality>100||!Array.isArray(m.alternatives)||m.alternatives.length<2
    ||m.alternatives.some(x=>!Number.isFinite(x)||x<0||x>1)) throw Error('Invalid authored opportunity');
  return rows;
}
export function opportunityWeighted(moves){
  const rows=checked(moves);let total=0,weighted=0;
  for(const m of rows){const w=Math.max(...m.alternatives)-Math.min(...m.alternatives);total+=w;weighted+=w*m.quality;}
  return total?weighted/total:null;
}
export function tail20(moves){const qs=checked(moves).map(m=>m.quality).sort((a,b)=>a-b);return mean(qs.slice(0,Math.ceil(qs.length*.2)));}
export const methods={sf18Arithmetic:publicGameAccuracy,sf19Combined:sf19GameAccuracy,opportunityWeighted,tail20};
const row=(quality,range=.5,eligible=true)=>({quality,alternatives:[0,range],eligible});
export function experiment(){
  const started=performance.now(), base=[row(20),...Array.from({length:9},()=>row(95))], report={};
  for(const [name,fn] of Object.entries(methods)){
    const value=fn(base),padding=[];
    for(const range of [0,.001])for(const n of [10,50,200]){const score=fn([...base,...Array.from({length:n},()=>row(100,range))]);padding.push({range,added:n,score,shift:score-value});}
    const replications=[2,5].map(n=>({factor:n,shift:fn(Array.from({length:n},()=>base).flat())-value}));
    let worstReplication={shift:0};
    for(let length=1;length<=25;length++)for(const factor of [2,3,5]){
      const xs=Array.from({length},(_,i)=>row(i*37%101));const shift=fn(Array.from({length:factor},()=>xs).flat())-fn(xs);
      if(Math.abs(shift)>Math.abs(worstReplication.shift))worstReplication={length,factor,shift};
    }
    const harmful=base.map((_,i)=>fn(base.map((m,j)=>i===j?{...m,quality:Math.max(0,m.quality-10)}:m))-value);
    let weightShift=0;
    for(let i=0;i<base.length;i++)for(const delta of [-.01,.01]){
      const xs=base.map((m,j)=>i===j?{...m,alternatives:[0,.5+delta]}:m);weightShift=Math.max(weightShift,Math.abs(fn(xs)-value));
    }
    const adverse=[row(20,.001),...Array.from({length:9},()=>row(95))];
    const forcedShift=fn([...base,...Array.from({length:200},()=>row(100,.5,false))])-value;
    report[name]={base:value,padding,replications,worstReplication,harmfulMaxShift:Math.max(...harmful),weightMaxShift:weightShift,
      narrowErrorScore:fn(adverse),forcedShift,zeroOpportunityScore:fn(base.map(m=>({...m,alternatives:[.5,.5]}))),
      gates:{padding:padding.every(p=>Math.abs(p.shift)<=1),baseReplication:replications.every(p=>Math.abs(p.shift)<=1e-10),
        exhaustiveReplication:Math.abs(worstReplication.shift)<=1e-10,monotonic:Math.max(...harmful)<=1e-10,weightSensitivity:weightShift<=1,forcedPadding:Math.abs(forcedShift)<=1e-10}};
  }
  if(performance.now()-started>5000)throw Error('Synthetic calculation budget exceeded');
  return {schema:'E272-stress-v1',role:'authored synthetic mechanical panel; no human or real-game validity claim',datasets:[],seed:null,
    qualities:'Authored independently of score curves',baseDecisions:10,methods:report,modelFits:0,engineSearches:0};
}
