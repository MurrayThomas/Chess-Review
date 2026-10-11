import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {admitSaved,readAdmission} from './admission.mjs';
import {inspectLongSideDefense} from './resources.mjs';
import {checkLongSideResult} from './check-result.mjs';
import {pilotContrast} from './geometry.mjs';
const dir='research/experiments/E212-rook-side-defense',rows=await admitSaved(),by=id=>rows.find(r=>r.id===id),on={enabled:true};
const cases=rows.map(({id,token})=>{const {input}=readAdmission(token);return{id,input,result:inspectLongSideDefense(input,on,token)};});
await writeFile(dir+'/evidence/examples.json',JSON.stringify(cases,null,2)+'\n',{flag:'wx'});
for(const id of ['long-pilot','long-reflection'])test(id+' complete legal drawing check versus same-rook losses',()=>{
 const {token}=by(id),{input,view}=readAdmission(token),result=inspectLongSideDefense(input,on,token);checkLongSideResult(input,token,result);assert.equal(result.available,true);assert.deepEqual(result.resources.map(r=>r.move),[id==='long-pilot'?'a8a5':'a1a4']);assert.equal(result.losingAlternatives.length,7);assert.equal(result.defender,id==='long-pilot'?'b':'w');assert.equal(result.geometry.kingOnShortSide,true);assert.equal(view.rows.length,17);assert.equal(view.root.wdl,0);
});
test('losing geometric fixtures both colors withhold independently',()=>{
 for(const id of ['rook-pawn-root','rook-pawn-root-black']){const {token}=by(id),{input,view}=readAdmission(token),result=inspectLongSideDefense(input,on,token);assert.equal(view.root.wdl,-2);assert.equal(result.available,false);assert.equal(result.geometry.kingOnShortSide,true);checkLongSideResult(input,token,result);}
});
test('short-side pilot retains missing king contrast and no long-side claim',()=>{
 const {token}=by('short-pilot'),{input,view}=readAdmission(token);assert.equal(view.root.wdl,0);assert.equal(pilotContrast(view,'short').passes,false);const result=inspectLongSideDefense(input,on,token);assert.equal(result.available,false);checkLongSideResult(input,token,result);
});
test('default disabled and explicit controls preserve absence',()=>{
 const {token}=by('long-pilot'),{input}=readAdmission(token);assert.equal(inspectLongSideDefense(input,{},token).status,'disabled');assert.equal(inspectLongSideDefense(input,{enabled:false},token).available,false);assert.equal(inspectLongSideDefense(input,on).status,'observation-prerequisite');for(const options of [{enabled:1},{enabled:true,kind:'short'}])assert.throws(()=>inspectLongSideDefense(input,options,token));assert.throws(()=>inspectLongSideDefense({...input,extra:true},on,token));
});
test('strict history clock frame and ordinary-data interfaces',()=>{
 const {token}=by('long-pilot'),{input}=readAdmission(token),fen=input.fen.replace(' 0 1',' 1 1');assert.equal(inspectLongSideDefense({fen,history:{fen,moves:[]}},on,token).status,'zero-counter-empty-history-prerequisite');assert.equal(inspectLongSideDefense({fen:input.fen},on,token).status,'zero-counter-empty-history-prerequisite');assert.throws(()=>inspectLongSideDefense({...input,history:{...input.history,extra:0}},on,token));assert.throws(()=>inspectLongSideDefense({get fen(){return input.fen;}},on,token));assert.throws(()=>inspectLongSideDefense(readAdmission(by('long-reflection').token).input,on,token));
});
test('only authenticated admission capabilities can authorize outcomes',()=>{
 const {token}=by('long-pilot'),a=readAdmission(token);for(const fake of [{},structuredClone(token),{view:a.view,source:a.source}])assert.throws(()=>inspectLongSideDefense(a.input,on,fake));a.view.root.wdl=-2;a.view.rows[0].rootActorWdl=2;a.source.sha256='0'.repeat(64);const again=readAdmission(token);assert.equal(again.view.root.wdl,0);assert.notEqual(again.source.sha256,a.source.sha256);assert.equal(inspectLongSideDefense(again.input,on,token).available,true);
});
test('independent reconstruction rejects output identity outcome and geometry forgeries',()=>{
 const {token}=by('long-pilot'),{input}=readAdmission(token),original=inspectLongSideDefense(input,on,token);for(const change of [r=>r.available=false,r=>r.resources[0].rootActorWdl=-2,r=>r.resources[0].move='a8a2',r=>r.losingAlternatives.pop(),r=>r.geometry.rookCheckingDistance=0,r=>r.defender='w',r=>r.source.sha256='0'.repeat(64)]){const bad=structuredClone(original);change(bad);assert.throws(()=>checkLongSideResult(input,token,bad));}checkLongSideResult(input,token,inspectLongSideDefense(input,on,token));
});
