import assert from 'node:assert/strict';
const near=(a,b)=>assert.ok(Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<=1e-12,`${a} differs from ${b}`);
const pts=s=>s.mate!=null?Number(s.mate>0):1/(1+Math.exp(-.368208*s.cp/100));
const loss=o=>o.top?0:Math.max(0,pts(o.root)-pts(o.played));
const thresholds=[.02,.05,.10,.20],names=['excellent','good','inacc','mistake','blunder'];
const label=x=>{let i=0;while(i<4&&x>=thresholds[i])i++;return names[i];};
export function audit(rows,result,records){
  assert.equal(rows.length,records.length);const independent=[];
  for(let i=0;i<rows.length;i++){
    const r=rows[i],actual=records[i],lo=loss(r.low),hi=loss(r.high),band=label(lo),reference=label(hi);
    // Independently form a closed interval and check whether it contains a cutoff.
    const lower=Math.max(0,lo-.01-1e-12),upper=Math.min(1,lo+.01+1e-12),emitted=!thresholds.some(t=>lower<=t&&upper>=t);
    assert.equal(actual.gameId,r.gameId);assert.equal(actual.baseline,band);assert.equal(actual.reference,reference);
    assert.equal(actual.emitted,emitted);assert.equal(actual.candidate,emitted?band:null);
    near(actual.lowLoss,lo);near(actual.highLoss,hi);assert.equal(actual.disagrees,band!==reference);
    independent.push({band,reference,emitted,wrong:band!==reference,split:r.split});
  }
  const n=independent.length,wrong=independent.filter(r=>r.wrong).length,withheld=independent.filter(r=>!r.emitted),avoided=withheld.filter(r=>r.wrong).length;
  const s=result.summary;assert.equal(s.games,n);assert.equal(s.baselineDisagreements,wrong);assert.equal(s.withheld,withheld.length);
  assert.equal(s.withheldDisagreements,avoided);assert.equal(s.retainedDisagreements,wrong-avoided);assert.equal(s.withheldStable,withheld.length-avoided);
  near(s.policyGain,(avoided-.1*withheld.length)/n);near(s.coverage,(n-withheld.length)/n);
  if(withheld.length)near(s.breakEvenAbstentionCost,avoided/withheld.length);else assert.equal(s.breakEvenAbstentionCost,null);
  for(const a of names)for(const b of names)assert.equal(result.confusionMatrix[a][b],independent.filter(r=>r.band===a&&r.reference===b).length);
  const groupPass=[];
  for(const group of result.groups){const [type,name]=group.name.split('/'),rs=independent.filter(r=>type==='role'?r.split===name:r.band===name);
    assert.equal(group.games,rs.length);assert.equal(group.sparse,rs.length<10);
    if(!rs.length){assert.equal(group.summary,null);continue;}
    const emitted=rs.filter(r=>r.emitted),errors=rs.filter(r=>r.wrong).length,retained=emitted.filter(r=>r.wrong).length;
    assert.equal(group.summary.emitted,emitted.length);assert.equal(group.summary.baselineDisagreements,errors);assert.equal(group.summary.retainedDisagreements,retained);
    if(rs.length>=10){const passed=emitted.length/rs.length>=.6&&emitted.length>0&&retained/emitted.length<=errors/rs.length+.05;
      assert.equal(group.passed,passed);groupPass.push(passed);}
  }
  const samples=[];let state=20261015n;
  for(let b=0;b<20000;b++){let avoidedDraw=0,withheldDraw=0;
    for(let j=0;j<n;j++){state=(1664525n*state+1013904223n)%4294967296n;const r=independent[Number(state*BigInt(n)/4294967296n)];
      if(!r.emitted){withheldDraw++;if(r.wrong)avoidedDraw++;}}
    samples.push((avoidedDraw-.1*withheldDraw)/n);
  }
  samples.sort((a,b)=>a-b);near(result.interval.lower,samples[Math.floor(.025*19999)]);near(result.interval.upper,samples[Math.floor(.975*19999)]);
  assert.equal(result.gates.practical,s.policyGain>=.02);assert.equal(result.gates.interval,result.interval.lower>0);assert.equal(result.gates.coverage,s.coverage>=.8);
  assert.equal(result.gates.subgroups,groupPass.every(Boolean));
  assert.equal(result.passed,Object.values(result.gates).every(Boolean));
  return {passed:true,rawEquationDecisions:rows.length*2,independentMarginDecisions:rows.length,confusionCells:25,
    pairedBigIntBootstrapReplicates:20000,independentCostAccounting:true,interpretation:'Independent arithmetic and margin/count/resampling replay; not independent human labels.'};
}
