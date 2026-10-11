import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {prepare} from './query.mjs';
import {readAdmission} from './admission.mjs';
export function inspectMinorComparison(input,options={},token){
 plain([input,options]);assert(input&&typeof input==='object'&&!Array.isArray(input));assert.deepEqual(Object.keys(input).sort(),['fen','history','minor','pawns'].filter(k=>input.history!==undefined||k!=='history').sort());
 assert(typeof input.fen==='string'&&typeof input.minor==='string'&&Array.isArray(input.pawns));
 assert(options&&typeof options==='object'&&!Array.isArray(options)&&Object.keys(options).every(k=>['enabled','maxRecords'].includes(k)));
 const enabled=options.enabled===undefined?false:options.enabled,maxRecords=options.maxRecords===undefined?16384:options.maxRecords;assert(typeof enabled==='boolean');assert(Number.isSafeInteger(maxRecords)&&maxRecords>=0&&maxRecords<=16384);
 const out={schema:'E255-minor-comparison',status:'disabled',limit:maxRecords,requiredRecords:0,usedRecords:0,claims:{C0713:false},readinessCredit:false,qualityClaim:false,view:null};
 if(input.history)prepare(input);if(!enabled)return out;if(!input.history)return {...out,status:'history-prerequisite'};if(token===undefined)return {...out,status:'source-prerequisite'};
 const saved=readAdmission(token);assert.deepEqual(input,saved.input);const ticks=saved.rows.reduce((n,r)=>n+r.query.ticks,0);
 if(ticks>maxRecords)return {...out,status:'budget-unavailable',requiredRecords:ticks};
 const policies=saved.rows.map(r=>{const c=legalPosition(r.input.fen);return {id:r.id,type:r.type,sameWing:r.sameWing,rootChecked:c.isCheck(),jointGoal:r.query.win,originalMinorId:r.input.minor,originalPawnIds:[...r.input.pawns],policy:structuredClone(r.query)};});
 const values=policies.map(p=>p.jointGoal),matchedGoal=values[0]&&!values[1]&&values[2]&&values[3];
 return {...out,status:'registered-control-refuted',requiredRecords:ticks,usedRecords:ticks,view:{actor:prepare(input).actor,policies,gate:{bothWingPreference:values[0]&&!values[1],sameWingBothSucceed:values[2]&&values[3],allRootsUnchecked:policies.every(p=>!p.rootChecked),registeredOutcomeGate:matchedGoal},source:saved.source,scope:'three-total-ply shared joint neutralization; control failure is not a draw/loss or general preference',completeEarlierHistory:false,independentChessTruth:false,humanValidity:false}};
}

