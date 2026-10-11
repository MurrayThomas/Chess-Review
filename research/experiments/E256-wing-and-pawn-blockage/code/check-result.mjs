import assert from 'node:assert/strict';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {readAdmission} from './admission.mjs';
// Private capability is issued only after every immutable policy is independently
// semantically replayed. Reuse that admission here; do not rerun the same search
// or source-policy replay for every own-result mutation check.
export function checkWingBlockage(input,options,token,result){
 const limit=options.maxRecords===undefined?24576:options.maxRecords,e={schema:'E256-wing-blockage',status:'disabled',limit,requiredRecords:0,usedRecords:0,claims:{C0713:false},readinessCredit:false,qualityClaim:false,view:null};
 if(options.enabled){if(!input.history)e.status='history-prerequisite';else if(token===undefined)e.status='source-prerequisite';else{const s=readAdmission(token);assert.deepEqual(s.input,input);e.requiredRecords=s.rows.reduce((sum,r)=>sum+r.query.ticks,0);if(e.requiredRecords>limit)e.status='budget-unavailable';else{
  const first=legalPosition(input.fen),policies=[];for(const [i,r] of s.rows.entries()){const c=legalPosition(r.input.fen),ps=r.input.pawns;assert.equal(c.get(input.minor).type,i%2?'n':'b');assert.equal(c.fen().split(' ').slice(1).join(' '),first.fen().split(' ').slice(1).join(' '));assert.equal(c.board().flat().filter(Boolean).length,5);assert.equal(ps[0],input.pawns[0]);assert.equal(ps[1][0],i<2?'g':i<4?'a':'c');assert.equal(ps[1][1],i<2?input.pawns[1][1]:c.turn()==='w'?'2':'7');for(const sq of ps){assert.equal(c.get(sq)?.type,'p');assert.notEqual(c.get(sq)?.color,c.turn());}
   for(const sq of 'abcdefgh'.split('').flatMap(f=>[1,2,3,4,5,6,7,8].map(n=>f+n))){if([input.minor,input.pawns[1],ps[1]].includes(sq))continue;assert.deepEqual(c.get(sq),first.get(sq));}
   const forward=ps[0][0]+(Number(ps[0][1])+(c.get(ps[0]).color==='b'?-1:1));policies.push({id:r.id,type:r.type,role:r.role,rootChecked:c.isCheck(),originalPawnBlockedByOther:forward===ps[1],jointGoal:r.query.win,originalMinorId:r.input.minor,originalPawnIds:[...ps],policy:structuredClone(r.query)});
  }
  const v=policies.map(p=>p.jointGoal);e.status='separated-control-refuted';e.usedRecords=e.requiredRecords;e.view={actor:first.turn(),policies,gate:{bothWingPreference:v[0]&&!v[1],doubledBothSucceed:v[2]&&v[3],separatedBothSucceed:v[4]&&v[5],allRootsUnchecked:policies.every(p=>!p.rootChecked),registeredOutcomeGate:v[0]&&!v[1]&&v[2]&&v[3]&&v[4]&&v[5]},source:s.source,scope:'five-total-ply joint neutralization; no wing-only attribution or draw/loss from failed finite goal',completeEarlierHistory:false,independentChessTruth:false,humanValidity:false};
 }}}assert.deepEqual(result,e);return true;
}
