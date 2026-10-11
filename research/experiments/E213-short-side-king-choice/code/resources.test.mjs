import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {admitSaved,readAdmission} from './admission.mjs';
import {inspectShortSideKingChoice} from './resources.mjs';
import {checkShortSideResult} from './check-result.mjs';
const dir='research/experiments/E213-short-side-king-choice',rows=await admitSaved(),by=id=>rows.find(r=>r.id===id),on={enabled:true};
const examples=rows.map(({id,token})=>{const {input}=readAdmission(token);return{id,input,result:inspectShortSideKingChoice(input,on,token)};});await writeFile(dir+'/evidence/examples.json',JSON.stringify(examples,null,2)+'\n',{flag:'wx'});
for(const [id,resource,alternative,defender]of [['h2','f8g8','f8e8','b'],['reflection','f1g1','f1e1','w']])test(id+' legal short-side drawing king move versus long-side loss',()=>{
 const {token}=by(id),{input,view}=readAdmission(token),r=inspectShortSideKingChoice(input,on,token);checkShortSideResult(input,token,r);assert.equal(r.available,true);assert.equal(view.root.wdl,0);assert.deepEqual(r.resources.map(r=>r.move),[resource]);assert.deepEqual(r.losingAlternatives.map(r=>r.move),[alternative]);assert.equal(r.defender,defender);assert.equal(r.geometry.rookOnLongSide,true);assert.equal(view.rows.length,14);
});
test('two prospective rook-placement negatives retain legal long-side losses without drawing short-side resources',()=>{
 for(const id of ['d2','b2']){const {token}=by(id),{input,view}=readAdmission(token),r=inspectShortSideKingChoice(input,on,token);assert.equal(r.available,false);assert.equal(view.root.wdl,0);assert.equal(view.rows.find(r=>r.move==='f8e8').rootActorWdl,-2);assert.equal(view.rows.find(r=>r.move==='f8g8').rootActorWdl,-2);checkShortSideResult(input,token,r);}
});
test('all five inherited controls independently withhold king-choice credit',()=>{
 for(const {id,token}of rows.filter(r=>r.id.startsWith('E212-'))){const {input}=readAdmission(token),r=inspectShortSideKingChoice(input,on,token);assert.equal(r.available,false,id);checkShortSideResult(input,token,r);}
});
test('default disabled strict input and missing admission remain explicit',()=>{
 const {token}=by('h2'),{input}=readAdmission(token);assert.equal(inspectShortSideKingChoice(input,{},token).status,'disabled');assert.equal(inspectShortSideKingChoice(input,{enabled:false},token).available,false);assert.equal(inspectShortSideKingChoice(input,on).status,'observation-prerequisite');for(const options of [{enabled:1},{enabled:true,kind:'long'}])assert.throws(()=>inspectShortSideKingChoice(input,options,token));assert.throws(()=>inspectShortSideKingChoice({...input,extra:0},on,token));assert.throws(()=>inspectShortSideKingChoice({get fen(){return input.fen;}},on,token));
});
test('zero-clock genuine empty-history and exact frame prerequisites',()=>{
 const {token}=by('h2'),{input}=readAdmission(token),fen=input.fen.replace(' 0 1',' 1 1');assert.equal(inspectShortSideKingChoice({fen,history:{fen,moves:[]}},on,token).status,'zero-counter-empty-history-prerequisite');assert.equal(inspectShortSideKingChoice({fen:input.fen},on,token).status,'zero-counter-empty-history-prerequisite');assert.throws(()=>inspectShortSideKingChoice({...input,history:{...input.history,extra:0}},on,token));assert.throws(()=>inspectShortSideKingChoice(readAdmission(by('d2').token).input,on,token));
});
test('admission capability isolation rejects fake outcomes and cloned tokens',()=>{
 const {token}=by('h2'),a=readAdmission(token);for(const fake of [{},structuredClone(token),{view:a.view,source:a.source}])assert.throws(()=>inspectShortSideKingChoice(a.input,on,fake));a.view.root.wdl=-2;a.view.rows.find(r=>r.move==='f8g8').rootActorWdl=-2;a.source.sha256='0'.repeat(64);assert.equal(inspectShortSideKingChoice(a.input,on,token).available,true);assert.notEqual(readAdmission(token).source.sha256,a.source.sha256);
});
test('independent reconstruction rejects king wing outcome source and getter forgeries',()=>{
 const {token}=by('h2'),{input}=readAdmission(token),r=inspectShortSideKingChoice(input,on,token);for(const change of [r=>r.available=false,r=>r.resources[0].move='f8e8',r=>r.resources[0].rootActorWdl=-2,r=>r.losingAlternatives=[],r=>r.geometry.rookOnLongSide=false,r=>r.geometry.longSign=1,r=>r.defender='w',r=>r.source.sha256='0'.repeat(64),r=>Object.defineProperty(r,'available',{enumerable:true,get(){return true;}})]){const bad=structuredClone(r);change(bad);assert.throws(()=>checkShortSideResult(input,token,bad));}checkShortSideResult(input,token,inspectShortSideKingChoice(input,on,token));
});
