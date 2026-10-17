import test from 'node:test';
import assert from 'node:assert/strict';
import {app,loadGame,deferred,settle} from './helpers/app.mjs';

test('failed calibration is retryable and concurrent callers share one fresh load',async t=>{
  const a=app(t),ready=deferred();a.run('CALIB=null');let fetches=0;
  a.context.fetch=async()=>{fetches++;return ready.promise;};
  const first=a.call('loadCalibration'),second=a.call('loadCalibration');assert.equal(fetches,1);ready.resolve({ok:false});
  const failures=await Promise.allSettled([first,second]);assert.ok(failures.every(result=>result.reason.code==='CALIBRATION_DATA'));assert.equal(a.run('CALIB'),null);
  a.context.fetch=async()=>{fetches++;return {ok:true,json:async()=>a.context.__publicCalibration};};
  assert.equal((await a.call('loadCalibration')).version,a.context.__publicCalibration.version);assert.equal(fetches,2);
  await a.call('loadCalibration');assert.equal(fetches,2);
});
test('invalid calibration stops analysis before worker startup and shows a data retry',async t=>{
  const a=app(t);loadGame(a,'1. e4 e5');a.call('buildUI');a.run('CALIB=null');let engines=0;
  a.context.fetch=async()=>({ok:true,json:async()=>({schema:'chess-review-public-calibration-v1',version:'broken'})});
  a.context.Engine=class{constructor(){engines++;throw Error('Should not start');}};
  await a.call('startAnalysis');await settle();assert.equal(engines,0);assert.equal(a.state.analyzing,false);assert.match(a.state.analysisError,/analysis data/);
  assert.match(a.dom.window.document.body.textContent,/retry/i);
});
