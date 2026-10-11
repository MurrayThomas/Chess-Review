import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {admitSaved,readAdmission} from './admission.mjs';
import {inspectNamedRookResource} from './resources.mjs';
import {checkNamedRookResult} from './check-result.mjs';
const dir='research/experiments/E215-rook-defense-resource-contrasts',rows=await admitSaved(),by=id=>rows.find(r=>r.id===id),on=phase=>({enabled:true,phase});
const examples=rows.map(({id,phase,token})=>{const {input}=readAdmission(token);return{id,phase,input,result:inspectNamedRookResource(input,on(phase),token)};});await writeFile(dir+'/evidence/examples.json',JSON.stringify(examples,null,2)+'\n',{flag:'wx'});
for(const {id,phase,token}of rows)test(id+' independently reconstructs drawing phase versus same-rook nonhanging losses',()=>{
 const {input,view}=readAdmission(token),r=inspectNamedRookResource(input,on(phase),token);checkNamedRookResult(input,phase,token,r);assert.equal(r.available,true);assert.equal(r.id,phase.startsWith('philidor')?'C0670':'C0671');assert.equal(view.root.wdl,0);assert.ok(r.resources.length>0);assert.ok(r.losingAlternatives.length>0);assert.ok(r.resources.every(r=>r.rootActorWdl===0));assert.ok(r.losingAlternatives.every(r=>r.rootActorWdl===-2));
 if(phase==='philidor-retreat'){assert.equal(input.history.moves.length,2);assert.equal(r.geometry.recordedAdvance,true);assert.equal(view.zeroCounterRoot,false);}else assert.equal(view.zeroCounterRoot,true);
});
test('cross-family wrong phases withhold independently without relabeling positive outcomes',()=>{
 for(const {phase,token}of rows){const {input}=readAdmission(token),other=phase.startsWith('philidor')?'vancura-check-at-pawn':'philidor-barrier',r=inspectNamedRookResource(input,on(other),token);assert.equal(r.available,false);if(input.history.moves.length)assert.equal(r.status,'phase-history-prerequisite');else checkNamedRookResult(input,other,token,r);}
});
test('retreat requires actual recorded waiting move and pawn advance rather than empty or missing history',()=>{
 const {token}=by('E214-philidor-retreat'),{input}=readAdmission(token);assert.equal(inspectNamedRookResource({fen:input.fen},on('philidor-retreat'),token).status,'history-prerequisite');assert.equal(inspectNamedRookResource({fen:input.fen,history:{fen:input.fen,moves:[]}},on('philidor-retreat'),token).status,'phase-history-prerequisite');const wrong={fen:input.fen,history:{fen:input.history.fen,moves:['a6g6','e5e6']}};assert.throws(()=>inspectNamedRookResource(wrong,on('philidor-retreat'),token));
});
test('default-disabled strict phase option and ordinary-data controls',()=>{
 const {token,phase}=by('E214-philidor-barrier'),{input}=readAdmission(token);assert.equal(inspectNamedRookResource(input,{},token).status,'disabled');assert.equal(inspectNamedRookResource(input,{enabled:false,phase},token).available,false);assert.equal(inspectNamedRookResource(input,on(phase)).status,'observation-prerequisite');for(const options of [{enabled:1},{enabled:true,phase:'vancura-pressure'},{enabled:true,phase,extra:0}])assert.throws(()=>inspectNamedRookResource(input,options,token));assert.throws(()=>inspectNamedRookResource({...input,extra:0},on(phase),token));assert.throws(()=>inspectNamedRookResource({get fen(){return input.fen;}},on(phase),token));
});
test('clock exact frame and strict history fields prevent observation substitution',()=>{
 const {token,phase}=by('E214-philidor-barrier'),{input}=readAdmission(token),fen=input.fen.replace(' 0 1',' 1 1');assert.equal(inspectNamedRookResource({fen,history:{fen,moves:[]}},on(phase),token).status,'zero-counter-prerequisite');assert.throws(()=>inspectNamedRookResource({...input,history:{...input.history,extra:0}},on(phase),token));assert.throws(()=>inspectNamedRookResource(readAdmission(by('philidor-barrier-reflection').token).input,on(phase),token));
});
test('private admissions reject forged tokens and isolate exposed observation mutations',()=>{
 const {token,phase}=by('E214-vancura-pressure'),a=readAdmission(token);for(const fake of [{},structuredClone(token),{view:a.view,source:a.source}])assert.throws(()=>inspectNamedRookResource(a.input,on(phase),fake));a.view.root.wdl=-2;a.view.rows.find(r=>r.move==='f6f5').rootActorWdl=-2;a.source.ruleModel='forged';assert.equal(inspectNamedRookResource(a.input,on(phase),token).available,true);assert.notEqual(readAdmission(token).source.ruleModel,a.source.ruleModel);
});
test('independent own reconstruction rejects phase identity rays history outcomes and getters',()=>{
 for(const id of ['E214-philidor-retreat','E214-vancura-pressure']){const {token,phase}=by(id),{input}=readAdmission(token),r=inspectNamedRookResource(input,on(phase),token);for(const change of [r=>r.available=false,r=>r.phase='philidor-barrier',r=>r.resources[0].rootActorWdl=-2,r=>r.resources[0].move=r.losingAlternatives[0].move,r=>r.losingAlternatives.pop(),r=>r.geometry.rook='h8',r=>r.geometry.recordedAdvance=!r.geometry.recordedAdvance,r=>r.source.ruleModel='forged',r=>Object.defineProperty(r,'available',{enumerable:true,get(){return true;}})]){const bad=structuredClone(r);change(bad);assert.throws(()=>checkNamedRookResult(input,phase,token,bad));}checkNamedRookResult(input,phase,token,inspectNamedRookResource(input,on(phase),token));}
});
