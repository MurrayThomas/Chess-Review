import assert from 'node:assert/strict';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {readAdmission} from './admission.mjs';
import {checkProof} from './check-proof.mjs';
export function checkComparison(input,options,token,result){
 const limit=options.maxRecords??16384,e={schema:'E255-minor-comparison',status:'disabled',limit,requiredRecords:0,usedRecords:0,claims:{C0713:false},readinessCredit:false,qualityClaim:false,view:null};
 if(options.enabled){if(!input.history)e.status='history-prerequisite';else if(token===undefined)e.status='source-prerequisite';else{
  const s=readAdmission(token);assert.deepEqual(s.input,input);e.requiredRecords=s.rows.reduce((n,r)=>n+r.query.ticks,0);
  if(e.requiredRecords>limit)e.status='budget-unavailable';else{
   const policies=[];for(const r of s.rows){checkProof(r.query);const c=legalPosition(r.input.fen);policies.push({id:r.id,type:r.type,sameWing:r.sameWing,rootChecked:c.isCheck(),jointGoal:r.query.win,originalMinorId:r.input.minor,originalPawnIds:[...r.input.pawns],policy:structuredClone(r.query)});}
   // Independently establish hypothetical frame controls, including the checked root.
   const boards=s.rows.map(r=>legalPosition(r.input.fen));
   for(let i=0;i<4;i++){const c=boards[i];assert.equal(c.get(input.minor).type,i%2?'n':'b');assert.equal(c.turn(),boards[0].turn());assert.equal(c.fen().split(' ').slice(1).join(' '),boards[0].fen().split(' ').slice(1).join(' '));assert.equal(c.board().flat().filter(Boolean).length,5);
    const other=s.rows[i].input.pawns;assert.equal(other[0],input.pawns[0]);assert.equal(other[1][0],i<2?'g':'c');for(const sq of other)assert.equal(c.get(sq)?.type,'p');
    for(const square of 'abcdefgh'.split('').flatMap(f=>[1,2,3,4,5,6,7,8].map(n=>f+n))){if([input.minor,input.pawns[1],other[1]].includes(square))continue;assert.deepEqual(c.get(square),boards[0].get(square));}
   }
   const v=policies.map(p=>p.jointGoal);e.status='registered-control-refuted';e.usedRecords=e.requiredRecords;e.view={actor:boards[0].turn(),policies,gate:{bothWingPreference:v[0]&&!v[1],sameWingBothSucceed:v[2]&&v[3],allRootsUnchecked:policies.every(p=>!p.rootChecked),registeredOutcomeGate:v[0]&&!v[1]&&v[2]&&v[3]},source:s.source,scope:'three-total-ply shared joint neutralization; control failure is not a draw/loss or general preference',completeEarlierHistory:false,independentChessTruth:false,humanValidity:false};
  }
 }}assert.deepEqual(result,e);return true;
}
