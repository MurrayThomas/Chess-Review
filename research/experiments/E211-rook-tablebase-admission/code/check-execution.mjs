import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {checkRookPanel} from './check-panel.mjs';
export function checkObservedRookPanel(input,options,bundle,context){
 plain(bundle);assert.equal(bundle.schema,'E211-observed-rook-panel-v2');
 if(bundle.status==='preflight-budget-unavailable')assert.equal(bundle.execution,null);
 else{assert.equal(bundle.status,'complete');assert.deepEqual(bundle.execution,{exitCode:0,signal:null,error:null,timeoutMs:15000});assert.equal(typeof bundle.rawStdout,'string');assert.equal(typeof bundle.rawStderr,'string');}
 const legacy=structuredClone(bundle);delete legacy.execution;legacy.schema='E211-admitted-rook-panel-v1';if(bundle.status==='complete')legacy.rawStderr='';
 return{...checkRookPanel(input,options,legacy,context),execution:structuredClone(bundle.execution),successfulStderrRetained:bundle.status==='complete'};
}
