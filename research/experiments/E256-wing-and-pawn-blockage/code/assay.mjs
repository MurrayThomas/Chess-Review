import assert from 'node:assert/strict';
import {plain} from '../../E183-recorded-initiative-turnover/code/plain.mjs';
import {legalPosition} from '../../E020-coach-concepts/code/concepts.mjs';
import {prepare} from './query.mjs';
import {readAdmission} from './admission.mjs';
export function inspectWingBlockage(input,options={},token){
 plain([input,options]);assert(input&&typeof input==='object'&&!Array.isArray(input));assert.deepEqual(Object.keys(input).sort(),['fen','history','minor','pawns'].filter(k=>input.history!==undefined||k!=='history').sort());assert(typeof input.fen==='string'&&typeof input.minor==='string'&&Array.isArray(input.pawns));
 assert(options&&typeof options==='object'&&!Array.isArray(options)&&Object.keys(options).every(k=>['enabled','maxRecords'].includes(k)));const enabled=options.enabled===undefined?false:options.enabled,maxRecords=options.maxRecords===undefined?24576:options.maxRecords;assert(typeof enabled==='boolean');assert(Number.isSafeInteger(maxRecords)&&maxRecords>=0&&maxRecords<=24576);
 const out={schema:'E256-wing-blockage',status:'disabled',limit:maxRecords,requiredRecords:0,usedRecords:0,claims:{C0713:false},readinessCredit:false,qualityClaim:false,view:null};if(input.history)prepare(input);if(!enabled)return out;if(!input.history)return {...out,status:'history-prerequisite'};if(token===undefined)return {...out,status:'source-prerequisite'};
 const saved=readAdmission(token);assert.deepEqual(input,saved.input);const ticks=saved.rows.reduce((n,r)=>n+r.query.ticks,0);if(ticks>maxRecords)return {...out,status:'budget-unavailable',requiredRecords:ticks};
 const policies=saved.rows.map(r=>{const c=legalPosition(r.input.fen),ps=r.input.pawns,blocked=ps[0][0]===ps[1][0]&&Number(ps[0][1])+(c.turn()==='w'?-1:1)===Number(ps[1][1]);return {id:r.id,type:r.type,role:r.role,rootChecked:c.isCheck(),originalPawnBlockedByOther:blocked,jointGoal:r.query.win,originalMinorId:r.input.minor,originalPawnIds:[...ps],policy:structuredClone(r.query)};});
 const v=policies.map(p=>p.jointGoal),gate={bothWingPreference:v[0]&&!v[1],doubledBothSucceed:v[2]&&v[3],separatedBothSucceed:v[4]&&v[5],allRootsUnchecked:policies.every(p=>!p.rootChecked),registeredOutcomeGate:v[0]&&!v[1]&&v.slice(2).every(Boolean)};
 return {...out,status:'separated-control-refuted',requiredRecords:ticks,usedRecords:ticks,view:{actor:prepare(input).actor,policies,gate,source:saved.source,scope:'five-total-ply joint neutralization; no wing-only attribution or draw/loss from failed finite goal',completeEarlierHistory:false,independentChessTruth:false,humanValidity:false}};
}
